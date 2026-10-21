# Adding to Prototemplate, file by file

These are the checklists behind section 6 of the skill. Paths are relative to `$PROTOTEMPLATE`. Each list ends with `pnpm lint:registries`, which prints the registries that still miss the new entry.

## A page on the shell

1. **Write the route.** Create `src/app/<route>/page.tsx` as the server page. It builds its head with `const route = seoRoute({ path, title, kind, description })` (`src/lib/seo/route.ts`; a description of 50 to 160 characters), exports `metadata = route.metadata`, renders `<JsonLd nodes={route.jsonLd} />`, reads the data from disk, and renders the viewer. Create `src/app/<route>/<Name>Viewer.tsx` as the client viewer with `ViewerShell` and the stage (`references/shell.md`). The route's stylesheet sits beside them, and only the viewer imports it. It reads the tokens in `src/components/viewer/tokens.css` and declares no family, no feature list, no weight above 500 and no raw color.
2. **Add the surface row.** In `src/lib/surfaces.ts`, add `internal('<id>', '<Name>', '/<route>', '<one sentence>', 'Pages' | 'Knowledge', thumb('<id>'))` to `PAGES` or `KNOWLEDGE`. Pages holds the site's own views in Kevin's order (gallery, brand, docs, deck, presenter, compare). Knowledge holds what the hub keeps (skills, marks, blog, graphics, motion, archive). The id is the thumbnail stem, the preview id and the key every other registry uses. The description spells out General Translation, because the panel never prints the letters GT.
3. **Give it an icon and search words.** Add the id to `PAGE_ICON` in `src/components/viewer/Sidebar.tsx` and to `PAGE_ICON` and `PAGE_KEYWORDS` in `src/lib/search-index.ts`. The icon is a name from `src/components/viewer/icons.tsx`. A new glyph is copied verbatim from the Heroicons 20 solid set (the `heroicons` dev dependency holds it at `node_modules/heroicons/20/solid/<name>.svg`) into `icons.tsx`, with its Heroicons name in the comment above it, and only when something imports it. Raise `EMPTY_PER_GROUP` (Pages 6, Knowledge 3) when the empty palette should show the new row.
4. **Nest the page's sections.** Every section the page owns sets `under: '<id>'`. Each item carries `href` to its own page, or `inPlace: true` when the page's book scrolls to it.
5. **Date it.** Add its paths to `scripts/build/updated.mjs` and run `pnpm build:updated`: the sitemap lists every dated page with its last commit as `lastmod`, and `/llms.txt` lists the Pages and Knowledge rows from `surfaces.ts`.
6. **Update the prose that lists routes.** Edit the "What is here" list in `README.md`, and `SITE_DESCRIPTION` in `src/lib/seo/site.ts` when the hub's scope changes.
7. **Capture it.** Tag its row (step 8) with `capture`. With the dev server on 3005, run `pnpm capture:pages --only <id>`, then `pnpm build:thumbs`, which uses `sips` and `cwebp` (`brew install webp`) and runs on macOS. Commit `public/shots/pages/<id>-light.jpg`, `public/shots/pages/<id>-dark.jpg`, `public/shots/thumb/<id>.webp` and `public/shots/thumb/<id>-dark.webp`.
8. **Put it under the gates.** Add `{ id: '<id>', path: '/<route>', tools: 'check live lines capture', source: ['src/app/<route>'] }` to `siteRoutes()` in `scripts/lib/site-pages.mjs`, with the tools that should walk it: `check` (the page check), `live` (the live lints), `lines` (`lint:lines:shell`, which reads list, index and search unless its `STATES` names others) and `capture`. A page off the shell also names its ready selector in `scripts/check/pagecheck/pages.mjs`. Then run the gates in section 9 of the skill on the new route.
9. **Update the canon.** A page that adds a rule or a code area adds it to `DESIGN.md` or `ARCHITECTURE.md` in the same change.

A page outside the shell (`/blog`, `/present`) still takes steps 2, 3, 5 and 6 and the page check. `/present` is the full-screen presenter with its own chrome in `src/app/present/`, and its `directions.ts` leaves Signal out on Kevin's 2026-09-09 directive and keeps the first 16 of the rest (2026-10-08), one list for the viewer, the contact sheet and the verdict. `/blog` renders `content/blog` with the landing's MDX components (`src/app/blog/mdx-components.tsx`).

