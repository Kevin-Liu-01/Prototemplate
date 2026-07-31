'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowUpRight,
  BookMarked,
  Briefcase,
  Eye,
  Hash,
  RadioTower,
  Route,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { useRef, type RefObject } from 'react';

import EdgeGlobe from '@/app/d/toolchain/diagrams/EdgeGlobe';
import PrismaticField from '@/components/shared/PrismaticField';
import LocaleRouting from '@/app/d/toolchain/diagrams/LocaleRouting';
import SdkLedger from '@/app/d/toolchain/diagrams/SdkLedger';
import StatRow from '@/app/d/toolchain/diagrams/StatRow';
import TranslationFlow from '@/app/d/toolchain/diagrams/TranslationFlow';
import ContextResolve from '@/app/d/toolchain/diagrams/lang/ContextResolve';
import ExpansionBars from '@/app/d/toolchain/diagrams/lang/ExpansionBars';
import PluralForms from '@/app/d/toolchain/diagrams/lang/PluralForms';
import RtlMirror from '@/app/d/toolchain/diagrams/lang/RtlMirror';
import ScriptSampler from '@/app/d/toolchain/diagrams/lang/ScriptSampler';
import SentenceWidth from '@/app/d/toolchain/diagrams/lang/SentenceWidth';
import WordMorph from '@/app/d/toolchain/diagrams/lang/WordMorph';
import CustomSurface from '@/app/d/toolchain/diagrams/surface/CustomSurface';
import GlossarySurface from '@/app/d/toolchain/diagrams/surface/GlossarySurface';
import LiveSurface from '@/app/d/toolchain/diagrams/surface/LiveSurface';
import PreviewSurface from '@/app/d/toolchain/diagrams/surface/PreviewSurface';

import { BentoCell } from '@/components/shell/Bento';

import CodeBlock from './code';
import { useQuietReveal } from './reveal';
import './bento-motion.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* Both file buckets, not just the SDK one — the CLI reads the same config for
   loose JSON content, and saying so is also what lets this panel end level with
   the illustration beside it instead of half a card short of it. */
const CONFIG = `{
  "defaultLocale": "en",
  "locales": ["es", "fr", "ja", "de", "zh"],
  "files": {
    "gt": {
      "output": "public/_gt/[locale].json"
    },
    "json": {
      "include": ["content/[locale]/*.json"]
    }
  }
}`;

/* The run the config feeds: one command, one file per configured locale, in
   the CLI's own voice — the same scan count as the hero terminal, the same
   `public/_gt` path the config's `output` template names. 640 = 128 × 5. */
const TRANSLATE_RUN: readonly { tone: 'cmd' | 'dim' | 'out'; key?: string; text: string }[] = [
  { tone: 'cmd', key: '$ ', text: 'npx gt translate' },
  { tone: 'dim', text: '  Scanning src — 128 strings found' },
  { tone: 'out', key: '  Wrote ', text: 'public/_gt/es.json' },
  { tone: 'out', key: '  Wrote ', text: 'public/_gt/fr.json' },
  { tone: 'out', key: '  Wrote ', text: 'public/_gt/ja.json' },
  { tone: 'out', key: '  Wrote ', text: 'public/_gt/de.json' },
  { tone: 'out', key: '  Wrote ', text: 'public/_gt/zh.json' },
  { tone: 'dim', text: '  Done in 12.4s — 640 translations' },
];

/* Founder pick: each groundwork item is a bordered node with a matching
   lucide icon — functional identification, never ornament — and the nodes
   are wired to one another through a doubled-gauge trunk (bento-motion.css). */
const GROUNDWORK: readonly { icon: LucideIcon; text: string }[] = [
  { icon: Route, text: 'SEO-friendly locale paths, with no configuration' },
  { icon: Hash, text: 'ICU plurals, numbers, currencies, and dates' },
  { icon: Eye, text: 'Dev previews before anything reaches production' },
  { icon: RadioTower, text: 'Over-the-air updates without a redeploy' },
  { icon: BookMarked, text: 'Glossaries and per-locale style rules' },
  { icon: ShieldCheck, text: 'SOC 2 Type II, GDPR, ISO 27001' },
];

