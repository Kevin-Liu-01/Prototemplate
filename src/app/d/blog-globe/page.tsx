import GlobeA from '@/app/d/blog-globe/_rounds/r3/variant-a/GlobeA';
import GlobeB from '@/app/d/blog-globe/_rounds/r3/variant-b/GlobeB';
import GlobeC from '@/app/d/blog-globe/_rounds/r3/variant-c/GlobeC';
import GlobeD from '@/app/d/blog-globe/_rounds/r3/variant-d/GlobeD';
import GlobeDevPage from '@/app/d/blog-globe/_stage/GlobeDevPage';
import { seoRoute } from '@/lib/seo/route';

const route = seoRoute({
  path: '/d/blog-globe',
  title: 'Blog globe, round 3',
  kind: 'direction',
  description:
    'Round 3 of the four blog globe figures, live: zoomed globes, eight lines of Euclid that change row by row, underlined language names and clickable cities.',
});

export const metadata = route.metadata;

/* The stage for round 3 of the globe figure's four variants, copied from
   gt-cloud's k/blog-globe at 5ba413acfb. ?v=a|b|c|d shows one alone, and
   ?v=<x>&embed=1 shows the figure alone for a frame. Rounds 1 and 2 have
   their own routes (/r1, /r2), and /all shows every round side by side.
   Only /docs/blog-globe links here. */
export default function GlobeRound3Page() {
  return (
    <GlobeDevPage
      base='/d/blog-globe'
      round='r3'
      figures={{ a: <GlobeA />, b: <GlobeB />, c: <GlobeC />, d: <GlobeD /> }}
    />
  );
}
