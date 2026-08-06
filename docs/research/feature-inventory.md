# GT Feature Inventory — what the product actually does, and how to *show* it

Purpose: the definitive list of General Translation capabilities, written so a page can **demonstrate**
each one rather than describe it. Feeds five new minimalist page designs.

Governing rule from `PRESENTATION_BRIEF.md`:

> "We want to focus on showing off the cool features of the product… fill it with really engaging,
> easy-to-understand, conveying-the-point animations and graphics and diagrams."

So every entry below carries a **proof** — the concrete visual thing that lands in two seconds with no
caption — and a **misunderstanding** the diagram must pre-empt. Claims are written in GT's voice
(declarative, technical, no filler, no competitor comparison — per `wiki-standards.md` §4/§9).

## Sources of truth used

| Kind | Where it came from |
|---|---|
| Copy, customers, section order, code panels | `research/landing-content.md` (clean checkout of `apps/landing`) |
| Positioning, voice, pricing philosophy | `research/wiki-strategy.md`, `research/wiki-standards.md` |
| Narrative beats already agreed | `research/STORYBOARD.md` |
| Module structure for the presentation | `research/PRESENTATION_BRIEF.md` |
| API surface, flags, dashboard flows | live docs via the GT docs MCP (`generaltranslation.com/…/docs/**.mdx`) |
| Real code, real output files, real locale tags | `/Users/kevinliu/gt/gt` (OSS monorepo), `/Users/kevinliu/gt/gt-cloud` |

### Verified artefact sources you can copy verbatim

- Real translated output, hashed keys + JSX tree format:
  `/Users/kevinliu/gt/gt/examples/next-ssg/public/_gt/es.json`, `…/ja.json`, `…/de.json`, `…/fr.json`, `…/zh.json`
- Real locale tag catalogue: `/Users/kevinliu/gt/gt/packages/supported-locales/src/supportedLocales.ts`
  (78 base-language entries, 129 distinct locale tags including regional variants)
- Display-filtered locale list used by the current site:
  `/Users/kevinliu/gt/gt-cloud/packages/locales/src/supportedLocales.ts`
- Public usage rates: `/Users/kevinliu/gt/gt-cloud/packages/settings/src/credits.ts`
  (rendered by `/Users/kevinliu/gt/gt-cloud/packages/ui/src/components/pricing/UsagePricing.tsx`)
- Linter rule names: `/Users/kevinliu/gt/gt/packages/react-core-linter/src/rules/`
- Example apps to screenshot: `/Users/kevinliu/gt/gt/examples/` (`next-create-app`, `next-ssg`,
  `expo-react-native`, `vite-create-app`, `next-pages-router`, `next-chatbot`, `next-gt-starter`,
  `create-react-app`)

### Accuracy guardrails (from `wiki-standards.md` §4 — truthfulness discipline)

- **Public locale figure is "100+ languages."** Code samples on the current site hardcode `118`; the
  live marquee renders the display-filtered list. Do not invent a different number.
- **Verified customer logos** (already on the site, with links): Cursor, Ramp, Mintlify, Profound,
  Partiful, ClickHouse. Docs also state usage by Cognition and Windsurf; sales copy uses
  "Cursor, Ramp, and Profound … over thirty languages." Never add a customer not on this list.
- **Plans are Starter ($0) and Enterprise (custom) only.** No "Team," no "Pro" — those are legacy IDs
  in `packages/settings/src/services.ts` and must never surface.
- **Never name a competitor.** Referencing open-source libraries (`i18next`, `next-intl`) is allowed
  and is in fact a real feature (CLI compatibility).
- Internal cost mechanics (LCU sigmoid parameters, per-token model costs) are **internal**. Only the
  published rates on `/pricing/usage` may appear on a page.

---

## How to read the entries

```
### N. Name as a customer would say it
Claim        — one sentence, ready to drop in as a cell heading
Proof        — the two-second visual; what is literally on screen
Misread      — what a reader assumes wrongly, so the diagram can pre-empt it
Artefacts    — actual code / strings / locale codes / filenames to render
Demo score   — Still /5 (reads in one frame) · Loop /5 (reads in a 5s loop)
```

---

# A. The code layer — inline i18n in the source

## 1. `<T>` — wrap the JSX, not the strings

**Claim:** Wrap any JSX in `<T>` and it ships in every language — no string extraction, no key files.

**Proof:** One code block, one browser frame, side by side. The code never changes; the browser frame
cycles `en → es → ja → de`. The point is the *stillness of the left half* while the right half changes.
The killer detail: nested markup survives — the `<b>`, the `<a>`, the `<i>` stay exactly where they
belong, and you can see the link text translate *inside* the sentence.

**Misread:** "It must be a wrapper that calls Google Translate in the browser at runtime." No — the
content inside a `<T>` is translated **at build time** (or deploy time) and served pre-generated. This
is thesis #3 of the company: *"Translations have to reflect the logic of an application."* The diagram
must show a build step between code and browser, not a network call at page load. Second misread: "it
translates anything inside it, including my variables" — it translates only JSX **literally written**
between the tags; a dynamic `{greeting}` errors and must go in `<Var>`.

**Artefacts:**

```tsx
import { T } from 'gt-react';

<T>
  Today, I went to
  <p>
    the <b>store</b> to buy some <i>groceries</i>.
  </p>
</T>
```

Props are real and worth showing as chips: `$context`, `$id`, `$maxChars`, `$requiresReview`.
The invalid case is a great diagram beat:

```tsx
<T>
  {greeting}  {/* ❌ dynamic children cannot be translated — wrap in <Var> */}
</T>
```

Real target output for the same source, from `examples/next-ssg/public/_gt/`:
`"Para comenzar, edita el archivo page.tsx."` (es) · `"開始するには、page.tsxファイルを編集してください。"` (ja)

**Demo score:** Still 5 · Loop 5

---

## 2. `useGT()` / `gt()` — strings that aren't JSX

**Claim:** Labels, placeholders and alt text translate with one call, in the language of the request.

**Proof:** A form. `placeholder`, `aria-label`, and a button label all wrapped in `gt(...)`. Flip
locale: the placeholder text inside the input changes, the button widens, the label above reflows.
Placeholders are the perfect proof because readers *know* a JSX wrapper can't reach inside an
attribute — so this closes an obvious hole in `<T>`'s story.

**Misread:** "So there are two competing APIs and I have to choose." No: `<T>` is for JSX,
`useGT()`/`gt()` is for strings — they cover disjoint surfaces and coexist in the same file. Also:
`useGT()` returns the **function directly**, not an object (`const gt = useGT()`), a detail worth
getting right in every snippet on the page.

**Artefacts:**

```tsx
import { useGT } from 'gt-react';

const gt = useGT();
<p>{gt('Hello, {name}!', { name: 'Alice' })}</p>
```

ICU inline, which is real and shows depth:

```tsx
{gt('There are {count, plural, =0 {no items} =1 {one item} other {{count} items}} in the cart',
  { count: 10 })}
```

Server/async variants to show breadth: `getGT()` (`gt-next` async components, `gt-node`,
`gt-tanstack-start`), `t()` (Python), `msg()` + `useMessages()` for module-scope registration,
`useTranslations()` for dictionary lookups by id.

**Demo score:** Still 4 · Loop 4

---

