# blog-fuma-nama: the v4 design (flow and headings)

This is the design for the v4 cut of the Fuma Nama trailer. It is written before any composition code. The build reads it with `SCRIPT-v3.md` (the words, the facts and the spectacle map, which stay in force) and replaces `STORYBOARD.md` from it. Nothing here changes the narration: the nine Frederick Surrey takes in `audio/` are kept exactly as recorded, and only their placement in the film moves.

Kevin's notes this design answers, newest first:

- 2026-10-06, on the v3 cut, binding: "there are way too many headers in the blog videos and they dont actually line up with whats being said as well and theres too many visuals that are rapidly playing, which is not good, we can just increase the length if u need".
- Earlier: "you should be fine with redoing visuals so that transition flows and headers are a lot better for the blog videos".
- His standing rules still hold: every set piece he has seen stays (it may be redesigned, re-staged, merged or given a new job), the stakes come early, the narration tells its own story, Inter only through `var(--font)`, no eyebrows, no monospace as a voice, no overlaid frame, the dithered gem smoke, the shared end card with the post's link, and plain technical English on screen.

## What was wrong in v3

I watched the v3 final (`../../out/blog-fuma-nama.mp4`, 48.0 s) as full-resolution frames and as 6 fps strips of every shot, and read its composition (`index.html`, `lib/cues.mjs`) and `STORYBOARD.md`.

- **Headings.** The cut had twelve type moments in 44 s of story. Eight were post phrases that Frederick never says ("Each site looks vastly different", "A huge pile of JavaScript", "The primary source", "Four modular layers", "Building blocks", "Less magic", "Designed to be that way", "Software for the public good"). None rose with its own words. The four whose words are spoken rose 0.4 to 1.8 s before those words ("On top of / his schoolwork" was on screen 1.8 s before "on top of" was said), and the wordmark rose 1.2 s after "Fumadocs" was said. Five sizes were used (120, 130, 140, 150 px), and every heading rose and dropped the same way.
- **Bursts.** Several stretches put more events on screen than the eye can follow:
  - 26.06 to 27.82: the crosses, the glass-to-print mix, three seams, a heading leaving, a heading rising, the parting, the spread, the slot outline and the slide. That is ten events in 1.8 s.
  - 29.91 to 33.47: three seams, the parting, the shrink and the panel at once, the rows, the lift, a heading leaving, a heading rising, the connector, the travel, the rows parting, the seat and the sun run. That is fourteen events in 3.6 s.
  - 11.72 to 12.85: Orama, the GT mark and the pulse within 0.53 s.
  - 2.28 to 5.23: the moving type, the glass mix, the wordmark, its drop, the moon's move, the count and the rule. That is seven events in 3.0 s.
- **Cuts.** Six hard cuts joined unrelated pictures (17.0, 21.5, 24.5, 29.5, 34.5 and 39.5), plus a hard cut into the card. Several shots opened on a nearly empty frame while their object built (21.5, the small docs page; 23.0 to 23.3, the field alone between the page and the file).
- **Scale.** The adopter counts were 40 px, and the marks were 74 to 104 px tall. The doubled lines had 2 px threads, and the registration crosses and fire outlines were 1 px. The docs page in shot 3 was drawn at 0.45 scale, so its bars were 3.6 px tall. The connector from the page to the code panel was about 80 px long.

## The clock

The film runs **58.0 s**, 3480 frames at 60 fps (v3 ran 48.0 s, 2880 frames). The takes are unchanged. Every line moves later by the pauses added in front of it. Each pause holds a picture that needs it, and no pause adds more than 1.5 s to v3's gap.

| line | words (as recorded) | first sound | v3 first sound | gap before it (v3 gap) | last sound |
| --- | --- | --- | --- | --- | --- |
| 1 | One developer created Fumadocs, a docs framework with over 13,000 stars on GitHub. | 1.00 | 0.50 | (the open) | 6.12 |
| 2 | Vercel Turborepo, shadcn/ui, Better Auth, Unkey and many others use it. | 7.95 | 6.17 | 1.83 (0.55) | 14.46 |
| 3 | Fuma Nama has built it for three years, on top of his schoolwork. | 16.33 | 13.22 | 1.87 (0.54) | 19.93 |
| 4 | He learned to code by modding games and reading piles of JavaScript. | 21.03 | 17.30 | 1.11 (0.48) | 24.78 |
| 5 | He did not look at any documentation while he was learning. | 26.34 | 21.55 | 1.56 (0.50) | 29.07 |
| 6 | He designed Fumadocs in four layers that developers can take apart and reshape. | 31.04 | 24.78 | 1.97 (0.50) | 35.55 |
| 7 | The CLI can copy just the table of contents into your codebase. | 37.16 | 29.80 | 1.61 (0.51) | 41.30 |
| 8 | If he started again from scratch, he thinks Fumadocs would probably have the same shape. | 43.13 | 34.52 | 1.83 (0.58) | 47.70 |
| 9 | Fumadocs is General Translation's first open-source grantee. | 49.42 | 39.62 | 1.72 (0.53) | 52.91 |

- `lib/cues.mjs`: `FIRST_SOUND = [1.00, 7.95, 16.33, 21.03, 26.34, 31.04, 37.16, 43.13, 49.42]`, `CUTS = [37.0, 43.0]` (the two match cuts below), `CARD = 54.0`, `END = 58.0`. The CUE table is regenerated from these and copied into `index.html`. Every event below is keyed to CUE words, so a placement change moves its events with it.
- **The card** starts at 54.0. That is the first 0.5 s beat after line 9's end plus 0.6 s (52.91 + 0.6 = 53.51). Line 9 sits 0.23 s later than its earliest placement so that the beat falls this way, which leaves the grant a full second of stillness before the card (see shot 7).
- **The two hard cuts** sit on beats with a spoken word on each one: 37.0 ("The", 37.05) and 43.0 ("If", 43.05).
- **Key word times at the new placements:**
  - Line 1: One 0.98, developer 1.18, Fumadocs 2.07, docs 3.22, framework 3.51, 13 4.36, stars 5.19 to 5.54, GitHub 5.73.
  - Line 2: Vercel 7.89, shad 9.51, Better 11.32, Unkey 12.45, many 13.50, others 13.73, use 14.03.
  - Line 3: Fuma 16.27, Nama 16.71, three 17.74, on 18.67, schoolwork 19.38.
  - Line 4: modding 22.13, piles 23.51, JavaScript 24.04.
  - Line 5: look 26.79, documentation 27.40, while 28.16, learning 28.64.
  - Line 6: designed 31.14, Fumadocs 31.61, four 32.32, that 32.99, take 33.82, apart 34.07, and 34.70, reshape 34.94.
  - Line 7: The 37.05, CLI 37.27, copy 38.05, just 38.62, of 39.34, into 40.18, your 40.51, codebase 40.68.
  - Line 8: If 43.05, started 43.37, scratch 44.26, shape 47.31.
  - Line 9: Fumadocs 49.36, General 50.17, first 51.31, grantee 52.33.

