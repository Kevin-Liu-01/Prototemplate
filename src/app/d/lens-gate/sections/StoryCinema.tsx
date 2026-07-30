'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ReactNode } from 'react';
import { useRef } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

import { tokenize } from './code';

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin);

/**
 * Story, second telling — the two-box cut.
 *
 * One pinned take, two surfaces, nothing else. LEFT: the demo website —
 * five hairline-separated sections (nav, hero, card, form, legal line) with
 * real strings — where every beat's change plays out. RIGHT: exactly three
 * things — a quiet beat counter in the top right, the beat's one sentence
 * centered in display type, and a single small artifact under it (the code
 * snippet, the generated JSON, the webhook payload, the diff hunk, the PR).
 * Where a beat ties the two sides together, the connector is a doubled
 * orthogonal trace at constant gauge — a circuit run, not string art.
 * Captions swap atomically, panels arrive whole, and the dark surface spends
 * its one material moment under the page while the translation sweeps it.
 */

/* ----------------------------------------------------------------
   content — every string is the demo site's or the product's own
   ---------------------------------------------------------------- */

const CAPS = [
  'The page you already wrote.',
  'GT knows your context.',
  'In the voice you asked for.',
  'GT does your translating.',
  'Around any component.',
  'With your review.',
  'Code is pushed — Locadex scans.',
  'It edits, then translates in context.',
  'It opens the PR. Merged — live.',
] as const;

const SRC_MIN = [
  'export default function Page() {',
  '  return (',
  '    <main>',
  '      <h1>Hello, world!</h1>',
  '      <p>{new Date().toLocaleDateString()}</p>',
  '      <button>Get started</button>',
  '    </main>',
  '  );',
  '}',
] as const;

const CODE_CTX = [
  '<T context="Playful, upbeat marketing tone">',
  '  <h3>Translation that just works.</h3>',
  '</T>',
] as const;

const CODE_T = [
  '<T>',
  '  <button className="cta">',
  '    Get started',
  '  </button>',
  '</T>',
] as const;

const GEN_ES = [
  '"Hello, world!": "¡Hola, mundo!",',
  '"Get started": "Comenzar ahora",',
  '"Email address": "Correo electrónico",',
] as const;

type DiffLine = { t: string; m?: 'add' | 'del' };

const DIFF_MIN: readonly DiffLine[] = [
  { t: "import { T, DateTime } from 'gt-next';", m: 'add' },
  { t: '<main>' },
  { t: '  <T>', m: 'add' },
  { t: '    <h1>Hello, world!</h1>' },
  { t: '    <p>{new Date().toLocaleDateString()}</p>', m: 'del' },
  { t: '    <p><DateTime>{new Date()}</DateTime></p>', m: 'add' },
  { t: '  </T>', m: 'add' },
  { t: '</main>' },
] as const;

/* ----------------------------------------------------------------
   small render helpers
   ---------------------------------------------------------------- */