## 3. `<Num>`, `<Currency>`, `<DateTime>` — locale-aware formatting

**Claim:** Numbers, money and dates format themselves for the reader's locale, locally, without a
round trip.

**Proof:** A three-row table, one column per locale, all rendering the *same* value:

| | en-US | de-DE | ja-JP | ar-EG |
|---|---|---|---|---|
| `<Num>{1_000_000_000}</Num>` | 1,000,000,000 | 1.000.000.000 | 1,000,000,000 | ١٠٠٠٠٠٠٠٠٠ |
| `<Currency currency="EUR">` | €1,234.50 | 1.234,50 € | €1,234.50 | — |
| `<DateTime>{new Date()}</DateTime>` | Jul 29, 2026 | 29.07.2026 | 2026/07/29 | — |

The separator flip (`,` ↔ `.`) is the two-second tell, and the currency-symbol *position* moving from
prefix to suffix in German is the detail that makes an engineer nod. (Render actual `Intl` output when
building — do not hand-write the cells above; they are indicative.)

**Misread:** "These values get sent off to be translated." They do not — formatting is done locally
with `Intl.NumberFormat` / `Intl.DateTimeFormat`, and the value **never leaves the client**. That's a
privacy and latency claim worth stating on the diagram itself.

**Artefacts:** `<Num options={{ style: 'decimal', maximumFractionDigits: 2 }}>`,
`<Num locales={['fr-FR']}>{item.count}</Num>`, `<DateTime>{new Date()}</DateTime>`,
`<Currency>`. The `1,000,000,000` in the site's own demo copy ("your next 1,000,000,000 users") is
already a `<Num>` — the page dogfoods this in its own body text.

**Demo score:** Still 5 · Loop 4

---

## 4. `<Plural>` and `<Branch>` — every variant translated, not interpolated

**Claim:** Count- and condition-driven copy gets a real translation for every form your target
languages need.

**Proof:** A counter with `n = 0, 1, 2, 5, 11` scrubbing across the top, and three language rows
beneath. English needs two forms. Russian or Polish needs `one / few / many`; Arabic needs
`zero / one / two / few / many`. Show the **form label** lighting up next to each row as `n` changes —
so you literally watch a language pick a plural bucket English doesn't have. This is the single best
"i18n is harder than you think, and we handle it" visual GT owns.

**Misread:** "This is just string interpolation with a pluralize helper." No — each branch child is
**translated independently**, so every variation reads naturally rather than being assembled from a
stem plus a suffix. And the source language only has to supply the forms *it* uses (`one`, `other`);
targets supply `zero`, `two`, `few`, `many` themselves.

**Artefacts:**

```tsx
import { T, Plural, Num } from 'gt-react';

<T>
  <Plural
    n={count}
    one={<>You have <Num>{count}</Num> message.</>}
    other={<>You have <Num>{count}</Num> messages.</>}
  />
</T>
```

```tsx
<T>
  <Branch branch={plan}
    free={<p>Upgrade to unlock more.</p>}
    pro={<p>Thanks for going Pro!</p>}>
    <p>Welcome.</p>
  </Branch>
</T>
```

**Demo score:** Still 4 · Loop 5

---

## 5. `<Var>` — the values that must *not* be translated

**Claim:** Mark user data as a variable and it passes through untouched, in the right place in the
sentence.

**Proof:** `Hello, <Var>{user.name}</Var>!` rendered in four languages where **"Alice" never changes**
but its *position in the sentence moves* — front in Japanese, wrapped in an honorific, after the verb
elsewhere. Two colours: grey for translated text, one accent for the variable slot. The accent slot
sliding along the sentence as the locale changes is the whole diagram.

**Misread:** "Then I could just concatenate strings myself." No — the point is that word order differs
per language, so the variable must be a *slot inside a translated sentence*, not glue between two
fragments. This is the cleanest possible argument for structured translation over string
concatenation, and it fits in one line of code.

**Artefacts:** `<Var>`, `declareVar()` / `decodeVars()` for derived content, `Hello, <Var>{user.name}</Var>!`

**Demo score:** Still 5 · Loop 4

---

## 6. Translation options on the tag — `$context`, `$id`, `$maxChars`, `$requiresReview`

**Claim:** Steer a single translation from the call site: give it context, cap its length, or hold it
for approval.

**Proof:** Four small code cards, each with its consequence rendered beside it.
`$context="the season, not a coil"` on `Spring` → two different Spanish outputs, wrong one struck
through. `$maxChars={20}` → a button that *fits* next to one that overflows its container. And
`$requiresReview` → the string renders with a **held-for-review** pill instead of going live. That
last one is the code-side half of Act IV's review story: the review gate starts as a prop.

**Misread:** "Context/tone lives only in the dashboard." Both are true and they compose — per-entry
context in code, project-wide context in the Context Platform (§14).

**Artefacts:** `<T $context="Playful, upbeat marketing tone">`, `<T $requiresReview>`,
`<T $maxChars={20}>`, `<T $id="hero.headline">`,
`await tx('Spring', { $context: 'the season, not a coil' })`,
`tx(..., { $locale: 'fr', $maxChars: 40, $requiresReview: true })`.

**Demo score:** Still 4 · Loop 3

---

## 7. Framework coverage — six runtimes, one config file

**Claim:** The same content model ships from Next.js, React, React Native, TanStack Start, Node.js and
Python.

**Proof:** A tab bar with an underline indicator (the viteplus.dev pattern) and a code panel that
swaps. The trick that sells it: **`gt.config.json` is the one file that does not change** as you tab
through. Everything else — the import line, the file name, the provider — changes; the config stays
byte-identical. Pin it as a fixed cell under the tabs and let only the import line highlight-flash.

Second still frame, for the React Native tab only: a phone bezel next to a browser chrome, same
component tree, same Japanese string. Cross-platform in one frame.

**Misread:** "Six SDKs means six different mental models, six migrations." No — same components, same
config, same CLI; only the import package differs (`gt-next` / `gt-react` / `gt-react-native` /
`gt-tanstack-start` / `gt-node` / `gt-python`). Also: server-side languages get the string APIs and
middleware, not `<T>` — the capability grid on the current site already encodes this honestly.

