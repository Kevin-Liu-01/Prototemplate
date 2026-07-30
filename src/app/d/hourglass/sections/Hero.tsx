'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef, useState } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The hourglass hero, bent the way the founder drew it: the product UI is a
 * FABRIC DEFORMED BY THE MASS at the waist. ONE continuous cloth of
 * component cards spans the hero's lower bulb — a dense grid whose top
 * silhouette is the sketch's hill, rising from off-screen at the lower
 * left, cresting just under the GT mark, and falling away to the lower
 * right, with seven row courses draped in parallel under that curve (the
 * relativity rubber-sheet, viewed from slightly above). The cloth passes
 * BEHIND the waist stack: at the seam under the mark it dives into the
 * dark and re-emerges on the far side translated — English source strings
 * ride in from the left, their locale-stamped translations ride out on the
 * right. The open dark ABOVE the hill is the hourglass's upper bulb:
 * negative space pinched to a waist where the crest meets the stack.
 *
 * Implementation: CSS cannot bend a plane, so the cloth is a
 * piecewise-planar sweep — every 300px course column is split into three
 * 100px strips, and each strip is a flat chord hung on a 3D rail via
 * matrix3d: its width axis lies along the chord, its rows fall along one
 * shared drape direction (down-screen and toward the viewer — the
 * rotateX-flavored pitch), and real perspective comes from the stage. The
 * rail is a height-field path spanning the full stage: x runs edge to
 * edge, y eases up a hill whose slope dies at the ends and the crest, z
 * dips behind the glass as the course nears the waist — so every projected
 * course is a draped curve that climbs, banks and foreshortens toward the
 * mass. Adjacent strips share chord endpoints and the one fall-line, so
 * rows and columns stay woven — no card ever moves alone. The conveyor is
 * the same placement math with a moving arc offset: one shared drift
 * carries the whole cloth through the waist, and each strip stacks both
 * language faces, swapping en → tr while it crosses the seam at zero
 * opacity — a pair that enters lower-left exits lower-right translated,
 * at the mirrored height on the symmetric hill.
 */

type WallUi =
  | 'field'
  | 'button'
  | 'toast'
  | 'row'
  | 'chip'
  | 'comment'
  | 'banner'
  | 'invite'
  | 'status'
  | 'heading'
  | 'select'
  | 'switch'
  | 'progress'
  | 'tabs';

type Face = { text: string; detail?: string };

type Pair = {
  ui: WallUi;
  /** Component-kind label on the card's meta row. */
  kind: string;
  /** BCP-47 stamp on the emitted card; every source card is stamped en-US. */
  stamp: string;
  /** ISO tag for the lang attribute on the emitted card. */
  lang: string;
  rtl?: boolean;
  en: Face;
  tr: Face;
};

/* The pair the folded mobile hero shows — named so both layouts share it. */
const SEARCH_PAIR: Pair = {
  ui: 'field',
  kind: 'Input',
  stamp: 'ja-JP',
  lang: 'ja',
  en: { text: 'Search the docs', detail: '⌘K' },
  tr: { text: 'ドキュメントを検索', detail: '⌘K' },
};

/* Mobile-only sibling of the wall's Arabic saved-toast — the fold shows the
   Korean face of the same source string. */
const SAVED_KO_PAIR: Pair = {
  ui: 'toast',
  kind: 'Toast',
  stamp: 'ko-KR',
  lang: 'ko',
  en: { text: 'Changes saved', detail: '18 strings updated' },
  tr: { text: '변경 사항 저장됨', detail: '문자열 18개 업데이트됨' },
};

/**
 * Vetted string pairs from the PortalHero prototype — real UI components with
 * real human translations. Listed column-major: each run of ROWS_PER_COLUMN
 * pairs is one course column, ordered so no course or column repeats a
 * component shape next to itself. Numbers, times and RTL localize too
 * (2,814 → 2.814; name@company.com → nome@azienda.it; the Arabic toast and
 * Hebrew status mirror), so the sheet demonstrates the product rather than
 * decorates. Seven pairs per column — the sketch's seven draped courses.
 */
