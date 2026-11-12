# Brand

General Translation's identity, laid out for anyone who has to build with
it. This document is the written canon. The living version is the
[`/brand`](./BRAND.md) page, and the visual laws live in
[`DESIGN.md`](./DESIGN.md).

---

## 1. The name

**General Translation** was chosen deliberately, in this order:

1. **Ambition.** Like General Motors or General Electric, the name says we
   intend to be the trustworthy, technologically innovative number one in
   the category, an enterprise in the old sense.
2. **Generality.** A reference to "artificial general intelligence": general
   AI models outperform specific translation models because they understand
   context and can be directed.
3. **Distinction.** Every other localization company seemed to begin with an
   "L".

### The naming system

| name | what it is |
| --- | --- |
| General Translation, Inc. | the company |
| General Translation | the name in running text, written out in full in every sentence |
| `gt` | the open-source code library; you run `gt translate` |
| `gt-next`, `gt-react`, `gt-vue`, `gt-node`, `gt-python` | the framework-specific packages |
| Locadex | the AI agent product |
| generaltranslation.com | the domain (also held: gt.sh, generaltranslation.ai/.dev, locadex.com/.ai/.dev) |
| glyphfield.com | the companion tooling site (shader library, animation studio) |

## 2. The idea

**Every product in every language.** Native-level speed and quality, from
day one. That's the whole thesis, executed insanely hard.

The positioning: **the Vercel of localization.** Two halves designed
together: open-source developer tools (the Next.js of the analogy: the
`gt` libraries) and closed-source infrastructure (the Vercel: context-aware
translation APIs, versioning, editing, integrations, agents) that is the
best-in-class way to use those tools. Because we build the entire stack,
we can promise what point solutions can't: consistent, high-quality
translation across a whole business, integrated in an afternoon.

Two registers, one family: the open source should feel community-owned;
the platform should feel enterprise-grade.

The values, which the visual identity must carry:

- **Engineering-first.** Built by people with deep technical roots, for the
  world's best engineering teams.
- **Craft.** We care about the difference between drawn-once and drawn-twice
  lines. That is literal: see the line law in `DESIGN.md`.
- **Infrastructure-grade.** Reliable, fast, secure. The brand should feel
  like something an enterprise stands on, not an app it tries.
- **Cosmopolitan.** Urbane, sophisticated, connecting the world and its
  languages. Language is our material, not just our market.
- **Hand-crafted.** The brand reads as made by people who care, not
  assembled from a template.

## 3. The character

The brand carries itself like a **"fullstack director"**: it writes the
script and it pushes the camera. Creative and technically innovative,
never one without the other. On time, under budget, over-delivering,
always working with the best people, with a keen sense of the market and
for making things people love.

### Personality (working readings, from the completed system)

| | position | |
| --- | --- | --- |
| Classic | ●──── toward → | **Modern** |
| **Reserved** | ← toward ────● | Playful |
| **Minimal** | ← firmly | Expressive |
| **Clever** | ← leaning | Warm |
| **Rational** | ← firmly | Quirky |
| Understated | toward → | **Confident** |
| **Serious** | ← leaning | Witty |
| **Neutral** | ← leaning, a glint allowed | Slightly mischievous |

### Aesthetic (working readings)

| | position | |
| --- | --- | --- |
| **Clean** | texture only as ordered dither | Textured |
| Soft | → | **Sharp** |
| **Geometric** | ← firmly | Organic |
| **Light** | paper-first; dark mode is one ink surface | Dark |
| **Muted** | one spectral accent per page | Vibrant |
| **Flat** | depth from lines and material, never shadows | Dimensional |
| **Monochrome** | four absolute colors + one accent | Colorful |
| **Structured** | ← firmly | Playful |
| Warm | → | **Cool** |
| **Elegant** | ← | Fun |

These are read from the shipped system. They are working answers.

### Voice

Measured, declarative, precise, quietly confident. Every sentence is
complete and makes one claim. A caption states the mechanism: "A framed
cell has a 1px padding reveal that shows the ground underneath, so the
cell draws no border." Copy uses no exclamation marks, no hedging and no
marketing adjectives where a fact would do. Wit is allowed when it is
precise. Technical terms are used precisely and sparingly, then explained
plainly. The register sits closer to a well-written spec or a good
engineering blog than to marketing copy, and the copy is about the
product.

- Say: "Translations are generated at build time and deploy with the app."
- Not: "Supercharge your global growth with cutting-edge AI!"

## 4. The mark

