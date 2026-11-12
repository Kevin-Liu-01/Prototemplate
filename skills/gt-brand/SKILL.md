---
name: gt-brand
description: >-
  The General Translation identity as rules: the name and the naming system,
  the four absolute colors and the one accent, the type system on Katagami
  Text, the one typeface (weights, features, tracking, per-script
  fallbacks, Geist Mono for code, and the Inter build prototemplate.com
  still renders), the globe logo and the generated speed
  marks, language as material, the final avoid list, and what
  never appears on a public surface. Use before making anything that carries
  the brand (a page, a slide, a graphic, a film, an email or a social
  image), when choosing a face, weight, tracking or color, when placing a
  mark or a third-party logo, and when reviewing a surface against the brand.
metadata:
  title: Brand and Katagami Text
  areas: aesthetic
  updated: 2026-11-09
  origin: prototemplate
  owner: P
---

# Brand and Katagami Text

General Translation builds open-source i18n libraries (`gt` and framework packages such as `gt-next`) and a closed translation platform with an AI agent, Locadex. Its identity is written in Prototemplate's BRAND.md and DESIGN.md and drawn in the brand deck (`deck/parts/head.html` and `deck/slides/`). This skill states those documents as rules for anything that carries the brand. Type gets the most room, because nearly every type defect Kevin has flagged came from settings layered on the one face.

Paths are relative to a Prototemplate checkout (`$PROTOTEMPLATE`) unless they name `$GT_CLOUD`, a gt-cloud checkout at origin/main. A long-lived gt-cloud checkout can sit on an old branch without the files named here, so read gt-cloud facts from origin/main or a fresh worktree. `motion/` in Prototemplate is the films session's local folder and stays untracked, so its files exist only in Kevin's checkout (`gt-films`).

These files hold the detail:

- `references/type.md`: Katagami Text's files, bindings, features and tracking; then the Inter build prototemplate.com still renders, with its file, bindings, tokens, optical size, ladders, per-script stacks, the type lint and the gotchas.
- `references/marks.md`: the current mark and its files, the review standard for a new mark, the name in running text, the speed set and how to regenerate it, the Locadex mark, the dithered shimmer and third-party logos.
- `references/color.md`, `references/language.md` and `references/third-party.md`: the color exceptions, the language devices and the rules for material the company did not make.
- `references/sources.md`: where every rule comes from, with dates.

## 1. The name and the naming system

The name General Translation was chosen for three reasons, in this order. The first is ambition: like General Motors or General Electric, the name states the intent to be the leading company in the category. The second is generality: general AI models understand context and follow direction better than specialised translation models. The third is distinction: most other localization companies have names that begin with L.

| name | what it is | how it is written |
| --- | --- | --- |
| General Translation | the company; General Translation, Inc. in legal text | in full in every sentence and heading (`references/marks.md`) |
| `gt` | the open-source library and CLI; users run `npx gt translate` | lowercase, in code form |
| `gt-next`, `gt-react`, `gt-vue`, `gt-node`, `gt-python` | the framework packages | in their exact form |
| Locadex | the AI agent product | its own mark |
| generaltranslation.com | the domain | in body copy |
| prototemplate.com | the design lab and the brand reference site | in body copy |
| glyphfield.com | the companion tooling site: the shader library and the animation studio | a separate site from prototemplate.com |

- A product token keeps its exact form and is never the first word of a heading. A heading names the thing: "Prototemplate" in the heading, "prototemplate.com" in the body.
- The identity project has two fixed points: the legal name General Translation and the names customers install and import (`gt` and the packages). The mark, the colors, the type, the layout system, the voice, the site structure and the product names, Locadex included, are open in that project (deck slide 93). The rules in this skill are the working system until the project replaces them.

## 2. The idea and the values

The thesis is "every product in every language": native-level speed and quality from the first day. The positioning is the Vercel model applied to localization. General Translation builds the open-source libraries (`gt` and the framework packages) and the closed platform (context-aware translation APIs, versioning, editing, integrations and Locadex) as one stack. Because it owns the whole stack, it can deliver consistent translation quality across a company's apps, docs and websites, integrated in an afternoon. The open source carries a community register and the platform an enterprise register, in one family.