const PAIRS: readonly Pair[] = [
  /* ---- course column one ---- */
  SEARCH_PAIR,
  {
    ui: 'row',
    kind: 'Card',
    stamp: 'it-IT',
    lang: 'it',
    en: { text: 'Arrives tomorrow', detail: 'Order #1842 · 9:30' },
    tr: { text: 'Arriva domani', detail: 'Ordine #1842 · 9:30' },
  },
  {
    ui: 'button',
    kind: 'Button',
    stamp: 'pt-BR',
    lang: 'pt',
    en: { text: 'Track package' },
    tr: { text: 'Rastrear pacote' },
  },
  {
    ui: 'status',
    kind: 'Status',
    stamp: 'th-TH',
    lang: 'th',
    en: { text: 'Locales deployed', detail: 'v2.4.0 · Global' },
    tr: { text: 'เผยแพร่ภาษาแล้ว', detail: 'v2.4.0 · ทั่วโลก' },
  },
  {
    ui: 'comment',
    kind: 'Comment',
    stamp: 'es-MX',
    lang: 'es',
    en: { text: 'Looks great — ship it', detail: '@mira · just now' },
    tr: { text: '¡Listo para enviar!', detail: '@mira · ahora mismo' },
  },
  {
    ui: 'chip',
    kind: 'Badge',
    stamp: 'fr-FR',
    lang: 'fr',
    en: { text: 'Talk to sales', detail: 'Enterprise' },
    tr: { text: 'Contacter les ventes', detail: 'Entreprise' },
  },
  {
    ui: 'row',
    kind: 'Checkbox',
    stamp: 'de-DE',
    lang: 'de',
    en: { text: 'Ready for review', detail: '12 strings · Legal' },
    tr: { text: 'Bereit zur Prüfung', detail: '12 Strings · Rechtliches' },
  },
  /* ---- course column two ---- */
  {
    ui: 'banner',
    kind: 'Banner',
    stamp: 'nl-NL',
    lang: 'nl',
    en: { text: 'Built for every market' },
    tr: { text: 'Gebouwd voor elke markt' },
  },
  {
    ui: 'heading',
    kind: 'Heading',
    stamp: 'hi-IN',
    lang: 'hi',
    en: { text: 'Welcome back', detail: 'Dashboard' },
    tr: { text: 'वापसी पर स्वागत है', detail: 'डैशबोर्ड' },
  },
  {
    ui: 'toast',
    kind: 'Toast',
    stamp: 'ar-SA',
    lang: 'ar',
    rtl: true,
    en: { text: 'Changes saved', detail: '18 strings updated' },
    tr: { text: 'تم حفظ التغييرات', detail: 'تم تحديث 18 سلسلة' },
  },
  {
    ui: 'progress',
    kind: 'Progress',
    stamp: 'pt-BR',
    lang: 'pt',
    en: { text: 'Translation coverage', detail: '2,814 of 2,993 strings' },
    tr: { text: 'Cobertura da tradução', detail: '2.814 de 2.993 strings' },
  },
  {
    ui: 'invite',
    kind: 'Input + button',
    stamp: 'it-IT',
    lang: 'it',
    en: { text: 'Invite teammate', detail: 'name@company.com' },
    tr: { text: 'Invita un collega', detail: 'nome@azienda.it' },
  },
  {
    ui: 'button',
    kind: 'Button',
    stamp: 'de-DE',
    lang: 'de',
    en: { text: 'Start building', detail: 'Primary action' },
    tr: { text: 'Jetzt loslegen', detail: 'Primäre Aktion' },
  },
  {
    ui: 'select',
    kind: 'Select',
    stamp: 'zh-CN',
    lang: 'zh-Hans',
    en: { text: 'English (US)', detail: 'Source locale' },
    tr: { text: '简体中文', detail: '目标语言' },
  },
  /* ---- course column three ---- */
  {
    ui: 'tabs',
    kind: 'Tabs',
    stamp: 'id-ID',
    lang: 'id',
    en: { text: 'Desktop preview', detail: 'Live preview' },
    tr: { text: 'Pratinjau desktop', detail: 'Pratinjau langsung' },
  },
  {
    ui: 'chip',
    kind: 'Glossary',
    stamp: 'tr-TR',
    lang: 'tr',
    en: { text: 'Keep Locadex untranslated', detail: 'Glossary rule' },
    tr: { text: 'Locadex çevrilmeden kalır', detail: 'Sözlük kuralı' },
  },
  {
    ui: 'switch',
    kind: 'Webhook',
    stamp: 'uk-UA',
    lang: 'uk',
    en: { text: 'Notify localization channel', detail: 'Webhook connected' },
    tr: { text: 'Сповістити канал локалізації', detail: 'Вебхук підключено' },
  },
  {
    ui: 'row',
    kind: 'Card',
    stamp: 'da-DK',
    lang: 'da',
    en: { text: '8 collaborators', detail: 'Localization workspace' },
    tr: { text: '8 samarbejdspartnere', detail: 'Lokaliseringsarbejdsområde' },
  },
  {
    ui: 'button',
    kind: 'API action',
    stamp: 'sv-SE',
    lang: 'sv',
    en: { text: 'Publish changes', detail: 'POST /v1/translations' },
    tr: { text: 'Publicera ändringar', detail: 'POST /v1/translations' },
  },
  {
    ui: 'status',
    kind: 'QA status',
    stamp: 'he-IL',
    lang: 'he',
    rtl: true,
    en: { text: 'All checks passed', detail: '0 localization issues' },
    tr: { text: 'כל הבדיקות עברו', detail: '0 בעיות לוקליזציה' },
  },
  {
    ui: 'chip',
    kind: 'Tone',
    stamp: 'pl-PL',
    lang: 'pl',
    en: { text: 'Friendly and concise', detail: 'Voice directive' },
    tr: { text: 'Przyjazny i zwięzły', detail: 'Dyrektywa głosu' },
  },
];

