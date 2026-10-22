import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';

import { getCatalog, getStory, storySlugs, type Story } from '../../_press/content';
import Reader from '../../_press/Reader';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return storySlugs().map((slug) => ({ slug }));
}

const LOOKS: Record<Story['look'], string> = {
  docs: 'the split reader, the text beside a stage of figures',
  fuma: 'Fumadocs’ own look',
  book: 'a printed book, its pictures on a stage beside the text',
};

/** The head of one story on the shelf, kept apart from the magazine's own page for it. */
function shelfRoute(story: Story) {
  return seoRoute({
    path: `/press/shelf/${story.slug}`,
    title: `${story.title}, on the shelf`,
    kind: 'page',
    description: `${story.title}, as GT Atlas set it before the magazine: ${LOOKS[story.look]}.`.slice(0, 160),
    crumbs: [
      { name: PAGE_NAMES.press.name, path: '/press' },
      { name: 'The shelf', path: '/press/shelf' },
    ],
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const story = getStory((await params).slug);
  if (!story) notFound();
  return shelfRoute(story).metadata;
}

/* A story as the shelf set it, in its own look. */
export default async function PressShelfStoryPage({ params }: Params) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();
  const catalog = getCatalog();
  const i = catalog.findIndex((s) => s.slug === slug);
  const after = catalog[(i + 1) % catalog.length];
  const next = after && after.slug !== slug ? { slug: after.slug, title: after.title } : null;
  return (
    <>
      <JsonLd nodes={shelfRoute(story).jsonLd} />
      <Reader story={story} next={next} edition='shelf' />
    </>
  );
}
