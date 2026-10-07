---
name: gt-motion
description: >-
  The motion rules General Translation work follows on the web and in films:
  the eases and the 0.5 s beat grid, reading holds, the four allowed
  transitions, dithered fields that change only by a tone mix on one cell
  grid, the moving type law, loops created paused and played by scroll,
  reduced motion as a designed still, the engine lifecycle, scroll stories,
  and the traps in SVG dashes, GSAP and lottie-web. Use when animating
  anything for GT (a landing band, a diagram line, a dashboard or sign-in
  transition, a Lottie figure, a scroll story or a film scene) and when
  reviewing motion someone else built.
metadata:
  title: Motion rules
  areas: motion, landing, videos, diagrams
  updated: 2026-10-06
  origin: prototemplate
---

# Motion rules
General Translation (GT) makes localization tools for developers. Its
product site, dashboard and blog live in the gt-cloud monorepo, and its
design canon, brand deck, design lab and films live in Prototemplate. GT
motion explains structure. Things assemble, reveal, connect or translate,
and nothing moves to fill time. These rules hold for the web
(Prototemplate, the gt-cloud landing, dashboard and blog) and for the
HyperFrames films; the film process itself (scripts, narration, music,
renders, critics, the composition contract) is in `gt-films`. Paths are
relative to a Prototemplate checkout ($PROTOTEMPLATE) unless marked
gt-cloud ($GT_CLOUD, origin/main unless a branch is named) or wiki (Kevin's
skill wiki, `skills/engineering/<name>/SKILL.md`).

## 1. Principles

