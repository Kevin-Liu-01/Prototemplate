# GT product and architecture map

This page is for agents and people who write about General Translation (GT), design for it or change its products. It states what GT sells and to whom, how the products fit together, the facts copy must get right, and where each part lives in the repositories. Each fact carries the date it was read or ruled. Everything on the page is safe to publish: it names no customer, states no business figures and leaves internal data-model details to gt-cloud's own documents.

Detail stays with the documents that own it:

- [BRAND.md](../../BRAND.md) and [gt-brand](../../skills/gt-brand/SKILL.md) hold the name, the idea, the positioning line and the marks.
- [gt-website](../../skills/gt-website/SKILL.md) holds the landing app map, docs routing, the blog and deploys.
- [gt-landing-pages](../../skills/gt-landing-pages/SKILL.md) holds the page grammar for the home, pricing, enterprise and careers pages.
- [gt-voice](../../skills/gt-voice/SKILL.md) holds the writing rules, and [gt-components](../../skills/gt-components/SKILL.md) holds the translation component rules.
- gt-cloud's `AGENTS.md` (which `CLAUDE.md` links to) and its `.agents/skills` hold the monorepo file map and the engineering rules, such as `audit-events` and `server-security`.

`$GT_CLOUD` is a gt-cloud checkout at origin/main. gt-cloud facts below were read at e17fce499 on 2026-10-05.

## 1. Positioning

The home page hero says GT "builds full-stack localization for apps, docs, and websites" (read 2026-10-05). GT builds every layer of that stack itself:

1. open-source i18n libraries and SDKs for every major framework;
2. context-aware translation APIs;
3. the platform for versioning, editing, review and delivery;
4. Locadex, the agent that internationalizes a codebase and keeps it localized.

Kevin, 2026-07-30: "the whole point is that were a full stack localization, end to end".

- The positioning is the Vercel model applied to localization. GT pairs open-source developer tools with the hosted infrastructure that runs them best (BRAND.md section 2). This is the one comparison GT copy makes (gt-voice, hard rule 2).
- The thesis is "Every product in every language" (BRAND.md section 2). Copy quotes it as written.
- Pricing is usage-based. Legacy translation management systems (TMS) charge per seat and cover part of the stack. Because GT owns the whole stack, it can own the whole customer experience (BRAND.md section 9).
- The careers mission Kevin set on 2026-08-14 said that context and developer-first infrastructure now limit translation quality more than model quality does. The careers page read on 2026-10-05 carries a later mission text without that sentence, so copy states the claim only from a current source.

## 2. Audience and the sale

