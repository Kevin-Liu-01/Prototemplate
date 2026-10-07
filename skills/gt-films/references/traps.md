# Composition and render traps

The traps the films met while building, each with its fix. Sound traps are in `sound.md`. Paths that start with `films/`, `kit/` or `out/` sit inside `$PROTOTEMPLATE/motion/`. Sources: the films' NOTES.md files (blog-fuma-nama rounds 5 to 8, jihe-yuanben, journey-to-the-west, modern-hebrew) and the memory note gt-motion-films.

## Type

- **A literal family name fetches Google Fonts.** Any `font-family: 'Inter'` (or another family) in a composition's CSS makes the compiler fetch that family and override the kit's face. Use `var(--font)`. The render log must not mention Google Fonts.
- **The compiler reads family names from `<style>` text only.** Set fallback families for glyph text (CJK, Arabic, Devanagari) from JavaScript, as Fuma's glyph moon does with `GLYPH_FAMILY`.
- **A canvas cannot take `font-feature-settings`.** Text painted on a canvas with plain Inter came out 12 px short on a line with two single-storey a's. Build a `FontFace` from the kit's own Inter file with `featureSettings` (cv11 for headings, tnum for figures) and load it at boot.
- **Seat each line of a heading.** Seating only the first line leaves the second wherever its first glyph's side bearing puts it (7 px left for "t" and "v" at 120 to 130 px). A negative margin on a line trips the layout audit's `container_overflow`; set the heading at the leftmost line's position and step the others in.
- **Layout reads at boot.** A clip's elements may not be laid out while the clip is outside its window. Take positions from Inter's metrics instead: the baseline sits 0.8638 em below a line-height-1 box's top, and the cap height is 0.7275 em.

## The lint and the audits

- **The call graph is a text scan.** `hyperframes check` follows calls from the timeline callback by scanning text, and it reads an expression-bodied arrow (`const g = (id) => ...`) as running to the next top-level comma. That once marked `draw` as reaching a `getComputedStyle` in `build()` (`gsap_callback_dom_measurement`). Write helpers as function declarations or block-bodied arrows.
- **Full-bleed canvas art** carries `data-layout-allow-overflow`. **Texture text** (a glyph moon of 492 nodes) carries `data-layout-ignore`, the CLI's opt-out, or the layout audit counts overlapping glyph boxes as errors and the contrast audit flags the dark glyphs.
- Kept warnings are named in NOTES.md with their reason (`composition_file_too_large` and `timeline_track_too_dense` for a monolithic film).

## Determinism

- **GPU canvases are not deterministic under load.** Whether Chrome puts a large 2D canvas on the GPU depends on its memory budget at that moment, and a GPU canvas paints a scan slightly differently. Create every 2D canvas with `willReadFrequently: true`, which keeps it in software (jihe-yuanben's `JY.CPU`).
- **Moving 3D layers re-raster images at worker-dependent scales.** Inside a moving 3D layer, Chrome re-rasters an `<img>` or SVG at a scale that depends on what the worker rendered before. Paint scans, marks and paper into canvas textures in the timeline's `onUpdate` (jihe-yuanben's camera).
- **Large type can differ between GPU render processes.** With the hardware GPU (Metal), Chrome rasterised modern-hebrew's 200 and 220 px card words a little differently in each render process. That film renders with `--no-browser-gpu` (SwiftShader), and its scans draw on software canvases. The blog films keep the GPU path for their gem smoke (see Posters below).
- **Prove it with lossless renders.** Two `--crf 0` renders with different worker counts, compared by `framemd5`. Compare builds rendered back to back in one sitting: jihe-yuanben's round 3 build, rendered once in round 3 and again in round 4, differed on 867 frames.

## Gem smoke

- **Size synchronously.** The mount's ResizeObserver reports after the first seek; `kit/gemsmoke.js` sets the box and calls `handleResize` itself.
- **Per-frame uniforms** go through `mount.setUniformValues`, which caches by value, so a shape texture uploads only when it changes. `gem.set()` loads its image asynchronously.
- **Outer glow tints the ground.** Any outer glow lays a faint smoke wash over the whole frame, which shows in every black cell of a dithered field. Keep it at 0 where a field is up.
- **Clip glass beside hard cells.** The shader's soft rim lit 20 px past the moon's disc. Clip the mount's host to a circle 1 px outside the limb.
- **Every layer above a background must be clear.** Gem mounts draw an opaque ground (their `colorBack` has alpha 1) and a print canvas fills with black unless told otherwise. Put a dithered field above the mounts with transparent black cells, and keep prints transparent outside their objects.
- **Choose the smoke's phase with a probe.** The swirl repeats every 2 pi shader seconds. Score the smoke over each heading's zone across the whole period at low resolution and pick the phase; re-search when a shape, a scale or a beat length changes.
- **Measure shapes on screen.** Fuma's moon disc was measured (render with `colorInner` white and both glows 0, take the lit bounds), and the treatment's numbers were 6 px off. A match cut between two gem shapes needs the same scale and offsets and square 1024 px shape PNGs.
- **Contact-sheet tiles misread phases.** At 240 px a lit moon with a dark half reads as a crescent. Compare full-resolution crops.

## Dither fields

- **Distances on a cell grid run centre to centre.** A cell's nearest pixel can sit 3 px nearer than its centre, so a 40 px clearance on screen needs 44 px between centres.
- **Lower the tone in a clearance ramp; never scale it.** Scaling and subtracting together compressed the taper to about 20 px and drew a hard edge on the zone; lowering alone keeps the taper as long as the ramp, so the cleared edge follows the smoke's own contour.
- **A soft knee at the bottom of the tone** (nothing under 0.014, a smoothstep to 0.07) keeps thin wisps from leaving lone cells in the margins.
- **Start a drift after a shape is complete.** Re-sampling a glyph moon's ink from a moving clock while its rows were still landing moved its light away from the print it replaced.

## Probing a composition in a browser

- A plain Playwright page has no HyperFrames runtime, so every clip shows at once. Set each `.clip`'s visibility from its `data-start` and `data-duration` before seeking, and create `window.__timelines` in an init script.
- `page.evaluate(() => tl.seek(t))` returns the timeline and hangs while serialising it. Return a number, and make `waitForFunction` return a boolean.

## Renders and frames

- **Select frames by index.** `ffmpeg -i film.mp4 -ss t -frames:v 1` returned a near-black frame on these renders. Use `select='eq(n,N)'` (`../scripts/frames.mjs`).
- **A loaded machine.** Several lanes render on one machine; at load 140 to 220 probes and checks took minutes. Keep `--workers 3` and record the load in NOTES.md.
- **Posters on the GPU path.** A `--no-browser-gpu` snapshot moved the smoke by up to 5 levels against the render, so blog film posters are snapshotted on the hardware GPU path.
- From `hyperframes-core`: duplicate ids across the assembled page render blank, and a background on the composition root can drop out of the producer's compositing, so a full-frame fill goes on a full-bleed child.