**Artefacts** (all verbatim from the site's own code panels, `landing-content.md` §4):

- `page.tsx` + `layout.tsx` + `next.config.ts` (`withGTConfig`) + `loadTranslations.ts` — Next.js
- `index.tsx` + `__root.tsx` (`initializeGT`, `getTranslations`, `LocaleSelector`) — TanStack Start
- `Home.tsx` + `App.tsx` (`<GTProvider config={gtConfig} loadTranslations={…}>`) — React
- `index.tsx` + `_layout.tsx` + `babel.config.js` (`gt-react-native/plugin`) — React Native / Expo
- `server.ts` (`initializeGT`, `withGT(locale, …)`, `getGT`) — Node.js / Express
- `app.py` (`from gt_fastapi import initialize_gt, t`) + `requirements.txt` (`gt-fastapi`) — Python
- The invariant: `{"defaultLocale": "en", "locales": ["es","fr","ja","de","zh"], "files": {"gt": {"output": "public/_gt/[locale].json"}}}`

Per-SDK capability grid from the current site: UI · Text · Numbers · Currencies · Dates · Plurals ·
Functions · Context · Routing (React/Next/TanStack) or Globals (React/RN) or Requests + Middleware
(Node/Python).

**Demo score:** Still 5 · Loop 4

---

## 8. Drop-in for existing i18n libraries

**Claim:** Already on `i18next` or `next-intl`? The CLI translates your existing files and preserves
your syntax.

**Proof:** A split code panel: left, an untouched `i18next` `en.json`; right, the generated `de.json`
with the **same keys, same ICU syntax, same nesting** and German values. No migration diff at all —
the absence of a diff on the left half *is* the proof.

**Misread:** "I have to adopt `<T>` to use GT at all." No — the CLI detects the library from
`package.json` and translates files in place; `gt-next`/`gt-react` are the upgrade path, not the price
of entry. This is also the one place the brand is *allowed* to name other software: open-source
libraries, never competitor products (`wiki-standards.md` §4).

**Artefacts:** `next-intl`, `react-i18next`, `next-i18next` (the three detected by name);
standalone formats `JSON`, `YAML`, `Markdown`, `MDX`, `HTML`, `TS/JS`, `TXT`, gettext.

**Demo score:** Still 4 · Loop 2

---

## 9. The linter — i18n mistakes caught at edit time

**Claim:** An ESLint plugin flags un-translatable patterns before they reach a build.

**Proof:** An editor frame with a red squiggle under `{greeting}` inside a `<T>`, hover card showing
the rule name, then the quick-fix wrapping it in `<Var>`. Squiggle → fix is a two-frame story every
engineer reads instantly.

**Misread:** "This is a formatting/lint-style nag." It's correctness: dynamic children inside `<T>`
are a runtime error, not a style preference.

**Artefacts:** `@generaltranslation/react-core-linter`; real rule names from
`packages/react-core-linter/src/rules/`: `static-jsx`, `static-string`, `no-data-attrs-on-branch`.

**Demo score:** Still 4 · Loop 3

---

## 10. Locale switching in the UI

**Claim:** Drop in `<LocaleSelector />` and users change language without you writing a routing layer.

**Proof:** The selector opening to a list of **native language names with flags** — `🇫🇷 Français`,
`🇯🇵 日本語`, `🇸🇦 العربية` — then the page behind it re-rendering, URL prefix changing, and the
choice persisting on reload (show the cookie chip). Native names, not English names, is the detail
that reads as "these people actually do localization."

**Misread:** "The switcher is the product." The switcher is one line; the routing, detection,
persistence and the pre-generated translations behind it are the product.

**Artefacts:** `<LocaleSelector />`, `useLocale()`, `useSetLocale()`, `getLocale()`;
locale pills from the real catalogue (§29).

**Demo score:** Still 3 · Loop 4

---

# B. The CLI and the build pipeline

## 11. `npx gt@latest` — the setup wizard

**Claim:** One command detects your framework, writes your config, and issues your keys.

**Proof:** A terminal, and *only* a terminal. Type `npx gt@latest`; the wizard prints detected
framework, asks for target locales, and the frame ends with a file tree where
`gt.config.json` and `.env.local` are **newly created and highlighted green**. Terminal-in → files-out
is the most legible five seconds in developer marketing.

This command is deliberately the topmost element of the current hero — the code comment in
`HeroSection.tsx` says it is there "to emphasize that we are a developer first company." Keep it there.

**Misread:** "A wizard means magic I can't reproduce in CI." The docs are explicit that `gt init` needs
a TTY and CI should commit `gt.config.json` and set env vars instead — say so in the diagram, it builds
trust rather than costing it.

**Artefacts:** `$ npx gt@latest` (copyable chip, monospace, `$` prefix, copy icon — already built),
`npx gt init`, `npx gt auth`, output files `gt.config.json` + `.env.local` containing
`GT_API_KEY=…` / `GT_PROJECT_ID=…`. Install: `npm install gt --save-dev`.

**Demo score:** Still 4 · Loop 5

---

## 12. `npx gt translate` — build-time translation

**Claim:** One command scans your source, translates everything new, and writes files you commit.

**Proof:** The **real output file** on screen. This is the most under-used asset GT has: the generated
JSON is genuinely interesting-looking. Show a hashed key resolving to a translated JSX tree:

```json
{
  "039ccefb7f335e27": "create-next-app によって生成されました",
  "df0269bad214a097": {
    "c": { "c": [
      { "d": { "alt": "Next.js logo" }, "i": 3, "t": "Image" },
      { "c": [{ "c": "開始するには、page.tsxファイルを編集してください。", "i": 5, "t": "h1" }] }
    ]}
  }
}
```

Put the source JSX on the left and this on the right, with a hairline connecting the `h1` in the code
to `"t": "h1"` in the JSON. That single leader line explains the entire architecture — **structure is
preserved, only leaves are translated** — with no prose at all.

**Misread:** "It re-translates and re-bills everything on every run." No: by default it translates only
content whose source changed and **preserves local edits**; `--force` is opt-in and the docs say plainly
that you are charged for it.

**Artefacts:** `npx gt translate`, `--dry-run`, `--force`, `--force-download`,
`--src "lib/**/*.{ts,tsx}"`, `--locales de it`, `--config gt.config.json`,
`--tag v2.1.0 -m "Added checkout page translations"`.
Build wiring: `"build": "npm run translate && next build"`.
Output paths: `public/_gt/[locale].json` (Next), `src/_gt/[locale].json` (React/TanStack),
`content/[locale].json` (React Native).
Full command surface: `gt init` · `gt auth` · `gt configure` · `gt setup` · `gt generate` ·
`gt translate` · `gt validate` · `gt upload` · `gt enqueue` · `gt download` · `gt stage` · `gt save-local`.

**Demo score:** Still 5 · Loop 4

---

## 13. Validate before you spend — `--dry-run` and `gt validate`

**Claim:** Check your project for translation errors without calling the API, or spending a cent.

**Proof:** Two terminal panes side by side. Left: `npx gt translate --dry-run` printing found entries
and one error, with `0 tokens billed` on the last line. Right: the same run without the flag, billing
normally. The zero is the whole point.

**Misread:** "Validation is a linting nicety." It is a **cost control** and a CI gate — it belongs next
to pricing on the page, not next to the linter.

**Artefacts:** `npx gt translate --dry-run`, `npx gt validate`.

**Demo score:** Still 3 · Loop 3

---

## 14. Development previews — see other languages while you type

**Claim:** With a dev key, translations regenerate as you edit, so you develop *in* Japanese if you want.

**Proof:** Split screen, editor left, browser right, browser locked to `ja`. Type a new English
sentence in the editor; a beat later the Japanese appears in the browser without a reload. **This is
GT's single most impressive loop** and the current site does not show it. The DOM resize (D1 in the
storyboard) comes free here — the container visibly breathes as the Japanese lands.

**Misread:** "That means production translation is also on-demand and slow." Explicitly not: dev keys
(`gtx-dev-`) translate on demand for preview; production is pre-generated. Show the two keys as
different-coloured chips and label the two paths — this pre-empts the biggest architectural
misunderstanding on the whole page.

**Artefacts:** `@generaltranslation/compiler` (`vite`, `webpack`, `rollup`, `rspack`, `esbuild`
adapters), `"parsingFlags": { "devHotReload": true }` in `gt.config.json`,
`VITE_GT_PROJECT_ID` / `VITE_GT_DEV_API_KEY` in `.env.local`, `initializeGTSPA({ … })`,
key prefixes `gtx-dev-` (dev, browser-safe) vs `gtx-api-` (production, never in browser code).
Example apps: `examples/vite-spa`, `examples/webpack-spa`, `examples/rollup-spa`.