function Tok({ text }: { text: string }) {
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

type SwProps = {
  hop: string;
  en: string;
  es: string;
  /** Which dimension re-measures when the language swaps. */
  mode?: 'w' | 'h';
};

/** A translatable node: both languages in one box, sequential-faded and
    re-measured by the timeline so the DOM visibly resizes. */
function Sw({ hop, en, es, mode = 'w' }: SwProps) {
  return (
    <span className='tc-cinema-swap' data-swap data-hop={hop} data-mode={mode}>
      <span className='tc-cinema-en'>{en}</span>
      <span className='tc-cinema-es' lang='es'>
        {es}
      </span>
    </span>
  );
}

/** The scan's finding chip — a small square that pops beside a flagged node. */
function Flag({ n }: { n: string }) {
  return (
    <i className='tc-cinema-flag' data-flag={n} aria-hidden>
      !
    </i>
  );
}

/** A ghost wrapper glyph the edit beat draws around a flagged node —
    zero-width anchor, so the site never reserves space for it. `lift`
    raises a wide opener above its node instead of past the panel edge. */
function Wrap({ n, t, side, lift }: { n: string; t: string; side: 'open' | 'close'; lift?: boolean }) {
  return (
    <i className={`tc-cinema-wrapmark is-${side}${lift ? ' is-lift' : ''}`} data-wrap={n} aria-hidden>
      <span>{t}</span>
    </i>
  );
}

/** The right panel's one artifact: a labelled block of mono lines. */
function ArtCode({ file, lines }: { file: string; lines: readonly string[] }) {
  return (
    <div className='tc-cinema-art' data-art>
      <div className='tc-cinema-art-line is-dim'>
        <code>{file}</code>
      </div>
      {lines.map((line, i) => (
        <div className='tc-cinema-art-line' key={i}>
          <Tok text={line} />
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------
   the nine artifacts — one per beat, nothing more
   ---------------------------------------------------------------- */

const ARTS: readonly ReactNode[] = [
  /* 0 · write */
  <ArtCode file='app/page.tsx' lines={SRC_MIN} key='a0' />,

  /* 1 · context */
  <ArtCode file='app/components/Tagline.tsx' lines={CODE_CTX} key='a1' />,

  /* 2 · voice — same string, two prompts */
  <div className='tc-cinema-art' data-art key='a2'>
    <div className='tc-cinema-art-line is-dim'>
      <code>card.tagline · es</code>
    </div>
    <div className='tc-cinema-arow is-dim'>
      <span>no context</span>
      <code lang='es'>Traducción que funciona.</code>
    </div>
    <div className='tc-cinema-arow'>
      <span>with context</span>
      <code lang='es'>Traducciones que simplemente funcionan.</code>
    </div>
  </div>,

  /* 3 · translate — the generated file */
  <div className='tc-cinema-art' data-art key='a3'>
    <div className='tc-cinema-art-line is-dim'>
      <code>public/_gt/es.json</code>
    </div>
    {GEN_ES.map((line, i) => (
      <div className='tc-cinema-art-line' key={i}>
        <Tok text={line} />
      </div>
    ))}
    <div className='tc-cinema-art-line is-dim'>
      <code>42 strings · 5 locales · 3.8 s</code>
    </div>
  </div>,

  /* 4 · component */
  <ArtCode file='app/components/Cta.tsx' lines={CODE_T} key='a4' />,

  /* 5 · review — the webhook payload */
  <div className='tc-cinema-art' data-art key='a5'>
    <div className='tc-cinema-art-line is-dim'>
      <code>POST · hooks.example.com/review</code>
    </div>
    <div className='tc-cinema-art-line'>
      <Tok text='{ "key": "legal.tos", "locale": "es",' />
    </div>
    <div className='tc-cinema-art-line'>
      <Tok text='  "status": "needs_approval" }' />
    </div>
    <div className='tc-cinema-art-line is-bright' data-approve>
      <code>approved — shipped to /es</code>
    </div>
  </div>,

  /* 6 · scan — the push transcript */
  <div className='tc-cinema-art' data-art key='a6'>
    <div className='tc-cinema-art-line'>
      <code>$ git push origin main · e4f21c9</code>
    </div>
    <div className='tc-cinema-art-line'>
      <code>locadex · scan app/ · 11 files · 412 ms</code>
    </div>
    <div className='tc-cinema-art-line is-bright'>
      <code>found 3 unwrapped strings</code>
    </div>
    <div className='tc-cinema-art-line is-dim'>
      <code>app/page.tsx · L4 · L5 · L16</code>
    </div>
  </div>,

  /* 7 · edit — the diff hunk */
  <div className='tc-cinema-art is-diff' data-art key='a7'>
    <div className='tc-cinema-art-line is-dim'>
      <span className='tc-cinema-art-sign' />
      <code>@@ -1,19 +1,24 @@ app/page.tsx</code>
    </div>
    {DIFF_MIN.map((line, i) => (
      <div className={`tc-cinema-art-line${line.m ? ` is-${line.m}` : ''}`} key={i}>
        <span className='tc-cinema-art-sign'>
          {line.m === 'add' ? '+' : line.m === 'del' ? '−' : ''}
        </span>
        {line.m === 'del' ? <code>{line.t}</code> : <Tok text={line.t} />}
      </div>
    ))}
  </div>,

  /* 8 · the PR */
  <div className='tc-cinema-art' data-art key='a8'>
    <div className='tc-cinema-art-line is-dim'>
      <code>#218 · locadex/i18n → main</code>
    </div>
    <div className='tc-cinema-art-line'>
      <code>Translate app/page.tsx into 6 locales</code>
    </div>
    <div className='tc-cinema-art-line'>
      <code>4 files · +38 −6 · checks passed</code>
    </div>
    <div className='tc-cinema-art-line is-bright' data-merged>
      <code>Merged — live in 6 locales</code>
    </div>
  </div>,
] as const;

/* ----------------------------------------------------------------
   geometry
   ---------------------------------------------------------------- */

type Box = { x: number; y: number; enW: number; enH: number; esW: number; esH: number };

/** Layout-space offset of `el` inside `root`, immune to transforms. */
function getLocal(el: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

/* ----------------------------------------------------------------
   the section
   ---------------------------------------------------------------- */

export default function StoryCinema() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!root.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const rootEl = root.current;
      const q = gsap.utils.selector(rootEl);
      const one = <T extends Element>(sel: string) => rootEl.querySelector<T>(sel);

      const take = one<HTMLElement>('[data-stage]');
      const demo = one<HTMLElement>('[data-page]');
      const beat = one<HTMLElement>('[data-beatbox]');
      const hilite = one<HTMLElement>('[data-hilite]');
      const scan = one<HTMLElement>('[data-scanline]');
      const field = one<HTMLElement>('[data-field]');
      if (!take || !demo || !beat || !hilite || !scan) return;

      const takeEl = take;
      const demoEl = demo;
      const beatEl = beat;

      const slides = q('[data-slide]') as HTMLElement[];
      const pns = q('[data-pn]') as HTMLElement[];
      const dashes = q('[data-dash]') as HTMLElement[];
      const swaps = q('[data-swap]') as HTMLElement[];
      const flags = q('[data-flag]') as HTMLElement[];
      const wraps = q('[data-wrap]') as HTMLElement[];
      const wCtx = q("[data-wire='ctx']") as unknown as SVGPathElement[];
      const wRev = q("[data-wire='rev']") as unknown as SVGPathElement[];

      const bySel = (sel: string) => one<HTMLElement>(sel);
      const swapOf = (hop: string) => bySel(`[data-swap][data-hop='${hop}']`);

      /* ---------- geometry, re-measured on every ScrollTrigger refresh ---------- */
      const boxes = new Map<HTMLElement, Box>();

      /** One doubled orthogonal trace: node edge → vertical run at the panel
          seam → into the artifact. Two parallel 1px lines, 3px gap, square
          elbows — the thread pair drawn as a circuit run. */
      const wire = (pair: SVGPathElement[], src: HTMLElement | null, art: HTMLElement | null) => {
        if (!src || !art || window.innerWidth < 900 || src.offsetWidth === 0) {
          pair.forEach((p) => p.setAttribute('d', ''));
          return;
        }
        const s = getLocal(src, takeEl);
        const x1 = Math.round(s.x + src.offsetWidth + 12);
        const y1 = Math.round(s.y + src.offsetHeight / 2);
        const a = getLocal(art, takeEl);
        const x2 = Math.round(a.x - 12);
        const y2 = Math.round(a.y + art.offsetHeight / 2);
        const xm = Math.round(getLocal(beatEl, takeEl).x - 16);
        const sv = y2 >= y1 ? 1 : -1;
        pair.forEach((p, i) => {
          const o = i === 0 ? 2 : -2;
          p.setAttribute(
            'd',
            `M${x1},${y1 - o} L${xm + o * sv},${y1 - o} L${xm + o * sv},${y2 - o} L${x2},${y2 - o}`
          );
        });
      };

      function positions() {
        for (const el of swaps) {
          const ens = Array.from(el.querySelectorAll<HTMLElement>('.tc-cinema-en'));
          const ess = Array.from(el.querySelectorAll<HTMLElement>('.tc-cinema-es'));
          const w = el.style.width;
          const h = el.style.height;
          el.style.width = '';
          el.style.height = '';
          const enW = el.offsetWidth;
          const enH = el.offsetHeight;
          ens.forEach((n) => (n.style.display = 'none'));
          ess.forEach((n) => {
            n.style.position = 'static';
            n.style.opacity = '1';
          });
          const esW = el.offsetWidth;
          const esH = el.offsetHeight;
          ens.forEach((n) => (n.style.display = ''));
          ess.forEach((n) => {
            n.style.position = '';
            n.style.opacity = '';
          });
          const local = getLocal(el, demoEl);
          boxes.set(el, { x: local.x, y: local.y, enW, enH, esW, esH });
          el.style.width = w;
          el.style.height = h;
        }

        wire(wCtx, bySel("[data-node='tagline']"), bySel("[data-slide='1'] [data-art]"));
        wire(wRev, bySel("[data-node='legal']"), bySel("[data-slide='5'] [data-art]"));
      }

      positions();
      ScrollTrigger.addEventListener('refreshInit', positions);

      /* ---------- initial states ---------- */
      gsap.set(slides.slice(1), { autoAlpha: 0 });
      gsap.set(pns.slice(1), { autoAlpha: 0 });
      gsap.set(hilite, { autoAlpha: 0 });
      gsap.set([...wCtx, ...wRev], { drawSVG: '0% 0%', autoAlpha: 0 });
      gsap.set(scan, { autoAlpha: 0 });
      gsap.set(flags, { autoAlpha: 0, scale: 0.4, transformOrigin: '50% 50%' });
      gsap.set(wraps, { autoAlpha: 0 });
      gsap.set('[data-approve]', { autoAlpha: 0 });
      gsap.set('[data-merged]', { autoAlpha: 0 });
      if (field) gsap.set(field, { autoAlpha: 0 });

      const isMobile = () => window.innerWidth < 900;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: take,
          start: 'top 58px',
          end: () => `+=${isMobile() ? 4200 : 5400}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        defaults: { ease: 'none' },
      });

      type Vars = gsap.TweenVars;
      const ft = (tgt: gsap.TweenTarget, from: Vars, to: Vars, pos: number) =>
        tl.fromTo(tgt, from, { ...to, immediateRender: false }, pos);

      /* Beat swaps are atomic sets at ONE timeline position — hide-prev is
         inserted before show-next at the same t, so no scrub position ever
         shows two slides superimposed or (worse) neither. */
      const cap = (i: number, t: number) => {
        const prevSlide = slides[i - 1];
        const nextSlide = slides[i];
        if (prevSlide) tl.set(prevSlide, { autoAlpha: 0 }, t);
        if (nextSlide) tl.set(nextSlide, { autoAlpha: 1 }, t);
        const prevPn = pns[i - 1];
        const nextPn = pns[i];
        if (prevPn) tl.set(prevPn, { autoAlpha: 0 }, t);
        if (nextPn) tl.set(nextPn, { autoAlpha: 1 }, t);
        const prevDash = dashes[i - 1];
        const nextDash = dashes[i];
        if (prevDash) tl.set(prevDash, { attr: { 'data-st': 'done' } }, t);
        if (nextDash) tl.set(nextDash, { attr: { 'data-st': 'on' } }, t);
      };

      /* Language swaps: sequential fades (never double-exposed) around a
         measured re-size, so the layout is seen absorbing the new length. */
      const swap = (el: HTMLElement | null, t: number) => {
        if (!el) return;
        const mode = el.dataset.mode === 'h' ? 'h' : 'w';
        const b = () => boxes.get(el);
        const ens = Array.from(el.querySelectorAll<HTMLElement>('.tc-cinema-en'));
        const ess = Array.from(el.querySelectorAll<HTMLElement>('.tc-cinema-es'));
        tl.to(ens, { opacity: 0, duration: 0.26 }, t);
        ft(ess, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t + 0.3);
        if (mode === 'w') {
          ft(
            el,
            { width: () => b()?.enW ?? 0 },
            { width: () => b()?.esW ?? 0, duration: 0.55, ease: 'power3.inOut' },
            t
          );
        } else {
          ft(
            el,
            { height: () => b()?.enH ?? 0 },
            { height: () => b()?.esH ?? 0, duration: 0.55, ease: 'power3.inOut' },
            t
          );
        }
      };

      /* The ring lands on a node, the string swaps, the ring re-measures.
         A node hidden at this breakpoint keeps the ring dark. */
      const visit = (hop: string, t: number) => {
        const el = swapOf(hop);
        if (!el) return;
        const b = () => boxes.get(el);
        tl.set(
          hilite,
          {
            autoAlpha: () => ((b()?.enW ?? 0) > 0 ? 1 : 0),
            left: () => (b()?.x ?? 0) - 5,
            top: () => (b()?.y ?? 0) - 4,
            width: () => (b()?.enW ?? 0) + 10,
            height: () => (b()?.enH ?? 0) + 8,
          },
          t
        );
        swap(el, t + 0.3);
        ft(
          hilite,
          { width: () => (b()?.enW ?? 0) + 10, height: () => (b()?.enH ?? 0) + 8 },
          {
            width: () => (b()?.esW ?? 0) + 10,
            height: () => (b()?.esH ?? 0) + 8,
            duration: 0.55,
            ease: 'power3.inOut',
          },
          t + 0.3
        );
      };

      /** Frame a non-swap element (the card, the button, the legal line). */
      const frame = (sel: string, t: number, pad = 6) => {
        const el = bySel(sel);
        if (!el) return;
        const p = () => getLocal(el, demoEl);
        ft(
          hilite,
          { autoAlpha: 0 },
          { autoAlpha: () => (el.offsetWidth > 0 ? 1 : 0), duration: 0.35 },
          t
        );
        tl.set(
          hilite,
          {
            left: () => p().x - pad,
            top: () => p().y - pad,
            width: () => Math.max(el.offsetWidth, el.scrollWidth) + pad * 2,
            height: () => Math.max(el.offsetHeight, el.scrollHeight) + pad * 2,
          },
          t
        );
      };

      /* ================= SETUP · write (0–8) ================= */
      ft(demoEl, { y: 26, autoAlpha: 0.55 }, { y: 0, autoAlpha: 1, duration: 2.4 }, 0);

      /* ================= BEAT 1 · context (8–18) ================= */
      cap(1, 8);
      ft(
        wCtx,
        { autoAlpha: 0, drawSVG: '0% 0%' },
        { autoAlpha: 1, drawSVG: '0% 100%', duration: 1.6 },
        8.5
      );
      frame("[data-node='tagline']", 8.8, 7);
      tl.to(wCtx, { autoAlpha: 0, duration: 0.6 }, 16.9);
      tl.to(hilite, { autoAlpha: 0, duration: 0.4 }, 17.3);

      /* ================= BEAT 2 · voice (18–30) ================= */
      cap(2, 18);
      visit('tag', 19.4);
      tl.to(hilite, { autoAlpha: 0, duration: 0.4 }, 28.8);

      /* ================= BEAT 3 · translate in place (30–48) ================= */
      cap(3, 30);
      if (field) ft(field, { autoAlpha: 0 }, { autoAlpha: 0.55, duration: 2.4 }, 30.3);
      visit('nav1', 30.9);
      visit('nav2', 32.1);
      visit('nav3', 33.3);
      visit('h1', 34.7);
      visit('date', 36.1);
      visit('body', 37.6);
      visit('form', 39.8);
      if (field) tl.to(field, { autoAlpha: 0.18, duration: 1.8 }, 45.6);
      tl.to(hilite, { autoAlpha: 0, duration: 0.4 }, 46.9);

      /* ================= BEAT 4 · around any component (48–56) ================= */
      cap(4, 48);
      frame('[data-btn]', 48.7, 7);
      swap(swapOf('cta'), 50.3);
      ft(
        hilite,
        { width: () => (boxes.get(swapOf('cta') ?? demoEl)?.enW ?? 0) + 46 },
        {
          width: () => (boxes.get(swapOf('cta') ?? demoEl)?.esW ?? 0) + 46,
          duration: 0.55,
          ease: 'power3.inOut',
        },
        50.3
      );
      tl.to(hilite, { autoAlpha: 0, duration: 0.35 }, 55);

      /* ================= BEAT 5 · review (56–66) ================= */
      cap(5, 56);
      ft(
        wRev,
        { autoAlpha: 0, drawSVG: '0% 0%' },
        { autoAlpha: 1, drawSVG: '0% 100%', duration: 1.5 },
        56.5
      );
      frame("[data-node='legal']", 56.8, 5);
      ft('[data-approve]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 60.8);
      swap(swapOf('legal'), 62);
      tl.to(wRev, { autoAlpha: 0, duration: 0.6 }, 64.6);
      tl.to(hilite, { autoAlpha: 0, duration: 0.4 }, 65.2);

      /* ================= BEAT 6 · pushed, scanned (66–78) ================= */
      cap(6, 66);
      ft(scan, { autoAlpha: 0, y: 0 }, { autoAlpha: 1, y: 14, duration: 0.4 }, 66.6);
      tl.to(scan, { y: () => demoEl.clientHeight - 52, duration: 6.4 }, 67);
      tl.to(scan, { autoAlpha: 0, duration: 0.5 }, 73.6);
      ft("[data-flag='h1']", { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.35 }, 68.2);
      ft("[data-flag='date']", { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.35 }, 69.3);
      ft("[data-flag='cta']", { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.35 }, 71.6);

      /* ================= BEAT 7 · edit + translate (78–88) ================= */
      cap(7, 78);
      const edits: readonly { n: string; t: number }[] = [
        { n: 'h1', t: 78.8 },
        { n: 'date', t: 80.6 },
        { n: 'cta', t: 82.4 },
      ];
      for (const e of edits) {
        tl.to(`[data-flag='${e.n}']`, { autoAlpha: 0, duration: 0.3 }, e.t);
        ft(
          `[data-wrap='${e.n}']`,
          { autoAlpha: 0, x: 5 },
          { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.1 },
          e.t + 0.1
        );
      }

      /* ================= BEAT 8 · the PR, merged (88–100) ================= */
      cap(8, 88);
      ft('[data-merged]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 90.8);
      if (field) tl.to(field, { autoAlpha: 0.8, duration: 2.6 }, 90.2);
      tl.to({}, { duration: 0.4 }, 99.6);

      return () => {
        ScrollTrigger.removeEventListener('refreshInit', positions);
      };
    },
    { scope: root }
  );

  return (
    <section className='tc-cinema' id='story-cinema' ref={root}>
      <div className='tc-cinema-head'>
        <h2>The pipeline again — in one take.</h2>
        <p>
          The same nine beats as a single pinned shot: the demo site on the left translating in
          place, and one beat at a time on the right — what is happening, and the artifact that
          proves it. Scroll to scrub the run — every frame is a still.
        </p>
      </div>

      <div className='tc-cinema-take' data-stage>
        {/* ============ the web ============ */}
        <div className='tc-cinema-web'>
          {/* The dark family's one moment of material richness: the prismatic
              field under the page, dark until the translation sweep, spent
              fully when the merged site returns. */}
          <div className='tc-cinema-light' data-field aria-hidden>
            <PrismaticField className='tc-cinema-light-canvas' preset='1' speed={0.5} params={{ exposureScale: 2300 }} />
          </div>

          <div className='tc-cinema-demo' data-page>
            <div className='tc-cinema-drow is-nav'>
              <b className='tc-cinema-dbrand'>Example App</b>
              <span className='tc-cinema-dnav'>
                <Sw hop='nav1' en='Docs' es='Documentación' />
                <Sw hop='nav2' en='Pricing' es='Precios' />
                <Sw hop='nav3' en='Contact' es='Contacto' />
              </span>
            </div>

            <div className='tc-cinema-drow is-hero'>
              <h3 className='tc-cinema-dh1'>
                <Wrap n='h1' t='<T>' side='open' />
                <Sw hop='h1' en='Hello, world!' es='¡Hola, mundo!' />
                <Wrap n='h1' t='</T>' side='close' />
                <Flag n='h1' />
              </h3>
              <p className='tc-cinema-ddate'>
                <Wrap n='date' t='<DateTime>' side='open' lift />
                <Sw hop='date' en='July 29, 2026' es='29 de julio de 2026' />
                <Wrap n='date' t='</DateTime>' side='close' />
                <Flag n='date' />
              </p>
              <p className='tc-cinema-dcopy'>
                <Sw
                  hop='body'
                  mode='h'
                  en='General Translation builds full-stack infrastructure for localizing apps, docs, and websites.'
                  es='General Translation construye infraestructura integral para localizar aplicaciones, documentación y sitios web.'
                />
              </p>
              <div className='tc-cinema-dacts'>
                <span className='tc-cinema-dbtn' data-btn>
                  <Sw hop='cta' en='Get started' es='Comenzar ahora' />
                </span>
                <Flag n='cta' />
              </div>
            </div>

            <div className='tc-cinema-drow is-card'>
              <div className='tc-cinema-dcard' data-node='tagline'>
                <b>
                  <Sw
                    hop='tag'
                    mode='h'
                    en='Translation that just works.'
                    es='Traducciones que simplemente funcionan.'
                  />
                </b>
                <span className='tc-cinema-dcard-sub'>OTA updates · 99.99% uptime</span>
              </div>
            </div>

            <div className='tc-cinema-drow is-form'>
              <label className='tc-cinema-dlabel'>
                <Sw hop='form' en='Email address' es='Correo electrónico' />
              </label>
              <span className='tc-cinema-dinput'>you@work.com</span>
            </div>

            <div className='tc-cinema-drow is-legal'>
              <span className='tc-cinema-dlegal' data-node='legal'>
                <Sw
                  hop='legal'
                  en='By continuing, you agree to our Terms of Service.'
                  es='Al continuar, aceptas nuestros Términos de Servicio.'
                />
              </span>
            </div>

            <div className='tc-cinema-hilite' data-hilite aria-hidden />
            <span className='tc-cinema-scan' data-scanline aria-hidden />
          </div>
        </div>

        {/* ============ the beat panel ============ */}
        <div className='tc-cinema-beat' data-beatbox>
          <div className='tc-cinema-prog' aria-hidden>
            <span className='tc-cinema-prog-dashes'>
              {CAPS.map((c, i) => (
                <i data-dash data-st={i === 0 ? 'on' : ''} key={`d${c}`} />
              ))}
            </span>
            <span className='tc-cinema-prog-count'>
              {CAPS.map((c, i) => (
                <b data-pn data-first={i === 0 ? 'true' : undefined} key={`n${c}`}>
                  beat {i + 1} of {CAPS.length}
                </b>
              ))}
            </span>
          </div>

          <div className='tc-cinema-slides'>
            {CAPS.map((c, i) => (
              <div
                className='tc-cinema-slide'
                data-slide={i}
                data-first={i === 0 ? 'true' : undefined}
                key={c}
              >
                <p className='tc-cinema-say'>{c}</p>
                {ARTS[i]}
              </div>
            ))}
          </div>
        </div>

        {/* ============ the traces ============ */}
        <svg className='tc-cinema-wires' aria-hidden>
          <path data-wire='ctx' d='' />
          <path data-wire='ctx' d='' />
          <path data-wire='rev' d='' />
          <path data-wire='rev' d='' />
        </svg>
      </div>
    </section>
  );
}
