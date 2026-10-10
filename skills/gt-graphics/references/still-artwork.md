# Still artwork

`SKILL.md` points here: the finished GT stills in `public/media/`, how the partnership globes were made, and how a still is rendered, pinned and published.

## The files and the globes

`public/media/` keeps the finished GT artwork made with the system, both the stills and the films. `public/media/README.md` describes every file in a table, and a new file gets its row there.

| Artwork | Files | Shown |
| --- | --- | --- |
| Partnership globes | `gt-globe-dithered.png`, `gt-globe-dithered-mark.png`, `gt-globe-glyphs.png`, `gt-globe-glyphs-light.png`, each with a `-transparent` twin and a lossless `.webp` of the PNG on its ground, 2048 by 2048 | `/brand`, Made with the system, Partnership globes (`#made-with-the-system-partnership-globes`), which shows the WebP and links the PNG on its ground and the transparent PNG for download |
| X profile banner | `gt-banner-signin.png` and its `@2x` master, kept as lossless WebP, with `banner-contact-sheet.png` holding the ten explorations | `/brand`, Made with the system, which shows the `@2x` WebP |
| Open Source reel and blog films | `open-source-reel.mp4`, `*-film.mp4` and posters | `/brand` and `/motion`; films belong to gt-films |

The globes came from Kevin's request for "a small graphic" for a partnership (Kevin, 2026-10-01).

- The dithered globe is the dashboard sign-in globe (`globe()` in `src/lib/dither.ts`) printed through the 8x8 Bayer screen in `#86a8ff` on ink `#070707` with 6px cells. Its settings are ambient 0.14, rim 0.16, landmass 0.42, gamma 1.15, radius 0.40 of the frame, tilt 0.15 and t 40; larger tilts bring the pole and its noise into view.
- The mark version puts the doubled-line GT mark at 0.42 of the diameter in `#f2f2f0` over a three-cell knockout.
- The glyph globe prints the same sphere in characters from twenty writing systems, picked by a seeded draw. Glyph size follows the lighting alone. Land is large in `#f2f2f0` and `#86a8ff` and ocean is half size in `#2f5ce0`, on 32px cells. Matching glyphs to ink density was rejected because dense CJK glyphs took over every bright area.
- The light glyph globe sits on paper `#ffffff` with land in `#070707` and ocean in `#2f5ce0` thinning to `#86a8ff` in the highlight. Its halftone runs the other way so ink carries the shadow.
- Kevin named the glyph globe his favourite and then asked that only the versions without the GT logo be shown (Kevin, 2026-10-02). The carved versions stay in the renders and out of `public/media`.

The globe sources live in `motion/stills/partnership-globe/` (`index.html?v=globe|gt|glyphs&mode=dark|light`, `render.mjs`, `carve.js`, `sheet.mjs`). `motion/` is untracked and belongs to the Videos session, so treat it as read-only from other lanes. `dither-lib.js` there is generated from `src/lib/dither.ts` by stripping the types, so the sign-in engine runs in the page unchanged. `node render.mjs` writes 2048px PNGs to `motion/out/stills/` and refuses to overwrite an approved still whose bytes differ from its sha256 pin; `REPIN=1` writes it and prints the new hash. Copy approved stills into `public/media/` at their existing names, and write the lossless WebP that `/brand` shows beside each one on its ground with `cwebp -lossless -z 9 -exact -metadata none <name>.png -o <name>.webp`. Decode the PNG and the WebP and compare their raw pixels before committing; they must be identical.

`/graphics` is the page for still artwork and `/motion` the page for films (Kevin, 2026-10-03). Today `/graphics` carries the docs series, its contact sheets, its grounds and the figures of the earlier posts, and the globes and the banner are on `/brand`. Dithered photographs and scans of objects are artifact pictures, governed by gt-dither, and they carry no readable English text (Kevin, 2026-10-05).
