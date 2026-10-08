# Adding to Prototemplate, file by file

These are the checklists behind section 6 of the skill. Paths are relative to `$PROTOTEMPLATE`. Each list ends with `node skills/prototemplate/scripts/check-registries.mjs`, which prints the registries that still miss the new entry.

## A page on the shell

1. **Write the route.** Create `src/app/<route>/page.tsx` as the server page. It exports `metadata` with a `title`, a one-sentence `description` and `icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] }`, reads the data from disk, and renders the viewer. Create `src/app/<route>/<Name>Viewer.tsx` as the client viewer with `ViewerShell` and the stage (`references/shell.md`). The route's stylesheet sits beside them, and only the viewer imports it. It reads the tokens in `src/components/viewer/tokens.css` and declares no family, no feature list, no weight above 500 and no raw color.
2. **Add the surface row.** In `src/lib/surfaces.ts`, add `internal('<id>', '<Name>', '/<route>', '<one sentence>', 'Pages' | 'Knowledge', thumb('<id>'))` to `PAGES` or `KNOWLEDGE`. Pages holds the site's own views in Kevin's order (gallery, brand, docs, deck, presenter, compare). Knowledge holds what the hub keeps (skills, marks, blog, graphics, motion, archive). The id is the thumbnail stem, the preview id and the key every other registry uses. The description spells out General Translation, because the panel never prints the letters GT.
3. **Give it an icon and search words.** Add the id to `PAGE_ICON` in `src/components/viewer/Sidebar.tsx` and to `PAGE_ICON` and `PAGE_KEYWORDS` in `src/lib/search-index.ts`. The icon is a name from `src/components/viewer/icons.tsx`. A new glyph is copied verbatim from the Heroicons 20 solid set (the `heroicons` dev dependency holds it at `node_modules/heroicons/20/solid/<name>.svg`) into `icons.tsx`, with its Heroicons name in the comment above it, and only when something imports it. Raise `EMPTY_PER_GROUP` (Pages 6, Knowledge 3) when the empty palette should show the new row.
4. **Nest the page's sections.** Every section the page owns sets `under: '<id>'`. Each item carries `href` to its own page, or `inPlace: true` when the page's book scrolls to it.
5. **List it in the sitemap.** Add a line to the static list in `src/app/sitemap.ts`. A dynamic route adds a loop over its registry, as the docs, skills, packages, posts, directions and archive do.
6. **Update the prose that lists routes.** Edit `public/llms.txt` (Routes) and the "What is here" list in `README.md`. Edit the description and keywords in `src/app/layout.tsx` when the hub's scope changes.
7. **Capture it.** Add `['<id>', '/<route>']` to the `routes` list in `targets()` of `scripts/capture-pages.mjs`. With the dev server on 3005, run `pnpm capture:pages --only <id>`, then `pnpm build:thumbs`, which uses `sips` and runs on macOS. Commit `public/shots/pages/<id>-light.jpg`, `public/shots/pages/<id>-dark.jpg`, `public/shots/thumb/<id>.jpg` and `public/shots/thumb/<id>-dark.jpg`.
8. **Put it under the gates.** Add `{ id: '<id>', path: '/<route>', source: ['src/app/<route>'] }` to `pages()` in `scripts/pagecheck/pages.mjs`. For a shell route, add `{ path: '/<route>', states: ['list', 'index', 'search'] }` to `shellRoutes()` in `scripts/lint-lines.mjs` and to its usage comment. Then run the gates in section 9 of the skill on the new route.
9. **Update the canon.** A page that adds a rule or a code area adds it to `DESIGN.md` or `ARCHITECTURE.md` in the same change.

A page outside the shell (`/blog`, `/present`) still takes steps 2, 3, 5 and 6 and the page check. `/present` is the full-screen presenter with its own chrome in `src/app/present/`, and its `directions.ts` leaves Signal out on Kevin's 2026-09-09 directive. `/blog` renders `content/blog` with the landing's MDX components (`src/app/blog/mdx-components.tsx`).

## A document

1. **Write the file.** Canon goes at the repository root (`BRAND.md`, `DESIGN.md`, `ARCHITECTURE.md`), and procedures and pipelines go in `docs/`. Open with an h1 and a lead paragraph before the first h2, which the book shows as the lead, then write h2 sections with h3s below them. The renderer in `src/app/docs/markdown.tsx` reads headings, paragraphs, lists, tables, fenced code, inline code, bold, links and rules, and nothing else. It passes plain text through `gtText`, so a standalone GT renders as the mark.
2. **Register it.** Add `{ slug, file, title, blurb }` to `DOCS` in `src/app/docs/registry.ts`. The route, the Documents rows in `surfaces.ts`, the sitemap and `build-updated.mjs` follow from that entry.
3. **Its links resolve themselves.** `DOC_ROUTES` in `src/app/docs/links.ts` is built from both book registries, so a relative link from any rendered document, written the way GitHub resolves it, opens `/docs/<slug>`. A link to a file the site does not render opens it on GitHub.
4. **Index its headings.** Add the document's h2s to `DOC_HEADINGS` in `src/lib/search-index.ts`, one `['<id>', '<title>']` per heading. The id follows `headingId`: lower case, `&` to "and", apostrophes dropped, and every other run of characters to one hyphen, so `## 2. The page check` becomes `2-the-page-check`. Renumbering a document's sections changes every id after the change, so the table changes in the same commit.
5. **Update the prose.** Add a line to the Documents list of `public/llms.txt` and a row to the "Read first" table of `README.md`.
6. **Capture the thumbnail.** `capture-pages.mjs` shoots every document of both books from their registries: run `pnpm capture:pages --only docs-<slug>`, then cut the thumbnail (`pnpm build:thumbs`, or its `sips` line for the one stem).

