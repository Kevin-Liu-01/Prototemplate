# Motion-Design Cookbook — GSAP 3.13 + Lenis 1.3

Premium landing pages, black/white/metallic aesthetic, dev-tools company.

Vendored (all free as of GSAP 3.13 — every former Club plugin went free):
`gsap.min.js`, `ScrollTrigger.min.js`, `SplitText.min.js`, `ScrambleTextPlugin.min.js`,
`DrawSVGPlugin.min.js`, `lenis.min.js`.

Verified against: gsap.com 3.13 release notes + SplitText/ScrambleText docs, and the
darkroomengineering/lenis README (1.3.x).

---

## 0. Boot sequence (do this once, in this order)

```html
<script src="/vendor/gsap.min.js"></script>
<script src="/vendor/ScrollTrigger.min.js"></script>
<script src="/vendor/SplitText.min.js"></script>
<script src="/vendor/ScrambleTextPlugin.min.js"></script>
<script src="/vendor/DrawSVGPlugin.min.js"></script>
<script src="/vendor/lenis.min.js"></script>
<script src="/js/motion.js" defer></script>
```

```js
// motion.js
gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin);

gsap.defaults({ ease: 'power3.out', duration: 0.9 });
ScrollTrigger.config({ ignoreMobileResize: true }); // mobile URL-bar resize won't thrash refresh

// ---- Lenis, driven by GSAP's ticker (single rAF loop) ----
const lenis = new Lenis({
  autoRaf: false,       // REQUIRED when gsap.ticker drives it — never run two rAF loops
  lerp: 0.1,            // 0.08–0.12 = premium; lower = floatier, higher = tighter
  anchors: true,        // built-in smooth anchor-link handling (1.3+)
});
window.lenis = lenis;   // CONVENTION: instance MUST be exposed as window.lenis

lenis.on('scroll', ScrollTrigger.update);          // keep triggers in sync every scroll frame
gsap.ticker.add((time) => lenis.raf(time * 1000)); // gsap.ticker is seconds; lenis wants ms
gsap.ticker.lagSmoothing(0);                       // prevents catch-up jumps on tab refocus

// ---- Reduced motion gate: build ALL motion inside matchMedia ----
const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  initIntro();
  initScroll();
  initMicro();
  // return value cleanup is automatic per-context
});
mm.add('(prefers-reduced-motion: reduce)', () => {
  lenis.destroy();                                  // native instant scroll
  gsap.set('[data-reveal], [data-split]', { clearProps: 'all', autoAlpha: 1 });
});

// ---- Fonts before any SplitText that doesn't use autoSplit ----
document.fonts.ready.then(() => ScrollTrigger.refresh());
```

**Do NOT** use `ScrollTrigger.normalizeScroll(true)` or `scrollerProxy()` with Lenis.
Lenis animates *native* scroll, so ScrollTrigger reads the real `scrollY` — the ticker
sync above is the entire integration. `scrollerProxy` is a Locomotive-era pattern.

**FOUC guard** — never let un-animated content flash before JS runs:

```html
<html class="no-js"><script>document.documentElement.classList.replace('no-js','js')</script>
```
```css
.js [data-reveal] { visibility: hidden; }  /* GSAP reveals with autoAlpha (visibility+opacity) */
```
Then reveal with `autoAlpha: 1` (or `gsap.from(..., { autoAlpha: 0 })`, which sets
visibility back automatically). If JS fails, `.no-js` keeps everything visible.

**React/Next.js note** (landing app): same code inside `useGSAP(() => { ... }, { scope: ref })`
from `@gsap/react` — it wraps `gsap.context()` and reverts everything on unmount. Create
the Lenis instance once in a top-level layout component; still assign `window.lenis`.

---

## 1. Page-load choreography

### 1.1 Master intro timeline

One timeline owns the whole entrance; label-based offsets, not magic delays.

```js
function initIntro() {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.1 } });

  tl.from('.nav', { yPercent: -100, autoAlpha: 0, duration: 0.7 }, 0.1)
    .add(heroHeadline(), 0.25)      // returns the SplitText tween (1.2)
    .from('.hero-sub', { y: 24, autoAlpha: 0 }, 0.7)
    .from('.hero-cta', { y: 16, autoAlpha: 0, stagger: 0.08 }, 0.85)
    .fromTo('.hero-media', { clipPath: 'inset(100% 0 0 0)' },
            { clipPath: 'inset(0% 0 0 0)', duration: 1.3, ease: 'expo.inOut' }, 0.5);
  return tl;
}
```

