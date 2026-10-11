# Designing docs for humans: the script, version 2 (the build spec)

The trailer for "Designing docs for humans" (Kevin Liu and Taylor Fang, General Translation blog, September 17, 2026). It replaces the round 7d words and pictures. Kevin, 2026-10-05: "a little too slow paced. the video isn't very interesting and the script is just kind of weird ... we love the diagrams and visuals though". Kevin, 2026-10-06: "I requested new scripts and visuals for these two." SCRIPT.md stays as the record of round 7d.

**Story, in one sentence:** Agents are the majority of docs readers, yet General Translation redesigned its docs for humans, deleting a lot of extra lines, links and buttons and making the sidebar one accordion, because humans still look at docs sites to understand and evaluate a product.

## How this script was chosen

Three writers each wrote a script. Each was scored out of 10 on six counts, after its excerpts were checked against the post character for character and its pictures against the post's images.

| script | interesting | clear | pace | faithful | rules | visuals | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A, the reveal (agents are the majority; humans still look) | 8 | 8 | 9 | 7 | 8 | 8 | 48 |
| B, the problem first (clutter, tangled path, clean path) | 7 | 6 | 8 | 7 | 6 | 8 | 42 |
| C, the one page (one Introduction page through every change) | 7 | 8 | 7 | 8 | 9 | 8 | 47 |

A wins. Its first line raises a question that its last line answers, and its last picture returns to its first. C's story is as clear, but its second line answers the hook at 3 s, so its ending has nothing left to resolve. B covers eight ideas in eight lines, and four of its headings say something other than the voice.

What was fixed in A:
- Line 4 was the post's "So our first job is to cut mental clutter." Clara speaking "our" right after an attribution reads as her own job. It is now "Their first job was to cut mental clutter."
- Line 6 was "Their sidebar is now one accordion." It is now "The sidebar is now one singular accordion." The change restores the post's words and avoids a third line in a row starting with "They" or "Their".
- A's sidebar shot showed a flat list of links regrouping under headings. The old sidebar already had group headings (the post's C4). That shot is replaced with the round 7 accordion diagram Kevin liked.
- A piled toasts, badges, eyebrows and banners on General Translation's page. The post says only that the page had "a lot of extra lines, links, and buttons", so the pile now uses those three kinds and nothing else.
- A lifted the plates sidebar +110, rail +170, header +250. Round 7d's draft 3 found that the rail lifted in front covers the cards, so the plates keep the proven order: rail +110, sidebar +210, header +330.
- A's line 6 heading held 1.67 s, under its 2.0 s reading floor. It now holds 2.0 s.
- A started the reading path at the GT mark. The post's A4 puts "orient" at the section switcher, so the path starts there.

Grafts from the other scripts:
- From B: as each connector reaches the accordion, its old surface tones out, so the navigation is seen to move into the accordion. Also from B: the reading path's stops are the post's A4 path (orient, navigate, read, choose, act).
- From C: the line 5 heading's words light one by one as the elements they name are deleted. Also from C: the header closes into one row of five controls (B2, B5).

## Length and pace

| | |
| --- | --- |
| Length | 31.5 s: 27.5 s of story and the 4.0 s shared end card. The current cut runs 42.5 s. |
| Words | 71 in 7 lines. 52 of them are verbatim runs of the post (line 1, line 3's quote, line 4's "first job" and "to cut mental clutter", line 5's list, line 6's "sidebar is now one singular accordion", line 7). |
| Speech | About 23.5 s, from 0.30 to 25.61. Gaps between lines are 0.30 s. |
| Pace basis | Clara's current seven takes hold 136 syllables in 29.86 s of speech, 4.55 syllables a second with commas included. Comma pauses run 0.44 to 0.56 s. The estimates below use that rate. Lines 3 (the quote), 6 and 7 are timed from her takes of the same words: vo-7 3.50 s, vo-6 2.70 s and vo-3 3.96 s. |
| Picture | Something changes on a spoken word at least every 2.2 s. |
| Headings | Each heading is the words Clara is saying at that moment, and each holds at least (words / 3) + 1 s after it has arrived. |

## The voice

