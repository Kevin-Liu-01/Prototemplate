# Section openers and mood slides

Two kinds of full-bleed image sit in the deck.

- Eight section openers, one at the start of each section. Six are two-tone dithers of the brand's own shader engines, rendered in round five and restored in round seven. Two, Blog and content and Developer experience, are color renders of the gem smoke material made in round six. Every opener carries the section name, one sentence stating what the section covers, and a credit line naming the material.
- Nine mood slides, one inside each section plus the Blue Marble in Brand, each placed after a dense slide so the image is a rest, and each separated from the next opener by at least one content slide so the two image kinds alternate. Eight are the photographs and artworks that served as openers between round five and round six, made two-tone with the deck's own screen; the ninth, the Bowen compass rose, replaced the Narita runway in round eight. A mood slide carries one solid plate in the lower right with the picture's title, one or two sentences on why the picture is in the deck, and the credit; the plate is the mood slide's counterpart to the opener's lower-left plate. In the viewer a full-picture slide (an opener or a mood slide) paints its image across the whole stage area at object-fit cover, not only across the sheet (Kevin, round nine: "when we have our full picture slides make it full width and height (object cover) and have the title and the why its here").

Kevin's directive, round seven: "the photo openers are good but i also liked the dither-on-shader ones we had before. we can still use them and have photo openers be separate independent slides to convey vibes." Earlier: "also i like the blue marble", and the Blog and content and Developer experience shader backgrounds are to be "super high quality" (round six rendered them fresh from glyphfield).

Every file is 1600 by 900. The dithered files are JPEGs at quality 85 with a light twin; the two color openers are saved at quality 92 and the same image serves both themes. A slide references the light file in `src` and the dark file in `data-dark`. `scripts/build-deck.mjs` inlines `opener-*` and `detail-*` files at their native size at JPEG quality 88 instead of resampling them to 1280 pixels wide; the `mood-*` files are full-bleed too and get the same treatment.

## Openers

| Section | Slide | Dark file | Light file | Image |
| --- | --- | --- | --- | --- |
| Brand | `01-opener-brand` | `opener-brand.jpg` | `opener-brand-light.jpg` | Event Horizon, the ring's top arc, two-tone |
| Design system | `16-opener-design-system` | `opener-design-system.jpg` | `opener-design-system-light.jpg` | Chroma Flow, doubled flow lines, two-tone |
| Website | `31-opener-website` | `opener-website.jpg` | `opener-website-light.jpg` | Glyph Rain, the home page hero character field, two-tone |
| Documentation | `43-opener-documentation` | `opener-documentation.jpg` | `opener-documentation-light.jpg` | Lens Gate, the wireframe sphere and rules, two-tone |
| Blog and content | `47-opener-blog` | `opener-blog.jpg` | `opener-blog-light.jpg` (same image) | gem smoke (Paper Shaders) rendered in glyphfield, Default preset, brand blue, color |
| Developer experience | `56-opener-developer-experience` | `opener-developer-experience.jpg` | `opener-developer-experience-light.jpg` (same image) | gem smoke (Paper Shaders) rendered in glyphfield, Fire preset, color |
| Prototemplate and glyphfield | `60-opener-prototemplate` | `opener-prototemplate.jpg` | `opener-prototemplate-light.jpg` | Prism Light, the wireframe prism body, two-tone |
| Status and plan | `79-opener-status` | `opener-status.jpg` | `opener-status-light.jpg` | Aurora Paper, the aurora band and its flare, two-tone |

Slide numbers are the round seven numbering (85 slides), which round eight kept: eight sections starting at 1, 16, 31, 43, 47, 56, 60 and 79. Round eight moved three mood slides within their sections, so the mood slide numbers below differ from round seven.

### Shader pipeline

The six two-tone openers went through the same Pillow steps in round five. Source renders are 1600 by 900 captures of prototemplate directions (`/d/<slug>?chrome=0`). Crop boxes are left, top, right, bottom in source pixels.

1. Crop the box listed below from the source render. Every box excludes navigation, headlines, chips, labels and the mark; only shader output remains.
2. Resize to cover 800 by 450 with Lanczos, trimming the long side centered.
3. Convert to grayscale. Where the source is a light render, invert first so the working image is white on black.
4. Autocontrast with a 0.5 percent cutoff, then an optional black point that clips the dim ground to solid ink, then a gamma curve (values below 1 lift mid-tones, values above 1 drop them).
5. Ordered dither with the 8 by 8 Bayer matrix, thresholds at (m + 0.5) / 64, to one bit at 800 by 450.
6. Scale up 2x with nearest neighbour to 1600 by 900, so every cell is a crisp 2 by 2 pixel square. This is the same screen the dither slide describes.
7. Save the dark file. Invert the one-bit image and save the light file.