const FLAGS: readonly string[] = ['🇪🇸', '🇫🇷', '🇩🇪', '🇯🇵', '🇰🇷', '🇨🇳', '🇮🇳', '🇸🇦', '🇧🇷', '🇮🇹', '🇳🇱', '🇹🇷'];

const WORDMARKS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
];

/* Grid constants. ROWS_PER_COLUMN must match the repeat() count on .hg-col.
   Each 300px course column is cut into three 100px strips — the flat chords
   that approximate the draped cloth — and twelve physical columns tile the
   arc axis completely (12 × 312 = one wrap period, sized past the longest
   rail plus both off-screen tails so nothing pops mid-wrap even on very
   wide stages). The 12px pitch gap is the cloth's weave: uniform hairline
   gutters between adjacent cells, matching the 12px row gap on .hg-col.
   PHYS_COLUMNS stays a multiple of the three-column pattern period: a wrap
   jump then always lands a column on a slot expecting its own pattern. */
const ROWS_PER_COLUMN = 7;
const STRIPS_PER_COLUMN = 3;
const PHYS_COLUMNS = 12;
const COLUMN_W = 300;
const COLUMN_PITCH = 312;
const STRIP_W = COLUMN_W / STRIPS_PER_COLUMN;
const WRAP_SPAN = COLUMN_PITCH * PHYS_COLUMNS;
const ARC_MIN = -420;
/* One pattern period (three columns) per loop — after it, column n hands its
   arc slot to column n+3, which carries the same pattern, so the reset is
   invisible. */
const LOOP_ARC = COLUMN_PITCH * 3;

/* ---------- the draped rail ---------- */

