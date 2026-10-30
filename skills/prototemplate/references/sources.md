# Sources

Provenance for `prototemplate`. The first list is the skill's sources as written on 2026-10-08. The second cites each line added or moved on 2026-10-10 (Prototemplate system v2, lane L3) with its memory note, transcript or inventory row (the system v2 working folder outside the repository, `inventory/<sweep>.json`, item index) and its date.

## Sources as of 2026-10-08

- Prototemplate: `README.md`; `ARCHITECTURE.md`; `DESIGN.md` sections 2, 4, 15 and 16; `docs/SHIP-LOOP.md` sections 0 to 7; `package.json`; `next.config.ts`; `tsconfig.json`; `.claude/launch.json`; `src/app/layout.tsx`; `src/app/sitemap.ts`; `public/llms.txt`; `src/components/viewer/ViewerShell.tsx`, `Sidebar.tsx`, `BookView.tsx`, `Sheet.tsx`, `useShellKeys.ts`, `icons.tsx` and `tokens.css`; `src/lib/shell-data.ts`, `surfaces.ts`, `search-index.ts`, `fonts.ts` and `brand-fonts.ts`; `src/app/docs/registry.ts` and `markdown.tsx`; `src/app/skills/model.ts` and `[slug]/body.ts`; `src/app/brand/brand-sections.ts`; `scripts/lib/site-pages.mjs`, `capture-pages.mjs`, `build/skills.mjs`, `build/motion.mjs`, `build/deck.mjs`, `build/thumbs.mjs`, `build/speed-marks.mjs`, `lint/lines.mjs` (`shellRoutes()`, `EXEC`), `lint/type.mjs` (`ALLOW_FILES`), `pagecheck/pages.mjs` and `pagecheck/pagecheck.mjs`; `graphics/README.md`; `LICENSE`; all read 2026-10-05 on `speed-marks` at 2a8453c with the round's uncommitted changes.
- The 2026-10-05 round: the specification for the page heads, the one Inter and the sidebar nesting, the skills storage plan, and the skills evidence (Skill calls, SKILL.md reads and edits, and prompts by area, July 5 to October 5).
- gt-cloud: the branches `redesign/diagram-standard` (`apps/redesign`) and `k/artifact-picture-standard`, and `.agents/skills` on origin/main, read 2026-10-05.
- Claude memory notes: prototemplate-interface-system, prototemplate-deploy-policy, explorations-stay-local, session-lanes-prototemplate, ship-loop-hard-gates, prototemplate-hub-skills, prototemplate-plate-port, page-check-system, redesign-presenter-app, plain-technical-english, sentence-order-rules.
- The 2026-10-05 and 2026-10-06 head rounds: page names, the head's panel, the radius law and the book page standard (DESIGN.md sections 2 and 4, `scripts/lint/radius.mjs`, `scripts/lint/heads.mjs`, `scripts/build/updated.mjs`).
- Keeping the hub current: Kevin's messages of 2026-08-04, 2026-08-10, 2026-08-14, 2026-08-19, 2026-08-24 to 2026-08-27, 2026-09-09, 2026-09-18, 2026-09-24 and 2026-10-01.
- Kevin's directives: 2026-09-08 (the deck's viewer as the frame for the site; border colors and no double borders); 2026-09-09 (the Pages order; the presenter without Signal); 2026-09-14 (explorations reviewed locally); 2026-10-03 (one session per lane); 2026-10-05 (Prototemplate as his hub and wiki, the curated skills, the correct Rasmus Inter, sections under their page row, rounded controls in square shells); 2026-10-06 (one book page on every route).
- Incidents: 2026-08-07 and 2026-08-11 (broken builds pushed through a `;` and a pipe); 2026-10-01 (b56e64c swept `motion/` onto main).
## Added or moved on 2026-10-10

