/**
 * The globe figures' passage engine (Passage.tsx renders the markup). Every
 * stop's lines sit on shared rows in one box, so a change steps each row
 * from the language on screen to the next through the 8 by 8 screen, top
 * to bottom, on the Versions figure's timing: 150 ms a row, rows 55 ms
 * apart. The step runs on the passage's own clock, or on the caller's: a
 * globe that centres the words on its turn calls select(next, 'caller') and
 * then frame(t) from its own loop. Under reduced motion, or before the
 * masks have decoded, a change cuts.
 */
import { DITHER_LEVELS } from '@/app/d/blog-globe/_shared/ditherMask';
import {
  loadMasks,
  rowK,
  setMask,
  STAGGER_MS,
  STEP_MS,
  type Masks,
} from '@/app/d/blog-globe/_shared/versions-field';

/** Who drives a step: the passage itself, or the caller through frame(). */
export type PassageClock = 'own' | 'caller';

export type PassageControl = {
  /** The stop shown, or arriving. */
  readonly current: number;
  /** ms from a step's start until its last row has landed. */
  readonly duration: number;
  /** Steps to stop `next`. On 'own' the step starts now; on 'caller' the rows wait at their start until frame() moves them. */
  select(next: number, clock?: PassageClock): void;
  /** Draws a caller's step `t` ms after it starts (rows wait before 0); true once every row has landed, or when no caller's step runs. */
  frame(t: number): boolean;
  destroy(): void;
};

/** A step's length over `rows` rows: the last row starts (rows - 1) staggers in and takes one step. */
export const passageMs = (rows: number) =>
  Math.max(0, rows - 1) * STAGGER_MS + STEP_MS;

/** The stop each row shows when a step is cut short: the arriving one where the row is at least half through (`k` 0 to 1), else the one it was leaving. */
export function rowsOnScreen(
  from: readonly number[],
  to: number,
  k: readonly number[]
): number[] {
  return from.map((source, r) => ((k[r] ?? 0) >= 0.5 ? to : source));
}

type Step = {
  /** the stop each row steps from */
  from: number[];
  /** each row's progress at the last frame */
  k: number[];
  /** each row's mask level at the last frame, -1 before the first */
  levels: number[];
  own: boolean;
  raf: number;
};

/** Mounts the engine on a Passage's root (.gp) showing stop `initial`, and returns its control. */
export function mountPassage(root: HTMLElement, initial = 0): PassageControl {
  const panels = [...root.children].filter(
    (el): el is HTMLElement =>
      el instanceof HTMLElement && el.classList.contains('gp-panel')
  );
  const rows = panels.map((panel) => [...panel.children]);
  const count = Math.max(0, ...rows.map((list) => list.length));
  const duration = passageMs(count);

  let cur = Math.min(Math.max(0, initial), panels.length - 1);
  let masks: Masks | null = null;
  let step: Step | null = null;
  let gone = false;

  // the 130 masks decode once the passage is within a viewport of the screen
  const prepare = () => {
    void loadMasks()
      .then((loaded) => {
        if (!gone) masks = loaded;
      })
      .catch(() => undefined);
  };
  const near =
    typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(
          (entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            near?.disconnect();
            prepare();
          },
          { rootMargin: '100% 0px' }
        );

  const show = (i: number) => {
    panels.forEach((panel, j) => panel.toggleAttribute('data-shown', j === i));
  };

  const end = () => {
    if (!step) return;
    cancelAnimationFrame(step.raf);
    for (const list of rows) for (const row of list) setMask(row, null);
    for (const panel of panels) panel.removeAttribute('data-leaving');
    root.removeAttribute('data-mixing');
    step = null;
  };

  /* One frame t ms into the step. Each row shows its source giving way to
     the arriving stop; every other leaving stop keeps that row empty. */
  const draw = (t: number): boolean => {
    const run = step;
    if (!run || !masks) return true;
    const { out, in: into } = masks;
    let done = true;
    for (let r = 0; r < count; r++) {
      const source = run.from[r];
      const k = source === cur ? 1 : rowK(t, r);
      run.k[r] = k;
      if (k < 1) done = false;
      const level = Math.round(DITHER_LEVELS * k);
      if (level === run.levels[r]) continue;
      run.levels[r] = level;
      for (const [p, list] of rows.entries()) {
        if (p === cur) setMask(list[r], k >= 1 ? null : (into[level] ?? null));
        else if (p === source) setMask(list[r], out[level] ?? null);
        else if (run.from.includes(p))
          setMask(list[r], out[DITHER_LEVELS] ?? null);
      }
    }
    if (done) end();
    return done;
  };

  const reduced = () =>
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  const select = (next: number, clock: PassageClock = 'own') => {
    if (gone || next === cur || !panels[next]) return;
    const from = step
      ? rowsOnScreen(step.from, cur, step.k)
      : Array.from({ length: count }, () => cur);
    end();
    cur = next;
    show(next);
    if (!masks || reduced() || from.every((source) => source === next)) return;
    for (const source of new Set(from)) {
      if (source !== next) panels[source]?.setAttribute('data-leaving', '');
    }
    root.setAttribute('data-mixing', '');
    const run: Step = {
      from,
      k: from.map(() => 0),
      levels: from.map(() => -1),
      own: clock === 'own',
      raf: 0,
    };
    step = run;
    draw(0);
    if (!run.own) return;
    const start = performance.now();
    const tick = () => {
      if (step === run && !draw(performance.now() - start)) {
        run.raf = requestAnimationFrame(tick);
      }
    };
    run.raf = requestAnimationFrame(tick);
  };

  show(cur);
  root.setAttribute('data-live', '');
  if (near) near.observe(root);
  else prepare();

  return {
    get current() {
      return cur;
    },
    duration,
    select,
    frame: (t) => (step && !step.own ? draw(t) : true),
    destroy: () => {
      gone = true;
      near?.disconnect();
      end();
      root.removeAttribute('data-live');
    },
  };
}