/* Elevation geometry of the cloth (x across the screen, y down it, z into
   it; arc length s from the rail's start past the lower-left corner). The
   rail is the cloth's TOP course — the sketch's hill. It enters off-screen
   at the lower left (EDGE_OUT past the frame, Y_LOW_F down it), rises along
   a raised-cosine whose slope dies at the ends and the crest, peaks at
   screen center just under the mark (Y_CREST_F up it), and falls
   symmetrically to the lower right. Depth runs with the climb: z starts
   slightly proud of the glass at the corners and dips behind it as the
   course nears the waist (DIVE_POW), so the crest both rises and recedes —
   the fabric sags toward the mass and slides behind the stack, and cards
   bank and foreshorten as they approach it. The curve is sampled
   parametrically, resampled into an arc-length LUT, and extended straight
   along its end tangents so off-screen strips stay finite. Rows hang from
   the rail along ONE shared fall-line (DRAPE: down-screen and toward the
   viewer), which keeps adjacent chords seam-free and makes the seven
   courses parallel draped curves that crest under the waist together. */
const EDGE_OUT = 120;
const DIVE_POW = 1.25;
const Y_LOW_F = 0.31;
const Y_CREST_F = 0.17;
const Z_EDGE = 40;
const Z_CREST = -340;
const DRAPE = (52 * Math.PI) / 180;
const DRAPE_Y = Math.cos(DRAPE);
const DRAPE_Z = Math.sin(DRAPE);
const RAIL_STEP = 4;
const RAIL_PAD = 480;
const CURVE_SAMPLES = 768;

type Rail = {
  /** Stage size the LUT was built for. */
  view: number;
  height: number;
  /** Arc length of the visible sweep — left screen edge to right. */
  span: number;
  xs: Float64Array;
  ys: Float64Array;
  zs: Float64Array;
};

function buildRail(view: number, height: number): Rail {
  const xSpan = view / 2 + EDGE_OUT;
  const yLow = height * Y_LOW_F;
  const yCrest = -height * Y_CREST_F;
  const n = CURVE_SAMPLES;
  const px = new Float64Array(n + 1);
  const py = new Float64Array(n + 1);
  const pz = new Float64Array(n + 1);
  const pl = new Float64Array(n + 1);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    /* 0 at both corners, 1 at the crest, zero slope at all three. */
    const hill = 0.5 - 0.5 * Math.cos(2 * Math.PI * t);
    px[i] = -xSpan + 2 * xSpan * t;
    py[i] = yLow + (yCrest - yLow) * hill;
    pz[i] = Z_EDGE + (Z_CREST - Z_EDGE) * Math.pow(hill, DIVE_POW);
    pl[i] =
      i === 0
        ? 0
        : (pl[i - 1] ?? 0) +
          Math.hypot(
            (px[i] ?? 0) - (px[i - 1] ?? 0),
            (py[i] ?? 0) - (py[i - 1] ?? 0),
            (pz[i] ?? 0) - (pz[i - 1] ?? 0)
          );
  }
  const span = pl[n] ?? 1;
  const count = Math.ceil((span + RAIL_PAD * 2) / RAIL_STEP) + 1;
  const xs = new Float64Array(count);
  const ys = new Float64Array(count);
  const zs = new Float64Array(count);
  let seg = 0;
  for (let k = 0; k < count; k++) {
    const s = -RAIL_PAD + k * RAIL_STEP;
    if (s <= 0) {
      const d = pl[1] || 1;
      const f = s / d;
      xs[k] = (px[0] ?? 0) + ((px[1] ?? 0) - (px[0] ?? 0)) * f;
      ys[k] = (py[0] ?? 0) + ((py[1] ?? 0) - (py[0] ?? 0)) * f;
      zs[k] = (pz[0] ?? 0) + ((pz[1] ?? 0) - (pz[0] ?? 0)) * f;
    } else if (s >= span) {
      const d = span - (pl[n - 1] ?? 0) || 1;
      const f = (s - span) / d;
      xs[k] = (px[n] ?? 0) + ((px[n] ?? 0) - (px[n - 1] ?? 0)) * f;
      ys[k] = (py[n] ?? 0) + ((py[n] ?? 0) - (py[n - 1] ?? 0)) * f;
      zs[k] = (pz[n] ?? 0) + ((pz[n] ?? 0) - (pz[n - 1] ?? 0)) * f;
    } else {
      while ((pl[seg + 1] ?? span) < s) seg++;
      const d = (pl[seg + 1] ?? 0) - (pl[seg] ?? 0) || 1;
      const f = (s - (pl[seg] ?? 0)) / d;
      xs[k] = (px[seg] ?? 0) * (1 - f) + (px[seg + 1] ?? 0) * f;
      ys[k] = (py[seg] ?? 0) * (1 - f) + (py[seg + 1] ?? 0) * f;
      zs[k] = (pz[seg] ?? 0) * (1 - f) + (pz[seg + 1] ?? 0) * f;
    }
  }
  return { view, height, span, xs, ys, zs };
}

