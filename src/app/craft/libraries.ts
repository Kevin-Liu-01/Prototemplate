/**
 * The craft article's data: the audit and ownership rules, the teaching
 * snippets, and the LIBRARIES roster — pure strings, importable by the
 * article and by the search index without dragging any demo code along.
 */
import type { LibraryDemoKind } from './LibraryDemo';
export const AUDITS = [
  'Doubled lines — two parallel strokes from different owners within 4px of each other, including coincident strokes that composite darker than either.',
  'Missing seams — section and row junctions that no rule closes.',
  'Self-stacks — a translucent border over the element’s own translucent background, the same line drawn twice by one element.',
  'Invisible seams — rules that exist geometrically but sit within a few RGB steps of the surface they cross.',
] as const;

export const RAIL_RULES = [
  'Exactly one thing draws the page rails for any section — a rail wrapper, or the section’s own full-bleed pair. Never both.',
  'The row owns every structural line; cells never draw borders that parallel a row seam.',
  'Framed rows expose the ground through a 1px padding reveal instead of drawing a border — the ground is the seam.',
  'Translucent fills never extend under translucent borders: backgrounds clip to the padding box, everywhere.',
] as const;

/* The auditor's real invocation, and a finding in its real output shape
   (JSON.stringify(out, null, 1), keyed by audit width). The round is staged —
   this page audits clean — but every field is the auditor's own. */
export const LINT_SNIPPET = `$ node scripts/lint-lines.mjs http://localhost:3006/craft --theme dark

{
 "1440": {
  "total": 212,
  "doubles": [
   { "orient": "h", "at": 1284, "gap": 1.5,
     "a": "pt-sec pt-post-sec", "b": "pt-hatch", "span": 1170 }
  ],
  "missing": [
   { "kind": "section", "between": "pt-sec → pt-foot", "at": 4620 }
  ],
  "selfStacks": [
   { "owner": "pt-compare-tag", "side": "top", "at": 3892, "len": 118 }
  ],
  "invisibles": []
 },
 "1280": { "total": 208, "doubles": [], "missing": [], "selfStacks": [], "invisibles": [] }
}`;

export const BENTO_SNIPPET = `import { BentoCell, BentoRow, Rails } from '@/components/shell/Bento';

<section className='relative'>
  {/* the wrapper draws the page rails — once */}
  <Rails />

  {/* the row owns the seams: gap-px cells over the one hair ground */}
  <BentoRow cols='7fr 5fr'>
    <BentoCell title='Ship in every language' sub='One pipeline'>
      <LocaleLedger />
    </BentoCell>
    <BentoCell framed={false} cell='is-terminal'>
      <Terminal />
    </BentoCell>
  </BentoRow>
</section>`;

const HORIZON_SNIPPET = `import { createHorizonField } from '@/lib/horizon-field';

const field = createHorizonField(canvas, {
  speed: 0.5,
  params: { ink: [1, 1, 1], exposure: 2.6 },
});

/* the shader draws nothing until it is given a geometry */
const fit = () => {
  field?.setParams({
    center: [canvas.clientWidth / 2, canvas.clientHeight / 2],
    radius: Math.min(canvas.clientWidth, canvas.clientHeight) * 0.32,
  });
};
fit();
new ResizeObserver(fit).observe(canvas);

/* handle: setParams · pause · resume · renderStatic · destroy */`;

const GLYPH_SNIPPET = `import { createGlyphField } from '@/lib/glyph-field';

const field = createGlyphField({
  canvas,
  drift: 'rise', // the library's fall, or a rising field — same wrap math
  copy: 'none', // 'auto' infers the copy fold; 'none' is a standalone plate
  displayFamily: getComputedStyle(canvas).fontFamily,
  monoFamily: getComputedStyle(canvas).getPropertyValue('--pt-mono'),
  onScript: (index) => setActive(index),
});

/* the whole teardown — observers, loop, theme watcher */
field?.destroy();`;

