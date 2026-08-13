# The Brand

General Translation's identity, laid out for anyone who has to build with
it, including our partners at basement studio. This document is the written
canon. The living version is the [`/brand`](./BRAND.md) page, the visual
laws live in [`DESIGN.md`](./DESIGN.md), and the completed reference
application is the **Dossier** (`/d/singularity-dossier`). Treat the
Dossier as the finished statement of this identity, not a concept.

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
| GT | the short form, and the mark |
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

These are read from the shipped system for basement to confirm or push.

### Voice

Measured, declarative, precise, quietly confident. Captions state laws:
"the ground is the seam." Short sentences carry their own weight, with no
exclamation marks doing the work, no hedging, and no marketing adjectives
where a fact would do. Wit is allowed as precision, never as decoration.
Technical terms are used precisely and sparingly, then explained plainly.
The register sits closer to a well-written spec or a good engineering blog
than to marketing copy: product focus over performative marketing.

- Say: "One pipeline. Every language ships with the deploy."
- Not: "Supercharge your global growth with cutting-edge AI!"

## 4. The mark

The GT monogram (`/brand/gt-logo-light.svg`, `gt-logo-dark.svg` +
transparent PNG variants): every stroke of the mark is two parallel lines,
the doubled-line grammar at brand scale. Locadex carries its own mark
(`/brand/locadex-mark.svg`).

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
- At text size, the wordmark sits inline with prose (the hero's
  "GT builds full-stack infrastructure…" pattern) at the cap height of the
  line it lives in.
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

## 6. Type

- **Switzer** is the display and UI face, self-hosted, weights 300–800. The
  voice of headlines, interface chrome, and the brand's declarative
  captions.
- **Inter** is the text companion: the real rsms.me Inter (v4.1 variable,
  roman + italic, opsz axis), not the Google Fonts build. Long-form reading,
  documentation prose.
- **Multilingual-first.** Headlines, UI, and marks must hold up in CJK,
  RTL, and Indic scripts as well as Latin. A wordmark or layout that only
  works in English contradicts the company. Licensed type needs credible
  CJK and RTL coverage, or well-matched companion faces.
- **Switzer plus Inter is the working pair, not a final answer.**
  Alternatives are open if they satisfy the script-coverage constraint.
- **Monospace is an instrument voice, not a brand voice.** It appears where
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

All of them run live on `/craft` with their APIs.

## 8. The completed reference

**The Dossier** (`/d/singularity-dossier`, with `/enterprise`) is the
completed version of this identity in application: the belt-driven
morphing headline, the translate window, the stack tower with the
Locadex shimmer, the edge globe with its dithered atmosphere, the four-color
dark band. When in doubt about how the brand behaves in product, the
Dossier is the answer. The other directions are the working record of how
we got there.

## 9. Context for partners

- **Industry:** AI developer tools; the full stack for localization,
  meaning i18n libraries, context-aware translation APIs, and the
  infrastructure for versioning, editing, and integrations.
- **Audience:** technical and product executives at growth-stage startups;
  their engineering and growth teams are the users. Auth0 translates docs,
  Sierra translates marketing and sales material, Ramp translates its core
  dashboard.
- **Against:** legacy TMS (seat-based, partial-stack). GT is usage-based
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
