import GlobeA from '@/app/d/blog-globe/_rounds/r1/variant-a/GlobeA';
import GlobeB from '@/app/d/blog-globe/_rounds/r1/variant-b/GlobeB';
import GlobeC from '@/app/d/blog-globe/_rounds/r1/variant-c/GlobeC';
import GlobeD from '@/app/d/blog-globe/_rounds/r1/variant-d/GlobeD';
import GlobeDevPage from '@/app/d/blog-globe/_stage/GlobeDevPage';
import { seoRoute } from '@/lib/seo/route';

const route = seoRoute({
  path: '/d/blog-globe/r1',
  title: 'Blog globe, round 1',
  kind: 'direction',
  description:
    'Round 1 of the four blog globe figures, live: the whole globe, one line of Euclid, a language control of its own in each variant and decimal coordinates.',
});

export const metadata = route.metadata;

/* Round 1 of the globe figures, frozen in gt-cloud from c7031e2ca8 and
   copied at 5ba413acfb. Its own route keeps its stylesheets off every other
   round's page. Only /docs/blog-globe and the other rounds link here. */
export default function GlobeRound1Page() {
  return (
    <GlobeDevPage
      base='/d/blog-globe'
      round='r1'
      figures={{ a: <GlobeA />, b: <GlobeB />, c: <GlobeC />, d: <GlobeD /> }}
    />
  );
}
