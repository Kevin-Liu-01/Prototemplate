'use client';

import { useRef } from 'react';

import { useLayoutWork } from '@/lib/use-layout-work';
import { useMountEffect } from '@/lib/use-mount-effect';

import { GT_LOGO_ASCII as A } from './GtLogoAscii.frames';
import { subscribeLogoClock, whileVisible } from './logo-clock';

import './GtLogoAscii.css';

/**
 * The logo turned on its sphere and set in a monospace grid, 45 characters
 * by 21 lines, from - to @ by how much of each cell the lines cover and how
 * much light reaches them, with a dot screen in the ring's hole. Once a lap
 * it holds its still for a second, then the meridian and the latitude turn
 * once, passing behind the globe, and land on the still again. The frames
 * are written ahead of time by pnpm build:logo-ascii
 * (GtLogoAscii.frames.ts), so a frame is 21 rows of text.
 *
 * Every row is a line of HTML text in a monospace face, its letters spaced
 * to one cell of the grid (a cell's width less one character), so any
 * monospace face keeps the grid. The glyphs take the light as a gradient
 * clipped to the text, the dots a flat tone. HTML text and not SVG text:
 * WebKit lays out a changed SVG text row, gradient filled and stretched to
 * a length, in tens of milliseconds to seconds, and an HTML row in well
 * under one. The still is what a server render, a page without script and
 * reduced motion show, and the lap's first and last frame. It steps at 24
 * frames a second on the shared clock (logo-clock.ts), writes only the rows
 * that change and stops out of view. For a stage 225 px wide or more; below
 * that use the loader or the armillary loader.
 */
export type GtLogoAsciiProps = {
  /** the grid's width in CSS pixels, at least 225; the height is 420 / 450 of it */
  width?: number;
  /** 'ink' sets the glyphs in the text color, 'image' in the reference's blues on its own ground */
  palette?: 'ink' | 'image';
  /** the loader's text for assistive technology */
  label?: string;
  /** false lets the lap finish on the still, then calls onRest */
  loading?: boolean;
  /** called once the frame is the still after `loading` turns false */
  onRest?: () => void;
  /** draws the frame this many seconds into the lap and does not animate */
  at?: number;
  className?: string;
};

const TURN = A.turn.length + 1;
const LAP = A.hold + TURN / A.fps;
/** the longest a settle takes once `loading` turns false mid-turn, in seconds */
const SETTLE = 0.75;

/** The glyph rows of frame `i` (0 is the still, 1 to TURN - 1 the turn). */
function glyphRows(i: number): readonly string[] {
  const ids = i <= 0 || i >= TURN ? A.still : A.turn[i - 1];
  return ids.map((id) => A.table[id]);
}

/** The dot rows under the glyph rows: the screen less every cell a glyph takes. */
function dotRows(glyphs: readonly string[]): string[] {
  return A.dots.map((row, r) => {
    const g = glyphs[r];
    let out = '';
    for (let c = 0; c < row.length; c++) out += row[c] === '.' && g[c] === ' ' ? '.' : ' ';
    return out;
  });
}

/** The frame `t` seconds into a lap. */
function frameAt(t: number): number {
  const s = ((t % LAP) + LAP) % LAP;
  return s <= A.hold ? 0 : Math.min(TURN - 1, Math.floor((s - A.hold) * A.fps));
}

export default function GtLogoAscii({ width = 450, palette = 'ink', label = 'Loading', loading = true, onRest, at, className }: GtLogoAsciiProps) {
  const first = glyphRows(at === undefined ? 0 : frameAt(at));
  const firstDots = dotRows(first);

  const rootRef = useRef<HTMLSpanElement>(null);
  const glyphRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const live = useRef({ loading, onRest, rested: !loading, at: 0, last: -1, settle: 0, shown: first.slice() });

  useLayoutWork(
    () => {
      const state = live.current;
      state.onRest = onRest;
      if (state.loading && !loading && state.at > A.hold) state.settle = Math.max(1, (LAP - state.at) / SETTLE);
      state.loading = loading;
      if (loading) state.rested = false;
    },
    { dependencies: [loading, onRest] }
  );

  useMountEffect(() => {
    const root = rootRef.current;
    if (at !== undefined || !root) return;
    const draw = (i: number) => {
      const state = live.current;
      const rows = glyphRows(i);
      const dots = dotRows(rows);
      for (let r = 0; r < rows.length; r++) {
        if (rows[r] === state.shown[r]) continue;
        state.shown[r] = rows[r];
        const g = glyphRefs.current[r];
        const d = dotRefs.current[r];
        if (g) g.textContent = rows[r];
        if (d) d.textContent = dots[r];
      }
    };
    const tick = (now: number) => {
      const state = live.current;
      const dt = state.last < 0 ? 0 : Math.min(0.1, now - state.last);
      state.last = now;
      if (state.at > A.hold) {
        state.at += dt * (state.loading ? 1 : state.settle);
        if (state.at >= LAP) state.at = 0;
      } else if (state.loading) {
        state.at += dt;
      }
      draw(frameAt(state.at));
      if (!state.loading && state.at <= A.hold && !state.rested) {
        state.at = 0;
        state.rested = true;
        state.onRest?.();
      }
    };
    return whileVisible(root, () => {
      live.current.last = -1;
      const stop = subscribeLogoClock(tick);
      return () => {
        stop();
        live.current.at = 0;
        draw(0);
        const state = live.current;
        if (!state.loading && !state.rested) {
          state.rested = true;
          state.onRest?.();
        }
      };
    });
  });

  const root = className ? `gt-logo-ascii ${className}` : 'gt-logo-ascii';
  const layer = (rows: readonly string[], refs: typeof glyphRefs) =>
    rows.map((row, r) => (
      <span
        key={r}
        ref={(el) => {
          refs.current[r] = el;
        }}
      >
        {row}
      </span>
    ));
  return (
    <span ref={rootRef} className={root} data-palette={palette} role='status' aria-live='polite' style={{ width }}>
      <span className='gt-logo-ascii-grid' aria-hidden='true'>
        <span className='gt-logo-ascii-dots'>{layer(firstDots, dotRefs)}</span>
        <span className='gt-logo-ascii-glyphs'>{layer(first, glyphRefs)}</span>
      </span>
      <span className='gt-logo-ascii-label'>{label}</span>
    </span>
  );
}
