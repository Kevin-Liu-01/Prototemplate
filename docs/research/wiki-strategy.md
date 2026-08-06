# GT Wiki & Strategy Distillation — Input for Marketing Website Redesign

Sources: `company/README.md`, `company/AGENTS.md`, `important/culture.md`, `important/links.md`, `strategy/2025/company-explained-from-first-principles.md`, all of `strategy/2026/*.md`, `pricing/README.md`, `pricing/current-pricing.md`. Quotes are verbatim from these documents.

---

## 1. What GT is, and its product lines (plain words)

**General Translation, Inc. (GT)** is an i18n/localization infrastructure company. Mission (verbatim, culture.md): **"Our mission is to bring the world's best products to the whole world. Every developer should be able to launch every product in every language."**

The two halves of the business (platform-and-pricing.md):

> "We create open-source developer libraries for internationalization (think 'Next.js') / We create an AI platform for localization (think 'Vercel')"

The explicit self-model is the **Next.js ↔ Vercel relationship**: free open-source libraries + a paid usage-based platform that is unbeatable because GT builds both.

### Product lines

1. **Open-source SDKs (gt-next / gt-react, gt-python, CLI, GitHub Action)** — i18n libraries that translate UI **inline**, "rather than forcing developers to extract strings. This means no painful refactors and no managing large JSON files." Free and open-source, in the public `gt` repo. Deliberately designed to be easy for AI agents to understand and install.

2. **Translation CDN / Edge delivery** — translations are served from a CDN (the `edge` app runs on Cloudflare Workers). The infra half: "making sure that the right translations reach the right people at the right time." Includes version branching (translations per branch/preview deployment).

3. **Translation APIs / Translation Workflows** — usage-priced translation of content (Markdown, HTML, JSON, ICU, etc.). A workflow is a flowchart of atomic **steps** ("Translate Markdown in-context with gpt-5.4", "Proofread…", "Regenerate glossary of key terms", "Wait for a human to approve"). Deterministic pricing per token, known in advance. Sync or async.

4. **Locadex — the AI agent (flagship)** — "Our flagship product is an AI agent called Locadex, which integrates with your codebase via GitHub app." What it does: "Open a PR to set up internationalization in your project / Open a PR to keep translations in sync on your default branch / Open a PR to add a new language to your project / Open a PR to fix broken internationalization code." Also (current-pricing.md): "Scans repos, updates i18n code, generates translations, runs visual QA, opens guarded PRs." Pitch line worth reusing: **"Just connect a GitHub repo and your app is translated, in native speed and quality, with zero engineering bandwidth."** And: **"Locadex is like an entire multimillion dollar localization department for every developer."** Priced in LCUs (Locadex Compute Units); always async; has side effects (GitHub, Slack, Google Docs).

5. **Context Platform + Translation Editor (Dashboard)** — glossaries, style guides, custom prompts, editing, versioning, integrations. The editor is a source→target side-by-side editor supporting "markdown in addition to our custom JSX data format, ICU messages, JSON, YAML, every localization string format, and even arbitrary coding languages." Vision: "Imagine highlighting a section of the text in English and having a language model highlight the corresponding section in Spanish." Long-run framing: "an SDK which serves content, a dashboard to create and edit it, and a CDN to serve it… **it looks a lot like a CMS**" (TMS ⊂ CMS as 'T' ⊂ 'C'). Supports scoped permissions (e.g. "a Japanese translator whose permissions are scoped only to Japanese files").

### The four-stage platform table (current-pricing.md, good for a website section)

| Product | What it does |
|---|---|
| **Internationalization** (Code) | Mark up UI copy, route locales, ship static translations in your codebase |
| **Translation APIs** (Content) | Translate user-generated and backend content on demand |
| **Context Platform** (Dashboard) | Glossaries, style rules, project context, editing, versioning, integrations |
| **Locadex Agent** (Automations) | Scans repos, updates i18n code, generates translations, runs visual QA, opens guarded PRs |

### Workflows vs. Automations (the two billable activities)

- **Translation workflows**: no side effects, priced deterministically by input size (tokens/images/pages), sync or async.
- **Locadex automations**: side effects via integrations, priced in LCUs ("a unified measure of resource costs which cannot be known in advance"), async only.
- "An automation can invoke a translation workflow… The reverse is not true."

---

## 2. Positioning and differentiation

### The core thesis (first-principles doc, 2025 — Archie McKenzie)

