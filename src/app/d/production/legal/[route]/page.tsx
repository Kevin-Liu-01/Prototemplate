import { notFound } from 'next/navigation';

import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../../_v0/V0Footer';
import V0Nav from '../../../_v0/V0Nav';
import LegalDocument from '../../sections/LegalDocument';
import { getLegalDoc, LEGAL_DOCS } from '../../sections/legal-docs';

import '../../../toolchain/sections/logos-icons.css';
import '../../../toolchain/styles.css';
import '../../../_v0/v0-pages.css';
import '../../sections/legal.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL_DOCS.map((doc) => ({ route: doc.route }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ route: string }>;
}) {
  const { route } = await params;
  const doc = getLegalDoc(route);

  return {
    title: doc
      ? `${doc.title} — Production — GT Redesign`
      : 'Legal Document Not Found',
    description: doc?.description,
    icons: { icon: '/brand/no-bg-gt-logo-light.png' },
  };
}

/**
 * ONE LEGAL DOCUMENT — the shipped record, reproduced.
 *
 * The live route (legal/[route]/page.tsx) puts one `<article>` in the rail:
 * a sticky `<header>` carrying the way back, the title, the description, the
 * last-updated stamp and the level-2 Contents, beside the MDX body. Same
 * shape here, over the vendored block tree — all seven documents resolve, so
 * every row of the index lands on a real page.
 */
export default async function ProductionLegalDocumentPage({
  params,
}: {
  params: Promise<{ route: string }>;
}) {
  const { route } = await params;
  const doc = getLegalDoc(route);
  if (!doc) notFound();

  return (
    <SmoothScroll>
      <div className='toolchain-root sgdh-root prod-root legal-root' id='top'>
        <V0Nav />

        <main className='tc-rail'>
          <LegalDocument doc={doc} />
          <V0Footer />
        </main>
      </div>
      <DirectionDock slug='production' />
    </SmoothScroll>
  );
}