## A handbook document

1. **Write the file** in `docs/handbook/<slug>.md`, to the same subset of Markdown, in the writing rules of `gt-voice`. Link skills as `../../skills/<slug>/SKILL.md` and other handbook pages by their file names, so the links work on GitHub and on the site.
2. **Register it.** Add `{ slug, file, title, blurb }` to `HANDBOOK` in `src/app/handbook/registry.ts`. The route `/handbook/<slug>`, the run under Knowledge > Handbook, the search rows, the sitemap and `build-updated.mjs` follow.
3. **Index its headings** in `HANDBOOK_HEADINGS` in `src/lib/search-index.ts`, with the same ids as `DOC_HEADINGS`.
4. **Update the prose:** its row in `docs/handbook/README.md`, the handbook list in `AGENTS.md`, and a line in the Handbook section of `public/llms.txt`.
5. **Capture its thumbnail** (`pnpm capture:pages --only handbook-<slug>`), then run `node skills/prototemplate/scripts/check-registries.mjs`.

## A direction

1. Add an entry to `DIRECTIONS` in `src/lib/directions.ts` and the route under `src/app/d/<slug>/`. A fork imports `src/app/d/toolchain` and re-skins it by root-class rescoping, and it never edits toolchain's files (`ARCHITECTURE.md`, "The SSOT rule").
2. The gallery, the presenter, the sitemap, `/directions/<slug>` and the Sites and Explorations rows follow the registry.
3. Shoot its first fold in both themes to `public/shots/light/<slug>.jpg` and `public/shots/dark/<slug>.jpg` (`docs/harness/shoot-one.mjs <slug> public/shots`; `gt-explorations` gives its caveats), then run `pnpm build:thumbs`.
4. Keep a new direction local or on a branch until Kevin lands it ("I should be reviewing them locally", 2026-09-14).
5. To retire one, delete the route, record a full-page capture and the last commit that held its code in `src/lib/archive.ts`, prune its paths from `scripts/lint-practices.baseline.json`, and re-check every count written in prose.

## A page of the shipped site

1. Add a `page.tsx` under `src/app/d/production/<path>/`. Dynamic segments are not pages of their own.
2. Add a `[path, name, description]` row to `SHIPPED_PAGES` in `src/lib/surfaces.ts`, in the live site's navigation order.
3. `scripts/site-pages.mjs` finds the page, so `capture:pages` and the page check pick it up under the id `production-<segments joined by ->`. Run `pnpm capture:pages --only <id>` and `pnpm build:thumbs`.
4. The plate pages (`signin`, `onboarding`, `consent`, `device`, `cli`) mount `src/components/plate`, which the onboarding session owns. `?state=<id>` opens a state, and `?chrome=0` hides the console and the corner.

## A skill

1. Write `skills/<slug>/SKILL.md` to the frontmatter and body contract in section 10 of the skill, with `references/*.md`, `scripts/*.mjs` or `assets/` beside it.
2. Run `node skills/prototemplate/scripts/check-registries.mjs`, which checks the contract.
3. Add the skill's row to README.md's Skills table, add its slug to `ORDER` in `scripts/build-skills.mjs` at its place in the area, and run `pnpm build:skills`, which checks the contract and regenerates `src/lib/skills.ts`. Commit the folder, the table and the registry together.
4. Run the installer for the repository's own agent folders, `node scripts/install-skills.mjs <slug> --project . --dry-run`, then without `--dry-run` (section 10).
5. Check that every lint, document and skill the new skill names exists under that name.

## A film or a still

- The Videos session makes films in `motion/`. `pnpm build:motion` reads `motion/MOTION.md` and `motion/films/<slug>/BRIEF.md` and writes `src/lib/motion.ts` and `public/motion/<slug>.md`, and it never writes into `motion/`. A film plays on the site only through a web copy in `public/media` made by hand: `<name>-film.mp4` with the moov atom at the front, and `<name>-poster.jpg` at 1920 by 1080, both listed in `public/media/README.md`.
- Stills come from the `graphics/` toolchain (`gt-graphics`), and `/graphics` reads `graphics/build/manifest.json` through `src/lib/graphics.ts`. Dithered artifact pictures follow `docs/ARTIFACT-PICTURES.md` and the picture lint (`gt-dither`).
