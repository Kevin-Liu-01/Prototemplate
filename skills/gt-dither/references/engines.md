# Engines: the CPU dither, the studio field and the picture sampler

Detail for section 2 of the gt-dither skill. Paths are relative to a
Prototemplate checkout unless they start with `$GT_CLOUD`.

## The CPU dither (`src/lib/dither.ts`)

The whole renderer is one comparison per cell:

```ts
const v = fn(x / (w - 1), y / (h - 1), t);         // any 0..1 field
const threshold = (BAYER_8[y % 8][x % 8] + 0.5) / 64;
pixels[i] = v > threshold ? ink : paper;            // one bit per cell
```

### `ditherToCanvas(canvas, fn, opts)`

| option | default | meaning |
| --- | --- | --- |
| `scale` | 3 | CSS px per cell; the buffer is `ceil(cssSize / scale)` |
| `ink`, `paper` | `#ffffff`, `#000000` | any CSS color; `paper: 'transparent'` composites over the page |
| `time` | 0 | seconds handed to the field |
| `invert` | false | swaps ink and paper without touching the field |
| `bias` | 0 | added to the field before the threshold |
| `gamma` | 1 | `v ** gamma` before the threshold; skipped at 1 |
| `phase` | `{ x: 0, y: 0 }` | the tile's offset in cells, reduced mod 8 |
| `cssWidth`, `cssHeight` | the layout box | explicit size, for a canvas that is not laid out |
| `applyStyles` | true | sets `image-rendering: pixelated` and the CSS box |

It returns `{ width, height, cells, litRatio }`. `litRatio` is the share of
lit cells and is the number to calibrate a field against.

- It writes every cell through one reused `ImageData` with a `Uint32Array`
  view and blits once. A per-cell `fillRect` on 144k cells costs tens of
  milliseconds against about 1 ms.
- Two canvases thread one tone through the same page cells only when their
  phases differ by their offset mod 8. A canvas whose top left cell sits
  `n` cells below another's needs `phase.y = n % 8`.
- Colors resolve once into a cache; anything outside hex and `rgb()` is
  rasterised through a 1x1 canvas.

### `createDitherLoop(canvas, fn, opts)`

Adds `speed` (1), `fps` (30), `reducedMotionTime` (0), `observeResize`
(true) and `pauseOffscreen` (true). The handle is `render`, `start`,
`stop`, `running`, `setField`, `setOptions` and `destroy`.

- It paints one frame synchronously before any `requestAnimationFrame`. A
  canvas that has not been drawn keeps its default 300 by 150 backing store,
  which CSS would stretch across the box for a frame.
- Under reduced motion it draws exactly one frame and never schedules a
  loop.
- It pauses when the canvas leaves the viewport (IntersectionObserver) and
  when the tab is hidden, and redraws a stopped canvas on resize.
- `setField` and `setOptions` redraw a stopped loop immediately. A
  transition sets the field and the ink together through them on one clock.

### Cost

Measured per frame at 144k cells (scale 3 on a 1440 by 900 box), field
evaluation only:

| field | ms |
| --- | --- |
| `gradientRamp` | 0.8 |
| `makeGlyphField` | 1.9 |
| `globe` | 4.8 (1.4 with `graticule` and `landmass` at 0) |
| `streakBands` | 5.3 |
| `radialBurst` | 15.1 |

- Cost is linear in cells, so scale is quadratic: scale 1 on 1440 by 900
  is 1.3 million field calls a frame. Never animate a full-bleed field at
  scale 1. The artifact pictures run at scale 1 because they are stills
  between short mixes.
- Animate `radialBurst` at scale 4 or above (about 8 ms) or render it once.
  Its dials are `layers` and `warpOctaves`; the globe's are `graticule` and
  `landmass`.

### Fields and combinators

- Factories take an all-optional options object: `radialBurst`, `globe`,
  `streakBands` and `gradientRamp`. `makeGlyphField` requires `text`.
- `makeGlyphField({ text, font, mode })` builds an exact signed distance
  field from a letterform (modes `fill`, `outline`, `glow`; `fit: 'contain'`
  with `aspect`). Call it after `document.fonts.ready`, or the metrics come
  from the fallback face.
- `multiplyFields` (mask), `maxFields` (union), `mixFields(a, b, amount)`
  (the transition blend) and `mapField` (a tone curve).
- `inkRamp` and `redrawDithers(root, { scale: 2 })` draw the deck's ramp
  into every `canvas.dither` from the root's `--pt-paper` and `--pt-ink`.
  They size from `clientWidth` and `clientHeight` because a clone inside a
  scaled thumbnail is laid out at full size and transformed down. Call it
  again on every `html[data-theme]` change.

