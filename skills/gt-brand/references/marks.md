# Marks in detail

This file backs section 5 of `gt-brand`: where each GT mark lives, which file to use, how the speed set is generated, how a mark sits in text and in an illustration, and where third-party logos come from. Paths are relative to `$PROTOTEMPLATE` unless they name `$GT_CLOUD`.

## The current mark

The GT monogram in use is the doubled-line mark: every stroke of the G and the T is drawn as two parallel lines, the same grammar as the doubled-line connector (DESIGN.md section 5).

| source | what it is | use it for |
| --- | --- | --- |
| `REFERENCE_MARK` in `src/lib/marks.ts` (viewBox `-8 214 1213 771`) | the mark as four contour loops in one evenodd path in currentColor, traced from `public/brand/no-bg-gt-logo-light.png` by marching squares over the alpha channel and simplified at 1.6px of the 1198px master | any vector use in the site, and `/marks`, where it closes the page as the reference |
| the `#gt-mark` symbol in `deck/parts/head.html` | the same outline as a symbol | the deck's sidebar head, the wordmark slot and the GT word |
| `public/brand/no-bg-gt-logo-dark.png`, `no-bg-gt-logo-light.png` and their `-96` versions | transparent PNG masters; the dark file is the white mark cut for the ink ground | favicons (`/present` uses the light PNG as its icon) and raster contexts |
| `public/brand/gt-logo-light.svg`, `gt-logo-dark.svg` | the `REFERENCE_MARK` path in `#000` and `#fff` (1.5 KB each), placed where the embedded PNGs they replaced on 2026-10-09 held the mark: the master's 1198px grid 182px into a 1563px square, scaled 0.239923 into viewBox `0 0 375 374.999991` | the `/brand` tiles and any page that needs the mark as a file |

- The mark ships as vector geometry (deck slide 16). For a new surface take the outline from `REFERENCE_MARK` and draw it in `currentColor`. `src/app/brand/gt-outline.ts` held the same loops as four paths until the 2026-10-06 head round removed it with the brand head's figure; `git show 2a8453c:src/app/brand/gt-outline.ts` prints it.
- The outline is about 1.57 times as wide as it is tall, so a mark set by height takes its width from that aspect.
- If the PNG master ever changes, trace it again the same way (marching squares over the alpha channel, Douglas-Peucker at 1.6px) and replace `REFERENCE_MARK`, the deck symbol and the path in the two `gt-logo-*.svg` files from the same output.

## Rules for every GT mark

- **One ink.** Ink on paper, or paper on ink. No third color, no gradient, no shadow, no filter glow.
- **The dark surface inverts the drawn mark.** Use an alpha mask that takes the surface's ink, or a clean invert. `src/app/present/presenter.css` inverts the white PNG on paper with `filter: invert(1)`, which is the clean invert for a raster.
- **Illustrations seat marks as alpha masks** so the shape takes the surface's ink (the isometric family in DESIGN.md section 6 lays them in a face with `plane()` and `markPath()`).
- **Small sizes.** The mark must read at 16px (favicon), 32px (CLI banner), 64px (README header), 128px (npm page) and 256px (website), on paper and on ink (deck slide 25). Check a new placement at its real pixel size in both themes.
- **No gif.** A mark is drawn as an SVG, a canvas field or a component (`LocadexMark`). gt-ui `no-gif-mark` refuses a gif as a mark or a demo frame.
- **Films.** The gem smoke material may wrap a mark as a glass shape (`motion/kit/gem-shapes/gt-mark.png` and `gt-bar-monogram.png`, made by `node kit/gem-shapes/make.mjs` from the motion folder, which is local and untracked). That is the films' material exception in `motion/MOTION.md` and applies to films only (`gt-films`).

## The GT word in text

In the deck, a standalone GT in rendered copy is the mark at the size of a capital, with the letters kept as hidden text for assistive technology and search:

```html
<span class="gt-word"><svg aria-hidden="true"><use href="#gt-mark"/></svg><span class="sr">GT</span></span>
```

```css
.gt-word { position: relative; display: inline-block; vertical-align: -0.008em; }
.gt-word svg { display: block; height: 0.74em; width: 1.164em; fill: currentColor; }
```

- The symbol's viewBox leaves 8 of 771 units under the glyph, and the -0.008em lift puts the glyph's foot on the baseline. The glyph is 0.724em tall, Inter's cap height.
- The `svg` carries no viewBox; the symbol supplies its own.
- BRAND.md section 4 states the general rule: at text size the wordmark sits inline with prose at the cap height of its line.

## Locadex

- Files: `public/brand/locadex-mark.svg` (vector paths), `locadex-light-no-bg.svg` (a raster wrapper), `locadex-mark-dark.png` and `no-bg-locadex-logo-light.png`.
- gt-cloud draws it as `LocadexMark` in `$GT_CLOUD/packages/ui/src/components/icons/LocadexMark.tsx`.
- It follows the same rules: one color, inverted on ink, shown only where it has a function (deck slide 16).

## The speed set

On 2026-09-29 Kevin brought a race-type wordmark reference and chose seven marks in that register to show alongside the current mark: bar monogram, bar monogram lockup, plate, double cut, livery stack, bar monogram dithered and bar monogram in ASCII. Two marks from the earlier round, Two-way and Globe G, stay for comparison. The set appears on `/marks` (`src/app/marks/`, data in `src/lib/marks.ts`) and on deck slides 17 to 23. Deck slide 16 presents it as the September 2026 exploration beside the current mark, and the mark itself is open in the identity project.

