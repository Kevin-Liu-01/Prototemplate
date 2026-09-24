# The graphics pipeline

How the illustrations for the General Translation blog are made, from the
brief to the carousel, with the toolchain that lives in `graphics/`. It
produced the thirty-six visuals of "Designing docs for humans" and is the
procedure every post after it runs. The skills under `.agents/skills`
carry the same rules into agent sessions; this document is the long form.

## What a visual is

One HTML page, 1600 by 900, rendered headlessly at 7680 wide and
downsampled to 3840. The page holds real screenshots of the product cut
into padded crops, labels and leader lines drawn once, and a glyphfield
export as the ground. Nothing in it is invented: every rectangle is a
measured region of a captured page, every label names something the reader
can find in the product.

The rules the set settled on, each learned from a review:

- No text except labels. No titles, captions or descriptions inside an
  image; the post carries the prose.
- One idea per slide. A carousel is a set of different points; a slide
  that restates its neighbour gets new content, not a new style.
- Real crops, not mockups. The one illustrative mock in the set is
  labelled as a mock.
- Red for what was removed, blue for the page and what replaced it.
- No glass panels, no sparkle icons, no over-rounded boxes: the graphics
  obey the same hit list the post publishes.

## Sizing

The article column is about 700 CSS px wide, so a 1600px stage is shown at
0.44x. Everything is sized for that, not for a full-screen viewer:

| element | size on the stage |
| --- | --- |
| any text | 26px or more after zoom-to-fit; `audit.js` fails the run below that |
| label chip | 28px Inter 600, 46px tall; tags and badges 30px, 54px and 50px tall |
| numbered dot | 56px disc, 28px numeral |
| panel header | 32px, icon 34px |
| measurement label | 28px Geist Mono on a dark backing pill |
| lines and rulers | 3px; ruler caps 18 by 3px |
| crops | 1.2x or larger; a sparse composition is zoomed to fill 90% of the frame |
| background | drawn at 2x the stage height with its own aspect and square pixels (`image-rendering: pixelated`), so a 1920 export shows as crisp 2px dots and a card is never stretched; dimmed to 36% under article visuals, full strength under covers |
| export | 3840 wide webp, quality 95; covers 3840 webp in a dark and a light version; OG 2400 by 1260 PNG; clips as 1400 wide GIFs |
| delivery | served through next/image at the column's device width (a dense `deviceSizes` ladder plus an accurate `sizes`), quality 95 |

Resolution was never the blur. At 1x the dither's one-pixel dots landed on
less than a device pixel and aliased into noise; at 2x with smooth scaling
they read as a halftone. Small labels were the other half of it.

The floor is measured after zoom-to-fit, not as declared. A composition
wider than 90% of the frame is scaled down, and its 28px labels with it, so
when the audit reports text under the floor the usual fix is to make the
composition narrower (smaller crops, shorter labels, one label column)
rather than to enlarge the type. `MIN_TEXT` in `gen-lib.js` holds the floor.

## The files

| path | what it is |
| --- | --- |
| `graphics/build/gen-lib.js` | the primitives and the asset maps: `SHOTS` (captures with their device pixel ratio), `BG` (backgrounds), `crop`, `hl`, `tag`, `dot`, `line`, `elbow`, `badge`, `panel`, and `stage`, which wraps a visual with the fonts, the ground and the centering script |
| `graphics/build/gen-visuals.js` | the visuals, one `add()` each, the page rectangles (`N` new docs, `O` old docs), `ASSIGN` (which export each visual sits on) and `BG_WASH` |
| `graphics/build/render.sh` | shoots every visual, or the ids given, through agent-browser at 7680 and downsamples with Pillow |
| `graphics/build/export-blog.py` | writes the webp set and the GIF clips into `public/static/blogs` or `--dest` |
| `graphics/build/composite-videos.sh` | lays a recording over a still, reading the crop rectangle from the rendered page |
| `graphics/build/capture-sidebar.sh` | the stop-motion capture of the docs sidebar |
| `graphics/build/rewriting-covers.py` | both theme covers of the earlier post: keeps the published cover's ground and framing (`graphics/shots/rewriting-cover-ground.png`) and lays the light and dark captures into its page frame at one scale, so a theme switch moves nothing |
| `graphics/build/sheet.py` | contact sheets for review |
| `graphics/build/manifest.json` | the generated index of visuals: id, area, name, background, why, size, animated; `/graphics` reads it |
| `graphics/serve/server.js` | the static server on 127.0.0.1:8765; also accepts POSTs into `inbox/` for the DOM-capture trick |
| `graphics/glyph/` | the glyphfield studio scripts and Kevin's project source |
| `public/graphics/bg/` | the glyphfield exports, lossless webp identical to the PNG originals: `user/` the palette, `blue/` the blue duotone and light variants; `graphics/bg` links here so the toolchain and the site read one set |
| `graphics/shots/hi/` | the product captures at 3 to 5x, lossless webp |
| `graphics/fonts/` | Inter and Geist Mono variable |
| `graphics/rec/` | the recordings the two clips composite from |

Generated folders (`graphics/build/visuals/`, `graphics/out/`,
`graphics/rec/stopmo*/`) are ignored by git; everything in them comes
back from the scripts.

