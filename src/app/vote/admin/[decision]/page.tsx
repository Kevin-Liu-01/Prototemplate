import { notFound } from 'next/navigation';

import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { isDecisionId } from '@/lib/vote/decisions';

import { adminDecisionBoot } from '../../server';
import DecisionAdmin from './DecisionAdmin';

type Params = { params: Promise<{ decision: string }> };

function adminRoute(id: string) {
  return seoRoute({
    path: `/vote/admin/${id}`,
    title: PAGE_NAMES.voteAdmin.name,
    kind: 'page',
    description: 'The admin panel of one team vote: its settings, its options, its voters and their devices, the head-to-head matrix and the export.',
    card: false,
  });
}

export async function generateMetadata({ params }: Params) {
  const { decision } = await params;
  if (!isDecisionId(decision)) notFound();
  return adminRoute(decision).metadata;
}

export const dynamic = 'force-dynamic';

/** /vote/admin/[decision]: the key form until the admin cookie is set, then the decision's whole panel, read on the server. */
export default async function VoteDecisionAdminPage({ params }: Params) {
  const { decision } = await params;
  if (!isDecisionId(decision)) notFound();
  const boot = await adminDecisionBoot(decision);
  if (boot.kind === 'missing') notFound();
  return (
    <>
      <JsonLd nodes={adminRoute(decision).jsonLd} />
      <DecisionAdmin boot={boot} id={decision} title={PAGE_NAMES.voteAdmin.name} />
    </>
  );
}
