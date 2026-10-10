# The docs site

The documentation at generaltranslation.com/docs is a Fumadocs site inside `apps/landing`. The pages are MDX in the content repository; the layout, the routing and the machine-readable copies are code in gt-cloud. Paths that start with `src/`, `scripts/` or `__tests__/` are inside `$GT_CLOUD/apps/landing`, and `content:` paths are in the `generaltranslation/content` repository, checked out at `apps/landing/content`.

## Structure

- Pages live in `content:docs/<locale>/<section>/...` as `.mdx`, with a `meta.json` in each folder for order and titles. `source.config.ts` declares the fumadocs-mdx collections and `src/lib/source.ts` loads them.
- The page route is `src/app/[locale]/docs/[variant]/[...slug]/page.tsx` and the layout is `src/app/[locale]/docs/layout.tsx`.
- The layout renders `DocsLayout` from `@generaltranslation/ui/fumadocs/index` (`packages/ui`, fumadocs-ui 16.0.10) with the landing's parts from `src/components/docs/`: `SidebarMotion` (the drawn rail, pill and thumb), `SidebarActiveScroll`, `DocsControls`, `DocsPageActions` (the Copy page menu), `DocsSidebarFooter` (Dashboard, Changelog, GitHub and Contact us; the Changelog is the blog) and `DocsFrameworkProvider`.
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

- `next.config.ts` maps the `.md` and `.mdx` URLs to the `llms.mdx` route (`generateLLMsRewriteRules`) and the root and scoped `llms*.txt` aliases through `getLlmsTxtRewriteRules` in `src/lib/llms.ts`.
- The twin route prerenders every locale and sets `dynamicParams = false`. `getLLMText` reads the MDX file from disk, and the deployed function has no copy of the content submodule, so a twin rendered on demand returned 500 in production.
- The proxy rewrites a docs request to its `.mdx` twin when the user agent is in `AI_USER_AGENTS` or the request accepts `text/markdown`. That branch sits above the variant rewrite.
- Agent-readability checkers count `llms.txt` and OpenAPI links in the server-rendered body, and the Copy page menu unmounts its rows while closed. The page therefore renders machine-only anchors: `className='sr-only'`, `aria-hidden='true'`, `tabIndex={-1}` and `data-pagefind-ignore`. Keep them when the page head changes.
- Docs pages carry JSON-LD from `src/lib/docs-structured-data.ts`.
- The tests are `__tests__/llms.test.ts`, `__tests__/docs-agent-readable.test.ts`, `__tests__/agents-guide.test.ts`, `__tests__/sitemap.test.ts`.
- Backlog recorded after the audit (2026-09-14): markdown twins for the marketing routes (pricing first), `rel=alternate` markdown links on marketing HTML, the locale-prefixed blog `.md` soft 200, and a Content-Signal line in robots, which is Kevin's decision.

## Routing layers

`src/proxy.ts` first passes `/aeo` and its subpaths through untouched, then runs these steps in order, and each one returns early:

1. `resolveUnsupportedLocaleRedirect`: a roster locale passes or gets canonical casing (301); a region variant of a published language goes to that language (307, `fr-FR` to `fr`); anything else goes to the default locale (301). Every docs rewrite sits below this step. Before it existed, `/en/docs/platform` reached the fumadocs source with a locale it does not have and returned 500 (2026-09-04).
2. `resolveLegacyDocsRedirect`: 301s from old docs URLs. The live table is `src/lib/legacy-docs-redirects.json` in gt-cloud, tested by `__tests__/legacy-docs-redirects.test.ts` against the content.
3. The markdown rewrite for AI agents.
4. The framework variant rewrite.
5. The dashboard redirect for signed-in visitors on the landing root.
6. `gtMiddleware`.

- The proxy matcher excludes every path with a dot (`.*\\..*`), so `.md`, `.mdx` and asset URLs never pass through `proxy.ts`. A rule for them lives in `next.config.ts`, the route handler or the page.
- `next.config.ts` redirects run before the proxy. A bare `/en/docs` takes two hops.
- Every branch that returns early calls `captureAdAttribution(request, response)`, because ad landing URLs point at docs pages and the redirect or rewrite is the only chance to keep the click id. A new branch does the same.
- `gt-next` switches locale with a cookie pair: `generaltranslation.locale` and the one-shot `generaltranslation.locale-reset` (`GT_LOCALE_RESET_COOKIE`, pinned by `__tests__/gt-locale-reset-cookie.test.ts`). A proxy step that returns before `gtMiddleware` must leave the switch to it: on main the variant rewrite returns nothing while the reset cookie is set. #4707 (open on 2026-10-10) narrows that to a switch that is still pending.
- A redirect for a content move deploys only after the moved pages are on content main. On 2026-09-03 gt-cloud shipped 301s from `/docs/rrweb/*` before the content pull request merged, and every old URL redirected to a 404.
- **The routing matrix gates every routing change.** `sh scripts/routing-matrix.sh` checks the cases in `references/routing-cases.txt` (real pages, near-miss corrections, section fallbacks, blog slugs, locale prefixes) with one GET each and no redirect following, and exits with the number of failures. Run it against the worktree's dev server with `--base http://localhost:<port>` before the pull request and against https://generaltranslation.com after the deploy. Routing defects reached production three times after the near-miss work of August 2026: 301s into 404s (2026-09-03), a 500 on `/en/docs` (2026-09-04) and a legacy redirect that sent the CLI auth page to a dead login URL (2026-09-25). A case whose answer changes on purpose is edited in the cases file with the date and the reason.
- Open pull requests on this layer (all three open on 2026-10-10): #4703 (404s for non-roster locales on dotted paths and a case-folded guard), #4707 (locale switch without the extra hop) and #5054 (redirect targets for the links the CLI and gt-next print).

