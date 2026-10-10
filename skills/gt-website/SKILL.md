---
name: gt-website
description: >-
  How generaltranslation.com is built and changed in gt-cloud's apps/landing:
  the app map, the engine CSS and the shared packages, translation in the
  site code, the Fumadocs docs and their agent-readable twins, the blog and its
  content submodule, the pages with rules of their own, crawlers, deploys and
  performance traps, the routing matrix, gt-next in other sites, and the
  checks before a pull request. Use when working on any page, doc, blog
  post, route or build of the GT website, together with gt-cloud's own
  gt-landing skill, which owns the file map.
metadata:
  title: GT website
  areas: website
  updated: 2026-10-10
  origin: prototemplate
  owner: O
---

# GT website

General Translation (GT) is an internationalization platform for developers: open-source SDKs (`gt-next`, `gt-react` and others), the `gt` CLI, AI translation, the Locadex coding agent and CDN delivery of translations (as `/llms.txt` on the site describes it). Its website, generaltranslation.com, is the Next.js app in `apps/landing` of the private gt-cloud monorepo (`generaltranslation/gt-cloud`). It serves the marketing pages, the documentation on Fumadocs and the blog, and Vercel deploys it from gt-cloud's main branch. This skill records how Kevin builds and changes it: where each part lives, the rules each part follows, the traps met in 2026, and the checks a change passes before its pull request.