Timing rules that read as "premium": entrance durations 0.7–1.3s, `expo.out` / `power4.out`
for reveals, `expo.inOut` for masks/wipes, total choreography under ~1.8s, and the
headline must start within ~300ms of paint. Never block interaction on the intro.

### 1.2 SplitText line reveal — the 3.13 way

3.13 rewrote SplitText. Use `SplitText.create()`, `mask`, `autoSplit`, and build the tween
inside `onSplit()` (it re-runs on font-load/resize re-splits; returning the animation lets
SplitText revert it and resume progress seamlessly).

```js
function heroHeadline() {
  return SplitText.create('.hero-h1', {
    type: 'lines',
    mask: 'lines',          // wraps each line in an overflow:hidden clip element
    autoSplit: true,        // re-splits on font load + width changes (ResizeObserver)
    linesClass: 'line',
    onSplit(self) {
      return gsap.from(self.lines, {
        yPercent: 110,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.09,
      });
    },
  });
}
```

Char-level variant (short headlines only — never split paragraphs into chars):

```js
SplitText.create('.kicker', {
  type: 'chars,words',
  smartWrap: true,          // avoids mid-word line breaks when splitting chars
  autoSplit: true,
  onSplit: (self) => gsap.from(self.chars, {
    yPercent: 60, autoAlpha: 0, duration: 0.6, ease: 'power3.out',
    stagger: { each: 0.02, from: 'start' },
  }),
});
```

CSS hygiene for split text (prevents 1px char shifts):

```css
.hero-h1 { font-kerning: none; text-rendering: optimizeSpeed; }
/* never use text-wrap: balance on split targets */
```

Accessibility is built in: 3.13 adds `aria-label` on the container and `aria-hidden`
on the fragments automatically (`aria: 'auto'`).

### 1.3 Clip-path mask reveals (images, panels, dividers)

`clip-path` animates on the compositor in modern browsers and beats `width` tweens.

```js
gsap.utils.toArray('[data-mask]').forEach((el) => {
  const from = { left: 'inset(0 100% 0 0)', right: 'inset(0 0 0 100%)',
                 up: 'inset(100% 0 0 0)',  down: 'inset(0 0 100% 0)' }[el.dataset.mask || 'up'];
  gsap.fromTo(el, { clipPath: from, autoAlpha: 1 },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut',
      scrollTrigger: { trigger: el, start: 'top 80%', once: true } });
});
```

Pair with a subtle inner counter-scale so the image feels like it slides under the mask:

```js
gsap.from(el.querySelector('img'), { scale: 1.25, duration: 1.2, ease: 'expo.inOut' });
```

### 1.4 Counter + scramble intros (dev-tools flavor)

Counter — tween a proxy object, `snap` to integers, format in `onUpdate`:

```js
gsap.utils.toArray('[data-count]').forEach((el) => {
  const end = parseFloat(el.dataset.count);
  const proxy = { v: 0 };
  gsap.to(proxy, {
    v: end, duration: 1.6, ease: 'power2.out', snap: { v: 1 },
    onUpdate: () => { el.textContent = proxy.v.toLocaleString('en-US'); },
    scrollTrigger: { trigger: el, start: 'top 85%', once: true },
  });
});
```

ScrambleText — defaults: `chars: 'upperCase'`, `tweenLength: true`, `speed: 1`,
`revealDelay: 0`. Terminal-flavored charset sells the dev-tools aesthetic:

```js
gsap.to('.hero-kicker', {
  duration: 1.1,
  scrambleText: { text: 'BUILT FOR PROD', chars: '01<>_/\\', revealDelay: 0.25, speed: 0.4 },
});
// word-by-word reveal for longer strings: add delimiter: ' '
```

Keep scramble to kickers/labels/stat tickers. Scrambling the H1 reads as gimmick.

---

## 2. Scroll-driven patterns

### 2.1 Pinned section with a scrubbed timeline (the workhorse)

