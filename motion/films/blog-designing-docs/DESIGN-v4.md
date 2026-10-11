# Designing docs for humans: the v4 design (flow and headings)

This is the design for the v4 cut of the trailer for "Designing docs for humans". The build follows it, and it replaces the v3 picture plan in SCRIPT-v3.md (lines, takes and facts are unchanged). No composition code is written here.

Kevin's notes, newest first. The first one is binding and overrides anything earlier where they differ:

- On the v3 cut: "there are way too many headers in the blog videos and they dont actually line up with whats being said as well and theres too many visuals that are rapidly playing, which is not good, we can just increase the length if u need".
- "you should be fine with redoing visuals so that transition flows and headers are a lot better for the blog videos".
- Standing: keep all the visual spectacle (no set piece he has seen may disappear), stakes early, the narration tells its own story, Inter only through `var(--font)`, no eyebrows, no monospace as a voice, no overlaid frame, the dithered gem smoke, the shared end card with the post's link, plain technical English on screen.

The v4 cut in one sentence: one page carries the eye through the whole film, five large headings say the narrator's own words as he says them, and every set piece finishes and holds still for a second before the next one starts. The film runs 50.5 s (v3: 41.5 s). The narration is the ten Frederick Surrey takes as recorded.

## 1. What is wrong in v3 (watched at 4 fps and on full-size frames)

- **Headings.** There are ten, one per line. Seven are leftover post phrases that Frederick never says ("Telltale signs of AI design", "A rarity in docs sites", "Guide their attention to what's important", "Human readability and visual design"). They change on reading floors rather than on words, so most are on screen while a different sentence is heard. Examples: "A lot of extra lines, links, and buttons" is still up at 19.6 under "The sidebar is now", and "The same spacing" is still up at 29.3 as line 9 begins. Every heading rises 26 px and drops 18 px the same way.
- **Cuts.** The story has four hard cuts between unrelated pictures: 19.58 (page to diagram), 23.81 (wall to writing), 26.42 (writing to planet) and 29.43 (planet to path page). Some frames are nearly empty while the next piece builds: 19.6 to 20.4 (the diagram starting from bare connectors), 26.4 to 26.9 (the planet lighting under an empty sky) and 29.43 to 29.83 (the muted page waiting).
- **Bursts.** The pile lands 168 pieces in 1.6 s (12.12 to 13.72). The twelve late spill pieces come one every 0.06 s. The redline draws every box inside 0.1 s. Line 6 has ten picture events in 4.2 s: cut, connectors, rail, thumb, accordion move, page rise, shrink into the wall, panel, lit page, growth. The lit page grows out of the wall in 0.46 s, the fastest move in the film.
- **Scale.** The reader icons are 30 px. The iso thumb is about 15 px long and moves 18 px. The wall's pages are 120 by 75 with sub-cell detail. The page above the planet is at 0.37 scale with 1 px guides that are complete for 19 frames. The diagram's old surfaces are 1 px outlines.

## 2. The clock

Takes, word times and voice are unchanged (`audio/vo-1` to `vo-10`, scribe_v1 times in `.stt.json`). Only the pauses between lines change. A gap is the time from one line's last word ending to the next line's first word.

`O = [0, 1.00, 3.98, 7.72, 13.14, 17.76, 23.38, 29.02, 33.24, 37.60, 41.70]`

| line | spoken | first word | last word ends | gap after | what the gap is for |
| --- | --- | --- | --- | --- | --- |
| lead | | | | 1.00 before line 1 | the readers draw out of the page and hold |
| 1 | Most docs readers are now AI agents. | 1.00 | 3.18 | 0.80 | the doubled pulses hold |
| 2 | Humans still read docs to evaluate a product. | 3.98 | 6.42 | 1.30 | heading 1's floor; the rise into the iso view |
| 3 | General Translation redesigned its docs from scratch so people would read its writing. | 7.72 | 12.14 | 1.00 | the writing holds, then the flatten starts |
| 4 | Interfaces keep getting more cluttered, which creates mental clutter. | 13.14 | 16.46 | 1.30 | the pile holds, fully buried |
| 5 | The redesign started by deleting extra lines, links, and buttons. | 17.76 | 21.88 | 1.50 | the clean page holds, then the push into the sidebar |
| 6 | The sidebar is now one accordion, which is rare among docs sites. | 23.38 | 27.52 | 1.50 | the wall lands, its outline draws, it holds |
| 7 | The writing now has more open space around it. | 29.02 | 31.74 | 1.50 | the writing holds, then the pull-out |
| 8 | Translated pages keep the same spacing and alignment. | 33.24 | 36.10 | 1.50 | the guides hold, then the page moves into the page box |
| 9 | Each page guides its reader toward the action they want. | 37.60 | 40.34 | 1.36 | the pulse finishes and holds; sets the card rule for heading 5 |
| 10 | Docs design is an open problem, and the team keeps working on it. | 41.70 | 45.42 | | |
| card | | 46.50 | | | the first 0.5 s beat after 45.42 + 0.6 = 46.02 |

The film is 50.50 s: 46.50 s of story and the 4.0 s end card. The root's `data-duration` is 50.5. The gap before line 10 is set to 1.36 so that `O[10] + 4.32` (last word plus 0.6) lands at 46.02, just past a beat. That puts the card at 46.50, and heading 5's floor (ending 46.46) fits before it. If any `O` moves, keep `(O[10] + 4.32) mod 0.5` between 0.00 and 0.04.

