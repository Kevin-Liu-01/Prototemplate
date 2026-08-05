'use client';

import 'flag-icons/css/flag-icons.min.css';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { createHorizonField, type HorizonFieldHandle } from '@/lib/horizon-field';

gsap.registerPlugin(useGSAP);

const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

type PairFace = { title: string; detail?: string };

type PairVariant =
  | 'search'
  | 'delivery'
  | 'review'
  | 'sales'
  | 'saved'
  | 'coverage'
  | 'action'
  | 'comment'
  | 'invite'
  | 'banner'
  | 'heading'
  | 'status';

type Pair = {
  id: string;
  /** Component-kind label on the source card's meta row. */
  kind: string;
  /** BCP-47 stamp on the emitted card. */
  locale: string;
  /** ISO 639-1, for the lang attribute on the emitted card. */
  lang: string;
  /** Native language name on the emitted card's meta row. */
  native: string;
  rtl?: boolean;
  variant: PairVariant;
  en: PairFace;
  tr: PairFace;
};

/**
 * Real UI components with vetted human translations (pair data from the
 * portal-hero and hourglass prototypes). The left grid carries the English
 * faces, the right grid the SAME components translated and locale-stamped —
 * passage through the horizon is the translation. Numbers, times and RTL
 * localize too (2,814 → 2.814; name@company.com → nome@azienda.it; the Arabic
 * toast mirrors), so the grids demonstrate the product rather than decorate.
 */
const PAIRS: readonly [Pair, ...Pair[]] = [
  {
    id: 'search',
    kind: 'Input',
    locale: 'ja-JP',
    lang: 'ja',
    native: '日本語',
    variant: 'search',
    en: { title: 'Search the docs', detail: '⌘ K' },
    tr: { title: 'ドキュメントを検索', detail: '⌘ K' },
  },
  {
    id: 'delivery',
    kind: 'Card',
    locale: 'es-MX',
    lang: 'es',
    native: 'Español',
    variant: 'delivery',
    en: { title: 'Arrives tomorrow', detail: 'Order #1842 · 9:30' },
    tr: { title: 'Llega mañana', detail: 'Pedido #1842 · 9:30' },
  },
  {
    id: 'review',
    kind: 'Checkbox',
    locale: 'ko-KR',
    lang: 'ko',
    native: '한국어',
    variant: 'review',
    en: { title: 'Ready for review', detail: '12 strings · Legal' },
    tr: { title: '검토 준비 완료', detail: '12개 문자열 · 법률' },
  },
  {
    id: 'workspace',
    kind: 'Button',
    locale: 'zh-CN',
    lang: 'zh',
    native: '简体中文',
    variant: 'action',
    en: { title: 'Open workspace' },
    tr: { title: '打开工作区' },
  },
  {
    id: 'sales',
    kind: 'Badge',
    locale: 'fr-FR',
    lang: 'fr',
    native: 'Français',
    variant: 'sales',
    en: { title: 'Talk to sales', detail: 'Enterprise' },
    tr: { title: 'Contacter les ventes', detail: 'Entreprise' },
  },
  {
    id: 'saved',
    kind: 'Toast',
    locale: 'ar-SA',
    lang: 'ar',
    native: 'العربية',
    rtl: true,
    variant: 'saved',
    en: { title: 'Changes saved', detail: '18 strings updated' },
    tr: { title: 'تم حفظ التغييرات', detail: 'تم تحديث 18 سلسلة' },
  },
  {
    id: 'comment',
    kind: 'Comment',
    locale: 'es-MX',
    lang: 'es',
    native: 'Español',
    variant: 'comment',
    en: { title: 'Looks great — ship it', detail: '@mira · just now' },
    tr: { title: '¡Listo para enviar!', detail: '@mira · ahora mismo' },
  },
  {
    id: 'coverage',
    kind: 'Progress',
    locale: 'pt-BR',
    lang: 'pt',
    native: 'Português',
    variant: 'coverage',
    en: { title: 'Translation coverage', detail: '2,814 of 2,993 strings' },
    tr: { title: 'Cobertura da tradução', detail: '2.814 de 2.993 strings' },
  },
  {
    id: 'launch',
    kind: 'Button',
    locale: 'de-DE',
    lang: 'de',
    native: 'Deutsch',
    variant: 'action',
    en: { title: 'Start building', detail: 'Primary action' },
    tr: { title: 'Jetzt loslegen', detail: 'Primäre Aktion' },
  },
  {
    id: 'invite',
    kind: 'Input + button',
    locale: 'it-IT',
    lang: 'it',
    native: 'Italiano',
    variant: 'invite',
    en: { title: 'Invite teammate', detail: 'name@company.com' },
    tr: { title: 'Invita un collega', detail: 'nome@azienda.it' },
  },
  {
    id: 'banner',
    kind: 'Banner',
    locale: 'nl-NL',
    lang: 'nl',
    native: 'Nederlands',
    variant: 'banner',
    en: { title: 'Built for every market' },
    tr: { title: 'Gebouwd voor elke markt' },
  },
  {
    id: 'welcome',
    kind: 'Heading',
    locale: 'hi-IN',
    lang: 'hi',
    native: 'हिन्दी',
    variant: 'heading',
    en: { title: 'Welcome back', detail: 'Dashboard' },
    tr: { title: 'वापसी पर स्वागत है', detail: 'डैशबोर्ड' },
  },
  {
    id: 'release',
    kind: 'Status',
    locale: 'th-TH',
    lang: 'th',
    native: 'ไทย',
    variant: 'status',
    en: { title: 'Locales deployed', detail: 'v2.4.0 · Global' },
    tr: { title: 'เผยแพร่ภาษาแล้ว', detail: 'v2.4.0 · ทั่วโลก' },
  },
];