The identity has to carry five values:

- **Engineering-first.** Built by people with deep technical roots for the best engineering teams.
- **Craft.** The difference between a line drawn once and a line drawn twice matters, and the line law in DESIGN.md section 2 makes it literal.
- **Infrastructure-grade.** Reliable, fast and secure; something an enterprise stands on.
- **Cosmopolitan.** Urbane and sophisticated, connecting the world's languages. Language is the material as well as the market.
- **Hand-crafted.** Made by people who care, with no template look.

The voice is measured, declarative and precise. BRAND.md section 3 gives the pair:

- Say: "Translations are generated at build time and deploy with the app."
- Not: "Supercharge your global growth with cutting-edge AI!"

Deck slide 12 states the five rules: one claim per sentence; a number or a mechanism where a marketing adjective would go; no hedging; no exclamation marks and no em dashes; sentence case everywhere and Title Case only on buttons. The full writing rules are in `gt-voice`.

For product surfaces, Kevin judges the result against the brand deck (2026-09-25); for the site, the reference is the shipped generaltranslation.com, built from `apps/landing` in gt-cloud. The Dossier (`/d/singularity-dossier`) stays in the gallery as the direction the site grew from (Kevin, 2026-10-07: "fix the dossier references"). `gt-aesthetic` section 1 and its `references/verdicts.md` hold the history.

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
- **A new palette states shares.** A proposed palette gives each color's share of the surface as well as its value, and is shown as blocks drawn in those shares.
- **Semantic hues appear on icons only**, in the deck: `#12a37a` done or passing, `#f0a020` open or in review, `#e5484d` excluded or rejected, `#2f5ce0` the company itself. The four are the same in both of the deck's themes, so these icon hues are separate from the accent's lift. Text and lines stay monochrome. The shell's site icons use the same amber on ink and darken it to `#c47d00` on paper, where `#f0a020` sits at 2.15:1 (`--pt-site-signal`).
- **Contrast.** Titanium on paper is 3.25:1, under the 4.5:1 that small text needs; on ink it is 6.2:1. gt-cloud's plate pages darken light-theme titanium to `#6e737c` (4.77:1) in `$GT_CLOUD/apps/dashboard/src/app/brand-tokens.css`. Check titanium text at 13px in the light theme before shipping it.

The color rules have four documented exceptions, each named in `references/color.md` so no sweep removes it: the films (a film's palette is its material), the dashboard's credits card, the horizon ring (deck slide 39) and the Prototemplate mark's rainbow core.

## 4. Type

**Katagami Text is the one typeface** (Kevin, 2026-11-09: "YES. katagami text"). It sets everything: the name in the logo, display, interface and body. It replaced Inter. Geist Mono sets code. Detail: `references/type.md`.

**Known gap.** Some builds still render Inter until their own switch: prototemplate.com (the shell, the deck, `/brand`; `pnpm lint:type` holds that build), its films kit (`motion/kit`) and blog graphics (`graphics/`), and gt-cloud's dashboard (`--font-sans`; #5765 switches only the landing). The Inter block below describes them until then. New work anywhere else takes Katagami Text.

**The face.** Katagami Text 1.200 from the Katagami family (katagami.kevinliu.studio, SIL Open Font License 1.1): roman and italic, variable on one axis, wght 100 to 900, no optical size axis. 15,212 glyphs: Latin, Greek, Cyrillic and 28 more scripts. Cap height 1430 of 2048 units (0.698em).

- The sources are `fonts/text/KatagamiText[wght].ttf` and `KatagamiText-Italic[wght].ttf` in the Katagami repository. The brand kit ships them with full WOFF2 files made from them.
- generaltranslation.com is switching to it in gt-cloud #5765: WOFF2 subsets cut to InterVariable's 2,852 code points (`$GT_CLOUD/apps/landing/public/fonts/KatagamiText.woff2` and `-Italic.woff2`), bound as `katagamiText` on `--font-sans`, with gt-ui's `inter-only` renamed `katagami-text-only`.
- Self-host it; never load it from a font CDN. Declare it under its own name, `'Katagami Text'`, never a `GT` family name.

**Weights.** 400 for running text and long-form reading. 500 for labels, headings, display text, `b` and `strong`. Nothing above 500 and nothing below 400. The browser's `bolder` turns `b` and `strong` into 700, so a base rule sets them to 500.

**Features.** Katagami Text's defaults are the brand's forms: the long-flag 1, a G with a spur and the compact f, and otherwise Inter's own (double-storey a, round-topped 3, closed 4, curved 6 and 9, round-dot punctuation). Write no `font-feature-settings`: every tag turns on a form the brand does not use (`ss01` "Open digits" the flat-top 3, open 4 and straight 6 and 9; `ss07` square punctuation; `cv11` a single-storey a; `cv01`, `cv10`, `cv12` Inter's 1, G and f). Tabular figures come from `font-variant-numeric: tabular-nums`. Set `font-weight`, never `font-variation-settings`.

