# VERSION 10 — "Toolchain" (slug `toolchain`)

A **new, tenth direction**: the minimalist option. A natural evolution of the existing General
Translation website — same restraint, same credibility — but with far better graphics and
diagrams, new geometry, and modern bento/grid composition. Visual references the founder named:
**oxc.rs** and **viteplus.dev**. Typeface: **Switzer** (with Inter for body text).

This version does NOT chase the cinematic/metallic language of the other nine. It wins on
clarity, structure, and the quality of its illustrations.

---

## The structural system (studied from both references)

**A bordered column, not a background.** Content lives in a centered column (max ~1170px) framed
by **vertical hairline rules on both sides** that run the full page height. Sections stack inside
it, separated by **horizontal hairline rules**. The page reads as one continuous ruled document.

> **NO GRID BACKGROUNDS.** No dot grids, no graph paper, no blueprint fields, no plotter marks.
> The founder was explicit. Structure comes from the column rules and the section dividers only.

**The grid shells differ from cell to cell** — this is the founder's specific ask, and it is what
makes both reference sites feel designed rather than templated. Never render eight identical
cards. Rotate deliberately between shell types:

1. **Split row** — text on the left (heading, one supporting line, a short checkmark list with
   inline code chips, a small outline button), visual on the right.
2. **Full-bleed visual cell** — the visual runs to the cell's edges with no padding, often over a
   soft textured backdrop, with a code/terminal window floating on it.
3. **Inset panel cell** — a padded, hairline-bordered surface holding a code block or terminal
   output, with a copy affordance.
4. **Three-across row** — three narrow cells, each a short heading + one line + a small visual
   (chip row, framework marks, a small isometric object).
5. **Stat cell** — rows pairing a small isometric icon with a large number and a quiet label
   (the `147m+ / weekly npm downloads` pattern), or horizontal **benchmark bars** with timings.
6. **Plain text cell** — heading and a tight bullet list, no visual at all. Empty space is a shell
   type; use it so the rhythm can breathe.

Cells vary in **width and height**; rows alternate 1-up, 2-up, and 3-up. Asymmetry is the point.

### The nested frame — this version's signature detail (REQUIRED)

Content-bearing cells are **a box inside a box**. The grid cell is a thin mat holding a rounded
inner card, so a precise 2px reveal of the mat runs all the way around the content — like a
mounted print.

- **Outer cell (the mat)**: hairline border, `padding: 2px` (Tailwind `p-0.5`) and nothing else.
  Its own surface sits one step off the page background. Radius slightly larger than the inner
  card's so the two nest optically (roughly 4-6px).
- **Inner card**: `border-radius: 2px` (`rounded-xs`) with the NORMAL content padding
  (~20-24px), on its own surface colour, holding the actual content.

```css
.tc-cell {            /* the mat */
  border: 1px solid var(--tc-rule);
  border-radius: 5px;
  padding: 2px;
  background: var(--tc-mat);
}
.tc-cell > * {        /* the card */
  border-radius: 2px;
  padding: 1.375rem;
  background: var(--tc-card);
}
```

**Apply it ONLY to cells that carry something visual** — diagram cells, code/terminal panels,
stat and benchmark cells, full-bleed visual cells, and three-across cells that hold a visual.

**Never apply it to text-only cells.** A cell that is just a heading and a line or a bullet list
stays flat and unframed, sitting directly on the page. The contrast between framed content and
unframed text is what makes the device read as deliberate rather than as a uniform card grid.

### Horizontal diagonal spacers (REQUIRED)

Insert **horizontal spacer bands ruled with diagonal hatching** between major section groups:

- Full width of the ruled column, edge to edge between the vertical rules.
- Roughly 28-44px tall, bounded above and below by the same hairline rule used elsewhere.
- Filled with 45-degree repeating hairlines:
  `repeating-linear-gradient(45deg, var(--tc-rule) 0 1px, transparent 1px 8px)`
- Very low contrast — this is breathing room with texture, not ornament competing for attention.
- Insert them between **specific rows** to control rhythm — not between every row. Placement is a
  compositional decision: use them where the page should take a breath before changing subject.

> These bands are NOT a violation of the no-grid-backgrounds rule. The prohibition is on grid,
> dot, and graph-paper fields sitting *behind content*. These are bounded, content-free spacer
> strips between sections, and they are explicitly required.

## Illustration language — "new geometries"

This is where the version earns its place. Build a coherent set of **isometric / axonometric
line-art objects** rendered as inline SVG:

- Stacked translucent planes (a locale stack), thin-stroke cubes, extruded slabs, layered cards
  peeling apart, a low-poly globe as a wire meridian cage, a routing tree, a lattice.
- Mostly **thin strokes on the page background**, minimal fill; one restrained accent used
  sparingly on a single element per illustration.
