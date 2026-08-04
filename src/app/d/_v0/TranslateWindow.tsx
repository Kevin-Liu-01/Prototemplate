'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';

import { Eye, TerminalSquare } from 'lucide-react';
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

import LocaleTag, { localeFlag } from '@/app/d/toolchain/components/LocaleTag';

import RevealSeam from '@/app/d/toolchain/sections/RevealSeam';

import '@/app/d/toolchain/sections/chip-consistency.css';
import '@/app/d/toolchain/sections/hero-terminal.css';
import './translate-window.css';

gsap.registerPlugin(useGSAP);

/* ------------------------------------------------------------------
   THE TRANSLATE WINDOW — the dossier hero's windowed demo, extracted
   whole so any home can mount it. One window, ONE bar row: no title —
   the strip ZONE fills the bar from its left edge to the
   right-anchored seg, and its contents swap with the face: the
   framework strip rides the Terminal face (it is wizard furniture —
   it feeds the Detected line), and an INFINITE LOCALE BELT owns the
   zone on Preview — a slow conveyor of locale chips whose crossing of
   the ZONE's centre drives the whole demo: the
   rendered product page retypes line by line and the payload JSON's
   translated leaves retype with it, from the same dial. Inspector
   marks bridge each component to its payload key, and the
   slide-to-reveal seam pulls the render back to the served
   public/_gt/[locale].json. The window is self-contained: its own
   state, timelines and styles ride along (hero-terminal.css is the
   shared window sheet; the window-only rules live in
   translate-window.css under the .v0-tw root class).
   ------------------------------------------------------------------ */

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
   tabs in the bar's strip zone while the Terminal face is up; the selected
   stack is what the wizard's Detected line reports, so the claim is
   demonstrated by the same transcript instead of asserted by a
   separate section.
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
   greeting, live figures, the button the transcript just
   translated). The locale roster is the belt's: fifteen locales, and
   every one of them is a complete, correct screen — all seven source
   strings faithfully translated, the figures real Intl output.
   English sources: 'Overview' / 'Payments' / 'Reports' · 'Welcome
   back' · 'Your account activity this week.' · 'Revenue' /
   'Invoices' / 'Next payout' · 'Get started'.

   ar/he are deliberately absent: the mock's whole composition
   clusters LEFT of the resting seam cut, and an honest RTL page
   mirrors — which would park its copy under the payload's teaser
   strip. Until the seam learns to flip sides, RTL stays out rather
   than shipping a wrong-reading screen.
   ------------------------------------------------------------------ */

type PreviewLoc =
  | 'es'
  | 'ja'
  | 'fr'
  | 'ko'
  | 'de'
  | 'zh'
  | 'pt'
  | 'ru'
  | 'it'
  | 'hi'
  | 'nl'
  | 'tr'
  | 'sv'
  | 'id'
  | 'pl';

/** The belt's running order — scripts interleaved so the strip reads
    as the world, not as Europe first. es leads: it is the first fold. */
const BELT_LOCS: readonly PreviewLoc[] = [
  'es',
  'ja',
  'fr',
  'ko',
  'de',
  'zh',
  'pt',
  'ru',
  'it',
  'hi',
  'nl',
  'tr',
  'sv',
  'id',
  'pl',
];