### Opener slide

- The title, sentence and credit sit on a solid `--paper` plate (no blur, no shadow) anchored to the lower left of the content box. The plate grows upward, so a three-line sentence does not move its bottom edge (771) toward the bottom rule (844).
- The sentence is a plain statement of what the section covers, naming the slide families in the order they appear. Round seven replaced the picture-to-company comparisons the photograph openers carried; round eight corrected the four sentences that omitted a slide, listed slides out of order, or made a claim the section's own slides contradict.
- The credit is 15px at line-height 1.45 in titanium, the `.cap` size. On the six two-tone openers it reads "Material: <Direction>, a prototemplate direction", naming the prototemplate direction the render was captured from (the Directions slide lists them, registered in `src/lib/directions.ts`); the deck's engine names (horizon field, glyph field) are not the direction names, so the credit does not use them. On the two color openers it reads "Material: gem smoke, Paper Shaders, rendered in glyphfield", naming the material's author and the tool that rendered it, as every mood credit names the author of its image.
- The two color openers reference the same image in `src` and `data-dark` (the light file is a byte copy of the dark file), so the plate is the only element that changes with the theme.
- The viewer draws the wordmark (stage 72, 864, 28 by 18) and the counter (right 72, bottom 22) in titanium over the image. Each opener paints two solid `--paper` chips under them (40 by 30 at 66, 858 and 60 by 28 at 1474, 856) from a `#stage > .s-opener::after` pseudo-element at z-index -1, after the image in tree order and under the viewer chrome. The selector is scoped to the stage because the grid and book thumbnails clone the slide without the chrome.

### Brand

- Source: `event-horizon-dark-2.jpg`, the careers page horizon field shader.
- Crop: 640, 128, 960, 308 (320 by 180). The top arc of the ring between the orbiting locale labels and the hero text, scaled 5x. The ring's glow fills the upper third and the field below it is solid ink, where the title plate sits.
- Processing: gamma 0.85, no black point.
- Sentence: This section covers the company, its values, its voice, the name, and the mark.
- Credit: Material: Event Horizon, a prototemplate direction

### Design system

- Source: `chroma-flow-light-1.jpg`, the chroma flow direction in light theme.
- Crop: 216, 60, 540, 242 (324 by 182). The top left corner of the hero, where the doubled flow lines bend before they reach the central ellipse. No text in the region.
- Processing: source inverted, black point 16, gamma 1.1. The light twin is therefore dark doubled lines on paper, which matches the site's own light rendering.
- Sentence: This section covers color, type, scripts, lines, diagrams, dither, illustration, and motion.
- Credit: Material: Chroma Flow, a prototemplate direction

### Website

- Source: `glyph-rain-dark-1.jpg`, the production homepage hero engine.
- Crop: 740, 180, 1384, 542 (644 by 362). The right half of the hero, the character field alone, clear of the headline on the left and the language grid below.
- Processing: black point 10, gamma 1.0. Dim trailing glyphs render as dotted shapes, bright ones as solid shapes.
- Sentence: This section covers the production site page by page, its measurements, and its shaders.
- Credit: Material: Glyph Rain, a prototemplate direction

### Documentation

