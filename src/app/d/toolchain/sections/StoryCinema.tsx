'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import { useRef } from 'react';

import LocaleTag from '../components/LocaleTag';

import { tokenize } from './code';
import RevealSeam from './RevealSeam';

import '../components/icons.css';
import './story-cinema-v3.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Story, third telling — the two-box cut, founder round.
 *
 * One pinned take, two surfaces. LEFT: the demo website — a clean flat
 * panel (no shader), five hairline-separated sections with real strings.
 * Component boxes (the tagline card, the CTA button) are showcases: the
 * house reveal seam (RevealSeam — the logo's doubled line) uncovers each
 * component's <T> source, pinned full-width behind the render, resting
 * at ~70/30; the beat scrub pulls it fully open when that component
 * speaks.
 * When Locadex works, its selection is unmistakable: a doubled-gauge
 * sweep draws around the picked node, a Locadex chip rides the ring, and
 * the rest of the site dims under a masked scrim. RIGHT: one ruled sheet
 * in the demo panel's own square full-reach grammar, four fixed zones at
 * every scrub position — (1) a header strip with the progress counter,
 * closed by a full-width hairline; (2) the beat sentence at display
 * scale, top-anchored in the upper third (the mark, never the string
 * "GT"); (3) the beat artifact on a fixed-height toned plate whose four
 * 1px rules run to the panel edges (the construction that frames the
 * Example App), holding scan counts, locale lists, "Wrote
 * public/_gt/[locale].json", a real diff hunk with --tc-diff-add/
 * --tc-diff-del tints, PR #218 with its review state; (4) the
 * context-group ledger docked under the plate's own bottom rule — its
 * seven row slots are pre-ruled and the values fill in as the run
 * learns, so the accumulator visibly grows without ever floating loose.
 * Left↔right connectors stay doubled orthogonal traces at constant
 * gauge, landing on the plate's left rule, appearing whole so no scrub
 * position samples a half-drawn wire.
 *
 * BAND-AWARE SPACING: the review harness screenshots the page at fixed
 * scroll fractions; inside this pin those land at timeline t ≈ 0, 21.7,
 * 46.4, 71.2 and 95.9 (desktop) and t ≈ 55 (mobile). Beat windows are
 * spaced so each sampled t catches a held, fully-landed composition —
 * write (0), context with the card's source pulled open (21.7), the
 * translate pass (46.4), the scan crossing its own findings (71.2), and
 * the agent's doubled-ring selection over the live diff (95.9); the
 * mobile band holds the button showcase open. Money states persist
 * through their whole band — nothing lands or exits near a sampled t.
 */

/* ----------------------------------------------------------------
   content — every string is the demo site's or the product's own
   ---------------------------------------------------------------- */

/** The wordmark at text scale — the brand's rule: never the string "GT".
    The cinema never remaps its dark surface, so the dark-surface mark
    (the white glyph) is correct in both themes. */
function GtMark() {
  return (
    <Image
      alt='GT'
      className='tc-cinema-gtmark'
      height={64}
      src='/brand/no-bg-gt-logo-dark.png'
      width={64}
    />
  );
}

const BEATS: readonly { id: string; say: ReactNode }[] = [
  { id: 'write', say: 'The page you already wrote.' },
  {
    id: 'context',
    say: (
      <>
        <GtMark /> knows your context.
      </>
    ),
  },
  { id: 'voice', say: 'In the voice you asked for.' },
  {
    id: 'translate',
    say: (
      <>
        <GtMark /> does your translating.
      </>
    ),
  },
  { id: 'component', say: 'Around any component.' },
  { id: 'review', say: 'With your review.' },
  { id: 'scan', say: 'Code is pushed — Locadex scans.' },
  { id: 'edit', say: 'It edits, then translates in context.' },
  { id: 'pr', say: 'It opens the PR. Merged — live.' },
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

/** The tagline component's real source — also the card's reveal pane.
    Lines stay under 40ch so the open reveal shows them whole. */
const CODE_CTX = [
  '<T $context="Playful, upbeat tone">',
  '  <h3>Translation that just works.</h3>',
  '</T>',
] as const;

/** The CTA component's source, one line for the 34px button pane — kept
    lean so the narrow reveal leads with the meaningful tokens. */
const CODE_BTN = ['<T><button>Get started</button></T>'] as const;

/** The same component, unfolded for the right panel's artifact. */
const CODE_T = [
  '<T>',
  "  <button type='button' className='cta'>",
  '    Get started',
  '  </button>',
  '</T>',
  '',
] as const;

/** Everything the run assembles before it writes a word (beat 1). */
const CTX_ROWS: readonly { k: string; v: string }[] = [
  { k: 'file', v: 'app/components/Tagline.tsx' },
  { k: 'jsx', v: '<h3>Translation that just works.</h3>' },
  { k: '$context', v: '"Playful, upbeat tone"' },
  { k: 'glossary', v: 'Locadex → do not translate' },
  { k: 'directives', v: 'active voice · formal "Sie" (de)' },
  { k: 'existing', v: '"Get started" → "Comenzar ahora"' },
  { k: 'brand', v: 'never translate: Locadex' },
] as const;

/** The accumulator rows — what the context group has learned so far. */
const CTX_ACCUM: readonly { k: string; v: string }[] = [
  { k: 'glossary', v: '12 terms' },
  { k: 'component', v: 'Tagline.tsx' },
  { k: 'tone', v: 'playful, upbeat' },
  { k: 'de', v: 'formal "Sie"' },
  { k: 'existing', v: '42 strings' },
  { k: 'review', v: 'legal.tos' },
  { k: 'do-not-translate', v: '2 terms' },
] as const;

/** `npx gt translate`, in the CLI's own voice (beat 3). The locale lists
    render as the hero terminal's flag+code pills, not bare codes. */
const CLI_TRANSLATE = [
  '$ npx gt translate',
  'scan    app/ · 24 files · 42 strings',
] as const;

const CLI_TARGETS = ['es', 'fr', 'ja', 'de', 'zh'] as const;

const CLI_STRINGS = [
  '"Hello, world!" → "¡Hola, mundo!"',
  '"Get started" → "Comenzar ahora"',
] as const;

/** The push→scan transcript (beat 6). */
const CLI_SCAN = [
  '$ git push origin main · e4f21c9',
  'locadex · run #1184 · trigger: push',
  'scan app/ · 11 files changed · 412 ms',
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

type ShowcaseProps = {
  /** Extra class carrying the component box's own skin (card, button). */
  className: string;
  /** data-show id, the timeline's handle for scrubbing the cut. */
  show: string;
  /** The component's <T> source, revealed right of the divider. */
  lines: readonly string[];
  /** Optional anchors other beats target. */
  node?: string;
  btn?: boolean;
  children: ReactNode;
};

/** How much of the source layer shows at a given cut. At the ~70/30 rest
    the strip carries a crisp `<T>` chip (never a mid-token crop of code);
    pulling past ~36% has crossfaded the whole listing in. One curve for
    the seam drag and the beat scrub, so they can never disagree. */
const openAt = (cutPct: number): number => Math.min(Math.max((70 - cutPct) / 34, 0), 1);

/** A component box that showcases its own source: the rendered UI in
    front, the <T> code PINNED full-width behind it, revealed by the
    house seam (RevealSeam) — the handle only moves the clip boundary,
    so the code never travels. The cut lives in a CSS var so the drag
    and the beat scrub share one dial. */
function Showcase({ className, show, lines, node, btn, children }: ShowcaseProps) {
  const box = useRef<HTMLDivElement>(null);

  return (
    <div
      className={`${className} tc-cinema-show`}
      data-show={show}
      data-node={node}
      data-btn={btn ? '' : undefined}
      ref={box}
      style={{ '--seam-cut': '70%', '--open': '0' } as CSSProperties}
    >
      <div className='tc-cinema-show-ui'>{children}</div>
      <div className='tc-cinema-show-src' aria-hidden>
        <span className='tc-cinema-show-rest'>
          <b>{'<T>'}</b>
          <i>source</i>
        </span>
        <div className='tc-cinema-show-code'>
          {lines.map((line, i) => (
            <Tok text={line} key={i} />
          ))}
        </div>
      </div>
      <RevealSeam
        boxRef={box}
        ariaLabel='Reveal the component source'
        onCutChange={(pct, el) => el.style.setProperty('--open', String(openAt(pct)))}
      />
    </div>
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

  /* 1 · context — everything the run assembles before translating */
  <div className='tc-cinema-art' data-art key='a1'>
    <div className='tc-cinema-art-line is-dim'>
      <code>context group · Tagline.tsx</code>
    </div>
    {CTX_ROWS.map((row) => (
      <div className='tc-cinema-arow' key={row.k}>
        <span>{row.k}</span>
        <Tok text={row.v} />
      </div>
    ))}
  </div>,

  /* 2 · voice — same string, two prompts, the directives that decide it */
  <div className='tc-cinema-art' data-art key='a2'>
    <div className='tc-cinema-art-line is-dim'>
      <code>card.tagline · es</code>
    </div>
    <div className='tc-cinema-arow'>
      <span>source</span>
      <code>Translation that just works.</code>
    </div>
    <div className='tc-cinema-arow is-dim'>
      <span>no context</span>
      <code lang='es'>Traducción que funciona.</code>
    </div>
    <div className='tc-cinema-arow'>
      <span>with context</span>
      <code lang='es'>Traducciones que simplemente funcionan.</code>
    </div>
    <div className='tc-cinema-arow'>
      <span>$context</span>
      <Tok text='"Playful, upbeat tone"' />
    </div>
    <div className='tc-cinema-arow'>
      <span>directives</span>
      <code>active voice · formal "Sie" (de)</code>
    </div>
  </div>,

  /* 3 · translate — the CLI's own voice, then the strings it wrote */
  <div className='tc-cinema-art' data-art key='a3'>
    {CLI_TRANSLATE.map((line, i) => (
      <div className='tc-cinema-art-line' key={i}>
        <Tok text={line} />
      </div>
    ))}
    <div className='tc-cinema-art-line tc-termline'>
      <code>{'target '}</code>
      {CLI_TARGETS.map((loc) => (
        <LocaleTag code={loc} className='tc-termloc' key={loc} />
      ))}
    </div>
    <div className='tc-cinema-art-line'>
      <Tok text='Wrote public/_gt/{es,fr,ja,de,zh}.json' />
    </div>
    {CLI_STRINGS.map((line, i) => (
      <div className='tc-cinema-art-line' key={`s${i}`}>
        <Tok text={line} />
      </div>
    ))}
    <div className='tc-cinema-art-line is-dim'>
      <code>✓ 42 strings · 5 locales · 3.8 s</code>
    </div>
  </div>,

  /* 4 · component — the wrapped source, then the payload it produces */
  <div className='tc-cinema-art' data-art key='a4'>
    <div className='tc-cinema-art-line is-dim'>
      <code>app/components/Cta.tsx</code>
    </div>
    {CODE_T.map((line, i) => (
      <div className='tc-cinema-art-line' key={i}>
        <Tok text={line} />
      </div>
    ))}
    <div className='tc-cinema-art-line is-dim'>
      <code>public/_gt/es.json</code>
    </div>
    <div className='tc-cinema-art-line'>
      <Tok text='"Get started": "Comenzar ahora"' />
    </div>
  </div>,

  /* 5 · review — the webhook payload, carrying the real legal string */
  <div className='tc-cinema-art' data-art key='a5'>
    <div className='tc-cinema-art-line is-dim'>
      <code>POST · hooks.example.com/review</code>
    </div>
    <div className='tc-cinema-art-line'>
      <Tok text='{ "key": "legal.tos", "locale": "es",' />
    </div>
    <div className='tc-cinema-art-line'>
      <Tok text='  "string": "Al continuar, aceptas…",' />
    </div>
    <div className='tc-cinema-art-line'>
      <Tok text='  "status": "needs_approval" }' />
    </div>
    <div className='tc-cinema-art-line is-dim'>
      <code>review · legal · 1 approval required</code>
    </div>
    <div className='tc-cinema-art-line is-bright' data-approve>
      <code>approved — shipped to /es</code>
    </div>
  </div>,

  /* 6 · scan — the push transcript. Plain <code>, not <Tok/>: the run
     number's # would otherwise match the tokenizer's comment rule and
     wash out the rest of its line. */
  <div className='tc-cinema-art' data-art key='a6'>
    {CLI_SCAN.map((line, i) => (
      <div className='tc-cinema-art-line' key={i}>
        <code>{line}</code>
      </div>
    ))}
    <div className='tc-cinema-art-line is-bright'>
      <code>found 3 unwrapped strings</code>
    </div>
    <div className='tc-cinema-art-line is-dim'>
      <code>app/page.tsx · L4 · L5 · L16</code>
    </div>
    <div className='tc-cinema-art-line'>
      <code>branch locadex/i18n · created</code>
    </div>
  </div>,

  /* 7 · edit — the diff hunk, real add/del grammar */
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
      <code>
        4 files · <span className='tc-cinema-add-ink'>+38</span>{' '}
        <span className='tc-cinema-del-ink'>−6</span> · checks passed
      </code>
    </div>
    <div className='tc-cinema-art-line is-dim'>
      <code>gt validate ✓ · review approved</code>
    </div>
    <div className='tc-cinema-art-line tc-termline'>
      <code>{'live   '}</code>
      {(['en', ...CLI_TARGETS] as const).map((loc) => (
        <LocaleTag code={loc} className='tc-termloc' key={loc} />
      ))}
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
      if (!take || !demo || !beat || !hilite || !scan) return;

      const takeEl = take;
      const demoEl = demo;
      const beatEl = beat;

      const slides = q('[data-slide]') as HTMLElement[];
      const pns = q('[data-pn]') as HTMLElement[];
      const dashes = q('[data-dash]') as HTMLElement[];
      const swaps = q('[data-swap]') as HTMLElement[];
      const flags = q('[data-flag]') as HTMLElement[];
      const ctxRows = q('[data-ctxrow]') as HTMLElement[];
      const wCtx = q("[data-wire='ctx']") as unknown as SVGPathElement[];
      const wRev = q("[data-wire='rev']") as unknown as SVGPathElement[];

      const agentDim = one<SVGRectElement>('[data-agent-dim]');
      const agentHole = one<SVGRectElement>('[data-agent-hole]');
      const agentRingO = one<SVGRectElement>("[data-agent-ring='o']");
      const agentRingI = one<SVGRectElement>("[data-agent-ring='i']");
      const agentChip = one<HTMLElement>('[data-agent-chip]');

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
        /* the trace lands ON the plate's left rule — the sheet receives it */
        const x2 = Math.round(a.x - 1);
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
      gsap.set([...wCtx, ...wRev], { autoAlpha: 0 });
      gsap.set(scan, { autoAlpha: 0 });
      gsap.set(flags, { autoAlpha: 0, scale: 0.4, transformOrigin: '50% 50%' });
      gsap.set('[data-approve]', { autoAlpha: 0 });
      gsap.set('[data-merged]', { autoAlpha: 0 });
      /* the ledger's row SLOTS stay ruled from t=0 — only the values hide */
      gsap.set(q('[data-ctxrow] > *'), { autoAlpha: 0 });

      const isMobile = () => window.innerWidth < 900;

      /* Where each beat begins on the 0–100 playhead (beat 1 starts at 0).
         The gauge is driven from this table on every scrub update — GSAP
         attr-sets of string values render eagerly at timeline creation,
         which is exactly how every dash once lit up at once. */
      const BEAT_STARTS = [10, 26, 36, 52, 60, 68, 79, 97.9] as const;
      const paintGauge = (t: number) => {
        let current = 0;
        for (const b of BEAT_STARTS) if (t >= b) current += 1;
        dashes.forEach((d, i) => {
          d.setAttribute('data-st', i < current ? 'done' : i === current ? 'on' : '');
        });
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: take,
          start: 'top 58px',
          /* 5700 on mobile aims the harness's one in-pin sample (scroll
             fraction 0.66) at a held band. The exact t drifts as other
             sections change the page's total height — the long holds
             (beat 5's open showcase, beat 8's diff + selection) are wide
             enough that the sample keeps landing on a money state. */
          end: () => `+=${isMobile() ? 5700 : 5400}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        defaults: { ease: 'none' },
        onUpdate() {
          paintGauge(tl.progress() * 100);
        },
      });
      paintGauge(0);

      type Vars = gsap.TweenVars;
      const ft = (tgt: gsap.TweenTarget, from: Vars, to: Vars, pos: number) =>
        tl.fromTo(tgt, from, { ...to, immediateRender: false }, pos);

      /* Beat swaps are atomic sets at ONE timeline position — hide-prev is
         inserted before show-next at the same t, so no scrub position ever
         shows two slides superimposed or (worse) neither. (The dash gauge
         is painted by onUpdate, not here.) */
      const cap = (i: number, t: number) => {
        const prevSlide = slides[i - 1];
        const nextSlide = slides[i];
        if (prevSlide) tl.set(prevSlide, { autoAlpha: 0 }, t);
        if (nextSlide) tl.set(nextSlide, { autoAlpha: 1 }, t);
        const prevPn = pns[i - 1];
        const nextPn = pns[i];
        if (prevPn) tl.set(prevPn, { autoAlpha: 0 }, t);
        if (nextPn) tl.set(nextPn, { autoAlpha: 1 }, t);
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

      /** Scrub a showcase's seam: the beat opens the source reveal. The
          code is pinned at the box's left edge, so "open" means the cut
          runs nearly to 0 and the whole listing stands revealed. The cut
          and the code crossfade ride one tween, on the same curve the
          pointer drag uses. */
      const cut = (show: string, from: number, to: number, t: number, d = 0.8) => {
        const el = bySel(`[data-show='${show}']`);
        if (!el) return;
        ft(
          el,
          { '--seam-cut': `${from}%`, '--open': openAt(from) },
          { '--seam-cut': `${to}%`, '--open': openAt(to), duration: d, ease: 'power2.inOut' },
          t
        );
      };

      /** One ledger slot fills in — the context group visibly grows. The
          slot's rule was always there; only the key/value fade up into it. */
      const learn = (i: number, t: number) => {
        const row = ctxRows[i];
        if (!row) return;
        ft(
          row.children,
          { autoAlpha: 0, y: 5 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          t
        );
      };

      /* ---------- the agent's selection: doubled sweep + chip + dim ---------- */

      const agent =
        agentDim && agentHole && agentRingO && agentRingI && agentChip
          ? { dim: agentDim, hole: agentHole, ringO: agentRingO, ringI: agentRingI, chip: agentChip }
          : null;

      /** Live geometry of the picked node, padded to selection size. */
      const holeOf = (sel: string) => () => {
        const el = bySel(sel);
        if (!el || el.offsetWidth === 0) return { x: -20, y: -20, w: 0, h: 0 };
        const p = getLocal(el, demoEl);
        return { x: p.x - 9, y: p.y - 7, w: el.offsetWidth + 18, h: el.offsetHeight + 14 };
      };

      /** The selection lands on a node: scrim hole and both rings snap to
          it, then the doubled gauge sweeps around; the chip rides along. */
      const agentVisit = (sel: string, t: number, first: boolean) => {
        if (!agent) return;
        const g = holeOf(sel);
        tl.set([agent.ringO, agent.ringI], { autoAlpha: 0 }, t);
        tl.set(
          agent.hole,
          { attr: { x: () => g().x, y: () => g().y, width: () => g().w, height: () => g().h } },
          t
        );
        tl.set(
          agent.ringO,
          {
            attr: { x: () => g().x, y: () => g().y, width: () => g().w, height: () => g().h },
            strokeDasharray: () => 2 * (g().w + g().h),
            strokeDashoffset: () => 2 * (g().w + g().h),
          },
          t
        );
        tl.set(
          agent.ringI,
          {
            attr: {
              x: () => g().x + 5,
              y: () => g().y + 5,
              width: () => Math.max(g().w - 10, 0),
              height: () => Math.max(g().h - 10, 0),
            },
            strokeDasharray: () => 2 * (g().w + g().h - 20),
            strokeDashoffset: () => 2 * (g().w + g().h - 20),
          },
          t
        );
        if (first) {
          tl.set(agent.chip, { left: () => g().x, top: () => g().y - 22 }, t);
          ft(agent.chip, { autoAlpha: 0, y: 5 }, { autoAlpha: 1, y: 0, duration: 0.4 }, t + 0.1);
        } else {
          tl.to(
            agent.chip,
            { left: () => g().x, top: () => g().y - 22, duration: 0.4, ease: 'power2.inOut' },
            t
          );
        }
        tl.set([agent.ringO, agent.ringI], { autoAlpha: 1 }, t + 0.06);
        tl.to(agent.ringO, { strokeDashoffset: 0, duration: 0.55 }, t + 0.06);
        tl.to(agent.ringI, { strokeDashoffset: 0, duration: 0.55 }, t + 0.16);
      };

      /* ================= BEAT 1 · write (0–10 · sampled at t≈0) ================= */
      ft(demoEl, { y: 12, autoAlpha: 0.85 }, { y: 0, autoAlpha: 1, duration: 1.6 }, 0);

      /* ================= BEAT 2 · context (10–26 · sampled at t≈21.7) =================
         The whole composition lands inside the beat's first tenth — the
         trace appears whole (never sampled half-drawn), the ring lands,
         and the card's divider pulls open to the full <T $context>
         listing, then HOLDS until 24.3 so the sampled still shows the
         handle moved and the code whole. The ledger's first rows fill
         here (its ruled slots have been part of the sheet since t=0). */
      cap(1, 10);
      ft(wCtx, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 10.2);
      frame("[data-node='tagline']", 10.3, 7);
      cut('card', 70, 3, 10.6, 0.9);
      learn(0, 11.3);
      learn(1, 12.1);
      cut('card', 3, 70, 24.3, 0.7);
      tl.to(wCtx, { autoAlpha: 0, duration: 0.5 }, 24.8);
      tl.to(hilite, { autoAlpha: 0, duration: 0.4 }, 25.3);

      /* ================= BEAT 3 · voice (26–36) ================= */
      cap(2, 26);
      learn(2, 26.6);
      learn(3, 27.3);
      visit('tag', 27.8);
      tl.to(hilite, { autoAlpha: 0, duration: 0.4 }, 34.8);

      /* ================= BEAT 4 · translate in place (36–52 · sampled at t≈46.4) ================= */
      cap(3, 36);
      visit('nav1', 36.9);
      visit('nav2', 38);
      visit('nav3', 39.1);
      visit('h1', 40.4);
      visit('date', 41.7);
      visit('body', 43.1);
      visit('form', 45);
      learn(4, 45.4);
      tl.to(hilite, { autoAlpha: 0, duration: 0.4 }, 50.8);

      /* ================= BEAT 5 · around any component (52–60 · mobile sample t≈55) ================= */
      cap(4, 52);
      frame('[data-btn]', 52.6, 7);
      cut('cta', 70, 3, 52.9, 0.8);
      swap(swapOf('cta'), 54.1);
      /* The button box = swap + its reserved source strip (100px) — the
         emphasis ring re-measures with the same constant. */
      ft(
        hilite,
        { width: () => (boxes.get(swapOf('cta') ?? demoEl)?.enW ?? 0) + 114 },
        {
          width: () => (boxes.get(swapOf('cta') ?? demoEl)?.esW ?? 0) + 114,
          duration: 0.55,
          ease: 'power3.inOut',
        },
        54.1
      );
      cut('cta', 3, 70, 58.3, 0.7);
      tl.to(hilite, { autoAlpha: 0, duration: 0.35 }, 59.2);

      /* ================= BEAT 6 · review (60–68) ================= */
      cap(5, 60);
      ft(wRev, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 60.15);
      frame("[data-node='legal']", 60.3, 5);
      ft('[data-approve]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 62.6);
      swap(swapOf('legal'), 63.6);
      learn(5, 64.2);
      tl.to(wRev, { autoAlpha: 0, duration: 0.5 }, 66.7);
      tl.to(hilite, { autoAlpha: 0, duration: 0.4 }, 67.3);

      /* ================= BEAT 7 · pushed, scanned (68–79 · sampled at t≈71.2) =================
         The scan head is a doubled hairline that walks the WHOLE demo,
         and each finding chip pops at the exact moment the line crosses
         its node — crossing times are computed from the flags' measured
         positions, so the cue and its findings can never disconnect. At
         the sampled t the head sits just under the freshly-flagged CTA
         row with all three findings lit. */
      cap(6, 68);
      const scanT0 = 68.4;
      const scanDur = 8;
      const scanEnd = () => Math.max(demoEl.clientHeight - 8, 40);
      tl.set(scan, { y: 2 }, 68.1);
      ft(scan, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 68.15);
      tl.to(scan, { y: () => scanEnd(), duration: scanDur }, scanT0);
      tl.to(scan, { autoAlpha: 0, duration: 0.5 }, scanT0 + scanDur + 0.6);
      const crossAt = (name: string) => {
        const el = bySel(`[data-flag='${name}']`);
        if (!el) return scanT0 + 1;
        const y = getLocal(el, demoEl).y + el.offsetHeight / 2;
        return scanT0 + scanDur * Math.min(Math.max(y / scanEnd(), 0), 1);
      };
      for (const name of ['h1', 'date', 'cta'] as const) {
        ft(
          `[data-flag='${name}']`,
          { autoAlpha: 0, scale: 0.4 },
          { autoAlpha: 1, scale: 1, duration: 0.3 },
          crossAt(name)
        );
      }

      /* ================= BEAT 8 · edit + translate (79–97.9 · sampled at t≈96) =================
         Locadex works node by node: the site dims under the masked scrim,
         the doubled-gauge selection sweeps each picked node, and the chip
         rides the ring. The last stop is the CTA — the agent pulls its
         showcase open (the <T> it just wrote) and the selection HOLDS to
         97.4 — past the sampled t plus the ~0.5-unit pin-start drift the
         self-check measured — so the still catches rings + chip + dim +
         open code over the live diff artifact. */
      cap(7, 79);
      if (agent) ft(agent.dim, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, 79.5);
      learn(6, 80);
      const edits: readonly { sel: string; flag: string; t: number }[] = [
        { sel: '.tc-cinema-dh1', flag: 'h1', t: 80.4 },
        { sel: '.tc-cinema-ddate', flag: 'date', t: 84.6 },
        { sel: '[data-btn]', flag: 'cta', t: 89 },
      ];
      edits.forEach((e, i) => {
        tl.to(`[data-flag='${e.flag}']`, { autoAlpha: 0, duration: 0.3 }, e.t - 0.15);
        agentVisit(e.sel, e.t, i === 0);
      });
      cut('cta', 70, 3, 89.3, 0.8);
      if (agent) {
        tl.to(agent.dim, { autoAlpha: 0, duration: 0.4 }, 97.4);
        tl.to([agent.ringO, agent.ringI], { autoAlpha: 0, duration: 0.35 }, 97.4);
        tl.to(agent.chip, { autoAlpha: 0, duration: 0.35 }, 97.4);
      }

      /* ================= BEAT 9 · the PR, merged (97.9–100) =================
         The agent's freshly-written <T> stays open on the left while the
         PR lands — merged is the final resting frame of the take. */
      cap(8, 97.9);
      ft('[data-merged]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 98.5);
      tl.to({}, { duration: 0.4 }, 99.6);

      return () => {
        ScrollTrigger.removeEventListener('refreshInit', positions);
      };
    },
    { scope: root }
  );

  return (
    <section className='tc-cinema tc-cinema-v3' id='story-cinema' ref={root}>
      <div className='tc-cinema-take' data-stage>
        {/* ============ the web ============ */}
        <div className='tc-cinema-web'>
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
                <Sw hop='h1' en='Hello, world!' es='¡Hola, mundo!' />
                <Flag n='h1' />
              </h3>
              <p className='tc-cinema-ddate'>
                <Sw hop='date' en='July 29, 2026' es='29 de julio de 2026' />
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
                <Showcase className='tc-cinema-dbtn' show='cta' lines={CODE_BTN} btn>
                  <Sw hop='cta' en='Get started' es='Comenzar ahora' />
                </Showcase>
                <Flag n='cta' />
              </div>
            </div>

            <div className='tc-cinema-drow is-card'>
              <Showcase className='tc-cinema-dcard' show='card' lines={CODE_CTX} node='tagline'>
                <b>
                  <Sw
                    hop='tag'
                    mode='h'
                    en='Translation that just works.'
                    es='Traducciones que simplemente funcionan.'
                  />
                </b>
                <span className='tc-cinema-dcard-sub'>OTA updates · 99.99% uptime</span>
              </Showcase>
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

            {/* the agent's selection: masked scrim + doubled-gauge rings */}
            <svg className='tc-cinema-agent' aria-hidden>
              <defs>
                <mask id='tc-cin3-dimhole' maskUnits='userSpaceOnUse'>
                  <rect width='100%' height='100%' fill='#fff' />
                  <rect data-agent-hole fill='#000' rx='6' x='0' y='0' width='0' height='0' />
                </mask>
              </defs>
              <rect
                className='tc-cinema-agent-dim'
                data-agent-dim
                width='100%'
                height='100%'
                mask='url(#tc-cin3-dimhole)'
              />
              <rect className='tc-cinema-agent-ring' data-agent-ring='o' rx='6' x='0' y='0' width='0' height='0' />
              <rect className='tc-cinema-agent-ring' data-agent-ring='i' rx='4' x='0' y='0' width='0' height='0' />
            </svg>
            <span className='tc-cinema-agent-chip' data-agent-chip aria-hidden>
              <Image alt='' height={26} src='/brand/no-bg-locadex-logo-light.png' width={26} />
              Locadex
            </span>
          </div>
        </div>

        {/* ============ the beat panel ============ */}
        <div className='tc-cinema-beat' data-beatbox>
          <div className='tc-cinema-prog' aria-hidden>
            <span className='tc-cinema-prog-dashes'>
              {BEATS.map((b, i) => (
                <i data-dash data-st={i === 0 ? 'on' : ''} key={`d${b.id}`} />
              ))}
            </span>
            <span className='tc-cinema-prog-count'>
              {BEATS.map((b, i) => (
                <b data-pn data-first={i === 0 ? 'true' : undefined} key={`n${b.id}`}>
                  beat {i + 1} of {BEATS.length}
                </b>
              ))}
            </span>
          </div>

          <div className='tc-cinema-slides'>
            {BEATS.map((b, i) => (
              <div
                className='tc-cinema-slide'
                data-slide={i}
                data-first={i === 0 ? 'true' : undefined}
                key={b.id}
              >
                <p className='tc-cinema-say'>{b.say}</p>
                {ARTS[i]}
              </div>
            ))}
          </div>

          {/* the context-group ledger, docked under the artifact plate's
              bottom rule — pre-ruled slots that fill as the run learns */}
          <div className='tc-cinema-ctxgroup' data-ctxgroup aria-hidden>
            <b>context group</b>
            {CTX_ACCUM.map((row) => (
              <span className='tc-cinema-ctxrow' data-ctxrow key={row.k}>
                <i>{row.k}</i>
                <span>{row.v}</span>
              </span>
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
