import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';

import { adminBoot } from '../server';
import VoteAdmin from './VoteAdmin';

const route = seoRoute({
  path: '/vote/admin',
  title: PAGE_NAMES.voteAdmin.name,
  kind: 'page',
  description: 'The admin panel of the team logo vote: the logos, the voters and their devices, the head-to-head matrix and the vote export.',
});

export const metadata = route.metadata;

export const dynamic = 'force-dynamic';

/** /vote/admin: the key form until the admin cookie is set, then the whole panel, read on the server. */
export default async function VoteAdminPage() {
  const boot = await adminBoot();
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <VoteAdmin boot={boot} title={PAGE_NAMES.voteAdmin.name} />
    </>
  );
}