## The heading system

Four headings in the whole film. Each one is made of words Frederick says in that line, exactly as he says them, and each word appears as he says it. Lines 2, 4, 5, 8 and 9 carry no heading. In line 2 the logos and counts say it. In line 4 the heap is a pile of code characters. In line 5 the docs page leaves and the code arrives. In line 8 the same circle is rebuilt. In line 9 the end card follows within a second of the last word, so no heading can hold its floor there.

**The type.**

- Inter 500 through `var(--font)`, `font-feature-settings: 'ss01' 0, 'cv11' 1`, white `#ffffff`, letter spacing -0.035 em.
- One size: **160 px**, which gives a cap height of 116.4 px.
- One line each. No heading in v4 needs a second line.
- **One placement:** each heading's ink is seated on x 160, its cap top on y 172 and its baseline on y 288.4, 12 px under the top title-safe line (y 160) on which the end card's mark has its top. While a heading is on screen, everything else sits below y 330 or to the right of its ink.
- One key word in the film's accent: "One", in fire `#fe5b16`, from the moment it rises. No other word in the film changes color. ("schoolwork" no longer turns fire.)

**The entrance.**

- Each word rises out of its own line mask on its spoken start: it begins 0.06 s before the take's alignment start for that word and rises over 0.55 s on power3.out. A word that starts less than 0.20 s after the previous word rises with it as one phrase.
- No other motion runs while a heading's words are rising.
- Before the first word, the field clears the heading's zone over 0.4 s. The zone is 44 px of black around the heading's whole ink with a 60 px ramp, as in v3. The zone stays until 0.5 s after the heading has left.

**The floor and the exit.**

- A heading is set when its last word's rise ends. It stays on screen for at least (words / 3) + 1 s after that, and while it is on screen its words never change.
- A heading leaves in one of two ways:
  - by the moving type, where its cells become the next picture (H1 and H2);
  - with its picture at a match cut, where the whole picture changes on a beat and a spoken word (H3 and H4).
- No heading drops out in the old rise-and-drop pattern, and no heading replaces another over the same picture.