```js
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.feature-pin',
    start: 'top top',
    end: '+=250%',          // pin distance = 2.5 viewport heights of scroll
    pin: true,
    scrub: 1,               // 1s catch-up; scrub:true = rigid, 0.5–1.5 = buttery
    anticipatePin: 1,       // pre-applies pin a frame early — kills the pin "jump"
    invalidateOnRefresh: true,
    // markers: true,       // dev only — NEVER ship markers
  },
  defaults: { ease: 'none' },   // scrubbed timelines want linear; scrub supplies the easing
});

tl.from('.feature-visual', { scale: 0.8, autoAlpha: 0 })
  .to('.feature-step',  { autoAlpha: 1, y: 0, stagger: 0.5 }, '<0.2')
  .to('.feature-visual',{ rotate: -4, yPercent: -6 }, '<');
```

Rules: inside a scrub, use `ease: 'none'` on tweens (the scrub smoothing *is* the easing);
give steps breathing room with dead space (empty `tl.to({}, {duration: 0.5})` spacers work).

### 2.2 Horizontal scroll section

```js
function initHorizontal() {
  const track = document.querySelector('.hscroll-track'); // display:flex, width:max-content
  const dist = () => track.scrollWidth - window.innerWidth;

  const hTween = gsap.to(track, {
    x: () => -dist(),
    ease: 'none',
    scrollTrigger: {
      trigger: '.hscroll',
      start: 'top top',
      end: () => `+=${dist()}`,   // 1px vertical = 1px horizontal — feels natural
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,  // function-based values recompute on refresh/resize
      anticipatePin: 1,
    },
  });

  // Triggers for elements INSIDE the moving track need containerAnimation:
  gsap.utils.toArray('.hscroll-card').forEach((card) => {
    gsap.from(card, {
      autoAlpha: 0, y: 40,
      scrollTrigger: {
        trigger: card,
        containerAnimation: hTween,   // measures against the horizontal tween, not scrollY
        start: 'left 80%',
      },
    });
  });
}
```

### 2.3 Parallax layers

Symmetric drift while the element crosses the viewport — no measurement in handlers:

```js
gsap.utils.toArray('[data-depth]').forEach((el) => {
  const d = parseFloat(el.dataset.depth); // 0.1 subtle … 0.5 strong; negative = foreground
  gsap.fromTo(el, { yPercent: d * 30 }, {
    yPercent: d * -30,
    ease: 'none',
    scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
  });
});
```

For a black/metallic look: parallax the big background wordmark/grid at `data-depth="0.35"`,
product screenshots at `0.1–0.15`. Parent needs `overflow: clip` if drift exposes edges.

### 2.4 Image scale-on-scroll

```css
.media-zoom { overflow: clip; } /* wrapper crops the oversized image */
```
```js
gsap.utils.toArray('.media-zoom > img').forEach((img) => {
  gsap.fromTo(img, { scale: 1.2 }, {
    scale: 1, ease: 'none',
    scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
  });
});
```

Settle-to-1 (above) reads calmer than grow-past-1. Never scale wrappers with borders —
borders blur; scale the `<img>` only.

### 2.5 Text highlight-on-scroll (scrubbed word-by-word)

The "manifesto paragraph" pattern — words brighten from 15% white to 100% as you scroll:

```js
SplitText.create('.manifesto', {
  type: 'words',
  autoSplit: true,
  aria: 'auto',
  onSplit: (self) => gsap.fromTo(self.words,
    { opacity: 0.15 },
    { opacity: 1, ease: 'none', stagger: 0.05,
      scrollTrigger: { trigger: '.manifesto', start: 'top 75%', end: 'bottom 45%', scrub: true } }),
});
```

Opacity-only on words = compositor-cheap even for 200+ spans. For a metallic variant,
also stagger `color: '#fff'` from `#555` — but opacity alone is cheaper.

### 2.6 Sticky stacked cards

Each card pins without spacing; the previous card scales back under the incoming one:

```css
.stack-card { transform-origin: center top; }
.stack-card .shade { position:absolute; inset:0; background:#000; opacity:0; pointer-events:none; }
```
```js
const cards = gsap.utils.toArray('.stack-card');
cards.forEach((card, i) => {
  ScrollTrigger.create({
    trigger: card, start: 'top top+=96',
    end: () => (i === cards.length - 1 ? 'bottom top' : `+=${window.innerHeight}`),
    pin: true, pinSpacing: false,     // cards overlap instead of pushing content down
  });
  if (i < cards.length - 1) {
    gsap.to(card, {
      scale: 0.94, yPercent: -2, ease: 'none',
      scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top top+=96', scrub: true },
    });
    gsap.to(card.querySelector('.shade'), {   // darken with an overlay, NOT filter:brightness
      opacity: 0.55, ease: 'none',
      scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top top+=96', scrub: true },
    });
  }
});
```