function railPoint(rail: Rail, s: number): { x: number; y: number; z: number } {
  const f = (s + RAIL_PAD) / RAIL_STEP;
  const i = Math.min(Math.max(Math.floor(f), 0), rail.xs.length - 2);
  const t = Math.min(Math.max(f - i, 0), 1);
  return {
    x: (rail.xs[i] ?? 0) * (1 - t) + (rail.xs[i + 1] ?? 0) * t,
    y: (rail.ys[i] ?? 0) * (1 - t) + (rail.ys[i + 1] ?? 0) * t,
    z: (rail.zs[i] ?? 0) * (1 - t) + (rail.zs[i + 1] ?? 0) * t,
  };
}

/* Keeps every column's arc inside one wrap period, [ARC_MIN, ARC_MIN+WRAP). */
function wrapArc(v: number): number {
  return ((((v - ARC_MIN) % WRAP_SPAN) + WRAP_SPAN) % WRAP_SPAN) + ARC_MIN;
}

/* Depth grading, by m — the strip's distance from the waist seam as a
   fraction of the half-sweep (1 at the lower corners, 0 at the seam). The
   cloth stays legible almost all the way up the hill; only a hard notch at
   the seam swallows it entirely, ~60px of arc each side, so the fabric
   visibly dives INTO the waist and re-emerges translated — and the en→tr
   face swap happens inside that notch at zero opacity, so it can never
   pop. Dim deepens toward the mass and the hairline brightens toward the
   crest, tracing the hill's silhouette; all three are stepped per 100px
   strip, which the eye reads as smooth. */
function fadeAt(m: number): number {
  const base = m >= 0.5 ? 1 : 0.55 + 0.9 * m;
  if (m <= 0.06) return 0;
  if (m >= 0.2) return base;
  return base * ((m - 0.06) / 0.14);
}

function dimAt(m: number): number {
  if (m >= 0.55) return 0;
  return ((0.55 - m) / 0.55) * 0.42;
}

function railGlowAt(m: number): number {
  return 0.08 + 0.18 * (1 - Math.min(Math.max(m, 0), 1));
}

