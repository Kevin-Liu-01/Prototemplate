# blog-fuma-nama: the storyboard (v4 cut after its fix round, 2026-10-06)

The trailer for "Fuma Nama: The philosophy of an open-sourcerer". It is built from `DESIGN-v4.md` (the headings, the transitions, the scale and the pacing, with its "Fix round" section) on top of `SCRIPT-v3.md` (the words, the facts and the spectacle map). It ends on the shared series end card (`kit/endcard/`). The narrator is Frederick Surrey (`kit/audio/voice.json`), in the nine v3 takes, unchanged; only their places in the film moved. `lib/cues.mjs` places each line and prints the film time of every word, and `index.html` holds the same table as `CUE`. The storyboard of the first v4 render is `archive-v4-pass1/STORYBOARD.md`, and v3's is `archive-v3/STORYBOARD.md`.

- **Length:** 59.5 s at 60 fps (3570 frames), 1920 x 1080. Nine narrated lines from 1.00 to 54.42 s, then the end card from 55.5 to 59.5 s, silent. The gaps between lines are 1.09 to 2.77 s (v3: 0.44 to 0.55 s), each holding a finished picture. The fix round added 0.5 s before line 7 and 1.0 s before line 8, so line 6's last move and line 7's travel each finish and hold before the next cut.
- **Cuts:** two hard cuts, both match cuts on the y 540 seam, on a 0.5 s beat and a spoken word: 37.5 ("The") and 44.5 ("If"). Every other change of picture is an object that stays and transforms, a match on position or shape, or moving type. The card starts at 55.5, the first beat after line 9's end plus 0.6 s.
- **Material:** fire gem smoke only (`kit/gemsmoke.js`), as a glass shape or printed through the 8 by 8 Bayer screen on one 3 px cell grid in black, ember `#7a2a08`, fire `#fe5b16` and sun `#f7ff61`, with white for the type, the marks and the doubled lines, and raised ink `#101010` for the docs page's panels.
- **The field:** mount A's free fire smoke printed in black, ember and fire behind every picture from the first frame to 55.5, on one clock (shader seconds 0.4 + 0.075 t). It is at tone 0.35 on the first frame and full by 0.8 s, and it lowers its tone to 0 over 55.1 to 55.5. Every heading and object holds it off with a zone drawn from its own ink (44 px of black around type, 18 px around objects, 10 px around the 762 px glass moon). Each zone clears and returns over 0.6 to 1.0 s inside a motion that is already running, never on a start of its own in a hold; zones that change on a cut switch on the cut.
- **Type:** four headings, Inter 500 through `var(--font)` (cv11 on, ss01 off), white, -0.035 em, one size (160 px), one line each, the ink seated on x 160, the cap top on y 172 and the baseline on y 288.4. Each is made of words Frederick says in that line, and each word rises out of its own mask 0.06 s before the take's alignment start for it (0.55 s, power3.out); a word under 0.20 s after the one before rises with it as one phrase. Nothing else moves while a heading's words rise. Each holds at least (words / 3) + 1 s once set. One accented word in the film: "One", in fire.
- **Mounts:** A (the field, the heap's light and the file's light, hidden), C (shot 7's GT mark, full frame, at the end card's own shader values) and B (the moon, full frame: shot 1's r 270 shelf moon, the 762 px moon of shots 4, 6 and 7 and its move into the grant). B lies over C and is clipped to its circle.
- **Pacing:** one main move at a time. A move may run several steps on into each other as one gesture (the seams into the parting, the slide into the square-off, the parting into the shrink, the travel into the seat). Each set piece holds still, apart from the smoke and the heap's drift, for at least 1.0 s before the next picture.

## Shot 1: the hook, the moon and the shelf (0.0 to 20.46, lines 1 to 3)

Line 1, 1.00 to 6.12: "One developer created Fumadocs, a docs framework with over 13,000 stars on GitHub."

| time | word | what moves |
| --- | --- | --- |
| 0.00 to 0.80 | | The field raises its tone from 0.35 to full in Bayer order. The hook's zone is clear from frame 0. |
| 0.92, 1.12 | "One" 0.98, "developer" 1.18 | "One developer" (160 px) rises word by word, "One" in fire; set 1.67. |
| 1.67 to 3.34 | "created Fumadocs, a docs" | The hook frame holds: the heading over the field alone (its floor). |
| 3.34 to 3.94 | "docs framework" | Moving type: the heading breaks into its 3 px cells, which leave in reading order (3.34 to 3.54), travel right and land as the Bayer print of the moon, r 270 at (1480, 522); the disc's other cells raise their tone 3.59 to 3.94. The moon's zone clears as the cells leave (3.14 to 3.84) and the field returns into the hook's place as they travel (3.54 to 4.24). |
| 4.36 to 5.54 | "13" 4.36, onto the end of "stars" (5.54) | 13.3k (92 px, fire star) rises under the moon, left-aligned on its left limb (x 1210, cap top 852), and tallies in GitHub's rounding. |
| 5.95 to 6.85 | "GitHub" | Both shelves draw out of their left crosses at x 144: shelf 1 on y 532 to a cross at 1166, 44 px short of the moon's limb; shelf 2 on y 822 to a cross at 1776, under the moon. |
| 6.85 to 7.85 | (gap) | Hold: the print moon, its count, the empty shelves. |

Line 2, 7.95 to 14.45: "Vercel Turborepo, shadcn/ui, Better Auth, Unkey and many others use it." (voice: "Vursell Turborepo, shad C N U I, Better Auth, Unkey and many others use it.")

| time | word | what moves |
| --- | --- | --- |
| 7.85 | "Vercel" 7.89 | Turborepo (130 px) raises its tone in its slot (row 1, column 1) and 31.2k (64 px) rises with it (0.5 s). |
| 9.48 | "shad" 9.52 | shadcn/ui (122 px) and 125k (row 1, column 2). |
| 11.29 | "Better" 11.33 | Better Auth (93 px) and 30.2k (row 1, column 3). |
| 12.41 | "Unkey" 12.45 | Unkey (115 px) and 5.5k (row 2, column 1). |
| 13.46 | "many others" 13.50 | Orama (122 px) with 10.6k and the GT mark in fire (110 px) with 1.1k, together (row 2, columns 2 and 3). |
| 14.16 to 14.96 | "use it" | A 200 px fire pulse runs shelf 2 from under the GT mark (x 907) to under the moon's centre (x 1480): a solid fire band over the line's whole 9 px gauge inside an 8 px fire glow; its tail closes by 14.96. "Fuma Nama"'s zone clears in the heading place while it runs (14.16 to 15.16). |
| 14.76 to 15.21 | | Where the pulse arrives, the moon's print tone-mixes into glass inside its disc (clipped 1 px outside the limb). |
| 15.21 to 16.21 | (gap) | Hold: the full shelf and the lit moon. |

Line 3, 16.33 to 19.94: "Fuma Nama has built it for three years, on top of his schoolwork."

| time | word | what moves |
| --- | --- | --- |
| 16.21, 16.65 | "Fuma" 16.27, "Nama" 16.71 | "Fuma Nama" rises word by word above the grid; set 17.20 (floor ends 18.87). |
| 18.66 to 19.26 | "on top of his schoolwork" | Everything but the heading recedes: the marks and shelves lower their tone to 0 in Bayer order, the counts drop into their masks (0.4 s), the moon's glow lowers to black inside its clip. The field returns into their places over the recede (18.66 to 19.56). |
| 19.56 to 20.46 | (end of line 3, gap) | Hold: "Fuma Nama" over the field alone, the hook frame again. From 18.66 a zone holds the field off the smoke's dark core at about (1210, 352), which would otherwise print a ring beside the name and the heap (v3's `pile-core`), until the docs page's zone takes the place (24.54 to 25.24). |

