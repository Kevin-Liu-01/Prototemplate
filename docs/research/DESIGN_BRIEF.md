> **ADDENDUM (LAW, added mid-run): Read AESTHETIC_ADDENDUM.md in this directory before building or refining.** The founder supplied canonical aesthetic references (Resend.com machined-metal sleekness as ambient base + prismatic diffraction burst as the light). It overrides §1.3 where they differ.

# GENERAL TRANSLATION — MARKETING SITE REDESIGN: THE DESIGN BRIEF

**Audience:** sample builders. This document + `landing-content.md` (same directory) are the ONLY two documents you read. Everything you need — copy, structure, aesthetic law, technical contract, metallic CSS recipes, motion boot code — is here or in `landing-content.md`. Section pointers below use `LC §n` = section *n* of `landing-content.md`.

**Deliverable per sample:** one complete, self-contained landing page (`.html`) executing ONE of the twenty art directions in Part 2, on top of the shared foundation in Part 1.

---

# PART 1 — SHARED FOUNDATION (applies to every sample)

## 1.1 What General Translation is

General Translation (GT) is **i18n/localization infrastructure for developers** — the Stripe/Vercel of language. Two halves:

- **Open-source SDKs** (`gt-next`, `gt-react`, `gt-react-native`, `gt-tanstack-start`, `gt-node`, `gt-python`, the `gt` CLI) that translate UI **inline** — "no painful refactors and no managing large JSON files."
- **A paid AI platform**: Translation APIs/workflows priced per token, a **Translation CDN** (edge delivery, version branching, OTA updates), the **Context Platform + Translation Editor** (glossaries, style rules, side-by-side review), and the flagship agent **Locadex** — "Just connect a GitHub repo and your app is translated, in native speed and quality, with zero engineering bandwidth."

Mission: **"Bring the world's best products to the whole world. Every developer should be able to launch every product in every language."**

Voice: confident, technical, declarative, first-principles. Developer-infra register (Stripe/Vercel/Linear/Mintlify school). **Never name or compare against competitors** (no Lokalise/Phrase/DeepL/etc. — referencing open-source libraries like i18next is acceptable but unnecessary). No fluff words ("seamless", "robust"). Front-load the point.

Two-brand system: **GT** (platform) and **Locadex** (the agent, a named sub-brand). Dark/light logo parity is an established brand practice.

## 1.2 The narrative arc (section order + copy sources)

Every sample is a full page: **nav → hero → ~5–7 content sections → footer.** Use REAL copy from `landing-content.md`, never lorem ipsum. The canonical arc (compress/merge sections as your direction demands, but every beat below must exist):

| # | Beat | Copy source | Non-negotiable content |
|---|------|-------------|------------------------|
| 0 | **Nav** | LC §1 | Logo/wordmark ("General Translation" or "GT" as styled text/SVG — no image files), links: Docs, Pricing, Enterprise, Blog (subset OK), CTAs: **Sign In** + **Get a Demo** (or Get Started) |
| 1 | **Hero** | LC §2 | The command chip `$ npx gt@latest` (monospace, copyable affordance), **H1: "Launch in every language"**, sub: "General Translation helps developers localize apps into Spanish / French / Japanese / …" (rotating-language idea is yours to interpret), CTAs: **Get Started** → `/dashboard`, **Docs** → `/docs` |
| 2 | **Social proof** | LC §3 | Kicker: "Trusted by the world's best companies" + the six customers: **Cursor, Ramp, Mintlify, Profound, Partiful, ClickHouse**. Render as styled TEXT wordmarks or inline SVG monograms — external logo images are forbidden by the contract. Optional testimonial pairing (LC §9): Theo (CEO, T3Chat): "Internationalization went from '$%!# this' to 'trivial'." |
| 3 | **Code snippet moment** | LC §4 | At least one real, syntax-highlighted snippet — the canonical one is the `gt-next` `page.tsx` with `<T>`, `<Num>`, `<DateTime>` (LC §4, Next.js tab). Show the `<T>`-wrap insight: wrap JSX, get every language. Framework breadth (Next.js, TanStack Start, React, React Native, Node.js, Python) may appear as tabs/labels. |
| 4 | **Locadex (agent)** | LC §5 | Kicker "Locadex AI Agent", H2 "End-to-end localization", body "AI agents connect to your codebase, internationalize your code, and open pull requests with translations." The 5-step flow: **Push to repo → Scan codebase → Edit code → Translate content → Open PR.** CTA "Connect GitHub". |
| 5 | **SDKs / CDN / platform features** | LC §6, §8, §10 | SDK capabilities (UI, Text, Numbers, Currencies, Dates, Plurals…), CDN/delivery ("A global, low-latency translation CDN. Push over-the-air updates without redeploying your app."), routing, CI/CD, previews, live translation (bento copy in LC §8). "100+ languages supported" (LC §10) may appear here or standalone. |
| 6 | **Editor / Context Platform** | LC §7 | Kicker "Translation Editor", H2 "Edit in context", body "Agents write translations. You review, edit, and approve in a focused workspace." Bullets: side-by-side source/translation; diffs on regeneration; edit before or after live. |
| 7 | **Pricing teaser** | LC §14 | Two plans only: **Starter** (from $0, pay-as-you-go, "Unlimited projects, unlimited users, unlimited languages", CTA Get Started) and **Enterprise** (custom pricing, SSO, SOC 2 Type II & ISO 27001, forward-deployed engineers, Slack support, CTA Contact Us). One line of philosophy allowed: usage-based, not seats. NEVER mention a "Team" plan. |
| 8 | **Closing CTA** | LC §12 | H2 "Deploy today in every language" (rotating-language variant welcome), body "Talk to an engineer about implementation or get started for free", CTAs **Get a Demo** + **Sign Up**. |
| 9 | **Footer** | LC §13 | Wordmark, columns (Docs, Blog, Pricing, Careers, Contact, GitHub, 𝕏, Discord, LinkedIn, Terms, Privacy), compliance line (SOC 2 Type II · GDPR · ISO 27001), "© 2026 General Translation, Inc. All rights reserved." |

**Copy bank (verbatim lines you may deploy anywhere):** "Launch in every language" · "End-to-end localization for the world's best companies" · "General Translation builds full-stack infrastructure for localizing apps, docs, and websites." · "Every developer should be able to launch every product in every language." · "Translations have to reflect the logic of an application." · "The hard part about translation is no longer model quality, but context and infrastructure." · "Language infrastructure for the internet." · "Just connect a GitHub repo and your app is translated, in native speed and quality, with zero engineering bandwidth." · "Like an entire multimillion dollar localization department for every developer." · "No painful refactors and no managing large JSON files." · "Scans repos, updates i18n code, generates translations, runs visual QA, opens guarded PRs." · "We want translation abundance." · "…for your next 1,000,000,000 users." · "100+ languages supported."

