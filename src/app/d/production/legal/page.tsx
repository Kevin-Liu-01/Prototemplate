import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import { DirectionCorner } from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

import ProdFooter from '../sections/ProdFooter';
import ProdNav from '../sections/ProdNav';
import { getLegalDocuments } from '../sections/legal-docs';

import '../../toolchain/sections/logos-icons.css';
import '../../toolchain/styles.css';
import '../../_v0/v0-pages.css';
import '../sections/legal.css';

const route = seoRoute({
  path: '/d/production/legal',
  title: 'Legal',
  section: 'Shipped',
  kind: 'mirror',
  description:
    'Policies, terms, and data processing information for General Translation.',
});

export const metadata = route.metadata;

/**
 * PRODUCTION · LEGAL: generaltranslation.com/legal.
 *
 * The live index (apps/landing/src/app/[locale]/(home)/legal/page.tsx):
 * the Legal Resources head with its document count, then the ledger of
 * every published document, numbered 01 onward in title order, each row
 * a link to its page. The documents are the vendored copies in
 * content/legal/en-US (sections/legal-docs.ts). The (home) layout
 * supplies the header and the footer, which here are ProdNav and
 * ProdFooter.
 */
export default function ProductionLegalPage() {
  const documents = getLegalDocuments();

  return (
    <SmoothScroll>
      <div className='toolchain-root sgdh-root prod-root legal-root'>
        <ProdNav />

        <main className='tc-rail'>
          <section className='tc-sec legal-index-hero'>
            <div className='legal-index-hero-copy'>
              <h1>Legal Resources</h1>
              <p>Policies, terms, and data processing information for General Translation.</p>
            </div>
            <span>{documents.length} published documents</span>
          </section>

          <section className='tc-sec legal-index-list'>
            <div className='legal-ledger'>
              {documents.map((document, index) => (
                <Link className='legal-ledger-row' href={`/d/production/legal/${document.route}`} key={document.route}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h2>{document.title}</h2>
                    <p>{document.description}</p>
                  </div>
                  <ArrowUpRight aria-hidden='true' />
                </Link>
              ))}
            </div>
          </section>
          <ProdFooter />
        </main>
      </div>
      <DirectionCorner slug='production' />
    </SmoothScroll>
  );
}
