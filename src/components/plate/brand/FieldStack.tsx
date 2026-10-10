'use client';

import { useCallback, useRef, useState, type RefObject } from 'react';

import { useMountEffect } from '@/components/plate/hooks/use-mount-effect';
import {
  createDitherLoop,
  globe,
  mixFields,
  prefersReducedMotion,
  type DitherLoopOptions,
  type FieldFn,
} from '@/components/plate/lib/dither';
import {
  loadPictureTone,
  pictureField,
  type PictureFrame,
  type PictureTone,
} from '@/components/plate/lib/picture-field';
import type { FieldController } from '@/components/plate/brand/fieldController';
import {
  MOOD_PICTURES,
  type PictureName,
} from '@/components/plate/brand/moodPictures';

export type FieldStackProps = {
  /** 0: the sign-in material, the halftone globe. 1: the onboarding material, one picture. */
  scene: 0 | 1;
  /**
   * Scene 1 only: the picture to show, read at mount. Later changes come
   * through the registered controller (FieldPicture).
   */
  picture?: PictureName;
  /**
   * Receives the scene 1 controller on mount and null on unmount; scene 0
   * never calls it. The controller stays registered while the field is
   * hidden under 768 px and holds the request for the next mount.
   */
  register: (c: FieldController | null) => void;
};

/** Ink fallback when --tc-ink is unresolved; the stack's light value, written as rgb because the practices ratchet counts hex literals in TypeScript. */
const INK = 'rgb(47 92 224)';
/** Picture ink fallback when --tc-picture-ink is unresolved; the stack's light value, as rgb for the same reason. */
const PICTURE_INK = 'rgb(7 7 7)';
/** The sign-in globe's cell in CSS px, the deck's. */
const GLOBE_SCALE = 2;
/**
 * The pictures' cell in CSS px. The tone grids are continuous tone, 1600
 * by 900 for the covers (scripts/media/mood-tone/mood-tone.mjs), so at one px
 * per cell a cover picture at 1440 wide reads one grid cell per loop cell
 * and the halftone is fine enough to read as a photograph. The loop draws
 * only on a step mix and its canvas covers only the region right of the
 * plate, so the grid stays inside the frame budget.
 */
const PICTURE_SCALE = 1;
/** The gamma the sign-in globe is drawn with. */
const GLOBE_GAMMA = 1.15;
/** Field time of the still frame under reduced motion. */
const REDUCED_MOTION_TIME = 8;
/** A step mix, the picture on screen into the next, on one smoothstep. */
const STEP_MS = 150;
const MOBILE_QUERY = '(max-width: 767px)';
/**
 * Delays before the second and the third attempt at a picture tone whose
 * load rejected, in ms. loadPictureTone drops a failed load from its
 * cache, so each attempt is a new request; after the third the picture
 * waits for the next mount.
 */
const TONE_RETRY_DELAYS_MS: readonly number[] = [1500, 4000];
/**
 * The frame a region placement fits inside, as insets from the stack's
 * edges in px: 96 past the plate's edge on the left so the subject clears
 * the plate, 24 on the other three sides.
 */
const REGION_INSET = { left: 96, right: 24, top: 24, bottom: 24 };
/**
 * A disc placement's diameter as a multiple of the stack's height. The
 * disc is centred on the stack's height with its left limb
 * DISC_LIMB_RAMP_SHARE of the way along the ramp, so the limb reads at
 * most of its density, the ramp still has the limb's cells to thin, and
 * the disc is whole from the ramp's end; it bleeds off the top, the right
 * and the bottom. The share is stated on the ramp, not the region: from
 * 1200 px the ramp is 0.42 of the region, so 5/7 of it is 0.3 of the
 * region, and below 1200 the ramp is a fixed 96 px, where a region share
 * would put the limb past the ramp's end with empty field before it. A
 * limb on the ramp's start put the whole left third of the disc under the
 * thinnest part of the ramp and left a wide viewport's region reading
 * empty.
 */
