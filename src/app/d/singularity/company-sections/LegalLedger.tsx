'use client';

import { ArrowUpRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';
import { formatLegalDate, LEGAL_DOCS } from './legal-docs';

/**
 * The old page's ledger of documents, filed the dossier way: the numbered
 * column the original prints (01, 02, …), the document's title and its
 * frontmatter description, the date the document was last updated, and the
 * same corner arrow. Rows resolve against the CURRENT concept's base, so every
 * final that mounts this section links into its own /legal/<route>.
 */
export default function LegalLedger() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/singularity';

  return (
    <section className='tc-sec' ref={root}>
      <div className='cpg-ledger'>
        {LEGAL_DOCS.map((doc, index) => (
          <a
            className='cpg-row'
            data-reveal
            href={`${base}/legal/${doc.route}`}
            key={doc.route}
          >
            <span className='cpg-row-num'>{String(index + 1).padStart(2, '0')}</span>
            <span className='cpg-row-main'>
              <span className='cpg-row-title'>{doc.title}</span>
              <span className='cpg-row-dek'>{doc.description}</span>
            </span>
            <span className='cpg-row-date'>{formatLegalDate(doc.lastUpdated)}</span>
            <ArrowUpRight aria-hidden='true' className='cpg-row-arrow' />
          </a>
        ))}
      </div>
    </section>
  );
}