- The audience has two ends, which Kevin calls a barbell (2026-07-30). Developers and small teams start self-serve at one end. Enterprises buy through sales at the other. A page carries enterprise presence and developer comfort together.
- BRAND.md section 9 names the buyer: technical and product executives at growth-stage startups, whose engineering and growth teams use the product. The open source carries a community register and the platform an enterprise register (BRAND.md section 2).
- GT runs a challenger sale (Kevin, 2026-07-30). Many buyers cannot yet tell localization, translation and internationalization (i18n) apart. Pages show what localization does: translated copy, changed code, converted currency, reformatted dates and numbers, and layout rearranged for a script. The terms themselves stay on the page for evaluators who check for them. The docs define them on [Key concepts](https://generaltranslation.com/docs/overview/key-concepts).
- Heroes and demos show the product working. Kevin, 2026-08-11, on the enterprise page: "far less telling, more showing, so same content but less text and more better diagrams".

## 3. Products

| Product | What it does | Where it lives |
| --- | --- | --- |
| The `gt` libraries | `gt-next`, `gt-react`, `gt-tanstack-start` and `gt-react-native` (each 11.4.9 on npm, 2026-10-05), `gt-vue` and `gt-node` render translations and format locale-sensitive values in the app. `gt-next` also detects the locale and routes by it. | `generaltranslation/gt`, `packages/` |
| The Python SDKs | `gt-flask` and `gt-fastapi` on PyPI, built on the `generaltranslation` core package. BRAND.md's naming table writes the family as `gt-python`, which is the repository name; no package of that name exists (PyPI, 2026-10-05). | `generaltranslation/gt-python` |
| The `gt` CLI | Sets up a project, signs in, translates files and calls the API (`gt` 2.25.1 on npm, 2026-10-05). Section 7 has the commands. | `generaltranslation/gt`, `packages/cli` |
| The platform and dashboard | Projects, Context Groups, the translation editor, review and approval, version branching, annotations and audit logs at dash.generaltranslation.com. Review works over the web workspace, the API and the CLI. | `$GT_CLOUD/apps/dashboard`, `apps/api` |
| The translation API | Context-aware translation of text, files and components, published as `/openapi.yaml`. | `$GT_CLOUD/apps/api` |
| The translation CDN | Serves pre-generated translations from a global, low-latency CDN, and pushes over-the-air updates without a redeploy of the app. | `$GT_CLOUD/apps/edge` (Cloudflare Workers) |
| Runtime translation | Translates user-generated content on demand with the project's context. In Next.js it is `<Tx>` and `tx()` from `gt-next/server`, built on `GTRuntime` in the core library. | `generaltranslation/gt`, `packages/core` and `packages/next` |
| Locadex | A hosted agent. It connects to GitHub and to content sources (Google Drive, Figma, a CMS), scans the repository, internationalizes the code, generates translations and opens pull requests. Its automations keep the app localized after the first pass. | `$GT_CLOUD/apps/locadex`, `packages/locadex-core` |
| Integrations | Mintlify, Sanity (`gt-sanity`), Storyblok, Google Drive and rrweb (`gt-rrweb`), the GitHub Action, and the MCP server (`@generaltranslation/mcp`). | `generaltranslation/gt` (Sanity, rrweb, MCP), `$GT_CLOUD/packages/integrations` (hosted connectors such as Google Drive and Storyblok), `generaltranslation/translate` (the Action) |

The React libraries share one API. `<T>` wraps a block of static JSX, and `<Var>`, `<Num>`, `<Currency>` and `<DateTime>` mark its dynamic parts. `gt()` translates a string, `msg()` marks strings in a data array, and `<Tx>` and `tx()` translate content at runtime in server code. The usage rules, including `const gt = useGT();` and `await getGT()` in async server code, are in [gt-components](../../skills/gt-components/SKILL.md) and gt-cloud's `AGENTS.md`.

## 4. Context

Context reaches a translation through three layers: the Organization, then the Project, then the Component (Kevin's outline of 2026-07-30; the dashboard guide [Defining context for translations](https://generaltranslation.com/docs/platform/dashboard/guides/defining-context-for-translations), read 2026-10-05). Each layer is inherited by the one below it.

| Layer | What sets context there |
| --- | --- |
| Organization | Context Groups live at the Organization level. A Context Group pairs a Glossary with Custom Prompts. |
| Project | A project applies one or more Context Groups in priority order. The top group wins where two groups overlap, and newly generated terms are saved to it. |
| Component | `<T context="...">` sets context for one block. `gt()` and `getGT()` take a `$context` option. `$context` on `<T>` is a deprecated alias. |

- The Glossary holds terminology: product names, brand names, feature names, technical terms and phrases that stay untranslated. Its standing example is that Locadex is never translated in any locale.
- Custom Prompts hold style: tone, audience, formality, conventions and formatting. A prompt applies to every locale or to one. Kevin's July outline called this half Directives, and the importer still accepts exports that use that label. The dashboard, the API and the pricing page call it Custom Prompts (2026-10-05), and copy uses that name.
- Kevin's component example, from the 2026-07-30 outline: `<T context="notification popup, not bread">Click the toast to dismiss</T>`.
- An edit to a Context Group applies to new translations. The Apply button on a project's Context page updates existing translations with chosen Glossary terms.
- The Context Management API (`org:context:read` and `org:context:write`) and its MCP tools automate groups, terms and prompts.

## 5. Enterprise and plans

Plan facts come only from the public pricing page, https://generaltranslation.com/pricing, quoted as it read on 2026-10-10. Plan rules the page does not state, such as what a new account receives, are internal and stay in gt-cloud's `gt-dashboard` skill.

- The lead: "Start for free with usage-based billing. Unlimited projects and users on every plan."
- Starter: "$0", "For individuals and small teams". It lists unlimited projects, users and languages, the Translation Editor, the GitHub Integration, the Locadex AI Agent and usage-based pricing, with a Get Started button.
- Enterprise: marked Recommended, "For large teams with complex localization needs". It lists unlimited projects, users and languages; "Dedicated FDE hours to build any workflow for your use case."; "Custom integrations, webhooks, and tailored automation."; and "SSO, RBAC with custom permissions, SOC 2 and ISO 27001 certificates", with a Contact Us button.
- The comparison table: a Platform Fee of $0 on Starter and Custom on Enterprise, and Usage Rates that link to https://generaltranslation.com/pricing/usage on Starter and read Custom on Enterprise. Its rows name the core products (Locadex AI Agent, Custom Workflows, Translation CLI, Context Platform, Translation CDN, Version Branching), the platform (languages, projects and users unlimited on both plans, Context Groups, Keyword Glossary, Custom Prompts, Translation Editor, Custom Roles, Webhooks, SOC 2 Type II and ISO 27001 certification, SSO over SAML and OIDC) and support (GitHub, email, Discord, Slack and phone). The table marks which plan has each row with icons, so copy that says which plan includes a row reads the live page first.

The comparison table follows the cards directly (Kevin, 2026-08-15), and the page's diagram sits below the plans. The money format on pricing pages is gt-landing-pages' whole-dollar rule.

Kevin set the four enterprise pillars on 2026-08-15, and the enterprise page carries them (read 2026-10-05). His list named the third pillar Forward-deployed engineers, and the live page heads it Forward-Deployed Support, the name copy uses.

| Pillar | Copy |
| --- | --- |
| Security and governance | SSO, SOC 2, ISO 27001, audit logs, and custom roles. The pricing table adds SSO over SAML and OIDC, SOC 2 Type II and RBAC with custom permissions. |
| Enterprise platform | Share translation context, glossaries, and custom prompts across every project and content source in your company. |
| Forward-deployed support | Dedicated FDE hours with localization engineers to set up your system and bring localization to production. |
| Custom workflows | Reliable, scalable translation workflows across any file format or framework. Custom integrations, webhooks, and tailored automation. |

- The enterprise page's section order is governance and SSO, translation review, shared context across teams, forward-deployed support, then the contact form (Kevin, 2026-08-16). A change to the page's sections follows that order.
- Features grouped under one heading share one purpose (Kevin, 2026-08-15).
- The enterprise hero has one button. Kevin cut its second button, Talk to an Engineer, on 2026-08-15.

## 6. Copy that must be exact

| Topic | What copy says | Source |
| --- | --- | --- |
| Layout per language | "Dynamic layout for each language". GT rearranges components for a language, such as right-to-left order for Arabic. The components themselves stay unchanged. | Kevin, 2026-08-06: "technically we dont alter components, but can rearrange them dynamically like for arabic" |
| Review surfaces | "Review and approve with your team, over web, API, or CLI." Copy names all three surfaces, because enterprises judge vendors on agent readiness. | Kevin, 2026-08-06: "from one surface implies that we're forcing you to use our dashboard" |
| Formatting | "Numbers, currencies, dates, plurals, and more", with no "edge cases handled" lead. | Kevin, 2026-08-06 |
| Delivery | "Served using a global, low-latency translation CDN." and "Push over-the-air updates without redeploying your app." Translations can also ship with the code, so the home page's delivery band reads "Served from local files or the edge" (read 2026-10-05). Copy that describes delivery in general names both paths. | Kevin, 2026-08-15, for the enterprise page's delivery panel |
| Enterprise voice | "Every company's localization needs are different. General Translation adapts to your existing stack, workflows, and review process." The customer uses the platform with its own team or alongside GT's forward-deployed engineers. A line that implies GT's team is better than the customer's is cut, and gt-voice holds the register. | Kevin, 2026-08-15 |
| Localized heroes | Each locale's hero line is idiomatic and carries the exact meaning in that language and culture. A locale route such as `/ja` opens with its hero sentence and diagram in that locale. | Kevin, 2026-08-08 |
| Geography | Content about places is organized by language. It names no country or territory, draws no borders, takes its facts from CLDR, and treats disputed areas through one policy. | Kevin, 2026-10-03: "avoid political sensitivity without making it look forced" |
| Infrastructure diagrams | Edge nodes carry real cloud region names such as `us-east-1`, shortened where a label would clip. | Kevin, 2026-08-06 |
| Names | Product tokens keep their exact form (`gt`, `gt-next`, `gt login`), Locadex is never translated, and the naming table is BRAND.md section 1. | BRAND.md, gt-voice |
| Public facts | Customer names come only from BRAND.md section 9. No surface states funding, revenue, headcount or the timing of an unannounced launch. | gt-brand section 8 |

## 7. CLI and agent entry points

The CLI facts below come from the start prompt served at `/agent-prompt.md` (read 2026-10-05) and from the CLI source on `generaltranslation/gt` origin/main. A coding agent ran the prompt end to end on a fresh Next.js app on 2026-09-25 with gt 2.22.3 and again on 2026-09-30 with gt 2.23.1. The published CLI was 2.25.1 on 2026-10-05.

- `gt login` signs the CLI in with the person's GT account. It opens GT's sign-in page in the browser and shows a confirmation page when sign-in completes. `gt login --no-browser` prints a sign-in URL and a code to use on any device, and an SSH session takes that path by default. `gt whoami` reports the signed-in account.
- Public writing explains how to sign in and use the product. It leaves out how the CLI obtains, stores or refreshes its tokens, which is the public authentication boundary in the `AGENTS.md` of `generaltranslation/content`.
- `gt translate --dry-run` shows the scope, and `gt translate` translates it. With translations stored in the repository, the run writes `public/_gt/<locale>.json`, `gt-lock.json` and a `_versionId` in `gt.config.json`.
- `gt init` and `gt configure` ask any unanswered question through an interactive prompt and wait with no timeout. An agent passes `--no-interactive` (or `--json`, which implies it) and a flag for every question. A missing answer then exits 1, lists the flags still needed and changes no file. Kevin asked on 2026-10-01 that agents always run the CLI this way.
- The CLI has no `--version` flag. `npm view gt version` gives the published version, and the `translate` banner prints the installed one. `gt auth` is not a command in current releases.
- A development key belongs in `.env.development.local`, which `next dev` loads and `next build` does not. A production `next build` refuses to run with a development key present.

The docs serve agents directly (gt-cloud #4499, merged 2026-09-10). gt-website's `references/docs.md` holds the routes behind them.

- `/llms.txt` is the curated entry point, `/llms-index.txt` lists every page, and `/openapi.yaml` is the API specification. `/llms-full.txt`, scoped `/docs/<scope>/llms.txt` files, `/AGENTS.md` and `/sitemap.md` sit beside them.
- Appending `.mdx` or `.md` to a docs page URL returns the page's raw Markdown twin.
- Every docs page's Copy page menu carries the llms.txt entries (Kevin, 2026-09-11).
- The hero's second button is Setup for Agents (gt-cloud #5049, merged 2026-10-01). It copies the start prompt, whose one source is `docs/en-US/overview/for-coding-agents.mdx` in the content repository. The same text is served raw at `/agent-prompt.md`. After any change to the prompt, the CLI or the quickstarts, the prompt is run end to end by a coding agent on a fresh app. Kevin, 2026-09-30: "Agent experience (AX) is a huge deal for us".

The start prompt sets these onboarding rules for an agent (read 2026-10-05):

1. Inspect the repository before asking anything: framework, router, app directory, existing i18n library, GT configuration, source language and build scripts.
2. In a monorepo, choose the app or content directory and run setup there. Setup never runs at the workspace root.
3. Ask for missing decisions one at a time: the source language, the target languages, then the first page or workflow. When the project itself is unclear, ask one question ("What would you like to translate?") with concrete choices.
4. Preserve existing locale choices and reuse an existing i18n setup. The source language is never assumed to be English.
5. Sign in with `gt login`. The agent never asks for a pasted API key, a password or OAuth tokens, and it writes new keys to ignored files without printing them.
6. Carry the work through setup, translation and verification, then hand off what changed, the project and locales, what was verified and what the person still has to do. Auto-merge and paid plan changes wait for the person's direction.

## 8. Repositories

| Repository | Visibility | What it holds |
| --- | --- | --- |
| `generaltranslation/gt-cloud` | private | The turbo and pnpm monorepo: the dashboard, landing, API, workers, AI proxy, edge, Locadex and admin apps, and the shared packages (`packages/ui`, `db`, `node`, `settings` and others). |
| `generaltranslation/content` | public | Docs, blog posts and devlogs, mounted at `apps/landing/content` as a submodule. Every landing deploy checks out the tip of content main (`$GT_CLOUD/scripts/deploy-landing.sh`), and a merge to content main triggers a deploy. |
| `generaltranslation/legal` | public | The legal pages, a pinned shallow submodule at `apps/landing/legal`. |
| `generaltranslation/gt` | public | The CLI, the JavaScript libraries, the core library, the compiler, the MCP server and the Sanity and rrweb plugins. |
| `generaltranslation/gt-python` | public | The Python SDKs. |
| `generaltranslation/translate` | public | The GitHub Action. |
| `Kevin-Liu-01/Prototemplate` | public | The design hub and public reference behind prototemplate.com: BRAND.md, DESIGN.md, the deck, the skills and this handbook. |

File-level maps stay with their owners: gt-cloud's `AGENTS.md` and `.agents/skills` (`gt-landing`, `gt-dashboard`, `gt-api`, `gt-admin`), [gt-website](../../skills/gt-website/SKILL.md) for the landing and [gt-brand](../../skills/gt-brand/SKILL.md) for the identity files.

## 9. Site behaviour

[gt-website](../../skills/gt-website/SKILL.md) owns the site's routing. Its `references/docs.md` holds the unsupported-locale redirects, the docs near-miss ladder and suggestion page (gt-cloud #4359), the markdown twins and the step order in `src/proxy.ts`. The rules below are not in that reference. Each was read on gt-cloud's origin/main and checked on production on 2026-10-05.

- Staging builds translate one locale. `apps/landing/staging.gt.config.json` lists `es` only, and `gt.config.json` keeps the production roster (`es`, `fr`, `zh`, `ja`, `it`, `ru` and `en-GB` beside `en-US`). Kevin, 2026-08-08: "only es for staging".
- Missing localized content falls back to en-US. A legal page renders the en-US copy in place, an untranslated docs page serves the default language, and a blog slug absent in a locale redirects to the en-US post. Kevin, 2026-08-17: "fix pages that are breaking from like en-GB".
- The docs suggestion page answers HTTP 200 with `noindex, nofollow` by design (gt-cloud #4359). A real 404 needs the not-found boundary, and under the force-static root layout that boundary never sees the requested slug. The blog checks frontmatter aliases and close matches before it renders its own suggestion page.

## 10. Public surfaces

Every address below answered HTTP 200 on 2026-10-10. [BRAND.md](../../BRAND.md) section 8 says how the identity applies to each kind of surface.

| Surface | Address |
| --- | --- |
| Home page | https://generaltranslation.com |
| Pricing and usage rates | https://generaltranslation.com/pricing, https://generaltranslation.com/pricing/usage |
| Enterprise and its contact form | https://generaltranslation.com/enterprise, https://generaltranslation.com/enterprise/contact |
| Careers and contact | https://generaltranslation.com/careers, https://generaltranslation.com/contact |
| Documentation | https://generaltranslation.com/docs, with https://generaltranslation.com/llms.txt and https://generaltranslation.com/agent-prompt.md for agents (section 7) |
| Knowledge base | https://generaltranslation.com/kb |
| Blog and changelog | https://generaltranslation.com/blog |
| Supported locales | https://generaltranslation.com/supported-locales |
| Localization report card | https://generaltranslation.com/report-card |
| Legal pages | https://generaltranslation.com/legal |
| Dashboard sign-in | https://dash.generaltranslation.com |
| Social | https://x.com/generaltxn, https://www.linkedin.com/company/generaltranslation/ |
| Open source | https://github.com/generaltranslation |
| Design hub (this repository) | https://www.prototemplate.com, with /brand, /docs, /handbook, /skills, /deck, /motion, /graphics, /marks, /blog and /d/production |
| Companion tooling | https://glyphfield.com, the shader and animation studio behind several graphics and films |

## Sources

- Prototemplate: [BRAND.md](../../BRAND.md) sections 1, 2 and 9; [gt-brand](../../skills/gt-brand/SKILL.md) sections 1, 2 and 8; [gt-website](../../skills/gt-website/SKILL.md) with `references/docs.md` and `references/pages.md`; [gt-voice](../../skills/gt-voice/SKILL.md); [gt-landing-pages](../../skills/gt-landing-pages/SKILL.md); [gt-components](../../skills/gt-components/SKILL.md).
- gt-cloud at origin/main e17fce499 (2026-10-05): `AGENTS.md`, `.gitmodules`, `apps/landing/gt.config.json`, `apps/landing/staging.gt.config.json`, `apps/landing/src/app/[locale]/docs/[variant]/[...slug]/page.tsx`, `apps/landing/src/app/[locale]/blog/[slug]/page.tsx`, `apps/landing/src/lib/legal.ts`, `apps/landing/src/components/landing/sections/global/Global.tsx`, `apps/landing/src/components/pages/enterprise/services-landing/GovernedExplorer.tsx`, `scripts/deploy-landing.sh`, `.agents/skills/gt-landing/SKILL.md`; pull requests #4359, #4499 and #5049.
- `generaltranslation/gt` at origin/main a16ae03c6 (2026-10-05): `packages/`, `packages/cli/src/cli/base.ts`, `packages/cli/src/auth/__tests__/oauth.test.ts`, `packages/cli/src/cli/__tests__/initOnboarding.test.ts`, `packages/core/src/runtime.ts`, `packages/next/src/server.ts`, `packages/next/src/index.types.ts`.
- `generaltranslation/content` at origin/main (2026-10-05): `AGENTS.md`, Public authentication boundary.
- generaltranslation.com, read 2026-10-10: `/pricing` (section 5) and the addresses in section 10, each fetched with curl. Read 2026-10-05: the home page, `/en-US/pricing`, `/en-US/enterprise`, `/en-US/careers`, `/ja`, `/llms.txt`, `/llms-index.txt`, `/agent-prompt.md`, `/openapi.yaml` and the docs guide Defining context for translations.
- npm and PyPI package pages, and the public repository list of the `generaltranslation` GitHub organization, read 2026-10-05.
- Kevin's rulings: the full stack, the barbell and the challenger sale, and the context layers (2026-07-30); layout, review surfaces, formatting and region names (2026-08-06); locale heroes and staging (2026-08-08); showing over telling (2026-08-11); the mission text (2026-08-14); the enterprise pillars and CDN copy (2026-08-15); the enterprise order and the pricing cards (2026-08-15 and 2026-08-16); en-GB routing (2026-08-17); the copy page menu (2026-09-11); the agent button and AX (2026-09-30); the interactive CLI (2026-10-01); geography by language (2026-10-03).
- The list of brand surfaces sent to the brand agency on 2026-09-04, from which section 10 is rebuilt and checked against the live addresses.