Seven numbered truths, all verbatim and all usable as website narrative spine:

1. **"The world's best products should be available to the whole world"**
2. **"Now is a better time than ever to launch a global software product"**
3. **"Translations have to reflect the logic of an application"** (why client-side/browser AI translation is the wrong endgame — the DOM updates faster than an LLM can run; browser translation makes "patchwork pages, half in one language, half in another… An i18n library will never do this.")
4. **"The hard part about translation is no longer model quality, but context and infrastructure"**
5. **"The decacorn translation company will be built like a world-class developer infrastructure startup"** — "It will look more like Stripe or Vercel than anything in the localization industry."
6. **"Software localization is the perfect starting point for tearing down language barriers altogether"**
7. **"Internationalization is a foothold into everywhere AI interacts with UI"** — 'Like Stripe was "financial infrastructure for the internet", General Translation can be "language infrastructure for the internet".'

### Differentiation vs. the legacy stack

- GT's "killer advantage is that we build a full localization stack" — the stack replaces three legacy tools: **i18n library + TMS + translation provider** (the-infra-pricing-mindset.md). No one else combines them; combining them "lets you do what's important — context and infrastructure — much more effectively."
- **vs. translation APIs (DeepL)**: not direct competitors; they compete on raw model quality against hyperscalers, GT competes on **context engineering** — "We pride ourselves on our ability to rely on any model provider… because it reflects how good we are at context engineering."
- **vs. TMS (Lokalise, Phrase, Smartling, Lilt, WeGlot)**: TMS sells seats/collaboration, is "heavy on process, light on content." GT sells **automation, not collaboration**: "the breakthrough AI localization product will be about automation, not collaboration. It will sell usage to technical leaders, not seats to content leaders."
- The buyer has changed: "the decision maker on that purchase is now the technical founder or engineering lead, rather than a content lead or 'international experience' executive."
- Opinionation as a feature: "General Translation, Inc. — is highly opinionated. We care that translations are context aware. In fact, we'll do inference and quality assurance for you. We care about how you implement i18n. In fact, not only will we write our own i18n libraries, but we'll deploy our own AI agents to maintain your installation."
- Why translations get better with GT: "we can do inference in advance to determine author, audience, tone, and key terms, referencing them to make sure translations are idiomatic and consistent." (GPT-4-level models are rarely wrong grammatically; failure modes are "sounds robotic, mixes up definitions for ambiguous words, and translates keywords inconsistently.")
- The **Translation Trilemma** (speed / cost / quality) — GT resolves it per-customer, even per-content-type "within the same application" (UI chrome high quality; user posts fast/cheap).
- Agent-delivery insight: "the medium for delivering translations is the same as the medium for delivering codegen" — the GitHub app. "We are a dev tools company and God has granted us the ability to inject our dev tool directly into our users' codebases."
- Stickiness: "we're essential infrastructure integrated into hundreds of files in complex codebases."
- Social proof available: Guillermo Rauch (Vercel CEO) complimented the team's **"insane engineering prowess."** Named customer in strategy docs: **ClickHouse** (runs a 20-minute post-process command in a Locadex workflow).

### Important competitive-messaging rule (culture.md — binds website copy)

> "Because competitors are insignificant, we don't talk about them or compare ourselves to them when communicating to our customers, unless directly asked. (It is fine to reference alternative open-source libraries, but not competitive companies or products.)"

**The website must not name or compare against Lokalise/Phrase/DeepL/etc.** Referencing open-source alternatives (e.g. i18next) is acceptable.

Also: "Copy the companies you admire, not companies you hate." The admired companies are explicitly **Stripe, Vercel, Mintlify, Cursor, Cognition, Anthropic** — design and positioning references, not localization incumbents.

---

## 3. Voice, culture, and brand values

From culture.md (the closest thing to a brand values doc):

- **Mission-led, engineering-first**: "Engineering is our core competency. We build a full stack localization product — applying our 'insane engineering prowess'… as low in the tech stack or as high in the tech stack as we need to create a 10x customer experience."
- "Almost every 'intractable' business problem can be solved by figuring out an underlying technical or design problem instead."
- **AI-native identity**: "We build our company to be worked on by AI as much as by humans." — "Prior approach: Infrastructure as Code. Our approach: **Company as Code**." — "'I have seen the future, and it is agentic' — Brian Lou". Product corollary: "We build our products to be used by AI as much as by humans." and "We build 'future-compatible' software."
- **Product design principles (§4 — directly applicable to web design)**:
  - "We make reliable infrastructure. **Consistency, simplicity, and speed are more important than flourish.**"
  - "Our key product design principle is **high configurability with strong defaults**."
  - "**Every extra click kills user experience.** We shouldn't be afraid to choose default settings or do convoluted engineering work if it reduces time to a magic moment."
