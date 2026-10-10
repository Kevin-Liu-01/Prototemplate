# Motion traps

The traps behind the short lists in `SKILL.md`, with the cause, the fix and
where each was found. Every one was confirmed by a render, a measurement or
a rejected round.

## SVG dashes and lines

1. **Chromium computes dash patterns in screen space under
   `vector-effect: non-scaling-stroke` and ignores `pathLength` there.**
   A normalized dash (`pathLength=100`, dasharray `25 100`) renders as a
   fleck 25 screen px long; the intended dash was a quarter of the path.
   - Progress rings and arcs: drop both attributes and author the dash in
     user units. In SVG a CSS px is a user unit, so
     `stroke-dasharray: calc(var(--dial) * <perimeter/100>px) <perimeter>px`
     works and can ride a GSAP-tweened number variable.
   - A single travelling dash (dasharray equal to the path length, animated
     offset) tiles into several dashes on any scaled SVG, because the
     screen-space period repeats along the path. Draw a short `<line>`
     segment and animate `transform: translateX(<user units>px)` in CSS;
     keep `non-scaling-stroke` for a constant weight.
   - Dashed pulses on a uniformly scaled SVG drop `non-scaling-stroke`:
     the gauge stays true without it, and with it a normalized `22 200`
     repeated about every 222 screen px and stranded accent fragments along
     the wires (`src/app/d/_v0/sections/Locadex.tsx`).
   - Found on the Locadex border ring and the enterprise launch rail
     (August 2026).
2. **Dashes clip at a closed subpath's end and never wrap the loop.** An
   offset that parks the dash's start mid-perimeter leaves everything past
   the path's start unpainted. Either make the arc's origin the path's own
   start (redraw the border as a `<path>` that begins there) or use the
   period-equals-perimeter pattern, `dasharray d (L - d)`.