Paths that start with `src/`, `public/`, `scripts/` or `__tests__/` are inside `$GT_CLOUD/apps/landing`. Other paths are relative to a gt-cloud checkout (`$GT_CLOUD`, which is `~/gt/gt-cloud` on Kevin's machine), and files at the gt-cloud root carry the prefix, as in `$GT_CLOUD/scripts/deploy-landing.sh`. `content:` marks the public `generaltranslation/content` repository and `$PROTOTEMPLATE` a Prototemplate checkout. Detail sits in references: [docs.md](references/docs.md) for the documentation site and its routing, [blog.md](references/blog.md) for posts and their components, [pages.md](references/pages.md) for the pages with rules of their own, [footer-and-theme.md](references/footer-and-theme.md), [deploys.md](references/deploys.md), and [gt-next-integration.md](references/gt-next-integration.md) for `gt-next` in other sites. `scripts/routing-matrix.sh` checks the routing cases in `references/routing-cases.txt`. This skill is owned by the New Onboarding and Dashboard session, which reviews each change to it.

## 1. The site

- `apps/landing` is an App Router app with every page under `src/app/[locale]`:
  - `(home)` holds the marketing routes: the home page, `pricing`, `enterprise`, `careers`, `contact`, `legal`, `report-card` and `supported-locales`. Its `layout.tsx` wraps them in the shared `Header` with `footer={false}` and appends `SiteFooterMount`.
  - `blog` holds the index and `blog/[slug]`.
  - `docs/[variant]/[...slug]` holds the documentation.
- Machine routes sit at the app root (`src/app/`): `robots.ts`, `sitemap.ts`, `sitemap.md`, `AGENTS.md`, `agent-prompt.md`, `rss.xml`, `openapi.json` and `openapi.yaml`, `locales.json`, `docs/platform/openapi/llms-full.txt`, and the social image handlers `api/og` and `api/og-home`. The `llms*.txt` family and the markdown twins are per locale under `src/app/[locale]/`.
- Docs pages, blog posts and authors come from the `apps/landing/content` submodule, the public `generaltranslation/content` repository. Legal pages come from the pinned, shallow `apps/landing/legal` submodule.
- gt-cloud's `.agents/skills/gt-landing/SKILL.md` and its `references/design.md` own the file map: the home page's bands, the editing map, the section recipe and the landing rules. Read both before editing `apps/landing`, with `CLAUDE.md` at the gt-cloud root for the repository's code style. For UI work also load gt-cloud's `gt-ui`, `react-best-practices` and `react-useeffect`; for new shader art `glyphfield`; for comments `code-comments`; for tests `gt-testing`.
- Versions on main (2026-10-05): `next` 16.2.12, pinned in the landing's own `package.json` while the workspace catalog carries 16.3.8; React 19.2; Tailwind 4; `fumadocs-ui` 16.2.0 in the landing and 16.0.10 in `packages/ui`, whose `DocsLayout` the docs render; `next-mdx-remote` 6 for the blog; `pagefind` 1.5.2.
- The design rules for pages (one `Cta` for every button, Title Case labels, section heads as a heading and one lead paragraph, Heroicons solid for meaning and Lucide for controls, Inter as the only face) are in the gt-landing-pages skill and gt-cloud's gt-landing skill.

## 2. Working in gt-cloud

### Worktrees and dev servers

- Each branch gets its own worktree off origin/main (named `~/gt/gt-cloud-wt-<topic>` on branch `k/<topic>`) and its own dev server. The gt-ship skill holds the branch and worktree rules.
- A fresh worktree needs `apps/landing/.env.local` copied from the main checkout, `pnpm install --frozen-lockfile`, and `pnpm turbo run build --filter="landing^..."` to build the workspace packages the landing imports. Without that build the app cannot resolve `@generaltranslation/settings/cookies.js`, whose export points at `dist/`. Run `pnpm --dir apps/landing exec next typegen` before the first `tsc`.
- The dev server runs from an entry in the primary checkout's `.claude/launch.json` (untracked, local to Kevin's machine) with a port of its own: `APP_NODE_ENV=development pnpm --dir <worktree>/apps/landing exec next dev --turbopack --port <port>`. `.claude/skills` beside it is tracked (links to `.agents/skills`), so never delete a worktree's whole `.claude` folder; `git checkout -- .claude` restores it. `pnpm dev` uses port 3001 and regenerates the framework variant manifest first. The root answers 307 to the locale path, so poll with `curl -L`.
- After merging main into a branch, run `pnpm install --frozen-lockfile` and restart the dev server before judging routes. On 2026-09-24 a dependency missing from a worktree made every docs page 404 with nothing in the log.
- Stop a server with `kill $(lsof -ti tcp:<port> -sTCP:LISTEN)`. Without `-sTCP:LISTEN` the command also kills the browser that holds a connection to the port.
- `next dev` can keep serving stale `_next/image` variants after a source image changes. `rm -rf .next` and a restart clear them.
- `pnpm-workspace.yaml` sets `minimumReleaseAge: 2880`, so `pnpm add` can fail on an unrelated recent bump. Add the dependency to `package.json`, run `pnpm install --config.minimumReleaseAge=0`, keep only the lockfile lines the change needs, and confirm with `pnpm install --frozen-lockfile`. Restart any dev server that ran during the relink; it fails with "Can't resolve 'gt-next/link'" until then.

### The shared packages

- The header is `Header` from `packages/ui/src/components/frame/NewHeader.tsx`, used by the `(home)` and blog layouts and the locale `not-found.tsx`. A header destination goes in both `items` (the mobile menu) and `columns` (the desktop dropdown), because each platform reads one of them. Search, the language selector and the theme toggle sit in the same `frame` folder.
- Shared UI comes from `@generaltranslation/ui/components/ui/`. Flags render through `LocaleFlag`. The pricing components and the dollar formatter live in `packages/ui/src/components/pricing/`.

### The engine