- Clara, from `kit/audio/voice.json` (eleven_multilingual_v2, stability 0.65, style 0.2, speed 1.0). Never use speed below 1.0, and never time-stretch a take.
- Generate seven new takes, one per line, with `node kit/audio/el.mjs line`. Pass `--prev` and `--next` with the neighbouring lines so the reads flow. Use one take per line, and redo a line only if the take is wrong. Before generating, move the current takes (`vo-1` to `vo-7`: `.mp3`, `.json`, `.stt.json`, `.master.wav`) to `audio/archive-r7d2/`.
- Line 1 is a plain statement with a falling close. Give it no lift and no question shape.
- Line 2: "General Translation" is the company name, with both words at full weight. "anyway" is EN-ee-way, falling. It is the turn, so do not shrug it.
- Line 3 is a quote and then its attribution. Read the quote in the authors' voice and leave a 0.3 s breath before "write". Read "write Kevin Liu and Taylor Fang" a little lower and quicker, as an attribution. "Liu" is one syllable, LYOO. "Taylor Fang" is TAY-lor FANG.
- Line 4: "mental clutter" with even weight and a falling stop.
- Line 5 is a list read with even weight on "lines", "links" and "buttons". The two list pauses are short (about 0.2 s), and the line falls on "buttons".
- Line 6: put a light stress on "one". "accordion" is uh-KOR-dee-un.
- Line 7 ends the film, so give it a falling close on "product". It already exists as vo-3, which was read as a mid-film line. Regenerate it with `--prev` set to line 6 and no `--next`.
- "docs" is one syllable, rhyming with "locks", and never "documents".

## The lines

Times are planned estimates. The real word times from the new takes replace them (see "If the takes run long or short"). " / " in a heading marks its line break.

| n | start | end | spoken | kind | exact source in the post | heading |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0.30 | 2.75 | Agents are the majority of docs readers. | excerpt (a clause of the sentence, capital A, full stop) | "But in a world where agents are the majority of docs readers, as well as docs creators, should you still design your docs site?" | Agents are the majority / of docs readers |
| 2 | 3.05 | 6.45 | General Translation redesigned its docs for humans anyway. | connecting | "We approached our docs redesign from scratch, starting with the parallel user journeys we explored in our content rewrite." and the post's title, "Designing docs for humans" | Docs for humans |
| 3 | 6.75 | 12.15 | "We work hard on our writing, and we want people to read it," write Kevin Liu and Taylor Fang. | excerpt (a whole sentence, quoted and attributed) | "We work hard on our writing, and we want people to read it." The authors are the post's byline. | “We want people / to read it” |
| 4 | 12.45 | 14.85 | Their first job was to cut mental clutter. | connecting (adapted) | "So our first job is to cut mental clutter." | Cut mental clutter |
| 5 | 15.15 | 18.35 | They deleted a lot of extra lines, links, and buttons. | connecting, with a verbatim run | "This means deleting extraneous elements; in our case, a lot of extra lines, links, and buttons." | Lines, links, and buttons |
| 6 | 18.65 | 21.35 | The sidebar is now one singular accordion. | connecting (adapted: "Our" becomes "The") | "Our sidebar is now one singular accordion." | One singular / accordion |
| 7 | 21.65 | 25.61 | Humans still look at docs sites to understand and evaluate a product. | excerpt (a whole sentence) | "Humans still look at docs sites to understand and evaluate a product." | Humans still look / at docs sites |

Only line 3's heading carries quotation marks, because only line 3 is spoken as a quote.

### Planned word times (the cues)

| line | first word | the words the picture keys on |
| --- | --- | --- |
| 1 | Agents 0.30 | majority 0.88, readers 2.05 |
| 2 | General 3.05 | redesigned 4.02, docs 4.72, humans 5.16, anyway 5.75 |
| 3 | We 6.75 | writing 7.77, we want 8.85, read 9.95, it 10.15, write 10.55, Fang 11.85 |
| 4 | Their 12.45 | cut 13.67, clutter 14.43 |
| 5 | They 15.15 | deleted 15.28, lines 16.48, links 17.02, buttons 17.85 |
| 6 | The 18.65 | sidebar 18.91, one 19.87, singular 20.31, accordion 20.77 |
| 7 | Humans 21.65 | look 22.39, docs 22.73, sites 23.09, understand 23.61, evaluate 24.39, product 25.19 |

