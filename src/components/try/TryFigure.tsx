'use client';

import { useId, useRef, useState } from 'react';

import { createStudioField } from '@/lib/studio-field';
import { useMountEffect } from '@/lib/use-mount-effect';

import CategoryMark from './CategoryMarks';

import type { CSSProperties } from 'react';
import type { StudioVec3 } from '@/lib/studio-field';
import type { Grade } from '@/lib/try/grade';

/* The hero figure: a hairline browser window whose centerpiece is the
   website glyph — a dithered globe drawn as two clean layers: the studio
   engine's lit-sphere material (bayerSphere) clipped to a disc by a CSS
   mask, and a hairline SVG globe drawing seated over it, so the texture
   describes the form and the drawing keeps the edges crisp. The sphere
   is inked per theme (a dark print on the light paper, a lit crest on
   the ink ground). On submit the glyph morphs into the graded site's favicon,
   seated snug in a rounded container (the one rounded element the page
   allows). The six category marks orbit the window as satellite chips;
   every chip is a button that jumps to its category's report row. While
   the run is live the chips take a staggered accent fill in sequence
   (designed pacing — the server sends no per-category progress), and as
   each chip completes, the figure diagrams the validation: a dotted
   connector draws from that chip to the seat, and that chip's segment
   of the seat's outline — the rounded rect split into six open paths —
   draws in, so the checks visibly assemble the border around the
   favicon. When the report lands the figure settles before the page
   reveals it: chips the loop already colored lock straight to a tint of
   their real grade colour (their connector and segment stand at once),
   and the rest run a fast completion sweep so all six chips, connectors
   and segments visibly complete first. On done the assembled border
   re-inks in the overall grade's colour and each connector settles to
   its chip's grade tint. */

export type TryFigureState = 'idle' | 'loading' | 'settling' | 'done' | 'error';

const LEFT_SATS = ['hreflang', 'lang', 'routing'] as const;
const RIGHT_SATS = ['metadata', 'content', 'charset'] as const;
/* The six satellites in fill-sequence order (left flank then right). */
const SAT_IDS = [...LEFT_SATS, ...RIGHT_SATS] as const;

/* The favicon seat's box in px — .try-fig-seat mirrors it in try.css. */
const SEAT = 96;
/* The seat's corner radius (border-radius 20 in try.css; the drawn
   outline runs at 19.5, inset 0.5 for the crisp 1px stroke). */
const SEAT_R = 20;
/* Every connector stops this many px short of the seat's drawn border,
   so the dots never touch the assembling outline segments. */
const CONN_GAP = 7;

/* The sphere's two prints (hex in comments — the practices linter keeps
   color literals out of TS). The shader shades tone 0 (shadow) with
   colorA and tone 1 (lit) with colorC, so each theme dissolves ONE end
   into its own ground: light theme prints ink that thins to paper at the
   lit crest; dark theme prints light that sinks to ink at the shadow. */
type SphereInks = {
  colorA: StudioVec3;
  colorB: StudioVec3;
  colorC: StudioVec3;
};

const SPHERE_LIGHT: SphereInks = {
  colorA: [0.043, 0.055, 0.09], // #0b0e17 — the shadow ink on paper
  colorB: [0.184, 0.361, 0.878], // #2f5ce0 — the house accent body
  colorC: [0.973, 0.98, 1.0], // #f8faff — melts into the light card
};

const SPHERE_DARK: SphereInks = {
  colorA: [0.016, 0.024, 0.04], // #04060a — falls into the ink ground
  colorB: [0.184, 0.361, 0.878], // #2f5ce0 — the house accent body
  colorC: [0.812, 0.878, 1.0], // #cfe0ff — the lit crest
};

/* The seat outline: six open segments (each a straight run or a half-top
   or half-bottom plus its corner) that together tile the 96px rounded
   rect — drawn separately so the assembling border can dash-draw one
   whole open segment per validated chip, never a dash around a closed
   path. Radius 20 (~21% of 96), inset 0.5 for the crisp 1px stroke.
   Order matches SAT_IDS spatially: left chips take the left half
   (top-left arc, left edge, bottom-left arc), right chips the right. */
