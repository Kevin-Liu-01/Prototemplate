# GT Company Wiki Research — Standards, Voice, and Brand Signals for the Website Redesign

Sources: company wiki checkout at `scratchpad/company/` — `standards/`, `conventions/`, `guides/`, `sales/`, `people/company/`, `important/` (culture, departments, links, company-details), `policies/internal/engineering-titles.md`, `policies/operations/` (in-office, locked-in), `pricing/`, `strategy/2025-2026/`. Skipped: compliance/, vendors/, legal/, hiring/.

---

## 1. Company snapshot

- **Legal name:** General Translation, Inc. (Delaware C-corp, EIN 93-4628017). Everyone calls it **GT**.
- **HQ:** 44 Montgomery St, Suite 830, San Francisco, CA 94104 (a WeWork building; they have gym and bike-room access — a scrappy-but-real SF office).
- **Mission (verbatim, used everywhere):** "Bring the world's best products to the whole world. Every developer should be able to launch every product in every language."
- **What it is:** A full-stack localization/i18n company — open-source i18n libraries + AI translation platform + an AI codegen agent (Locadex). Self-described as developer infrastructure, explicitly modeled on Stripe and Vercel, NOT on the localization industry.
- **Board:** Archie McKenzie (CEO, 2 votes), Aditi Maliwal (GP, Upfront Ventures), Martín Casado (GP, a16z), Brian Kernighan (Professor, Princeton). Kernighan on the board is itself a brand signal — deep engineering credibility.
- **Named customers appearing in internal sales copy:** Cursor, Ramp, Profound ("used by companies like Cursor, Ramp, and Profound to ship their products in over thirty languages"). ClickHouse appears as a Locadex customer in strategy docs. Vercel CEO Guillermo Rauch is quoted complimenting the team's "insane engineering prowess" — a phrase the culture doc itself embraces.
- **Web properties:** generaltranslation.com (marketing + docs + pricing), dash.generaltranslation.com, admin.generaltranslation.com. Docs quickstarts at `/docs/react/quickstart`, `/docs/next/quickstart`, `/docs`. Community: GitHub (generaltranslation/gt), Discord, X @generaltxn, LinkedIn.

## 2. Team size and character (the site should feel like these people)

`people/company/` has **8 profiles** — this is a tiny, dense, engineering-dominated team:

| Person | Title | Dept | Since |
|---|---|---|---|
| Archie McKenzie | CEO | — | Founding |
| Brian Lou | Founding Engineer / VP of Engineering | Product | Founding |
| Ernest McCarter | Founding Engineer / VP of Engineering | Product | Founding |
| Fernando Avilés-García | Founding Engineer | Product | Jul 2025 |
| Jackie Chen | Founding Engineer | Product | Nov 2025 |
| Ben Gubler | Engineer | Product | Apr 2026 |
| Ian Henriques | Software Engineer | Product | Jun 2026 |
| Taylor Fang | Technical Writer | DX | Jun 2026 |