/* ------------------------------------------------------------------
   Founder pick: the four-across artifacts each run a purposeful loop.
   The timelines live here (the surface components stay presentational
   markup); each loop's t=0 state IS the server-rendered still, every
   in-between frame is legible, and under prefers-reduced-motion no
   timeline is ever built — the markup is the final frame.
   ------------------------------------------------------------------ */

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

function useQuadMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const rootEl = scope.current;
      if (!rootEl) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const quad = rootEl.querySelector<HTMLElement>('.tc-quad');
      if (!quad) return;

      const loops: gsap.core.Timeline[] = [];
      /* Clearing typed text collapses line boxes and pumps the row's
         layout, so the elements that empty out get their settled heights
         pinned right before the loops start (fonts are in by then). */
      const heightLocks: HTMLElement[] = [];

      /* -- Previews: the en pane lands first, the es preview types in
            after it, and the footer blinks 'not in main' → 'merged'. -- */
      (() => {
        const panes = gsap.utils.toArray<HTMLElement>('.tcx-preview .tcx-pane', quad);
        const foot = quad.querySelector<HTMLElement>('.tcx-preview .tcx-foot');
        const footState = quad.querySelector<HTMLElement>('.tcx-preview .tcx-foot em');
        const footNote = quad.querySelector<HTMLElement>('.tcx-preview .tcx-foot span');
        const en = panes[0];
        const es = panes[1];
        if (!en || !es || !foot || !footState || !footNote) return;
        const esTag = es.querySelector<HTMLElement>('.tcx-pane-tag');
        const esHeading = es.querySelector<HTMLElement>('.tcx-h');
        const esButton = es.querySelector<HTMLElement>('.tcx-btn');
        if (!esTag || !esHeading || !esButton) return;
        const heading = esHeading.textContent ?? '';
        heightLocks.push(es, esHeading);

        const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.1, defaults: { ease: 'power2.out' } });
        /* Neither pane frame ever leaves. The en pane dims like a refresh
           and lands back first; the es pane keeps its tag as a label (only
           dimmed) while its content resets — so every frame still reads as
           a labeled dev window with the preview pending. */
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
        loops.push(tl);
      })();

      /* -- Live Translation: the POST card fires, the pt-BR response
            types in while the latency counts up to its measured 38 ms. -- */
      (() => {
        const live = quad.querySelector<HTMLElement>('.tcx-live');
        if (!live) return;
        const req = live.querySelector<HTMLElement>('.tcx-req');
        const hop = live.querySelector<HTMLElement>('.tcx-hop');
        const out = live.querySelector<HTMLElement>('.tcx-out');
        const ms = live.querySelector<HTMLElement>('.tcx-ms');
        const msValue = live.querySelector<HTMLElement>('.tcx-ms b');
        if (!req || !hop || !out || !ms || !msValue) return;
        const response = out.textContent ?? '';
        heightLocks.push(out);

        /* GSAP color tweens need concrete values: read them off the motion
           tokens so even the flashes draw the shell system's colors. */
        const tokens = getComputedStyle(req);
        const flashWhite =
          tokens.getPropertyValue('--tcm-white').trim() || '#ffffff'; /* lint-shell: allow */
        const flashBright =
          tokens.getPropertyValue('--tcm-bright').trim() ||
          'rgba(255, 255, 255, 0.8)'; /* lint-shell: allow */
        const latency = { n: 0 };
        const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 2.6, defaults: { ease: 'power2.out' } });
        tl.to(out, { autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, 2.4)
          .to(ms, { autoAlpha: 0.4, duration: 0.4 }, 2.4)
          .call(
            () => {
              out.textContent = '';
              msValue.textContent = '0 ms';
            },
            [],
            2.85,
          )
          .to(req, { color: flashWhite, duration: 0.28, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 3.0)
          .to(hop, { color: flashBright, duration: 0.3, yoyo: true, repeat: 1 }, 3.35)
          .set(out, { autoAlpha: 1, attr: { 'data-tcm-typing': 1 } }, 3.6);
        typeInto(tl, out, response, 3.65, 1.7);
        tl.fromTo(
          latency,
          { n: 0 },
          {
            n: 38,
            duration: 1.7,
            ease: 'none',
            immediateRender: false,
            onUpdate: () => {
              msValue.textContent = `${Math.round(latency.n)} ms`;
            },
          },
          3.65,
        )
          .set(out, { attr: { 'data-tcm-typing': '' } }, 5.45)
          .to(ms, { autoAlpha: 1, duration: 0.4 }, 5.5);
        loops.push(tl);
      })();

      /* -- Customization: a cursor steps the hook cookie → header →
            fallback; the resolved value lights up. States are data
            attributes; bento-motion.css draws them. -- */
      (() => {
        const lines = gsap.utils.toArray<HTMLElement>('.tcx-custom .tcx-slab > div', quad);
        const cookie = lines[1];
        const header = lines[2];
        const fallback = lines[3];
        if (!cookie || !header || !fallback) return;

        const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.3 });
        tl.set(cookie, { attr: { 'data-tcm-live': 1 } }, 1.7)
          .set(cookie, { attr: { 'data-tcm-live': '', 'data-tcm-done': 1 } }, 2.95)
          .set(header, { attr: { 'data-tcm-live': 1 } }, 2.95)
          .set(header, { attr: { 'data-tcm-live': '', 'data-tcm-done': 1 } }, 4.2)
          .set(fallback, { attr: { 'data-tcm-live': 1 } }, 4.2)
          .set(fallback, { attr: { 'data-tcm-hit': 1 } }, 4.55)
          .set(fallback, { attr: { 'data-tcm-live': '', 'data-tcm-hit': '' } }, 7.1)
          .set([cookie, header], { attr: { 'data-tcm-done': '' } }, 7.1);
        loops.push(tl);
      })();

      /* -- Glossaries: rows stamp in one by one and the corrections
            strike themselves through. -- */
      (() => {
        const gloss = quad.querySelector<HTMLElement>('.tcx-glossary');
        if (!gloss) return;
        const rows = gsap.utils.toArray<HTMLElement>('.tcx-rows li', gloss);
        const strikes = gsap.utils.toArray<HTMLElement>('.tcx-rows s', gloss);
        if (rows.length === 0) return;

        const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 2.9 });
        tl.to(rows, { autoAlpha: 0, duration: 0.32, stagger: 0.04, ease: 'power2.in' }, 2.6);
        if (strikes.length > 0) tl.set(strikes, { '--tcm-strike': '0%' }, 3.1);
        rows.forEach((row, i) => {
          const at = 3.35 + i * 0.5;
          tl.fromTo(
            row,
            { autoAlpha: 0, y: -7, scale: 1.03, transformOrigin: 'left center' },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(2)', immediateRender: false },
            at,
          );
          const strike = row.querySelector<HTMLElement>('s');
          if (strike) tl.to(strike, { '--tcm-strike': '100%', duration: 0.55, ease: 'power1.inOut' }, at + 0.3);
        });
        loops.push(tl);
      })();

      if (loops.length === 0) return;
      ScrollTrigger.create({
        trigger: quad,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          heightLocks.forEach((el) => gsap.set(el, { minHeight: el.offsetHeight }));
          loops.forEach((tl) => tl.play(0));
        },
      });
    },
    { scope },
  );
}

