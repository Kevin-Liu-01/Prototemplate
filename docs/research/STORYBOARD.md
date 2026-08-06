# GT Website Redesign — MASTER STORYBOARD (overrides everything else)

This is the founder's exact narrative spec. Every sample MUST implement this page structure and
these story beats. Where DESIGN_BRIEF.md Part 1 conflicts with this document, THIS DOCUMENT WINS.
DESIGN_BRIEF.md remains authoritative for: the black/white/metallic aesthetic mandate, the 20 art
directions (each sample varies visual execution, typography, texture, and motion flavor — never
the narrative), the metallic CSS cookbook, and the technical contract.

---

## Visual references (from the founder's X posts — studied via screenshots)

### Ref A — Hero mechanic ("Speech to Text" by @benjitaylor)
A dark rounded window split by a thin vertical hairline at dead center. LEFT half: a smooth
multi-strand white waveform (a bright lead line with layered ghost/echo strands fading behind it)
flowing toward the center. AT CENTER: a circular ring/lens straddling the hairline — gray track
ring with a bright white arc segment animating around it (like a progress/processing indicator),
tiny numerals (1, 8, 9…) scattered near the ring. RIGHT half: the signal has become a cloud of
discrete scattered glyphs — letters, numbers, symbols ($, B, U+, Q, @, 2, #, →) at varying sizes
and opacities, drifting outward and fading with depth. Metaphor: continuous input → processed
through a circular gate → discrete output. Black background, white/gray elements only, extremely
restrained and premium.

> **ADDENDUM (LAW, added mid-run): Read `AESTHETIC_ADDENDUM.md` in this directory.** The founder
> supplied canonical references: Resend.com's sleek machined-metal dark aesthetic is the AMBIENT
> base of every page, and the prismatic burst below is the LIGHT. The addendum defines both
> precisely and how they combine. Critics must judge against it FIRST; builders/refiners must
> implement to it.

### Ref B — Hero background ("Enter to Other Dimension" by @sabosugi, three.js/WebGL shader)
An iridescent prismatic light-field on black: anisotropic light streaks radiating outward
(warp-tunnel / light-speed feel) from a dark center, colored like oil-slick / CD-diffraction —
desaturated rainbow (steel blues, golds, violets, greens) reading as METALLIC spectral dispersion,
not candy color. Dense fine-grained streak texture (brushed-metal-like), darker at center and
bottom, brightest in a horizontal band. This is the "metallic" of the brand: light dispersed
through a prism. Implement as a canvas shader (raw WebGL or 2D-canvas approximation) or layered
CSS (conic/linear gradients + turbulence grain + blur), animated slowly. It sits BEHIND hero
content, dimmed so white type stays perfectly legible. NOTE: the landing WIP already has a
component named PrismaticField.tsx — this is the same idea; samples reinterpret it per direction.

### Ref C — The story-window UI (by @dakshpixelup, "early exploration")
An off-white paper canvas (#f4f4f2-ish) covered with a fine dotted/diamond grid and dashed
hairline column guides — a blueprint/design-tool canvas. Top-left: a BLACK rounded chip/tab
holding the white logo (the black tab has an inverted-radius "browser tab" corner blending into
the canvas). Small outlined pill labels in uppercase mono ("HOW IT WORKS" with a tiny icon chip).
Huge near-black display sans headlines. Section labels like "THE HIGH STAKES //" (uppercase, small,
with trailing slashes). Body-size lines pair a bold sans with a GRAY ITALIC SERIF second line
(elegant contrast). Diagram motif: diamond lattice of connected nodes (circles joined by thin
lines) rendered with a HALFTONE dot texture. Giant stat numerals ("12%") with small lowercase
labels ("faster results"). One instance of the node diagram uses a soft multicolor gradient
(green/blue/orange) as a deliberate color pop against the monochrome. Dashed hairlines divide the
canvas into cells. This look defines the ACT II website-window.

### Motion philosophy ("fieldtheory")
Flowing items move along smooth flow-field paths (curved streamlines, not straight conveyor
belts): variable speeds, gentle vertical drift, ghost trails, depth via scale/opacity/blur.
Everything feels alive through interaction and animation (founder's bookmarked philosophy).

---

## THE PAGE, in order

### 0. Nav
Slim fixed nav: GT wordmark, links (Docs, Pricing, Blog, Dashboard…from content inventory),
CTA button. IMPORTANT: in Act II the nav (or a clone of it) morphs into the black floating dock
of the story window (GSAP FLIP-style shared-element morph). Design nav so this morph is plausible.

### 1. HERO — "english stuff → | GT | → stuff, in other languages"
Full-viewport. Prismatic field background (Ref B), dimmed.
Three-part composition (Ref A mechanic):
- LEFT: a stream of ENGLISH artifacts flowing rightward along flow-field paths: real UI
  components (button "Get started", a pricing card fragment, a toast "Payment received", nav
  labels, form field "Email address", plain copy lines) AND Theo's testimonial card (avatar circle,
  "Theo — CEO, T3Chat", quote: "Every once in awhile, I see a snippet of code that makes me a bit
  emotional. Now is one of those moments. Internationalization went from \"$%!# this\" to
  \"trivial\".") drifting through as one of the items.
- CENTER: the GT gate — a circular ring/lens straddling a vertical hairline, GT mark inside,
  animated processing arc sweeping the ring. Items visually pass through it (fade/blur at the
  gate, re-emerge transformed).
- RIGHT: the SAME components re-emerge translated — the button now "始める", the toast "Paiement
  reçu", the form field "Correo electrónico", Theo's card in Japanese/Spanish — dispersing outward
  with depth (varied scale/opacity), glyph particles (kanji, hangul, arabic, devanagari chars)
  scattered between them like Ref A's letter cloud.
- Headline + subhead + primary CTAs overlay this scene (copy from landing-content.md), positioned
  so the stream reads clearly.
- MIDDLE of hero, below the streams: "100+ languages supported" strip WITH FLAGS (marquee or
  chip-grid of flags + language names).
- Below that, SMALLER: "Trusted by" row with the ACTUAL companies from landing-content.md
  (text wordmarks fine; never invent customers).

### 2. ACT II — THE STORY WINDOW (long pinned scroll section, GSAP scrub + Lenis)
On scroll, a website-window mockup (Ref C canvas style: paper, dot grid, dashed guides, black
corner chip) scales/rises into view. It shows a demo website (a plausible small marketing page)
where every text node has a tiny NUMBERED MARKER pin next to it (1,2,3…), some with badges:
"context", "requires review". The site nav morphs into a floating BLACK DOCK centered low in the
window; the dock is the story's caption bar, first reading: "gt helps you…". Each beat swaps the
dock caption and plays a scene inside the window (scrubbed to scroll):

- Beat 1 — "GT knows your context." Little pellets (dots) detach from ALL the numbered markers
  across the demo page and stream into the dock/GT core (ingestion).
- Beat 2 — "GT does your translating." Camera zooms into one text block; GT flags it
  ("translate"), then generates the translation in place (scramble/typewriter into Spanish or
  Japanese), visibly "using" the ingested context.
- Beat 3 — "Around any component." Zoom into a BUTTON; a vertical slider/wipe reveals the code
  behind it: the button JSX wrapped in <T>…</T>; as the wipe closes, the button label renders
  translated.
- Beat 4 — "With your own context." Zoom into a copy/writing component; same slider reveal but
  the tag shows <T context="Playful, upbeat marketing tone">; GT reads the context and the
  translation lands with the right tone (show a small "tone: upbeat ✓" affordance).
- Beat 5 — "With your review." A component carries a "requires review" tag; a line/webhook fires
  from it to a notification card pinging a LAWYER: "Review this translation!" (approve UI).
- TRANSITION — keep scrolling: the translated text FLICKERS back to the source language, then the
  whole window flips/morphs into a CODE WINDOW (editor chrome, mono type). "This is where Locadex
  comes in."

### 3. ACT III — LOCADEX (continues inside the code window, still scrubbed)
- Beat 6 — Code is pushed: commit + PR chip appears top-left of the window; this triggers the
  workflow; Locadex SCANS the code (scanline sweep over the lines).
- Beat 7 — Locadex maps what changed: numbered marks appear on specific code lines; these are
  HOVERABLE/INTERACTIVE after the scene settles — hover shows Locadex's notes (tooltip cards).
- Beat 8 — It edits code: the agent internationalizes strings (diff-style green/red line edits
  animating in), then creates translations in context.
- Beat 9 — A DIFF WINDOW slides in from the right; an "Open PR" button; the Locadex CURSOR
  (a labeled agent cursor) descends and CLICKS it; "Pull request created for review" → merged.
  The view returns to the demo website — now fully translated.

### 4. ACT IV — "thoughts?" — THE REVIEW WORKSPACE
Scroll out of the window (unpin). Dashboard/editor view section:
Heading idea: "Agents write translations. You review, edit, and approve in a focused workspace."
Show visually: (a) side-by-side source ↔ translation panes; (b) diffs when translations are
regenerated; (c) editing translations before or after they go live (edit affordance + "live" pill).

### 5. ACT V — FEATURES GRID (8 cells, EXACT copy below; bento-style encouraged)
1. Libraries / Code — "Developer-first libraries for React, Next.js, and more, battle-tested in production apps with millions of users."
2. Platform / Context — "Glossaries, locale rules, and custom prompts. Control tone, terminology, and regional nuance."
3. AI / Translation — "AI agents that understand your project structure and localize your content in context."
4. Middleware / Routing — "Automatic language detection and locale-based routing. SEO-friendly paths with zero configuration."
5. Edge / Delivery — "A global, low-latency translation CDN. Push over-the-air updates without redeploying your app."
6. Dashboard / Previews — "Preview translations in development before they go live. Catch issues early and ship with confidence."
7. Runtime / Live Translation — "Translate user-generated content on demand, with low latency and full context."
8. Config / Customization — "Build your own language detection functions, locale-specific components, and formatting logic."

### 6. Close
Pricing teaser (from landing-content.md), closing CTA, footer (real links).

---

## PER-SAMPLE DIRECTIVES (founder additions, mid-run — critics MUST enforce on the samples named)

The founder supplied four more references (studied via frames). These are LAW for the samples
assigned; other samples may adopt them too.

### D1 — THE RESIZING DOM (GLOBAL — every sample, this is now a core beat mechanic)
A labeled LOCADEX CURSOR (small agent cursor with a name chip) hops around the demo website in
the story window: it highlights a text node, translates it in place, then hops to the next and
the next. THE POINT: when text changes language, its length changes — so the surrounding DOM
VISIBLY RESIZES with buttery FLIP-style transitions: buttons widen for German, cards grow taller,
nav items reflow, a badge wraps to two lines then the row re-balances. The layout must be seen
BREATHING as translations land. Mandatory wherever translation happens in-place (Beat 2, the
cursor-hop sequence, and the post-merge translated-site return). Cheap version (text swaps with
no container resize) = automatic fail. Implement: measure before/after, animate width/height/
position with GSAP FLIP technique (getBoundingClientRect diffs), 350-600ms power3 easing.

### D2 — CLEAN BENTO (samples 06-bento-foundry and 01-grid-of-record; others may adopt)
Reference (@mehedihnux): muted 3+2 bento — three equal cards over two wide cards, generous
gutters, dotted-grid bands above/below the section, centered pill kicker ("Features"), two-tone
headline (dark first line, gray second), each card = soft panel containing a MINI PRODUCT MOCKUP
(tiny floating windows/diagrams with ONE accent color) + title + 2-line muted description.
Principle from the thread: "scan, latch onto one block, then read — muted cards with a single
accent color keep it scannable." Apply to the ACT V 8-feature grid: visual mockup INSIDE every
card (mini code window, mini flag chips, mini diff view, mini CDN map…), never text-only cells.

### D3 — ONE STUNNING DIMENSIONAL HERO OBJECT (lesson for all; explicit for 04 and 13)
Reference (@pankajstwt showcase): the best landing pages carry ONE dimensional showpiece object —
a particle-cloud orb (dithered/halftone sphere), a blueprint voxel cube-cluster, an isometric
card pipeline — on a clean canvas with mono stat labels (50B+ / 70+ / 40+ pattern) and a serif
accent word. 04-mercury-core: hero = particle/chrome orb (canvas, thousands of dots forming a
sphere that breathes/reforms). 13-isometric-works: hero = dithered VOXEL cube-cluster in
blueprint blue-on-white assembling cube by cube. Every sample: use the mono stat row pattern
(118 languages · 1,000,000,000 users · 6 frameworks · $0 to start) somewhere prominent.

### D4 — TYPE-METRICS DIAGRAMS THAT MORPH ACROSS LANGUAGES (samples 03, 09, 12; others welcome)
Reference (@danhollick / makingsoftware.com): glyph diagrams with gray filled letterforms,
visible bezier control points (dots on the outline), labeled hairline metric guides in tiny mono
caps — CAP HEIGHT/ASCENDER, X-HEIGHT, BASELINE, DESCENDER — green sidebearing bands, a legend,
ruler-tick margins. Build one as a LIVE SVG section: a word ("Hello") drawn with its metric
lines, which MORPHS outward and EXTENDS to show language differences: swap to こんにちは (guides
slide — no descenders, taller x-box), to مرحبا (RTL flip, connected baseline), to Übersetzen
(the measuring lines EXTEND to show +35% German expansion, container stretching with it — tie
into D1's resizing theme). Labels animate to name what changed. This is the storyboard's "GT
knows typography across languages" proof moment — place it in/near Act IV or V.

### D5 — RINGWRITER closing (sample 16-orbital-chrome owns it; usable as closing CTA elsewhere)
Reference (@edo_lunardi "Ringwriter"): a phrase coiled across 6-9 concentric SPINNING rings of
uppercase mono type on near-black — each ring rotates at a different speed/direction, brightness
falls with radius (inner brightest), fine dotted guide rings between, a central ring gauge with
a bright arc segment. Interactions: cursor proximity melts glyphs into dots; click (or
hold-release) fires a ripple outward that kicks each ring's rotation as it passes. For GT: the
rings carry "LAUNCH IN EVERY LANGUAGE" translated into many languages (one language per ring —
EN, ES, JA, DE, FR, ZH, AR, KO…), GT mark at center. 16-orbital-chrome must make this its hero
or closing CTA; it also makes a superb closing for any dark sample.

## Non-negotiables for every sample
- The full beat list above, in order, driven by GSAP ScrollTrigger scrub + Lenis smooth scroll.
- Nav→dock morph; numbered markers; pellet ingestion; the two <T> slider code reveals; the
  lawyer review ping; flicker-to-source transition; PR chip; hoverable Locadex notes; the diff
  window + agent cursor clicking "Open PR"; return-to-translated-site.
- Theo's real quote card flowing through the hero gate.
- "100+ languages" flag strip inside the hero; real trusted-by companies smaller below it.
- The 8-feature grid with the copy verbatim.
- Black/white/metallic. The prismatic field (Ref B) is the canonical metallic; each direction may
  reinterpret its intensity/placement but the hero must have an atmospheric field background.
- Beats must be READABLE in static screenshots at every 10% scroll depth: each beat's caption +
  scene state should be unambiguous mid-scrub. No beat may be skippable-blank.
- prefers-reduced-motion: beats degrade to static labeled panels, all content legible.