function CardBody({ ui, text, detail }: { ui: WallUi; text: string; detail?: string }) {
  switch (ui) {
    case 'field':
      return (
        <span className='hg-field'>
          <i className='hg-glyph' aria-hidden='true' />
          {text}
          {detail ? <kbd>{detail}</kbd> : null}
        </span>
      );
    case 'select':
      return (
        <>
          <span className='hg-field'>
            {text}
            <i className='hg-chev' aria-hidden='true' />
          </span>
          {detail ? <small className='hg-hint'>{detail}</small> : null}
        </>
      );
    case 'button':
      return (
        <>
          <span className='hg-pill'>
            {text}
            <b aria-hidden='true'>→</b>
          </span>
          {detail ? <small className='hg-hint'>{detail}</small> : null}
        </>
      );
    case 'toast':
      return (
        <span className='hg-trow'>
          <i className='hg-check' aria-hidden='true' />
          <span className='hg-tmain'>
            <b>{text}</b>
            {detail ? <small>{detail}</small> : null}
          </span>
        </span>
      );
    case 'row':
      return (
        <span className='hg-trow'>
          <i className='hg-box' aria-hidden='true' />
          <span className='hg-tmain'>
            <b>{text}</b>
            {detail ? <small>{detail}</small> : null}
          </span>
        </span>
      );
    case 'switch':
      return (
        <span className='hg-trow'>
          <i className='hg-toggle' aria-hidden='true' />
          <span className='hg-tmain'>
            <b>{text}</b>
            {detail ? <small>{detail}</small> : null}
          </span>
        </span>
      );
    case 'chip':
      return (
        <>
          <span className='hg-badge'>{detail}</span>
          <span className='hg-pill is-line'>{text}</span>
        </>
      );
    case 'comment':
      return (
        <span className='hg-trow'>
          <i className='hg-ava' aria-hidden='true'>
            M
          </i>
          <span className='hg-tmain'>
            <b>{text}</b>
            {detail ? <small>{detail}</small> : null}
          </span>
        </span>
      );
    case 'banner':
      return <span className='hg-banner'>{text}</span>;
    case 'heading':
      return (
        <>
          <span className='hg-banner'>{text}</span>
          {detail ? <small className='hg-hint'>{detail}</small> : null}
        </>
      );
    case 'invite':
      return (
        <>
          <span className='hg-field is-dim'>{detail}</span>
          <span className='hg-pill is-line'>{text}</span>
        </>
      );
    case 'progress':
      return (
        <>
          <span className='hg-tmain'>
            <b>{text}</b>
            {detail ? <small>{detail}</small> : null}
          </span>
          <span className='hg-meter' aria-hidden='true'>
            <i />
          </span>
        </>
      );
    case 'tabs':
      return (
        <span className='hg-tabs'>
          <span className='is-on'>{text}</span>
          {detail ? <span>{detail}</span> : null}
        </span>
      );
    case 'status':
      return (
        <span className='hg-trow'>
          <i className='hg-dot' aria-hidden='true' />
          <span className='hg-tmain'>
            <b>{text}</b>
            {detail ? <small>{detail}</small> : null}
          </span>
        </span>
      );
  }
}

function Card({ pair, face }: { pair: Pair; face: 'en' | 'tr' }) {
  const emitted = face === 'tr';
  const copy = emitted ? pair.tr : pair.en;
  const rtl = emitted && pair.rtl;
  return (
    <article className={`hg-card${rtl ? ' is-rtl' : ''}`}>
      <header className='hg-card-meta'>
        <span>{pair.kind}</span>
        <span className='hg-stamp'>{emitted ? pair.stamp : 'en-US'}</span>
      </header>
      <div className='hg-card-body' dir={rtl ? 'rtl' : undefined} lang={emitted ? pair.lang : undefined}>
        <CardBody detail={copy.detail} text={copy.text} ui={pair.ui} />
      </div>
    </article>
  );
}