const DISC_DIAMETER_RATIO = 1.7;
const DISC_LIMB_RAMP_SHARE = 5 / 7;

/** Both scenes' loop material; the scale and the ink are set per scene. */
const LOOP_OPTIONS: DitherLoopOptions = {
  paper: 'transparent',
  gamma: 1,
  bias: 0,
  fps: 24,
  applyStyles: false,
};

/** The globe as the sign-in page draws it. */
function makeGlobe(): FieldFn {
  return globe({
    cx: 0.5,
    cy: 0.5,
    radius: 0.44,
    ambient: 0.14,
    rim: 0.16,
    graticule: 0,
    landmass: 0.42,
    spin: 0.14,
  });
}

function smoothstep(x: number): number {
  const k = x <= 0 ? 0 : x >= 1 ? 1 : x;
  return k * k * (3 - 2 * k);
}

function resolveInk(el: Element): string {
  return getComputedStyle(el).getPropertyValue('--tc-ink').trim() || INK;
}

function resolvePictureInk(el: Element): string {
  return (
    getComputedStyle(el).getPropertyValue('--tc-picture-ink').trim() ||
    PICTURE_INK
  );
}

/** Whether the viewport is under 768 px; false where matchMedia is missing. */
function matchesMobile(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia(MOBILE_QUERY).matches
  );
}

/** Prototemplate resolves the theme as data-theme on the root (the dashboard used a class); `onChange` runs on flips. */
function observeTheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme'],
  });
  return () => observer.disconnect();
}

/** The ramp's ends in stack px; the field's tone is 0 at `start` and whole from `end`. */
type Ramp = { start: number; end: number };
/** The loop canvas's placement in stack px; it spans the stack's full height. */
type CanvasSpan = { left: number; width: number };
type Layout = {
  width: number;
  height: number;
  ramp: Ramp;
  canvas: CanvasSpan;
};

/**
 * The stack's CSS size, the ramp inside it, and where the loop canvas
 * sits. On scene 1 the stack is pinned to the viewport (brand-tokens.css
 * .brand-field-viewport), so the size is the viewport's and a document
 * taller than it changes nothing here. The ramp is measured from a probe
 * element carrying its class, so it follows brand-tokens.css in every
 * viewport. The canvas covers the region right of the plate's edge
 * (.brand-field-region), and every placement is stated in the stack's
 * coordinates, so the loop shifts its cells by the canvas's offset when
 * it reads the field.
 */
function readLayout(stack: HTMLElement, canvas: HTMLCanvasElement): Layout {
  const rect = stack.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const rampProbe = document.createElement('div');
  rampProbe.className = 'brand-field-ramp';
  stack.append(rampProbe);
  const ramp = rampProbe.getBoundingClientRect();
  rampProbe.remove();
  return {
    width: rect.width,
    height: rect.height,
    ramp: {
      start: ramp.left - rect.left,
      end: ramp.left - rect.left + ramp.width,
    },
    canvas: {
      left: canvasRect.left - rect.left,
      width: canvasRect.width,
    },
  };
}

/**
 * The stack u of the loop canvas's u: the canvas starts `canvas.left` into
 * the stack and is `canvas.width` wide. A stack with no width (not laid
 * out) maps the canvas onto itself.
 */
function stackU(layout: Layout, u: number): number {
  if (!(layout.width > 0)) return u;
  return (layout.canvas.left + u * layout.canvas.width) / layout.width;
}

/**
 * `fn` read at the centre of the loop cell the stack point falls in. The
 * loop places its cell x at x / (cells - 1) of the canvas, the cell's
 * start at the left edge and its end at the right, so a point mapped
 * back through stackU drifts by up to one cell across the canvas and a
 * picture's grid cells would land whole on the loop's cells only on the
 * left. Snapping the read to the cell the loop is drawing keeps the
 * grid's cells whole everywhere. The canvas spans the stack's height, so
 * v needs no offset.
 */
