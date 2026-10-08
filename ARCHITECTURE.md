# Architecture

How Prototemplate is put together, and the rules that keep its
twenty-seven directions coherent. Read `DESIGN.md` for the visual laws;
this file is the code map.

## The shape of the app

```
src/
  app/
    page.tsx              the index: the design lab (GalleryViewer), the
                          anatomy wall and the capabilities ledger
    layout.tsx            the root layout and the pre-boot theme script
    d/<slug>/             one route per direction (src/lib/directions.ts)
    d/toolchain/          THE SSOT: sections, diagrams, styles other forks import
    d/_v0/                shared v0 sections (TranslateWindow, StackTower,
                          Locadex, FullStack, Deploy) used by the
                          singularity-* homes and the shipped site
    d/production/         generaltranslation.com as it shipped, rebuilt
                          page for page, with the plate pages
    directions/           /directions/<slug>: each direction as a book
                          page, with its live frame (DirectionFrame)
    archive/[slug]/       the retired directions, kept as captures
                          (src/lib/archive.ts)
    compare/              /compare: two directions in synced frames
    present/              the presenter deck (intro, prototypes, scoreboard)
    brand/                /brand: the brand book
    deck/                 /deck: the frame around public/brand-deck.html
    docs/                 the documents book: registry.ts (the documents),
                          book.tsx (reads and renders them on the server),
                          markdown.tsx and links.ts (the renderer and where
                          a repository path opens on the site), DocsShell
                          (the shell for both books)
    handbook/             /handbook: the handbook's registry and its two
                          routes, rendered by the same DocsShell
    craft/                the build log at the end of the /docs readme:
                          laws, auditors and live library plates
                          (libraries.ts); /craft redirects to /docs
    skills/               /skills, /skills/<slug> and the raw skill files
    marks/                /marks: the mark explorations
    blog/                 the docs-redesign posts (content/blog) rendered with
                          the landing site's MDX components
    graphics/             the illustration catalogue, read from
                          graphics/build/manifest.json
    motion/               /motion and /motion/<slug>, from src/lib/motion.ts
    api/try/fetch/        the one runtime function, behind the shipped /try
    prototemplate.css     the pt grammar (index + craft chrome)
    globals.css           the four color tokens
  components/
    viewer/               the viewer shell every route except /deck,
                          /present, /blog and /d runs on: ViewerShell,
                          Sidebar, Toolbar, Sheet, BookView, GridView,
                          IndexPanel, Search, PreviewLayer, tokens.css
    shared/               cross-page instruments: EverySentence, StudioField,
                          PrismaticField, HeroFieldSwitcher, TcMobileNav,
                          diagrams/ (DoubledLine and the older line-art
                          set); FeatureBento, StorySection and
                          LanguageWheel are unmounted references
    blog/                 the blog's MDX components (PostAuthors, PostCover,
                          Carousel, AuthorSpotlight and the figures)
    try/                  the report card the shipped /try page mounts
    shell/                Bento primitives (Rails / BentoRow / BentoCell)
    plate/                the dashboard's sign-in and onboarding system
                          (frame, field, pages, fixtures) with its state
                          console, served under /d/production/{signin,
                          onboarding,consent,device,cli}
  lib/                    the registries: surfaces.ts, search-index.ts,
                          shell-data.ts, directions.ts (the direction
                          registry), archive.ts, marks.ts, page-names.ts
                          (each page's plain name); the engines: dither.ts,
                          studio-field.ts, glyph-field.ts, horizon-field.ts,
                          prismatic-field.ts; try/ (the report card's
                          checks); and the generated skills.ts, motion.ts
                          and updated.ts (build-updated.mjs; server modules
                          only) with page-updated.ts (its type)
scripts/
  build-deck.mjs          deck/ to public/brand-deck.html and
                          public/shots/deck (pnpm build:deck)
  build-thumbs.mjs        the 640x360 previews in public/shots/thumb, cut
                          from the captures under public/shots
  build-skills.mjs        skills/ to src/lib/skills.ts and skills/README.md,
                          with the skill contract and lint (pnpm
                          build:skills; --check is pnpm lint:skills)
  build-updated.mjs       git to src/lib/updated.ts, the day each book page
                          last changed for its head's Updated row
                          (pnpm build:updated; --check is pnpm
                          lint:updated, in the build), with its tests
  build-speed-marks.mjs   the speed marks under public/marks
  build-motion.mjs        motion/ to src/lib/motion.ts and public/motion,
                          run only when the Videos session hands a film over
  capture-pages.mjs       the 1440x900 page captures in public/shots/pages
                          that build-thumbs cuts
  gallery-shoot.mjs       the anatomy wall's tiles (see "The gallery
                          pipeline")
  site-pages.mjs          page discovery, the theme door and the Chrome
                          path the browser scripts share
  pagecheck/              the page check: every page at ten viewports in
                          both themes, layout shifts, interactions, a
                          report (pnpm check:pages; its README explains)
  lint-lines.mjs          the line auditor (see docs/SHIP-LOOP.md)
  lint-practices.mjs      the practices ratchet (+ baseline JSON)
  lint-type.mjs           the type lint: one Inter through the tokens,
                          static (lint:type, in the build) and --live
                          (lint:type:live), with its ratchet baseline
                          lint-type.baseline.json and its tests
  lint-radius.mjs         the radius lint: rounded controls, square shells,
                          every corner through the six --pt-radius-<role>
                          tokens, static (lint:radius, in the build) and
                          --live (lint:radius:live), with its tests
  lint-heads.mjs          the book page lint: one head, one band, one
                          divider grammar on every book, static
                          (lint:heads, in the build) and --live
                          (lint:heads:live), with its tests
  lint-pictures.mjs       the artifact picture standard
                          (docs/ARTIFACT-PICTURES.md), in the build
  lint-shell.mjs          token discipline for the shell layer
  mood-tone/              the artifact picture cutter and standard.json
  oxlint-plugins/         the gt-ui rules pnpm lint:code runs
  install-skills.mjs      links or copies skills/<slug> into a project's
                          .claude/skills and .agents/skills (its tests:
                          install-skills.test.mjs, pnpm test:skills)
docs/
  handbook/               how Kevin runs GT work, served at /handbook:
                          the operating principles, the quality bar, the
                          multi-session playbook, the product map, the
                          glossary and the decisions log, with README.md
  research/, reference/, reference-shots/, composites/
                          the exploration archive the skills cite;
                          nothing here is served
  harness/                three screenshot probes the skills and comments
                          cite: shoot-one.mjs, shoot-route.mjs and
                          rhythm-probe.mjs
deck/                     the deck source: parts/, slides/, fonts/, shots/
graphics/                 the blog-illustration toolchain (docs/GRAPHICS.md)
content/                  the three docs-redesign posts and their authors
public/                   what the site serves: brand-deck.html, shots/
                          (captures, thumbnails, the gallery tiles), brand/,
                          marks/, media/ and motion/ (films), static/
                          (blog images and avatars), fonts/, logos/
skills/                   the curated skills, one folder per skill
                          (SKILL.md, references/, scripts/); the canonical
                          copy, published on /skills
.claude/skills/, .agents/skills/
                          relative links to skills/<slug>, made by
                          install-skills.mjs --project .
motion/                   the films, untracked, owned by the Videos session
AGENTS.md                 the agent entry point (CLAUDE.md imports it);
                          served at /docs/agents
```