| Line | Where | Source |
| --- | --- | --- |
| Sections 1, 2, 3, 4, 5, 7 and 10 moved to `references/hub.md`, `chrome.md`, `registries.md`, `build-scripts.md` and `skills.md` unchanged; SKILL.md keeps each rule in short form under the 24,000-byte budget | SKILL.md, references | the 2026-10-08 text of SKILL.md; system v2 plan section 2.2 (2026-10-10) |
| The wedged 3005 server: the half-written prerender manifest, the restart recipe, the 64 GB `.next/dev`, the 900-second image-optimizer hang, the fast-forward of the shared checkout | SKILL.md section 8, checklist | memory prototemplate-dev-server-traps (gt-cloud project, written 2026-10-09 in this session after a 47-commit fast-forward); inventory memories item 1 and skills item 2 (the conflict with "Never stop or restart the dev server on 3005") |
| The port transform, its traps and the fork rules | `references/porting.md`, SKILL.md section 6 | memory redesign-fork-architecture (gt-cloud project; fork conventions of 2026-07-30 to 2026-08-01, the Dossier enterprise port of 2026-08-13 and its sync recipe of 2026-08-14); plan row N-6 |
| The copy is recorded in `scripts/lint/copies.json`; the plate port is frozen | `references/porting.md` | system v2 plan items C10 to C12 and decision K5 (2026-10-10) |
| `metadata.owner` and its three values | SKILL.md section 10, `references/skills.md` | system v2 plan section 2.2; inventory skills item 41 (2026-10-10) |
| The body budget of 24,000 bytes; trimming moves a rule and never deletes it | SKILL.md section 10, `references/skills.md` | system v2 plan section 2.2 and gate 5.2; inventory skills item 42 (bodies measured 2026-10-10) |
| `## Sources` as a pointer to `references/sources.md` with every added line cited | SKILL.md section 10, `references/skills.md` | system v2 plan principle P2 and section 2.2; inventory skills item 42 |
| Supporting file types `.md .mjs .json .py .sh .txt .js`, the last four served as text | SKILL.md section 10, `references/skills.md` | `scripts/build/skills.mjs` (`SUPPORT`) and the raw route, as of origin/main 39ce9645 (2026-10-10); plan item C23 |
| Script headers (`Requires:`, `Last real run:`) and offline tests in `pnpm test:skill-scripts` | SKILL.md section 10, `references/skills.md` | system v2 plan section 2.2 and item C24; `scripts/skills/script-tests.mjs` on origin/main (2026-10-10) |
| Kept by use; `pnpm skills:usage` and the thirty-day review | SKILL.md section 10, `references/skills.md` | system v2 plan principle P2 and item C15 (2026-10-10) |
| gt-cloud install with `.git/info/exclude` lines; a gt-cloud worktree needs its own links | `references/skills.md` | system v2 decision K1 (Kevin, 2026-10-10); the onboarding session's reply of 2026-10-10 |
| `pnpm lint:static` and `PT_BASE` in the gates | SKILL.md sections 7 and 9 | `package.json` on origin/main 39ce9645 (2026-10-10) |
| `pnpm run doctor` in the setup line | SKILL.md intro | `package.json` on origin/main 39ce9645 (2026-10-10) |

## Added or changed on 2026-10-15

| Line | Where | Source |
| --- | --- | --- |
| `/docs` is the docs site (fumadocs, outside the shell); the canon is served in the handbook; the old `/docs/<slug>` addresses redirect | SKILL.md sections 1, 3 and 6; `references/hub.md`; `references/adding.md` | Kevin's request and decisions of 2026-10-14 (the SEO and docs plan, sections 3 and 7) |
| The registries list: `HANDBOOK` with the canon, `DOCS_PAGES` with `meta.json`, `src/components/book/links.ts`, `seoRoute()`; the sitemap and `/llms.txt` generated | SKILL.md section 4, `references/registries.md` | the SEO and docs plan, sections 2.3, 2.6 and 4.4 (2026-10-14); `src/app/sitemap.ts` and `src/app/llms.txt/route.ts` on branch k/seo-2-docs (2026-10-15) |
| Adding a docs page and a canon document | SKILL.md section 6, `references/adding.md` | the plan, section 3.4 and step 4.4.6 (2026-10-14); `scripts/lint/registries.mjs` on k/seo-2-docs (2026-10-15) |
| A new page's head comes from `seoRoute()` and its sitemap date from `scripts/build/updated.mjs` | `references/adding.md` | the plan, sections 2.1 and 2.3 (2026-10-14) |

