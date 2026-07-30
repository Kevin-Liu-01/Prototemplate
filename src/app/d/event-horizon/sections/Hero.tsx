'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { createHorizonField, type HorizonFieldHandle } from '../lib/horizon-field';

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
  { flag: '🇺🇸', name: 'English' },
  { flag: '🇯🇵', name: '日本語' },
  { flag: '🇧🇷', name: 'Português' },
  { flag: '🇰🇷', name: '한국어' },
  { flag: '🇺🇦', name: 'Українська' },
  { flag: '🇨🇳', name: '简体中文' },
  { flag: '🇫🇷', name: 'Français' },
  { flag: '🇸🇦', name: 'العربية' },
  { flag: '🇳🇱', name: 'Nederlands' },
  { flag: '🇮🇳', name: 'हिन्दी' },
  { flag: '🇩🇪', name: 'Deutsch' },
  { flag: '🇹🇭', name: 'ไทย' },
  { flag: '🇻🇳', name: 'Tiếng Việt' },
  { flag: '🇮🇱', name: 'עברית' },
  { flag: '🇮🇹', name: 'Italiano' },
  { flag: '🇵🇱', name: 'Polski' },
  { flag: '🇸🇪', name: 'Svenska' },
  { flag: '🇲🇽', name: 'Español' },
  { flag: '🇮🇩', name: 'Bahasa Indonesia' },
  { flag: '🇹🇷', name: 'Türkçe' },
];

/* ---------- grid construction ----------
   Each side is a conveyor of adjacent columns (a sheet, not floating cards):
   COLS_PER_SET column templates repeated SETS times so the track can wrap by
   exactly one set width with no visible seam. Column templates stagger the
   pair list so neighbouring columns never repeat a component on the same row.
   Every cell has the SAME fixed height (--eh-rowh) — but that flat layout is
   only the SOURCE PLANE. Per frame, every card is pushed through the same
   point-mass lens the shader uses (source radius ρs images at
   ρ = (ρs + √(ρs² + 4r²))/2, the exact inverse of the shader's rs = r − 1/r
   law), so the whole sheet lives in one curvilinear field: row courses bow
   around the horizon — gently at the screen edges, wrapping hard at the rim —
   columns fan into meridians, and the map's Jacobian tilts each card tangent
   to its course and compresses it as it nears the rim. */
const COLS_PER_SET = 4;
const SETS = 3;
const CARDS_PER_COL = 10;
/** Conveyor speed, px/s — one column width in roughly ten seconds. */
const SPEED = 24;
/** Clock offset so the very first painted frame is already mid-flow. */
const T0 = 4;
/** Flag-orbit radius as a multiple of the horizon radius (wide mode). */
const ORBIT_K = 1.36;
/** Seconds per full revolution of the flag orbit. */
const ORBIT_DUR = 130;
/** Vertical squash of the flag orbit — a slightly inclined orbital plane. */
const ORBIT_TILT = 0.94;
/** Extra lens mass for the card sheet — the shader's law with a slightly
    deeper well, so the whole-sheet curvature reads at the screen edges. */
const LENS_GAIN = 1.18;

const TAU = Math.PI * 2;

/* Per-column start offsets into the pair list, chosen so a repeated component
   never lands within five rows of itself in a neighbouring column. */
const COL_OFFSETS: readonly number[] = [0, 6, 11, 4];

const pairAt = (index: number): Pair => PAIRS[index % PAIRS.length] ?? PAIRS[0];

const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);
const smooth01 = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

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
   coming out — so a still reads as a before/after ledger, not decoration.
   Each fabric cell stacks BOTH faces; CSS shows the source face until the
   cell's column crosses the mass (.is-out), then the translated one. */
