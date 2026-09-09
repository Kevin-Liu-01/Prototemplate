# Section openers

Eight full-bleed images, one per section, chosen in round five after Kevin's correction: the openers are photographs and artworks that carry the company's ideas (translation, language, infrastructure, precision, distance, the ocean), not shader renders. Every opener is a two-tone image in ink and paper made with the deck's own screen, saved as a 1600 by 900 JPEG at quality 85 with a light twin. All sources are Wikimedia Commons files under a public domain or Creative Commons license. No opener shows a recognizable public figure and none is another designer's poster.

## Files

| Section | Dark file | Light file | Image |
| --- | --- | --- | --- |
| Brand | `opener-brand.jpg` | `opener-brand-light.jpg` | Bruegel, The Tower of Babel, 1563 |
| Design system | `opener-design-system.jpg` | `opener-design-system-light.jpg` | Karahisari, calligraphy exercise, 16th century |
| Website | `opener-website.jpg` | `opener-website-light.jpg` | Louisbourg lighthouse in a fall storm |
| Documentation | `opener-documentation.jpg` | `opener-documentation-light.jpg` | The Compact Oxford English Dictionary, open |
| Blog and content | `opener-blog.jpg` | `opener-blog-light.jpg` | Prashna Upanishad manuscript page, Devanagari |
| Developer experience | `opener-developer-experience.jpg` | `opener-developer-experience-light.jpg` | Eastern Telegraph cable chart, 1901 |
| Prototemplate and glyphfield | `opener-prototemplate.jpg` | `opener-prototemplate-light.jpg` | Hokusai, The Great Wave off Kanagawa, about 1831 |
| Status and plan | `opener-status.jpg` | `opener-status-light.jpg` | Runway 16R approach lights, Narita |

The slide references the light file in `src` and the dark file in `data-dark`. The slides carry the sentences and credits listed below. Round six (the review of these eight renders) changed the design system, website and developer experience crops, swapped the documentation polarity, rewrote the Prototemplate sentence, and fixed the plate and chrome rules recorded under Slide.

## Shared pipeline

Every opener went through the same Pillow steps. Sources are the Commons downloads scaled to 1800 pixels on the long side; crop boxes are left, top, right, bottom in those pixels.

1. Convert to grayscale and crop the box.
2. Where noted, apply a Gaussian blur (to turn small type or film grain into an even tone) before scaling. The cable chart isolates its routes by color instead of thickening every line; see its entry.
3. Fit to 800 by 450 with Lanczos, trimming the long side centered. Where noted, an unsharp mask is applied to a band of rows after the fit.
4. Autocontrast with a 0.5 percent cutoff. Clip to the black and white points listed (values at or below the black point become ink, values at or above the white point become paper). Apply the gamma curve (below 1 lifts mid-tones, above 1 drops them).
5. Ordered dither with the 8 by 8 Bayer matrix, thresholds at (m + 0.5) / 64, to one bit at 800 by 450.
6. Scale up 2x with nearest neighbour to 1600 by 900, so every cell is a crisp 2 by 2 pixel square. This is the screen the dither slide describes.
7. Polarity. The file whose ground matches the dark theme is the dark file and its inverse is the light file. For images whose positive rendering is mostly paper (a white sky, black script on a page, black lines on a chart) the positive image is the light file and the inverted image is the dark file. For images whose positive rendering is mostly ink (the night runway) the positive image is the dark file. The dominant field decides, not the background: the dictionary lies on a dark carpet, but the carpet is the outer 15 percent of the frame and the white pages are the field, so its positive is the light file.

## Slide

- The title, sentence and credit sit on a solid `--paper` plate (no blur, no shadow) anchored to the lower left of the content box. The plate grows upward, so a three-line sentence does not move its bottom edge (771) toward the bottom rule (844).
- The credit is 15px at line-height 1.45 in titanium, the `.cap` size, which is the smallest size the grammar allows on the sheet. Round five set it at 13px.
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