function atCellCentres(fn: FieldFn, layout: Layout): FieldFn {
  const { canvas, width, height } = layout;
  if (!(width > 0) || !(height > 0) || !(canvas.width > 0)) return fn;
  const cols = Math.max(1, Math.ceil(canvas.width / PICTURE_SCALE));
  const rows = Math.max(1, Math.ceil(height / PICTURE_SCALE));
  /* On an odd canvas side the last cell is half a cell and its centre is
     the canvas edge, past a file that fits that axis exactly; the read
     stays inside the canvas so the edge cell prints the file's last cell. */
  const maxX = canvas.left + canvas.width - 0.5;
  const maxY = height - 0.5;
  return (u, v, t) => {
    const x = Math.round(
      ((u * width - canvas.left) / canvas.width) * (cols - 1)
    );
    const y = Math.round(v * (rows - 1));
    const cx = Math.min(cols - 1, Math.max(0, x));
    const cy = Math.min(rows - 1, Math.max(0, y));
    return fn(
      Math.min(maxX, canvas.left + (cx + 0.5) * PICTURE_SCALE) / width,
      Math.min(maxY, (cy + 0.5) * PICTURE_SCALE) / height,
      t
    );
  };
}

/**
 * `fn` with its tone multiplied by a horizontal ramp, 0 at `ramp.start`
 * and 1 from `ramp.end`, in stack px, eased with smoothstep so the cell
 * density thins across the whole span instead of collapsing in the last
 * stretch; a ramp of no length is a cut at its start. The dither then
 * drops cells across the ramp instead of the mask dimming them. The
 * scene 0 mask in brand-tokens.css carries the same curve as stops.
 */
function rampField(fn: FieldFn, ramp: Ramp, width: number): FieldFn {
  const length = ramp.end - ramp.start;
  return (u, v, t) => {
    const x = u * width;
    if (x <= ramp.start) return 0;
    if (x >= ramp.end) return fn(u, v, t);
    return fn(u, v, t) * smoothstep((x - ramp.start) / length);
  };
}

/** The frame a region placement fits inside, from REGION_INSET and the ramp's start. */
function regionFrame(layout: Layout): PictureFrame {
  const left = layout.ramp.start + REGION_INSET.left;
  return {
    left,
    top: REGION_INSET.top,
    width: layout.width - REGION_INSET.right - left,
    height: layout.height - REGION_INSET.top - REGION_INSET.bottom,
  };
}

/** A disc placement's centre and diameter in stack px, from DISC_DIAMETER_RATIO and DISC_LIMB_RAMP_SHARE of the ramp. */
function discFit(layout: Layout): {
  centre: { x: number; y: number };
  diameter: number;
} {
  const diameter = DISC_DIAMETER_RATIO * layout.height;
  const limb =
    layout.ramp.start +
    DISC_LIMB_RAMP_SHARE * (layout.ramp.end - layout.ramp.start);
  return {
    centre: { x: limb + diameter / 2, y: layout.height / 2 },
    diameter,
  };
}

function makeLoop(
  canvas: HTMLCanvasElement,
  field: FieldFn,
  extra: DitherLoopOptions
) {
  return createDitherLoop(canvas, field, { ...LOOP_OPTIONS, ...extra });
}

/** Scene 0: the globe loop on the square canvas, its ink following the theme. */
function mountScene0(
  stack: HTMLElement,
  globeCanvas: HTMLCanvasElement
): () => void {
  const loop = makeLoop(globeCanvas, makeGlobe(), {
    scale: GLOBE_SCALE,
    ink: resolveInk(stack),
    gamma: GLOBE_GAMMA,
    reducedMotionTime: REDUCED_MOTION_TIME,
  });
  const stopTheme = observeTheme(() =>
    loop.setOptions({ ink: resolveInk(stack) })
  );
  return () => {
    stopTheme();
    loop.destroy();
  };
}

