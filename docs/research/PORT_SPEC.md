# PORT SPEC — HTML explorations → Next app (`apps/redesign`)

You are porting ONE surviving art direction from a static HTML exploration into the real Next.js
app, and upgrading it to the founder's newest mandates. This is a port **plus** a targeted
redesign of the hero and story sections — not a mechanical transcription.

Read in this order: this file → your direction's original HTML → `STORYBOARD.md` (narrative law)
→ `AESTHETIC_ADDENDUM.md` (Resend-sleek base + prismatic light) → `landing-content.md` (copy).

---

## 1. Where things go

```
apps/redesign/src/app/d/<slug>/
  page.tsx            server component: metadata + <SmoothScroll> + sections + <DirectionDock slug>
  styles.css          direction-scoped CSS, imported by page.tsx, ALL rules under .<slug>-root
  sections/           one client component per section (Hero, StoryWindow, Features, …)
  components/         direction-local primitives
```

**Shared, do not edit** (any change breaks the other seven directions):
`src/components/shared/*`, `src/lib/*`, `src/app/globals.css`, `src/app/layout.tsx`,
`src/app/page.tsx`, any other direction's folder. Need a variant? Copy it into your own folder.

## 2. Mechanics

- **Smooth scroll**: wrap the page in `<SmoothScroll>` (already wires Lenis↔ScrollTrigger and
  publishes `window.lenis`, which the screenshot harness needs). Do not construct Lenis yourself.
- **GSAP**: use `useGSAP` from `@gsap/react` — never a bare `useEffect`. Scope every animation:
  `useGSAP(() => {...}, { scope: containerRef })`. Register plugins at module top:
  `gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin)`.
  Plugins import from `gsap/ScrollTrigger`, `gsap/SplitText`, etc. (all bundled in gsap 3.13).
- **Client boundaries**: `page.tsx` stays a server component; every animated section is
  `'use client'`. Keep static copy in the server component where practical.
- **CSS**: port the original stylesheet into `styles.css`, every selector nested under a single
  root class (e.g. `.concrete-mono-root`) so directions cannot leak into each other. Tailwind v4
  is available for new work; do not rewrite working CSS into Tailwind for its own sake.
- **Fonts**: Switzer (display/UI) and Inter (text) are already loaded globally as
  `var(--font-switzer)` / `var(--font-inter)`, exposed as Tailwind `font-display` / `font-sans`.
  **Use only these two** — delete every other family the original HTML loaded, including all
  Google Fonts `<link>`s. Mono is the system stack via `font-mono`.
- **Images**: the real logo lives at `/brand/no-bg-gt-logo-dark.png` (white mark, transparent) and
  `/brand/no-bg-gt-logo-light.png`. Use `next/image`. Never redraw the logo as text or SVG.
- **No `any`**, typed props, single quotes, 2-space indent. Comments only where a constraint isn't
  visible in the code.
- **Do not** run `git`, install packages, start or stop the dev server, or touch other apps.

## 3. NEW MANDATES (these override the original HTML)

### M1 — The hero components must be VISIBLE and obey the light's perspective
The prismatic field establishes a vanishing point: streaks radiate outward from a dark center
along a horizontal band. The flowing UI components must live in **that same perspective**, not
float in a flat 2D plane.

- Container gets `perspective: 1000–1400px`; components are positioned in 3D
  (`translate3d(x, y, z)`) on rays emanating from the same center the shader converges on.
- **Depth reads correctly**: near the center a component is deep (small, dimmer, slightly blurred,
  lower contrast); as it travels outward along its ray it comes toward the viewer (scales up,
  sharpens, brightens). Motion is *along the ray*, matching the streak direction — never a flat
  left-to-right conveyor.
- **Visibility is the point.** The original samples made these too faint. They must read as real,
  solid UI: opaque or near-opaque surfaces, defined edges/borders, legible labels at 1440px.
  A viewer should recognize a button, a pricing card, a toast, a form field, Theo's testimonial
  card at a glance. Dim the *shader* (raise `exposureScale`) rather than the components.
- English components enter from the left ray-fan, converge toward the GT gate, and re-emerge on
  the right fan already translated — same component, new language, resized to fit its new text
  (see M3's resizing rule).

### M2 — Gravitational lens around the real GT logo
The GT gate at hero center is the **actual logo** (`/brand/no-bg-gt-logo-dark.png`) sitting in a
gravity well that visibly bends the light and content around it:

- A circular lens region distorts what passes behind it — implement with a real distortion, not a
  vignette: `backdrop-filter` blur/contrast/hue rotation on a circular mask, a WebGL/2D-canvas
  radial displacement of the field, or an SVG `feDisplacementMap` driven by a radial gradient.
  Something must genuinely *warp*.
- Components approaching the lens curve toward it (their ray bends), stretch tangentially, and
  slow at the rim — light and matter falling into a well.
- **What comes out is properly translated text.** As each component crosses the lens its strings
  resolve into a real translation — actual correct copy in Spanish, Japanese, German, French,
  Arabic, Korean (use real translations of the actual GT strings; never fake glyph soup, never
  machine-mangled text). The transition itself should feel optical: a chromatic split/refraction
  through the lens rather than a plain crossfade.
- Accretion detail: a faint ring of orbiting glyph particles from many scripts, drawn inward.

### M3 — The story section goes full-bleed and dramatically better
The pinned story window (Acts II–III of `STORYBOARD.md`) currently sits in a letterboxed frame.
Now:

- **Full width and full height**: 100vw × 100vh at the pinned state — edge to edge, no margins,
  no rounded letterbox. The demo site inside fills the viewport like a real screen.
- **The camera work carries it.** Zooms must be real camera moves: deep scale ranges (1× → 3–5×)
  with transform-origin tracking the subject, easing that settles rather than snaps, and
  depth-of-field (blur on non-subject layers) so the zoom reads as focus, not scale.
- **The code-reveal sliders must be excellent**: a draggable/scrubbed divider with a crisp
  metallic handle, a bright edge-light on the split line, the code side rendered as a real
  syntax-highlighted surface, and the reveal tracking scroll smoothly. Add a chromatic edge on the
  split. They should invite a screen recording.
- **Resizing DOM stays mandatory** (storyboard D1): as the Locadex cursor translates each node,
  containers visibly re-measure — buttons widen for German, cards grow taller, rows re-balance —
  via FLIP-style measured transitions (350–600ms, power3). Text swapping without container
  motion is a fail.
- Every beat must still be legible mid-scrub at any scroll position.

### M4 — Type system
Switzer + Inter only, everywhere. Keep the enormous display-to-label scale contrast; Switzer at
display sizes wants tight tracking (−0.03 to −0.05em).

## 4. Verification (mandatory before you finish)

The dev server is already running on **:3005** — do not start or restart it. Hot reload picks up
your files.

```
node /private/tmp/claude-501/-Users-kevinliu-gt-gt-cloud/0472faa4-f4b6-46f0-9054-5f30d7a23b3e/scratchpad/shoot-route.mjs <slug> /private/tmp/claude-501/-Users-kevinliu-gt-gt-cloud/0472faa4-f4b6-46f0-9054-5f30d7a23b3e/scratchpad/shots/next/<slug>/self
```

Then Read `summary.json` (errorCount MUST be 0 — a `NEXT ERROR OVERLAY` entry means the route is
broken) plus at minimum `d00`, `d03`, `d06`, `d09`, `d12`, `m00`. Fix and re-shoot until clean:
no blank sections, no overflow, no invisible content, hero components clearly legible, story
section genuinely full-bleed.
