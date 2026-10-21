import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';

const route = seoRoute({
  path: '/press/directions',
  title: 'Press directions',
  kind: 'page',
  description:
    'Seven directions for the GT Atlas press page, each opening on one issue, the first Chinese translation of Euclid, as a single full-screen cover.',
  crumbs: [{ name: PAGE_NAMES.press.name, path: '/press' }],
});

export const metadata = route.metadata;

/* The first direction plays on the stage (layout.tsx); the switcher at the
   foot of the page moves through the rest. */
export default function PressDirectionsPage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <h1 className='sr-only'>Press directions</h1>
      <p className='sr-only'>{route.metadata.description}</p>
    </>
  );
}
