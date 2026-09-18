# Blog graphics pipeline

The toolchain under `graphics/` produced the thirty-six visuals of
"Designing docs for humans" and is the reference for every post that
follows. One HTML page per visual, real screenshots of the product cut
into padded crops, labels and leader lines drawn once, a glyphfield
export as the ground, rendered headlessly and downsampled.

## When to use

- A blog post, docs page or announcement needs illustrations of the real
  product: before/after crops, zone overlays, exploded components, hover
  or scroll interactions, type and spacing specimens, covers and OG images.
- The brief says "no text except labels", "use our backgrounds", "make it
  look like our site": those are this pipeline's defaults.

## The files

| path | what it is |
| --- | --- |
| `graphics/build/gen-lib.js` | primitives: `crop` (padded, clipped, page-bounds clamped), `hl` (highlight box with a label), `tag`, `dot`, `line`, `elbow`, `badge`, `panel`; the `SHOTS` and `BG` maps; the stage with the centering and zoom-to-fit script |
| `graphics/build/gen-visuals.js` | the visuals: one `add(id, area, name, bg, why, () => html, options)` each, plus `ASSIGN` (visual to background) and `BG_WASH` |
| `graphics/build/render.sh` | renders every visual (or the ids given) at 7680 wide with agent-browser and downsamples to 3840 |
| `graphics/build/export-blog.py` | writes `designing-docs-<id>.webp` (3840, q95) and the GIF clips into `public/static/blogs` or `--dest` |
| `graphics/build/composite-videos.sh` | composites a recording onto a visual's still, reading the crop rectangle from the rendered HTML |
| `graphics/build/capture-sidebar.sh` | the stop-motion capture of the docs sidebar (see the stop-motion skill) |
| `graphics/build/sheet.py` | contact sheets of `out/*.png` for review |
| `graphics/serve/server.js` | the static server the renderer loads pages from (`http://127.0.0.1:8765`) |
| `graphics/bg/` | a link to `public/graphics/bg/`: the glyphfield exports as lossless webp, `blue/` the duotone and light variants for covers; the site serves them and `/graphics` lists them |
| `graphics/shots/hi/` | the product captures at 3 to 5x (see the capture skill) |
| `graphics/fonts/` | Inter and Geist Mono variable fonts, the type of the docs |
| `graphics/rec/` | the recordings the clips composite from |

## Procedure

1. Start the static server from the repository root: `pnpm graphics:serve`
   (serves `graphics/` on port 8765). Install once: `pnpm install` at the
   root brings heroicons for the label icons; `pip install pillow` for the
   downsampler; `agent-browser` and `ffmpeg` on the PATH.
2. Capture the sources you need into `graphics/shots/hi/` as lossless
   webp and register them in `SHOTS` with their device pixel ratio. Follow
   the capture skill: the real page, the real theme toggles, the dev
   overlay hidden, the pointer parked off the page.
3. Measure the rectangles you will crop, in CSS px at 1440 by 900, and
   keep them in one object per page (`N` for the new docs, `O` for the
   old). Every crop, highlight and leader line derives from these.
4. Write each visual as one `add()`: crops at a scale that reads at blog
   size, no text under 26px once zoom-to-fit has run (label chips 28px,
   tags and badges 30px, numbered dots 56px), lines of 3px. Give each visual its own
   export in `ASSIGN`; never reuse a background twice in one post.
5. Generate, audit, render: `node graphics/build/gen-visuals.js` writes
   the HTML and `graphics/build/manifest.json`; `node
   graphics/build/audit.js [ids]` opens each one in the browser and fails
   on any text under the floor, listing overlapping boxes as warnings;
   `graphics/build/render.sh [ids]` shoots them. Review with `python3 graphics/build/sheet.py`, at
   thumbnail size, which is how the reader meets them.
6. Clips: record the interaction (stop-motion skill), then
   `graphics/build/composite-videos.sh` lays it over the still and writes
   the GIF (1600 wide, 256 colours, sierra dither) and an MP4 master.
7. Export: `python3 graphics/build/export-blog.py --covers` (add `--dest`
   for a landing checkout) writes the set, the dark and light header
   covers and both OG images. Bump the `?v=` stamp on every reference in
   the post so caches refresh.
8. Hand off: the post embeds the set with the Carousel and HitList MDX
   components (see the MDX components skill); every visual also appears
   on `/graphics` in this repository, which reads the manifest.
9. Serve at device width. Render every blog image with `next/image`,
   the column's `sizes` (`BLOG_COLUMN_SIZES`) and quality 95, against a
   dense `images.deviceSizes` ladder, so a 1x, 2x or 3x screen gets a
   variant within a few percent of its device-pixel width. A browser
   shrinking the 3840px master to a 700px column blurs it; a variant at
   the device width matches a Lanczos resize exactly. Cut clips at 1400px.

## Rules that came from review

- Resolution is rarely the blur. The article column is about 700 CSS px
  wide, so a 1600px stage shows at 0.44x: labels under 26px and crops
  under about 1.2x are unreadable. Scale the content, not the canvas.
- The floor applies to every text in every graphic, measured after
  zoom-to-fit: a composition wider than 90% of the frame is scaled down
  and takes its labels with it. When the audit flags a visual, narrow the
  composition (smaller crops, shorter labels, one label column) before
  enlarging the type, or the fit undoes the change.
- Draw the dither background at 2x the stage height, aspect kept, with
  square pixels: at 1x each dot lands on less than a device pixel and
  aliases into noise; smoothed, it goes soft; at 2x with
  `image-rendering: pixelated` every dot is a crisp 2px square and a
  non-16:9 stage (the social card) is never stretched.
- Dim article backgrounds (the `BG_WASH` of 0.64 leaves 36% of the export
  visible). Covers keep their full brightness.
- Pad every cutout 12px inside its frame and clip where a neighbour would
  bleed in (`clip` rectangles). Balance padding on both sides of a crop.
- No glass panels around diagrams, no titles or captions inside images,
  no sparkle icons on labels, only labels the reader needs.
- One idea per slide. A carousel is a set of different points, not the
  same point drawn five ways; rewrite a slide's content before restyling
  it.
- Red for what was removed, blue for the page and what replaced it. Lines
  start at one x and meet their targets at one offset; align them by
  construction, not by eye.
- Look at the render before shipping it: a contact sheet for the set, a
  1:1 crop for anything with lines or small type.
- Blur that survives a sharp master is a delivery problem. Check what the
  page actually serves (`currentSrc`, decoded width against
  `clientWidth × devicePixelRatio`) before touching the pipeline; the fix
  is a variant at the device width, not a bigger master.

## Related skills

`docs-source-capture`, `glyphfield-headless-export`,
`stop-motion-ui-capture`, `gt-blog-mdx-components`,
`gt-docs-visual-tokens`.