type PreviewCopy = {
  nav: readonly [string, string, string];
  heading: string;
  sub: string;
  revenue: string;
  invoices: string;
  payout: string;
  button: string;
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
  },
  ja: {
    nav: ['概要', '支払い', 'レポート'],
    heading: 'おかえりなさい',
    sub: '今週のアカウントのアクティビティです。',
    revenue: '売上',
    invoices: '請求書',
    payout: '次回の入金',
    button: '始める',
  },
  fr: {
    nav: ['Aperçu', 'Paiements', 'Rapports'],
    heading: 'Bon retour',
    sub: 'L’activité de votre compte cette semaine.',
    revenue: 'Revenus',
    invoices: 'Factures',
    payout: 'Prochain virement',
    button: 'Commencer',
  },
  ko: {
    nav: ['개요', '결제', '보고서'],
    heading: '다시 오신 것을 환영합니다',
    sub: '이번 주 계정 활동입니다.',
    revenue: '수익',
    invoices: '청구서',
    payout: '다음 지급일',
    button: '시작하기',
  },
  de: {
    nav: ['Übersicht', 'Zahlungen', 'Berichte'],
    heading: 'Willkommen zurück',
    sub: 'Ihre Kontoaktivität in dieser Woche.',
    revenue: 'Umsatz',
    invoices: 'Rechnungen',
    payout: 'Nächste Auszahlung',
    button: 'Jetzt starten',
  },
  zh: {
    nav: ['概览', '付款', '报表'],
    heading: '欢迎回来',
    sub: '您的账户本周动态。',
    revenue: '收入',
    invoices: '发票',
    payout: '下次结算',
    button: '立即开始',
  },
  pt: {
    nav: ['Visão geral', 'Pagamentos', 'Relatórios'],
    heading: 'Bem-vindo de volta',
    sub: 'A atividade da sua conta nesta semana.',
    revenue: 'Receita',
    invoices: 'Faturas',
    payout: 'Próximo repasse',
    button: 'Começar agora',
  },
  ru: {
    nav: ['Обзор', 'Платежи', 'Отчёты'],
    heading: 'С возвращением',
    sub: 'Активность вашего аккаунта за эту неделю.',
    revenue: 'Выручка',
    invoices: 'Счета',
    payout: 'Следующая выплата',
    button: 'Начать',
  },
  it: {
    nav: ['Panoramica', 'Pagamenti', 'Report'],
    heading: 'Bentornato',
    sub: 'L’attività del tuo account questa settimana.',
    revenue: 'Ricavi',
    invoices: 'Fatture',
    payout: 'Prossimo accredito',
    button: 'Inizia ora',
  },
  hi: {
    nav: ['अवलोकन', 'भुगतान', 'रिपोर्ट'],
    heading: 'वापसी पर स्वागत है',
    sub: 'इस सप्ताह आपके खाते की गतिविधि।',
    revenue: 'राजस्व',
    invoices: 'चालान',
    payout: 'अगला भुगतान',
    button: 'शुरू करें',
  },
  nl: {
    nav: ['Overzicht', 'Betalingen', 'Rapporten'],
    heading: 'Welkom terug',
    sub: 'De activiteit van je account deze week.',
    revenue: 'Omzet',
    invoices: 'Facturen',
    payout: 'Volgende uitbetaling',
    button: 'Aan de slag',
  },
  tr: {
    nav: ['Genel bakış', 'Ödemeler', 'Raporlar'],
    heading: 'Tekrar hoş geldiniz',
    sub: 'Hesabınızın bu haftaki etkinliği.',
    revenue: 'Gelir',
    invoices: 'Faturalar',
    payout: 'Sonraki ödeme',
    button: 'Hemen başla',
  },
  sv: {
    nav: ['Översikt', 'Betalningar', 'Rapporter'],
    heading: 'Välkommen tillbaka',
    sub: 'Ditt kontos aktivitet den här veckan.',
    revenue: 'Intäkter',
    invoices: 'Fakturor',
    payout: 'Nästa utbetalning',
    button: 'Kom igång',
  },
  id: {
    nav: ['Ringkasan', 'Pembayaran', 'Laporan'],
    heading: 'Selamat datang kembali',
    sub: 'Aktivitas akun Anda minggu ini.',
    revenue: 'Pendapatan',
    invoices: 'Faktur',
    payout: 'Pencairan berikutnya',
    button: 'Mulai sekarang',
  },
  pl: {
    nav: ['Przegląd', 'Płatności', 'Raporty'],
    heading: 'Witaj ponownie',
    sub: 'Aktywność Twojego konta w tym tygodniu.',
    revenue: 'Przychód',
    invoices: 'Faktury',
    payout: 'Następna wypłata',
    button: 'Rozpocznij',
  },
};

/** The stat figures: REAL Intl output per locale — local currency, local
    grouping, local date order — from fixed inputs so server and client
    render the same characters. */
const REVENUE: Record<PreviewLoc, { currency: string; amount: number }> = {
  es: { currency: 'EUR', amount: 48250 },
  ja: { currency: 'JPY', amount: 7480000 },
  fr: { currency: 'EUR', amount: 48250 },
  ko: { currency: 'KRW', amount: 64200000 },
  de: { currency: 'EUR', amount: 48250 },
  zh: { currency: 'CNY', amount: 342800 },
  pt: { currency: 'BRL', amount: 265800 },
  ru: { currency: 'RUB', amount: 4380000 },
  it: { currency: 'EUR', amount: 48250 },
  hi: { currency: 'INR', amount: 4025000 },
  nl: { currency: 'EUR', amount: 48250 },
  tr: { currency: 'TRY', amount: 1645000 },
  sv: { currency: 'SEK', amount: 545200 },
  id: { currency: 'IDR', amount: 762000000 },
  pl: { currency: 'PLN', amount: 208400 },
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
} as const;