## The studio field (`src/lib/studio-field.ts`)

### Parameters

| param | meaning |
| --- | --- |
| `colorA` | the ground ink, near-black so the composite drops it out |
| `colorB` | the body tone, the working blue |
| `colorC` | the crest tone the material peaks into |
| `strength` | tone push, warp depth or heat, per study |
| `detail` | noise scale |
| `frequency` | flow frequency or band count |
| `grain` | 0 to 100, the cell size inside each preset's range |
| `amplitude` | broad geometry: contour zoom, ring rate |
| `density` | reserved by the studio grammar, unused |
| `brightness` | output gain |
| `rotation` | frame rotation in degrees |

- Every preset is one skeleton: a tone field quantized to three inks
  through an ordered threshold,
  `floor(clamp(tone + 0.5 - threshold, 0, 1) * 2) / 2` (09 bayer-ink prints
  against 0.4 to keep its coverage sparse). The crest ink wins only where
  the matrix cell is low, so lit areas render as a woven checker of body
  and crest with no flat fill.
- The GPU 8x8 is three octaves of the 2x2:
  `bayer2(p / 4) / 16 + bayer2(p / 2) / 4 + bayer2(p)`, 64 thresholds.
- Cells are device pixels (`gl_FragCoord`), so `dpr` defaults to
  `min(devicePixelRatio, 2)`. A dpr of 1 upscaled softly mushes the cells.
- `STATIC_TIME` is 8.0, an instant where every study shows structure. The
  reduced-motion still and any pre-measure frame use it.
- Every preset grounds on near-black (`#04060a`) so it renders light on ink.
  A page composites the canvas with its own blend, mask and light-theme
  filter.

### The engine

- One offscreen WebGL canvas per session draws every subscriber and blits
  into each one's 2D canvas. One program per preset compiles lazily; a
  preset whose shader fails stays failed for the session and the others
  keep working.
- `preserveDrawingBuffer: true` lets the blit read the frame in the same
  task as the draw.
- A lost context sets the engine to null so the next draw rebuilds it.
- Each subscriber has an IntersectionObserver with a 120 px root margin and
  a ResizeObserver that redraws a stopped field. With nothing visible and
  running, the loop stops entirely.
- `destroy()` disconnects the observers and drops the subscriber. The
  shared context stays for the session; tearing it down per unmount is
  what exhausted the browser's context budget.

### Gotchas

- `StudioField.tsx` defaults to `preset: 'bayer'` (01). A product surface
  passes `'bayer8'` (02) explicitly, as `HeroField.tsx` and `FieldGround.tsx`
  do.
- The wrapper's effect reruns on `preset`, `dpr` and `speed`. `params` is
  read at mount; change it through a handle's `setParams` or a remount.
- Switch presets by remounting a keyed canvas and destroying the previous
  field (`HeroFieldSwitcher.tsx`), so exactly one engine is alive per stage.
- Shader narration lives in TypeScript comments outside the GLSL template
  strings. A comment inside a template string ships to every visitor.
- Color literals stay out of TypeScript under the practices lint: the
  presets hold `vec3` values with the hex in a comment.
- Without WebGL `createStudioField` returns null and draws nothing. The
  parent keeps its own ground and the page stays readable.

### The copies

| copy | file | note |
| --- | --- | --- |
| Prototemplate | `src/lib/studio-field.ts` | carries `BAYER_PRESETS` and `BAYER_DEFAULT_ID` |
| Prototemplate plate port | `src/components/plate/lib/studio-field.ts` | the dashboard's copy |
| landing | `$GT_CLOUD/apps/landing/src/lib/studio-field.ts` | the hero's engine |
| dashboard | `$GT_CLOUD/packages/ui/src/lib/studio-field.ts` | on `k/dashboard-shell-ia`, PR #4977 |

On 2026-10-05 the shader strings and preset values are identical in all
four. The landing's and `packages/ui`'s files are byte-identical, the plate
port's differs from them only in comments, and Prototemplate's `src/lib`
copy also exports the `BAYER_PRESETS` roster and is formatted wider.

## The picture sampler (`src/components/plate/lib/picture-field.ts`)

- A tone grid decodes once per URL (cached) into a `Float32Array` of 0..1
  from the red channel. Bytes at or under `TONE_FLOOR` (10) read as 0: a
  JPEG grid's black ground carries encoder ringing of a few values, and the
  tile's lowest threshold (1/128) would print it as stray cells.
