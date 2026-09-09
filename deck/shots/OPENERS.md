# Section openers

Eight full-bleed images, one per section, produced in round five. Each opener is a 1600 by 900 JPEG at quality 85. Six are two-tone images in ink and paper made with the deck's own screen. Two stay in color because the gem smoke material is the point of those sections.

## Files

| Section | Dark file | Light file | Kind |
| --- | --- | --- | --- |
| Brand | `opener-brand.jpg` | `opener-brand-light.jpg` | two-tone |
| Design system | `opener-design-system.jpg` | `opener-design-system-light.jpg` | two-tone |
| Website | `opener-website.jpg` | `opener-website-light.jpg` | two-tone |
| Documentation | `opener-documentation.jpg` | `opener-documentation-light.jpg` | two-tone |
| Blog and content | `opener-blog.jpg` | `opener-blog-light.jpg` | color, same file |
| Developer experience | `opener-developer-experience.jpg` | `opener-developer-experience-light.jpg` | color, same file |
| Prototemplate and glyphfield | `opener-prototemplate.jpg` | `opener-prototemplate-light.jpg` | two-tone |
| Status and plan | `opener-status.jpg` | `opener-status-light.jpg` | two-tone |

The slide references the dark file in `data-dark` and the light file in `src`. The two color openers use identical files for both themes.

## Shared pipeline

All two-tone openers went through the same Pillow steps.

1. Crop the box listed below from the source render. Every box excludes navigation, headlines, chips, labels and the mark; only shader output remains.
2. Resize to cover 800 by 450 with Lanczos, trimming the long side centered.
3. Convert to grayscale. Where the source is a light render, invert first so the working image is white on black.
4. Autocontrast with a 0.5 percent cutoff, then an optional black point that clips the dim ground to solid ink, then a gamma curve (values below 1 lift mid-tones, values above 1 drop them).
5. Ordered dither with the 8 by 8 Bayer matrix, thresholds at (m + 0.5) / 64, to one bit at 800 by 450.
6. Scale up 2x with nearest neighbour to 1600 by 900, so every cell is a crisp 2 by 2 pixel square. This is the same screen the dither slide describes.
7. Save the dark file. Invert the one-bit image and save the light file.

The color openers skip steps 3 to 7: crop, resize to cover 1600 by 900 with Lanczos, save.

Source renders are 1600 by 900 captures of prototemplate directions (`/d/<slug>?chrome=0`) and existing cover art in this folder. Crop boxes are given as left, top, right, bottom in source pixels.

## Brand

- Source: `event-horizon-dark-2.jpg`, the careers page horizon field shader.
- Crop: 640, 128, 960, 308 (320 by 180). The top arc of the ring between the orbiting locale labels and the hero text, scaled 5x. The ring's glow fills the upper third and the field below it is solid ink, where the title plate sits.
- Processing: gamma 0.85, no black point.
- Sentence: This section sets out the company, its audience, its voice, and the values the identity carries.

## Design system

- Source: `chroma-flow-light-1.jpg`, the chroma flow direction in light theme.
- Crop: 216, 60, 540, 242 (324 by 182). The top left corner of the hero, where the doubled flow lines bend before they reach the central ellipse. No text in the region.
- Processing: source inverted, black point 16, gamma 1.1. The light twin is therefore dark doubled lines on paper, which matches the site's own light rendering.
- Sentence: This section documents the mark, the color set, the type, the line system, the dither, and the isometric projection.

## Website

- Source: `glyph-rain-dark-1.jpg`, the production homepage hero engine.
- Crop: 740, 180, 1384, 542 (644 by 362). The right half of the hero, the character field alone, clear of the headline on the left and the language grid below.
- Processing: black point 10, gamma 1.0. Dim trailing glyphs render as dotted shapes, bright ones as solid shapes.
- Sentence: This section shows the production site in both themes and the visual decisions on each page.

## Documentation

- Source: `lens-gate-dark-1.jpg`, the lens gate direction.
- Crop: 600, 412, 980, 626 (380 by 214). The upper half of the wireframe sphere with the horizontal rules behind it, cut below the hero card edge and above the mark and the two status chips.
- Processing: black point 30, gamma 1.2. The dim gradient ground clips to ink so the rules and the sphere wires stand on their own.
- Sentence: This section covers the docs site, its layout for readers, and the files it exposes for agents.

## Blog and content

- Source: `cover-fuma-nama-og.png`, the designed blog cover with the orange gem smoke.
- Crop: 400, 0, 720, 180 (320 by 180). The top edge of the cover, where the plume folds, above the lockup. Scaled 5x in color, halftone dots included.
- Processing: color, no dither.
- Sentence: This section covers the blog index, the cover system, and the rules for written content.

## Developer experience

- Source: `cover-gt-open-source.png`, the open source announcement cover with the blue gem smoke.
- Crop: 0, 320, 391, 540 (391 by 220). The lower left of the cover below the lockup, a single diagonal band of smoke rising to the upper right.
- Processing: color, no dither.
- Sentence: This section covers the CLI, the libraries, and the surfaces developers see outside the site.

## Prototemplate and glyphfield

- Source: `prism-light-dark-1.jpg`, the prism light direction.
- Crop: 370, 606, 588, 729 (218 by 123). The wireframe prism body itself, between the rotating source labels on the left and the translated labels inside the beam on the right. Scaled 7.3x, so the faces read as dithered glass and the edges as soft bright lines.
- Processing: black point 10, gamma 0.9.
- Sentence: This section covers the lab where the directions and shader engines live and the open source studio that shares them.

## Status and plan

- Source: `aurora-paper-dark-2.jpg`, the aurora paper direction.
- Crop: 900, 514, 1231, 700 (331 by 186). The green aurora band to the right of the table copy, cut between two table rules so no rule and no label remains. The flare on the left edge is part of the shader.
- Processing: black point 25, gamma 1.6. The dark field drops to ink and the band carries the tone.
- Sentence: This section states what exists today, what is fixed, and how the identity project will be judged.

## Rejected candidates

Recorded so the next round does not repeat them.

- Dither field panel: every text-free region is under 375 by 100 pixels, and the panel is already one bit at a coarser cell, so re-dithering produced moire.
- X banner globe: the source dither is 6 pixel cells. Re-dithered directly it became a blocky checker; blurred first it became a soft blob.
- Prism beam: near white after autocontrast at every gamma, a blank wedge.
- Aurora hero smoke: a narrow tonal range that dithered to uniform noise, and a high-contrast cut exposed the hero card grid.
- Terminus board grid: the cells and the grid lines rendered as a plaid at any tone setting.
- Wide rule rings and toolchain streaks: the text-free regions are too small (under 240 pixels wide) and scale to mush.
- Hourglass walls: the walls are interface cards with copy at every depth.
- Singularity ring bottom arc: a strong image, held back because it repeats the Brand engine.
- Reel poster as two-tone smoke (blurred 6 pixels then dithered): a good image, held back because the smoke material already opens two sections.