## The direction registry

`src/lib/directions.ts` is the single source of truth for what exists:
twenty-seven directions, four of them full site pairs (`site: true`):
**singularity-dossier**, **singularity-orbit**, **singularity-signal** and
**production**, the shipped site. singularity-dossier is the completed
concept; signal and orbit keep their own heroes and carry the
previous-generation sections the dossier retired, as exploration
showcases. The index, the presenter and the sitemap all map over
`DIRECTIONS`, so adding or removing a direction there updates all three.
When a direction is deleted, also sweep
`scripts/lint-practices.baseline.json` for its paths, record it in
`src/lib/archive.ts`, and re-check stated counts (index funnel, layout
description, craft intro).

## The SSOT rule

`src/app/d/toolchain/` is the single source of truth for the `tc-*`
vocabulary. The fork homes (chroma-flow, dither-field, aurora-paper,
glyph-rain, prism-light, lens-gate, paper-foundry, terminus-board,
wide-rule, event-horizon, hourglass, singularity and the rest) import
toolchain's sections and diagrams directly and re-skin by **root-class
rescoping**: each fork carries a root class (`.lensgate-root`,
`.terminusboard-root`, and so on) and copies only the CSS it must
re-scope.

- Never edit toolchain's files as part of fork work; change the SSOT only
  when the change is meant for every consumer.
- The frozen local copies of toolchain sections that aurora-paper and
  chroma-flow carried were deleted on 2026-10-08, since nothing imported
  them. Fork copies that remain are imported (`glyph-rain/diagrams/lang/*`
  among them). Before adding a new copy, import the SSOT and rescope CSS
  instead.
- The singularity-* homes are toolchain-based (`toolchain-root sgXh-root`)
  and pull shared v0 sections from `src/app/d/_v0/`; their `/enterprise`
  pages are singularity-based. Never edit toolchain's TopNav for one site.

## Componentized instruments

The signature pieces live as libraries, outside page code. Each has a live
plate and an API snippet in the build log at the end of the `/docs`
readme (`src/app/craft/libraries.ts`):