## A docs page

1. **Write the file.** `content/docs/<slug>.mdx` with a `title`, a `description` of 50 to 160 characters (the head's description and the card's text) and an optional `icon` from the list in `src/lib/source.ts`. Write it to `gt-voice` for a reader who has never seen the hub, and check every count, port and path against `package.json` and the registries.
2. **Place it.** Add the slug to `content/docs/meta.json` where the sidebar should show it, and its row to `DOCS_PAGES` in `src/components/docs/pages.ts` with the same title and description; `pnpm lint:registries` checks the two agree. A page in a folder (`content/docs/components/`) goes in that folder's `meta.json`, which the root lifts in with a `...components` row, and its `DOCS_PAGES` slug is its path (`components/dither`). The handbook's folder is held to the `HANDBOOK` registry instead.
3. **Date it.** `scripts/build/updated.mjs` dates every MDX file under `content/docs`, folders included, by the file, the files its include tags name and its `sources:` frontmatter list; run `pnpm build:updated`. The route, the sidebar, the search index, the Markdown twin, `/llms.txt`, the sitemap and the card follow.
4. **Mount a live plate** through `src/components/docs/demos/lazy.tsx` (`next/dynamic`), never by a direct import: fumadocs-mdx puts every page in one route, so a direct import loads the plate's code and stylesheet on every docs page. Follow each plate with a sentence that says what it shows, since the Markdown twin prints the plate as a bare tag, and list the plate's files under `sources:`.
5. **Capture the thumbnail** for the Documents row: `pnpm capture:pages --only docs-<slug>` (a folder's slash a hyphen, `docs-components-dither`), then `pnpm build:thumbs`.

`/docs/template` explains the docs site's files and adapters for a reader who wants to lift it into another project.

## A canon document

1. **Write the file.** Canon goes at the repository root (`BRAND.md`, `DESIGN.md`, `ARCHITECTURE.md`), and procedures and pipelines go in `docs/`. Open with an h1 and a lead paragraph before the first h2, then write h2 sections with h3s below them. Write a placeholder such as `/skills/<slug>` in a code span, since GitHub hides a bare `<slug>` as HTML.
2. **Register it.** Add `{ slug, file, title, blurb }` to `HANDBOOK` in `src/app/handbook/registry.ts`, after the handbook's own documents. The blurb is the page's description, so it runs 50 to 160 characters.
3. **Give it a page.** Write `content/docs/handbook/<slug>.mdx` with the entry's title and blurb as `title` and `description`, an `icon` from `src/lib/source.ts`, and the include tag `<include cwd><file></include>`, then add the slug to `content/docs/handbook/meta.json` in the registry's order. `src/lib/remark-handbook.ts` drops the file's h1 (the page prints the title) and prints raw HTML as text. To set a live plate between two sections, include the file one heading at a time (`<include cwd>DESIGN.md#6-the-isometric-family</include>`); the build fails if such a page leaves a heading out. `pnpm lint:registries` checks the title, the description, the include and the order; `pnpm build:updated` dates the page by its MDX and the file.
4. **Its links resolve themselves.** `DOC_ROUTES` in `src/components/book/links.ts` is built from the handbook registry, so a relative link from any shown document, written the way GitHub resolves it, opens `/docs/handbook/<slug>`. A link to a file the site does not show opens it on GitHub.
5. **Index its headings.** Add the document's h2s to `HANDBOOK_HEADINGS` in `src/lib/search-index.ts`, one `['<id>', '<title>']` per heading. The id is the anchor the docs page gives the heading (github-slugger, as fumadocs' remark-heading runs it): lower case, every character but a letter, a digit, a space, a hyphen or an underscore dropped, then each space to a hyphen, so `## 2. The page check` becomes `2-the-page-check` and `## 13. The svh/dvh law` becomes `13-the-svhdvh-law`. Renumbering a document's sections changes every id after the change, so the table changes in the same commit.
6. **Update the prose.** Add a row to the "Read first" table of `README.md`.
7. **Capture the thumbnail.** `capture-pages.mjs` shoots every handbook document from the registry: run `pnpm capture:pages --only handbook-<slug>`, then cut the thumbnail (`pnpm build:thumbs`).