/* The locale chips that orbit the horizon — native names, not English
   exonyms. Ordered so wide chips never sit next to each other on the ring. */
const FLAGS: readonly { flag: string; name: string }[] = [
  { flag: 'us', name: 'English' },
  { flag: 'jp', name: '日本語' },
  { flag: 'br', name: 'Português' },
  { flag: 'kr', name: '한국어' },
  { flag: 'ua', name: 'Українська' },
  { flag: 'cn', name: '简体中文' },
  { flag: 'fr', name: 'Français' },
  { flag: 'sa', name: 'العربية' },
  { flag: 'nl', name: 'Nederlands' },
  { flag: 'in', name: 'हिन्दी' },
  { flag: 'de', name: 'Deutsch' },
  { flag: 'th', name: 'ไทย' },
  { flag: 'vn', name: 'Tiếng Việt' },
  { flag: 'il', name: 'עברית' },
  { flag: 'it', name: 'Italiano' },
  { flag: 'pl', name: 'Polski' },
  { flag: 'se', name: 'Svenska' },
  { flag: 'mx', name: 'Español' },
  { flag: 'id', name: 'Bahasa Indonesia' },
  { flag: 'tr', name: 'Türkçe' },
];

/* ---------- wall construction ----------
   Each side is one dense WALL of cards: PHYS_COLUMNS depth columns of
   ROWS_PER_COLUMN shared row courses, every 312px column cut into six 52px
   vertical strips. Each strip is a flat chord placed along a curved plan-view
   rail (translate3d + rotateY under the stage's real perspective), so the
   wall is a piecewise-planar sweep — the fabric read: cards shear and tilt
   with the local surface orientation, compress along the sweep, and stay
   packed tight on row lines shared across every column of BOTH walls. The
   machinery is the hourglass corridor's strip-chord rail with its curvature
   flipped the founder's way (see the suction rail below). */
const ROWS_PER_COLUMN = 5;
const STRIPS_PER_COLUMN = 6;
const PHYS_COLUMNS = 6;
const COLUMN_W = 312;
const COLUMN_PITCH = 330;
const STRIP_W = COLUMN_W / STRIPS_PER_COLUMN;
const WRAP_SPAN = COLUMN_PITCH * PHYS_COLUMNS;
/* Keeps every column's arc inside one wrap period; enough headroom behind
   the screen edge for the entrance pull, tight enough that the deepest
   visible chord never outruns the rail LUT before the fade retires it. */
const ARC_MIN = -360;
/** Conveyor arc speed along the rail, px/s. */
const ARC_SPEED = 9;
/** Clock offset so the very first painted frame is already mid-flow. */
const T0 = 4;
/** Flag-orbit radius as a multiple of the horizon radius (wide mode). */
const ORBIT_K = 1.36;
/** Seconds per full revolution of the flag orbit. */
const ORBIT_DUR = 130;
/** Vertical squash of the flag orbit — a slightly inclined orbital plane. */
const ORBIT_TILT = 0.94;

/* ---------- the suction rail ----------
   Plan-view geometry of one wall: x across the screen measured from the
   hole's center, z toward the viewer, arc length s from the screen edge. The
   heading phi eases from PHI_EDGE (~3° — the wall lies almost in the screen
   plane, a plain flat grid) to PHI_DEEP (~77° — diving away behind the
   portal), and the turn is deliberately BACK-LOADED (PHI_SHAPE), so the
   courses run near-flat for most of the sweep and then whip inward: a
   concave suction curve, the grid lines pulled INTO the mass — the opposite
   read of the hourglass corridor's barrel, per the founder's sketch. */
/* PHI_DEEP stops short of edge-on (~77°): every chord stays a readable
   surface (no sliver stacking, no per-strip alpha seams), and because the
   clamped tail still advances inward at cos(PHI_DEEP), the diving wall
   visibly TRAVELS under the glow instead of freezing at the turn. */
