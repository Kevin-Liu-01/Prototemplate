# The Libraries

The index of the componentized instruments. The living version — bodies,
live plates, and API snippets — is the `/craft` page ("The libraries"
section); keep the two in step: when an engine gains an option, update its
craft entry in the same round. Once perfected these graduate to their own
repos.

| library | entry point | one line |
| --- | --- | --- |
| horizon-field | `src/lib/horizon-field.ts` | WebGL lensing black hole; handle: setParams / pause / resume / renderStatic / destroy. Draws nothing until given a geometry (center + radius). |
| glyph-field | `src/lib/glyph-field.ts` | Canvas glyph rain, 1,280-glyph typed-array pool, Bayer-dithered far tier, matter-conserving morphs. Options: `drift: 'fall'\|'rise'`, `copy: 'auto'\|'left'\|'top'\|'none'`, `glyphScale`. |
| prismatic-field | `src/components/shared/PrismaticField.tsx` | The chroma wash behind dark bands; presets `'1'`/`'2'`, `exposureScale` is the dimmer. |
| dither | `src/lib/dither.ts` | CPU 1-bit renderer: any `fn(u,v,t)→0..1` through the 8×8 Bayer screen; field factories (radialBurst, globe, streakBands, gradientRamp, makeGlyphField) + combinators. |
| studio-field | `src/lib/studio-field.ts` | GPU Bayer family — the codified `BAYER_PRESETS` roster (10 variants, default `BAYER_DEFAULT_ID` = 02 bayer-8x8). Switch by remount; one shared GL context. React wrapper: `src/components/shared/StudioField.tsx`. |
| iso | `src/app/d/toolchain/diagrams/iso.ts` | The isometric kit: project/faces/silhouette for boxes, `IsoPrism` for convex plan polygons, `plane()` seats flat art, `markPath()` lays bars. |
| DitheredMark | `src/app/d/toolchain/diagrams/DitheredMark.tsx` | A masked brand mark + Bayer specular shimmer; `shineTravel()` gives drivers their tween endpoints. Worn by the tower capstone. |
| DoubledLine | `src/components/shared/diagrams/DoubledLine.tsx` | The two-thread stroke as a component; optional two-tone via half-plane clip; pulse slot between threads and core. |
| EdgeGlobe | `src/app/d/toolchain/diagrams/EdgeGlobe.tsx` | The delivery globe — ink-only orthographic sphere, five PoPs, one accent route; pairs with a static Bayer atmosphere (dossier `GlobeAtmosphere`). |
| LocaleTag | `src/app/d/toolchain/components/LocaleTag.tsx` | The one locale pill: flag print + mono code; hosts supply the box. |
| RevealSeam | `src/app/d/toolchain/sections/RevealSeam.tsx` | The slide-to-reveal slider; writes `--seam-cut`; skins are host CSS (the dossier refit is the house handle). |
| EverySentence | `src/components/shared/EverySentence.tsx` | The sentence-rewriting glyph reassembler; host-owned clock via `ref.setLocale(loc)`. |

Lifecycle contract for all of them: lazy mount behind an
IntersectionObserver, self-pause offscreen, one still under
`prefers-reduced-motion`, `destroy()` tears down everything the instance
owns, ink re-resolves on theme flips.
