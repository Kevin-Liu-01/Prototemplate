# Registries that move together

Detail for section 4 of `prototemplate`, moved from SKILL.md on 2026-10-10 with no rule removed. `pnpm lint:registries` checks most of it.

A page, a document or a skill appears in several hand-kept lists. A change updates every list that names it in the same commit.

| registry | holds | read by |
| --- | --- | --- |
| `src/lib/surfaces.ts` | every place on the site (`SITE_SURFACES`: Pages, Knowledge, Shipped, Documents, Sites, Explorations, Archive, Libraries, Brand sections) and every public place the brand is live (`PUBLIC_SURFACES`); the id is also the thumbnail stem | the sidebar's site map, the index panel, the preview layer, the search |
| `src/lib/search-index.ts` | the Cmd K list: the surfaces, a row per skill, per film and per handbook document, `DOC_HEADINGS` and `HANDBOOK_HEADINGS` (every h2 of every document), `DECK_SLIDES` (the 93 slide titles), `PAGE_ICON`, `PAGE_KEYWORDS`, `EMPTY_PER_GROUP` | `Search.tsx`, which loads it as its own chunk on the palette's first open or on a hover or focus of a trigger |
| `src/app/docs/registry.ts` (`DOCS`) and `src/app/handbook/registry.ts` (`HANDBOOK`) | the documents /docs serves and the handbook documents /handbook serves: slug, file, title, blurb | the two book routes, the Documents rows, the search's Handbook rows, the sitemap, `capture-pages.mjs`, `build/updated.mjs` |
| `src/lib/page-names.ts` (`PAGE_NAMES`) | each page's plain name and its short sidebar label | the book heads, the window titles, the Pages and Knowledge rows |
| `scripts/build/updated.mjs` (`pages()`) | the paths whose last commit dates each book head | `pnpm build:updated` writes `src/lib/updated.ts`; `pnpm lint:updated` and the build check it |
| `src/app/docs/links.ts` (`DOC_ROUTES`, `siteHref`) | where a repository path opens on the site, built from both registries | the docs renderer, the skill pages |
| `src/lib/directions.ts` (`DIRECTIONS`) | every direction | the gallery, the presenter (the first 16, without Signal, through `src/app/present/directions.ts`), the sitemap, `/directions`, the Sites and Explorations rows |
| `src/lib/archive.ts` (`ARCHIVE`) | the retired directions | `/archive/<slug>`, the sitemap, the Archive rows |
| `src/app/sitemap.ts` | a static list of routes plus loops over the registries | crawlers |
| `public/llms.txt` | the hub described for agents, written by hand | agents |
| `src/app/layout.tsx` | the site description, the keywords and the Open Graph text | every page's metadata |
| `scripts/lib/site-pages.mjs` (`siteRoutes()`) | every route a browser tool walks, each row tagged with its tools (`check`, `live`, `lines`, `capture`), and the device table | `pnpm check:pages`, `pnpm lint:lines:shell`, the live lints, `pnpm capture:pages` (then `pnpm build:thumbs`) |

- `src/lib/skills.ts` and `src/lib/motion.ts` are generated. Edit their sources and rerun `pnpm build:skills` or `pnpm build:motion`.
- `scripts/lib/site-pages.mjs` finds a first slug by regex for every browser tool: `id: '` after `export const SKILLS` in `skills.ts`, the first quoted string after `export const MOTION_PACKAGE_SLUGS` in `motion.ts`, `entry('` in `archive.ts`, the first `slug: '` after `export const DOCS`, the first `DIRECTIONS` entry without `site: true` (`firstExplorationSlug`) and the newest post in `content/blog`. A generator that changes its output shape breaks every browser gate.
- `DOC_HEADINGS`, `HANDBOOK_HEADINGS` and `DECK_SLIDES` are snapshots. A document that gains or renames an h2 updates its table in the same change; `pnpm lint:registries` reports the drift.
- The live domain is www.prototemplate.com. `SITE_URL` in `layout.tsx` and `sitemap.ts` still names prototemplate.vercel.app, which is the personal project's alias, and every link in `llms.txt` names it too.

`pnpm lint:registries` checks the headings, the route lists, the first-slug regexes and the skill contract. It exits 1 on a hard failure and prints the softer gaps as notes.