const PHI_EDGE = 0.05;
const PHI_DEEP = 1.35;
const PHI_SHAPE = 2.1;
/** The rail starts this far off the screen edge, slightly toward the viewer,
    so the frame crops the near columns the way it crops the flat baseline. */
const EDGE_OUT = 60;
const EDGE_Z = 70;
/** The stage's CSS perspective, px — must match .eh-stage. */
const PERSPECTIVE = 750;
const RAIL_STEP = 4;
const RAIL_START = -560;

const TAU = Math.PI * 2;

const pairAt = (index: number): Pair => PAIRS[index % PAIRS.length] ?? PAIRS[0];

const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);
const smooth01 = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

const phiAt = (u: number): number =>
  PHI_EDGE + (PHI_DEEP - PHI_EDGE) * Math.pow(clamp01(u), PHI_SHAPE);

/* Mean of cos(phi) over the sweep — a pure profile constant that converts a
   plan-view x reach into the arc span that covers it. */
const SWEEP_COS = (() => {
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += Math.cos(phiAt((i + 0.5) / 256));
  return sum / 256;
})();

type WallRail = {
  /** Stage width the LUT was built for. */
  view: number;
  /** Arc length of the sweep — screen edge to the dive behind the rim. */
  span: number;
  xs: Float64Array;
  zs: Float64Array;
};

function buildRail(view: number, r: number): WallRail {
  /* The whip lands at the flag-orbit lane — OUTSIDE the rim glow, so the
     concave turn reads against open paper — and the clamped-phi tail past
     u = 1 dives there: the perspective converges the diving chords into the
     hole (their projected position glides under the glow and behind the
     disc) while the fade extinguishes them. */
  const reach = view / 2 + EDGE_OUT - r * 1.3;
  const span = Math.min(Math.max(reach / SWEEP_COS, 480), 1000);
  const count = Math.ceil((span * 1.7 - RAIL_START) / RAIL_STEP) + 1;
  const xs = new Float64Array(count);
  const zs = new Float64Array(count);
  const zero = Math.round(-RAIL_START / RAIL_STEP);
  xs[zero] = -view / 2 - EDGE_OUT;
  zs[zero] = EDGE_Z;
  /* Midpoint-sampled Euler both ways from the screen edge; beyond the ends
     phi is clamped, so the rail extends straight and off-screen strips stay
     finite. */
  for (let i = zero + 1; i < count; i++) {
    const s = RAIL_START + (i - 1) * RAIL_STEP;
    const a = phiAt((s + RAIL_STEP / 2) / span);
    xs[i] = (xs[i - 1] ?? 0) + Math.cos(a) * RAIL_STEP;
    zs[i] = (zs[i - 1] ?? 0) - Math.sin(a) * RAIL_STEP;
  }
  for (let i = zero - 1; i >= 0; i--) {
    const s = RAIL_START + (i + 1) * RAIL_STEP;
    const a = phiAt((s - RAIL_STEP / 2) / span);
    xs[i] = (xs[i + 1] ?? 0) - Math.cos(a) * RAIL_STEP;
    zs[i] = (zs[i + 1] ?? 0) + Math.sin(a) * RAIL_STEP;
  }
  return { view, span, xs, zs };
}

function railPoint(rail: WallRail, s: number): { x: number; z: number } {
  const f = (s - RAIL_START) / RAIL_STEP;
  const i = Math.min(Math.max(Math.floor(f), 0), rail.xs.length - 2);
  const t = Math.min(Math.max(f - i, 0), 1);
  return {
    x: (rail.xs[i] ?? 0) * (1 - t) + (rail.xs[i + 1] ?? 0) * t,
    z: (rail.zs[i] ?? 0) * (1 - t) + (rail.zs[i + 1] ?? 0) * t,
  };
}

/* Keeps every column's arc inside one wrap period, [ARC_MIN, ARC_MIN+WRAP). */
function wrapArc(v: number): number {
  return ((((v - ARC_MIN) % WRAP_SPAN) + WRAP_SPAN) % WRAP_SPAN) + ARC_MIN;
}

/* Three depth-column patterns of five row courses, dealt so no row or column
   repeats a component shape next to itself (the two action buttons never
   share a row course) and the RTL Arabic toast stays in rotation. */
const PATTERNS: readonly (readonly Pair[])[] = [
  [0, 1, 2, 3, 4],
  [8, 5, 6, 7, 9],
  [10, 11, 12, 0, 2],
].map((rows) => rows.map((i) => pairAt(i)));

/* Depth grading. The veil (--ehd) is the paper fog that dims the wall along
   the sweep — the fabric's depth dimming. Extinction itself is ONE narrow
   monotone band keyed to PROJECTED distance from the hole center in rim
   units (the baseline's crisp read): cards hold full presence across the
   field and through the flag-orbit lane, then die sharply under the rim
   glow as the wall slips behind the disc — no half-ghosts anywhere else. */