**Demo score:** Still 3 · Loop 5

---

## 15. Version branching — translations per git branch

**Claim:** Feature branches get their own translations, and inherit the rest instead of paying for it twice.

**Proof:** A git graph. `main` with a full set of locale dots; `feature/new-landing-page` branching off
with **only the new strings** as filled dots and the inherited ones as hollow outlines; then the merge,
where the filled dots flow back into `main`. Hollow vs filled = inherited vs newly billed. One frame,
no words.

**Misread:** "Branch translations mean duplicated cost." The opposite — inheritance is the feature:
"shared content is not re-translated or double-charged."

**Artefacts:** `npx gt translate --enable-branching`,
`--branch feature/new-landing-page`, `--disable-branch-detection`, `--remote-name origin`,
`"branchOptions": { "enabled": true, "autoDetectBranches": true, "remoteName": "origin" }`.
Real branch names to draw: `main`, `feature/new-landing-page`, `locadex/…`.
Note: branching is a Cloud feature and requires a paid plan — state it if the cell is near pricing.

**Demo score:** Still 4 · Loop 3

---

## 16. Every file format, not just code

**Claim:** Markdown, MDX, JSON, YAML, HTML, TS/JS and plain text translate through the same pipeline.

**Proof:** A fan of file cards — `docs/guide.mdx`, `messages/en.json`, `config/en.yaml`,
`index.html`, `strings.ts`, `README.md` — each flipping to its translated twin with **syntax, front
matter, code fences and attributes intact**. The MDX card is the best single card: front matter keys
stay English, front matter *values* translate, and the fenced code block stays untouched. That
distinction is the entire proof of "we understand your files."

**Misread:** "It will translate my code samples and break my docs." It does not — structure and code
are preserved; this is exactly what the Mintlify integration relies on.

**Artefacts:** doc paths already linked on the site: `/docs/cli/reference/formats/mdx-md-files`,
`json-files`, `yaml-files`, `html-files`, `ts-js-files`, `plain-text-files`. Formats named in the
platform's own rate table: `MD`, `MDX`, `JSON`, `YAML`, `HTML`, `GTJSON`, gettext, ICU.

**Demo score:** Still 4 · Loop 3

---

# C. Locadex — the agent

## 17. Locadex: connect a repo, get a pull request

**Claim:** Connect a GitHub repo and Locadex internationalizes your code and opens the pull request.

**Proof:** A GitHub PR frame. Branch chip `locadex/generate-code`, a **real-looking diff** where red
lines are bare JSX and green lines are the same JSX wrapped in `<T>`, and a green **Files changed: 47**
counter. Then the merge. Diff-red-to-diff-green is the most instantly readable proof of work in
software; use it at full width.

**Misread:** Two, both important. (a) "An agent editing my code, unsupervised." Every change arrives as
a **reviewable PR** on a prefixed branch, auto-merge is **off by default**, and setup is a separate PR
you merge yourself first. (b) "It's a one-time setup script." It's standing automation: three templates,
each with its own trigger, re-running as your code changes.

**Artefacts:**
Three real automation templates — **Generate code** (wraps source with `t()` and the `T` component),
**Generate translations and push**, **Keep locales in sync**.
Triggers — **A pull request changes** · **A commit is pushed** · **Started manually**.
Branch prefix default `locadex/`. Target directory default `.`.
Supported: **Next.js, Mintlify, Fern, Docusaurus**, plus Vite, Gatsby, React, Redwood, React Router,
TanStack Start.
Setup path: Project → Integrations → Catalog → GitHub → Automations → *Start with a template* →
**Run setup** → setup PR → merge.
Local CLI: `npx locadex@latest start`.
Existing deep link on the site:
`/dashboard/api/integrations/github/start?returnTo=%2Fproject%2Flocadex`.
Site copy: "AI agents connect to your codebase, internationalize your code, and open pull requests
with translations." Wiki line worth reusing: "Just connect a GitHub repo and your app is translated,
in native speed and quality, with zero engineering bandwidth."

**Demo score:** Still 5 · Loop 5

---

## 18. The Locadex run, step by step

**Claim:** Push, scan, edit, translate, open PR — the whole loop runs without you.

**Proof:** The five-step stepper already built on the site (`LocadexFlowchart.tsx`, ~1.2s per step,
looping), upgraded so each step shows **its artefact** rather than an icon: step 2 shows a scanline
over real code lines; step 3 shows two diff lines; step 4 shows a locale grid filling in; step 5 shows
the PR chip. Every frame must be unambiguous mid-loop (a storyboard non-negotiable).

