import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';

import { PRESS_DIRECTIONS, findDirection, type PressDirection } from '../_directions/registry';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PRESS_DIRECTIONS.map((d) => ({ slug: d.slug }));
}

function directionRoute(d: PressDirection) {
  return seoRoute({
    path: `/atlas/directions/${d.slug}`,
    title: `Press direction ${d.label}, ${d.name}`,
    kind: 'page',
    description: d.description,
    crumbs: [
      { name: PAGE_NAMES.press.name, path: '/atlas' },
      { name: 'Press directions', path: '/atlas/directions' },
    ],
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const d = findDirection((await params).slug);
  if (!d) notFound();
  return directionRoute(d).metadata;
}

/* The stage (../layout.tsx) shows the direction the address names. */
export default async function PressDirectionPage({ params }: Params) {
  const d = findDirection((await params).slug);
  if (!d) notFound();
  return (
    <>
      <JsonLd nodes={directionRoute(d).jsonLd} />
      <h1 className='sr-only'>
        Press direction {d.label}, {d.name}
      </h1>
      <p className='sr-only'>{d.description}</p>
    </>
  );
}
