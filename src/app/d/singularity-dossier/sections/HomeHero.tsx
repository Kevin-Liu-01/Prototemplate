'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import { ArrowRight, Eye, TerminalSquare } from 'lucide-react';
import {
  Fragment,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from 'react';

import {
  SiNextdotjs,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiTanstack,
} from '@icons-pack/react-simple-icons';

import PrismaticField from '@/components/shared/PrismaticField';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import RevealSeam from '@/app/d/toolchain/sections/RevealSeam';

import '@/app/d/toolchain/sections/chip-consistency.css';
import '@/app/d/toolchain/sections/hero-every.css';
import '@/app/d/toolchain/sections/hero-terminal.css';

gsap.registerPlugin(useGSAP);

/**
 * Six names in one weight read as a word list, so each is set as its own
 * typographic mark — weight, case, size and tracking are the only variables,
 * and they stay inside the page's two faces. The row is ruled into six cells so
 * the two hairlines bracketing the band bound a table rather than a sentence.
 */
const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

/* ------------------------------------------------------------------
   The gt CLI session. Two commands, replayed the way the product runs
   them: the wizard detects the framework and writes the config, then
   `gt translate` scans, translates per string, and writes public/_gt.
   Every string below is real — sources are the site's own UI copy;
   translations are verbatim from the landing demo's shipped table
   (es / fr / ja / de / zh). 128 strings × 5 locales = 640.
   ------------------------------------------------------------------ */

/* ------------------------------------------------------------------
   The stack strip: the Frameworks section's whole argument — one
   toolchain, every stack — folded into the window as furniture. Six
   tabs under the bar; the selected stack is what the wizard's
   Detected line reports, so the claim is demonstrated by the same
   transcript instead of asserted by a separate section.
   ------------------------------------------------------------------ */

type Stack = { name: string; detected: string };

const STACKS: readonly Stack[] = [
  { name: 'Next.js', detected: 'Next.js · App Router' },
  { name: 'React', detected: 'React · Vite' },
  { name: 'React Native', detected: 'React Native · Expo' },
  { name: 'TanStack Start', detected: 'TanStack Start · SSR' },
  { name: 'Node.js', detected: 'Node.js · server' },
  { name: 'Python', detected: 'Python · scripts' },
];

type StackMarkProps = { className?: string; color?: string; 'aria-hidden'?: boolean };

/** The saved React Native badge, mask-rendered in the tab's own ink —
    same reasoning as the Frameworks tab strip: the bare atom would be
    pixel-identical to the React mark at this size. */
function ReactNativeStackMark({ className }: StackMarkProps) {
  return <i className={className ? `${className} is-rn` : 'is-rn'} aria-hidden='true' />;
}

/** The real framework marks, monochrome at text size beside each label. */
const STACK_MARKS: Record<string, ComponentType<StackMarkProps>> = {
  'Next.js': SiNextdotjs,
  React: SiReact,
  'React Native': ReactNativeStackMark,
  'TanStack Start': SiTanstack,
  'Node.js': SiNodedotjs,
  Python: SiPython,
};

const DEFAULT_STACK: Stack = STACKS[0] ?? { name: 'Next.js', detected: 'Next.js · App Router' };

/** The wizard's summary block after the Detected line (which renders from
    the stack strip's state): source, locale set, files written. `src`
    renders the page's one locale chip like `locs` does — the source is a
    locale token too, so it speaks the same flag+code grammar as the
    targets, in the plate's quieter neutral voice. */
const WIZARD: readonly { key: string; text?: string; src?: string; locs?: readonly string[] }[] = [
  { key: 'Source', src: 'en' },
  { key: 'Locales', locs: ['es', 'fr', 'ja', 'de', 'zh'] },
  { key: 'Wrote', text: 'gt.config.json · .env.local' },
];

type Variant = { loc: string; text: string };

/** One translated cell; more than one variant means the cell cycles the long tail. */
type Cell = readonly Variant[];

type Row = { src: string; cells: readonly Cell[] };

const ROWS: readonly Row[] = [
  {
    src: '"Hello, world!"',
    cells: [
      [{ loc: 'es', text: '¡Hola, mundo!' }],
      [{ loc: 'ja', text: 'こんにちは、世界！' }],
      [
        { loc: 'de', text: 'Hallo, Welt!' },
        { loc: 'fr', text: 'Bonjour le monde !' },
        { loc: 'zh', text: '你好，世界！' },
      ],
    ],
  },
  {
    src: '"Get started"',
    cells: [
      [{ loc: 'es', text: 'Comenzar ahora' }],
      [{ loc: 'ja', text: '始める' }],
      [
        { loc: 'de', text: 'Jetzt starten' },
        { loc: 'fr', text: 'Commencer' },
        { loc: 'zh', text: '立即开始' },
      ],
    ],
  },
];

/* ------------------------------------------------------------------
   The preview face: the run's strings rendered as the product page
   they ship to — a small localized SaaS screen (in-app chrome, a
   greeting, live figures, the button and toast the transcript just
   translated), in all five locales the run writes to public/_gt.
   English sources: 'Overview' / 'Payments' / 'Reports' · 'Welcome
   back' · 'Your account activity this week.' · 'Revenue' /
   'Invoices' / 'Next payout' · 'Get started' · 'Payment received'.
   ------------------------------------------------------------------ */

type PreviewLoc = 'es' | 'fr' | 'ja' | 'de' | 'zh';

const PREVIEW_LOCS: readonly PreviewLoc[] = ['es', 'fr', 'ja', 'de', 'zh'];

type PreviewCopy = {
  nav: readonly [string, string, string];
  heading: string;
  sub: string;
  revenue: string;
  invoices: string;
  payout: string;
  button: string;
  toast: string;
};

const PREVIEWS: Record<PreviewLoc, PreviewCopy> = {
  es: {
    nav: ['Resumen', 'Pagos', 'Informes'],
    heading: 'Hola de nuevo',
    sub: 'La actividad de tu cuenta esta semana.',
    revenue: 'Ingresos',
    invoices: 'Facturas',
    payout: 'Próximo pago',
    button: 'Comenzar ahora',
    toast: 'Pago recibido',
  },
  fr: {
    nav: ['Aperçu', 'Paiements', 'Rapports'],
    heading: 'Bon retour',
    sub: 'L’activité de votre compte cette semaine.',
    revenue: 'Revenus',
    invoices: 'Factures',
    payout: 'Prochain virement',
    button: 'Commencer',
    toast: 'Paiement reçu',
  },
  ja: {
    nav: ['概要', '支払い', 'レポート'],
    heading: 'おかえりなさい',
    sub: '今週のアカウントのアクティビティです。',
    revenue: '売上',
    invoices: '請求書',
    payout: '次回の入金',
    button: '始める',
    toast: '支払いを受領しました',
  },
  de: {
    nav: ['Übersicht', 'Zahlungen', 'Berichte'],
    heading: 'Willkommen zurück',
    sub: 'Ihre Kontoaktivität in dieser Woche.',
    revenue: 'Umsatz',
    invoices: 'Rechnungen',
    payout: 'Nächste Auszahlung',
    button: 'Jetzt starten',
    toast: 'Zahlung erhalten',
  },
  zh: {
    nav: ['概览', '付款', '报表'],
    heading: '欢迎回来',
    sub: '您的账户本周动态。',
    revenue: '收入',
    invoices: '发票',
    payout: '下次结算',
    button: '立即开始',
    toast: '已收到付款',
  },
};

/** The one line the living-file loop re-edits: a second plausible wording
    for the button per locale — the demo alternates between the two. */
const BUTTON_ALTS: Record<PreviewLoc, string> = {
  es: 'Empezar ahora',
  fr: 'Démarrer',
  ja: '今すぐ始める',
  de: 'Loslegen',
  zh: '开始使用',
};

/** The stat figures: REAL Intl output per locale — local currency, local
    grouping, local date order — from fixed inputs so server and client
    render the same characters. */
const REVENUE: Record<PreviewLoc, { currency: string; amount: number }> = {
  es: { currency: 'EUR', amount: 48250 },
  fr: { currency: 'EUR', amount: 48250 },
  ja: { currency: 'JPY', amount: 7480000 },
  de: { currency: 'EUR', amount: 48250 },
  zh: { currency: 'CNY', amount: 342800 },
};

const INVOICE_COUNT = 1284;
const PAYOUT_DATE = new Date(2026, 7, 12);

const fmtRevenue = (loc: PreviewLoc) =>
  new Intl.NumberFormat(loc, {
    style: 'currency',
    currency: REVENUE[loc].currency,
    maximumFractionDigits: 0,
  }).format(REVENUE[loc].amount);

const fmtInvoices = (loc: PreviewLoc) => new Intl.NumberFormat(loc).format(INVOICE_COUNT);

const fmtPayout = (loc: PreviewLoc) =>
  new Intl.DateTimeFormat(loc, { dateStyle: 'medium' }).format(PAYOUT_DATE);

/* ------------------------------------------------------------------
   The payload under the render: the hashed-key JSON `gt translate`
   writes to public/_gt/[locale].json (the real file shape — hash of
   the source resolves to the translated string, JSX trees keep their
   structure and only the leaves change). Keys are constant across
   locales because they hash the SOURCE. The slide-to-reveal divider
   pulls the rendered page back to this artifact, and each component's
   inspector mark names the key its string ships under.
   ------------------------------------------------------------------ */

const HASHES = {
  navOverview: '8c31f0a2b9d47e15',
  navPayments: 'e5a9c2481f7b03d6',
  navReports: '4b7de8a20c91f356',
  heading: 'd41a7c09e82b5f36',
  sub: '7f8e2c5a90d1b463',
  revenue: '2a64d90e7c15fb38',
  invoices: 'c093f7b1e6a2854d',
  payout: '5e1ba4f68d20c793',
  button: '32b8f2a917c40de6',
  toast: 'b54ce01d97f2a683',
} as const;

/* ------------------------------------------------------------------
   The rewrite ledger: every localized line the locale switch retypes,
   in document order — the stagger walks the page top to bottom.
   ------------------------------------------------------------------ */

type RwKey =
  | 'addr'
  | 'nav0'
  | 'nav1'
  | 'nav2'
  | 'heading'
  | 'sub'
  | 'revenue'
  | 'invoices'
  | 'payout'
  | 'button'
  | 'toast';

const RW_LINES: readonly { key: RwKey; read: (loc: PreviewLoc) => string }[] = [
  { key: 'addr', read: (loc) => loc },
  { key: 'nav0', read: (loc) => PREVIEWS[loc].nav[0] },
  { key: 'nav1', read: (loc) => PREVIEWS[loc].nav[1] },
  { key: 'nav2', read: (loc) => PREVIEWS[loc].nav[2] },
  { key: 'heading', read: (loc) => PREVIEWS[loc].heading },
  { key: 'sub', read: (loc) => PREVIEWS[loc].sub },
  { key: 'revenue', read: (loc) => PREVIEWS[loc].revenue },
  { key: 'invoices', read: (loc) => PREVIEWS[loc].invoices },
  { key: 'payout', read: (loc) => PREVIEWS[loc].payout },
  { key: 'button', read: (loc) => PREVIEWS[loc].button },
  { key: 'toast', read: (loc) => PREVIEWS[loc].toast },
];

/** The inspector ids: which payload key each component's string ships
    under — the bridge between the rendered page and the file below it. */
const INS_IDS: Readonly<Partial<Record<RwKey, string>>> = {
  nav0: HASHES.navOverview,
  nav1: HASHES.navPayments,
  nav2: HASHES.navReports,
  heading: HASHES.heading,
  sub: HASHES.sub,
  revenue: HASHES.revenue,
  invoices: HASHES.invoices,
  payout: HASHES.payout,
  button: HASHES.button,
  toast: HASHES.toast,
};

/** A component's inspector mark: the quiet exclamation at its top-right.
    Hover/focus outlines the component and raises a chip naming the payload
    key its string ships under. CLICK (or Enter/Space — it is a real
    button) pins it: the seam rolls open and the matching JSON row lifts;
    clicking again, clicking elsewhere, or Escape dismisses. The mark is a
    SIBLING of the rewriting text node, never its child — the typing
    engine writes textContent, which would erase any nested DOM. */
function InsMark({
  id,
  on,
  pin,
  onEnter,
  onLeave,
  onToggle,
}: {
  id: string;
  on: boolean;
  pin: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onToggle: () => void;
}) {
  return (
    <>
      <button
        type='button'
        className='sgdh-ins-mark'
        data-pin={pin || undefined}
        aria-label={`String id ${id}`}
        aria-expanded={pin}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter}
        onBlur={onLeave}
        onClick={onToggle}
      >
        !
      </button>
      {on ? (
        <span className='sgdh-ins-chip' aria-hidden>
          {id}
        </span>
      ) : null}
    </>
  );
}

