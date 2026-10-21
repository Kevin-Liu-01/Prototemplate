import GlobeA from '@/app/d/blog-globe/_rounds/r2/variant-a/GlobeA';
import GlobeB from '@/app/d/blog-globe/_rounds/r2/variant-b/GlobeB';
import GlobeC from '@/app/d/blog-globe/_rounds/r2/variant-c/GlobeC';
import GlobeD from '@/app/d/blog-globe/_rounds/r2/variant-d/GlobeD';
import GlobeDevPage from '@/app/d/blog-globe/_stage/GlobeDevPage';
import { seoRoute } from '@/lib/seo/route';

const route = seoRoute({
  path: '/d/blog-globe/r2',
  title: 'Blog globe, round 2',
  kind: 'direction',
  description:
    'Round 2 of the four blog globe figures, live: round 1 after the design review, with the cities on each globe made clickable.',
});

export const metadata = route.metadata;

/* Round 2 of the globe figures, frozen in gt-cloud from ee19373e96 and
   copied at 5ba413acfb. Its own route keeps its stylesheets off every other
   round's page. Only /docs/components/blog-globe and the other rounds link here. */
export default function GlobeRound2Page() {
  return (
    <GlobeDevPage
      base='/d/blog-globe'
      round='r2'
      figures={{ a: <GlobeA />, b: <GlobeB />, c: <GlobeC />, d: <GlobeD /> }}
    />
  );
}
