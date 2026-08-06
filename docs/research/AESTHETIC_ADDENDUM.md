# AESTHETIC ADDENDUM — canonical references from the founder (LAW, added mid-run)

The founder supplied two definitive references. Every sample is now judged against these FIRST.
"Black & white & metallic" means precisely this pairing:

## 1. The SLEEK METAL base — Resend's landing page (resend.com)

What it does and why it works — replicate the FEEL, never the layout or content:
- **Background is never flat black.** Deep near-black (#08-#0d range) washed with enormous, soft,
  silky light bands — like satin fabric or smoke catching light, sweeping diagonally/horizontally
  at very low contrast. The page feels dimensionally lit, not painted. (Implement: huge blurred
  gradient bands / subtle canvas noise-flow, 3-6% lightness variation, animated over ~20s.)
- **A machined dark-metal object** as the hero's visual anchor: their 3D Rubik's cube of
  brushed-black cubes — graphite/gunmetal surfaces, crisp specular EDGES (the metal reads through
  edge highlights and anisotropic sheen, not through gray fills). Some cube faces have a
  perforated/speaker-grille texture. For GT samples the equivalent anchor is the GT gate/ring and
  the flowing components — give them this machined-graphite materiality: dark faces, bright
  hairline edges, subtle brushed texture, occasional specular glint sweep.
- **Type does the luxury.** Huge quiet SERIF display ("Email for developers" energy) in warm
  white, tight leading, against small plain sans UI text. Muted secondary copy (~55% alpha).
- **Logo wall almost disappears**: customer logos at very low opacity (~25-35%), small, generously
  spaced — confidence through restraint.
- **One warm accent, once.** Resend permits a single amber/orange glow moment ("Integrate this
  afternoon" + glowing icon). Samples MAY use one warm or spectral accent moment per page —
  never more. The prismatic field (below) counts as this accent when strongly visible.
- **Nav is a compact floating pill/dock**, tiny text, pill CTA.
- Net effect: enormous negative space, low luminance, everything slightly reflective, nothing
  flat. "Expensive dark hardware" — that is the base.

## 2. The LIGHT — the prismatic burst (sabosugi "Enter to Other Dimension" shader; founder
   supplied two frames; codepen.io/sabosugi/pen/019fa3cf-2f37-771c-8735-81f31d1e7e0e)

Frame anatomy (what to reproduce):
- On pure black, two lobes of **iridescent streaked light enter from the left and right edges**,
  converging toward (but never filling) a DARK CENTER — or, variant 2, an arc/dome of rays
  radiating outward above a dark core. The darkness in the middle is the design: the light frames
  a void where content sits.
- The light is **anisotropic fine streaks** — thousands of thin filaments smeared radially
  (motion-blur feel), like brushed metal photographed under a prism. High-frequency grain, no
  smooth airbrush gradients.
- **Color = thin-film/diffraction spectrum, desaturated and deepened**: steel blues, violets,
  golds, sea-greens, pink highlights — oil-slick on black, NOT neon, NOT candy. Brightness comes
  from accumulation (additive) where streaks bunch, fading fast into black.
- Motion (from the video): slow continuous flow along the streak direction, gentle shimmer;
  reads as drifting through a light-field at speed.

**CANONICAL IMPLEMENTATION — USE THIS: `../vendor/prismatic-field.js`** (already in the vendor
directory next to gsap/lenis). It is a verified, dependency-free raw-WebGL port of the founder's
EXACT shader (GLSL preserved verbatim from the CodePen source the founder supplied) — tested to
render identically to the reference frames. Do NOT hand-roll an approximation when you can use
the real thing.

Usage:
```html
<canvas id="field" style="position:fixed;inset:0;width:100vw;height:100vh;"></canvas>
<script src="../vendor/prismatic-field.js"></script>
<script>
  const field = createPrismaticField(document.getElementById('field'), {
    preset: '1',              // '1' = wide horizontal burst; '2' = arc/dome over dark core
    dpr: 1,                   // keep <=1 for perf; the soft upscale IS the look
    speed: 1,                 // slow it (0.3-0.6) for ambient backgrounds
    params: { exposureScale: 2000 }  // RAISE (e.g. 3500-6000) to DIM the field under content
  });
  if (!field) { /* keep a dark CSS gradient fallback on the canvas's parent */ }
  // API: field.setParams({exposureScale: 4000}), field.pause(), field.resume(), field.destroy()
</script>
```
Craft notes: dim it under text via `params.exposureScale` (higher = darker) and/or a black
overlay gradient; pause it when offscreen (IntersectionObserver → field.pause()/resume());
GSAP can tween params on scroll, e.g. `gsap.to(proxy, {exposure: 6000, onUpdate: () =>
field.setParams({exposureScale: proxy.exposure})})` to make the field flare or recede at story
moments. It respects prefers-reduced-motion automatically (static frame). Returns null without
WebGL — always keep a plain dark background behind the canvas. Light-dominant directions may
still use it inside dark inset panels (the window's night-mode moments, the closing CTA band)
or crop it as a thin foil band; do not put it under paper-white sections.
The original CodePen source is archived at research/prismatic-codepen-original.html for uniform
ranges (GUI bounds) if you need to push parameters further.

## 2b. COMPOSE AROUND THE SHADER — the principle that makes the hero work

The founder identified precisely why the original `02-concrete-mono` hero succeeds where later,
busier attempts did not: **everything is aligned to the gradient and centered on the shader.**
The prismatic field is not a background the layout sits on top of — it is the composition's
armature. Every element is placed by its relationship to the light.

Concretely, in a hero built this way:
- The **GT gate sits exactly on the shader's convergence point**, on both axes. The burst's dark
  center and the mark are the same point; a viewer reads one object, not two.
- **The burst's horizontal axis is the layout's baseline.** Component pairs fan outward along it,
  English to the left and their translations mirrored to the right at matching offsets, so the
  scatter reads as light dispersing rather than as cards randomly placed.
- The **headline anchors to the burst's lower edge**, its top aligned where the light falls off,
  which is what lets it sit low-left without looking dropped there.
- **Vertical and horizontal crosshair rules pass through the convergence point**, making the
  alignment explicit and framing the composition like a viewfinder.
- Density falls off with distance from the axis: elements near the light are brighter and more
  present, those far from it recede.

The failure mode to avoid: a strong shader with a conventional page layout floating over it. Two
unrelated systems competing. When in doubt, move the content to the light rather than moving the
light behind the content.

## 3. How they combine (the actual mandate)
Resend's machined-dark-sleekness is the AMBIENT state of the page; the prismatic burst is the
ENERGY that appears at meaning-charged moments — the hero gate (light disperses through the GT
ring exactly like the reference frames: dark center = the ring/void, spectrum streaming out the
sides), section transitions, the Locadex merge moment. Light-dominant directions translate this
as: paper base, graphite-metal objects, and the prismatic spectrum appearing as foil/sheen
accents. The critic should ask: "Does the ambient page feel like Resend's hardware-sleek dark
(or its paper equivalent), and does the light read as prismatic diffraction rather than a cheap
gradient?" If either answer is no, it is not passing.
