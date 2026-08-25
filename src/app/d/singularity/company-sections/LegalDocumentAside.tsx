'use client';

import { ArrowLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import { formatLegalDate, type LegalDoc } from './legal-docs';

/** Where a heading counts as "the one being read", in px from the viewport top. */
const READING_LINE = 140;

/**
 * The document's sticky column: the way back to the index, the title block,
 * the last-updated stamp, and the table of contents built from the document's
 * own h2 sections — the live page hands the same list to the fumadocs TOC
 * primitives. There is no fumadocs here, so the active anchor is tracked with
 * an IntersectionObserver on the rendered headings.
 *
 * Mount the component with `key={doc.route}` so a client-side move between two
 * documents re-arms the observer against the new headings.
 */
export default function LegalDocumentAside({ doc }: { doc: LegalDoc }) {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/singularity';

  const [activeId, setActiveId] = useState(doc.sections[0]?.id ?? '');

  useMountEffect(() => {
    const headings = doc.sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);
    if (headings.length === 0) return;

    // The active section is the last heading to have crossed the reading line;
    // the observer only has to fire on those crossings.
    const spy = () => {
      let current = headings[0].id;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= READING_LINE) current = heading.id;
      }
      setActiveId(current);
    };

    spy();
    const observer = new IntersectionObserver(spy, {
      rootMargin: `-${READING_LINE}px 0px 0px 0px`,
      threshold: [0, 1],
    });
    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  });

  return (
    <header className='cpg-doc-aside'>
      <a className='cpg-back' href={`${base}/legal`}>
        <ArrowLeft aria-hidden='true' />
        Legal Resources
      </a>

      <h1>{doc.title}</h1>
      <p className='cpg-doc-dek'>{doc.description}</p>
      <p className='cpg-doc-updated'>Last updated: {formatLegalDate(doc.lastUpdated)}</p>

      {doc.sections.length > 0 ? (
        <nav aria-label='Table of contents' className='cpg-toc'>
          <span className='cpg-toc-label'>Contents</span>
          <ol className='cpg-toc-list'>
            {doc.sections.map((section) => (
              <li key={section.id}>
                <a
                  data-active={section.id === activeId ? 'true' : undefined}
                  href={`#${section.id}`}
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
    </header>
  );
}
