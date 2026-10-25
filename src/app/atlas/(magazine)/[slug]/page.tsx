import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { preload } from 'react-dom';

import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';

import { getCatalog, getStory, storySlugs, type Story } from '../_atlas/content';
import { plain } from '../_atlas/plain';
import Reader from '../_atlas/Reader';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return storySlugs().map((slug) => ({ slug }));
}

/** The summary when it reads as one; otherwise the opening paragraph, cut at a word inside 160 characters. */
function describe(story: Story): string {
  if (story.summary.length >= 50 && story.summary.length <= 160) return story.summary;
  const first = story.blocks.find((b) => b.kind === 'para');
  const text = first?.kind === 'para' ? plain(first.inline) : story.summary;
  if (text.length <= 160) return text;
  const cut = text.slice(0, 159);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

/**
 * The head of one story. A story that is a GT blog post takes the post as
 * its canonical (src/lib/seo/policy.ts, PRESS_POSTS), as /blog/<slug> does.
 */
function storyRoute(story: Story) {
  return seoRoute({
    path: `/atlas/${story.slug}`,
    title: story.title,
    kind: 'post',
    description: describe(story),
    crumbs: [{ name: PAGE_NAMES.press.name, path: '/atlas' }],
    published: story.date,
    authors: story.authors,
    // the issue's own share card (public/atlas/og)
    image: { url: `/atlas/og/${story.slug}.png`, width: 1200, height: 630, type: 'image/png', alt: `${story.title}, Atlas` },
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const story = getStory((await params).slug);
  if (!story) notFound();
  return storyRoute(story).metadata;
}

export default async function PressStoryPage({ params }: Params) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();
  // Euclid is set in Newsreader: its text face loads with the page, so the story never paints in another face first
  if (story.look === 'book') preload('/fonts/google/newsreader-opsz-wght.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
  const catalog = getCatalog();
  const i = catalog.findIndex((s) => s.slug === slug);
  const after = catalog[(i + 1) % catalog.length];
  const next = after && after.slug !== slug ? { slug: after.slug, title: after.title } : null;
  return (
    <>
      <JsonLd nodes={storyRoute(story).jsonLd} />
      <Reader story={story} next={next} />
    </>
  );
}
