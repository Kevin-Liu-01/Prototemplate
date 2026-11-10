import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import motion from '../../../../scripts/build/logo-motion.json';

import type { LoaderTiming } from './content';
import LoadingViewer from './LoadingViewer';

const route = seoRoute({
  path: '/marks/loading',
  title: PAGE_NAMES.loading.name,
  kind: 'page',
  description: 'The General Translation logo while a page loads, live: the loader, the hovers, how the motion is built in SVG and CSS, its checks, reduced motion and the fix.',
  crumbs: [{ name: PAGE_NAMES.marks.name, path: '/marks' }],
  updated: requireUpdated('/marks/loading'),
});

export const metadata = route.metadata;

/** The beats of the motion in milliseconds, from the numbers the component is generated from, read here so the client never loads the tables. */
const TIMING: LoaderTiming = {
  drawBack: Math.round(motion.timing.hover * 1000),
  meridian: Math.round(motion.timing.beats.D1 * 1000),
  restAfterMeridian: Math.round(motion.timing.beats.R1 * 1000),
  g: Math.round(motion.timing.beats.D2 * 1000),
  restAfterG: Math.round(motion.timing.beats.R2 * 1000),
};

/**
 * /marks/loading: the logo while a page loads. The finished loader runs
 * live first, then the hovers, how the motion is built, the checks that
 * hold it, reduced motion, the loader on /compare, and the before and after
 * of the fix.
 */
export default function LoadingPage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <LoadingViewer updated={requireUpdated('/marks/loading')} timing={TIMING} />
    </>
  );
}
