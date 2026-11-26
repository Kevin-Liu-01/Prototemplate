import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import SocialsViewer from './SocialsViewer';

const route = seoRoute({
  path: '/socials',
  title: PAGE_NAMES.socials.name,
  kind: 'page',
  description:
    'The skills behind General Translation’s posts on X and LinkedIn, the Series A launch media, and the sizes and card tags every post follows.',
});

export const metadata = route.metadata;

/**
 * /socials: the social work in one place. The rows come from
 * src/lib/socials.ts (the skills, what earns attention on X, the media,
 * the metadata standards); the viewer opens the book at its head.
 */
export default function SocialsPage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <SocialsViewer updated={requireUpdated('/socials')} />
    </>
  );
}
