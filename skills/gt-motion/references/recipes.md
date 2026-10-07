# Motion recipes

Code shapes taken from the shipped sources named under each one. Copy the
shape and keep the names of the real modules; the sources stay the
reference when a detail differs.

## 1. A web band: paused loops, a view gate, a designed still

From `src/app/d/_v0/sections/FullStack.tsx` (Prototemplate). One
`gsap.matchMedia()` owns the motion regimes; reduced motion is its own
branch that sets the still; loops are created paused and a ScrollTrigger
plays them only while the band is on screen.

```tsx
'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Band() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const pulse = scope.querySelector<SVGLineElement>('[data-pulse]');
        if (!pulse) return;
        // ambient loops are born paused; the gate below decides when they run
        const lap = gsap.fromTo(
          pulse,
          { x: 0 },
          { x: 480, duration: 2.4, ease: 'none', repeat: -1, paused: true }
        );
        const gate = ScrollTrigger.create({
          trigger: scope,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => (self.isActive ? lap.play() : lap.pause()),
        });
        if (gate.isActive) lap.play();
        // the animated pose shows only once the loop is seeded
        scope.classList.add('is-live');
        return () => {
          gate.kill();
          lap.kill();
          gsap.set(pulse, { clearProps: 'transform' });
        };
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        // the markup pose is the still; nothing animates
        scope.classList.add('is-live');
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return <section ref={root}>{/* the resting markup is the designed still */}</section>;
}
```

- The pulse translates a short `<line>` in user units (CSS px on an SVG
  child are user units), which sidesteps the dash traps.
- `repeat: -1` is fine on the web. Films refuse it (`gt-films` section 4).
- A multi-phase story goes on one `gsap.timeline({ paused: true })` that a
  scrubbed ScrollTrigger or the gate drives; phases never get timelines of
  their own.

## 2. A dithered picture step that restarts from the frame on screen

From gt-cloud `apps/dashboard/src/components/brand/FieldStack.tsx`
(`mountScene1`). The loop is held stopped; a wrapper field reads
`current`, and each mix frame replaces `current` with a fresh closure, so a
new target mixes from whatever is on the canvas.

The gt-cloud copy of the engine (`packages/ui/src/lib/dither.ts`) holds a
loop stopped through the handle's `stop()`, so its observers cannot restart
it. Prototemplate's `src/lib/dither.ts` has no hold: its IntersectionObserver
and `visibilitychange` handler call `start()` again. A still canvas there
passes `pauseOffscreen: false` and accepts that a tab return restarts the
loop, or keeps the loop running and swaps fields from a ticker, as
`TransitionDemo.tsx` does.

```ts
import {
  createDitherLoop,
  mixFields,
  prefersReducedMotion,
  type FieldFn,
} from '@generaltranslation/ui/lib/dither';

const STEP_MS = 150;
const smoothstep = (x: number) => {
  const k = x <= 0 ? 0 : x >= 1 ? 1 : x;
  return k * k * (3 - 2 * k);
};

const reduced = prefersReducedMotion();
let current: FieldFn = () => 0;
const loopField: FieldFn = (u, v, t) => current(u, v, t);
const loop = createDitherLoop(canvas, loopField, {
  scale: 1,
  paper: 'transparent',
  observeResize: false,
  pauseOffscreen: false,
});
loop.stop(); // held: a still canvas whose every redraw is explicit

let mix: { from: FieldFn; to: FieldFn; t0: number } | null = null;
let raf = 0;

const stepMix = (ts: number) => {
  if (!mix) return;
  const k = smoothstep((ts - mix.t0) / STEP_MS);
  current = k >= 1 ? mix.to : mixFields(mix.from, mix.to, k);
  loop.render(0);
  if (k >= 1) {
    mix = null;
    raf = 0;
    return;
  }
  raf = requestAnimationFrame(stepMix);
};

export function showPicture(to: FieldFn, firstRender: boolean) {
  if (firstRender || reduced) {
    // before the first render, and under reduced motion, the target replaces the field
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    mix = null;
    current = to;
    loop.render(0);
    return;
  }
  // a call mid-mix starts from the frame on screen
  mix = { from: current, to, t0: performance.now() };
  if (!raf) raf = requestAnimationFrame(stepMix);
}
```

- In Prototemplate, two canvases that must share one tile pass `phase` to
  the loop: a canvas whose top left cell sits `n` cells below the other's
  takes `phase: { x: 0, y: n % 8 }`. The gt-cloud copy has no `phase`
  option; there one canvas carries every state of a transition.
- Interpolate the ink on the same `k` when the two states differ in ink
  (`lerpInk` in `src/app/craft/TransitionDemo.tsx`), and re-read the ink
  tokens on a `data-theme` flip.
- A resolve between a procedural field and a picture solves the outgoing
  field's gain on the first tick so the mean tone over the shared region
  holds (`solveGain` in `TransitionDemo.tsx`).