/** One locale's _gt payload, tokenized with the plate's own restraint:
    keys dim, punctuation faint, translated leaves lit. Every row carries
    its key as data-key; `hl` lifts the one row a pinned inspector points
    at. The button's value carries the live-edit slot (a bare text node
    plus caret) that the edit loop retypes in step with the rendered
    button above it. */
function PayloadJson({ loc, hl }: { loc: PreviewLoc; hl?: string }) {
  const p = PREVIEWS[loc];
  const K = ({ k }: { k: string }) => <span className='pl-k'>&quot;{k}&quot;</span>;
  const S = ({ s }: { s: string }) => <span className='pl-s'>&quot;{s}&quot;</span>;
  const flat: readonly (readonly [string, string])[] = [
    [HASHES.navOverview, p.nav[0]],
    [HASHES.navPayments, p.nav[1]],
    [HASHES.navReports, p.nav[2]],
    [HASHES.heading, p.heading],
    [HASHES.revenue, p.revenue],
    [HASHES.invoices, p.invoices],
    [HASHES.payout, p.payout],
  ];
  return (
    <pre className='tct-payload-code'>
      {'{\n'}
      {flat.map(([k, s]) => (
        <Fragment key={k}>
          {'  '}
          <span className='sgdh-pl-row' data-key={k} data-hl={hl === k || undefined}>
            <K k={k} />
            {': '}
            <S s={s} />
          </span>
          {',\n'}
        </Fragment>
      ))}
      {'  '}
      <span className='sgdh-pl-row' data-key={HASHES.button} data-hl={hl === HASHES.button || undefined}>
        <K k={HASHES.button} />
        {': '}
        <span className='pl-s'>
          &quot;
          <span data-edit-json>{p.button}</span>
          <i className='tct-caret sgdh-json-caret' data-edit-caret aria-hidden />
          &quot;
        </span>
      </span>
      {',\n  '}
      <span className='sgdh-pl-row' data-key={HASHES.toast} data-hl={hl === HASHES.toast || undefined}>
        <K k={HASHES.toast} />
        {': '}
        <S s={p.toast} />
      </span>
      {',\n  '}
      <span className='sgdh-pl-row' data-key={HASHES.sub} data-hl={hl === HASHES.sub || undefined}>
        <K k={HASHES.sub} />
        {': { "c": [{ "c": '}
        <S s={p.sub} />
        {', "i": 5, "t": "p" }] }'}
      </span>
      {'\n}'}
    </pre>
  );
}