## Shot 2: the heap (20.46 to 25.34, line 4)

Line 4, 21.03 to 24.75: "He learned to code by modding games and reading piles of JavaScript."

- 20.46 to 21.40: moving type again. "Fuma Nama" breaks into its cells, which loosen by up to 30 px over 0.24 s and leave in reading order (20.46 to 20.66). Each 24 px cluster falls on a path that bends right into the mound's left flank and base (power2.in, 0.5 to 0.8 s) and resolves into one of the first glyphs there. The name is unreadable by 20.70, before "He" (20.91). The heap's zone clears with the dissolve (20.46 to 21.36).
- 20.46 to 24.04: the rest of the glyph rain falls (300 px over 0.34 s a glyph) from the start of the dissolve and condenses base first. The lower rows, which hold most of the glyphs, land fastest (each glyph's landing time follows its height to the power 1.8), so the mound's outline stands by about 21.5; the last glyphs settle on the crest on "JavaScript" (24.03). The heap is v3's glyph halftone on a 24 px grid (glyphs up to 26 px, tilted up to 15 degrees, lit by mount A sampled once), lowered 60 px: its crest is near (1240, 515) and no glyph stands in the docs page's place (x 100 to 1180, y 116 to 524). The page's place clears while the crest settles (23.54 to 24.54).
- 24.34 to 28.40: the heap's light drifts by under 3 percent of each glyph's size. 24.34 to 25.34 is the hold.

## Shot 3: the docs page and the file (25.34 to 30.50, line 5)

Line 5, 26.34 to 29.05: "He did not look at any documentation while he was learning."

| time | word | what moves |
| --- | --- | --- |
| 25.34 to 26.14 | (gap) | The docs page builds at 0.6 scale in the empty space above the heap (x 160 to 1120, y 176 to 464): its panels rise 16 px and raise their tone (0.5 s), then the nav, the sidebar, the content and the table of contents fill 60 ms apart. Bars are 10 to 12 px at full size (6 to 7.2 px on screen), the title bar 28 px, the table of contents' line 4 px with a 12 px dot, the edges 2 px. |
| 26.74 to 27.09 | "look" 26.79 | The table of contents' sun highlight steps down one section. |
| 27.40 to 28.00 | "documentation" | The page leaves by a tone mix on the 3 px grid. The heap is unchanged under it. The field returns into its place as it goes (27.70 to 28.60). |
| 28.40 to 29.50 | "while he was learning" | The heap sorts into the file: the heap's top glyphs travel into the file's slots in reading order (0.55 s each, starts spread over 0.55 s), each straightening and settling to 22 px; the rest of the heap lowers its tone to 0 in Bayer order of its 24 px grid. |
| 29.50 to 30.50 | (gap) | Hold: the file of 25 lines (x 975 to 1736, top y 141), made of the heap's own glyphs, inked by mount A's light at half rate, its lit band in sun and white across the upper and middle blocks. |

## Shot 4: the moon breaks (30.50 to 37.5, line 6)

Line 6, 31.04 to 35.62: "He designed Fumadocs in four layers that developers can take apart and reshape."

| time | word | what moves |
| --- | --- | --- |
| 30.50 to 31.50 | (gap), "He designed" | The file becomes the moon: the file's glyphs lower their tone in Bayer order from the first frame (1 - (1 - u)^2, 30.50 to 31.00) while the 762 px glass moon (mount B, centre (1348, 540), r 381) raises its glow from black in the same right half (sine.inOut, 30.50 to 31.50, half lit at 31.00 as the file's last glyphs go). "Fumadocs"' zone clears meanwhile (30.50 to 31.35). |
| 31.55 | "Fumadocs" 31.61 | "Fumadocs" rises beside the moon (x 160 to about 867; the limb is at 967); set 32.10 (floor ends 33.44). |
| 32.32 to 32.82 | "four layers" | The glass tone-mixes into its Bayer print; the smoke eases from rate 0.2 to 0.015. |
| 32.99 to 34.62 | "that developers can take apart" | One move. Three crosses (3 px arms) at the limb, 0.2 s apart, each with a seam drawn out of it (9 px doubled line, 0.5 s, power3.out): the disc in four layers. The layers then part and spread to 15 and 42 px (33.82 to 34.62, power2.inOut, on the cell grid). As they start, "Fumadocs" drops back into its mask (33.82 to 34.27, power2.in). |
| 34.70 to 35.75 | "and reshape" | One move. Layer 3 slides 810 px left (power2.inOut 0.6) and squares off into the 552 by 270 block as it settles (35.15 to 35.75), re-sampled. The slot's 3 px fire outline draws behind it (34.80 to 35.30), and the doubled-line connector follows its right edge out of the slot's cross, which opens as the layer clears it, to a cross at x 740. |
| 35.75 to 37.5 | (gap) | Hold: the parted moon, the outline, the connector and the block. |