const SEAT_SEGS = [
  'M48 .5H20A19.5 19.5 0 0 0 .5 20',
  'M.5 20v56',
  'M.5 76A19.5 19.5 0 0 0 20 95.5h28',
  'M48 .5h28A19.5 19.5 0 0 1 95.5 20',
  'M95.5 20v56',
  'M95.5 76A19.5 19.5 0 0 1 76 95.5H48',
] as const;

/* The connectors' measured geometry: the figure's box and one polyline
   per satellite, chip inner edge to seat edge, in figure-local px. */
type ConnGeom = {
  w: number;
  h: number;
  lines: string[];
};

/* One satellite's shared choreography hooks: its slot in the six-step
   fill sequence, its sweep slot while settling, whether the settle gate
   already locked it, and its category's grade colour once known. The
   chip, its connector and its border segment all ride the same vars so
   nothing can reveal half-drawn. */
function satVars(
  seq: number,
  grades: Partial<Record<string, Grade>> | null,
  settleFrom: number | null
): { locked: boolean; style: CSSProperties } {
  const satId = SAT_IDS[seq];
  const grade = satId ? grades?.[satId] : undefined;
  const locked = settleFrom !== null && seq < settleFrom;
  const style = {
    '--try-sat-i': seq,
    ...(settleFrom !== null && !locked
      ? { '--try-settle-i': seq - settleFrom }
      : {}),
    ...(grade
      ? { '--try-chip-grade': `var(--try-grade-${grade.toLowerCase()})` }
      : {}),
  } as CSSProperties;
  return { locked, style };
}

/* Scroll a satellite's category row into view and hand it focus. The
   rows exist from first paint (the skeleton draws all six), so the
   jump works in every figure state. */
function jumpToRow(id: string) {
  const row = document.getElementById(`try-cat-${id}`);
  if (!row) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  row.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
  row.focus({ preventScroll: true });
}

function Satellites({
  ids,
  side,
  base,
  grades,
  settleFrom,
}: {
  ids: readonly string[];
  side: 'l' | 'r';
  /** This flank's first position in the six-chip fill sequence. */
  base: number;
  grades: Partial<Record<string, Grade>> | null;
  /** While settling, how many chips the loop already colored (0-6). */
  settleFrom: number | null;
}) {
  /* The chips' jump labels, mirroring the report roster's names. */
  const names: Record<string, string> = {
    hreflang: 'hreflang tags',
    lang: 'Language declaration',
    routing: 'Locale routing',
    metadata: 'Translated metadata',
    content: 'Content language',
    charset: 'Charset and direction',
  };
  return (
    <div className={`try-fig-sats try-fig-sats-${side}`}>
      {ids.map((id, i) => {
        const { locked, style } = satVars(base + i, grades, settleFrom);
        return (
          <span
            key={id}
            className={`try-fig-sat${locked ? ' is-locked' : ''}`}
            style={style}
          >
            <button
              type='button'
              className='try-fig-chip'
              aria-label={`Jump to ${names[id] ?? id}`}
              onClick={() => jumpToRow(id)}
            >
              <span className='try-fig-chip-fill' />
              <CategoryMark id={id} className='try-fig-chip-mark' />
            </button>
            <i className='try-fig-tie' />
          </span>
        );
      })}
    </div>
  );
}

