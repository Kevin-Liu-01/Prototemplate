# The hub: routes, documents and the repository map

Detail for sections 1 and 2 of `prototemplate`, moved from SKILL.md on 2026-10-10 with no rule removed. Paths are relative to `$PROTOTEMPLATE`.

## What the hub holds

| route | holds | source |
| --- | --- | --- |
| `/` | the design lab: every direction as an article (Book), one live exhibit at a time (Live) or a grid, with the anatomy wall and the capabilities ledger | `src/app/page.tsx`, `src/app/GalleryViewer.tsx`, `src/lib/directions.ts` |
| `/brand` | the brand book in ten sections | `src/app/brand/`, `brand-sections.ts`, `BRAND.md` |
| `/docs`, `/docs/<slug>` | the repository documents as one book, with the build log under the readme; `/craft` redirects here | `src/app/docs/registry.ts`, `src/app/craft/CraftArticle.tsx` |
| `/deck` | the brand deck in its own viewer: `public/brand-deck.html` itself, through a rewrite in `next.config.ts` | `deck/`, `pnpm build:deck` |
| `/skills`, `/skills/<slug>` | the curated GT skills by area, each page with its body, files and install line; the raw files at `/skills/<slug>/SKILL.md` and `/skills/index.json` | `skills/<slug>/`, the generated `src/lib/skills.ts`, `src/app/skills/` |
| `/handbook`, `/handbook/<slug>` | the handbook as one book: operating principles, the quality bar, the multi-session playbook, the product map, the glossary and the decisions log, opened by its readme | `docs/handbook/`, `src/app/handbook/registry.ts`, rendered by the docs shell (`src/app/docs/DocsShell.tsx`) |
| `/marks` | the GT mark explorations: the speed set of seven and the two survivors of the earlier round | `src/lib/marks.ts`, `public/marks/`, `pnpm build:marks` |
| `/blog`, `/blog/<slug>` | the docs-redesign series as published, outside the shell | `content/blog/`, `src/lib/blog.ts` |
| `/graphics` | every illustration of the series, by area | `graphics/build/manifest.json`, `src/lib/graphics.ts` |
| `/motion`, `/motion/<slug>` | the film roster and each research package of the translation series, with each published cut's contact sheet and script | the generated `src/lib/motion.ts`, `public/motion/<slug>.md`, `public/motion/published.json`, `public/motion/sheets` and `public/motion/scripts` |
| `/compare` | two directions side by side in scroll-synced same-origin frames | `src/app/compare/` |
| `/present` | the full-screen presenter with its own chrome | `src/app/present/` |
| `/directions/<slug>` | each site and exploration on the shell: the summary, the captures and a live frame | `src/app/directions/` |
| `/archive/<slug>` | each retired direction as a full-page capture, with the commit that last held its code | `src/lib/archive.ts` |
| `/d/<slug>` | the directions themselves, self-contained, with their own type; `DirectionCorner` floats over them and `?chrome=0` hides it; its list, index panel and preview layer (`CornerLayers.tsx`) load as their own chunk on the first reach for the corner | `src/app/d/` |
| `/d/production/...` | the shipped site rebuilt page for page, with the dashboard's sign-in and onboarding states (`signin`, `onboarding`, `consent`, `device`, `cli`; `?state=<id>` opens a state) | `src/app/d/production/`, `src/components/plate/` |

There is no `/archive` index page; the Archive row opens the first retired version.