- Placements are stated in the 1600 by 900 file space:
  - `cover` scales the file to cover the canvas and keeps `focusX`,
    `focusY` in view;
  - `disc` scales the file so the disc at `cx`, `cy`, `r` is `diameter`
    CSS px across with its centre on a canvas point;
  - `region` fits a file rectangle inside a frame at its aspect.
- With `cellSize`, a loop cell that covers one grid cell or less reads the
  nearest cell, and one that covers more reads the area average, so a
  grid scaled down re-screens at the loop's own cell without moire.
- `atCellCentres` in the plate's `FieldStack.tsx` snaps every read to the
  loop's cell centres, because the loop's `u = x / (cols - 1)` drifts by a
  cell across the canvas.
- `rampField` multiplies the tone by a smoothstep ramp from the plate's
  edge, so cells drop out across the ramp. Scene 1 (pictures) takes a hard
  CSS cut at the plate's edge; scene 0 (the globe) carries a mask whose
  stops sit on the same smoothstep (0.156 and 0.844 at the quarter points).
- The earth is a `disc`: `DISC_DIAMETER_RATIO` 1.7 of the stack's height,
  its left limb `DISC_LIMB_RAMP_SHARE` (5/7) of the way along the ramp.
  Anchor the disc to a share of the ramp. A limb on the ramp's start put
  its left third under the thinnest part of the ramp and left a wide
  viewport reading empty.

## The deck engine (`deck/parts/tail.html`)

- Each mood slide is `<canvas class="mood-img" data-tone="shots/tone/mood-{name}.jpg">`.
  The engine screens the grid live with `MOOD_CELL_PX` 1 and
  `MOOD_TONE_FLOOR` 10, thresholds from `bayer8` built out of `B4` and `Q`.
- It sizes each canvas's backing store to its box on screen with
  `getBoundingClientRect`, because the stage is CSS-scaled, so a cell is
  1 CSS px on the sheet, in a thumbnail, in the book view and on the
  full-stage backdrop.
- It reads the grid at cover fit, centred, and draws again on slide
  activation, resize and a theme flip. `--mood-ink` and `--mood-opacity`
  come from `deck/parts/head.html`.
- `pnpm build:deck` inlines the grids with their bytes untouched.

## The studio family

Moved from `SKILL.md` section 2 on 2026-10-10, unchanged.

- The studio family, all on an ink ground in the blue family
  (`#2f5ce0`, `#5f86f2`, `#9db9ff`, `#cfe0ff`), white only in 10:

  | id | name | preset | what moves |
  | --- | --- | --- | --- |
  | 01 | bayer-flow | `bayer` | the Glyphfield original: 4x4 over flow clouds at 2 to 10 device px cells |
  | 02 | bayer-8x8 | `bayer8` | the same flow through the 8x8 at 1 to 4 device px cells; the default and the hero's material |
  | 03 | bayer-contour | `bayerContour` | elevation bands drifting downslope |
  | 04 | bayer-radial | `bayerRadial` | two glows at the flanks, the centre column ink |
  | 05 | bayer-sweep | `bayerSweep` | long diagonal bands with a slow churn |
  | 06 | bayer-waves | `bayerWaves` | two interfering wave systems, the slowest clock |
  | 07 | bayer-chunk | `bayerChunk` | the 2x2 at 8 to 22 px poster cells |
  | 08 | bayer-pulse | `bayerPulse` | the flow breathing on a 16 s clock |
  | 09 | bayer-ink | `bayerInk` | sparse blue on ink, no bright chip |
  | 10 | bayer-hot | `bayerHot` | heat cores lifting crests to white through the 8x8 |

  `bayerSphere` sits outside the roster: a lit sphere through the 8x8, the
  landing's report card globe and Prototemplate's /try figure.

## One grid per transition

Moved from `SKILL.md` section 1 on 2026-10-10, unchanged.

- One grid per transition (`TRANSITION_RULES` in
  `src/app/craft/libraries.ts`):
  - both states are read at the same cells at one cell size, and the size
    never changes inside a transition;
  - the Bayer tile keeps its phase from one page cell (the `phase` option),
    so the first frame of a transition is the last frame of the state
    before it;
  - the tone mixes on one smoothstep and the ink interpolates on the same
    curve (`mixFields`);
  - an incoming picture's curve is solved so its disc's mean tone equals
    the outgoing field's;
  - reduced motion draws the end state once as a still.
  - Alpha fades, wipes, moving masks and content entrance animation are
    refused. A resolve takes 350 ms and a step from one picture to the
    next 150 ms (`RESOLVE_MS` and `STEP_MS` in
    `src/app/craft/TransitionDemo.tsx`, `STEP_MS` in the plate's
    `FieldStack.tsx`; Kevin, 2026-09-29: "make the dither transitions 2x
    faster").
