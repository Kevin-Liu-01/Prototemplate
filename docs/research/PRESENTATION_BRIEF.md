# PRESENTATION BRIEF — five minimalist directions, built as modules

The founder is presenting these. The presentation itself is structured **by module**, not by
page: hero, story, product bentos, banners, Locadex, context groups, dashboard, integrations
(GitHub, Slides), pricing, footer. Each module gets compared across directions and rated, so a
module must stand on its own as a reviewable unit.

## What is being built

1. **Five new minimalist directions.** Restrained, structural, feature-forward. These supersede
   the maximal explorations — the twelve existing directions stay for reference.
2. **A main page shaped like viteplus.dev**, and **product pages shaped like oxc.rs/oxlint**
   (the Locadex page is the first product page).
3. **A comparison and rating tool**, open-sourced, for presenting UI iterations module by module.

## The governing idea

> "The key is that we want to focus on showing off the cool features of the product, of which
> there are many. So we need a nice frame like viteplus.dev and oxc.rs, and then fill it with
> really engaging, easy-to-understand, conveying-the-point animations and graphics and diagrams."

The frame is restraint. The content is **demonstration**. Every module must show a real product
capability working, not describe it in prose. Things to show:

- characters and changing characters (text becoming other text)
- code snippets, and `<T>` tags wrapping content
- Locadex agents working, and pull requests shipping
- the dashboard, and why it is good
- context groups
- integrations: GitHub, Google Slides
- pricing

## References (studied, not guessed)

### Font anatomy — the "beautiful looks" for hero work
Both founder links resolve to the same artifact: Sebastian Kehle quote-tweeting Dan Hollick's
`makingsoftware.com/chapters/how-to-make-a-font`. The look: grey filled letterforms with **visible
bezier control points** on the outline, **labeled hairline metric guides** in tiny mono caps
(CAP HEIGHT / ASCENDER, X-HEIGHT, BASELINE, DESCENDER), pale green **sidebearing bands**, a small
legend of swatches, ruler-tick margins, and a light paper ground. Precise, technical, calm — a
measuring instrument rather than decoration. GT's version measures the same word across languages.

### "Thinking in modules" — the tool's visual language
konolee, Jul 29 2026. A saturated electric-blue field crossed by fine **dashed diagonal guides**,
carrying rounded-square **module cards in axonometric projection**, each a thin white outline with
a mono uppercase title and a short parameter list beneath it (`KEYBOARD / VELOCITY / AFTERTOUCH /
NOTE / GATE`, `LFO 1-2 / RATE / SHAPE / PHASE`). It reads as a modular synth patch bay: discrete
labeled units floating in a shared space. This is the metaphor for the comparison tool — every
design module is a patchable unit you can audition and rate.

### Bayer dithering — one direction must use it
Founder-supplied approach, ordered 8x8 Bayer threshold over an ImageData buffer:

```js
const v = fn(x / (w - 1), y / (h - 1));      // any 0..1 field function
const t = (B8[y % 8][x % 8] + 0.5) / 64;      // ordered threshold
if (v > t) setPixelWhite(x, y);               // 1-bit output
```

Use it for genuinely 1-bit imagery — no anti-aliasing, no grey. Good subjects: the prismatic
burst reduced to dither, a globe, a glyph enlarged until its dither cells read as texture,
expansion charts. Take the source field functions from our own existing screenshots where useful.

### viteplus.dev and oxc.rs
**Delve deep before designing.** A dedicated teardown of each is the first phase of work; its
findings, not impressions, drive the frame. Early observations to verify and extend: a centred
ruled column with vertical hairlines and horizontal section dividers; cell shells that vary
(split row, full-bleed visual, inset code panel, three-across, stat rows, plain text); a framework
tab bar with an underline indicator; light-dominant with a single dark full-bleed pivot band;
restrained semibold headings rather than ultra-heavy display; one accent colour used sparingly.

## Process the founder asked for

> "Something that can be helpful is to just create pages of text, and then text describing
> diagrams you would build."

So: **write the page before drawing it.** The plan document carries the real copy for every
module and, for every diagram, a prose description precise enough that a builder needs no further
invention. Planning is a deliverable in its own right here, not a preamble.