Recurring numbers with built-in drama: **118 languages · 1,000,000,000 users · 5 agent steps · 6 frameworks · $0 to start.**

## 1.3 The aesthetic mandate: BLACK & WHITE & METALLIC

This is the law of the whole family. Precisely:

- **Ink blacks:** surfaces live between `#050505` and `#0f0f0f`. Never flat `#000` over large areas without atmosphere (grain, faint gradient, hairlines, vignette). "There is no empty black; there is deep space with dust in it."
- **Paper whites:** `#f5f5f5` to `#ffffff`. Reserve **pure `#ffffff` for metal highlights and specular catch-lights only** — it must read as *light*, not paper. On dark pages, text is white-at-alpha: 92% primary, 64% secondary, 40% tertiary, 24% hairlines/disabled.
- **Metallic accents:** chrome/silver/steel rendered as **gradients, not color** — conic chrome, linear foil, brushed striations, specular radial highlights. Grays only: `#4a4a4a → #8a8a8a → #e9e9e9 → #ffffff`. Metal is the *personality*; black & white is the *system*.
- **Light-dominant inversions:** six of the twenty directions (marked LIGHT below) invert to white-dominant — near-black ink `#0f0f0f` on paper `#f5f5f5–#fbfbfb`, hairlines at `rgba(0,0,0,0.08–0.14)`, metal reads as graphite/silver-leaf/letterpress.
- **One consistent light source per page.** Decide (e.g. top-left) and make every bevel, sheen sweep, specular highlight and shadow obey it. Randomly-oriented gradients read subliminally fake.
- **Color budget: ~zero.** At most ONE whisper of desaturated iridescence (steel-blue/lavender at low opacity, `mix-blend-mode: color-dodge`) on a single primary-CTA hover. Nothing else. No brand blue, no rainbow buttons — this redesign replaces them.
- **Grain is the glue.** A fixed feTurbulence grain overlay at 0.03–0.06 opacity over every large gradient (recipe §1.6). It kills banding and makes flat monochrome feel physical.
- **Hairlines replace shadows** as the separation tool on dark: 1px at `rgba(255,255,255,0.08–0.14)`.
- Custom `::selection` (invert: white bg, black text on dark pages), styled focus rings, designed hover states on everything interactive.

## 1.4 Quality bar: Awwwards Site-of-the-Day

**Typography is 80% of the design.** In monochrome there is nowhere to hide — scale contrast IS the color.

- **Huge display scale:** hero/section display sizes 4–10rem+ at 1440px (`clamp(3rem, 8vw, 9rem)` class of sizes). Commit. 48px centered with default tracking is an automatic fail.
- **Tracking is size-dependent:** −0.02em to −0.05em on display sizes; 0 on body; +0.08 to +0.12em on ALL-CAPS mono eyebrows/kickers. This three-way contrast is most of the "premium" look.
- **Line-height inverts with size:** 0.95–1.05 display, 1.5–1.6 body, ~1.4 mono captions.
- **Jump-cut scale system:** body 16–18px → h3 ~24 → h2 ~32 → then LEAP to display 72–140px. Premium sites jump, they don't glide.
- **Baseline rhythm & whitespace:** 8px base; within components 8/12/16/24; between blocks 48/64; **between sections 128–192px desktop**. Whitespace between sections is the #1 premium signal.
- **Editorial pacing:** alternate loud sections (huge type, set-piece animation) with quiet ones (a single centered paragraph, a small mono label, air). Plan the scroll like a film edit.
- **Details in the margins:** mono index numbers `[01]`, crop marks, slashed zeros (`font-feature-settings: 'zero' on` where the family supports it), live-feeling metadata labels (`EST. 2023`, `37.7897° N`, `v5.x`), designed states everywhere.
- **Performance is aesthetic.** Animate only `transform`/`opacity` (plus `clip-path` and registered CSS custom properties). 60fps flat beats 24fps spectacular. Jank is a product-quality signal for this audience.
- **Restraint budget:** ONE hero moment, 2–3 scroll set-pieces, quiet batch fades elsewhere. If every section pins and parallaxes, none of it lands.

## 1.5 Technical contract (verbatim — every sample MUST comply)

* Single self-contained .html file; scripts loaded via relative paths: ../vendor/gsap.min.js, ../vendor/ScrollTrigger.min.js, ../vendor/SplitText.min.js, ../vendor/ScrambleTextPlugin.min.js, ../vendor/DrawSVGPlugin.min.js, ../vendor/lenis.min.js
* Google Fonts via <link> allowed (max 2 families/sample); everything else offline — no other external requests, no external images (use CSS/SVG/canvas for all visuals — no <img> to remote URLs)
* Lenis instance MUST be exposed as window.lenis; integrate with ScrollTrigger properly
* Zero console errors; prefers-reduced-motion media query respected; page must be fully legible at every scroll position even mid-animation (no permanently-hidden content if JS timing differs)
* Responsive: flawless at 1440px desktop AND 390px mobile
* Full page: nav, hero, ~5-7 content sections, footer. Real GT copy from landing-content.md, never lorem ipsum.

### The canonical boot sequence (use this, exactly this shape)

```html
<script src="../vendor/gsap.min.js"></script>
<script src="../vendor/ScrollTrigger.min.js"></script>
<script src="../vendor/SplitText.min.js"></script>
<script src="../vendor/ScrambleTextPlugin.min.js"></script>
<script src="../vendor/DrawSVGPlugin.min.js"></script>
<script src="../vendor/lenis.min.js"></script>
```

```js
gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin);
gsap.defaults({ ease: 'power3.out', duration: 0.9 });
ScrollTrigger.config({ ignoreMobileResize: true });

const lenis = new Lenis({ autoRaf: false, lerp: 0.1, anchors: true });
window.lenis = lenis;                              // REQUIRED
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));       // ONE rAF loop, ever
gsap.ticker.lagSmoothing(0);

const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  initIntro(); initScroll(); initMicro(); initTexture();
});
mm.add('(prefers-reduced-motion: reduce)', () => {
  lenis.destroy();
  gsap.set('[data-reveal],[data-split],[data-count]', { clearProps: 'all', autoAlpha: 1 });
});
document.fonts.ready.then(() => ScrollTrigger.refresh());
```

