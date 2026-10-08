---
name: gt-graphics
description: >-
  How General Translation's blog and brand graphics are made with
  Prototemplate's graphics/ toolchain: product captures at 3 to 5x, labelled
  crops over glyphfield exports, the 26px text floor for the blog column,
  the audit and the render, contact sheets, stop-motion clips, webp
  and GIF export, the hand-off to a post, the GT docs measured for drawing,
  still artwork such as the partnership globes, and the review standard for
  each. Use when illustrating a blog post, a launch or a feature with real
  product crops, when drawing the GT docs, or when making any still GT
  artwork.
metadata:
  title: Blog and brand graphics
  areas: graphics
  updated: 2026-10-06
  origin: prototemplate
---

# Blog and brand graphics
General Translation's blog illustrations are HTML pages built in Prototemplate's `graphics/` toolchain: real crops of the product, labels and leader lines drawn once, and a glyphfield export as the ground, rendered headlessly and exported for the blog's article column. The toolchain made the set for "Designing docs for humans" in September 2026 (thirty-three article visuals plus eight covers and social cards), and every later post runs the same procedure. Prototemplate (github.com/Kevin-Liu-01/Prototemplate) is Kevin's design and documentation repository for General Translation (GT), and gt-cloud is GT's monorepo, whose `apps/landing` serves generaltranslation.com and its blog. Paths are relative to a Prototemplate checkout (`$PROTOTEMPLATE`) unless they name `$GT_CLOUD`.

## What a visual is

A visual is one HTML page with a 1600 by 900 stage. Covers and social cards may set their own stage, such as 1200 by 630 for OpenGraph. `graphics/build/render.sh` shoots each page at 7680 wide and Pillow halves it to 3840.

The page holds four kinds of content:

- padded crops of captured pages (`crop()`), each cut from a measured rectangle of a registered capture;
- highlight boxes, label chips, tags, badges and numbered dots (`hl()`, `tag()`, `badge()`, `dot()`);
- leader lines and elbows at 3px (`line()`, `elbow()`);
- a glyphfield export as the ground, set by `stage()`.

Every label names something the reader can find in the product. Nothing in a visual is invented.

The review of the September 2026 set settled these rules (`docs/GRAPHICS.md`, What a visual is):

- Labels are the only text. Titles, captions and descriptions belong to the post. `gen-lib.js` still exports `title()` and `caption()`, and the current set calls neither.
- Each slide makes one point. A carousel is a set of different points. When two slides make the same point, rewrite the content of one of them, because a restyle leaves the repetition in place.
- Every crop comes from a capture. The set's one illustrative mock (F2, "Spot the anti-patterns") is described as a mock.
- Red (`#f0524f`) marks what was removed. Blue (`#0078FF`, with `#60a5fa` for lines and thumbs) marks the page and what replaced it. Before and after sit at the same scale.
- The graphics obey the hit list the post publishes: no glass panels around diagrams, no sparkle icons, no over-rounded boxes, no eyebrow text, no gradient or glow decoration.
- Label icons are Heroicons solid, read from the root `node_modules/heroicons` (24 solid first, then 20 solid).
- Lines start at one x and meet their targets at one offset. Align them by construction from the page rectangles, since alignment by eye drifts when a crop moves.

## Sizing for the blog column

The article column is about 700 CSS px wide on desktop: 720px on Prototemplate's `/blog` (`BLOG_COLUMN_SIZES` in `src/lib/blog-image-sizes.ts`) and 698px on generaltranslation.com (`BLOG_COLUMN_SIZES` in `$GT_CLOUD/apps/landing/src/components/blog/imageSizes.ts`). A 1600px stage is therefore shown at about 0.44x, and every size is chosen for that view.