### 2.7 Marquee / ticker rows (with scroll-velocity kick)

Track holds exactly two copies of the content; `xPercent: -50` loops seamlessly.

```js
function marquee(row, { speed = 40, dir = 1 } = {}) {
  const track = row.querySelector('.marquee-track'); // width:max-content; two copies inside
  const loop = gsap.to(track, {
    xPercent: -50 * dir, ease: 'none', repeat: -1,
    duration: track.scrollWidth / 2 / speed,        // px per second
  });

  // scroll velocity bends timeScale — classic premium touch
  const proxy = { ts: 1 };
  window.lenis.on('scroll', ({ velocity }) => {
    const target = gsap.utils.clamp(-4, 4, 1 + (velocity / 30) * dir);
    gsap.to(proxy, {
      ts: target, duration: 0.4, ease: 'power2.out', overwrite: true,
      onUpdate: () => loop.timeScale(proxy.ts),
    });
  });

  // pause offscreen — free perf
  ScrollTrigger.create({
    trigger: row, start: 'top bottom', end: 'bottom top',
    onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
  });
}
document.querySelectorAll('.marquee').forEach((r, i) => marquee(r, { dir: i % 2 ? -1 : 1 }));
```

### 2.8 DrawSVG — architecture diagrams, connector lines, borders

Works on any *stroked* SVG element. Stroke, not fill.

```js
gsap.from('.diagram [data-draw]', {
  drawSVG: '0%',                       // also: '50% 50%' (from center), '100% 100%' (from end)
  duration: 1.4, ease: 'power2.inOut', stagger: 0.12,
  scrollTrigger: { trigger: '.diagram', start: 'top 70%', once: true },
});
// fade node fills in after strokes complete, on the same timeline
```

Hairline `stroke: #3a3a3a` on black, then a second brighter pass (`#e8e8e8`,
`drawSVG: '0% 12%'` tweened along) reads as a signal pulse through the diagram.

### 2.9 Batched grid reveals

One trigger per *batch*, not per card — `ScrollTrigger.batch` prevents trigger spam:

```js
ScrollTrigger.batch('.grid-item', {
  start: 'top 85%', once: true,
  onEnter: (batch) => gsap.from(batch, { autoAlpha: 0, y: 32, stagger: 0.07, duration: 0.8 }),
});
```

---

## 3. Micro-interactions

All pointer-following uses `gsap.quickTo` / `gsap.quickSetter` — they reuse one tween
instead of allocating a new one per event. Gate everything behind
`matchMedia('(hover: hover) and (pointer: fine)')`.

### 3.1 Magnetic buttons

```js
function magnetize(el, strength = 0.35) {
  const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'elastic.out(1, 0.4)' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'elastic.out(1, 0.4)' });
  let rect;
  el.addEventListener('mouseenter', () => { rect = el.getBoundingClientRect(); }); // read ONCE
  el.addEventListener('mousemove', (e) => {
    xTo((e.clientX - (rect.left + rect.width / 2)) * strength);
    yTo((e.clientY - (rect.top + rect.height / 2)) * strength);
  });
  el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
}
if (matchMedia('(hover: hover) and (pointer: fine)').matches)
  document.querySelectorAll('[data-magnetic]').forEach((el) => magnetize(el));
```

Inner label at ~half strength (`strength * 0.5` on a child span) adds depth.
Keep strength ≤ 0.4 and elements ≤ ~120px — big magnetic zones feel broken.

### 3.2 Cursor follower with blend mode

```css
.cursor { position: fixed; top: 0; left: 0; width: 32px; height: 32px;
  border-radius: 50%; background: #fff; mix-blend-mode: difference;
  pointer-events: none; z-index: 9999; }
@media (hover: none), (pointer: coarse) { .cursor { display: none; } }
```
```js
const cur = document.querySelector('.cursor');
gsap.set(cur, { xPercent: -50, yPercent: -50 });   // center via xPercent, NOT CSS translate
const cx = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' });
const cy = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
window.addEventListener('mousemove', (e) => { cx(e.clientX); cy(e.clientY); });

// grow over interactive targets
document.querySelectorAll('a, button, [data-cursor]').forEach((t) => {
  t.addEventListener('mouseenter', () => gsap.to(cur, { scale: 2.4, duration: 0.3 }));
  t.addEventListener('mouseleave', () => gsap.to(cur, { scale: 1, duration: 0.3 }));
});
```