function DemoCard({ pair, side }: { pair: Pair; side: 'en' | 'tr' }) {
  const tr = side === 'tr';
  return (
    <article
      className={`eh-card is-${pair.variant} is-face-${side}`}
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

function GridSide({
  side,
  trackRef,
  gridRef,
}: {
  side: 'en' | 'tr';
  trackRef: React.RefObject<HTMLDivElement | null>;
  gridRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      className={`eh-grid is-${side}`}
      ref={gridRef}
      role='group'
      aria-label={
        side === 'en'
          ? 'English source components drifting into the event horizon'
          : 'The same components emerging translated and locale-stamped'
      }
    >
      <div className='eh-track' ref={trackRef}>
        {Array.from({ length: COLS_PER_SET * SETS }, (_, c) => (
          <div className='eh-col' key={c}>
            {Array.from({ length: CARDS_PER_COL }, (_, row) => {
              const pair = pairAt((COL_OFFSETS[c % COLS_PER_SET] ?? 0) + row);
              return (
                <div className='eh-cell' key={row}>
                  <DemoCard pair={pair} side={side} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

type CellGeom = { el: HTMLElement; cy: number };
type ColGeom = {
  el: HTMLElement;
  cx: number;
  /** Which face the column currently shows; null until the first frame. */
  out: boolean | null;
  cells: CellGeom[];
};
type ClothGeom = {
  track: HTMLElement;
  /** Track world-x at conveyor offset 0. */
  base: number;
  /** Track world-y offset within the hero. */
  top: number;
  cols: ColGeom[];
};

/**
 * Kevin's sketch, built literally: two dense component sheets fill the screen
 * from its edges and are pulled into a REAL event horizon at center. The
 * horizon is a purpose-built lensing shader (lib/horizon-field.ts): an
 * accretion streak field whose sampling coordinates bend around the rim into
 * a brilliant photon ring, the page's own ruled hairlines warping with it,
 * over a genuinely dark core. The sheets are conveyors of adjacent columns
 * sliding on one shared clock — but the layout is only the source plane: per
 * frame every card images through the SAME point-mass lens the shader uses,
 * so the entire sheet obeys one curvilinear perspective. Row courses bow
 * around the hole (gently far out, wrapping at the rim), columns fan like
 * meridians, and each card rides tangent to its course, compressing as it
 * approaches the glow. The dark core holds the mark, headline, CTAs and the
 * npx chip light-on-dark; the locale flag chips ride a slightly inclined
 * orbit around the horizon, each oriented tangent to the ring like a
 * satellite belt.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const gridEnRef = useRef<HTMLDivElement>(null);
  const gridTrRef = useRef<HTMLDivElement>(null);
  const trackEnRef = useRef<HTMLDivElement>(null);
  const trackTrRef = useRef<HTMLDivElement>(null);
  // The card-grid refs survived the in-progress hero rework as JSX call
  // sites; declared here so the grids render while that rework lands.
  const gridEnRef = useRef<HTMLDivElement>(null);
  const gridTrRef = useRef<HTMLDivElement>(null);
  const trackEnRef = useRef<HTMLDivElement>(null);
  const trackTrRef = useRef<HTMLDivElement>(null);
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
      const trackEn = trackEnRef.current;
      const trackTr = trackTrRef.current;
      const gridEn = gridEnRef.current;
      const gridTr = gridTrRef.current;
      const fieldCanvas = fieldRef.current;
      const orbit = orbitRef.current;
      const rail = railRef.current;
      if (!hero || !trackEn || !trackTr || !gridEn || !gridTr || !fieldCanvas || !orbit || !rail)
        return;

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

      let sides: SideGeom[] = [];
      let wide = true;
      let cx = 0;
      let cy = 0;
      let r = 240;
      let orbitR = 320;
      let setW = 1;
      let heroW = 1;

      /* The flag chips, driven directly each frame — no wrapper rotation, no
         counter-rotation: each chip is seated on the (slightly inclined)
         orbit and oriented TANGENT to it, satellites riding the ring. */
      const chips = Array.from(orbit.querySelectorAll<HTMLElement>('.eh-chip'));

      /* One conveyor frame. The sheets slide in flat coordinates on a shared
         clock; every card is then imaged through the point-mass lens — the
         same law the shader bends the page's rules with — so cards travel
         ALONG their curved courses, tilt tangent to them, and compress as
         they near the rim, where the glow extinguishes them. */
      const frame = (timeSec: number) => {
        const offset = ((timeSec * SPEED) % setW + setW) % setW;
        /* The bands sit close to the hole on phones; soften the field so the
           fold reads as a tidy curved grid, not a smeared one. */
        const gain = wide ? 1 : 0.5;
        const rl = r * LENS_GAIN;
        const r2x4 = 4 * rl * rl;
        const margin = r + 340;
        for (const side of sides) {
          const baseX = side.base + offset;
          side.track.style.transform = `translate3d(${baseX.toFixed(2)}px, 0, 0)`;
          for (const col of side.cols) {
            const colX = baseX + col.cx;
            /* Offscreen columns skip their writes; the margin is wider than
               any lens displacement, so transforms are current before entry. */
            if (colX < -margin || colX > heroW + margin) continue;
            const dx = colX - cx;
            for (const cell of col.cells) {
              const dy = side.top + cell.cy - cy;
              const rs = Math.hypot(dx, dy);
              if (rs < 2) {
                cell.el.style.opacity = '0';
                continue;
              }
              /* Source radius ρs images at ρ = (ρs + √(ρs² + 4rl²)) / 2 — the
                 inverse of the shader's rs = r − 1/r point-mass lens (with
                 the slightly deeper LENS_GAIN well), so the card field and
                 the shader's bent rules belong to one curvature. */
              const root = Math.sqrt(rs * rs + r2x4);
              const rho = (rs + root) / 2;
              /* Jacobian of the radial map: mr compresses radially (→ ½ at
                 the rim), mt magnifies tangentially (the lens's arc-stretch). */
              const mr = 0.5 * (1 + rs / root);
              const mt = rho / rs;
              const ddx = dx * ((rho - rs) / rs) * gain;
              const ddy = dy * ((rho - rs) / rs) * gain;
              /* Course tangent = the image of the flat +x direction. Cards
                 rotate to sit tangent on their course; scales are the mapped
                 lengths of the card's own axes, capped so cards only ever
                 compress (the lens may stretch space, never the card). */
              const vx = (mr * dx * dx + mt * dy * dy) / (rs * rs);
              const vy = (dx * dy * (mr - mt)) / (rs * rs);
              const rot = Math.atan2(vy, vx) * gain;
              const sAlong = 1 + (Math.min(Math.hypot(mr * dx, mt * dy) / rs, 1) - 1) * gain;
              const sAcross = 1 + (Math.min(Math.hypot(mr * dy, mt * dx) / rs, 1) - 1) * gain;
              const fx = dx + ddx;
              const fy = dy + ddy;
              const d = Math.hypot(fx, fy);
              /* Extinction rides the flag orbit — the last stable orbit.
                 Courses visibly bow toward the ring and evaporate with a
                 small standoff just OUTSIDE it, so the chips keep a truly
                 clear lane, the glow annulus stays clean, and the fade is
                 monotone (no banding of half-ghosts between lane and rim). */
              const fade = smooth01((d - orbitR * 1.06) / (r * 0.18));
              let alpha = 1 - (1 - fade) * (wide ? 1 : 0.55);
              if (wide) {
                /* The side gate keeps each track on its own half. */
                alpha *= smooth01((side.sign * fx) / (r * 0.55));
              }
              cell.el.style.transform = `translate3d(${ddx.toFixed(2)}px, ${ddy.toFixed(
                2
              )}px, 0) rotate(${rot.toFixed(4)}rad) scale(${sAlong.toFixed(3)}, ${sAcross.toFixed(
                3
              )})`;
              cell.el.style.opacity = alpha.toFixed(3);
            }
          }
        }

        /* The flag orbit: chips revolve on a slightly inclined ellipse, each
           oriented tangent to it. Chips on the lower arc take a 180° roll
           (snapped at the sides, where they stand vertical) so the text
           never inverts — the circular-seal read. Far-side chips (top arc)
           shrink and dim as if passing behind the rim glow. */
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

      const measure = () => {
        const w = hero.clientWidth;
        const h = hero.clientHeight;
        if (w < 10 || h < 10) return;
        heroW = w;
        wide = w >= 760;
        r = wide
          ? Math.min(Math.max(w * 0.19, 228), 300, h * 0.36)
          : Math.min(w * 0.4, 168, h * 0.26);
        cx = w / 2;

        /* Reset every conveyor transform before reading geometry, so rects are
           unpolluted by the previous frame. */
        for (const track of [trackEn, trackTr]) {
          track.style.transform = 'none';
          for (const col of Array.from(track.children)) {
            if (!(col instanceof HTMLElement)) continue;
            for (const cell of Array.from(col.children)) {
              if (cell instanceof HTMLElement) cell.style.transform = 'none';
            }
          }
        }

        /* Stack mode folds the grids into two dense bands; their height is the
           first column's visible content (CSS hides rows past the second). */
        let bandH = 0;
        if (!wide) {
          const probe = trackEn.querySelector('.eh-col');
          if (probe instanceof HTMLElement) {
            let sum = 0;
            let count = 0;
            for (const cell of Array.from(probe.children)) {
              if (cell instanceof HTMLElement && cell.offsetHeight > 0) {
                sum += cell.offsetHeight;
                count += 1;
              }
            }
            bandH = sum + Math.max(0, count - 1) * 12;
          }
        }

        /* Stack bands stand off the rim far enough for the orbit chips. */
        const bandGap = 52;
        cy = wide
          ? Math.max(Math.min(h * 0.47, h - r - 148), r + 96)
          : Math.max(Math.min(h * 0.42, h - r - bandH - 104), r + bandH + 26);
        orbitR = wide ? r * ORBIT_K : Math.min(r + 36, w / 2 - 20);

        hero.style.setProperty('--eh-cx', `${cx.toFixed(1)}px`);
        hero.style.setProperty('--eh-cy', `${cy.toFixed(1)}px`);
        hero.style.setProperty('--eh-r', `${r.toFixed(1)}px`);
        hero.dataset.ehMode = wide ? 'wide' : 'stack';

        if (wide) {
          trackEn.style.top = '0px';
          trackEn.style.height = '100%';
          trackTr.style.top = '0px';
          trackTr.style.height = '100%';
        } else {
          const topBand = cy - r - bandGap - bandH;
          trackEn.style.top = `${topBand.toFixed(1)}px`;
          trackEn.style.height = `${bandH.toFixed(1)}px`;
          trackTr.style.top = `${(cy + r + bandGap).toFixed(1)}px`;
          trackTr.style.height = `${bandH.toFixed(1)}px`;
        }

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

        const readSide = (track: HTMLElement, sign: -1 | 1): SideGeom => {
          const trackRect = track.getBoundingClientRect();
          const cols: ColGeom[] = [];
          for (const colEl of Array.from(track.children)) {
            if (!(colEl instanceof HTMLElement)) continue;
            const colRect = colEl.getBoundingClientRect();
            const cells: CellGeom[] = [];
            for (const cellEl of Array.from(colEl.children)) {
              if (!(cellEl instanceof HTMLElement) || cellEl.offsetHeight === 0) continue;
              const rect = cellEl.getBoundingClientRect();
              cells.push({ el: cellEl, cy: rect.top - trackRect.top + rect.height / 2 });
            }
            cols.push({
              cx: colRect.left - trackRect.left + colRect.width / 2,
              cells,
            });
          }
          return { track, sign, base: 0, top: trackRect.top - hero.getBoundingClientRect().top, cols };
        };

        const en = readSide(trackEn, -1);
        const tr = readSide(trackTr, 1);
        const first = en.cols[0];
        const second = en.cols[1];
        const colStep = first && second ? second.cx - first.cx : 248;
        setW = Math.max(1, colStep * COLS_PER_SET);
        /* Source columns run in from the left screen edge; translated columns
           surface at the rim and run out to the right edge. Both tracks share
           the conveyor clock, so the flow reads as one continuous current. */
        en.base = -setW;
        tr.base = cx - setW;
        sides = [en, tr];

        /* Reduced motion: one composed still, both grids full, warp applied. */
        frame(reduced ? setW * 0.38 : gsap.ticker.time + T0);
      };

      measure();
      /* Card heights settle once webfonts arrive; re-measure then. */
      void document.fonts?.ready.then(() => measure());

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
      gsap.from([gridEn, gridTr], { autoAlpha: 0, duration: 0.9, delay: 0.2, ease: 'none' });
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

        <GridSide side='en' gridRef={gridEnRef} trackRef={trackEnRef} />
        <GridSide side='tr' gridRef={gridTrRef} trackRef={trackTrRef} />

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
                <i>{entry.flag}</i>
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