**Misread:** "Scan means grep." The relevance check works on **changed lines** by default ("Changed
files only," on for Generate code), and it is a model reasoning about your component structure — which
is why the storyboard's hoverable "Locadex notes" tooltips are worth building: they show *judgement*,
not pattern matching.

**Artefacts:** step labels verbatim from the current site —
`Push to repo` / "A commit or PR triggers the workflow" · `Scan codebase` / "Agent maps out what has
changed" · `Edit code` / "Agent internationalizes code and strings" · `Translate content` / "Agent
creates translations in context" · `Open PR` / "Pull request created for review."

**Demo score:** Still 4 · Loop 5

---

## 19. Locadex controls — it runs your commands, in your repo shape

**Claim:** Point Locadex at a directory, give it your build commands, and it works the way your repo does.

**Proof:** A settings panel rendered as a real form: **Target directory** `apps/web`, **Framework**
`Next.js`, **Package manager** `Detect automatically`, **Linter**, **Pre-process command**,
**Post-process command**, **Auto-merge** (off), **Preserve local edits** (on), **Changed files only**
(on). A monorepo tree beside it with `apps/web` highlighted and `apps/api` greyed. The greyed sibling
is what makes "monorepo-aware" land in one glance.

**Misread:** "Agents can't respect our conventions." They run your commands, in a sandbox, with your
secrets injected as env vars — the docs even reference a customer running a 20-minute post-process
command inside a Locadex workflow (ClickHouse, per `wiki-strategy.md`).

**Artefacts:** every setting name above is verbatim from the Locadex config reference. Also:
Organization secrets injected into the sandbox, `Re-run setup`, `Disable monitoring`, email reminders
on open PRs (default 1 day), auto-merge-when-checks-pass, documented sandbox **VM image**.

**Demo score:** Still 4 · Loop 2

---

## 20. Locadex pricing — metered in LCUs

**Claim:** Agent runs are metered in Locadex Compute Units — resources used end to end, at $5 per LCU.

**Proof:** A run summary card: files touched, lines changed, sandbox seconds, then `LCUs: 1.4` and
`$7.00`. Real, boring, itemised. Boring is the point next to an agent.

**Misread:** "Agent pricing is unpredictable, so it's unbounded." The published rate is fixed and a
**Usage Limit** is a hard cap that blocks billing even with auto-reload on.

**Artefacts:** `$5 / LCU` (published), LCU inputs named publicly as lines changed, files touched, and
codebase size. Keep the sigmoid scaling constants in `packages/settings/src/lcus.ts` **internal**.

**Demo score:** Still 3 · Loop 2

---

# D. The Context Platform

## 21. Context Groups — glossary and directives

**Claim:** Define your terminology and your tone once, and every translation obeys them.

**Proof:** The best untold story on the site, and it needs a **before/after with a struck-through
wrong answer**:

```
GLOSSARY        Locadex   → do not translate
                Workflow  → Flujo de trabajo (es) · ワークフロー (ja)

DIRECTIVES      Use formal "Sie" (de)
                Active voice, avoid jargon
                Never translate product names
```

Left: translation without the group — `Locadex` translated to something absurd, informal "du."
Right: with the group — `Locadex` intact and highlighted, formal `Sie` highlighted. Struck-through red
on the left, accent on the right. That single frame is the entire "context, not model quality" thesis
(#4 of the seven) made visible.

**Misread:** Three worth pre-empting. (a) "Glossary = find and replace." It is guidance into
generation, per locale, with priority resolution when groups overlap. (b) "Editing the glossary
retroactively fixes everything." It does not — context applies to **new** translations; existing ones
change only when you press **Apply**. (c) "It's per-project busywork." Groups live at the
**Organization** level and are assigned to many projects, and can be **autogenerated from your project
files**.

**Artefacts:** UI nouns verbatim — **Context** page, **Context Group**, **Glossary** (key terms),
**Directives** (style and tone), **Assign**, **Translate** button, **Apply** button, **Import/Export**,
priority reorder (top group wins), *Autogenerate context from your Project files*, locale-specific
directives, **AI Context** project toggle. Docs' own example: *"Locadex is the GT agent. This product
name should never be translated."* / *"Use active voice, avoid jargon, and use formal 'Sie.'"*
Pricing tie-in: context adds a transparent surcharge — `+$0.10 / 10k tokens per 500 tokens of project
context`, shown as base + context.

**Demo score:** Still 5 · Loop 4

---

# E. Review and the editor

## 22. The Translation Editor — source and target, side by side

**Claim:** Agents write the translations; you review, edit and approve them in one workspace.

**Proof:** The real editor grid: a **Source** column and one column per locale, rows of entries, one
cell mid-edit with a cursor and a **Save** button, `⌘K` search overlay half open. Show real content in
the cells (the site's own hero strings translated) — abstract skeleton bars, which is what the current
`EditorGraphic.tsx` does, throw away the entire proof. Real strings in a real grid is the whole ask.

**Misread:** "This is a CAT tool I'll have to live in." You review exceptions, not everything; and the
same content is simultaneously in your repo. The editor spans **Files** (Markdown, JSON, gettext) and
**Components** (React/JSX) views, which is unusual and worth showing as two tabs.

**Artefacts:** verbatim UI — **Translations** page · **Files** / **Components** toggle · locale
multi-select (defaults to all locales side by side) · Search by file name, component name, key, source
text, translated text · `⌘K` / `Ctrl+K` · click-to-edit with **Save** · **Raw** toggle with
**Search in file** · **History** · **Download** · show/hide source · filter by annotation label.
Current site bullets to keep: "Side-by-side source and translation view" · "See diffs when
translations are regenerated" · "Edit translations before or after they go live."

**Demo score:** Still 5 · Loop 3

---

## 23. Annotations — labels, notes, comments, scoped per locale

**Claim:** Track review state per entry and per locale with labels, notes and threaded comments.

**Proof:** One entry row expanded: coloured label chips `Needs review` / `Approved` / `Legal`, a note,
and a two-message comment thread with a **Resolve** button. Then the **Filter → Needs review** click
that collapses the grid to three rows. The filter collapse is the satisfying two-second beat.

This is also the honest home of the storyboard's "ping the lawyer" beat: a `Legal` label plus a
`$requiresReview` hold is the real mechanism.

**Misread:** "Review state is per string." It is scoped to **entry *and* locale** — the Spanish
translation can be approved while the French one is still in review. Draw the grid so one cell is green
and its neighbour is amber; that asymmetry is the feature.

**Artefacts:** **Labels** (project-wide catalogue, names + colours, bulk **Manage labels** across
chosen locales, filter), **Note** (one per entry per locale), **Comments** (threads, reply, resolve,
reopen). Availability: annotations are **not on the Starter plan** — if the cell sits near pricing, say so.

**Demo score:** Still 4 · Loop 4

---

## 24. History and diffs — every source version, restorable

**Claim:** Compare translations across source versions, see exactly what regeneration changed, and
restore.

**Proof:** A two-pane diff of the *same* Spanish string across two source versions, word-level
highlights, with a version rail on the left (`v2.1.0`, `Added checkout page translations`, commit hash)
and a **Restore** button. Tags come from the CLI, so the rail can carry real git metadata — that link
between `git` and translation history is a genuinely distinctive thing to show.

**Misread:** "Every keystroke becomes a version." Explicitly not: inline edits update the current
translation and do **not** create a history entry; a new entry appears only when source edits are sent
for translation.

**Artefacts:** **History** panel, compare across source versions, restore a prior state, tags from
`npx gt translate --tag v2.1.0 -m "…"` (bare `--tag` uses the git commit hash and message).

**Demo score:** Still 4 · Loop 3

---

## 25. Roles, permissions and scoped translators

**Claim:** Give a translator access to exactly one language and nothing else.

**Proof:** A permission matrix: rows = people, columns = locales, one row lit for `ja` only. The wiki's
own example — "a Japanese translator whose permissions are scoped only to Japanese files" — drawn
literally.

**Misread:** "This is a self-serve toy without governance." RBAC, custom roles, SSO (SAML & OIDC) and
webhooks are real, on Enterprise.

**Artefacts:** roles & permissions reference, `project:write`, `translations:content:write`,
**Manage Locadex secrets** permission, default **Admin** / **Developer** roles, Organization members &
invitations. Enterprise: RBAC, custom roles, SSO (SAML & OIDC), webhooks, custom SLA, SOC 2 Type II,
ISO 27001, Slack + phone support, forward-deployed engineers.

**Demo score:** Still 3 · Loop 1

---

# F. Delivery

## 26. Translation CDN and over-the-air updates

**Claim:** Translations are served from a global CDN — fix a translation without redeploying your app.

**Proof:** Two-panel loop. Panel 1: someone edits a Spanish string in the editor and hits Save.
Panel 2: a phone/browser already running, whose text **changes in place** — with a `no deploy` chip
and a build pipeline shown greyed out and skipped. "The deploy step is greyed out" is the entire
argument in one frame.

**Misread:** "CDN delivery means my app can't work offline or without GT." It's a choice, not a
requirement: point `loadTranslations` at bundled JSON and **no CDN request is made at all**; provide a
`projectId` instead and delivery comes from the CDN. Show the two paths as a fork with an explicit
trade-off label — bundled = redeploy to update; CDN = update live. Being straight about the trade-off
is more persuasive than claiming both.

**Artefacts:** the **CDN setting** in Project settings ("serve translations from a global CDN for
faster load times"), `npx gt translate --publish`, the honest caveat from the docs ("Enable the CDN in
your Project settings first"), `loadTranslations.ts` for the bundled path, `projectId` for the CDN
path. Infrastructure fact: the edge app runs on Cloudflare Workers (`apps/edge`). Site copy:
"A global, low-latency translation CDN. Push over-the-air updates without redeploying your app."

**Demo score:** Still 4 · Loop 5

---

## 27. Locale routing and middleware

**Claim:** One middleware file gives you locale detection, locale-prefixed URLs, and SEO-ready paths.

**Proof:** A URL bar animation plus a four-step resolution ladder. The URL bar goes
`example.com/about` → `example.com/es/about` → `example.com/fr/a-propos`. The **localized pathname** is
the money shot — most readers have never seen an i18n library translate the *route*, not just the page.
Beside it, the detection ladder with the winning row lit: **URL locale → cookie → `Accept-Language`
header → default locale**.

**Misread:** "This is just a `/[locale]/` folder and a redirect." It is detection order, cookie
persistence, canonical locale-code normalisation, and per-locale path rewriting with dynamic segments
preserved.

**Artefacts:**

```ts
// proxy.ts  (middleware.ts on Next.js 15 and earlier)
import { createNextMiddleware } from 'gt-next/middleware';

export default createNextMiddleware({
  prefixDefaultLocale: true,
  pathConfig: {
    '/about': { fr: '/a-propos' },
    '/products': { zh: '/产品' },
    '/product/[id]': { zh: '/产品/[id]' },
  },
});

export const config = { matcher: ['/((?!api|static|.*\\..*|_next).*)'] };
```

Plus the file tree `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`, `getLocale.ts`, `proxy.ts`;
`import { locale } from 'next/root-params'`; options `localeRouting`, `prefixDefaultLocale`,
`pathConfig`, `ignoreSourceMaps`. SEO angle GT already writes about: `hreflang`, canonical URLs,
`<html lang={locale}>`, localized sitemaps.

**Demo score:** Still 5 · Loop 4

---

## 28. Live / runtime translation of user content

**Claim:** Translate content you can't know at build time — user posts, support replies, model
output — on demand.

**Proof:** A chat or review thread. A message arrives in Portuguese; a moment later the same bubble
reads in English with a small `runtime` chip, while the surrounding chrome (which was built at build
time) never flickers. **Two different translation paths visible in one component** — build-time chrome,
runtime content — is the sharpest possible statement of what a full-stack localization platform is.

**Misread:** "So GT is a runtime translation service after all." No: runtime is the **exception path**,
priced differently, and reserved for content unknown at build time. The docs are blunt: `tx` costs a
network request; use `getGT` for anything known ahead of time. Say the quiet part on the diagram —
it's the "translation trilemma resolved per content type" argument (UI chrome high-quality, user posts
fast and cheap) made concrete.

**Artefacts:**

```ts
import { withGT, tx } from 'gt-node';

await tx(`Current status: ${status}`);
await tx('Spring', { $context: 'the season, not a coil' });
await tx('Hello, world!', { $locale: 'fr' });
```

`RuntimeTranslationOptions`: `$context`, `$locale`, `$maxChars`, `$requiresReview`.
Public endpoint: **Translate at runtime** (`/docs/platform/openapi/reference/translation/translate-runtime`).
Published rate: runtime `$1 / 10k input tokens`. Note the sharp edge honestly: `tx` does **not**
interpolate `{variable}` placeholders — use template literals.
Example app to screenshot: `examples/next-chatbot`.

**Demo score:** Still 4 · Loop 4

---

## 29. 100+ languages, including the regional variants

**Claim:** Every locale ships production-ready — including the regional variants that actually matter.

**Proof:** Don't just marquee flags. Show **one language expanding into its variants**, because that's
the credibility move: `ar` opening into `ar-AE · ar-EG · ar-LB · ar-MA · ar-OM · ar-SA`, or `zh`
opening into `zh-CN · zh-Hans · zh-Hant · zh-HK · zh-SG · zh-TW`. Anyone who has shipped
internationally knows `zh-Hant` vs `zh-Hans` is where naive tools die. One expanding row does more
than three marquee rows.

**Misread:** "100+ languages means 100+ two-letter codes." It means real locale tags with script and
region subtags, canonicalised by the platform.

**Artefacts:** verbatim from `packages/supported-locales/src/supportedLocales.ts` —
`ar: ['ar','ar-AE','ar-EG','ar-LB','ar-MA','ar-OM','ar-SA']`,
`zh: ['zh','zh-CN','zh-Hans','zh-Hant','zh-HK','zh-SG','zh-TW']`,
`de: ['de','de-DE','de-AT','de-CH']`, `pt: ['pt','pt-BR','pt-PT']`, `el: ['el','el-EL','el-CY']`,
`ca: ['ca','ca-ES']`. Also `cnr` (Montenegrin) and `cy` (Welsh) as proof of long-tail coverage.
78 base-language entries / 129 distinct tags in that file. Public figure: **100+ languages**;
`118` appears in the site's code samples; the marquee renders the live display-filtered list.
Native-name pills: `🇫🇷 Français`, `🇯🇵 日本語`, `🇩🇪 Deutsch`, `🇨🇳 中文`, `🇸🇦 العربية`.

**Demo score:** Still 5 · Loop 3

---

## 30. Text expansion and typography across languages

**Claim:** German runs ~35% longer than English — your layout has to survive that, and ours shows you
where it won't.

**Proof:** The storyboard's D4 diagram, and it's a genuine one-frame masterpiece: a word drawn with
labelled hairline metric guides (CAP HEIGHT / ASCENDER / X-HEIGHT / BASELINE / DESCENDER, sidebearing
bands, ruler ticks) that **morphs across languages** — `Hello` → `こんにちは` (guides slide: no
descenders, taller x-box) → `مرحبا` (RTL, connected baseline) → `Übersetzen` (measuring lines *extend*,
container stretches). Pair with the D1 resizing-DOM mechanic: a real button widening for German, a
nav row reflowing, a badge wrapping to two lines.

**Misread:** "Translation is a text-swap problem." It's a layout problem — which is precisely why
`$maxChars` exists on `<T>`, and why the storyboard bans text swaps that don't resize their container
("cheap version = automatic fail").

**Artefacts:** `Hello` / `こんにちは` / `مرحبا` / `Übersetzen`; real UI strings to expand —
`Get started` → `Jetzt starten` / `始める`; `Payment received` → `Paiement reçu`;
`Email address` → `Correo electrónico`. `$maxChars={20}` as the enforcement mechanism.

**Demo score:** Still 5 · Loop 5

---

# G. Integrations

## 31. GitHub integration

**Claim:** GT installs into your repository, which is where both translations and code changes belong.

**Proof:** A GitHub app install card → repo picker → the automations list, then a PR appearing in the
repo's PR tab. Familiar chrome does the explaining; use real repo-shaped names.

**Misread:** "GitHub is just how I authenticate." It's the delivery mechanism. The wiki's own insight
is worth paraphrasing on the page: the medium for delivering translations is the same as the medium for
delivering codegen.

**Artefacts:** Project → Integrations → Catalog → **GitHub** → **Connect**; repository, target
directory, framework detection; branch prefix `locadex/`; auto-merge on checks; open-PR email
reminders; existing site link
`/dashboard/api/integrations/github/start?returnTo=%2Fproject%2Flocadex`;
public repo `github.com/generaltranslation/gt`.

**Demo score:** Still 4 · Loop 4

---

## 32. Google Slides and Google Docs

**Claim:** Translate a Google Slides deck or a Doc, and get a formatted copy per language in the same Drive folder.

**Proof:** The best non-developer demo GT has, and it's almost free to build: a Drive list showing

```
Launch plan
Launch plan [French]
Launch plan [Japanese]
Launch plan [Spanish]
```

then a slide **thumbnail pair** — English beside French — where the text is longer but the layout still
holds: title on one line, bullets aligned, nothing overflowing the text box. The naming convention is
real and specific enough to be its own proof.

**Misread:** "It will wreck my slide layout" (hence the layout pass) and "it will make a new copy every
run" (it updates the **same** copy). Both are addressed by real mechanics, so show both.

**Artefacts:** naming rule verbatim — `<source name> [<target language>]`, with the target language
written in the **source** language (`Launch plan` → `Launch plan [French]`). Flow: Project →
Integrations → Catalog → **Google Drive** → **Connect** → **Add files** (Google Picker or shared-drive
browser) → **Translate into** → **Translate**. Org-level: **Organization > Connections** → **Add
connection** → add the translation-account email to the shared drive as **Content manager** →
**Verify access**. Also **Force retranslation**, **unlink** (does not delete from Drive).
Pricing artefact unique to this surface: a per-slide **Layout Processing** charge
(published: `$0.50 / 10k input tokens`, no context surcharge).

**Demo score:** Still 5 · Loop 4

---

## 33. Docs and CMS integrations — Mintlify, Sanity, Storyblok

**Claim:** Your docs site and your CMS localize through the same platform as your app.

**Proof:** A docs site with a language dropdown in its own nav, the sidebar labels translated, and a
code fence in the body **still in English**. Preserving the code fence while translating the prose
around it is the two-second proof for docs. For the CMS row, a Sanity Studio document action reading
**Translate** and a locale tab strip on the document.

**Misread:** "A docs integration is a scraper." It's repo- and schema-aware: Mintlify runs through
Locadex against the docs repo with locale mapping and nav/routing/redirect handling; `gt-sanity` is a
Studio plugin doing document- and field-level localization you query with GROQ.

**Artefacts:** `gt-sanity` (Sanity Studio v3 plugin, `gtPlugin`), **Locadex for Mintlify**,
Storyblok space connection with translatable-field config, Mintlify locale mapping + multi-language
nav + redirects, Sanity field-level localization + GROQ queries + bulk publish.
Doc links already on the site: `/docs/integrations/mintlify/quickstart`, `/docs/integrations/sanity`.

**Demo score:** Still 4 · Loop 2

---

## 34. API, webhooks, and MCP — built to be driven by machines

**Claim:** Every surface has an API, and the docs are machine-readable, because we build products to be
used by AI as much as by humans.

**Proof:** Three chips and one terminal: an OpenAPI spec page, a webhook payload for a
translation-completed event, and an MCP server being queried by a coding agent that then writes a
`<T>` wrapper into a file. The agent-writing-`<T>` frame closes the loop back to §1 and is exactly the
"AI-native" identity the company claims about itself.

**Misread:** "AI-native is a slogan." It's an architectural decision with a stated reason: the SDKs are
deliberately legible to agents, which is *why* Locadex can install them.

**Artefacts:** `@generaltranslation/mcp` (MCP server), public OpenAPI spec + API reference,
**Webhooks** (endpoints, signature verification, translation events), Project and Organization
**API keys**, `/docs/overview/for-coding-agents`, machine-readable `llms.txt` / `llms-full.txt`,
`generaltranslation` core library (`formatCurrency`, `formatDateTime`, `hashMessage`,
CDN publishing, edit diffs).

**Demo score:** Still 3 · Loop 3

---

# H. Commercial

## 35. Pricing — usage, per workflow, knowable in advance

**Claim:** Start at $0 and pay per token — the price of a translation is knowable before you run it.

**Proof:** A live calculator, not a table. Input tokens on a slider; the price updating as
`base + context` with the two terms shown separately; a workflow-type toggle
(**build time / runtime / development**) that visibly changes the rate. Watching the *context term*
appear as a second line item is the proof of the abundance-pricing philosophy — you can see exactly
what you're buying.

**Misread:** Three. (a) "Usage-based means unpredictable." Rates are published per 10k input tokens and
a **Usage Limit** is a hard cap. (b) "Free tier means crippled." Starter includes unlimited users,
projects and languages, plus the Editor, GitHub integration and Locadex; the gate is a payment method,
not a feature list. (c) "It's per seat." It is explicitly not — "sell usage to technical leaders, not
seats to content leaders."

**Artefacts** (published rates only):
`$10 / 10k input tokens` build time (GT libraries `$20`) · `$1 / 10k` runtime ·
`$1 / 10k` development (GT libraries `$4`) · Google Slides Layout Processing `$0.50 / 10k` ·
context surcharge `+$0.10 / 10k tokens per 500 tokens of project context` · `$5 / LCU` ·
`$1 = 1,000,000 credits` · Starter minimum top-up `$10` · credit buckets **Purchased / Granted /
Included** · **Auto-reload** (Minimum Balance, Reload to, Usage Limit) · billing alerts at 80% and
100%. Plans: **Starter $0/month** and **Enterprise custom**. Enterprise: forward-deployed engineers,
custom workflows for any format or framework, shared context across projects, SSO, RBAC, webhooks,
custom SLA, SOC 2 Type II, ISO 27001. Site copy: "Full-stack localization across buildtime, runtime,
and review."

**Demo score:** Still 4 · Loop 4

---

## 36. The four-stage platform

**Claim:** Code, content, dashboard, automations — four products covering every stage of shipping in
another language.

**Proof:** A four-cell horizontal band, each cell holding a **mini mockup** rather than an icon
(bento rule D2: never text-only cells): a code window, a chat bubble, an editor grid, a PR chip. Cell
titles and one-liners are already written and approved on the pricing page.

**Misread:** "Four products means four things to buy and integrate." One platform, one config file, one
account; the four names describe *stages*, not SKUs.

**Artefacts** (verbatim, current pricing page):
**Code → Internationalization** — "Mark up UI copy, route locales, and ship static translations in your
codebase." · **Content → Translation APIs** — "Translate user-generated and backend content on demand
across every runtime surface." · **Dashboard → Context Platform** — "Curate glossaries, style rules,
and project context, along with editing, versioning, and integrations." · **Locadex → Agent
Automations** — "Locadex scans repos, updates i18n code, generates translations, runs visual QA, and
opens guarded PRs." Section heading: `Full-stack localization`.

**Demo score:** Still 4 · Loop 2

---

## 37. Proof from users

**Claim:** Internationalization went from "$%!# this" to "trivial."

**Proof:** Theo's real quote card, and the storyboard already has the right idea: **float it through
the hero gate and out the other side in Japanese.** The testimonial becomes a demo of the product
instead of an ornament. Below it, the six real customer wordmarks, small.

**Misread:** n/a — but the guardrail matters: never invent a customer, a metric, or a benchmark
(`wiki-standards.md` §4).

**Artefacts:** Quote verbatim: *"Every once in awhile, I see a snippet of code that makes me a bit
emotional. Now is one of those moments. Internationalization went from '$%!# this' to 'trivial'."* —
**Theo, CEO, T3Chat**, avatar `github.com/t3dotgg.png`, source
`x.com/theo/status/2008302190168019187`. Logos: Cursor · Ramp · Mintlify · Profound · Partiful ·
ClickHouse (assets in `public/logos/{name}.{light|dark}.svg`). Attributed quote available:
"insane engineering prowess" — Guillermo Rauch, Vercel CEO. Compliance shields: SOC 2 Type II · GDPR ·
ISO 27001 → `trust.inc/generaltranslation`.

**Demo score:** Still 5 · Loop 3

---

## 38. The site is the demo

**Claim:** This page is built with `gt-next` and served in every language it advertises.

**Proof:** The language selector in the site's own footer changing the page you are reading — with the
nav, the headings and the pricing table all following. No mockup can beat the real thing, and the
codebase already mandates it (`<T>` and `useGT()` are required in `apps/landing`).

**Misread:** "The demo is a canned animation." Let the reader break it: it's the actual page.

**Artefacts:** the footer locale selector + theme toggle; `/[locale]/` route structure;
`generaltranslation.com/es`, `/ja`, `/de`; hreflang tags in the page source; the `<T>`-wrapped source
of the very cell the reader is looking at (a "view source of this cell" affordance would be the
strongest single feature on the page).

**Demo score:** Still 4 · Loop 5

---

# Demo-ability ranking

Scored on two axes, because the page needs both: **Still** = does it read in one screenshot (matters
for the storyboard's "readable at every 10% scroll depth" rule and for the founder's module-by-module
review); **Loop** = does it read in a five-second silent loop. Rank is by `Still + Loop`, with Still
breaking ties, because a design that only works in motion fails the presentation format.

| # | Capability | Still | Loop | Σ | Best cell shape |
|---|---|---|---|---|---|
| 1 | `<T>` wraps JSX | 5 | 5 | 10 | Full-bleed split: static code ↔ cycling browser |
| 2 | Locadex opens the PR | 5 | 5 | 10 | Full-width diff panel, red→green, then merge |
| 3 | Text expansion / type metrics (D4) | 5 | 5 | 10 | Full-bleed live SVG instrument |
| 4 | `npx gt translate` → real output file | 5 | 4 | 9 | Inset two-pane code panel with leader line |
| 5 | Context Groups (glossary + directives) | 5 | 4 | 9 | Split row: wrong (struck) vs right (accent) |
| 6 | Locale-aware `<Num>`/`<Currency>`/`<DateTime>` | 5 | 4 | 9 | Three-across comparison table |
| 7 | Locale routing + localized paths | 5 | 4 | 9 | URL-bar animation + detection ladder |
| 8 | Framework coverage, one config | 5 | 4 | 9 | Tab bar + code panel, config pinned |
| 9 | Google Slides / Docs | 5 | 4 | 9 | Drive file list + slide thumbnail pair |
| 10 | `<Var>` — slot moves, value doesn't | 5 | 4 | 9 | Single-line, two-colour sentence diagram |
| 11 | Translation Editor, real strings | 5 | 3 | 8 | Full-width editor grid |
| 12 | 100+ locales incl. regional variants | 5 | 3 | 8 | Expanding row (`zh` → `zh-Hant`…) |
| 13 | Dev previews / hot reload | 3 | 5 | 8 | Split editor ↔ browser, `ja` locked |
| 14 | Translation CDN / over-the-air | 4 | 5 | 9* | Two-panel: edit → live, deploy greyed |
| 15 | Locadex 5-step run | 4 | 5 | 9* | Vertical stepper with artefact per step |
| 16 | `npx gt@latest` wizard | 4 | 5 | 9* | Terminal → highlighted file tree |
| 17 | `<Plural>` / `<Branch>` | 4 | 5 | 9* | Counter scrub + per-language form labels |
| 18 | Theo's quote through the gate | 5 | 3 | 8 | Hero object |
| 19 | The site is the demo | 4 | 5 | 9* | Footer selector, live |
| 20 | Live/runtime `tx()` | 4 | 4 | 8 | Chat thread, one bubble flips |
| 21 | Pricing calculator | 4 | 4 | 8 | Slider + itemised base/context |
| 22 | Version branching | 4 | 3 | 7 | Git graph, hollow vs filled dots |
| 23 | Annotations / review state | 4 | 4 | 8 | Row expanded + filter collapse |
| 24 | `useGT()` for strings | 4 | 4 | 8 | Form with placeholder + label |
| 25 | History / diffs / restore | 4 | 3 | 7 | Version rail + word-level diff |
| 26 | GitHub integration | 4 | 4 | 8 | Install card → automations list |
| 27 | Four-stage platform band | 4 | 2 | 6 | Four-across with mini mockups |
| 28 | Every file format | 4 | 3 | 7 | Fan of file cards, MDX featured |
| 29 | Options on the tag (`$context` etc.) | 4 | 3 | 7 | Four small cards + consequence |
| 30 | i18next / next-intl drop-in | 4 | 2 | 6 | Split code panel, no diff |
| 31 | The linter | 4 | 3 | 7 | Editor frame, squiggle → fix |
| 32 | Locadex controls / monorepo | 4 | 2 | 6 | Settings form + greyed sibling |
| 33 | Locale switcher | 3 | 4 | 7 | Small inset, native names |
| 34 | Validate / `--dry-run` | 3 | 3 | 6 | Two terminals, `0 tokens billed` |
| 35 | LCU metering | 3 | 2 | 5 | Run summary card |
| 36 | API / webhooks / MCP | 3 | 3 | 6 | Three chips + terminal |
| 37 | Roles & scoped permissions | 3 | 1 | 4 | Permission matrix |

`*` Rows 14–19 tie or exceed some rows above them on Σ but rank lower because Still < 5: they need
motion to land, so they belong in scroll-driven bands rather than in the still-frame hero real estate
the founder reviews module by module.

## Real-estate allocation this implies

- **Hero + first fold (must be perfect in a still):** `<T>`, text expansion/D4, Theo through the gate.
- **Full-bleed pivot band (the one dark section):** Locadex's PR diff. It is the highest-Σ capability
  that also happens to be the flagship product.
- **Three-across cells:** `<Num>`/`<Currency>`/`<DateTime>`, `<Var>`, locale variants — all read at
  one-third width, which is rare and therefore valuable.
- **Inset code panels:** `gt translate` output, framework tabs, i18next drop-in.
- **Scroll-scrubbed bands (motion-dependent):** dev preview hot reload, CDN over-the-air, the Locadex
  stepper, the wizard, plurals.
- **Deprioritise to the bento grid or a product page:** roles/permissions, LCU metering, API/webhooks,
  Locadex configuration depth. Real, load-bearing for Enterprise, but they do not photograph.

## Two capabilities the current site under-shows, and shouldn't

1. **Development previews (hot reload into another language).** Highest Loop score in the inventory,
   zero presence on the current page. It is the "magic moment" the culture doc talks about
   ("reduces time to a magic moment"), and it is the cleanest possible rebuttal to "translation is a
   post-processing step."
2. **Context Groups.** The company's stated core thesis is that the hard part is *context*, not model
   quality — and the current page gives it one bento cell of prose. A single before/after frame with a
   struck-through wrong translation carries more argument than the whole feature grid.

## One capability to stop drawing abstractly

`EditorGraphic.tsx` renders the Translation Editor as animated skeleton bars. The editor is GT's most
photogenic real surface — a grid of real source strings beside real translations, with a real
`⌘K` overlay. Replace the abstraction with the artefact.
