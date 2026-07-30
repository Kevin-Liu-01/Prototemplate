'use client';

import type { ReactNode } from 'react';

import { tokenize } from '../code';
import { BEATS, RAIL } from './beats';

/**
 * The story's single stage: two scenes and a pipeline rail, rendered entirely
 * from the beat index.
 *
 * Three rules hold it together. Everything is ordinary flow layout inside a
 * fluid container, so the scene reflows at 390px rather than being a desktop
 * mock cropped by the viewport. Every overlay is a child of a clipping box, so
 * nothing can cross the column's vertical rules. And the pipeline is a band
 * *under* the stage rather than a layer over it, so the rail and the code are
 * never asked to share the same pixels.
 */

type Copy = { en: string; es: string };

const NAV: readonly Copy[] = [
  { en: 'Product', es: 'Producto' },
  { en: 'Docs', es: 'Documentación' },
  { en: 'Pricing', es: 'Precios' },
];

const HEAD: Copy = { en: 'Ship your product everywhere', es: 'Lanza tu producto en todo el mundo' };
/** The same source string after `context="Playful, upbeat tone"`. */
const HEAD_PLAYFUL = '¡Lleva tu producto a todas partes!';

const LEDE: Copy = {
  en: 'One codebase, every language your customers read in.',
  es: 'Un solo código, en todos los idiomas que leen tus clientes.',
};

const CTA: Copy = { en: 'Get started', es: 'Comenzar ahora' };

const LEGAL: Copy = {
  en: 'By continuing, you agree to our Terms of Service.',
  es: 'Al continuar, aceptas nuestros Términos de Servicio.',
};

/** The rest of the page GT is reading — the mock is a page, not a header. */
const FEATURES: readonly { h: Copy; p: Copy }[] = [
  {
    h: { en: 'Docs in five languages', es: 'Documentación en cinco idiomas' },
    p: { en: 'Guides your team already reads.', es: 'Guías que tu equipo ya lee.' },
  },
  {
    h: { en: 'Support around the clock', es: 'Soporte a toda hora' },
    p: { en: 'Answers in your language.', es: 'Respuestas en tu idioma.' },
  },
];

/** The page's own dark band — the kind of section every real landing page
    carries. Its labels are text nodes like any other, so GT reads them too. */
const STATS: readonly { v: string; l: Copy }[] = [
  { v: '40+', l: { en: 'languages served', es: 'idiomas disponibles' } },
  { v: '12k', l: { en: 'teams shipping', es: 'equipos lanzando' } },
  { v: '99.99%', l: { en: 'uptime, every region', es: 'disponibilidad total' } },
];

const FOOT: readonly Copy[] = [
  { en: 'Terms', es: 'Términos' },
  { en: 'Privacy', es: 'Privacidad' },
  { en: 'Status', es: 'Estado' },
];

/** Lines kept under 46 characters so the panel never needs a scrollbar at 390px. */
const BEFORE: readonly string[] = [
  'export default function Page() {',
  '  return (',
  '    <div>',
  '      <h1>Ship everywhere</h1>',
  '      <p>{new Date().toLocaleDateString()}</p>',
  '      <button>Get started</button>',
  '    </div>',
  '  );',
  '}',
];

/** Findings from the scan, keyed to 1-based lines of BEFORE. */
const FINDINGS: Record<number, number> = { 4: 1, 5: 2, 6: 3 };

type DiffLine = { text: string; mark?: 'add' | 'del' };

const AFTER: readonly DiffLine[] = [
  { text: "import { T, DateTime } from 'gt-next';", mark: 'add' },
  { text: '' },
  { text: 'export default function Page() {' },
  { text: '  return (' },
  { text: '    <T>', mark: 'add' },
  { text: '      <h1>Ship everywhere</h1>' },
  { text: '      <p>{new Date().toLocaleDateString()}</p>', mark: 'del' },
  { text: '      <p><DateTime>{new Date()}</DateTime></p>', mark: 'add' },
  { text: '      <button>Get started</button>' },
  { text: '    </T>', mark: 'add' },
  { text: '  );' },
  { text: '}' },
];

function Line({ text }: { text: string }) {
  return (
    <code>
      {tokenize(text).map((token, i) =>
        token.k === 'plain' ? (
          token.v
        ) : (
          <span className={`tc-t-${token.k}`} key={i}>
            {token.v}
          </span>
        )
      )}
      {text.length === 0 ? ' ' : null}
    </code>
  );
}

/** A text node the way GT sees it: while beat 1 reads the page, every picked-up
    node carries a dashed measure under it — no count chips, no index marks. */
function Node({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <span className='tcs-node' data-on={on}>
      {children}
    </span>
  );
}