## Shot 5: the page breaks (37.5 to 44.5, line 7)

Line 7, 37.66 to 41.86: "The CLI can copy just the table of contents into your codebase." (voice: "The C L I can copy ...")

| time | word | what moves |
| --- | --- | --- |
| 37.50 | "The" 37.55 | Match cut on the beat: the moon's middle seam on y 540 becomes the docs page's nav seam on y 540. The page is at full size (x 160 to 1760, y 472 to 952), its nav seam drawn from a cross at x 136 to a cross at 1784, its highlight lit. The code panel (x 1340 to 1760, y 568 to 952, 14 rows of 12 px bars at a 24 px pitch) already lies under it. |
| 37.80, 38.05 | "CLI" 37.77 | The sidebar seam (x 480) and the table-of-contents seam (x 1400) draw down out of crosses on the nav seam to crosses at y 976 (0.5 s each, power3.out). |
| 38.55 to 39.65 | "copy just" | One move. The parts move apart (the nav up and the body down 12 px each about the nav seam, the sidebar left 36, the table of contents right 36; 38.55 to 39.05), and as they settle the page eases to 0.625 about (160, 540) (38.95 to 39.65), so the nav seam stays on y 540; its right edge sweeps left and uncovers the code panel and its cross. The nav seam keeps its length: its right cross eases to x 1768, the right cross of the moon's middle seam, and the seam runs on above the panel. "Into your codebase"' zone clears during the shrink (38.95 to 39.95). |
| 39.84 to 40.44 | "of contents" | The table of contents lifts 24 px (0.4 s) and leaves a 3 px fire outline in its slot; a connector draws from a cross on its right edge to a cross at x 1324 (40.09 to 40.44). |
| 40.63, 40.95 | "into" 40.69, "your" 41.01 | "Into your codebase" rises: "Into", then "your codebase" as one phrase ("codebase" is 0.17 s after "your"); set 41.50 (floor ends 43.50). |
| 41.50 to 42.30 | (end of line 7) | Hold. |
| 42.30 to 43.50 | (gap) | One move. The part travels along the connector into the panel (power2.inOut 0.8) and drops into the opening below the nav seam as it enters (42.75 to 43.25); the panel's rows part at the seat's middle (42.60 to 43.10); a sun block runs down its curved line as it seats (43.00 to 43.50). |
| 43.50 to 44.5 | (gap) | Hold: the page at 0.625, the empty slot's outline, the nav seam out to x 1768, the panel with its seated part, and the heading. |