- Image: A page of a Prashna Upanishad manuscript, Sanskrit in Devanagari script, with corrections written between the lines.
- Source: File:Prashna Upanishad sample manuscript page, Sanskrit, Devanagari script.jpg
- Artist: Ms Sarah Welch.
- License: CC BY-SA 4.0.
- Crop: 187, 0, 1613, 803. The full height of the page, centered, with the side margins trimmed to 16 by 9. Black 40, white 215, no blur. The main text renders solid and the smaller interlinear notes render as fine marks.
- Reason: a text copied by hand and corrected between the lines. Written content is drafted, checked and edited in place. Language.
- Sentence: This manuscript was copied by hand and corrected between the lines; written content is edited the same way.
- Credit: Photograph: Ms Sarah Welch, CC BY-SA 4.0

## Developer experience

- Image: The Eastern Telegraph Company's chart of its submarine cable system, 1901.
- Source: File:1901 Eastern Telegraph cables.png
- Artist: Eastern Telegraph Company; the draughtsman is not recorded.
- License: Public domain.
- Crop: 500, 470, 1060, 785. The North Atlantic: Newfoundland and the Gulf of St Lawrence at left, the British Isles at top right, Iberia and the Mediterranean at right, the Sahara at bottom right. The routes are red on a cream map with teal coastal shading, so a plain grayscale puts routes, coast hatching, graticule and names in one mid tone. Instead the routes are isolated by color (a pixel is a route where R minus max(G, B) exceeds 35), fitted to 800 by 450 separately and composited as ink after the tone step; the ground is grayscale with blur 0.4, black 100, white 215. The routes render solid and continuous, the graticule as fine lines, the coasts and place names as texture, and the plate covers the Caribbean corner, not the bundle. The round five version (213, 458, 1636, 1260, 3 pixel minimum filter, black 80, white 230) fused everything into blobs at 800 by 450 and no coastline or route could be identified.
- Reason: the first global network that carried text between continents across the ocean floor. The libraries and the CLI are the infrastructure that carries translations into products. Infrastructure, distance and the ocean.
- Sentence: The 1901 telegraph network carried text between continents; the libraries and the CLI carry it into products.
- Credit: Map: Eastern Telegraph Company, 1901, public domain

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

- Image: Runway 16R approach lights at night, Narita Airport.
- Source: File:Runway 16R, Narita Airport (4055519259).jpg
- Artist: Kentaro Iemoto.
- License: CC BY-SA 2.0.
- Crop: 0, 60, 1200, 735. The full width of the frame from the horizon lights to the near lights. Gamma 0.8 lifts the dim lights so each renders as a solid cluster; no blur, no black or white point. Positive is the dark file: lights on the ink ground.
- Reason: approach lights mark a fixed path to a fixed point. The plan states what exists, what is fixed, and how the work is judged. Infrastructure and precision.
- Sentence: Approach lights mark a fixed path to a fixed point; the plan states what exists and how the work will be judged.
- Credit: Photograph: Kentaro Iemoto, CC BY-SA 2.0

## Licensing note

Four openers are share-alike (CC BY-SA): the lighthouse, the dictionary, the manuscript and the runway. The dithered files are adaptations, so the share-alike condition applies to them, and the credit line on each slide is required. If the deck cannot carry share-alike images, swap these four for public domain or CC BY sources.

## Rejected candidates

Recorded so the next round does not repeat them. All were processed with the pipeline above at several crops and tone settings unless noted.

- Interpreters' booth (Pete Souza, 2009): shows a president; skipped per the brief.
- Müller-Brockmann poster and the Vignelli subway map: other designers' work. They stay on the references slide and are not used as openers.
- Solari board at Secaucus Junction: dithered cleanly, but the destination names read as stray copy on the sheet, and a Solari board already sits on the references slide.
- Gutenberg forme (Gutenberg Museum, Mainz): the rows of type turned to noise at 800 by 450 in every crop.
- Blue Marble (NASA): cloud and ocean tones are too close; the disk read but the surface was noise.
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