- ~8 people; 7 of 8 are engineering/DX. Sales and Operations departments exist on paper but have no listed staff — **engineers are the company**.
- Four departments (Product, DX, Sales, Operations); engineering spans Product + DX. Flat titles policy: default title is "Software Engineer" regardless of seniority; VP is the only title below CEO, held by two founding engineers. Policy explicitly resists title inflation (cites Zuckerberg's Facebook leveling approach from *The Hard Thing About Hard Things*): "Titles reflect influence, not hierarchy"; "Product and engineering form the cultural core."
- All in-office in SF, engineers 5 days/week (non-engineers 4). Standup at 10:00am sharp; a tongue-in-cheek "$10/minute lateness" policy (currently active, donated to charity). Most work until ~9:30pm — late stayers get a free **Waymo** ride home. Signing bonus includes **AirPods Max**; wearing them means you're "locked in" and may not be interrupted (a formal company policy).
- Culture doc self-image: a high-performing athletic team / expert mountaineers ("climbing a mountain... one foot in front of the other every single day"), not big-tech work-life balance and not sprint-and-burn startup chaos. 12-hour DM response expectation including weekends because "we're an infrastructure company... operational 24/7."
- "Company as Code": the entire company wiki is a linted, schema-validated Markdown Git repo with agent skills. "We build our company to be worked on by AI as much as by humans." ("I have seen the future, and it is agentic" — Brian Lou.) Onboarding includes asking @Claude in Slack questions answered from the repo.
- No-blame/no-excuses culture (Rockefeller quote); "enthusiastic yes to trying new AI coding tools"; "Do the work in advance — run to where the ball will be."

**Design translation:** the site should feel like a small elite crew of SF infra engineers who automate everything — precise, fast, confident, slightly playful in the details (Waymo rides, locked-in headphones, Moss the OpenClaw agent in `#moss-pager`), never corporate.

## 3. Core messaging pillars (from `strategy/2025/company-explained-from-first-principles.md`)

Archie's first-principles essay ends with seven bolded theses — this is the canonical narrative spine for the site:

1. **The world's best products should be available to the whole world.**
2. **Now is a better time than ever to launch a global software product.** (AI products launch globally all at once; localization is the final piece.)
3. **Translations have to reflect the logic of an application.** (Buildtime i18n beats client-side/browser AI translation — reactive DOM translation breaks dynamic UI, kills SEO/GEO, crashes pages. "An i18n library will never do this.")
4. **The hard part about translation is no longer model quality, but context and infrastructure.** (Models are good enough; GT wins by giving models more context and better infrastructure, not building a better model. Model-agnostic across providers.)
5. **The decacorn localization company will be built like a world-class developer infrastructure startup.** ("It will look more like Stripe or Vercel than anything in the localization industry." Sells usage to technical leaders, not seats to content leaders. Automation, not collaboration.)
6. **Software localization is the perfect starting point for tearing down language barriers altogether.**
7. **Internationalization is a foothold into everywhere AI interacts with UI.** ("Like Stripe was 'financial infrastructure for the internet', General Translation can be 'language infrastructure for the internet'.")

Supporting narrative points used internally:

- Full-stack advantage: nobody else combines i18n library + TMS + translation provider; combining them enables the "10x product experience." GT's React libraries translate UI **inline** — "no painful refactors and no managing large JSON files."
- Because the libraries are AI-legible, Locadex can install them automatically: "Just connect a GitHub repo and your app is translated, in native speed and quality, with zero engineering bandwidth."
- Locadex framing: "like an entire multimillion dollar localization department for every developer."
- Key technical insight: "the medium for delivering translations is the same as the medium for delivering codegen" — the GitHub app.
- Infra pricing mindset (`strategy/2026/the-infra-pricing-mindset.md`): agencies have a scarcity mindset (price per word, as high as possible); **"Infrastructure companies have an abundance mindset."** Vercel wants more deploys, Anthropic wants more tokens, "GT doesn't want to translate your website once. We want to translate it on every preview deployment... We want translation abundance."
- TMS critique (usable as implicit positioning, not naming names on the site — see §5): TMSs sell seats, are "heavy on process, light on content," never touch the hard parts.

## 4. Tone and writing style rules

From sales playbooks + agent skill guardrails + standards:

- **Tone (verbatim from playbook):** "Friendly, confident, concise. No hard sell." Skills add: "technically credible," "direct and confident without dismissing" the customer's concern.
- **Truthfulness discipline is near-obsessive** (from `respond-to-enterprise-lead` skill): never invent customer examples, benchmarks, prices, savings, security controls, or commitments; treat plan names, prices, customer names, and URLs as time-sensitive and verify against current sources; "do not mention a `Team` plan unless a current official source confirms it." Website copy should follow the same rule: every claim verifiable.
- **Lead with capability, then redirect** (human-review objection playbook): when prospects ask about human review/third-party translators, first show GT fully supports human workflows (collaborative editing, labelling, glossaries, locale-/entry-specific instructions, scoped translator permissions on Enterprise), *then* recommend agent-powered translation as better and cheaper. "Confidence in the product wins." Don't be defensive.
- **Never talk about competitors** (culture doc §3): "we don't talk about them or compare ourselves to them when communicating to our customers, unless directly asked. (It is fine to reference alternative open-source libraries, but not competitive companies or products.)" Also: "Copy the companies you admire, not companies you hate" — copy Stripe/Vercel/Mintlify patterns, never Lokalise/Phrase/Smartling patterns.
- **Precision in normative language** (policy-authoring standard, indicative of house style): "must" for requirements, "should" for recommendations, "may" for permission; avoid vague words like "regularly," "periodically," "appropriate." Summaries "state the outcome and intent in plain language." Docs culture: lean metadata, no invented values ("Do not add a guessed value"), link canonical sources instead of duplicating.
- **Communication style** (Slack/meetings conventions): put the request, context, owner, and deadline up front; one subject per message; state urgency explicitly. Translated to web copy: front-load the point, no throat-clearing.
- Email subject-line convention for enterprise replies: `[Their Company] // General Translation` — the `//` separator is a small house-style flourish that could carry into site typography.
- Response SLA culture: reply to enterprise leads within 1 hour during business hours — "fast" is part of the brand promise.

## 5. How they talk to enterprise customers (`sales/`)

- Enterprise pitch line (verbatim template): "GT is the leading stack for internationalization, used by companies like Cursor, Ramp, and Profound to ship their products in over thirty languages."
- Personalize by stack: dedicated paths for i18next migration, Next.js (App Router "out of the box"), and generic React/JS — always link the matching quickstart. The website should segment by framework the same way.
- Enterprise plan components repeated across playbooks and pricing: **custom pricing, Slack and phone support, forward-deployed engineers (FDEs)**, plus RBAC/custom roles, SSO (SAML & OIDC), webhooks, custom SLA, custom integrations, SOC 2 Type II and ISO 27001 certification.
- CTA style: soft — "If that would be helpful, let me know and we will schedule a call." Never a hard sell; always include quickstart + pricing page + enterprise next step.
- Enterprise contracts run on Metronome + Stripe; deals like the a16z portco offer (3 months free + usage credits via `founders@generaltranslation.com`) show they court the a16z portfolio network.
- 95%+ of revenue is Enterprise (2026 pricing strategy), but self-serve exists to drive signups and must not anchor enterprise pricing.

## 6. Product naming conventions

Canonical names (capitalization matters):

- **General Translation** (company/full name), **GT** (short). Twitter handle: @generaltxn.
- **Locadex** — the AI agent, "flagship product." Variously "Locadex AI Agent," "Locadex Agent." Has its own logo set (see §8).
- Open-source libraries: `gt` (monorepo), **gt-next**, **gt-react**, `gt-python` — lowercase code-style names.
- **Translation Workflows** vs. **Locadex Automations** (canonical distinction, `strategy/2026/translation-workflows-vs-locadex-automations.md`): translation workflows are deterministic, priced per token/input size, sync or async, no side effects; Locadex automations are agentic, async-only, side-effectful (GitHub, Slack, Google Docs), priced in **LCUs (Locadex Compute Units)**. Workflows are made of atomic **steps**. Automations can invoke workflows, never the reverse.
- Four-product platform framing (from `pricing/current-pricing.md`):
  1. **Internationalization** (Code) — mark up UI copy, route locales, ship static translations
  2. **Translation APIs** (Content) — translate user-generated/backend content on demand
  3. **Context Platform** (Dashboard) — glossaries, style rules, project context, editing, versioning, integrations
  4. **Locadex Agent** (Automations) — scans repos, updates i18n code, generates translations, runs visual QA, opens guarded PRs
- Other named components: **Translation Editor**, **Translation CLI**, **Translation CDN**, **GitHub Integration**, version branching, keyword glossary, custom prompts.
- **Plans: Starter ($0, pay-as-you-go, unlimited users/projects/languages) and Enterprise (custom).** The 2026 pricing doc explicitly killed the Free/Starter/Team/Enterprise four-tier model; sales guardrails forbid mentioning a "Team" plan. Marketing says "Unlimited projects"; docs disclose the 99-cap + request-an-increase mechanics. **Source of truth for pricing is the website itself** — `pricing/current-pricing.md` defers to generaltranslation.com/pricing.
- Pricing language: per-workflow usage pricing; translation priced per token (with a small context surcharge); "the only metric relevant to the end user in most cases is cost per token." Enterprise = flat platform fee + per-token rate + per-LCU rate with included allotments.

## 7. Engineering culture signals worth expressing visually

- **Open source first:** public `gt` monorepo, docs/blog in public `content` repo, GitHub Action (`translate`), Python lib. Onboarding step one of "Socials" is starring the GitHub repo. GitHub/Discord/X are the community surface — the site should foreground GitHub stars, code, and quickstarts.
- **Agent-native everything:** company repo has `.agents/skills/` for sales, hiring, policy comms; Slack channels for agent pagers (`#locadex-pager`, `#errors-pager`, `#revenue-pager`, `#gtm-pager`, `#moss-pager`); Cursor Automations standard; Claude answering company questions in Slack. A site that demos agents doing the work is on-brand.
- **Infra reliability aesthetic** (culture doc §4, verbatim): "We make reliable infrastructure. **Consistency, simplicity, and speed are more important than flourish.**" And: "We build our products to be used by AI as much as by humans" / "future-compatible software."
- **Key product design principle (verbatim, bolded in culture doc): "high configurability with strong defaults."** Corollary: "Every extra click kills user experience. We shouldn't be afraid to choose default settings or do convoluted engineering work if it reduces time to a magic moment." → website should minimize clicks-to-quickstart and choose strong defaults (e.g., auto-detected framework tabs).
- **Design admiration hierarchy** (`strategy/2026/translation-editor.md`): Mintlify's design rated "A+, even better than other companies with great design like Vercel." Vercel is the structural role model (Next.js:Vercel :: gt:GT platform); Stripe is the ambition metaphor. Combined with "copy the companies you admire": the redesign's reference class is **Mintlify / Vercel / Stripe**, explicitly not localization-industry sites.
- Technical-risk-over-market-risk identity: "engineers whose instincts are to 'invent their way out' of problems"; built own docs framework in-house rather than using Mintlify; wrote own i18n libraries and their own editor ("we're going to have to invent new AI/UI approaches").
- Texture details that could inform art direction or an about/careers page: mountaineering metaphor, locked-in AirPods Max, 10am standup, Waymo rides home at 9:30pm, Thursday dinners, five-days-in-office SF intensity, flat titles.

## 8. Design/brand standards found

There is **no formal brand book** in the wiki. What exists:

- **Canonical brand assets** live in the public `content` repo: `github.com/generaltranslation/content/tree/main/logos` — GT logos (base marks), GT banners (horizontal), GT wordmarks ("with-text"), plus a parallel **Locadex** logo set. Every collection ships **light and dark variants**, with and without backgrounds, in PNG, SVG, and ICO.
- Live logo URLs used in the wiki README: `https://generaltranslation.com/brand/gt-logo-light.svg` and `gt-logo-dark.svg`, swapped via `prefers-color-scheme` — dark/light theme support is an existing brand expectation.
- The gt-cloud repo (working dir) has `apps/landing` with a `gt-landing` skill — the current site is a Next.js app in the product monorepo.
- Implicit design standards from culture + strategy (the closest thing to brand principles):
  - Consistency, simplicity, speed over flourish.
  - High configurability, strong defaults; minimize clicks to the magic moment.
  - Dark/light parity everywhere (logo sets, README pattern).
  - Reads as developer infrastructure (Stripe/Vercel/Mintlify class), never as a localization/agency site.
  - Built to be parsed by AI as well as humans (clean semantics, machine-readable structure — Taylor's DX work emphasizes sitemaps, cross-links, machine-readable docs structures).
  - UI screenshots required for visual PRs; the site itself will be reviewed that way (engineering best practices).
- i18n dogfooding is mandatory in the product codebase (`gt-next` `<T>` component and `useGT()` per gt-cloud CLAUDE.md) — the redesigned site must itself ship in many languages; "the site is the demo."

## 9. Messaging dos and don'ts (condensed)

**Do:** lead with the mission ("every product in every language"); frame GT as language infrastructure for the internet; segment by framework with instant quickstarts; show Locadex opening real PRs; cite Cursor/Ramp/Profound and 30+ languages; keep tone friendly-confident-concise; expose exact per-token pricing (abundance mindset, deterministic costs); offer Enterprise with FDEs/SSO/SOC 2/Slack support and a soft "talk to us" CTA; support dark mode; translate the site itself.

**Don't:** name or compare against competitors (Lokalise, Phrase, Smartling, DeepL, WeGlot stay internal); hard-sell; invent metrics, customers, or benchmarks; mention a "Team" plan; anchor enterprise pricing with self-serve numbers; use vague enterprise-speak ("appropriate," "robust," "seamless"-style filler contradicts their precision culture); position as a TMS or agency; add flourish at the cost of speed/simplicity.

---
*Compiled 2026-07-28 from the internal company wiki for the marketing site redesign.*
