---
name: gt-brand
description: >-
  The General Translation identity as rules: the name and the naming system,
  the four absolute colors and the one accent, the type system on the
  self-hosted rsms InterVariable 4.1 (weights, optical size, features,
  tracking, per-script fallbacks), the doubled-line GT monogram and the
  generated speed marks, language as material, the final avoid list, and what
  never appears on a public surface. Use before making anything that carries
  the GT brand (a page, a slide, a graphic, a film, an email or a social
  image), when choosing a face, weight, tracking or color, when placing a GT
  mark or a third-party logo, and when reviewing a surface against the brand.
metadata:
  title: Brand and the correct Inter
  areas: aesthetic
  updated: 2026-10-07
  origin: prototemplate
---

# Brand and the correct Inter

General Translation (GT) builds open-source i18n libraries (`gt` and the framework packages such as `gt-next`) and a closed translation platform with an AI agent, Locadex. Its identity is written in Prototemplate's BRAND.md and DESIGN.md and drawn in the brand deck (`deck/parts/head.html` and `deck/slides/`). This skill states those documents as rules for anything that carries the GT brand. Type gets the most room, because the one face is the real rsms InterVariable and nearly every type defect Kevin has flagged came from settings layered on that face.

Paths are relative to a Prototemplate checkout (`$PROTOTEMPLATE`) unless they name `$GT_CLOUD`, a gt-cloud checkout at origin/main. A long-lived gt-cloud checkout can sit on an old branch without the files named here, so read gt-cloud facts from origin/main or a fresh worktree. `motion/` in Prototemplate is the films session's local folder and stays untracked, so its files exist only in Kevin's checkout (`gt-films`).

Two files hold the detail:

- `references/type.md`: the font file and how to verify it, the bindings on every surface, the tokens, optical size, features, the full tracking table, the ladders, per-script stacks, the type lint and the gotchas.
- `references/marks.md`: the current mark and its files, the GT word inline in text, the speed set and how to regenerate it, the Locadex mark, the dithered shimmer and third-party logos.

## 1. The name and the naming system

The name General Translation was chosen for three reasons, in this order. The first is ambition: like General Motors or General Electric, the name states the intent to be the leading company in the category. The second is generality: general AI models understand context and follow direction better than specialised translation models. The third is distinction: most other localization companies have names that begin with L.

| name | what it is | how it is written |
| --- | --- | --- |
| General Translation | the company; General Translation, Inc. in legal text | in full on first mention and in headings |
| GT | the short form and the mark | in the deck, a standalone GT in rendered copy is the mark at cap height (`references/marks.md`) |
| `gt` | the open-source library and CLI; users run `npx gt translate` | lowercase, in code form |
| `gt-next`, `gt-react`, `gt-vue`, `gt-node`, `gt-python` | the framework packages | in their exact form |
| Locadex | the AI agent product | its own mark |
| generaltranslation.com | the domain | in body copy |
| prototemplate.com | the design lab and the brand handoff site | in body copy |
| glyphfield.com | the companion tooling site: the shader library and the animation studio | a separate site from prototemplate.com |

- A product token keeps its exact form and is never the first word of a heading. A heading names the thing: "Prototemplate" in the heading, "prototemplate.com" in the body.
- The identity project with basement studio has two fixed points: the legal name General Translation and the names customers install and import (`gt` and the packages). The mark, the colors, the type, the layout system, the voice, the site structure and the product names, Locadex included, are open in that project (deck slide 93). The rules in this skill are the working system until the project hands off its replacement.

## 2. The idea and the values

The thesis is "every product in every language": native-level speed and quality from the first day. The positioning is the Vercel model applied to localization. GT builds the open-source libraries (`gt` and the framework packages) and the closed platform (context-aware translation APIs, versioning, editing, integrations and Locadex) as one stack. Because GT owns the whole stack, it can deliver consistent translation quality across a company's apps, docs and websites, integrated in an afternoon. The open source carries a community register and the platform an enterprise register, in one family.