The mark is the logo, Axis and meridian behind
(`/brand/gt-globe-logo-light.svg`, `gt-globe-logo-dark.svg` + transparent
PNG variants, all written from `LOGO` in `src/lib/logo.ts` by
`pnpm build:logo`): a globe whose ring, meridian oval and latitude oval
draw the G, with the T's stem, the polar axis, and the back meridian
broken where they pass behind the oval's lower arc, the front of the
equator. On hover, on sign-in and while loading it takes its state, Oval
globe, axis behind, the same globe without its meridian. Both lead the
shortlist on `/marks`, and `/marks/graticule` shows the marks that led to
them. Locadex carries its own mark (`/brand/locadex-mark.svg`).

The brand kit opens `/brand`: every logo file (the mark, both lockups and
both wordmarks as SVG, PDF and PNG, with the transparent PNGs in one
folder), the palette files, Katagami Text, the loader and hover films and
the guides, in one zip. `pnpm build:brand-kit` copies the kit's previews
and small files into `public/brand/kit`, with the zip itself, which the
site serves from there. The second section of `/brand`, The logo system, draws the
logo's construction, its three states and the lockup numbers.

The logo replaced the doubled-line GT monogram on 2026-11-08 in this
site's chrome, the tab icon, `/brand` and the deck. The monogram, in
which every stroke of the mark is two parallel lines, is the previous
mark: `/marks` keeps it as a past pick, `/brand` and deck slide 16 show
it as the previous mark, and generaltranslation.com and the dashboard
draw the globe. Its old addresses (`/brand/gt-logo-light.svg`,
`gt-logo-dark.svg`, `gt-logo-light.png`, the `no-bg-gt-logo-*` PNGs and
`/static/avatars/logo.png`) serve the globe since 2026-11-10, at their
old size and ground, and `/marks/production/gt-mark.svg` serves it as
the one-color master, so outside links show the current logo.

Every logo file comes from `LOGO`: `pnpm build:logo` writes the masters,
the old addresses and `public/brand/gt-globe-logo.json`, the fingerprint
(the sha256 of `LOGO.d`, its viewBox, the lockup's sha256 and the two
lockup gaps) that checks in other repositories compare against, and
`pnpm lint:logo` fails on the monogram, an edited or hand copy of the
path, a stale generated file, an old address in code, a typeset name or
an unlisted logo picture (`scripts/lint/logo.json` lists the generated
files, the history and what is not the logo).

Rules:

- **One ink.** The mark renders in ink on paper or paper on ink. Never a
  third color, never a gradient, never a shadow.
- **The dark surface inverts the drawn mark's ink**, either as an alpha
  mask taking the surface's ink or as a clean invert. The mark is a
  drawing, not a picture.
- In illustration systems (the iso family), marks render as **alpha masks**
  so the shape takes the surface's ink; the sanctioned flourish is the
  Bayer-dithered specular shimmer (`DitheredMark`), never a GIF, never a
  filter glow.
- **Beside the stacked name**, "General" over "Translation", the globe is
  1.1 times the span from the first line's cap top to the second line's
  baseline (2.4627 cap heights), centred on that span, so it overshoots
  the cap top and the baseline by 0.1231 cap height each. The gap from
  the globe's ink to the G is 0.8 cap height (Kevin, 2026-11-09). A round
  mark only as tall as flat-topped text looks shorter than the text, for
  the same reason round letters such as O overshoot the cap height and
  the baseline.
- **On one line**, "General Translation" beside the globe, where height
  is short (a header bar, a footer, a banner): the globe is 2.2 cap
  heights tall, the size at which its ring is as thick as the name's
  stems (the ring is 6.57 percent of the globe's height and the stem at
  weight 500 is 0.1448 cap height, so they match at 2.203, rounded to
  2.2). It is centred on the cap band, so it stands 0.6 cap height above
  the cap line and below the baseline, and its ink is 0.8 cap height
  from the G's, as in the stacked lockup (Kevin approved the brand kit's
  one-line lockup, clear space and minimum sizes on 2026-11-08).
- **The four-globe lockup** sets three graticule globes before the logo
  and the stacked name: a whole graticule with its polar arcs, the
  graticule with its meridian opened on the right where the G opens, the
  graticule without its polar arcs, then the logo. Every globe shares the
  logo's ring, 13.6 unit line weight, meridian oval and latitude oval; the
  globes stand 0.22 globe diameters apart (0.596 cap height), and the logo
  and the name keep the stacked lockup's size and 0.8 cap height gap.
  `pnpm build:strip` writes `public/brand/gt-globe-strip*.svg` (currentColor,
  ink, paper, the accent and its lift) and the three graticule globes alone
  (`public/marks/graticule/strip/stage-*.svg`).
- **Clear space** is X, a quarter of the globe's height, on every side
  of either lockup: 0.68 cap height in the stacked lockup and 0.55 in the
  one-line lockup. The name alone keeps 0.68 cap height, the space it has
  in the stacked lockup. No text, edge or other logo enters it.
