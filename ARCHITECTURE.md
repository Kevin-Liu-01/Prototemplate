# Architecture

How `apps/redesign` is put together, and the rules that keep sixteen
directions coherent. Read `DESIGN.md` for the visual laws; this file is the
code map.

## The shape of the app

```
src/
  app/
    page.tsx              the index — the working file of the redesign
    craft/                the build log: laws, auditors, live library plates
    present/              the presenter deck (intro → prototypes → scoreboard)
    d/<slug>/             one route per direction (see src/lib/directions.ts)
    d/toolchain/          THE SSOT — sections, diagrams, styles other forks import
    d/_v0/                shared v0 sections (TranslateWindow, StackTower,
                          Locadex, FullStack, Deploy …) used by the
                          singularity-* homes
    prototemplate.css     the pt grammar (index + craft chrome)
    globals.css           the four color tokens
  components/
    shared/               cross-page instruments: EverySentence, StudioField,
                          PrismaticField, HeroFieldSwitcher, ThemeToggle,
                          diagrams/ (DoubledLine, …)
    shell/                Bento primitives (Rails / BentoRow / BentoCell)
  lib/                    the engines: dither.ts, studio-field.ts,
                          glyph-field.ts, horizon-field.ts, prismatic-field.ts,
                          directions.ts (the direction registry)
scripts/
  lint-lines.mjs          the line auditor (see docs/SHIP-LOOP.md)
  lint-practices.mjs      the practices ratchet (+ baseline JSON)
  shoot-route.mjs         screenshot harness (external playwright-core)
```

## The direction registry

`src/lib/directions.ts` is the single source of truth for what exists:
sixteen directions, three of them full site pairs (`site: true`):
**singularity-dossier**, **singularity-orbit**, **singularity-signal**.
The index, the presenter, and the sitemaps all map over `DIRECTIONS` —
add or remove a direction there and everything follows. When a direction
is deleted, also sweep `scripts/lint-practices.baseline.json` for its
paths and re-check stated counts (index funnel, layout description,
craft intro).

## The SSOT rule

`src/app/d/toolchain/` is the single source of truth for the `tc-*`
vocabulary. The fork homes (chroma-flow, dither-field, aurora-paper,
glyph-rain, prism-light, lens-gate, paper-foundry, terminus-board,
wide-rule, event-horizon, hourglass, singularity…) import toolchain's
sections and diagrams directly and re-skin by **root-class rescoping**:
each fork carries a root class (`.lensgate-root`, `.terminusboard-root`, …)
and copies only the CSS it must re-scope.

- Never edit toolchain's files as part of fork work; change the SSOT only
  when the change is meant for every consumer.
- Some forks still carry frozen local copies of toolchain diagrams from an
  earlier era. They are dead unless a fork section imports them (the one
  live exception historically: `glyph-rain/diagrams/lang/*`). Before adding
  a new copy, don't: import the SSOT and rescope CSS.
- The singularity-* homes are toolchain-based (`toolchain-root sgXh-root`)
  and pull shared v0 sections from `src/app/d/_v0/`; their `/enterprise`
  pages are singularity-based. The nav's enterprise link is retargeted
  post-hydration by `EnterpriseNavRebase` — never edit toolchain's TopNav.

## Componentized instruments

The signature pieces live as libraries, not page code (each has a live
plate + API snippet on `/craft`):

| module | what it is |
| --- | --- |
| `src/lib/horizon-field.ts` | WebGL lensing black hole |
| `src/lib/glyph-field.ts` | canvas glyph rain (drift, copy modes, matter-conserving morphs) |
| `src/components/shared/PrismaticField.tsx` | the chroma wash |
| `src/lib/dither.ts` | CPU 1-bit Bayer field renderer + field factories |
| `src/lib/studio-field.ts` | GPU Bayer family — `BAYER_PRESETS` roster |
| `src/app/d/toolchain/diagrams/iso.ts` | the isometric kit (boxes, prisms, plane, markPath) |
| `src/app/d/toolchain/diagrams/DitheredMark.tsx` | masked logo + Bayer shimmer |
| `src/components/shared/diagrams/DoubledLine.tsx` | the two-thread stroke (two-tone capable) |
| `src/app/d/toolchain/diagrams/EdgeGlobe.tsx` | the delivery globe |
| `src/app/d/toolchain/components/LocaleTag.tsx` | the locale pill |
| `src/app/d/toolchain/sections/RevealSeam.tsx` | the slide-to-reveal seam |
| `src/components/shared/EverySentence.tsx` | the sentence-rewriting morph |

When a page needs one of these behaviors, mount the component — do not
re-implement it locally. When an engine gains an option, update its craft
entry (body + snippet) in the same round.

## Skills and docs

- `BRAND.md` — the identity canon (the basement-facing brand book; served at /docs/brand and /brand).
- `DESIGN.md` — the visual canon (this repo's law book).
- `docs/SHIP-LOOP.md` — the verify/ship procedure every round runs.
- `docs/LIBRARIES.md` — the library index (defers to `/craft` for depth).
- Agent guidance lives in `.agents/skills/gt-redesign` (umbrella) plus the
  focused `redesign-*` skills, symlinked into `.claude/skills/`.

## The mirror

`src/` (minus `/app/review`) and `public/` rsync to the public
`Prototemplate` repo, which must `pnpm build` green after every round.
Root docs (`BRAND.md`, `DESIGN.md`, `ARCHITECTURE.md`, `README.md`,
`docs/`) are copied alongside — see `docs/SHIP-LOOP.md` for the exact
sequence.
