# Section openers

Eight full-bleed images, one per section. Six are photographs and artworks chosen in round five after Kevin's correction: they carry the company's ideas (translation, language, infrastructure, precision, distance, the ocean) and are two-tone images in ink and paper made with the deck's own screen, saved as 1600 by 900 JPEGs at quality 85 with a light twin. Two, Blog and content and Developer experience, are renders of the brand's own gem smoke material and stay in color; round seven restored them at Kevin's direction ("make sure our blog and content shader bg and developer experience shader bg are super high quality, right now blurry"), within the allowance in ROUND-5.md for at most two color openers where the gem smoke material is the point. The color openers are rendered at 3200 by 1800 and saved at 1600 by 900 at quality 92, and the same file serves both themes. All photographic sources are Wikimedia Commons files under a public domain or Creative Commons license. No opener shows a recognizable public figure and none is another designer's poster.

## Files

| Section | Dark file | Light file | Image |
| --- | --- | --- | --- |
| Brand | `opener-brand.jpg` | `opener-brand-light.jpg` | Bruegel, The Tower of Babel, 1563 |
| Design system | `opener-design-system.jpg` | `opener-design-system-light.jpg` | Karahisari, calligraphy exercise, 16th century |
| Website | `opener-website.jpg` | `opener-website-light.jpg` | Louisbourg lighthouse in a fall storm |
| Documentation | `opener-documentation.jpg` | `opener-documentation-light.jpg` | The Compact Oxford English Dictionary, open |
| Blog and content | `opener-blog.jpg` | `opener-blog-light.jpg` (same image) | glyphfield gem smoke, Default preset, brand blue |
| Developer experience | `opener-developer-experience.jpg` | `opener-developer-experience-light.jpg` (same image) | glyphfield gem smoke, Fire preset |
| Prototemplate and glyphfield | `opener-prototemplate.jpg` | `opener-prototemplate-light.jpg` | Hokusai, The Great Wave off Kanagawa, about 1831 |
| Status and plan | `opener-status.jpg` | `opener-status-light.jpg` | NASA, Blue Marble Next Generation, Western Hemisphere, 2007 |

The slide references the light file in `src` and the dark file in `data-dark`. The slides carry the sentences and credits listed below. Round six (the review of these eight renders) changed the design system, website and developer experience crops, swapped the documentation polarity, rewrote the Prototemplate sentence, and fixed the plate and chrome rules recorded under Slide. Round seven replaced the Blog and content and Developer experience photographs with gem smoke renders, replaced the Status and plan runway with the Blue Marble, and changed `scripts/build-deck.mjs` so that `opener-*` and `detail-*` files are inlined at their native size at JPEG quality 88 instead of being resampled to 1280 pixels wide, which is what blurred the full-bleed openers in the built deck. The replaced images and their settings are kept under Replaced in round seven.

## Shared pipeline

Every opener went through the same Pillow steps. Sources are the Commons downloads scaled to 1800 pixels on the long side; crop boxes are left, top, right, bottom in those pixels.

1. Convert to grayscale and crop the box. Where noted, one channel replaces the luminance conversion; the Blue Marble uses the red channel, see its entry. Pillow pads a crop box that reaches past the source with black, which the Blue Marble uses to place the disk in a wider frame.
2. Where noted, apply a Gaussian blur (to turn small type or film grain into an even tone) before scaling. The cable chart isolates its routes by color instead of thickening every line; see its entry.
3. Fit to 800 by 450 with Lanczos, trimming the long side centered. Where noted, an unsharp mask is applied to a band of rows after the fit.
4. Autocontrast with a 0.5 percent cutoff. Clip to the black and white points listed (values at or below the black point become ink, values at or above the white point become paper). Apply the gamma curve (below 1 lifts mid-tones, above 1 drops them).
5. Ordered dither with the 8 by 8 Bayer matrix, thresholds at (m + 0.5) / 64, to one bit at 800 by 450.
6. Scale up 2x with nearest neighbour to 1600 by 900, so every cell is a crisp 2 by 2 pixel square. This is the screen the dither slide describes.
7. Polarity. The file whose ground matches the dark theme is the dark file and its inverse is the light file. For images whose positive rendering is mostly paper (a white sky, black script on a page, black lines on a chart) the positive image is the light file and the inverted image is the dark file. For images whose positive rendering is mostly ink (the night runway) the positive image is the dark file. The dominant field decides, not the background: the dictionary lies on a dark carpet, but the carpet is the outer 15 percent of the frame and the white pages are the field, so its positive is the light file.