**Tracking.** The Inter build's ladder carries over unchanged; it has not been re-tuned for Katagami Text. Tracking tightens with size and weight, and weight 400 text is never tracked: -0.025em for titles 32px and up at 500, -0.02em for figures and 24px heads, -0.015em for display quotes, -0.01em for labels, -0.005em for group labels, 0 for running text. Positive tracking appears only on gt-cloud's 13px captions (+0.01em) and the deck's 13px counters (+0.02em). Nothing goes tighter than -0.025em; generaltranslation.com's engine heads (-0.028em, `engine.css`) are a known gap that #5765 keeps.

**Measure and wrapping.** Body text runs 60 to 70 characters a line: `--pt-measure: 32em` for body and `--pt-measure-lead: 30em` for leads. Set measures in em, never in `ch`: Katagami Text's zero is 0.58em wide, so 62ch runs well past 70 characters. Headings h1 to h3 take `text-wrap: balance`.

**Monospace** is an instrument voice. Geist Mono sets code, tokens, terminals, file paths, hex values and locale codes, and nothing else: no headline, body or marketing line is ever set in mono. gt-cloud binds it as `--font-mono`; the Prototemplate shell uses the system stack `--pt-mono` until its switch.

**Scripts.** generaltranslation.com's subset keeps Latin, Greek and Cyrillic; CJK, Arabic, Hebrew and Indic text falls back to a script face, and every layout is checked in CJK, RTL and Indic text as well as Latin. A real Arabic or Hebrew face takes its own rule with nothing in front (`references/type.md`).

**Prototemplate's Inter build, until its switch.** The self-hosted rsms InterVariable 4.1 (`public/fonts/InterVariable.woff2`, sha1 `f55b18fd`, and the italic, `a5f0513e`), bound as `ptInter` on `--font-inter` with unicode-range subsets, stack `var(--font-inter), system-ui, sans-serif`, `font-optical-sizing: auto`, the display list `'liga' 1, 'calt' 1, 'cv11' 1, 'ss01' 1` and the text list `'liga' 1, 'calt' 1` through tokens, and the -0.025em ladder. The deck inlines the roman as `'Inter'`. No other Inter is ever loaded and no stack names a bare `'Inter'`. The bindings, tokens, ladders and gotchas are in `references/type.md`.

**Exceptions.** The nameplate's Fraunces and Space Grotesk, the gallery's grotesk labels on `/`, the `/d/` directions, the presenter's faces, the weight specimens (deck slide 27, `.ptb-display`) and the speed marks' outline faces. Each is named in `references/type.md` so no sweep removes it.

**Enforcement.** gt-cloud's gt-ui rules `katagami-text-only` (`inter-only` until #5765 lands), `mono-is-not-voice`, `no-thin-font` and `typed-text-var`. Prototemplate's `scripts/lint/type.mjs` (static in `pnpm build`, `pnpm lint:type:live`, `pnpm test:type`) and its copy of gt-ui still hold the Inter build until the switch. What each fails: `references/type.md`; the wiring: `gt-lints`.

