import { notFound } from 'next/navigation';

import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import LegalDocument from '../../../singularity/company-sections/LegalDocument';
import { getLegalDoc, LEGAL_DOCS } from '../../../singularity/company-sections/legal-docs';
import SiteFooter from '../../../singularity/sections/SiteFooter';
import TopNav from '../../../singularity/sections/TopNav';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../../singularity/sections/logos-icons.css';
import '../../../singularity/styles.css';
import '../../../singularity/company-sections/company.css';
import '../../../singularity/company-sections/legal.css';
import '../../styles.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL_DOCS.map((doc) => ({ route: doc.route }));
}

export async function generateMetadata({ params }: { params: Promise<{ route: string }> }) {
  const { route } = await params;
  const doc = getLegalDoc(route);

  return {
    title: doc ? `${doc.title} — Orbit — GT Redesign` : 'Legal — Orbit — GT Redesign',
    description: doc?.description,
    icons: { icon: '/brand/no-bg-gt-logo-light.png' },
  };
}

/**
 * One legal document — the old page's two-column record: the sticky
 * title-and-contents column beside the prose, with the table of contents built
 * from the document's own h2 headings. Documents are vendored in
 * ../../../singularity/company-sections/legal-docs.ts.
 */
export default async function SingularityOrbitLegalDocumentPage({
  params,
}: {
  params: Promise<{ route: string }>;
}) {
  const { route } = await params;
  const doc = getLegalDoc(route);
  if (!doc) notFound();

  return (
    <SmoothScroll>
      <div className='singularity-root sgo-root' id='top'>
        <TopNav />
        <div className='tc-rail'>
          <LegalDocument doc={doc} />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-orbit' />
    </SmoothScroll>
  );
}