## A handbook document

1. **Write the file** in `docs/handbook/<slug>.md`, to the same subset of Markdown, in the writing rules of `gt-voice`. Link skills as `../../skills/<slug>/SKILL.md` and other handbook pages by their file names, so the links work on GitHub and on the site.
2. **Register it.** Add `{ slug, file, title, blurb }` to `HANDBOOK` in `src/app/handbook/registry.ts`, after the last handbook document and before the canon. The search rows and the captures follow.
3. **Give it a page** in `content/docs/handbook/` and place it in that folder's `meta.json`, as a canon document's (above); its address is `/docs/handbook/<slug>`.
4. **Index its headings** in `HANDBOOK_HEADINGS` in `src/lib/search-index.ts`, with the ids the docs page gives them (above).
5. **Update the prose:** its row in `docs/handbook/README.md` and the handbook list in `AGENTS.md`.
6. **Capture its thumbnail** (`pnpm capture:pages --only handbook-<slug>`), then run `pnpm lint:registries`.

## A direction

1. Add an entry to `DIRECTIONS` in `src/lib/directions.ts` and the route under `src/app/d/<slug>/`. A fork imports `src/app/d/toolchain` and re-skins it by root-class rescoping, and it never edits toolchain's files (`ARCHITECTURE.md`, "The SSOT rule").
2. The gallery, the presenter, the sitemap, `/directions/<slug>` and the Sites and Explorations rows follow the registry.
3. Shoot its first fold in both themes to `public/shots/light/<slug>.jpg` and `public/shots/dark/<slug>.jpg` (`pnpm capture:pages --direction <slug>`), then run `pnpm build:thumbs`.
4. Keep a new direction local or on a branch until Kevin lands it ("I should be reviewing them locally", 2026-09-14).
5. To retire one, delete the route, record a full-page capture and the last commit that held its code in `src/lib/archive.ts`, prune its paths from `scripts/lint/practices.baseline.json`, and re-check every count written in prose.

## A page of the shipped site

1. Add a `page.tsx` under `src/app/d/production/<path>/`. Dynamic segments are not pages of their own.
2. Add a `[path, name, description]` row to `SHIPPED_PAGES` in `src/lib/surfaces.ts`, in the live site's navigation order.
3. `scripts/lib/site-pages.mjs` finds the page, so `capture:pages` and the page check pick it up under the id `production-<segments joined by ->`. Run `pnpm capture:pages --only <id>` and `pnpm build:thumbs`.
4. The plate pages (`signin`, `onboarding`, `consent`, `device`, `cli`) mount `src/components/plate`, which the onboarding session owns. `?state=<id>` opens a state, and `?chrome=0` hides the console and the corner.

## A skill

1. Write `skills/<slug>/SKILL.md` to the frontmatter and body contract in section 10 of the skill (`references/skills.md`): `metadata.owner`, a body under 24,000 bytes, and `references/sources.md` citing every line. Scripts go in `scripts/` with their header and an offline test.
2. Run `pnpm lint:registries`, which checks the contract.
3. Add the skill's row to README.md's Skills table, add its slug to `ORDER` in `scripts/build/skills.mjs` at its place in the area, and run `pnpm build:skills`, which checks the contract and regenerates `src/lib/skills.ts`. Commit the folder, the table and the registry together.
4. Run the installer for the repository's own agent folders, `node scripts/skills/install.mjs <slug> --project . --dry-run`, then without `--dry-run` (section 10).
5. Check that every lint, document and skill the new skill names exists under that name.

## A film or a still

- The Videos session makes films in `motion/`. `pnpm build:motion` reads `motion/MOTION.md` and `motion/films/<slug>/BRIEF.md` and writes `src/lib/motion.ts` and `public/motion/<slug>.md`, and it never writes into `motion/`. A film plays on the site only through a web copy in `public/media` made by hand: `<name>-film.mp4` with the moov atom at the front, and `<name>-poster.jpg` at 1920 by 1080, both listed in `public/media/README.md`.
- Stills come from the `graphics/` toolchain (`gt-graphics`), and `/graphics` reads `graphics/build/manifest.json` through `src/lib/graphics.ts`. Dithered artifact pictures follow `docs/ARTIFACT-PICTURES.md` and the picture lint (`gt-dither`).