`mix-blend-mode: difference` on white inverts perfectly over black/white — the metallic
look for free. Never hide the native cursor (`cursor: none`) on the whole page; the
follower is decoration, not a replacement. Blend-mode layers force compositing — keep the
cursor small; never put `mix-blend-mode` on large scrolling layers.

### 3.3 Hover "distortion" (transform-only fake)

True distortion is WebGL; the transform-only version that still reads premium:

```js
document.querySelectorAll('.tile').forEach((tile) => {
  const img = tile.querySelector('img');
  const rx = gsap.quickTo(img, 'rotationY', { duration: 0.6, ease: 'power3' });
  const ry = gsap.quickTo(img, 'rotationX', { duration: 0.6, ease: 'power3' });
  gsap.set(tile, { perspective: 800 });
  gsap.set(img,  { transformOrigin: 'center', scale: 1.06 }); // pre-scaled so tilt never shows edges
  let rect;
  tile.addEventListener('mouseenter', () => { rect = tile.getBoundingClientRect(); });
  tile.addEventListener('mousemove', (e) => {
    rx(((e.clientX - rect.left) / rect.width - 0.5) * 10);   // ±5deg max — subtle
    ry(-((e.clientY - rect.top) / rect.height - 0.5) * 10);
  });
  tile.addEventListener('mouseleave', () => { rx(0); ry(0); });
});
```

### 3.4 Link underline animations

CSS does this better than JS — origin flip makes it exit the way it entered:

```css
.link { position: relative; }
.link::after {
  content: ''; position: absolute; left: 0; bottom: -2px; width: 100%; height: 1px;
  background: currentColor; transform: scaleX(0); transform-origin: right;
  transition: transform 0.45s cubic-bezier(0.65, 0, 0.35, 1);
}
.link:hover::after { transform: scaleX(1); transform-origin: left; }
```

Nav-bar variant in GSAP (single shared underline that slides between items) — use
`gsap.quickTo` on `x` and `width`... but `width` causes layout: use `scaleX` against a
measured max-width bar instead.

### 3.5 Button label roll (duplicate-text swap)

```css
.btn { overflow: clip; } .btn .label { display: block; }
```
```js
// markup: <span class="label">Deploy</span><span class="label" aria-hidden="true">Deploy</span>
// second label absolutely positioned at top:100%
btn.addEventListener('mouseenter', () =>
  gsap.to(btn.querySelectorAll('.label'), { yPercent: -100, duration: 0.45, ease: 'power3.inOut' }));
btn.addEventListener('mouseleave', () =>
  gsap.to(btn.querySelectorAll('.label'), { yPercent: 0, duration: 0.45, ease: 'power3.inOut' }));
```

---

## 4. Texture motion (the metallic layer)

### 4.1 Animated grain

Never regenerate noise per frame. One oversized static noise layer, jittered with a
stepped transform — compositor-only:

```css
.grain { position: fixed; inset: -100%; width: 300%; height: 300%;
  pointer-events: none; z-index: 9000; opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  animation: grain 0.9s steps(6) infinite;
}
@keyframes grain {
  0%{transform:translate3d(0,0,0)} 17%{transform:translate3d(-4%,2%,0)}
  33%{transform:translate3d(2%,-3%,0)} 50%{transform:translate3d(-3%,-2%,0)}
  67%{transform:translate3d(3%,3%,0)} 83%{transform:translate3d(-2%,4%,0)}
  100%{transform:translate3d(0,0,0)}
}
@media (prefers-reduced-motion: reduce) { .grain { animation: none; } }
```

Opacity 0.03–0.06 on black. CSS animation (not GSAP) so it never touches the JS thread.

### 4.2 Gradient sheen sweep (cards, buttons)

```css
.sheen { position: relative; overflow: clip; }
.sheen::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%);
  transform: translateX(-120%);
}
```
```js
// one-shot sweep on scroll-enter (or on hover)
gsap.utils.toArray('.sheen').forEach((el) => {
  gsap.fromTo(el, { '--sx': '-120%' }, {}); // if using CSS var; simplest is pseudo via class:
  ScrollTrigger.create({
    trigger: el, start: 'top 75%', once: true,
    onEnter: () => gsap.fromTo(el.querySelector(':scope > .sheen-bar') ?? el, // or tween a real child div
      { xPercent: -120 }, { xPercent: 120, duration: 1.1, ease: 'power2.inOut' }),
  });
});
```

