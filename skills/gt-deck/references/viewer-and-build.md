# The viewer, the build and the shooter

Detail behind sections 11 and 12 of SKILL.md. Paths are relative to a Prototemplate checkout.

## The viewer

The deck carries its own viewer in `deck/parts/head.html` (CSS and markup up to the stage) and `deck/parts/tail.html` (the surfaces panel, the help card and the script). Nothing under `src/components/viewer` reaches into it. `/deck` frames the built file in an iframe (`src/app/deck/page.tsx`, `src/app/deck/DeckFrame.tsx`).

- Modes: slide, grid (`G`, every slide as a tile) and book (`B`, a head, a contents list and every slide as a page under its section). Present mode (`P`) hides the chrome so the sheet fills the window; fullscreen (`F`) also turns present mode on.
- Keys, from the help card: Right, Space or J for the next slide; Left or K for the previous one; Home and End; digits then Enter to jump; R for the surfaces panel; `[` for the slide list; D for the theme; `?` for the card; Escape steps back one layer. Clicking the left or right half of the sheet moves too.
- The hash is the slide's position (`#12`). Each change posts `{ type: 'gt-deck-slide', n }` to the parent, and `DeckFrame.tsx` mirrors it into the page address, so a search row's `/deck#12` lands on slide 12.
- State in localStorage: `gt-theme` (shared with the Prototemplate shell), `gt-deck-theme` (the deck's older key), `gt-deck-sb` (the slide list hidden) and `gt-deck-mode` (book mode remembered). Every read and write is wrapped in try/catch.
- The slide list, the grid and the book are live clones of the slides (`cloneSlide`). Clones drop every `id`, so a slide styles by class. An id selector reaches only the copy on the stage.
- A slide's title in the list, the book and the toolbar is the text of its first `h1`, `h2` or `.big` (`titleOf`), cut at 72 characters. A slide with none of the three shows "Slide N".
- SECTIONS in `tail.html` drives the section labels in the slide list, the book's contents and section heads, and the section name. Each entry is `[position of the opener, 'Section name']`.
- The surfaces panel lists every public place the brand is live, grouped, with thumbnails from `deck/shots/thumb`. `scripts/build-deck.mjs` also copies those thumbnails to `public/shots/deck` for the index panel's General Translation set in `src/lib/surfaces.ts`.

## What Kevin expects of a viewer

Kevin's asks for the deck's viewer (2026-09-08 and 2026-09-09) hold for any GT presentation:

- a real presentation viewer with a sidebar of every slide ("make this much better like a real presentation viewer with a sidebar of all slides");
- present mode on its own screen ("the present screenn should be separate");
- a toolbar that does not repeat what the sidebar shows;
- slides that can be excluded from present mode;
- slides centered at every window size ("the slides are not centered");
- sparse text-only slides given icons, such as check marks in their tables (`ok`, `warn`, `no` in section 4 of the skill).

## Themes in the viewer

- The script at the top of `head.html` stamps `data-theme` on `<html>` before the first paint: `gt-theme`, then `gt-deck-theme`, then dark when neither is set. `prefers-color-scheme` is never consulted.
- The toggle writes both keys. A toggle on the page around the frame arrives as a `storage` event, and `ThemeButton.tsx` also posts `{ type: 'gt-theme', theme }` (same origin only), which covers private windows.
- `applyTheme()` swaps every `img[data-dark]` between its `src` and its `data-dark` file, redraws the `canvas.dither` ramps, syncs the backdrop and redraws the mood canvases with the theme's `--mood-ink` and `--mood-opacity`.

## The build

`pnpm build:deck` runs `scripts/build-deck.mjs`:

1. `deck/assemble.mjs` reads `deck/slides/NN-*.html` (the pattern is `^\d\d-.*\.html$`, sorted) and fails unless there are exactly `SLIDE_COUNT` files. It also fails if any slide carries a `<script>`, if `head.html` does not open with the `<title>` the wrapper replaces, or if the `<!--FONTS-->` marker is missing. The shooter reads the deck through the same module.
2. It inlines `deck/fonts/deck-fonts.css` in place of `<!--FONTS-->`. That file registers the rsms InterVariable roman, byte for byte the same file as `public/fonts/InterVariable.woff2`, as the family `'Inter'` at weights 100 to 900. No italic is inlined.
3. It turns every `src`, `data-dark` and `data-tone` path under `shots/` into a data URI:
   - photographs and captures are resampled through `sips` to 1280 px wide at JPEG quality 78;
   - `opener-*` and `detail-*` files keep their native size: a two-tone image (98 percent of pixels at the two extremes) is stored as a one-bit PNG through python3 with Pillow, and a continuous-tone one as JPEG quality 88;
   - `shots/thumb/*` files and the mood tone grids `shots/tone/*` pass through untouched (the grids are screened in the browser, so a re-encode would change the picture).
4. It wraps the result in a document (doctype, charset, viewport, the title "General Translation brand deck", `noindex`), checks that the output holds `SLIDE_COUNT` slide sections, and writes `public/brand-deck.html`.

Requirements and traps:

- `sips` makes the build macOS only.
- Without python3 and Pillow the build prints one warning and stores the two-tone images as JPEG, and the file grows several times over.
- `public/brand-deck.html` is committed. It was 28,077,898 bytes on 2026-10-05, which the build prints as 26.78MB because its MB is 1024 by 1024 bytes. A full build takes about 100 seconds. Rebuild and commit it with the slide change, or `/deck` serves the old deck and `scripts/lint-pictures.mjs` can fail on the built file's grids.

### The artifact copy

`node scripts/build-deck.mjs --out <file> --quality <n> --max-width <px> --native-quality <n> --thumb-quality <n>` writes one lighter copy elsewhere and leaves `public/` alone. A claude.ai artifact holds at most 16 MB.

| Flags | Output as the build prints it |
| --- | --- |
| `--quality 66 --max-width 900 --native-quality 76 --thumb-quality 68` | 15.59MB on the September deck; 17.88MB on 2026-10-05, over the limit |
| `--quality 60 --max-width 900 --native-quality 62 --thumb-quality 60` | 16.38MB on 2026-10-05, over the limit |
| `--quality 55 --max-width 800 --native-quality 55 --thumb-quality 55` | 14.36MB on 2026-10-05 (15,056,194 bytes), under the limit |

The flags reach only the resampled photographs, the continuous-tone natives and the thumbnails; the 24 two-tone PNGs and the 10 tone grids pass through at full size. Read the printed size before publishing, and look at a few slides at the lower quality. In zsh, pass the flags explicitly: `set -- $cfg` does not split words. The live public copy is prototemplate.com/deck.

## The shooter

`node deck/shoot-slide.mjs 8 15` (or `all`) writes the source `deck/assemble.mjs` builds to a private file under `deck/tmp`, opens it in Chromium at 1600 by 900 in present mode, seeds the stored theme for a light pass and a dark pass, and writes `deck/preview/sNN-light.jpg` and `sNN-dark.jpg`. For each slide it prints any element inside the slide whose box leaves the 1600 by 900 sheet, then any page error or console error. Runs in parallel are safe.

- The numbers are positions in the sorted file list, the same numbers as the hash and the counter. After 36 they differ from the file prefixes, because 37 and 54 are unused: `38-motion.html` is slide 37 and `95-closing.html` is slide 93. A number outside 1 to the slide count is dropped without a message.
- Three slides in both themes take about 20 seconds. The JPEGs overwrite the last render of the same number, so a session that must not disturb another's previews can run copies of `shoot-slide.mjs` and `assemble.mjs` from a folder beside `deck/` (so `../scripts/site-pages.mjs` resolves) whose `parts`, `slides`, `fonts` and `shots` are symlinks to `deck/`, with `tmp/shots -> ../shots` inside it. The previews land in that folder.
- The private file references `shots/...`, which resolves through the symlink `deck/tmp/shots -> ../shots`. Create it if it is missing (`ln -s ../shots deck/tmp/shots`).
- The script imports `playwright-core` from the repository's devDependencies and launches `CHROME_PATH` from `scripts/site-pages.mjs`: the environment variable, else the pinned Chromium for Testing build (`chromium-1217`) in the Playwright cache. Set `CHROME_PATH` on another machine. Chromium runs with `--allow-file-access-from-files`, because a `file://` page that reads another file taints its canvas, and the mood slides would render blank.
- `deck/preview` and `deck/tmp` are gitignored.
- The overflow report reads boxes only. It does not see text that touches a rail, a label crossing a line, a contrast failure or an empty half-slide. Look at both JPEGs.

## The line audit

`pnpm lint:lines:shell` audits `/deck` too: the iframe's document on the dev server at port 3005, at 1440, 1280 and 390 in both themes, with the grid and the book open. It reads the built `public/brand-deck.html`, so rebuild before it runs. It fails on a doubled line, two owners on one seam, or a chrome border color outside the three roles in `DESIGN.md` ("Line law for chrome"). The deck's `.scroll` rule mirrors the shell's thin scrollbar (`.pt-scroll` in `src/components/viewer/tokens.css`).

## Sources

- Prototemplate: `scripts/build-deck.mjs`, `deck/assemble.mjs`, `deck/shoot-slide.mjs`, `deck/parts/head.html`, `deck/parts/tail.html`, `scripts/site-pages.mjs` (`CHROME_PATH`), `src/app/deck/page.tsx`, `src/app/deck/DeckFrame.tsx`, `DESIGN.md` ("Line law for chrome"), `.gitignore`.
- Memory notes `gt-brand-deck` (the artifact copy flags and the 16 MB limit) and `prototemplate-interface-system` (the deck opens dark; the deck stands alone at `/deck`, Kevin, 2026-09-08 and 2026-09-09).
