<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/prototemplate-dark.gif">
  <img src="public/prototemplate-light.gif" alt="prototemplate — the serif 'proto' and grotesk 'template' slide in from the flanks and park inside the outlined nameplate" width="100%">
</picture>

# Prototemplate

**Eighteen art directions for the [General Translation](https://generaltranslation.com) website redesign** — a working design lab where every prototype is a real page: GSAP choreography, hand-built WebGL shader heroes, and a localization story told with real translations in every one of them.

**Live:** [prototemplate.vercel.app](https://prototemplate.vercel.app) · **Presenter:** [/present](https://prototemplate.vercel.app/present) · **Build log:** [/craft](https://prototemplate.vercel.app/craft)

---

## What this is

General Translation builds full-stack localization infrastructure. This repo is the exploration ground for its next marketing site: one shared minimalist shell (paper, hairlines, a ruled column) forked into eighteen competing identities, each built around a single signature moment — a shader, a mechanic, an optical device — that demonstrates *translation itself*. English goes in; Japanese, Arabic, Korean, German come out. Nothing is a mockup: every page runs, animates, localizes, and survives `prefers-reduced-motion` with a composed still.

The gallery is judged in the browser: `/present` is a full-screen scroll presenter with per-direction notes and star ratings, and `/craft` documents the system under the system — the line law, the rail grid, the shader engines, and the libraries extracted along the way.

## The directions

### Explorations

| | |
|---|---|
| [![Toolchain](public/shots/light/toolchain.jpg)](https://prototemplate.vercel.app/d/toolchain) **01 · Toolchain** — one ruled column, bento rows whose shells never repeat, isometric line-art diagrams. Structure from hairlines alone. | [![Chroma Flow](public/shots/light/chroma-flow.jpg)](https://prototemplate.vercel.app/d/chroma-flow) **02 · Chroma Flow** — a curl-noise flow field pulls streaming color through the nameplate; the product story reads as one continuous pipeline. |
| [![Dither Field](public/shots/light/dither-field.jpg)](https://prototemplate.vercel.app/d/dither-field) **03 · Dither Field** — hellos in eight scripts resolve out of Bayer noise and dissolve back, pixel by pixel, at a strict 1 bit. | [![Aurora Paper](public/shots/light/aurora-paper.jpg)](https://prototemplate.vercel.app/d/aurora-paper) **04 · Aurora Paper** — a grainy aurora fills one glowing panel behind a disciplined paper page; the translation cascade hangs in its light. |
| [![Glyph Rain](public/shots/light/glyph-rain.jpg)](https://prototemplate.vercel.app/d/glyph-rain) **05 · Glyph Rain** — a particle rain of world-script glyphs gathers into each word of the headline, holds, and re-scatters. | [![Prism Light](public/shots/light/prism-light.jpg)](https://prototemplate.vercel.app/d/prism-light) **06 · Prism Light** — one white beam splits through a glass prism and the translations ride the dispersion fan out to the edge. |
| [![Lens Gate](public/shots/light/lens-gate.jpg)](https://prototemplate.vercel.app/d/lens-gate) **07 · Lens Gate** — the ruled paper itself refracts through one breathing glass; components enter in English and exit translated. | [![Paper Foundry](public/shots/light/paper-foundry.jpg)](https://prototemplate.vercel.app/d/paper-foundry) **08 · Paper Foundry** — the bento machined into paper: hairline cells in a brushed-graphite sheet, one anisotropic sheen sweep. |
| [![Terminus Board](public/shots/light/terminus-board.jpg)](https://prototemplate.vercel.app/d/terminus-board) **09 · Terminus Board** — a departure hall for locales: a split-flap headline riffles through world scripts and cools through amber. | [![Wide Rule](public/shots/light/wide-rule.jpg)](https://prototemplate.vercel.app/d/wide-rule) **10 · Wide Rule** — one analytic interference band crosses enormous quiet space; the gate is the light source, the calm holds the type. |
| [![Event Horizon](public/shots/light/event-horizon.jpg)](https://prototemplate.vercel.app/d/event-horizon) **11 · Event Horizon** — component walls dive with curved perspective into a black-hole gate; English falls in, translations emerge, flags orbit the horizon. | [![Hourglass](public/shots/light/hourglass.jpg)](https://prototemplate.vercel.app/d/hourglass) **12 · Hourglass** — dark corridor walls of UI cards sweep concavely into a vanishing point, pinched at a waist that holds the mark and the CTAs. |
| [![Singularity](public/shots/light/singularity.jpg)](https://prototemplate.vercel.app/d/singularity) **13 · Singularity** — the enterprise gate: the lensing horizon alone on open paper, customers riding the locale belt, glyphs raining through the contact bay. | |

### Full-site concepts

Five complete sites grown from the Toolchain home — each pairs a re-argued first fold with its own `/enterprise` page.

| | |
|---|---|
| [![Dossier](public/shots/light/singularity-dossier.jpg)](https://prototemplate.vercel.app/d/singularity-dossier) **14 · Dossier** — the every-stack argument folded into the hero terminal; enterprise as an evidence file: exhibits, a certificate wall, an audit ledger under the gate. | [![Orbit](public/shots/light/singularity-orbit.jpg)](https://prototemplate.vercel.app/d/singularity-orbit) **15 · Orbit** — the hero terminal collapsed to a one-line session; enterprise argues with gravity: dials, customers riding a live orbit, one witness. |
| [![Signal](public/shots/light/singularity-signal.jpg)](https://prototemplate.vercel.app/d/singularity-signal) **16 · Signal** — the terminal split into session and output panes, cause and effect at once; enterprise as the broadcast: intercepts, a self-typing rollout log, the beam. | [![Observatory](public/shots/light/singularity-observatory.jpg)](https://prototemplate.vercel.app/d/singularity-observatory) **17 · Observatory** — the terminal walks install → translate → serve; enterprise as measured proof: the meridian globe, the star catalog, the readouts. |
| [![Procession](public/shots/light/singularity-procession.jpg)](https://prototemplate.vercel.app/d/singularity-procession) **18 · Procession** — no hero card at all: the first fold is one full-width console; enterprise as the march — the word-swarm manifesto, customers as monuments. | |

Every direction also ships a dark theme — the same pages re-exposed for ink ([see the dark contact sheet](public/shots/dark)).

## Routes

- `/` — the index: every direction, the site concepts in their own section, the nameplate assembling above them.
- `/d/<slug>` — each direction as a standalone page. `?chrome=0` hides the floating direction switcher.
- `/d/<slug>/enterprise` — the enterprise page of each full-site concept (14–18).
- `/present` — the presenter: why, first principles, how it was built, a type-detail interlude, then the live prototype viewer with per-direction notes and ratings (saved to localStorage), ending in a gallery verdict.
- `/craft` — the build log: the line law, the rail system, the shader engines, and the libraries extracted from the work.

## How it's built

- **Next.js 16** (App Router, Turbopack) + **React 19** + **Tailwind 4**, deployed as a stock Next.js app.
- **GSAP 3.13** with ScrollTrigger, MorphSVG, DrawSVG, and ScrambleText for every choreography.
- **Hand-written WebGL shaders**, one engine per optical idea — the prismatic burst, the ruled-lens refraction, the two-source interference band, the lensing event horizon — all sharing a single-context subscriber architecture so a session never exhausts the browser's WebGL context budget.
- **CPU fields** where 1-bit is the point: the Bayer dither transmission and the glyph-particle rain render on 2D canvas with deterministic seeds.
- **Discipline throughout**: every animation gates on `prefers-reduced-motion` with a composed static frame; every page audits clean under the repo's geometric line auditor (`pnpm lint:lines`), which inventories every rendered hairline against the design's line law in both themes.
- **Localization is the content**: all translated strings are real, vetted translations — including RTL Arabic and Hebrew, CJK metrics, plural forms, and locale-formatted numbers and dates.

## Run

```bash
pnpm install
pnpm dev    # http://localhost:3005
```

`pnpm build && pnpm start` for production.

---

Made by [General Translation](https://generaltranslation.com) — launch in every language.