/**
 * CURATION LEDGER — the dark directions' eight-cell feature grid
 * (archive-press/sections/Features.tsx + components/shared/diagrams), audited
 * against this page cell by cell. Decision per diagram:
 *
 *  1. <T> wrap brace          → ADAPT. The real 18-line sample in Frameworks
 *     beats the five-line abstract, but the doubled bracket binding the
 *     wrapped lines was the one thing it said that we did not. Adopted into
 *     CodeBlock (sections/code.tsx) as a thread-gauge bracket in the
 *     sample's own margin, <T> to </T>.
 *  2. Glossary/directives     → ADAPT. Our Vault pin (strikethrough against
 *     the overruled word) beats the dark table's term rows, but its
 *     directives half — per-locale style rules, the formal Sie — existed
 *     here only as a groundwork bullet. Adopted into GlossarySurface below
 *     the entries, behind the group divider.
 *  3. Translation ledger with per-locale deltas → SKIP. SentenceWidth
 *     measures live in the browser, ExpansionBars carries the ranked deltas,
 *     and TranslationFlow fans the real files; the dark five-row ledger is
 *     three of our diagrams compressed into a weaker one.
 *  4. GET /about routing trace + pathConfig → SKIP. LocaleRouting already
 *     shows six real routes with /fr/a-propos lit and the full detection
 *     ladder (which includes Accept-Language). Its pathConfig fragment would
 *     also argue against this cell's own copy — "paths you never configure".
 *  5. Edge-delivery rail with PoP latencies → SKIP. The rebuilt EdgeGlobe
 *     labels five real POPs with measured latencies on the delivery band;
 *     the flat rail carries the same five data on less structure.
 *  6. Source/preview pane pair → ADAPT. The pairing (en source beside es
 *     preview) is the feature's argument and our dev window showed only the
 *     preview half. Adopted into PreviewSurface, inside the window frame.
 *  7. Live-translation bubbles with latency → SKIP. LiveSurface shows the
 *     same round trip with the request line, the measured 38 ms, and the
 *     cache note, on the page's dark panel.
 *  8. gt.config.json → SKIP. This page ships the full file, line for line,
 *     on the inset panel ("One config file"); the dark cell is a fragment.
 *
 * The bento. Every row is a different shell — split, three-across, full-bleed
 * visual, inset panel, stat, plain text — because eight identical cards is the
 * one failure mode this direction cannot survive.
 *
 * Two devices carry the composition. Cells that hold something visual are
 * mounted in the nested frame (`is-framed` + `.tc-card`); cells that are only
 * words stay flat on the page, and that contrast is what keeps the frame from
 * reading as a uniform card grid. Between three specific rows the page stops
 * for a hatched spacer, which is where a subject changes.
 *
 * The language diagrams lead. They show what translation does to a layout,
 * which is the thing an isometric cube cannot say.
 */