The identity has to carry five values:

- **Engineering-first.** Built by people with deep technical roots for the best engineering teams.
- **Craft.** The difference between a line drawn once and a line drawn twice matters, and the line law in DESIGN.md section 2 makes it literal.
- **Infrastructure-grade.** Reliable, fast and secure; something an enterprise stands on.
- **Cosmopolitan.** Urbane and sophisticated, connecting the world's languages. Language is the material as well as the market.
- **Hand-crafted.** Made by people who care, with no template look.

The voice is measured, declarative and precise. BRAND.md section 3 gives the pair:

- Say: "One pipeline. Every language ships with the deploy."
- Not: "Supercharge your global growth with cutting-edge AI!"

Deck slide 12 states the five rules: one claim per sentence; a number or a mechanism where a marketing adjective would go; no hedging; no exclamation marks and no em dashes; sentence case everywhere and Title Case only on buttons. The full writing rules are in `gt-voice`.

For product surfaces, Kevin judges the result against the brand deck (Kevin, 2026-09-25, on the first dashboard pass: "it does not feel like our style and is too busy"). For the site, the reference is the shipped generaltranslation.com, built from `apps/landing` in gt-cloud (`gt-aesthetic` section 1). On 2026-10-06 Kevin asked why the Dossier (`/d/singularity-dossier`) was the reference for the brand, since the brand has "evolved so much more since then", and on 2026-10-07 he ruled "fix the dossier references". BRAND.md section 8 now names where the identity ships, and the Dossier stays in the gallery as the direction the site grew from (`gt-aesthetic` `references/verdicts.md`).

## 3. Color

Four absolute colors and one accent. The four are declared once in `src/app/globals.css` (`--color-ink` and the rest) and mirrored by the shell (`src/components/viewer/tokens.css`) and the deck (`deck/parts/head.html`). The accent is declared per page root (for example `--tc-accent` in a direction's `styles.css`, `--sl-accent` and `--aw-accent` on the gallery), and the deck shows it only as a labelled swatch (`deck/DECK-GRAMMAR.md`).

| token | value | role |
| --- | --- | --- |
| ink | `#070707` | text and marks on paper; the dark ground |
| raised ink | `#101010` | the one dark artifact surface: code, config and diffs, in white at 87% |
| titanium | `#8a8f98` | captions, counters and quiet labels |
| paper | `#ffffff` | the light ground |
| accent | `#2f5ce0` on paper, `#86a8ff` on ink | one spectral accent per page |

- **Structure derives from the four by alpha.** The deck and the shell add one secondary text color, ink-2 `#3a3d44`, and draw the rest as alphas of ink: hairlines at 18% and 9%, a plate at 3.5%, and a frame line at 62% for pictures only. Pages read these semantic tokens and never the raw values.
- **Dark mode is a token remap and nothing else.** Under `[data-theme='dark']` paper becomes `#070707`, ink becomes `#f2f2f0`, ink-2 becomes `#b9bcc3`, and the hairline alphas rise to 22% and 10% so a 1px seam survives between two ink surfaces.
- **The accent marks small elements:** an active state, a diagram highlight, one pulse on a thread. It never fills a large area and never colors a heading (emphasis is a doubled underline in the text color). An isometric drawing spends it on exactly one element (DESIGN.md section 6), and a film on one thing at a time.
- **The accent per ground.** On ink the accent is always the lift `#86a8ff`: `#2f5ce0` sits at 3.58:1 on `#070707`. New work takes these two values. Deck slide 26 records two other blues in use (`#3b82f6` in the docs, `#2563eb` on the blog) as drift to resolve.
- **Depth comes from lines and material.** No shadows anywhere.
- **Semantic hues appear on icons only**, in the deck: `#12a37a` done or passing, `#f0a020` open or in review, `#e5484d` excluded or rejected, `#2f5ce0` GT itself. The four are the same in both of the deck's themes, so these icon hues are separate from the accent's lift. Text and lines stay monochrome. The shell's site icons use the same amber on ink and darken it to `#c47d00` on paper, where `#f0a020` sits at 2.15:1 (`--pt-site-signal`).
- **Contrast.** Titanium on paper is 3.25:1, under the 4.5:1 that small text needs; on ink it is 6.2:1. gt-cloud's plate pages darken light-theme titanium to `#6e737c` (4.77:1) in `$GT_CLOUD/apps/dashboard/src/app/brand-tokens.css`. Check titanium text at 13px in the light theme before shipping it.

The color rules have four documented exceptions:

- **The films.** A film's palette is its material (the gem smoke in its blue, fire or ink palette, and the Bayer print in the material's own tones). The four-color limit and the one-accent rule give way to it. Gradients other than the material, CSS glows and shadows, glass chrome, rounded corners and colors from outside the material stay refused (`motion/MOTION.md`, Round 4 direction; `gt-films`).
- **The dashboard's credits card.** `.credits-card` in `$GT_CLOUD/apps/dashboard/src/app/brand-tokens.css` is a payment-card object with a literal dark fill, a 14px radius and, on paper, a shadow. Its own comment names it the one such surface on the plate pages; it is no precedent for another surface.
- **The horizon ring** is the one iridescent gradient the avoid list allows (deck slide 39).
- **The Prototemplate mark's rainbow core** belongs to the Prototemplate chrome (DESIGN.md section 15) and appears on no GT surface.