In `index.html` this becomes `O = [0, 0.30, 3.05, 6.75, 12.45, 15.15, 18.65, 21.65]`, with `WD` holding the key words. The scene clock `B` is: shot A from 0, the iso rise on "humans", the flatten on "write", shot D on line 4's first word, shot E on line 5's first word, the cut to shot F on "sidebar", shot G on "Humans", `card: 27.5` and `end: 31.5`. The root's `data-duration` is 31.5.

## The pictures, line by line

These rules hold for the whole film:
- The ground is `#071124`. The palette is `#2f5ce0`, `#86a8ff`, white and the blue gem smoke.
- The smoke is printed through the 8 by 8 Bayer screen at 3 px cells as one field behind every scene, on one clock that never cuts. Each shot shapes it with an envelope of tone, clearing it around the type and the objects.
- Headings are Inter 500 through `var(--font)`, tracking -0.035 em, x 160, top 146, two lines at most, ending by x 1662. Each rises 26 px with opacity (expo.out, 0.6 s, 80 ms line stagger) and drops out 18 px up with opacity (power2.in, 0.2 s).
- Connectors are the doubled line (gauge 7, core 3). A thumb or pulse is a white sub-path rewritten each frame.
- There is no frame overlay, and no captions, bylines, labels or numbers. The only URL is the end card's.

### Shot A, the readers (0.0 to 5.16). Line 1 and the start of line 2.

- **At frame 0:** the old Introduction page is in place as a `#2f5ce0` wireframe at x 160 to 900, y 470 to 933 (page scale 0.514). It is the current page model with the GT mark as its logo, and with the old page's four extras from the post's B1 drawn in `#86a8ff`: the "Star on GitHub" banner under the sidebar header, the sidebar toggle, the search field in the header and the header rule.
- **The readers:** at the right is a grid of 28 reader nodes, 4 columns at x 1580, 1630, 1680 and 1730, and 7 rows from y 500 to 908, 68 px apart. 24 are agents, drawn as the Heroicons solid `cpu-chip` at 30 px in `#86a8ff`. 4 are humans, drawn as the Heroicons solid `user` at 30 px in white: row 1 column 4, row 3 column 2, row 5 column 3 and row 7 column 1.
- **The threads:** seven row threads leave the page's right edge at their rows' heights and run to the grid. Each node hangs on a short 45 degree stub from its row thread. Row threads and agent stubs are `#2f5ce0`, and human stubs are `#86a8ff`.
- **0.0 to 0.6:** the threads draw out of the page's right edge (expo.out, 30 ms stagger, top to bottom), and each node rises by tone as its stub arrives. White pulses run from the page to the agent nodes at about 900 px a second on seeded phases (`GTDither.rng`). The human stubs carry no pulses.
- **0.20:** heading 1 rises (112 px) and is readable by "majority".
- **"majority" (0.88):** the agent pulses double in number. They then keep running at that rate through "readers".
- **"General" (3.05):** the page's GT mark and its name bar mix to white (0.3 s, Bayer order).
- **"redesigned" (4.02):** the agent stubs, their nodes and their pulses leave by tone, from the node ends back toward the page (0.5 s). The four humans and their `#86a8ff` stubs stay.
- **4.35 to 4.55:** heading 1 drops out.
- **4.62:** heading 2, "Docs for humans" (150 px, one line), rises and lands on "humans".

### Shot B, the isometric view (5.16 to 6.75). The end of line 2.

- **"humans" (5.16):** the human stubs, the row threads and the human nodes tone out (0.3 s). At the same moment the camera move starts from rest. This is round 7d's bridge machinery (`camera()`, `matrixOf`, `PLATES`), re-keyed: one monotone progress curve with zero speed at both ends drives the turn, the squash, the separation, the scale and the position.
- **The move:** the page travels from shot A's place toward the lower right of the frame, leaving the heading clear ground. It swings into the 30 degree axonometric map (a 45 degree turn, a tan 30 squash, a sqrt 1.5 scale) at about scale 0.56, and comes apart into plates. These are 34 px navy slabs with dithered `#2f5ce0` side faces lit from the upper left, `#86a8ff` rims and dashed drop lines. The content stays on the page plane. The contents rail lifts to +110, the sidebar to +210 and the header to +330. The four extras lift highest, to +450, as small slabs of their own, each with drop lines to where it sat.
- **6.60:** the iso view is reached, in the gap after "anyway".