## Shot 6: the same shape (44.5 to 50.05, line 8)

Line 8, 44.63 to 49.22: "If he started again from scratch, he thinks Fumadocs would probably have the same shape."

| time | word | what moves |
| --- | --- | --- |
| 44.50 | "If" 44.55 | Match cut on the beat, back to the parted moon exactly as shot 4 left it; the page's nav seam (x 113 to 1768) becomes the moon's middle seam (x 928 to 1768), so the seam's right part holds across the cut. The print comes back at 0.7 of its tone and eases to full over 0.4 s. "Into your codebase" leaves with the page; the field stays off its place and the page's until the pieces return. |
| 44.88 to 45.78 | "started again" | The seams, crosses, the slot's outline and the connector tone out (0.3 s); the pieces return to the circle and the block takes back its band shape as it slides home (0.9 s). The field returns into the left half with them. |
| 45.88 to 46.38 | "scratch" 45.76 | The print lowers its tone to 0.3: the circle stays, dim. |
| 46.38 to 48.81 | "he thinks Fumadocs would probably have the same shape" | The glyph moon fills the same circle row by row from the top: 16 writing systems with a few code characters, one `lang`-set text node per glyph, on a 36 px grid with glyphs up to 30 px, inked from the moon's smoke. Each 36 px block of the dim print leaves on the frame its glyph lands on it, so the circle is whole on every frame. Its last row lands on "shape" (48.81). |
| 48.81 to 50.05 | (end of line 8, gap) | Hold: the ink (never the size) follows the moon's smoke, so a lit band drifts through the glyphs. |