3. **The park sign picks the end the draw starts from.** With
   `pathLength=100`, an offset tweened from +100 to 0 reveals from the
   path's authored start; from -100 to 0 it reveals from the end. Checked
   in headless Chromium on 2026-10-05 with `dasharray='100 200'`: offset 50
   inks the first half of the path and -50 the last half. The stack
   tower's rail taps are authored plate first and park at -101, so the bend
   grows out of the rail into the plate (`FullStack.tsx`, the story build);
   the capstone's write wires run chip to row and park at 101, so they draw
   out of the chip (`StackTower.tsx`). Kevin rejected a backwards draw three
   rounds running in August 2026 ("broken and glitchy... not drawing itself
   correctly"). When a draw-on looks backwards or pops, read the first
   point of `d` before touching the timing. The memory note
   svg-dash-gotchas states this sign the other way round; the code and the
   check are right.
4. **Pad the gap past the path.** At a bare `100` dash the pattern wraps at
   exactly 100 and Chromium's dash rounding bleeds a sub-pixel accent fleck
   at the path's end. `strokeDasharray='100 200'` with the offset parked at
   101 (or -101) keeps every dash edge clear of both ends, and offset 0 still
   covers the whole path (`src/app/d/_v0/sections/StackTower.tsx`, the rail
   taps and the capstone's write wires).
5. **Normalize `pathLength` to 1000** where dash motion is fine-grained:
   GSAP rounds offsets to integers (DESIGN.md section 9).
6. **Cache the source `d`.** A pulse that rewrites `d` per tick blanks the
   source; store it once in `el.dataset.traceD` and restore it before
   measuring, or a re-run of the effect traces an emptied path
   (`src/app/d/production/sections/Developer.tsx`, `tracePath`).
7. **The line auditor cannot see SVG strokes.** `scripts/lint/lines.mjs`
   reconstructs lines from computed CSS, so drawn figures are checked by eye
   at 2x crops of their junctions (DESIGN.md section 2).

## GSAP

- **It cannot be frozen from outside the page.** The ESM build does not
  expose `window.gsap`, and its ticker caches the original
  `requestAnimationFrame` when it wakes, so overriding
  `window.requestAnimationFrame` does nothing. For state-synced screenshots,
  poll a computed CSS-variable dial and aim each capture about 100 ms early
  so capture latency lands the frame inside the target window.
- **Clear what a tween set.** A standing `will-change` or a leftover 0 px
  transform makes a stacking context that paints over neighbouring 1 px
  seams. Set `willChange` only for the tween and `clearProps` on complete
  (gt-cloud `reveal.ts`); clear `strokeDashoffset`, `transform`, `opacity`
  and `visibility` in the cleanup of any band that wrote them
  (`FullStack.tsx`).
- **Rotating windows are fragile.** A `rotate()`-based clip window moves
  with GSAP's transform origin; `DitheredMark` uses pre-rotated 60 degree
  geometry swept by pure horizontal translate.
- **Measure flow geometry for scroll anchors.** A sticky element's own rect
  reads its stuck pose during a refresh mid-dwell. Measure the copy block
  in flow and re-measure in `onRefresh` (`FullStack.tsx`).
- **Film compositions have their own GSAP rules** (no CSS `transform`
  paired with a tween on one element, no clocks, one paused timeline).
  They are in `gt-films` section 4.

## Dither loops

- **The two engine copies differ.** gt-cloud's
  `packages/ui/src/lib/dither.ts` accumulates field time across pauses
  (`simBase`), so a loop that was offscreen resumes where it stopped, and
  its handle's `stop()` holds the loop so the observers cannot restart it.
  Prototemplate's `src/lib/dither.ts` restarts field time at 0 on every
  `start()` and has no hold: its IntersectionObserver and
  `visibilitychange` handler restart a stopped loop. Prototemplate's copy
  has the `phase` option and gt-cloud's does not.
- **A cloned canvas carries no bitmap.** The deck's ramp canvases are
  redrawn by `redrawDithers()` from the computed `--pt-paper` and `--pt-ink`
  tokens, sized from `clientWidth` and `clientHeight` (a clone inside a
  scaled thumbnail is laid out at full size and only transformed down), and
  redrawn on every `html[data-theme]` change.
- **A canvas never drawn keeps its 300 by 150 store**, which CSS stretches
  across the box. `createDitherLoop` paints one frame synchronously before
  any rAF for that reason.

## lottie-web 5.13 on canvas

Found moving the blog Lottie figure from SVG to canvas (gt-cloud PR #5068,
2026-10-01 and 2026-10-02).

- **A character missing from the glyph list stops the frame.**
  `FontManager.getCharData` returns a placeholder with empty `shapes`, and
  `CVTextElement.buildNewText` reads `shapes[0].it`, throws, and draws no
  layer after it. The SVG renderer skips the character. Triggers: `\r` used
  as a line break without a glyph entry, and the `\r` lottie-web writes
  where it wraps a box text, so a longer translation breaks where the
  source did not. Fix: give every character the text can draw, plus `\r`,
  `\u0003` and the capitals for `ca`, an entry
  `{ ch, style, fFamily, size: 0, w: 0 }` with no `data` (`fillGlyphs` in
  `lottieDocument.ts`). The error surfaces only as the animation's `error`
  event, never in the console.
- **Track-matte buffers are sized once.** `createContainerElements` makes
  two `OffscreenCanvas` buffers per matte layer at the canvas size and never
  resizes them, so after the canvas grows everything under the matte clips
  to the old size. A 0 by 0 canvas makes `drawImage` throw outside lottie's
  own try and catch. Fix: walk `anim.renderer.elements`, set each
  `buffers[]` width and height to the canvas, then `resize()` once more.
  Park a hidden player at `resize(1, 1)`. Proof: build at 700 px, widen to
  1440 px, diff against a 1440 px build under reduced motion.
- **Subframes redraw at display rate** (120 Hz in headless Chromium).
  `setSubframe(false)` floors the frame and the renderer skips repeats.
  `enterFrame` still fires every rAF, so guard per-frame work on a changed
  `currentFrame`.
- **Tailwind v4 preflight sets `[hidden] { display: none !important }`.** A
  layer that must keep its box while hidden, so lottie sizes the canvas
  right at build, takes a class with `visibility: hidden` (`.is-off`).
- **The seam's variable restyles the subtree.** `RevealSeam` writes
  `--seam-cut`, an inherited custom property, so each move restyles the
  whole box. The SVG build of Procure to pay held 27,800 nodes and dragged
  at 5 fps at 4x throttle. Keep the subtree small (a canvas) and leave the
  shared component alone.
- **Two players on one clock drift.** Starting one player from another's
  floored `currentFrame` leaves them up to a frame apart for good, and
  resyncing one from inside the other's `enterFrame` advances it twice in
  that tick. Start from `currentRawFrame`, and drive followers (a compared
  layer, the outgoing picture of a step) paused, with
  `goToAndStop(leader.currentRawFrame, true)` from the leader's frame
  callback.
- **A CSS mask image still loading counts as transparent** (CSS Masking),
  so a dither step through a level that was never used hides the masked
  layer until it decodes, and the step becomes a cut. Decode every level up
  front (`new Image()` with the data URL, then `decode()`), keep the images
  referenced, and wait for the decodes before the first dither-in.
- **The loop is a cut.** For artwork whose last frame differs from its
  first, use `loop: false`, listen for `complete`, copy the canvas
  (`drawImage`) into a still laid over the layer, restart at 0, and dither
  the still away. lottie-web draws `totalFrames - 1` before it fires
  `complete`, so the copy holds a full picture.
- **Reduced motion needs a poster frame.** Frame 0 of these animations is
  empty; the figure holds `posterFrame`, the middle of the longest stretch
  where its strings are on screen.
- **Canvas text cost is JavaScript**: glyph paths replayed per character
  per frame. Lowering canvas resolution barely helps.
- **Verify a renderer change with a pixel diff** of the SVG and canvas
  builds at fixed frames, both loaded into one page.

## First paint and page transitions

- **An in-render `redirect()` commits an intermediate shell.** Next commits
  the layout above a page whose render throws a redirect at the old URL
  first, then replaces it when the target arrives (about 280 ms on the docs
  folder roots). Point navigation at the resolved leaf; keep the in-render
  redirect as the crawler and stale-link backstop. A `next.config.ts`
  redirect is answered before the layout and does not flash (gt-cloud
  docs, 2026-09-02).
- **A mark drawn in a mount effect cannot precede first paint.** The docs
  sidebar draws its rails, pill and thumb in a mount effect, so the page
  showed no rail and no current-page tint until hydration and then popped
  them in. Showing fumadocs' own rail before then is no fix: fumadocs seats
  that rail inboard of the drawn path, so it jumps sideways at hydration
  and reads as two parallel lines. Gate only the mark whose geometry
  matches the drawn one: the row tint, on `#nd-sidebar[data-sb-ready]`,
  set at the end of the mount effect.
- **next-themes' `disableAnimation` sheet blocks first-paint transitions.**
  It is in the head when the first frame lands, so a `transition` alone
  never runs. The dashboard fades the field region and the plate rows in
  through keyframes (`brand-field-picture-in`, `.plate-row-in` in
  `apps/dashboard/src/app/brand-tokens.css`).
- **A client-mounted control reserves its height in the server markup.**
  The device page's OTP slots mounted at hydration and moved the button and
  the foot 30 px until the container took `min-h-12`
  (`DeviceCodeForm.tsx`).
- **A slot that waits for a third party reserves only what it shows.** The
  payment step's 27rem spinner box collapsed to one error row and moved the
  foot 340 px. The fix holds one 44 px row while loading or failed, and the
  tall container only around a mounted form.

## Verification

- **The in-app Browser pane pauses rendering.** It reports
  `document.hidden === true` and pauses `requestAnimationFrame`, so every
  shader and dither canvas comes back blank and ScrollTrigger reveals below
  the fold never fire. GSAP entrance tweens still complete through its
  timeout fallback, so a page looks loaded but fieldless. Measure with
  JavaScript there and take pixels with Playwright.
- **Slow the clock in the capture only.** To see a dither step's cells,
  slow `requestAnimationFrame` (12x) inside the capture script; the page
  code stays unchanged.
- **Capture full pages after a scroll-through pass**, so lazy engines and
  reveals have armed.
- **Seed the theme before load.** In Playwright,
  `context.addInitScript(() => localStorage.setItem('gt-theme', 'dark'))`
  before `goto`, then assert `document.documentElement.dataset.theme`.
  `gt-theme` is Prototemplate's key (`src/app/layout.tsx`); for another
  app, read its theme provider for the key.
- **Emulate reduced motion in the capture.** Call
  `page.emulateMedia({ reducedMotion: 'reduce' })` before `goto`, then
  check that the page shows its designed still and that no loop ticks.
- **Films:** `npx -y hyperframes@0.8.106 check .` must end with 0 errors;
  `hyperframes-animation`'s `scripts/animation-map.mjs` flags dead zones and
  stagger drift; a contact sheet at one frame per second catches holds and
  dead frames; the critic then reads the render frame by frame.