/* ------------------------------------------------------------------
   The rewrite ledger: every localized line the locale switch retypes,
   in document order — the stagger walks the page top to bottom. Each
   line has TWO text nodes: the rendered string (data-rw) and its
   translated leaf in the payload pane (data-rwj) — one dial writes
   both, so the file and the page can never disagree.
   ------------------------------------------------------------------ */

type RwKey =
  | 'nav0'
  | 'nav1'
  | 'nav2'
  | 'heading'
  | 'sub'
  | 'revenue'
  | 'invoices'
  | 'payout'
  | 'button';

const RW_LINES: readonly { key: RwKey; read: (loc: PreviewLoc) => string }[] = [
  { key: 'nav0', read: (loc) => PREVIEWS[loc].nav[0] },
  { key: 'nav1', read: (loc) => PREVIEWS[loc].nav[1] },
  { key: 'nav2', read: (loc) => PREVIEWS[loc].nav[2] },
  { key: 'heading', read: (loc) => PREVIEWS[loc].heading },
  { key: 'sub', read: (loc) => PREVIEWS[loc].sub },
  { key: 'revenue', read: (loc) => PREVIEWS[loc].revenue },
  { key: 'invoices', read: (loc) => PREVIEWS[loc].invoices },
  { key: 'payout', read: (loc) => PREVIEWS[loc].payout },
  { key: 'button', read: (loc) => PREVIEWS[loc].button },
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
};

/* ---- belt pacing: each locale owns the centre for DWELL seconds (the
   settled screen needs reading time); any manual interaction holds the
   belt and it resumes after IDLE of quiet. */
const BELT_DWELL = 5;
const BELT_IDLE = 6000;

/** The four roster locales the shared flag map doesn't carry yet — kept
    component-local so the belt stays self-contained. */
const EXTRA_FLAGS: Record<string, string> = {
  nl: '🇳🇱',
  tr: '🇹🇷',
  sv: '🇸🇪',
  id: '🇮🇩',
};

/** A belt chip's content: the house flag+code grammar (the lct classes),
    resolved through the shared map first so the two never disagree. */
function BeltTag({ code }: { code: PreviewLoc }) {
  const flag = localeFlag(code) ?? EXTRA_FLAGS[code];
  return (
    <span className='lct'>
      {flag ? (
        <span className='lct-flag' aria-hidden='true'>
          {flag}
        </span>
      ) : null}
      <span className='lct-code'>{code}</span>
    </span>
  );
}

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
    at. Every translated leaf isolates its string in a data-rwj span —
    the rewrite engine's mirror node, retyped in the same dial as the
    rendered line above it (the quotes live outside the node, so typing
    never eats them). */
