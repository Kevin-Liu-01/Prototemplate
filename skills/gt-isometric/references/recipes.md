# Isometric recipes

Copyable code for the gt-isometric skill. Every snippet uses the real kit API. In Prototemplate the kit imports from `@/app/d/toolchain/diagrams/iso`; in the gt-cloud landing it imports from `@/components/landing/shared/iso`. Class names are examples; keep paint in CSS and pass only per-plate numbers inline.

## 1. An opaque plate

The extrusion recipe as one component, from `Locadex.tsx` and `StackTower.tsx`: hull, three faces, then the three hairlines.

```tsx
import type { CSSProperties } from 'react';

import {
  frontEdge,
  leftFace,
  rightFace,
  roundedPolygon,
  segment,
  silhouette,
  topFace,
  type IsoBox,
} from '@/app/d/toolchain/diagrams/iso';

/** Custom properties are legal inline styles but absent from CSSProperties. */
type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

type PlateProps = {
  box: IsoBox;
  /** Stroke alphas for the rim and the top contour: the depth cue. */
  rim: number;
  edge: number;
  hot?: boolean;
};

export function Plate({ box, rim, edge, hot }: PlateProps) {
  const hull = roundedPolygon(silhouette(box));
  const top = roundedPolygon(topFace(box));
  const [frontA, frontB] = frontEdge(box);
  const voice: StyleVars = { '--rim-a': rim.toFixed(3), '--edge-a': edge.toFixed(3) };
  return (
    <g className={hot ? 'xp-plate is-hot' : 'xp-plate'} style={voice}>
      <path className='xp-hull' d={hull} />
      <path className='xp-left' d={roundedPolygon(leftFace(box))} />
      <path className='xp-right' d={roundedPolygon(rightFace(box))} />
      <path className='xp-top' d={top} />
      <path className='xp-rim' d={hull} vectorEffect='non-scaling-stroke' />
      <path className='xp-front' d={segment(frontA, frontB)} vectorEffect='non-scaling-stroke' />
      <path className='xp-edge' d={top} vectorEffect='non-scaling-stroke' />
    </g>
  );
}
```

The tower's paint, both themes (`src/app/d/_v0/sections/fullstack.css`). Scope it under the page root the way the source scopes `.toolchain-root .tcb`.

```css
.xp-hull { fill: #090909; }
.xp-top { fill: #151515; }
.xp-left { fill: #0d0d0d; }
.xp-right { fill: #090909; }
.xp-rim { fill: none; stroke: rgba(255, 255, 255, var(--rim-a, 0.12)); stroke-width: 1; }
.xp-front { fill: none; stroke: rgba(255, 255, 255, 0.08); stroke-width: 1; }
.xp-edge { fill: none; stroke: rgba(255, 255, 255, var(--edge-a, 0.14)); stroke-width: 1; }

.xp-plate.is-hot .xp-top { fill: #1b1b1b; }
.xp-plate.is-hot .xp-left { fill: #131313; }
.xp-plate.is-hot .xp-right { fill: #0e0e0e; }
.xp-plate.is-hot .xp-rim { stroke: rgba(255, 255, 255, 0.24); }
.xp-plate.is-hot .xp-front { stroke: rgba(255, 255, 255, 0.14); }
.xp-plate.is-hot .xp-edge { stroke: var(--iso-accent); }

:root:not([data-theme='dark']) .xp-hull { fill: #e3e1dd; }
:root:not([data-theme='dark']) .xp-top { fill: #f7f6f4; }
:root:not([data-theme='dark']) .xp-left { fill: #edebe8; }
:root:not([data-theme='dark']) .xp-right { fill: #e3e1dd; }
:root:not([data-theme='dark']) .xp-rim { stroke: rgb(7 7 7 / calc(var(--rim-a, 0.12) + 0.16)); }
:root:not([data-theme='dark']) .xp-front { stroke: rgba(7, 7, 7, 0.14); }
:root:not([data-theme='dark']) .xp-edge { stroke: rgb(7 7 7 / calc(var(--edge-a, 0.14) + 0.1)); }
```