function PageScene({ beat }: { beat: number }) {
  const es = beat >= 1;
  const reading = beat === 0;
  const heading = beat >= 3 ? HEAD_PLAYFUL : es ? HEAD.es : HEAD.en;

  return (
    <div className='tcs-page'>
      <div className='tcs-page-bar'>
        <span>example.com</span>
        <span className='tcs-page-loc'>{es ? 'es' : 'en'}</span>
      </div>

      <div className='tcs-page-body'>
        <div className='tcs-page-nav'>
          {NAV.map((item) => (
            <Node key={item.en} on={reading}>
              {es ? item.es : item.en}
            </Node>
          ))}
        </div>

        <h4 className='tcs-page-h'>
          <Node on={reading}>{heading}</Node>
        </h4>

        <p className='tcs-page-p'>
          <Node on={reading}>{es ? LEDE.es : LEDE.en}</Node>
        </p>

        <div className='tcs-page-acts'>
          <span className='tcs-page-btn' data-focus={beat === 2}>
            <Node on={reading}>{es ? CTA.es : CTA.en}</Node>
          </span>

          {/* The widening, shown rather than asserted: the English label is
              re-laid out underneath at the same type and padding, so the
              difference in the two boxes is the browser's, not a drawing. */}
          {beat === 2 ? (
            <span className='tcs-ghost'>
              <span className='tcs-ghost-btn'>{CTA.en}</span>
              <span className='tcs-ghost-tag'>en, before</span>
            </span>
          ) : null}
        </div>

        <div className='tcs-page-feats'>
          {FEATURES.map((feature) => (
            <div key={feature.h.en}>
              <b>
                <Node on={reading}>{es ? feature.h.es : feature.h.en}</Node>
              </b>
              <span>
                <Node on={reading}>{es ? feature.p.es : feature.p.en}</Node>
              </span>
            </div>
          ))}
        </div>

        <div className='tcs-page-stats'>
          {STATS.map((stat) => (
            <div key={stat.l.en}>
              <b>{stat.v}</b>
              <span>
                <Node on={reading}>{es ? stat.l.es : stat.l.en}</Node>
              </span>
            </div>
          ))}
        </div>

        <p className='tcs-page-legal' data-flag={beat === 4}>
          <Node on={reading}>{es ? LEGAL.es : LEGAL.en}</Node>
          {beat === 4 ? <span className='tcs-page-flag'>requires review</span> : null}
        </p>

        {beat === 4 ? (
          <div className='tcs-review'>
            <div className='tcs-review-head'>
              <span className='tcs-review-ava'>LC</span>
              <span>
                <b>Legal counsel</b>
                <span className='tcs-review-sub'>webhook · requires review</span>
              </span>
            </div>
            <p className='tcs-review-msg'>
              &ldquo;Al continuar, aceptas nuestros Términos de Servicio.&rdquo;
            </p>
            <div className='tcs-review-acts'>
              <span>Approve</span>
              <span>Edit</span>
              <em>Approved — shipped</em>
            </div>
          </div>
        ) : null}

        <div className='tcs-page-foot'>
          <span>© 2026 example.com</span>
          {FOOT.map((link) => (
            <Node key={link.en} on={reading}>
              {es ? link.es : link.en}
            </Node>
          ))}
        </div>
      </div>
    </div>
  );
}

function CodeScene({ beat }: { beat: number }) {
  const edited = beat >= 7;
  const scanning = beat === 5;
  const mapped = beat === 6;

  return (
    <div className='tcs-code'>
      <div className='tcs-page-bar'>
        <span>app/page.tsx</span>
        <span className='tcs-page-loc'>{edited ? 'locadex/i18n' : 'main'}</span>
      </div>

      <div className='tcs-code-body'>
        {edited ? (
          <>
            {/* A diff is a diff: it opens with its file lines and hunk header,
                the way `git diff` prints it — never a tonal drawing of one. */}
            <div className='tcs-code-file'>--- a/app/page.tsx</div>
            <div className='tcs-code-file'>+++ b/app/page.tsx</div>
            <div className='tcs-code-hunk'>@@ -1,9 +1,12 @@</div>
            {AFTER.map((line, i) => (
              <div className='tcs-code-line' data-mark={line.mark ?? 'none'} key={`a${i}`}>
                <span className='tcs-code-n'>{i + 1}</span>
                <span className='tcs-code-s'>
                  {line.mark === 'add' ? '+' : line.mark === 'del' ? '−' : ''}
                </span>
                <Line text={line.text} />
              </div>
            ))}
          </>
        ) : (
          BEFORE.map((line, i) => (
            <div className='tcs-code-line' data-find={Boolean(mapped && FINDINGS[i + 1])} key={`b${i}`}>
              <span className='tcs-code-n'>{i + 1}</span>
              <span className='tcs-code-s'>
                {mapped && FINDINGS[i + 1] ? <i className='tcs-find'>!</i> : null}
              </span>
              <Line text={line} />
            </div>
          ))
        )}

        {scanning ? <span className='tcs-scan' aria-hidden /> : null}
      </div>

      {beat === 8 ? (
        <div className='tcs-pr'>
          <div className='tcs-pr-head'>
            <b>Translate app/page.tsx into 6 locales</b>
            <span className='tcs-pr-num'>#218</span>
          </div>
          <div className='tcs-pr-meta'>locadex/i18n → main · 4 files · +38 −6 · merged</div>
        </div>
      ) : null}
    </div>
  );
}

export default function StoryStage({ beat }: { beat: number }) {
  const current = BEATS[beat] ?? BEATS[0];
  if (!current) return null;

  return (
    <div className='tcs-stage'>
      <div className='tcs-mat'>
        <div className='tcs-card'>
          {current.scene === 'page' ? <PageScene beat={beat} /> : <CodeScene beat={beat} />}
        </div>
      </div>

      <p className='tcs-annot'>{current.annot}</p>

      <div className='tcs-rail'>
        {RAIL.map((step, i) => (
          <span className='tcs-rail-step' data-on={i === current.step} data-done={i < current.step} key={step}>
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}