## Slide

- The title, sentence and credit sit on a solid `--paper` plate (no blur, no shadow) anchored to the lower left of the content box. The plate grows upward, so a three-line sentence does not move its bottom edge (771) toward the bottom rule (844).
- The credit is 15px at line-height 1.45 in titanium, the `.cap` size, which is the smallest size the grammar allows on the sheet. Round five set it at 13px.
- The two color openers reference the same image in `src` and `data-dark` (the light file is a byte copy of the dark file), so the plate is the only element that changes with the theme: ink text on a paper plate over the same render in both.
- The viewer draws the wordmark (stage 72, 864, 28 by 18) and the counter (right 72, bottom 22) in titanium over the image. Each opener paints two solid `--paper` chips under them (40 by 30 at 66, 858 and 60 by 28 at 1474, 856) from a `#stage > .s-opener::after` pseudo-element at z-index -1, after the image in tree order and under the viewer chrome, the same plate treatment the title uses. The selector is scoped to the stage because the grid and book thumbnails clone the slide without the chrome.

## Brand

- Image: The Tower of Babel, oil on panel, Kunsthistorisches Museum, Vienna.
- Source: File:Pieter Bruegel the Elder - The Tower of Babel (Vienna) - Google Art Project - edited.jpg
- Artist: Pieter Bruegel the Elder, 1563.
- License: Public domain.
- Crop: 300, 0, 1500, 675. The tower alone, from the crane at its top to the level of the lower arcades; the harbour and the crowd at the base are left out. Blur 1.0, black 60, white 205, gamma 1.15. The lit left face and the sky go to paper, the shadow side and the arches to ink.
- Reason: the painting is the origin story of translation as a problem. One language became many, and the company is named for the work of carrying meaning between them.
- Sentence: One language became many in this painting; the company is named for the work of carrying meaning between them.
- Credit: Painting: Pieter Bruegel the Elder, 1563, public domain

## Design system

- Image: Karalama, a calligraphy exercise sheet, ink on paper.
- Source: File:Ahmed Karahisari - Karalama (calligraphy exercise) - Google Art Project.jpg
- Artist: Ahmed Karahisari, 16th century.
- License: Public domain.
- Crop: 310, 475, 1030, 880. A 16 by 9 window 720 pixels wide in the middle band of the sheet, holding a few strokes at 150 to 300 pixels of thickness instead of the whole field; the window stops above the crease that runs across the sheet at source rows 883 to 887, so no seam crosses the image. Black 40, white 215, no blur. The strokes render solid, the paper renders clean with the pounced ground marks as dots, and the edge consistency of each stroke is what the eye reads. The round five crop (0, 500, 1341, 1254) showed the full-width field, which paired with the manuscript opener in the grid view and read as overlapping chaos against the sentence.
- Reason: an exercise sheet repeats each letterform until every stroke is consistent, which is the work a design system does for the mark, the type and the lines. Language and precision.
- Sentence: Karahisari repeated every stroke until the forms were consistent, which is what a design system is for.
- Credit: Calligraphy: Ahmed Karahisari, 16th century, public domain

## Website

- Image: Louisbourg Lighthouse, Nova Scotia, with waves breaking in a fall storm.
- Source: File:Louisbourg Lighthouse, waves breaking in a fall storm 1.jpg
- Artist: Ken Heaton.
- License: CC BY-SA 4.0.
- Crop: 300, 330, 1800, 1174. Drops most of the empty sky and the dark foreground; the tower on the right comes up to about 180 pixels wide and the breaking wave sits at sheet rows 380 to 500, above the plate. Blur 0.5, black 0, white 212, gamma 0.8, plus an unsharp mask (radius 8, 180 percent, threshold 3) on rows 150 to 260 of the 800 by 450 frame, the sea band, so the spray separates from the lit water. The sky goes to paper, the sea band keeps its texture, and the heath dithers instead of clipping, so the dark twin shows a modulated field rather than a slab. The round five crop (0, 150, 1800, 1162, blur 0.8, black 40) clipped the heath to solid ink and put the plate over the wave.
- Reason: a lighthouse is the first structure a ship sees from the sea, and the site is the first surface a visitor sees. Distance and the ocean.
- Sentence: A lighthouse is the first structure seen from the sea; the site is the first surface a visitor sees.
- Credit: Photograph: Ken Heaton, CC BY-SA 4.0