const INK_SNIPPET = `import { createInkField } from '@/app/d/glyph-rain/sections/band/inkField';

const field = createInkField({
  canvas,
  clearEl: contentBox, // the field keeps clear of this box, measured live
  clearing: 'none',    // — or flood the whole canvas (this plate)
  interactive: true,   // pointer wobble + click bursts; bands never set it
  displayFamily: getComputedStyle(canvas).fontFamily,
});

field?.destroy();`;

const DITHER_SNIPPET = `import { createDitherLoop, gradientRamp, streakBands } from '@/lib/dither';

const loop = createDitherLoop(
  canvas,
  streakBands({ bands: 22, waviness: 0.13, taper: 0.5 }),
  { scale: 3, paper: 'transparent', fps: 30 }
);

/* fields swap live; ink re-resolves on theme flips */
loop.setField(gradientRamp({ angle: Math.PI / 2, smooth: true }));
loop.setOptions({ ink: getComputedStyle(canvas).color });
loop.destroy();`;

const STUDIO_SNIPPET = `import StudioField from '@/components/shared/StudioField';
import { BAYER_DEFAULT_ID, BAYER_PRESETS } from '@/lib/studio-field';

const [id, setId] = useState(BAYER_DEFAULT_ID);
const active = BAYER_PRESETS.find((v) => v.id === id);

/* switching is a remount: key the stage, and the outgoing field's
   destroy() runs before the incoming one draws — one shared GL
   context, one program per preset cached for the session */
<StudioField key={active.id} preset={active.preset} className='plate-field' />

{BAYER_PRESETS.map((v) => (
  <button data-on={v.id === id} key={v.id} onClick={() => setId(v.id)}>
    <i>{v.id}</i> <span>{v.name}</span>
  </button>
))}`;

const ISO_SNIPPET = `import {
  frontEdge, leftFace, rightFace, roundedPolygon,
  segment, silhouette, topFace, type IsoBox,
} from '@/app/d/toolchain/diagrams/iso';

/* a raised plate: hull occludes, faces lit top/left/right, then hairlines */
const box: IsoBox = { x: -42, y: -42, z: 0, w: 84, d: 84, h: 3.2 };
const [a, b] = frontEdge(box);

<path className='iso-face-right' d={roundedPolygon(rightFace(box))} />
<path className='iso-face-left' d={roundedPolygon(leftFace(box))} />
<path className='iso-face-top' d={roundedPolygon(topFace(box))} />
<path className='iso-line' d={roundedPolygon(silhouette(box))} />
<path className='iso-line' d={segment(a, b)} />`;

const THREADS_SNIPPET = `import DoubledLine from '@/components/shared/diagrams/DoubledLine';

const TRUNK = 'M330 120 L680 120';
/* the split region: the SAME center path, closed off the top edge —
   the clip boundary is the line itself, hidden inside the carve */
const SPLIT = TRUNK + ' L680 -20 L330 -20 Z';

<svg viewBox='0 0 720 240' aria-hidden='true'>
  <DoubledLine
    d={TRUNK}
    core='var(--color-ink)' /* the surface that carves */
    ink='rgba(255, 255, 255, 0.88)' /* the white thread */
    inkB='rgba(255, 255, 255, 0.42)' /* the gray thread */
    splitD={SPLIT}
    gauge={1}
    gap={2}
  >
    {/* the pulse slot — between threads and core, carved to two
        accent hairlines by the same core */}
    <path className='pulse' d={PULSE} />
  </DoubledLine>
</svg>`;

const GLOBE_SNIPPET = `import EdgeGlobe from '@/app/d/toolchain/diagrams/EdgeGlobe';

/* the dossier mount: a static Bayer atmosphere hugs the limb — four
   annuli of nested coverage tiers on one shared grid, so crossing a
   ring boundary only turns dots off and no cell is painted twice */
<div className='v0-glob-stage'>
  <GlobeAtmosphere />
  <EdgeGlobe title='Five PoPs, one request served 12 ms away' />
</div>`;

const PILLS_SNIPPET = `import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

// bare flag+code chip in a code→output ledger row
<div className='tcb-out-row'>
  <span><LocaleTag code='es' /></span>
  <b lang='es'>¡Hola, mundo!</b>
</div>

// bordered transcript pill in the hero terminal's ✓-row —
// the host supplies the box, the tag only fills it
<LocaleTag code={loc} className='tc-termloc' />`;

