import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getCatalog, getStory, storySlugs } from '../_press/content';
import BookReader from '../_press/BookReader';
import Reader from '../_press/Reader';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return storySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const story = getStory((await params).slug);
  return story ? { title: story.title, description: story.summary } : {};
}

export default async function PressStoryPage({ params }: Params) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();
  const catalog = getCatalog();
  const i = catalog.findIndex((s) => s.slug === slug);
  const after = catalog[(i + 1) % catalog.length];
  const next = after && after.slug !== slug ? { slug: after.slug, title: after.title } : null;
  return story.look === 'book' ? <BookReader story={story} next={next} /> : <Reader story={story} next={next} />;
}
