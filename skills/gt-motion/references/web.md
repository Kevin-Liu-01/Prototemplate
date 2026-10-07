# Web motion patterns

The three web patterns section 6 of `SKILL.md` names, each with its
reference implementation. Paths are relative to a Prototemplate checkout
unless they name gt-cloud.

## The landing's quiet reveal

`useQuietReveal` (gt-cloud
`apps/landing/src/components/landing/sections/shared/reveal.ts`) runs one
`ScrollTrigger.batch` over `[data-reveal]` with `start: 'top 92%'` and
`once: true`, and tweens each batch from `y: 16` and `autoAlpha: 0` over
0.62 s with a 0.055 s stagger, `power2.out` and `overwrite: true`. It
returns early under reduced motion, and hosts that must never shift
layout pass `enabled = false`. Its header comment allows no scale, no blur
and no stagger longer than a beat, so the page reads the same in a
screenshot.

## Scroll stories

The stack story (`src/app/d/_v0/sections/FullStack.tsx`, DESIGN.md
sections 13 and 14) is the reference. Its page layout (the 55 and 80
percent read lines, the mobile stage, the svh and dvh law) is in
`gt-landing-pages`; its motion is held as follows.

- The figure is CSS sticky and JavaScript never moves it (founder: "the
  diagram keeps moving down as i scroll past agents, which is wrong").
- One scrubbed dial (`scrub: 0.35`) spans the read, and every frame a
  reader can see is a frame of the story, so scrolling back plays it
  backward. A piecewise map holds the clock while a row is read and spends
  each gap as hold, build, lock.
- Scroll anchors are measured on the copy from flow geometry and
  re-measured in `onRefresh`; a sticky element's own rect reads its stuck
  pose during a refresh.
- One `gsap.matchMedia()` callback owns every regime. Desktop and the
  mobile stage share the loops and the story and differ only in what drives
  the clock.

## Driven dials

The seam (`src/app/d/toolchain/sections/RevealSeam.tsx`, DESIGN.md section
10) keeps its state in `--seam-cut`. The top layer clips with
`clip-path: inset(0 0 0 var(--seam-cut))` and content never travels with
the handle. Drags, GSAP tweens and arrow keys write the same variable; keys
read the live computed value, and drags cause zero React renders. The
variable is inherited, so every move restyles the box's subtree: keep it
small. The Lottie figure's SVG build (27,800 nodes) dragged at 5 fps at 4x
CPU throttle; its performance round moved it to canvas and the drag reached
56 fps (Kevin, 2026-10-01: "make it a lot more performant when i drag
around the slider").
