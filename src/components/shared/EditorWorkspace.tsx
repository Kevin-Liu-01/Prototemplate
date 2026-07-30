'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ReactNode } from 'react';
import { Fragment, useRef } from 'react';

import './EditorWorkspace.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type EditorWorkspaceRow = {
  key: string;
  source: string;
  translation: string;
  /**
   * `revised` renders `previous` struck through above the current line;
   * `approved` retires the edit affordance. Revision state is carried by type
   * weight, strikethrough and a hairline — never by colour.
   */
  state?: 'clean' | 'revised' | 'approved';
  previous?: string;
  lang?: string;
};

export type EditorWorkspaceProps = {
  className?: string;
  id?: string;
  heading: ReactNode;
  /** One supporting line under the heading. */
  subheading?: ReactNode;
  /** Short supporting points beside the workspace. */
  notes?: string[];
  rows?: EditorWorkspaceRow[];
  sourceLabel?: string;
  targetLabel?: string;
  /** Text on the workspace bar, e.g. `workspace · es-419`. */
  meta?: string;
  /** Status strip along the panel bottom, e.g. `['8 strings', '1 revised']`. */
  footer?: string[];
  /** `split` puts the copy beside the workspace; `stacked` puts it above. */
  layout?: 'split' | 'stacked';
};

export const DEFAULT_EDITOR_ROWS: EditorWorkspaceRow[] = [
  { key: 'hello', source: 'Hello, world!', translation: '¡Hola, mundo!', lang: 'es' },
  {
    key: 'tagline',
    source: 'Translation that just works.',
    translation: 'Traducciones que simplemente funcionan.',
    previous: 'Traducción que funciona.',
    state: 'revised',
    lang: 'es',
  },
  { key: 'payment', source: 'Payment received', translation: 'Pago recibido', lang: 'es' },
  {
    key: 'terms',
    source: 'By continuing you agree to our Terms of Service.',
    translation: 'Al continuar, aceptas nuestros Términos de Servicio.',
    state: 'approved',
    lang: 'es',
  },
  { key: 'cta', source: 'Get started', translation: 'Comenzar ahora', lang: 'es' },
];

/**
 * The translation editor: source beside target, with real revision and edit
 * states. No status pills and no colour — a revision reads as a struck-through
 * previous line above the current one.
 */
export default function EditorWorkspace({
  className,
  id,
  heading,
  subheading,
  notes,
  rows = DEFAULT_EDITOR_ROWS,
  sourceLabel = 'Source — EN',
  targetLabel = 'Translation — ES',
  meta = 'workspace · es-419',
  footer,
  layout = 'split',
}: EditorWorkspaceProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.from(gsap.utils.toArray<HTMLElement>('[data-reveal]', root.current), {
        y: 32,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 78%', once: true },
      });
    },
    { scope: root }
  );

  return (
    <section className={className ? `gte ${className}` : 'gte'} id={id} ref={root}>
      <div className='gte-wrap'>
        <div className='gte-grid' data-layout={layout}>
          <div className='gte-copy'>
            <h2 data-reveal>{heading}</h2>
            {subheading && (
              <p className='gte-sub' data-reveal>
                {subheading}
              </p>
            )}
            {notes && notes.length > 0 && (
              <ul className='gte-notes' data-reveal>
                {notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
          </div>

          <div className='gte-ws' data-reveal>
            <div className='gte-bar'>{meta}</div>
            {/* One grid, two cells per string: each source row shares its grid
                row (and so its height) with its translation, so the two
                columns always end together — no blank band under the shorter
                column, and every row hairline runs straight across. */}
            <div className='gte-cols'>
              <div className='gte-lab'>{sourceLabel}</div>
              <div className='gte-lab gte-cell-t'>{targetLabel}</div>
              {rows.map((row) => (
                <Fragment key={row.key}>
                  <div className='gte-row gte-cell-s'>
                    <span className='gte-text'>{row.source}</span>
                  </div>
                  <div className='gte-row gte-cell-t' data-state={row.state ?? 'clean'}>
                    {row.state === 'revised' && row.previous && (
                      <span className='gte-prev' lang={row.lang}>
                        {row.previous}
                      </span>
                    )}
                    <span className='gte-text' lang={row.lang}>
                      {row.translation}
                    </span>
                    <span className='gte-act'>{row.state === 'approved' ? 'approved' : 'edit'}</span>
                  </div>
                </Fragment>
              ))}
            </div>
            {footer && footer.length > 0 && (
              <div className='gte-foot'>
                {footer.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
