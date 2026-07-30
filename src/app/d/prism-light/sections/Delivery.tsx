'use client';

import { useRef } from 'react';

import EdgeLedger from '../diagrams/delivery/EdgeLedger';
import HotReloadSplit from '../diagrams/delivery/HotReloadSplit';
import OtaPipeline from '../diagrams/delivery/OtaPipeline';
import RoutingLadder from '../diagrams/delivery/RoutingLadder';
import PreviewSurface from '../diagrams/surface/PreviewSurface';

import CodeBlock from './code';
import { useQuietReveal } from './reveal';

/**
 * The delivery-led remix of the product sections (MODULES_PLAN M11, with the
 * bundled-JSON honesty from the feature inventory). The frame is the base
 * toolchain's — ruled rows, nested mats, flat copy cells — but every shell
 * here covers what happens AFTER translation: developing in another language,
 * fixing strings without a deploy, routing locales, and serving the result
 * from the edge.
 */

/* The import is broken the way prettier would break it at this measure — the
   panel shows every character of every line, clipped nowhere. */
const MIDDLEWARE = `import {
  createNextMiddleware,
} from 'gt-next/middleware';

export default createNextMiddleware({
  prefixDefaultLocale: true,
  pathConfig: {
    '/about': { fr: '/a-propos' },
    '/products': { zh: '/产品' },
    '/product/[id]': { zh: '/产品/[id]' },
  },
});`;

const LOAD_TRANSLATIONS = `export default async function loadTranslations(
  locale: string
) {
  const t = await import(\`./_gt/\${locale}.json\`);
  return t.default;
}`;

/* Each claim in this closing grid appears here and nowhere else on the page —
   the section's density is content, not chorus. */
const GROUNDWORK = [
  'SEO-friendly locale paths, with no configuration',
  'hreflang, canonical URLs, and localized sitemaps',
  'Versioned releases per locale — a rollback is one step',
  'Dev keys are browser-safe; API keys never ship to the client',
  'Feature branches get their own translations; shared strings are inherited, not re-billed',
  'SOC 2 Type II, GDPR, ISO 27001',
];

export default function Delivery() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='platform' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>From your editor to the edge.</h2>
        <p data-reveal>
          Develop in any language with hot reload, fix a string without a deploy, route every locale on
          SEO-ready paths, and serve the result from a global CDN — one system, honest about its
          trade-offs.
        </p>
      </div>

      {/* ---- shell 1: the hot-reload split, and the two keys ---- */}
      <div className='tc-row is-lead'>
        <div className='tc-cell is-tall is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Develop in Japanese</h3>
            <p>
              With a <code className='tc-chip'>gtx-dev-</code> key, translations regenerate as you type.
              No reload.
            </p>
            <HotReloadSplit title='An editor mid-keystroke beside a browser locked to Japanese, with the dev and production key paths labelled beneath' />
          </div>
        </div>

        <div className='tc-cell is-tall' data-reveal>
          <h3>Two keys, two promises</h3>
          <p>
            The key that translates on demand is not the key that ships. Preview is generated as you
            work; production is pre-generated and static.
          </p>
          <ul className='tc-list'>
            <li>
              <code className='tc-chip'>gtx-dev-</code> browser-safe, preview only
            </li>
            <li>
              <code className='tc-chip'>gtx-api-</code> never in browser code
            </li>
            <li>Preview translations in development before they go live</li>
          </ul>
          <div className='tc-cell-act'>
            <a className='tc-btn tc-btn-line tc-btn-sm' href='#frameworks'>
              Read the docs
            </a>
          </div>
        </div>
      </div>

      <div className='tc-hatch' aria-hidden='true' />

      {/* ---- shell 2: the greyed-out deploy ---- */}
      <div className='tc-row is-split'>
        <div className='tc-cell is-tall' data-reveal>
          <h3>Fix it without a deploy</h3>
          <p>
            Edit a string in the editor and the CDN serves it. Or bundle the JSON and never call us at
            all.
          </p>
          <ul className='tc-list'>
            <li>Fix a translation and ship it without touching your build</li>
            <li>Push over-the-air updates without redeploying your app</li>
            <li>The trade-off is stated, not hidden: bundled means redeploy</li>
          </ul>
        </div>

        <div className='tc-cell is-tall is-framed' data-reveal>
          <div className='tc-card'>
            <OtaPipeline title='A Spanish string saved in the editor, the build and deploy stages struck out, and a running page updated in place' />
          </div>
        </div>
      </div>

      {/* ---- shell 3: the URL bar and the ladder, beside the middleware ---- */}
      <div className='tc-row is-wide-left'>
        <div className='tc-cell is-tall is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Locale-prefixed, SEO-ready paths</h3>
            <p>
              The same page, three addresses — and the French one translates the <em>pathname</em>, not
              just the page.
            </p>
            <RoutingLadder title='Three URL bars ending in the localized /fr/a-propos, beside the four-rung detection ladder with URL locale winning' />
          </div>
        </div>

        <div className='tc-cell is-panel is-framed' data-reveal>
          <div className='tc-card'>
            <h3>One middleware file</h3>
            <p>Detection, prefixes, and localized pathnames — nothing else to configure.</p>
            <CodeBlock file='middleware.ts' code={MIDDLEWARE} />
          </div>
        </div>
      </div>

      <div className='tc-hatch' aria-hidden='true' />

      {/* ---- shell 4: the edge at volume ----
           The hero already stated the topology (POPs, anycast, per-locale
           versions); this cell escalates instead of restating — the request
           log a few seconds after the save above, with es already on v215. */}
      <div className='tc-row is-wide-right is-reverse'>
        <div className='tc-cell is-tall is-framed is-night' data-reveal>
          <div className='tc-card'>
            <EdgeLedger title='Seven edge requests across five points of presence and six locales, every one a cache hit, with es already serving version 215' />
            <p className='tc-night-note'>es is on v215 — the string saved two shells up, already serving from iad</p>
          </div>
        </div>

        <div className='tc-cell is-tall' data-reveal>
          <h3>Served from the edge</h3>
          <p>
            A global, low-latency translation CDN. Whoever asks, the answer comes from the point of
            presence closest to them.
          </p>
          <ul className='tc-list'>
            <li>
              Publish with <code className='tc-chip'>npx gt translate --publish</code>
            </li>
            <li>One switch in Project settings: serve translations from a global CDN</li>
            <li>Runs on Cloudflare Workers at every point of presence</li>
          </ul>
        </div>
      </div>

      {/* ---- shell 5: previews, and the path that skips us ---- */}
      <div className='tc-row is-even'>
        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Previews</h3>
            <p>Preview translations in development before they go live. Catch issues early.</p>
            <div className='tc-surface'>
              <PreviewSurface title='The dev server showing the Spanish build before it ships' />
            </div>
          </div>
        </div>

        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Or bundle the JSON</h3>
            <p>
              Point <code className='tc-chip'>loadTranslations</code> at bundled files and no CDN request
              is made at all.
            </p>
            <div className='tc-cell-code'>
              <CodeBlock file='loadTranslations.ts' code={LOAD_TRANSLATIONS} numbers={false} />
            </div>
          </div>
        </div>
      </div>

      {/* ---- shell 6: no illustration at all ---- */}
      <div className='tc-row is-one'>
        <div className='tc-cell' data-reveal>
          <div className='tc-plain'>
            <div>
              <h3>And the parts nobody demos</h3>
              <p>Everything above assumes the unglamorous things already work. They do.</p>
            </div>
            <ul>
              {GROUNDWORK.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