/* Both ramps are WIDE on purpose: they are sampled per strip chord, and a
   ramp narrower than a few chords steps visibly between neighbours — the
   banding that plagued the first cut of this wall. */
const veilAt = (mid: number): number => 0.4 * smooth01((mid - 0.5) / 0.9);
const rimFadeAt = (q: number): number => smooth01((q - 0.6) / 0.45);

function CardBody({ pair, side }: { pair: Pair; side: 'en' | 'tr' }) {
  const face = side === 'en' ? pair.en : pair.tr;
  switch (pair.variant) {
    case 'search':
      return (
        <div className='eh-input'>
          <svg viewBox='0 0 16 16' aria-hidden>
            <circle cx='7' cy='7' r='4.4' />
            <path d='m10.4 10.4 3.2 3.2' />
          </svg>
          <span>{face.title}</span>
          <kbd>{face.detail}</kbd>
        </div>
      );
    case 'delivery':
      return (
        <div className='eh-rowline'>
          <svg viewBox='0 0 16 16' aria-hidden>
            <path d='M2.8 5.2 8 2.6l5.2 2.6v5.6L8 13.4l-5.2-2.6z' />
            <path d='M2.8 5.2 8 7.8l5.2-2.6M8 7.8v5.6' />
          </svg>
          <span className='eh-copy'>
            <strong>{face.title}</strong>
            <small>{face.detail}</small>
          </span>
        </div>
      );
    case 'review':
      return (
        <div className='eh-rowline'>
          <span className='eh-avatars' aria-hidden>
            <i>KL</i>
            <i>AL</i>
          </span>
          <span className='eh-copy'>
            <strong>{face.title}</strong>
            <small>{face.detail}</small>
          </span>
          <span className='eh-checkbox' aria-hidden>
            <svg viewBox='0 0 16 16'>
              <path d='m3.6 8.4 3 3 5.8-6.6' />
            </svg>
          </span>
        </div>
      );
    case 'sales':
      return (
        <div className='eh-rowline'>
          <span className='eh-badge'>{face.detail}</span>
          <span className='eh-minibtn'>{face.title}</span>
        </div>
      );
    case 'saved':
      return (
        <div className='eh-rowline'>
          <svg className='eh-ok' viewBox='0 0 16 16' aria-hidden>
            <circle cx='8' cy='8' r='6.4' />
            <path d='m5.4 8.2 1.9 1.9 3.5-4.2' />
          </svg>
          <span className='eh-copy'>
            <strong>{face.title}</strong>
            <small>{face.detail}</small>
          </span>
        </div>
      );
    case 'coverage':
      return (
        <div className='eh-meter'>
          <span className='eh-copy'>
            <strong>{face.title}</strong>
            <small>{face.detail}</small>
          </span>
          <b>94%</b>
          <i className='eh-bar' aria-hidden>
            <span />
          </i>
        </div>
      );
    case 'action':
      return (
        <div className='eh-rowline is-between'>
          <span className='eh-minibtn'>
            {face.title}
            <b aria-hidden> →</b>
          </span>
          {face.detail ? <small className='eh-hint'>{face.detail}</small> : null}
        </div>
      );
    case 'comment':
      return (
        <div className='eh-rowline'>
          <span className='eh-avatars' aria-hidden>
            <i>M</i>
          </span>
          <span className='eh-copy'>
            <strong>{face.title}</strong>
            <small>{face.detail}</small>
          </span>
        </div>
      );
    case 'invite':
      return (
        <div className='eh-invite'>
          <span className='eh-invite-field'>{face.detail}</span>
          <span className='eh-minibtn'>{face.title}</span>
        </div>
      );
    case 'banner':
      return (
        <div className='eh-banner'>
          <svg viewBox='0 0 16 16' aria-hidden>
            <circle cx='8' cy='8' r='6.2' />
            <path d='M1.8 8h12.4M8 1.8c-4.4 4.2-4.4 8.2 0 12.4 4.4-4.2 4.4-8.2 0-12.4z' />
          </svg>
          <strong>{face.title}</strong>
        </div>
      );
    case 'heading':
      return (
        <div className='eh-copy is-head'>
          <strong>{face.title}</strong>
          <small>{face.detail}</small>
        </div>
      );
    case 'status':
      return (
        <div className='eh-rowline'>
          <i className='eh-statdot' aria-hidden />
          <span className='eh-copy'>
            <strong>{face.title}</strong>
            <small>{face.detail}</small>
          </span>
        </div>
      );
  }
}

/* Every card is stamped with its locale — 'en' going in, the BCP-47 tag
   coming out — so a still reads as a before/after ledger, not decoration. */