**Motion rules (non-negotiable):**
1. Do NOT use `ScrollTrigger.normalizeScroll(true)` or `scrollerProxy()` with Lenis — the ticker sync above is the entire integration.
2. FOUC/legibility guard: gate hidden-until-animated elements behind a `js` class (`<html class="no-js">` + one inline script swapping to `js`), hide with `visibility` and reveal with `autoAlpha`. **If JS fails or timing differs, everything must be visible and readable.** Entrance reveals are `once: true`; content never "un-animates" to hidden on scroll-up.
3. Inside any scrubbed timeline: `ease: 'none'` on tweens; `scrub: 0.5–1.5` (never bare `true` for set-pieces); `anticipatePin: 1` and `invalidateOnRefresh: true` on pins; function-based end values.
4. SplitText 3.13 style: `SplitText.create(target, { type, mask, autoSplit: true, onSplit(self){ return gsap.from(...) } })`. Split budget: chars only for ≤2 short lines, words for paragraphs, lines elsewhere.
5. Pointer-driven motion uses `gsap.quickTo`; no `getBoundingClientRect` in move handlers (cache on enter); gate hover effects behind `(hover: hover) and (pointer: fine)`.
6. Marquees/glints/infinite loops pause offscreen via a ScrollTrigger `onToggle`.
7. Never animate `width/height/top/left/filter/box-shadow` on scroll. No CSS `transition` on a GSAP-owned property.
8. Timing calibration: micro-interactions 150–250ms; reveals 0.7–1.3s; staggers — chars 0.015–0.03, words 0.03–0.06, lines 0.08–0.12; ambient loops 6–12s. Ship no `markers`, no console noise.
9. Mobile 390px: pinned set-pieces must degrade gracefully (shorter pin distances or unpinned stacked fallback via `gsap.matchMedia('(max-width: 767px)')`); use `svh` for pinned full-height sections; horizontal scroll sections become native swipe or vertical stacks.

## 1.6 Metallic CSS cookbook (copy these; grays only)

**Chrome text** (heavy weights, display sizes only):
```css
.chrome-text {
  background: conic-gradient(from 210deg at 50% 50%,
    #4a4a4a 0deg, #f5f5f5 40deg, #8a8a8a 85deg, #fdfdfd 120deg,
    #5c5c5c 180deg, #e8e8e8 220deg, #767676 275deg, #ffffff 320deg, #4a4a4a 360deg);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}
```

**Silver foil headline** (slow — 5–8s; fast shimmer reads cheap):
```css
.foil {
  background: linear-gradient(110deg, #6d6d6d 0%, #e9e9e9 18%, #ffffff 26%, #b0b0b0 38%,
    #7c7c7c 50%, #d9d9d9 62%, #ffffff 74%, #8f8f8f 88%, #6d6d6d 100%);
  background-size: 220% 100%;
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  animation: foil-slide 6s ease-in-out infinite;
}
@keyframes foil-slide { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
```

**Brushed steel panel:**
```css
.brushed {
  background:
    repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 1px, rgba(0,0,0,.06) 1px 2px, transparent 2px 4px),
    linear-gradient(180deg, #cfcfcf 0%, #f4f4f4 22%, #b5b5b5 48%, #dcdcdc 55%, #9e9e9e 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.65), inset 0 -1px 0 rgba(0,0,0,.35), 0 12px 32px rgba(0,0,0,.35);
}
```

**Metallic rounded border** (animate `--a` for a rotating chrome rim):
```css
@property --a { syntax: '<angle>'; inherits: false; initial-value: 140deg; }
.metal-frame { position: relative; border-radius: 14px; background: #0c0c0c; }
.metal-frame::before {
  content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1.5px;
  background: conic-gradient(from var(--a), #777, #fff 25%, #555 50%, #eee 75%, #777);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
}
```

**Film grain overlay** (fixed, over everything; CSS-animated so it never touches JS):
```css
.grain { position: fixed; inset: -100%; width: 300%; height: 300%; pointer-events: none;
  z-index: 9000; opacity: .05;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  animation: grain 0.9s steps(6) infinite; }
@keyframes grain { 0%{transform:translate3d(0,0,0)} 17%{transform:translate3d(-4%,2%,0)}
  33%{transform:translate3d(2%,-3%,0)} 50%{transform:translate3d(-3%,-2%,0)}
  67%{transform:translate3d(3%,3%,0)} 83%{transform:translate3d(-2%,4%,0)} 100%{transform:translate3d(0,0,0)} }
@media (prefers-reduced-motion: reduce) { .grain { animation: none; } }
```

**Pointer-reactive spotlight card** (the Linear/Vercel move; lerp via quickTo for inertia):
```css
.card { background:
    radial-gradient(400px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,.10), transparent 55%),
    #101010; border: 1px solid rgba(255,255,255,.08); }
```
```js
card.addEventListener('pointermove', (e) => {   // cache rect on pointerenter in real code
  const r = rectCache;
  card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
  card.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
});
```

**Sheen sweep** (a real child `<div class="sheen-bar">`, tweened `xPercent: -120 → 120`, `power2.inOut`, 1.1s, once on scroll-enter or on hover).

**Embossed / debossed / letterpress:**
```css
.embossed  { box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 1px 2px rgba(0,0,0,.8); }
.debossed  { background: #0d0d0d; box-shadow: inset 0 2px 6px rgba(0,0,0,.7), inset 0 -1px 0 rgba(255,255,255,.05); }
.letterpress-dark  { color: #1a1a1a; text-shadow: 0 1px 0 rgba(255,255,255,.12); } /* on dark metal */
.letterpress-paper { color: #17181a; text-shadow: 0 1px 0 rgba(255,255,255,.85), 0 -1px 0 rgba(0,0,0,.06); } /* on paper */
```

**Canvas silver mesh** (shader look, no WebGL): 3 drifting radial-gradient orbs (`rgba(220,220,225,0.16)` → transparent) composited `lighter` on `#0a0a0a`, rendered at half resolution, upscaled with `canvas { filter: blur(40px) contrast(115%); }`, grain on top. Drive from `gsap.ticker`; pause offscreen; static poster frame under reduced-motion.

**Liquid-metal goo:** container `filter: contrast(22)` on `#000`; children are blurred (`blur(18px)`) radial-gradient chrome blobs (`#fff → #bdbdbd → #4d4d4d → #161616`); blobs fuse like mercury when near. Add a small white specular dot that lerps behind the pointer.

**Iridescent whisper** (the ONLY permitted color, hover-only, one element per page): `linear-gradient(125deg,#fff,#9aa7b8,#d8cfe8,#b8c8c0,#fff)`, `background-size: 300% 300%`, `mix-blend-mode: color-dodge`, `opacity: .35`, slow 4s pan.

---

# PART 2 — TWENTY ART DIRECTIONS

Rules of engagement: each sample commits TOTALLY to one direction — its layout, its type, its metal, its single signature motion. The copy and section beats (§1.2) are constant; everything else must feel like a different studio built it. Fonts listed are Google Fonts (≤2 families; weights/axes via the `<link>` URL). LIGHT = white-dominant inversion.

---

### 01 — `grid-of-record` (LIGHT)

**Concept.** Swiss-modernist ledger: the page as an immaculate typographic document of record. Müller-Brockmann discipline applied to developer infrastructure — the visible grid *is* the brand argument ("we are precise").