### Shot C, the writing under the extras (6.75 to 12.45). Line 3.

- **6.60 to 10.55:** the iso view holds with a slow drift (scale +3 percent).
- **"writing" (7.77):** the content plate's writing (the title, summary, paragraph, section heading and card names) prints white in reading order (0.25 s a line, 80 ms apart, by tone). The extras still hang above it.
- **8.55 to 8.75:** heading 2 drops out.
- **8.80:** heading 3, "“We want people / to read it”" (130 px), rises on "we want".
- **"read" (9.95):** a white thumb runs down the contents-rail plate to its second row (0.5 s, power2.inOut).
- **"write" (10.55):** the camera move resumes on the same curve. The plates come down in order (header, sidebar, rail), and the extras come down last onto their places. As the extras land, the writing returns to `#2f5ce0` by tone. The page lays flat into the page box (x 560 to 1855, y 455 to the frame foot) and lands with zero speed at 12.40. Because the matrix is the identity there, the landing is the flat page of shot D pixel for pixel.
- **The authors' names are spoken only.** They never appear on screen.

### Shot D, the pile (12.45 to 15.15). Line 4.

- **From "Their" (12.45):** the round 7 clutter pile lands on the flat page, in a seeded order that accelerates to the end. Each piece rises in tone over 0.2 s. The pile uses only the three kinds the post names, and every piece is tagged with its kind for shot E:
  - lines: extra rules, extra hairlines, and boxes drawn inside boxes;
  - links: link rows, breadcrumbs, a tab bar, a second section nav and link chips;
  - buttons: rows of extra square buttons and a floating button.
- **The spill:** pieces push past the page into the left margin, staying 28 px clear of the heading.
- **"clutter" (14.43):** the last piece lands. The page holds fully buried to 15.15.
- **13.15 to 13.35:** heading 3 drops out.
- **13.40:** heading 4, "Cut mental clutter" (140 px, one line), rises and is readable on "cut" (13.67).

### Shot E, the deletion (15.15 to 18.91). Line 5.

- **"deleted" (15.28):** a 1 px white hairline box draws around every piece of the pile and each of the four extras. Each box draws out of its own top-left corner (0.3 s, power3.out), on a seeded stagger inside 0.4 s. This is the post's redline pass (B1), in white because red is not in the film's palette.
- **15.95 to 16.55:** heading 4 dissolves into its 3 px cells and reassembles as heading 5, "Lines, links, and buttons", by moving type (allowed transition d). It is 112 px on one line, or two lines broken after "links," if one line would pass x 1662. It sets in `#86a8ff`, and each word turns white as its kind is deleted.
- **"lines" (16.48):** every line piece and the header rule tone out with their boxes (0.35 s). "Lines" turns white.
- **"links" (17.02):** every link piece tones out. The "Star on GitHub" banner shrinks into the star pill in the header row (0.4 s, power2.inOut), as the post's B5 shows. "links" turns white.
- **"buttons" (17.85):** every button piece tones out. The sidebar toggle tones out to nothing. The search field shrinks into the search icon (0.4 s, power2.inOut). The header closes into one row of five controls (search icon, theme toggle, star pill, Sign In, Get a Demo; power3.out, 0.4 s), as in B2 and B5. "and buttons" turns white.
- **18.35:** the clean page stands. It is the current page model, `page()`. It holds until the cut.

### Shot F, one singular accordion (18.91 to 21.65). Line 6.

- **"sidebar" (18.91):** hard cut to round 7's accordion diagram, retimed. Low on the left in `#2f5ce0` are a tab bar, a row of sub-tabs and a second vertical section nav. These are the "multiple section navigation bars in multiple places, both vertically and horizontally" the post says docs sites often show. On the right is the clean page's own sidebar drawn at about 2 times: the section switcher, the group headings, the rows and the footer links. It is drawn at that scale so it can move back into the page in shot G.
- **18.90 to 19.55:** heading 5 dissolves and reassembles as heading 6, "One singular / accordion" (130 px), by moving type. The picture cut sits under it.
- **18.95, 19.05 and 19.15:** three doubled-line connectors on navy casings draw out of the old surfaces toward the accordion (0.75 s each, power3.out). As each one arrives, its group's rows rise in tone, its white cross lands and its old surface tones out. The last arrives on "one" (19.87).
- **"singular" (20.31):** the rail draws down the rows and bends inward on 45 degree runs where the tree nests (0.45 s, power3.out).
- **20.30 to 20.77:** the faint white thumb slides down the rail to the active page and arrives on "accordion".

