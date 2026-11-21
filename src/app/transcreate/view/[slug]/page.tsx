import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Icon } from '@/components/viewer/icons';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';

import PairViewer from '../../PairViewer';
import type { PairFilm } from '../../videos';
import { PAIR_FILMS, pairFilm } from '../../videos';

export function generateStaticParams() {
  return PAIR_FILMS.map((film) => ({ slug: film.slug }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

/** The route's head: the film's name under Transcreate, and what the viewer does with it. */
function viewRoute(film: PairFilm) {
  return seoRoute({
    path: `/transcreate/view/${film.slug}`,
    title: `${film.name} in English and ${film.language}`,
    kind: 'page',
    description: `${film.name} beside its ${film.language} version: side by side, stacked, or overlaid with a divider to drag.`,
    crumbs: [{ name: 'Transcreate', path: '/transcreate' }],
  });
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const film = pairFilm(slug);
  if (!film) notFound();
  return viewRoute(film).metadata;
}

/**
 * /transcreate/view/[slug]: one film in the compare viewer as the whole
 * window, off the viewer shell like /present. The head holds a link back to
 * the film's row and its name; the viewer fills the rest (PairViewer, app).
 * Every row with a pair links here (TranscreateViewer, the Compare button).
 * Under /transcreate, so private: noindex, and out of the sitemap.
 */
export default async function TranscreateViewPage({ params }: Params) {
  const { slug } = await params;
  const film = pairFilm(slug);
  if (!film) notFound();
  return (
    <main className='tcv'>
      <JsonLd nodes={viewRoute(film).jsonLd} />
      <header className='tcv-head'>
        <Link className='pt-ib pt-icon tcv-back' href={film.back} title='Back to Transcreate' aria-label='Back to Transcreate'>
          <Icon name='prev' />
        </Link>
        <h1>{film.name}</h1>
      </header>
      <PairViewer key={film.slug} app film={film} className='tcv-viewer' />
    </main>
  );
}