**Layout.** Strict 12-column grid, 1200px container, visible hairline column rules at `rgba(0,0,0,0.08)`; content snaps to columns; asymmetric 5/7 splits; kickers in the leftmost column, content indented. Section numbers `01–07` oversized in the margin.

**Type.** Inter Tight (display 700, −0.04em, up to 8rem) + IBM Plex Mono (eyebrows, indices, code). Scale jumps: 16 → 24 → 32 → 96–128px.

**Metal.** Metal-as-ink: graphite text ramp (#17181a / #55565a / #9a9b9e), ONE foil-clipped word in the H1 ("every **language**" in silver foil §1.6), a single brushed-aluminum stat bar, steel hairlines. Restraint is the treatment.

**Motion signature — THE GRID ASSEMBLES.** On load, column hairlines draw down (scaleY from top, staggered), then hero lines mask-reveal into their cells. One pinned scrub section where content visibly re-flows across grid positions (elements tween x/y between column tracks) as the 5 Locadex steps advance. Supporting: line-mask reveals everywhere, mono kickers type in, `ScrollTrigger.batch` fades for lists.

**Mood.** Obys ("structure is emotional"), Vercel blueprint-grid precision, Linear's alpha-text ramp translated to ink-on-paper.

---

### 02 — `concrete-mono` (DARK)

**Concept.** Brutalist monospace: the page as a raw compiled artifact. No curves, no mercy — everything is a slab, a rule, or a stamp. The aesthetic says "this is heavy machinery that works."

**Layout.** Full-bleed rows separated by 2px white rules; zero border-radius; giant full-width type blocks that touch viewport edges; tables instead of cards (the SDK capabilities as an actual ruled table); dense header strip with metadata (`GT/2026 · SF · 118 LOCALES`).

**Type.** Space Mono (everything — display at 700 up to 7rem with −0.02em, forced uppercase headlines) + Archivo Black for 2–3 slab moments only. Mono tabular numerals everywhere.

**Metal.** Galvanized: large brushed-steel panels (§1.6 brushed) as section dividers, debossed code blocks, embossed stat slabs. No gradient text — metal is *material*, applied in slabs. Bevels obey one top light.

**Motion signature — THE STAMP.** Elements do not fade — they STAMP: `scale: 1.6 → 1` + `autoAlpha` in 2 frames with `steps(2)` easing, offset by hard 80ms staggers, each landing with a 1px page "thud" (y-jolt on a wrapper). Scroll reveals are hard cuts (`once: true`, no scrub). Supporting: ScrambleText on mono labels with charset `'01<>_/\\'`, marquee-free, hover states invert cells (black↔white) instantly.

**Mood.** basement.studio industrial print artifacts; Locomotive's type-as-architecture cropped at edges; Linear's "contrast does the work" pushed to violence.

---

### 03 — `maison-lingua` (LIGHT)

**Concept.** Luxury editorial serif — the localization house as a fashion maison. Vogue-spread pacing for infrastructure copy: enormous serif displays, hairline rules, silver-leaf accents. Proof that dev tools can be *beautiful* without losing precision.

**Layout.** Centered editorial column (max 1040px) alternating with full-bleed serif masthead moments; generous 180px section gaps; drop caps on manifesto paragraphs; small-caps mono folios (`No. 01 — THE AGENT`) as section markers; footnote-style asides.

**Type.** Fraunces (display, 144pt-class, optical size axis high, tight leading 0.95) + Inter (body/UI, mono-spaced small caps for folios via letter-spacing). Italic Fraunces for pull-quotes (Theo's testimonial as the centerpiece quote).

**Metal.** Silver-leaf: the hero word "language" foil-clipped (slow 8s foil-slide), hairline silver rules with tiny diamond terminals, a silver-leaf drop cap, buttons with 1px silver gradient rims. Everything else is ink `#141414` on cream-white `#faf9f7`.

**Motion signature — THE MASTHEAD MORPH.** A pinned hero where the giant serif word cycles languages — "language → langue → 言語 → Sprache" — each swap a line-mask reveal (old word slides up out of its clip, new slides in) scrubbed to scroll, with the foil glint position also scroll-linked. Supporting: slow line-mask reveals (1.2s expo.out), images/panels unveil via `clip-path` inset wipes, word-by-word opacity scrub on the manifesto paragraph ("Translations have to reflect the logic of an application…").

**Mood.** Obys editorial pacing ("silence between strong statements"), Chungi Yoo's air and warmth, the single-serif-moment rule from the inspo dossier executed as the whole identity.

---

### 04 — `mercury-core` (DARK)

**Concept.** Liquid-metal maximal: a living blob of mercury is the site's protagonist — the "one spectacular material" thesis (David Haz school). Language flows like metal: molten, reflective, indestructible.

**Layout.** Full-viewport hero with the goo front and center behind the H1; content sections float as chrome-rimmed glass panels over a continuous dark canvas; wide 1280px grid, panels overlap the section above by 64px for depth.

**Type.** Syne (display 700–800, up to 8rem, its odd geometry reads liquid) + Space Mono (labels, code).

**Metal.** Everything: CSS goo blobs (contrast-crush recipe §1.6) fused in the hero; conic chrome-text H1; rotating chrome rims (`--a` conic border) on CTAs and the code panel; pointer-lagged specular dot on the blob. Grain at 0.06 to keep it physical.

**Motion signature — THE MERCURY SPLIT.** Scroll drives the hero blob: it stretches, splits into 5 droplets that travel down the page (scrubbed y/scale along the master timeline), and each droplet docks beside a Locadex step — the metal literally delivers the pipeline. Reduced-motion: static blob poster. Supporting: chrome glint (`--gx`) scroll-linked on headlines, magnetic CTAs (elastic quickTo), sheen sweeps on panels.

**Mood.** David Haz liquid chrome; Lusion's "restraint around chaos" (wild material inside calm typographic scaffolding); Gradient Lab shader energy rendered in grayscale canvas.

---

### 05 — `tty-babel` (DARK)

**Concept.** Terminal/CLI aesthetic: the entire landing page is a session. GT's actual onboarding *is* `npx gt@latest` — so the site performs it. Monospace liturgy, scanlines, a cursor that never stops blinking.

**Layout.** Single centered 960px "terminal viewport" inside a brushed-steel bezel frame; sections are stdout blocks separated by prompt lines (`kevin@gt ~ %`); full-width ASCII rules (`════`); right-aligned mono annotations as `# comments`; nav as a tmux-style status bar (pinned top), footer as an exit code block.

**Type.** IBM Plex Mono (single family: 400/500/700; display headlines at 3.5–5rem, uppercase, −0.01em). Body text remains mono — leading 1.6 keeps it readable.

**Metal.** The bezel: brushed-aluminum frame around the terminal (§1.6 brushed + bevel shadows); silver-gray phosphor text ramp (#e8e8e8/#9a9a9a/#5a5a5a); faint scanline overlay (repeating-linear-gradient 3px); glints run along ASCII dividers.

**Motion signature — THE BOOT SEQUENCE.** Page loads as a boot: prompt types `npx gt@latest`, ScrambleText resolves package lines, a `[####----] translating…` progress bar draws (DrawSVG on a stroked rect), then `✓ 118 locales ready` counts up — all in ~1.6s, skippable, never blocking scroll. Each section "executes" on enter: its command types, output ScrambleText-resolves (`chars: '01<>_/\\'`, once). Supporting: blinking block cursor (steps(1) CSS), counters with `snap`, marquee of locale codes as a `tail -f` log line.

**Mood.** Vercel's Geist-mono engineer credibility; basement.studio HUD chrome; the founder's "loading micro-animations as delight" bookmark, executed as narrative.

---

### 06 — `bento-foundry` (DARK)

**Concept.** The bento grid as a metal foundry floor: one dominant showcase cell and satellite feature cells, every cell a machined part. The disciplined, commercial direction — closest to what dev-tools buyers expect, executed at craft level.

**Layout.** Hero (type-only, huge) then THE bento: max 7 cells, one 2×2 hero cell (the code snippet moment in an embossed chrome frame), 1×1 satellites for CDN/routing/editor/languages/pricing teaser; uniform 12px radius, 1px `rgba(255,255,255,.1)` borders, cell padding 32px; below, Locadex gets its own full-width row; 1140px container.

**Type.** Geist (display 600 up to 7rem, −0.03em — the Vercel voice) + Geist Mono (cell eyebrows, stats, code).

**Metal.** Per-cell spotlight (pointer-reactive radial, §1.6) with inertia; hover raises a conic chrome rim on the hovered cell only; the 2×2 cell's code window sits in a brushed/embossed frame; foil-clipped stat numerals (118, 1B).

**Motion signature — THE CELL CASCADE.** Cells assemble on first scroll-enter: a single `ScrollTrigger.batch` FLIP-feel entrance — each cell rises from y:48 with slight scale 0.96→1 and a one-shot sheen-bar sweep crossing it left→right as it lands, stagger 0.07 in reading order. It happens once, perfectly, and the grid is thereafter calm. Supporting: spotlight hover, counters in cells, magnetic primary CTA.

**Mood.** BentoGrids curation rules (hierarchy device, not mosaic); Linear cards with inner glow; Vercel's bordered-black cell system.

---

### 07 — `kinetic-verba` (DARK)

**Concept.** Kinetic typography: words are the only imagery. Type stretches, breathes, and reacts to scroll like a living instrument — the product is language, so letters ARE the product demo.

**Layout.** Type-only compositions edge to edge; headlines deliberately cropped by the viewport (Locomotive move); sections defined by scale shifts rather than boxes; narrow mono side-rail with scroll progress percentage; code snippet presented as a typographic exhibit (oversized line numbers).

**Type.** Archivo Variable (wdth 62–125, wght 100–900 — both axes animated) + IBM Plex Mono. H1 at 10rem-class desktop.

**Metal.** Chrome-clipped display type (conic chrome §1.6) whose glint position (`--gx`) is scrubbed to scroll — light travels across the letters as you read; non-display text in the alpha-white ramp; thin steel rules only. No panels, no cards.

**Motion signature — CHAR-LEVEL KINETICS.** The H1 "Launch in every language" splits to chars (`SplitText`, `smartWrap`); scroll velocity (from `window.lenis`) bends per-char variable-font weight and width via `quickSetter` on `font-variation-settings` targets binned into ~5 buckets (perf guard) — the headline literally flexes as you scroll and settles when you stop. Section headlines enter with char cascades (yPercent 60, stagger 0.02 from center). Supporting: word-opacity manifesto scrub, marquee of native language names at one break.

**Mood.** Zajno's assembling text; Unseen's type-as-material ("letters that catch light"); the bookmarked "notational space" novelty signal.

---

### 08 — `white-gallery` (LIGHT)

**Concept.** Museum minimal: GT's products exhibited as works in a bright gallery. Vast white walls, small engraved captions, silver frames. The confidence of showing almost nothing.

**Layout.** Enormous whitespace (240px section gaps); each product is an "exhibit": a framed artifact (code window, agent flow diagram, editor mock — all CSS/SVG) centered on white with a museum label (mono caption: title, medium, year — e.g. "Locadex, 2025. Autonomous agent on GitHub."); wayfinding numbers on the wall (`I → VII`); nav as a discreet top hairline.

**Type.** Instrument Sans (display 500/600, 5–7rem, −0.03em) + Instrument Serif (italic captions and the testimonial, museum-label style at 15px).

**Metal.** Silver exhibition frames: `metal-frame` conic-rim borders around every artifact; polished-steel plinth shadows (soft, single downward light); letterpress-paper captions (§1.6); ONE chrome sculpture moment — the hero's giant "GT" monogram rendered as chrome-clipped type on white.

**Motion signature — THE HORIZONTAL WALK.** The feature story is a pinned horizontal gallery: sections 3–6 live on a horizontal track (`x` scrub, 1px vertical = 1px horizontal, `containerAnimation` triggers per exhibit) — you *walk the gallery* past SDK → Locadex → Editor → CDN, each frame's caption fading in as it centers. On mobile the walk becomes a native swipe carousel. Supporting: slow clip-path unveils (curtain up), captions type in mono, gentle parallax (depth 0.1) on frames.

**Mood.** Aristide Benoist's stark B/W restraint; Obys quiet rooms; Linear's "expensive without ostentatious" flipped to daylight.

---

### 09 — `blueprint-atlas` (DARK)

**Concept.** Technical drawing / blueprint: the platform rendered as an engineering schematic — the i18n pipeline as a drafted machine. Made for the buyer who wants to see how it works.

**Layout.** Graphite sheet `#0b0d0f` with a faint 24px blueprint grid (5% white lines) behind everything; sections framed with drafting borders, corner ticks, and title blocks (bottom-right: `DWG NO. GT-004 · SCALE 1:1 · SHEET 4/7`); dimension lines with arrowheads annotate real numbers (118 locales, 5 steps); 1180px container.

**Type.** Space Grotesk (display 500/700, 5–8rem) + Martian Mono (annotations, dimensions, title blocks — small sizes, +0.08em).

**Metal.** Titanium drafting: silver stroke work (#c9ccd1 lines on graphite), steel measurement ticks, hero H1 with a subtle brushed vertical gradient; the one bright element is a white "signal" pulse (below). Grain 0.04.

**Motion signature — THE SCHEMATIC DRAWS ITSELF.** The Locadex section is a pinned, scrubbed DrawSVG set-piece: the 5-step pipeline (repo → scan → edit → translate → PR) drawn as a stroked SVG schematic that inks itself in as you scroll (`drawSVG: '0%' → '100%'`, staggered strokes, `ease: none`), followed by a brighter 12%-window pulse (`drawSVG: '0% 12%'` tweened along the path) that loops as a signal traveling the finished circuit. Supporting: dimension lines draw on enter (once), counters snap, hairline crosshair follows the pointer over the schematic (quickTo).

**Mood.** Vercel blueprint grid made literal; Active Theory HUD linework; basement.studio registration-mark metadata.

---

### 10 — `noir-spectral` (DARK)

**Concept.** Noir: a single moving light source in absolute darkness. No photography — drama is manufactured entirely with gradients. The page is a dark room; scroll is the flashlight.

**Layout.** Near-black `#060607` throughout; content staged in pools of light — one idea per viewport, centered or 1/3-offset; long vertical rhythm (each beat gets its own darkness before and after); nav minimal white-on-black; wide letter-spaced mono kickers like film title cards.

**Type.** DM Serif Display (display, 6–9rem, high-contrast strokes that catch "light") + DM Mono (kickers, captions, code).

**Metal.** Light IS the metal: a large specular radial gradient (soft white core → transparent) acts as the scene lamp; text inside the beam gets a scroll-linked foil glint pass; edges of panels catch 1px rim-light only on the lit side (consistent source); everything outside the beam sits at 15–24% white.

**Motion signature — THE LIGHT SWEEP.** One fixed radial "lamp" layer is scrubbed across the entire page (position keyframed per section on a page-long ScrollTrigger timeline): as you scroll, the beam glides to each section, and content *within the beam* brightens from 0.15 → 1 opacity word-by-word (SplitText words, scrubbed) while the previous section falls back into shadow (never below 0.35 — legibility floor; and with JS off, everything is fully lit). Supporting: testimonial staged as the interrogation-lamp centerpiece; CTAs are rim-lit metal-frame buttons; grain 0.06 for film stock.

**Mood.** Unseen's dark monochrome sheen; Lusion's theatrical staging; the inspo dossier's "consistent light source" doctrine as the entire concept.

---

### 11 — `silver-atelier` (DARK)

**Concept.** Metallic-foil fashion campaign: GT as a couture house, Locadex as the collection. Charcoal satin backgrounds, silver-foil headlines, lookbook pacing. Unapologetically glamorous infrastructure.

**Layout.** Runway column: centered, narrow (900px) with full-bleed foil mastheads between beats; lookbook cards for products (tall 3:4 panels); credits-style footer (two-column, small caps); editorial numbers (`LOOK 01 — THE SDK`).

**Type.** Italiana (display — hairline fashion caps, 5–9rem, +0.02em, uppercase) + Inter (body/UI 400/500; small caps eyebrows via tracking).

**Metal.** Full foil treatment: every masthead is foil-clipped with slow slides; satin panels (soft vertical charcoal gradients #16161a → #0c0c0e); the single iridescent whisper lives here — on the "Get a Demo" hover (§1.6 iridescent); hairline silver borders with diamond corners.

**Motion signature — THE LOOKBOOK STACK.** Products present as a stacked card deck: each lookbook card pins (`pinSpacing: false`), and as the next arrives the previous scales to 0.94, drops 2%, and dims under a shade overlay — cards stack like a deck being dealt; each incoming card gets one foil sheen sweep as it seats. Supporting: mastheads line-mask reveal at 1.2s expo, credits roll gently on enter, magnetic CTA with inner-label counter-drift.

**Mood.** FonsMans gradient-artifact luxury; Grainient's "brushed atmosphere"; Obys serif-moment glamour, monochromed.

---

### 12 — `notation-index` (LIGHT)

**Concept.** Experimental data/notation: the page as a musical score / annotated dataset of the translation pipeline. Ledger lines, playheads, index marks — "the notational space of possibilities is so underexplored" made real. The strangest direction; commit fully.

**Layout.** Paper `#f6f6f4` ruled like a score: faint horizontal staff lines run the full page; every element is indexed (`[001] HERO`, `[002] PROOF…`) with mono coordinates in the left margin; content sits ON the lines (baseline-locked); data readouts everywhere (scroll depth, section timecodes `00:00 → 04:32`); the Locadex flow notated as beats on a measure.

**Type.** Fragment Mono (all annotation, indices, readouts) + Inter Tight (display 700, 5–8rem, set tight against the ruled lines).

**Metal.** Graphite-and-silver instrumentation: black ink text, silver tick marks and ruler gradations (thin steel gradient lines), one chrome playhead (below), debossed "input wells" for code. Restrained — the notation is the spectacle.

**Motion signature — THE PLAYHEAD.** A vertical chrome line (the playhead) is fixed mid-viewport and the score scrolls beneath it: a page-long scrubbed timeline drives tick marks, timecode counters, and per-section "notes" (small silver nodes) that light as they cross the playhead — the page literally *plays* as you scroll, and section content reveals exactly on its beat. Supporting: counters with mono tabular snap, DrawSVG on staff flourishes (once), ScrambleText on index labels, hover shows an element's "metadata" tooltip (mono, instant).

**Mood.** thesephist's notation bookmark; basement.studio print artifacts on paper; Swiss discipline warped into an instrument.

---

### 13 — `isometric-works` (LIGHT)

**Concept.** Isometric technical illustration: the GT stack drawn as an exploded axonometric machine on white — SDK plane, CDN plane, agent plane, editor plane, hovering in ordered space. "Isometrymaxxing" with drafting-table sobriety.

**Layout.** White `#f8f8f7` with a faint isometric grid (30° lines at 4% black) in hero and diagram zones; hero splits 5/7 — copy left, big exploded-stack SVG right; sections alternate copy-diagram sides; 1220px container; captions leader-line into diagram parts.

**Type.** Chivo (display 700/900, 4.5–7rem, −0.03em) + Chivo Mono (part labels, callouts, code).

**Metal.** Machined faces: every isometric solid shades its three faces with three brushed-gray gradients (light top, mid left, dark right — one light source, top-left, always); silver leader lines with dot terminals; chrome edge highlights (1px white) on top edges only; foil on the hero's key numeral (118).

**Motion signature — THE EXPLODED ASSEMBLY.** The hero stack is a pinned scrub: four isometric platform layers slide in from offset positions (pure transforms along the 30° axes — translateX/Y pairs) and stack into the assembled machine, labels leader-drawing (DrawSVG) to each layer as it seats; scrolling on *disassembles* it into the first content section. Supporting: per-section mini-diagrams assemble once on enter (batch, 3–4 parts each), counters, subtle parallax between diagram layers (depth 0.1/0.2).

**Mood.** stfnco's isometric bookmark; Vercel diagram-precision; Chungi Yoo's spring warmth kept to a whisper (slight overshoot on the final seat: `back.out(1.2)`).

---

### 14 — `press-proof` (LIGHT)

**Concept.** Paper/print inverted: the site as a letterpress proof sheet fresh off the press — cream paper, ink-black type pressed *into* the surface, crop marks, a foil-stamped seal. Digital product, physical soul.

**Layout.** Paper `#f7f5f1` with full-page margins ruled by crop marks and registration targets in the corners; centered broadsheet measure (860px) for reading, full-width "poster" moments for display type; ink stamps as UI (the pricing "STARTER — $0" as a rubber-stamp block); dateline header (`SAN FRANCISCO — VOL. I`).

**Type.** Libre Caslon Text (display + body serif, display at 4.5–7rem with true italics for the testimonial) + Libre Franklin (UI, buttons, small caps kickers). Ink `#191817`.

**Metal.** Print-shop metal: letterpress-paper deboss on all display type (§1.6); ONE foil-stamped element — a circular silver seal ("GT · EST. MMXXIII · 118 LOCALES") with conic chrome fill and embossed rim; silver ink for rules and the `npx gt@latest` slug (rendered like a typeslug in a debossed tray); grain 0.04 as paper tooth.

**Motion signature — THE SHEET FEED.** Sections arrive like sheets through a press: each section reveals with a `clip-path` inset wipe top→bottom (expo.inOut, 1.1s, once) while a thin platen-roller shadow line sweeps just ahead of the reveal edge; display headlines then "press" in — a 1-step scale 1.02→1 + deboss shadow snap, like type biting paper. Supporting: crop marks draw (DrawSVG) on section enter, the seal slowly rotates (CSS, 40s), ink-spread hover on links (underline thickens from center).

**Mood.** Obys print-editorial digital narratives; basement.studio crop-mark schtick inverted to daylight; "grainient" texture as paper rather than atmosphere.

---

### 15 — `field-magnet` (DARK)

**Concept.** Magnetic cursor world: the page is a magnetized field of iron filings and steel elements that feel the visitor's presence. "Alive through interaction" as the entire thesis — GT's pull on developers, made literal.

**Layout.** Open dark field `#0a0a0b`, no cards: content islands float with big gaps; a full-page canvas particle layer (small gray dashes = filings) sits behind everything; hero centered; sections loosely centered with generous drift room; nav links spaced wide (they're magnets too).

**Type.** Manrope (display 800, 5–8rem, −0.04em) + JetBrains Mono (labels, code, coordinates readout of cursor position in the footer).

**Metal.** The filings: ~600 canvas dashes in grays (#3a3a3a–#8a8a8a) that rotate to point at the cursor within a radius (lerped, cheap: rotation only); chrome ball cursor-follower with `mix-blend-mode: difference`; magnetic buttons with chrome rims; H1 gets a specular gradient that tracks the pointer horizontally.

**Motion signature — THE MAGNETIC FIELD.** Everything interactive is magnetized (`quickTo` elastic, strength ≤0.35, inner labels at half-strength), the filing field re-orients around the pointer with inertia, and elements within 160px of the cursor drift ≤6px toward it (repelled on click — a tactile "snap"). Desktop-only; on touch, the field animates in slow ambient waves instead. This is the rare direction where scroll is quiet (batch fades only) — the cursor is the show. Supporting: blend-mode cursor grows over targets, ScrambleText coordinates readout, one-shot filing "shockwave" ripple when the primary CTA is clicked.

**Mood.** Lusion's cursor-reactive world; Resn's single-toy-per-view discipline; yanliudesign's "alive through interaction" bookmark verbatim.

---

### 16 — `orbital-chrome` (DARK)

**Concept.** One engineered light source: a single flawless chrome orb — the "world" GT ships your product to — travels the page as its only companion. Vercel's luminous-triangle strategy, reborn as a planet of mercury.

**Layout.** Deep black `#07080a` with a barely-there dot grid (6%); hero: orb right-of-center behind a left-aligned H1 (5/7 asymmetric); the orb persists as a fixed-layer element repositioned per section (beside the code panel, orbiting the Locadex flow, shrinking to a pupil beside the editor bullets, setting like a sun behind the closing CTA); 1120px content grid.

**Type.** Hanken Grotesk (display 700, 5–9rem, −0.045em, Linear-class) + JetBrains Mono (eyebrows, stats).

**Metal.** The orb: layered radial gradients (bright specular dot top-left, mid-tone body, dark limb, faint white rim-light bottom-right from "bounce light") + a soft elliptical ground shadow; its light contaminates nearby UI — panels facing the orb get 1px rim-lines and slightly lifted text alpha on the orb-facing side. Everything else near-black with alpha-white text ramp.

**Motion signature — THE ORBIT.** A page-long scrubbed master timeline drives the orb's x/y/scale between per-section keyframe "stations" (transform-only, lerped by scrub 1) — it drifts, never jumps; its specular dot micro-lags the pointer (quickTo, ±6px) so the sphere always feels lit from *your* side. Supporting: line-mask headline reveals, spotlight-hover cards, counter for "1,000,000,000 users" as the orb swells beside it, orb "sunset" crossing the horizon rule in the closing CTA.

**Mood.** Vercel's single luminous element on black; Linear's barely-there gradients; Active Theory's persistent canvas continuity.

---

### 17 — `schematic-rail` (DARK)

**Concept.** Industrial spec sheet: the page as a factory rail system — a continuous steel spine runs the entire scroll, and every section is a station on the production line ("push → scan → edit → translate → PR" scaled to the whole page). Print-shop artifacts everywhere: barcodes, part numbers, registration marks.

**Layout.** A visible vertical steel rail (4px, polished gradient) runs down the left third of the viewport for the entire page; sections dock onto it at node points (chrome rivets); right side carries content in ruled blocks; mono part-number plates on every module (`PART NO. GT-SDK-06 · QTY 118`); barcode motifs (CSS repeating-linear-gradient) as decoration; heavy condensed headlines break the grid horizontally.

**Type.** Anton (display — massive condensed caps, 6–10rem, cropped by viewport edges) + Azeret Mono (plates, labels, specs, code).

**Metal.** Zinc and steel: the rail itself is the hero metal (vertical brushed gradient + specular edge); rivet nodes are small radial-chrome studs; galvanized plate panels (subtle mottled gray radial blends + grain); embossed stamps ("QA PASSED — VISUAL"); silver barcodes.

**Motion signature — THE SIGNAL ON THE RAIL.** A bright pulse (short white gradient window) travels down the rail tracking exact scroll progress (scrubbed `--pulse-y` custom property page-long); when it reaches a station node, the node's rivet flares (scale+glow once), its plate stamps in, and its section content batch-reveals — arrival at each station *is* the reveal trigger. Supporting: DrawSVG connector spurs from rail to content, ScrambleText part numbers, velocity-tilted plate hover (±3°), footer as the end-of-line buffer with a final stamp: "SHIPPED IN EVERY LANGUAGE."

**Mood.** basement.studio's industrial print voice at full volume; Locomotive's pin-release precision; Vercel grid rigor under the grease.

---

### 18 — `film-negative` (ALTERNATING)

**Concept.** The inversion story: the page alternates black and white sections like frames of a film negative — dark room / light room / dark room — and the *transition between them* is the identity. Translation as inversion: same content, opposite rendering, perfectly preserved meaning.

**Layout.** Strict alternation: hero black → proof white → code black → Locadex white → editor black → pricing white → CTA black; full-bleed sections, content centered at 1080px; each section carries a frame edge motif — sprocket-hole squares running down both margins (CSS), frame counter (`FR 01 → FR 07`) top-right; type flips ink color with the ground.

**Type.** Bricolage Grotesque (display 700/800, 5–8rem, its quirk reads cinematic) + IBM Plex Mono (frame counters, sprocket labels, code).

**Metal.** Silver-halide: heavy grain (0.07 — this is the grainiest direction) as film stock; the wipe edge between sections is a literal chrome sliver (a 6–10px foil-gradient bar riding the transition line); headlines on black get a faint silver bloom (text-shadow at 8% white); on white, letterpress graphite.

**Motion signature — THE INVERSION WIPE.** Section boundaries are pinned wipe transitions: as you scroll across a boundary, a full-viewport `clip-path` wipe (scrubbed, edge riding with the chrome sliver) develops the next section over the current one — black develops into white like photographic paper in the bath; text near the edge sits in a `mix-blend-mode: difference` layer so glyphs invert mid-wipe, staying legible throughout. With JS off, sections are simply stacked in their own colors. Supporting: sprocket holes tick past (scrub), frame counter increments (snap), grain constant, one "double exposure" moment — the testimonial ghosted over both grounds at a boundary.

**Mood.** Aristide Benoist's shared-element continuity philosophy applied to whole frames; Zajno's flow-transition bookmark energy; Obys loud/quiet pacing enforced by physics.

---

### 19 — `flipboard-terminus` (DARK)

**Concept.** The split-flap departure board: GT as the international terminal where every product departs to every locale. Solari-board tiles clack through characters; languages are destinations; "ON TIME, EVERY LANGUAGE."

**Layout.** Charcoal terminal-hall `#0c0d0e`; hero is a giant split-flap board (each character a beveled aluminum tile) spelling the H1; below, the proof section is a departures table — `DESTINATION / GATE / STATUS` rows (ESPAÑOL / A3 / TRANSLATED · 日本語 / B7 / TRANSLATED …); sections are "boards" with tiled headers; wide tabular layouts; airport wayfinding arrows and pictogram-free signage rules.

**Type.** Overpass (display 700/900 — designed for signage, 4–7rem, all-caps on boards) + Overpass Mono (tiles, tables, gate numbers). Tile glyphs are monospaced by design.

**Metal.** The tiles: every flap cell is brushed aluminum (§1.6 brushed at small scale) with a horizontal split-line, top-half catch-light and bottom bevel shadow; the board frame is a dark steel chassis with rivets; status text in off-white on tile-black; one amber-free rule — status "TRANSLATED" renders as pure white on steel (no airport amber; monochrome law).

**Motion signature — THE FLIP CASCADE.** Characters change by split-flap physics: stepped cycling through 4–8 intermediate glyphs (`steps(1)` timed swaps + a two-frame half-flip scaleY fold on each change), cascading left→right at 30ms/char. The hero board flips in on load (≤1.6s), then re-flips the rotating language word every few seconds; the departures table flips rows in on scroll-enter (once per row); stats flip like gate changes. Rendered with real text nodes (accessibility) under `aria-live` discipline; reduced-motion shows final strings. Supporting: soft hall reverb implied by slow ambient light gradient drift, mono clock in the nav (live `HH:MM`), marquee "NOW BOARDING: 118 LOCALES" ticker.

**Mood.** The "novel notation" bookmark as physical signage; basement.studio industrial chassis; the loading-animation-as-delight signal — every flip is a micro-delight.

---

### 20 — `typographic-broadcast` (DARK)

**Concept.** The velocity marquee: GT as a global broadcast tower streaming language around the planet. Ticker rows of type are the architecture — headlines run as chyrons, and the whole page's energy is bound to how fast you scroll.

**Layout.** Full-bleed horizontal bands stacked down the page: giant marquee headline bands (viewport-height class) alternate with static "bulletin" bands carrying body copy and artifacts; a persistent thin ticker (locale codes: EN · ES · FR · JA · DE · ZH …) pinned under the nav runs the entire session; code snippet framed as a "live feed" monitor; hard band separators (2px white rules).

**Type.** Bebas Neue (marquee display — tall condensed caps at 8–12rem in bands) + Inter (bulletin body/UI 400/600; mono-style tabular via `font-variant-numeric` for the ticker).

**Metal.** Chrome tickers: marquee band text is foil-clipped (§1.6 foil, but position driven by band motion, not keyframes); band edges carry thin steel rails; the live-feed monitor sits in a metal-frame conic rim; signal-strength meter motif (5 ascending silver bars) as the recurring icon.

**Motion signature — VELOCITY-BOUND MARQUEES.** Every marquee band loops seamlessly (two copies, `xPercent: -50`, alternating direction) with its `timeScale` bent by live Lenis scroll velocity (clamped ±4, eased back to 1) — scroll fast and the broadcast surges, stop and it settles to a calm drift; simultaneously the page content skews ±2° with velocity (quickTo on a wrapper, settling elastic). All loops pause offscreen. Supporting: chyron lower-third reveals for section intros (bar wipes in, text follows), counters as "viewership" stats, station-ident stamp ("GT — LANGUAGE INFRASTRUCTURE FOR THE INTERNET") between bands.

**Mood.** Locomotive's kinetic type authority; Zajno custom-easing craft; the founder's "occasional bold pop against restraint" delivered as motion energy instead of color.

---

## APPENDIX — BUILD CHECKLIST (every sample, before ship)

1. All six vendor scripts loaded relative (`../vendor/…`); `window.lenis` set; one rAF loop; zero console errors.
2. ≤2 Google Fonts families via `<link>`; zero other external requests (open DevTools Network to verify); no remote `<img>`.
3. All 10 narrative beats present with real copy (§1.2); competitor names absent; no "Team" plan; no lorem ipsum.
4. `prefers-reduced-motion: reduce` → no Lenis, no pins, content fully visible; JS-disabled load is fully legible.
5. 1440px and 390px both flawless: no horizontal overflow, pinned sections degrade, tap targets ≥44px.
6. Typography audit: display ≥4rem desktop, tracking triad (−display / 0 body / + caps-mono), section gaps ≥128px desktop.
7. Monochrome audit: no hues outside grayscale except the single sanctioned iridescent hover (if used); one light source; grain over large gradients.
8. Motion audit: one signature set-piece + ≤3 supporting patterns; entrance reveals `once: true`; loops pause offscreen; `ease: 'none'` inside scrubs; no markers.