type Scene1Args = {
  stack: HTMLElement;
  loopCanvas: HTMLCanvasElement;
  reduced: boolean;
  picture: PictureName | undefined;
  register: (c: FieldController | null) => void;
};

/**
 * Scene 1: one loop on the canvas right of the plate, held stopped and
 * drawn by this module's own rAF timeline, so at rest there is no rAF.
 * The target's first resolved tone is drawn once; every `setPicture`
 * after that runs the step mix. Sets `data-picture` when a picture's
 * field is set. The loop's ink is the picture ink.
 */
function mountScene1(args: Scene1Args): () => void {
  const { stack, loopCanvas, reduced, register } = args;
  const tones = new Map<PictureName, PictureTone>();
  let layout = readLayout(stack, loopCanvas);
  /* What the loop draws. */
  let current: FieldFn = () => 0;
  /* The name asked for, the name whose field is set, and whether any
     frame with content has been drawn. */
  let target: PictureName | null = args.picture ?? null;
  let shown: PictureName | null = null;
  let rendered = false;
  let destroyed = false;
  let mixRaf = 0;
  /* The running step mix. `fromName` is null when the mix started from
     another mix's frame, in which case `from` is that frame's closure and
     a resize keeps it as it is. */
  let mix: {
    fromName: PictureName | null;
    from: FieldFn;
    toName: PictureName;
    to: FieldFn;
    t0: number;
  } | null = null;

  /* The loop's one field: the canvas's cells read `current` at their place
     in the stack. Every swap goes through `show`, which keeps this wrapper
     in the loop; a field handed to the loop directly would be read in the
     canvas's own coordinates and land offset and squeezed. */
  const loopField: FieldFn = (u, v, t) => current(stackU(layout, u), v, t);
  const loop = makeLoop(loopCanvas, loopField, {
    scale: PICTURE_SCALE,
    ink: resolvePictureInk(stack),
    reducedMotionTime: REDUCED_MOTION_TIME,
    observeResize: false,
    pauseOffscreen: false,
  });
  loop.stop();
  /* Makes `field` what the loop draws, with one draw since the loop is stopped. */
  const show = (field: FieldFn): void => {
    current = field;
    loop.setField(loopField);
  };
  const stopTheme = observeTheme(() =>
    loop.setOptions({ ink: resolvePictureInk(stack) })
  );

  const buildPicture = (name: PictureName): FieldFn | null => {
    const tone = tones.get(name);
    if (!tone) return null;
    const { placement } = MOOD_PICTURES[name];
    const field = pictureField(tone, {
      placement:
        placement.kind === 'disc'
          ? { ...placement, ...discFit(layout) }
          : placement.kind === 'region'
            ? { ...placement, frame: regionFrame(layout) }
            : placement,
      canvasWidth: layout.width,
      canvasHeight: layout.height,
      cellSize: PICTURE_SCALE,
    });
    return rampField(atCellCentres(field, layout), layout.ramp, layout.width);
  };

  const cancelMix = (): void => {
    if (mixRaf) cancelAnimationFrame(mixRaf);
    mixRaf = 0;
    mix = null;
  };
  /* Makes `field` the picture on screen, with one draw. */
  const settle = (name: PictureName, field: FieldFn): void => {
    shown = name;
    rendered = true;
    show(field);
    stack.dataset.picture = name;
  };
  const stepMix = (ts: number): void => {
    if (destroyed || !mix) return;
    const k = smoothstep((ts - mix.t0) / STEP_MS);
    if (k >= 1) {
      const { toName, to } = mix;
      mixRaf = 0;
      mix = null;
      settle(toName, to);
      return;
    }
    current = mixFields(mix.from, mix.to, k);
    loop.render(0);
    mixRaf = requestAnimationFrame(stepMix);
  };
  const startMix = (name: PictureName, to: FieldFn): void => {
    /* `current` is a snapshot: each mix frame builds a fresh closure over
       its own k, so an interrupted mix starts from the frame on screen. */
    mix = {
      fromName: mix ? null : shown,
      from: current,
      toName: name,
      to,
      t0: performance.now(),
    };
    if (!mixRaf) mixRaf = requestAnimationFrame(stepMix);
  };
  const apply = (name: PictureName): void => {
    if (shown === name && !mixRaf) return;
    const to = buildPicture(name);
    if (!to) return;
    if (!rendered || reduced) {
      cancelMix();
      settle(name, to);
      return;
    }
    startMix(name, to);
  };
  const setPicture = (name: PictureName): void => {
    if (destroyed || name === target) return;
    target = name;
    if (!tones.has(name) && !fetched.has(name)) fetchTone(name, 0);
    apply(name);
  };

  /* Pending retry timers, cleared by the teardown. */
  const retryTimers = new Set<number>();
  /* Pictures asked for at least once, so a repeat ask starts no second load. */
  const fetched = new Set<PictureName>();
  /* Loads `name`'s tone and, when it is the target's, shows it through
     `apply`. A rejected load is tried again after each delay in
     TONE_RETRY_DELAYS_MS; a picture still failing after the last one is
     left to the next mount, and nothing is logged. */
  const fetchTone = (name: PictureName, attempt: number): void => {
    fetched.add(name);
    loadPictureTone(MOOD_PICTURES[name].src).then(
      (tone) => {
        if (destroyed) return;
        tones.set(name, tone);
        if (name === target && shown !== name) apply(name);
      },
      () => {
        const delay = TONE_RETRY_DELAYS_MS[attempt];
        if (destroyed || delay === undefined) return;
        const timer = window.setTimeout(() => {
          retryTimers.delete(timer);
          fetchTone(name, attempt + 1);
        }, delay);
        retryTimers.add(timer);
      }
    );
  };
  /* Only the picture asked for loads at mount; a step's leaf fetches its
     own on setPicture. Loading every grid decoded about 36 MB of tone on
     pages that show one picture. */
  if (target) fetchTone(target, 0);

  /* The stack is viewport-sized, so this fires on a viewport resize only.
     A running mix keeps its clock: both ends are rebuilt on the new
     layout and the next frame draws them at the current k. */
  const resize = new ResizeObserver(() => {
    if (destroyed) return;
    const next = readLayout(stack, loopCanvas);
    if (next.width === layout.width && next.height === layout.height) return;
    layout = next;
    if (mix) {
      const to = buildPicture(mix.toName);
      if (to) mix.to = to;
      if (mix.fromName) {
        const from = buildPicture(mix.fromName);
        if (from) mix.from = from;
      }
      return;
    }
    if (shown) {
      const field = buildPicture(shown);
      if (field) show(field);
    }
  });
  resize.observe(stack);

  register({ setPicture });

  return () => {
    destroyed = true;
    cancelMix();
    for (const timer of retryTimers) clearTimeout(timer);
    resize.disconnect();
    stopTheme();
    loop.destroy();
    register(null);
  };
}

