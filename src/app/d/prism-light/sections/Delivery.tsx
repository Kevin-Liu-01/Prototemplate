'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowUpRight,
  GitBranch,
  Globe,
  History,
  KeyRound,
  Map,
  Route,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { useRef, type RefObject } from 'react';

import PreviewSurface from '@/app/d/toolchain/diagrams/surface/PreviewSurface';

import EdgeLedger from '../diagrams/delivery/EdgeLedger';
import HotReloadSplit from '../diagrams/delivery/HotReloadSplit';
import OtaPipeline from '../diagrams/delivery/OtaPipeline';
import RoutingLadder from '../diagrams/delivery/RoutingLadder';

import CodeBlock from './code';
import { useQuietReveal } from './reveal';

/* surface.css is the one diagram sheet scoped by ROOT class, not by diagram
   class — the surface components now come from toolchain, so the fork's
   rescoped copy has to stay in the CSS graph explicitly. */
import '../diagrams/surface/surface.css';
import './bento-motion.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

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
   the section's density is content, not chorus. Founder pick: each item is a
   bordered node with a matching lucide icon — functional identification,
   never ornament — wired to a doubled-gauge trunk (bento-motion.css). */
const GROUNDWORK: readonly { icon: LucideIcon; text: string }[] = [
  { icon: Route, text: 'SEO-friendly locale paths, with no configuration' },
  { icon: Map, text: 'hreflang, canonical URLs, and localized sitemaps' },
  { icon: History, text: 'Versioned releases per locale — a rollback is one step' },
  { icon: KeyRound, text: 'Dev keys are browser-safe; API keys never ship to the client' },
  { icon: GitBranch, text: 'Feature branches get their own translations; shared strings are inherited' },
  { icon: ShieldCheck, text: 'SOC 2 Type II, GDPR, ISO 27001' },
];

/** Types `text` into `el` character by character over `duration`s. */
function typeInto(tl: gsap.core.Timeline, el: HTMLElement, text: string, at: number, duration: number): void {
  const cursor = { n: 0 };
  tl.fromTo(
    cursor,
    { n: 0 },
    {
      n: text.length,
      duration,
      ease: 'none',
      immediateRender: false,
      onUpdate: () => {
        el.textContent = text.slice(0, Math.round(cursor.n));
      },
    },
    at,
  );
}

/**
 * Founder pick, adapted to the delivery layout: toolchain's four-across quad
 * runs four artifact loops; this fork renders exactly one of those surfaces —
 * PreviewSurface, in the previews shell — so it carries that one loop. The en
 * pane lands first, the es preview types in after it, and the footer blinks
 * 'not in main' → 'merged'. The loop's t=0 state IS the server-rendered
 * still, every in-between frame is legible, and under prefers-reduced-motion
 * no timeline is ever built — the markup is the final frame.
 */
function usePreviewMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const rootEl = scope.current;
      if (!rootEl) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const host = rootEl.querySelector<HTMLElement>('.tcx-preview');
      if (!host) return;

      const panes = gsap.utils.toArray<HTMLElement>('.tcx-pane', host);
      const foot = host.querySelector<HTMLElement>('.tcx-foot');
      const footState = host.querySelector<HTMLElement>('.tcx-foot em');
      const footNote = host.querySelector<HTMLElement>('.tcx-foot span');
      const en = panes[0];
      const es = panes[1];
      if (!en || !es || !foot || !footState || !footNote) return;
      const esTag = es.querySelector<HTMLElement>('.tcx-pane-tag');
      const esHeading = es.querySelector<HTMLElement>('.tcx-h');
      const esButton = es.querySelector<HTMLElement>('.tcx-btn');
      if (!esTag || !esHeading || !esButton) return;
      const heading = esHeading.textContent ?? '';
      /* Clearing typed text collapses line boxes and pumps the row's layout,
         so the elements that empty out get their settled heights pinned right
         before the loop starts (fonts are in by then). */
      const heightLocks: HTMLElement[] = [es, esHeading];

      const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.1, defaults: { ease: 'power2.out' } });
      /* Neither pane frame ever leaves. The en pane dims like a refresh and
         lands back first; the es pane keeps its tag as a label (only dimmed)
         while its content resets — so every frame still reads as a labeled
         dev window with the preview pending. */
      tl.to([esHeading, esButton], { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, 2.2)
        .to(esTag, { autoAlpha: 0.45, duration: 0.45, ease: 'power2.in' }, 2.2)
        .to(en, { autoAlpha: 0.35, duration: 0.45, ease: 'power2.in' }, 2.2)
        .call(
          () => {
            esHeading.textContent = '';
          },
          [],
          2.68,
        )
        .to(en, { autoAlpha: 1, duration: 0.5 }, 2.8)
        .to(esTag, { autoAlpha: 1, duration: 0.35 }, 3.3)
        .set(esHeading, { autoAlpha: 1, attr: { 'data-tcm-typing': 1 } }, 3.6);
      typeInto(tl, esHeading, heading, 3.65, 1.5);
      tl.set(esHeading, { attr: { 'data-tcm-typing': '' } }, 5.35)
        .fromTo(esButton, { y: 4 }, { autoAlpha: 1, y: 0, duration: 0.45, immediateRender: false }, 5.5)
        /* merge beat: the footer blinks, and the branch state flips */
        .to(foot, { autoAlpha: 0.25, duration: 0.22, ease: 'power1.in' }, 7.3)
        .call(
          () => {
            footState.textContent = 'merged';
            footNote.textContent = 'in main';
          },
          [],
          7.53,
        )
        .to(foot, { autoAlpha: 1, duration: 0.3 }, 7.55)
        .to(foot, { autoAlpha: 0.25, duration: 0.22, ease: 'power1.in' }, 9.9)
        .call(
          () => {
            footState.textContent = 'preview';
            footNote.textContent = 'not in main';
          },
          [],
          10.13,
        )
        .to(foot, { autoAlpha: 1, duration: 0.3 }, 10.15);

      ScrollTrigger.create({
        trigger: host,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          heightLocks.forEach((el) => gsap.set(el, { minHeight: el.offsetHeight }));
          tl.play(0);
        },
      });
    },
    { scope },
  );
}

export default function Delivery() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);
  usePreviewMotion(root);

  return (
    <section className='tc-sec' id='platform' ref={root}>
      <div className='tc-head'>
        <Globe className='tc-head-icon' strokeWidth={1} aria-hidden />
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
              <ArrowUpRight className='tc-ico-arrow' aria-hidden />
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
              <PreviewSurface title='The dev server showing the English page and its Spanish preview, one above the other' />
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

      {/* ---- shell 6: the groundwork, wired as one system ----
          Founder pick: not a floating list. Each item is a small bordered
          node in the bento grammar — hair border, card face, filled corner
          notches — with a matching lucide icon, and every node is rung to a
          doubled-gauge trunk running the group's center, so the six read as
          one connected system. */}
      <div className='tc-row is-one'>
        <div className='tc-cell' data-reveal>
          <div className='tcm-ground'>
            <div>
              <h3>And the parts nobody demos</h3>
              <p>Everything above assumes the unglamorous things already work. They do.</p>
            </div>
            <ul className='tcm-net'>
              {GROUNDWORK.map(({ icon: Icon, text }) => (
                <li className='tcm-node' key={text}>
                  <span className='tcm-node-in'>
                    <Icon className='tcm-node-ico' strokeWidth={1.25} aria-hidden />
                    <span>{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
