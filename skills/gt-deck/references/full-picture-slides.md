# Openers, mood slides and the closing slide

The deck has three kinds of full-picture slide: eight section openers, ten mood slides and the closing slide. Each one is a picture across the whole sheet with one solid plate of text over it. The record of every picture (source, license, crop, settings, rejected candidates and round history) is `deck/shots/OPENERS.md`; read its entry before changing a picture.

## How the viewer shows them

- The picture sits at `inset: -57px; z-index: -1` on a 1600 by 900 box, so it runs under the rails and rules to the sheet's edge.
- In slide mode the viewer also paints it across the whole stage area at object-fit cover through the `.backdrop` layer (`syncBackdrop()` in `deck/parts/tail.html`). The sheet goes transparent and edgeless, and the slide's own copy of the picture is hidden, so the two crops never show together. The grid, the book and the thumbnails show the sheet as usual. Kevin asked for this in round nine: "when we have our full picture slides make it full width and height (object cover) and have the title and the why its here".
- Two solid `--paper` chips sit under the viewer's wordmark and counter, drawn by `#stage > .s-opener::after` or `#stage > .s-mood::after`: 40 by 30 at 66, 858 and 60 by 28 at 1474, 856. The selector is scoped to `#stage` because the thumbnails clone the slide without the chrome.
- Every opener file carries the same `<style>` block for `.s-opener`, and every mood file the same block for `.s-mood`. Copy the block from an existing file of the same kind and keep it identical.

## Section openers

Markup, from `01-opener-brand.html`:

```html
<!-- opener brand -->
<section class="slide opener s-opener s-opener-brand">
  <style>/* the shared .s-opener block, copied from an existing opener */</style>
  <img class="opener-img" src="shots/opener-brand-light.jpg" data-dark="shots/opener-brand.jpg" alt="...">
  <div class="in">
    <div class="opener-plate">
      <div class="big">Brand</div>
      <p>This section covers the company, its values, its voice, the name, and the mark.</p>
      <div class="credit">Material: Event Horizon, a Prototemplate direction</div>
    </div>
  </div>
</section>
```

- The plate sits in the lower left of the content box: `max-width: 740px`, padding 22px 26px 20px, solid `--paper`, no blur and no shadow. It grows upward, so a longer sentence never moves its bottom edge (y 771 on the stage) toward the bottom rule (y 844).
- The title is `.big` (72px) and is the section's name. SECTIONS in `deck/parts/tail.html` must carry the same string.
- The sentence starts "This section covers" and names the section's slide families in the order they appear. When a slide joins or leaves a section, check that the sentence still matches the section. Round eight corrected four sentences that left out a slide, listed slides out of order, or made a claim the section's own slides contradicted.
- The credit is 15px, line-height 1.45, letter-spacing 0.01em, in titanium. It reads "Material: <Direction>, a Prototemplate direction" for a render of a Prototemplate direction, and "Material: <material>, Paper Shaders, rendered in Glyphfield" for a Glyphfield material render.
- Six openers are two-tone dithers of the brand's own shader engines. Two, Blog and content and Developer experience, are color renders of the gem smoke material. Their `-light` file is a byte copy of the dark file, so only the plate changes with the theme.
- The light file goes in `src` and the dark file in `data-dark`. A two-tone opener's light file is the inverse of its dark file.
- The image rule from round ten: an opener carries one large hard-edged form on a quiet ground, with the plate's area solid ink or paper, and the dither sits on that form as shading or glow. A small crop blown up 7 times, or a band of mid-tone with no edge, dithers into a checker or a grey smear; Kevin rejected both ("the dither on the things in the back look weird and should just be on something better looking").
- Keep the picture's lit cells clear of the plate. Round ten measured each new opener on the render: no lit cell inside the plate rectangle, the nearest one 83 to 84 px away, and for the Prototemplate opener none in the 30 px band around the plate. OPENERS.md records these distances per picture.
- The shader pipeline (crop, Lanczos to cover 800 by 450, grayscale with an invert for light renders, autocontrast at 0.5 percent, black point and gamma, 8 by 8 Bayer at (m + 0.5) / 64, 2x nearest-neighbour to 1600 by 900, invert for the light twin) is written out in OPENERS.md under "Shader pipeline". `scripts/build-deck.mjs` stores a two-tone image as a one-bit PNG, so the JPEG only has to keep every cell on its side of the threshold.

## Mood slides

Markup, from `06-mood-earth.html`:

```html
<!-- mood earth -->
<section class="slide mood s-mood s-mood-earth">
  <style>/* the shared .s-mood block, copied from an existing mood slide */</style>
  <canvas class="mood-img" data-tone="shots/tone/mood-earth.jpg" role="img" aria-label="NASA's Blue Marble, the Earth with the Western Hemisphere in daylight"></canvas>
  <div class="in">
    <div class="mood-plate">
      <div class="big title">The Blue Marble</div>
      <p>NASA's composite of the whole planet. The company sells to every part of it, so the brand section starts at that scale.</p>
      <div class="credit">Image: NASA, Reto Stöckli, 2007, public domain</div>
    </div>
  </div>
</section>
```

- A mood picture is an artifact picture. It follows `docs/ARTIFACT-PICTURES.md`: a continuous-tone gray grid under `deck/shots/tone/mood-<name>.jpg`, cut by `pnpm mood-tone` from the original source and recorded in `deck/shots/tone/manifest.json`, and screened live by the engine in `deck/parts/tail.html` at 1 CSS px cells. One grid serves both themes; the theme changes only `--mood-ink` and `--mood-opacity`.
- The slide shows the picture on a `<canvas>`. A bitmap `<img>` or a pre-screened `mood-*` file in `deck/shots` fails `scripts/lint-pictures.mjs`. A grid or its manifest entry is never edited by hand; the lint checks the grid against its entry, and only `pnpm mood-tone <sources dir> --check` proves the grid came from its recipe.
- The plate sits in the lower right: `max-width: 560px` on the content box, the opener's padding, so it spans about x 851 to 1463. It holds the picture's title as `.big.title` at 44px with line-height 1.08, one or two sentences at 22px on why the picture is in the deck (what it shows, then how it connects to the section), and the credit at the opener's credit style.
- The title is in sentence case ("A proto-cuneiform tablet"). It is the slide's title in the slide list and in DECK_SLIDES.
- The credit starts with a label that names the medium: Image, Photograph, Print, Map, Engraving or Calligraphy, then the author, the date where known, and the license. The plate must have a `<div class="credit">`; the lint checks it.
- Placement: a mood slide follows a dense content slide, and at least one content slide separates it from the next opener, so the deck alternates opener, content, mood, content, opener. Two full-picture slides never sit next to each other.
- Picture rules from the standard: no plain English prose on the picture (Kevin, 2026-10-05: "never distract with text on the artifacts"); writing is allowed only as the artistic subject (inscriptions, calligraphy, other scripts, engraved chart lettering). Sources are public domain or Creative Commons, cut from the original scan, never from a screened or resized copy. No recognizable public figure and no other designer's poster.
- Retired picture names never return: `dictionary`, `johnson`, `oed-volumes`, `oxford`, `oed`. Removing the Design system and Documentation mood slides on 2026-10-05 took the deck from 95 to 93 slides.
- Three mood pictures are share-alike (CC BY-SA): the Rosetta Stone, the lighthouse and the Devanagari page. Their credit lines are required.

### Adding a mood picture

1. Cut the grid first. The gt-dither skill and `docs/ARTIFACT-PICTURES.md` ("Adding a picture") hold the steps: the object and its license, the `SOURCES` entry, the recipe in `DECK` in `scripts/mood-tone/mood-tone.mjs`, and `pnpm mood-tone <sources dir> --preview <dir>`. If no crop puts a scene inside its window, the picture does not meet the standard.
2. Copy an existing mood slide to `deck/slides/NN-mood-<name>.html` and change the canvas, the aria-label, the title, the sentence and the credit.
3. Add the picture's entry to the mood table in `deck/shots/OPENERS.md`, update the registries in SKILL.md section 12, and run `node skills/gt-deck/scripts/check-deck.mjs`, `pnpm build:deck` and `pnpm lint:pictures`.

## The closing slide

`95-closing.html` reuses the opener styles with an extra `.s-closing` class. Its plate sits at the top left over the Singularity ring's interior, with the GT mark above the title, and the image is a two-tone shader render like the openers. It is not a section start, so SECTIONS does not list it.

## Sources

- Prototemplate: `deck/shots/OPENERS.md`, `deck/DECK-GRAMMAR.md` (full-picture slides), `docs/ARTIFACT-PICTURES.md`, `scripts/mood-tone/README.md`, `deck/slides/01-opener-brand.html`, `deck/slides/06-mood-earth.html`, `deck/slides/95-closing.html`, `deck/parts/tail.html` (`syncBackdrop`, the mood engine).
- Kevin's directives: round seven, 2026-09-09 (shader openers return, photographs become mood slides); round nine, 2026-09-09 (full-picture slides fill the stage and say why they are there); round ten, 2026-09-09 (openers on better images); 2026-10-05 (no plain English prose on artifact pictures).