type FieldSceneProps = Pick<FieldStackProps, 'scene'> & {
  /** Scene 1 only: the frame's most recent picture request, read at mount. */
  pictureRef: RefObject<PictureName | undefined>;
  /** Receives the scene 1 controller on mount and null on unmount. */
  register: (c: FieldController | null) => void;
};

/**
 * The canvas and its engine: one instance for each stretch the viewport
 * spends at 768 px or wider, mounted and unmounted by FieldStack, which
 * documents the scenes. The engine is created in the mount effect and
 * destroyed by its cleanup, so an unmount on a narrowing leaves none.
 */
function FieldScene({ scene, pictureRef, register }: FieldSceneProps) {
  const stackRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<HTMLCanvasElement>(null);

  useMountEffect(() => {
    const stack = stackRef.current;
    const loopCanvas = loopRef.current;
    if (!stack || !loopCanvas) return;
    /* A child's effects run before its parent's, so on a first mount under
       768 px this runs before FieldStack has read the query and unmounted
       the scene; no engine is created for that one commit. */
    if (matchesMobile()) return;
    if (scene === 0) return mountScene0(stack, loopCanvas);
    return mountScene1({
      stack,
      loopCanvas,
      reduced: prefersReducedMotion(),
      picture: pictureRef.current,
      register,
    });
  });

  return (
    <div
      className={
        scene === 1
          ? 'brand-field-host brand-field-viewport'
          : 'brand-field-host'
      }
      aria-hidden='true'
    >
      <div ref={stackRef} className='brand-field-stack' data-scene={scene}>
        {scene === 0 ? (
          <canvas
            ref={loopRef}
            className='brand-field-layer brand-field-globe'
            data-layer='field-globe'
          />
        ) : (
          <canvas
            ref={loopRef}
            className='brand-field-layer brand-field-region'
            data-layer='field-picture'
          />
        )}
      </div>
    </div>
  );
}

