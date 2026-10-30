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
                          singularity-* homes; the shipped site keeps its
                          own copies and imports translate-window.css
    d/production/         generaltranslation.com as it shipped, rebuilt
                          page for page, with the plate pages
    directions/           /directions/<slug>: each direction as a book
                          page, with its live frame (DirectionFrame)
    archive/[slug]/       the retired directions, kept as captures
                          (src/lib/archive.ts)
    compare/              /compare: two directions in synced frames
    present/              the presenter deck (intro, prototypes, scoreboard)
    brand/                /brand: the brand book
    docs/                 /docs: the docs site, fumadocs' notebook layout
                          outside the viewer shell; layout.tsx, the one
                          page route [[...slug]] over content/docs (MDX,
                          read through src/lib/source.ts and
                          source.config.ts) and docs.css, the adapters
                          to the site's tokens
    handbook/             registry.ts, the handbook's registry: its own
                          documents and the canon, which the docs pages
                          under /docs/handbook show
    md/, llms.txt/,       the agent files: the Markdown twins of every
    llms-full.txt/,       docs page, the handbook's included (reached at
    AGENTS.md/            a page's address plus .md), /llms.txt,
                          /llms-full.txt and /AGENTS.md, generated from
                          the registries
    api/search/           the docs site's static search index
    craft/                the build log after docs/LIBRARIES.md on
                          /docs/handbook/libraries: laws, auditors and
                          live library plates (libraries.ts); /craft
                          redirects there
    skills/               /skills, /skills/<slug> and the raw skill files
    marks/                /marks: the mark explorations
    blog/                 the blog on the viewer shell: the posts (content/blog)
                          rendered with the landing site's MDX components, and
                          the changelog (src/lib/blog-posts.ts, generated)
    graphics/             the illustration catalogue, read from
                          graphics/build/manifest.json
    motion/               /motion and /motion/<slug>, from src/lib/motion.ts
    api/try/fetch/        a runtime function, behind the shipped /try
    sign-in/, api/auth/   /sign-in and its route: an access key from
                          PROTOTEMPLATE_ACCESS_KEYS opens the locked areas
                          (LOCKED in src/lib/seo/policy.ts) for 30 days;
                          src/lib/access.ts holds the checks, and src/proxy.ts
                          and each locked route run them
    raise/[[...path]]/    a locked area: its files, streamed from the
                          locked areas' private Blob store, which
                          scripts/locked/sync.mjs fills
    prototemplate.css     the pt grammar (index + craft chrome)
    globals.css           the four color tokens, the reset, the scrollbar,
                          the plate theme import and Tailwind's sources
  components/
    viewer/               the viewer shell every route except /deck,
                          /present, /blog, /docs and /d runs on: ViewerShell,
                          Sidebar, Toolbar, Sheet, BookView, GridView,
                          IndexPanel, Search, PreviewLayer, tokens.css
    shared/               cross-page instruments: EverySentence, StudioField,
                          PrismaticField, HeroFieldSwitcher, TcMobileNav,
                          diagrams/ (DoubledLine and the older line-art
                          set); FeatureBento, StorySection and the
                          line-art diagrams are unmounted references
    blog/                 the blog's MDX components (PostAuthors, PostCover,
                          Carousel, AuthorSpotlight and the figures)
    try/                  the report card the shipped /try page mounts
    book/                 book.tsx (reads a repository file on the
                          server), model.ts (the handbook's addresses),
                          markdown.tsx and links.ts (the renderer the
                          skills and motion pages use, and where a
                          repository path opens on the site)
    docs/                 the docs site's parts: the sidebar footer, the
                          theme button, the page actions, the sidebar
                          motion copied from gt-cloud, pages.ts (the
                          pages outside the handbook as the hub's
                          registries list them) and demos/, the live
                          plates the Components pages and the handbook
                          mount, each loaded through demos/lazy.tsx
    blog-globe/           the blog globe figures on /docs/components/blog-globe, each
                          a frame of its round's route under
                          src/app/d/blog-globe
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
                          and updated.ts (build/updated.mjs; server modules
                          only) with page-updated.ts (its type); the hooks:
                          use-mount-effect.ts and use-layout-work.ts
                          (dependency layout effects with useGSAP's timing,
                          without GSAP)
scripts/                  pnpm names are the interface; every entry point
                          takes --help, and docs/TOOLS.md lists every
                          command and script
  lib/root.mjs            the repository root every script resolves from
  lib/args.mjs            option(): the value after a flag, for every script
  lib/site-pages.mjs      page discovery, the theme door, PT_BASE and the
                          Chrome the browser scripts share
  lib/help.mjs            --help: prints a script's opening comment
  build/deck.mjs          deck/ to public/brand-deck.html and
                          public/shots/deck (pnpm build:deck); next.config.ts
                          rewrites /deck to the built file
  build/thumbs.mjs        the 640x360 previews in public/shots/thumb, cut
                          from the captures under public/shots
  build/skills.mjs        skills/ to src/lib/skills.ts and skills/README.md,
                          with the skill contract and lint (pnpm
                          build:skills; --check is pnpm lint:skills)
  build/updated.mjs       git to src/lib/updated.ts, the day each book page
                          last changed for its head's Updated row
                          (pnpm build:updated; --check is pnpm
                          lint:updated, in the build), with its tests
  build/speed-marks.mjs   the speed marks under public/marks
  build/subset-inter.py   the Inter roman and italic to unicode-range
                          subsets in public/fonts/inter, their faces in
                          src/app/inter-subsets.css and the latin range in
                          src/lib/fonts.ts (pnpm build:inter)
  build/motion.mjs        motion/ to src/lib/motion.ts and public/motion,
                          run only when the Videos session hands a film over
  check/capture-pages.mjs the 1440x900 page captures in public/shots/pages
                          that build/thumbs.mjs cuts
  check/gallery-shoot.mjs the anatomy wall's tiles (see "The gallery
                          pipeline")
  check/pagecheck/        the page check: every page at ten viewports in
                          both themes, layout shifts, interactions, a
                          report (pnpm check:pages; its README explains)
  lint/lines.mjs          the line auditor (see docs/SHIP-LOOP.md)
  lint/practices.mjs      the practices ratchet (+ baseline JSON)
  lint/type.mjs           the type lint: one Inter through the tokens,
                          static (lint:type, in the build) and --live
                          (lint:type:live), with its ratchet baseline
                          type.baseline.json and its tests
  lint/radius.mjs         the radius lint: rounded controls, square shells,
                          every corner through the six --pt-radius-<role>
                          tokens, static (lint:radius, in the build) and
                          --live (lint:radius:live), with its tests
  lint/heads.mjs          the book page lint: one head, one band, one
                          divider grammar on every book, static
                          (lint:heads, in the build) and --live
                          (lint:heads:live), with its tests
  lint/pictures.mjs       the artifact picture standard
                          (docs/ARTIFACT-PICTURES.md), in the build
  lint/shell.mjs          token discipline for the shell layer
  lint/registries.mjs     registry drift: headings, route lists, first
                          slugs, the skill contract (pnpm lint:registries)
  lint/oxlint-plugins/    the gt-ui rules pnpm lint:code runs
  media/mood-tone/        the artifact picture cutter and standard.json
  skills/install.mjs      links or copies skills/<slug> into a project's
                          .claude/skills and .agents/skills (pnpm
                          skills:install; its tests: install.test.mjs,
                          pnpm test:skills)
docs/
  handbook/               how Kevin runs GT work, served at /docs/handbook:
                          the operating principles, the quality bar, the
                          multi-session playbook, the product map, the
                          glossary and the decisions log, with README.md
  research/, reference/, reference-shots/, composites/
                          the exploration archive the skills cite;
                          nothing here is served
  archive/                finished round specs kept as history, with a
                          README naming each one; nothing here is served
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
                          pnpm skills:install --project .
motion/                   the films, untracked, owned by the Videos session
AGENTS.md                 the agent entry point (CLAUDE.md imports it);
                          served at /docs/handbook/agents and raw at
                          /AGENTS.md
content/docs/             the docs site's MDX pages, one folder per tab,
                          each with its meta.json: (guide)/ with
                          handbook/ (a page per handbook and canon file),
                          components/ (the live component library),
                          craft/, engineering/ and (internals)/; a folder
                          group (name) adds no URL segment
```

## The direction registry

`src/lib/directions.ts` is the single source of truth for what exists:
twenty-seven directions, four of them full site pairs (`site: true`):
**singularity-dossier**, **singularity-orbit**, **singularity-signal** and
**production**, the shipped site. singularity-dossier is the completed
concept; signal and orbit keep their own heroes and carry the
previous-generation sections the dossier retired, as exploration
showcases. The index and the sitemap map over `DIRECTIONS`, and the
presenter walks its first 16 without Signal
(`src/app/present/directions.ts`), so adding or removing a direction there
updates all three. When a direction is deleted, also sweep
`scripts/lint/practices.baseline.json` for its paths, record it in
`src/lib/archive.ts`, and re-check stated counts (index funnel, layout
description, craft intro).

## The SSOT rule

`src/app/d/toolchain/` is the single source of truth for the `tc-*`
vocabulary. The twelve forks (aurora-paper, chroma-flow, dither-field,
event-horizon, glyph-rain, hourglass, lens-gate, paper-foundry,
prism-light, singularity, terminus-board, wide-rule) mount the toolchain's
sections and diagrams and re-skin them by **root-class rescoping**: each
fork carries a root class (`.lensgate-root`, `.terminusboard-root`, and so
on) and its own rescoped copies of the stylesheets, which its `page.tsx`
imports right after the section they style.

- Frameworks, DarkBand and SiteFooter take the props the forks need
  (`title`, `href`, `cursorEffects`, `backdrop`, `hrefs`); `code`,
  `stacks`, `reveal`, `RevealSeam`, the surface diagrams and `lang.ts` are
  imported as they are.
- `src/app/d/toolchain/forks/` holds the one copy of each section the forks
  share and the toolchain itself has moved past: ReviewWorkspace, Pricing,
  Story with `story/`, TopNav, Bento and the event-horizon StoryCinema.
- A fork keeps its own copy only where it really differs: aurora-paper's
  Bento, DarkBand and ReviewWorkspace; dither-field's Bento, DarkBand and
  Pricing; chroma-flow's Pricing; glyph-rain's DarkBand, `code.tsx` and
  `diagrams/lang`; paper-foundry's Bento; lens-gate's StoryCinema; the
  event-horizon, hourglass and singularity TopNavs; wide-rule's SiteFooter.
- Shared behavior lives in toolchain modules: `sections/visibility.ts`
  (loops pause off screen), `sections/every-morph.ts` (the headline
  hinge), `components/use-copied.ts` (copy controls),
  `components/NavMenu.tsx` (the nav disclosure) and
  `components/LazyPrismaticField.tsx` (fields far below the fold).
- Never edit the toolchain's files for one fork: add a prop, or change the
  toolchain only when the change is meant for every consumer.
- The singularity-* homes are toolchain-based (`toolchain-root sgXh-root`)
  and pull shared v0 sections from `src/app/d/_v0/`; their `/enterprise`
  pages are singularity-based.

## Componentized instruments

The signature pieces live as libraries, outside page code. Each has a live
plate and an API snippet in the build log on `/docs/handbook/libraries`
(`src/app/craft/libraries.ts`):

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

- **The shooter** (`scripts/check/gallery-shoot.mjs`) shoots the flagship home
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
  imported the hub (served at /docs/handbook/agents; `CLAUDE.md` imports it).
- `BRAND.md`: the identity canon (the brand book the agency reads; served at /docs/handbook/brand and /brand).
- `DESIGN.md`: the visual canon (this repo's law book).
- `docs/SHIP-LOOP.md`: the verify/ship procedure every round runs.
- `docs/LIBRARIES.md`: the library index (defers to the build log after it on `/docs/handbook/libraries` for depth).
- `docs/GRAPHICS.md`: the graphics pipeline: how the blog illustrations
  are made with `graphics/`, and the rules that came out of review.
- `docs/handbook/`: the handbook, what spans the skills (principles, the
  quality bar, the multi-session playbook, the product map, the glossary,
  the decisions log). `src/app/handbook/registry.ts` lists it with the
  canon after it (`AGENTS.md`, `BRAND.md`, `DESIGN.md`, this file, the
  ship loop, the tools, the libraries, the graphics pipeline and the
  artifact pictures), and `/docs/handbook` shows each file on a docs page
  of its own (`content/docs/(guide)/handbook/`, through fumadocs-mdx's
  include tag; `src/lib/remark-handbook.ts` drops the file's h1 and
  prints raw HTML as text). A relative link in any shown document
  resolves the way GitHub resolves it (`src/components/book/links.ts`):
  a shown document opens its page, a skill its page, any other file
  GitHub. `/handbook` and every `/handbook/<slug>` answer 308 with the
  page under `/docs/handbook`.
- `content/docs/`: the docs site, rendered at `/docs` by fumadocs
  (`source.config.ts`, `src/lib/source.ts`, `src/app/docs`,
  `src/components/docs`) in five tabs, each a folder whose `meta.json`
  sets `"root": true`: the Guide (`(guide)/`, with the handbook), the
  Components (`components/`, every instrument live with its controls,
  props and reduced-motion still, and the blog globe figure with all
  three rounds live), Craft (`craft/`), Engineering (`engineering/`) and
  Internals (`(internals)/`). A folder named in parentheses groups pages
  in the sidebar and adds no URL segment. `/docs/template` explains how
  to lift it into another project and how a page picks its tab and
  folder.
- `src/lib/seo/`: the SEO system. Every route's head comes from one
  `seoRoute()` call under the policy in `policy.ts`; `/docs/seo` explains
  it.
- `skills/<slug>/` is the one copy of each curated skill: SKILL.md with
  its frontmatter contract (name, description with "Use when", metadata
  title, areas, updated and origin), its references and scripts.
  `scripts/build/skills.mjs` validates the set and writes
  `src/lib/skills.ts` and the folder's index, `skills/README.md`;
  `/skills` and `/skills/<slug>` render it, the
  pages read each body from the folder on the server, and
  `src/app/skills/[slug]/[...path]/route.ts` serves the raw files.
- `scripts/skills/install.mjs` links or copies the set into any project
  (`--project <dir>`, `--user`, `--into <dir>`, with `--dry-run`). This
  repository's `.claude/skills` and `.agents/skills` are its relative links
  (`--project .`); README.md's Skills section has the rules.

## The mirror

Prototemplate `main` has been the only copy of this code since
2026-09-08, when gt-cloud's `apps/redesign` stopped being one, so nothing
is copied or rsynced into it from another tree (`docs/SHIP-LOOP.md`
section 7).
