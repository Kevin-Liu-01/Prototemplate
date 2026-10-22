# Designing docs for humans: the storyboard (v8: the v4 cut after the critic's fix round, the opening round, the new line 2, and headings 1 and 5 as titles)

Built from DESIGN-v4.md on the v3 composition and Frederick Surrey's ten takes as recorded, then retimed and re-staged by the fix round of 2026-10-06 (NOTES.md). 1920 x 1080, 60 fps, 55.5 s (51.5 s of story and the 4.0 s end card), one HyperFrames composition (`index.html`, drawing in `lib/film.js`, the end card from `kit/endcard/`). One page carries the eye through the whole film, five large headings say the narrator's own words as he says them, and every set piece finishes and holds still for at least a second before the next one starts. In each bridge the steps run one after another: the camera lands before the next piece starts. The opening round of 2026-10-15 (NOTES.md, after Kevin's note on the v4 cut at 0:08) replaced the moving type into heading 2 with a seam that draws out of the page into the title's baseline, and moved the turn into the iso map to "redesigned", where the page sits, with its layers rising off it one at a time; the v4 composition before that round is in `archive/v4-fix-round-2026-10-06/`. The v6 round of 2026-10-16 (NOTES.md, after Kevin's note on line 2) made line 2 the post's thesis, "An intuitive, intentional docs interface becomes even more important.", with heading 1 made of its first five words, and moved everything after line 2 2.0 s later; the v5 composition is in `archive/v5-2026-10-15/`. v7 (2026-10-16, after Kevin's note "headers should feel like headers not excerpts") made heading 1 a title, "Design still matters", from the post's summary, arriving whole; the v6 composition is in `archive/v6-2026-10-16/`. v8 (2026-10-16) made heading 5 a title too, "An open problem", arriving whole on line 10's first word; the v7 composition is in `archive/v7-2026-10-16/`. Earlier compositions are in the motion archive (`~/gt/motion-archive/2026-10-11/`).

## The clock

Every cue is a film time read from the takes' scribe_v1 word times (`audio/vo-N.stt.json`), placed by the cue table `O` in `index.html`: O[n] is line n's first word. `audio/mix.py` reads the same table and places each master so its first word lands on O[n]. No silence is cut inside a line and no take is stretched; only the gaps between lines change.

`O = [0, 1.00, 3.98, 9.72, 16.04, 20.66, 26.94, 33.33, 38.29, 42.65, 46.70]`

| line | spoken | first word | key words | last word ends | gap after |
| --- | --- | --- | --- | --- | --- |
| lead | | | | | 1.00 before line 1 |
| 1 | Most docs readers are now AI agents. | 1.00 | agents 2.74 | 3.18 | 0.80 |
| 2 | An intuitive, intentional docs interface becomes even more important. | 3.98 | intuitive 4.10, intentional 4.82, docs 5.48, interface 5.90, becomes 6.48, even 6.98, more 7.30, important 7.54 | 8.10 | 1.62 |
| 3 | General Translation redesigned its docs from scratch so people would read its writing. | 9.72 | Translation 10.02, redesigned 10.76, its 11.26, docs 11.46, people 12.80, read 13.30, writing 13.70 | 14.14 | 1.90 |
| 4 | Interfaces keep getting more cluttered, which creates mental clutter. | 16.04 | cluttered 17.42, creates 18.36, mental 18.70, clutter 19.02 | 19.36 | 1.30 |
| 5 | The redesign started by deleting extra lines, links, and buttons. | 20.66 | redesign 20.80, deleting 21.96, lines 22.82, links 23.50, buttons 24.28 | 24.78 | 2.16 |
| 6 | The sidebar is now one accordion, which is rare among docs sites. | 26.94 | sidebar 27.08, one 28.18, accordion 28.34, rare 29.92, among 30.16, docs 30.42, sites 30.72 | 31.08 | 2.25 |
| 7 | The writing now has more open space around it. | 33.33 | writing 33.45, more 34.57, open 34.83, space 35.17, it 35.91 | 36.05 | 2.24 |
| 8 | Translated pages keep the same spacing and alignment. | 38.29 | pages 38.87, same 39.67, spacing 40.09, and 40.49, alignment 40.61 | 41.15 | 1.50 |
| 9 | Each page guides its reader toward the action they want. | 42.65 | action 44.55 | 45.39 | 1.31 |
| 10 | Docs design is an open problem, and the team keeps working on it. | 46.70 | design 46.98, is 47.54, an 47.64, open 47.84, problem 48.16, team 49.18 | 50.42 | |
| end card | | 51.50 | | | the first 0.5 s beat after 50.42 + 0.6 |

The scene clock `B`: rise 10.76 (the turn's start on "redesigned"), iso 11.76 (the turn has landed and the layers rise), recent 14.88 (the re-centre, once heading 2 has left), flat0 15.58, land 17.18 (settled on "cluttered"), pile 18.20, red 20.80, push 25.68, diag 26.68 (the push lands and the first connector starts), back6 29.88 (the pull back, on "rare"), wall 31.68, fly 32.73, write 34.73 (the camera lands on the writing), out 37.19, planet 38.19, step 39.67, guides 40.49, tobox 41.89, path 42.69, back 46.70, card 51.50, end 55.50.

## The headings

Five headings in 51.5 s of story. Headings 1 and 5 are titles that arrive whole: "Design still matters", from the post's summary ("Why design still matters in the age of AI"), and "An open problem", from line 10. Headings 2 to 4 are each a run of the words Frederick is saying, in his order. Inter through `var(--font)`, weight 500, 144 px for every heading, tracking -0.035 em, kerning on, line height 1.04, white. One placement grid: ink from x 160, first baseline y 252, second y 402 (CSS top 125). Every heading is white (v6: heading 1 no longer carries the film's one accented word, "Humans" in `#86a8ff`). In headings 2 to 4 each word is its own span in its final place from the first frame and enters on its own word start: opacity 0 to 1 and a 12 px rise in 0.30 s, power2.out. Headings 1 and 5 enter as one line: opacity 0 to 1 and a 12 px rise in 0.6 s, expo.out, heading 1 on the 0.5 s beat at line 2's first word and heading 5 on line 10's first word. Each heading holds (words / 3) + 1 s after its last word has arrived, and leaves whole (opacity to 0, 8 px up, 0.45 s, power2.inOut) in a pause or in its own sentence's tail.

| # | line | text | words enter | arrived | floor ends | leaves |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 2 | Design still matters | whole, on the beat at line 2's first word (4.00; 0.6 s, expo.out) | 4.60 | 6.60 | held through line 2 and the pause; 9.55 to 10.00, 0.17 s before line 3, as the seam starts |
| 2 | 3 | General Translation / redesigned its docs | line 1 onto the seam as its front passes each word (9.95, 10.12); 10.76, 11.26, 11.46 | 11.76 | 14.43 | 14.43 to 14.88, after line 3 |
| 3 | 6 | One accordion | 28.18, 28.34 | 28.64 | 30.31 | held through "which is rare among docs sites" and the wall; 32.28 to 32.73, in the pause before line 7 |
| 4 | 8 | Translated pages | 38.29, 38.87 | 39.17 | 40.84 | held through "keep the same spacing and alignment"; 41.89 to 42.34 |
| 5 | 10 | An open problem | whole, on line 10's first word (46.70; 0.6 s, expo.out) | 47.30 | 49.30 | the card's cut at 51.50 |

Lines 1, 4, 5, 7 and 9 have no heading: the agent grid, the pile, the deletion on its words, the open space round the writing and the path to the action say them. The picture stays 28 px clear of every visible heading line's ink, measured every 0.1 s while a heading is up (NOTES.md). The field's calm round a heading clears the smoke within 28 px of each line's ink box and is back to full 230 px away, by tone over the 0.4 s before its first word (heading 1's before its arrival, 3.60 to 4.00) and over its exit; heading 1's calm goes down over its exit (9.55 to 10.00) while heading 2's comes up over the 0.4 s before "General" rises (9.55 to 9.95).

## Rules every beat keeps

- Ground `#071124`; inks `#2f5ce0`, `#86a8ff`, white and the blue gem smoke. The GT mark is the only logo, white from "General" to the end.
- One 3 px cell grid on the kit's anchored 8 by 8 Bayer tile for every dithered piece. Pieces enter, change and leave by tone only.
- One flat camera carries the page from the landing to the close (`camF` in `index.html`): scale k about the page box's centre, then a centre c; every move is a zoom about the fixed point of its two end cameras. The three long zooms (the pull back, the fly-in and the pull-out) run on `F.ease.trap` (speed up over the first 30 percent on a cosine ramp, hold, down over the last 30 percent: top speed 1.43 times the mean); the push, the move into the page box and the shrink back keep power2.inOut. Every move starts and lands at zero speed. Below about 0.4 px a page unit the page hands over by tone to its miniature (`F.mini`), and back.
- A set piece builds, completes and holds still (apart from the smoke, the iso drift, the agent pulses, the planet's turn and the light on the writing) for at least 1.0 s before the next one or its bridge starts. Event starts are at least 0.5 s apart, so never more than two in any second.
- No frame overlay, captions, labels, counters or numbers. The only URL is the end card's link. No detail that carries meaning is under 2 px of line or 24 px of type; the 1 px lines left are panel seams.

## Lead and line 1, 0.00 to 3.98: the readers

- 0.00: the old Introduction page is on frame 0 as a `#2f5ce0` wireframe at x 160 to 1056, y 470 to 1030, with the GT mark (44 page units wide) and the four B1 extras in `#86a8ff`. The field opens at three quarters of its tone and is full by 0.60.
- 0.00 to 0.78: seven row threads (doubled 7/3 on 17 px casings) draw out of the page's right edge at y 505 to 985, 80 px apart (expo.out, 0.6 s, 30 ms apart). 28 nodes on 52 px navy plates rise by tone as their 20 px stubs land: 24 `cpu-chip` agents at 44 px in `#86a8ff`, 4 `user` humans at 44 px in white (row 1 column 4, row 3 column 2, row 5 column 3, row 7 column 1), columns at x 1500, 1570, 1640, 1710.
- 0.80: white agent pulses, 3 by 60 px at 450 px a second, one train per thread, each pulse to the row's next agent. "agents" (2.74): a second train per thread. Hold to 3.98.

## Line 2, 3.98 to 8.10: the people the interface is for

- "An" (3.98 to 4.48): the agents, their stubs and pulses leave by tone from the node ends back toward the page. Heading 1, "Design still matters", arrives whole as a title on the beat (4.00, 0.6 s, expo.out), ink x 170 to 1278 on the first baseline. The four humans and their `#86a8ff` stubs hold.
- "interface" (5.90): the human stubs mix to white (0.3 s). Hold through "becomes even more important".
- 8.10, once the line has ended: the humans, stubs and threads tone out (0.3 s). The old page stays flat where it sits, with heading 1 above it, to 9.55.

## Line 3, 9.72 to 14.14: the redesign

- 9.55 to 10.00: heading 1 leaves whole (opacity to 0, 8 px up, power2.inOut) on its floor, in the pause before line 3.
- "General" (9.72): the GT mark and its name bar mix to white on the page (0.3 s).
- 9.76 to 10.46, the seam: a 3 px white line draws out of the page's top-left corner, straight up the line of the page's left edge (x 160, which is also the headings' left edge) to y 264, 13 px under the title's baseline, then along under "General Translation" to the line's ink end at x 1314 (one move, power2.inOut, 0.7 s). Each word of the line rises onto it as the front passes its left end: "General" at 9.95, "Translation" at 10.12. The seam tones out 10.46 to 10.76, before line 2's first word.
- "redesigned" (10.76 to 11.76), the turn: from rest, one monotone curve turns the page where it sits into the 30 degree axonometric map, about its own centre (x 608 to 740, y 750 to 824), the scale leading the tilt a little (k 0.694 to 0.352), so the page's far corner stays 40 px inside the foot. The smoke clears round the turning page by tone (within 20 px of its outline, full 130 px away), and the calm follows the stack to the flatten. Heading 2's second line builds.
- 11.56 to 12.86, the layers: once the turn has landed, the layers rise off the content plate one at a time, lowest first, each on its own 2 px dashed drop lines: the contents rail to +110 (11.56), the sidebar to +210 (11.71), the header to +330 (11.86), 0.5 s each, power3.out, as 34 px navy slabs with dithered faces and 2 px rims; then the four extras lift off their plates to +450 as small slabs (12.26, 0.6 s). The stack drifts 2 percent, k 0.352 to 0.36, and spans x 412 to 1068, y 482 to 1024 while heading 2 is up. Hold to 12.80.
- "people" (12.80) to "writing" (13.70): a white thumb, 56 page units long (about 30 px on the plate), runs the six-row contents rail's rule from top to foot (0.9 s, power2.inOut) and each row prints white as it passes; the content plate's writing prints white in reading order, 13.10 to 13.70. Hold to 14.88. Heading 2 leaves 14.43 to 14.88.

## The re-centre and the flatten, 14.88 to 17.18 (the pause before line 4, into "cluttered")

- 14.88 to 15.58, the re-centre: once heading 2 has left, the camera brings the stack, plates still lifted, up and to the right from under the heading's place to the frame's middle and scales it from k 0.36 to 0.63 (power2.inOut), so the stack spans x 425 to 1574, y 77 to 1025.
- 15.58 to 17.18, the flatten: the plates come down in order (header, sidebar, rail), the extras last; the page turns flat and grows into the page box, the rims, rows and writing back to `#2f5ce0`, landing pixel for pixel with the page box's crosses, settled by "cluttered" (17.42). Hold to 18.20.

## Line 4, 16.04 to 19.36: the clutter

- The pile in three waves 0.5 s apart, each one tone rise in Bayer order with a 0.1 s top-to-bottom spread (0.4 s a wave): 18.20 (through "creates", 18.36) the lines, links and buttons on the page; 18.70 (on "mental") the toast over Get a Demo, hanging over the page's top edge; 19.20 (inside "clutter") the spill as opaque navy cards in the left margin and above the page, the twelve late pieces with it. Hold, fully buried, 19.60 to 20.80.

## Line 5, 20.66 to 24.78: the deletion

- "redesign" (20.80 to 21.80): a 2 px white redline box draws out of the top-left corner of every piece, every spill card and each extra, 0.5 s each, the start times running top to bottom over 0.5 s.
- "deleting" (21.96 to 22.86): the band runs down the frame in 0.5 s; every piece tagged other, the toast and the whole spill tone out with their boxes (0.4 s each once the front has passed).
- Each kind on its own word, one lit at a time: its boxes mix to `#86a8ff` (0.12 s), then the kind tones out top to bottom. "lines" (22.82): the line pieces and the header rule. "links" (23.50): the link pieces; the "Star on GitHub" banner shrinks into the star pill (0.4 s). "buttons" (24.28): the button pieces; the toggle tones out, the search field shrinks into its icon and the header closes into one row of five controls (0.4 s). The clean page holds 24.68 to 25.68.

## Line 6, 26.94 to 31.08: one accordion, rare among docs sites

- 25.68 to 26.68, the push: the camera pushes into the page's own sidebar until it spans x 1200 to 1543 at k 1.3 with the switcher at y 250, so the first group's heading sits at y 344 and the footer links end by y 1065. The sidebar's group rows dim to a low tone; the content, header and contents rail tone out with the main ground over the push's last 0.5 s. 26.18 to 26.58: the three old surfaces tone in at the left in 2 px `#2f5ce0` outlines: six 96 by 40 tabs at y 600, five sub-tabs at y 680, a second section nav at x 200 to 430, y 760 to 1000.
- 26.68 to 28.18, the connectors, one after another, each starting as the one before arrives (0.5 s each, power2.out): the second nav into g3 (26.68 to 27.18), the sub-tabs into g2 (27.18 to 27.68), the tab bar into g1 (27.68 to 28.18, arriving on "one"). Each is the doubled line 9/3 on a 19 px navy casing, across, then up at x 1104, 1136 and 1168 and into the group's heading on the sidebar's edge; the tab bar's connector runs at y 337 to 345, 85 px under the ink of "One accordion", and the other two lower. On each arrival the group's rows rise to `#86a8ff` with white headings, a white 2 px cross lands and the old surface dims to 35 percent and stays there.
- "one" (28.18 to 28.88): the accordion's rail draws down the rows and bends inward on 45 degree runs (0.7 s, power2.inOut); the white thumb rides its head down g2 and parks at the active page. Heading 3 builds. Hold to 29.88: the three dimmed surfaces, the three connectors and the one accordion.
- 29.88 to 31.68, the pull back (1.8 s, the trapezoid ease): the connectors and the dimmed surfaces tone out together in its first 0.3 s; the rest of the page tones back in, lit (`#86a8ff`, white titles), as it comes back into frame; the page keeps shrinking, hands over to its miniature at about 0.4 px a unit and lands in General Translation's slot of the 6 by 4 wall (240 by 150 pages at a 272 by 176 pitch from x 160, y 346; column 4, row 2). The neighbours' tone follows the camera's scale s (full below s 1.6, none at s 7, the pull back's start), so they come in across the frame edges as the frame widens, from "among", the first on screen by "docs" (30.42); while the camera moves their lines are at 0.7 and their text bars at 0.25, and the bars settle in over its last 0.45 s. Each neighbour is laid out from its own seed: 4 to 7 tabs, 3 to 6 sub-tabs, a second section nav on the left or the right, a sidebar 34 to 56 units wide, a card grid or a list, a contents rail on most; all carry the three old surfaces. While heading 3 is up a page waits until it is clear of the heading's keep-out.
- 31.23 to 31.83: the panel's hairline frame (x 136 to 1784, y 322 to 1048) draws out of its top-left cross, the corner crosses land, and the panel closes over the smoke cell by cell; 31.28 to 31.68 General Translation's 3 px white outline draws out of its top-left corner, carried by the camera, so it is round the slot (x 967 to 1225, y 513 to 681) as the camera lands. Hold to 32.73. Heading 3 leaves 32.28 to 32.73.

## Line 7, 33.33 to 36.05: the writing

- 32.73 to 34.73, the fly-in (2.0 s, the trapezoid ease): the camera flies into General Translation's page. The outline runs back into its corner (0.35 s) and the panel's hairlines into their crosses (0.5 s); three crosses glide with the camera to the writing view's corners (x 300, y 250; x 1620, y 250; x 300, y 1013), the fourth tones out. The neighbours move outward with the camera and tone out by scale (full below s 1.5, none above s 3.5, about 33.3 to 33.9), so they cross the frame edges while General Translation's page grows to 840 px wide; the panel opens to the smoke from its edges as they go. The page hands over from its miniature to its full drawing at about 0.4 px a unit. Nothing else changes while the camera moves.
- 34.73 to 35.33, on landing ("more open space"): the furniture (sidebar, header, contents rail, grounds and frame lines) tones out over 0.4 s while the writing's hairlines (x 300 down, y 250 across) draw out of the crosses and its rail (doubled 9/3 at x 360) draws down.
- 35.23 to 36.19: the eleven lines (x 420 to 1520, title at y 300, lowest line ending by y 882) print from their own gem smoke (GEM7) in reading order, 0.3 s each, 60 ms apart; each takes over from the page's own pieces in its row (the title, the summary and the cards tone out as the print passes them), the rule draws as its line arrives, and the white thumb runs down the rail with the print from the title to the section heading (0.96 s). Open margins of 300 px or more on both sides. Hold to 37.19.

## Line 8, 38.29 to 41.15: translated pages

- 37.19 to 38.19, the pull-out (1.0 s, the trapezoid ease): the camera pulls out to the whole page at k 0.56 (x 1036 to 1760, y 340 to 792). The writing gives way to the page's own text, and the furniture and ground tone back in over the first 0.4 s.
- 38.19 to 38.79, once the camera has landed: the glyph planet (twenty writing systems, one glyph per 30 px cell, glyphs about 20 to 26 px tall, centre 960, 1520, radius 1010) lights under the page from the crown down, every cell still Latin, as the smoke leaves its disc. Heading 4 builds from "Translated" (38.29). Hold to 39.67.
- "same" (39.67 to 40.27): every planet cell steps once to its region's script in Bayer order, and the page's text bars mix from `#2f5ce0` to `#86a8ff` in place.
- "and alignment" (40.49 to 40.89): three white dashed guides (2 px, 10 on, 8 off) draw left to right at the header row, the title and the first group heading, from 60 px left of the page to 60 px right of it. Hold to 41.89.

## Line 9, 42.65 to 45.39: the reader's path

- 41.89 to 42.69: the page moves and grows into the page box; the planet sets by tone from the foot up, the guides tone out (0.2 s), the text returns to the muted ink. Heading 4 leaves 41.89 to 42.34.
- 42.69 to 44.55: one reader's path draws as the doubled line 9/3 in `#86a8ff` at one constant speed (about 1300 px a second) through A4's five stops, a 16 px white seat landing at each.
- "action" (44.55): Get a Demo mixes to white. 44.85 to 45.65: a 160 px white pulse runs the whole path into the action. Hold to 46.70.

## Line 10, 46.70 to 50.42: the open problem

- "Docs" (46.70 to 47.60): the page shrinks back to the opening rect. Heading 5, "An open problem", arrives whole as a title (46.70, 0.6 s, expo.out), ink x 161 to 1177 on the first baseline.
- 47.60 to 48.20: the seven threads draw out of the page's right edge again, the nodes rise as their stubs land, the pulses resume. 48.30 to about 49.1: the path continues out of the action, out of the page's edge, along row 1's thread into row 1's human.
- "team" (49.18): the human stubs mix to white. Hold to 51.50: the closing frame repeats the first, now clean, with one person's path lit through it.

## The end card, 51.50 to 55.50

The shared card from `kit/endcard/`, used as built (palette blue, title "Designing docs / for humans", the post's link), on the film's one hard cut. Silent; the bed's own resolution begins on it. The last frame is the poster.

## The transition map

| at | from | to | what carries the eye |
| --- | --- | --- | --- |
| 0.00 | the open | the readers | The page is on frame 0; the threads draw out of its edge and the nodes land on them. |
| 3.98 to 4.48 | all readers | the four humans | The same grid; the agents leave by tone toward the page, the humans never move. |
| 9.55 to 10.76 | heading 1 over the old page | heading 2 | The seam: the page's logo lights white and a white line draws out of the page's top-left corner, up the left edge the page and the headings share and along under "General Translation", whose words rise onto it as it passes. |
| 10.76 to 12.86 | the flat page | the iso map | The page itself turns where it sits on one zero-speed curve, then its layers rise off it one at a time on their drop lines. |
| 14.88 to 15.58 | the iso map, under the heading | the iso map, centred | Camera continuing: once heading 2 has left, the stack comes to the middle of the frame at a larger scale. |
| 15.58 to 17.18 | the iso map | the flat page | The plates come down and the page lands pixel for pixel in the page box. |
| 18.20 to 24.68 | the old page | the buried page, the clean page | No change of picture: the pile and the deletion happen on the same page. |
| 25.68 to 26.68 | the clean page | the diagram | Camera continuing: a push into the page's own sidebar, which becomes the accordion; the old surfaces tone in at the left as the push settles. |
| 29.88 to 31.68 | the diagram | the wall | Camera continuing in reverse: the page re-forms round the accordion and shrinks into its slot while the other docs sites come in across the frame edges. |
| 32.73 to 34.73 | the wall | the writing | Camera continuing: a fly-in to the lit page while the other pages leave across the edges; the panel's crosses glide to the writing's corners, and after the landing the content column becomes the writing. |
| 37.19 to 38.19 | the writing | the page over the planet | Camera continuing: a pull-out to the whole page; once it lands the planet lights under it. |
| 41.89 to 42.69 | the planet | the path page | The page moves into the page box while the planet sets. |
| 46.70 to 47.60 | the path page | the closing readers | The page shrinks back to its first rect and the threads draw out of it again. |
| 51.50 | the closing frame | the end card | The one hard cut, on the beat. |

## The sound

- The narrator: the ten Frederick Surrey takes as recorded (`audio/vo-1` to `vo-10`; line 2's take is v6's, 2026-10-16), mastered and placed by `audio/mix.py` on `O`.
- The bed: `audio/make-bed.py` builds the round 5 generation to 55.5 s with two six-bar jumps (film 0 = source 8.863; joins at 13.510, inside line 3 under "read its writing", and 31.532, in the pause after line 6 under its lift; the resolution on the card's cut at 51.532). It writes the joins to `audio/bed-edit.json`.
- The mix: the bed ducks under speech with the voice-shaped dip (about -29 LUFS under speech), lifts half way (`GAP_LIFT` 0.5) in every gap of 0.9 s or more (up over 0.5 s from 0.1 s after the last word, down over 0.4 s onto the next first word; -23.2 to -26.4 LUFS in a 400 ms window), rises into its resolution after the last word and fades over the card's last 0.8 s. -16 LUFS integrated, true peak held by the masters' lookahead limiters.