/** Command lines type in character by character; static DOM stays complete. */
function Cmd({ text, mark }: { text: string; mark: string }) {
  return (
    <div className='tct-line'>
      <span className='tct-dollar'>$ </span>
      <span className={`tct-type ${mark}`}>
        {[...text].map((ch, i) => (
          <span key={`c${i}`}>{ch}</span>
        ))}
      </span>
    </div>
  );
}

/* "every" across maximally different writing systems — Latin, Japanese,
   Arabic, Devanagari, Cyrillic, Han, Hangul, Greek — short tokens so the
   re-measured line never wraps. Each word carries its BCP-47 tag so the
   hidden measurer and the live word shape with the same fonts; Arabic is
   flagged RTL so its run renders right-to-left inside the em's bidi
   isolate and can never reorder the sentence's trailing period. */
type EveryWord = { text: string; lang: string; rtl?: boolean };

const EVERY: readonly EveryWord[] = [
  { text: 'language', lang: 'en' },
  { text: '言語', lang: 'ja' },
  { text: 'لغة', lang: 'ar', rtl: true },
  { text: 'भाषा', lang: 'hi' },
  { text: 'язык', lang: 'ru' },
  { text: '语言', lang: 'zh' },
  { text: '언어', lang: 'ko' },
  { text: 'γλώσσα', lang: 'el' },
];

const EVERY_FALLBACK: EveryWord = EVERY[0] ?? { text: 'language', lang: 'en' };

/* the dissolve dust pool: small glyphs sampled across the same scripts */
const DUST = 'あ字كहξжか한グمัถイ고ρ'.split('');

