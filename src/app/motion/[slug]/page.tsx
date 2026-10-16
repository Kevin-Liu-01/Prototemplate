import { notFound } from 'next/navigation';

import { plainText } from '@/components/book/markdown';
import { MOTION_PACKAGE_SLUGS, getMotionFilm } from '@/lib/motion';
import type { MotionFilm } from '@/lib/motion';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import { reviewBlock, scriptBlock, sheetBlock } from '../records';
import { buildCredits, buildPackage } from './package';
import PackageViewer from './PackageViewer';

export function generateStaticParams() {
  return MOTION_PACKAGE_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

/** The longest series line that still takes the closing sentence inside a 160-character description. */
const SERIES_ALONE = 104;

/** The route's head and JSON-LD: the film's title, and its series line with what the page holds. */
function packageRoute(slug: string, film: MotionFilm, series: string) {
  const line = plainText(series).replace(/\*/g, '');
  return seoRoute({
    path: `/motion/${slug}`,
    title: film.title,
    section: 'Motion',
    kind: 'page',
    description: line.length > SERIES_ALONE ? line : `${line} The film, its script and its research package.`,
    crumbs: [{ name: 'Motion', path: '/motion' }],
    updated: requireUpdated(`/motion/${slug}`),
  });
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const film = getMotionFilm(slug);
  if (!film?.pkg) notFound();
  return packageRoute(slug, film, film.pkg.series).metadata;
}

/**
 * /motion/[slug]: one film of the translation series with its research
 * package on the viewer shell. The package is read from
 * public/motion/<slug>.md and rendered here on the server (package.ts), and
 * so are the published cut's contact sheet and script (records.tsx), so
 * the client receives elements. The key on the viewer makes a change of
 * slug a fresh mount, so the shell's active item always matches the
 * address.
 */
export default async function MotionPackagePage({ params }: Params) {
  const { slug } = await params;
  const film = getMotionFilm(slug);
  if (!film?.pkg) notFound();
  const page = buildPackage(slug);
  return (
    <>
      <JsonLd nodes={packageRoute(slug, film, film.pkg.series).jsonLd} />
      <PackageViewer
        key={slug}
        slug={slug}
        lead={page.lead}
        leadRest={page.leadRest}
        credits={buildCredits(slug)}
        sheet={sheetBlock(film)}
        script={scriptBlock(film)}
        review={reviewBlock(film)}
        sections={page.sections}
        terms={page.terms}
        updated={requireUpdated(`/motion/${slug}`)}
      />
    </>
  );
}
