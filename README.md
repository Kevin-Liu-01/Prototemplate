# Prototemplate — the GT website redesign lab

Sixteen art directions and three full sites for the General Translation
website, built as live pages (never mockups), plus the tooling that judges
them. The index (`/`) is the working file; `/present` walks the deck;
`/craft` is the build log with the laws, the auditors, and every library
running live.

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:3006
```

## Read first

| doc | what it holds |
| --- | --- |
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