function DemoCard({ pair, side }: { pair: Pair; side: 'en' | 'tr' }) {
  const tr = side === 'tr';
  return (
    <article
      className={`eh-card is-${pair.variant}`}
      dir={tr && pair.rtl ? 'rtl' : undefined}
      lang={tr ? pair.lang : undefined}
    >
      <header className='eh-meta'>
        <i className={`eh-meta-dot${tr ? ' is-live' : ''}`} aria-hidden />
        <span>{tr ? pair.native : pair.kind}</span>
        <b className='eh-stamp'>{tr ? pair.locale : 'en'}</b>
      </header>
      <CardBody pair={pair} side={side} />
    </article>
  );
}

/* One wall: PHYS_COLUMNS depth columns, each dealt as STRIPS_PER_COLUMN flat
   chords. Each strip is a 78px window onto its column's 312px five-row grid;
   on the translated wall the strip's local x runs deep→near, so the windows
   are dealt from the far side of the content instead. The translated wall
   also runs its pattern sequence reversed after the first ([c0, c2, c1]): at
   the mirror phase every occupied arc slot carries the SAME pattern on both
   walls — English face left, translated face right, same row lines — so a
   pair that enters near-left exits near-right. */
function Wall({ side }: { side: 'en' | 'tr' }) {
  const order = side === 'tr' ? [0, 2, 1] : [0, 1, 2];
  return (
    <div className={`eh-wall is-${side}`}>
      {Array.from({ length: PHYS_COLUMNS }, (_, col) => {
        const pattern = PATTERNS[order[col % order.length] ?? 0];
        if (!pattern) return null;
        return Array.from({ length: STRIPS_PER_COLUMN }, (_, strip) => {
          const shift = side === 'en' ? -strip * STRIP_W : (strip + 1) * STRIP_W - COLUMN_W;
          return (
            <div className='eh-strip' data-col={col} data-strip={strip} key={`${col}-${strip}`}>
              <div className='eh-strip-in' style={{ transform: `translateX(${shift}px)` }}>
                <div className='eh-col'>
                  {pattern.map((pair, row) => (
                    <DemoCard key={`${pair.id}-${row}`} pair={pair} side={side} />
                  ))}
                </div>
              </div>
            </div>
          );
        });
      })}
    </div>
  );
}