## 5. Marks

Detail, files and procedures are in `references/marks.md`.

- **The current mark** is the logo, Axis and meridian behind (Kevin, 2026-11-08: "Swap everything"): a globe whose ring and ovals draw the G and whose polar axis is the T's stem. Its one drawing is `LOGO` in `src/lib/logo.ts`, and `pnpm build:logo` writes the masters in `public/brand`, the tab icon and the deck's `#gt-mark` symbol from it. The doubled-line monogram is the previous mark; its old URLs show the globe.
- **One ink.** Ink on paper or paper on ink. No third color, no gradient, no shadow, no glow. On a dark surface the drawn mark inverts, as an alpha mask that takes the surface's ink or as a clean invert. A mark ships only as vector geometry.
- **Compression.** The mark must hold at 16px (favicon), 32px (CLI banner), 64px (README header), 128px (npm page) and 256px (website), because developers meet the brand in a terminal as often as on the site (deck slide 25).
- **The logo's state** on hover, sign-in and loading is Oval globe, axis behind; both lead `SHORTLIST`.
- **Lockups.** Stacked: the globe 1.1 times the name's two-line span, centred on it. One line: the globe 2.2 cap heights tall, centred on the cap band. Both 0.8 cap from the G. Clear space a quarter of the globe's height (0.68 cap stacked, 0.55 one line); minimum a 9px cap, the globe alone 24px.
- **In running text, write General Translation** (Kevin, 2026-11-08): never the letters GT as the name and never the logo inline. The logo stands alone (`references/marks.md`).
- **A new mark.** The G's top arc runs out into a straight horizontal segment, as in the doubled-line monogram; a diagonal, radial or hooked terminal is refused (Kevin, 2026-10-09). A candidate is reviewed on paper and ink, at navigation size among competing products' logos and beside the current mark, and only picks are rebuilt as clean SVG with a construction drawing. The review standard, the failure list and the catalog a pick enters (`SHORTLIST`, `pnpm import:marks`) are in `references/marks.md`.
- **Locadex** has its own one-color mark (`public/brand/locadex-mark.svg`; `LocadexMark` in gt-cloud's `packages/ui`) and appears only where it has a function.
- **The speed set.** Kevin chose seven race-type marks on 2026-09-29 (bar monogram, lockup, plate, double cut, livery stack, dithered, ASCII). They are presented beside the doubled-line monogram on `/marks` and on deck slides 17 to 23, generated by `pnpm build:marks` and never redrawn by hand (`references/marks.md`, Regenerating).
- **The one flourish** is the dithered specular shimmer (`DitheredMark`, the 4 by 4 Bayer band swept through the mark's alpha mask). A mark is never a gif and never carries a filter glow; gt-ui `no-gif-mark` refuses gifs.
- **Third-party logos** come from thesvg.org files, inlined as components. The `@thesvg/react` package (84 MB unpacked) is never added. In gt-cloud they live in `packages/ui/src/components/icons/*Logo.tsx` on the shared `BrandMark` root.

## 6. Language as material

The brand's recurring subject is writing systems. Its five devices are glyphs (the glyph field), the sentence reassembler (`EverySentence.tsx`, DESIGN.md section 8), locale pills (a flag as an SVG chip beside its code, never decoration or an emoji), the 1-bit Bayer language (ordered dither, never an alpha veil; `gt-dither`) and the doubled line (`gt-diagrams`). Each device's owner file and rules are in `references/language.md`.

## 7. The avoid list

The brand questionnaire was finalised on 2026-08-11. Its avoid list, BRAND.md section 9 and deck slide 39 together:

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
| a second typeface, a weight above 500 or under 400 | gt-ui `katagami-text-only` (`inter-only` until #5765), `no-thin-font`; `lint-type` |
| a gif as a mark or a demo frame | gt-ui `no-gif-mark` |
| shadows on any surface | review; the dashboard's plate pages remove them in `brand-tokens.css`, which keeps one for the credits card (section 3) |

The direction behind the list is International Style discipline with Art Deco's forward stance: Swiss grids, blueprints, boxes, square corners, water and the ocean as the recurring theme, and bespoke material textures. The references are in BRAND.md section 9.

## 8. Public surfaces

prototemplate.com, the deck, the public Prototemplate repository, generaltranslation.com, the docs, the blog, the films and every social post are public.

- None of them states anything about funding (investors, rounds or amounts), revenue or its mix, headcount, or the timing of an unannounced launch. The brand book on `/brand` leaves sensitive business facts out by design (Kevin, 2026-08-06), and every new surface keeps them out.
- The Prototemplate repository is public, so no key, token, email address or personal detail goes into a page, a picture, a capture, a skill or a commit.

### Third-party material

Any logo, picture, font, model or shader the company did not make follows [references/third-party.md](references/third-party.md): the source order (house components, then the owner's brand page, then thesvg.org, CC0 or licensed scans, and real recordings; keep searching and never redraw an approximation by hand), provenance and credit recorded as each asset lands, licences kept or the material removed (a public repository stays public and loses the material, Kevin, 2026-10-02), and customer marks limited to those BRAND.md section 9 and production already show. Prototemplate reserves all rights to General Translation (`LICENSE`).

## Review checklist

Run it on any surface that carries the brand, in both themes, at 1440 and at 390 wide.

- [ ] Every Latin run renders from the self-hosted Katagami Text file: Chrome DevTools lists it under Rendered Fonts as a network resource, never as a local file (`references/type.md` has the CDP check). On prototemplate.com, until its switch, the InterVariable file, and `pnpm lint:type` and `pnpm lint:type:live` pass.
- [ ] Headings are weight 500, with balanced wrap and the tracking for their size. Running text is 400 and untracked. `b` and `strong` compute 500.
- [ ] No `font-variation-settings`. On Katagami Text, no feature list at all; on the Inter build, none outside the two tokens.
- [ ] Mono is Geist Mono and appears only on code, tokens, paths, hex values and locale codes.
- [ ] Lines run 60 to 70 characters, and a lead reads in two or three lines.
- [ ] Four colors and one accent, with the lift `#86a8ff` on ink. Small titanium text in the light theme clears 4.5:1, darkened the way gt-cloud's plate pages darken it.
- [ ] Marks are one ink, from the files or the generator, at a size their minimum allows, with no glow, gradient, shadow or gif. A new mark was reviewed in a row of competing logos and beside the current mark.
- [ ] A new palette gives each color's share as well as its value.
- [ ] Flags are SVG chips next to locale codes.
- [ ] The copy has no em dashes, exclamation marks, eyebrows or heading periods, and follows `gt-voice`.
- [ ] Running text names General Translation in full, never GT or the logo.
- [ ] Non-Latin samples (CJK, Arabic, Devanagari) render in a face for their script and keep the layout.
- [ ] Nothing about funding, revenue, headcount or launch timing appears.
- [ ] Every third-party asset came from its owner or the named source, its source and terms are recorded, borrowed work is credited on the page, no approximation was drawn by hand, and every licence is kept or the material removed (`references/third-party.md`).

## Related skills

General skills in Kevin's wiki that this one depends on: `design-engineering-polish`, `create-graphics`. Skills in this set: `gt-voice` (copy), `gt-aesthetic` (taste and polish), `gt-deck` (the brand deck), `gt-lints` (the line law, the picture standard, the type lint, gt-ui), `gt-dither`, `gt-diagrams` (with the isometric family), `gt-explorations` (mark rounds), `gt-verify` (the browser checks), `gt-motion`, `gt-films`, `gt-graphics`, `gt-components`, `gt-website` and `gt-landing-pages`.

## Sources

Dated provenance for every rule is in `references/sources.md`: BRAND.md, DESIGN.md and the deck, the font files and lints, the gt-cloud files, and Kevin's dated directives with the memory notes that recorded them.
