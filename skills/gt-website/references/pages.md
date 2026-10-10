# Pages with rules of their own

Six parts of the site carry rules beyond the landing grammar: the pricing numbers, the hero's agent button and the prompt behind it, the partner pages, the AI features, the `/world` map, and the programmatic SEO pages Kevin decided on. Paths that start with `src/`, `scripts/`, `public/` or `__tests__/` are inside `$GT_CLOUD/apps/landing`, and `content:` paths are in the content repository.

## Pricing money

- The rule (gt-landing-pages states it for every pricing surface): whole-dollar amounts of $1 or more render without cents ($1, $2, $5); prices with cents keep two decimals ($0.50, $1.06), and so do amounts under a dollar, such as $0.00 / GB-month (Kevin, 2026-09-10, gt-cloud #4785).
- The formatter is `dollarFractionDigits` in `packages/ui/src/components/pricing/dollar-format.ts`, exported as `@generaltranslation/ui/components/pricing/dollar-format` and tolerant of float noise. `Dollar` in `Currency.tsx` and the formula card total in `UsagePricing.tsx` use it. Test: `__tests__/usage-dollar-format.test.ts`.
- The page is `src/app/[locale]/(home)/pricing/page.tsx` with `src/components/pages/pricing/`. Plan data comes from `@generaltranslation/settings`.

## The hero's Setup for Agents button

- The hero has two buttons: Get Started and Setup for Agents. Setup for Agents copies the start prompt, a markdown brief that takes a coding agent from an empty project to a working first translation (gt-cloud #5049, merged 2026-10-01). Kevin asked for it as a pull request of its own: "the landing page hero should be its own pr" (Kevin, 2026-09-30).
- The button lives in `src/components/landing/sections/agent/HeroSecondButton.tsx`, `CopyPromptButton.tsx` and `useCopyFace.ts`. The face shows Copied with a check or Copy Failed with a cross for 1.6 s. Its label sizer and its glyph gaps follow gt-landing-pages (a state label sized from the idle label; gaps matched by drawn glyph columns).
- The prompt has one source: the fenced block opened with four backticks and `markdown title="agent-prompt.md"` in `content:docs/en-US/overview/for-coding-agents.mdx`. `src/lib/agent-prompt.ts` extracts it (`extractAgentPrompt`, `loadAgentPrompt`), the home page reads it at build time and passes it to the button, and `src/app/agent-prompt.md/route.ts` serves the same text. `loadAgentPrompt` returns null without a log when the build has no docs content (CI), and null with the reason in the build log when the page or its fence is missing. On null the button becomes a Docs link, so a docs edit never fails the landing build.
- gt-cloud CI never initializes the content submodule. A build-time read of a docs page returns null when `source.getPages()` is empty, and a test that reads real pages skips when the file is missing (`existsSync`). Guard the read itself, because `describe.skipIf` still runs its collector.
- The prompt has to work when handed to an agent unchanged (Kevin, 2026-09-30: "test it yourself"). After any change to the prompt, the CLI or the quickstarts, run it end to end with a coding agent on a fresh `create-next-app` project with the machine's existing `gt login` session, and fix the prompt until a build passes the first time. Two runs in September 2026 found nine defects in the first draft and none in the second.
- Facts the prompt depends on, checked against the published CLI (gt 2.23.1, 2026-10-01):
  - `gt init` and `gt configure` ask unanswered questions through interactive prompts and wait forever under a terminal. With `--no-interactive` they exit 1 and list the missing flags. The complete non-interactive form: `npx gt@latest init --no-interactive --json --defaults --default-locale en --locales fr --no-locadex --react-setup --file-formats none --no-dev-credentials --package-manager npm`.
  - `gt login --no-browser` prints the device URL. `project create` takes `--org-id`, `--name` and `--default-locale`; `api-key create` takes `--project-id`, `--name` and `--permission`. Neither prompts.
  - There is no `--version` flag; each command's banner prints the version.
  - A development key in `.env.local` makes `next build` fail, so the prompt puts it in `.env.development.local`.
- Keep the prompt in English. "Agent experience (AX) is a huge deal for us" (Kevin, 2026-09-30), and the prompt names `gt login` prominently for that reason.

## Partner pages

The partner credit pages at `/[locale]/enterprise/contact/<partner>` (Slash, Mercury, a16z, speedrun, YC and The Residency, live on generaltranslation.com on 2026-10-10) are one screen in the sign-in plate's grammar under the landing navbar (gt-cloud #5216, merged 2026-10-08; The Residency in #5239, merged 2026-10-09). `src/components/pages/partners/PartnerOfferPage.tsx` renders every one of them.

- **Layout.** The left column holds the GT and partner mark, a 30 px heading, one sentence, three ruled rows, one Apply button and the fine print. The right side shows the dithered Blue Marble with its caption card. The plate kit comes from `packages/ui` and mounts as an inset section (`PlateRoot inset`, `contain: paint`), so the landing navbar and footer keep their own styling.
- **Kevin's edits** (2026-10-07): no outer rules on the ledger; brand colors stay in logos (YC keeps its orange square) and the other partner logos are monochrome; the fine print is each page's original legal notice at 12 px.
- **Adding a partner** touches, in gt-cloud: the program table in `programs.server.ts`, `usePartnerCreditCopy.ts` and `applicationCopy.ts` (amount and duration come from a per-program table, and the approval email names the partnership), the partner tests, the landing wrapper and its route, a short link and its PostHog slug, the `next.config.ts` redirects, and the sitemap with its test. Redemption codes stay in the program table and out of this repository.
- **The social card.** A long title overflows `/api/og-home`; pass the shorter heading as its `t` parameter.

## AI features on the landing (pull request #4885, open on 2026-10-10)

The questions band and the `/faq` page answer free-form questions through the Vercel AI Gateway with `google/gemini-2.5-flash` by default (`FAQ_ASSISTANT_MODEL` overrides it; branch `k/landing-faq`): `POST /api/faq/ask` in `src/app/api/faq/ask/route.ts`, with the entries, the docs index, the prompt and the fallback in `src/lib/faq/`. The route shape is the pattern for any AI feature on the site:

- Model strings are plain `provider/model` ids, which AI SDK 5 routes through the gateway. List the live ids with `curl -fsSL https://ai-gateway.vercel.sh/v1/models`.
- Local authentication: `vercel link --yes --project landing --scope general-translation`, then `vercel env pull .env.local --environment development`, which writes a `VERCEL_OIDC_TOKEN` valid for 12 hours. Revert the `.env*` line `vercel link` appends to `apps/landing/.gitignore`. Never print the token.
- Send one tiny live request before building UI around a model, because `streamText` does not throw on a gateway authentication failure. Detect the failure on a tee of the stream.
- Set `providerOptions.google.thinkingConfig.thinkingBudget = 0` for Gemini. With the default budget, a small `maxOutputTokens` is spent on reasoning and the answer comes back empty.
- Rate-limit before parsing the body, and extend the shared `recordRequest` in `src/lib/rate-limit.ts`; review bots flag a second limiter.
- The feature always answers: when the gateway refuses, stalls past the first-token deadline or fails to start, the route answers from a local fallback built on the FAQ entries and the docs index, and it marks the response with `X-Faq-Source: fallback` or `model` ("faq has to do something", Kevin, 2026-09-18). A 503 is reserved for the kill switch.
- The assistant is off unless `FAQ_ASSISTANT_ENABLED` is `true` or `1`, and unsetting it is the kill switch (`src/lib/faq/config.ts`). The in-process limits count per function instance, so it is turned on only after a per-caller limit that every instance shares exists (a Vercel WAF rate limit on `POST /api/faq/ask`, or a limiter on shared storage). The band and `/faq` are prerendered, so the build reads the variable too (`apps/landing/turbo.json`).
- Responses carry `Cache-Control: no-store` and stream plain text.
- The chat UI uses AI Elements ported by hand into `packages/ui/src/components/ai/`; the registry files use `useEffect`, streamdown and shiki, which the lints and the landing bundle reject. The conversation frame never scrolls itself: `StickToBottom.Content`'s scroll element takes `min-h-0` inside a flex column.
- Gateway spend needs paid credits and a budget on the feature's tag before deploy. Kevin sets those in the Vercel dashboard.

## The /world map (branch k/language-map, no pull request on 2026-10-10)

`/world` is a map where each region is drawn in glyphs of the languages written there, with CLDR facts, coordinates as typography, a glyph globe and dithered pictures of writing artifacts. It is built on `k/language-map` and packaged as three stacked branches (dataset, data layer, page); none is pushed as of 2026-10-10, and pushing waits for Kevin.

- The page is organized by language. It names no country or territory, draws no borders and shows no country figures: a selection is a language, the hover readout is coordinates, languages and density, fact sites are named by site and town, and disputed areas draw a neutral mix of the surrounding languages. Kevin asked for a page that avoids political sensitivity "without making it look forced" (Kevin, 2026-10-03). Policy choices go to Kevin before merge.
- Every fact has a source other than Wikipedia: Unicode CLDR, Natural Earth (4.1.0, and 5.1.2 for disputed areas), GT's supported-locales data, and published research for the places.
- Artifact pictures follow the Blue Marble screening standard (the gt-dither skill) and carry no readable English: "never distract with text on the artifacts" (Kevin, 2026-10-05). Other scripts and inscriptions stay.
- Glyph size follows population density, and the specimens use pinned Noto fonts.
- The page is `src/app/[locale]/(home)/world/page.tsx` with `src/components/pages/world/`, `src/lib/world/`, and the generator in `scripts/world/` (`generate.mjs`, with `lib/policy.mjs` as the single policy file). The generator has its own install: `pnpm install --frozen-lockfile --ignore-workspace` in `scripts/world`, then `pnpm generate`. Its output is `public/world/`.
- The page adds a footer link and leaves the shared header alone.
- Packaging the stack found two CI traps. The root `pnpm lint` runs `oxfmt --check .` over the repository, and a nested `.oxfmtrc.json` replaces the root config, so generated files are ignored in the root `.oxfmtrc.json`. A test that imports the generator's dependencies passes locally only because `scripts/world/node_modules` exists, so the grid test runs under `node --test` in `scripts/world` and vitest excludes that folder. Run every gate from a clean checkout before pushing a stack.

## Programmatic SEO pages (round 1 building on 2026-10-10)

Kevin's decisions for the SEO page system (2026-10-09), which round 1 builds on unpushed branches (no pull request on 2026-10-10):

- Every string is translated through `<T>`, and the translation is a real `gt translate` run with the CLI's signed-in session.
- The comparison pages are in, and the `/aeo` listicles stay.
- The surfaces the pages cover are the app, the docs, the website, the CLI and agents, and video (subtitles). PDF is out.

The route families, claim tracing and build limits join this file when round 1 ships.

## Sources

- gt-cloud origin/main (2026-10-05): `packages/ui/src/components/pricing/dollar-format.ts`, `apps/landing/src/lib/agent-prompt.ts`, `apps/landing/src/components/landing/sections/agent/HeroSecondButton.tsx`, `apps/landing/src/app/agent-prompt.md/route.ts`, `apps/landing/src/lib/rate-limit.ts`.
- gt-cloud branches: `k/landing-faq` (#4885; `src/lib/faq/config.ts` and `src/app/api/faq/ask/route.ts` read at c675222e0), `k/language-map` (`apps/landing/scripts/world/generate.mjs`, `package.json`).
- Claude Code project memory for gt-cloud: `pricing-money-format.md`, `landing-hero-agent-button.md`, `agent-prompt-test.md`, `landing-ai-gateway-faq.md`, `world-language-map.md`.
- Added 2026-10-10: Partner pages from Claude memory `partner-plate-pages` (2026-10-07 and 2026-10-08) and the partner pages spec of 2026-10-07 (layout only, no codes), with every partner page read live on generaltranslation.com on 2026-10-10 (each answered 200); Programmatic SEO pages from Claude memory `resume-2026-10-09` (Kevin's SEO decisions, 2026-10-09); pull request states read with `gh pr view` on 2026-10-10.