const SEAM_SNIPPET = `import RevealSeam from '@/app/d/toolchain/sections/RevealSeam';

<div className='tct-app' ref={app} style={{ '--seam-cut': '70%' }}>
  <div className='tct-app-main'>{/* rendered UI, full width */}</div>
  <div className='tct-payload' aria-hidden>
    {/* clip-path: inset(0 0 0 var(--seam-cut)) — revealed in place */}
    <PayloadJson loc={ploc} />
  </div>
  <RevealSeam
    boxRef={app}
    ariaLabel='Reveal the served translation file'
    onInteract={() => endTour()}
  />
</div>`;

const REASSEMBLER_SNIPPET = `import EverySentence, {
  type EverySentenceHandle,
} from '@/components/shared/EverySentence';

/* the host owns the one clock — the component never runs a timer.
   setLocale(loc) is the only intake: debounced a quarter second,
   mid-dissolve retargets the form boundary, mid-form kills the
   timeline and re-dissolves, same text with a new lang retags only. */
const every = useRef<EverySentenceHandle>(null);

<h1><span>
  <EverySentence ref={every} words={WORDS} initial='en' />
</span></h1>

{/* the dossier hero: the locale belt is the clock */}
<TranslateWindow onLocaleChange={(loc) => every.current?.setLocale(loc)} />`;

const COLOR_SNIPPET = `/* globals.css — the four colors, absolute by design */
@theme {
  --color-ink: #070707;
  --color-ink-raised: #101010;
  --color-titanium: #8a8f98;
  --color-paper: #ffffff;
}

/* each root publishes a semantic layer of the four (+ alpha) … */
.toolchain-root { --tc-paper: #ffffff; --tc-ink: #070707;
  --tc-hair: rgba(138, 143, 152, 0.26); --tc-accent: #2f5ce0; }

/* … and dark mode is a token remap, nothing else */
[data-theme='dark'] .toolchain-root { --tc-paper: #070707;
  --tc-ink: #ffffff; --tc-hair: rgba(138, 143, 152, 0.5); }`;

const PRISMATIC_SNIPPET = `import PrismaticField from '@/components/shared/PrismaticField';

<PrismaticField
  preset='2'
  speed={0.5}
  params={{ exposureScale: 4200 }}
  className='plate-field'
/>

/* presets: '1' wide burst · '2' arc over a dark core.
   exposureScale is the dimmer — raise it under content. */`;

export type Library = {
  name: string;
  role: string;
  body: string;
  /** the live plate — absent for the entries that are systems, not engines */
  demo?: { kind: LibraryDemoKind; tag: string; label: string };
  file: string;
  snippet: string;
};