| | text | line | words, as spoken (film s) | rises | set | floor ends | on screen | how it leaves | ink, at 160 px |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| H1 | One developer | 1 | One 0.98, developer 1.18 | "One" (fire) 0.92, "developer" 1.12 | 1.67 | 3.33 | 0.92 to 3.33 | moving type into the moon print, 3.33 to 3.93 | x 160 to about 1136, over the field alone |
| H2 | Fuma Nama | 3 | Fuma 16.27, Nama 16.71 | "Fuma" 16.21, "Nama" 16.65 | 17.20 | 18.86 | 16.21 to 20.46 | moving type into the glyph rain, 20.46 to 21.06 | x 160 to about 975, above the shelf's upper row (its marks start at y 372) |
| H3 | Fumadocs | 6 | Fumadocs 31.61 | 31.55 | 32.10 | 33.44 | 31.55 to 37.0 | with the moon at the match cut, 37.0 | x 160 to about 867, beside the 762 px moon (its limb at x 967) |
| H4 | Into your codebase | 7 | into 40.18, your 40.51, codebase 40.68 | "Into" 40.12, "your codebase" 40.45 (codebase is 0.17 s after your) | 41.00 | 43.00 | 40.12 to 43.0 | with the page at the match cut, 43.0 | x 160 to about 1426, above the page (its raised nav's top at y 482) and the code panel (top y 472) |

How the four headings tell the story with the sound off: "One developer" is the stakes, "Fuma Nama" names the developer, "Fumadocs" names the moon, and "Into your codebase" says what the moving part is for. "Fuma Nama" answers the hook, and the end card's title ("Fuma Nama: The philosophy of an open-sourcerer") closes it.

**Type retired by Kevin's note.**

- The eight round 7d post phrases are gone: "Each site looks vastly different", "A huge pile of JavaScript", "The primary source", "Four modular layers", "Building blocks", "Less magic", "Designed to be that way" and "Software for the public good". Frederick never says them.
- "On top of his schoolwork" is gone. Its words are spoken, but they end line 3, and a five-word heading there would need a 2.7 s floor after the line. That would push the gap past 3 s or leave the heading over line 4's words. Its accent turn goes by the one-accent rule. Line 3's heading is now "Fuma Nama", spoken at the start of the line.
- The line-1 wordmark "Fumadocs" moves to line 6. In line 1 it rose on "docs framework", after "Fumadocs" had been said. In line 6 it rises on "Fumadocs" itself, beside the large moon.

## The film, shot by shot

The pictures sit on one stage. The field is behind everything from the first frame to 54.0. Objects arrive by a tone rise in Bayer order, a mask rise, a draw out of a cross, a glow from black, a travel or a match cut, and they leave the same ways. Except at the two match cuts, nothing appears or vanishes between one frame and the next. Each event's word is the word it is in step with.

### Shot 1: the hook, the moon and the shelf (0.0 to 20.46, lines 1 to 3)

The layout is set once and kept for the shot:

- **The moon:** glass, mount B, centre (1480, 522), r 270 (x 1210 to 1750, y 252 to 792). It stands on the lower shelf.
- **The shelves:** two doubled-line rules.
  - Shelf 1 runs at y 532 from a cross at x 144 to a cross at x 1166. It ends 44 px short of the moon's limb, at the moon's centre height.
  - Shelf 2 runs at y 822 from a cross at x 144 to a cross at x 1776, under row 2 and the moon.
- **The adopters:** a 3 by 2 grid. Columns at x 160, 490 and 820. Row 1's marks stand with their feet on y 502 and their counts hang from a cap line at y 562. Row 2's marks stand on y 792 and their counts hang from y 852.
  - Mark heights are v3's optical sizes times 1.25: Turborepo 130 px, shadcn/ui 122, Better Auth 93 (129 wide), Unkey 115, Orama 122, and the GT mark 110 (174 wide, in fire).
  - Counts: a fire star and the figure in Inter 500 tabular, 64 px.
- **Fumadocs' count:** 92 px, left-aligned on the moon's left limb (x 1210), cap top 852, baseline 919.

| time | word | what moves | how |
| --- | --- | --- | --- |
| 0.00 to 0.80 | | The field (mount A's fire smoke through the 8 by 8 Bayer screen on the 3 px grid, in black, ember and fire) raises its tone from 0.35 on the first frame to full. H1's zone is clear from frame 0. | smoothstep in Bayer order |
| 0.92 to 1.67 | One, developer | H1 "One developer": "One" rises in fire at 0.92, "developer" at 1.12. Set 1.67. | 0.55 s power3.out each |
| 1.67 to 3.33 | created Fumadocs, a docs | The hook frame holds: the heading over the field alone (floor). | |
| 3.33 to 3.93 | docs framework | **Moving type.** H1 breaks into its 3 px cells in reading order (3.33 to 3.53). They travel on seeded paths and land as the moon's Bayer print in the disc. The disc's other cells raise their tone 3.58 to 3.93. | power2.inOut, 0.3 to 0.4 s a cell |
| 4.36 to 5.54 | 13, 000, stars | 13.3k rises out of its mask under the moon on "13" and tallies in GitHub's rounding, landing on the end of "stars". Its zone clears from 3.96. | rise 0.4 s expo.out; tally ease none |
| 5.95 to 6.85 | GitHub | Both shelves draw out of their left crosses together. Each end cross appears as its line completes. | power3.out 0.9 |
| 6.85 to 7.85 | (gap) | Hold: the print moon, its count and the empty shelves. | |
| 7.85 to 8.35 | Vercel | Turborepo raises its tone in Bayer order (row 1, column 1). Its count 31.2k rises out of its mask in the same 0.5 s. | smoothstep 0.5 |
| 9.47 to 9.97 | shad | shadcn/ui and 125k (row 1, column 2). | the same |
| 11.29 to 11.79 | Better | Better Auth and 30.2k (row 1, column 3). | the same |
| 12.41 to 12.91 | Unkey | Unkey and 5.5k (row 2, column 1). | the same |
| 13.46 to 13.96 | many others | Orama with 10.6k and the GT mark in fire with 1.1k light together (row 2, columns 2 and 3), as one event. | the same |
| 14.16 to 14.76 | use it | A 200 px fire pulse runs shelf 2 between gauge and core, from under the GT mark (x 907) to under the moon's centre (x 1480). Its tail closes by 14.96. | ease none |
| 14.76 to 15.21 | (after "it") | The pulse reaches the moon, and the moon's print tone-mixes into glass inside its disc (outer glow 0, clipped 1 px outside the limb). The moon is lit from here. | smoothstep 0.45 |
| 15.21 to 16.21 | (gap) | Hold: the full shelf, still apart from the smoke. | |
| 16.21 to 17.20 | Fuma, Nama | H2 "Fuma Nama" rises word by word over the shelf. Set 17.20. | 0.55 s power3.out each |
| 17.20 to 18.86 | has built it for three years, on top | Hold (H2's floor). | |
| 18.86 to 19.46 | of his schoolwork | **The shelf recedes.** The marks and both shelves lower their tone to 0 in Bayer order. The counts drop into their masks (0.4 s). The moon's glow lowers to black inside its clip. "Fuma Nama" stays, over the field alone, which repeats the hook frame. | smoothstep 0.6 |
| 19.46 to 20.46 | (end of line 3, gap) | Hold: "Fuma Nama" over the field. | |

### Shot 2: the heap (20.46 to 25.34, line 4)

The heap is v3's glyph halftone at a larger grid. Its characters are the braces, brackets, semicolons, equals signs, slashes and the letters of const, let, function, return, import and export. They sit on a **24 px grid** (v3: 18), with glyphs up to 26 px, tilted up to 15 degrees, and they are lit white, sun, fire and ember by mount A sampled once.

The mound keeps v3's shape, lowered by about 60 px: its crest is near (1344, 580) and its left flank reaches the bottom edge near x 560, so no glyph stands above y 530 left of x 1180. Its keep-out box is now the docs page's place with a 60 px margin, x 100 to 1180 and y 116 to 524, so no glyph lands or falls there and the mound has no notch.

| time | word | what moves | how |
| --- | --- | --- | --- |
| 20.46 to 21.06 | (gap), He | **Moving type.** "Fuma Nama" breaks into its cells in reading order (20.46 to 20.66). They fall on seeded paths that curve right into the mound's left flank and base, and each cluster resolves into one of the first glyphs to land. The heading is no longer readable by 20.70, before "He" (20.91). | power2.in, 0.5 to 0.8 s a cluster |
| 20.46 to 24.34 | learned to code by modding games and reading piles of JavaScript | The glyph rain condenses base first, as in v3. Each glyph falls 300 px into its cell over 0.34 s. The last glyphs settle on the crest on "JavaScript" (24.04). | ease none |
| 24.34 to 25.34 | (gap) | Hold. The heap's light drifts by under 3 percent of each glyph's size, and the drift continues until the sort. | |

### Shot 3: the docs page and the file (25.34 to 30.50, line 5)

- **The docs page** is v2's vector object at **0.6 scale**, top-left at (160, 176), spanning x 160 to 1120 and y 176 to 464. It sits in the heading place above the heap, and no heading is used in this shot.
  - Its full-size drawing gets thicker bars: nav bars 10 px tall, sidebar and table-of-contents bars 12 px, the title bar 28 px, paragraph bars 12 px, the table-of-contents line 4 px with a 12 px dot.
  - Panel edges and hairline seams are 2 px at `rgba(242,242,240,0.18)`.
  - At 0.6 scale no bar is under 6 px and no line under 2 px.
- **The file** keeps v3's layout: x 975 to 1736, top y 141, 30 px line pitch, its indentation and its blank lines. Each token bar becomes a run of the heap's own glyphs, 22 px on the bar's 21 px unit, at the bar's place and length. The file reads as code, and no line is a real program.

| time | word | what moves | how |
| --- | --- | --- | --- |
| 25.34 to 26.14 | (gap) | The docs page builds above the heap. Its raised-ink panels rise from tone 0 (0.5 s). Then the nav, the sidebar, the content and the table of contents fill 60 ms apart, left to right. | expo.out 0.5, then the fills |
| 26.14 to 26.74 | He did not | Hold: the page and the heap. | |
| 26.74 to 27.09 | look | The table of contents' sun highlight steps down one section. | power2.inOut 0.35 |
| 27.40 to 28.00 | documentation | The page leaves by a tone mix on the 3 px grid. Its cells switch off in Bayer order. | smoothstep 0.6 |
| 28.40 to 29.50 | while he was learning | **The heap sorts into the file.** As many glyphs as the file's slots travel to their places, in the file's reading order (top line first, 0.55 s each, starts spread over 0.55 s). The rest of the heap lowers its tone to 0 in Bayer order of the 24 px grid over the same 1.1 s. The arriving glyphs take the file's light: mount A at half rate, re-anchored so its lit band lies across the middle block. | power2.inOut |
| 29.50 to 30.50 | (gap) | Hold: the file, its lit band across the middle block. | |

### Shot 4: the moon breaks (30.50 to 37.0, line 6)

The 762 px Fumadocs moon (mount B, centre (1348, 540), r 381) and its geometry stay as in v3:

- the seams at y 348, 540 and 729, from x 944 to 1752, with crosses at x 928 and 1768;
- layer 3 slides 810 px left;
- the block is x 180 to 732 by y 513 to 783.

The moon takes the file's place. Both span the right half of the frame, x 967 to 1736.

| time | word | what moves | how |
| --- | --- | --- | --- |
| 30.50 to 31.50 | (gap), He designed | **The file becomes the moon.** The file's glyphs lower their tone in Bayer order (30.50 to 31.10). The 762 px glass moon raises its glow from black in the same place (30.70 to 31.50), with the white pool at the top and the bright filament on the lower limb, and is fully lit before "Fumadocs". Mount A hands over from the file's light to the field. | smoothstep 0.6; innerGlow 0 to 1, power3.out 0.8 |
| 31.55 to 32.10 | Fumadocs | H3 "Fumadocs" rises beside the moon. The name and the logo stand as the lockup. | 0.55 s power3.out |
| 32.32 to 32.82 | four layers | The glass tone-mixes into its Bayer print inside the disc. The smoke eases from rate 0.2 to 0.015. | smoothstep 0.5 |
| 32.99 to 33.74 | that developers | Three registration crosses draw at the limb, and a seam draws out of each. The crosses start 0.15 s apart, each arm out of its centre in 0.12 s, and each seam follows in 0.45 s. The disc is cut into four layers. | expo.out |
| 33.84 to 34.54 | take apart | The layers part along the seams and spread, from 0 to 15 and 42 px in one move. The field is black in the gaps. v3's two steps (11 and 33 px, then 15 and 42 px) are one move here. | power3.out 0.7, snapped to the 3 px cell |
| 34.70 to 35.30 | and | Layer 3 slides left out of its slot. Behind it, the slot's **3 px fire outline** draws once, and the straight doubled-line connector draws from the slot's cross and follows the layer to its stop. The field clears the layer's path from 34.25. | power2.inOut 0.6; outline expo.out 0.5 from 34.80 |
| 35.30 to 35.85 | reshape | The band's curved ends square off into the 552 by 270 block. Its print is re-sampled on the same grid. | power2.inOut 0.55 |
| 35.85 to 37.0 | (gap) | Hold: the parted moon, the outline, the connector, the block and "Fumadocs". | |

### Shot 5: the page breaks (37.0 to 43.0, line 7)

- **The cut at 37.0** is a match cut on the middle seam. The docs page appears at full size, x 160 to 1760 and y 472 to 952, placed so that its nav seam lies on y 540, the line the moon's middle seam occupied a frame earlier. The seam runs from a cross at x 136 to x 1784, and the table of contents' highlight is lit.
- **The code panel** is a raised-ink panel at x 1340 to 1760, y 472 to 952, with 18 rows of 12 px token bars at a 24 px pitch in white and ember, with real indentation. It is drawn from the cut but lies under the page, which covers it until the shrink.

| time | word | what moves | how |
| --- | --- | --- | --- |
| 37.00 | The | **Match cut** on the beat. The y 540 seam holds across it. H3 leaves with the moon. | |
| 37.30 to 37.95 | CLI | The sidebar seam (x 480) and the table-of-contents seam (x 1400) draw down out of their crosses on the nav seam, 0.2 s apart, to crosses at y 976. The nav seam was carried over by the cut, so the CLI's three seams are complete. | expo.out 0.45 each |
| 38.05 to 38.55 | copy | The four parts move apart along the seams: the nav up 24 px, the sidebar left 36 px, the table of contents right 36 px. The field is black in the gaps. | power3.out 0.5, snapped to the cell |
| 38.62 to 39.22 | just | The parted page eases to 0.625 about the point (160, 540). The nav seam stays on y 540. The page's right edge passes over the code panel, uncovers it, and draws the panel's 2 px edge out of its top-left cross as it goes. | power2.inOut 0.6 |
| 39.34 to 39.94 | of contents | The table-of-contents part lifts 24 px and leaves a 3 px fire outline in its slot. A doubled-line connector draws from a cross on its right edge to a cross at x 1324, the panel's left edge, about 150 px. | expo.out 0.4, then the connector 0.35 |
| 40.12 to 41.00 | into, your codebase | H4 "Into your codebase" rises. "Into" rises at 40.12. "your codebase" rises at 40.45 as one phrase, because "codebase" is 0.17 s after "your". Set 41.00. | 0.55 s power3.out |
| 41.05 to 41.75 | (after codebase) | The part travels along the connector into the panel. The panel's rows part at its middle to open a gap the part's height (41.35 to 41.75), and the part seats in it. | power2.inOut 0.7 |
| 41.45 to 41.95 | | As it seats, a sun block runs down the part's curved line once. This is the post's active-section highlight, now inside the code. | ease none 0.5 |
| 41.95 to 43.0 | (gap) | Hold: the page at 0.625, the empty slot's fire outline, the code panel with its seated part, and H4 (its floor ends 43.00). | |

### Shot 6: the same shape (43.0 to 48.51, line 8)

| time | word | what moves | how |
| --- | --- | --- | --- |
| 43.00 | If | **Match cut** on the beat, back to the parted moon as shot 4 left it: the print, the seams and crosses, the block at the left, the slot's fire outline and the connector. The page's nav seam on y 540 becomes the moon's middle seam on y 540. H4 leaves with the page. "Fumadocs" is not shown again, because it belonged to line 6. | |
| 43.38 to 44.27 | started again | The outline, the connector, the seams and the crosses tone out (0.3 s). The pieces return to the circle, and the block takes back its band shape as it slides in. The field returns into the piece's path. | power2.inOut 0.9 |
| 44.38 to 44.88 | scratch | The print leaves as its tone lowers to 0. | smoothstep 0.5 |
| 45.17 to 47.31 | he thinks Fumadocs would probably have the same shape | The glyph moon fills the same circle row by row from the top, in reading order. It uses 16 writing systems with a few code characters among them, one `lang`-set text node per glyph, on a **36 px grid** with glyphs up to 30 px (v3: 30 px grid), inked from the moon's smoke. Its last row lands on "shape" (47.31). | ease none |
| 47.31 to 48.51 | (end of line 8, gap) | Hold. The ink (never the size) follows the moon's smoke, so a lit band drifts through the glyphs. | |

### Shot 7: the grant (48.51 to 54.0, line 9)

- **The GT mark:** the doubled-line mark as glass in fire smoke on mount C, in the end card's own mark box (x 1428 to 1760, y 160 to 369, `kit/endcard` LAYOUT).
- **The moon:** glass. It ends at centre (1080, 700), r 210 (x 870 to 1290, y 490 to 910).
- **The connector:** from a cross at (1594, 393) under the mark, down to y 700, and left to a cross at x 1306 on the moon's limb. It is one path with a square corner.
- **Mounts:** mount B carries the moon through its move. At the end of the move it hands over to mount D, a 490 px square centred on (1080, 700), with identical uniforms on the handover frame. From 50.21 only mounts A and C are full frame.

| time | word | what moves | how |
| --- | --- | --- | --- |
| 48.51 to 49.01 | (gap) | **The glyph moon becomes glass in place.** The glyphs' ink switches to black in Bayer order of their 36 px grid. The 762 px glass moon raises its glow from black in the same disc. | smoothstep 0.5; innerGlow 0 to 1 |
| 49.36 to 50.16 | Fumadocs is | The moon moves and shrinks from (1348, 540), r 381, to (1080, 700), r 210, with its clip and its field zone. | power2.inOut 0.8 |
| 50.21 to 51.01 | General | The GT mark forms in the smoke from innerGlow 0. Its zone clears from 49.81. | power3.out 0.8 |
| 51.31 to 51.81 | first | The connector draws from the cross under the mark to the cross at the moon's limb. | expo.out 0.5 |
| 51.88 to 52.33 | open-source, grantee | A 200 px fire pulse runs the connector between gauge and core. Its head reaches the moon on "grantee" (52.33). | ease none 0.45 |
| 52.33 to 52.58 | grantee | The moon's smoke thickens inside its disc (innerGlow 1 to 1.4) and settles by 53.0. | power3.out 0.25 |
| 52.58 to 53.60 | (end of line 9) | Hold: the grant, still apart from the smoke. | |
| 53.60 to 54.00 | | **Everything but the GT mark recedes.** The field lowers its tone to 0 in Bayer order. The moon's glow lowers to black inside its clip. The connector tones out on the 3 px grid. Over the same 0.4 s, the GT mark's density eases to the card's opening state (the bloom's 0.4), and its smoke clock reaches the card's 3.5. | smoothstep 0.4; power2.inOut |

### The end card (54.0 to 58.0)

```
addEndCard(tl, { palette: 'fire', title: ['Fuma Nama: The philosophy', 'of an open-sourcerer'], url: 'generaltranslation.com/blog/fuma-nama', start: 54.0 })
```

The card is used as it is, with the frame off. Its first frame is the GT mark alone on black at density 0.4, the same frame shot 7 ends on, so the change to the card is not visible as a cut. The title and the link then rise in the card's own timing. The card is silent, and the bed resolves under it. The last frame is the poster.

## The transition map

Every change of picture, and what carries the eye across it. Only two changes are hard cuts. Both are match cuts on the same y 540 seam, on a beat and on a spoken word.

| at | from | to | bridge |
| --- | --- | --- | --- |
| 0.00 | the start | the field | The field is on screen from the first frame at tone 0.35 and rises to full by 0.8, so the first frame is never empty. |
| 0.92 | the field | "One developer" | The field stays. The heading's zone clears and the words rise over it. |
| 3.33 | "One developer" | the print moon | Moving type: the heading's own cells travel to the right and become the moon's Bayer print. The object transforms into the next object. |
| 4.36 | the moon | the moon with 13.3k | The moon stays. Its count rises under it, at the place the shelf will use. |
| 5.95 | the moon and count | the empty shelves | The moon stays and the shelves draw out of their left crosses toward it. Shelf 1 ends at the moon's centre height. Shelf 2 passes under the moon. |
| 7.85 to 13.96 | the empty shelves | the full shelf | The grid is fixed from the first frame of the shelves. Each mark lands in a slot the eye has already seen, one name at a time. |
| 14.16 | the full shelf | the lit moon | The pulse runs from the GT mark along shelf 2 into the moon, and the moon turns from print to glass where the pulse arrives. |
| 16.21 | the shelf | the shelf with "Fuma Nama" | The picture holds. The heading rises in the heading place above the grid. |
| 18.86 | the shelf with "Fuma Nama" | "Fuma Nama" over the field | Everything but the heading lowers its tone to 0. The frame repeats the hook frame (a heading over the field alone). |
| 20.46 | "Fuma Nama" | the heap | Moving type again: the name's cells fall into the mound's left flank and become the first glyphs of the rain. The rest of the rain follows from above. The field and its smoke continue: the heap is lit by the same mount A smoke. |
| 25.34 | the heap | the heap and the docs page | The heap stays and holds. The page builds in the empty space above it, so the next picture's first piece arrives while the current one is still on screen. |
| 27.40 | the heap and the page | the heap | The page leaves by a tone mix on the 3 px grid, in place. The heap is unchanged. |
| 28.40 | the heap | the file | The heap's glyphs travel up into the file's lines. The pile of code characters becomes the file. |
| 30.50 | the file | the 762 px glass moon | Match on position: the file and the moon occupy the same right half. The file's glyphs lower their tone while the moon's glow rises in the same place. |
| 31.55 | the moon | the moon with "Fumadocs" | The picture holds. The name rises beside the logo. |
| 32.32 to 35.85 | the whole moon | the parted moon and the block | One object transforms in steps. Glass becomes print, the print is cut, the layers part, and one layer slides out and squares off. The connector and the slot outline that it leaves behind stay on screen. |
| 37.00 | the parted moon | the docs page at full size | **Hard match cut** on "The" (beat 37.0). The middle seam at y 540 is on screen on both sides of the cut and becomes the page's nav seam. A cut is used here because the moon broken into layers and a docs page broken into parts are the film's two parallel demonstrations. Placing them side by side on one shared line shows they are the same idea, and it costs no pause. |
| 37.30 to 41.95 | the whole page | the page at 0.625 and the code panel with its part | One object transforms in steps. The seams cut it, the parts move apart, and the page shrinks and uncovers the panel that was already under it. The table of contents lifts and travels along its connector into the panel. |
| 40.12 | the page | the page with "Into your codebase" | The picture holds while the heading rises above it. |
| 43.00 | the page and the panel | the parted moon | **Hard match cut** on "If" (beat 43.0). The page's nav seam on y 540 becomes the moon's middle seam on y 540, and the film returns to the object it broke at 37.0, exactly as it was. |
| 43.38 to 47.31 | the parted moon | the glyph moon | One object rebuilds in place. The pieces return to the circle, the print leaves, and glyphs fill the same circle. The circle never moves. |
| 48.51 | the glyph moon | the glass moon | Match on shape: the glyphs' ink lowers and the glass moon's glow rises in the same disc. |
| 49.36 | the glass moon | the grant | The moon moves and shrinks to its grant place, so it stays in view. The GT mark then forms in empty smoke, and the connector draws from the mark to the moon. |
| 53.60 to 54.00 | the grant | the end card | The GT mark holds in the card's own box at the card's opening density. Everything else recedes by tone and glow, so the card's first frame equals shot 7's last frame. The card's title rises where nothing else is. |

## Scale fixes

Measured against 1920 x 1080. Nothing that carries meaning is under about 24 px of type or 2 px of line.

| element | v3 | v4 |
| --- | --- | --- |
| Headings | 120, 130, 140 or 150 px, one or two lines | 160 px, one line, one placement |
| Adopter marks | 74 to 104 px tall, at a 180 px column pitch | 93 to 130 px tall (v3's optical sizes times 1.25), at a 330 px column pitch in a 3 by 2 grid |
| Adopter counts | 40 px | 64 px |
| Fumadocs' count | 80 px | 92 px |
| Shelf moon | r 230 | r 270 |
| Doubled lines (shelves, seams, connectors) | 7 px gauge, 3 px core (2 px threads) | 9 px gauge, 3 px core (3 px threads) |
| Registration crosses | 1 px arms, 15 px across | 3 px arms, 25 px across |
| Fire outlines (layer 3's slot, the table-of-contents slot) | 1 px | 3 px |
| Pulses | 160 px long | 200 px long |
| Docs page in shot 3 | 0.45 scale, bars 3.6 px | 0.6 scale, thicker full-size bars, no bar under 6 px, edges 2 px |
| Docs page in shot 5 | bars 8 px at full size, 5 px at 0.625 | 12 px at full size, 7.5 px at 0.625; panel edges and seams 2 px |
| Connector from the page part to the code panel | about 80 px | about 150 px (the panel moves to x 1340) |
| Code panel | 480 x 540, the rows drawn as it appears | 420 x 480, 18 rows of 12 px bars at 24 px pitch, present under the page and uncovered |
| Heap glyphs | 18 px grid | 24 px grid, glyphs up to 26 px |
| File | 25 lines of token bars | 25 lines of the heap's own glyphs at 22 px |
| Glyph moon | 30 px grid | 36 px grid, glyphs up to 30 px |
| Grant moon | r 180 | r 210 |
| Time on screen | slot outline 1.7 s, then 0.3 s in shot 6; the table-of-contents outline 2.9 s; the seated part 1.2 s | slot outline 2.2 s, then 0.4 s in shot 6; the table-of-contents outline 3.7 s; the seated part 1.25 s (41.75 to 43.0) |

## The set pieces

Every piece in SCRIPT-v3's spectacle map, and where it plays in v4. Nothing is dropped. The headings Kevin's note retires are listed after the table.

| piece | v4: where it plays and for how long | how it now appears |
| --- | --- | --- |
| The dithered fire gem-smoke field (mount A, 8 by 8 Bayer, one 3 px grid, one slow clock, black cells transparent) | 0.0 to 54.0 | Unchanged material on one clock (shader seconds 0.4 + 0.075 t). It opens from tone 0.35 and leaves by lowering its tone to 0 in the last 0.4 s before the card. |
| The field's zones, from each object's own ink | throughout | The same distances as v3: 44 px for type, 18 px for objects, 10 px for the moons. Each zone clears 0.4 s before its object's first motion and returns 0.5 s after it leaves. v3's `pile-core` disc stays if the smoke prints a ring beside the heap's crest again. |
| The opening tone rise in Bayer order | 0.0 to 0.8 | From 0.35 to full. |
| Heading mask rise (Inter 500, x 160, cap top 172) | four headings: 0.92, 16.21, 31.55, 40.12 | Word by word in step with the voice, at one size, 160 px. |
| The hook frame: a heading over the field alone, its key word in fire | 0.92 to 3.33 (2.4 s), repeated 19.46 to 20.46 by "Fuma Nama" | "One" is in fire from its rise. The repeat uses no accent. |
| Moving type (transition d) | 3.33 to 3.93 (into the moon); 20.46 to 21.06 (into the rain) | Twice now. The developer's words become the moon, and his name becomes the code he learned from. |
| The print tone-mixing into the glass moon | 14.76 to 15.21 | Re-staged: the pulse from the GT mark lights the moon. |
| The Fumadocs lockup (the moon and the wordmark) | 31.55 to 37.0 (5.5 s) | Re-staged to line 6: "Fumadocs" at 160 px beside the 762 px moon, rising on the spoken word. |
| The lockup's moon moving to a new place | 49.36 to 50.16 | Re-staged: the moon moves and shrinks from its 762 px place into the grant. |
| The shelf moon (lit through the shot, crisp clipped limb) | 3.93 to 19.46 (15.5 s) | r 270, standing on shelf 2. It is a Bayer print until the pulse lights it, glass from 15.21, and its glow lowers to black at 18.86. |
| Fumadocs' 13.3k tallying in GitHub's rounding | 4.36 to 5.54, held to 18.86 (14.5 s) | 92 px, under shelf 2, left-aligned on the moon's limb, landing on "stars". |
| The doubled-line rule out of its left cross, with its narrow zone | 5.95 to 6.85, held to 18.86 | Two shelves (y 532 and y 822), drawn together on "GitHub", at the thicker gauge. |
| The six adopter marks with stars and counts, each lighting on its name, the GT mark in fire | 7.85 to 13.96, held to 18.86 (each on screen 4.9 to 11.0 s) | A 3 by 2 grid at 1.25 times v3's size with 64 px counts. Each count rises with its mark. Orama and GT light together on "many others". |
| The fire pulse along the shelf from the GT mark to the moon | 14.16 to 14.96 | 200 px long, along shelf 2, and it now lights the moon. |
| The glyph heap (code characters lit by mount A, tilted up to 15 degrees) | 20.46 to 29.50 (9.0 s) | 24 px grid. It forms from the rain, holds, and then sorts into the file. |
| The glyph rain condensing base first, the crest on a key word | 20.46 to 24.34 (3.9 s) | Its first glyphs come from the name's cells. The crest is on "JavaScript". |
| The heap's light drift under 3 percent | 24.34 to 28.40 (4.1 s) | Unchanged. |
| The docs page as a vector object, building (panels rise, then fills) | 25.34 to 26.14; on screen to 28.00 (2.7 s) | At 0.6 scale, above the held heap. |
| The live table-of-contents highlight stepping one section | 26.74 to 27.09 | On "look", as in v3, at a size that reads. |
| The docs page leaving by tone mix | 27.40 to 28.00 | On "documentation". The heap stays under it. |
| The file of 25 lines lighting top to bottom in black, ember, fire and sun | 28.40 to 31.10 (2.7 s) | Built from the heap's own glyphs, top line first. It leaves by tone as the moon lights. |
| The file's lit band with the smoke at half rate across the middle block | 29.50 to 30.50 (1.0 s hold) | After "learning". The band is in place for the whole hold. |
| The 762 px glass moon raising its glow from black (white pool at the top, filament on the lower limb) | 30.70 to 31.50; again 48.51 to 49.01 | It rises out of the file's place, and again out of the glyph moon. |
| Registration crosses at the limb | 32.99 to 37.0, and 43.0 to 43.38 | 3 px arms. Each seam draws out of its cross. |
| The glass-to-print tone mix, the smoke easing from rate 0.2 to 0.015 | 32.32 to 32.82 | On "four layers". |
| Three doubled-line seams cutting the moon into four layers | 32.99 to 33.74, held to 37.0 and 43.0 to 43.38 | On "that developers", 0.15 s apart. |
| The layers parting (11 and 33 px) and spreading (15 and 42 px) | 33.84 to 34.54 | One move to 15 and 42 px on "take apart". |
| The slot's fire hairline outline, drawn once | 34.80 to 35.30, held to 37.0; again 43.0 to 43.38 | 3 px, drawn behind the sliding layer. |
| The third layer sliding out of its slot | 34.70 to 35.30 | On "and", with the connector following it. |
| The band squaring off into the 552 by 270 block | 35.30 to 35.85, held to 37.0 and 43.0 to 43.38 | On "reshape". |
| The straight doubled-line connector from the slot to the block | 34.70 to 35.30, held to 37.0 and 43.0 to 43.38 | It draws behind the layer as it slides (v3 drew it after the square-off). |
| The docs page at full size cut by three seams drawn out of crosses | 37.0 to 37.95 | The nav seam crosses the match cut from the moon. The CLI draws the sidebar and table-of-contents seams. |
| The page's four parts moving apart | 38.05 to 38.55 | On "copy". |
| The parted page easing to 0.625 | 38.62 to 39.22 | About (160, 540), so the nav seam stays on y 540 for the cut back. |
| The code panel drawing out of its top-left cross, with 18 rows | 38.62 to 43.0 (4.4 s) | Uncovered by the shrink. Its edge draws out of its cross as the page's edge passes, and its rows are already in place. |
| The table-of-contents part lifting out, leaving a fire outline | 39.34 to 39.94, the outline held to 43.0 | 3 px outline. |
| The connector, the travel, the rows opening and the seat | connector 39.34 to 39.94; travel 41.05 to 41.75 | The connector is about 150 px. The travel starts after "Into your codebase" is set. |
| The sun block running down the part's curved line inside the code | 41.45 to 41.95 | During the seat. |
| The pieces returning to the circle | 43.38 to 44.27 | On "started again", after the match cut back. |
| The print leaving as its tone lowers to 0 | 44.38 to 44.88 | On "scratch". |
| The glyph moon in 16 writing systems, filling row by row, then drifting with the smoke | 45.17 to 49.01 (fill 2.1 s, drift 1.2 s, leave 0.5 s) | 36 px grid. Its last row is on "shape". It leaves by turning into the glass moon. |
| The GT mark as glass in fire smoke on mount C, forming from black | 50.21 to 58.0 (through the card) | In the end card's own box, on "General". |
| The grant connector from the GT mark to the moon (square corner) | 51.31 to 54.0 | On "first". |
| The fire pulse into the moon, the moon thickening and settling | 51.88 to 53.0 | It reaches the moon on "grantee", then a 1.0 s hold. |
| The grant re-laid (the mark in the card's box, the mark's density easing into the card's bloom) | 49.36 to 54.0 | The moon is now at (1080, 700), r 210. The handover to the card is seamless. |
| Spoken-word headings (v2's device) | the whole film | Now the only kind of heading. |
| The shared series end card | 54.0 to 58.0 | Unchanged, silent, frame off. |
| Hard cuts on the beat, tone mixes on one grid, moving type | throughout | Two match cuts on the y 540 seam, tone mixes, two moving-type transitions, and object transforms (sort, move, glow). |

Removed by Kevin's note on the v3 cut, which overrides the spectacle map for type:

- the eight round 7d headings ("Each site looks / vastly different", "A huge pile / of JavaScript", "The primary / source", "Four modular / layers", "Building / blocks", "Less magic", "Designed / to be that way" and "Software for / the public good");
- "On top of / his schoolwork" with its fire turn;
- the line-1 wordmark, which moves to line 6.

No picture piece is removed.

## Pacing rules the build verifies

- **One main motion at a time.** No two motions overlap, except these named pairs, each of which reads as one change:
  - the dissolve into the rain (20.46);
  - the file lowering as the moon glows (30.50 to 31.50);
  - the sun run over the last 0.3 s of the seat (41.45);
  - the glyphs' ink and the moon's glow (48.51);
  - the recede and the mark's density ease (53.60).
- **At most about two events a second.** Event starts are at least 0.5 s apart. The only exceptions are the word staggers inside a heading and the 0.15 to 0.2 s staggers inside one draw (three seams, two seams, two shelves).
- **Holds.** Each set piece holds still, apart from the smoke and the heap's drift, for at least 1.0 s before the next one starts. The holds:

  | hold | from | to |
  | --- | --- | --- |
  | shelves | 6.85 | 7.85 |
  | lit shelf | 15.21 | 16.21 |
  | name alone | 19.46 | 20.46 |
  | heap | 24.34 | 25.34 |
  | file | 29.50 | 30.50 |
  | block | 35.85 | 37.0 (1.15 s) |
  | seated part | 41.95 | 43.0 (1.05 s) |
  | glyph moon | 47.31 | 48.51 (1.2 s) |
  | grant | 52.58 | 53.60 (1.02 s) |

- **Floors.** Each heading's floor ends before it leaves: 3.33, 18.86, 33.44 and 43.00.
- **Checks on the render.**
  - The 2 fps contact sheet should show each heading only while its words are heard.
  - The frame-difference scan should show no run of more than about two distinct events in any 1.0 s window.
  - Every hold above should read as still apart from the smoke.

## Sound

- **Narrator:** the nine Frederick Surrey takes unchanged (`audio/vo-N.mp3`, masters by `lib/make-voice.mjs`), placed at the new first sounds. No new takes. Vercel is held as recorded for Kevin to hear.
- **Bed:** round 5's bed re-cut to 58.0 s by `lib/make-bed.mjs` (A, B, A, B and so on, then the source's own settle).
  - Every join sits under a spoken word, never in one of the longer gaps. Run `--search` for every pin that moves.
  - The speech windows: 1.00 to 6.12, 7.95 to 14.46, 16.33 to 19.93, 21.03 to 24.78, 26.34 to 29.07, 31.04 to 35.55, 37.16 to 41.30, 43.13 to 47.70 and 49.42 to 52.91.
  - The settle begins 1.5 to 2.0 s into the card (55.5 to 56.0).
- **Mix:** `lib/make-mix.mjs`, the carve at strength 0.3, `--flatten-carve-level`. The duck stays at 5.8 dB.
  - In the 1.1 s gap after line 3 it holds flat.
  - In each gap of 1.5 s or longer the bed rises about 3 dB on a half-sine, from 0.15 s after the last word back to full depth 0.05 s before the next first sound, so the music fills the pause without pumping. This uses `RISE_DB` and `BRIDGE`, with gaps from 1.5 to 1.97 s.
  - After line 9 the duck lets go over 0.8 s to -1.5 dB for the card, and the bed fades over the card's last 0.8 s.
- **Targets:** -16 LUFS integrated within 0.5 LU, true peak at or below -1.0 dBTP with peak control in the masters, the bed about 10 to 11 dB under the narrator in speech, and the swing in any gap under 4 LU. The audio stream is 58.0 s, AAC in the MP4.

## Build notes

- **Archive first:** copy the v3 composition (`index.html`, `lib/`, `STORYBOARD.md`) into `archive-v3/` in this folder. Copy `../../out/blog-fuma-nama.mp4` and `.png` to `../../out/v10/` before replacing them.
- **Change:**
  - `lib/cues.mjs` (FIRST_SOUND, CUTS, CARD, END), then the CUE table in `index.html`.
  - The shot code to this design.
  - The root `data-duration` to 58, and the `addEndCard` start to 54.0.
  - `lib/make-bed.mjs` pins, then the mix.
- **Rewrite `STORYBOARD.md`** from the measured result, and add a dated "2026-10-06, v4 flow and headings" entry to `NOTES.md`.
- **Check and render:**
  - `npx -y hyperframes@0.8.106 check .` with 0 errors.
  - Render with `--quality delivery --fps 60 --workers 3`, and confirm no Google Fonts line in the log.
  - The output is faststart. The poster is the settled card at 57.98.
  - Make the contact sheet with `kit/contact-sheet.sh ../../out/blog-fuma-nama.mp4 ../../out/sheets/blog-fuma-nama`.
- **Heavy load drops raster.** Compare the final frame by frame against a second render, or check every second of it visually.

## Fix round (after the v4 critic, 2026-10-06)

The critic failed the first v4 render on three majors and listed eight minors. This round changes the design where they apply. Everything above still holds except where this section says otherwise; `STORYBOARD.md` records the result and `NOTES.md` the measurements.

- **The clock.** Lines 7 to 9 move later: line 7 by 0.5 s (first sound 37.66), lines 8 and 9 by 1.5 s (44.63 and 50.92). The cuts move to 37.5 ("The" 37.55) and 44.5 ("If" 44.55), still on 0.5 s beats. The card starts at 55.5 (line 9 ends 54.42, plus 0.6 is 55.02) and the film runs 59.5 s. The gap after line 6 is 2.04 s and the gap after line 7 is 2.77 s.
- **Line 6 in three moves.** The glass-to-print mix on "four layers" (32.32, 0.5 s). The crosses and seams on "that developers" (0.2 s apart, 0.5 s each, power3.out) run on into the parting on "take apart" (33.82, power2.inOut 0.8 s): one move. The slide on "and" (34.70, 0.6 s) runs on into the square-off (35.15, 0.6 s): one move, done 35.75. The hold before the cut is 1.75 s.
- **"Fumadocs" leaves.** It drops into its mask as the parting starts (33.82, 0.45 s, power2.in), after its floor (33.44), instead of staying until the cut.
- **Line 7 in four moves, the travel in the gap.** The seams on "CLI" (37.80 and 38.05, 0.5 s each). The parting on "copy" (38.55, 0.5 s) runs on into the shrink (38.95, 0.7 s). The lift and its connector on "of contents" (39.84 and 40.09). "Into your codebase" rises at 40.63 and 40.95 and is set at 41.50. The part travels at 42.30 (0.8 s), drops into the panel's opening from 42.75 (0.5 s), the rows part from 42.60 (0.5 s) and the sun runs from 43.00 (0.5 s). The hold before the cut is 1.0 s.
- **The match cut back.** The nav seam keeps its length through the shrink: its right cross eases from the page's edge to x 1768, the right cross of the moon's middle seam, so the whole of that seam is on screen before the cut. The code panel now spans y 568 to 952 (14 rows) so the seam runs above it, and the part drops below the seam into the panel. After the cut the print comes back at 0.7 of its tone and eases to full over 0.4 s.
- **The file becomes the moon.** The file's tone falls from its first frame (1 - (1 - u)^2 over 30.50 to 31.00). The moon's glow rises on sine.inOut over 30.70 to 31.50, half at 31.10.
- **The glyph moon never leaves an empty disc.** On "scratch" (45.88) the print lowers its tone to 0.3, not 0. From 46.38 each 36 px block of the print leaves on the frame its glyph lands on it, so the circle is whole through the fill, which still ends on "shape" (48.81).
- **The glyph moon to glass** runs 0.8 s on sine.inOut (50.05 to 50.85), the glyphs switching off in Bayer order at the rate the glass glows up, done as the move starts on "Fumadocs".
- **The rain** starts with the name's dissolve (20.46), and its lower rows land fastest (land time from height to the power 1.8), so the mound's outline reads by about 21.5.
- **The pulses** fill the doubled line's whole 9 px gauge in fire, inside an 8 px fire glow.
- **The field's zones** clear and return over 0.6 to 1.0 s, inside a motion that is already running: "Fuma Nama" clears during the pulse, "Fumadocs" during the file's tone-down, "Into your codebase" during the shrink, the shelf's zones return through the recede (now from 18.66, "on top"), the heap's zone clears with the name's dissolve, the docs page's place clears while the crest settles, and after the cut back the field stays off the left half until the pieces start returning (44.88). Zones that change on a cut switch on the cut.
- **Sound.** Joins 5 to 7 are re-searched under the moved lines (39.83 "of contents", 46.95 "thinks Fumadocs", 51.33 "Fumadocs is General"); the settle lands at 57.28, 1.78 s into the card. The duck's bridge and the carve's hold widen to 3.0 s for the longer gaps. The 3 dB rise in gaps stays (see NOTES.md).