### Shot G, the human reader (21.65 to 27.5). Line 7 and the close.

- **"Humans" (21.65):** the accordion moves and scales from the diagram into the clean page's sidebar slot in the page box (0.7 s, power2.inOut, zero speed at both ends; a move on the picture, never on type). From 21.85 to 22.35 the rest of the clean page rises in tone around it, and the field's envelope follows by tone.
- **21.60 to 21.80:** heading 6 drops out.
- **21.85:** heading 7, "Humans still look / at docs sites" (120 px), rises. It is readable on "look", and its wording mirrors heading 1.
- **"look" (22.39):** one reader's path draws as the doubled line in `#86a8ff` from the section switcher (orient), at one constant speed (ease none, about 810 px a second). It passes the active sidebar row (navigate), the title (read) and the first quickstart card (choose), then climbs to the Get a Demo action (act). A white seat lands at each stop as the path passes it. These are the five stops of the post's A4. The speed is set so the path reaches the action on "evaluate" (24.39), and the other stops land where the constant speed puts them. On "evaluate" the action mixes to white (0.3 s).
- **"product" (25.19):** the page shrinks back to shot A's place (x 160 to 900, y 470 to 933; 0.9 s, power2.inOut). The heading does not move.
- **25.70 to 26.30:** the seven row threads, the stubs and the 28 nodes return by tone, and the agent pulses run again.
- **26.10 to 26.95:** the reader's path continues at the same speed from the action, out of the page's right edge and along row 1's thread, into row 1's white human node.
- **26.95 to 27.5:** hold. The closing frame repeats the first. It is the same page among the same readers, with the page now clean and one human path lit through it.
- **27.5:** hard cut to the end card.

## The end card

The shared series card from `kit/endcard/`, used as built, from 27.5 to 31.5 s:

```js
addEndCard(tl, { palette: 'blue', title: ['Designing docs', 'for humans'], url: 'generaltranslation.com/blog/designing-docs-for-humans', start: 27.5 });
```

It shows the GT mark filled with the blue gem smoke, the title in two lines and the post's link, the only URL in the film. It is silent. The film's last frame is the poster.

## Visual changes the build must make

Against the current composition (`index.html`, `lib/film.js`, round 7d revised, frame removed).

Kept, changed only as stated:
1. **The background field** (`FIELD`, its one clock, `ENV` envelopes by tone). The envelopes are rebuilt for the new shots: shot A's page, node grid and heading; the iso stack; the page box with the spill's calm; the diagram's `S6CALM`; and shot G's page box shrinking back to shot A's rect, mixed by tone along the move. The scene times have moved on the gem clock, so re-measure each shot's open-ground lit share (12 to 30 percent, as NOTES.md records) and re-choose `g0` if a shot falls outside it.
2. **The isometric camera** (`camera()`, `matrixOf`, `hermite`, `PLATES`, the rims, faces and drop lines). It is re-keyed in `BR`, `CAM` and `UK` so that it starts from shot A's page rect, rises on "humans", holds through the quote and flattens on "write" into the page box. Keep `camera(landing)` equal to the identity so the hand-over stays pixel-exact. The plate heights stay rail 110, sidebar 210, header 330. One layer is added (item 12).
3. **The page model** (`page()`, `place()`) is the clean page. The old page is this model plus the old header and the extras (item 11).
4. **The clutter pile's landing** (`clutter()`, `drawClutter`). Remove every piece that is not a line, a link or a button: the eyebrow pills, badges, toasts, the callout, the outline icons, the floating widget's card, the footer banner and the toast over the action. Tag each remaining piece `kind: 'line' | 'link' | 'button'`. Remove the 12 late spill pieces.
5. **The moving type** (`headingCells`, `buildMT`, `drawMT`) now runs twice: 15.95 (heading 4 to 5) and 18.90 (heading 5 to 6).
6. **Scene 6's accordion diagram** (`drawS6`, `S6CALM`). It is retimed to line 6. Each old surface tones out as its connector arrives. The accordion is drawn from the clean page's sidebar elements at about 2 times, so it can move into the page.
7. **Scene 3's reading path** (`len3`, `drawS3`). It is re-routed through A4's five stops, starting at the section switcher, and extended out of the page along row 1's thread into a human node.
8. **The end card**, at 27.5.
9. **The palette, the 3 px cell grid, the doubled line and the heading style.**