- Source: `lens-gate-dark-1.jpg`, the lens gate direction.
- Crop: 600, 412, 980, 626 (380 by 214). The upper half of the wireframe sphere with the horizontal rules behind it, cut below the hero card edge and above the mark and the two status chips.
- Processing: black point 30, gamma 1.2. The dim gradient ground clips to ink so the rules and the sphere wires stand on their own.
- Sentence: This section covers the docs: 393 pages in eight sections, served in eight locales, and the markdown twins published for agents. (Round seven's sentence said each page has a markdown twin; the Markdown twins slide says only the English pages are prebuilt, so the claim came out.)
- Credit: Material: Lens Gate, a prototemplate direction

### Blog and content

- Image: the gem smoke material, the GPU material behind the designed covers and the reel (the Designed covers slide), in the brand blue: white smoke over a blue field, the polarity of the GT open-source cover.
- Source: glyphfield (`/Users/kevinliu/repos/glyphfield`), route `/shader-preview?materialId=paper-gem-smoke&diagnostics=1&live=1` on the local dev server (port 3012). The route runs Paper Shaders' Gem Smoke family (Apache-2.0) through glyphfield's live material canvas; `diagnostics=1` with `live=1` is the only combination that plays the shader live and draws no overlay. Default preset, `preservePresetGeometry`, shape `metaballs`, `colorInner` transparent, as the route sets them.
- Render: Chromium (Playwright, `--use-gl=angle --use-angle=metal --ignore-gpu-blocklist`), 1600 by 900 viewport at device scale factor 2. Two things in the route work against a sharp capture and were overridden on the `paperShaderMount` handle after the canvas reported ready: the route caps the canvas at 360,000 pixels (`maxPixelCount`), and under an emulated scale factor Paper's ResizeObserver reads the box in CSS pixels and sizes the canvas at 1x. The mount's `devicePixelsSupported` flag was cleared and `setMinPixelRatio(2)` and `setMaxPixelCount(3200 * 1800 + 1)` were called; the drawing buffer was then verified at 3200 by 1800 with render scale 2 (`u_pixelRatio` 2, so the composition matches the site at 1600 by 900). The route's preview palette is the violet "metal" palette for every preset, so the brand palette was set through `setUniforms`: `colorBack #2f5ce0` (the accent on light from the Color slide), `colors [#ffffff, #86a8ff]`, `colorInner` transparent.
- Frame: three element screenshots of the canvas at about 4, 5 and 6 seconds of playback; the third was kept because its highlight sits right of center, clear of the plate, and the left half is flat blue under the title. Saved from the 3200 by 1800 PNG as a 1600 by 900 JPEG with Lanczos at quality 92 (4:4:4). The light file is a copy.
- Not chosen: the same material on the ink ground (`colorBack #070707`, `colors [#2f5ce0, #ffffff]`) reads as a dark slide with a blue rim and does not match the covers; the route's own violet palette is not a brand color. Round five used a crop of `cover-fuma-nama-og.png` (400, 0, 720, 180, scaled 5x) here, which was soft in the built deck.
- Sentence: This section covers the blog, its covers, the content rules, and the brand assets outside the site.
- Credit: Material: gem smoke, Paper Shaders, rendered in glyphfield

### Developer experience

- Image: the same gem smoke material in Paper's Fire preset with the preset's shipped colors (`colors [#fe5b16, #f7ff61, #ffffff]`, `colorBack #000000`, `colorInner` transparent), so the two color openers read as one material in two states.
- Source: glyphfield, route `/shader-preview?materialId=paper-gem-smoke-fire&diagnostics=1&live=1`, the same server, browser and resolution steps as the Blog opener. The route replaces the preset's colors with its violet preview palette, so the shipped colors were passed back through `setUniforms`.
- Frame: the third sample, about 6 seconds in. Its lower left is black, so the plate sits on the ink ground in the dark theme and the paper plate has full contrast in the light theme, and the bright band runs across the right half. Saved the same way, 1600 by 900 at quality 92; the light file is a copy.
- Not chosen: the Infrared preset (magenta ground with five colors) is louder than anything else in the deck; the Fluorescent preset in the route's palette looked the same as the Default. Round five used a crop of `cover-gt-open-source.png` (0, 320, 391, 540) here.
- Note: the orange is Paper's preset color, not the Fumadocs partner color on the Designed covers slide. The credit line names the material and its author, not a partner.
- Sentence: This section covers the developer experience: source code as the source of truth and translation as a build step.
- Credit: Material: gem smoke, Paper Shaders, rendered in glyphfield

### Prototemplate and glyphfield

- Source: `prism-light-dark-1.jpg`, the prism light direction.
- Crop: 370, 606, 588, 729 (218 by 123). The wireframe prism body itself, between the rotating source labels on the left and the translated labels inside the beam on the right. Scaled 7.3x, so the faces read as dithered glass and the edges as soft bright lines.
- Processing: black point 10, gamma 0.9.
- Sentence: This section covers prototemplate.com, the design lab and knowledge base, and glyphfield.com, the tooling behind it.
- Credit: Material: Prism Light, a prototemplate direction

### Status and plan

- Source: `aurora-paper-dark-2.jpg`, the aurora paper direction.
- Crop: 900, 540, 1231, 726 (331 by 186). The green aurora band to the right of the table copy, with the vertical flare at the crop's left edge; the box sits below the "Deploy now" row's underline and right of the "Déployer maintenant" copy, and the row rule at source row 705 falls inside the box but is dimmer than the black point, so it does not render. Round seven's box (900, 514, 1231, 700) put the band across the plate; the box moved 26 rows down so the band and the flare sit above the plate's top edge (540) on the sheet.
- Processing: black point 90, gamma 0.8. The smoke field around the band sits at 30 to 80 in the crop's gray values, so round seven's black point of 25 left it as a 50 percent screen over the whole sheet with no edge anywhere; 90 clips the field to ink and only the band and its flare carry tone. Gamma 0.8 lifts the band's mid-tones so it keeps its body across the sheet; at gamma 1.6, as first proposed, the band thinned to a dotted line and the flare was the only feature. The result is 92 percent ink cells: a band of light across the upper middle of an ink sheet, and on the light twin a dark band on clean paper.
- Sentence: This section covers what has shipped, what is open, the identity project, the fixed points, and the success criteria.
- Credit: Material: Aurora Paper, a prototemplate direction

## Mood slides

| Slide | Placed after | Dark file | Light file | Image |
| --- | --- | --- | --- | --- |
| `06-mood-earth` | Why the redesign | `mood-earth.jpg` | `mood-earth-light.jpg` | NASA, Blue Marble Next Generation, Western Hemisphere, 2007 |
| `10-mood-babel` | Values | `mood-babel.jpg` | `mood-babel-light.jpg` | Bruegel, The Tower of Babel, 1563 |
| `24-mood-calligraphy` | The doubled line | `mood-calligraphy.jpg` | `mood-calligraphy-light.jpg` | Karahisari, calligraphy exercise, 16th century |
| `37-mood-lighthouse` | Pages, second slide | `mood-lighthouse.jpg` | `mood-lighthouse-light.jpg` | Louisbourg lighthouse in a fall storm |
| `45-mood-dictionary` | Documentation (the docs overview) | `mood-dictionary.jpg` | `mood-dictionary-light.jpg` | The Compact Oxford English Dictionary, open |
| `50-mood-devanagari` | Generated covers | `mood-devanagari.jpg` | `mood-devanagari-light.jpg` | Prashna Upanishad manuscript page, Devanagari script |
| `58-mood-cable` | Translation as a build step | `mood-cable.jpg` | `mood-cable-light.jpg` | Eastern Telegraph Company cable chart, 1901 |
| `70-mood-wave` | Directions | `mood-wave.jpg` | `mood-wave-light.jpg` | Hokusai, The Great Wave off Kanagawa, about 1831 |
| `81-mood-compass` | Current status | `mood-compass.jpg` | `mood-compass-light.jpg` | Bowen, A Circle of Winds, the mariner's compass, 1748 |

All photographic sources are Wikimedia Commons files under a public domain or Creative Commons license. No mood slide shows a recognizable public figure and none is another designer's poster. Seven files are byte copies of the openers they replaced, five from the round six state (`mood-babel`, `mood-calligraphy`, `mood-lighthouse`, `mood-dictionary`, `mood-wave`) and two from commit 7d5c255 (`mood-devanagari`, `mood-cable`), so their crops and tone settings are the ones already reviewed. Round eight refit `mood-earth` (same tone, new crop box) and made `mood-compass` new.

Placement rule: a mood slide follows a dense content slide and at least one content slide separates it from the next opener, so the deck alternates opener, content, mood, content, opener rather than running two full-bleed images together. Round seven had `mood-earth`, `mood-dictionary` and `mood-cable` closing their sections directly against the next opener; round eight moved each earlier. In Brand the image slides now fall at 1, 6, 10 and 16, with four, three and five content slides between them.

### Photograph pipeline

Every photograph went through the same Pillow steps. Sources are the Commons downloads scaled to 1800 pixels on the long side; crop boxes are left, top, right, bottom in those pixels.

1. Convert to grayscale and crop the box. Where noted, one channel replaces the luminance conversion; the Blue Marble uses the red channel, see its entry. Pillow pads a crop box that reaches past the source with black, which the Blue Marble uses to place the disk in a wider frame.
2. Where noted, apply a Gaussian blur (to turn small type or film grain into an even tone) before scaling. The cable chart isolates its routes by color instead of thickening every line; see its entry.
3. Fit to 800 by 450 with Lanczos, trimming the long side centered. Where noted, an unsharp mask is applied to a band of rows after the fit.
4. Autocontrast with a 0.5 percent cutoff. Clip to the black and white points listed (values at or below the black point become ink, values at or above the white point become paper). Apply the gamma curve (below 1 lifts mid-tones, above 1 drops them).
5. Ordered dither with the 8 by 8 Bayer matrix, thresholds at (m + 0.5) / 64, to one bit at 800 by 450.
6. Scale up 2x with nearest neighbour to 1600 by 900, so every cell is a crisp 2 by 2 pixel square. This is the screen the dither slide describes.
7. Polarity. The file whose ground matches the dark theme is the dark file and its inverse is the light file. For images whose positive rendering is mostly paper (a white sky, black script on a page, black lines on a chart) the positive image is the light file and the inverted image is the dark file. For images whose positive rendering is mostly ink (the Blue Marble on its black ground) the positive image is the dark file. The dominant field decides, not the background: the dictionary lies on a dark carpet, but the carpet is the outer 15 percent of the frame and the white pages are the field, so its positive is the light file.

### Mood slide

- The slide is the image alone: `<img class="mood-img">` inset -57px on every side, 1600 by 900, `object-fit: cover`, at z-index -1, with the light file in `src` and the dark file in `data-dark`.
- One solid `--paper` plate (no blur, no shadow) anchored to the lower right of the content box, `max-width: 560px` on the content box with the opener plate's 22px 26px 20px padding, so it spans about x 851 to 1463 at full width. It holds three things: the picture's title as `.big.title` at 44px (the h2 size) with line-height 1.08, one or two plain sentences at the 22px body size on why the picture is in the deck (what it shows, then the connection to the section), and the credit line at 15px, line-height 1.45, letter-spacing 0.01em, in titanium. Round eight's plate held the credit alone; round nine added the title and the sentence at Kevin's request. The plate is opaque, so a picture may pass under it, but the Blue Marble is fit so the disk clears it.
- The same two `--paper` chips as the openers sit under the viewer's wordmark and counter, from `#stage > .s-mood::after`, scoped to the stage so thumbnails stay clean.
- The section CSS is scoped to `.s-mood`; each file carries the same block, as the openers do.

### Brand, mood-babel

- Image: The Tower of Babel, oil on panel, Kunsthistorisches Museum, Vienna.
- Source: File:Pieter Bruegel the Elder - The Tower of Babel (Vienna) - Google Art Project - edited.jpg
- Artist: Pieter Bruegel the Elder, 1563.
- License: Public domain.
- Crop: 300, 0, 1500, 675. The tower alone, from the crane at its top to the level of the lower arcades; the harbour and the crowd at the base are left out. Blur 1.0, black 60, white 205, gamma 1.15. The lit left face and the sky go to paper, the shadow side and the arches to ink.
- Placement: after Values, the densest slide in the first half of Brand.
- Credit: Painting: Pieter Bruegel the Elder, 1563, public domain

### Brand, mood-earth

- Image: The Blue Marble, Western Hemisphere, from NASA's Blue Marble Next Generation series: a composite of MODIS land and ocean data (2001 to 2004), a single day of clouds, sea ice, radar topography and city lights along the terminator, published in 2007.
- Source: File:Blue Marble Western Hemisphere.jpg (local copy `scratchpad/photo/earth-night.jpg`, 1800 by 1800).
- Artist: NASA Earth Observatory, images by Reto Stöckli, based on data from NASA and NOAA; the Commons file is dated October 2, 2007.
- License: Public domain.
- Crop: 49, -7, 3279, 1809. The disk spans 72 to 1722 across and 72 to 1730 down in the source (center 897, 901). The box is 3230 by 1816 and reaches past the right, top and bottom edges, where Pillow pads black, which is the source's own ground. Fitted to 800 by 450 this puts the disk at 820 pixels of diameter on the sheet, centered at x 420 and y 450, so it spans x 10 to 830 and y 40 to 860. Round nine's mood plate spans about x 851 to 1463, y 539 to 771; a cell count on the dark file finds 0 lit cells inside that rectangle (scratchpad `marble3/refit.py`, candidate b820x420), so the plate meets nothing. Round eight's box (-642, 35, 2437, 1767) centered an 860 pixel disk at x 800 for the credit-only plate, and that fit is superseded. The credit plate at the 15px credit spans x 1090 to 1462, y 729 to 771. Its top-left corner is 402 pixels from the disk center, 28 pixels inside the 430 radius, but that part of the disk is the night side over the South Pacific, which is ground in both files, so no rendered cell sits under the plate (0 of the 16,039 cells in the plate rectangle are paper in the dark file; the rightmost lit cell on the plate's top row is at x 1049). Round six's box (-1201, 35, 1878, 1767) centered the disk at x 1090 to leave room for a title plate at lower left; on the mood slide that plate no longer exists and the lower-right credit plate cut the rim over the South Pacific, so round eight recentered the disk. The plate stays at lower right, as on every mood slide.
- Tone: the red channel instead of luminance. In luminance the ocean and the cloud tones sit close together and the disk dithers to noise, which is why round five rejected the image. In the red channel the ocean drops toward black while land and cloud rise, so the oceans clip to ink and the continents and cloud bands render as texture; the city lights on the night side render as scattered single cells. Blur 0.6, black 80, white 210, gamma 1.0. Positive is the dark file: the disk on the ink ground. The light file is the inverse.
- Placement: after Why the redesign, the first dense slide of Brand, so the section runs opener, four content slides, the Blue Marble, three content slides, Babel, five content slides, opener. Round seven placed it after The mark, directly before the Design system opener, which made it a second opener. Kevin asked for the image ("also i like the blue marble"); round six had it as the Status and plan opener.
- Credit: Image: NASA, Reto Stöckli, 2007, public domain