### The register

- **Wide letters.** Every letter is wider than it is tall: the monogram builds G and T from rectangles on a 120 unit cap, the plate sets GT in Orbitron Black, and the wordmarks set the name in Anybody at width 150.
- **A forward slant.** 12 degrees on the monogram family, 14 on the plate, the italic with a 22 degree slash on the livery stack. Double cut stands upright.
- **One cut.** One horizontal cut at mid cap height (8 units on the monogram's 120). Double cut carries two cuts at 40% and 60% of the cap height.
- **Speed bars.** Three bars of 20, 80 and 50 units lead into the G from the left, at the top arm, mid height and the bottom arm.
- **One color.** Every file is one color in `currentColor`: one path, or one masked group where the letters or the cuts are holes. The dither and the ASCII get their gray from the density of their cells.
- **Paper and ink.** The same file works positive and reversed with no redraw. The plate brings its own ground, because its letters and stripes are holes.

### The files and their sizes

| file under `public/marks` | kind | smallest use |
| --- | --- | --- |
| `bar-monogram.svg` | monogram, plain polygons in one path, no font, no mask | holds at 16px; the bars read as bars from 32px |
| `bar-monogram-lockup.svg` | the monogram over GENERAL TRANSLATION in Michroma | the name is an eighth of the lockup's height, so under about 96px use the monogram alone |
| `plate-inverted.svg` | GT cut out of a skewed plate with a hazard-striped end | avatars, badges, the CLI banner; the stripe reads from about 48px |
| `double-cut.svg` | GENERAL TRANSLATION in Anybody Black, upright, two cuts | headers, footers and sleeves; the cuts close below about 16px of cap height |
| `livery-stack.svg` | GENERAL over TRANSLATION in Anybody italics, a cut per line and one slash | large sizes only, about 48px and up |
| `bar-monogram-dithered.svg` | the monogram through the 8 by 8 Bayer screen, solid on the left third and falling to 0.18 density at the right edge; 240 by 59 cells | 59px and up, where a cell is one pixel |
| `bar-monogram-ascii.svg` and `.txt` | the same grid as 160 columns by 23 lines of `@` | a code block, a README or the CLI banner, in a monospace face only |

### Regenerating

1. Edit `scripts/build-speed-marks.mjs`. The geometry is data at the top of the script (`MONOGRAM_RECTS`, `SKEW`, `CUT`), and text becomes outlines through fontkit.
2. Run `pnpm build:marks`. It writes every file under `public/marks` and prints each size in bytes.
3. The deck inlines the marks by hand: paste each changed file's markup over the old markup in `deck/slides/17-speed-monogram.html` to `23-speed-ascii.html`, with an explicit width and height in px on the root that keeps the file's aspect. Then run `pnpm build:deck`.
4. If the presentation field changed, re-crop it for deck slide 73: `deck/shots/proto-marks-speed-light.jpg` and `proto-marks-speed-dark.jpg` are the field cropped from `/marks#presentation` at 1440 wide (memory note `speed-marks-set`). `gt-deck` covers the slide side of steps 3 and 4.

Never edit an SVG under `public/marks` by hand, and never redraw a mark inside a slide. The faces behind the set (Michroma 400, Orbitron 900, Anybody at width 150 in 900, 900 italic and 500 italic) are fetched into `public/fonts/google` by `scripts/fetch-google-faces.py` and exist only as outlines in the files; no page loads them.

## The dithered shimmer

The one sanctioned flourish on a mark is the Bayer specular shimmer, `DitheredMark` in `src/app/d/toolchain/diagrams/DitheredMark.tsx` (mirrored in `$GT_CLOUD/apps/landing/src/components/landing/shared/DitheredMark.tsx`). The mark keeps its alpha mask, and a band quantized by the 4 by 4 Bayer matrix sweeps through it by horizontal translate; under reduced motion or without JS the markup poses with the band mid-glyph. Its tiers, its counter-sheen and the driver are documented in `gt-isometric`, which owns the component.

## Third-party logos

Kevin's source for third-party brand marks is thesvg.org (the GLINCKER/thesvg catalogue, more than 7,400 marks).

- Catalogue: `https://thesvg.org/api/registry.json` (slug, title, aliases, categories, hex, license, url, variants).
- Files: `https://thesvg.org/icons/{slug}/{variant}.svg`, or `https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/{slug}/{variant}.svg`. Variants are usually default, mono, light, dark and wordmark.
- Inline the chosen file as a component. Never add `@thesvg/react` (84 MB unpacked) or the `thesvg` data package.
- In gt-cloud each mark is a default-exported `*Logo.tsx` in `$GT_CLOUD/packages/ui/src/components/icons/` drawn on the shared `BrandMark` root (`BrandMark.tsx`, which exports `BrandMarkProps`): `aria-hidden` unless a `title` is given, `variant` `brand` or `monochrome`, hex fills allowlisted per file for gt-ui `no-hex-colors`. Namespace any mask or filter ids with `useId`.
- Picks that read at 16px in both themes: `openai/light` in currentColor, `gemini/default`, `claude/default`, `grok/default` in currentColor, `deepseek/default`, `mistral/default`.
