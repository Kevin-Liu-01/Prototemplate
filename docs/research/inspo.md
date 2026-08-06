# Inspiration Dossier: Black & White & Metallic Redesign
### For a developer-tools marketing site — grounded in the founder's X-bookmark taste signals

**Taste signals from bookmarks (design north star):** shader-driven animated gradients, grain/noise over everything ("grainient" aesthetic), bento grids for features, flawless flow/page transitions, "alive through interaction," craft-level scroll hygiene (`overscroll-behavior: contain`), premium hero backgrounds as a differentiator, occasional bold accent pop against a restrained base, loading micro-animations as delight.

**Thesis:** The winning combination here is *Swiss editorial discipline* (Obys/Locomotive) + *Vercel/Linear systematic restraint* + *chrome/liquid-metal texture as the single indulgence*. Black and white is the system; metal is the personality. Grain is the glue that makes flat monochrome feel physical.

---

## 1. Ranked Reference Sites — what to steal from each

### Tier S — study frame-by-frame

**1. Linear (linear.app)** — The benchmark for dev-tool marketing.
- *Steal:* Inter Variable with `font-feature-settings: 'cv01' on, 'ss03' on, 'zero' on` — alternate glyphs ARE the brand. Display weight 600 vs body 400, aggressive negative letter-spacing on display sizes only (−0.02em to −0.045em). Near-black (#08090a-ish) instead of pure black; text at multiple alpha levels of white rather than grays. 1024px content grid, denser than Stripe's. Product UI screenshots as the protagonist of every section, framed in subtle 1px borders with inner glow.
- *Lesson:* "Expensive without ostentatious." Every gradient is barely there; contrast does the work.

**2. Vercel (vercel.com)** — The "blueprint grid" originator.
- *Steal:* Faint line/dot grid behind content (`linear-gradient` lines or `radial-gradient` dots at 5–10% opacity, 16–24px `background-size`). Geist Sans + Geist Mono pairing — mono for labels, numbers, eyebrows gives instant engineer credibility. Pure black hero with a single luminous element (their rainbow triangle → ours becomes a chrome object). Bento-style feature cards with 1px `#333` borders on #000.
- *Lesson:* Monochrome + one engineered light source = premium. The grid background says "we are precise" without a word of copy.

**3. Lusion (lusion.co)** — Awwwards Site of the Year caliber; the "alive" benchmark.
- *Steal:* Everything responds to the cursor — fluid distortion trails, magnetic hovers, inertia. Real-time interactivity as brand proof ("we make cool things" demonstrated, not claimed). Loading sequence as theater. Seamless page transitions where elements morph rather than cut.
- *Lesson:* Their genius is *restraint around chaos*: wild WebGL sits inside calm typographic scaffolding. Copy stays legible; the toy never blocks the message. Replicate the *feel* with canvas gradients + CSS, not three.js.

**4. Obys Agency (obys.agency)** — Typography-first Swiss digital editorial.
- *Steal:* "Structure is emotional." Websites as editorial publications: dense visual sections deliberately alternate with calm, readable text blocks — pacing like a magazine. Huge serif/grotesk contrast moments. Grid lines occasionally made *visible* as a design element. Whitespace used as "silence between strong statements." Break the grid only where you understand it.
- *Lesson:* In pure B/W, rhythm replaces color as the primary emotional tool. Plan the scroll like a film edit: loud, quiet, loud.

### Tier A — direct pattern sources

**5. David Haz (davidhaz.com)** — Creative developer portfolio, the liquid-chrome poster child.
- *Steal:* Full liquid-metal/glass hero effect over a monochrome base; chrome blobs that respond to pointer. Proof that a single spectacular metallic material carries an entire site when everything else is quiet. Mono type + metal material = complete identity.
- *Lesson:* Pick ONE hero material and make it flawless rather than sprinkling effects everywhere.

**6. Zajno (zajno.com)** — Motion-craft studio.
- *Steal:* Text that assembles on scroll (staggered line-mask reveals, chars sliding from baseline with `clip-path`/overflow masks). Custom easing everywhere — nothing uses default `ease`. Distorted-on-drag imagery. Their transitions "flow" — the bookmarked "coolest flow transition" energy: outgoing page elements hand off to incoming ones.
- *Lesson:* Motion identity = one signature easing curve + one signature reveal, applied with total consistency.

**7. Locomotive (locomotive.ca)** — Inventors of locomotive-scroll; Montreal agency.
- *Steal:* Buttery smooth-scroll with parallax layers moving at different speeds; sticky sections that pin and release with precision; oversized display type cropped by the viewport edge (type as architecture). B/W-heavy palette with photography as texture.
- *Lesson:* Scroll *feel* is a brand asset. Lerp-smoothed scroll (or CSS `scroll-timeline`) + differential parallax makes a flat page feel dimensional — no 3D needed.

**8. basement.studio** — "We make cool shit that performs."
- *Steal:* Brutalist B/W + chrome/metal 3D objects; monospace labels, ALL-CAPS eyebrows, barcode/registration-mark motifs (crop marks, ®, coordinates) that give an industrial print feel on screen. Occasional acid accent against black.
- *Lesson:* The "print shop artifacts" trick — crop marks, mono metadata labels (`[001]`, `EST. 2024`, lat/long) — instantly reads as *designed* and costs nothing. Perfect for dev-tool credibility.

**9. Active Theory (activetheory.net)** — WebGL heavyweight (Grid layout + portal transitions).
- *Steal:* Particle/point-cloud renditions of imagery in grayscale; instant-feeling page transitions through a shared WebGL canvas that persists across routes; HUD-like UI chrome (thin lines, corner brackets, tiny mono type).
- *Lesson:* Persistent background canvas across route changes = the "app-like" seamlessness that made their sites famous. Doable with a fixed `<canvas>` + View Transitions API now.

**10. Unseen Studio (unseen.co)** — Award-winning WebGL studio.
- *Steal:* Signature "reveal on hover" fluid simulations inside otherwise strict typographic layouts; dark monochrome with metallic sheen materials; scroll-driven shader distortion of type itself.
- *Lesson:* Type-as-material: letters that ripple, smear, or reflect light turn the wordmark into the product demo. Approximate with animated `background-clip: text` chrome + SVG displacement filters.

**11. Aristide Benoist (aristidebenoist.com)** — SOTM June 2021; dev portfolio royalty.
- *Steal:* The gold standard for *page transitions*: clicked list item morphs into the project hero (shared-element continuity); everything else is stark B/W type on white/black. Cursor-following micro-distortion on links.
- *Lesson:* One perfect shared-element transition beats fifty hover effects. Now achievable natively with the View Transitions API — a dev-tools company using cutting-edge platform APIs *is itself marketing*.

**12. Resn (resn.co.nz)** — NZ studio, playful interactive gloss.
- *Steal:* Liquid, glossy interactive objects; the discipline of a single "toy" per view that begs to be touched. Wit in microcopy paired with high-gloss visuals.
- *Lesson:* Interaction with *payoff* — the object reacts in a surprising, physical way (squish, ripple, shatter). "Alive through interaction" (the founder's bookmarked philosophy) means feedback in <100ms with physics-feeling easing.

**13. Chungi Yoo (chungiyoo.com)** — SOTD; art-director folio.
- *Steal:* Playful kinetic type on neutral background; images that swing/tilt with spring physics on scroll; generous air around every element.
- *Lesson:* Spring physics (overshoot, settle) makes monochrome feel warm and human instead of cold.

**14. Grainient / backgrounds.supply Gradient Lab / BentoGrids (bookmarked resources)**
- *Grainient sells:* 1,000+ grainy/mesh/animated gradients, "studio-grade 4K–12K, flawless blends" — the exact aesthetic: soft blurred color fields with fine photographic grain that kills banding and adds physicality. In B/W: silver-to-charcoal mesh gradients + grain = "brushed atmosphere."
- *Gradient Lab sells:* 20+ live shader modes (Mesh, Plasma, Aurora, Prism, Glass, Vortex, Marble, Halftone, Iridescent) with tunable warp/flow-speed/noise-scale/softness/brightness/contrast/grain, exportable as PNG/MP4/WebM. *Lesson:* animated shader gradients are now a commodity — differentiate by rendering ours live (canvas) in grayscale-chrome, not by shipping a looping video.
- *BentoGrids curates:* bento feature layouts — mixed-size cells, each cell one idea, one visual, 1px borders, consistent radius, hover states per cell. *Rule:* the bento is a hierarchy device, not a mosaic — one 2×2 hero cell, a few 1×1 satellites, never more than ~7 cells per grid.

---

## 2. Technique Cookbook — metallic/chrome in pure CSS/JS (no WebGL libraries)

### 2.1 Chrome text (conic-gradient, animated sheen)
```css
.chrome-text {
  background: conic-gradient(
    from 210deg at 50% 50%,
    #4a4a4a 0deg, #f5f5f5 40deg, #8a8a8a 85deg,
    #fdfdfd 120deg, #5c5c5c 180deg, #e8e8e8 220deg,
    #767676 275deg, #ffffff 320deg, #4a4a4a 360deg
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
```
Conic stops alternating dark/light around the center mimic environment reflections. Works best on heavy weights (700+) at display sizes.

### 2.2 Silver-foil headline (animated gradient position)
```css
.foil {
  background: linear-gradient(
    110deg,
    #6d6d6d 0%, #e9e9e9 18%, #ffffff 26%, #b0b0b0 38%,
    #7c7c7c 50%, #d9d9d9 62%, #ffffff 74%, #8f8f8f 88%, #6d6d6d 100%
  );
  background-size: 220% 100%;
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: foil-slide 6s ease-in-out infinite;
}
@keyframes foil-slide {
  0%, 100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
```
The classic gold-foil recipe (bf953f/fcf6ba/…) desaturated to silver. Slow the animation (5–8s) — fast shimmer reads as cheap.

### 2.3 Brushed steel panel (layered linear-gradients + repeating hairlines)
```css
.brushed {
  background:
    /* hairline "brush" striations */
    repeating-linear-gradient(90deg,
      rgba(255,255,255,0.05) 0 1px, rgba(0,0,0,0.06) 1px 2px, transparent 2px 4px),
    /* soft specular band */
    linear-gradient(180deg, #cfcfcf 0%, #f4f4f4 22%, #b5b5b5 48%, #dcdcdc 55%, #9e9e9e 100%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.65),  /* top bevel catch-light */
    inset 0 -1px 0 rgba(0,0,0,0.35),        /* bottom bevel shadow */
    0 12px 32px rgba(0,0,0,0.35);
}
```
"A gradient with a lot of stops" alternating light/dark is the core metal illusion (ibelick). Hairlines sell the *brushed* finish.

### 2.4 Metallic button (ibelick recipe, tuned for B/W)
```css
.btn-metal {
  color: #000; border: none; border-radius: 10px;
  background: linear-gradient(45deg,
    #999 5%, #fff 10%, #ccc 30%, #ddd 50%, #ccc 70%, #fff 80%, #999 95%);
  text-shadow: 0 1px 1px rgba(255,255,255,0.5);
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  transition: transform .2s ease, box-shadow .2s ease;
}
.btn-metal:hover { transform: translateY(-2px); box-shadow: 0 6px 14px rgba(0,0,0,.35); }
```

### 2.5 Sheen sweep on hover (card shine)
```css
.card { position: relative; overflow: hidden;
  background: linear-gradient(to bottom, #141414, #1d1d1d 50%, #101010); }
.card::after {
  content: ''; position: absolute; inset: 0; transform: translateX(-120%) skewX(-18deg);
  background: linear-gradient(30deg,
    transparent 35%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.28) 54%, transparent 68%);
  transition: transform .8s cubic-bezier(.22,1,.36,1);
  pointer-events: none;
}
.card:hover::after { transform: translateX(120%) skewX(-18deg); }
```

### 2.6 Film grain overlay — SVG feTurbulence data-URI (the grainient look)
```css
.grain::before {
  content: ''; position: fixed; inset: -50%;
  width: 200%; height: 200%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.06;                 /* 0.04 subtle … 0.12 heavy   */
  mix-blend-mode: overlay;       /* or soft-light on dark bases */
  pointer-events: none;
  animation: grain-shift 0.6s steps(4) infinite;  /* optional living grain */
}
@keyframes grain-shift {
  0% { transform: translate(0,0); } 25% { transform: translate(-2%,3%); }
  50% { transform: translate(3%,-2%); } 75% { transform: translate(-3%,-3%); }
  100% { transform: translate(0,0); }
}
```
Rules of thumb: `baseFrequency` lower = larger grain, higher = finer; `feColorMatrix saturate 0` keeps grain neutral for B/W; grain also eliminates gradient banding — put it over every large gradient.

### 2.7 Grainy silver mesh hero (contrast-boost trick from CSS-Tricks "Grainy Gradients")
Layer noise *under* a gradient and crush it with filter contrast for chunky analog texture:
```css
.hero-grainy {
  background:
    radial-gradient(60% 80% at 70% 20%, rgba(255,255,255,0.22), transparent 60%),
    radial-gradient(50% 60% at 20% 80%, rgba(255,255,255,0.10), transparent 60%),
    url("data:image/svg+xml,...feTurbulence baseFrequency='0.65'..."),
    #0a0a0a;
  filter: contrast(140%) brightness(95%);
}
```

### 2.8 Metallic border (border-image or padded-gradient wrapper)
```css
/* Method A: border-image */
.metal-frame {
  border: 2px solid transparent;
  border-image: linear-gradient(135deg, #f7f7f7, #6f6f6f 30%, #fdfdfd 50%, #5a5a5a 72%, #eaeaea) 1;
}
/* Method B (rounded corners work): gradient wrapper */
.metal-frame-rounded {
  position: relative; border-radius: 14px; background: #0c0c0c;
}
.metal-frame-rounded::before {
  content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1.5px;
  background: conic-gradient(from 140deg, #777, #fff 25%, #555 50%, #eee 75%, #777);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  pointer-events: none;
}
```
Animate the conic `from` angle via `@property --angle` for a rotating chrome rim on hover.

### 2.9 Embossed / debossed (dual shadow)
```css
.embossed { /* raised, on #111 surface */
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08),
              0 1px 2px rgba(0,0,0,0.8);
}
.debossed { /* pressed-in well, great for inputs / code blocks */
  background: #0d0d0d;
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.7),
              inset 0 -1px 0 rgba(255,255,255,0.05);
}
.letterpress-text { color: #1a1a1a; text-shadow: 0 1px 0 rgba(255,255,255,0.12); }
```

### 2.10 Liquid-metal blob (CSS-only gooey filter)
```css
.goo-wrap { filter: contrast(22) blur(0px); background:#000; } /* container crushes alpha */
.goo-wrap .blob {
  width: 180px; aspect-ratio: 1; border-radius: 50%;
  background: radial-gradient(circle at 32% 28%, #fff 0%, #bdbdbd 22%, #4d4d4d 58%, #161616 100%);
  filter: blur(18px);
  animation: drift 9s ease-in-out infinite alternate;
}
```
Two+ blurred blobs inside a high-contrast container fuse like mercury when they approach. Add a small white radial "specular dot" pseudo-element that lags the pointer (JS lerp) for reflective life.

### 2.11 Iridescent sheen on hover (grayscale-safe)
```css
.holo:hover::before {
  content:''; position:absolute; inset:0;
  background: linear-gradient(125deg, #fff, #9aa7b8, #d8cfe8, #b8c8c0, #fff);
  background-size: 300% 300%;
  mix-blend-mode: color-dodge;   /* on dark metal */
  opacity: .35;
  animation: iridescent 4s ease infinite;
}
@keyframes iridescent { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
```
Keep the hue whisper-subtle (desaturated lavender/steel-blue) — a hint of oil-slick on silver, honoring the "occasional pop" bookmark signal without breaking monochrome.

### 2.12 Pointer-reactive specular highlight (JS + custom properties)
```js
card.addEventListener('pointermove', (e) => {
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
  card.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
});
```
```css
.card {
  background:
    radial-gradient(400px circle at var(--mx,50%) var(--my,50%),
      rgba(255,255,255,0.10), transparent 55%),
    #101010;
  border: 1px solid transparent;
  background-clip: padding-box;
}
```
This is the Linear/Vercel "spotlight card." Do the same on a conic border for light-following chrome rims. Lerp the values (`current += (target-current)*0.08` in rAF) so the highlight has inertia — that lag is what reads as "alive."

### 2.13 Canvas shader-like animated gradient (no WebGL — the Gradient Lab look)
```js
const ctx = canvas.getContext('2d');
let t = 0;
function frame() {
  t += 0.004;                                  // slow = expensive
  const { width: w, height: h } = canvas;
  ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {                // 3 drifting silver orbs
    const x = w * (0.5 + 0.38 * Math.sin(t * (0.7 + i * 0.31) + i * 2.1));
    const y = h * (0.5 + 0.34 * Math.cos(t * (0.9 + i * 0.23) + i * 1.4));
    const g = ctx.createRadialGradient(x, y, 0, x, y, w * 0.42);
    g.addColorStop(0, `rgba(220,220,225,${0.16 - i * 0.04})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }
  ctx.globalCompositeOperation = 'source-over';
  requestAnimationFrame(frame);
}
```
Render at half resolution and upscale with `canvas { filter: blur(40px) contrast(115%); }`, then lay the grain overlay (2.6) on top → indistinguishable from a fragment-shader mesh gradient at a fraction of the cost. Pause via `IntersectionObserver` when offscreen; respect `prefers-reduced-motion`.

### 2.14 Scroll-driven chrome (bonus, zero-JS)
`animation-timeline: scroll()` / `view()` now lets the foil `background-position` (2.2) or the conic border angle (2.8) advance with scroll — light moves across the metal as you read. Progressive enhancement; static fallback is already good.

---

## 3. Composition & Typography Lessons for Premium Monochrome

### Type scale
- Use a **two-ratio system**: Major Third (1.25) for UI/body ranks, then jump-cut to display sizes at Perfect Fifth/Golden-ratio leaps (1.5–1.618). Premium sites don't glide smoothly from 16px to 96px — they *jump*. Body 16–18px → h3 ~24 → h2 ~32 → then hero at 72–140px (clamp: `clamp(3rem, 8vw, 9rem)`).
- **Letter-spacing is size-dependent:** −0.02 to −0.05em on display, 0 on body, +0.08 to +0.12em on ALL-CAPS mono eyebrows. This three-way contrast is 80% of the "Linear look."
- **Line-height inverts with size:** 0.95–1.05 display, 1.5–1.6 body, 1.4 mono captions.
- **Pair one grotesk + one mono.** (Inter/Geist/Söhne + Geist Mono/JetBrains Mono/Fragment Mono.) Mono carries: eyebrows, stats, timestamps, index numbers `[01]`, code. Optional third voice: a single serif or display cut used exactly once (manifesto moment) — the Obys move.
- Enable alternates: `font-feature-settings: 'ss03' on, 'cv01' on, 'zero' on;` — slashed zeros and alt glyphs are free brand equity for a dev tool.

### Color system (yes, monochrome needs one)
- Never pure #000 on pure #fff for long text. Base surface #0a0a0a–#101010; text = white at alphas: 92% primary, 64% secondary, 40% tertiary, 24% disabled/hairlines. Alpha-based grays stay harmonious over gradients.
- Reserve **pure #fff for metal highlights only** — it's the brightest thing on the page, so it reads as light, not paper.
- 1px hairlines everywhere at rgba(255,255,255,0.08–0.14); they replace drop shadows as the separation tool on dark.

### Grid & spacing
- 12-col, ~1120–1280px max container, generous gutters (24–32px). Vercel's faint blueprint grid can be literal background.
- **Spacing scale on 8px base with big-jump section rhythm:** within components 8/12/16/24; between blocks 48/64; between sections 128–192px. Whitespace *between sections* is the number-one premium signal — average sites use 64px, AAA sites use 160px+.
- **Bento rules:** max ~7 cells, one dominant 2×2, uniform 1px borders + radius (12–16px), one idea per cell, every cell has a hover state (spotlight 2.12 or sheen 2.5). Cell padding ≥ 24px.
- **Editorial pacing (Obys):** alternate dense/loud sections (bento, chrome hero, marquee type) with quiet ones (single centered paragraph, small mono label, lots of air). "Silence between strong statements."
- Let display type **touch or crop at viewport edges** occasionally (Locomotive) — type as architecture, not paragraphs.
- Asymmetry: place hero copy on a 5/12–7/12 split rather than centered; center only the manifesto moments.

### Motion system
- One signature easing (e.g. `cubic-bezier(.22,1,.36,1)` — "ease-out-quint-ish") + one signature reveal (line-masked text sliding up 110%→0 with 60–90ms stagger). Apply everywhere. Consistency > variety.
- Durations: micro-interactions 150–250ms; reveals 600–900ms; ambient loops 6–12s. Nothing bounces unless spring physics is the brand (Chungi Yoo).
- Page transitions via View Transitions API: shared-element morphs (Aristide Benoist pattern) — the nav wordmark and hero persist while content crossfades/slides.
- Scroll hygiene: `overscroll-behavior: contain` on modals/drawers (the bookmarked tip), `scrollbar-gutter: stable`, no scroll-jacking — scroll *speed* belongs to the user; only *bind animations to scroll position*, never override it.
- `prefers-reduced-motion`: swap ambient canvas for a static grainy gradient poster frame.

---

## 4. What Separates AAA From Average — opinionated

1. **A single, obsessively-finished signature vs. many mediocre effects.** Lusion has fluid distortion; Unseen has hover reveals; David Haz has liquid chrome; Aristide has one perfect transition. Average sites bolt on tilt-cards, particles, AND typewriters. Pick one material (chrome) and one motion signature; cut everything else.
2. **Texture kills flatness.** Average dark sites are flat #000 with gray cards — they look like unstyled Tailwind. AAA dark sites have *atmosphere*: grain, faint gradients, hairlines, blueprint grids, vignettes. There is no empty black; there is *deep space with dust in it*.
3. **The light source is consistent.** Real metal implies a physical environment. AAA sites decide "light comes from top-left" and every bevel, sheen sweep, specular highlight, and shadow obeys. Average sites have gradients pointing in random directions — subliminally fake.
4. **Interaction latency and inertia.** "Alive" = responds within a frame but settles with lag/physics (lerped cursor followers, magnetic buttons, springs). Average sites use `transition: all .3s ease` on hover and call it done. The *feel* of weight is the entire trick.
5. **Typographic conviction.** AAA sites commit: 9rem headline, cropped by the fold, tracking −4%. Average sites hedge at 48px centered with default tracking. In monochrome there is nowhere to hide — scale contrast IS the color.
6. **Space as confidence.** 160px+ section gaps say "we don't need to shout." Cramped sections scream template. Whitespace is the cheapest luxury upgrade in existence.
7. **Details in the margins:** mono index numbers, crop marks, slashed zeros, live local time in the footer, custom selection color (`::selection { background:#fff; color:#000; }`), styled focus rings, a designed 404. Visitors may not name them but they *feel* the sum. This is basement.studio's whole schtick.
8. **Loading and empty states are designed** (bookmarked spinner-inspiration signal): a chrome shimmer skeleton or counting-up preloader instead of a spinner default. First 500ms sets the quality prior for everything after.
9. **Performance is aesthetic.** Awwwards-level judges *dock* jank. Canvas at half-res, `content-visibility`, transform/opacity-only animation, paused offscreen loops. A 60fps plain site outranks a 24fps spectacular one. For a dev-tools audience this is doubly true — jank is a product-quality signal.
10. **The site demonstrates the product's values.** Linear's site feels fast because the product is fast. For a dev-tools company: use bleeding-edge platform features (View Transitions, scroll-timeline, `@property`) and let the site itself be the engineering flex. Copy claims nothing the pixels don't prove.

### Concrete build recipe for this redesign
- Surface #0a0a0a, alpha-white text ramp, hairline borders, blueprint dot-grid at 6% in section backgrounds.
- Hero: canvas silver mesh gradient (2.13) + grain overlay (2.6) + one massive foil-clipped headline (2.2) + chrome-rim CTA (2.8 animated).
- Features: bento grid, spotlight-hover cells (2.12), one 2×2 cell with product screenshot in an embossed chrome frame.
- Type: Grotesk display (clamp to 9rem, −0.04em) + mono eyebrows; line-mask staggered reveals; View Transition page morphs.
- One iridescent whisper (2.11) on the primary CTA hover as the only "color."

---

## Sources
- ibelick — Creating a metallic effect with CSS: https://ibelick.com/blog/creating-metallic-effect-with-css
- Effect Labs — CSS Holographic/Iridescent/Chrome: https://effect-labs.com/en/pages/blog/effet-holographique-css.html
- CSS-Tricks — Grainy Gradients: https://css-tricks.com/grainy-gradients/
- freeCodeCamp — Grainy CSS backgrounds with SVG filters: https://www.freecodecamp.org/news/grainy-css-backgrounds-using-svg-filters/
- Codrops — feTurbulence texture: https://tympanus.net/codrops/2019/02/19/svg-filter-effects-creating-texture-with-feturbulence/
- Codrops — Obys studio profile: https://tympanus.net/codrops/2026/03/06/obys-the-small-studio-designing-big-digital-narratives/
- Setproduct — Vercel Blueprint Grid guide: https://www.setproduct.com/blog/complete-guide-to-blueprint-grid-design
- VoltAgent — linear.app DESIGN.md teardown: https://github.com/voltagent/awesome-design-md/blob/main/design-md/linear.app/DESIGN.md
- LogRocket — "Linear design" trend: https://blog.logrocket.com/ux-design/linear-design/
- Awwwards — Aristide Benoist SOTM: https://www.awwwards.com/aristide-benoist-portfolio-2021-wins-site-of-the-month-june-2021.html
- Grainient: https://grainient.supply · Gradient Lab: https://backgrounds.supply/gradient-lab · BentoGrids: https://bentogrids.com
- Trend context: https://graphicdesignjunction.com/2025/12/10-top-visual-trends-for-2026/ · https://elements.envato.com/learn/web-design-trends · https://qodeinteractive.com/magazine/captivating-examples-of-the-liquid-metal-effect-in-web-design/
- Type scale math: https://spencermortensen.com/articles/typographic-scale/ · https://grtcalculator.com/math/