| Element | Size on the stage |
| --- | --- |
| Any text | 26px or more after zoom-to-fit. `MIN_TEXT` in `gen-lib.js` holds the floor and `audit.js` fails the run below it. |
| Label chip | 28px Inter 600 in a 46px chip (`chipStyle(28)` in `gen-visuals.js`) |
| Tag and badge | 30px, 54px tall (`.tag`) and 50px tall (`.badge`) |
| Numbered dot | 56px disc with a 28px numeral (`dot(x, y, n, color, 56)`) |
| Panel header | 32px with a 34px icon (`.plabel`) |
| Measurement label | 28px Geist Mono on a dark backing pill (`.measure`) |
| Lines and rulers | 3px; ruler caps 18 by 3px |
| Crops | 1.2x or larger when they carry text the reader must read |
| Crop corners | 8px radius with a 1px `#3f3f46` border; highlight boxes 6px |
| Ground | twice the stage height, aspect kept, `image-rendering: pixelated`; dimmed to 36 percent under article visuals (`BG_WASH = 0.64`), covers at their own light wash of 0.1 to 0.3 |

The stage script (`CENTER_SCRIPT` in `gen-lib.js`) centres the composition. When the composition is larger than 90 percent of the frame it scales it down to fit, never below 0.8 and never above 1, and the labels shrink with it. Covers (area `H`) skip the fit. When the audit reports text under the floor, make the composition narrower with smaller crops, shorter labels or one label column. Enlarging the type makes the composition wider, and the fit then scales it back down.