New:
10. **The reader grid** (shot A, returning in shot G): 28 nodes, seven row threads, stubs and agent pulses. The icons are the Heroicons 2.2.0 solid `cpu-chip` and `user`. Copy their path data inline into `lib/film.js` from `node_modules/.pnpm/heroicons@2.2.0/node_modules/heroicons/24/solid/`, because the kit is read only, and credit Heroicons (MIT) in NOTES.md.
11. **The old page's extras** (from B1): the "Star on GitHub" banner, the sidebar toggle, the search field and the header rule. Also their replacements from B5: the star pill (an icon and a short bar, with no number), the search icon and the header row of five controls.
12. **The extras layer in the iso view**, at +450, with drop lines to each extra's place.
13. **The writing printed white on the iso content plate** on "writing", and the rail thumb on "read".
14. **The white redline boxes** on "deleted", the deletion of each kind on its own word, and the heading 5 words turning from `#86a8ff` to white.
15. **The accordion's move into the page** on "Humans".
16. **The closing mirror:** the page shrinks back to shot A's place, the reader grid returns, and the path lands in a human node.
17. **The seven headings listed in the lines table**, each the words being spoken.
18. **The cue table** `O`, `WD` and `B`, rewritten from the new takes' `.stt.json`. The root's `data-duration` is 31.5.

Removed:
19. **Scene 1, the glyph planet** (`drawS1` and its use of `globe`). Its line is gone.
20. **Scene 2, the grid of pages and the lit thumbnail** (`drawS2`, `mini`). The bridge no longer grows out of a thumbnail.
21. **Scene 7, the writing printed from its own gem smoke** (`drawS7`), with its own smoke setting. The writing now prints on the iso plate. The only gem mounts are the field and the end card.
22. **The 1.2 s silent lead and the 2.6 s silent bridge.**
23. **All seven round 7d headings.**

Before rendering, copy the current final (`out/blog-designing-docs.mp4` and `.png`) to `out/v9/`. `out/v8/` already holds the version with the frame. Then `npx -y hyperframes@0.8.106 check .` must pass with 0 errors, followed by the draft and delivery renders, the poster and the contact sheet, as MOTION.md lists.

## The sound plan