(Pseudo-elements can't be tweened directly — use a real child `<div class="sheen-bar">`
or a registered CSS custom property.)

### 4.3 Chrome glint on metallic text

```css
@property --gx { syntax: '<percentage>'; inherits: false; initial-value: 0%; }
.metallic {
  background: linear-gradient(100deg, #6b6b6b 0%, #f5f5f5 calc(var(--gx) + 8%),
              #8a8a8a calc(var(--gx) + 16%), #5a5a5a 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
```
```js
// slow ambient glint; GSAP animates registered CSS vars directly (3.13 can even tween
// TO a var: gsap.to(el, { color: 'var(--steel)' }))
gsap.fromTo('.metallic', { '--gx': '-20%' }, {
  '--gx': '100%', duration: 3.5, ease: 'sine.inOut', repeat: -1, repeatDelay: 2, yoyo: false,
});
```

Scroll-linked variant: same tween with `scrollTrigger: { scrub: true }` so the glint
tracks scroll. Gradient-on-text repaints only the glyph area — cheap for headlines,
don't do it on body copy.

### 4.4 Conic border rotation (the "energized" card border)

```css
@property --a { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
.glow-border { position: relative; background: #0a0a0a; border-radius: 12px; }
.glow-border::before {
  content: ''; position: absolute; inset: -1px; z-index: -1; border-radius: 13px;
  background: conic-gradient(from var(--a), #333 0%, #eee 12%, #333 25%, #333 100%);
}
```
```js
gsap.to('.glow-border', { '--a': '360deg', duration: 6, ease: 'none', repeat: -1 });
```

Pause it offscreen with the same `ScrollTrigger.create({ onToggle })` pattern as 2.7.

---

## 5. Lenis best practices (1.3)

### 5.1 The one true setup

Already shown in §0 — the canonical pairing (straight from the Lenis README):

```js
const lenis = new Lenis({ autoRaf: false });
window.lenis = lenis;                               // REQUIRED convention on these pages
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

- `autoRaf: true` is fine for Lenis-only pages with **zero** GSAP scroll work. The moment
  ScrollTrigger exists, drive Lenis from `gsap.ticker` so scroll position and animation
  frames update in the same tick — two rAF loops = one-frame lag = visible shimmer on
  scrubbed animations.
- `lagSmoothing(0)`: without it, GSAP "adjusts" after a long frame / tab switch and the
  page visibly jumps.
- `window.lenis` lets any late script, modal, or analytics hook call
  `window.lenis.stop() / .start() / .scrollTo()` without import plumbing.

### 5.2 Required CSS (ships as lenis.css)

```css
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; } /* CSS smooth scrolling FIGHTS Lenis */
.lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
.lenis.lenis-stopped { overflow: hidden; }
.lenis.lenis-smooth iframe { pointer-events: none; }
html, body { overscroll-behavior: none; } /* kill rubber-band chaining behind fixed chrome */
```

### 5.3 Anchor links

Preferred: `new Lenis({ anchors: true })` — built-in interception of `href="#..."` clicks.
With header offset: `anchors: { offset: -96 }` — or manual:

```js
document.querySelectorAll('a[href^="#"]').forEach((a) =>
  a.addEventListener('click', (e) => {
    e.preventDefault();
    window.lenis.scrollTo(a.getAttribute('href'), { offset: -96, duration: 1.2 });
  }));