- **Culture texture** (for tone, not necessarily copy): mountain-climbing metaphor ("A few steps in the right direction every day is better than going rapidly in circles"), high-performing athletic team, "player vs environment" company, no blame / no excuses, infrastructure means 24/7 ("we're an infrastructure company, which means we're open 24/7. and we're a startup, which means sometimes we push" — quoted from Browserbase's Paul Klein), SF-based, five days in office, "Do the work in advance… Run to where the ball will be."
- **Abundance mindset** (infra-pricing doc — a genuine brand value): "Infrastructure companies have an abundance mindset. Vercel wants you to deploy more… GT doesn't want to translate your website once. We want to translate it on every preview deployment and whenever you change context. **We want translation abundance.**"

**Implied voice for the website**: confident, technical, declarative, first-principles; developer-infra register (Stripe/Vercel/Linear school); no competitor mudslinging; no fluff or flourish; opinionated and specific.

---

## 4. The product story the website must tell (narrative order)

Derived from the first-principles doc's own argument structure — a good page/scroll order:

1. **Mission hook** — "Bring the world's best products to the whole world." Every developer, every product, every language. Now is the best time ever to launch globally (AI hits "most global regions simultaneously").
2. **The insight** — "Translations have to reflect the logic of an application." Translation belongs at buildtime, in your code, not bolted on in the browser. "The hard part about translation is no longer model quality, but context and infrastructure."
3. **Start with the open-source SDKs** — gt-next/gt-react translate UI inline: "no painful refactors and no managing large JSON files." The world's best i18n library, and uniquely legible to AI agents.
4. **Automate with Locadex** — the flagship. "Just connect a GitHub repo and your app is translated, in native speed and quality, with zero engineering bandwidth." An agent that opens guarded PRs: sets up i18n, keeps translations in sync, adds languages, fixes broken i18n code, runs visual QA. "Like an entire multimillion dollar localization department for every developer."
5. **Control with the Context Platform + Editor** — glossaries, style guides, custom prompts; side-by-side source→target editing across every format; scoped permissions for translators; versioning and branch previews. High configurability, strong defaults; opinionated QA done for you.
6. **Ship via infrastructure** — Translation CDN, version branching, translation on every preview deployment. Translation abundance, not translation scarcity.
7. **Pricing** — usage-based like infra should be (see §5). Two plans, no seat-selling.
8. **The horizon** (for an about/vision page) — "language infrastructure for the internet"; everything in every language from Day One.

The four-stage table (Code → Content → Dashboard → Automations) is the cleanest "platform overview" module for the site.

---

## 5. Pricing essentials for a landing page

Current live model (pricing.md June 2026 + current-pricing.md — note: **generaltranslation.com/pricing is the declared source of truth**; the wiki summary defers to the website):

- **Two plans: Starter and Enterprise.**
- **Starter — from $0.** "Unlimited projects, unlimited users, unlimited languages." Pay-as-you-go, credit burndown. No-card users are rate-limited; "Connecting your credit card and making your first payment unlocks your organization." Includes: per-workflow usage pricing, Translation Editor, GitHub Integration, Locadex AI Agent, Context Platform, open-source SDKs, Translation CLI, Translation CDN, version branching; support via GitHub, email, Discord.
  - Marketing/docs split on limits (verbatim guidance): marketing says "Unlimited projects"; docs say "99 available immediately. Need more? Request an increase."
- **Enterprise — contact sales / custom everything.** Everything in Starter plus: custom integrations, custom SLA, custom pricing and usage rates, custom roles, webhooks, SSO (SAML & OIDC), RBAC, SOC 2 Type II and ISO 27001 certification, Slack and phone support, **forward-deployed engineers**, performance SLA, FDE hours. Enterprise line-item structure: flat platform fee + price per token for a flagship translation workflow (with included tokens) + price per LCU (with included units).
- **How usage is charged**: per **workflow**. Translation workflows priced **per token** — "the only metric relevant to the end user in most cases is cost per token, which can be trivially known in advance." Agent workflows priced in **LCUs (Locadex Compute Units)**, based on lines changed, files touched, and codebase size. Context (glossaries/style guides) slightly increases cost per token, with a transparent displayed breakdown (base cost + context cost).
- Design principle behind the display: charge for **whole workflows GT designed** (e.g. a "Markdown Translation" product), not internal steps — "customers want a minimal number of line items to reason about."
- Strategic notes (internal, shapes emphasis): "95+% of our revenue comes from Enterprise Plans"; "Our self-serve plans should not anchor pricing for our enterprise users"; "Our self-serve plans should encourage our users to sign up." → The landing page's job for Starter is **signup volume**, and the pricing page should funnel serious teams to sales.
- Pricing philosophy worth a sentence on the page: usage over seats ("sell usage to technical leaders, not seats to content leaders"), abundance over scarcity ("We want translation abundance"), setup "isn't a cash cow, it's something to be catalyzed away with AI agents."

---

## 6. Explicit statements about design, brand, website, marketing

- **Design bar / references** (translation-editor.md): Mintlify's design rated "A+, even better than other companies with great design like Vercel," and "'their editor is great'… is downstream of 'their dashboard is great', which is probably downstream of 'their design is great'." → GT explicitly benchmarks design against Mintlify and Vercel. Combined with culture.md's "Copy the companies you admire": design references are Mintlify, Vercel, Stripe.
- **Product design principles that should govern the site** (culture.md §4): "Consistency, simplicity, and speed are more important than flourish"; "high configurability with strong defaults"; "Every extra click kills user experience… reduces time to a magic moment."
- **Competitor rule for all customer communication** (culture.md §3): never name or compare against competitive companies/products unless directly asked; open-source library references are fine.
- **Brand assets** (links.md): canonical logos live in the public `content` repo, `logos/` directory — GT marks, banners, wordmarks and Locadex marks, banners, wordmarks; "Each collection includes light and dark variants, with and without backgrounds, in PNG, SVG, and ICO." The wiki README itself uses `generaltranslation.com/brand/gt-logo-light.svg` / `gt-logo-dark.svg` with a prefers-color-scheme picture element — light/dark theming is an established brand practice.
- **Two-brand system**: GT (company/platform) and **Locadex** (the agent) each have full logo/wordmark sets — Locadex is treated as a named sub-brand the website should feature.
- **Pricing page authority** (pricing/current-pricing.md): "Source of truth: generaltranslation.com/pricing… If anything here conflicts with the website, the website wins." The website is the canonical pricing surface — accuracy there matters.
- **Marketing copy guidance found**: the "Unlimited projects (marketing)" vs. docs phrasing split in pricing.md — an explicit instruction on how marketing language may round up while docs stay precise.
- **Website content ecosystem** (links.md): `content` repo (public) holds "Developer documentation, blog posts, and devlogs for generaltranslation.com"; `media` repo holds "Media and asset storage supporting documentation and marketing content." GT built its own docs framework in-house ("I'd argue it's better than off-the-shelf Mintlify in many ways").
- No explicit brand color/typography/tone-of-voice document was found in the files read; voice must be inferred (see §3).

---

## Copy bank — verbatim phrases worth reusing

- "Bring the world's best products to the whole world."
- "Every developer should be able to launch every product in every language."
- "The world's best products should be available to the whole world."
- "Now is a better time than ever to launch a global software product."
- "Translations have to reflect the logic of an application."
- "The hard part about translation is no longer model quality, but context and infrastructure."
- "Language infrastructure for the internet."
- "Just connect a GitHub repo and your app is translated, in native speed and quality, with zero engineering bandwidth."
- "Like an entire multimillion dollar localization department for every developer."
- "No painful refactors and no managing large JSON files."
- "High configurability with strong defaults." / "high configurability but strong defaults"
- "Consistency, simplicity, and speed are more important than flourish."
- "Every extra click kills user experience."
- "We want translation abundance."
- "Automation, not collaboration." (from "will be about automation, not collaboration")
- "Sell usage to technical leaders, not seats to content leaders."
- "Everything can be in every language from Day One."
- "Insane engineering prowess" — Guillermo Rauch (Vercel CEO), attributed quote.
- "Unlimited users, projects, and languages."
- "Scans repos, updates i18n code, generates translations, runs visual QA, opens guarded PRs."
- "Mark up UI copy, route locales, ship static translations in your codebase."
- "We build our products to be used by AI as much as by humans."