## 4. Type

Inter is the one typeface for display, interface and text. The build is the rsms.me Inter 4.1 variable family, roman and italic, self-hosted. Detail and measurements are in `references/type.md`.

**The face.**

- The files are `public/fonts/InterVariable.woff2` (sha1 `f55b18fd`) and `public/fonts/InterVariable-Italic.woff2` (sha1 `a5f0513e`). Their family name is "Inter Variable", version string 4.001, with axes `opsz` 14 to 32 and `wght` 100 to 900.
- The deck (which inlines the roman) and gt-cloud's landing serve the same bytes. Prototemplate serves unicode-range subsets cut from them in `public/fonts/inter`, which keep every feature and both axes.
- No other Inter is ever loaded: no Google Fonts build through `next/font/google`, no fontsource package, no CDN copy, no `local()` source.
- No stack names `'Inter'`, `'InterVariable'` or `'Inter Display'` as a family. A bare name matches whatever Inter the reader has installed. The deck is the one place a family is named `'Inter'`: its `@font-face` carries the roman as a data URI, which cannot fail to load, so it always hides an installed Inter (`references/type.md`).

**The binding.**

- Prototemplate binds the roman's latin subset as `ptInter` in `src/lib/fonts.ts`, on `--font-inter`, and declares the other subsets and the italic as plain `@font-face` rules with a `unicode-range` in the same `ptInter` family in `src/app/inter-subsets.css`, which `scripts/subset-inter.py` writes. So every route preloads the roman latin subset, and a browser fetches any other subset only where the page draws a code point in its range.
- next/font names the family after the JavaScript identifier, and CSS family names are case-insensitive. A binding named `inter` therefore shares its name with an installed Inter. If the woff2 fails to load, that installed Inter renders (desktop Inter 3, for example, which has no opsz axis), and the metric-matched fallback never engages.
- gt-cloud's landing still binds `inter` on `--font-sans`, and its built CSS reads `"inter", "inter Fallback"`, so it carries the same exposure.

