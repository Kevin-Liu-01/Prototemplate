'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef, useState } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The hourglass hero: two corridor walls of real product UI sweep toward a
 * vanishing point at screen center — in CURVILINEAR perspective. The walls
 * are not flat wedges: each one follows a curved rail (plan view: running
 * nearly straight into the depth at the screen edge — the two walls almost
 * parallel, an ordinary hallway — then bending inward with accelerating
 * curvature to hook across the point at the waist), so every convergence
 * line — the top and bottom courses and all eight row lines — projects as a
 * CONCAVE curve: steep off the screen edge, sagging toward the waist level
 * and gliding into the pinch, grid lines pulled into a central mass. The
 * left wall carries English source strings flowing INTO the
 * point; the right wall carries their locale-stamped translations flowing
 * OUT of it — the translation pipeline as motion. The negative space between
 * the walls is the hourglass: wide at the edges, pinched to a waist that
 * holds the mark, headline, CTAs, the languages row, and the wordmarks.
 *
 * Implementation: CSS cannot bend a plane, so each wall is a piecewise-planar
 * sweep — every 300px depth column is split into three 100px vertical strips,
 * and each strip is a flat chord placed along the rail (translate3d +
 * rotateY, real perspective from the stage). Adjacent strips share chord
 * endpoints, so the surface is continuous and only the heading turns. The
 * conveyor is the same placement math with a moving arc offset: strips travel
 * ALONG the curve, and foreshortening follows the arc. Rows share row lines
 * (uniform cell heights) on both walls at every frame, and the two walls run
 * mirrored arcs with mirrored pattern order, so the grids stay ordered
 * galleries — the curvature adds the drama, the alignment keeps the calm.
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
 * pairs is one depth column, ordered so no row or column repeats a component
 * shape next to itself. Numbers, times and RTL localize too (2,814 → 2.814;
 * name@company.com → nome@azienda.it; the Arabic toast and Hebrew status
 * mirror), so the walls demonstrate the product rather than decorate.
 */
