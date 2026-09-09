# Brand deck, round five

Kevin, September 9, 2026: "we need more thematic images that convey the vibes of the company interspersed across slides, very artistic and cool. Then make our actual website screenshots much much better and much more intentional and responsive to light and dark modes, and be more specific: show certain areas of visual aesthetic-ness, and have a dedicated page to diagrams. Finally we need a slide to show how much creative control the studio has: we do not want to say we need to keep this and that, and we do not want to say completely redesign everything. We want a first-principles approach based on a few things that cannot change (the legal name of the company, General Translation, and the names of the libraries our customers use, gt-*). No sunk cost: anything is liable to change as long as it is first principles, and that could even mean changing the name of the product."

The deck source is this folder (`parts/`, `slides/`, `shots/`, `fonts/`). `DECK-GRAMMAR.md` still governs every slide. `node shoot-slide.mjs 8 15` or `all` renders slides into `preview/` and reports overflow; it needs `tmp/shots -> ../shots` (create the symlink if missing). `pnpm build:deck` at the repo root writes `public/brand-deck.html`.

## 1. Section openers, the thematic images

Eight new full-bleed slides, one at the start of each section (Brand, Design system, Website, Documentation, Blog and content, Developer experience, Prototemplate and glyphfield, Status and plan). Each opener is a single image filling the sheet edge to edge behind the rails, with the section name set large in the lower left inside the rails (`.big`, 72px, white or ink depending on the image) and one plain sentence under it in 22px. No other text.

The images come from the brand's own engines, never stock: the raw renders are in `/private/tmp/claude-501/-Users-kevinliu-gt-gt-cloud/293a64b7-8ef6-4b00-b382-682288c84431/scratchpad/vibes/` (sixteen prototemplate directions in dark and light, two frames each, plus glyphfield). Curate eight with real range: the event horizon ring, a dither globe or field, glyph rain characters, the chroma flow, prism light, the lens gate, the hourglass, the aurora paper stripe, the gem smoke covers already in `shots/` (`cover-gt-open-source.png`, `cover-fumadocs.png`), the X banner and the reel poster. Process them in the deck's own texture: convert to grayscale, raise contrast, and apply the 8x8 Bayer ordered dither at 2px cells (the same screen the deck describes on the dither slide), so each opener is a two-tone image in ink and paper; allow at most two openers to stay in color where the gem smoke material is the point. Output `shots/opener-<section-slug>.jpg` at 1600x900, quality 85. Every opener gets a light twin as well, `shots/opener-<section-slug>-light.jpg`, made by inverting the dithered image so the ink and paper swap, and the slide uses `data-dark`/`src` so the opener follows the theme; the color openers use the same file in both themes. The title and sentence sit on a small solid plate (`--paper` at 100%, no blur, no shadow) so they stay legible over any image.

## 2. Website screenshots, intentional and themed

Replace the full-viewport screenshots on the Website slides (production site, dark mode, pricing and enterprise, contact and legal, implementation details) and the docs, blog index and blog post slides with intentional captures that have a light and a dark twin each. Sources: `/private/tmp/claude-501/-Users-kevinliu-gt-gt-cloud/293a64b7-8ef6-4b00-b382-682288c84431/scratchpad/site2x/` holds every production page at 1440x900 and 2x device scale (`<page>-light.png`, `<page>-dark.png`) plus full-page JPEGs (`<page>-<theme>-full.jpg`) for home, pricing, usage, enterprise, careers, docs, docs-quickstart, blog, blog-post, blog-oss, contact, report-card, 404, dash.

Two kinds of image:

- Page twins: the viewport capture at 1440x900 downsampled from 2x to 1440 wide, `shots/site-<page>-light.jpg` and `shots/site-<page>-dark.jpg`, one per page; every `<img>` that shows a page carries both.
- Detail crops: the same pixel region cut from the light and the dark 2x capture, saved at native 2x pixels so text stays crisp, `shots/detail-<name>-light.jpg` and `-dark.jpg`. Choose regions that show the identity's visual decisions: the navigation bar with its single bottom hairline and the mark; the hero headline with the doubled underline; a registration cross where a rail meets a rule; the customer logo row at cap height; a pricing card seam; the docs sidebar rails and the table of contents; the code panel with white monospace on #101010; a button pair in both themes; the footer hairlines; the 404 page's resolver copy; the report card's grid. Twelve to sixteen crops.

Compose two new slides in the Website section, "Details in light" and "Details in dark" are wrong; instead one slide "Details" with a 2x3 grid of detail crops each labeled, that switches theme with the deck, and rework the existing page slides so each shows one or two page twins with a one-sentence caption naming what to look at. Screenshots are never stretched; every image keeps a 1px `--hair` border.

## 3. A diagrams page

One new slide in the Design system section, after the doubled line, titled "Diagrams". It states the diagram grammar in a ruled rows table (strokes: 1px or 1.5px in ink, ink-2 or hairline; labels: 20px ink-2 or 26px ink; markers: 11px squares; no arrowheads; the isometric projection for objects; the doubled connector for links) and shows four small example diagrams in a row beneath it, each 300px wide, drawn inline in the grammar: a three-step flow, a scale with a marker, a stacked layer model, and an isometric plate. The examples are the deck's own vocabulary, so a reader can see the family at once.

## 4. Fixed points, the creative latitude slide

One new slide in the Status and plan section, before Success criteria, titled "Fixed points". It has to convey, in plain declarative English, that the identity project is a first-principles project with two fixed points and nothing else protected:

- Fixed: the legal name of the company, General Translation. The names of the libraries customers install and import: gt, gt-next, gt-react, gt-vue, gt-node, gt-python.
- Open: everything else. The mark, the colors, the type, the layout system, the voice, the site structure, the deck itself, and the product names, including Locadex.
- The rule: no decision is protected by the effort already spent on it. The current system is evidence of what has been tried, not a constraint. A proposal is judged on the same success criteria as the current system, and on nothing else.

Layout: two columns, Fixed (short, two rows) and Open (a longer ruled list), with the rule as the lead paragraph under the heading. Do not name the studio. Do not write "keep" or "redesign everything"; state what is fixed and state that the rest is open.

## 5. Renumbering and sections

New slides are created with interim names that sort into place (`00a-opener-brand.html` before `01-title.html`, `12a-opener-design-system.html`, `19a-diagrams.html`, `24a-opener-website.html`, `33a-opener-documentation.html`, `35a-opener-blog.html`, `42a-opener-developer-experience.html`, `43a-opener-prototemplate.html`, `48a-opener-status.html`, `50a-fixed-points.html`). The final integrator renumbers every file to `NN-slug.html` in order, updates `SECTIONS` in `parts/tail.html` (each section now starts at its opener), updates the slide count wherever it appears (`src/app/deck/page.tsx` description, `src/app/brand/page.tsx` copy, `parts/head.html` `bar-total`, the surfaces panel description), reruns `node shoot-slide.mjs all`, and rebuilds with `pnpm build:deck`.
