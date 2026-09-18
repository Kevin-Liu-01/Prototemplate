---
name: gt-docs-visual-tokens
description: The measured visual system of the General Translation docs (colors, type, radii, icon sets, layout at 1440) and the sizing rules for graphics shown in the blog column. Use as the fixture set when drawing anything that must read as the GT docs, and to size labels and crops so they survive the article width.
---

# GT docs visual tokens

Measured on the redesigned docs (Fumadocs based) in September 2026 at
1440 by 900. Re-measure when the docs change; the graphics generator
keeps these as named rectangles.

## Colors

| token | value |
| --- | --- |
| dark ground | `#09090b` |
| graphics stage ground | `#111216` |
| border | `#27272a`; second border `#3f3f46` |
| text | `#fafafa`; muted `#a1a1aa`; dim `#71717a` |
| link and thumb blue | `#60a5fa` (hsl 213 94% 68%) |
| brand accent blue | `#0078FF`; secondary `#457AFF` |
| removal red in graphics | `#f0524f` |

## Type

Inter (variable) for interface and body, Geist Mono for code and
measurements. The h1 is 600 at 32px with -0.04em tracking; body is 400;
italics carry meta ("Last updated …") and asides.

## Shape and icons

Radii 6 to 8px. Icons that carry meaning are Heroicons solid; utility
icons (search, theme, chevrons, copy) stay Lucide outline. Flags are
custom matte SVGs, never emoji. The theme toggle is a half-filled circle
and appears top right and bottom left.

## Layout at 1440

Sidebar 290px; content column 746px from x 310; contents rail from x 1080;
sidebar rows 31px; the header controls at 1068 by 12, 356 wide; footer
links and preferences in the sidebar's bottom 200px. The sidebar rail is
one SVG path per link group, 12px in per nesting level with a 45 degree
bend; the blue thumb marks the current page and a fainter one follows the
pointer.

## Sizing for the blog column

The article shows a 1600px stage at about 0.44x (roughly 700 CSS px).
Labels 26px or larger, lines 3px, crops at 1.2x or more, panel headers
32px, measurement labels 25px on a dark backing pill. Zoom sparse
compositions to fill 90% of the frame. Backgrounds at 2x with smooth
scaling and dimmed to 36% under article visuals; covers at full strength.
Export at 3840 wide.