## 3. A progress ring dashed in user units

From the Locadex ring (`src/app/d/_v0/sections/Locadex.tsx` and
`locadex.css`). No `pathLength` and no `vector-effect: non-scaling-stroke`
on a dashed ring: Chromium dashes in screen space under the second and
ignores the first there.

```css
/* RING_D's perimeter is 402.832 user units; 4.02832px is one percent of
   it, and --ldx-fill runs 0..100 */
.toolchain-root .v0-ldx .v0-ldx-ring {
  fill: none;
  stroke-dasharray: calc(var(--ldx-fill) * 4.02832px) 403px;
  stroke-dashoffset: calc(var(--ldx-off) * -4.02832px);
}
```

```ts
// each pulse landing sweeps its share of the ring (QUARTER = 100 / pulses.length, SWEEP = 0.35)
pulses.forEach((_, i) => {
  flow.to(
    diagram,
    { '--ldx-fill': QUARTER * (i + 1), duration: SWEEP, ease: 'power2.out' },
    i * PULSE_GAP + ARRIVE
  );
});
```

- Author the `<path>` so its first point is where the arc should start;
  dashes never wrap a closed subpath.
- For a draw-on of an open path normalized to `pathLength=100`, pad the gap
  (`strokeDasharray='100 200'`) and park at 101 to draw from the path's
  first point, or at -101 to draw from its last.

## 4. A Lottie follower on the leader's clock

From the blog figure (gt-cloud branch `k/blog-lottie-translation`,
`LottieTranslationWindow.tsx`). The shown player keeps the clock; the
compared layer and the outgoing picture of a step are paused followers.

```ts
let lastFrame = -1;
leader.addEventListener('enterFrame', () => {
  // enterFrame fires every rAF even with subframes off; act on a new frame only
  if (leader.currentFrame === lastFrame) return;
  lastFrame = leader.currentFrame;
  for (const follower of followers) follower.goToAndStop(leader.currentRawFrame, true);
});
```

- Build every player with `setSubframe(false)` and a filled glyph list
  (`fillGlyphs` in `lottieDocument.ts`).
- Start a newly shown player from the old one's `currentRawFrame`, never
  from the floored `currentFrame`.

## 5. A film move on the paused timeline

From `motion/films/_smoke/index.html` and MOTION.md (Prototemplate). Every
frame is a pure function of the timeline's time. The page's head loads
`kit/tokens.css`, `kit/gsap.min.js` and `kit/dither.js`, and its style
hides the `.tone` images with `display: none`.

```html
<div id="root" data-composition-id="main" data-start="0" data-duration="3"
     data-width="1920" data-height="1080">
  <img class="tone" id="earth" src="kit/tone/mood-earth.jpg" alt="" />
  <img class="tone" id="rosetta" src="kit/tone/mood-rosetta.jpg" alt="" />
  <section id="scene" class="clip" data-start="0" data-duration="3" data-track-index="1">
    <canvas id="field" width="1920" height="1080"></canvas>
  </section>
</div>
<script>
  window.__timelines = window.__timelines || {};
  const g = GTDither.grid(document.getElementById('field'), 2, { width: 1920, height: 1080 });
  const proxy = { p: 0, mixp: 0 };
  function frame() {
    const a = GTDither.toneFromImage(document.getElementById('earth'), g, { fit: 'cover' });
    const b = GTDither.toneFromImage(document.getElementById('rosetta'), g, { fit: 'cover' });
    const m = GTDither.mix(a, b, proxy.mixp); // applies the smoothstep itself
    const k = GTDither.smoothstep(0, 1, proxy.mixp); // the ink rides the same curve
    GTDither.draw(g, (i) => m(i) * proxy.p, { ink: GTDither.mixColor('#f2f2f0', '#86a8ff', k) });
  }
  const tl = gsap.timeline({ paused: true, onUpdate: frame });
  tl.to(proxy, { p: 1, duration: 1, ease: 'power2.out' }, 0); // the field enters by raising tone
  tl.to(proxy, { mixp: 1, duration: 1.2, ease: 'none' }, 1.5); // linear p: mix applies the curve
  tl.set({}, {}, 3); // the timeline runs to the composition's data-duration
  window.__timelines['main'] = tl;
</script>
```

## 6. Film determinism

The composition contract (one paused timeline registered on
`window.__timelines`, no clocks or unseeded randomness, canvas drawing in
`onUpdate`, `var(--font)`, scripts only from `motion/kit/`) is in
`gt-films` section 4, from MOTION.md ("HyperFrames, briefly"). One rule
from the wiki's `hyperframes-animation` matters most to motion code:
compute layout constants once at setup and never call
`getBoundingClientRect()` at tween time, because the renderer samples
frames in parallel and a tween-time measurement desyncs.