- **The bed:** the round 5 generation (`audio/bed.mp3`) through `audio/make-bed.py`, which needs no code change. It reads `B.card` 27.5 and `B.end` 31.5 from `index.html`. Film 0 is then source 14.857 s, the existing six-bar join falls at film 7.516 s (under line 3's "We work hard on our writing"), and the bed's own resolution begins on the end card's cut at 27.5. Run it with `--report` and confirm that the join's pad correlation is unchanged.
- **The mix:** `audio/mix.py` with its `LINES` pointed at the seven new takes. It reads `O` and `B` from `index.html` as now. Ducking stays as now, at about -28.5 LUFS under narration and -20 LUFS alone, with the voice-shaped dip keeping 400 to 800 Hz about 4 dB clear of her vowels.
- **The open:** Clara's first word comes at 0.30, so the bed opens at its ducked level. Shorten `FADE_IN` to 0.25 s so the bed is up before her first word.
- **The gaps:** every gap is 0.30 s, under `HOLD_GAP` (1.2 s), so the bed stays down from her first word to her last. Listen to the 0.30 s gaps. If the `GAP_LIFT` bump pumps, set it to 0 for gaps under 0.4 s. The comment about the bridge gap in `mix.py` no longer applies.
- **The close:** after the last word (25.61) the bed rises over `RAMP_OUT` (0.8 s) to its alone level under the closing move, resolves on the cut at 27.5 and fades over the last 0.8 s of the card.
- **Targets:** narration about -16 LUFS integrated, true peak under -1 dBTP, and AAC in the MP4, with the audio length equal to the video's 31.5 s. Measure with `ffmpeg -i out.mp4 -af ebur128=peak=true -f null -`.

## If the takes run long or short

- Every cue is keyed to a spoken word. The new `.stt.json` word times replace the planned times above, and the picture follows them. No silence is cut inside a line, and no take is stretched.
- Gaps stay at 0.30 s and may move inside 0.25 to 0.40 s to make a rule below hold.
- **The iso rise** needs at least 1.4 s from "humans" to line 3's first word. If it has less, start the rise on "docs".
- **The flatten** needs at least 1.8 s from "write" to line 4's first word. If the attribution is shorter, start the flatten at the end of the quote ("it"). If it is still short, widen the gap before line 4 to 0.40 s.
- **A heading that would change before its reading floor** changes on the next keyed word instead. The floor is never shortened.
- **Long takes:** if all seven takes run up to 6 s long in total, the film stays under 38 s, and no line is cut. If line 3 runs over 6.0 s, check the pause before "write". If it is over 0.4 s, retake the line once.
- **Short takes:** the shortfall goes into the closing hold (26.95 to the card), up to 0.5 s more. If the card would start before 26.0 s (a film under 30 s), lengthen the closing hold until it starts at 26.0.
- **The bed's join** sits at film `B.card - 19.984` s and must fall inside a spoken line. At the planned card time it is under line 3. Any card time from 26.0 to 32.0 keeps it inside line 2 or line 3.

## Audit

### Facts

| claim | where it is in the post |
| --- | --- |
| Agents are the majority of docs readers (line 1) | "But in a world where agents are the majority of docs readers, as well as docs creators, should you still design your docs site?" The post grants this as its premise and does not dispute it ("Yes, agents are mass executors of code"). |
| General Translation redesigned its docs (line 2) | "We approached our docs redesign from scratch". "for humans" is the post's title. |
| The quote and its authors (line 3) | "We work hard on our writing, and we want people to read it." Byline `authors: [kevin, taylor]`, named in MOTION.md as Kevin Liu and Taylor Fang. |
| Their first job was to cut mental clutter (line 4) | "So our first job is to cut mental clutter." |
| They deleted a lot of extra lines, links, and buttons (line 5) | "This means deleting extraneous elements; in our case, a lot of extra lines, links, and buttons." |
| The sidebar is now one singular accordion (line 6) | "Our sidebar is now one singular accordion." |
| Humans still look at docs sites to understand and evaluate a product (line 7) | The same sentence. |
| The old page's banner, toggle, search field and header rule (shots A to E) | B1: "the search field, the GitHub banner, the sidebar toggle, and the header rule". |
| Banner to star pill, search field to icon, toggle to nothing (shot E) | B5: "the search field to the ⌘K icon, the GitHub banner to the star pill, and the sidebar toggle to nothing". |
| The pile is lines, links and buttons only (shot D) | The post's own list for its page. |
| Many navigation bars feeding one accordion (shot F) | "we consolidated navigation surfaces", and docs sites "often show multiple section navigation bars in multiple places, both vertically and horizontally". The three source surfaces are that general pattern. They are not a census of General Translation's old page. |
| The path's five stops (shot G) | A4: "orient, navigate, read, choose, act". |
| 24 agents and 4 humans (shots A and G) | An illustration of "majority". The post gives no ratio, and no number appears on screen. |

Every quoted run was matched as an exact substring of the post, with bold and link markup removed. Each is found once.

### Writing rules

- Each of the seven lines is a complete declarative sentence.
- None uses a metaphor or an analogy. "Mental clutter" is the post's own term.
- None is a fragment, a rhetorical question or an exclamation. There are no em dashes, no signposts or labels, and no hype words.
- None uses "X, not Y" or "not X but Y".
- Line 5's "lines, links, and buttons" is a list of three. It is the post's content (what was deleted), and each item drives its own picture. It is not there for rhythm.
- First person appears only inside line 3's quote, which names its authors.
- Nothing is said twice. "humans" appears in line 2 (the post's title) and in line 7 (the reason).
- The headings are runs of the sentence being spoken, so the screen never shows a second sentence. Only line 3's heading has quotation marks.
- On screen there are no eyebrows, no monospace, no captions or bylines, no frame overlay and no URL except the end card's.