function PayloadJson({ loc, hl }: { loc: PreviewLoc; hl?: string }) {
  const p = PREVIEWS[loc];
  const K = ({ k }: { k: string }) => <span className='pl-k'>&quot;{k}&quot;</span>;
  const S = ({ s, k }: { s: string; k: RwKey }) => (
    <span className='pl-s'>
      &quot;<span data-rwj={k}>{s}</span>&quot;
    </span>
  );
  const flat: readonly (readonly [string, string, RwKey])[] = [
    [HASHES.navOverview, p.nav[0], 'nav0'],
    [HASHES.navPayments, p.nav[1], 'nav1'],
    [HASHES.navReports, p.nav[2], 'nav2'],
    [HASHES.heading, p.heading, 'heading'],
    [HASHES.revenue, p.revenue, 'revenue'],
    [HASHES.invoices, p.invoices, 'invoices'],
    [HASHES.payout, p.payout, 'payout'],
  ];
  return (
    <pre className='tct-payload-code'>
      {'{\n'}
      {flat.map(([k, s, rw]) => (
        <Fragment key={k}>
          {'  '}
          <span className='sgdh-pl-row' data-key={k} data-hl={hl === k || undefined}>
            <K k={k} />
            {': '}
            <S s={s} k={rw} />
          </span>
          {',\n'}
        </Fragment>
      ))}
      {'  '}
      <span className='sgdh-pl-row' data-key={HASHES.button} data-hl={hl === HASHES.button || undefined}>
        <K k={HASHES.button} />
        {': '}
        <S s={p.button} k='button' />
      </span>
      {',\n  '}
      <span className='sgdh-pl-row' data-key={HASHES.sub} data-hl={hl === HASHES.sub || undefined}>
        <K k={HASHES.sub} />
        {': { "c": [{ "c": '}
        <S s={p.sub} k='sub' />
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

export default function TranslateWindow() {
  const root = useRef<HTMLDivElement>(null);

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

  /* ---- the belt's shared state ----
     The belt is the page's driver, so every manual interaction holds it
     (BELT_IDLE of quiet before it resumes); the ticker reads the live
     face and pin through refs because it outlives every render. */
  const belt = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const beltHold = useRef(0);
  const beltApi = useRef<{ center: (el: HTMLElement) => void } | null>(null);
  const pinnedRef = useRef(false);
  const viewRef = useRef<'term' | 'preview'>('preview');
  const holdBelt = () => {
    beltHold.current = Date.now() + BELT_IDLE;
  };

  const pickView = (next: 'term' | 'preview') => {
    holdBelt();
    setView(next);
  };
  /* Picking a stack re-aims the wizard's Detected line. It deliberately
     does NOT switch faces — the reader alone flips the seg. */
  const pickStack = (next: Stack) => {
    holdBelt();
    setStack(next);
  };
  /* Clicking a chip brings it to the centre: the belt slides it in (the
     crossing logic suppressed while it travels) and the same rewrite
     fires — the click is just a faster crossing. */
  const pickChip = (loc: PreviewLoc, el: HTMLElement) => {
    holdBelt();
    setPloc(loc);
    beltApi.current?.center(el);
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
    },
    { scope: root }
  );

  /* ---- the infinite locale belt: the strip drives the page ----
     The track carries the roster twice and its position wraps at one
     run's width — the house marquee, ticker-driven so the wrap and the
     centre logic share one clock. Constant slow drift: each chip owns
     the STRIP ZONE's centre for BELT_DWELL seconds (the belt element is
     inset:0 of the zone, so beltEl.clientWidth IS the zone's width —
     the centre line is the zone's, not the window's), and whichever
     chip crosses that centre becomes the active locale — the rewrite
     below is the belt's own output, not a timer's. Hovering the belt pauses it; any
     manual interaction holds it (holdBelt) and it resumes after the
     quiet spell; a pinned inspector or the Terminal face freezes it
     outright. Clicking a chip slides the belt the short way round to
     centre that chip, crossings suppressed while it travels, so only
     the picked locale fires. Reduced motion: the belt stands still with
     es centred; clicks recentre instantly. */
  useGSAP(
    () => {
      const beltEl = belt.current;
      const trackEl = track.current;
      if (!beltEl || !trackEl) return;
      const n = BELT_LOCS.length;
      const chips = gsap.utils.toArray<HTMLElement>('button', trackEl);
      if (chips.length < n + 1) return;

      /* geometry, re-measured when the fonts arrive or the window resizes */
      let lefts: number[] = [];
      let widths: number[] = [];
      let runWidth = 0;
      const measure = () => {
        lefts = chips.slice(0, n + 1).map((chip) => chip.offsetLeft);
        widths = chips.slice(0, n).map((chip) => chip.offsetWidth);
        runWidth = (lefts[n] ?? 0) - (lefts[0] ?? 0);
      };
      measure();
      if (runWidth <= 0) return;

      let pos = 0;
      let active = 0;
      let sliding = false;
      const wrap = (v: number) => ((v % runWidth) + runWidth) % runWidth;
      const setX = () => gsap.set(trackEl, { x: -pos });
      const chipCenter = (i: number) => (lefts[i] ?? 0) + (widths[i] ?? 0) / 2;
      const seat = (i: number) => {
        pos = wrap(chipCenter(i) - beltEl.clientWidth / 2);
        setX();
      };
      /* the chip nearest the zone's centre line, wrap-aware */
      const centerIdx = () => {
        const base = lefts[0] ?? 0;
        const c = base + wrap(pos + beltEl.clientWidth / 2 - base);
        let best = 0;
        let bestD = Infinity;
        for (let i = 0; i < n; i += 1) {
          const d0 = Math.abs(chipCenter(i) - c);
          const d = Math.min(d0, runWidth - d0);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
        return best;
      };

      /* es owns the first fold: seated on centre before first paint */
      seat(0);

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      beltApi.current = {
        center: (el: HTMLElement) => {
          const i = chips.indexOf(el) % n;
          if (i >= 0) active = i;
          const target = el.offsetLeft + el.offsetWidth / 2 - beltEl.clientWidth / 2;
          if (reduced) {
            pos = wrap(target);
            setX();
            return;
          }
          /* the short way round: jumping the position by exactly one run
             is frame-identical, so pick the pairing of (position, target)
             with the least travel that stays on the doubled track */
          const limit = runWidth * 2 - beltEl.clientWidth;
          let fromP = pos;
          let toP = wrap(target);
          let bestD = Infinity;
          for (const p of [pos, pos + runWidth]) {
            if (p < 0 || p > limit) continue;
            for (let k = -2; k <= 2; k += 1) {
              const cand = target + k * runWidth;
              if (cand < 0 || cand > limit) continue;
              const d = Math.abs(cand - p);
              if (d < bestD) {
                bestD = d;
                fromP = p;
                toP = cand;
              }
            }
          }
          sliding = true;
          pos = fromP;
          setX();
          const dial = { v: pos };
          gsap.to(dial, {
            v: toP,
            duration: 0.7,
            ease: 'power2.inOut',
            onUpdate: () => {
              pos = dial.v;
              setX();
            },
            onComplete: () => {
              pos = wrap(pos);
              setX();
              sliding = false;
            },
          });
        },
      };

      if (reduced) {
        /* belt static, locale fixed — the roster still reads, chips still
           work (instant recentre, instant swap) */
        return () => {
          beltApi.current = null;
        };
      }

      /* the first move waits out the first-fold capture window: a still
         taken ~3s in shows the es screen settled under its centred chip */
      beltHold.current = Date.now() + 4500;
      let hover = false;
      const over = () => {
        hover = true;
      };
      const out = () => {
        hover = false;
      };
      beltEl.addEventListener('pointerenter', over);
      beltEl.addEventListener('pointerleave', out);

      const speed = runWidth / (n * BELT_DWELL);
      const tick = (_time: number, deltaMs: number) => {
        if (sliding || hover || pinnedRef.current || viewRef.current !== 'preview') return;
        if (Date.now() < beltHold.current) return;
        pos = wrap(pos + (speed * deltaMs) / 1000);
        setX();
        const i = centerIdx();
        if (i !== active) {
          active = i;
          const loc = BELT_LOCS[i];
          if (loc) setPloc(loc);
        }
      };
      gsap.ticker.add(tick);

      const remeasure = () => {
        if (!trackEl.isConnected) return;
        measure();
        if (runWidth > 0 && !sliding) seat(active);
      };
      window.addEventListener('resize', remeasure);
      void document.fonts.ready.then(remeasure);

      return () => {
        gsap.ticker.remove(tick);
        beltEl.removeEventListener('pointerenter', over);
        beltEl.removeEventListener('pointerleave', out);
        window.removeEventListener('resize', remeasure);
        beltApi.current = null;
      };
    },
    { scope: root }
  );

  /* ---- language switching rewrites the page, line by line ----
     When the locale changes, every localized line deletes the string it
     was showing and types the new one — staggered top to bottom, the
     whole swap inside ~0.9s (the ReviewWorkspace character-slice
     pattern). Each ledger key writes TWO nodes from ONE dial: the
     rendered line (data-rw) and its translated leaf in the payload pane
     (data-rwj) — the file visibly retypes in step with the page, and
     the two can never disagree. React has already stamped the new
     locale's full strings into the DOM by the time this layout effect
     runs, so each line is first restored to what it actually displayed
     — the `shown` ledger. Interrupts leave partials in that ledger, and
     the partial is what the next swap deletes: never a torn splice.
     Slicing is by code points and every line stays ONE text node — no
     per-character spans, so CJK shaping and direction are untouched.
     The Intl figures and the payload's filename swap as numerals
     should: no typing, one rise in step. Reduced motion keeps React's
     own instant swap. */
  const shown = useRef<Partial<Record<RwKey, string>>>({});
  const prevLoc = useRef<PreviewLoc>(ploc);
  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      const prev = prevLoc.current;
      prevLoc.current = ploc;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const lineEls = (key: RwKey) => {
        const els: HTMLElement[] = [];
        const ui = scope.querySelector<HTMLElement>(`[data-rw='${key}']`);
        const js = scope.querySelector<HTMLElement>(`[data-rwj='${key}']`);
        if (ui) els.push(ui);
        if (js) els.push(js);
        return els;
      };

      if (prev === ploc || reduced) {
        /* first paint, or an instant swap: React's render is the truth */
        RW_LINES.forEach(({ key, read }) => {
          shown.current[key] = read(ploc);
        });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'none' } });
      RW_LINES.forEach(({ key, read }, i) => {
        const nodes = lineEls(key);
        if (nodes.length === 0) return;
        const from = Array.from(shown.current[key] ?? read(prev));
        const to = Array.from(read(ploc));
        const write = (s: string) => {
          for (const node of nodes) node.textContent = s;
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
      viewRef.current = view;
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
      pinnedRef.current = pinned !== null;
      const was = wasPinned.current;
      wasPinned.current = pinned;
      const el = app.current;
      if (!el || Boolean(pinned) === Boolean(was)) return;
      /* the reader is inspecting: the belt must not rewrite the row under
         them — it holds now and resumes after the quiet spell */
      holdBelt();
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
    <div className='tct-win v0-tw' data-hero-in ref={root}>
      {/* ONE bar row (founder): no title — the strip ZONE fills the bar
          from its left edge to the right-anchored seg, and its contents
          swap with the face. Terminal: the framework strip — wizard
          furniture, it feeds the Detected line. Preview: the infinite
          locale belt. The zone carries id='frameworks' because the strip
          IS its page's frameworks content wherever it lives: the shared
          sections' #frameworks links land here. The zone stretches to
          the bar's fixed height, so nothing jumps between faces. */}
      <div className='tct-bar'>
        <div className='v0-tw-strip' id='frameworks'>
          <div
            className='sgdh-stacks v0-tw-strip-face'
            role='group'
            aria-label='Choose your stack'
            data-on={view === 'term'}
            aria-hidden={view !== 'term'}
          >
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

          {/* the belt: the roster twice over for the seamless wrap; the
              second run is presentation only. The chip on the zone's
              centre is the active locale. */}
          <div
            className='v0-tw-belt v0-tw-strip-face'
            data-on={view === 'preview'}
            aria-hidden={view !== 'preview'}
            ref={belt}
          >
            <div className='tct-tabs v0-tw-belt-track' role='group' aria-label='Preview locale' ref={track}>
              {[0, 1].map((copy) =>
                BELT_LOCS.map((loc) => (
                  <button
                    type='button'
                    key={`${copy}-${loc}`}
                    data-on={ploc === loc}
                    tabIndex={copy === 1 ? -1 : undefined}
                    aria-hidden={copy === 1 || undefined}
                    onClick={(e) => pickChip(loc, e.currentTarget)}
                  >
                    <BeltTag code={loc} />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

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
          {/* The rendered page carries the house slide-to-reveal: the
              payload gt wrote sits pinned full-width UNDER the render,
              and the seam (the logo's doubled line, each thread in its
              surface's own ink) only moves the clip boundary — dragging
              reveals the artifact in place, edge to edge. Everything
              that matters clusters LEFT of the resting cut, so the
              payload's teaser strip never covers a line. */}
          <div className='tct-app' ref={app} lang={ploc} style={{ '--seam-cut': '70%' } as CSSProperties}>
            {/* the app's own chrome: the GT mark + localized nav. The brand
                is the drawn logo alone, never a wordmark (founder addendum);
                the card is permanently white, so the light-context
                (dark-ink) asset is the one right choice. The logo is not a
                translatable string — no rewrite node, no inspector. */}
            <div className='sgdh-app-chrome'>
              <span className='sgdh-app-mark'>
                <Image src='/brand/no-bg-gt-logo-light.png' alt='GT' width={15} height={15} />
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
            </div>

            <div className='tct-payload' aria-hidden>
              <div className='tct-payload-file' data-rwf>
                public/_gt/{ploc}.json
              </div>
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
                holdBelt();
                dragged.current = true;
                setHinted(true);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
