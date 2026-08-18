import { ArrowUpRight } from 'lucide-react';

import { legalDocuments } from '@/lib/legal';

import V0Footer from '../../_v0/V0Footer';
import V0Nav from '../../_v0/V0Nav';

import '../../toolchain/styles.css';
import '../../_v0/v0-pages.css';
import './legal.css';

export const metadata = {
  title: 'Legal Resources — General Translation',
  description: 'Policies, terms, and data processing information for General Translation.',
};

export default function LegalIndexPage() {
  return (
    <div className='toolchain-root sgdh-root legal-root'>
      <V0Nav />
      <main className='tc-rail'>
        <section className='tc-sec legal-index-hero'>
          <div className='legal-index-hero-copy'>
            <h1>Legal Resources</h1>
            <p>Policies, terms, and data processing information for General Translation.</p>
          </div>
          <span>{legalDocuments.length} published documents</span>
        </section>

        <section className='tc-sec legal-index-list'>
          <div className='legal-ledger'>
            {legalDocuments.map((document, index) => (
              <a
                className='legal-ledger-row'
                href={`/d/singularity-dossier/legal/${document.route}`}
                key={document.route}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h2>{document.title}</h2>
                  <p>{document.description}</p>
                </div>
                <ArrowUpRight aria-hidden='true' />
              </a>
            ))}
          </div>
        </section>
        <V0Footer />
      </main>
    </div>
  );
}