const PAIRS: readonly Pair[] = [
  /* ---- depth column one ---- */
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
  {
    ui: 'button',
    kind: 'Button',
    stamp: 'zh-CN',
    lang: 'zh-Hans',
    en: { text: 'Open workspace' },
    tr: { text: '打开工作区' },
  },

  /* ---- depth column two ---- */
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
  {
    ui: 'switch',
    kind: 'Switch',
    stamp: 'nl-NL',
    lang: 'nl',
    en: { text: 'Auto-detect locale', detail: 'Browser language' },
    tr: { text: 'Taal automatisch detecteren', detail: 'Browsertaal' },
  },

  /* ---- depth column three ---- */
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
  {
    ui: 'row',
    kind: 'Checkbox',
    stamp: 'vi-VN',
    lang: 'vi',
    en: { text: 'Legal review required', detail: 'Workflow rule' },
    tr: { text: 'Cần xem xét pháp lý', detail: 'Quy tắc quy trình' },
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
   Each 300px depth column is cut into three 100px strips — the flat chords
   that approximate the curved wall — and six physical columns tile the arc
   axis completely (6 × 318 = one wrap period), so the conveyor loop is
   seamless at any frame and any wall length. */
const ROWS_PER_COLUMN = 8;
const STRIPS_PER_COLUMN = 3;
const PHYS_COLUMNS = 6;
const COLUMN_W = 300;
const COLUMN_PITCH = 318;
const STRIP_W = COLUMN_W / STRIPS_PER_COLUMN;
const WRAP_SPAN = COLUMN_PITCH * PHYS_COLUMNS;
const ARC_MIN = -479;
/* One pattern period (three columns) per loop — after it, column n hands its
   arc slot to column n+3, which carries the same pattern, so the reset is
   invisible. */
const LOOP_ARC = COLUMN_PITCH * 3;

/* ---------- the curved rail ---------- */

/* Plan-view geometry of one wall (x across the screen, z into it, arc length
   s from the rail's start). The heading phi eases from PHI_NEAR (~74deg —
   diving almost straight into the depth, the two walls entering parallel)
   to PHI_DEEP (~24deg — hooked inward, gliding across toward the vanishing
   point). PHI_SHAPE > 1 keeps the near rail unbent and concentrates the
   turn at the waist, so the bend reads as acceleration into the pinch —
   suction, not fisheye. The rail starts just off-screen at near-neutral
   depth (EDGE_OUT/EDGE_Z): the walls arrive as flat frontal-size corridor
   walls and only then get pulled in. Integrating the unit tangent gives an
   arc-length LUT; strips are flat chords sampled from it. Because depth
   grows along a curve instead of a line, every projected course — the
   silhouette rails and all eight row lines — is a CONCAVE curve sucked
   into the waist. */
const PHI_NEAR = 1.3;
const PHI_DEEP = 0.42;
const PHI_SHAPE = 1.35;
const EDGE_OUT = 60;
const EDGE_Z = 20;
const RAIL_STEP = 4;
const RAIL_START = -520;

type Rail = {
  /** Stage width the LUT was built for. */
  view: number;
  /** Arc length of the visible sweep — near screen edge to waist. */
  span: number;
  xs: Float64Array;
  zs: Float64Array;
};

/* The old --hg-wall-w clamp, retuned for the curved sweep. */
function railSpan(view: number): number {
  return view <= 1080
    ? Math.min(690, Math.max(520, view * 0.62))
    : Math.min(1180, Math.max(760, view * 0.72));
}

function buildRail(view: number): Rail {
  const span = railSpan(view);
  const count = Math.ceil((span + 420 - RAIL_START) / RAIL_STEP) + 1;
  const xs = new Float64Array(count);
  const zs = new Float64Array(count);
  const zero = Math.round(-RAIL_START / RAIL_STEP);
  const phi = (s: number): number => {
    const u = Math.min(Math.max(s / span, 0), 1);
    return PHI_NEAR + (PHI_DEEP - PHI_NEAR) * Math.pow(u, PHI_SHAPE);
  };
  xs[zero] = -view / 2 - EDGE_OUT;
  zs[zero] = EDGE_Z;
  /* Midpoint-sampled Euler both ways from the screen edge; beyond the ends
     phi is clamped, so the rail extends straight and off-screen strips stay
     finite. */
  for (let i = zero + 1; i < count; i++) {
    const s = RAIL_START + (i - 1) * RAIL_STEP;
    const a = phi(s + RAIL_STEP / 2);
    xs[i] = (xs[i - 1] ?? 0) + Math.cos(a) * RAIL_STEP;
    zs[i] = (zs[i - 1] ?? 0) - Math.sin(a) * RAIL_STEP;
  }
  for (let i = zero - 1; i >= 0; i--) {
    const s = RAIL_START + (i + 1) * RAIL_STEP;
    const a = phi(s - RAIL_STEP / 2);
    xs[i] = (xs[i + 1] ?? 0) - Math.cos(a) * RAIL_STEP;
    zs[i] = (zs[i + 1] ?? 0) + Math.sin(a) * RAIL_STEP;
  }
  return { view, span, xs, zs };
}

function railPoint(rail: Rail, s: number): { x: number; z: number } {
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

/* Depth grading, by strip mid-arc as a fraction of the sweep. These replace
   the flat wall's gradient mask (fade), inner dim gradient, and silhouette
   hairlines — now stepped per 100px strip, which the eye reads as smooth. */
function fadeAt(u: number): number {
  if (u <= 0.58) return 1;
  if (u <= 0.78) return 1 - ((u - 0.58) / 0.2) * 0.55;
  if (u <= 0.93) return 0.45 * (1 - (u - 0.78) / 0.15);
  return 0;
}

function dimAt(u: number): number {
  if (u <= 0.5) return 0;
  if (u <= 0.78) return ((u - 0.5) / 0.28) * 0.28;
  return Math.min(0.28 + ((u - 0.78) / 0.22) * 0.22, 0.5);
}

function railGlowAt(u: number): number {
  return 0.26 * (1 - Math.min(Math.max(u, 0), 1));
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

function Wall({ side }: { side: 'src' | 'out' }) {
  const patterns: Pair[][] = [];
  for (let i = 0; i < PAIRS.length; i += ROWS_PER_COLUMN) {
    patterns.push(PAIRS.slice(i, i + ROWS_PER_COLUMN));
  }

  /* The right wall runs its arc in reverse (out of the point), so its pattern
     sequence is reversed after the first ([c0, c2, c1]): at the mirror phase
     every occupied arc slot then carries the SAME pattern on both walls —
     English face left, translated face right, same row heights — and a pair
     that enters near-left exits near-right. */
  const order = side === 'out' ? [0, 2, 1] : [0, 1, 2];

  /* Each strip is a 100px window onto its column's 300px grid. On the right
     wall the strip's local x runs deep→near, so the windows are dealt from
     the far side of the content instead. */
  return (
    <div className={`hg-wall is-${side}`}>
      {Array.from({ length: PHYS_COLUMNS }, (_, col) => {
        const pattern = patterns[order[col % order.length] ?? 0];
        if (!pattern) return null;
        return Array.from({ length: STRIPS_PER_COLUMN }, (_, strip) => {
          const shift = side === 'src' ? -strip * STRIP_W : (strip + 1) * STRIP_W - COLUMN_W;
          return (
            <div className='hg-strip' data-col={col} data-strip={strip} key={`${col}-${strip}`}>
              <div className='hg-strip-in' style={{ transform: `translateX(${shift}px)` }}>
                <div className='hg-col'>
                  {pattern.map((pair) => (
                    <Card
                      face={side === 'src' ? 'en' : 'tr'}
                      key={`${pair.stamp}-${pair.en.text}`}
                      pair={pair}
                    />
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
        out: boolean;
        col: number;
        strip: number;
        shown: boolean;
      };

      const slots: StripSlot[] = gsap.utils.toArray<HTMLElement>('.hg-strip', stage).map((el) => ({
        el,
        out: el.closest('.hg-wall')?.classList.contains('is-out') ?? false,
        col: Number(el.dataset.col ?? '0'),
        strip: Number(el.dataset.strip ?? '0'),
        shown: true,
      }));

      let rail = buildRail(stage.clientWidth);

      /* d = conveyor arc offset; e = entrance progress (walls flow in along
         the rail from the screen edges while fading up). */
      const flow = { d: 0, e: 1 };

      /* Places every strip as a flat chord on the curved rail: sample the
         chord's endpoints, orient it with rotateY, and grade opacity, dim and
         silhouette hairline by depth. The left wall's arcs advance INTO the
         point, the right wall's retreat OUT of it (mirrored x and heading),
         and both walls share the same row geometry at every frame. */
      const place = () => {
        const half = rail.view / 2;
        const pull = (1 - flow.e) * 220;
        for (const slot of slots) {
          const colArc = slot.out
            ? wrapArc(-slot.col * COLUMN_PITCH - flow.d - pull)
            : wrapArc(slot.col * COLUMN_PITCH + flow.d - pull);
          const a0 = colArc + slot.strip * STRIP_W;
          const mid = Math.max((a0 + STRIP_W / 2) / rail.span, 0);
          const alpha = flow.e * fadeAt(mid);
          if (a0 + STRIP_W < -40 || mid > 0.94 || alpha < 0.012) {
            if (slot.shown) {
              slot.el.style.visibility = 'hidden';
              slot.shown = false;
            }
            continue;
          }
          const p0 = railPoint(rail, a0);
          const p1 = railPoint(rail, a0 + STRIP_W);
          const turn = Math.atan2(p0.z - p1.z, p1.x - p0.x);
          const sign = slot.out ? -1 : 1;
          const style = slot.el.style;
          slot.shown = true;
          style.visibility = 'visible';
          style.opacity = alpha.toFixed(3);
          style.setProperty('--hgd', dimAt(mid).toFixed(3));
          style.setProperty('--hgr', railGlowAt(mid).toFixed(3));
          style.transform = `translate3d(${(sign * (p0.x + half)).toFixed(2)}px, 0px, ${p0.z.toFixed(2)}px) rotateY(${(sign * turn).toFixed(5)}rad)`;
        }
      };

      const onResize = () => {
        rail = buildRail(stage.clientWidth);
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

      /* The waist stack rises once the walls are moving. */
      gsap.from('[data-hg-in]', {
        y: 16,
        autoAlpha: 0,
        duration: 0.72,
        stagger: 0.07,
        ease: 'power2.out',
        delay: 0.2,
      });

      /* The pipeline: one shared arc offset drives both walls, so the two
         conveyors stay phase-locked and the mirrored row structure never
         drifts. One pattern period per loop makes the reset invisible. */
      const drift = gsap.fromTo(
        flow,
        { d: 0 },
        { d: LOOP_ARC, duration: 110, ease: 'none', repeat: -1, onUpdate: place }
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
        English source strings on the left — search fields, toasts, buttons, review rows — stream toward the
        center and come out the right side translated and locale-stamped: French, German, Japanese, Korean,
        Spanish, Arabic, and a hundred more.
      </p>

      <div className='hg-glow' aria-hidden='true' />

      <div className='hg-stage' aria-hidden='true'>
        <Wall side='src' />
        <Wall side='out' />
      </div>

      {/* Mobile: the corridor folds into a vertical pipeline — source cards
          above the waist, their translations below it. */}
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