## Documentation

- Image: The Compact Oxford English Dictionary, open on a carpet.
- Source: File:Compact Oxford English Dictionary 2.jpg
- Artist: Cullen328.
- License: CC BY-SA 4.0.
- Crop: 0, 110, 1800, 1122. The whole open book with a margin of carpet on every side. Blur 2.0 so the small type becomes an even tone, black 110 so the carpet drops to solid ink, white 235. The pages read as paper, the text blocks as a regular dither, the gutters and margins as clean paper. Positive is the light file: the pages are the dominant field, so the light theme shows the photograph (a white book on the black carpet) and the dark theme shows the inverse, dark pages with the text columns as a light dither, which reads like the deck's code panel. Round five had this the other way around, which made the slide the brightest sheet in the dark deck and a negative in the light one.
- Reason: a dictionary is the reference work, read in pieces and in any order, and the docs are built to be read the same way. Language and precision.
- Sentence: A dictionary is read in pieces and in any order; the docs are built to be read the same way.
- Credit: Photograph: Cullen328, CC BY-SA 4.0

## Blog and content

- Image: the gem smoke material, the GPU material behind the designed covers and the reel (the Designed covers slide), in the brand blue: white smoke over a blue field, the polarity of the GT open-source cover.
- Source: glyphfield (`/Users/kevinliu/repos/glyphfield`), route `/shader-preview?materialId=paper-gem-smoke&diagnostics=1&live=1` on the local dev server (port 3012). The route runs Paper Shaders' Gem Smoke family (Apache-2.0) through glyphfield's live material canvas; `diagnostics=1` with `live=1` is the only combination that plays the shader live and draws no overlay. Default preset, `preservePresetGeometry`, shape `metaballs`, `colorInner` transparent, as the route sets them.
- Render: Chromium (Playwright, `--use-gl=angle --use-angle=metal --ignore-gpu-blocklist`), 1600 by 900 viewport at device scale factor 2. Two things in the route work against a sharp capture and were overridden on the `paperShaderMount` handle after the canvas reported ready: the route caps the canvas at 360,000 pixels (`maxPixelCount`), and under an emulated scale factor Paper's ResizeObserver reads the box in CSS pixels and sizes the canvas at 1x. The mount's `devicePixelsSupported` flag was cleared and `setMinPixelRatio(2)` and `setMaxPixelCount(3200 * 1800 + 1)` were called; the drawing buffer was then verified at 3200 by 1800 with render scale 2 (`u_pixelRatio` 2, so the composition matches the site at 1600 by 900). The route's preview palette is the violet "metal" palette for every preset, so the brand palette was set through `setUniforms`: `colorBack #2f5ce0` (the accent on light from the Color slide), `colors [#ffffff, #86a8ff]`, `colorInner` transparent.
- Frame: three element screenshots of the canvas at about 4, 5 and 6 seconds of playback; the third was kept because its highlight sits right of center, clear of the plate, and the left half is flat blue under the title. Saved from the 3200 by 1800 PNG as a 1600 by 900 JPEG with Lanczos at quality 92 (4:4:4). The light file is a copy.
- Not chosen: the same material on the ink ground (`colorBack #070707`, `colors [#2f5ce0, #ffffff]`) reads as a dark slide with a blue rim and does not match the covers; the route's own violet palette is not a brand color.
- Reason: the blog is where the covers live, and the covers are this material in this color.
- Sentence: The gem smoke material renders this opener in the brand blue; the designed covers and the reel use the same material.
- Credit: Material: glyphfield gem smoke

## Developer experience