## Transitions and the sidebar

Until gt-cloud #4522 (merged 2026-09-03), a click from the landing into the docs painted up to four generations of the page.

- A `redirect()` thrown inside a page render commits the layout above it first. A click on a folder URL painted the docs layout with the section picker and no article, then replaced it about 280 ms later. A `next.config.ts` redirect is answered before the layout and has no such frame. So every link the site renders points at the resolved leaf page, and the in-render redirect stays for crawlers and old links. `src/components/landing/shell/__tests__/footer-links.test.ts` holds the footer to leaf URLs.
- Marks drawn in a mount effect cannot appear before first paint. `SidebarMotion` builds its rail, pill and thumb in `useMountEffect` and sets `#nd-sidebar[data-sb-ready]` when done. Gate only the row tint on that attribute. Fumadocs' own `::before` rails sit about 10 px inboard of the drawn path and would jump sideways at hydration.
- A header menu trigger is a disclosure button. The destination is an entry inside the panel, listed in both `items` and `columns` of `NewHeader.tsx`. A trigger that navigates tears down the document while Radix opens the panel, and keyboard users can never open it.
- On a docs 404 the sidebar shows the stock flat tree. A client-side pathname override kept the section tree but flashed the flat tree before hydration, and Kevin chose the stock behavior: "the flash is worse" (Kevin, 2026-09-10; reverted in #4773).
- Between 768 and 1279 px fumadocs-ui fixes `#nd-tocnav` below the nav and leaves the band above it unpainted. `#nd-docs-layout::before` in `src/app/globals.css` paints that band, and the same block defines `--fd-docs-row-1`, which fumadocs-openapi's sticky code column reads and only fumadocs-ui 16.2 defines.
- Check sidebar work on a page with a nested folder open, such as `/en-US/docs/cli/reference/commands/configure`. `/docs/overview/get-started` has no open folder and hides nested defects.

## Performance

- Kevin's numbers come from PageSpeed Insights field data (CrUX, origin level), which includes redirect time. A good lab run on desktop does not settle a field complaint.
- Run Lighthouse locally with `CHROME_PATH=<path to Chrome> npx -y lighthouse@12 <url> --preset=desktop --output=json` (drop `--preset` for mobile). The PSI API's anonymous quota ran out in September 2026.
- Check the cache per framework and locale with `curl -sI -b 'gt-fw-pref=next' -w '%header{x-vercel-cache} %header{x-matched-path}\n' <url>`. A concrete `_v-*` matched path with HIT is the goal.
- Playwright's `response` events replay memory-cache hits across loads in one context. Count font requests in a fresh context with the cache disabled (`Network.setCacheDisabled`).
- Pull request branches get no Vercel preview (`apps/landing/vercel.json`), so measure production after the merge or deploy a preview by hand. Previews are SSO protected: use `vercel curl`, or write the `x-vercel-trusted-oidc-idp-token` header to a file through `vercel env run` and pass it to Lighthouse with `--extra-headers`.
- Lighthouse's simulated mobile LCP charges hydration JavaScript to the largest paint; throttled Chrome records the paint at first render. Mobile gains past that point need framework-level JavaScript cuts.
- Known costs on main (measured on production 2026-09-25): the locale `not-found.tsx` is serialized into every docs page's RSC payload with the marketing 404's CSS and scripts, the full sidebar tree is in the payload, and the sidebar prefetches every link. Pull request #4815 (open on 2026-10-10) moves the heavy 404 under `[locale]/[...missing]/`, turns sidebar prefetch into hover and touch intent, and subsets Inter with an italic loaded on demand.
- `experimental.inlineCss` was built and reverted: Next 16.2 embeds the CSS twice, in a style tag and in the flight data, and the docs HTML grew from 245 KB to 731 KB.
- Kevin's scope rule (2026-09-25): a performance pull request holds the few small changes that carry the measured win. He cut the redirect map, the font split and the sidebar tree stripping from #4815 as "doing too much for such little changes", and he wants italics on the docs. PostHog loading stays as it is ("dont touch posthog", Kevin, 2026-09-15).

## Sources

- gt-cloud: `apps/landing/src/proxy.ts` (read 2026-10-05 for the step order and `captureAdAttribution`), `apps/landing/next.config.ts`, `apps/landing/src/lib/llms.ts`, `apps/landing/src/lib/framework-variants.ts`, `apps/landing/src/app/[locale]/docs/layout.tsx`, `apps/landing/src/app/[locale]/docs/[variant]/[...slug]/page.tsx`, `apps/landing/src/app/[locale]/llms.mdx/[...slug]/route.ts`, `apps/landing/src/app/globals.css`, `apps/landing/package.json`, `apps/landing/vercel.json` (origin/main, 2026-10-05).
- content: `AGENTS.md`, `.agents/skills/docs-skill/SKILL.md`.
- Claude Code project memory for gt-cloud: `agent-readable-docs.md`, `docs-shell-transition-traps.md`, `docs-perf-investigation.md`, `fuma-blog-pipeline.md`.
- Pull requests: gt-cloud #4499, #4522, #4773, #4815, #4703, #4707, #5054; their states read with `gh pr view` on 2026-10-10.
- The routing matrix (added 2026-10-10): the 35-case script of the docs and blog near-miss PRs (#4358, #4359, #4360; Claude Code transcript of the docs redesign session, 2026-08-20 to 2026-08-24) and system-v2 inventory `docs.json` row 2 (the three production routing defects); cases re-read against production on 2026-10-10.
