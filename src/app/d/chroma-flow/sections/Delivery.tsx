'use client';

import { Send } from 'lucide-react';
import { useRef } from 'react';

import CodeBlock from './code';
import { useQuietReveal } from './reveal';

/**
 * M11 — what happens after translation, as one three-across band: development
 * preview, edge delivery, locale routing. Each cell is honest about its
 * trade-off — the dev key never ships, the CDN path and the bundled path are
 * both stated, and the build pipeline's deploy step is drawn struck through
 * rather than claimed away.
 */

const MIDDLEWARE = `import {
  createNextMiddleware,
} from 'gt-next/middleware';

export default createNextMiddleware({
  prefixDefaultLocale: true,
  pathConfig: {
    '/about': { fr: '/a-propos' },
    '/products': { zh: '/产品' },
  },
});`;

const LADDER: readonly { rung: string; on?: boolean }[] = [
  { rung: 'URL locale', on: true },
  { rung: 'cookie' },
  { rung: 'Accept-Language' },
  { rung: 'default locale' },
];

export default function Delivery() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='delivery' ref={root}>
      <div className='tc-head'>
        <Send className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>From your editor to the edge.</h2>
        <p data-reveal>
          Preview translations as you type, fix live strings without a deploy, and route every
          locale on paths a search engine can index.
        </p>
      </div>

      {/* One sheet, not three cards: the cells share the row's hairlines —
          border-top from the row, a single rule between neighbours, no box,
          no radius — the same grammar as the rail ledger and the trust band. */}
      <div className='tc-row is-three'>
        {/* ---- cell 1: the hot-reload stack ---- */}
        <div className='tc-cell is-short' data-reveal>
          <h3>Develop in Japanese</h3>
          <p>
            With a <code className='tc-chip'>gtx-dev-</code> key, translations regenerate as you
            type. No reload.
          </p>

          {/* One composed column: you type in the editor, the ja preview
              below re-renders. The thread pair carries the keystroke down. */}
          <div className='cf-dl-stack'>
            <div className='cf-dl-editor'>
              <div className='cf-dl-editor-bar'>
                app/page.tsx
                <span>en — source</span>
              </div>
              <div className='cf-dl-editor-body'>
                <span className='cf-dl-dim'>{'export default function Home() {'}</span>
                <span className='cf-dl-dim'>{'  return ('}</span>
                <span className='cf-dl-t'>{'    <T>'}</span>
                <span>{'      <h1>Get started by'}</span>
                <span>
                  {'      editing page.tsx</h1>'}
                  <i className='cf-dl-caret' aria-hidden />
                </span>
                <span>{'      <p>Looking for a starting'}</span>
                <span>{'      point or instructions?</p>'}</span>
                <span className='cf-dl-t'>{'    </T>'}</span>
                <span className='cf-dl-dim'>{'  );'}</span>
                <span className='cf-dl-dim'>{'}'}</span>
              </div>
            </div>

            <div className='cf-dl-relay' aria-hidden>
              <i />
              <span>gtx-dev- · translated on demand · 600 ms</span>
            </div>

            <div className='cf-dl-browser'>
              <div className='cf-dl-url'>
                localhost:3000<b>/ja</b>
              </div>
              <div className='cf-dl-page'>
                <b>開始するには、page.tsxファイルを編集してください。</b>
                <span className='cf-dl-page-p'>開始点や詳細な手順をお探しですか？</span>
                <span className='cf-dl-live'>updated · no reload</span>
              </div>
            </div>
          </div>

          {/* The two keys, as ruled ledger rows — the biggest architectural
              misread on the page, pre-empted where the demo happens. */}
          <div className='cf-dl-fork'>
            <div>
              <code className='tc-chip'>gtx-dev-</code>
              <span>translated on demand · preview only · browser-safe</span>
            </div>
            <div>
              <code className='tc-chip'>gtx-api-</code>
              <span>pre-generated · production · never in browser code</span>
            </div>
          </div>
        </div>

        {/* ---- cell 2: the greyed-out deploy ---- */}
        <div className='tc-cell is-short' data-reveal>
          <h3>Fix it without a deploy</h3>
          <p>Edit a string in the editor and the CDN serves it. Or bundle the JSON and never call us at all.</p>

          <div className='cf-dl-edit'>
            <div className='cf-dl-edit-row'>
              <span className='cf-dl-edit-src'>Payment received</span>
              <span className='cf-dl-edit-arrow'>→</span>
              <span className='cf-dl-edit-val'>
                Pago recibido
                <i className='cf-dl-caret' aria-hidden />
              </span>
              <button className='cf-dl-save' type='button'>
                Save
              </button>
            </div>
          </div>

          <div className='cf-dl-pipe' aria-label='commit, then build and deploy struck through, then live'>
            <span>commit</span>
            <span className='cf-dl-pipe-strike'>
              <span data-off>build</span>
              <span data-off>deploy</span>
            </span>
            <span>live</span>
          </div>

          {/* What the running app fetches, one save later — the edge answers
              with the fixed string while the deploy column stays struck. */}
          <div className='cf-dl-cdn'>
            <div className='cf-dl-cdn-bar'>
              GET /_gt/es.json
              <span>edge · 38 ms</span>
            </div>
            <div className='cf-dl-cdn-body'>
              <span className='cf-dl-dim'>{'{'}</span>
              <span>{'  "Hello, world!":'}</span>
              <span>{'    "¡Hola, mundo!",'}</span>
              <span>{'  "Payment received":'}</span>
              <span className='is-new'>{'    "Pago recibido",'}</span>
              <span>{'  "Get started":'}</span>
              <span>{'    "Comenzar ahora",'}</span>
              <span>{'  "Translation that just works.":'}</span>
              <span>{'    "Traducciones que'}</span>
              <span>{'    simplemente funcionan."'}</span>
              <span className='cf-dl-dim'>{'}'}</span>
            </div>
          </div>

          {/* State the trade-off; do not claim both. */}
          <div className='cf-dl-fork'>
            <div>
              <code className='tc-chip'>bundled JSON</code>
              <span>no CDN request at all · redeploy to update</span>
            </div>
            <div>
              <code className='tc-chip'>CDN</code>
              <span>served from the edge · update live</span>
            </div>
          </div>
        </div>

        {/* ---- cell 3: the URL bar and the ladder ---- */}
        <div className='tc-cell is-short' data-reveal>
          <h3>Locale-prefixed, SEO-ready paths</h3>
          <p>One middleware file gives you detection, prefixes and localized pathnames.</p>

          <div className='cf-dl-urls'>
            <div className='cf-dl-urlbar'>example.com/about</div>
            <div className='cf-dl-urlbar'>
              example.com/<b>es</b>/about
            </div>
            <div className='cf-dl-urlbar'>
              example.com/<b>fr</b>/<em>a-propos</em>
            </div>
          </div>

          <div className='cf-dl-ladder' aria-label='Locale detection order'>
            {LADDER.map((step, i) => (
              <div data-on={step.on} key={step.rung}>
                <span className='cf-dl-ladder-n'>{i + 1}</span>
                <span>{step.rung}</span>
                {step.on ? <span className='cf-dl-ladder-hit'>matched</span> : null}
              </div>
            ))}
          </div>

          <CodeBlock file='middleware.ts' code={MIDDLEWARE} numbers={false} />
        </div>
      </div>
    </section>
  );
}
