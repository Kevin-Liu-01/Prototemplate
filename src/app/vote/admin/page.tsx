import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';

import { adminListBoot } from '../server';
import VoteAdmin from './VoteAdmin';

const route = seoRoute({
  path: '/vote/admin',
  title: PAGE_NAMES.voteAdmin.name,
  kind: 'page',
  description: 'The admin panel of the team votes: every decision with its status, kind and counts, and the form that starts a new one.',
});

export const metadata = route.metadata;

export const dynamic = 'force-dynamic';

/** /vote/admin: the key form until the admin cookie is set, then every decision, read on the server. */
export default async function VoteAdminPage() {
  const boot = await adminListBoot();
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <VoteAdmin boot={boot} title={PAGE_NAMES.voteAdmin.name} />
    </>
  );
}
