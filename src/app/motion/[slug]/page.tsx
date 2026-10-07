import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { plainText } from '@/app/docs/markdown';
import { MOTION_PACKAGE_SLUGS, getMotionFilm } from '@/lib/motion';
import { requireUpdated } from '@/lib/updated';

import { reviewBlock, scriptBlock, sheetBlock } from '../records';
import { buildCredits, buildPackage } from './package';
import PackageViewer from './PackageViewer';

export function generateStaticParams() {
  return MOTION_PACKAGE_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const film = getMotionFilm(slug);
  if (!film?.pkg) return { title: 'Motion' };
  return {
    title: film.title,
    description: plainText(film.pkg.series).replace(/\*/g, ''),
    icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
  };
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
      updated={requireUpdated(`/motion/${slug}`)}
    />
  );
}