- `src/components/landing/shell/engine.css` scopes the site grammar and its `--tc-*` tokens under `.toolchain-root`, with dark values under `[data-theme='dark'] .toolchain-root`. `src/app/globals.css` exposes the tokens to Tailwind as the `tc-*` utilities (`text-tc-ink-2`, `border-tc-hair`, `bg-tc-card`, `px-tc-gut`, `font-tc-mono`).
- The page grammar built on the engine lives in the gt-landing-pages skill and gt-landing's `references/design.md`: the token values, the unlayered heading and paragraph resets that beat Tailwind utilities, the one-rail law and the Tailwind 4 `text-[length:var(--x)]` form.
- The `--tc-*` tokens exist only inside `.toolchain-root`. A development page outside the site layouts imports `engine.css` and `src/components/landing/home/v0-pages.css` itself, and `src/components/blog/blog.css` for blog parts.
- Turbopack can serve one layout's CSS chunk to other routes. On 2026-09-25, on the `k/docs-perf` branch (#4815, open on 2026-10-10), a font face that blog CSS joined to `inter` was fetched by the home page. Scope a route's rules under its root class (`.blog-root`), and give a route-only face a family name that only that route's CSS uses.

### Tailwind 4 build traps

A bracketed utility in a code comment can break the CSS build, and a plain `@theme` token no utility uses is dropped; both are in [references/deploys.md](references/deploys.md).

### Looking at pages

- The desktop app's Browser pane reports `document.hidden` and pauses `requestAnimationFrame`, so canvas fields render blank there. Use its JavaScript for measurements and `playwright-core` from the gt-cloud pnpm store for pixels.
- `next dev` never prefetches `<Link>`, so a pending navigation lasts longer in development than in production.

## 3. Translation in the code

- `gt-next` provides runtime translation. Finished UI strings live in `ui.<locale>.json` at the app root (`ui.en-US.json`). Inline copy is acceptable while the copy is still being shaped.
- The component rules (one `<T>` per static block with `<Var>`, `<Num>`, `<Currency>`, `<DateTime>` and the branch components for dynamic parts, `gt()` for props, `msg()` for data arrays, `const gt = useGT();` and never `const { gt } = useGT()`) are in the gt-components skill and gt-cloud's `CLAUDE.md`. On the landing, `.oxlintrc.json` turns on `gt-react/static-jsx` ("The <T> component must only have static children") and `gt-react/static-string` from `@generaltranslation/react-core-linter`.
- Every visible docs navigation label is translatable UI, including labels from `meta.json`, generated trees, separators and synthetic groups. Translate the rendered label on the server with a `gt()` string the extractor can find (the `metadataLabels` map in `src/app/[locale]/docs/layout.tsx`, read by `buildDocsPageTree` in `src/lib/docs-nav.ts`). Routes and file references stay untranslated. Each new label type gets a regression test in `__tests__/docs-tree.test.ts`.
- `gt generate` does not follow a `gt` destructured out of `Promise.all([..., getGT()])`, so those strings never reach the source table and render in English in every locale. Call `const gt = await getGT();` on its own line. In gt-cloud #5257 (open on 2026-10-10), 65 of 96 literals in 26 landing files were missing, and the en-US table grew from 739 to 799 entries.
- `gt-next`'s `Link` adds the locale to every href that starts with `/`. A link to a file at the app root (`/openapi.json`, `/sitemap.xml`, a `.md` twin) is a plain `<a>`. `gt-next` exports no router, and `useRouter().push` from Next drops the locale prefix.
- The locale roster lives in `gt.config.json` for production and `staging.gt.config.json` for the staging translate step. `next.config.ts` never gates locales on `VERCEL_ENV`: the staging pipeline runs with `VERCEL_ENV=preview`, and `gt-next` refuses an option that conflicts with the config file.
- `pnpm --dir apps/landing validate` runs `gt validate`. The deploy runs `gt translate` before it builds.
- Integrating `gt-next` into another Next.js site meets traps of its own (a conflicting config file, `next.config.mjs`, static generation, `usePathname()` behind the proxy, translated MDX); read [references/gt-next-integration.md](references/gt-next-integration.md) first.

## 4. Docs

[references/docs.md](references/docs.md) holds the full detail for this section.