function Fabric() {
  const patterns: Pair[][] = [];
  for (let i = 0; i < PAIRS.length; i += ROWS_PER_COLUMN) {
    patterns.push(PAIRS.slice(i, i + ROWS_PER_COLUMN));
  }

  /* Each strip is a 100px window onto its column's 300px grid, and stacks
     BOTH language faces of that window: the English course grid and its
     locale-stamped twin, cell for cell. Hero.tsx flips data-face while the
     column crosses the seam notch under the mark, so the same physical
     cloth that rode in from the left rides out on the right translated. */
  return (
    <div className='hg-fabric'>
      {Array.from({ length: PHYS_COLUMNS }, (_, col) => {
        const pattern = patterns[col % patterns.length];
        if (!pattern) return null;
        return Array.from({ length: STRIPS_PER_COLUMN }, (_, strip) => (
          <div className='hg-strip' data-col={col} data-strip={strip} key={`${col}-${strip}`}>
            <div className='hg-strip-in' style={{ transform: `translateX(${-strip * STRIP_W}px)` }}>
              <div className='hg-col is-en'>
                {pattern.map((pair) => (
                  <Card face='en' key={`${pair.stamp}-${pair.en.text}`} pair={pair} />
                ))}
              </div>
              <div className='hg-col is-tr'>
                {pattern.map((pair) => (
                  <Card face='tr' key={`${pair.stamp}-${pair.en.text}`} pair={pair} />
                ))}
              </div>
            </div>
          </div>
        ));
      })}
    </div>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
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
      const stage = root.current?.querySelector<HTMLElement>('.hg-stage');
      if (!stage) return;

      type StripSlot = {
        el: HTMLElement;
        col: number;
        strip: number;
        shown: boolean;
        face: 'en' | 'tr';
      };

      const slots: StripSlot[] = gsap.utils.toArray<HTMLElement>('.hg-strip', stage).map((el) => ({
        el,
        col: Number(el.dataset.col ?? '0'),
        strip: Number(el.dataset.strip ?? '0'),
        shown: true,
        face: 'en',
      }));

      let rail = buildRail(stage.clientWidth, stage.clientHeight);

      /* d = conveyor arc offset; e = entrance progress (the cloth slides in
         along its own arc from the lower left while fading up). */
      const flow = { d: 0, e: 1 };

      /* Hangs every strip as a flat chord on the draped rail: sample the
         chord's endpoints, aim the width axis along the chord, drop the rows
         along the shared fall-line, and grade opacity, dim and silhouette
         hairline by distance from the seam. ONE arc offset drives the whole
         cloth left to right, and a column's face flips to its translations
         while its center crosses the seam — inside the zero-opacity notch,
         so the swap is never seen. */
      const place = () => {
        const halfW = rail.view / 2;
        const halfH = rail.height / 2;
        const seam = rail.span / 2;
        const pull = (1 - flow.e) * 260;
        for (const slot of slots) {
          const colArc = wrapArc(slot.col * COLUMN_PITCH + flow.d - pull);
          const a0 = colArc + slot.strip * STRIP_W;
          const m = Math.min(Math.abs((a0 + STRIP_W / 2) / rail.span - 0.5) * 2, 1);
          const alpha = flow.e * fadeAt(m);
          if (a0 + STRIP_W < -30 || a0 > rail.span + 30 || alpha < 0.012) {
            if (slot.shown) {
              slot.el.style.visibility = 'hidden';
              slot.shown = false;
            }
            continue;
          }
          const face: 'en' | 'tr' = colArc + COLUMN_W / 2 >= seam ? 'tr' : 'en';
          if (slot.face !== face) {
            slot.face = face;
            slot.el.dataset.face = face;
          }
          const p0 = railPoint(rail, a0);
          const p1 = railPoint(rail, a0 + STRIP_W);
          const wx = (p1.x - p0.x) / STRIP_W;
          const wy = (p1.y - p0.y) / STRIP_W;
          const wz = (p1.z - p0.z) / STRIP_W;
          /* Unit normal (width × fall-line) completes the basis; the content
             is flat, so only its direction matters. */
          let nx = wy * DRAPE_Z - wz * DRAPE_Y;
          let ny = -wx * DRAPE_Z;
          let nz = wx * DRAPE_Y;
          const nl = Math.hypot(nx, ny, nz) || 1;
          nx /= nl;
          ny /= nl;
          nz /= nl;
          const style = slot.el.style;
          slot.shown = true;
          style.visibility = 'visible';
          style.opacity = alpha.toFixed(3);
          style.setProperty('--hgd', dimAt(m).toFixed(3));
          style.setProperty('--hgr', railGlowAt(m).toFixed(3));
          style.transform = `matrix3d(${wx.toFixed(5)},${wy.toFixed(5)},${wz.toFixed(5)},0,0,${DRAPE_Y.toFixed(5)},${DRAPE_Z.toFixed(5)},0,${nx.toFixed(5)},${ny.toFixed(5)},${nz.toFixed(5)},0,${(p0.x + halfW).toFixed(2)},${(p0.y + halfH).toFixed(2)},${p0.z.toFixed(2)},1)`;
        }
      };

      const onResize = () => {
        rail = buildRail(stage.clientWidth, stage.clientHeight);
        place();
      };
      window.addEventListener('resize', onResize);

      /* Reduced motion keeps the composed still: the mirror phase (d = 0),
         placed once, no ticking. */
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        place();
        return () => window.removeEventListener('resize', onResize);
      }

      flow.e = 0;
      place();
      gsap.to(flow, { e: 1, duration: 1.3, ease: 'power3.out', onUpdate: place });

      /* The waist stack rises once the sheet is moving. */
      gsap.from('[data-hg-in]', {
        y: 16,
        autoAlpha: 0,
        duration: 0.72,
        stagger: 0.07,
        ease: 'power2.out',
        delay: 0.2,
      });

      /* The pipeline: one shared arc offset carries the whole cloth through
         the waist — in from the left as English, out on the right
         translated. One pattern period per loop makes the reset invisible. */
      const drift = gsap.fromTo(
        flow,
        { d: 0 },
        { d: LOOP_ARC, duration: 105, ease: 'none', repeat: -1, onUpdate: place }
      );

      /* Nothing ticks while the hero is off screen. */
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          if (self.isActive) drift.play();
          else drift.pause();
        },
      });

      return () => window.removeEventListener('resize', onResize);
    },
    { scope: root }
  );

  return (
    <section className='hg-hero' id='top' ref={root}>
      <p className='sr-only'>
        English source strings on the left — search fields, toasts, buttons, review rows — ride a draped
        sheet of interface up to the mark at the center and come down the right side translated and
        locale-stamped: French, German, Japanese, Korean, Spanish, Arabic, and a hundred more.
      </p>

      <div className='hg-glow' aria-hidden='true' />

      <div className='hg-stage' aria-hidden='true'>
        <Fabric />
      </div>

      {/* Mobile: the drape folds into a vertical pipeline — source cards
          above the waist, their translations below it, each pair bending
          toward the mass between them. */}
      <div className='hg-m is-src' aria-hidden='true'>
        <div className='hg-m-strip'>
          <Card face='en' pair={SEARCH_PAIR} />
          <Card face='en' pair={SAVED_KO_PAIR} />
        </div>
      </div>

      <div className='hg-core'>
        <span className='hg-core-veil' aria-hidden='true' />
        <div className='hg-core-in'>
          <Image
            className='hg-mark'
            data-hg-in
            src='/brand/no-bg-gt-logo-dark.png'
            alt='General Translation'
            width={42}
            height={42}
          />

          <h1 data-hg-in>
            <span>Launch in</span>
            <span>
              <em>every</em> language.
            </span>
          </h1>

          <p className='hg-sub' data-hg-in>
            General Translation builds full-stack infrastructure for localizing apps, docs, and websites.
          </p>

          <div className='hg-acts' data-hg-in>
            <a className='tc-btn tc-btn-solid' href='#pricing'>
              Start building <b aria-hidden='true'>→</b>
            </a>
            <a className='tc-btn tc-btn-line' href='#frameworks'>
              Get a demo
            </a>
            <button className='tc-copy hg-copy' type='button' onClick={copy}>
              <span>$ npx gt@latest</span>
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className='hg-langs' data-hg-in>
            <p className='hg-langs-cap'>
              <i aria-hidden='true' />
              100+ languages
            </p>
            <div className='hg-flags' aria-hidden='true'>
              {FLAGS.map((flag) => (
                <span key={flag}>{flag}</span>
              ))}
              <span className='hg-flag-more'>+88</span>
            </div>
          </div>

          <div className='hg-wms' data-hg-in>
            <p className='hg-wms-cap'>Trusted in production</p>
            <div className='hg-wms-row'>
              {WORDMARKS.map((wm) => (
                <b className={`hg-wm ${wm.mark}`} key={wm.name}>
                  {wm.name}
                </b>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='hg-m is-out' aria-hidden='true'>
        <div className='hg-m-strip'>
          <Card face='tr' pair={SEARCH_PAIR} />
          <Card face='tr' pair={SAVED_KO_PAIR} />
        </div>
      </div>
    </section>
  );
}