/**
 * The field behind every auth and onboarding surface. Scene 0 draws the
 * halftone globe, turning, on a canvas of the globe box at 2px cells in
 * the sign-in ink (--tc-ink). Scene 1 draws one picture at 1px cells on
 * one canvas that covers the region right of the plate's edge, in the
 * picture ink (--tc-picture-ink) at --field-picture-opacity, and when
 * the step's picture changes mixes the tone on the same grid over 150 ms
 * with smoothstep; a fresh document shows the step's picture at once.
 * Scene 0's host fills the frame's root; scene 1's host is pinned to the
 * viewport, so a step taller than it scrolls over a field that stays put.
 * brand-tokens.css owns the masks, the globe box, the ramp, the canvas
 * region, the inks and the opacity per theme; scene 1 reads the ramp and
 * the canvas offset through the DOM and drops picture cells across the
 * ramp in the field.
 *
 * The scene is mounted while the viewport is 768 px or wider. The
 * (max-width: 767px) query is followed for the life of the mount, so a
 * narrowing unmounts the scene and destroys its engine and a widening
 * mounts it again. The server render holds the scene, which the CSS hides
 * under 768 px until the query is read after hydration. The controller
 * handed to `register` outlives the scene and keeps the frame's most
 * recent picture request, so a scene mounted on a widening starts from
 * the step on screen.
 *
 * Reduced motion: scene 0 draws the globe's still frame; scene 1 sets
 * each picture with one draw and no mix.
 */
export default function FieldStack({
  scene,
  picture,
  register,
}: FieldStackProps) {
  /* False on the server and through hydration, so the markup is the
     server's and brand-tokens.css hides the stack under 768 px until the
     query is read. */
  const [mobile, setMobile] = useState(false);
  /* The frame's most recent request, kept while the scene is unmounted. */
  const targetRef = useRef<PictureName | undefined>(picture);
  /* The mounted scene's controller; null while the scene is unmounted. */
  const sceneRef = useRef<FieldController | null>(null);
  const registerScene = useCallback(
    (controller: FieldController | null): void => {
      sceneRef.current = controller;
    },
    []
  );

  useMountEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia(MOBILE_QUERY);
    const sync = (state: { matches: boolean }): void =>
      setMobile(state.matches);
    sync(query);
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  });

  useMountEffect(() => {
    if (scene !== 1) return;
    register({
      setPicture: (name) => {
        targetRef.current = name;
        sceneRef.current?.setPicture(name);
      },
    });
    return () => register(null);
  });

  if (mobile) return null;

  return (
    <FieldScene scene={scene} pictureRef={targetRef} register={registerScene} />
  );
}
