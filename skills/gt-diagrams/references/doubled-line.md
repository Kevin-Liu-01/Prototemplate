# The doubled line in detail

The construction, the code, the pulse, the two-tone split and the sizes per surface. `SKILL.md` section 5 has the rules; this file has the working parts. Paths are relative to `$PROTOTEMPLATE`.

## Construction

One center path, drawn as three layers in this order:

1. The thread layer: the path stroked at the full width, `gauge * 2 + gap`, in the thread ink.
2. The pulse layer (optional): a copy of the path, or a slice of it, at the same full width, in the accent where the pulse is the drawing's one accent element (ContextResolve) and in the page ink otherwise (TranslationFlow since 2026-07-31).
3. The core: the path stroked at `gap` in the color of the surface behind the drawing.

The core paints the middle of the stroke back to the ground, so two threads of `gauge` remain, `gap` apart, along any curve. Both strokes share one geometry, so the gap cannot drift on a bend. Every layer carries `vector-effect: non-scaling-stroke`, so the gauge stays in screen pixels when the viewBox is scaled or stretched.

| token | value | declared in |
| --- | --- | --- |
| `--thread-gauge` | 1.5px | `src/app/d/toolchain/styles.css` and the direction roots that draw threads (13 more); `$GT_CLOUD`: `apps/landing/src/components/landing/shell/engine.css`. The Prototemplate shell outside `src/app/d` declares none, so a figure there passes `gauge` and `gap` as props or keeps the `var()` fallbacks |
| `--thread-gap` | 3px | the same files |
| `--thread-ink` | `var(--tc-ink)` | the same files |

Full width at the tokens: 1.5 + 3 + 1.5 = 6px, and the core is 3px. The deck states the same numbers on slide 31 ("Stroke 1: 6px in ink", "Stroke 2: 3px in paper on top").

## The component

`src/components/shared/diagrams/DoubledLine.tsx`:

```tsx
import DoubledLine from '@/components/shared/diagrams/DoubledLine';

const TRUNK = 'M330 120 L680 120';
const PULSE = 'M470 120 L590 120'; // a static window, as on the craft plate

<svg viewBox='0 0 720 240' aria-hidden='true'>
  <DoubledLine d={TRUNK} core='var(--tc-plate)' ink='var(--tc-ink)'>
    {/* full width: gauge * 2 + gap = 6 at the defaults */}
    <path d={PULSE} fill='none' stroke='var(--tc-accent)' strokeWidth={6} vectorEffect='non-scaling-stroke' />
  </DoubledLine>
</svg>
```

The pulse child needs its own stroke attributes or a class that sets them: a bare `<path>` in the slot draws no stroke, and on a curve its default black fill paints a solid shape. The craft plate's `.ptc-th-pulse` in `src/app/craft/craft.css` is the class version.

- `core` is required. It is the color of the surface behind the line: `var(--tc-plate)` on the light diagram plate, `var(--tc-panel)` on the code panel, `var(--color-ink)` on an ink plate. A core that differs from the ground shows as a painted stripe down the middle of the line.
- `gauge` defaults to 1.5 and `gap` to 3. Use the defaults. The craft plate (`src/app/craft/ThreadsDemo.tsx`) runs 1 and 2 because it is a small demo plate.
- `ink` defaults to `rgba(255, 255, 255, 0.88)`, the white thread for an ink ground. On paper, pass the ink token.
- `children` render between the threads and the core. Put the pulse there, stroked at the full width (`gauge * 2 + gap`) with `vector-effect: non-scaling-stroke`. The core then splits the pulse into two hairlines.

## The class variant

When the paths are written in markup, the same three layers are three classes. From `src/app/d/toolchain/diagrams/flow.css`, abridged, with two comments added:

```css
.tflow .tf-thread {
  fill: none;
  stroke: var(--thread-ink, currentColor);
  stroke-width: calc(var(--thread-gauge, 1.5px) * 2 + var(--thread-gap, 3px));
  vector-effect: non-scaling-stroke;
}
.tflow .tf-pulse {
  fill: none;
  stroke: var(--tc-ink, currentColor);
  stroke-width: calc(var(--thread-gauge, 1.5px) * 2 + var(--thread-gap, 3px));
  vector-effect: non-scaling-stroke;
  opacity: 0; /* the loop shows it; reduced motion never does */
}
.tflow .tf-core {
  fill: none;
  stroke: var(--tf-ground); /* var(--tc-plate) */
  stroke-width: var(--thread-gap, 3px);
  vector-effect: non-scaling-stroke;
}
```

Each branch is a `<g>` holding thread, pulse and core. The trunk's group comes last in the SVG, so its core paints the junction back into one pair.

## Junctions and merges

