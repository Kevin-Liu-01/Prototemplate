# The Libraries

The index of the componentized instruments. The living version — bodies,
live plates, and API snippets — is the `/craft` page ("The libraries"
section); keep the two in step: when an engine gains an option, update its
craft entry in the same round. Once perfected these graduate to their own
repos.

| library | entry point | one line |
| --- | --- | --- |
| horizon-field | `src/lib/horizon-field.ts` | WebGL lensing black hole; handle: setParams / pause / resume / renderStatic / destroy. Draws nothing until given a geometry (center + radius). |
| glyph-field | `src/lib/glyph-field.ts` | Canvas glyph rain, 1,280-glyph typed-array pool, Bayer-dithered far tier, matter-conserving morphs. Options: `drift: 'fall'\|'rise'`, `copy: 'auto'\|'left'\|'top'\|'none'`, `glyphScale`. A frame-time governor steps quality down (lean dpr, then the lean pool) when measured cadence proves the device can't keep up — down only, pool cuts at idle. |
| prismatic-field | `src/components/shared/PrismaticField.tsx` | The chroma wash behind dark bands; presets `'1'`/`'2'`, `exposureScale` is the dimmer. |
| dither | `src/lib/dither.ts` | CPU 1-bit renderer: any `fn(u,v,t)→0..1` through the 8×8 Bayer screen; field factories (radialBurst, globe, streakBands, gradientRamp, makeGlyphField) + combinators. |
| studio-field | `src/lib/studio-field.ts` | GPU Bayer family — the codified `BAYER_PRESETS` roster (10 variants, default `BAYER_DEFAULT_ID` = 02 bayer-8x8). Switch by remount; one shared GL context. React wrapper: `src/components/shared/StudioField.tsx`. |
| iso | `src/app/d/toolchain/diagrams/iso.ts` | The isometric kit: project/faces/silhouette for boxes, `IsoPrism` for convex plan polygons, `plane()` seats flat art, `markPath()` lays bars. |
| DitheredMark | `src/app/d/toolchain/diagrams/DitheredMark.tsx` | A masked brand mark + Bayer specular shimmer; `shineTravel()` gives drivers their tween endpoints. Worn by the tower capstone. |
| DitherText | `src/app/d/toolchain/diagrams/DitherText.tsx` | Type as dithered ink: the word masks a tiered 4×4 Bayer ramp (16/16 → 1/16, rotated as one group), so glyphs thin from solid cells to a sparse fringe. Dials: `text`, `cell` (grain), `ink` (takes a token); `size` defaults off the text's shape. Server-safe, `id` caller-owned; shares `bayerTile` with DitheredMark. |
| DoubledLine | `src/components/shared/diagrams/DoubledLine.tsx` | The two-thread stroke as a component; optional two-tone via half-plane clip; pulse slot between threads and core. |
| EdgeGlobe | `src/app/d/toolchain/diagrams/EdgeGlobe.tsx` | The delivery globe — ink-only orthographic sphere, five PoPs, one accent route; pairs with a static Bayer atmosphere (dossier `GlobeAtmosphere`). |
| LocaleTag | `src/app/d/toolchain/components/LocaleTag.tsx` | The one locale pill: flag print + mono code; hosts supply the box. |
| RevealSeam | `src/app/d/toolchain/sections/RevealSeam.tsx` | The slide-to-reveal slider; writes `--seam-cut`; skins are host CSS (the dossier refit is the house handle). |
| EverySentence | `src/components/shared/EverySentence.tsx` | The sentence-rewriting glyph reassembler; host-owned clock via `ref.setLocale(loc)` (calls landing before boot are buffered); `hops` sets the re-spread beats, 1–5, default 2 — the dossier hero runs 1. |
| TranslateWindow | `src/app/d/_v0/TranslateWindow.tsx` | The dossier hero's windowed demo, extracted whole so any home can mount it — and the home of the **locale belt**: an infinite conveyor of LocaleTag chips whose crossing of the strip zone's centre is the page's one clock (render and payload retype from the same dial). Hover pauses it, any interaction holds it, a click slides the picked chip to centre; `onLocaleChange` vents the active locale to hosts (the dossier headline runs on it). |
| V0FullStack | `src/app/d/_v0/sections/FullStack.tsx` | The scroll-scrubbed stack story: beats anchor on the copy block's centre taking the 55% read line, the spotlight fires early at the 80% line, and a piecewise clock holds at each lock-in (`DESIGN.md` §14). The figure is CSS sticky — JS never moves it; the mobile stage runs the svh/dvh law (§13). |
| gallery-shoot | `docs/harness/gallery-shoot.mjs` | The anatomy wall's tile factory: section-anchored element shots of the flagship (desk/mob × light/dark) plus every variant hero, theme pre-set via `localStorage['gt-theme']`, `manifest.json` written beside the tiles; a missed selector is reported, never fatal. Not a mounted engine — a harness. |
| mobile type ladder | `src/app/d/toolchain/styles.css` (the late 720px block) | The ≤720px `--tcm-*` token roster every mobile floor consumes as `var(--tcm-X, <px fallback>)`. Not an engine — a contract; full law in `DESIGN.md` §12. |

Lifecycle contract for every mounted instrument above: lazy mount behind an
IntersectionObserver, self-pause offscreen, one still under
`prefers-reduced-motion`, `destroy()` tears down everything the instance
owns, ink re-resolves on theme flips.
