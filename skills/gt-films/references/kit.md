# The project, the kit and the render in detail

This file is the detail behind sections 6 and 9 of `../SKILL.md`. Paths that start with `films/`, `kit/` or `out/` sit inside `$PROTOTEMPLATE/motion/`.

## A fresh clone

1. `pnpm install` at the repository root (the kit's GSAP comes from the root `node_modules`).
2. `node motion/kit/vendor.mjs`: it writes GSAP 3.15.0 with DrawSVG, MorphSVG, SplitText, Flip, MotionPath and CustomEase, lottie-web 5.13.0, fflate 0.8.3 and Paper Shaders 0.0.78 (Apache-2.0) into `kit/`, and copies every twin that `kit/picture-sources.json` names (the marks, the Inter files, logos and pictures the repository already tracks in `public/` and `deck/`). Each file is checked by SHA-256; `--check` writes nothing.
3. Fetch the pictures and fonts that have no twin from the source each `picture-sources.json` entry gives, and check each against its hash. Entries whose licence is unconfirmed stay local; a film that needs one renders only where `motion/` holds it.
4. Audio (takes, beds, masters, premixes) is never tracked. A published film re-renders its sound only from the local folder, which keeps its frozen copies.

## The project folder

- `init` writes `index.html`, `hyperframes.json`, `meta.json`, `package.json` and its own `AGENTS.md` and `CLAUDE.md` (HyperFrames' boilerplate, which the repository does not track). Add `lib/` for the film's code, `audio/` or `sound/` for takes and masters, `assets/` for pictures, `fonts/` for the film's own faces, `archive*/` for earlier builds, and the docs: `STORYBOARD.md`, `SCRIPT.md` (with later rounds as `SCRIPT-v2.md` and so on), `CONCEPT.md`, `NOTES.md`, `CREDITS.txt` for a published film and `BRIEF.md` for a series film or an announcement.
- Each film builds its sound with its own scripts and its NOTES.md names them: Fuma Nama's `lib/` holds `cues.mjs`, `make-voice.mjs`, `make-bed.mjs` and `make-mix.mjs`; the docs film keeps its drawing in `lib/film.js` and its sound in `audio/make-bed.py` and `audio/mix.py`; the series films use Python tools under `tools/` or `sound/tools/`; the Slash film uses `lib/cues.mjs`, `lib/take.sh` and `lib/mix.py`. These are the films' frozen copies; a new film starts from `kit/sound/`.
- The films keep HyperFrames at 0.8.106 until the Videos session moves every film together, whatever the wiki's `hyperframes` skill suggests.

## The composition contract

- One paused GSAP timeline per composition, built synchronously and registered on `window.__timelines['<composition-id>']` (initialise `window.__timelines` first). The root carries `data-composition-id`, `data-start="0"`, `data-width`, `data-height` and `data-duration`.
- Canvas drawing happens in the timeline's or a tween's `onUpdate` from tween-driven proxies. A picture a canvas reads is also a hidden `<img>` in the DOM, so the renderer waits for it.
- A transformed element is block level and sized. Never pair a CSS `transform` with a GSAP tween on the same element; set the start inside `fromTo`.
- A short film may be one `index.html` (`composition_file_too_large` and `timeline_track_too_dense` are then kept warnings, named in NOTES.md). A long film splits scenes into sub-compositions (journey-to-the-west builds eight with `tools/compose.py`).
- Fallback families for glyph text are set from JavaScript, because the compiler reads family names from `<style>` text and fetches any it cannot find.

## The kit's engines

| path | API |
| --- | --- |
| `kit/tokens.css` | the Inter `@font-face` on `kit/fonts/InterVariable.woff2`, `--font`, the colors and the deck ladder at 1920 (`.t-display` 106, `.t-h1` 88, `.t-h2` 53, `.t-lead` 31, `.t-body` 26, `.t-cap` 18) |
| `kit/dither.js` | `window.GTDither`: `grid(canvas, cell)`, `toneFromImage(img, grid, { fit, focusX, focusY, gamma, invert, blur, lift, region })`, `draw(grid, field, { ink, paper })`, `mix(a, b, p)` on one smoothstep (drive `p` with ease `none`), `fields.ramp`, `fields.disc`, `fields.horizon`, `rng(seed)` |
| `kit/gemsmoke.js` | `window.GTGem` (an ES module that fires `gtgem-ready`): `mount(host, { palette, params, image, width, height, pixelRatio, offset, rate })` resolves to `{ at(t), set(params), dither(grid, { tones, gain, gamma, amount }), canvas, mount }` |
| `kit/endcard/endcard.js` | `addEndCard(tl, { palette, title: [line1, line2], url, start })` |
| `kit/sheet.js` | `window.GTSheet.mount(el, { inset: 67 })`: rails, rules, registration crosses, the small mark and a counter |
| `kit/gem-shapes/make.mjs` | processes a mark into a gem smoke shape PNG; add a row to its SHAPES list and run it (Chrome through playwright-core, `CHROME_PATH` to pin one) |

- **Gem smoke.** Draw a frame with `gem.at(seconds)` inside `onUpdate`. Change uniforms per frame with `mount.setUniformValues` (cached and synchronous); `gem.set()` loads its image asynchronously, so never call it per frame. Keep at most two full-frame mounts live at once. Use `pixelRatio: 0.5` for a mount that is only read or dithered. Keep the outer glow at 0 under a dither field, and clip glass 1 px outside its limb when hard cells sit beside it.
- **Dither.** One cell size per film, anchored at (0, 0), never resized inside a transition: 3 px since 2026-10-08. A dithered field changes state only by mixing tone on one grid with one smoothstep, so cells switch in Bayer order. Alpha fades, wipes and moving masks are refused on dithered fields. A field enters by raising its tone from 0 and leaves by lowering it to 0.
- **End card.** 4.0 s from a hard cut on the beat: the doubled-line GT mark in the film's gem smoke, the post's title in two lines at 120 px (no less than 100 px for a long line) and the link at 40 px, every margin 160 px. Set the root's `data-duration` to `start + 4`, end the film's clips at `start`, add the card after the film's own tweens and register the timeline after it. The card is silent; the bed resolves under it. `hyperframes check` reports two expected `text_occluded` infos at `start + 0.33`. The card's last frame is the blog films' poster.

## The media the kit loads

These stay in the local `motion/` folder; `vendor.mjs` writes the twins and `picture-sources.json` names the source and licence of the rest.

| path | what it is |
| --- | --- |
| `kit/marks/`, `kit/brand/` | the speed marks (bar monogram, lockup, dithered, ASCII, plate inverted, double cut, livery stack, two-way, globe G) and the doubled-line GT mark (tracked) |
| `kit/logos/`, `kit/logos/adopters/` | Fumadocs, MDX, Next.js, React, TanStack and Mintlify marks; the marks and GitHub avatars of Fumadocs' adopters |
| `kit/fonts/` | InterVariable and its italic |
| `kit/gem-shapes/*.png` | processed shapes for gem smoke glass (`gt-bar-monogram`, `gt-mark`, `fumadocs-moon`), written by `make.mjs` |
| `kit/sources/`, `kit/two-tone/`, `kit/tone/`, `kit/blog/` | full-resolution picture sources, the deck's dithered mood and opener files, the sign-in plate's tone grids, every image the blog posts ship |
| `kit/_retired/` | the dictionary pictures, retired on 2026-10-05; never use them |

## The sound tools and the review pages

- `kit/sound/` holds one canonical copy of the take recorder (`record.mjs`, through `kit/audio/el.mjs`), the take ledger, the click, chroma and loudness checks, and the mix functions driven by a plan file in the film folder; `kit/sound/tones/` holds the Mandarin tone tools (pitch contours per syllable, TD-PSOLA correction, splices, a carrier phrase for short Mandarin takes). Its README lists every published film's frozen copy and how it differs. A new film uses the kit; a published film keeps its own copies so its sound rebuilds as it was made.
- `kit/review/` holds the script review page (each film's lines on a to-scale timeline and in a table: who speaks, the words, the subtitle, what is on screen and when) and the narrator audition page (each take with the film's music or alone, one player). Each reads a JSON file named by `?data=`; a script entry is the film's `script.json` plus times. Serve `motion/` with a static server (`python3 -m http.server` in `motion/`), keep the round's data and takes outside the tracked files, and serve takes from the same server, since the page fetches them. `node motion/kit/review/smoke.mjs` checks both pages on their sample data in headless Chrome. The pages replaced the claude.ai pages Kevin reviewed the series scripts and the narrator auditions on (2026-10-05).

## Renders in detail

- In 0.8.106 `--quality delivery` is an alias of `high` (x264, preset slow, CRF 15); the wiki's `hyperframes-cli` skill writes `--quality high` for the same preset.
- A still: `npx -y hyperframes@0.8.106 snapshot . --at <seconds> --no-end --describe false`.
- Render the delivery cut without `--quiet` and save its log (`| tee`), so the Google Fonts check has a log to read.
- With several workers a render captures every frame to disk before it encodes; with `--workers 1` it streams frames to the encoder and writes almost nothing. Free disk before a render, and keep a film's prototypes under about 1 GB.
- A share copy for a large master: `ffmpeg -i <slug>.mp4 -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -c:a copy -movflags +faststart <slug>-share.mp4` (jihe-yuanben went from 153 MB to 39 MB). GitHub refuses files over 100 MB, so a web copy comes from the share copy when the master is larger.
- Checking sheets: `out/_sheets/<slug>.png` (one frame a second, six columns of 480 px tiles with the time under each, the lanes' own) are separate from the published contact sheets in `out/sheets/`.
- The script as built: `kit/script-export.py <script.json> <stt.json> <film.mp4> <out.md> --voices "Narrator: Frederick Surrey" --version v<N>`. A published film's reviewed table is tracked as `films/<slug>/script.json` and its transcript as `films/<slug>/script.stt.json`; lanes work in `out/scripts/source/`. A line the transcript cannot place (a reader's Mandarin) takes an `at` time from the film's own record.