export const LIBRARIES: readonly Library[] = [
  {
    name: 'horizon-field',
    role: 'the singularity visual',
    body:
      'The lensing black hole: a photon ring, wrapped accretion arcs, and the page’s own ruled lines bending into the mass — one WebGL fragment shader on one quad. Twenty-one tunable parameters (geometry, doppler, chroma, exposure, breathing), a full runtime handle (setParams, pause, resume, renderStatic, destroy), and GLSL kept comment-free by design so the shipped source stays a fraction of the page it lights.',
    demo: {
      kind: 'horizon',
      tag: 'createHorizonField()',
      label:
        'Live demo: a small event horizon — a bright photon ring around a dark core, with faint ruled lines bending into it.',
    },
    file: 'src/lib/horizon-field.ts',
    snippet: HORIZON_SNIPPET,
  },
  {
    name: 'glyph-field',
    role: 'the glyph rain visual',
    body:
      'A canvas-2D particle field of 1,280 glyphs from eight writing systems that condenses into the word "language" in script after script. One preallocated typed-array pool, a 1-bit Bayer-dithered atlas, and morphs that conserve matter: the outgoing word’s dust is the next word’s material, and nothing ever spawns mid-air or vanishes mid-flight. The dossier home hardened it into a real library: a drift option runs the rain down or up on the same negative-safe wrap math (its closing band rises), per-sprite ink bounds cut the blitted area several-fold, depth alpha is quantized so the loop touches globalAlpha a handful of times per pass instead of per glyph, and the field is host-aspect-true — homes live in unit coordinates and re-lay onto the live box every resize, so nothing about it is square.',
    demo: {
      kind: 'glyph',
      tag: 'createGlyphField()',
      label:
        'Live demo: glyphs from eight writing systems rain down and condense into the word "language" in one script after another, each word measured by a caliper.',
    },
    file: 'src/lib/glyph-field.ts',
    snippet: GLYPH_SNIPPET,
  },
  {
    name: 'ink-field',
    role: 'the band margins’ rising rain',
    body:
      'The closing band’s material as its own engine: the glyph-field’s eight-script inventory rising off the ink in the same set 34px columns, with a content clearing measured off the live DOM box so glyphs own only the margins. It inherited every one of the hero’s flicker lessons — solid tiers on a tier-batched alpha ramp (dither never rides moving glyphs), integer-snapped device-px blits, hysteresis on the clearing rim — and on this plate it plays: glyphs shiver as the pointer nears, and a click blows the nearest one up, its shockwave shoving the column neighbors before the field heals.',
    demo: {
      kind: 'ink',
      tag: 'createInkField()',
      label:
        'Live demo: paper glyphs rising off an ink plate. Move the pointer to make nearby glyphs wobble; click to burst one with a shockwave.',
    },
    file: 'src/app/d/glyph-rain/sections/band/inkField.ts',
    snippet: INK_SNIPPET,
  },
  {
    name: 'prismatic-field',
    role: 'the chroma wash',
    body:
      'The spectral light behind every dark terminal and band — a flowing wide-gamut wash with presets, speed and exposure control, masked so the light owns the edges and the content owns the dark center.',
    demo: {
      kind: 'prismatic',
      tag: '<PrismaticField />',
      label:
        'Live demo: a flowing spectral light field arcing over a dark center, streaks of thin-film color converging and drifting.',
    },
    file: 'src/components/shared/PrismaticField.tsx',
    snippet: PRISMATIC_SNIPPET,
  },
  {
    name: 'dither',
    role: 'the 1-bit Bayer renderer',
    body:
      'Any continuous field fn(u, v, t) → 0..1, rendered as pure 1-bit ordered dither: each cell compares the field against the 8×8 Bayer matrix — an exact permutation of 0..63, so a flat field lights exactly k pixels per tile and the ramp has 65 tonally linear levels. It draws one device pixel per cell into a small buffer and lets CSS upscale it pixelated, writes every frame through one reused Uint32 view, and ships field factories — radial bursts, a lit globe, streak bands, ramps, a true text SDF — plus combinators to multiply, max and mix them. The loop caps at 30fps, pauses offscreen and on hidden tabs, and renders exactly one still under reduced motion.',
    demo: {
      kind: 'dither',
      tag: 'createDitherLoop()',
      label:
        'Live demo: wavy 1-bit streak bands sweeping across the plate, every dot a single Bayer-thresholded pixel.',
    },
    file: 'src/lib/dither.ts',
    snippet: DITHER_SNIPPET,
  },
  {
    name: 'studio-field',
    role: 'the authentic Bayer family',
    body:
      'The GPU sibling of the CPU renderer above — the house Bayer looks themselves, codified. Ten variants live in one module as fragment shaders on a single session-singleton WebGL context, exported as the BAYER_PRESETS roster: slot 01 is the founder’s first-survey pick untouched, and the rest move along real axes — matrix order (2×2, 4×4, 8×8), cell scale from poster to near-grain, the tone field under the matrix (flow, contours, flank radials, sweeps, interference, breath), motion, and palette balance from ink-dominant to the one white-hot variant. Anything that shows or switches the family maps over that one list — the hero review rig and this plate included. Switching is a remount: programs compile lazily and cache for the session, destroy() keeps the shared context, so cycling never grows the context count.',
    demo: {
      kind: 'bayer',
      tag: '<StudioField preset={…} />',
      label:
        'Interactive demo: the ten authentic Bayer field variants on one plate — pick a numbered chip to remount the field with that preset.',
    },
    file: 'src/lib/studio-field.ts',
    snippet: STUDIO_SNIPPET,
  },
  {
    name: 'iso',
    role: 'the isometric drawing kit',
    body:
      'Every isometric illustration in the family goes through one 30° axonometric map — project(x, y, z) seats the camera at (+,+,+), so exactly three faces of any solid are visible, always lit in the same order from the upper left. A solid is extruded by recipe: an opaque hull from the rounded silhouette occludes whatever sits below, face fills shade it, then the hairlines — rim, top contour, and the interior front edges the silhouette does not already draw. Boxes are no longer the whole kit: IsoPrism extrudes any convex plan polygon with the same visibility and three-tone law, plane(z) is the exported matrix that seats whole flat drawings — glyph strokes, masked brand marks — into any surface, markPath() lays rounded bars in a face, and DitheredMark renders a logo as masked ink with the Bayer-quantized shimmer the tower’s capstone wears. Thickness runs about four percent of footprint, one corner radius serves the whole family, and every drawing spends its accent on exactly one element.',
    demo: {
      kind: 'iso',
      tag: 'project(x, y, z)',
      label:
        'A raised isometric plate drawn with the kit: an extruded slab carrying two box chips and one hexagonal prism, faces lit from the upper left, hairline rim and front edges.',
    },
    file: 'src/app/d/toolchain/diagrams/iso.ts',
    snippet: ISO_SNIPPET,
  },
  {
    name: 'doubled-line',
    role: 'the two-thread diagram stroke',
    body:
      'The brand’s connector is one SVG path stroked twice: a full-gauge ink stroke underneath and a narrower surface-colored core on top, carving the ink into two parallel hairline threads at a constant gap along any curve. Because both strokes share one geometry the gap cannot drift on a bend, and non-scaling-stroke holds the gauge in screen pixels even under a stretched viewBox. Now a component: DoubledLine takes the center path, the carving surface, the gauges, and a pulse slot — and it two-tones the pair, one white thread and one gray, by clipping the white copy to a half-plane closed along the same geometry, so the split seam hides inside the carve on every bend (offset clones collapse on curves; concentric restrokes can only make symmetric rings). Draw a later one over an earlier one and the junction re-carves itself into one clean pair: merges cost zero parallel-curve math. This is also the one sanctioned double — one owner, one path, stroked twice; the auditor’s allow list holds it by name.',
    demo: {
      kind: 'threads',
      tag: '<DoubledLine />',
      label:
        'Two doubled-line connectors merging into one trunk: each pair one white thread over one gray, with a static accent pulse carved into the trunk.',
    },
    file: 'src/components/shared/diagrams/DoubledLine.tsx',
    snippet: THREADS_SNIPPET,
  },
  {
    name: 'edge-globe',
    role: 'the delivery drawing',
    body:
      'The translation CDN as an orthographic globe, drawn entirely in ink: front graticule arcs at the family’s regular weight, far arcs as dashed hairlines — depth said once, with ink, no fills and no shading. Five points of presence stand on graticule intersections with corner-routed leaders that never cross; one bowed great-circle route from the user to the answering PoP is the drawing’s single accent, and one GSAP loop rides it — request dot out, arrival ring, payload chip back. Behind it the dossier home seats a static Bayer atmosphere: four non-overlapping annuli filled with nested coverage tiers of the ordered matrix on one shared grid, so crossing a ring boundary only ever turns dots off and no cell is painted twice.',
    demo: {
      kind: 'globe',
      tag: '<EdgeGlobe />',
      label:
        'Live demo: the orthographic edge globe — five points of presence, one accent route serving a request — over its dithered Bayer atmosphere.',
    },
    file: 'src/app/d/toolchain/diagrams/EdgeGlobe.tsx',
    snippet: GLOBE_SNIPPET,
  },
  {
    name: 'locale-tag',
    role: 'the locale pill',
    body:
      'Every bare locale code on every page renders through one component: flag first — a fixed 15×11 print from an SVG flag pack, corners barely eased, never a shadow — then the code in the host surface’s own mono, seated on the text baseline with the flag centered against it. The component carries no box of its own; hosts supply the chip — the hairline pill on light surfaces, the translucent-bordered terminal pill on dark — so the same tag drops into ledgers, capability marquees, diagram key columns and the infinite locale belt. Explicit region subtags fly their own flag (en-GB, ar-EG), bases resolve through a twenty-language map, and an unknown locale degrades to a flagless code rather than a wrong flag.',
    demo: {
      kind: 'pills',
      tag: "<LocaleTag code='…' />",
      label:
        'Live demo: a row of locale pills — flag chips beside mono locale codes in hairline boxes — as they appear in terminal transcripts and ledgers.',
    },
    file: 'src/app/d/toolchain/components/LocaleTag.tsx',
    snippet: PILLS_SNIPPET,
  },
  {
    name: 'reveal-seam',
    role: 'the slide-to-reveal instrument',
    body:
      'A hundred-line dependency-free slider that drags one CSS custom property, --seam-cut, onto a host box; the top layer clips to it, so the underlayer is revealed in place and content never travels a pixel with the handle. State lives in the CSS var rather than React state — drags cause zero re-renders, GSAP intros and cinema beat scrubs drive the same dial by writing the var directly, and the keyboard path re-reads the live computed value so every writer stays in agreement. The handle is the brand’s doubled line in the dossier refit — two solid threads at the house gap, the run between them filled with the payload’s own ink, bridged by a rectangular grip tab on a 64px hitbox — with a full slider role, arrow-key nudges, and a statically parked cut under reduced motion.',
    demo: {
      kind: 'seam',
      tag: '<RevealSeam />',
      label:
        'Interactive demo: drag or arrow-key the seam handle to reveal the served translation payload beneath the rendered string.',
    },
    file: 'src/app/d/toolchain/sections/RevealSeam.tsx',
    snippet: SEAM_SNIPPET,
  },
  {
    name: 'glyph-reassembler',
    role: 'the sentence-rewriting morph',
    body:
      'Now a component: EverySentence owns the dossier hero’s headline engine. One shaped sentence morphs between locales by dissolving into 440 canvas-drawn glyph motes seated on the outgoing text’s own sampled ink, dispersing into a cloud, then reassembling: every glyph flies to exactly one point sampled on a brick lattice and the real text node prints through the settled swarm behind a hard clip front that absorbs each glyph as it passes, mirrored for RTL. It never runs on a timer — the host owns the one clock through a ref handle’s setLocale. Requests debounce a quarter second; one landing mid-dissolve retargets the form boundary, one landing mid-form kills the timeline and re-dissolves, and a same-text locale change retags lang and dir only. Width follows the moving-type law: one shaped probe measure per word, cached, device-pixel snapped, tweened once per cycle. The dossier hero drives it from the locale belt; the plate below drives the same handle from a plain interval.',
    demo: {
      kind: 'reassembler',
      tag: '<EverySentence />',
      label:
        'Live demo: one shaped sentence dissolving into glyph dust and reassembling in the next language, measuring guides bracketing the shaped width.',
    },
    file: 'src/components/shared/EverySentence.tsx',
    snippet: REASSEMBLER_SNIPPET,
  },
  {
    name: 'four-color',
    role: 'the palette everything resolves from',
    body:
      'Not an engine — the ground the engines stand on. Four absolute colors: ink, raised ink, titanium, paper. Structural color everywhere derives from these — every text step is ink or white at some alpha, every hairline is titanium at some alpha, every hatch is a thin ink or white veil — and each page adds exactly one spectral accent on top. Pages never touch the raw values: each root class publishes a semantic layer (surfaces, ink steps, hairlines, hatch), and dark mode is a pure custom-property remap in which the paper family collapses onto ink, ink flips to white, and hairline alphas rise so a 1px seam still survives between two ink surfaces.',
    file: 'src/app/globals.css',
    snippet: COLOR_SNIPPET,
  },
] as const;