### Design system, mood-calligraphy

- Image: Karalama, a calligraphy exercise sheet, ink on paper.
- Source: File:Ahmed Karahisari - Karalama (calligraphy exercise) - Google Art Project.jpg
- Artist: Ahmed Karahisari, 16th century.
- License: Public domain.
- Crop: 310, 475, 1030, 880. A 16 by 9 window 720 pixels wide in the middle band of the sheet, holding a few strokes at 150 to 300 pixels of thickness instead of the whole field; the window stops above the crease that runs across the sheet at source rows 883 to 887, so no seam crosses the image. Black 40, white 215, no blur. The strokes render solid, the paper renders clean with the pounced ground marks as dots, and the edge consistency of each stroke is what the eye reads. The first crop (0, 500, 1341, 1254) showed the full-width field and read as overlapping chaos in the grid view.
- Placement: after The doubled line.
- Credit: Calligraphy: Ahmed Karahisari, 16th century, public domain

### Website, mood-lighthouse

- Image: Louisbourg Lighthouse, Nova Scotia, with waves breaking in a fall storm.
- Source: File:Louisbourg Lighthouse, waves breaking in a fall storm 1.jpg
- Artist: Ken Heaton.
- License: CC BY-SA 4.0.
- Crop: 300, 330, 1800, 1174. Drops most of the empty sky and the dark foreground; the tower on the right comes up to about 180 pixels wide and the breaking wave sits at sheet rows 380 to 500. Blur 0.5, black 0, white 212, gamma 0.8, plus an unsharp mask (radius 8, 180 percent, threshold 3) on rows 150 to 260 of the 800 by 450 frame, the sea band, so the spray separates from the lit water. The sky goes to paper, the sea band keeps its texture, and the heath dithers instead of clipping, so the dark twin shows a modulated field rather than a slab. The first crop (0, 150, 1800, 1162, blur 0.8, black 40) clipped the heath to solid ink.
- Placement: after the second Pages slide.
- Credit: Photograph: Ken Heaton, CC BY-SA 4.0

