# WebGL and canvas lifecycles

- Chrome keeps about 16 live WebGL contexts. Past that, `getContext`
  returns null and fields draw black with no error. On 2026-07-29 a
  direction's shader rendered on a fresh load and was black after 12
  client-side switches between directions.
- **A shared engine holds one context per engine module per session.** The
  fix for 2026-07-29 put every field on one module-level engine.
  `src/lib/studio-field.ts`, `src/lib/prismatic-field.ts` and
  `src/lib/horizon-field.ts` each draw into one offscreen GL canvas, blit
  into every subscriber's 2D canvas from one rAF loop, and keep the context
  when a subscriber's `destroy()` runs, so it survives route switches.
  gt-dither section 2 and `references/engines.md` hold the mechanism and
  the rebuild after a lost context.
- **A shared engine's canvas only grows.** Setting a canvas's width or
  height reallocates its drawing buffer, so an engine that resizes its one
  GL canvas to each subscriber reallocates it twice a frame once two fields
  of different sizes are on screen. On 2026-10-08 the presenter's intro (a
  full-bleed field and two 125px logo fields) kept the main thread busy
  about 1,000 ms of every second for that alone. `src/lib/prismatic-field.ts`
  grows its canvas to the largest field, draws each field into the
  bottom-left corner (GL's origin) and blits that rectangle:
  `drawImage(source, 0, source.height - height, width, height, 0, 0, width, height)`.
- **A canvas read back with `getImageData` stays off the blit path.**
  `willReadFrequently` pins a canvas to CPU memory, so every `drawImage`
  from it uploads to the GPU. That upload was the glyph rain's mobile lag,
  worst on WebKit. The glyph field snapshots each finished atlas into an
  `ImageBitmap` and blits from the snapshot (`atlasSrc` in
  `src/lib/glyph-field.ts`).
- **A component that owns a context releases all of it on unmount**:
  delete the buffer, the program and both shaders, then call
  `gl.getExtension('WEBGL_lose_context')?.loseContext()`. gt-cloud's
  `apps/landing/src/components/landing/shell/V0FooterMark.tsx` does this
  after a pull request review caught the footer mark leaking one context
  per mount (2026-08-08). The same file adds its GSAP ticker callback only
  while the mark is on screen. A registered callback that returns early
  still keeps GSAP's global rAF loop awake site-wide.
- **An effect removes every DOM node it creates.** gt-cloud's
  `useMountEffect` (`packages/ui/src/hooks/use-mount-effect.ts`) is a
  mount-only `useEffect`, so React strict mode runs setup, cleanup and setup
  again in dev. Prototemplate's `src/lib/use-mount-effect.ts` defers cleanup
  by one task so the simulated rerun cancels it. The headline engine's
  cleanup removes the dust canvas and the two guides it appended
  (`EverySentence.tsx`, and gt-cloud's `HomeHero.tsx`). Probing on
  2026-08-07 found the dev double effect leaving a dead duplicate canvas
  and guide pair in the DOM, and the cleanup landed the same day. Check in
  dev that exactly one canvas and one of each created node exist after
  mount and after a hot reload.
- **Count contexts without creating them.** A probe that calls
  `getContext` on the page's canvases creates contexts and exhausts the
  budget it measures (2026-07-29). Screenshot after real navigation, or wrap
  `getContext` before page scripts run, as frame-probe does (its `gl`
  column).
- **Every engine follows the lifecycle contract**: mount lazily behind an
  IntersectionObserver, pause offscreen and on a hidden tab, draw one still
  under reduced motion, re-read ink on a theme flip and release everything
  in `destroy()` (DESIGN.md section 11, gt-motion section 6).
- **A gallery shows stills and goes live only under the mouse.** Twenty-two
  live iframes running shaders made the presenter wall lag (2026-07-31).
  Prototemplate's root layout (`src/app/layout.tsx`) installs a rAF gate in
  every page: a parent posts `{ type: 'gt:freeze', frozen }`, callbacks
  queue while frozen, and the queue flushes on resume so loops continue
  where they stopped. Freezing is not enough for a wall: a frozen
  same-origin frame still hydrates, composites and runs its CSS animations
  on the parent's main thread. On 2026-10-08 the presenter's verdict
  gallery, which froze each frame 2.8 s after load, still held 12 live
  pages, 4 WebGL contexts and about 1.3 GB of renderer memory, and the page
  stayed busy about 950 ms of every second at rest.
  `src/app/present/viewer/LazyFrame.tsx` now shows the direction's 640x360
  thumbnail and mounts the live page only while a mouse is over the card.
  Gallery tiles show static captures
  (`public/shots/<theme>/<slug>.jpg`), and
  `src/app/directions/DirectionFrame.tsx` keeps the capture behind its one
  live frame until the frame loads. The presenter's prototype stage
  (`src/app/present/viewer/PrototypeViewer.tsx`) loads with the page so it
  is ready on arrival, and is frozen whenever no part of its section is on
  screen; live, it cost about 110 ms of every second through the slides
  before it (2026-10-08). The gate wraps `requestAnimationFrame`
  only, so a new scene animates on rAF; a loop on `setInterval` or
  `setTimeout` keeps running inside a frozen preview.
- **An engine used on several pages lives in one shared library and
  survives resize and zoom for every usage.** Kevin, 2026-08-13, on the glyph
  rains: they must be "resilient to screen resizing and zooming", for "all
  usages of the component", from a shared library like the dither globe's.
  gt-cloud's engines live in `packages/ui/src/lib/` (`glyph-field.ts`,
  `dither.ts`, `picture-field.ts`) and the apps mount them (for example
  `apps/landing/src/components/landing/shared/GlyphRain.tsx`). Browser zoom
  changes `devicePixelRatio` without resizing the box, so a ResizeObserver
  alone leaves the blits soft. gt-cloud's glyph field coalesces
  ResizeObserver callbacks into one rAF, watches
  `matchMedia('(resolution: <dpr>dppx)')` and re-arms it on every change,
  keeps `resize()` idempotent for when both fire, and remaps in-flight
  positions by the box ratio.