## Procedure

1. Install once: `pnpm install` at the root (heroicons for the label
   icons), `pip install pillow`, and `agent-browser` and `ffmpeg` on the
   PATH.
2. Serve: `pnpm graphics:serve` keeps `graphics/` on port 8765.
3. Capture sources into `graphics/shots/hi/` (see "Capturing") and
   register them in `SHOTS` with their density.
4. Measure the rectangles you will cut, in CSS px at 1440 by 900, into
   the page objects in `gen-visuals.js`.
5. Write each visual as one `add(id, area, name, bg, why, () => html)`.
   Assign it its own export in `ASSIGN`.
6. `pnpm graphics:gen` writes the HTML and the manifest;
   `pnpm graphics:audit [ids]` measures every text against the floor and
   lists overlapping boxes (fix the failures, judge the warnings);
   `pnpm graphics:render [ids]` shoots them; `python3
   graphics/build/sheet.py [ids]` tiles them for review.
7. For a clip, record (see "Clips"), then `graphics/build/composite-videos.sh`.
8. `pnpm graphics:export` writes the webp set and GIFs into
   `public/static/blogs`; `--dest` points at a landing checkout. Bump the
   `?v=` stamp on every reference in the post.
9. Check the set on `/graphics` and the post on `/blog`.
10. Let the page serve each image at the width it is shown. The masters
    are 3840px wide and the column is about 700 CSS px, so a browser left
    to shrink them itself blurs them (measured: about an eighth of the
    edge contrast on a 2x screen, none for a variant at the device width).
    Every blog image goes through `next/image` with the column's `sizes`
    and the dense `images.deviceSizes` ladder in `next.config.ts`, at
    quality 95; clips are cut at 1400px, the column's 2x width.

## Capturing

Sources come from a landing dev server built from `main`, captured with
agent-browser at a device pixel ratio of 4 or 5 at 1440 by 900, the
Next.js dev portal hidden, the pointer parked on plain text. Themes come
from `agent-browser set media light|dark`; the docs follow the preference
when no theme is stored. Menus open with their real control. The old docs
lived on an SSO-protected Vercel preview; those were captured by
serializing the DOM from a signed-in Chrome to the local server and
screenshotting the saved page. Convert captures to lossless webp; the
library reads webp sizes.

## Backgrounds

The exports are Kevin's glyphfield project, rendered headlessly through
`window.glyphfield.studio` (`graphics/glyph/gfexport.sh`). The generator
draws one export per visual at exactly 2x the stage and dims it under
article visuals; covers keep the full export. Blue duotone variants carry
the covers. Every cover has a light-theme twin (`light: true` on
`coverExploded` and `coverWiremap`): the same ground and scale, the docs
captured in their light theme, the wireframe plate in paper and ink. The
post lists the light cover under `imagesLight` and the blog shows the one
for the reader's theme.

## Clips

The recorder keeps one or two frames per second at 4x, so interactions
are captured as stop-motion: pause the Web Animations, step `currentTime`
between screenshots, assemble with ffmpeg at variable frame durations.
Screenshots re-fire trusted pointer events on the last clicked element, so
the capture blocks real pointer events in the region and drives hovers
synthetically. The composite reads the crop rectangle from the rendered
visual, overlays the clip, and writes a 30fps MP4 master and the GIF the
post embeds: 1600 wide, 256 colours, sierra dither, rectangle diffing.

## Handing off to a post

The post embeds the set with the `Carousel` and `HitList` MDX components
of the landing blog (children with string attributes; the blog's MDX
renderer strips expression props). Covers ship as 3840 webp and the OG
image as a 2400 by 1260 PNG; the landing app serves webp covers at
quality 90. Posts live in the `generaltranslation/content` submodule, so a
change is two pull requests: content first, then gt-cloud pointing at the
content merge commit. The content repository's preview app needs a simple
version of every component or its build fails. This repository keeps the
authoritative copy of the three docs-redesign posts under `content/blog`
and their graphics under `public/static/blogs`, read by `/blog` and
`/graphics`.

## Where it went wrong, and the fix

- A captured Lucide glyph is a `<rect>` plus a path (copy, sidebar). The
  inliner used to strip `width`/`height` from every element, so the rect
  collapsed and only a corner path drew. It now resizes the root tag only.
- With the static server down, `render.sh` shot Chrome's error page and the
  export shipped it. The render now skips a page that never centres.

| symptom | cause | fix |
| --- | --- | --- |
| "pixelated" cover | 1x dither aliasing, plus the optimizer re-encoding at quality 75 | 2x smooth background; webp cover at quality 90 |
| "blurry" diagrams | 12px labels at 0.44x | labels 26px, lines 3px, zoom-to-fit |
| lines clipped | 1px rules and 1.5px caps under a device pixel | 3px everywhere, labels on backing pills |
| hover pill jumped after every click in the clip | screenshots re-fired trusted pointer events | block real pointer events; synthetic hovers |
| carousel prop `items` undefined | next-mdx-remote strips expression props | child elements with string attributes |
| content preview build failed | unknown component | stub every component in `apps/content` |
| PR policy failed | `feat` title without a Linear issue | `docs(blog)` title, or link the issue |