- Image: the same gem smoke material in Paper's Fire preset with the preset's shipped colors (`colors [#fe5b16, #f7ff61, #ffffff]`, `colorBack #000000`, `colorInner` transparent), so the two color openers read as one material in two states.
- Source: glyphfield, route `/shader-preview?materialId=paper-gem-smoke-fire&diagnostics=1&live=1`, the same server, browser and resolution steps as the Blog opener. The route replaces the preset's colors with its violet preview palette, so the shipped colors were passed back through `setUniforms`.
- Frame: the third sample, about 6 seconds in. Its lower left is black, so the plate sits on the ink ground in the dark theme and the paper plate has full contrast in the light theme, and the bright band runs across the right half. Saved the same way, 1600 by 900 at quality 92; the light file is a copy.
- Not chosen: the Infrared preset (magenta ground with five colors) is louder than anything else in the deck; the Fluorescent preset in the route's palette looked the same as the Default.
- Note: the orange is Paper's preset color, not the Fumadocs partner color on the Designed covers slide. The credit line names the material, not a partner.
- Sentence: The same gem smoke material in its fire preset renders this opener. Developer experience is the primary brand surface.
- Credit: Material: glyphfield gem smoke

## Prototemplate and glyphfield

- Image: The Great Wave off Kanagawa, woodblock print from Thirty-six Views of Mount Fuji.
- Source: File:Tsunami by hokusai 19th century.jpg
- Artist: Katsushika Hokusai, about 1831.
- License: Public domain.
- Crop: 0, 90, 1800, 1102. Full width; the crest at the top edge, the boats at the bottom edge trimmed, the signature cartouche kept at top left. White 225 so the graded sky goes to clean paper; no blur, no black point.
- Reason: a woodblock print is one carved template pulled thousands of times, which is what Prototemplate is: the template is built once and every direction is rendered from it. The ocean. The round five reason (flat color and hard edges) was true of every ukiyo-e print and carried nothing specific to the section.
- Sentence: Thousands of prints were pulled from one set of carved blocks; Prototemplate builds the template once and renders every direction from it.
- Alternative: if the ubiquity of this print is still a problem, two public domain prints with rarer subjects would take the same pipeline: Hokusai's Kajikazawa in Kai Province (fishing lines into a working sea) and Hiroshige's Sudden Shower over Shin-Ohashi Bridge (rain as hard parallel lines). Both are on Wikimedia Commons; neither was downloaded in round six.
- Credit: Print: Katsushika Hokusai, about 1831, public domain

## Status and plan

- Image: The Blue Marble, Western Hemisphere, from NASA's Blue Marble Next Generation series: a composite of MODIS land and ocean data (2001 to 2004), a single day of clouds, sea ice, radar topography and city lights along the terminator, published in 2007.
- Source: File:Blue Marble Western Hemisphere.jpg (local copy `scratchpad/photo/earth-night.jpg`, 1800 by 1800).
- Artist: NASA Earth Observatory, images by Reto Stöckli, based on data from NASA and NOAA; the Commons file is dated October 2, 2007.
- License: Public domain.
- Crop: -1201, 35, 1878, 1767. The disk spans 72 to 1722 across and 72 to 1730 down in the source (center 897, 901). The box is 3079 by 1732 and reaches past the left edge, where Pillow pads black, which is the source's own ground. Fitted to 800 by 450 this puts the disk at 860 pixels of diameter on the sheet, centered at x 1090, 20 pixels off the top and bottom edges, with the space at left under the plate; the plate's right edge crosses only the South Pacific corner of the disk, which is ink anyway.
- Tone: the red channel instead of luminance. In luminance the ocean and the cloud tones sit close together and the disk dithers to noise, which is why round five rejected the image. In the red channel the ocean drops toward black while land and cloud rise, so the oceans clip to ink and the continents and cloud bands render as texture; the city lights on the night side render as scattered single cells. Blur 0.6, black 80, white 210, gamma 1.0. Positive is the dark file: the disk on the ink ground. The light file is the inverse.
- Reason: the photograph shows the whole planet in one frame, and the section shows the whole project in one place: what exists, what is fixed, and how the work is judged. Kevin asked for it ("also i like the blue marble"). It took the Status and plan slot rather than Brand because the Tower of Babel is the literal origin story behind the company's name and the runway was the weaker fit.
- Sentence: The Blue Marble shows the whole Earth in one frame; the plan shows the whole project in one place.
- Credit: Image: NASA, Reto Stöckli, 2007, public domain

## Licensing note