```

`scrollTo` accepts a selector, element, number, or `'top' | 'bottom'`, with
`{ offset, duration, easing, lock, immediate, force, onComplete }`.

### 5.4 Modals, drawers, nested scrollers

- Opening a modal: `window.lenis.stop()` (adds `.lenis-stopped` → `overflow: hidden`,
  no scrollbar-width layout jump handling needed if you reserve `scrollbar-gutter`).
  Close: `window.lenis.start()`. Do NOT hand-toggle `overflow: hidden` on body.
- Scrollable regions inside the page (code blocks, terminals, changelog panes):
  `data-lenis-prevent` (or `data-lenis-prevent-wheel` / `-touch`), or
  `allowNestedScroll: true` at construction.
- Touch: default (`syncTouch: false`) leaves native touch scrolling alone — correct.
  `syncTouch: true` looks impressive and feels laggy on Android; avoid for landing pages.

### 5.5 Refresh discipline

Anything that changes document height after load must be followed by
`ScrollTrigger.refresh()`: font swaps (§0 does it), image loads without CSS
`aspect-ratio` (better: always reserve aspect-ratio), accordions expanding, tabs.
Lenis itself auto-resizes (`autoResize: true` uses ResizeObserver).

---

## 6. Performance rules

1. **Animate only `transform` and `opacity`** (`x/y/xPercent/yPercent/scale/rotate/autoAlpha`).
   `clip-path` and registered CSS vars for gradients are the sanctioned exceptions.
   Never scrub `width/height/top/left/margin/padding` — each frame = layout for the
   whole document. No `filter: blur()` scrubbing (per-frame repaint of the layer);
   no scrubbed `box-shadow` — fake shadows with a pre-rendered shadow layer's opacity.
2. **`will-change` hygiene**: GSAP already promotes transformed elements to layers
   (`force3D: "auto"` default) — you almost never need `will-change` on GSAP targets.
   Where used (CSS-only animations like grain), scope it to the animating element and
   never blanket-apply (`* { will-change: transform }` explodes GPU memory → tile
   checkerboarding on scroll).
3. **Reduced motion is a build-time branch, not an afterthought** — the
   `gsap.matchMedia()` split in §0. In the reduce branch: no pins, no parallax, no
   Lenis, counters jump to final value, content fully visible. matchMedia auto-reverts
   each context when the query flips.
4. **No layout reads in per-frame code.** `onUpdate`, `lenis.on('scroll')`, and
   `mousemove` handlers must not call `getBoundingClientRect` / read `offsetWidth`
   (read once on `mouseenter`/`refreshInit` instead — see §3.1). ScrollTrigger already
   caches its measurements at refresh; keep it that way with function-based values +
   `invalidateOnRefresh: true` rather than manual measuring.
5. **One rAF loop.** Everything runs off `gsap.ticker` (Lenis included). Never add
   your own `requestAnimationFrame` loops; use `gsap.ticker.add(fn)` and remove it
   when idle.
6. **Pause offscreen loops** (marquees, glints, borders) with ScrollTrigger `onToggle`
   — infinite tweens are cheap individually and deadly in aggregate.
7. **quickTo/quickSetter for pointer-driven motion** — no per-event tween allocation.
8. **Split budget**: chars for ≤ 2 short lines; words for paragraphs; lines for
   everything else. 1,000 char spans will hurt layout and memory; `type: 'lines'` with
   `mask: 'lines'` gives 90% of the drama for 5% of the nodes.
9. **Media**: explicit `aspect-ratio` or width/height attributes on every image
   (prevents refresh-invalidating reflow), `loading="lazy"` below the fold,
   `decoding="async"`.
10. **Kill markers, logs, and `overwrite: 'auto'` warnings before ship**; check with
    CPU 4× throttle + a real trackpad AND a mouse wheel (discrete wheel deltas expose
    bad lerp settings that trackpads hide).

---

## 7. Pitfalls: janky vs buttery (specific)

1. **Two rAF loops** (Lenis `autoRaf: true` + gsap.ticker, or a custom rAF): scrubbed
   elements shimmer/lag one frame behind scroll. Fix: §0 setup, exactly one loop.
2. **CSS `transition` on a GSAP-animated property** — the double-easing fight. GSAP sets
   `transform` every frame; CSS re-eases each set → rubbery, delayed motion. Rule:
   a property is owned by CSS *or* GSAP, never both. (Classic: `.card { transition: all .3s }`
   silently breaking a scrub.)
3. **`scroll-behavior: smooth` in CSS with Lenis** — anchor clicks trigger both systems.
   The lenis.css `scroll-behavior: auto !important` rule exists for this; keep it.
4. **Pin jump at section start** — missing `anticipatePin: 1`, or pinning an element
   with margins (pin wraps in a div; margins collapse differently). Pin padded wrappers,
   not margined children.
5. **Pinning inside a transformed ancestor** breaks `position: fixed` pinning —
   ScrollTrigger silently falls back to `transform` pinning which can lag. Keep pinned
   sections out of parents with `transform`/`filter`/`perspective`/`contain: paint`.
6. **Trigger creation order**: ScrollTriggers must be created in document order (or given
   `refreshPriority`) — a pin created *after* a trigger lower on the page shifts all
   measurements below it. Symptom: animations fire at wrong scroll positions only after
   refresh. `ScrollTrigger.sort()` / ordered init functions fix it.
7. **Function values without `invalidateOnRefresh: true`** — horizontal sections and
   pins keep stale distances after resize; end markers drift. Any `() =>` value wants it.
8. **`from()` + re-run logic**: `gsap.from` with `immediateRender` (default true) sets the
   start values instantly; two `from`s on the same property = the second captures the
   first's mid-values. Use `fromTo` when you need deterministic starts (see §1.3, §2.4).
9. **SplitText before fonts load** — lines split against fallback-font metrics, then the
   web font swaps and line breaks are wrong. 3.13 fix: `autoSplit: true` + build tweens
   in `onSplit()` (return them so re-splits resume at the same progress). Legacy fix:
   gate on `document.fonts.ready`.
10. **`scrub: true` when you wanted `scrub: 1`** — direct-coupled scrub on a discrete
    mouse wheel steps like a slideshow. 0.5–1.5s smoothing + Lenis lerp is the
    "expensive" feel. (Too much — `scrub: 3` + `lerp: 0.05` — turns into seasick lag.)
11. **Easing inside scrubbed tweens** — `power` eases inside a scrub compound with scrub
    smoothing and feel non-linear/laggy in reverse. `ease: 'none'` inside; let scrub ease.
12. **Layout reads in scroll/mousemove handlers** (`getBoundingClientRect` per event) —
    forced synchronous layout = the classic long-frame spike. Cache on enter/refresh.
13. **Animating filters/shadows/large blend-mode layers on scroll** — paint storms that
    profile as "compositing" jank; see §6.1/§3.2. Shadow-opacity swap trick instead.
14. **Forgetting cleanup in SPAs** — Next.js route changes leave dead ScrollTriggers
    measuring unmounted DOM → phantom pin spacing, growing memory. Everything in
    `gsap.context()`/`useGSAP({ scope })`, revert on unmount; `ScrollTrigger.killAll()`
    is the nuclear fallback.
15. **`once: true` vs scrub confusion** — entrance reveals should be `once: true`
    (or `toggleActions: 'play none none none'`); making everything scrubbed means
    content "un-animates" when scrolling up, which reads broken, and nothing is at rest.
16. **100vh sections on mobile** — URL bar collapse resizes the viewport, ScrollTrigger
    refreshes, pins jump. Use `svh`/`dvh` deliberately (`svh` for pinned sections) and
    keep `ScrollTrigger.config({ ignoreMobileResize: true })`.
17. **Stagger/duration miscalibration** — the difference between premium and template:
    chars `each: 0.015–0.03`, words `0.03–0.06`, lines `0.08–0.12`; hover feedback
    0.25–0.45s; reveals 0.7–1.3s; nothing except ambient loops runs > 1.6s. When in
    doubt, shorten by 20% and steepen the ease (`power4`/`expo`).
18. **Everything animates** — if all 12 sections pin and parallax, none of it lands.
    Budget: one hero moment, 2–3 scroll set-pieces, quiet `batch` fades elsewhere.
    Restraint is what makes black/white/metallic read as expensive.

---

## Appendix: init skeleton

```js
gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin);
gsap.defaults({ ease: 'power3.out', duration: 0.9 });
ScrollTrigger.config({ ignoreMobileResize: true });

const lenis = new Lenis({ autoRaf: false, lerp: 0.1, anchors: true });
window.lenis = lenis;
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  initIntro();      // §1
  initScroll();     // §2 — create top-of-page triggers first
  initMicro();      // §3, gated on (hover:hover) and (pointer:fine)
  initTexture();    // §4
});
mm.add('(prefers-reduced-motion: reduce)', () => {
  lenis.destroy();
  gsap.set('[data-reveal],[data-split],[data-count]', { clearProps: 'all', autoAlpha: 1 });
});

document.fonts.ready.then(() => ScrollTrigger.refresh());
```

Sources: [GSAP 3.13 release](https://gsap.com/blog/3-13/) ·
[SplitText docs](https://gsap.com/docs/v3/Plugins/SplitText/) ·
[ScrambleText docs](https://gsap.com/docs/v3/Plugins/ScrambleTextPlugin/) ·
[Lenis README](https://github.com/darkroomengineering/lenis)