Key word times (film seconds): Most 1.00, agents 2.74; Humans 3.98, docs 4.92, evaluate 5.32, product 5.94; General 7.72, Translation 8.02, redesigned 8.76, docs 9.46, scratch 10.00, people 10.80, read 11.30, writing 11.70; cluttered 14.52, creates 15.46, mental 15.80, clutter 16.12; redesign 17.90, deleting 19.06, extra 19.58, lines 19.92, links 20.60, buttons 21.38; sidebar 23.52, one 24.62, accordion 24.78, which 25.96, rare 26.36, among 26.60, sites 27.16; writing 29.14, more 30.26, open 30.52, space 30.86, it 31.60; Translated 33.24, pages 33.82, same 34.62, spacing 35.04, and 35.44, alignment 35.56; Each 37.60, action 39.50, want 40.06; Docs 41.70, design 41.98, is 42.54, an 42.64, open 42.84, problem 43.16, team 44.18, it 45.26.

New scene clock: `B = { rise 5.94, iso 7.40, flat0 12.70, land 14.50, pile 15.50, red 17.90, push 22.78, diag 23.78, back6 26.63, wall 27.93, fly 29.33, write 30.33, out 32.63, planet 33.58, step 34.62, guides 35.44, tobox 36.84, path 37.64, back 41.70, card 46.5, end 50.5 }`.

## 3. The heading system

### The type

| property | value |
| --- | --- |
| face | Inter through `var(--font)`, weight 500, `font-optical-sizing: auto` (display cut) |
| size | 144 px for every heading. One size, chosen so the longest line, "Humans still read docs" (about 1341 px), fits the grid |
| tracking | -0.035 em (-5.04 px), kerning on |
| line height | 1.04 (149.8 px) |
| colour | white `#ffffff`. One word in the whole film is set in the accent `#86a8ff`: "Humans" in heading 1, the film's subject and the title's last word |
| lines | one or two, never three; sentence case; no trailing period |
| placement grid | left edge of the ink at x 160. First baseline at y 252 and second at y 402 (CSS `top` 125 px). Cap top is y 147; a line-1 descender reaches y 287 and a line-2 descender y 437. A line ends by x 1560 |
| keep-out | The picture stays 28 px clear of every heading line's ink box. One-line headings reserve x 132 to (line end + 28), y 119 to 315. Two-line headings reserve the same width, y 119 to 465. The field's calm clears the smoke to 0 within 28 px of each line box and returns to full 230 px away, by tone over 0.4 s with the entrance and the exit |
| entrance | Word by word on Frederick's word starts (scribe word start placed by `O[n]`). Each word is its own span, laid out in its final place from the first frame (no reflow). Opacity 0 to 1 and 12 px rise to 0 in 0.30 s, power2.out. A word arrives when it reaches full opacity, 0.30 s after its start |
| reading floor | (words / 3) + 1 s after the last word has arrived |
| exit | The whole heading leaves together: opacity 1 to 0 and 8 px up in 0.45 s, power2.inOut. An exit only happens in a pause or inside the same sentence's tail, never while a different line is being spoken. Two exits are special: heading 1 leaves by moving type into heading 2, and heading 5 leaves on the card's cut |
| moving type | Used once. Heading 1 dissolves into its 3 px cells and the cells reassemble as heading 2's first line "General Translation" (0.8 s, round 7c's six-frame hand-overs at each end). The accent cells of "Humans" mix to white on the way. The field's heading calm changes by tone from heading 1's envelope to heading 2's around it (7.35 to 8.35) |

Lines with no heading: 1, 4, 5, 7 and 9. On those lines the picture already says it (the agent grid, the pile, the deletion on its words, the open space round the writing, the path to the action), or the reading floor would run into the next line.

### The five headings

Every heading is a run of the words Frederick is saying, in his order. Times are film seconds.

| # | line | text (line break at " / ") | words and their entrance times | arrived | floor (s) | floor ends | exit | on screen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2 | Humans still read docs (one line, "Humans" in `#86a8ff`) | Humans 3.98, still 4.42, read 4.66, docs 4.92 | 5.22 | 2.33 | 7.55 | moving type 7.55 to 8.35, into heading 2's first line, in the pause before line 3 | 3.98 to 7.55 |
| 2 | 3 | General Translation / redesigned its docs | "General Translation" from heading 1's cells, 7.55 to 8.35 (General 7.72, Translation 8.02); then redesigned 8.76, its 9.26, docs 9.46 | 9.76 | 2.67 | 12.43 | 12.43 to 12.88, in the pause after line 3 | 7.55 to 12.88 |
| 3 | 6 | One accordion | One 24.62, accordion 24.78 | 25.08 | 1.67 | 26.75 | held through "which is rare among docs sites" and the wall; 28.55 to 29.00, in the pause before line 7 | 24.62 to 29.00 |
| 4 | 8 | Translated pages | Translated 33.24, pages 33.82 | 34.12 | 1.67 | 35.79 | held through "keep the same spacing and alignment"; 36.84 to 37.29, in the pause before line 9 | 33.24 to 37.29 |
| 5 | 10 | Docs design is / an open problem | Docs 41.70, design 41.98, is 42.54, an 42.64, open 42.84, problem 43.16 | 43.46 | 3.00 | 46.46 | the card's cut at 46.50 | 41.70 to 46.50 |

Approximate ink widths at 144 px: 1 = 1341; 2 = 1156 and 1154; 3 = 876; 4 = 1032; 5 = 860 and 1006. Headings 1, 2 and 5 are complete declarative sentences; 3 and 4 are short phrases that name the line's subject. None has an em dash, a metaphor, an "X, not Y" or a signpost.

Retired with Kevin's newest note: the ten v3 headings, the 26 px rise and 18 px drop, and heading 5's runs turning white. That last piece's job, marking each kind as its word is said, moves into the picture (section 8, the deletion).

## 4. The picture, line by line

