# Prototemplate, the General Translation knowledge base

Prototemplate is the knowledge base for General Translation, the
localization platform for developers. It holds the brand book, the brand
directives, the design lab with its directions and sites, the repository
documents, the agent skills, and the mark explorations, and serves all of
it as live pages in one viewer. Every direction is a built page, never a
mockup. The Dossier (`/d/singularity-dossier`) is the completed direction
and the reference for the identity in application; Signal and Orbit are
the two earlier site concepts, each keeping its own hero and the sections
the Dossier retired; `/d/production` is the site that shipped, rebuilt
page for page.

## What is here

- `/`: the design lab, the seventeen directions read as an article, one live exhibit at a time, or as a grid of captures, with the anatomy wall (the flagship cut into section tiles, light and dark, desktop and mobile) and the capabilities ledger (what the system can do, each entry pointing at where it runs live)
- `/brand`: the brand book, the identity canon in ten sections
- `/docs`: the repository documents read in the browser, one address per document, with the build log under the readme
- `/deck`: the General Translation brand deck, 52 slides in its own viewer
- `/skills`: the agent skills that carry the brand and design rules into coding sessions
- `/marks`: the mark explorations, every candidate drawn in one color
- `/compare`: two directions side by side in scroll-synced frames
- `/present`: the presenter, a full-screen walkthrough of the redesign with every prototype live
- `/archive`: the retired directions, each kept as a full-page capture with the commit that last held its code

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:3006
```

## Read first

| doc | what it holds |
| --- | --- |
| [`BRAND.md`](./BRAND.md) | the identity canon: the name, the idea, the character and voice, the mark, color, type, language as material — and the Dossier as the completed reference |
| [`DESIGN.md`](./DESIGN.md) | the visual canon: the four-color system, the line law, rails/grounds/seams, the doubled line, iso, the 1-bit language, moving type, motion discipline, the mobile type ladder, the svh/dvh law, the two read lines |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | the code map: directions registry, the toolchain SSOT + fork rescoping, the component inventory |
| [`docs/SHIP-LOOP.md`](./docs/SHIP-LOOP.md) | the verify/ship procedure every round runs (line audit, ratchet, tsc, filming, mirror build) |
| [`docs/LIBRARIES.md`](./docs/LIBRARIES.md) | the library index — the live version is `/craft` |
| [`public/media/`](./public/media/README.md) | finished artwork made with the system: the Open Source announcement reel and the X banner, shown live in `/brand` |

Agent sessions: the same material is wired as skills under
`.agents/skills/gt-redesign` (umbrella) and the focused `redesign-*` skills.

## The one-paragraph tour

Every page runs on the laws: hairlines drawn exactly once
(`scripts/lint-lines.mjs` fails the round otherwise), four absolute colors
plus one spectral accent per page, dark mode as a pure token remap, and one
mobile type ladder (`DESIGN.md` §12). `src/app/d/toolchain` is the
single source of truth the fork directions import and re-skin by root-class
rescoping; `src/lib` holds the visual engines; `src/components/shared` holds
the instruments. `src/lib/directions.ts` registers every direction — the
index, presenter, and sitemap all follow it. The anatomy wall's tiles come
from `docs/harness/gallery-shoot.mjs` under deterministic names
(`ARCHITECTURE.md`, "The gallery pipeline") — a missing tile just drops
from the wall.