export default function TryFigure({
  state,
  host,
  gradeVar,
  grades,
  settleFrom,
}: {
  state: TryFigureState;
  host: string | null;
  /** The overall grade's colour var once the report lands, e.g. 'var(--try-grade-a)'. */
  gradeVar: string | null;
  /** Per-category grades once the report lands, keyed by category id. */
  grades: Partial<Record<string, Grade>> | null;
  /** While settling, how many chips the loop already colored (0-6). */
  settleFrom: number | null;
}) {
  const uid = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const figRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  /* The host whose favicon actually loaded — the seat only ever shows a
     real image, so a missing or broken favicon leaves the glyph seated. */
  const [favHost, setFavHost] = useState<string | null>(null);
  /* The connector overlay's measured routes (null until first measure). */
  const [conn, setConn] = useState<ConnGeom | null>(null);

  /* Mount the sphere material and keep its inks on the live theme: the
     shell stamps data-theme on the root pre-paint and on every toggle,
     so one attribute observer re-inks the field without a re-render. */
  useMountEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const field = createStudioField(canvas, { preset: 'bayerSphere' });
    if (!field) return;
    const root = document.documentElement;
    const applyInks = () => {
      const dark = root.getAttribute('data-theme') === 'dark';
      field.setParams(dark ? SPHERE_DARK : SPHERE_LIGHT);
    };
    applyInks();
    const themeWatch = new MutationObserver(applyInks);
    themeWatch.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => {
      themeWatch.disconnect();
      field.destroy();
    };
  });

  /* Measure the connector routes: one polyline per chip, from the chip's
     inner edge to the seat. The middle chips (their centers sit on the
     seat's center, see .try-fig-sats) connect as single straight
     horizontals into the seat's edge midpoints; the top and bottom
     chips run horizontal, then ONE 45° diagonal aimed along the seat's
     own diagonal into the corner region — mirror-symmetric on both
     axes, every line stopping CONN_GAP short of the drawn border. The
     seat's place is computed from the body's box (its own rect scales
     during the morph), and a ResizeObserver on the figure and the
     window keeps the routes true across the clamps. */
  useMountEffect(() => {
    const fig = figRef.current;
    if (!fig) return;
    const measure = () => {
      const body = bodyRef.current;
      if (!body) return;
      const chips = fig.querySelectorAll('.try-fig-chip');
      if (chips.length !== SAT_IDS.length) return;
      const fr = fig.getBoundingClientRect();
      if (fr.width === 0 || fr.height === 0) return;
      const br = body.getBoundingClientRect();
      const cx = br.left + br.width / 2 - fr.left;
      const cy = br.top + br.height / 2 - fr.top;
      const r = (v: number) => Math.round(v * 2) / 2;
      const lines = [...chips].map((chip, k) => {
        const cr = chip.getBoundingClientRect();
        const left = k < LEFT_SATS.length;
        const row = k % LEFT_SATS.length; /* 0 top, 1 middle, 2 bottom */
        /* start: 4px off the chip's inner edge, at its vertical center */
        const sx = r((left ? cr.right + 4 : cr.left - 4) - fr.left);
        if (row === 1) {
          /* middle: one straight horizontal into the seat's edge
             midpoint, stopping CONN_GAP short of the drawn border */
          const tx = r(cx + (left ? -1 : 1) * (SEAT / 2 + CONN_GAP));
          const y = r(cy);
          return `M${sx} ${y}L${tx} ${y}`;
        }
        /* top/bottom: the terminal sits on the seat's own 45° diagonal,
           CONN_GAP past the corner arc (arc centers inset SEAT_R from
           the corners), so all four diagonals share one angle and one
           standoff; per-axis offset from the seat's center: */
        const o = SEAT / 2 - SEAT_R + (SEAT_R + CONN_GAP) / Math.SQRT2;
        const sy = r(cr.top + cr.height / 2 - fr.top);
        const tx = r(cx + (left ? -1 : 1) * o);
        const ty = r(cy + (row === 0 ? -1 : 1) * o);
        /* the elbow backs off the terminal by the diagonal's rise, so
           the bend is exactly 45° in path coordinates */
        const run = Math.abs(ty - sy);
        const ex = left ? tx - run : tx + run;
        return `M${sx} ${sy}L${ex} ${sy}L${tx} ${ty}`;
      });
      setConn({
        w: Math.round(fr.width),
        h: Math.round(fr.height),
        lines,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(fig);
    const win = fig.querySelector('.try-fig-win');
    if (win) ro.observe(win);
    return () => ro.disconnect();
  });

  const seated =
    favHost !== null &&
    favHost === host &&
    (state === 'loading' || state === 'settling' || state === 'done');

  return (
    <div
      ref={figRef}
      className={`try-fig${seated ? ' is-seated' : ''}`}
      data-state={state}
      style={
        gradeVar
          ? ({ '--try-fig-grade': gradeVar } as CSSProperties)
          : undefined
      }
    >
      <Satellites
        ids={LEFT_SATS}
        side='l'
        base={0}
        grades={grades}
        settleFrom={settleFrom}
      />
      <div className='try-fig-win' aria-hidden='true'>
        <div className='try-fig-bar'>
          <span className='try-fig-dots'>
            <i />
            <i />
            <i />
          </span>
          <span className='try-fig-addr' />
        </div>
        <div className='try-fig-body' ref={bodyRef}>
          <div className='try-fig-glyph'>
            <canvas className='try-fig-canvas' ref={canvasRef} />
            {/* the drawing layer: a hairline globe over the shaded field —
                non-scaling strokes so the lines stay 1px at every clamp
                (safe here: no pathLength dashes ride these paths). The
                parallels' runs end on the rim circle (r 47, chords at
                y 26/74), so every line dies into the drawing, not the
                mask edge. */}
            <svg
              className='try-fig-glyphline'
              viewBox='0 0 100 100'
              fill='none'
              strokeWidth={1}
            >
              <circle
                cx='50'
                cy='50'
                r='47'
                vectorEffect='non-scaling-stroke'
              />
              <ellipse
                cx='50'
                cy='50'
                rx='20'
                ry='47'
                vectorEffect='non-scaling-stroke'
              />
              <path d='M50 3v94' vectorEffect='non-scaling-stroke' />
              <path d='M3 50h94' vectorEffect='non-scaling-stroke' />
              <path d='M9.6 26h80.8' vectorEffect='non-scaling-stroke' />
              <path d='M9.6 74h80.8' vectorEffect='non-scaling-stroke' />
            </svg>
          </div>
          <div className='try-fig-seatzone'>
            <span className='try-fig-seat'>
              {host !== null && (
                <img
                  key={host}
                  className='try-fig-favicon'
                  src={`https://${host}/favicon.ico`}
                  alt=''
                  width={SEAT}
                  height={SEAT}
                  draggable={false}
                  referrerPolicy='no-referrer'
                  onLoad={() => setFavHost(host)}
                  onError={() => {
                    setFavHost((prev) => (prev === host ? null : prev));
                  }}
                />
              )}
              {/* the assembling border: a faint base rim under six open
                  segments that draw in, one per validated chip, and
                  re-ink to the overall grade's colour on done */}
              <svg
                className='try-fig-seatline'
                viewBox={`0 0 ${SEAT} ${SEAT}`}
                fill='none'
                strokeWidth={1}
              >
                <rect
                  className='try-fig-seatbase'
                  x='0.5'
                  y='0.5'
                  width={SEAT - 1}
                  height={SEAT - 1}
                  rx='19.5'
                />
                {SEAT_SEGS.map((d, k) => {
                  const { locked, style } = satVars(k, grades, settleFrom);
                  return (
                    <path
                      key={d}
                      className={`try-fig-seatseg${locked ? ' is-locked' : ''}`}
                      d={d}
                      pathLength={1}
                      style={style}
                    />
                  );
                })}
              </svg>
            </span>
          </div>
        </div>
      </div>
      <Satellites
        ids={RIGHT_SATS}
        side='r'
        base={3}
        grades={grades}
        settleFrom={settleFrom}
      />
      {/* the dotted connectors: mermaid-voice hairlines from each chip to
          the seat. Each dotted polyline is revealed by a solid dash-draw
          twin inside its own mask, so the draw runs chip-to-seat while
          the visible stroke keeps its dot pattern (a dash offset on the
          dot pattern itself would march the dots, not draw them). */}
      {conn !== null && (
        <svg
          className='try-fig-conn'
          viewBox={`0 0 ${conn.w} ${conn.h}`}
          fill='none'
          aria-hidden='true'
        >
          {conn.lines.map((d, k) => {
            const { locked, style } = satVars(k, grades, settleFrom);
            const maskId = `${uid}c${k}`;
            return (
              <g key={SAT_IDS[k]}>
                <mask
                  id={maskId}
                  maskUnits='userSpaceOnUse'
                  x={0}
                  y={0}
                  width={conn.w}
                  height={conn.h}
                >
                  <path
                    className={`try-conn-reveal${locked ? ' is-locked' : ''}`}
                    d={d}
                    pathLength={1}
                    style={style}
                  />
                </mask>
                <path
                  className='try-conn-dots'
                  d={d}
                  mask={`url(#${maskId})`}
                  style={style}
                />
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