## Shot 7: the grant (50.05 to 55.5, line 9)

Line 9, 50.92 to 54.42: "Fumadocs is General Translation's first open-source grantee."

| time | word | what moves |
| --- | --- | --- |
| 50.05 to 50.85 | (gap) | The glyph moon becomes glass in place: the glyphs switch off in Bayer order of their 36 px grid as the 762 px glass moon raises its glow from black in the same disc, both on sine.inOut over 0.8 s. The moon's path clears in the field meanwhile. |
| 50.86 to 51.66 | "Fumadocs is" | The moon moves and shrinks to (1080, 700), r 210, with its clip and its field zone (power2.inOut 0.8). The GT mark's box clears during the move. |
| 51.71 to 52.51 | "General" 51.67 | The GT mark forms as glass in fire smoke (mount C) in the end card's own mark box (x 1428 to 1760, y 160 to 369). |
| 52.81 to 53.31 | "first" | The connector draws from a cross under the mark (1594, 393) down to y 700 and left to a cross at x 1306, one path with a square corner. |
| 53.38 to 53.83 | "open-source grantee" | A 200 px fire pulse (the full 9 px gauge, with its glow) runs it; its head reaches the moon on "grantee" (53.83). |
| 53.83 to 54.50 | "grantee" | The moon's smoke thickens inside its disc (innerGlow 1 to 1.4, 0.25 s) and settles. |
| 54.50 to 55.10 | (end of line 9) | Hold: the grant. |
| 55.10 to 55.50 | | Everything but the GT mark recedes: the field to tone 0, the moon's glow to black, the connector toned out on the 3 px grid, while the mark eases to the card's opening density 0.4 and its smoke clock reaches the card's 3.5. |

## The end card (55.5 to 59.5)

`GTEndCard.addEndCard(tl, { palette: 'fire', title: ['Fuma Nama: The philosophy', 'of an open-sourcerer'], url: 'generaltranslation.com/blog/fuma-nama', start: 55.5 })`, frame off, silent. Its first frame is the GT mark alone on black at density 0.4, shot 7's last frame, so the change to the card does not read as a cut. The poster is the settled card at 59.48.

## Sound

- **Narrator:** the nine v3 takes (`audio/vo-N.mp3`), unchanged, mastered by `lib/make-voice.mjs` at -18.0 LUFS mono, true peak -3.6 dBTP.
- **Bed:** round 5's bed re-cut to 59.5 s by `lib/make-bed.mjs`: A, B, A, B, A, B, A, B and the source's own settle. Seven joins, each a 0.6 s crossfade under continuous speech: 9.69 ("shadcn/ui"), 16.81 ("Nama has built"), 26.92 ("look at any documentation"), 34.04 ("apart"), 39.83 ("of contents"), 46.95 ("thinks Fumadocs") and 51.33 ("Fumadocs is General"), worst drone dips -1.5 to -3.5 dB. The last join enters B late (source 18.3088), so the settle begins at 57.28, 1.78 s into the card.
- **Mix:** `lib/make-mix.mjs`, the carve at strength 0.3 with `--flatten-carve-level`. The duck (5.8 dB) holds across every gap (bridge 3.0 s); in each gap of 1.5 s or longer the bed rises 3 dB on a half-sine from 0.15 s after the last word back to full depth 0.05 s before the next first sound; the 1.09 s gap after line 3 holds flat. The carve's dips hold across the whole gap (3.0 s). After line 9 the duck lets go over 0.8 s to -1.5 dB for the card, and the bed fades over the card's last 0.8 s.
