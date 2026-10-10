# Motion tools

`SKILL.md` sections 8 and 9 point here. Moved from it on 2026-10-10, unchanged except for the pull request's state.

## The tools

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

## Lottie

The blog's Lottie translation figure (gt-cloud branch
`k/blog-lottie-translation`, PR #5068, open on 2026-10-10: `LottieTranslationWindow.tsx`,
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
