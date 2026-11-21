import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import { GT_LOGO_MOTION } from '@/components/brand/GtLogoMotion.geometry';

import motion from '../../../../scripts/build/logo-motion.json';

import type { LoaderTiming } from './content';
import LoadingViewer from './LoadingViewer';

const route = seoRoute({
  path: '/marks/loading',
  title: PAGE_NAMES.loading.name,
  kind: 'page',
  description: 'The General Translation logo while a page loads, live: the loader, which is also the hover, how it is built, its checks and two loaders kept as explorations.',
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
  meridianReturn: [Math.round(GT_LOGO_MOTION.timing.meridianReturn[0]), Math.round(GT_LOGO_MOTION.timing.meridianReturn[1])],
  lap: Math.round(GT_LOGO_MOTION.timing.lap),
};

/**
 * /marks/loading: the logo while a page loads. The finished loader runs
 * live first, then the hover, which is the loader, how the motion is built,
 * the checks that hold it, reduced motion, the loader on /compare, two
 * explorations, and the before and after of the fix.
 */
export default function LoadingPage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <LoadingViewer updated={requireUpdated('/marks/loading')} timing={TIMING} />
    </>
  );
}