Depth for a stack of n plates, bottom first (the tower's numbers):

```ts
const depthAt = (i: number, n: number) => i / (n - 1);
const rimAlpha = (i: number, n: number) => 0.12 + 0.08 * depthAt(i, n);
const edgeAlpha = (i: number, n: number) => 0.24 + 0.24 * depthAt(i, n);
```

Proportions: footprint 104, `THICK = 4.2`, `GAP = 42`, so plate i sits at `z = i * (THICK + GAP)` with `{ x: -52, y: -52, w: 104, d: 104, h: 4.2 }`.

## 2. A prism

Any convex plan polygon, wound like the box corners (`IsoDemo.tsx`):

```tsx
import {
  prismFaces,
  prismFrontEdges,
  prismSilhouette,
  prismTop,
  roundedPolygon,
  segment,
  type IsoPrism,
  type Pt2,
} from '@/app/d/toolchain/diagrams/iso';

function hexPoints(cx: number, cy: number, r: number): Pt2[] {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });
}

const HEX: IsoPrism = { points: hexPoints(24, -28, 11), z: 4.2, h: 5 };

export function Prism({ p }: { p: IsoPrism }) {
  return (
    <g>
      <path className='xp-hull' d={roundedPolygon(prismSilhouette(p))} />
      {prismFaces(p).map((face) => (
        <path
          key={String(face.pts[0])}
          className={face.shade === 'right' ? 'xp-right' : 'xp-left'}
          d={roundedPolygon(face.pts)}
        />
      ))}
      <path className='xp-top' d={roundedPolygon(prismTop(p))} />
      <path className='xp-rim' d={roundedPolygon(prismSilhouette(p))} vectorEffect='non-scaling-stroke' />
      <path className='xp-edge' d={roundedPolygon(prismTop(p))} vectorEffect='non-scaling-stroke' />
      {prismFrontEdges(p).map(([a, b]) => (
        <path key={String(a)} className='xp-front' d={segment(a, b)} vectorEffect='non-scaling-stroke' />
      ))}
    </g>
  );
}
```

## 3. A chip and a flat mark on a face

A chip is a small extrusion resting on a plate's top face: hull with its own hairline, then a lighter top. A content bar is a flat rounded rectangle lying in the face.

```tsx
import { markPath, roundedPolygon, silhouette, topFace, type IsoBox } from '@/app/d/toolchain/diagrams/iso';

const PLATE_TOP = 3; // the plate's z + h
const CHIP_H = 3;

export function Chip({ x, y, w, d, accent }: { x: number; y: number; w: number; d: number; accent?: boolean }) {
  const box: IsoBox = { x, y, z: PLATE_TOP, w, d, h: CHIP_H };
  return (
    <g className={accent ? 'xp-chip is-accent' : 'xp-chip'}>
      <path className='xp-chip-hull' d={roundedPolygon(silhouette(box))} />
      <path className='xp-chip-top' d={roundedPolygon(topFace(box))} />
    </g>
  );
}

/** A content bar lying in the top face of a chip at plan (x, y), 3 units deep. */
const chipBar = (x: number, y: number, w: number) => markPath(x + 3, y + 4, w, 3, PLATE_TOP + CHIP_H);
```

```css
.xp-chip-hull { fill: #1a1a1a; stroke: rgba(255, 255, 255, 0.14); stroke-width: 0.6; }
.xp-chip-top { fill: #222222; }
.xp-chip.is-accent .xp-chip-hull { fill: color-mix(in srgb, var(--iso-accent) 24%, #101010); stroke: var(--iso-accent); }
.xp-chip.is-accent .xp-chip-top { fill: color-mix(in srgb, var(--iso-accent) 42%, #101010); }
.xp-fmark { fill: rgba(255, 255, 255, 0.14); }
```

Diff slats pass `r = 1.2` to `roundedPolygon`; sign bars pass `0.4` to `markPath`.

## 4. Strokes and icons lying in a face

Draw in plan coordinates inside a `plane()` group; keep the stroke 1px. The tower's `ChipIcon` (`StackTower.tsx`) does this with lucide outline paths inlined as raw geometry, which lie in a face the way any other stroke does.

```tsx
import { plane } from '@/app/d/toolchain/diagrams/iso';

/** A 24-unit icon centered on plan (cx, cy) at height z, s plan units per icon unit. */
function FaceIcon({ z, cx, cy, s, paths }: { z: number; cx: number; cy: number; s: number; paths: readonly string[] }) {
  return (
    <g transform={`${plane(z, cx, cy)} scale(${s}) translate(-12 -12)`}>
      {paths.map((d) => (
        <path key={d} className='xp-icon' d={d} vectorEffect='non-scaling-stroke' />
      ))}
    </g>
  );
}
```

## 5. A static seated mark

The Locadex slab's mark (`Locadex.tsx`). The rect sits inside the plane group, so the mask's coordinates are plan coordinates. Mask ids are document-global, so give each seat its own.

```tsx
import { plane } from '@/app/d/toolchain/diagrams/iso';

const MARK_HALF = 16; // half the image box, in plan units
const SLAB_TOP = 54 + 7; // the slab's z + h (A_Z + A_H in Locadex.tsx)

export function SlabMark() {
  return (
    <>
      <defs>
        <mask
          id='xp-slab-mark'
          maskUnits='userSpaceOnUse'
          x={-MARK_HALF}
          y={-MARK_HALF}
          width={MARK_HALF * 2}
          height={MARK_HALF * 2}
          style={{ maskType: 'alpha' }}
        >
          <image href='/brand/locadex-mark.svg' x={-MARK_HALF} y={-MARK_HALF} width={MARK_HALF * 2} height={MARK_HALF * 2} />
        </mask>
      </defs>
      {/* the slab's top face, anchored at plan (0, 0) */}
      <g transform={plane(SLAB_TOP)}>
        <rect
          className='xp-mark'
          x={-MARK_HALF}
          y={-MARK_HALF}
          width={MARK_HALF * 2}
          height={MARK_HALF * 2}
          mask='url(#xp-slab-mark)'
        />
      </g>
    </>
  );
}
```

```css
.xp-mark { fill: rgba(255, 255, 255, 0.78); }
:root:not([data-theme='dark']) .xp-mark { fill: rgba(7, 7, 7, 0.8); }
```

On a chip, anchor the plane at the chip's center: `plane(chipTop, chipX + chipW / 2, chipY + chipD / 2)`. At small sizes use `/brand/no-bg-locadex-logo-light.png` (the pricing platform seats it in a 16-unit image box), because the SVG's ring geometry breaks there; for the GT mark use `/brand/no-bg-gt-logo-light.png`. For a third-party icon component, render it inside the mask with `color='#fff'`.

Size the image box for `locadex-mark.svg` from its glyph, which spans 199 of the 500 viewBox units in width:

```ts
const MARK_GLYPH_W = 28; // the visible glyph width in plan units
const MARK_HALF = (MARK_GLYPH_W * (500 / 199)) / 2;
```

## 6. The dithered shimmer

The tower's top plate (`StackTower.tsx`) seats the mark through `DitheredMark` and drives it from `FullStack.tsx`.

```tsx
import DitheredMark, { shineTravel } from '@/app/d/toolchain/diagrams/DitheredMark';
import { plane } from '@/app/d/toolchain/diagrams/iso';

const MARK_GLYPH_W = 28;
const MARK_HALF = (MARK_GLYPH_W * (500 / 199)) / 2;
const CHIP_X = -40;
const CHIP_Y = -18;
const CHIP_SIZE = 36;
const CHIP_TOP = 4.2 + 3.5; // plate thickness + chip height
const MARK_PLANE = plane(CHIP_TOP, CHIP_X + CHIP_SIZE / 2, CHIP_Y + CHIP_SIZE / 2);

/* The screen-space rect the ink and the shimmer span: the glyph's plan
   corners projected with project(x, y, CHIP_TOP), padded a few units.
   The mask's maskBox (default -120, -80, 240, 160) must contain it. */
const COVER = { x: -48, y: -37, w: 58, h: 37 } as const;

export const SHINE = shineTravel(COVER);

export function TowerMark() {
  return (
    <DitheredMark
      id='xp-ldx'
      href='/brand/locadex-mark.svg'
      plane={MARK_PLANE}
      markHalf={MARK_HALF}
      cover={COVER}
      inkClassName='xp-ldx-ink'
      glintClassName='xp-ldx-glint'
      shineClassName='xp-ldx-shine'
    />
  );
}
```

```css
.xp-ldx-ink { fill: rgba(255, 255, 255, 0.3); }
.xp-ldx-shine { opacity: 0.5; }
.xp-ldx-glint { fill: #e9edf2; }
.is-hot .xp-ldx-ink { fill: var(--iso-accent); }
.is-hot .xp-ldx-shine { opacity: 1; }
.is-hot .xp-ldx-glint { fill: color-mix(in srgb, #ffffff 70%, var(--iso-accent)); }
```

The driver. Call it inside `useGSAP` after the reduced-motion check returns, then play the loops only while the plate exists and the section is on screen:

```ts
import gsap from 'gsap';

export function shimmerLoops(scope: Element, shine: { from: number; to: number }): gsap.core.Tween[] {
  const stripes = gsap.utils.toArray<SVGPathElement>('[data-ldx-stripe]', scope);
  const stripes2 = gsap.utils.toArray<SVGPathElement>('[data-ldx-stripe2]', scope);
  const lap = (shine.to - shine.from) / 56; // about 56 units per second
  const band = (targets: SVGPathElement[]) =>
    gsap.fromTo(targets, { x: shine.from }, { x: shine.to, duration: lap, ease: 'none', repeat: -1, paused: true });
  return [band(stripes), band(stripes2).time(lap / 2)];
}
```

Translate only. Rotating the windows from GSAP moved the sweep about 180 units off the mark.

## 7. A leaning scan beam

A sheet hung under a slab that pivots at the top and sweeps further at the landing (`Locadex.tsx`). The corners are re-projected per tick.

```ts
import gsap from 'gsap';

import { polyline, project, segment } from '@/app/d/toolchain/diagrams/iso';

const A_HALF = 22; // slab half width
const A_Z = 54; // slab underside
const LAND_Z = 6; // the module chips' top faces
const BEAM_LAND_HALF = 34;
const BEAM_TOP_Y = 14; // stays inside the slab
const BEAM_LAND_Y = 28; // crosses every module row

export const beamAt = (t: number) => {
  const tl = project(-A_HALF, BEAM_TOP_Y * t, A_Z);
  const tr = project(A_HALF, BEAM_TOP_Y * t, A_Z);
  const br = project(BEAM_LAND_HALF, BEAM_LAND_Y * t, LAND_Z);
  const bl = project(-BEAM_LAND_HALF, BEAM_LAND_Y * t, LAND_Z);
  return { quad: polyline([tl, tr, br, bl], true), edgeL: segment(tl, bl), edgeR: segment(tr, br), land: segment(bl, br) };
};

/* Call inside useGSAP after the reduced-motion check. The markup draws
   beamAt(0), which is the rest pose and the reduced-motion still. Play the
   loop only while the section is on screen (a ScrollTrigger onToggle). */
export function beamLoop(scope: Element): gsap.core.Tween {
  const scan = scope.querySelector<SVGGElement>('[data-scan]');
  const body = scan?.querySelector<SVGPathElement>('.xp-beam');
  const edges = scan?.querySelectorAll<SVGPathElement>('.xp-beam-edge');
  const land = scan?.querySelector<SVGPathElement>('.xp-beam-land');
  const sweep = { t: 1 };
  const setBeam = () => {
    const g = beamAt(sweep.t);
    body?.setAttribute('d', g.quad);
    edges?.[0]?.setAttribute('d', g.edgeL);
    edges?.[1]?.setAttribute('d', g.edgeR);
    land?.setAttribute('d', g.land);
  };
  return gsap.fromTo(
    sweep,
    { t: 1 },
    { t: -1, duration: 3.6, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true, onUpdate: setBeam }
  );
}
```

Dark strengths: body `rgba(134, 168, 255, 0.08)`, edges 0.3, landing line 0.65. On paper: the page accent at 7%, 32% and 60%.

## 8. A leader that meets a plate

Drawn before the hull in the plate's own SVG so the hull covers its end. The run starts 2 units inside the plate's left vertex at mid-edge height and ends down the rail (`StackTower.tsx` `plateGeo`).

```ts
import { ISO_COS30 } from '@/app/d/toolchain/diagrams/iso';

const SIZE = 104;
const THICK = 4.2;
const VERTEX_X = -(SIZE * ISO_COS30); // the plate's left vertex
const RAIL_X = VERTEX_X - 22; // the rail line's right edge
const RAIL_GAUGE = 1.85; // the rail's and the leaders' stroke width
const RAIL_CX = RAIL_X - RAIL_GAUGE / 2;
const CORNER = 6; // the bend radius
const TAP_STUB = 14; // how far the leader runs down the rail
const TAP_Y = -THICK / 2; // the left vertex sits at mid-edge height after rounding
const run = -(SIZE * ISO_COS30) + 2; // 2 units past the vertex, under the hull
const tap = `M${run} ${TAP_Y}L${RAIL_CX + CORNER} ${TAP_Y}Q${RAIL_CX} ${TAP_Y} ${RAIL_CX} ${TAP_Y + CORNER}L${RAIL_CX} ${TAP_Y + TAP_STUB}`;
```

```tsx
<path className='xp-leader' d={tap} strokeWidth={RAIL_GAUGE} pathLength={100} strokeDasharray='100 200' strokeDashoffset={0} />
```

Park it undrawn at `strokeDashoffset: -101` and draw it to 0 with `autoRound: false`. The negative offset reveals from the path's end, so the bend grows out of the rail into the plate.

## 9. Flat to iso in one matrix

The designing-docs film's bridge (`motion/films/blog-designing-docs/index.html`). `tilt` 0 is the flat page (identity at scale k = 1); `tilt` 1 is the 30 degree map. `pivot` is the page's center and `center` its screen position; `sep` lifts plates by their z.

```js
const ISO_Q = Math.tan(Math.PI / 6);
const ISO_S = Math.sqrt(1.5);
const lerp = (a, b, x) => a + (b - a) * x;

function isoMatrix({ tilt, sep, k, center }, pivot, z) {
  const th = (Math.PI / 4) * tilt;
  const q = lerp(1, ISO_Q, tilt);
  const s = k * lerp(1, ISO_S, tilt);
  const a = s * Math.cos(th);
  const b = s * q * Math.sin(th);
  const c = -s * Math.sin(th);
  const d = s * q * Math.cos(th);
  const e = center[0] - (a * pivot[0] + c * pivot[1]);
  const f = center[1] - z * sep * k * tilt - (b * pivot[0] + d * pivot[1]);
  return { a, b, c, d, e, f }; // screen = [a x + c y + e, b x + d y + f]
}
```

At tilt 1, `a = -c = s * cos 45` and `b = d = s * tan 30 * cos 45`, which is `project()` scaled by k. Side faces are the quads between a plate's projected edge and the same edge moved down by `THICK * k * tilt`.