| module | what it is |
| --- | --- |
| `src/lib/horizon-field.ts` | WebGL lensing black hole |
| `src/lib/glyph-field.ts` | canvas glyph rain (drift, copy modes, matter-conserving morphs) |
| `src/components/shared/PrismaticField.tsx` | the chroma wash |
| `src/lib/dither.ts` | CPU 1-bit Bayer field renderer + field factories |
| `src/lib/studio-field.ts` | GPU Bayer family, the `BAYER_PRESETS` roster |
| `src/app/d/toolchain/diagrams/iso.ts` | the isometric kit (boxes, prisms, plane, markPath) |
| `src/app/d/toolchain/diagrams/DitheredMark.tsx` | masked logo + Bayer shimmer |
| `src/components/shared/diagrams/DoubledLine.tsx` | the two-thread stroke (two-tone capable) |
| `src/app/d/toolchain/diagrams/EdgeGlobe.tsx` | the delivery globe |
| `src/app/d/toolchain/components/LocaleTag.tsx` | the locale pill |
| `src/app/d/toolchain/sections/RevealSeam.tsx` | the slide-to-reveal seam |
| `src/components/shared/EverySentence.tsx` | the sentence-rewriting morph |

When a page needs one of these behaviors, mount the component and do not
re-implement it locally. When an engine gains an option, update its build
log entry (body and snippet) in the same round.

## The gallery pipeline

The index's anatomy wall is fed by one shooter, and the file names are
the contract between the two ends:

- **The shooter** (`scripts/gallery-shoot.mjs`) shoots the flagship home
  section by section across desktop and mobile cuts and both themes. It
  takes element screenshots anchored on each section's own landmark
  selector, never scroll depths, so side-by-side pairs align at any
  viewport. An `addInitScript` writes `localStorage['gt-theme']` before
  first paint, which the root inline script applies, and one full scroll
  pass settles every lazy section before the first shot. A selector that
  misses is reported and skipped.
- **The manifest**: the shooter writes `manifest.json` beside the tiles,
  `{ flagship, generatedFor, sections: [{ key, label, cut, theme, file }] }`.
  Nothing reads it today; it records what the last run shot.
- **The tile names** are what the anatomy wall (`src/app/AnatomyWall.tsx`)
  reads: `sec-<key>-<cut>-<theme>.jpg` under `public/shots/gallery/` (key
  is hero, customers, story, developer, locadex, context, global, deploy or
  footer; cut is desk or mob; theme is light or dark). The wall accepts a
  `.png` under the same stem, and a missing tile leaves hatched ground.
  The `var-*` tiles still in the folder are the retired directions' last
  dark captures; nothing renders them.
- **`/compare`** puts two directions side by side as synced same-origin
  iframes. Same origin is what lets the route drive both frames' scroll
  and theme together. `src/app/SiteCompare.tsx` is the still-image
  version: two captures under the house seam, the cut held in one CSS
  variable.

## Skills and docs

- `AGENTS.md`: the entry point for an agent, here or in a project that
  imported the hub (served at /docs/agents; `CLAUDE.md` imports it).
- `BRAND.md`: the identity canon (the basement-facing brand book; served at /docs/brand and /brand).
- `DESIGN.md`: the visual canon (this repo's law book).
- `docs/SHIP-LOOP.md`: the verify/ship procedure every round runs.
- `docs/LIBRARIES.md`: the library index (defers to the build log on `/docs` for depth).
- `docs/GRAPHICS.md`: the graphics pipeline: how the blog illustrations
  are made with `graphics/`, and the rules that came out of review.
- `docs/handbook/`: the handbook, what spans the skills (principles, the
  quality bar, the multi-session playbook, the product map, the glossary,
  the decisions log). `src/app/handbook/registry.ts` lists it and
  `/handbook` renders it through the docs shell (`src/app/docs/DocsShell.tsx`
  with `book='handbook'`). A relative link in any rendered document
  resolves the way GitHub resolves it (`src/app/docs/links.ts`): a
  rendered document opens its route, a skill its page, any other file
  GitHub.
- `skills/<slug>/` is the one copy of each curated skill: SKILL.md with
  its frontmatter contract (name, description with "Use when", metadata
  title, areas, updated and origin), its references and scripts.
  `scripts/build-skills.mjs` validates the set and writes
  `src/lib/skills.ts` and the folder's index, `skills/README.md`;
  `/skills` and `/skills/<slug>` render it, the
  pages read each body from the folder on the server, and
  `src/app/skills/[slug]/[...path]/route.ts` serves the raw files.
- `scripts/install-skills.mjs` links or copies the set into any project
  (`--project <dir>`, `--user`, `--into <dir>`, with `--dry-run`). This
  repository's `.claude/skills` and `.agents/skills` are its relative links
  (`--project .`); README.md's Skills section has the rules.

## The mirror

Prototemplate `main` is the primary repository for this code. The public
site builds and deploys from it, and the routes that exist only here
(`/docs`, `/brand`, `/deck`, `/compare`, `/present`) have no counterpart
in `apps/redesign`. `apps/redesign` in the gt-cloud monorepo is a
downstream copy of the direction pages: when a direction changes there,
the changed files are copied into Prototemplate one at a time and
`pnpm build` must pass before the commit. No bulk `rsync --delete` runs
toward Prototemplate from any tree. Root docs (`BRAND.md`, `DESIGN.md`,
`ARCHITECTURE.md`, `README.md`, `docs/`) are edited here first. See
`docs/SHIP-LOOP.md` section 7 (the mirror step) for the sequence.