/**
 * Kevin's sketch, built literally: two dense mirrored card WALLS fill the
 * screen from its edges and are pulled into a REAL event horizon at center.
 * The horizon is a purpose-built lensing shader (lib/horizon-field.ts): an
 * accretion streak field whose sampling coordinates bend around the rim into
 * a brilliant photon ring, the page's own ruled hairlines warping with it,
 * over a genuinely dark core. The walls carry the hourglass corridor's
 * strip-chord treatment with the curvature flipped his way: near-FLAT at the
 * screen edges — a plain component grid facing the viewer — then
 * accelerating inward as they approach the portal (concave suction curves,
 * the grid lines pulled into the mass) and diving BEHIND it, where the disc
 * occludes them and the fade leaves the rim glow and the flag-orbit lane
 * clean. Five row courses are shared across every column of both walls, and
 * because each strip is a flat chord under one real perspective, cards
 * deform with the wall like printed fabric — shearing, tilting and
 * compressing with the local surface. The dark core holds the mark,
 * headline, CTAs and the npx chip light-on-dark; the locale flag chips ride
 * a slightly inclined orbit around the horizon, each oriented tangent to the
 * ring like a satellite belt.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const horizonRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLCanvasElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<SVGSVGElement>(null);
  const capRef = useRef<HTMLParagraphElement>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = () => {
    void navigator.clipboard?.writeText('npx gt@latest');
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  useGSAP(
    () => {
      const hero = heroRef.current;
      const stage = stageRef.current;
      const fieldCanvas = fieldRef.current;
      const orbit = orbitRef.current;
      const rail = railRef.current;
      if (!hero || !stage || !fieldCanvas || !orbit || !rail) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const field: HorizonFieldHandle | null = createHorizonField(fieldCanvas, { speed: 0.5 });

      /* The shader's ink must follow the page theme: its bent rules and rings
         hand off to CSS-drawn ones at the mask edge, so both flip together. */
      const applyTheme = () => {
        const dark = document.documentElement.dataset.theme === 'dark';
        field?.setParams({ ink: dark ? [1, 1, 1] : [0.059, 0.067, 0.075] });
      };
      applyTheme();
      const themeWatch = new MutationObserver(applyTheme);
      themeWatch.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });

      type StripSlot = {
        el: HTMLElement;
        out: boolean;
        col: number;
        strip: number;
        shown: boolean;
      };
      const slots: StripSlot[] = Array.from(
        stage.querySelectorAll<HTMLElement>('.eh-strip')
      ).map((el) => ({
        el,
        out: el.closest('.eh-wall')?.classList.contains('is-tr') ?? false,
        col: Number(el.dataset.col ?? '0'),
        strip: Number(el.dataset.strip ?? '0'),
        shown: false,
      }));

      /* The flag chips, driven directly each frame — no wrapper rotation, no
         counter-rotation: each chip is seated on the (slightly inclined)
         orbit and oriented TANGENT to it, satellites riding the ring. */
      const chips = Array.from(orbit.querySelectorAll<HTMLElement>('.eh-chip'));

      let wallRail: WallRail | null = null;
      let wide = true;
      let cy = 0;
      let r = 240;
      let orbitR = 320;

      /* e = entrance progress: the walls slide a last stretch of arc INTO
         place while fading up — the suction announcing itself. */
      const flow = { e: 1 };

      const hideSlot = (slot: StripSlot) => {
        if (!slot.shown) return;
        slot.el.style.visibility = 'hidden';
        slot.shown = false;
      };

      /* Places every strip as a flat chord on the suction rail: sample the
         chord's endpoints, seat it with translate3d + rotateY (the source
         wall's arcs advance INTO the hole, the translated wall's retreat OUT
         of it — mirrored x and heading), and grade the paper veil by depth
         and the extinction by projected distance from the hole. Both walls
         share the same row grid at every frame. */
      const placeWalls = (d: number) => {
        const wr = wallRail;
        if (!wide || !wr) return;
        const half = wr.view / 2;
        const pull = (1 - flow.e) * 220;
        for (const slot of slots) {
          const colArc = slot.out
            ? wrapArc(-slot.col * COLUMN_PITCH - d - pull)
            : wrapArc(slot.col * COLUMN_PITCH + d - pull);
          const a0 = colArc + slot.strip * STRIP_W;
          const mid = (a0 + STRIP_W / 2) / wr.span;
          if (a0 + STRIP_W < -40 || mid > 1.5) {
            hideSlot(slot);
            continue;
          }
          const p0 = railPoint(wr, a0);
          const p1 = railPoint(wr, a0 + STRIP_W);
          /* Projected distance from the hole center, in rim units — the
             extinction coordinate, so the fade tracks what the eye sees no
             matter how deep the chord has dived. */
          const zm = (p0.z + p1.z) / 2;
          const k = PERSPECTIVE / (PERSPECTIVE - zm);
          const q = (-(p0.x + p1.x) / 2) * k / r;
          const alpha = flow.e * rimFadeAt(q);
          if (alpha < 0.012) {
            hideSlot(slot);
            continue;
          }
          const turn = Math.atan2(p0.z - p1.z, p1.x - p0.x);
          const sign = slot.out ? -1 : 1;
          const style = slot.el.style;
          slot.shown = true;
          style.visibility = 'visible';
          style.opacity = alpha.toFixed(3);
          style.setProperty('--ehd', veilAt(mid).toFixed(3));
          style.transform = `translate3d(${(sign * (p0.x + half)).toFixed(2)}px, 0px, ${p0.z.toFixed(
            2
          )}px) rotateY(${(sign * turn).toFixed(5)}rad)`;
        }
      };

      /* The flag orbit: chips revolve on a slightly inclined ellipse, each
         oriented tangent to it. Chips on the lower arc take a 180° roll
         (snapped at the sides, where they stand vertical) so the text
         never inverts — the circular-seal read. Far-side chips (top arc)
         shrink and dim as if passing behind the rim glow. */
      const placeChips = (timeSec: number) => {
        const phase = (timeSec / ORBIT_DUR) * TAU;
        const n = chips.length || 1;
        for (let i = 0; i < chips.length; i++) {
          const chip = chips[i];
          if (!chip) continue;
          const a = phase + (i / n) * TAU;
          const sin = Math.sin(a);
          const cos = Math.cos(a);
          const x = orbitR * sin;
          const y = -orbitR * ORBIT_TILT * cos;
          let rot = Math.atan2(ORBIT_TILT * sin, cos);
          if (cos < 0) rot += Math.PI;
          const scale = 1 - 0.075 * cos;
          const dim = 1 - 0.45 * smooth01((cos - 0.4) / 0.45);
          chip.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(
            2
          )}px) translate(-50%, -50%) rotate(${rot.toFixed(4)}rad) scale(${scale.toFixed(3)})`;
          chip.style.opacity = dim.toFixed(3);
        }
      };

      /* One shared clock drives both the wall conveyors and the orbit. */
      const frame = (timeSec: number) => {
        placeWalls(timeSec * ARC_SPEED);
        placeChips(timeSec);
      };

      const measure = () => {
        const w = hero.clientWidth;
        const h = hero.clientHeight;
        if (w < 10 || h < 10) return;
        wide = w >= 760;
        r = wide
          ? Math.min(Math.max(w * 0.19, 228), 300, h * 0.36)
          : Math.min(w * 0.4, 168, h * 0.26);
        const cx = w / 2;
        /* Stack mode leaves head/foot room for the static card bands. */
        cy = wide
          ? Math.max(Math.min(h * 0.47, h - r - 148), r + 96)
          : Math.max(Math.min(h * 0.46, h - r - 232), r + 238);
        orbitR = wide ? r * ORBIT_K : Math.min(r + 36, w / 2 - 20);

        hero.style.setProperty('--eh-cx', `${cx.toFixed(1)}px`);
        hero.style.setProperty('--eh-cy', `${cy.toFixed(1)}px`);
        hero.style.setProperty('--eh-r', `${r.toFixed(1)}px`);
        hero.dataset.ehMode = wide ? 'wide' : 'stack';

        /* The stage's vanishing point is the hole itself: every diving chord
           converges INTO the horizon, not the viewport center. */
        stage.style.perspectiveOrigin = `50% ${cy.toFixed(1)}px`;

        /* The shader canvas covers the disc plus a generous annulus: big
           enough that the outermost guide ring bends inside it, small enough
           that the paper beyond is untouched DOM. */
        const half = r * 2.05;
        fieldCanvas.style.left = `${(cx - half).toFixed(1)}px`;
        fieldCanvas.style.top = `${(cy - half).toFixed(1)}px`;
        fieldCanvas.style.width = `${(half * 2).toFixed(1)}px`;
        fieldCanvas.style.height = `${(half * 2).toFixed(1)}px`;
        field?.setParams({
          center: [half, half],
          radius: r,
          worldOrigin: [cx - half, cy - half],
        });

        /* The orbit origin; chips are seated per-frame at even pitch. The
           dashed rail is the same inclined ellipse the chips ride — its
           square viewBox stretches into the orbit's squashed box. */
        orbit.style.left = `${cx.toFixed(1)}px`;
        orbit.style.top = `${cy.toFixed(1)}px`;
        rail.style.left = `${(cx - orbitR).toFixed(1)}px`;
        rail.style.top = `${(cy - orbitR * ORBIT_TILT).toFixed(1)}px`;
        rail.style.width = `${(orbitR * 2).toFixed(1)}px`;
        rail.style.height = `${(orbitR * ORBIT_TILT * 2).toFixed(1)}px`;

        /* The suction rail is pure geometry — no DOM reads: rebuilt for the
           new width so the sweep always spans screen edge to behind the rim.
           Stack mode retires the stage (CSS swaps in the static bands). */
        wallRail = wide ? buildRail(w, r) : null;
        if (!wide) for (const slot of slots) hideSlot(slot);

        /* Reduced motion: one composed still, walls mid-flow, chips seated. */
        frame(reduced ? 42 : gsap.ticker.time + T0);
      };

      measure();

      const ro = new ResizeObserver(measure);
      ro.observe(hero);

      if (reduced) {
        return () => {
          ro.disconnect();
          themeWatch.disconnect();
          field?.destroy();
        };
      }

      /* Offscreen/hidden-tab guard for the per-frame conveyor. */
      let active = true;
      const io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          active = entry ? entry.isIntersecting : true;
        },
        { rootMargin: '120px' }
      );
      io.observe(hero);

      const tick = () => {
        if (!active || document.hidden) return;
        frame(gsap.ticker.time + T0);
      };
      gsap.ticker.add(tick);

      /* Entrance: the walls slide their last stretch of rail INTO the hole
         while fading up (flow.e gates every strip's alpha; the ticker is
         already running, so no onUpdate is needed). */
      flow.e = 0;
      gsap.to(flow, { e: 1, duration: 1.3, ease: 'power3.out' });

      gsap.from('[data-hero-in]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.07,
        ease: 'power2.out',
      });
      if (horizonRef.current) {
        gsap.from([horizonRef.current, fieldCanvas], {
          scale: 0.965,
          autoAlpha: 0,
          duration: 1.1,
          ease: 'power3.out',
        });
      }
      gsap.from([orbit, rail, capRef.current], {
        autoAlpha: 0,
        duration: 0.9,
        delay: 0.55,
        ease: 'none',
      });
      gsap.from('.eh-tag', { autoAlpha: 0, duration: 0.6, delay: 0.6, ease: 'none' });

      /* The chips revolve inside frame(); the dashed rail creeps the other
         way via dash offset (the inclined ellipse cannot simply rotate). */
      const railStroke = rail.querySelector('circle');
      if (railStroke) {
        gsap.to(railStroke, {
          attr: { 'stroke-dashoffset': 48 },
          duration: 96,
          ease: 'none',
          repeat: -1,
        });
      }

      return () => {
        ro.disconnect();
        io.disconnect();
        themeWatch.disconnect();
        gsap.ticker.remove(tick);
        field?.destroy();
      };
    },
    { scope: root }
  );

  return (
    <section className='tc-sec' id='top' ref={root}>
      <div className='eh-hero' ref={heroRef} data-eh-mode='wide'>
        {/* The page's concentric guide rings. A CSS mask opens a feathered
            hole under the shader canvas, which redraws their inner arcs bent
            through the lens — the same handoff the ruled hairlines use. */}
        <div className='eh-guides' aria-hidden>
          <span />
          <span />
          <span />
        </div>

        <span className='eh-tag is-in'>in — English source</span>
        <span className='eh-tag is-out'>out — translated · stamped</span>

        <p className='sr-only'>
          English source components — search fields, toasts, buttons, review rows — sweep in from
          the left edge of the screen and are pulled behind the event horizon; the same components
          emerge on the right translated and locale-stamped: Japanese, Spanish, Korean, Arabic, and
          a hundred more.
        </p>

        {/* The two card walls: flat chords seated on the suction rail per
            frame, under ONE real perspective whose vanishing point is the
            hole. Left wall carries the English faces in; right wall carries
            the translated faces out. Strips stay hidden until placed. */}
        <div className='eh-stage' ref={stageRef} aria-hidden>
          <Wall side='en' />
          <Wall side='tr' />
        </div>

        {/* Stack mode folds the walls into two static tilted bands — the
            same before/after pairs above and below the horizon. */}
        <div className='eh-m is-en' aria-hidden>
          <div className='eh-m-strip'>
            <DemoCard pair={pairAt(0)} side='en' />
            <DemoCard pair={pairAt(7)} side='en' />
          </div>
        </div>
        <div className='eh-m is-tr' aria-hidden>
          <div className='eh-m-strip'>
            <DemoCard pair={pairAt(0)} side='tr' />
            <DemoCard pair={pairAt(7)} side='tr' />
          </div>
        </div>

        {/* The event horizon. The DOM carries only the fallback disc (WebGL
            unavailable → a plain dark circle with a hairline rim keeps the
            center stack legible); everything else — photon ring, wrapped
            accretion arcs, the page's rules bending into the hole — is the
            horizon-field shader in the canvas that follows. */}
        <div className='eh-horizon' aria-hidden ref={horizonRef}>
          <span className='eh-hole' />
        </div>
        <canvas className='eh-field' ref={fieldRef} aria-hidden />

        {/* The locale chips orbit the horizon on a dashed rail — a slightly
            inclined ellipse, chips tangent to it like a satellite belt. The
            layer is inert (pointer-events: none) so it never blocks the
            core's CTAs. preserveAspectRatio='none' squashes the circle into
            the same ellipse the chips ride. */}
        <svg
          className='eh-orbit-rail'
          viewBox='0 0 100 100'
          preserveAspectRatio='none'
          ref={railRef}
          aria-hidden
        >
          <circle
            cx='50'
            cy='50'
            r='49.4'
            fill='none'
            stroke='currentColor'
            strokeDasharray='0.6 4.2'
            vectorEffect='non-scaling-stroke'
          />
        </svg>
        <div className='eh-orbit' ref={orbitRef} aria-hidden>
          {FLAGS.map((entry) => (
            <span className='eh-orbit-seat' key={entry.name}>
              <span className='eh-chip'>
                <i className={`fi fi-${entry.flag}`} aria-hidden='true' />
                <b>{entry.name}</b>
              </span>
            </span>
          ))}
        </div>

        {/* Center content sits inside the dark core and flips to light-on-dark. */}
        <div className='eh-core'>
          <Image
            className='eh-mark'
            data-hero-in
            src='/brand/no-bg-gt-logo-dark.png'
            alt='General Translation'
            width={34}
            height={34}
          />
          <h1 data-hero-in>
            <span>Launch in</span>
            <span>
              <em>every</em> language.
            </span>
          </h1>
          <p className='eh-sub' data-hero-in>
            General Translation builds full-stack infrastructure for localizing apps, docs, and
            websites.
          </p>
          <div className='eh-acts' data-hero-in>
            <a className='tc-btn tc-btn-solid' href='#pricing'>
              Get started
            </a>
            <a className='tc-btn tc-btn-line' href='#frameworks'>
              Docs
            </a>
          </div>
          <button className='tc-copy' type='button' onClick={copy} data-hero-in>
            <span>$ npx gt@latest</span>
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <p className='eh-cap' ref={capRef}>
          <strong>100+ languages</strong> — one integration
        </p>
      </div>

      <div className='tc-rail eh-trust-rail'>
        <div className='tc-trust'>
          <p className='tc-trust-lead'>Trusted by the world&rsquo;s best companies</p>
          <div className='tc-trust-row'>
            {CUSTOMERS.map((customer) => (
              <span className='tc-trust-cell' key={customer.name}>
                <b className={`tc-wm ${customer.mark}`}>{customer.name}</b>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