- Pages are MDX in `content:docs/<locale>/` with `meta.json` per folder, loaded through `source.config.ts` and `src/lib/source.ts`, and rendered by `src/app/[locale]/docs/[variant]/[...slug]/page.tsx` inside `DocsLayout` from `packages/ui`.
- Every page has a framework variant segment: `_v-react` by default, `_v-next` (Next.js), `_v-ts` (TanStack Start) and `_v-rn` (React Native). `src/proxy.ts` picks it from the `gt-fw-pref` cookie, only for the pages that have framework tabs, so the active tab is right on first paint and the page stays a static cache hit.
- The agent-readable family (gt-cloud #4499): `/llms.txt`, `/llms-index.txt`, `/llms-full.txt`, scoped `/docs/<scope>/llms.txt`, a `.md` and `.mdx` twin of every page, `/AGENTS.md`, `/agent-prompt.md` and `/sitemap.md`. The twin route prerenders every locale with `dynamicParams = false`, because the deployed function cannot read the content submodule from disk. The proxy serves the twin to known AI user agents and to requests that accept `text/markdown`.
- `src/proxy.ts` passes `/aeo` through, then runs the unsupported-locale guard, the legacy docs redirects (`src/lib/legacy-docs-redirects.json`), the markdown rewrite, the variant rewrite, the signed-in dashboard redirect and `gtMiddleware`. A new docs rewrite sits below the guard, and every branch that returns early calls `captureAdAttribution` so an ad click id survives. The proxy matcher skips every path with a dot, so rules for `.md` URLs live in `next.config.ts` or the route.
- A `redirect()` thrown during a page render commits the layout above it first and paints an intermediate shell. Every link the site renders points at the resolved leaf page (`footer-links.test.ts` holds the footer to that).
- The docs sidebar on a 404 is the stock flat tree: "the flash is worse" (Kevin, 2026-09-10).
- Check sidebar changes on a page with a nested folder open, such as `/en-US/docs/cli/reference/commands/configure`.
- Every routing change (`src/proxy.ts`, `next.config.ts` redirects, the near-miss ladders, the legacy map) passes the routing matrix before the pull request and again on production after the deploy: `sh scripts/routing-matrix.sh --base http://localhost:<port>`, then with no `--base`. It sends one GET per case and exits with the number of failures. Routing defects reached production three times in September 2026.
- A performance pull request holds the few small changes that carry the measured win, the docs keep their italics, and PostHog loading stays as it is (Kevin, 2026-09-15 and 2026-09-25). The measurement recipes are in the reference.
- The content repository holds the writing rules for the pages (`content:DOCS-SKILL.md`) and a public authentication boundary in `content:AGENTS.md`: the docs cover API-key authentication and the CLI sign-in commands and leave out user-token internals.

## 5. The blog

[references/blog.md](references/blog.md) holds the full detail for this section.

- Posts are `content:blog/en-US/<slug>.mdx` with authors in `content:authors/`. The frontmatter names the dark cover under `images`, its light twin under `imagesLight` and the social card under `ogImages`.
- The blog compiles MDX through `next-mdx-remote` with JavaScript expressions blocked, which deletes every `prop={expression}` silently. Blog components (`Carousel` and `CarouselItem`, `HitList` and `HitItem`, `AuthorSpotlight`) take string attributes and child elements.
- A new component is registered in `src/mdx-components.tsx` and gets a simple stand-in in `content:apps/content/src/mdx-components.tsx`, or the content preview build fails.
- Images live in gt-cloud under `public/static/blogs/`: 3840 px webp illustrations and covers, a 2400 by 1260 PNG social card, GIF clips, and a `?v=YYYYMMDD-HHMM` stamp on every reference. `BlogPostCover` requests quality 95 for webp covers.
- Every deploy checks out the tip of content main (`git submodule update --init --remote` in `$GT_CLOUD/scripts/deploy-landing.sh`), and the content repository's deploy hook rebuilds the site on each merge, so merging the content pull request publishes the post. Merge the gt-cloud side first whenever the post needs a new component, new images or new redirects, and the content side second.
- The Lottie translation figure (pull request #5068, open on 2026-10-10) and the `lottie-web` canvas traps are in the reference.

## 6. Pages with rules of their own

[references/pages.md](references/pages.md) holds the full detail for this section.

- Pricing follows gt-landing-pages' whole-dollar rule (Kevin, 2026-09-10) through one formatter, `packages/ui/src/components/pricing/dollar-format.ts`.
- The hero's second button is Setup for Agents. It copies the start prompt, which lives once in the docs page `content:docs/en-US/overview/for-coding-agents.mdx` and is served raw at `/agent-prompt.md`. The prompt must work when handed to a coding agent unchanged, so every change to it, the CLI or the quickstarts is followed by an end-to-end run on a fresh app (Kevin, 2026-09-30).
- The partner credit pages under `/enterprise/contact/<partner>` share one plate layout; adding a partner touches about ten files, listed in the reference with the layout rules.
- AI features (the FAQ assistant, pull request #4885, open on 2026-10-10) call the Vercel AI Gateway with plain `provider/model` ids, rate-limit through the shared `src/lib/rate-limit.ts`, set Gemini's thinking budget to 0, and always answer, with a local fallback when the gateway refuses. The assistant stays off until `FAQ_ASSISTANT_ENABLED` is set.
- Programmatic SEO pages (round 1 on the unpushed stack `k/seo-0-kit`, `k/seo-1-nextjs`, `k/seo-2-matrix`) translate their page copy like every other page. Each language page also shows a sample table of real, unedited `gt translate` output, which reads like native product UI with correct CLDR plurals (Kevin, 2026-10-10); its rules and the plural trap are in the reference.
- `/world` (branch `k/language-map`, no pull request on 2026-10-10) is organized by language and names no country or territory. Its facts come from CLDR, Natural Earth and GT's locale data, and its artifact pictures carry no readable English (Kevin, 2026-10-03 and 2026-10-05).

## 7. Crawlers, the footer and the theme

- Every crawler and agent may read the public site: "make it so that all robots and agents can crawl us" (Kevin, 2026-08-07). `src/app/robots.ts` on main allows every user agent on `/` with `/api/` and `/private/` disallowed, lets Twitterbot fetch `/api/og` and `/api/og-home`, and names the sitemap. The staging build disallows everything, and the locale layout's metadata emits `index, follow` everywhere except staging. Never add a rule that blocks an AI crawler or a public page; a Content-Signal line is Kevin's decision.
- Known AI agents (`AI_USER_AGENTS` in `src/proxy.ts`) get the markdown twin of a docs page.
- Vercel previews send `x-robots-tag: noindex`, so Lighthouse's crawlable audit fails on a preview and passes on generaltranslation.com. Leave it.
- One footer serves the whole site through `src/components/landing/shell/SiteFooterMount.tsx`, which needs the `sgdh-root` class so the light theme reaches it; the docs have no site footer. The theme is set before first paint from the stored theme or the system preference, and `ThemeAttributeBridge` mirrors `next-themes`' class onto `data-theme`. The detail is in [references/footer-and-theme.md](references/footer-and-theme.md).

## 8. Deploys

[references/deploys.md](references/deploys.md) holds the full detail for this section.

- Vercel project `landing` in the team scope `general-translation` builds through `$GT_CLOUD/scripts/deploy-landing.sh` (content main, a filtered install, `gt translate`, `build:landing`). Git deploys run for `main` and `staging` only, plus one for each merge to content main; pull request branches get no preview.
- When deploys fail, read Vercel first (`vercel ls landing`, then `vercel inspect <url> --logs`, both with `--scope general-translation`). Production keeps serving the last good deployment, so merges stay invisible until a build passes.
- The landing's `tsconfig.json` references only packages it imports, and the landing pins `next` 16.2.12 while 16.3 retains memory per prerendered page (Kevin, 2026-10-01).
- Orphan branches fail on Vercel at once and need no action. A local production build runs without `APP_NODE_ENV=production`, and gt-cloud CI never initializes the content submodule.

## 9. Checks before a pull request

1. `pnpm --dir apps/landing lint` runs oxlint with the root `.oxlintrc.json`, `gt-ui` rules included, on the landing. The root `pnpm lint` adds the email identity check, the agent skills check (`$GT_CLOUD/scripts/check-agent-skills.mjs`, added in gt-cloud #5145 on 2026-10-05, which checks each `.agents/skills` skill's frontmatter, the files its links and path spans name, and its `.claude/skills` link) and `oxfmt --check .` over the whole repository; format changed files with `pnpm exec oxfmt <files>`.
2. `pnpm --dir apps/landing test`, or `pnpm --dir apps/landing exec vitest run <path>` for one area. Band decisions (hrefs, tracking slugs, data tables) are exported constants tested in `src/components/landing/sections/__tests__/`; routes, the sitemap, the docs and the proxy are tested in `__tests__/`.
3. `pnpm --dir apps/landing exec tsc --noEmit` (after `next typegen` in a fresh worktree). The landing's `typescript` is the `catalog:ts6` alias of the JS compiler, which `next build` needs; the packages use the native v7 compiler (gt-cloud `CLAUDE.md`).
4. `pnpm --dir apps/landing validate` when `<T>`, `gt()` or `msg()` strings change.
5. A production build when routes, `next.config.ts`, fonts or prerendering change.
6. The changed pages on the worktree's dev server in both themes, at desktop and phone widths. Take tight before and after crops for the pull request body from the first push onward (Kevin, 2026-09-25).
7. Then the gt-lints skill for the repository and voice lints and the gt-ship skill for the pull request: the conventional title and the Linear rule, its body and screenshots, the review bots, the commit identity and the size check (`git diff --numstat origin/main...HEAD`).

## Review checklist

- [ ] The page passes gt-landing-pages' checklist (tokens, one rail, `Cta`, icon tiers, Inter) and gt-components' translation rules, and docs labels translate on the server.
- [ ] Links the site renders point at leaf pages, and links to root files bypass `gt-next`'s `Link`.
- [ ] A new docs rewrite in `src/proxy.ts` sits below the unsupported-locale guard, and rules for dotted paths live in `next.config.ts` or the route.
- [ ] Markdown twins, `llms*.txt` routes and the machine-only anchors still render for the changed pages.
- [ ] Blog components take string attributes and children, and each new one has a stand-in in the content preview app.
- [ ] Every blog asset reference carries a fresh `?v=` stamp and returns 200.
- [ ] The merge order is gt-cloud first, content second, whenever the post needs anything from gt-cloud.
- [ ] `robots.ts` still lets every crawler reach every public page.
- [ ] New routes in the `(home)` or blog groups get the site footer through `SiteFooterMount` and the theme through the root layout.
- [ ] The landing's `tsconfig.json` references only packages the landing imports, and `next` stays on 16.2.x until 16.3's prerender memory is fixed.
- [ ] Lint, tests, `tsc`, `gt validate` and, where needed, a production build pass, and the pull request body shows crops in both themes.

## Related skills

General skills from Kevin's wiki: agent-browser (pages, screenshots and measurements), design-engineering-polish (the final visual pass), create-graphics (diagrams for posts outside the graphics toolchain). In this set: gt-landing-pages (page and section conventions), gt-components (shared UI), gt-voice (copy, alt text and post prose), gt-graphics (blog illustrations and covers), gt-dither (dithered fields and artifact pictures), gt-lints and gt-ship. In gt-cloud: gt-landing, gt-ui, glyphfield, code-comments, gt-testing, react-useeffect.

## Sources

Dated provenance for every rule, script and number in this skill is in [references/sources.md](references/sources.md).