### Documentation, mood-dictionary

- Image: The Compact Oxford English Dictionary, open on a carpet.
- Source: File:Compact Oxford English Dictionary 2.jpg
- Artist: Cullen328.
- License: CC BY-SA 4.0.
- Crop: 0, 110, 1800, 1122. The whole open book with a margin of carpet on every side. Blur 2.0 so the small type becomes an even tone, black 110 so the carpet drops to solid ink, white 235. The pages read as paper, the text blocks as a regular dither, the gutters and margins as clean paper. Positive is the light file: the pages are the dominant field, so the light theme shows the photograph (a white book on the black carpet) and the dark theme shows the inverse, dark pages with the text columns as a light dither, which reads like the deck's code panel.
- Placement: after Documentation, the docs overview, and before Markdown twins, so a content slide separates it from the Blog and content opener. Round seven placed it after Markdown twins, directly before the opener.
- Credit: Photograph: Cullen328, CC BY-SA 4.0

### Blog and content, mood-devanagari

- Image: a Prashna Upanishad manuscript page, Sanskrit in Devanagari script, copied by hand and corrected between the lines.
- Source: File:Prashna Upanishad sample manuscript page, Sanskrit, Devanagari script.jpg
- Artist: Ms Sarah Welch.
- License: CC BY-SA 4.0.
- Crop: 187, 0, 1613, 803; black 40, white 215, no blur; positive is the light file (black script on a pale page).
- Placement: after Generated covers and before Designed covers. (Round seven's note said Designed covers; the file order was always after Generated covers.)
- Credit: Photograph: Ms Sarah Welch, CC BY-SA 4.0

### Developer experience, mood-cable

- Image: the Eastern Telegraph Company's chart of its submarine cables, 1901.
- Source: File:1901 Eastern Telegraph cables.png
- License: Public domain.
- Crop: 500, 470, 1060, 785. The routes are isolated by color (a pixel is a route where R minus max(G, B) exceeds 35), fitted to 800 by 450 separately and composited as ink after the tone step; ground blur 0.4, black 100, white 215; positive is the light file (black lines on paper). Isolating the routes alone and thickening them, at three crops, turned them into thick blobs on a noisy gray field; the hybrid keeps the grayscale ground and composites the routes as ink without thickening.
- Placement: after Translation as a build step and before The CLI, so a content slide separates it from the Prototemplate and glyphfield opener. Round seven placed it after The CLI, directly before the opener.
- Credit: Map: Eastern Telegraph Company, 1901, public domain

### Prototemplate and glyphfield, mood-wave

- Image: The Great Wave off Kanagawa, woodblock print from Thirty-six Views of Mount Fuji.
- Source: File:Tsunami by hokusai 19th century.jpg
- Artist: Katsushika Hokusai, about 1831.
- License: Public domain.
- Crop: 0, 90, 1800, 1102. Full width; the crest at the top edge, the boats at the bottom edge trimmed, the signature cartouche kept at top left. White 225 so the graded sky goes to clean paper; no blur, no black point.
- Placement: after Directions.
- Alternative: if the ubiquity of this print is a problem, two public domain prints with rarer subjects would take the same pipeline: Hokusai's Kajikazawa in Kai Province and Hiroshige's Sudden Shower over Shin-Ohashi Bridge. Both are on Wikimedia Commons; neither has been downloaded.
- Credit: Print: Katsushika Hokusai, about 1831, public domain

### Status and plan, mood-compass

- Image: A Circle of Winds consisting of 32 points, commonly called the Mariners Compass, the left plate of a hand-colored engraving of a compass rose and an armillary sphere.
- Source: File:1748 Bowen Mariner's Compass and Armillary Sphere - Geographicus - CircleofWinds-bowen-1747.jpg (local copy `scratchpad/photo/compass.jpg`, 1800 by 1140).
- Artist: Emanuel Bowen, 1748.
- License: Public domain.
- Crop: 40, 90, 1040, 652. The compass rose plate: the 32-point rose with its degree ring fills the left two thirds of the sheet, the engraved wall and the sky, clouds and ship to its right form a textured strip, and the blank gutter between the two plates is the right quarter of the sheet, where the credit plate sits on clean ground. The box starts inside the plate's border and stops above the ribbon's text; the two ribbon knots at the plate's foot show at the bottom corners of the rose. Black 60, white 225, and a 3 pixel minimum filter, the setting from the round five reserve test; the filter thickens the engraved hatching so the points read as solid and half-tone wedges instead of noise, and the compass-point labels become texture inside the wedges. Positive is the light file (black lines on paper).
- Rejected crops: the round five box (0, 112, 1000, 674) carries the plate's outer border as a black bar under the left rail and cuts the ribbon at its knots; a tight window on the rose (60, 100, 900, 572) cuts the bottom of the degree ring; both plates together (0, 64, 1800, 1076) leave the ribbon text and the plate title legible as stray copy; a wider box (0, 82, 1066, 682) brings in the ribbon text.
- Placement: after Current status.
- Credit: Engraving: Emanuel Bowen, 1748, public domain
- Replaces: the Narita runway photograph (File:Runway 16R, Narita Airport (4055519259).jpg, Kentaro Iemoto, CC BY-SA 2.0; crop 0, 60, 1200, 735, gamma 0.8). Its dark file read as approach lights on a night ground, but the light twin was about 95 percent paper with isolated clusters of cells; only the converging light lines suggested a picture. Every other mood slide carries a picture in both themes, so it went.

## Licensing note

Three mood slides are share-alike (CC BY-SA): the lighthouse, the dictionary and the manuscript page. The dithered files are adaptations, so the share-alike condition applies to them, and the credit plate on each slide is required. If the deck cannot carry share-alike images, swap these three for public domain or CC BY sources. The compass rose is public domain, as are the Babel painting, the Blue Marble, the calligraphy sheet, the cable chart and the wave print. The gem smoke openers are renders of Paper Shaders' Gem Smoke (Apache-2.0) through glyphfield, the brand's own tool, and their credit names Paper Shaders; the six dithered openers are renders of prototemplate directions built on the brand's own engines, and their credit names the direction.

## History

- Round five (commit c3123f7): eight shader openers, six two-tone and two color crops of the gem smoke covers, with the pipeline above.
- Commit 7d5c255 and its review pass: photographs and artworks replaced the eight shader openers, with the sentences comparing each picture to the company. The review changed the design system, website and developer experience crops, swapped the documentation polarity and fixed the plate and chrome rules.
- Round six (commit a1fb81d): fresh gem smoke renders from glyphfield for Blog and content (brand blue) and Developer experience (Fire preset) replaced the manuscript page and the cable chart; the Blue Marble replaced the runway for Status and plan; `scripts/build-deck.mjs` started inlining `opener-*` and `detail-*` at native size. The earlier version of this file recorded that work under "Replaced in round seven", which misnamed the round.
- Round seven: the six shader openers returned from c3123f7, the two gem smoke openers stayed, and the nine photographs became mood slides. The opener sentences became plain statements of what each section covers. The integrator renumbered the deck to 85 slides and added `mood-*` to the native-size rule in `scripts/build-deck.mjs`.
- Round eight, from the round seven review: the Bowen compass rose replaced the runway (`81-mood-compass`); the Blue Marble was recentered so the credit plate clears the disk; the aurora opener was recropped and retoned so the ground clips to ink; three mood slides moved earlier in their sections (`06-mood-earth`, `45-mood-dictionary`, `58-mood-cable`) and the content slides between shifted by one, with `DECK_SLIDES` in `src/lib/search-index.ts` reordered to match; the mood credit went from 13px to 15px; the six shader credits name their prototemplate direction and the two gem smoke credits name Paper Shaders; the Design system, Documentation, Blog and content and Status and plan sentences were corrected. The slide count and `SECTIONS` did not change.

## Rejected candidates

Recorded so the next round does not repeat them.

Shader crops (round five), processed with the shader pipeline at several crops and tone settings unless noted:

- Dither field panel: every text-free region is under 375 by 100 pixels, and the panel is already one bit at a coarser cell, so re-dithering produced moire.
- X banner globe: the source dither is 6 pixel cells. Re-dithered directly it became a blocky checker; blurred first it became a soft blob.
- Prism beam: near white after autocontrast at every gamma, a blank wedge.
- Aurora hero smoke: a narrow tonal range that dithered to uniform noise, and a high-contrast cut exposed the hero card grid.
- Terminus board grid: the cells and the grid lines rendered as a plaid at any tone setting.
- Wide rule rings and toolchain streaks: the text-free regions are too small (under 240 pixels wide) and scale to mush.
- Hourglass walls: the walls are interface cards with copy at every depth.
- Singularity ring bottom arc: a strong image, held back because it repeats the Brand engine. Round eight tested it again as the Status and plan fallback (boxes 608, 604, 992, 820 and 640, 620, 960, 800 on `singularity-dark-1` and `-2`, gamma 0.85 and 1.0): the wider boxes catch the locale labels under the ring, and in the tight box the arc's bright edge runs under the title plate, so the aurora retone was kept.
- Aurora paper at black point 90 to 140 with gamma 1.6 (round eight): the ground clips, but the band thins to a dotted line and the flare is the only feature; gamma 0.8 with black 90 kept the band's body and was used.
- Reel poster as two-tone smoke (blurred 6 pixels then dithered): a good image, held back because the smoke material already opens two sections.

Photographs, processed with the photograph pipeline at several crops and tone settings unless noted:

- Interpreters' booth (Pete Souza, 2009): shows a president; skipped per the brief.
- Müller-Brockmann poster and the Vignelli subway map: other designers' work. They stay on the references slide.
- Solari board at Secaucus Junction: dithered cleanly, but the destination names read as stray copy on the sheet, and a Solari board already sits on the references slide.
- Gutenberg forme (Gutenberg Museum, Mainz): the rows of type turned to noise at 800 by 450 in every crop.
- 1691 Sanson double hemisphere map: the line work is too fine; the two circles read but the interiors turned to noise.
- Jacquard pattern cards for sari weaving: mid-tone heavy; the holes read only in a 1:1 crop and the rest was noise.
- Linotype operator (Queensland Times, 1975): the operator and the machine share one mid-tone; muddy in three crops and tone settings.
- Switchboard operators (Seattle, 1958): the operators dithered to dark blobs against the board.
- Sextant (NPS): the dark cloth came out as a mid-gray field and the chrome as unreadable shapes.
- Adler typewriter keys: legible, but the tilted keyboard and the gray desk made a mundane sheet.
- Test-Bed Telescope dome at night (ESO): the sky dithered to noise and the dome was small.
- Bowen compass rose engraving (1748): reads well after a 3 pixel minimum filter; held in reserve in round five and used in round eight for the Status and plan mood slide.
- Karahisari, tall strokes centered (310, 640, 1030, 1045): the strongest composition of the tight crops, but the crease in the sheet crossed it and read as a stray rule; the window was moved up until the crease fell off the bottom edge.
- Rosetta Stone, container ship, Trinity College Long Room, Corcovado silhouette, Apollo 9 control room: not processed. The ship carries a shipping line's name across the hull, the stone is a dark slab whose text is below the cell size, the Long Room and the control room are mid-tone interiors, and the Corcovado photograph is dominated by the statue.
- Round nine (this state), from Kevin's directive on full-picture slides: every mood slide's plate gained the picture's title and a sentence on why it is in the deck, above the credit, at `max-width: 560px`; the Blue Marble moved left (820 pixel disk centered at x 420) so the plate meets no lit cell; and the viewer gained a backdrop layer (`.backdrop` in `parts/head.html`, `syncBackdrop()` in `parts/tail.html`) that paints the active opener or mood image across the whole stage area at object-fit cover in slide mode, with the sheet transparent and edgeless and the slide's own image hidden so the two crops never show together. The grid, the book and the thumbnails show the sheet as before.
