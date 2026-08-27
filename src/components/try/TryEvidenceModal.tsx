'use client';

import { useId, useRef, useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import CategoryMark from './CategoryMarks';
import { FixMark, isCleanFix } from './ReportCard';

import type { MouseEvent } from 'react';
import type { ReportCategory } from '@/lib/try/grade';

/* How long the copy button holds its confirmation face. */
const COPIED_MS = 1800;

/* The elements a Tab press can land on inside the panel. */
const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/* The row's evidence dossier: a fixed ink scrim with one hairline-framed
   panel on the card ground — the category's mark, name and grade chip in
   the header, then the summary, the captured evidence (verbatim snippets
   and expanded findings), and a paste-ready agent prompt with its copy
   button. The parent mounts one modal at a time and takes focus back to
   the opening row on close; this component owns the scroll lock, the
   focus trap, and the Escape and scrim dismissals. */
export default function TryEvidenceModal({
  category,
  onClose,
}: {
  category: ReportCategory;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = useId();

  /* The component mounts only while open, so the mount effect IS the
     open effect: lock the page scroll (on the root element — the site
     sheet sets overflow-x on html, so body overflow never propagates to
     the viewport — with padding compensating the vanished scrollbar so
     the page never shifts), move focus to the close button, and hold
     Tab inside the panel until close restores everything. */
  useMountEffect(() => {
    const root = document.documentElement;
    const gap = window.innerWidth - root.clientWidth;
    const prevRootOverflow = root.style.overflow;
    const prevOverflow = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;
      const inside = active instanceof Node && panel.contains(active);
      if (event.shiftKey && (active === first || !inside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !inside)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      root.style.overflow = prevRootOverflow;
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPad;
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    };
  });

  function onScrimClick(event: MouseEvent) {
    if (event.target === event.currentTarget) onClose();
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(category.evidence.agentPrompt);
    } catch {
      return;
    }
    setCopied(true);
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => {
      copyTimer.current = null;
      setCopied(false);
    }, COPIED_MS);
  }

  const { snippets, details, agentPrompt } = category.evidence;

  return (
    <div className='try-modal-scrim' onClick={onScrimClick}>
      <div
        ref={panelRef}
        className='try-modal'
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
      >
        <header className='try-modal-head'>
          <span className='try-modal-headicon'>
            <CategoryMark id={category.id} className='try-modal-mark' />
          </span>
          <h3 id={titleId} className='try-modal-name'>
            {category.name}
          </h3>
          <span
            className='try-score-chip'
            role='img'
            aria-label={`Grade ${category.grade}`}
            style={{
              color: `var(--try-grade-${category.grade.toLowerCase()})`,
            }}
          >
            {category.grade}
          </span>
          <button
            ref={closeRef}
            type='button'
            className='try-modal-close'
            aria-label='Close'
            onClick={onClose}
          >
            {/* the house-drawn x: two hairline diagonals */}
            <svg
              viewBox='0 0 16 16'
              width={16}
              height={16}
              fill='none'
              stroke='currentColor'
              strokeWidth={1.25}
              strokeLinecap='square'
              aria-hidden='true'
            >
              <path d='m3.5 3.5 9 9' />
              <path d='m12.5 3.5-9 9' />
            </svg>
          </button>
        </header>
        <div className='try-modal-body'>
          <section className='try-modal-sec'>
            <h4 className='try-modal-sechead'>Summary</h4>
            <p className='try-modal-summary'>{category.summary}</p>
            {/* the fix line, in the row's own grammar */}
            <div className='try-cat-fixrow'>
              <span
                className='try-cat-fixmark'
                style={
                  isCleanFix(category.fix)
                    ? {
                        color: `var(--try-grade-${category.grade.toLowerCase()})`,
                      }
                    : undefined
                }
              >
                <FixMark clean={isCleanFix(category.fix)} />
              </span>
              <p className='try-cat-fix'>{category.fix}</p>
            </div>
          </section>
          <section className='try-modal-sec'>
            <h4 className='try-modal-sechead'>Evidence</h4>
            {snippets.map((snippet) => (
              <figure key={snippet.label} className='try-modal-snip'>
                <figcaption className='try-modal-sniplabel'>
                  {snippet.label}
                </figcaption>
                <pre className='try-modal-code'>
                  <code>{snippet.code}</code>
                </pre>
              </figure>
            ))}
            {details.length > 0 && (
              <ul className='try-modal-details'>
                {details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            )}
            {snippets.length === 0 && details.length === 0 && (
              <p className='try-modal-empty'>
                No captured evidence for this category.
              </p>
            )}
          </section>
          {agentPrompt !== '' && (
            <section className='try-modal-sec'>
              <h4 className='try-modal-sechead'>Fix with an agent</h4>
              <p className='try-modal-hint'>
                Paste this into your coding agent.
              </p>
              <div className='try-modal-prompt'>
                <pre className='try-modal-promptext'>{agentPrompt}</pre>
                <button
                  type='button'
                  className='tc-btn tc-btn-solid tc-btn-sm try-modal-copy'
                  onClick={copyPrompt}
                >
                  {copied ? 'Copied' : 'Copy prompt'}
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
