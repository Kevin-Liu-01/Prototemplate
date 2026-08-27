'use client';

import { ArrowUpRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { LEGAL_DOCS } from './legal-docs';

/**
 * The live index's ledger: one row per published document, in the order
 * getAllLegalDocuments() returns them (sorted by title). Each row is the
 * two-digit ordinal, the document's H1 and its frontmatter description, and
 * the corner arrow — three columns, and no fourth. The live page does not
 * print a last-updated date on the index; that stamp belongs to the document
 * page's own aside.
 *
 * Rows resolve against the concept the reader is actually in, so the control's
 * ledger links into /d/production/legal/<route>.
 */
export default function LegalLedger() {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/production';

  return (
    <section className='tc-sec legal-index-list'>
      {/* the live page's empty-library branch cannot be reached here: the
          documents are a module literal, not a directory read */}
      <div className='legal-ledger'>
        {LEGAL_DOCS.map((doc, index) => (
          <a
            className='legal-ledger-row'
            href={`${base}/legal/${doc.route}`}
            key={doc.route}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <h2>{doc.title}</h2>
              <p>{doc.description}</p>
            </div>
            <ArrowUpRight aria-hidden='true' />
          </a>
        ))}
      </div>
    </section>
  );
}