Draw all thread layers, then all pulses, then all cores, or draw each three-layer group in turn with the trunk last. A later core paints through the earlier threads where the paths overlap, so a fork or a merge resolves into one clean pair with no offset-curve math. `TranslationFlow.tsx` draws three branches and then the trunk; `ThreadsDemo.tsx` draws two forks and then the trunk.

At the panel edge a fan-out leaves as exactly one doubled trunk (two threads), then splits at a drawn junction. Three overlapped strokes at an edge is the defect the trunk prevents.

## The pulse as geometry

A pulse is a short window traveling the path, in the accent or the page ink (Construction, step 2). It is built from real geometry: the path is sampled once in user space and the pulse's `d` is rewritten to the sub-polyline under the window on every tick. A dash pattern drifts, doubles or parks under a stretched viewBox with non-scaling-stroke, because browsers disagree about which space dash distances are measured in.

The helpers live in `src/app/d/toolchain/diagrams/TranslationFlow.tsx` and their twin in `lang/ContextResolve.tsx`:

- `tracePath(el)` caches the authored `d` in `el.dataset.traceD`, resets the path to it, and samples one point per user unit with `getPointAtLength`. It returns null for an empty or zero-length path; `getPointAtLength` throws on an empty path, which is the console error Kevin reported from `ContextResolve.tsx` on 2026-07-30.
- `pointOn(trace, at)` interpolates between samples.
- `windowPath(trace, from, to)` returns the slice as `M ... L ...`, or an empty string when the window is off this path. The empty string is what hands one window from the trunk to a branch.

TranslationFlow runs one head over the whole journey (trunk, junction, branch) and computes both slices from that one coordinate, so the window crosses the junction as one object. Speed is shared at 40 user units per second and each duration follows from its path's length, so branches of different lengths move alike. The window is about 20 percent of the branch, clamped to 14 to 24 units. Journeys leave 2.4 seconds apart and three make the cycle; the trunk carries one pulse path per branch, so the staggered journeys never share a path. The pulse ships at `opacity: 0` in CSS, and under `prefers-reduced-motion: reduce` the loop never starts and the fork holds its still.

`lang/ContextResolve.tsx` adds the still: a static accent pair on the live branch is the reduced-motion frame, and in motion that static pair stands down while the pulse runs.

For a single pulse on a straight rail with no stretch, a short `<line>` moved with `transform: translateX(<n>px)` in user units also works (CSS px on SVG children are user units). `svg-dash-gotchas` records it as the enterprise launch rail's fix.

## Two-tone

One thread in `ink`, the other in `inkB`. `DoubledLine` paints the full-width `inkB` stroke, then the full-width `ink` stroke clipped to `splitD`, then the core. `splitD` is the same center path closed off one side of the viewBox:

```ts
const FORK_A = 'M40 64 C170 64 210 120 330 120';
const SPLIT_A = `${FORK_A} L330 -20 L40 -20 Z`; // closed off the top edge: the upper thread takes ink
```

The clip boundary is the center line, which lies inside the core's gap, so the seam between the two inks never shows on any bend. Offset clones collapse on curves and concentric restrokes only make symmetric rings, so the clip is the construction that two-tones a single path. `src/app/craft/ThreadsDemo.tsx` runs it with `rgba(255, 255, 255, 0.88)` and `0.42` on the ink plate.

## Sizes per surface

| surface | thread layer | core | source |
| --- | --- | --- | --- |
| site and landing pages | 6px (1.5 + 3 + 1.5) | 3px | `--thread-gauge`, `--thread-gap` |
| deck sheet (1600 by 900) | 6px | 3px | slide 31 |
| films (1920 by 1080) | 7px, drawn as whole-pixel rows | 3px | `motion/films/blog-fuma-nama/index.html` (`doubledH`), `motion/films/blog-designing-docs/index.html` (`F.doubled(..., 7, 3)`) |

`motion/MOTION.md` (Line) gives the video scale as "gauge 3 px, core 1.5 px gap, or the 1.5/3 tokens doubled"; the films as built draw 7 under 3, two 2px threads with a 3px gap. Read the film's own kit before drawing in a new film. Over a busy ground (dither or smoke) the designing-docs film lays a 17px casing in the ground color under each connector, so the texture stops 5px short of each thread.

## Doubled lines drawn in CSS

An HTML element can carry the pair as two background strips. The toolchain hero's emphasis (`src/app/d/toolchain/styles.css`, `.tc-hero h1 em`) draws two `linear-gradient` strips of `--thread-gauge` height, `--thread-gap` apart, in `--thread-ink`.

The line auditor reads CSS lines. A pair drawn by one element is one owner and passes. A pair drawn by two elements fails as a doubled line (two owners within 4px) unless the owner's class carries a fragment from the allow list in `scripts/lint-lines.mjs` (`ALLOW`): `thread`, `shell-rail`, `stack-rail` or `trace-rail`, each listed there with its reason. The doubled line is a connector; it is never a page rail beside the column's pair (DESIGN.md section 3).