- They must feel like a **family**: consistent 30° axonometric projection, consistent stroke
  weight, consistent corner radius, consistent light direction.
- Each of GT's eight features gets its own object (SDK stack, glossary/context, translation flow,
  locale routing tree, edge CDN globe, preview panes, live runtime, config).
- Also build **benchmark bars** and **stat rows** as reusable primitives — data as illustration.

Adapt the shared `diagrams/` components where they fit, but this direction wants dimensional
isometric geometry rather than flat schematic line-art, so new work is expected here.

### The animated language diagrams (REQUIRED — this is what makes the page about translation)

The isometric objects describe *infrastructure*. They do not show what GT actually does to
language. Build a second family of **animated, translation-specific diagrams**. These are the
most important illustrations on the page — a localization company's site should demonstrate
localization, not draw cubes.

Required, at minimum:

1. **SentenceWidth** — the signature one. A sentence sits in a measured container. As the locale
   cycles (English → Deutsch → 日本語 → العربية), the text becomes the real translation AND the
   container animates its width to fit: German runs long, Japanese runs short, Arabic flips to
   right-to-left. Measure ticks and a delta label (`+35%`, `−20%`) mark the change. This makes
   text expansion — the thing that silently breaks layouts — visible and obvious.
2. **WordMorph** — single words transforming between languages in place, letter by letter, so a
   reader watches "Settings" become "Configuración" become "設定".
3. **ScriptSampler** — one word rendered simultaneously across many scripts (Latin, Cyrillic,
   Greek, Arabic, Devanagari, Han, Hangul, Thai), drifting gently at varied depths.
4. **ExpansionBars** — horizontal bars ranking languages by text-expansion factor against
   English. Data as illustration; pairs naturally with SentenceWidth.
5. **PluralForms** — the same count rendered under different plural rules (English's two forms
   against Polish's four, Japanese's one), showing why naive string concatenation fails.
6. **RtlMirror** — a small UI block flipping from left-to-right to right-to-left, mirroring
   layout, icons and alignment together.
7. **ContextResolve** — one ambiguous source word resolving to two different translations
   depending on a `context` tag. This is GT's actual differentiator, so make it legible.

Rules for the family:
- **Animate with GSAP inside `useGSAP`**, transform/opacity only, looping gently and slowly
  enough to read. They should feel alive but never restless.
- **Use real translations** — correct strings in each language, never placeholder glyph soup.
- **`prefers-reduced-motion`**: freeze at the most legible state; every diagram must still make
  its point as a static image (the screenshot harness captures stills, so a diagram that only
  makes sense in motion has failed).
- They share the page's restraint: hairline strokes, Switzer/Inter, one accent at most.
- Each gets a natural home in the bento — these are the visual content of the content-bearing
  cells, and so they sit inside the nested frame described above.

## Type and color

- **Switzer** for headings — semibold rather than ultra-heavy, tighter tracking at large sizes,
  restrained scale (this version does not shout). **Inter** for body and UI text. Mono for code.
- **Light-dominant** (near-white page, near-black ink) — it is the light counterweight in a set
  full of dark directions — with **one full-bleed dark section** as a deliberate pivot, exactly as
  viteplus.dev does with its closing "Everything you need in one tool" band. Use the prismatic
  field ONLY inside that dark band, dimmed heavily, or omit it entirely.
- One accent color used sparingly (a single cool hue), never gradients-as-decoration.

## Composition

- **Hero**: small centered GT mark, a two-line centered headline (one accented word permitted),
  a muted one-line subhead, then two small buttons (solid primary, ghost secondary) plus a
  copy-command affordance. Below it, a **full-bleed hero visual cell**: a soft radial light
  texture with a dark terminal/code window floating centered on it — the vite+ hero pattern,
  which happens to suit GT perfectly (`$ npx gt@latest` running, then translations appearing).
- **A tab bar** switching between GT's frameworks (Next.js, React, React Native, TanStack Start,
  Node.js, Python) with an underline indicator — the oxc pattern, and a genuinely good fit: each
  tab swaps the code sample and the feature list beneath it.
- Then the bento rows using the varied shells above, carrying GT's real story: SDKs, context and
  glossaries, the Locadex agent, the editor workspace, edge delivery, previews, live runtime,
  config.
- The shared `StorySection` still tells the storyboard narrative, skinned light and quiet — this
  version's story is calmer, with less camera drama and more clarity.
- Close with the dark full-bleed band, then pricing, then a quiet footer.

## Global rules still apply

Section G of `ITERATION_SPEC.md`: no decorative eyebrows or kickers, no fake instrument chrome,
no green dots or colored status pills, no weird gradients, no ornamental icons or badges. Every
section is header+subheader or header+content. Restraint is this version's whole thesis — it
should be the cleanest page in the set.
