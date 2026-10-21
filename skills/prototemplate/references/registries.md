# Registries that move together

Detail for section 4 of `prototemplate`, moved from SKILL.md on 2026-10-10 with no rule removed. `pnpm lint:registries` checks most of it.

A page, a document or a skill appears in several hand-kept lists. A change updates every list that names it in the same commit.

| registry | holds | read by |
| --- | --- | --- |
| `src/lib/surfaces.ts` | every place on the site (`SITE_SURFACES`: Pages, Knowledge, Shipped, Documents, Sites, Explorations, Archive, Libraries, Brand sections) and every public place the brand is live (`PUBLIC_SURFACES`); the id is also the thumbnail stem | the sidebar's site map, the index panel, the preview layer, the search |
| `src/lib/search-index.ts` | the Cmd K list: the surfaces (the docs pages outside the handbook among them), a row per skill, per film and per handbook document, `HANDBOOK_HEADINGS` (every h2 of every handbook document and the canon as the docs pages slug it, the build log's sections under `libraries`, which the libraries page's table of contents also reads), `DECK_SLIDES` (the 93 slide titles), `PAGE_ICON`, `PAGE_KEYWORDS`, `EMPTY_PER_GROUP` | `Search.tsx`, which loads it as its own chunk on the palette's first open or on a hover or focus of a trigger |
| `src/app/handbook/registry.ts` (`HANDBOOK`) | the documents the handbook section of `/docs` shows, the handbook's own then the canon: slug, file, title, blurb (the page's description, 50 to 160 characters) | the docs page's GitHub link, the search's Handbook rows, `links.ts`, `capture-pages.mjs`; `pnpm lint:registries` holds `content/docs/handbook/` (titles, descriptions, include tags, order) to it |
| `content/docs/meta.json` and `src/components/docs/pages.ts` (`DOCS_PAGES`) | the docs site's pages in sidebar order, a `...folder` row lifting a folder's own `meta.json` in; `DOCS_PAGES` repeats each page's title and description outside the handbook, its slug the path (`components/dither`), for the modules that cannot read MDX | the docs routes (through `src/lib/source.ts`), the Documents rows, `capture-pages.mjs`; `pnpm lint:registries` checks the two agree |
| `src/lib/page-names.ts` (`PAGE_NAMES`) | each page's plain name and its short sidebar label | the book heads, the window titles, the Pages and Knowledge rows |
| `scripts/build/updated.mjs` (`pages()`) | the paths whose last commit dates each book head and each docs page (a docs page by its MDX, its include tags' files and its `sources:` frontmatter) | `pnpm build:updated` writes `src/lib/updated.ts`; `pnpm lint:updated` and the build check it |
| `src/components/book/links.ts` (`DOC_ROUTES`, `siteHref`) | where a repository path opens on the site, built from the handbook registry | `src/lib/remark-handbook.ts` (the handbook pages' links), the skill pages, the Markdown twins, `/AGENTS.md` |
| `src/lib/directions.ts` (`DIRECTIONS`) | every direction | the gallery, the presenter (the first 16, without Signal, through `src/app/present/directions.ts`), the sitemap, `/directions`, the Sites and Explorations rows |
| `src/lib/archive.ts` (`ARCHIVE`) | the retired directions | `/archive/<slug>`, the sitemap, the Archive rows |
| `src/app/sitemap.ts` | the singleton routes, every key of `src/lib/updated.ts` (the docs pages and the handbook among them) and the archive, filtered by `policyFor` | crawlers |
| `src/app/llms.txt/route.ts` | the hub described for agents, generated from the registries above | agents |
| `src/lib/seo/` | `seoRoute()`, the policy, the JSON-LD and the card; every route's head | every page's metadata |
| `scripts/lib/site-pages.mjs` (`siteRoutes()`) | every route a browser tool walks, each row tagged with its tools (`check`, `live`, `lines`, `capture`), and the device table | `pnpm check:pages`, `pnpm lint:lines:shell`, the live lints, `pnpm capture:pages` (then `pnpm build:thumbs`) |

- `src/lib/skills.ts` and `src/lib/motion.ts` are generated. Edit their sources and rerun `pnpm build:skills` or `pnpm build:motion`.
- `scripts/lib/site-pages.mjs` finds a first slug by regex for every browser tool: `id: '` after `export const SKILLS` in `skills.ts`, the first quoted string after `export const MOTION_PACKAGE_SLUGS` in `motion.ts`, `entry('` in `archive.ts`, the first `DIRECTIONS` entry without `site: true` (`firstExplorationSlug`) and the newest post in `content/blog`. A generator that changes its output shape breaks every browser gate.
- `HANDBOOK_HEADINGS` and `DECK_SLIDES` are snapshots. A document that gains or renames an h2 updates its table in the same change; `pnpm lint:registries` reports the drift.
- The live domain is www.prototemplate.com. `SITE_URL` lives in `src/lib/seo/policy.ts`, and only that file and the archive's capture record may spell the two aliases (`pnpm lint:seo`, S5).

`pnpm lint:registries` checks the headings, the route lists, the first-slug regexes and the skill contract. It exits 1 on a hard failure and prints the softer gaps as notes.