**The stack** is `var(--font-inter), system-ui, sans-serif` (the shell's `--pt-text`). next/font's fallback face is already a metric-matched local Arial, so `'Helvetica Neue', Arial` after the variable add nothing.

**Weights.** 400 for running text and long-form reading. 500 for labels, headings, display text, `b` and `strong`. Nothing above 500 and nothing below 400. The browser's `bolder` turns `b` and `strong` into 700, so a base rule sets them to 500.

**Optical size.** `font-optical-sizing: auto` and never `font-variation-settings`. The browser sets opsz to the font size in px, clamped to 14 to 32. Text at 14px and under gets the Text design, text from 32px gets the Display design, and sizes between them get the intermediate instances. Pinning opsz or wght through `font-variation-settings` breaks that mapping.

**Features.** Two lists, applied only through tokens:

- display: `'liga' 1, 'calt' 1, 'cv11' 1, 'ss01' 1` for h1, h2 and display sentences (the deck's `.big`). `cv11` is the single-storey a and `ss01` the open digits.
- text: `'liga' 1, 'calt' 1` for everything else, labels and numerals included.
- Chrome switches `calt` off under any letter-spacing, which loses Inter's arrows and its colon and hyphen fitting. Naming `'liga' 1, 'calt' 1` restores them. rsms.me's own CSS carries the same fix.
- `font-feature-settings` replaces the inherited list, so one stray rule changes the letterforms of a whole subtree. Tabular figures come from `font-variant-numeric: tabular-nums` and never from `'tnum'` in the feature list.

**Tracking.** Tracking tightens with size and weight, and weight 400 text is never tracked.

| role | tracking | where it is set |
| --- | --- | --- |
| page titles, section titles and slide headings, 32px and up, weight 500 | -0.025em | deck `head.html:62`; shell `--pt-d1-track`, `--pt-d2-track`; dashboard `.typo-page-heading` (30px) |
| figures and 24px headings | -0.02em | deck `.page .pn b`, `.spec .w`; shell `--pt-d3-track` |
| display quotes at 27 to 34px, weight 500 | -0.015em | deck `.say .q` (34px), slide 12's `.ex .q` (27px), the `.ladder` specimen rows |
| labels at weight 500, 13 to 20px | -0.01em | deck `.rows b`, `.book-toc a`; shell `--pt-track-label` |
| group labels at weight 500, 12 to 12.5px | -0.005em | deck `.sec-label`; shell `--pt-track-group` |
| running text at weight 400 | 0 | everywhere |
| 13px captions | +0.01em in gt-cloud (`.typo-caption`); 0 in the Prototemplate shell | |
| 13px counters | +0.02em in the deck (`.counter`); 0 in the Prototemplate shell | |

The Prototemplate shell tracks nothing positive, and its type lint fails any positive value on Inter. rsms.me no longer serves Inter 3's Dynamic Metrics page (rsms.me/inter/dynmetrics answers "This page used to exist, but is no longer"). In Inter 4 the opsz axis narrows spacing with size by itself, about -0.039em a character from 32px as measured on 2026-10-05. The deck's -0.025em on display sizes is a house choice on top of the Display design, and nothing goes tighter.

**Measure and wrapping.** Body text runs 60 to 70 characters a line: `--pt-measure: 32em` for body and `--pt-measure-lead: 30em` for leads. Set new measures in em and never in `ch`: Inter's zero is about 0.63em wide, so 62ch comes to 83 to 86 characters. The deck's `ch` measures (`.max`, `.max-p`, the book head) belong to the deck's owner. Headings h1 to h3 take `text-wrap: balance`.

**The ladders.**

- The Prototemplate shell: d1 44/1.04 (page title), d2 32/1.05 (section title), d3 24/1.25 (h2 in prose), title 18/1.35, lead 17/1.55, body 16/1.6, small 14/1.55, meta 13/1.5, group 12.5. Under 900px d1 is 32, d2 26/1.15 and d3 21.
- The deck sheet (1600 by 900): h1 88, `.big` 72, h2 44, lead 26, p 22 at 1.5, `.rows` 20, caption 15. Text under 15px on the sheet is a defect.
- The landing's phone ladder is DESIGN.md section 12 (`--tcm-*`).

**Monospace** is an instrument voice. It sets code, tokens, terminals, file paths, hex values and locale codes, and nothing else: no headline, body or marketing line is ever set in mono. Prototemplate uses the system mono stack (`--pt-mono`) and gt-cloud uses Geist Mono (`--font-mono`).

**Scripts.**

- Inter covers Latin, Greek and Cyrillic. CJK, Arabic, Hebrew and Indic text falls back to a face for that script: the deck's `--cjk`, `--arabic` and `--indic`, and the shell's `--pt-text-hant`, `--pt-text-hans`, `--pt-text-ja` and `--pt-text-he`.
- Every layout is checked in CJK, RTL and Indic text as well as Latin (deck slide 28).
- next/font's Arial fallback has Hebrew and Arabic glyphs, so in an Inter stack those scripts render in Arial and never reach a script face listed after it. For a real Arabic or Hebrew face, set that script's stack on its own rule (a `:lang()` selector or a class) with no Inter variable in front, the way the deck's `.lang .ar` does.

**Exceptions.** Each is named here so no sweep removes it:

- The Prototemplate nameplate: Fraunces 600 for `proto` and Space Grotesk 500 for `template`, loaded by `src/lib/brand-fonts.ts` (DESIGN.md section 15).
- The gallery's grotesk labels and mono numerals on `/` (DESIGN.md section 4). They belong to the Prototemplate chrome and appear on no GT surface.
- The `/d/` direction routes, which are self-contained explorations with their own type.
- The presenter (`/present`), whose intro lockup sets Sora and Instrument Sans (`src/app/present/fonts.ts`) and whose type beats show other faces beside Inter on purpose.
- Specimens that show the weights 300 to 800: deck slide 27 and `.ptb-display` on `/brand`.
- The speed marks' faces (Michroma, Orbitron, Anybody), which exist only as outlines inside the mark files.

**Enforcement.**

- Prototemplate: `node scripts/lint-type.mjs` fails a literal family, a bare Inter, a feature list outside the tokens, any `font-variation-settings`, a weight above 500, heading metrics outside the display tokens, positive tracking and mono on a non-code selector, and ratchets literal sizes, tracking and line heights per file. An exception is written `/* lint-type: allow <reason> */`, and an empty reason fails. `pnpm build` runs its static mode first, `pnpm lint:type:live` reads the faces, features, tracking, optical size and weights Chrome renders on the dev server's pages at 1440 and 390, and `pnpm test:type` runs its tests. `gt-lints` owns the rule table and the wiring.
- gt-cloud: the gt-ui oxlint rules `inter-only`, `mono-is-not-voice`, `no-thin-font` and `typed-text-var` in `$GT_CLOUD/tooling/oxlint-plugins/gt-ui.ts`. Prototemplate's `pnpm lint:code` runs a copy of that plugin taken on 2026-09-28 (`scripts/oxlint-plugins/gt-ui.ts`), with thirteen of its rules switched on in `.oxlintrc.json`; `no-thin-font` is not among them.

## 5. Marks

Detail, files and procedures are in `references/marks.md`.

- **The current mark** is the doubled-line GT monogram: every stroke of the G and the T is two parallel lines, the doubled-line grammar at brand scale. Its vector outline is `REFERENCE_MARK` in `src/lib/marks.ts`, the same path as the deck's `#gt-mark` symbol. The masters are `public/brand/no-bg-gt-logo-light.png` and `no-bg-gt-logo-dark.png` (the white mark). The `gt-logo-*.svg` files beside them draw the same outline in black and in white.
- **One ink.** Ink on paper or paper on ink. No third color, no gradient, no shadow, no glow. On a dark surface the drawn mark inverts, as an alpha mask that takes the surface's ink or as a clean invert. A mark ships only as vector geometry.
- **Compression.** The mark must hold at 16px (favicon), 32px (CLI banner), 64px (README header), 128px (npm page) and 256px (website), because developers meet the brand in a terminal as often as on the site (deck slide 25).
- **Inline.** At text size the GT mark sits in the line at the cap height of the text around it, with the letters GT kept as hidden text.
- **Locadex** has its own one-color mark (`public/brand/locadex-mark.svg`; `LocadexMark` in gt-cloud's `packages/ui`) and appears only where it has a function.
- **The speed set.** Kevin chose seven race-type marks on 2026-09-29 (bar monogram, lockup, plate, double cut, livery stack, dithered, ASCII). They are presented beside the current mark on `/marks` and on deck slides 17 to 23. `scripts/build-speed-marks.mjs` generates every file from geometry and font outlines (`pnpm build:marks`). Regenerate them; never redraw one by hand or edit an SVG under `public/marks`.
- **The one flourish** is the dithered specular shimmer (`DitheredMark`, the 4 by 4 Bayer band swept through the mark's alpha mask). A mark is never a gif and never carries a filter glow; gt-ui `no-gif-mark` refuses gifs.
- **Third-party logos** come from thesvg.org files, inlined as components. The `@thesvg/react` package (84 MB unpacked) is never added. In gt-cloud they live in `packages/ui/src/components/icons/*Logo.tsx` on the shared `BrandMark` root.

## 6. Language as material

The brand's recurring subject is writing systems. Each device below has an owner file and a skill:

- **Glyphs.** Characters that make up greater wholes. The glyph field drops characters from eight writing systems that resolve into the word for language in each script in turn. It runs live on `/craft` with the other devices below (BRAND.md section 7).
- **The sentence reassembler.** `src/components/shared/EverySentence.tsx` breaks a headline into glyphs and reassembles it as the same sentence in the next language, with the same number of particles. Its moving type law is DESIGN.md section 8: one shaped text node with `lang` and `dir`, width from a hidden probe, and the host page's clock (`gt-motion`).
- **Locale pills.** A locale is named in one way: a flag printed as SVG at 15 by 11, then the code (`LocaleTag` in Prototemplate, `LocaleFlag` in gt-cloud, held there by `no-raw-locale-flags`). A flag is a data chip next to a locale code and never decoration or an emoji.
- **The 1-bit Bayer language.** Density is ordered dither through the 4 by 4 and 8 by 8 matrices, never an alpha veil. This is the brand's texture (DESIGN.md section 7, `gt-dither`). Pictures of writing (the Rosetta Stone, the Blue Marble) follow the artifact picture standard in `docs/ARTIFACT-PICTURES.md`.
- **The doubled line.** Every connector is one path stroked twice, the mark's own grammar (`src/components/shared/diagrams/DoubledLine.tsx`, `--thread-gauge: 1.5px`, `--thread-gap: 3px`; `gt-diagrams`).

## 7. The avoid list

The basement brand questionnaire was finalised on 2026-08-11. Its avoid list, BRAND.md section 9 and deck slide 39 together:

| avoided | the rule that holds it |
| --- | --- |
| monospace as the brand voice in headlines, body or marketing; small mono labels in diagrams and product UI are tolerated and avoided where possible | gt-ui `mono-is-not-voice`; `lint-type` |
| smooth scrolling, scroll hijacking and inertia libraries; native scroll everywhere | gt-ui `no-smooth-scroll` |
| robot and sparkle iconography for AI, including lucide's Bot | review |
| flag soup; flags appear only as SVG chips beside a locale code, never as emoji | gt-ui `no-raw-locale-flags` |
| iridescent AI gradients (outside the horizon ring) and glassmorphism | review |
| eyebrow labels that have not earned their place; functional tags and labels are fine | gt-ui `no-eyebrow` |
| em dashes in rendered text (Kevin, 2026-08-11: zero on the site) | gt-ui `no-em-dash` |
| exclamation marks | review |
| a trailing period on a heading | gt-ui `no-heading-period` |
| a second typeface, a weight above 500 or under 400 | gt-ui `inter-only`, `no-thin-font`; `lint-type` |
| a gif as a mark or a demo frame | gt-ui `no-gif-mark` |
| shadows on any surface | review; the dashboard's plate pages remove them in `brand-tokens.css`, which keeps one for the credits card (section 3) |

The direction behind the list is International Style discipline with Art Deco's forward stance: Swiss grids, blueprints, boxes, square corners, water and the ocean as the recurring theme, and bespoke material textures. The references are in BRAND.md section 9.

## 8. Public surfaces

prototemplate.com, the deck, the public Prototemplate repository, generaltranslation.com, the docs, the blog, the films and every social post are public.

- None of them states anything about funding (investors, rounds or amounts), revenue or its mix, headcount, or the timing of an unannounced launch. The brand book on `/brand` leaves the questionnaire's sensitive facts out by design (Kevin, 2026-08-06), and every new surface keeps them out.
- The Prototemplate repository is public, so no key, token, email address or personal detail goes into a page, a picture, a capture, a skill or a commit.

### Third-party material

Any logo, picture, font, model or shader GT did not make follows [references/third-party.md](references/third-party.md).

- **Source order.** The house components first (the GT mark, the Locadex mark, `LocaleFlag`), then a customer's own brand page in true ink and the theme's variant, then thesvg.org for other marks, CC0 or licensed scans for pictures, and real recordings for product media. Keep searching until the real asset is found, and never redraw an approximation by hand.
- **Provenance and credit.** Record each asset's source and terms as it lands, and credit borrowed creative work on the page that shows it, such as an adapted shader's link to its author.
- **Licences.** Third-party material keeps its terms or is removed. A public repository with a licensing problem stays public and loses the material (Kevin, 2026-10-02: "never privatize the repo. simply remove third party models"). Prototemplate reserves all rights to General Translation (`LICENSE`).
- **Customer marks** on a public page are limited to those BRAND.md section 9 and production already show.

## Review checklist

Run it on any surface that carries the brand, in both themes, at 1440 and at 390 wide.

- [ ] Every Latin run renders from the self-hosted InterVariable file: Chrome DevTools lists it under Rendered Fonts as a network resource, never as a local file (`references/type.md` has the CDP check). In Prototemplate, `pnpm lint:type` and `pnpm lint:type:live` pass.
- [ ] No stack names a bare Inter, and the Inter variable comes first in every stack.
- [ ] Headings are weight 500, with the display features, balanced wrap and the tracking for their size. Running text is 400 and untracked. `b` and `strong` compute 500.
- [ ] No `font-variation-settings`, and no feature list written outside the two tokens.
- [ ] Mono appears only on code, tokens, paths, hex values and locale codes.
- [ ] Lines run 60 to 70 characters, and a lead reads in two or three lines.
- [ ] Four colors and one accent, with the lift `#86a8ff` on ink. Small titanium text in the light theme clears 4.5:1, darkened the way gt-cloud's plate pages darken it.
- [ ] Marks are one ink, from the files or the generator, at a size their minimum allows, with no glow, gradient, shadow or gif.
- [ ] Flags are SVG chips next to locale codes.
- [ ] The copy has no em dashes, exclamation marks, eyebrows or heading periods, and follows `gt-voice`.
- [ ] Non-Latin samples (CJK, Arabic, Devanagari) render in a face for their script and keep the layout.
- [ ] Nothing about funding, revenue, headcount or launch timing appears.
- [ ] Every third-party asset came from its owner or the named source, its source and terms are recorded, borrowed work is credited on the page, no approximation was drawn by hand, and every licence is kept or the material removed (`references/third-party.md`).

## Related skills

General skills in Kevin's wiki that this one depends on: `design-engineering-polish`, `create-graphics`, `agent-browser`. GT skills in this set: `gt-voice` (copy), `gt-aesthetic` (taste and polish), `gt-deck` (the brand deck), `gt-lints` (the line law, the picture standard, the type lint, gt-ui), `gt-dither`, `gt-diagrams`, `gt-isometric`, `gt-motion`, `gt-films`, `gt-graphics`, `gt-components`, `gt-website` and `gt-landing-pages`.

## Sources

- Prototemplate: BRAND.md sections 1 to 9 (the name, the idea, the character and voice, the mark, color, type, language as material, where it ships, the context for partners and the final avoid list).
- Prototemplate: DESIGN.md sections 1 (the four-color system), 4 (voices), 5 (the doubled line), 7 (the Bayer language), 8 (the moving type law), 12 (the mobile type ladder) and 15 (chrome exceptions).
- Prototemplate: `deck/parts/head.html` (tokens, the type rules at lines 55 to 69, the GT word at 74 to 78, the book head at 279 to 293, semantic icon hues at 113 to 125) and `deck/DECK-GRAMMAR.md` (type, color, speed marks, defects).
- Prototemplate: deck slides 12 (voice), 15 (naming), 16 (the mark), 25 (small sizes), 26 (color), 27 (type), 28 (scripts), 29 (the ladder), 36 (language as material), 39 (anti-patterns), 93 (fixed points).
- Prototemplate: `src/lib/fonts.ts`, `src/lib/brand-fonts.ts`, `src/components/viewer/tokens.css` (type tokens and base rules), `src/app/globals.css`, `deck/fonts/deck-fonts.css`, `scripts/build-deck.mjs`.
- Prototemplate: `src/app/present/presenter.css` (the mark inverted on paper), `src/lib/marks.ts`, `scripts/build-speed-marks.mjs`, `src/app/d/toolchain/diagrams/DitheredMark.tsx`, `src/app/d/toolchain/components/LocaleTag.tsx`, `src/components/shared/EverySentence.tsx`, `src/components/shared/diagrams/DoubledLine.tsx`.
- Prototemplate: `motion/MOTION.md`, local and untracked (the films' material palettes and one accent per film).
- Prototemplate: `scripts/lint-type.mjs`, `scripts/oxlint-plugins/gt-ui.ts` and `.oxlintrc.json`; `src/app/present/fonts.ts`; `src/app/system-ledger.css` and `src/app/anatomy-wall.css` (the gallery's accents).
- gt-cloud at origin/main e17fce499 (2026-10-05): `apps/landing/src/lib/fonts.ts`, `apps/landing/src/lib/fonts-prose.ts`, `apps/dashboard/src/app/brand-tokens.css`, `tooling/oxlint-plugins/gt-ui.ts`, `packages/ui/src/components/icons/BrandMark.tsx`, `packages/ui/src/components/ui/LocaleFlag.tsx`.
- rsms.me/inter (the quick start's `font-feature-settings: 'liga' 1, 'calt' 1; /* fix for Chrome */`) and rsms.me/inter/dynmetrics (removed), read 2026-10-05; the font file read with fontkit.
- Kevin, 2026-10-05: enforce the correct Rasmus Inter, one type system in tokens, held by a lint.
- Kevin, 2026-09-29: the speed set chosen; regenerate from the script.
- Kevin, 2026-09-25: the dashboard verdict ("kerning needs to be adjusted"), the deck as the standard, and the tracking ladder measured from the deck and the landing.
- Kevin, 2026-09-18: "change switzer to inter everywhere" (gt-cloud PR 4887).
- Kevin, 2026-08-11: the final basement questionnaire and its avoid list; zero em dashes in rendered prose.
- Kevin, 2026-08-06: the Dossier (`/d/singularity-dossier`) is the completed reference; sensitive questionnaire facts stay off the public site. Kevin, 2026-10-06: the brand has evolved past the Dossier, and BRAND.md section 8 waited for his decision. Kevin, 2026-10-07: "fix the dossier references"; the shipped site is the site's reference, and the Dossier is the direction it grew from.
- Third-party material: Kevin, 2026-08-05 (the gray customer logo), 2026-09-25 (the licence), 2026-10-02 (never privatize the repository); `LICENSE`, `public/media/README.md`, `public/fonts/google/README.md`.