export default function HomeHero() {
  const root = useRef<HTMLElement>(null);

  /* the terminal window's two faces + the preview's locale. The rendered
     product page is the DEFAULT face — the first fold leads with what
     shipping looks like; the transcript that produced it waits one seg
     click away. Faces only ever change by hand: nothing on the page calls
     setView except the seg's own pickView. */
  const [view, setView] = useState<'term' | 'preview'>('preview');
  const [ploc, setPloc] = useState<PreviewLoc>('es');
  /* the stack strip's selection: what the wizard's Detected line reports */
  const [stack, setStack] = useState<Stack>(DEFAULT_STACK);
  /* the open inspector: which component is naming its payload key. Hover
     opens it transiently (rectangle + chip); a CLICK pins it — the seam
     rolls open and the matching JSON row lifts until dismissed. */
  const [ins, setIns] = useState<{ k: RwKey; pin: boolean } | null>(null);
  const pinned = ins?.pin ? ins.k : null;
  /* One guided pass walks the preview's locales; the first manual
     interaction kills it for good — the reader has taken the controls. */
  const tour = useRef<gsap.core.Timeline | null>(null);
  const endTour = () => {
    tour.current?.kill();
    tour.current = null;
  };
  const pickView = (next: 'term' | 'preview') => {
    endTour();
    setView(next);
  };
  const pickLoc = (next: PreviewLoc) => {
    endTour();
    setPloc(next);
  };
  /* Picking a stack re-aims the wizard's Detected line. It deliberately
     does NOT switch faces — the reader alone flips the seg. */
  const pickStack = (next: Stack) => {
    endTour();
    setStack(next);
  };
  const insProps = (k: RwKey) => ({
    id: INS_IDS[k] ?? '',
    on: ins?.k === k,
    pin: pinned === k,
    /* hover never steals an open pin; unpinning falls back to hover state
       (the pointer is still on the mark), so the rectangle stays honest */
    onEnter: () => setIns((cur) => (cur?.pin || cur?.k === k ? cur : { k, pin: false })),
    onLeave: () => setIns((cur) => (cur && !cur.pin && cur.k === k ? null : cur)),
    onToggle: () => setIns((cur) => (cur?.pin && cur.k === k ? { k, pin: false } : { k, pin: true })),
  });
  /* The WHOLE component is the inspector's hit target — hovering anywhere
     on it raises the rectangle + chip, clicking anywhere on it pins (the
     mark stays the visual cue and the keyboard control; these wrappers
     are plain elements, so no button ever nests inside a button). Clicks
     that land on the mark itself are left to the mark's own toggle. */
  const insBox = (k: RwKey) => ({
    onMouseEnter: () => setIns((cur) => (cur?.pin || cur?.k === k ? cur : { k, pin: false })),
    onMouseLeave: () => setIns((cur) => (cur && !cur.pin && cur.k === k ? null : cur)),
    onClick: (e: ReactMouseEvent<HTMLElement>) => {
      if (e.target instanceof Element && e.target.closest('.sgdh-ins-mark')) return;
      setIns((cur) => (cur?.pin && cur.k === k ? { k, pin: false } : { k, pin: true }));
    },
  });

  /* ---- the slide-to-reveal cut ----
     Lives in a CSS var on the app card, so the seam's own drag/keys and
     the one-time intro tween all turn the same dial without re-rendering.
     The payload layer is pinned full-width under the render; the var only
     moves its clip boundary (hero-terminal.css), never its content. */
  const app = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  /* the drag hint's dismissal must re-render — the ref can't drive it */
  const [hinted, setHinted] = useState(false);
  const setCut = (pct: number) => {
    const el = app.current;
    if (!el) return;
    const next = Math.min(100, Math.max(0, pct));
    el.style.setProperty('--seam-cut', `${next}%`);
    el.querySelector('.tc-seam')?.setAttribute('aria-valuenow', String(Math.round(next)));
  };

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        /* the still must carry the whole argument: divider parked mid, both
           panes of the reveal legible */
        setCut(50);
        return;
      }

      gsap.from('[data-hero-in]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.07,
        ease: 'power2.out',
      });

      /* ---- the terminal session replays ----
         The DOM is complete before any tween runs (every animation is a
         `from`), so reduced motion and the no-JS still both show the whole
         finished transcript. The face starts hidden behind the preview,
         but the replay still runs beneath it and settles inside ~2.5s —
         whenever the reader flips the seg to Terminal they find a
         finished run, completion line, timing and all. */
      const counter = (sel: string, to: number, duration: number, decimals: number) => {
        const el = root.current?.querySelector<HTMLElement>(sel);
        if (!el) return gsap.to({}, { duration: 0 });
        const state = { v: 0 };
        el.textContent = (0).toFixed(decimals);
        return gsap.to(state, {
          v: to,
          duration,
          ease: 'power1.out',
          onUpdate: () => {
            el.textContent = state.v.toFixed(decimals);
          },
        });
      };

      /* One run, one clock: the ✓ timing here is the same 12.4s the Content
         section's terminal reports for this exact 640-translation run. */
      const run = gsap.timeline({ delay: 0.25, defaults: { ease: 'none' } });
      run
        .from('.tct-cmd1 span', { autoAlpha: 0, duration: 0.01, stagger: 0.012 })
        .from('[data-tw]', { autoAlpha: 0, duration: 0.16, stagger: 0.07 }, '+=0.06')
        .from('.tct-cmd2 span', { autoAlpha: 0, duration: 0.01, stagger: 0.012 }, '+=0.07')
        .from('[data-ts]', { autoAlpha: 0, duration: 0.16, stagger: 0.09 }, '+=0.06')
        .add(counter('[data-count-scan]', 128, 0.4, 0), '<')
        .from('[data-tr-src]', { autoAlpha: 0, duration: 0.14, stagger: 0.06 }, '+=0.05')
        .from('.tct-cell', { autoAlpha: 0, y: 5, duration: 0.22, ease: 'power1.out', stagger: 0.05 }, '<+=0.08')
        .from('[data-td]', { autoAlpha: 0, duration: 0.16, stagger: 0.09 }, '+=0.06')
        .add(counter('[data-count-time]', 12.4, 0.4, 1), '<');

      /* ---- the long tail keeps arriving ----
         Both cycling cells advance IN STEP — one heartbeat for the whole
         column, de → fr → zh: the outgoing variants are fully gone before
         the incoming pair lands. */
      const cycCells = gsap.utils.toArray<HTMLElement>('.tct-cyc', root.current);
      const cycGroups = cycCells.map((cell) => gsap.utils.toArray<HTMLElement>('[data-cyc]', cell));
      const steps = cycGroups[0]?.length ?? 0;
      if (steps > 1) {
        const cyc = gsap.timeline({ repeat: -1, delay: run.duration() + 2.2 });
        for (let i = 0; i < steps; i += 1) {
          const going = cycGroups.map((g) => g[i]).filter((el): el is HTMLElement => Boolean(el));
          const coming = cycGroups.map((g) => g[(i + 1) % steps]).filter((el): el is HTMLElement => Boolean(el));
          cyc
            .to(going, { autoAlpha: 0, duration: 0.24, ease: 'power1.in' }, '+=2.7')
            .to(coming, { autoAlpha: 1, duration: 0.28, ease: 'power1.out' }, '>');
        }
      }

      /* ---- one guided pass through the locales ----
         The preview IS the first fold now, so the tour never touches the
         seg: after the es page has owned the window long enough to be the
         first fold's still, it walks the locales — es → ja → de — each
         step retyping the page line by line, and rests where it lands.
         It never switches faces; only the reader's own seg click does.
         Any manual input kills this timeline before it acts. */
      const guided = gsap.timeline({ delay: run.duration() + 4.2 });
      guided
        .call(() => setPloc('ja'))
        .to({}, { duration: 2.4 })
        .call(() => setPloc('de'))
        .to({}, { duration: 2.4 })
        .call(() => {
          tour.current = null;
        });
      tour.current = guided;

      /* The one loop on the page: the output column cycles locales, slowly.
         The two strings share a grid cell, so the outgoing one has to be gone
         before the incoming one arrives — crossfaded, a still catches 日本語
         printed through Spanish, which is the glyph soup this page is otherwise
         careful never to show. */
      /* The headline hinge is a measuring instrument. Each cycle: the bound
         guides appear around the current word; the word dissolves while the
         dust scatters; the bounds tween to the NEXT word's measured width
         first — scoping the layout shift before any text exists — then the
         dust converges and the new word forms inside the prepared bounds.
         The doubled underline re-measures with the em at constant gauge.

         Width discipline (the founder's standard): the width the sentence
         reflows around is always the WHOLE SHAPED word — a hidden probe
         carrying the word's own lang/dir and the em's inherited type — never
         a sum of per-character boxes, which disconnects Arabic joining
         (isolated forms measure ~37% wider than the shaped word) and splits
         Devanagari matras off their consonants. The em's width is the only
         layout-affecting property that ever animates: it holds the shaped
         width at rest (never snapping back to 'auto'), glides through ONE
         continuous device-pixel-snapped tween per cycle so the trailing
         period only ever glides, and re-measures when the fonts arrive or
         the clamp()ed type resizes. */
      const em = root.current?.querySelector<HTMLElement>('[data-every]');
      const word = root.current?.querySelector<HTMLElement>('[data-every-word]');
      const compactEvery = window.matchMedia('(max-width: 720px)').matches;
      let everyCleanup: (() => void) | undefined;
      if (em && word) {
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const snapPx = (w: number) => Math.round(w * dpr) / dpr;
        const widthCache = new Map<string, number>();
        const measure = (w: EveryWord) => {
          const hit = widthCache.get(w.text);
          if (hit !== undefined) return hit;
          const probe = document.createElement('span');
          probe.style.cssText =
            'visibility:hidden;position:absolute;left:-9999px;top:0;white-space:nowrap;';
          probe.setAttribute('lang', w.lang);
          probe.setAttribute('dir', w.rtl ? 'rtl' : 'ltr');
          probe.textContent = w.text;
          em.appendChild(probe);
          const width = snapPx(probe.getBoundingClientRect().width);
          probe.remove();
          widthCache.set(w.text, width);
          return width;
        };
        /* the live word is ONE shaped text node — lang for font selection,
           dir so the RTL run renders right-to-left inside its isolate */
        const showWord = (w: EveryWord) => {
          word.textContent = w.text;
          word.setAttribute('lang', w.lang);
          word.setAttribute('dir', w.rtl ? 'rtl' : 'ltr');
        };
        let idx = 0;
        let morphing = false;
        const holdWidth = () => {
          em.style.width = `${measure(EVERY[idx] ?? EVERY_FALLBACK)}px`;
        };
        const remeasure = () => {
          if (!em.isConnected) return;
          widthCache.clear();
          if (!morphing) holdWidth();
        };
        window.addEventListener('resize', remeasure);
        void document.fonts.ready.then(remeasure);
        everyCleanup = () => window.removeEventListener('resize', remeasure);
        holdWidth();

        if (compactEvery) {
          /* At mobile scale 26 particles cannot breathe: a clean measured
             crossfade tells the same story. */
          const compactSwap = () => {
            if (!root.current || !root.current.isConnected) return;
            idx = (idx + 1) % EVERY.length;
            const next = EVERY[idx] ?? EVERY_FALLBACK;
            const w1 = measure(next);
            morphing = true;
            gsap.to(word, {
              autoAlpha: 0,
              duration: 0.2,
              ease: 'power2.in',
              onComplete: () => {
                showWord(next);
                gsap.to(em, {
                  width: w1,
                  duration: 0.5,
                  ease: 'power2.inOut',
                  snap: { width: 1 / dpr },
                  onComplete: () => {
                    morphing = false;
                    holdWidth();
                  },
                });
                gsap.to(word, { autoAlpha: 1, duration: 0.24, ease: 'power2.out', delay: 0.18 });
                gsap.delayedCall(2.4, compactSwap);
              },
            });
          };
          gsap.delayedCall(1.8, compactSwap);
        } else {
          const guideL = document.createElement('span');
          guideL.className = 'tc-eg is-l';
          const guideR = document.createElement('span');
          guideR.className = 'tc-eg is-r';
          const dust = document.createElement('span');
          dust.className = 'tc-edust';
          for (let i = 0; i < 44; i++) {
            const g = document.createElement('span');
            g.textContent = DUST[i % DUST.length] ?? '';
            dust.appendChild(g);
          }
          em.append(guideL, guideR, dust);
          const dustGlyphs = Array.from(dust.children) as HTMLElement[];

          /* Sample the incoming word's letterforms: draw it on an offscreen
             canvas at the em's own font and collect dark-pixel positions. The
             dust converges onto these points, so the glyphs sketch the shapes
             of the characters before the characters themselves fill in. */
          const sampleShape = (text: string, width: number, height: number, count: number) => {
            const style = getComputedStyle(word);
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(width, 10);
            canvas.height = Math.max(height, 10);
            const ctx = canvas.getContext('2d');
            if (!ctx) return [];
            ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
            ctx.textBaseline = 'alphabetic';
            ctx.fillText(text, 0, canvas.height * 0.85);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            const pts: { x: number; y: number }[] = [];
            const step = 3;
            for (let y = 0; y < canvas.height; y += step) {
              for (let x = 0; x < canvas.width; x += step) {
                if ((img[(y * canvas.width + x) * 4 + 3] ?? 0) > 128) pts.push({ x, y });
              }
            }
            // spread the picks across the whole word rather than clustering
            const picked: { x: number; y: number }[] = [];
            if (pts.length) {
              const stride = Math.max(1, Math.floor(pts.length / count));
              for (let i = 0; i < pts.length && picked.length < count; i += stride) {
                const pt = pts[i];
                if (pt) picked.push(pt);
              }
            }
            return picked;
          };

          const swap = () => {
            if (!root.current || !root.current.isConnected) return;
            const w0 = measure(EVERY[idx] ?? EVERY_FALLBACK);
            idx = (idx + 1) % EVERY.length;
            const next = EVERY[idx] ?? EVERY_FALLBACK;
            const w1 = measure(next);
            morphing = true;
            const tl = gsap.timeline({
              onComplete: () => {
                morphing = false;
                /* re-assert from a fresh cache in case fonts or viewport
                   moved mid-morph — otherwise the same value: nothing snaps */
                holdWidth();
                gsap.delayedCall(2.2, swap);
              },
            });

            // 1. the instrument appears around the current word
            tl.to([guideL, guideR], { opacity: 0.4, duration: 0.18, ease: 'none' });

            // 2. the word dissolves as ONE shaped run — splitting it into
            //    per-character spans would disconnect Arabic and reflow the
            //    very width the sentence is standing on — while the dust
            //    carries the scatter
            tl.to(word, {
              autoAlpha: 0,
              scale: 0.92,
              transformOrigin: '50% 60%',
              duration: 0.3,
              ease: 'power2.in',
            }, '+=0.05');
            /* the cloud separates SYMMETRICALLY about the word's centre: each
               glyph takes an evenly-spread angle on a jittered ring, so the
               scatter is balanced instead of clumping off to one side */
            const h0 = em.offsetHeight;
            const ring = (w: number) => (g: HTMLElement, i: number) => {
              const angle = (i / dustGlyphs.length) * Math.PI * 2 + gsap.utils.random(-0.2, 0.2);
              const rx = gsap.utils.random(0.18, 0.44) * w;
              const ry = gsap.utils.random(6, h0 * 0.26);
              return {
                // clamped so no glyph ever leaves the measured bounds
                x: gsap.utils.clamp(3, w - 3, w / 2 + Math.cos(angle) * rx),
                y: gsap.utils.clamp(h0 * 0.04, h0 * 0.4, h0 * 0.22 + Math.sin(angle) * ry),
              };
            };
            const place0 = ring(Math.max(w0, 30));
            tl.to(dustGlyphs, {
              autoAlpha: () => gsap.utils.random(0.35, 0.8),
              x: (i, g) => place0(g as HTMLElement, i).x,
              y: (i, g) => place0(g as HTMLElement, i).y,
              duration: 0.26,
              stagger: 0.012,
              ease: 'power1.out',
            }, '<+=0.1');

            // 3. the bounds glide to the incoming word's shaped width — ONE
            //    continuous tween, quantized to device pixels, so the period
            //    and everything after it track without buzz or end snap
            tl.to(em, { width: w1, duration: 0.7, ease: 'power2.inOut', snap: { width: 1 / dpr } });
            const place1 = ring(Math.max(w1, 30));
            tl.to(dustGlyphs, {
              x: (i, g) => place1(g as HTMLElement, i).x,
              y: (i, g) => place1(g as HTMLElement, i).y,
              duration: 0.7,
              ease: 'power2.inOut',
            }, '<');

            // 4. the dust assembles the SHAPES of the incoming characters —
            //    each glyph flies to a sampled point on the new letterforms —
            //    then the word fills the silhouette in as one shaped run,
            //    behind a wipe that enters from the script's reading side.
            tl.add(() => {
              const h = em.offsetHeight;
              const pts = sampleShape(next.text, w1, h, dustGlyphs.length);
              dustGlyphs.forEach((g, i) => {
                const pt = pts[i % Math.max(pts.length, 1)] || { x: w1 / 2, y: h / 2 };
                gsap.to(g, {
                  x: pt.x,
                  y: pt.y - h * 0.4,
                  autoAlpha: 0.9,
                  duration: 0.38,
                  ease: 'power3.inOut',
                  delay: i * 0.008,
                });
              });
              gsap.delayedCall(0.42, () => {
                showWord(next);
                gsap.fromTo(
                  word,
                  {
                    autoAlpha: 0,
                    scale: 1,
                    clipPath: next.rtl ? 'inset(-15% 0% -15% 100%)' : 'inset(-15% 100% -15% 0%)',
                  },
                  {
                    autoAlpha: 1,
                    clipPath: 'inset(-15% 0% -15% 0%)',
                    duration: 0.34,
                    ease: 'power2.out',
                    onComplete: () => {
                      gsap.set(word, { clearProps: 'clipPath' });
                    },
                  }
                );
                gsap.to(dustGlyphs, { autoAlpha: 0, duration: 0.26, stagger: 0.006, ease: 'power1.out', delay: 0.08 });
              });
            });
            tl.to({}, { duration: 0.85 });

            // 5. the instrument withdraws
            tl.to([guideL, guideR], { opacity: 0, duration: 0.24, ease: 'none' }, '>-0.05');
          };

          /* The first dissolve waits out the first-fold capture window: any
             still taken while the run settles shows the word whole, not dust. */
          gsap.delayedCall(1.8, swap);
        }
      }

      return everyCleanup;
    },
    { scope: root }
  );

  /* ---- language switching rewrites the page, line by line ----
     When the locale changes, every localized line deletes the string it
     was showing and types the new one — staggered top to bottom, the
     whole swap inside ~0.9s (the ReviewWorkspace character-slice
     pattern). React has already stamped the new locale's full strings
     into the DOM by the time this layout effect runs, so each line is
     first restored to what it actually displayed — the `shown` ledger.
     Interrupts leave partials in that ledger, and the partial is what
     the next swap deletes: never a torn splice. Slicing is by code
     points and every line stays ONE text node — no per-character spans,
     so CJK shaping and direction are untouched. The Intl figures and
     the payload pane swap as numerals should: no typing, one rise in
     step. Reduced motion keeps React's own instant swap. */
  const shown = useRef<Partial<Record<RwKey, string>>>({});
  const prevLoc = useRef<PreviewLoc>(ploc);
  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      const prev = prevLoc.current;
      prevLoc.current = ploc;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const lineEl = (key: RwKey) => scope.querySelector<HTMLElement>(`[data-rw='${key}']`);

      if (prev === ploc || reduced) {
        /* first paint, or an instant swap: React's render is the truth */
        RW_LINES.forEach(({ key, read }) => {
          shown.current[key] = read(ploc);
        });
      } else {
        const tl = gsap.timeline({ defaults: { ease: 'none' } });
        RW_LINES.forEach(({ key, read }, i) => {
          const el = lineEl(key);
          if (!el) return;
          const from = Array.from(shown.current[key] ?? read(prev));
          const to = Array.from(read(ploc));
          const write = (s: string) => {
            el.textContent = s;
            shown.current[key] = s;
          };
          /* restore the pre-swap text before paint, then animate */
          write(from.join(''));
          const at = i * 0.05;
          const dial = { n: from.length };
          tl.to(
            dial,
            {
              n: 0,
              duration: gsap.utils.clamp(0.06, 0.12, from.length * 0.01),
              ease: 'power1.in',
              onUpdate: () => write(from.slice(0, Math.round(dial.n)).join('')),
            },
            at
          );
          tl.to(
            dial,
            {
              n: to.length,
              duration: gsap.utils.clamp(0.14, 0.3, to.length * 0.016),
              onUpdate: () => write(to.slice(0, Math.round(dial.n)).join('')),
            },
            '>+0.02'
          );
        });
        tl.fromTo(
          '[data-rwf]',
          { autoAlpha: 0.15 },
          { autoAlpha: 1, duration: 0.3, ease: 'power1.out', stagger: 0.05, immediateRender: false },
          0.1
        );
      }

      if (reduced) return;

      /* ---- the living file: the JSON edits itself, the page follows ----
         On a quiet cadence one value line in the payload is re-edited in
         place — the caret rises, the translated string deletes and
         retypes to a second plausible wording, then back next cycle —
         and the rendered button rewrites in the SAME tween: one dial
         writes both text nodes, so the file and the UI can never
         disagree. Registered in this effect so a locale switch kills it
         cleanly and rebuilds it with the new locale's pair. */
      const ui = lineEl('button');
      const js = scope.querySelector<HTMLElement>('[data-edit-json]');
      const caret = scope.querySelector<HTMLElement>('[data-edit-caret]');
      if (!ui || !js || !caret) return;
      const writeBoth = (s: string) => {
        ui.textContent = s;
        js.textContent = s;
        shown.current.button = s;
      };
      const editSwap = (tl: gsap.core.Timeline, fromS: string, toS: string, at: number | string) => {
        const from = Array.from(fromS);
        const to = Array.from(toS);
        const dial = { n: from.length };
        tl.set(caret, { autoAlpha: 1 }, at);
        tl.to(
          dial,
          {
            n: 0,
            duration: Math.max(0.3, from.length * 0.035),
            ease: 'none',
            onUpdate: () => writeBoth(from.slice(0, Math.round(dial.n)).join('')),
          },
          '>+0.4'
        );
        tl.to(
          dial,
          {
            n: to.length,
            duration: Math.max(0.4, to.length * 0.05),
            ease: 'none',
            onUpdate: () => writeBoth(to.slice(0, Math.round(dial.n)).join('')),
          },
          '>+0.3'
        );
        tl.to({}, { duration: 0.8 });
        tl.set(caret, { autoAlpha: 0 });
      };
      /* first edit waits out the first-fold capture window (a still taken
         ~3s in must show the resting page, not a half-typed button) */
      const loop = gsap.timeline({ repeat: -1, delay: 4.9, repeatDelay: 5.5 });
      editSwap(loop, PREVIEWS[ploc].button, BUTTON_ALTS[ploc], 0);
      editSwap(loop, BUTTON_ALTS[ploc], PREVIEWS[ploc].button, '+=5.5');
    },
    { scope: root, dependencies: [ploc] }
  );

  /* The Detected line re-settles the same way when a stack is picked. */
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.fromTo(
        '[data-detected]',
        { autoAlpha: 0.25 },
        { autoAlpha: 1, duration: 0.32, ease: 'power1.out' }
      );
    },
    { scope: root, dependencies: [stack] }
  );

  /* The reveal announces itself once per entry: the payload pane eases open
     to its 70/30 rest. Skipped after the reader has taken the divider, and
     under reduced motion (where the cut is parked mid, statically). */
  useGSAP(
    () => {
      if (view !== 'preview' || dragged.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const dial = { v: 96 };
      gsap.to(dial, {
        v: 70,
        duration: 0.85,
        delay: 0.25,
        ease: 'power3.out',
        onUpdate: () => setCut(dial.v),
      });
    },
    { scope: root, dependencies: [view] }
  );

  /* ---- a pinned inspector rolls the seam open ----
     Clicking a mark drives the SAME dial RevealSeam's drag writes
     (setCut: the --seam-cut var + the slider's aria-valuenow), tweened
     from wherever the seam currently rests to a cut that exposes the
     payload pane — so the highlighted row is readable the moment it
     lifts. Dismissing eases the seam back to its 70/30 rest (the pane
     was borrowed for inspection; the page face is the resting state).
     Pin-to-pin switches keep the seam open and only move the highlight.
     While pinned, Escape and any pointer-down outside a mark dismiss.
     Reduced motion jump-cuts both ways. */
  const wasPinned = useRef<RwKey | null>(null);
  useGSAP(
    () => {
      const was = wasPinned.current;
      wasPinned.current = pinned;
      const el = app.current;
      if (!el || Boolean(pinned) === Boolean(was)) return;
      /* the reader is inspecting: the tour must not rewrite the row under
         them, and the reveal intro must not re-roll a seam they now own */
      endTour();
      dragged.current = true;
      const target = pinned ? 26 : 70;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setCut(target);
      } else {
        const now = parseFloat(getComputedStyle(el).getPropertyValue('--seam-cut'));
        const dial = { v: Number.isFinite(now) ? now : 70 };
        gsap.to(dial, {
          v: target,
          duration: 0.6,
          ease: 'power2.inOut',
          onUpdate: () => setCut(dial.v),
        });
      }
      if (!pinned) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIns(null);
      };
      const onDown = (e: PointerEvent) => {
        const t = e.target;
        /* clicks on any inspectable component (or the seam) are theirs to
           handle — only truly-elsewhere pointer-downs dismiss the pin */
        if (t instanceof Element && (t.closest('.sgdh-ins') || t.closest('.tc-seam'))) return;
        setIns(null);
      };
      document.addEventListener('keydown', onKey);
      document.addEventListener('pointerdown', onDown);
      return () => {
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('pointerdown', onDown);
      };
    },
    { scope: root, dependencies: [pinned] }
  );

  return (
    <section className='tc-sec tch-hero-sec' id='top' ref={root}>
      {/* The founder's stack: a genuine white card — radius 12, hairline edge,
          inset on the section's second-surface ground — above the SQUARE
          full-width band; the trust row repeats the card below it. */}
      <div className='tc-hero tch-card'>
        {/* Two authored lines rather than a wrap: "Launch in / every language."
            — the accented word opens line two, on the hinge of the sentence. */}
        <h1 data-hero-in>
          <span>
            Launch in every{' '}
            <em data-every>
              <span data-every-word lang='en' dir='ltr'>
                language
              </span>
            </em>
            .
          </span>
        </h1>

        <p className='tc-hero-sub' data-hero-in>
          General Translation builds full-stack infrastructure for localizing apps, docs, and websites.
        </p>

        <div className='tc-hero-acts' data-hero-in>
          <span className='tch-cta'>
            <a className='tc-btn tc-btn-solid' href='#deploy'>
              Get started
              <ArrowRight aria-hidden size={15} strokeWidth={2} />
            </a>
          </span>
          <a className='tc-btn tc-btn-line' href='https://generaltranslation.com/docs'>
            Docs
          </a>
        </div>
      </div>

      {/* The first viewport commits to a material the way the references do:
          the terminal band is a dark plate washed with the prismatic field —
          lit at the flanks, dark in the centre column where the transcript
          sits (the viteplus grammar: a #101010 terminal flanked by lit panels).
          The band itself stays square and full-width; only the window inside
          it keeps the measured top corners and ring. exposureScale is raised
          (= dimmer) so the flanks wash rather than saturate. */}
      <div className='tc-hero-cell tch-band'>
        <PrismaticField className='tc-hero-field tch-field' preset='1' speed={0.5} params={{ exposureScale: 3400 }} />
        <div className='tct-win' data-hero-in>
          <div className='tct-bar'>
            <span className='tct-title'>GT - Translate</span>
            {/* Preview leads the seg — it is the window's default face */}
            <div className='tct-seg' role='group' aria-label='Show the run as'>
              <button type='button' data-on={view === 'preview'} onClick={() => pickView('preview')}>
                <Eye aria-hidden size={13} strokeWidth={1.8} />
                Preview
              </button>
              <button type='button' data-on={view === 'term'} onClick={() => pickView('term')}>
                <TerminalSquare aria-hidden size={13} strokeWidth={1.8} />
                Terminal
              </button>
            </div>
          </div>

          {/* the stack strip: window furniture, directly under the bar — the
              selected stack is what the wizard detects below. It carries
              id='frameworks' because it IS this page's frameworks content:
              the shared sections' #frameworks links land here. */}
          <div className='sgdh-stacks' id='frameworks' role='group' aria-label='Choose your stack'>
            {STACKS.map((s) => {
              const Mark = STACK_MARKS[s.name];
              return (
                <button type='button' key={s.name} data-on={stack.name === s.name} onClick={() => pickStack(s)}>
                  {Mark ? <Mark className='sgdh-stack-mark' color='currentColor' aria-hidden /> : null}
                  <span>{s.name}</span>
                </button>
              );
            })}
          </div>

          <div className='tct-stage'>
            {/* face 1 — the session */}
            <div className='tct-face tct-face-term' data-on={view === 'term'} aria-hidden={view !== 'term'}>
              <div className='tct-body'>
                <Cmd text='npx gt@latest' mark='tct-cmd1' />
                <div className='tct-gap' />
                <div className='tct-line' data-tw>
                  <span className='tct-key'>{`  ${'Detected'.padEnd(11)}`}</span>
                  <span data-detected>{stack.detected}</span>
                </div>
                {WIZARD.map((line) => (
                  <div className='tct-line' data-tw key={line.key}>
                    <span className='tct-key'>{`  ${line.key.padEnd(11)}`}</span>
                    {line.locs ? (
                      <span className='tct-locset'>
                        {line.locs.map((loc) => (
                          <i className='tct-chip' key={loc}>
                            <LocaleTag code={loc} />
                          </i>
                        ))}
                      </span>
                    ) : line.src ? (
                      <span className='tct-locset'>
                        <i className='tct-chip is-src'>
                          <LocaleTag code={line.src} />
                        </i>
                      </span>
                    ) : (
                      line.text
                    )}
                  </div>
                ))}
                <div className='tct-gap' />

                <Cmd text='npx gt translate' mark='tct-cmd2' />
                <div className='tct-gap' />
                <div className='tct-line tct-meta' data-ts>
                  {'  Scanning src — '}
                  <b className='tct-strong' data-count-scan>
                    128
                  </b>
                  {' strings found'}
                </div>
                <div className='tct-line tct-meta' data-ts>
                  {'  Translating with project context'}
                </div>
                <div className='tct-gap' />

                <div className='tct-table'>
                  {ROWS.map((row) => (
                    <div className='tct-row' key={row.src}>
                      <span className='tct-src' data-tr-src>
                        {row.src}
                      </span>
                      {row.cells.map((cell, c) => {
                        const only = cell.length === 1 ? cell[0] : undefined;
                        return only ? (
                          <span className='tct-cell' key={only.loc}>
                            <i className='tct-chip'>
                              <LocaleTag code={only.loc} />
                            </i>
                            <b className='tct-tr'>{only.text}</b>
                          </span>
                        ) : (
                          <span className='tct-cell tct-cyc' key={`cyc${c}`}>
                            {cell.map((v, i) => (
                              <span data-cyc key={v.loc} style={{ opacity: i === 0 ? 1 : 0 }}>
                                <i className='tct-chip'>
                                  <LocaleTag code={v.loc} />
                                </i>
                                <b className='tct-tr'>{v.text}</b>
                              </span>
                            ))}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className='tct-gap' />

                <div className='tct-line tct-meta' data-td>
                  {'  Wrote public/_gt/'}
                  <span className='tct-glob'>{'{es,fr,ja,de,zh}'}</span>
                  {'.json'}
                </div>
                <div className='tct-line tct-meta' data-td>
                  {'  '}
                  <span className='tct-ok'>✓</span>
                  {' '}
                  <b className='tct-strong'>640</b>
                  {' translations · 5 locales · '}
                  <span className='tct-ok'>
                    <b data-count-time>12.4</b>s
                  </span>
                </div>
                <div className='tct-gap' />
                <div className='tct-line' data-td>
                  <span className='tct-dollar'>$ </span>
                  <span className='tct-caret' />
                </div>
              </div>
            </div>

            {/* face 2 — the default: the run's strings rendered as the
                product page they ship to */}
            <div className='tct-face tct-face-prev' data-on={view === 'preview'} aria-hidden={view !== 'preview'}>
              <div className='tct-tabs' role='group' aria-label='Preview locale'>
                {PREVIEW_LOCS.map((loc) => (
                  <button type='button' data-on={ploc === loc} key={loc} onClick={() => pickLoc(loc)}>
                    <LocaleTag code={loc} />
                  </button>
                ))}
              </div>

              {/* The rendered page carries the house slide-to-reveal: the
                  payload gt wrote sits pinned full-width UNDER the render,
                  and the seam (the logo's doubled line, each thread in its
                  surface's own ink) only moves the clip boundary — dragging
                  reveals the artifact in place, edge to edge. Everything
                  that matters clusters LEFT of the resting cut, so the
                  payload's teaser strip never covers a line. */}
              <div className='tct-app' ref={app} lang={ploc} style={{ '--seam-cut': '70%' } as CSSProperties}>
                <div className='tct-app-addr'>
                  example.com/<b data-rw='addr'>{ploc}</b>
                </div>

                {/* the app's own chrome: wordmark + localized nav */}
                <div className='sgdh-app-chrome'>
                  <span className='sgdh-app-mark'>
                    <i aria-hidden />
                    Acme
                  </span>
                  <nav className='sgdh-app-nav' aria-label='Product navigation'>
                    <span className='sgdh-app-navi is-on sgdh-ins' data-ins-on={ins?.k === 'nav0' || undefined} {...insBox('nav0')}>
                      <b data-rw='nav0'>{PREVIEWS[ploc].nav[0]}</b>
                      <InsMark {...insProps('nav0')} />
                    </span>
                    <span className='sgdh-app-navi sgdh-ins' data-ins-on={ins?.k === 'nav1' || undefined} {...insBox('nav1')}>
                      <b data-rw='nav1'>{PREVIEWS[ploc].nav[1]}</b>
                      <InsMark {...insProps('nav1')} />
                    </span>
                    <span className='sgdh-app-navi sgdh-ins' data-ins-on={ins?.k === 'nav2' || undefined} {...insBox('nav2')}>
                      <b data-rw='nav2'>{PREVIEWS[ploc].nav[2]}</b>
                      <InsMark {...insProps('nav2')} />
                    </span>
                  </nav>
                </div>

                <div className='tct-app-main'>
                  <h3 className='tct-app-h sgdh-ins' data-ins-on={ins?.k === 'heading' || undefined} {...insBox('heading')}>
                    <span data-rw='heading'>{PREVIEWS[ploc].heading}</span>
                    <InsMark {...insProps('heading')} />
                  </h3>
                  <p className='tct-app-copy sgdh-ins' data-ins-on={ins?.k === 'sub' || undefined} {...insBox('sub')}>
                    <span data-rw='sub'>{PREVIEWS[ploc].sub}</span>
                    <InsMark {...insProps('sub')} />
                  </p>

                  {/* the stats row: labels are payload strings, values are
                      live Intl output — currency, count, date */}
                  <dl className='sgdh-app-stats'>
                    <div className='sgdh-app-stat sgdh-ins' data-ins-on={ins?.k === 'revenue' || undefined} {...insBox('revenue')}>
                      <dt data-rw='revenue'>{PREVIEWS[ploc].revenue}</dt>
                      <dd data-rwf>{fmtRevenue(ploc)}</dd>
                      <InsMark {...insProps('revenue')} />
                    </div>
                    <div className='sgdh-app-stat sgdh-ins' data-ins-on={ins?.k === 'invoices' || undefined} {...insBox('invoices')}>
                      <dt data-rw='invoices'>{PREVIEWS[ploc].invoices}</dt>
                      <dd data-rwf>{fmtInvoices(ploc)}</dd>
                      <InsMark {...insProps('invoices')} />
                    </div>
                    <div className='sgdh-app-stat sgdh-ins' data-ins-on={ins?.k === 'payout' || undefined} {...insBox('payout')}>
                      <dt data-rw='payout'>{PREVIEWS[ploc].payout}</dt>
                      <dd data-rwf>{fmtPayout(ploc)}</dd>
                      <InsMark {...insProps('payout')} />
                    </div>
                  </dl>

                  <span className='tct-app-btn sgdh-ins' data-ins-on={ins?.k === 'button' || undefined} {...insBox('button')}>
                    <span data-rw='button'>{PREVIEWS[ploc].button}</span>
                    <InsMark {...insProps('button')} />
                  </span>
                  <div className='tct-app-toast sgdh-ins' data-ins-on={ins?.k === 'toast' || undefined} {...insBox('toast')}>
                    <i>✓</i>
                    <span data-rw='toast'>{PREVIEWS[ploc].toast}</span>
                    <InsMark {...insProps('toast')} />
                  </div>
                </div>

                <div className='tct-payload' data-rwf aria-hidden>
                  <div className='tct-payload-file'>public/_gt/{ploc}.json</div>
                  <PayloadJson loc={ploc} hl={pinned ? INS_IDS[pinned] : undefined} />
                </div>

                {/* the seam advertises itself until the reader has dragged
                    once — and steps aside while an inspector holds the pane */}
                <span aria-hidden className='tch-drag-hint' data-hide={hinted || pinned !== null || undefined}>
                  ↔ drag
                </span>
                <RevealSeam
                  boxRef={app}
                  ariaLabel='Reveal the served translation file'
                  onInteract={() => {
                    endTour();
                    dragged.current = true;
                    setHinted(true);
                  }}
                />
              </div>

              <p className='tct-prev-note'>
                served from <b>public/_gt/{ploc}.json</b> — drag the seam
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='tc-trust tch-trustcard'>
        <p className='tc-trust-lead'>Trusted by the world&rsquo;s best companies</p>
        <div className='tc-trust-row'>
          {CUSTOMERS.map((customer) => (
            <span className='tc-trust-cell' key={customer.name}>
              <b className={`tc-wm ${customer.mark}`}>{customer.name}</b>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