Two openers are share-alike (CC BY-SA): the lighthouse and the dictionary. The dithered files are adaptations, so the share-alike condition applies to them, and the credit line on each slide is required. If the deck cannot carry share-alike images, swap these two for public domain or CC BY sources. The manuscript and the runway, both share-alike, left the deck in round seven. The gem smoke openers are renders of Paper Shaders' Gem Smoke (Apache-2.0) through glyphfield, the brand's own tool; the credit line names the material.

## Replaced in round seven

Kept so the images can be restored with one command each. All three followed the shared pipeline.

- Blog and content, Prashna Upanishad manuscript page (File:Prashna Upanishad sample manuscript page, Sanskrit, Devanagari script.jpg, Ms Sarah Welch, CC BY-SA 4.0): crop 187, 0, 1613, 803; black 40, white 215, no blur; positive is the light file. Sentence: This manuscript was copied by hand and corrected between the lines; written content is edited the same way. Credit: Photograph: Ms Sarah Welch, CC BY-SA 4.0.
- Developer experience, Eastern Telegraph cable chart (File:1901 Eastern Telegraph cables.png, public domain): crop 500, 470, 1060, 785; routes isolated by color (a pixel is a route where R minus max(G, B) exceeds 35), fitted to 800 by 450 separately and composited as ink after the tone step; ground blur 0.4, black 100, white 215; positive is the light file. Sentence: The 1901 telegraph network carried text between continents; the libraries and the CLI carry it into products. Credit: Map: Eastern Telegraph Company, 1901, public domain.
- Status and plan, Runway 16R approach lights (File:Runway 16R, Narita Airport (4055519259).jpg, Kentaro Iemoto, CC BY-SA 2.0): crop 0, 60, 1200, 735; gamma 0.8, no blur, no black or white point; positive is the dark file. Sentence: Approach lights mark a fixed path to a fixed point; the plan states what exists and how the work will be judged. Credit: Photograph: Kentaro Iemoto, CC BY-SA 2.0.

## Rejected candidates

Recorded so the next round does not repeat them. All were processed with the pipeline above at several crops and tone settings unless noted.

- Interpreters' booth (Pete Souza, 2009): shows a president; skipped per the brief.
- Müller-Brockmann poster and the Vignelli subway map: other designers' work. They stay on the references slide and are not used as openers.
- Solari board at Secaucus Junction: dithered cleanly, but the destination names read as stray copy on the sheet, and a Solari board already sits on the references slide.
- Gutenberg forme (Gutenberg Museum, Mainz): the rows of type turned to noise at 800 by 450 in every crop.
- Blue Marble (NASA): in round five the cloud and ocean tones were too close in luminance; the disk read but the surface was noise. Round seven took the red channel instead and it became the Status and plan opener; see that entry.
- 1691 Sanson double hemisphere map: the line work is too fine; the two circles read but the interiors turned to noise.
- Jacquard pattern cards for sari weaving: mid-tone heavy; the holes read only in a 1:1 crop and the rest was noise.
- Linotype operator (Queensland Times, 1975): the operator and the machine share one mid-tone; muddy in three crops and tone settings.
- Switchboard operators (Seattle, 1958): the operators dithered to dark blobs against the board.
- Sextant (NPS): the dark cloth came out as a mid-gray field and the chrome as unreadable shapes.
- Adler typewriter keys: legible, but the tilted keyboard and the gray desk made a mundane sheet.
- Test-Bed Telescope dome at night (ESO): the sky dithered to noise and the dome was small.
- Bowen compass rose engraving (1748): reads well after a 3 pixel minimum filter; held in reserve, not needed.
- Cable chart, routes only (round six): isolating the red routes, lifting everything else to a light ghost tone and thickening the route mask, at three crops, turned the routes into thick blobs on a noisy gray field. The hybrid used instead keeps the grayscale ground and composites the routes as ink without thickening.
- Karahisari, tall strokes centered (310, 640, 1030, 1045): the strongest composition of the tight crops, but the crease in the sheet crossed it six pixels under the plate's top edge and read as a stray rule; the window was moved up until the crease fell off the bottom edge.
- Rosetta Stone, container ship, Trinity College Long Room, Corcovado silhouette, Apollo 9 control room: not processed. The ship carries a shipping line's name across the hull, the stone is a dark slab whose text is below the cell size, the Long Room and the control room are mid-tone interiors, and the Corcovado photograph is dominated by the statue.