## Added or changed on 2026-10-20

| Line | Where | Source |
| --- | --- | --- |
| The handbook is a section of the docs site at `/docs/handbook`, each page including its repository file; `/handbook` and its documents redirect there | SKILL.md section 1, `references/hub.md`, `references/registries.md` | Kevin's request of 2026-10-20 to put the handbook into the docs; the decisions log row of 2026-10-20 |
| The Components section at `/docs/components` and the blog globe rounds live on `/docs/blog-globe` | SKILL.md section 1, `references/hub.md` | Kevin's request of 2026-10-20 for the globes and more components in the docs |
| Adding a docs page in a folder, the `sources:` frontmatter, plates through `src/components/docs/demos/lazy.tsx` | SKILL.md section 6, `references/adding.md` | `scripts/build/updated.mjs`, `scripts/lint/registries.mjs` and `content/docs/` on branch docs/blog-globe-directions (2026-10-20) |
| A canon or handbook document gets its page in `content/docs/handbook/`; a page that includes by headings lists every heading; heading ids are github-slugger's | SKILL.md section 6, `references/adding.md` | `src/lib/remark-handbook.ts` and `scripts/lint/registries.mjs` on branch docs/blog-globe-directions (2026-10-20) |

## Added or changed on 2026-10-21

| Line | Where | Source |
| --- | --- | --- |
| A docs page goes in a tab's folder or a `(group)` folder, which adds no URL segment, and its slug in that folder's `meta.json` | SKILL.md section 6 | Kevin's request of 2026-10-21 to organize the docs; `content/docs/meta.json` and the five tab folders' `meta.json` files on branch docs/organize (2026-10-21); `urlSlug()` and `metaOrder()` in `scripts/lint/registries.mjs` and `docsRoute()` in `scripts/build/updated.mjs` on the same branch |
| A canon document's page lives in `content/docs/(guide)/handbook/`, the canon in its `(canon)` folder group and a handbook document in `(process)` or `(reference)` | SKILL.md section 6, `references/adding.md`, `references/hub.md`, `references/registries.md` | the handbook folder's `meta.json` and its `(canon)`, `(process)` and `(reference)` groups on branch docs/organize (2026-10-21) |
| The five tabs (`(guide)`, `components`, `craft`, `engineering`, `(internals)`), each a folder whose `meta.json` sets `"root": true`; a root folder lists its `index` first and any other folder leaves `index` out; a new folder group's `meta.json`; `lint:registries` follows every `meta.json` from the root; the `DOCS_PAGES` slug is the URL after `/docs/` | `references/adding.md` (a docs page, steps 1 and 2), `references/registries.md` | `content/docs/**/meta.json` and the header of `src/components/docs/pages.ts` on branch docs/organize (2026-10-21); `metaOrder()` in `scripts/lint/registries.mjs` (2026-10-21) |
| `/docs` in five tabs, with the blog globe figure at `/docs/components/blog-globe` | `references/hub.md` | `content/docs/meta.json` and `content/docs/components/(drawings)/meta.json` on branch docs/organize; the `/docs/blog-globe` redirect in `next.config.ts` (2026-10-21) |

## Added or changed on 2026-10-26

| Line | Where | Source |
| --- | --- | --- |
| `/blog` and `/blog/<slug>` run on the viewer shell, the posts and the changelog under Knowledge > Blog; a new post is its file, its authors, `pnpm build:blog` and `pnpm build:updated` | SKILL.md section 3, `references/chrome.md`, `references/hub.md`, `references/adding.md` | Kevin's request of 2026-10-26 to present the blog like the other Knowledge pages and port the newer blog work; `src/app/blog/`, `scripts/build/blog.mjs` on branch k/blog-knowledge (2026-10-26) |

## Added or changed on 2026-10-30

| Line | Where | Source |
| --- | --- | --- |
| `/marks` holds the two production marks in the head, the shortlist, then every family by the idea it draws, read from the catalog and `SHORTLIST` in `src/lib/marks.ts`, with `pnpm import:marks` | `references/hub.md` | Kevin's request of 2026-10-30 to consolidate the marks and order the page better; the marks upgrade plan of the same day, kept outside the repository |
