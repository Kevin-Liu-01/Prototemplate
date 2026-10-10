# Build scripts

Detail for section 7 of `prototemplate`, moved from SKILL.md on 2026-10-10 with no rule removed. `docs/TOOLS.md` (`pnpm build:tools`) lists every script with its header.

| command | reads | writes |
| --- | --- | --- |
| `pnpm dev` | the source | `next dev --turbopack --port 3005`, started from the launch config `prototemplate-dev` |
| `pnpm build` | the source | the picture, type, radius and heads lints, the `build:updated` check, then `next build` |
| `pnpm build:updated` | `git log` over each book head's paths (`--staged` for a commit) | `src/lib/updated.ts`; `pnpm lint:updated` (`--check`) fails while it is stale against HEAD |
| `pnpm build:deck` | `deck/parts`, `deck/slides`, `deck/fonts`, `deck/shots` | `public/brand-deck.html`, its pictures as content-hashed files in `public/deck-assets`, and `public/shots/deck` |
| `pnpm build:marks` | the faces in `public/fonts/google`, through fontkit | the speed marks in `public/marks`, one color in `currentColor` |
| `pnpm build:thumbs` | `public/shots/{light,dark,archive,pages}` | 640 by 360 WebP files in `public/shots/thumb`, through `sips` and `cwebp` on macOS; it also cuts any JPEG a capture pass left there to WebP and removes it |
| `pnpm build:skills` | `skills/<slug>/SKILL.md` and the files beside it, nothing outside the checkout | `src/lib/skills.ts` and `skills/README.md`, after checking the contract (section 10); `pnpm lint:skills` (`--check`) fails while either is stale |
| `pnpm build:motion` | `motion/MOTION.md`, `motion/films/<slug>/BRIEF.md`, the published cuts pinned in `public/motion/published.json` and their records in `motion/out` | `src/lib/motion.ts`, `public/motion/<slug>.md`, and each published cut's credits, contact sheet and script in `public/motion` |
| `pnpm capture:pages` | the dev server, or generaltranslation.com with `--live` | `public/shots/pages/<id>-{light,dark}.jpg` at 1440 by 900 |
| `pnpm check:pages` | the dev server | `.pagecheck/REPORT.md` |
| `pnpm graphics:serve`, `:gen`, `:render`, `:export`, `:audit` | `graphics/` | the illustrations (`gt-graphics`) |
| `pnpm mood-tone <sources dir>` | source pictures, with `--set deck` (the default) or `--set plate` | the tone grids in `deck/shots/tone` or `public/brand/mood` (`gt-dither`) |
| `python3 scripts/build/fetch-google-faces.py` | Google Fonts | `public/fonts/google` and its `MANIFEST.json` |
| `pnpm build:inter` | `public/fonts/InterVariable*.woff2`, through fonttools and brotli (`pip install --user fonttools brotli`) | the subsets in `public/fonts/inter`, their faces in `src/app/inter-subsets.css` and the latin range in `src/lib/fonts.ts` |

- The generated outputs are committed (`src/lib/skills.ts`, `src/lib/motion.ts`, `public/brand-deck.html`, `public/deck-assets`, `public/shots`, `public/marks`), so the site builds without `motion/` or any other checkout.
- `build:motion` only reads `motion/`. It throws before writing when a brief's or a script's shape changes or a web copy differs from the cut `public/motion/published.json` pins, so the last generated files stay intact. It publishes a film's credits, sheet and script only from the folder whose render is the pinned cut, and lists a newer cut as in review (`--pin <slug>` pins a new web copy once Kevin approves it).
- `scripts/build/skills.mjs` reads only `skills/`, so it runs in any clone. Its header comment lists the contract it checks.
- The browser scripts launch Chrome for Testing through `playwright-core` and default to the build it installs (`pnpm exec playwright-core install chromium`). Every one of them (`capture:pages`, `check:pages`, `lint:lines`, and the live modes of `lint:type`, `lint:radius` and `lint:heads`) reads `CHROME_PATH` first.
- The Google faces are self-hosted because Turbopack's Google font loader failed builds at random (vercel/next.js#99114, fixed here on 2026-09-24).