| document | holds |
| --- | --- |
| `AGENTS.md` | the agent entry point: what the hub is, the house rules, where the skills and the handbook are, and how to import them (`CLAUDE.md` points to it) |
| `docs/handbook/` | how Kevin works at GT: the operating principles, the multi-session playbook, the quality bar, the product map, the glossary and the decisions log, indexed by its `README.md` |
| `BRAND.md` | the identity canon: the name, the idea, the character and voice, the mark, color, type, language as material |
| `DESIGN.md` | the visual canon; sections 2 (the line law and its chrome rules), 15 (the chrome exceptions) and 16 (the sidebar's rows) govern the shell |
| `ARCHITECTURE.md` | the code map: the direction registry, the toolchain source and fork rescoping, the instruments, the gallery pipeline |
| `docs/SHIP-LOOP.md` | the verify and ship procedure |
| `docs/GRAPHICS.md`, `docs/ARTIFACT-PICTURES.md`, `docs/LIBRARIES.md` | the graphics pipeline, the picture standard, the instruments index |
| `deck/DECK-GRAMMAR.md` | the deck's grammar |
| `motion/MOTION.md` | the films' brief and roster, kept by the Videos session and untracked |

Prototemplate `main` is the primary repository, and canon is edited there first. gt-cloud's `apps/redesign`, on gt-cloud's `redesign/diagram-standard` branch, is the older copy of the direction pages. Files move between the two one at a time, and no `rsync --delete` ever runs toward Prototemplate, because it would erase the routes that exist only here (`docs/SHIP-LOOP.md` section 7).

Prose in the repository drifts from the code. On 2026-10-05 `README.md` and `docs/SHIP-LOOP.md` sections 0 and 1 named port 3006, which was `apps/redesign`'s port. `README.md` and `ARCHITECTURE.md` named `.agents/skills/gt-redesign` and the `redesign-*` skills, which no longer exist. `README.md` and `public/llms.txt` said seventeen directions and 52 slides while `DIRECTIONS` held 27 entries and `deck/slides` held 93 files. Trust `package.json` and the registries, and fix the prose in the change that finds the drift.

### Keeping the hub current

Prototemplate is the living reference of GT work only while every deliverable reaches it.

1. **Same round.** Every GT design deliverable lands in Prototemplate in the round it is made: new rules (as documents, deck slides or lints), graphics, covers, OpenGraph cards, contact sheets, posts, films (through the Videos session), logos, banners and promos, the page-check system, and the sign-in and onboarding system in the Shipped group (2026-08-14, 2026-08-19, 2026-09-18, 2026-10-01). Kevin still reviews it on localhost first (section 9).
2. **Grouped by item.** A collection page shows every version of one image (dark, light, cover, social card, sheet) in one place, in the same viewer layout as the other collections (2026-09-18).
3. **The production mirror.** `/d/production` rebuilds each gt-cloud page one to one and renders it natively, with no link out to generaltranslation.com (2026-08-24, 2026-08-25). After gt-cloud PRs merge, diff main and port their fixes here so the two never drift (2026-08-10). Remove mirror pages Kevin calls wrong and bring in the pages he built (2026-09-09: "remove these terrible pages").
4. **Both copies.** When an app exists in two copies (the copy Kevin views and the copy that ships), apply the fix to both and say which copies changed (2026-08-14: "doesnt look right on prototemplate lol fix it on proto").
5. **The shared remote.** Fetch and rebase onto origin before pushing. An overlay that discards commits already on HEAD is a defect (2026-08-27: "wait on prototeamplte i think you forgot to rebase"). Confirm the Vercel build after every push and fix a failed one at once (2026-09-24; `gt-ship` section 8).
6. **The narrative.** The gallery tells the redesign in order: the directions explored, the ones that survived review, the three full site concepts, then the shipped production site as the outcome, with the earlier pages still viewable (2026-08-26: "wait this is not the control ... yes its the outcome").
7. **Brand directives** update `/brand` and BRAND.md and leave the business facts alone. The brand agency questionnaire's confidential answers stay off the site.

## The repository map

```
src/app/                 one folder per route: page.tsx (server) and a client viewer
src/app/d/               the directions; d/toolchain is the source the forks import,
                         d/_v0 holds the shared v0 sections, d/production the shipped site
src/components/viewer/   the shell: ViewerShell, Toolbar, Sidebar, Sheet, BookView,
                         Search, IndexPanel, PreviewLayer, icons.tsx, tokens.css
src/components/shared/   instruments used across pages (EverySentence, StudioField,
                         PrismaticField, diagrams/DoubledLine)
src/components/shell/    the bento primitives
src/components/plate/    the port of the dashboard's sign-in and onboarding pages
src/lib/                 registries (surfaces, search-index, shell-data, directions,
                         archive, marks, graphics), generated data (skills.ts,
                         motion.ts), engines (dither, studio-field, glyph-field,
                         horizon-field, prismatic-field), fonts.ts, brand-fonts.ts,
                         use-mount-effect.ts
scripts/                 build, capture and lint scripts, pagecheck/, oxlint-plugins/
deck/                    the deck source: parts/head.html, slides/NN-*.html, parts/tail.html
graphics/                the blog illustration toolchain
content/                 the blog posts and their authors
motion/                  the films, untracked, owned by the Videos session
skills/<slug>/           the curated GT skills, the canonical copy
public/                  fonts/, shots/, marks/, media/, brand-deck.html, deck-assets/, llms.txt,
                         skills/, motion/
docs/                    the documents, with handbook/, harness/, research/ and reference/
AGENTS.md, CLAUDE.md     the agent entry point and its pointer
```

- `next.config.ts` sets `typescript.ignoreBuildErrors: true`, so `pnpm build` never type-checks. `tsc` is a gate of its own.
- `next.config.ts` also holds the `/deck` rewrite to `public/brand-deck.html` (with `X-Robots-Tag: noindex` on the file's own address, so only `/deck` is indexed), the cache headers for public files (a day fresh plus a week of stale-while-revalidate for `/shots`, `/media`, `/static`, `/graphics`, `/brand` and `/fonts`; a year, immutable, for the hashed `/deck-assets`), the permanent redirects (`/skills/<slug>.md`, and `/craft` to `/docs`), and `outputFileTracingExcludes` for the prerendered routes that read files through computed paths (`/`, `/docs`, `/handbook`, `/motion`, `/marks`, `/graphics`). A route that turns dynamic must stop reading an excluded path.
- `tsconfig.json` includes `**/*.ts`, so a `.ts` file under `skills/` would be type-checked. Skill helpers are `.mjs`.
- `src/app/d/**` holds self-contained explorations with their own type and colors. The shell's rules do not reach it. The type lint also skips the files its `ALLOW_FILES` list names: `/d/`, `/present` (a type specimen), the plate, the craft demos, `src/components/try`, the shared components only the directions mount, and the unmounted reference components (`StorySection`, `FeatureBento`, `LanguageWheel`).
