# Prototemplate: GT's brand identity lab

The living brand guidelines for General Translation, and the design lab
that produced them: sixteen art directions and three full sites built as
live pages (never mockups), plus the tooling that judges them. **The
Dossier (`/d/singularity-dossier`) is the completed direction** — the
canonical statement of the identity in application. The index (`/`) is the
working file; `/brand` is the identity book; `/present` walks the deck;
`/docs` serves the written canon and, right below this tour, the whole
build log — the laws, the auditors, and every library running live.

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:3006
```

## Read first

| doc | what it holds |
| --- | --- |
| [`BRAND.md`](./BRAND.md) | the identity canon: the name, the idea, the character and voice, the mark, color, type, language as material — and the Dossier as the completed reference |
| [`DESIGN.md`](./DESIGN.md) | the visual canon: the four-color system, the line law, rails/grounds/seams, the doubled line, iso, the 1-bit language, moving type, motion discipline |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | the code map: directions registry, the toolchain SSOT + fork rescoping, the component inventory |
| [`docs/SHIP-LOOP.md`](./docs/SHIP-LOOP.md) | the verify/ship procedure every round runs (line audit, ratchet, tsc, filming, mirror build) |
| [`docs/LIBRARIES.md`](./docs/LIBRARIES.md) | the library index — the live version is `/craft` |

Agent sessions: the same material is wired as skills under
`.agents/skills/gt-redesign` (umbrella) and the focused `redesign-*` skills.

## The one-paragraph tour

Every page runs on hairlines drawn exactly once (`scripts/lint-lines.mjs`
fails the round otherwise), four absolute colors plus one spectral accent
per page, and dark mode as a pure token remap. `src/app/d/toolchain` is the
single source of truth the fork directions import and re-skin by root-class
rescoping; `src/lib` holds the visual engines; `src/components/shared` holds
the instruments. `src/lib/directions.ts` registers every direction — the
index, presenter, and sitemap all follow it.
