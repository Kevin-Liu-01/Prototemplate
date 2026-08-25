'use client';

import { ArrowLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import { formatLegalDate, type LegalDoc } from './legal-docs';

/** Where a heading counts as "the one being read", in px from the viewport top. */
const READING_LINE = 140;

/**
 * The document page's sticky first column, in the live page's order: the way
 * back to the index (the shared BackLink, .tc-back-link), the title, the
 * frontmatter description, the last-updated stamp, then Contents.
 *
 * The live page hands its level-2 headings to the fumadocs TOC primitives,
 * which resolve the active anchor against the rendered heading ids. There is
 * no fumadocs here, so the same list is rendered plainly and the active
 * anchor is tracked with an IntersectionObserver over the real headings.
 *
 * Mount with `key={doc.route}` so a client-side move between two documents
 * re-arms the observer against the new headings.
 */
export default function LegalDocumentAside({ doc }: { doc: LegalDoc }) {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/production';

  const [activeId, setActiveId] = useState(doc.sections[0]?.id ?? '');

  useMountEffect(() => {
    const headings = doc.sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);
    if (headings.length === 0) return;

    // The active section is the last heading to have crossed the reading
    // line; the observer only has to fire on those crossings.
    const spy = () => {
      let current = headings[0].id;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= READING_LINE) {
          current = heading.id;
        }
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
    <header className='legal-document-aside'>
      <a className='tc-back-link' href={`${base}/legal`}>
        <ArrowLeft aria-hidden='true' />
        Legal Resources
      </a>

      <h1>{doc.title}</h1>
      <p>{doc.description}</p>
      <p className='legal-updated'>
        Last updated: {formatLegalDate(doc.lastUpdated)}
      </p>

      {doc.sections.length > 0 ? (
        <nav aria-label='Table of contents' className='legal-toc'>
          <span className='legal-toc-label'>Contents</span>
          <div className='legal-toc-scroll'>
            {doc.sections.map((section) => (
              <a
                data-active={section.id === activeId ? 'true' : 'false'}
                href={`#${section.id}`}
                key={section.id}
              >
                {section.heading}
              </a>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