| Export | Format |
| --- | --- |
| Article visual | 3840 wide webp at quality 95 (`export-blog.py`) |
| Header cover | 3840 webp in a dark and a light version at the same framing |
| OpenGraph card | 2400 by 1260 PNG, dark and light |
| Clip | GIF 1400 wide (the column's 2x width) and an MP4 master at 30fps |

Prototemplate's `/blog` serves every image through `next/image` with `BLOG_COLUMN_SIZES`, quality 95 and the dense `images.deviceSizes` ladder in `next.config.ts` (640 to 3840), so a 1x, 2x or 3x screen gets a variant within a few percent of its device width. GIFs skip the optimizer (`isGif`). gt-cloud's landing does the same with its own `BLOG_COLUMN_SIZES`, and its `BlogPostCover` asks for quality 95 on a webp cover (gt-cloud main, 2026-10-05).

The first set looked soft because its 12px labels were shown at 0.44x and the dither's one-pixel dots aliased at 1x. The master resolution was already enough. A later report of blur on sharp masters came from the browser shrinking a 3840px image into a 700px column by itself, which cost about an eighth of the edge contrast on a 2x screen. Before changing the pipeline, read what the page serves: `currentSrc`, and the decoded width against `clientWidth * devicePixelRatio`.

## Capture

Sources come from a local landing dev server built from gt-cloud `main`, captured with agent-browser at 1440 by 900 and a device pixel ratio of 4 or 5. Use 5 for pages that get cropped small, 4 for full-page references and 3 for pages shown whole. Themes come from `agent-browser set media light|dark`. Hide the Next.js dev overlay (`nextjs-portal`), park the pointer on plain text, and open menus with their real control. Convert each capture to lossless webp in `graphics/shots/hi/` and register it in `SHOTS` with its `dpr`, so every rectangle is measured in CSS px at 1440. SSO-protected Vercel previews are captured by serializing the DOM from a signed-in Chrome to the graphics server. Read `references/capture.md` for the commands, the state cookies, the measuring snippet and the DOM-serialize route.

## Grounds

The grounds are exports of Kevin's glyphfield project (`graphics/glyph/load.js`). Forty-two of them sit in `public/graphics/bg/user/` (`u10` to `u59`, 1920 by 1080, lossless webp identical to the PNG originals), and `public/graphics/bg/blue/` holds the blue duotone and light variants that carry the covers. `graphics/bg` is a link to `public/graphics/bg`, so the toolchain and the site read one set, and `/graphics` lists each ground with the visuals that sit on it.

Each article visual gets its own export through `ASSIGN` in `gen-visuals.js`, so a post never uses one ground twice (the thirty-three docs visuals sit on thirty-three grounds); the dark, light and OpenGraph versions of one cover share their blue ground. The generator throws when a visual's ground is missing from `BG`. Grounds are exported headlessly with `graphics/glyph/gfboot.sh` and `gfexport.sh`. Read `references/glyphfield-export.md` for the studio steps, the export width, the base64 transfer and the automation API.

## Procedure

1. Install once. Run `pnpm install` at the repository root (heroicons for the label icons) and `pip install pillow`, and put `agent-browser` and `ffmpeg` on the PATH. On a fresh clone run `mkdir -p graphics/build/out`: the folder is ignored by git, and `render.sh` and agent-browser's `screenshot` do not create it, so every render fails without it.
2. Serve. `pnpm graphics:serve` keeps `graphics/` on `http://127.0.0.1:8765`. Every later step reads pages from it.
3. Capture the sources into `graphics/shots/hi/` and register them in `SHOTS` in `gen-lib.js` with their density (`references/capture.md`).
4. Measure the rectangles you will cut, in CSS px at 1440 by 900, into one named object per page. The docs set keeps `N` for the new docs and `O` for the old docs. Every crop, highlight and leader derives from these objects, so a visual can be re-cut when the page changes.
5. Write each visual as one `add(id, area, name, bg, why, () => html, options)` in `gen-visuals.js`. `why` is one sentence saying what the visual shows; `/graphics` prints it. Options are `animated`, `wash`, `vignette`, `w`, `h` and `fit`. Assign the visual its own ground in `ASSIGN`.
6. Generate: `pnpm graphics:gen` writes `graphics/build/visuals/<id>.html` and `graphics/build/manifest.json`. Fix every name it prints under `MISSING ICONS`.
7. Audit: `pnpm graphics:audit [ids]` opens each page at 1600 by 900, fails on any text under 26px after the fit, and lists overlapping boxes and boxes off the stage as warnings. Fix the failures and judge each warning, since a label sitting on the crop it names overlaps on purpose. `pnpm graphics:audit --strict` fails on overlaps too. The audit uses the agent-browser session `gtdocs`, as the render does.
8. Render: `pnpm graphics:render [ids]` writes `graphics/build/out/<id>.png` at 3840 wide. It prints `FAILED <id>` for a page that never centred.
9. Review: `python3 graphics/build/sheet.py [ids]` tiles the renders into `graphics/build/out/_sheet<n>.png`, sixteen per sheet at 640 by 360, close to the size at which a reader first sees them. Open a 1:1 crop of every visual with lines or small type.
10. Clips: record the interaction as stop-motion, then run `graphics/build/composite-videos.sh` (`references/stop-motion.md`).
11. Export: `pnpm graphics:export --covers` writes the webp set, the GIFs, the dark and light header covers and both OpenGraph cards into `public/static/blogs`. Write the flags straight after the script name: pnpm 11 passes a `--` through to the script, and argparse then reads `--covers` as a visual id and stops on a missing `--covers.png`. `--dest $GT_CLOUD/apps/landing/public/static/blogs` writes into a landing checkout instead. Bump the `?v=YYYYMMDD-HHMM` stamp on every reference in the post so caches refresh. When a set ships, copy its sheets to `public/graphics/sheets/<post>-sheet<n>.webp` as lossless WebP (`cwebp -lossless -z 9 <sheet>.png -o <post>-sheet<n>.webp`), which keeps every pixel at about two thirds of the PNG's bytes.
12. Run `pnpm dev` (port 3005) and check the set on `http://localhost:3005/graphics` and the post on `http://localhost:3005/blog/<slug>` in both themes. Kevin reviews new work on localhost before anything reaches main (Kevin, 2026-09-14).

The primitives live in `gen-lib.js`, except the rows marked `gen-visuals.js`.

| Primitive | What it draws |
| --- | --- |
| `crop(shot, rect, { x, y, s, pad, clip, r, cls, filter, opacity })` | a padded cut of a capture at stage position x, y and scale s; 12px padding (`PAD`), none for full-page rects; `clip` keeps a neighbour from bleeding in |
| `hl(origin, s, rect, { color, label, icon, labelPos, labelDx, labelDy, dashed, fill, pad, num })` | a highlight box in page coordinates relative to a crop origin, with an optional tag `above`, `below`, `left`, `right`, `inside` or `insideBottom` |
| `org(x, y, rect)` (`gen-visuals.js`) | the crop origin `hl()` takes: the stage position of a crop and the page rectangle it starts from |
| `tag(text, icon, x, y, color)` | a 30px label tag, 54px tall with 8px corners, in blue, red, dark or white |
| `badge(x, y, text)` | the Before and After marks |
| `dot(x, y, n, color, size)` | a numbered disc; the default size is 44, and the set passes 56 |
| `line(x1, y1, x2, y2, { color, w, start, end, dash })`, `elbow(x1, y1, x2, y2, { mx, ... })` | leaders, 3px by default, with optional end dots |
| `panel(x, y, w, h, inner)` | a transparent group frame |
| `plabel(icon, text, muted)` (`gen-visuals.js`) | the 32px panel header with a 34px icon |
| `label`, `iconLabel`, `xLabel`, `chipStyle` (`gen-visuals.js`) | 28px chips; `xLabel` carries the red x mark of the hit list |
| `stage(bg, html, { w, h, wash, vignette, fit })` | the page shell: fonts, ground, wash, vignette and the centering script |

`gen-visuals.js` and `export-blog.py` hold one post's set. The `designing-docs-` file prefix, `VIDEOS`, `SKIP`, `POST_COVERS` and the cover ids belong to that post, and `src/lib/graphics.ts` names the same prefix, areas, clips and cards for `/graphics`. A new post adds its own visuals and changes those names before exporting, so its files carry its own slug. Name the versions of one image with the suffixes `-light`, `-og` and `-og-light`; `/graphics` folds them into one row (`splitVariant` in `src/lib/graphics.ts`).

## Clips

The recorder keeps one or two frames per second at a device pixel ratio of 4, and `agent-browser record start` reloads the page. Interactions are therefore captured as stop-motion: pause the Web Animations, step `currentTime` between screenshots, and assemble the frames with ffmpeg at variable durations. Screenshots re-fire trusted pointer events on the last clicked element, so the capture blocks real pointer events in the region and drives hovers with synthetic events. `composite-videos.sh` reads the crop rectangle from the rendered visual, overlays the clip on the still, and writes a 30fps MP4 and a GIF at 1400 wide with a 256-colour diff palette, sierra dither and rectangle diffing. `graphics/build/capture-sidebar.sh` is the worked example. Read `references/stop-motion.md` before recording.

## Drawing the GT docs

A visual that shows the docs uses the docs' own measured system: `#09090b` ground, `#fafafa` text, `#a1a1aa` muted, `#0078FF` and `#60a5fa` blues, Inter and Geist Mono, radii from 4px on controls to 12px on panels, a 290px sidebar with 31px rows and a 746px content column from x 310. Icons follow the two tiers: Heroicons solid for anything that carries meaning and Lucide outline for controls. Flags are custom matte SVGs and never emoji. Read `references/docs-tokens.md` for the full table and the page rectangles, and re-measure when the docs change.

Blog visuals take the docs' colours because they depict the docs. Brand artwork takes the brand inks from gt-brand (ink `#070707`, paper `#ffffff`, `#f2f2f0`, `#86a8ff`, `#2f5ce0`).

## Still artwork

`public/media/` keeps the finished GT artwork made with the system, both the stills and the films. `public/media/README.md` describes every file in a table, and a new file gets its row there.

| Artwork | Files | Shown |
| --- | --- | --- |
| Partnership globes | `gt-globe-dithered.png`, `gt-globe-dithered-mark.png`, `gt-globe-glyphs.png`, `gt-globe-glyphs-light.png`, each with a `-transparent` twin, 2048 by 2048 | `/brand`, Made with the system, Partnership globes (`#made-with-the-system-partnership-globes`), with download links for the PNG on its ground and the transparent PNG |
| X profile banner | `gt-banner-signin.png` and its `@2x` master, with `banner-contact-sheet.png` holding the ten explorations | `/brand`, Made with the system |
| Open Source reel and blog films | `open-source-reel.mp4`, `*-film.mp4` and posters | `/brand` and `/motion`; films belong to gt-films |

The globes came from Kevin's request for "a small graphic" for a partnership (Kevin, 2026-10-01).

- The dithered globe is the dashboard sign-in globe (`globe()` in `src/lib/dither.ts`) printed through the 8x8 Bayer screen in `#86a8ff` on ink `#070707` with 6px cells. Its settings are ambient 0.14, rim 0.16, landmass 0.42, gamma 1.15, radius 0.40 of the frame, tilt 0.15 and t 40; larger tilts bring the pole and its noise into view.
- The mark version puts the doubled-line GT mark at 0.42 of the diameter in `#f2f2f0` over a three-cell knockout.
- The glyph globe prints the same sphere in characters from twenty writing systems, picked by a seeded draw. Glyph size follows the lighting alone. Land is large in `#f2f2f0` and `#86a8ff` and ocean is half size in `#2f5ce0`, on 32px cells. Matching glyphs to ink density was rejected because dense CJK glyphs took over every bright area.
- The light glyph globe sits on paper `#ffffff` with land in `#070707` and ocean in `#2f5ce0` thinning to `#86a8ff` in the highlight. Its halftone runs the other way so ink carries the shadow.
- Kevin named the glyph globe his favourite and then asked that only the versions without the GT logo be shown (Kevin, 2026-10-02). The carved versions stay in the renders and out of `public/media`.

The globe sources live in `motion/stills/partnership-globe/` (`index.html?v=globe|gt|glyphs&mode=dark|light`, `render.mjs`, `carve.js`, `sheet.mjs`). `motion/` is untracked and belongs to the Videos session, so treat it as read-only from other lanes. `dither-lib.js` there is generated from `src/lib/dither.ts` by stripping the types, so the sign-in engine runs in the page unchanged. `node render.mjs` writes 2048px PNGs to `motion/out/stills/` and refuses to overwrite an approved still whose bytes differ from its sha256 pin; `REPIN=1` writes it and prints the new hash. Copy approved stills into `public/media/` at their existing names.

`/graphics` is the page for still artwork and `/motion` the page for films (Kevin, 2026-10-03). Today `/graphics` carries the docs series, its contact sheets, its grounds and the figures of the earlier posts, and the globes and the banner are on `/brand`. Dithered photographs and scans of objects are artifact pictures, governed by gt-dither, and they carry no readable English text (Kevin, 2026-10-05).

## The hand-off to a post

Posts live in the `generaltranslation/content` repository, checked out in gt-cloud at `apps/landing/content` (`blog/en-US/<slug>.mdx`), and the images live in gt-cloud at `apps/landing/public/static/blogs/`. Prototemplate keeps its own copies of three posts under `content/blog/` with their graphics under `public/static/blogs/`, read by `/blog` and `/graphics`; `content/blog/designing-docs-for-humans.mdx` is the reference for a post with carousels.

- A set goes into the post as `<Carousel label='…' width='3840' height='2160'>` with one `<CarouselItem src='…' alt='…' />` per visual. The blog's MDX renderer drops every expression prop, so blog components take string attributes and child elements.
- The frontmatter lists the dark cover under `images`, its light twin under `imagesLight` and the 2400 by 1260 card under `ogImages`, each with the `?v=` stamp.
- Every image has alt text that names what it shows concretely, such as the zones and controls it marks.
- A post with new graphics is two pull requests. Merge the gt-cloud one (the images under `public/static/blogs/`, any new component) first and the content one second: every landing deploy checks out the tip of content main, so merging the content pull request publishes the post, and content first publishes it with broken images.
- gt-website holds the rest: the components' contracts, the content preview app's stand-ins, the gitlink rule and the pull request titles (its blog section and `references/blog.md`).
- `graphics/social/` holds the launch posts for each set (an X thread and a LinkedIn post) with the image each one carries.

## Traps and fixes

| Symptom | Cause | Fix |
| --- | --- | --- |
| A "pixelated" cover | 1x dither aliasing, and the optimizer re-encoding at quality 75 | Ground at 2x with square pixels; webp covers served at quality 95 |
| `export-blog.py` stopped on a missing `--covers.png` | `pnpm graphics:export -- --covers` passed the `--` through, so argparse read `--covers` as an id | `pnpm graphics:export --covers` |
| Every render failed to save on a fresh clone | `graphics/build/out/` is ignored and absent, and the screenshot does not create folders | `mkdir -p graphics/build/out` |
| "Blurry" diagrams | 12px labels shown at 0.44x | Labels of 26px or more, 3px lines, a narrower composition |
| Lines clipped | 1px rules and 1.5px caps fall under a device pixel | 3px everywhere, labels on backing pills |
| Soft images on a sharp master | The browser shrank the 3840px master itself | `next/image` with `BLOG_COLUMN_SIZES` and the `deviceSizes` ladder |
| Text under the floor after a type increase | The fit scaled the wider composition down | Narrow the composition |
| A captured Lucide glyph drew as a lone corner | The SVG inliner stripped `width` and `height` from the glyph's `<rect>` | `svgFile()` resizes the root tag only (fixed 2026-09-24) |
| A visual shipped as Chrome's "site can't be reached" page | The 8765 server was down during the render | `render.sh` skips a page that never centres; still check each render's pixel standard deviation (below) |
| A crop renders empty | The `SHOTS` file is missing; the library marks it `missing` and sizes it 1440 by 900 without throwing | Confirm every shot a visual uses exists before rendering |
| A sparkle icon appears in a label | The Heroicon name does not exist and `ico()` fell back to `sparkles` | Fix every name `graphics:gen` lists under `MISSING ICONS` |
| A cover the post embeds as a figure went stale | `export-blog.py` skips `H*` ids unless they are in `POST_COVERS` | List the cover in `POST_COVERS` |
| Servers and the scratchpad are gone after a break | The desktop app stops servers and clears the scratchpad when the date changes | Restart 8765 and the dev servers before rendering; keep review sheets under `graphics/build/out/_*.png` |
| The hover pill jumped after every click in a clip | Screenshots re-fire trusted pointer events | Block trusted pointer events in the region and drive hovers synthetically |
| Carousel prop `items` undefined | next-mdx-remote strips expression props | Child elements with string attributes |
| The content preview build failed | The preview app did not know a new component | Stub every new component in the content repository's preview app |
| The PR policy check failed | A `feat` title without a Linear issue | A `docs(blog)` title, or link the issue |

A render that is a flat error page has a low standard deviation (under about 20 in grey). Check the whole set in one pass:

```bash
python3 -c "import sys; from PIL import Image, ImageStat; [print(round(ImageStat.Stat(Image.open(p).convert('L')).stddev[0], 1), p) for p in sys.argv[1:]]" graphics/build/out/*.png | sort -n | head
```

## Review checklist

- [ ] Every crop comes from a registered capture that exists, cut from a named rectangle.
- [ ] Labels are the only text, and each names something the reader can find in the product.
- [ ] Each slide makes one point, and no two slides in a carousel make the same one.
- [ ] `pnpm graphics:audit` passes with no text under 26px, and every overlap warning was judged.
- [ ] Lines are 3px, leaders start at one x and meet their targets at one offset.
- [ ] Red marks removals and blue marks the page and its replacements; before and after share a scale.
- [ ] No glass panels around diagrams, sparkle icons, over-rounded boxes, eyebrow text, gradients or glows.
- [ ] Each article visual has its own ground in `ASSIGN`, dimmed by `BG_WASH`; covers keep their light wash of 0.1 to 0.3.
- [ ] Every render is a real page (standard deviation check), the contact sheet was read at thumbnail size, and visuals with lines or small type were read at 1:1.
- [ ] Covers exist in dark and light at the same framing, and both OpenGraph cards are 2400 by 1260.
- [ ] Clips: the still matches the first recorded frame, every state that should persist does persist, and the GIF is 1400 wide.
- [ ] Exports are 3840 webp at quality 95, file names carry the post's slug, and every `?v=` stamp in the post was bumped.
- [ ] The page serves each image through `next/image` at the column's device width.
- [ ] Every image has alt text that names what it shows.
- [ ] `/graphics` and the post on `/blog` were checked on localhost:3005 in both themes before anything landed.
- [ ] The gt-cloud pull request with the images merges before the content pull request that publishes the post.
- [ ] Still artwork has a row in `public/media/README.md`, a transparent twin where a partner will place it, and a pinned hash for an approved render.

Related skills: agent-browser (captures, the audit and the render), create-graphics (choosing a route for diagrams and illustrations outside this toolchain), design-engineering-polish (the final visual pass), hyperframes (motion beyond a stop-motion clip). In this set: gt-website (the blog section and its MDX components), gt-brand (the inks and marks), gt-dither (artifact pictures and live dither fields), gt-diagrams (doubled-line connectors), gt-isometric (isometric plates and exploded views), gt-films (blog trailers and the reel), gt-voice (alt text and post copy).

## Sources

- Prototemplate: `docs/GRAPHICS.md` (What a visual is, Sizing, The files, Procedure, Capturing, Backgrounds, Clips, Handing off to a post, Where it went wrong); served at `/docs/graphics`.
- Prototemplate: `graphics/README.md`; `graphics/build/gen-lib.js` (`SHOTS`, `BG`, `MIN_TEXT`, `PAD`, the primitives, `CSS`, `CENTER_SCRIPT`, `stage`); `graphics/build/gen-visuals.js` (`N`, `O`, `add`, `ASSIGN`, `BG_WASH`, the covers); `graphics/build/audit.js`; `graphics/build/render.sh`; `graphics/build/export-blog.py`; `graphics/build/composite-videos.sh`; `graphics/build/capture-sidebar.sh`; `graphics/build/sheet.py`; `graphics/serve/server.js`; `graphics/glyph/gfboot.sh`, `gfexport.sh`, `gfsurvey.sh`.
- Prototemplate: `src/lib/blog-image-sizes.ts`, `next.config.ts` (`images.deviceSizes`, `qualities`), `src/lib/graphics.ts`, `src/app/brand/page.tsx` (`GLOBES`), `src/app/brand/brand-sections.ts`, `src/lib/dither.ts` (`globe`), `public/media/README.md`, `content/blog/designing-docs-for-humans.mdx`.
- Prototemplate: `motion/stills/partnership-globe/render.mjs` (local, untracked, owned by the Videos session).
- Prototemplate, absorbed by this skill: `.agents/skills/blog-graphics-pipeline`, `docs-source-capture`, `glyphfield-headless-export`, `stop-motion-ui-capture` and `gt-docs-visual-tokens` (written 2026-09-18 in 3d87326; the pipeline revised the same day in 70380de and the tokens on 2026-09-21 in c18a362).
- gt-cloud (origin/main, 2026-10-05): `.agents/skills/glyphfield/SKILL.md` and `references/source-map.md`; `apps/landing/src/lib/studio-field.ts`; `apps/landing/src/components/blog/BlogPostCover.tsx` (webp covers at quality 95), `imageSizes.ts`; `scripts/deploy-landing.sh` (content main on every deploy).
- wiki: `skills/engineering/create-graphics/SKILL.md`.
- Session notes: blog-graphics-pipeline-traps (2026-09-18 to 2026-09-24), gt-motion-films (partnership globes, 2026-10-01 to 2026-10-02), docs-redesign-post-part2 (the screenshot cookies, 2026-09-09), fuma-blog-pipeline (the merge order, verified 2026-09-14), explorations-stay-local, session-lanes-prototemplate.
- Where this skill and `docs/GRAPHICS.md` differ, the skill follows the code and gt-cloud main: the set is thirty-three visuals and eight covers and cards (the doc says thirty-six), the GIF is 1400 wide (its Clips section says 1600), the ground is drawn pixelated (its trap table says smooth), the fit never scales up (its table says sparse compositions zoom to fill), webp covers are served at quality 95 (it says 90), and the gt-cloud pull request merges before the content one (it says content first). `graphics/README.md` writes `pnpm graphics:export -- --covers`, which fails under pnpm 11.
- Kevin, 2026-09-14 (review explorations on localhost first); Kevin, 2026-10-01 (the partnership globes); Kevin, 2026-10-02 (show the glyph globes without the logo); Kevin, 2026-10-03 (dedicated pages for graphics and motion); Kevin, 2026-10-05 (no readable text on artifact pictures).