- **Every move explains structure.** A move that only decorates is cut.
  The bar is a studio reel: a beat grid, arrivals that land on beats, holds
  long enough to read, one idea per beat (motion/MOTION.md, "The
  standard").
- **One clock drives a page or a film.** A component never runs its own
  timer when a host owns the clock. EverySentence takes `setLocale()` from
  its host; the dossier's locale belt is its page's one clock; a scroll
  story runs on one scrubbed dial; a film runs on one paused timeline
  (DESIGN.md sections 8, 9 and 14).
- **The picture reads with motion off.** The markup pose is the still:
  reduced motion, no JavaScript, a screenshot, a paused tab and a gallery
  thumbnail all show a designed frame, and motion is additive. Exploration
  builds that hid blocks at opacity 0 until a scroll reveal produced gutted
  captures (round four, 2026-09-14). In films no beat depends on audio.
- **Motion stays calm and legible.** Kevin, 2026-10-04, on the
  jihe-yuanben film: "The triangle reassembly is a bit wacky" (twenty
  slivers flying with 3D tilts while the camera moved). Rounds 3 to 6
  replanned the paths of every piece and the critic still read scatter.
  Round 7 changed the idea, and the round 8 cut moves one pair in the
  plane, rests 0.25 s and prints the rest in place
  (`motion/films/jihe-yuanben/NOTES.md`). In an assembly one group moves
  at a time with rests of 0.25 s or more between groups, turns stay in the
  plane, and paths stay short and never cross. When planning paths cannot
  make a move calm, change the idea.
- **Product pages have no entrance animation.** Kevin on the onboarding
  pages (September 2026): "i dont think we need the animations of it fading
  in moving in from bottom". A row that appears because the user answered a
  question fades in through `.plate-row-in`, with none under reduced motion
  and none for rows present at mount. The landing's one entrance is the
  quiet reveal (section 6).
- **Scrolling is native and marks are drawn.** BRAND.md section 9 (the
  final avoid list) refuses smooth scrolling, scroll hijacking and inertia
  libraries; `gt-ui/no-smooth-scroll` enforces it (Prototemplate's
  `.oxlintrc.json` turns it off only for `/present`, which still scrolls on
  Lenis). `gt-ui/no-gif-mark` keeps every mark and demo frame drawn: SVG,
  the canvas field or `LocadexMark`.

## 2. Timing

### Eases

| Use | Ease |
| --- | --- |
| An arrival (fast in, long settle) | `expo.out` or `power3.out` in films; `power2.out` in the landing reveal and the stack story |
| A move from one place to another | `power2.inOut` |
| A process: a scan, a pulse, a counter, a loop lap, a scrubbed rise | `none` |
| A tone mix between dither fields | smoothstep, `k * k * (3 - 2 * k)`, zero slope at both ends |
| Shell chrome | `--pt-ease-out` (`ease-out`); `--pt-ease` (`cubic-bezier(0.2, 0, 0, 1)`) for the sidebar column |

Bounce, elastic and back overshoot are refused (MOTION.md, "Motion"). The
one overshoot in the gt-cloud landing is the split-flap face settle
(`apps/landing/src/components/blog/flap.ts`, `back.out(2.1)` over 0.09 s),
a mechanical flap landing. New work adds none; the `back.out` tweens in
Prototemplate's `/d/` directions and `/present` slides are explorations.

### Durations

| Clock | Value | Source |
| --- | --- | --- |
| Film beat grid | 0.5 s at 30 or 60 fps; arrivals and scene changes land on beats | MOTION.md |
| Reading hold | (words / 3) + 1 s after a sentence has fully arrived; nothing important changes while the eye reads it | MOTION.md |
| Stagger | 40 to 90 ms, in reading direction (left to right, top to bottom, right to left for Arabic) | MOTION.md |
| Dither resolve (globe into picture) | 350 ms | `TransitionDemo.tsx` `RESOLVE_MS` |
| Dither step (picture to picture) | 150 ms | `TransitionDemo.tsx` and gt-cloud `FieldStack.tsx` `STEP_MS`; Kevin, 2026-09-29: "make the dither transitions 2x faster" (the resolve went from 700 to 350 ms and the step from 300 to 150 ms) |
| Landing reveal | 0.62 s, stagger 0.055 s | gt-cloud `reveal.ts` |
| Plate row reveal | 180 ms `ease-out`, from opacity 0 and 4 px down | gt-cloud `apps/dashboard/src/app/brand-tokens.css` |
| Field first paint | 240 ms `ease-out` opacity keyframe on the empty field region, once, when the first tone is drawn; this is the one alpha change a dithered field takes, and every change between two states is a tone mix | same file, `brand-field-picture-in` |
| Shell chrome | `--pt-dur-fast` 120ms, `-leave` 140ms, `-toast` 160ms, `-slide` 180ms, `-enter` 200ms, `-sb` 220ms; all 0ms under reduced motion | `src/components/viewer/tokens.css` |
| Dither loop frame budget | 30 fps by default; dither reads well at low rates and keeps the main thread free | `src/lib/dither.ts` |

A camera drift (scale 1.00 to 1.04 over a scene, or a slow pan) is allowed
on a plate image or a dither field and never on type. A still field may
drift its sampling window under 3 percent over a beat, re-sampled per
frame. Shimmer noise is refused (MOTION.md, "Texture").

## 3. Transitions

### The allowed four

MOTION.md allows four scene transitions in films, and on the web a
dithered picture changes by the first of them.

1. A tone mix from one dither field to the next.
2. A hard cut on a beat.
3. A hairline that draws a seam the next scene then sits on.
4. The moving type: a sentence dissolves into glyph cells and reassembles
   as the next (section 5).

Refused in films: the whole-frame cross dissolve, push, slide, zoom blur,
spin, glitch and light leak. Refused for any dithered field: alpha fades,
wipes, masks that move, content entrance animation, and a change of cell
size inside a transition (the build log's "The dither transitions, and the
grid they run on"). The dashboard's 240 ms first paint of an empty field
region (section 2) is a load, and it is the only alpha change a field
takes.

Viewer shell chrome moves transform or opacity only, on the `--pt-dur-*`
tokens; the sidebar column is the one exception. The shared `pt-fade-in`
and `pt-fade-out` keyframes live in tokens.css.

The sign-in to onboarding judges (2026-09-28) rejected a mask tween (a
wipe), departure tweens (OAuth leaves in about 200 ms), entrance animation
and view transitions; Kevin then dropped the arrival morph (2026-09-29).
On gt-cloud main a step change is the 150 ms tone mix.

### Page transitions and first paint

- Point navigation at a resolved URL. A `redirect()` thrown in a Next page
  render paints an intermediate shell first.
- A mark drawn by a mount effect cannot exist at first paint; gate only the
  mark whose CSS geometry matches the drawn one.
- next-themes' `disableAnimation` sheet stops first-paint transitions, so a
  first-paint fade is a keyframe.
- A client-mounted control reserves its height in the server markup.

[references/traps.md](references/traps.md) has the cause and the fix for
each.

## 4. Dither in motion

The material itself (the screens, the engines, the presets and the
artifact picture standard) is in `gt-dither`. A dithered field changes
state by the five rules of the build log (`src/app/craft/libraries.ts`,
`TRANSITION_RULES`), each held in code as follows.

1. **One cell grid.** Both states are read at the same cells, at one cell
   size, and the size never changes inside a transition.
2. **One anchored tile.** The Bayer tile keeps its phase from one page
   cell, so a transition's first frame is the last frame of the state
   before it. An unanchored tile re-dithers the same tone into other cells,
   and the eye reads a flash. Prototemplate's `ditherToCanvas` takes
   `phase`: a canvas `n` cells below another's needs `phase.y = n % 8`.
3. **One smoothstep.** Tone mixes on it (`mixFields(a, b, k)`,
   `k = smoothstep(elapsed / duration)`), and the ink is interpolated on the
   same curve (`lerpInk` in `TransitionDemo.tsx`).
4. **Brightness held across a resolve.** `TransitionDemo` solves the
   globe's gain on the resolve's first tick so its mean tone over the disc
   on screen equals the Blue Marble's.
5. **The end state under reduced motion,** drawn once as a still.

The shipped field adds two rules of its own.

- **An interrupted mix restarts from the frame on screen.** Each mix frame
  is a fresh closure and a new target takes `from: current`, so quick steps
  never return to a picture that has gone (gt-cloud
  `apps/dashboard/src/components/brand/FieldStack.tsx`, `startMix`; the
  contract is written on `fieldController.ts`).
- **A field enters by raising its tone from 0 and leaves by lowering it to
  0** (MOTION.md). Before the first render a target replaces the field.

### What a dither animation costs

- The cell size never changes inside a move: artifact pictures run at 1 CSS
  px cells, the sign-in globe at `GLOBE_SCALE = 2`, and a film picks 2 or 3
  CSS px at 1920 by 1080 and keeps it for the whole film.
- Cost is quadratic in `scale` (CSS px per cell). A full-bleed field at
  scale 1 is 1.3M field calls a frame at 1440 by 900, so it is never
  animated; scale 3 is the full-bleed default, and `radialBurst` animates
  at scale 4 or more or renders once (the cost table is in
  `src/lib/dither.ts`).
- The film kit's `GTDither.mix(a, b, p)` applies the smoothstep itself, so
  drive `p` with `ease: 'none'`.

### Moves built on the screen

- **The mark shimmer** (`DitheredMark.tsx`) sweeps nested Bayer tiers
  across a mark by pure horizontal translate with ease `none`. Its windows
  are pre-rotated, because a `rotate()` window proved fragile under GSAP's
  transform origin. `gt-isometric` section 6 has its props and its driver.
- **The speed register** (films): speed bars arrive on a horizontal streak
  with a short dithered trail that thins with distance and retracts as the
  bar stops. That trail is the brand's motion blur; blur filters are refused.
- **The CSS-mask step** (gt-cloud `ditherMask.ts`, on the Lottie branch)
  steps a layer through 65 SVG mask levels of the 8 by 8 screen at 2 px
  cells. The level only rises, and the layer is untransformed.
- **Film backgrounds.** Kevin, round 7: "im sad to see the dither disappear
  from background". The Bayer print stays behind every scene, cleared
  around type and objects by tone mix.

## 5. The moving type law

DESIGN.md section 8 states the law, and
`src/components/shared/EverySentence.tsx` builds it.

- The morphing unit is **one shaped text node** with `lang` and `dir`; the
  container sets `unicode-bidi: isolate`. Per-character spans break Arabic
  joining and Devanagari matras, so no page or film splits a non-Latin
  sentence.
- **Width is measured from a hidden probe** carrying the word's own `lang`
  and `dir`: the whole roster in one batched pass, cached, snapped to
  device pixels, re-measured on a debounced resize and on
  `document.fonts.ready`. Nothing is measured in a frame loop.
- **Width is the only layout property that animates**, one tween per cycle
  (0.7 s, `power2.inOut`). Under 720 px the em pins to the column, so a
  sentence that folds to two lines never tweens layout (founder: "slow and
  laggy on mobile").
- **The host owns the clock.** `setLocale(loc)` is the only intake.
  Requests debounce 0.25 s, leading and trailing; one mid-dissolve
  retargets the form, one mid-form kills the timeline and re-dissolves, a
  locale with the same text retags `lang` and `dir` only, and calls before
  boot are buffered. `hops` (1 to 5, default 2) sets the arrangements the
  swarm takes on its way to the print; the dossier hero runs 1.
- The dissolve runs at every width (founder: "do the dissolving instead of
  fade in fade out"). Under reduced motion the driver swaps text, `lang`
  and `dir` with no tween.
- Locale pills render through `LocaleTag`: a fixed 15 by 11 SVG flag, then
  the code in the host's mono on the baseline.
- In films the moving type samples each sentence's rendered pixels into
  cells with a deterministic seed; cells travel on seeded paths, and the
  arriving sentence's shaped node replaces them when they settle (MOTION.md,
  brand film beat 3).
- Glyph-field's word morphs conserve matter, word first. The outgoing
  word's own particles become the incoming word's material, so one word
  visibly becomes the next. Only the deficit recruits from rain visible in
  the fall, surplus dust flies home to its rain slot, and culled rain is
  the last resort (`resample` in `src/lib/glyph-field.ts` and in gt-cloud's
  shared `packages/ui/src/lib/glyph-field.ts`).

## 6. Web lifecycle

### The engine contract

Every canvas or GL engine and every GSAP band follows one contract
(DESIGN.md sections 9 and 11, docs/LIBRARIES.md).

1. **Mounts lazily.** An IntersectionObserver arms the plate; the Lottie
   figure starts within one viewport (`rootMargin: '100% 0px'`).
2. **Creates loops paused.** ScrollTrigger or an IntersectionObserver plays
   them while on screen. The stack story's gate is one
   `ScrollTrigger.create({ trigger, start: 'top bottom', end: 'bottom top',
   onToggle })` that syncs every ambient loop.
3. **Keeps one timeline per choreography,** so phases can never drift.
4. **Short-circuits setup under reduced motion.** With `gsap.matchMedia()`
   reduced motion is its own branch that sets a designed static pose (the
   stack: all four slabs, the first beat lit, the shimmer band parked
   mid-glyph, the scan beam hidden); cleanup is `mm.revert()`.
5. **Pauses offscreen and on hidden tabs** through its own observer and
   `visibilitychange`.
6. **Releases everything it owns in `destroy()`.** Shared GL contexts
   persist for the session by design.
7. **Re-resolves ink on a theme flip:** a `MutationObserver` on the root
   with `attributeFilter: ['data-theme']`, colors read from computed tokens.
8. **Follows measured frame cost.** glyph-field's governor steps a slow
   device down its ladder, down only, with pool cuts at idle.

`createDitherLoop` holds 4, 5 and 6 for the CPU engine: one synchronous
first frame, one frame and no rAF under reduced motion, a pause offscreen
and on hidden tabs, and a `destroy()` that disconnects every observer. The
host holds 1: the /docs plates create their engines when they first scroll
near.

### React and GSAP

- Register at module scope (`gsap.registerPlugin(useGSAP, ScrollTrigger)`)
  and set up inside `useGSAP(() => ..., { scope: root })`. A canvas engine
  with no GSAP in gt-cloud mounts through `useMountEffect`
  (`@generaltranslation/ui/hooks/use-mount-effect`, as `FieldStack.tsx`
  does). Prototemplate's practices ratchet (`pnpm lint:practices`) fails on
  any bare `useEffect` missing from its baseline, and gt-cloud's
  `gt-ui/no-use-effect` bans it.
- A plate that needs a per-frame tick adds it to `gsap.ticker`
  (`TransitionDemo.tsx`) and removes it in the cleanup.
- Clear exactly what a tween set. The stack story's cleanup clears the
  `strokeDashoffset`, `transform`, `opacity` and `visibility` it wrote. The
  landing reveal sets `willChange` only for the tween and clears it with the
  rest on complete: a standing `will-change` or a leftover 0 px transform
  makes a stacking context that paints over the bento rows' 1 px seams.
- Add a class such as `is-live` to the root once the timeline is seeded
  and painting, so a visitor's first frame is the story's own.

### Reveals, scroll stories and dials

Three web patterns have one reference each, and
[references/web.md](references/web.md) holds them: the landing's quiet
reveal (`useQuietReveal`, one batch from `y: 16` and `autoAlpha: 0`, once,
nothing under reduced motion), the stack story (a CSS-sticky figure on one
scrubbed dial, so scrolling back plays it backward), and the seam's driven
dial (`--seam-cut`, written by drags, tweens and keys with zero React
renders).

## 7. Lines in motion

- **Draw out from the owner.** A rail draws out of its registration cross;
  a write wire draws out of the mark's chip toward its row. Films use
  `expo.out` or `power3.out` for a draw-on.
- **Pulses are real geometry.** The doubled line's pulse is a third copy of
  the path in accent between the threads and the cores, and its window is a
  sub-polyline rewritten per tick. A dash offset drifts under anisotropic
  stretch (DESIGN.md section 5).
- **Cache the source `d`** in `el.dataset.traceD` before an animation
  blanks it per tick (`src/app/d/production/sections/Developer.tsx`).
- **Normalize `pathLength` to 1000** where offsets animate finely; GSAP
  rounds offsets to integers.
- **Leader joints overshoot into opaque hulls** so joints are gapless.
  A leaning shape is re-projected per phase: one dial drives every path of
  the scan beam through `beamAt(t)`, so its aperture pivots under the
  capstone while its land line runs the plate.

Five dash traps were each found in a rejected round, and
[references/traps.md](references/traps.md) ("SVG dashes and lines", "GSAP")
holds each with its proof: `non-scaling-stroke` makes Chromium ignore
`pathLength`; dashes clip at a closed subpath's end; the sign of the parked
offset picks the end a draw starts from, so read the first point of `d`
before touching the timing (Kevin rejected a backwards draw three rounds
running in August 2026); pad the gap past the path (`'100 200'`, parked at
101 or -101); and GSAP cannot be frozen from outside the page.

## 8. Lottie

The blog's Lottie translation figure (gt-cloud branch
`k/blog-lottie-translation`, PR #5068: `LottieTranslationWindow.tsx`,
`lottieDocument.ts`, `lottieLoader.ts` and `ditherMask.ts` in
`apps/landing/src/components/blog/`) runs lottie-web 5.13 on canvas. It
fills the glyph list, fits the track-matte buffers after a resize, sets
`setSubframe(false)`, hides a layer that keeps its box with `visibility`,
drives followers from the leader's `currentRawFrame`, makes the loop a cut
dithered through a still, decodes every mask level before the first step,
and holds a poster frame under reduced motion. Each rule was proven by a
render or a measurement, and [references/traps.md](references/traps.md)
has the proof.

Films use the HyperFrames lottie adapter: unzip each `.lottie` at build
time with its images inlined, and seek every locale's player to one frame.

## 9. Tools

- **Web:** GSAP 3 with `@gsap/react`'s `useGSAP`, `ScrollTrigger` and
  `gsap.matchMedia()`; the dither engines in Prototemplate `src/lib/`
  (`dither.ts` on the CPU, `studio-field.ts` on the GPU, `glyph-field.ts`
  for glyph rain), indexed in docs/LIBRARIES.md with live plates on /docs;
  lottie-web with fflate for `.lottie` files.
- **Films:** HyperFrames pinned at 0.8.106 with the kit's vendored GSAP
  3.15 and plugins (DrawSVGPlugin, MorphSVGPlugin, SplitText, Flip,
  MotionPathPlugin, CustomEase), `GTDither`, `GTSheet`, `GTGem` and
  lottie-web 5.13, all loaded from `motion/kit/` so a render never touches
  the network. `gt-films` owns the process.
- **Wiki skills for film moves:** `hyperframes-animation` (atomic rules,
  blueprints, runtime adapters, `scripts/animation-map.mjs` for auditing
  choreography) and `hyperframes-keyframes` (punch-ins, camera moves, SVG
  draw and morph, seek-safe keyframes).

Code shapes for a web band, the interrupted tone mix, the dashed ring, the
Lottie follower and a film move, with the one film determinism rule this
skill adds, are in
[references/recipes.md](references/recipes.md).

## Verifying motion

- Take pixels with a headless browser driven from outside the app:
  Playwright (`playwright-core` is in Prototemplate's `node_modules`) or
  the wiki's `agent-browser` CLI. The in-app Browser pane pauses
  `requestAnimationFrame`, so canvases there come back blank.
- Check every animated surface under emulated reduced motion
  (`page.emulateMedia({ reducedMotion: 'reduce' })`), in both themes, at
  1440 and 390 wide; run `pnpm check:pages --pages <id,id>` on changed
  routes for layout shifts.
- Check drawn lines at 2x crops of their junctions; slow
  `requestAnimationFrame` in the capture only to see a dither step's cells.
- Films: `npx -y hyperframes@0.8.106 check .` with 0 errors, then
  `animation-map.mjs`, a contact sheet and the render frame by frame.

## Review checklist

- [ ] Every move explains structure, and the resting markup is a designed
      still that reads without JavaScript.
- [ ] One clock: one timeline per choreography, one dial per scroll story,
      no component timers under a host clock.
- [ ] Reduced motion short-circuits setup and shows the end state or the
      designed static pose.
- [ ] Arrivals ease out, moves `power2.inOut`, processes `none`; no
      bounce, elastic or back overshoot.
- [ ] Holds meet (words / 3) + 1 s; staggers run 40 to 90 ms in reading
      direction; an assembly moves one group at a time with rests of
      0.25 s or more.
- [ ] Transitions come from the allowed four. Dithered fields change only
      by tone mix on one grid, one anchored tile and one smoothstep, with
      no cell size change, and an interrupted mix restarts from the screen.
- [ ] Moving type is one shaped node with `lang` and `dir`; width is the
      only animated layout property.
- [ ] Loops are born paused, pause offscreen and on hidden tabs, re-read
      ink on a theme flip, and `destroy()` or `mm.revert()` frees them.
- [ ] Shell chrome reads the `--pt-dur-*` tokens and moves transform or
      opacity only; product pages have no entrance animation; the landing
      uses only `useQuietReveal`; no smooth scroll and no gif marks.
- [ ] Draw-ons start from the owner (a positive park reveals from the
      path's first point, a negative one from its last), pulses are
      geometry, and dashes avoid the non-scaling-stroke and closed-path
      traps.
- [ ] Lottie players fill glyphs, fit mattes, disable subframes and share
      one clock.
- [ ] Films: every frame is a pure function of time and `check` passes.
- [ ] Verified with real pixels in both themes, under reduced motion, at
      1440 and 390.

## Related skills

Prototemplate: `gt-films` (the film process and the composition
contract), `gt-dither` (the Bayer material, its engines and the artifact
picture standard), `gt-isometric` (the shimmer, the tower's build and the
scan beam), `gt-diagrams` (the doubled line and connector drawing),
`gt-components` (the instruments' props: RevealSeam, EverySentence,
LocaleTag), `gt-graphics` (stills), `gt-landing-pages` (landing bands, the
read lines and the svh and dvh law). Wiki: `hyperframes`,
`hyperframes-core`, `hyperframes-animation`, `hyperframes-keyframes`,
`agent-browser`, `design-engineering-polish`,
`animated-component-libraries`, plus `gsap-scrolltrigger` and
`lottie-animations` for library API detail. Where a wiki skill suggests
smooth scrolling, overshoot eases or loops that autoplay, the GT rules
above win.

## Sources

- Prototemplate: DESIGN.md sections 2, 5, 7, 8, 9, 10, 11, 13 and 14;
  BRAND.md section 9 (the final avoid list); motion/MOTION.md ("The
  standard", "Motion", "Texture", "Line", "The marks", rounds 4 and 7);
  motion/kit/dither.js; motion/films/_smoke/index.html;
  motion/films/jihe-yuanben/NOTES.md (rounds 3 to 8 of beat 6).
- Prototemplate: src/app/craft/CraftArticle.tsx ("The dither transitions,
  and the grid they run on", "The moving type"), src/app/craft/libraries.ts
  (`TRANSITION_RULES`), src/app/craft/TransitionDemo.tsx.
- Prototemplate: src/lib/dither.ts; src/lib/glyph-field.ts (`resample`);
  src/components/shared/EverySentence.tsx;
  src/app/d/toolchain/sections/RevealSeam.tsx;
  src/app/d/toolchain/diagrams/DitheredMark.tsx.
- Prototemplate: src/app/d/_v0/sections/FullStack.tsx, StackTower.tsx,
  Locadex.tsx and locadex.css; src/app/d/production/sections/Developer.tsx
  and Locadex.tsx (`beamAt`).
- Prototemplate: src/components/viewer/tokens.css; docs/LIBRARIES.md;
  docs/ARTIFACT-PICTURES.md; .oxlintrc.json; scripts/lint-practices.mjs;
  scripts/pagecheck/README.md; src/app/layout.tsx (the `gt-theme` key).
- gt-cloud: apps/dashboard/src/components/brand/FieldStack.tsx and
  fieldController.ts; apps/dashboard/src/app/brand-tokens.css
  (`.plate-row-in`, `brand-field-picture-in`);
  apps/dashboard/src/app/[locale]/signin/device/_components/DeviceCodeForm.tsx.
- gt-cloud: apps/landing/src/components/landing/sections/shared/reveal.ts
  and bento-motion.css; apps/landing/src/components/blog/flap.ts;
  apps/landing/src/app/globals.css (`#nd-sidebar[data-sb-ready]`).
- gt-cloud: tooling/oxlint-plugins/gt-ui.ts (`no-smooth-scroll`,
  `no-gif-mark`, `no-use-effect`); packages/ui/src/lib/dither.ts (the
  engine copy with `simBase` and the held `stop()`);
  packages/ui/src/hooks/use-mount-effect.ts.
- gt-cloud branch k/blog-lottie-translation (PR #5068):
  apps/landing/src/components/blog/LottieTranslationWindow.tsx,
  lottieDocument.ts, lottieLoader.ts, ditherMask.ts.
- wiki: skills/engineering/hyperframes-animation/SKILL.md,
  skills/engineering/gsap-scrolltrigger/SKILL.md,
  skills/engineering/lottie-animations/SKILL.md.
- Claude Code memory for gt-cloud: svg-dash-gotchas, lottie-web-canvas-traps,
  blog-lottie-figure, signin-field-transition, docs-shell-transition-traps,
  redesign-screenshot-harness, dashboard-deck-grammar, gt-motion-films.
  svg-dash-gotchas states the park sign backwards; the code comments in
  FullStack.tsx and StackTower.tsx and a headless Chromium check on
  2026-10-05 agree with section 7.
- Kevin: the backwards dash draw-on (August 2026); no entrance animation on
  the onboarding pages (September 2026); "make the dither transitions 2x
  faster" (2026-09-29); the seam drag performance (2026-10-01); the dither
  background in films (round 7, 2026-10-02); the triangle reassembly
  (2026-10-04).