export default function Bento() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);
  useQuadMotion(root);

  return (
    <section className='tc-sec' id='platform' ref={root}>
      <div className='tc-head'>
        <Briefcase className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>Everything localization needs.</h2>
        <p data-reveal>
          What translation does to a layout, the libraries you write against, the platform that holds your
          context, and the edge that serves the result — one system.
        </p>
      </div>

      {/* ---- shell 1: the signature diagram, and the data behind it ---- */}
      <div className='tc-row is-lead' data-eq-heads>
        <BentoCell
          cell='is-tall is-framed'
          title='Every locale is a different length'
          sub='One button in four languages, measured by the browser rather than estimated. German runs long, Japanese runs short, and Arabic re-anchors the whole line.'
        >
          <div className='tc-lang is-lead'>
            <SentenceWidth title='The same sentence measured in English, German, Japanese and Arabic' />
          </div>
        </BentoCell>

        <BentoCell
          cell='is-tall is-framed'
          title='Ranked against English'
          sub='A layout that only fits the source string breaks somewhere near the top of this list.'
        >
          <div className='tc-lang'>
            <ExpansionBars title='Text expansion by locale, relative to English' />
          </div>
        </BentoCell>
      </div>

      <div className='tc-hatch' aria-hidden='true' />

      {/* ---- shell 2: split row — ruled copy cell left, mounted object right ---- */}
      <div className='tc-row is-split'>
        {/* founder round: the Code cell is a ruled cell of the sheet — its
            right seam restored at full row height in bento-motion.css */}
        <BentoCell
          cell='is-tall tcm-ruled'
          framed={false}
          title='Code'
          sub='Developer-first libraries for React, Next.js, and more, battle-tested in production apps with millions of users.'
        >
          <ul className='tc-list'>
            <li>
              <code className='tc-chip'>&lt;T&gt;</code> wraps any JSX — nested elements and all
            </li>
            <li>
              <code className='tc-chip'>useGT()</code> returns strings for anything that is not JSX
            </li>
            <li>
              <code className='tc-chip'>&lt;Num&gt;</code> and <code className='tc-chip'>&lt;DateTime&gt;</code>{' '}
              format to the reader&rsquo;s locale
            </li>
          </ul>
          <div className='tc-cell-act'>
            <a className='tc-btn tc-btn-line tc-btn-sm' href='#frameworks'>
              Read the docs
              <ArrowUpRight className='tc-ico-arrow' aria-hidden />
            </a>
          </div>
        </BentoCell>

        <BentoCell cell='is-tall is-framed'>
          <div className='tc-art-center'>
            <SdkLedger title='The four first-party SDKs, each with its runtime and the import you write' />
          </div>
        </BentoCell>
      </div>

      {/* ---- shell 3: three narrow cells, one small visual each ---- */}
      <div className='tc-row is-three' data-eq-heads>
        <BentoCell
          cell='is-short is-framed'
          title='Context'
          sub='One word, two meanings. A context tag decides which translation ships.'
        >
          <div className='tc-lang'>
            <ContextResolve title='Save resolving to speichern or sparen by context' />
          </div>
        </BentoCell>

        <BentoCell
          cell='is-short is-framed'
          title='Terminology'
          sub='One term, six locales, decided once. Per-locale style rules keep the wording identical everywhere it appears.'
        >
          <div className='tc-lang'>
            <WordMorph title='The term Settings printed in six locales' />
          </div>
        </BentoCell>

        <BentoCell
          cell='is-short is-framed'
          title='Routing'
          sub='Automatic detection and locale-based routing, on SEO-friendly paths you never configure.'
        >
          <div className='tc-surface is-plated'>
            <LocaleRouting title='The same page routed for all six configured locales, /fr/a-propos localized, with the detection order beneath' />
          </div>
        </BentoCell>
      </div>

      {/* ---- shell 4: full-bleed visual beside an inset code panel ----
          data-eq-heads is what keeps the Translation plate edge and the
          config panel's first rule on ONE shared line. */}
      <div className='tc-row is-wide-left' data-eq-heads>
        <BentoCell
          cell='is-bleed is-framed'
          headClass='tc-bleed-head'
          title='Translation'
          sub='AI agents that understand your project structure and localize your content in context.'
        >
          <div className='tc-bleed-art'>
            <TranslationFlow title='app/page.tsx fanned into public/_gt/es.json, ja.json and de.json, each holding its three real translations' />
          </div>
        </BentoCell>

        {/* founder round: the COPY-chip code panel is ruled onto the sheet —
            square, 1px, its frame rules run to the cell's edges (bento-motion.css) */}
        {/* the bleed neighbour carries its card padding INSIDE its head, this
            cell outside — 10px off the head height compensates, so the config
            panel's first rule sits exactly on the Translation plate's line */}
        <BentoCell
          cell='is-panel is-framed tcm-ruled-panel'
          title='One config file'
          sub='Locales in, output path out. The CLI and every SDK read the same file.'
          style={{ '--shell-head-h': '102px' } as React.CSSProperties}
        >
          {/* One dark surface, two artifacts: the config, then the run it
              produces — `[locale].json` above resolving to five real files
              below, in the CLI's own voice. */}
          <div className='tc-code-run'>
            <CodeBlock file='gt.config.json' code={CONFIG} numbers={false} />
            <div className='tc-cli'>
              {TRANSLATE_RUN.map((line) => (
                <div className='tc-cli-line' data-tone={line.tone} key={line.text}>
                  {line.key ? <span className='tc-cli-key'>{line.key}</span> : null}
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        </BentoCell>
      </div>

      <div className='tc-hatch' aria-hidden='true' />

      {/* ---- shell 5: stat rows beside a field of scripts, tipped off centre ---- */}
      <div className='tc-row is-tilt'>
        <BentoCell cell='is-framed' title='Built for your next billion users'>
          {/* The heading already says one billion — repeating it as a row
              was saying it twice. Four numbers, none redundant. */}
          <div className='tc-stats is-grid'>
            <StatRow value='118' label='locales, ready today' />
            <StatRow value='6' label='first-party SDKs' />
            <StatRow value='<1s' label='over-the-air updates' />
            <StatRow value='$0' label='to start' />
          </div>
        </BentoCell>

        <BentoCell
          cell='is-framed'
          title='Every writing system'
          sub='Latin, Cyrillic, Greek, Arabic, Devanagari, Han, Hangul, Thai — joined, stacked and bidi-resolved by the browser, with per-script fallbacks in the SDK.'
        >
          <div className='tc-lang'>
            <ScriptSampler title='The word “language” in eight writing systems' />
          </div>
        </BentoCell>
      </div>

      {/* ---- shell 6: delivery as a full-bleed inverse band, the field behind it ---- */}
      <div className='tc-delivery-band'>
        <PrismaticField
          className='tc-delivery-field'
          preset='1'
          speed={0.4}
          params={{ exposureScale: 2400 }}
        />
        <div className='tc-delivery-in'>
          <div className='tc-delivery-art' data-reveal>
            <div className='tc-art-globe'>
              <EdgeGlobe title='A meridian cage with three points of presence and one serving 12 ms away' />
            </div>
          </div>

          <div className='tc-delivery-copy' data-reveal>
            <h3>Delivery</h3>
            <p>
              A global, low-latency translation CDN. Push over-the-air updates without redeploying your app.
            </p>
            <ul className='tc-list'>
              <li>Fix a translation and ship it without touching your build</li>
              <li>Served from the edge, close to whoever asked for it</li>
              <li>Versioned per locale, so a rollback is one step</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ---- shell 7: a pair leaning left-light, both cells grammar ---- */}
      <div className='tc-row is-grammar' data-eq-heads>
        <BentoCell
          cell='is-framed'
          title='Counting is not concatenation'
          sub='English has two plural forms, Polish four, Japanese one. GT ships ICU plurals, so the number picks the form instead of the string.'
        >
          <div className='tc-lang'>
            <PluralForms accent={false} title='One count under English, Polish and Japanese plural rules' />
          </div>
        </BentoCell>

        <BentoCell
          cell='is-framed'
          title='Both directions, one markup'
          sub={
            <>
              Set <code className='tc-chip'>dir</code> and the browser mirrors rows, alignment and
              controls. Nothing about the panel is written twice.
            </>
          }
        >
          <div className='tc-lang'>
            <RtlMirror accent={false} title='The same panel rendered left-to-right and right-to-left' />
          </div>
        </BentoCell>
      </div>

      <div className='tc-hatch' aria-hidden='true' />

      {/* ---- shell 8: one ruled band, four columns ----
          These four used to be four mounted cells of identical shape in a rank,
          which is the one thing this direction cannot survive: the row read as a
          card grid and the frame stopped meaning anything. One mount now, divided
          by the page's own hairline — a spec table rather than four cards, and one
          border level shallower for the panels inside it. Each panel still carries
          a real artifact rather than a drawing: the dev window, one round trip,
          the hook you write, and a glossary entry with the translation it
          overrules. Founder pick: each artifact runs its feature as a slow loop
          (useQuadMotion above) — the es preview typing in, the request round
          trip, the stepping detection cursor, the stamping glossary rows. */}
      <div className='tc-row is-one'>
        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <div className='tc-quad'>
              <div>
                <h3>Previews</h3>
                <p>Preview translations in development before they go live.</p>
                <div className='tc-surface'>
                  <PreviewSurface title='The dev server showing the English page and its Spanish preview, one above the other' />
                </div>
              </div>

              <div>
                <h3>Live Translation</h3>
                <p>Translate user-generated content on demand, in full context.</p>
                <div className='tc-surface'>
                  <LiveSurface title='A user comment translated into Brazilian Portuguese in 38 milliseconds' />
                </div>
              </div>

              <div>
                <h3>Customization</h3>
                <p>Bring your own detection function, components and formats.</p>
                <div className='tc-surface'>
                  <CustomSurface title='A custom getLocale function reading a cookie, then a header' />
                </div>
              </div>

              <div>
                <h3>Glossaries</h3>
                <p>Pin a term, set per-locale style rules. Both hold on every later run.</p>
                <div className='tc-surface'>
                  <GlossarySurface title='The term Vault pinned across German, Spanish and Japanese, with the German formality directive beneath' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- shell 9: the groundwork, wired as one system ----
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
