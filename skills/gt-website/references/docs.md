# The docs site

The documentation at generaltranslation.com/docs is a Fumadocs site inside `apps/landing`. The pages are MDX in the content repository; the layout, the routing and the machine-readable copies are code in gt-cloud. Paths that start with `src/`, `scripts/` or `__tests__/` are inside `$GT_CLOUD/apps/landing`, and `content:` paths are in the `generaltranslation/content` repository, checked out at `apps/landing/content`.

## Structure

- Pages live in `content:docs/<locale>/<section>/...` as `.mdx`, with a `meta.json` in each folder for order and titles. `source.config.ts` declares the fumadocs-mdx collections and `src/lib/source.ts` loads them.
- The page route is `src/app/[locale]/docs/[variant]/[...slug]/page.tsx` and the layout is `src/app/[locale]/docs/layout.tsx`.
- The layout renders `DocsLayout` from `@generaltranslation/ui/fumadocs/index` (`packages/ui`, which re-exports fumadocs-ui's notebook layout; fumadocs-core and fumadocs-ui are 16.16.1 since #5176, merged 2026-10-07) with the landing's parts from `src/components/docs/`: `SidebarMotion` (the drawn rail, pill and thumb), `SidebarActiveScroll`, `DocsControls`, `DocsSidebarFooter` (Dashboard, Changelog, GitHub and Contact us; the Changelog is the blog) and `DocsFrameworkProvider`. The page route renders `DocsPageActions` (the Copy page menu).
- `/docs` and `/<locale>/docs` redirect to `/docs/overview/get-started` in `next.config.ts`.
- `resolvePageOrSuggest` in the page route follows the `resolveDocsPath` ladder in `src/lib/slug-suggest.ts`: a near miss that resolves redirects to its page, a folder root redirects to its index or first page, and a path with no match renders the closest pages as links inside the docs layout with `noindex`.
- Search is Pagefind. `pnpm build` runs `pagefind --site .next/server/app --output-path public/pagefind` after `next build` and then `scripts/pagefind-warm-manifest.ts`. `next.config.ts` serves stable Pagefind names with `must-revalidate` and the content-hashed chunks as immutable. The search dialog is `packages/ui/src/components/frame/Search.tsx`.
- The docs have no site footer. Their links sit in the sidebar footer.
- The content repository holds the writing rules for the pages: its `AGENTS.md` asks for `DOCS-SKILL.md` in full before an edit and `CONTRIBUTING.md` for validation, and `.agents/skills/docs-skill` holds the agent copy.
- The same `AGENTS.md` sets a public authentication boundary: the docs cover API-key authentication and the customer sign-in commands (`gt init`, `gt login`, `gt logout`, `gt whoami`), and leave out user-token types, token callbacks and OAuth setup even when a released package exports them.

## Framework variants

- Every docs page has a `[variant]` segment: `_v-react` (the default), `_v-next` (Next.js), `_v-ts` (TanStack Start) and `_v-rn` (React Native), defined once in `src/lib/framework-variants.ts`. The `gt-fw-pref` cookie (`react`, `next`, `ts`, `rn`) picks the variant.
- `src/proxy.ts` rewrites `/<locale>/docs/<path>` to `/<locale>/docs/<variant>/<path>`. Only pages with a framework tab group exist in every variant; the rest prerender as `_v-react` alone and the proxy ignores the cookie there.
- `scripts/generate-framework-variant-pages.ts` writes the list of tab pages to `src/lib/framework-variant-pages.json` (gitignored) at `postinstall`, `dev` and `build`. Run `pnpm install` or `pnpm dev` once in a fresh worktree before the proxy can read it.
- A variant page reached without a preference renders the React tab, so the active tab is right on the first paint and the page is a static cache hit.

## The agent-readable family

Shipped in gt-cloud #4499 (merged 2026-09-10) with content #482:

| URL | Source |
| --- | --- |
| `/llms.txt`, `/<locale>/llms.txt` | curated index, `src/app/[locale]/llms.txt/route.ts` |
| `/llms-index.txt` | every page; the dashboard assistant and Locadex read it |
| `/llms-full.txt` | every page's text |
| `/docs/<scope>/llms.txt` | one section, `src/app/[locale]/llms-scope.txt/[...scope]/route.ts` |
| `/docs/<path>.md`, `.mdx` | the page's markdown twin, `src/app/[locale]/llms.mdx/[...slug]/route.ts` |
| `/AGENTS.md` | the agent guide, extracted from a docs page |
| `/agent-prompt.md` | the start prompt (see pages.md) |
| `/sitemap.md` | the site map as markdown |
| `/docs/platform/openapi/llms-full.txt` | the API reference as text |

- The OpenAPI document predates #4499: `/openapi.yaml` (`src/app/openapi.yaml/route.ts`) came with gt-cloud #3427 (merged 2026-07-17) and `/openapi.json` (`src/app/openapi.json/route.ts`) with #4527 (merged 2026-08-27). Both routes are `force-static`. #4499 added the root `llms.txt` link to `/openapi.yaml`.
- `next.config.ts` maps the `.md` and `.mdx` URLs to the `llms.mdx` route (`generateLLMsRewriteRules`) and the root and scoped `llms*.txt` aliases through `getLlmsTxtRewriteRules` in `src/lib/llms.ts`.
- The twin route prerenders every locale and sets `dynamicParams = false`. `getLLMText` reads the MDX file from disk, and the deployed function has no copy of the content submodule, so a twin rendered on demand returned 500 in production.
- The proxy rewrites a docs request to its `.mdx` twin when the user agent is in `AI_USER_AGENTS` or the request accepts `text/markdown`. That branch sits above the variant rewrite.
- Agent-readability checkers count `llms.txt` and OpenAPI links in the server-rendered body, and the Copy page menu unmounts its rows while closed. The page therefore renders machine-only anchors: `className='sr-only'`, `aria-hidden='true'`, `tabIndex={-1}` and `data-pagefind-ignore`. Keep them when the page head changes.
- Docs pages carry JSON-LD from `src/lib/docs-structured-data.ts`.
- The tests are `__tests__/llms.test.ts`, `__tests__/docs-agent-readable.test.ts`, `__tests__/agents-guide.test.ts`, `__tests__/sitemap.test.ts`.
- Backlog recorded after the audit (2026-09-14): markdown twins for the marketing routes (pricing first), `rel=alternate` markdown links on marketing HTML, the locale-prefixed blog `.md` soft 200, and a Content-Signal line in robots, which is Kevin's decision.

### Agent-readability checklist

A change to the docs page head, the Copy page menu, the twins or the proxy keeps every item below, so agents and checkers still find `llms.txt`, the twins and OpenAPI. Each item was checked against origin/main on 2026-10-13.

1. **Head metadata.** `generateMetadata` in the page route sets `alternates.canonical`, `alternates.languages` (hreflang) and `alternates.types['text/markdown']`, all from `createDocsDiscovery` in `src/lib/docs-structured-data.ts`. The markdown URL is the canonical URL plus `.mdx`, and `llmsUrl` is `https://generaltranslation.com/<locale>/llms.txt`.
2. **The describedby link.** The page renders `<link rel='describedby' href={discovery.llmsUrl} />`, which React hoists into the head.
3. **The machine-only anchors.** The meta row under the description renders an `llms.txt` anchor on every page and an `/openapi.json` anchor on endpoint pages (`isApiEndpointPage`: frontmatter `method` or `_openapi`). Each has `className='sr-only'`, `aria-hidden='true'`, `tabIndex={-1}` and `data-pagefind-ignore=''`. Checkers count links in the server-rendered body, and `DocsPageActions` renders its menu rows only while the menu is open (`{open && ...}`).
4. **The Copy page menu.** Copy page and View as Markdown use the public path plus `.md`, built with `toPublicDocsPathname`, so an internal `_v-*` segment never reaches the rewrite. The menu links `llmsUrl`, `/llms-full.txt` and, on endpoint pages, `openApiUrl`.
5. **The twins.** `src/app/[locale]/llms.mdx/[...slug]/route.ts` keeps `dynamicParams = false`, `revalidate = false` and `generateStaticParams` returning `source.generateParams('slug', 'locale')`, which prerenders a twin for every page in every locale. The response is `text/markdown; charset=utf-8` with a `Link: <HTML URL>; rel="canonical"` header and a closing pointer to `/sitemap.md`. `src/lib/get-llm-text.ts` sets the `Docs index:` line to `${BASE_URL}/llms.txt`.
6. **The rewrites.** `generateLLMsRewriteRules` in `next.config.ts` (`afterFiles`) maps `/docs/<path>.md` and `.mdx`, with and without a locale, to the twin route. `getLlmsTxtRewriteRules` maps the `llms*.txt` aliases.
7. **The AI branch of the proxy.** A path that contains `/docs/` or is a knowledge base article, does not end in `.mdx`, and comes from a user agent in `AI_USER_AGENTS` (12 names, matched case-insensitively as substrings) or accepts `text/markdown` is rewritten to the same path plus `.mdx`. The branch stays above `resolveVariantRewrite`, which returns nothing for `.md` and `.mdx` paths. The proxy matcher skips dotted paths, so the `.mdx` URL reaches the `next.config.ts` rewrite.
8. **Search.** Only the docs page carries `data-pagefind-body` (on the default variant), and the machine-only anchors carry `data-pagefind-ignore`, so they never appear in search results.

The tests in `__tests__/` pin part of this list:

- `docs-agent-readable.test.ts` pins the describedby link, the `text/markdown` alternate, the hreflang line, two `href={discovery.llmsUrl}` occurrences, the `llmsUrl` prop on the menu, `data-pagefind-ignore`, the twin's content type, `Link` header, body and `revalidate = false`, and the `Docs index:` URL.
- `llms.test.ts` pins the root index, the scoped indexes and the route aliases.
- `proxy.test.ts` pins the `.mdx` rewrite for `ClaudeBot` and for `Accept: text/markdown`.
- No test pins the twin route's `dynamicParams = false`, the OpenAPI anchor or the `sr-only`, `aria-hidden` and `tabIndex` attributes. Check those by reading the diff.

## Routing layers

`src/proxy.ts` first passes `/aeo` and its subpaths through untouched, then runs these steps in order, and each one returns early:

1. `resolveUnsupportedLocaleRedirect`: a roster locale passes or gets canonical casing (301); a region variant of a published language goes to that language (307, `fr-FR` to `fr`); anything else goes to the default locale (301). Every docs rewrite sits below this step. Before it existed, `/en/docs/platform` reached the fumadocs source with a locale it does not have and returned 500 (2026-09-04).
2. `resolveKbLocaleRedirect`: 301s a knowledge base path with no locale or another roster locale to `/en-US/kb...` (see "The knowledge base").
3. `resolveLegacyDocsRedirect`, on paths that contain `/docs/`: 301s from old docs URLs. The live table is `src/lib/legacy-docs-redirects.json` in gt-cloud, tested by `__tests__/legacy-docs-redirects.test.ts` against the content.
4. The markdown rewrite for AI agents, on docs pages and knowledge base articles.
5. The framework variant rewrite.
6. The dashboard redirect for signed-in visitors on the landing root.
7. `gtMiddleware`.

- The proxy matcher excludes every path with a dot (`.*\\..*`), so `.md`, `.mdx` and asset URLs never pass through `proxy.ts`. A rule for them lives in `next.config.ts`, the route handler or the page.
- `next.config.ts` redirects run before the proxy. A bare `/en/docs` takes two hops.
- Every branch that returns early calls `captureAdAttribution(request, response)`, because ad landing URLs point at docs pages and the redirect or rewrite is the only chance to keep the click id. A new branch does the same.
- `gt-next` switches locale with a cookie pair: `generaltranslation.locale` and the one-shot `generaltranslation.locale-reset` (`GT_LOCALE_RESET_COOKIE`, pinned by `__tests__/gt-locale-reset-cookie.test.ts`). A proxy step that returns before `gtMiddleware` must leave the switch to it: on main the variant rewrite returns nothing while the reset cookie is set. #4707 (open on 2026-10-13, in native stack #5152) narrows that to a switch that is still pending.
- A redirect for a content move deploys only after the moved pages are on content main. On 2026-09-03 gt-cloud shipped 301s from `/docs/rrweb/*` before the content pull request merged, and every old URL redirected to a 404.
- **The routing matrix gates every routing change.** `sh scripts/routing-matrix.sh` checks the cases in `references/routing-cases.txt` (real pages, near-miss corrections, section fallbacks, blog slugs, locale prefixes) with one GET each and no redirect following, and exits with the number of failures. Run it against the worktree's dev server with `--base http://localhost:<port>` before the pull request and against https://generaltranslation.com after the deploy. Routing defects reached production three times after the near-miss work of August 2026: 301s into 404s (2026-09-03), a 500 on `/en/docs` (2026-09-04) and a legacy redirect that sent the CLI auth page to a dead login URL (2026-09-25). A case whose answer changes on purpose is edited in the cases file with the date and the reason.
- Open pull requests on this layer (all three open on 2026-10-13): #4703 (404s for non-roster locales on dotted paths and a case-folded guard), #4707 (locale switch without the extra hop) and #5054 (redirect targets for the links the CLI and gt-next print). They are positions 1 to 3 of the native GitHub stack #5152 (`gh stack`), with #4815 at position 4; `gh stack merge` merges a stack up to the chosen pull request in one step. On 2026-10-13 #4703 and #4815 conflict with main (GitHub reports them not mergeable), so the stack needs a rebase before it can merge.
- The other native stacks on gt-cloud on 2026-10-13: #5151 (performance), #5153 (dashboard UI, where #5029 and #4671 conflict with main) and #5280 (the SEO pages, #5260 to #5267, rebased onto main 0fe62a855 and not merged).

## Transitions and the sidebar

Until gt-cloud #4522 (merged 2026-09-03), a click from the landing into the docs painted up to four generations of the page.

- A `redirect()` thrown inside a page render commits the layout above it first. A click on a folder URL painted the docs layout with the section picker and no article, then replaced it about 280 ms later. A `next.config.ts` redirect is answered before the layout and has no such frame. So every link the site renders points at the resolved leaf page, and the in-render redirect stays for crawlers and old links. `src/components/landing/shell/__tests__/footer-links.test.ts` holds the footer to leaf URLs.
- Marks drawn in a mount effect cannot appear before first paint. `SidebarMotion` builds its rail, pill and thumb in `useMountEffect` and sets `#nd-sidebar[data-sb-ready]` when done. Gate only the row tint on that attribute. Fumadocs' own `::before` rails sit about 10 px inboard of the drawn path and would jump sideways at hydration.
- A header menu trigger is a disclosure button. The destination is an entry inside the panel, listed in both `items` and `columns` of `NewHeader.tsx`. A trigger that navigates tears down the document while Radix opens the panel, and keyboard users can never open it.
- On a docs 404 the sidebar shows the stock flat tree. A client-side pathname override kept the section tree but flashed the flat tree before hydration, and Kevin chose the stock behavior: "the flash is worse" (Kevin, 2026-09-10; reverted in #4773).
- Between 768 and 1279 px the notebook layout's top bar `#nd-subnav` is emptied to an 80 px band (`--fd-header-height: 80px`) with the "On this page" strip (`[data-toc-popover] > header`) under it. fumadocs paints both translucent; `src/app/globals.css` paints both with `--color-fd-background` and no blur, so they read as one bar. The `#nd-docs-layout::before` rule that `globals.css` used to paint that band under the fumadocs-ui 16.0 layout was removed in #5176. Outside every media query, `#nd-page` sets `--fd-docs-row-1: var(--fd-docs-row-3)`, which fumadocs-openapi's sticky code column reads; from 1280 px, full pages (`#nd-page[data-docs-full]`) set it to 64px.
- Check sidebar work on a page with a nested folder open, such as `/en-US/docs/cli/reference/commands/configure`. `/docs/overview/get-started` has no open folder and hides nested defects.

### Docs parity after the fumadocs 16.16 upgrade (#5253, merged 2026-10-13)

fumadocs-core and fumadocs-ui moved to 16.16 in #5176 (merged 2026-10-07), and #5217 (merged 2026-10-08) restored most of the earlier design. gt-cloud #5253, "keep docs sidebar markers on visible rows when a folder folds" (Chenxin Yan), merged on 2026-10-13 at 01:08 UTC as `fceba64c95` and finished the restore. #5258, "restore docs parity after the fumadocs 16.16 upgrade", had four commits and was closed unmerged in its favor on 2026-10-13. #5253 holds Chenxin's fold fix, #5258's other three commits unchanged, and the `groupRows` fix split out of #5258's first commit, whose `collectRows` and `currentActiveRow` fold changes were dropped. fumadocs-ui is not patched; the fixes are in four files.

`src/components/docs/SidebarMotion.tsx`:

- `collectRows` reads whether a folder is open from the collapsible (`:scope > div[data-state]`, `offsetHeight > 0`) and walks the rows of its first child, the list div that fumadocs 16.16 added. The list keeps its height while the collapsible animates to 0, so the test on the list that #5217 introduced drew the rail past the remaining rows.
- `currentActiveRow` returns null while the active link is inside closed collapsible content (`div[data-state] > div[data-state="closed"]`). The folded row stays mounted until the collapse animation ends, so the pill and the thumb would otherwise stay on it. A closed folder's own header link (an index page) stays current.
- `groupRows` skips only the motion layer's nodes (`.docs-sb-rail, .docs-sb-hover, .docs-sb-current`). It used to skip every node whose class contained `docs-sb-`, which dropped a loading row (`docs-sb-pending`) and the thumb on a top-level row.
- `setup()` replaces the desktop viewport's `scroll()` with a no-op, because fumadocs calls it whenever an active row mounts, reopened folders included. The teardown deletes the override. The motion layer runs on `#nd-sidebar` from 768 px only; the phone drawer (`#nd-sidebar-mobile`) keeps fumadocs' scroll.

`src/components/docs/SidebarActiveScroll.tsx` places the desktop viewport by writing `scrollTop` and must not call `viewport.scroll()`. It wrote `scrollTop` before #5253 too; the pull request changed its comment only.

`src/app/[locale]/docs/[variant]/[...slug]/page.tsx`: the docs 404 (`DocsSlugNotFound`) renders `DocsPage` with `className='pt-8 pb-0'`.

`src/app/globals.css`:

- `#nd-sidebar [data-radix-scroll-area-viewport]` has `overflow-anchor: none`, so a folder that opens near the end of the list does not scroll the sidebar when no row has focus.
- Separators (`p`) inside an open root folder, which the docs 404 tree has, take the row ladder's `--docs-row-offset`, and the first one has no top margin.
- The inline code chip rule (5 px radius) covers `#nd-toc` and `[data-toc-popover]` as well as `#nd-page`.
- From 768 px, the grid column that holds `#nd-sidebar` has `margin-bottom: -1px`, so a page height that ends in half a pixel does not lift the sticky sidebar at the end of the page.
- Below 768 px, the "On this page" strip (`[data-toc-popover] > header`) blurs at 4 px. fumadocs' `backdrop-blur-sm` is 8 px.
- From 1280 px, full pages (`#nd-page[data-docs-full]`, the OpenAPI reference) are capped at `calc(1285px + 3rem)`, fumadocs' 1285 px cap on their children plus the page padding, so they center to the right of the sidebar.

Kept on purpose, as #5253 describes: below 1280 px the TOC popover opens scrolled to the active heading (fumadocs 16.16 behavior), from 1280 px the OpenAPI title band and footer bar take the two-column renderer's width, and code blocks color Vue bindings by shiki 4's grammar. fumadocs-core 16.16.1 resolves shiki 4.5.0 in `pnpm-lock.yaml`; the landing's own `shiki` dependency is `^3.23.0`.

## The knowledge base

gt-cloud #5250, "add /kb knowledge base" (merged 2026-10-10), with content #594 (merged 2026-10-10), added an English-only knowledge base at `/en-US/kb`. It is separate from the docs: it is not in the fumadocs source, the docs sidebar or docs search.

- Source: `content:kb/*.mdx`, one flat folder with no locales; the submodule commit on gt-cloud main holds five articles. `src/components/kb/utils.ts` reads `content/kb` at build time. `getListedKbArticles` leaves out articles with `noindex: true` frontmatter, which still render.
- Pages: `src/app/[locale]/kb/page.tsx` (the index) and `src/app/[locale]/kb/[slug]/page.tsx` (an article, `dynamicParams = false`), generated for `en-US` only. `src/app/[locale]/kb/layout.tsx` re-exports the blog layout. Each page has one canonical URL and no hreflang alternates.
- Proxy: `resolveKbLocaleRedirect` (step 2 in "Routing layers") 301s `/kb` paths with no locale or another roster locale to `/en-US/kb`. The AI branch rewrites article pages (`KB_ARTICLE_RE`) to `.mdx` and leaves the index as HTML.
- Twins: `/kb/<slug>.md` and `.mdx`, with or without a locale, rewrite through `generateLLMsRewriteRules` in `next.config.ts` to `src/app/[locale]/kb.mdx/[slug]/route.ts`. That route is prerendered for `en-US` with `dynamicParams = false`, sends a canonical `Link` header, and adds `X-Robots-Tag: noindex` for a noindex article.
- Indexes: `/kb.md` and `/kb/sitemap.md` (`src/app/kb.md/route.ts`, `src/app/kb/sitemap.md/route.ts`). The root `llms.txt` links both under "Knowledge Base" (`src/lib/llms.ts`), and `src/app/sitemap.ts` lists the index and the listed articles under `en-US`. `/llms-index.txt`, `/llms-full.txt` and `/sitemap.md` do not include the knowledge base.
- Redirects: `next.config.ts` reads each article's `redirectFrom` frontmatter through `src/lib/kb-redirects.ts` and redirects those `/blog/<slug>` URLs, with or without a locale, to the article with `permanent: true` (a 308). `RETIRED_BLOG_POST_DOCS` in `next.config.ts` sends retired posts with no article to docs pages.
- Related questions: gt-cloud #5275, "show related questions and previous/next on KB articles" (merged 2026-10-13), adds a `related` frontmatter list of slugs. `resolveKbNavigation` in `src/components/kb/utils.ts` takes up to 5 listed articles from it, fills to 3 with the newest other listed articles, and picks the previous (older) and next (newer) listed articles by date. The article page renders them in `src/components/kb/KbArticleFooter.tsx`, and the twin adds "Related questions" and "Previous and next questions" sections before its sitemap pointer.
- Tests: `__tests__/kb-markdown.test.ts`, `__tests__/kb-redirects.test.ts`, `src/components/kb/__tests__/markdown.test.ts` and `src/components/kb/__tests__/utils.test.ts` (both added in #5250 and extended in #5275), and the knowledge base cases in `__tests__/proxy.test.ts`, `__tests__/llms.test.ts` and `__tests__/sitemap.test.ts`.

## Performance

- Kevin's numbers come from PageSpeed Insights field data (CrUX, origin level), which includes redirect time. A good lab run on desktop does not settle a field complaint.
- Run Lighthouse locally with `CHROME_PATH=<path to Chrome> npx -y lighthouse@12 <url> --preset=desktop --output=json` (drop `--preset` for mobile). The PSI API's anonymous quota ran out in September 2026.
- Check the cache per framework and locale with `curl -sI -b 'gt-fw-pref=next' -w '%header{x-vercel-cache} %header{x-matched-path}\n' <url>`. A concrete `_v-*` matched path with HIT is the goal.
- Playwright's `response` events replay memory-cache hits across loads in one context. Count font requests in a fresh context with the cache disabled (`Network.setCacheDisabled`).
- Pull request branches get no Vercel preview (`apps/landing/vercel.json`), so measure production after the merge or deploy a preview by hand. Previews are SSO protected: use `vercel curl`, or write the `x-vercel-trusted-oidc-idp-token` header to a file through `vercel env run` and pass it to Lighthouse with `--extra-headers`.
- Lighthouse's simulated mobile LCP charges hydration JavaScript to the largest paint; throttled Chrome records the paint at first render. Mobile gains past that point need framework-level JavaScript cuts.
- Known costs on main (measured on production 2026-09-25): the locale `not-found.tsx` is serialized into every docs page's RSC payload with the marketing 404's CSS and scripts, the full sidebar tree is in the payload, and the sidebar prefetches every link. Pull request #4815 (open on 2026-10-13, position 4 of native stack #5152, based on #5054's branch) moves the heavy 404 under `[locale]/[...missing]/`, turns sidebar prefetch into hover and touch intent, and subsets Inter with an italic loaded on demand.
- `experimental.inlineCss` was built and reverted: Next 16.2 embeds the CSS twice, in a style tag and in the flight data, and the docs HTML grew from 245 KB to 731 KB.
- Kevin's scope rule (2026-09-25): a performance pull request holds the few small changes that carry the measured win. He cut the redirect map, the font split and the sidebar tree stripping from #4815 as "doing too much for such little changes", and he wants italics on the docs. PostHog loading stays as it is ("dont touch posthog", Kevin, 2026-09-15).

## Sources

- gt-cloud: `apps/landing/src/proxy.ts` (read 2026-10-05 for the step order and `captureAdAttribution`), `apps/landing/next.config.ts`, `apps/landing/src/lib/llms.ts`, `apps/landing/src/lib/framework-variants.ts`, `apps/landing/src/app/[locale]/docs/layout.tsx`, `apps/landing/src/app/[locale]/docs/[variant]/[...slug]/page.tsx`, `apps/landing/src/app/[locale]/llms.mdx/[...slug]/route.ts`, `apps/landing/src/app/globals.css`, `apps/landing/package.json`, `apps/landing/vercel.json` (origin/main, 2026-10-05).
- gt-cloud origin/main at `0fe62a855` (one commit after #5253's merge commit `fceba64c95`, with no change under `apps/landing`), read on 2026-10-13 for the parity section, the agent-readability checklist and the knowledge base: `apps/landing/src/components/docs/SidebarMotion.tsx`, `SidebarActiveScroll.tsx` and `DocsPageActions.tsx`, `apps/landing/src/app/globals.css`, `apps/landing/src/app/[locale]/docs/[variant]/[...slug]/page.tsx`, `apps/landing/src/app/[locale]/llms.mdx/[...slug]/route.ts`, `apps/landing/src/app/openapi.json/route.ts`, `apps/landing/src/app/openapi.yaml/route.ts`, `apps/landing/src/lib/docs-structured-data.ts`, `apps/landing/src/lib/get-llm-text.ts`, `apps/landing/src/lib/llms.ts`, `apps/landing/src/proxy.ts`, `apps/landing/next.config.ts`, the `kb` routes under `apps/landing/src/app/`, `apps/landing/src/components/kb/utils.ts` and `KbArticleFooter.tsx`, `apps/landing/src/lib/kb-redirects.ts`, `apps/landing/src/app/sitemap.ts`, `packages/ui/src/fumadocs/index.ts`, `apps/landing/package.json`, `packages/ui/package.json`, `pnpm-lock.yaml`, the tests `docs-agent-readable`, `llms`, `proxy`, `kb-markdown` and `sitemap` in `apps/landing/__tests__/`, and `apps/landing/src/components/kb/__tests__/`. The OpenAPI routes' first commits come from `git log --diff-filter=A`, and #5253's commits were matched to #5258's with `git patch-id`.
- content: `AGENTS.md`, `.agents/skills/docs-skill/SKILL.md`; the `kb/` folder at the submodule commit on gt-cloud main (2026-10-13).
- Claude Code project memory for gt-cloud: `agent-readable-docs.md`, `docs-shell-transition-traps.md`, `docs-perf-investigation.md`, `fuma-blog-pipeline.md`, `pr-stacks-2026-10.md`.
- Pull requests, states read with `gh pr view` and the stack fields with `gh api repos/generaltranslation/gt-cloud/pulls/<n>` on 2026-10-13: gt-cloud #3427, #4499, #4522, #4527, #4773, #5250, #5253 and #5275 (merged); #5258 (closed); #4703, #4707, #5054 and #4815 (open, native stack #5152); #5176, #5178 and #5217 (merged); content #594 (merged).
- The routing matrix (added 2026-10-10): the 35-case script of the docs and blog near-miss PRs (#4358, #4359, #4360; Claude Code transcript of the docs redesign session, 2026-08-20 to 2026-08-24) and system-v2 inventory `docs.json` row 2 (the three production routing defects); cases re-read against production on 2026-10-10.
- The fumadocs 16.16 parity section (added 2026-10-10, rewritten 2026-10-13): gt-cloud #5253's description and merge commit `fceba64c95`, checked against origin/main.