- **Minimum sizes.** The globe alone 24px tall (16px only as a tab
  icon); either lockup and the name alone at a cap height of 9px, where
  the stacked globe is 24.4px and the one-line globe 19.8px. In print
  24px is 6.4 mm and a 9px cap height 2.4 mm.
- **The name in the lockup is Katagami Text** at weight 500, letter-spacing
  0, with the font's own kerning, drawn as outlines (Kevin, 2026-11-08:
  "remember the word mark of general translation text uses katagami
  text!"). The two lines are flush left by ink, with 0.4627 cap height of
  white between the first baseline and the second cap line: the name's own
  word gap. `pnpm build:lockup` writes every lockup file from the font and
  `LOGO` (`public/brand/gt-globe-lockup*.svg`, the deck's `#gt-lockup`,
  the globe rows' name). Running copy is Katagami Text too (section 6).
- **In running text, write General Translation.** A sentence never names
  the company with the letters GT and never sets the logo inline in place
  of the name (Kevin, 2026-11-08). The logo stands alone: in the lockup,
  the header, the tab icon and a figure. Quotes, and copy that mirrors
  the shipped site word for word (the `/d` mirrors, the blog and Atlas
  grants callout), keep their words.
- **The identity must survive compression:** a favicon, a CLI banner, a
  README, a syntax-highlighted code block. Developers meet the brand in a
  terminal as often as on a website.

## 5. Color

Four absolute colors (ink `#070707`, raised ink `#101010`, titanium
`#8a8f98`, paper `#ffffff`) plus **exactly one spectral accent per page**
(the working accent: `#2f5ce0`; its dark-band lift `#86a8ff`). Structural
color everywhere derives from the four as alpha steps; dark mode is a pure
token remap. Full law: `DESIGN.md` §1. The accent is a controlled edge,
never a wash; one bright white; depth from lines and material, not shadows.

Texture is the 1-bit Bayer dither (`DESIGN.md` §7, `gt-dither`): whole
square cells in one ink, so a tone is a count of lit cells. Kevin set the
palette's direction from dithered artifact pictures in black, white and
blue (2026-10-01), and `/brand` gives his reasoning for the palette in its
third section, Black, white, dither and blue.

## 6. Type

- **Katagami Text** is the one typeface (Kevin, 2026-11-09: "YES.
  katagami text"). It sets the name in the logo, display, interface and
  text: headlines, interface chrome, captions, long-form reading and
  documentation prose. It replaced Inter. The build is Katagami Text 1.200,
  roman and italic, variable on one axis (wght 100 to 900), self-hosted as
  WOFF2 and never loaded from a font CDN. generaltranslation.com is
  switching all its text to it (gt-cloud #5765).
- **Known gap: some builds still render Inter** until their own switch:
  prototemplate.com (the shell, the deck and `/brand`), its films kit,
  and gt-cloud's dashboard. The blog graphics toolchain sets its labels in
  Katagami Text. The Inter rules in `gt-brand`
  describe them until then; new work anywhere else takes Katagami Text.
- **Headings use weight 500 at most.** Display text never goes bolder than
  500; long-form text is set at weight 400.
- **Katagami Text's default forms are the brand's.** Its profile makes
  the long-flag 1, the G with a spur and the compact f the defaults;
  every other form is Inter's default: the double-storey a, a round-topped
  3, a closed 4, a 6 and 9 with curved stems and punctuation with round
  dots. No feature list on top: every tag turns on a form the brand does
  not use. `ss01` ("Open digits") gives the flat-top 3, open 4 and
  straight-stem 6 and 9, `ss07` square punctuation, `cv11` a
  single-storey a, and `cv01`, `cv10` and `cv12` switch the 1, the G and
  the f back to Inter's.
- **Multilingual-first.** Headlines, UI, and marks must hold up in CJK,
  RTL, and Indic scripts as well as Latin. A wordmark or layout that only
  works in English contradicts the company. Katagami Text covers Latin,
  Greek, Cyrillic and 28 more scripts; the site's subset keeps Latin, Greek
  and Cyrillic, and other scripts fall back to a face for that script.
  Every layout is checked in them.
- **Monospace is an instrument voice, not a brand voice.** Code is set in
  Geist Mono (the Prototemplate shell uses the system mono stack until its
  switch). It appears where
  code artifacts appear (tokens, terminals, file paths, small labels in
  technical diagrams and product UI) and nowhere else, and even those
  labels are avoided where possible. The direction explicitly avoids
  monospace as the brand voice in headlines, body, and marketing.
- The prototemplate chrome (this site's own serif/grotesk pairing) is the
  lab's stationery, not the product brand.

## 7. Language as material

The signature device: **glyphs, characters that make up greater wholes.**
Writing systems are the raw material the brand keeps returning to:

- The **sentence reassembler** (`EverySentence`): a headline dissolves into
  glyph dust and reassembles in the next language. Matter is conserved; the
  same swarm becomes the next sentence.
- The **glyph field**: rain from eight writing systems condensing into the
  word "language," script after script.
- **Locale pills** (`LocaleTag`): flag print + code, the one way a locale is
  named anywhere. The prints are SVG, never emoji; a flag is a functional
  data chip, never decoration.
- The **1-bit Bayer language**: density as ordered dither, never alpha
  veils. This is the texture of the brand.
- The **doubled line**: every connector one path stroked twice; the mark's
  own grammar running through every diagram.

All of them run live in the build log on `/docs/handbook/libraries`,
with their APIs.

## 8. Where it ships

The identity is applied on four kinds of surface today.

- **The site.** Marketing pages ship on generaltranslation.com, built in
  gt-cloud's `apps/landing`. The production landing page (gt-cloud #4213)
  has been canonical for the site since 2026-08-11.
- **Product surfaces.** The dashboard, onboarding, the sign-in plate and
  the Prototemplate shell have followed the brand deck (`/deck`) since
  2026-09-25.
- **Motion.** The films on `/motion` apply the identity to film: the blog
  trailers, the product films and the translation-history series.
- **The marks.** The logo, Axis and meridian behind, is the mark in this
  site's chrome, on `/brand` and in the deck since 2026-11-08 (section
  4). The shortlist on `/marks` opens on it and its state, Oval globe,
  axis behind. The speed marks chosen on 2026-09-29 sit beside the
  doubled-line monogram, the previous mark. The title badges in the
  `/brand` and `/marks` heads cycle through a selection of the marks on
  `/marks`.

When in doubt about how the brand behaves, read the shipped surface the
work belongs to.

The site grew from the direction of the **Dossier**
(`/d/singularity-dossier`). It stays in the gallery with the other
directions as the working record of how we got there. From 2026-08-06 to
2026-10-07 this section named it the completed reference for the brand.

## 9. Context

- **Industry:** AI developer tools; the full stack for localization,
  meaning i18n libraries, context-aware translation APIs, and the
  infrastructure for versioning, editing, and integrations.
- **Audience:** technical and product executives at growth-stage startups;
  their engineering and growth teams are the users.
- **Public names:** a customer or partner is named only where
  generaltranslation.com shows it. On 2026-10-10 the home page showed
  Cursor, Ramp, Mintlify, Profound, Partiful and ClickHouse, and a quote
  from Theo, CEO of T3 Chat. `/enterprise` showed Ramp with 11+ locales
  across its dashboard, landing page and iOS, Cursor with 14+ across web
  and docs, Profound with 47+ across platform and docs, Partiful with 2+
  across web, iOS and Android, and Sierra with 7+ across web and GTM, with
  a quote from Lee Robinson, VP of Developer Experience at Cursor.
  `/enterprise/contact` had partner pages for YC, Mercury, Slash,
  speedrun, a16z and The Residency. Every other name stays off public
  surfaces, this repository included. Read the live site again before a
  new surface names anyone.
- **Against:** legacy TMS (seat-based, partial-stack). General Translation is usage-based
  and owns the whole stack, so it can own the whole experience.
- **Admired:** Vercel, Resend, Stripe, for reliable, developer-first
  infrastructure with engineering excellence and customer experience.
- **Direction:** International Style discipline with Art Deco's
  future-embracing stance. Swiss grids, blueprints, boxes, no rounded
  corners. Water and ocean as the recurring theme, connecting the globe.
  Bespoke material textures (reference: materialarchiv.ch).
- **References:** Josef Müller-Brockmann and the Swiss poster tradition;
  Otl Aicher's Munich 1972 pictograms; Vignelli's subway map; split-flap
  departure boards; undersea cable maps and nautical charts; the Rosetta
  Stone; the Chrysler Building; Powers of Ten; vintage National Geographic;
  Borges' Library of Babel; the Whole Earth Catalog; transit signage; NYRB
  Classics; Dieter Rams; vintage Olympics stamps.
- **Avoid (final):**
  - monospace as the brand voice in headlines, body, or marketing; small
    mono labels inside technical diagrams and product UI remain
    instruments, avoided where possible.
  - smooth scrolling, scroll-hijacking, and inertia libraries; native
    scroll everywhere.
  - robot and sparkle iconography for AI.
  - the flag-soup cliche; flags are functional data chips only, printed as
    SVG, never emoji.
  - iridescent AI gradients and glassmorphism.
  - eyebrow text that has not earned its place; three stacked lines saying
    the same thing is noise, functional tags and labels are fine.
  - em dashes in rendered prose.