Rules for the whole film:
- Ground `#071124`. Inks `#2f5ce0`, `#86a8ff`, white and the blue gem smoke. One 3 px cell grid on the anchored 8 by 8 Bayer tile. Dithered pieces enter, change and leave by tone only. The GT mark is the only logo, and it stays white from "General" to the end.
- One flat camera (scale k about the page box's centre, then a centre c) carries the page model through every page move from line 5 to line 10: the push into the sidebar, the pull back to the wall, the fly-in to the writing, the pull-out to the translated page, the move into the page box and the shrink back. Scale is interpolated in log space and position on the same power2.inOut progress, with zero speed at both ends. Below about 0.4 px per page unit the page hands over by tone to its `mini()` drawing, and back.
- Ambient motion that may run during a hold: the smoke field, the iso view's 2 percent drift, the agent pulses, the planet's turn and the GEM7 light on the writing. Everything else is still during a hold.
- A set piece builds, completes, and holds still for at least 1.0 s before the next set piece or its bridge starts. An accent is one small tone change on its word: a mark, a stub or the action turning white. Accents count as picture events but are not set pieces. There are never more than two picture events in any second.

### Lead and line 1 (0.00 to 3.98): the readers

- **0.00.** The old Introduction page is on frame 0 as a `#2f5ce0` wireframe, larger than v3: x 160 to 1056, y 470 to 1030 (camera k 0.6935, centre 608, 750). It has the GT mark as its logo and the four B1 extras in `#86a8ff` (the "Star on GitHub" banner, the sidebar toggle, the search field, the header rule). The field opens at three quarters of its tone and is full by 0.60.
- **0.00 to 0.80.** Seven row threads (the doubled line, gauge 7, core 3) draw out of the page's right edge at y 505 to 985 (80 px apart): expo.out, 30 ms apart, top to bottom. 28 nodes rise by tone as their 20 px 45 degree stubs land. 24 are Heroicons `cpu-chip` agents at 44 px in `#86a8ff`; 4 are `user` humans at 44 px in white, at row 1 column 4, row 3 column 2, row 5 column 3 and row 7 column 1. The columns sit at x 1500, 1570, 1640 and 1710.
- **0.80.** White agent pulses begin, 3 px by 60 px, one per thread at seeded phases, 450 px a second. They run from the page to the agents only.
- **"agents" (2.74), accent.** The pulses double to two per thread. Hold to 3.98.

### Line 2 (3.98 to 6.42): the people

- **"Humans" (3.98).** The agents, their stubs and their pulses leave by tone from the node ends back toward the page (0.5 s, to 4.48). Heading 1 builds word by word. The four humans and their `#86a8ff` stubs stay and hold, 4.48 to 5.94.
- **"evaluate" (5.32), accent.** The four human stubs mix to white (0.3 s, Bayer order).
- **"product" (5.94).** The humans, stubs and threads tone out (0.3 s). The camera starts from rest from the opening rect: round 7d's one monotone curve turns the page into the 30 degree axonometric map and lifts its plates. The contents rail goes to +110, the sidebar to +210 and the header to +330. Each plate is a 34 px navy slab with Bayer-dithered `#2f5ce0` side faces, a 2 px `#86a8ff` rim and dashed drop lines. The iso view is reached at 7.40.

### Line 3 (7.72 to 12.14): the redesign

- **7.40 to 12.70.** The iso view holds with a 2 percent drift. The stack is about 20 percent larger than v3 (`kIso` about 0.56 to 0.58, centre near 1340, 800). It keeps 28 px clear of heading 2's reserve (x 132 to 1344, y 119 to 465): the extras at +450 stay right of x 1372 wherever they are above y 465. The content plate's far corner may run off the foot of the frame; the rail plate and the extras may not.
- **7.55 to 8.35.** Moving type: heading 1 becomes "General Translation".
- **"General" (7.72), accent.** The page's GT mark and name bar mix to white on the header plate (0.3 s, Bayer order). The mark is now 44 page units wide (was 30), about 30 px on the plate.
- **"redesigned" (8.76).** The four extras lift off as small slabs to +450 (0.6 s, power3.out), each with dashed drop lines to where it sat. Heading 2's second line builds word by word. Hold, 9.36 to 10.80.
- **"people" (10.80) to "writing" (11.70).** A white thumb, 34 units long (about 20 px), runs the rail plate's rule from top to foot (0.9 s, power2.inOut). The rail now has six rows at a 24-unit pitch, a rule of 146 units, and travel of about 67 px on screen. Each row prints white as the thumb passes. The content plate's writing (title, summary, paragraph, section heading, card names) prints white in reading order, 11.10 to 11.70: 0.25 s a line, 90 ms apart, by tone. The thumb and the writing are one gesture, and it completes on "writing". Hold, 11.70 to 12.70.
- **12.43 to 12.88.** Heading 2 leaves.

### Line 4 (13.14 to 16.46): the clutter

- **12.70 to 14.50, the flatten.** The plates come down in order (header, sidebar, rail), the extras come down last, and then the page turns flat and grows into the page box (x 561 to 1853, y 456 to the foot). The rims return to `#2f5ce0`, the writing and the rail rows return to `#2f5ce0` as the extras land, and the page lands with zero speed on "cluttered" (14.50). The landing is pixel-exact (`camera(land)` is the identity), and the page box's corner crosses land with it. Hold, 14.50 to 15.50.
- **The pile, in three waves, each a single tone rise in Bayer order with a 0.1 s top-to-bottom spread (0.4 s a wave):**
  - **15.50 ("creates"):** the extra lines, links and buttons land on General Translation's page.
  - **16.00 ("mental"):** the toast drops over Get a Demo, hanging over the page's top edge from outside.
  - **16.50 ("clutter"):** the spill lands in the left margin and above the page as opaque navy cards: the general signs of AI design (eyebrow pills, the callout, badges, outline icons, the floating widget, the footer banner, the ghost titles) and the twelve late spill pieces in the same wave.
- **16.90 to 17.90.** The page holds, fully buried. The burst is gone: 168 pieces arrive in three readable moves instead of a stream.

### Line 5 (17.76 to 21.88): the deletion

- **"redesign" (17.90 to 18.90).** A 2 px white redline box, 4 to 6 px outside its piece, draws out of the top-left corner of every pile piece, every spill card and each extra. Each box takes 0.5 s (power3.out), and the start times run top to bottom over 0.5 s. One sweep replaces v3's 0.1 s scatter.
- **"deleting" (19.06 to 19.96).** The deletion band runs down the frame (front 0.5 s). Every piece tagged other and the whole spill leave with their boxes, each tone falling over 0.4 s once the front has passed. The toast lifts off the action, and the spill's cards leave the smoke behind them.
- **Each kind on its own word.** On the word, that kind's redline boxes mix from white to `#86a8ff` (0.12 s), then the kind tones out with its boxes in a top-to-bottom sweep (0.35 to 0.4 s). Only one kind is lit at a time:
  - **"lines" (19.92):** the line pieces and the header rule.
  - **"links" (20.60):** the link pieces. The "Star on GitHub" banner shrinks into the star pill in the header row (0.4 s, power2.inOut), as B5 shows.
  - **"buttons" (21.38):** the button pieces. The sidebar toggle tones out, the search field shrinks into the search icon, and the header closes into one row of five controls: search, theme, star pill, Sign In, Get a Demo (0.4 s, power3.out).
- **21.78 to 22.78.** The clean page stands still.

### Line 6 (23.38 to 27.52): one accordion, rare among docs sites

- **22.78 to 23.78, the push into the sidebar.** The flat camera pushes in on the clean page's own sidebar until the sidebar is the diagram's accordion, about 1.5 times its page-box size, at x 1200 to 1640, switcher near y 110, footer links ending by y 1000. The content column and the right rail leave across the right edge and the header across the top. From 23.28 to 23.68 the three old navigation surfaces tone in at the left, below heading 3's reserve, in 2 px `#2f5ce0` outlines: a tab bar of six 96 by 40 px tabs (x 200 to 860, y 600 to 640), a row of five sub-tabs (y 680 to 712) and a second vertical section nav (x 200 to 430, y 760 to 1000). The sidebar's group rows dim to a low tone during the push, so they have somewhere to rise to.
- **23.80 to 24.90, the connectors.** Three connectors start bottom first (second nav 23.80, sub-tabs 23.95, tab bar 24.10). Each is the doubled line, gauge 9 and core 3, on a 19 px navy casing, drawing out of its old surface (0.5 s, power3.out). They arrive at 24.30, 24.45 and 24.60, the last on "one". On each arrival its group's rows rise in tone to `#86a8ff` with white headings, its white cross (16 px arms, 2 px) lands, and its old surface tones out (0.3 s). No connector goes above y 340.
- **"one" (24.62 to 25.12).** The rail draws down the rows and bends inward on 45 degree runs where the tree nests (power3.out). Heading 3 builds: "One accordion".
- **25.12 to 25.62.** The white thumb slides down the rail through the bend to the active page (power2.inOut). Hold, 25.62 to 26.63, in the comma pause.
- **26.63 to 27.93, the pull back into the wall ("among docs sites").** The camera pulls back on the same curve. The connectors tone out in its first 0.3 s. The rest of the page re-enters around the accordion and rises in tone as it comes back into frame (the accordion back in its page). The page keeps shrinking into its slot of a 6 by 4 wall of docs pages: 240 by 150 each, at a 272 by 176 pitch, from x 160, y 346. General Translation's slot is column 4, row 2 (x 976 to 1216, y 522 to 672). The other 23 pages rise in tone outward from General Translation's slot, in Bayer order, as the frame widens (26.9 to 27.7). Each carries the old surfaces in miniature in 2 px `#2f5ce0`: a tab bar, a sub-tab row and a second section nav. General Translation's page keeps the lit inks (`#86a8ff` rows, white headings) and carries one accordion. From 27.40 to 28.00 the panel's 1 px hairline frame (x 136 to 1784, y 322 to 1048) draws out of its top-left cross, its right edge draws down out of the top-right corner, the corner crosses land, and the panel closes over the smoke cell by cell once both hairlines have passed.
- **27.93 to 28.33.** General Translation's 3 px white outline draws out of its top-left corner. Hold, 28.33 to 29.33. Heading 3 leaves, 28.55 to 29.00.

### Line 7 (29.02 to 31.74): the writing

- **29.33 to 30.33, the fly-in ("writing" 29.14).** The camera flies into General Translation's lit page. The other pages move outward with the camera, toning out as they go. The white outline runs back into its corner, and the panel's hairlines run back into their crosses (the crosses stay). The panel's ground opens to the smoke behind the leaving pages, in from its edges. In the last 0.5 s the page's furniture (sidebar, header, contents rail) tones out, so that only the content column stays. The camera lands on the writing view: text block x 420 to 1520, title at y 300, lowest line by y 880. The writing's rail is a doubled line at x 360 that draws down out of a cross at y 250. Hairlines x 300 (down) and y 250 (across) have crosses at their ends. Open margins of at least 300 px are left on both sides: the open space the line is about.
- **30.03 to 30.93.** The eleven lines print from their own gem smoke setting (GEM7) through the Bayer screen in reading order (0.3 s each, 60 ms apart). They are solid `#2f5ce0` where the smoke is thin, with `#86a8ff` and white where its rim sweeps through the words. The rule draws as its line arrives (0.4 s). The smoke's light keeps travelling along the words.
- **30.93 to 31.63.** The white thumb slides down the rail from the title to the section heading (power2.inOut) and arrives on "it". Hold, 31.63 to 32.63.

### Line 8 (33.24 to 36.10): translated pages

- **32.63 to 33.58, the pull-out.** The camera pulls out from the writing to the whole page at k 0.56 (724 by 452 px) at x 1036 to 1760, y 340 to 792. The GEM7 print returns to the page's `#2f5ce0` by tone in the first 0.4 s, and the furniture tones back in. From 33.00 to 33.55 the glyph planet lights under it in Bayer order from the crown down, and the smoke inside its disc leaves on the same schedule. The planet is twenty writing systems, one glyph per 21 px cell, centre 960, 1520, radius 1010, crown y 510, turning 0.14 rad a second. Every cell is still Latin. The page is opaque and stands in front of the planet's upper right. Heading 4 builds from "Translated" (33.24). Hold, 33.58 to 34.62.
- **"same" (34.62 to 35.22), one translation gesture.** Every planet cell steps once from Latin to its region's script, in Bayer order over 0.6 s, keeping its light, grid and shape. In the same 0.6 s the page's text bars mix from `#2f5ce0` to `#86a8ff` in place, and nothing moves.
- **"and alignment" (35.44 to 35.84).** Three white dashed guides draw left to right across the page at its header row, its title and its first group heading, as in the post's E5. They are 2 px, 10 on and 8 off, running from 60 px left of the page to 60 px right of it (0.3 s each, 50 ms apart, power3.out). Hold, 35.84 to 36.84.

### Line 9 (37.60 to 40.34): the reader's path

- **36.84 to 37.64, into the page box.** The page moves and grows from the upper right into the page box. The planet sets by tone (rows from the foot up, 0.6 s), the guides tone out (0.2 s), and the text returns to the muted ink: `#2f5ce0` bars and hairlines, 50 percent dithered icons, the accordion, the five-control header and the white GT mark. Heading 4 leaves, 36.84 to 37.29.
- **"Each" (37.64) to "action" (39.50).** One reader's path draws as the doubled line, gauge 9 and core 3, in `#86a8ff`, out of the section switcher at one constant speed (ease none, about 1300 px a second). It passes A4's five stops: the switcher, the active sidebar row, the title, the first quickstart card and Get a Demo (orient, navigate, read, choose, act). A white 16 px seat lands at each stop as the path passes it.
- **"action" (39.50), accent.** Get a Demo mixes to white (0.3 s).
- **39.80 to 40.60.** A white pulse, 160 px, runs the whole path once and ends in the lit action. Hold, 40.60 to 41.70.

### Line 10 (41.70 to 45.42): the open problem

- **"Docs" (41.70 to 42.60).** The page shrinks back to the opening rect (x 160 to 1056, y 470 to 1030), and the field's envelope follows by tone. Heading 5 builds word by word.
- **42.60 to 43.20.** The seven threads draw out of the page's right edge again, as at frame 0. The nodes rise as their stubs land, and the agent pulses resume.
- **43.30 to 44.10.** The reader's path continues at its own speed out of the lit action, out of the page's right edge, along row 1's thread and into row 1's white human.
- **"team" (44.18), accent.** The four human stubs mix to white (0.3 s).
- **44.48 to 46.50.** Hold, with the pulses running. The closing frame repeats the first: the same page among the same readers, now clean, with one person's path lit through it.

### The end card (46.50 to 50.50)

The shared card from `kit/endcard/`, used as built: `addEndCard(tl, { palette: 'blue', title: ['Designing docs', 'for humans'], url: 'generaltranslation.com/blog/designing-docs-for-humans', start: 46.5 })`. It shows the GT mark filled with the blue gem smoke, the title in two lines and the post's link. It is silent, and the bed's own resolution begins on its cut. The last frame is the poster.

## 5. The transition map

Every change of picture, and what carries the eye across it. There is one hard cut, to the end card.

| at | from | to | bridge |
| --- | --- | --- | --- |
| 0.00 | the open | the readers | The page is on frame 0 and the field opens at three quarters of its tone. Everything new draws out of the page: the threads leave its right edge and the nodes land on them. |
| 3.98 to 4.48 | all readers | the four humans | The same grid. The agents leave by tone back toward the page; the humans never move. |
| 5.94 to 7.40 | the readers | the iso map | The object stays and transforms. The page itself turns and lifts into its plates on one zero-speed curve from the rect it already occupies. The readers tone out in its first 0.3 s, while it is still near rest. |
| 7.55 to 8.35 (type) | heading 1 | heading 2 | Moving type. Heading 1's cells travel and reassemble as "General Translation" on the same baseline. |
| 12.70 to 14.50 | the iso map | the flat page box | The object stays and transforms. The plates come down in order and the page lays flat with zero speed, pixel for pixel into the page box, on "cluttered". |
| 15.50 to 21.78 | the old page | the buried page, then the clean page | No change of picture. The pile and the deletion happen on the same page, in place. |
| 22.78 to 23.78 | the clean page | the accordion diagram | Camera continuing. A push into the page's own sidebar: the sidebar never leaves the screen and becomes the diagram's accordion. The page's other parts leave across the frame edges, and the old surfaces tone in on the left as the push settles. |
| 26.63 to 27.93 | the diagram | the wall of docs pages | Camera continuing, in reverse. The page re-forms around the accordion and keeps shrinking into its slot. The other pages rise by tone as the frame widens into them, and the panel's hairlines draw out of their cross, a seam the wall then sits on. |
| 29.33 to 30.33 | the wall | the writing | Camera continuing. A fly-in to General Translation's lit page: the outline and hairlines run back into their owners, the other pages leave outward, the furniture tones out, and the content column becomes the writing view. The writing then prints from its own smoke. |
| 32.63 to 33.58 | the writing | the translated page over the planet | Camera continuing. A pull-out from the content column to the whole page, which takes its place at the upper right. The planet lights under it from the crown in Bayer order (a tone mix in). |
| 36.84 to 37.64 | the planet | the path page | The object stays and transforms. The page moves into the page box while the planet sets by tone and the guides tone out. |
| 41.70 to 42.60 | the path page | the closing readers | The object stays and transforms. The page shrinks back to its first rect and the threads draw out of its edge again. The path, already lit, carries on out of the page into a reader. |
| 46.50 | the closing frame | the end card | Hard cut on the 0.5 s beat after the last word plus 0.6 s. It is the series card's own entrance; the bed resolves on it. |

There are no empty or near-empty frames. Every bridge keeps an object on screen (the page, its sidebar, its slot, its content column), and every new piece enters by tone or draws out of an owner. There are no pop-ins.

## 6. Pacing, checked

The longest a set piece holds before the next one starts: readers 1.46 s (4.48 to 5.94), iso view 1.36 (7.40 to 8.76), extras 1.44 (9.36 to 10.80), iso writing 1.00 (11.70 to 12.70), flat page 1.00 (14.50 to 15.50), buried page 1.00 (16.90 to 17.90), clean page 1.00 (21.78 to 22.78), diagram 1.01 (25.62 to 26.63), wall 1.00 (28.33 to 29.33), writing 1.00 (31.63 to 32.63), translated page 1.04 (33.58 to 34.62), guides 1.00 (35.84 to 36.84), pulse 1.10 (40.60 to 41.70), closing frame 2.02 (44.48 to 46.50).

In every 1 s window there are at most two picture-event starts. The densest stretches are the three pile waves (15.50, 16.00, 16.50) and the action with its pulse (39.50, 39.80). Inside one set piece, sub-beats follow the narrator's own cadence: the deletion's redline, band, lines, links and buttons are 0.7 to 1.2 s apart. Only one main motion runs at a time. The heading's word entrances, and heading 2's exit over the flatten's first 0.18 s (while the flatten is still near rest), are type and not picture motion.

## 7. Scale fixes

| detail | v3 | v4 |
| --- | --- | --- |
| Headings | 112 to 140 px, ten sizes | 144 px, one size, one grid |
| Opening and closing page | x 160 to 900 (k 0.573) | x 160 to 1056 (k 0.694), so the four B1 extras read |
| Reader nodes | 30 px icons, 50 by 68 px pitch, 15 px stubs | 44 px icons, 70 by 80 px pitch, 20 px stubs |
| Agent pulses | about 900 px a second | 3 by 60 px at 450 px a second |
| Iso stack | `kIso` 0.47 | about 0.56 to 0.58 (+20 percent), rims 2 px |
| Iso thumb | about 15 px long, 18 px travel, three rail rows | six rail rows (rule 146 units), thumb about 20 px, travel about 67 px, rows print white as it passes |
| GT mark on the page | 30 page units | 44 page units, about 30 px on the iso plate |
| Redline | 2 px (fix round) | 2 px, drawn as one 1.0 s sweep |
| Diagram's old surfaces | 1 px outlines, small | 2 px outlines, tabs 96 by 40 px |
| Connectors | doubled 7/3 on 17 px casings | doubled 9/3 on 19 px casings, crosses 16 px |
| Wall of docs pages | 9 by 6 at 120 by 75 | 6 by 4 at 240 by 150. Miniatures drawn by `mini()` with 3 px bars and 2 px outlines. General Translation's outline 3 px |
| Writing's rail and thumb | doubled 7/3 | doubled 9/3 |
| Page above the planet | k 0.41 (528 px wide); 1 px guides complete for 19 frames | k 0.56 (724 px wide); 2 px white guides that run 60 px past the page, held 1.0 s complete |
| Reader's path | doubled 7/3, small seats, 120 px pulse | doubled 9/3, 16 px seats, 160 px pulse |

No detail that carries meaning is under 2 px of line or under 24 px of type at 1920 by 1080. The only type is the five headings at 144 px (about 29 px on a 390 px wide phone) and the end card. The 1 px hairlines that remain are panel seams (the line law), not meaning.

## 8. Every set piece, and how it now appears

Each piece of SCRIPT-v3's spectacle map, in film order. The times are when it plays.

| piece | where it plays | how it now appears |
| --- | --- | --- |
| The dithered gem smoke field, one clock, opening at three quarters of its tone | 0.00 to 46.50 | Unchanged clock (gem time 9.2 + 0.12 s a second; re-measure each shot's lit share, 12 to 30 percent). Envelopes now change by tone with every camera move instead of at cuts. |
| The old page with the GT mark and the four B1 extras | 0.00 to 21.78 | Larger opening rect. The extras are deleted on their words in line 5. |
| The reader grid: 7 threads, 28 nodes, 45 degree stubs | 0.00 to 6.24, and 42.60 to 46.50 | Larger nodes. The threads draw out of the page at both ends of the film. |
| Agent pulses, doubling | 0.80 to 4.48, doubling on "agents" 2.74; again 42.60 to 46.50 | Slower (450 px a second), one then two per thread. |
| Agents leaving while the four humans stay | "Humans" 3.98 to 4.48; humans hold to 5.94 | As v3, with a 1.46 s hold. |
| Human stubs mixing to white | "evaluate" 5.32; "team" 44.18 | Accents, 0.3 s each. |
| Humans, stubs and threads toning out as the camera starts | "product" 5.94 to 6.24 | As v3. |
| The iso rise from the opening rect | 5.94 to 7.40 | Same curve, from the larger rect. |
| The plates (rail +110, sidebar +210, header +330): slabs, dithered faces, rims, drop lines, drift | 7.40 to 12.70 (5.3 s) | About 20 percent larger, 2 px rims, 2 percent drift, clear of heading 2. |
| The GT mark and name bar mixing to white | "General" 7.72, white to the end | Mark 44 units wide. |
| The extras lifting to +450 with drop lines, landing last | "redesigned" 8.76 to 9.36; lifted to 12.70; land in the flatten | As v3, with a 1.44 s hold before the thumb. |
| The thumb on the iso rail plate | "people" 10.80 to "writing" 11.70 | A 0.9 s run of about 67 px along a six-row rail; the rows print white. |
| The writing printed white on the iso content plate | 11.10 to 11.70; back to `#2f5ce0` as the extras land | Merged with the thumb into one gesture. |
| The flatten: plates down in order, rims back, pixel-exact landing, crosses | 12.70 to 14.50 (1.8 s), landing on "cluttered" | As v3. |
| The full clutter pile, tagged by kind | 15.50 to 16.90 | Three waves 0.5 s apart instead of a 1.6 s stream. The seeded order and the speed-up go with the burst; the kinds and the counts stay. |
| The toast over the action | lands 16.00 ("mental"); lifted off 19.06 | Its own wave, so it reads. |
| The spill as opaque cards over the smoke | lands 16.50; leaves 19.06 to 19.96 | One wave. |
| The twelve late spill pieces | 16.50, inside the spill wave | Land with the spill instead of one every 0.06 s. |
| The white redline boxes, each drawn out of its piece's top-left corner | "redesign" 17.90 to 18.90 | One top-to-bottom sweep, 2 px. |
| The deletion band, uncovering the action, the spill leaving the smoke | "deleting" 19.06 to 19.96 | As v3. |
| Each kind deleted on its word | "lines" 19.92, "links" 20.60, "buttons" 21.38 | Each kind's boxes turn `#86a8ff` on its word, then the kind sweeps out. This carries the job of v3's heading 5 runs, merged into the picture. |
| The banner shrinking into the star pill | "links" 20.60 to 21.00 | As v3. |
| The toggle out, the search into its icon, the header closing into five controls | "buttons" 21.38 to 21.78 | As v3; the clean page then holds 1.0 s. |
| The accordion diagram: three old surfaces and the accordion at about 1.5 times | 23.28 to 26.63 (3.35 s) | Reached by a push into the page's own sidebar instead of a hard cut. Old surfaces larger, 2 px. |
| Three connectors on navy casings, rows rising, white crosses landing, each old surface toning out | 23.80 to 24.90, the last arriving on "one" | Heavier line (9/3), bottom first, all below y 340. |
| The rail drawing and bending on 45 degree runs | "one" 24.62 to 25.12 | As v3, 0.5 s. |
| The white thumb sliding down the rail to the active page | 25.12 to 25.62 | As v3; then a 1.0 s hold in the comma pause. |
| The accordion moving into the page's sidebar slot while the page rises around it | 26.63 to 27.13 | Re-staged as the first half of the pull back: the page re-forms around the accordion as it re-enters frame. |
| The page shrinking into its grid slot | 26.63 to 27.93 | The same camera move, landing in General Translation's slot. |
| The wall of docs pages carrying the old surfaces in miniature | rises 26.9 to 27.7; held to 29.33 | 6 by 4 at 240 by 150, rising outward from General Translation's slot as the frame widens. |
| The docs panel: hairline frame from its top-left cross, the right edge, the corner crosses, the panel closing over the smoke cell by cell | 27.40 to 28.00 | Around the wall (x 136 to 1784, y 322 to 1048). |
| The one lit page with its white outline | lit through the pull back; outline 27.93 to 28.33; held to 29.33 | General Translation's page keeps its lit inks all the way down; 3 px outline. |
| The bridge's opening: growth out of the slot, other pages leaving outward, the outline and hairlines running back, the panel opening | 29.33 to 30.33 | It continues into the writing instead of cutting. |
| The writing printed from GEM7: eleven lines in reading order, the rule, the smoke's light along the words | prints 30.03 to 30.93; held to 32.63 | Reached by the fly-in, with open margins of 300 px or more. |
| The white thumb sliding down the writing's rail | 30.93 to 31.63, arriving on "it" | Heavier rail (9/3). |
| The glyph planet lighting from the crown down as the smoke leaves its disc | 33.00 to 33.55; turning to 37.44 | Under the translated page, during the pull-out. |
| The planet's script step | "same" 34.62 to 35.22 | Together with the page's ink change, as one translation gesture. |
| The page above the planet, its ink changing in place, E5's three dashed guides | page 33.58 to 36.84; guides "and alignment" 35.44 to 35.84, held 1.0 s | Now the film's own page, pulled out from the writing, at k 0.56. 2 px guides. |
| The path page in one muted ink | 37.64 to 41.70 | Reached by the page moving into the page box. |
| The reader's path through A4's five stops, constant speed, white seats | "Each" 37.64 to "action" 39.50 | Heavier line, 16 px seats. |
| The action mixing to white | "action" 39.50 | Accent, 0.3 s. |
| The white pulse running the path into the action | 39.80 to 40.60 | 160 px, then a 1.1 s hold. |
| The closing mirror: shrink back, readers back, path into a human, last frame repeating the first | 41.70 to 46.50 | The threads redraw out of the page as at frame 0; 2.0 s still hold. |
| The moving type | 7.55 to 8.35 | Once, heading 1 into heading 2. v3's second moving type (at the cut to the diagram) merges into it, since that cut and its headings are gone. |
| The field's heading calm changing by tone around the moving type | 7.35 to 8.35 | From heading 1's calm to heading 2's. |
| The shared end card | 46.50 to 50.50 | As built. |
| The v3 headings (seven round 7d post phrases and three runs) | | Retired by Kevin's newest note. They are replaced by five headings in the narrator's words. |

## 9. Sound

- **Takes.** No new takes. Nothing in this film is mis-said: v3's `el.mjs hear` read 99 words for 99, in order. Vercel and shadcn are not spoken in this film.
- **The bed.** Use the film's own tool, `audio/make-bed.py`, on the same round 5 generation. At the new card (46.5) one six-bar jump is no longer enough (it would start the film before the source's first sample), so the tool takes a jump count. It uses the smallest count that starts the film at or past the generation's swell (source 2.0 s): here two jumps of 48 eighths (18.007 s) each, both leaving from source 22.373 and returning to 4.366. Film 0 is source 13.863. The joins fall at film 8.510 (inside line 3, under "Translation") and 26.517 (inside line 6, between "rare" and "among"). Both are 0.75 s equal-power crossfades pinned on the pads' correlation as now. The generation's own resolution (24.35) lands on the card's cut at 46.50 and rings out under the silent card. Run it with `--report` and record both joins' pad correlations.
- **The mix (`audio/mix.py`).** It places the same ten masters on the new `O` and keeps the voice-shaped dip (300 to 800 Hz) and about -29 LUFS under speech.
  - **Gaps.** The longer gaps now let the music fill them. Raise `GAP_MIN` to 0.9 s, so that gaps 2 to 9 (1.00 to 1.50 s) lift and gap 1 (0.80 s) stays down. The lift rises over 0.35 s from 0.10 s after the last word, to about -24 LUFS short-term, and falls over 0.30 s to the ducked level before the next first word. Listen to every gap for pumping.
  - **Lead.** The bed starts at its alone level (`FADE_IN` 0.25 s) and ducks under "Most" at 1.00.
  - **Close.** After 45.42 it rises over 0.8 s into its resolution on the card and fades over the card's last 0.8 s.
- **Targets.** -16 LUFS integrated within 0.5, and true peak at or below -1.0 dBTP, held by the masters' lookahead limiter. AAC in the MP4, with audio 50.500 s, equal to the video. Measure with `ffmpeg -i out.mp4 -af ebur128=peak=true -f null -`.

## 10. Build notes

- **Before changing anything.**
  - Archive the v3 composition (`index.html`, `lib/`, `STORYBOARD.md`) into `archive-v3/` inside the film.
  - Copy `out/blog-designing-docs.mp4` (md5 60658809c0d09d461a98cd212f3f99e4) and `out/blog-designing-docs.png` to `out/v10/`.
  - Stay in this film folder and its own files in `out/`, and run no state-changing git commands.
- **What changes in the code** (`index.html`, `lib/film.js`):
  - **Cue tables.** `O`, `WD` and `B` as in section 2. `HT` becomes a per-word heading schedule.
  - **Headings.** Five headings, each word a span, timed from the takes' word starts. `#h1`'s first word gets the accent. `buildMT` runs once, heading 1 into heading 2's first line, and heading calms are rebuilt for the new grid.
  - **Opening and iso.** The opening rect, `OPEN` and `CAM.c0` / `k0`; `kIso` and `cIso` (with `camera(land)` still the identity); the page model's six-row contents rail and 44-unit mark; the reader grid geometry and pulse speed.
  - **Pile and deletion.** A wave index on every clutter piece (`clutter()` keeps every piece and kind), and the redline sweep.
  - **One flat camera** for the push, pull back, fly-in, pull-out, move into the page box and shrink back, with the `mini()` hand-over and the furniture tone-out.
  - **Line 6.** The diagram's old surfaces, connectors and their timings; the wall `TH2` (6 by 4) and its rise order.
  - **Line 7 to 9.** The writing view's geometry; `SMALL` at k 0.56 and the guides; the path's timings.
  - **The close.** The threads' redraw in the closing; the card at 46.5; `data-duration` 50.5 and every clip window.
  - **Envelopes** mixed by tone along every move.
- **Heading clearance.** Run the lab tool that measures the nearest drawn pixel to a visible heading's line boxes (`clear.mjs` in the v3 lab) on every frame a heading is up: 28 px or more. Pay most attention to the iso stack under heading 2, and to the wall's panel and the diagram's top connector under heading 3.
- **Check and render.**
  - `npx -y hyperframes@0.8.106 check .` ends with "Check passed" and 0 errors.
  - Render with `npx -y hyperframes@0.8.106 render . --quality delivery --fps 60 --workers 3`; the log must have no Google Fonts line.
  - Deliver `out/blog-designing-docs.mp4` (faststart) and its poster `out/blog-designing-docs.png` (the last frame).
  - Make the contact sheet with `kit/contact-sheet.sh out/blog-designing-docs.mp4 out/sheets/blog-designing-docs`.
  - Renders under heavy load have dropped raster on runs of frames, so compare the final frame by frame against a second render, or read every second of it.
- **Frames to read.**
  - Every heading word's entrance, and each heading at its floor end and its exit.
  - The start, middle and end of every bridge in section 5.
  - Each hold in section 6.
  - The legibility details in section 7, at 1920 by 1080 and at 25 percent.
- **Records.** NOTES.md gets a dated "2026-10-06, v4 flow and headings" entry, and STORYBOARD.md is rewritten from this design.
