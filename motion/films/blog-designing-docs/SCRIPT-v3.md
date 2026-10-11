# Designing docs for humans: the script, version 3 (the build spec)

The trailer for "Designing docs for humans" (Kevin Liu and Taylor Fang, General Translation blog, September 17, 2026). It replaces SCRIPT-v2.md, whose build was stopped. SCRIPT.md (round 7d, the current cut) and SCRIPT-v2.md stay unchanged as records.

Kevin, 2026-10-06, on the v2 scripts: "we need to convey the gravitas better earlier ... for both the new videos keep all the visual spectacle, i would hate to see removals. make the script not driven by quotes but tell its own story."

**Story, in one sentence:** Most docs readers are now AI agents, but humans still read docs to evaluate a product, so General Translation redesigned its docs from scratch around its writing: it deleted the clutter, made the sidebar one accordion, gave the writing open space, kept translated pages aligned and pointed each page at what its reader wants, and it still treats docs design as an open problem.

## How this script was chosen

Three writers each wrote a v3 script from a different angle. I built a spectacle inventory of the current cut first (frames of `out/blog-designing-docs.mp4` every 0.5 s, STORYBOARD.md, CONCEPT.md, SCRIPT.md, `index.html` and `lib/film.js`) and of SCRIPT-v2.md's shot list and its "Visual changes" (the v2 removals are reversed). I then checked every script against that inventory and every fact against the post. Each count is out of 10.

| script | gravitas early | own story | clear | pace | faithful | writing rules | spectacle kept | total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A, stakes first | 8 | 9 | 8 | 8 | 8 | 9 | 9 | 59 |
| B, the decisions | 7 | 8 | 6 | 8 | 6 | 8 | 8 | 51 |
| C, one page | 9 | 8 | 7 | 7 | 7 | 8 | 6 | 52 |

**A wins.** Its ten sentences are plain and complete and use no quotes. The stakes come first: agents and humans as docs readers by 5.8 s, then General Translation named at 6.1 s with its own reason for the redesign. Its last line returns to the post's first sentence while the picture returns to the first frame. It maps every inventory piece to a line and brings back all seven round 7d headings.

What A lost points for:
- It counted each heading's reading floor from the start of the heading's rise. The film's rule (STORYBOARD.md, NOTES.md round 7c) counts it from the heading's arrival, 0.6 s later. Counted that way, headings 1, 2, 7, 8 and 9 held short, and fixing them as A assigned them would have put the card at 38.5 s and the film past 42 s.
- Its card at 37.25 s is off the 0.5 s grid that `kit/endcard` requires.
- Line 7, "The pages leave a lot of white space around the writing.", has a vague subject.
- It left out four small current-cut moments: the docs panel closing over the smoke cell by cell with its right edge drawn down out of the top-right corner, the lit page's outline running back into its corner, the writing's rule drawing, and the field's heading calm changing by tone around the moving type.

B names General Translation only at 8.8 s, after a line about templates. Three of its lines claim more than the post says: "in every language", "leads each reader from the sidebar to a demo", and "Body text is lighter" (the post lowers the weight to 400; "lighter" can be heard as a colour). It drops round 7d's "Documentation is an / open problem in web design" heading.

C reaches "General Translation redesigned its docs from scratch" by 8.3 s, the strongest early weight of the three. Its line 9 ("General Translation builds a localization platform, so its translated docs keep their layout.") takes its fact from the text inside an image (E5's page), adds a causal "so" the post does not state, and runs 5.9 s. It drops six of the seven round 7d headings.

Grafts into A:
1. From C, line 1: "Most docs readers are now AI agents." It ends on the fact, keeps A's "AI" for a stranger, and is 0.6 s shorter than A's line 1.
2. From B and C, "from scratch" in line 3 ("General Translation redesigned its docs from scratch so people would read its writing."). It is the post's own phrase and gives the redesign its weight inside the first 9 s.
3. From C, line 7: "The writing now has more open space around it.", with the heading "More open space". Round 7d's "A simpler reading experience / focused on content" moves to line 3, where it states what the redesign was for. This also fixes the reading floors: the last four headings now fit before the card at 37.5 s.
4. From C, the small clean page standing above the glyph planet in line 8: its text changes ink in place and the post's E5 dashed guides draw across it, so the translated pages are seen to keep their alignment.
5. From C, the field's heading calm changing by tone around the first moving type (a current-cut piece A left out).
6. From B, the twelve late spill pieces at one every 0.07 s, so they land before the redline; the band lifting the toast off the action; and the diagram's switcher box toning in only after the moving type's cells have left its ground.
7. The current-cut details A left out are restored (listed above), with the plate rims turning from `#86a8ff` to `#2f5ce0` as the page flattens.

Fixes to A:
- Every heading holds (words / 3) + 1 s after it has arrived (0.6 s after it starts to rise).
- The card is at 37.5 s, on the 0.5 s grid. The film is 41.5 s.
- In line 6 the thumb starts when the rail has finished drawing, the accordion moves into the page during the comma pause, and the page shrinks into the wall of pages on "rare".
- The GT mark and the name bar stay white from line 3 to the end, so General Translation's page is the lit one in every shot.

## Length and pace

| | |
| --- | --- |
| Length | 41.5 s: 37.5 s of story and the 4.0 s shared end card. The current cut runs 42.5 s. |
| Words | 99 in 10 lines, about 151 syllables. No quotes. |
| Speech | About 33.5 s, from 0.30 to 36.73. The gaps are 0.30 s, except 0.40 s before lines 5 and 6 so that "sidebar" falls after heading 5's reading floor. There is no silent lead and no silent bridge. |
| Pace basis | (Written for Clara before the narrator changed to Frederick Surrey; his takes are placed by their own times, see "The voice".) Clara's seven round 7d takes hold 137 syllables in 29.86 s of speech: 4.59 syllables a second with pauses and about 5.0 without. Her comma pauses run 0.44 to 0.56 s. Word times below come from her takes of matching words: vo-3 for line 2, vo-4 for "Interfaces", vo-6 for "The sidebar is now one", and the stopped v2 takes (`audio/archive-v2-stopped`) only to check the list pauses in line 5 (0.42 and 0.24 s) and "General Translation redesigned its docs" (2.32 s). |
| Picture | Something changes on a spoken word at least every 1.8 s. The longest hold is the closing frame, 35.76 to 37.5, with the agent pulses running. |
| Headings | Ten headings: all seven round 7d headings, and three that are runs of the post or of the spoken line. Each rises 26 px with opacity (expo.out, 0.6 s, 80 ms line stagger), drops out 18 px up (power2.in, 0.2 s), and holds at least (words / 3) + 1 s after it has arrived. |

## The voice

- Frederick Surrey, from `kit/audio/voice.json` (voice j9jfwdrw7BRfcR43Qohk, eleven_multilingual_v2, stability 0.55, style 0.2, speed 1.0). Kevin, 2026-10-06: "remember, we're using Frederick Surrey". Do not set `EL_VOICE_FILE` and do not pass `--voice`; check that every take's `.json` "voice" starts with "Frederick Surrey". Never use a speed below 1.0, and never time-stretch a take.
- The times in this script were estimated at Clara's pace (her round 7d takes) before the narrator changed. Frederick's takes are placed by their own word times: the cue table in `index.html` is rebuilt from his `.stt.json`, and the gaps and holds absorb the difference (NOTES.md, "v3 build", has the measured times).
- Generate ten takes, one per line, with `node kit/audio/el.mjs line`, passing `--prev` and `--next` with the neighbouring lines so the reads flow. Use one take per line, and redo a line only if the take is wrong. The round 7d takes `vo-1` to `vo-7` are in `audio/archive-r7d2/` and `audio/archive-v3-frederick/`. The stopped v2 takes stay in `audio/archive-v2-stopped/`, and the stopped v3 build's Clara takes in `archive-v3-stopped/audio/`; none of them is reused.
- **Vercel and shadcn are not spoken in this film.** The series pronunciations, for any line that names them: Vercel is VER-sel, with the "ver" of "version" and the "cel" of "acceleration"; if a take misreads it, use "Ver-sell" in the voice text. shadcn is "shad" as in "shaddy", then the letters C N (shad-see-en); a test take of Frederick read plain "shadcn" as "Shadikn", so send "shad C N U I" for shadcn/ui from the first take. The screen always keeps the real names.
- "AI" is two letters, ay-eye. If a take runs them into one syllable, write "A.I." in the voice text only.
- "docs" is one syllable that rhymes with "locks", never "documents". In line 6, listen to "docs sites": if the two s sounds merge into "doc sites", retake once with "dox sites" in the voice text (the stopped v2 take used that respelling; the transcriber still heard "doc sites", so judge by ear).
- "General Translation" is the company name, both words at full weight.
- Line 1 is a plain statement with a falling close on "agents". The weight is on "AI agents".
- "Interfaces" is IN-ter-fay-siz. Line 4 has a comma pause of about 0.45 s before "which".
- Line 5 is a list with even weight on "lines", "links" and "buttons", short list pauses (about 0.2 to 0.4 s), and a fall on "buttons".
- "accordion" is uh-KOR-dee-un, with a light stress on "one".
- "alignment" is uh-LINE-ment.
- Line 10 ends the film. Give it a falling close, and generate it with `--prev` set to line 9 and no `--next`.

## The lines

Times are planned estimates. The real word times from the new takes replace them (see "If the takes run long or short"). " / " in a heading marks its line break.

| n | start | end | spoken | source in the post | heading | picture, on its words |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0.30 | 2.45 | Most docs readers are now AI agents. | "But in a world where agents are the majority of docs readers, as well as docs creators, should you still design your docs site?" "AI" is from the post's summary, "Why design still matters in the age of AI". | Agents are the majority / of docs readers | Old page and reader grid at frame 0; threads draw 0.0 to 0.6; agent pulses double on "agents" |
| 2 | 2.75 | 5.41 | Humans still read docs to evaluate a product. | "Humans still look at docs sites to understand and evaluate a product." and "humans still look at and read docs". | Human readability / and visual design | Agents leave on "Humans"; human stubs whiten on "evaluate"; the isometric rise starts on "product" |
| 3 | 5.71 | 10.00 | General Translation redesigned its docs from scratch so people would read its writing. | "We approached our docs redesign from scratch" and "We work hard on our writing, and we want people to read it. The continuous goal is to design and maintain a docs site that makes the reading experience smooth and even delightful." | A simpler reading experience / focused on content | GT mark whitens on "General"; extras lift on "redesigned"; rail thumb on "people" to "read"; writing prints white to "writing"; the flatten starts |
| 4 | 10.30 | 14.15 | Interfaces keep getting more cluttered, which creates mental clutter. | "Interfaces are increasingly cluttered." and "The consequence of this visual clutter is an accompanying mental clutter." | Telltale signs / of AI design | The page lands flat on "cluttered"; the pile lands to "clutter"; toast on the action; spill; twelve late pieces |
| 5 | 14.55 | 19.03 | The redesign started by deleting extra lines, links, and buttons. | "So our first job is to cut mental clutter. This means deleting extraneous elements; in our case, a lot of extra lines, links, and buttons." B1 and B5 for the four extras and their replacements. | A lot of extra lines, / links, and buttons | Redline boxes on "redesign"; moving type; the band on "deleting"; each kind goes on its word; the header closes on "buttons" |
| 6 | 19.43 | 23.48 | The sidebar is now one accordion, which is rare among docs sites. | "Our sidebar is now one singular accordion. It doesn't sound revolutionary, but has become a rarity in docs sites, which often show multiple section navigation bars in multiple places, both vertically and horizontally." | A rarity in / docs sites | Moving type and hard cut to the diagram on "sidebar"; connectors to "one"; rail on "one"; thumb on "accordion"; accordion into the page in the pause; wall of pages on "rare"; General Translation's page lit on "sites" |
| 7 | 23.78 | 26.23 | The writing now has more open space around it. | "We arranged these with less lines and more open space for a cleaner visual experience" and "We especially wanted to create a lot of white space to give the content breathing room". | More open space | Lit page grows out of the wall; hard cut on "writing" to the smoke-printed writing; thumb arrives on "it" |
| 8 | 26.53 | 29.48 | Translated pages keep the same spacing and alignment. | "And of course, our docs localization experience must be top-tier: preserving spacing, alignment, and order." E5: "The Introduction page in English and Chinese at the same scale, with dashed guides showing the shared alignment". | The same spacing | Hard cut to the glyph planet with a small clean page above it; scripts step on "same"; the page's text changes ink on "spacing"; dashed guides on "alignment" |
| 9 | 29.78 | 32.58 | Each page guides its reader toward the action they want. | "And the page supports an intuitive flow, funneling users towards what they want to achieve." A4: "orient, navigate, read, choose, act". "The docs highlight links to actions users might want to take, like ... getting a demo of the product." | Guide their attention / to what’s important | Hard cut to the clean page; the path runs from "Each" to Get a Demo on "action"; the pulse runs the path |
| 10 | 32.88 | 36.73 | Docs design is an open problem, and the team keeps working on it. | "Documentation is an open problem in web design." and "We're of course continuously working to improve our docs design and welcome any feedback." | Documentation is an / open problem in web design | The page shrinks back on "Docs"; the readers return; the path runs on into a person; human stubs whiten on "team" |

The headings: "Agents are the majority / of docs readers" is a run of the post's sentence. "More open space" and "The same spacing" are runs of their spoken lines and of the post. The seven round 7d headings are runs of the post: "Why should you even put effort into human readability and visual design?", the bold "a simpler reading experience focused on content", "...are telltale signs of AI design.", "...a lot of extra lines, links, and buttons.", "...has become a rarity in docs sites", "...guide their attention to what's important." and "Documentation is an open problem in web design." The apostrophe in "what’s" is set as the typographic one.

### Planned word times (the cues)

| line | first word | the words the picture keys on |
| --- | --- | --- |
| 1 | Most 0.30 | docs 0.60, readers 0.98, now 1.52, AI 1.74, agents 2.08 |
| 2 | Humans 2.75 | still 3.21, read 3.49, docs 3.71, evaluate 4.19, product 4.99 |
| 3 | General 5.71 | Translation 6.07, redesigned 6.89, docs 7.71, from 8.10, scratch 8.25, people 8.85, read 9.30, writing 9.60 |
| 4 | Interfaces 10.30 | cluttered 11.68, which 12.65, mental 13.22, clutter 13.66 |
| 5 | The 14.55 | redesign 14.69, started 15.33, deleting 15.91, extra 16.53, lines 16.85, links 17.75, buttons 18.53 |
| 6 | The 19.43 | sidebar 19.59, one 20.53, accordion 20.83, which 21.83, rare 22.08, among 22.43, docs 22.78, sites 23.09 |
| 7 | The 23.78 | writing 23.86, now 24.28, more 24.72, open 24.96, space 25.34, around 25.78, it 26.12 |
| 8 | Translated 26.53 | pages 27.21, same 27.95, spacing 28.29, alignment 28.93 |
| 9 | Each 29.78 | guides 30.36, reader 30.90, toward 31.26, action 31.70, want 32.30 |
| 10 | Docs 32.88 | open 33.96, problem 34.34, team 35.46, working 36.06 |

In `index.html` this becomes `O = [0, 0.30, 2.75, 5.71, 10.30, 14.55, 19.43, 23.78, 26.53, 29.78, 32.88]`, with `WD` holding the key words. The scene clock `B` is: the camera's start on "product" (4.99), the iso view at 6.45, the flatten from 9.90, the landing and the pile at 11.75, the first moving type at 15.10, the second at 19.57 with the cut to the diagram on "sidebar" (19.59), the wall of pages on "rare" (22.08), the growth out of the wall at 23.49, the cut to the writing at 23.95, the cut to the planet at 26.48, the cut to the path page at 29.53, the shrink on "Docs" (32.88), `card: 37.5` and `end: 41.5`. The root's `data-duration` is 41.5.

### The heading clock

| heading | rises | arrives | floor ends | leaves |
| --- | --- | --- | --- | --- |
| 1 Agents are the majority / of docs readers (112 px) | 0.10 | 0.70 | 4.03 | 4.03 to 4.23 |
| 2 Human readability / and visual design (128 px) | 4.23 | 4.83 | 7.50 | 7.50 to 7.70 |
| 3 A simpler reading experience / focused on content (118 px) | 7.70 | 8.30 | 11.63 | 11.63 to 11.83 |
| 4 Telltale signs / of AI design (130 px) | 11.83 | 12.43 | 15.10 | moving type 15.10 to 15.90 |
| 5 A lot of extra lines, / links, and buttons (124 px) | moving type | 15.90 | 19.57 | moving type 19.57 to 20.37 |
| 6 A rarity in / docs sites (130 px) | moving type | 20.37 | 23.04 | 23.48 to 23.68 (held to the end of line 6) |
| 7 More open space (140 px, one line) | 23.68 | 24.28 | 26.28 | 26.28 to 26.48 |
| 8 The same spacing (128 px, one line) | 26.48 | 27.08 | 29.08 | 29.33 to 29.53 |
| 9 Guide their attention / to what’s important (120 px) | 29.53 | 30.13 | 33.13 | 33.13 to 33.33 |
| 10 Documentation is an / open problem in web design (112 px) | 33.33 | 33.93 | 37.26 | the card's cut at 37.5 |

## The pictures, line by line

These rules hold for the whole film:
- The ground is `#071124`. The palette is `#2f5ce0`, `#86a8ff`, white and the blue gem smoke, and nothing else. The only logo is the GT mark (the page's logo and the end card's mark).
- One 3 px cell grid on the kit's anchored 8 by 8 Bayer tile for every dithered piece, the background included. Dithered pieces enter, change and leave by tone only, so their cells switch in Bayer order.
- The smoke is printed through that screen as one field behind every shot, on one clock that never cuts. Each shot shapes it with an envelope of tone that clears it around the type and the objects (28 px clear of every heading line, back to full 230 px away).
- Headings are Inter 500 through `var(--font)`, tracking -0.035 em, line height 1.04, x 160, top 146, white, two lines at most, ending by x 1662.
- Connectors are the doubled line (gauge 7, core 3, on pixel centres). A thumb or a pulse is a white sub-path rewritten each frame.
- No frame overlay, no captions, bylines, labels, counters or numbers. The only URL is the end card's.
- The GT mark and the page's name bar are white from line 3 to the end.

### Line 1 (0.30 to 2.45): the readers

- **Frame 0:** the old Introduction page as a `#2f5ce0` wireframe at x 160 to 900, y 470 to 933 (page scale 0.514), with the GT mark as its logo and the post's B1 extras drawn in `#86a8ff`: the "Star on GitHub" banner under the sidebar header, the sidebar toggle, the search field in the header and the header rule. The field opens at three quarters of its tone and reaches full tone by 0.60.
- **The readers:** a grid of 28 nodes at the right, 4 columns at x 1580, 1630, 1680 and 1730, and 7 rows from y 500 to 908, 68 px apart. 24 are agents, the Heroicons solid `cpu-chip` at 30 px in `#86a8ff`. 4 are humans, the Heroicons solid `user` at 30 px in white, at row 1 column 4, row 3 column 2, row 5 column 3 and row 7 column 1. Seven row threads leave the page's right edge at their rows' heights. Each node hangs on a 45 degree stub. Threads and agent stubs are `#2f5ce0`; human stubs are `#86a8ff`.
- **0.0 to 0.6:** the threads draw out of the page's right edge (expo.out, 30 ms stagger, top to bottom), and each node rises by tone as its stub arrives. From 0.6, white pulses run from the page to the agents only, at about 900 px a second on seeded phases (`GTDither.rng`).
- **0.10:** heading 1 rises and arrives at 0.70.
- **"agents" (2.08):** the agent pulses double in number and keep that rate.

### Line 2 (2.75 to 5.41): the people

- **"Humans" (2.75):** the agent stubs, nodes and pulses leave by tone, from the node ends back toward the page (0.5 s). The four humans and their `#86a8ff` stubs stay.
- **4.03 to 4.23:** heading 1 drops out. **4.23:** heading 2 rises and arrives at 4.83.
- **"evaluate" (4.19):** the four human stubs mix to white (0.3 s, Bayer order).
- **"product" (4.99):** the human nodes, their stubs and the row threads tone out (0.3 s), and the camera move starts from rest from the opening page's rect. This is round 7d's bridge machinery (`camera()`, `matrixOf`, `hermite`, `PLATES`), re-keyed: one monotone progress curve with zero speed at both ends drives the turn, the squash, the separation, the scale and the position. The page travels toward the lower right and swings into the 30 degree axonometric map (a 45 degree turn, a tan 30 squash, a sqrt 1.5 scale), coming apart into plates: the content on the page plane, the contents rail at +110, the sidebar at +210 and the header at +330. Each plate is a 34 px navy slab with Bayer-dithered `#2f5ce0` side faces lit from the upper left, a `#86a8ff` rim and dashed drop lines from its corners, and the page's content on it is `#86a8ff`. The whole stack, including the extras when they lift to +450, stays 28 px clear of the headings' ground. The iso view is reached at 6.45 (1.46 s).

### Line 3 (5.71 to 10.00): the redesign

- **"General" (5.71):** the page's GT mark and name bar mix to white on the rising header plate (0.3 s, Bayer order).
- **6.45:** the iso view is reached. It drifts slowly (scale +3 percent) to 9.90.
- **"redesigned" (6.89):** the four extras lift off as small slabs of their own to +450 (0.6 s, power3.out), each with dashed drop lines to where it sat.
- **7.50 to 7.70:** heading 2 drops out. **7.70:** heading 3 rises and arrives at 8.30, on "from scratch".
- **"people" (8.85):** a white thumb runs down the contents-rail plate to its second row (0.45 s, power2.inOut) and arrives on "read" (9.30).
- **"read" to "writing" (9.30 to 9.87):** the content plate's writing prints white in reading order under the hanging extras: the title, the summary, the paragraph, the section heading and the card names (0.25 s a line, 80 ms apart, by tone).
- **9.90:** the camera move resumes on the same curve. The plates come down in order (header, sidebar, rail), and the extras come down last onto their places (about 11.45). The rims turn from `#86a8ff` to `#2f5ce0` as the page flattens, the content returns to `#2f5ce0`, and the writing returns to `#2f5ce0` by tone as the extras land. The page lays flat into the page box (x 561 to 1853, y 456 to the frame foot) and lands with zero speed at 11.75. The matrix is the identity there, so the landing is the flat old page, with its four extras in place, pixel for pixel. The page box's corner crosses land with it. The flatten takes 1.85 s.

### Line 4 (10.30 to 14.15): the clutter

- **10.30 to 11.75:** the flatten finishes under "Interfaces keep getting more".
- **11.63 to 11.83:** heading 3 drops out. **11.83:** heading 4 rises and arrives at 12.43.
- **"cluttered" (11.68), from the landing at 11.75:** the full round 7 clutter pile lands on the flat page in a seeded order that speeds up toward the end. Each piece rises in tone over 0.2 s, and the last page piece lands on "clutter" (13.66). Every piece is tagged with a kind for line 5:
  - lines: extra rules and hairlines, and boxes drawn inside boxes;
  - links: the tab bar, breadcrumbs, link rows, a second section nav and link chips;
  - buttons: rows of extra square buttons, the icon rail and a floating button;
  - other: eyebrow pills, badges and outline icons on every card, toasts, the callout, the floating widget and the footer banner.
- **About 12.39, a third of the way in:** a toast lands over the Get a Demo action and buries it.
- **From about 12.70, halfway:** the spill pushes past the page into the left margin and up beside the heading as opaque navy cards over the smoke, staying 28 px clear of the heading. It finishes 0.12 s after "clutter" (13.78).
- **13.78 to 14.55:** the twelve late spill pieces keep arriving in the spill zones, one every 0.07 s. The page holds fully buried.
- **15.00 to 15.70:** the field takes line 5's wider heading calm by tone.

### Line 5 (14.55 to 19.03): the deletion

- **"redesign" (14.69):** a 1 px white redline box draws around every pile piece, every spill card and each of the four extras. Each box draws out of its own top-left corner (0.3 s, power3.out) on a seeded stagger inside 0.4 s. This is the post's B1 redline pass, in white because red is not in the film's palette.
- **15.10 to 15.90:** "Telltale signs of AI design" dissolves into its own 3 px cells and reassembles as heading 5 by moving type, with round 7c's six-frame hand-overs at each end. Heading 5 sets in `#86a8ff`, and each of its runs turns white as its kind is deleted.
- **"deleting" (15.91):** the deletion band runs down the frame. Every piece tagged other and the whole spill leave with their boxes, their start times running top to bottom from 15.91 to 16.25 and each tone falling to 0 over 0.5 s (power2.inOut), so the frame is clear of them by 16.75. The toast lifts off the action and uncovers it, and the spill's cards leave the smoke behind them.
- **"extra" (16.53):** "A lot of extra" turns white.
- **"lines" (16.85):** every line piece and the header rule tone out with their boxes in a fast top-to-bottom sweep (0.35 s). "lines," turns white.
- **"links" (17.75):** every link piece tones out the same way, and the "Star on GitHub" banner shrinks into the star pill in the header row (0.4 s, power2.inOut), as the post's B5 shows. "links," turns white.
- **"buttons" (18.53):** every button piece tones out, the sidebar toggle tones out to nothing, the search field shrinks into the search icon, and the header closes into one row of five controls: the search icon, the theme toggle, the star pill, Sign In and Get a Demo (0.4 s, power3.out), as in B2 and B5. "and buttons" turns white.
- **19.00:** the clean page stands. It is the current page model, `page()`, with the white GT mark.

### Line 6 (19.43 to 23.48): one accordion, a rarity

- **19.57 to 20.37:** heading 5 dissolves and reassembles as heading 6 by moving type. Under it, on "sidebar" (19.59), the picture hard-cuts to round 7's accordion diagram. Low on the left in `#2f5ce0` are a tab bar, a row of sub-tabs and a second vertical section nav. On the right is the clean page's own sidebar drawn at about 2 times: the section switcher, the group headings, the rows and the footer links. The switcher box tones in from 20.37, after the moving type's cells have left its ground.
- **19.63, 19.78 and 19.93:** three doubled-line connectors on 17 px navy casings draw out of the old surfaces toward the accordion (0.6 s each, power3.out). As each one arrives, its group's rows rise in tone, its white cross lands and its old surface tones out (0.3 s). The last arrives on "one" (20.53).
- **"one" (20.53):** the rail draws down the rows and bends inward on 45 degree runs where the tree nests (0.45 s, power3.out).
- **"accordion" (20.83):** from 20.95, when the rail is drawn, the white thumb slides down the rail through the bend to the active page and arrives at 21.40.
- **21.45 to 22.05, in the comma pause:** the accordion moves and scales from the diagram into the clean page's sidebar slot in the page box (0.6 s, power2.inOut, zero speed at both ends). From 21.60 the rest of the clean page rises in tone around it, and the field's envelope follows by tone.
- **"rare" (22.08):** the page shrinks into one slot (column 4, row 2) of a 9 by 6 grid of docs pages, 120 by 75 at a 138 by 102 pitch from x 597, y 492 (0.55 s, power2.inOut). The page box's 1 px hairline frame draws out of its top-left cross (0.6 s, expo.out), the right edge draws down out of the top-right corner as the top hairline reaches it, the corner crosses land, and each panel cell closes over the smoke by tone (0.15 s) once both hairlines have passed it. From 22.20 to 22.75 the other 53 pages rise in tone in Bayer order from the lower right. Each carries the old surfaces in miniature: a tab bar, a sub-tab row and a second section nav. General Translation's page in its slot carries the one accordion.
- **"sites" (23.09):** General Translation's page mixes to white and `#86a8ff` (0.4 s, Bayer order), and its white outline draws out of its top-left corner (0.4 s, power3.out).
- **23.48 to 23.68:** heading 6 drops out.

### Line 7 (23.78 to 26.23): the writing

- **23.49 to 23.95:** the opening of round 7d's bridge. The lit page's cells tone out under the page growing out of its slot back to the page box (0.46 s), while the other pages leave by tone outward from the lit slot. Its white outline runs back into its corner, and the panel's hairlines run back into their crosses (the crosses stay). The panel's ground opens to the smoke a beat behind the leaving pages and in from its own edges, so it never shows as a hard hole.
- **23.68:** heading 7 rises and arrives at 24.28, on "now".
- **"writing" (23.86), cut at 23.95:** hard cut to the close view of the clean page's content column at about 3 times its size: the title, the summary, a rule, the paragraph, the section heading and the section's first lines, from x 600 with the lowest line at y 984 or above, on its panel (hairlines at x 480 and y 456, with crosses), and the rail at the column's left edge. The field's one gem mount switches to the writing's setting (GEM7), as round 7d built it. Only the writing is printed from that smoke through the Bayer screen: solid `#2f5ce0` where the smoke is thin, `#86a8ff` and white where its rim sweeps through the words. The margins stay clear.
- **23.95 to 25.15:** the eleven lines rise in tone in reading order (0.3 s each, 90 ms apart), complete before "space". The rule draws (0.4 s) as its line arrives. The smoke's light keeps travelling along the words to the cut.
- **25.30 to 26.17:** the white thumb slides down the rail from the title to the section heading (power2.inOut) and arrives on "it".

### Line 8 (26.53 to 29.48): translated pages

- **26.48:** hard cut to the glyph planet, with heading 8 rising at the cut (it arrives at 27.08). The planet is a sphere of glyphs from twenty writing systems rising as a horizon (centre 960, 1520, radius 1010, crown at y 510), one glyph per 21 px cell, its size carrying the sphere's light: the ocean `#2f5ce0`, the land `#86a8ff` and the lit land white, lit from the upper left, with the low limbs darkened. It turns 0.14 rad a second.
- **26.48 to 27.08:** the planet's cells light in Bayer order from the crown down, every cell still in Latin, and the smoke inside its disc leaves by tone row by row on the same schedule.
- **26.55 to 26.95:** a small clean page rises by tone in the sky at the upper right (x 1236 to 1764, y 150 to 480, page scale 0.367). It is opaque and drawn in `#2f5ce0`, with its accordion sidebar, its one-row header and its white GT mark. Heading 8's line ends at least 28 px left of it; if it does not, the page moves right.
- **"same" (27.95):** every planet cell steps once from Latin to the script of its region (nineteen regions), in Bayer order over 0.6 s. The sphere keeps its light, its cell grid and its shape.
- **"spacing" (28.29):** the small page's text bars mix from `#2f5ce0` to `#86a8ff` in place (0.5 s, Bayer order). The ink changes and nothing moves.
- **"alignment" (28.93):** three dashed `#86a8ff` hairline guides draw left to right across the small page at its header, its title and its first group heading (0.4 s, power3.out), as in the post's E5.
- **29.33 to 29.53:** heading 8 drops out. The planet turns on to the cut.

### Line 9 (29.78 to 32.58): the reader's path

- **29.53:** hard cut to the clean page in the page box, in one muted ink (`#2f5ce0` bars and hairlines, 50 percent dithered icons), with the accordion in its sidebar, the five-control header and the white GT mark. Heading 9 rises at the cut and arrives at 30.13.
- **"Each" (29.78):** one reader's path draws as the doubled line in `#86a8ff` out of the section switcher, at one constant speed (ease none, about 850 px a second). It passes the active sidebar row, the title and the first quickstart card, then climbs to the Get a Demo action. These are the five stops of the post's A4 (orient, navigate, read, choose, act). A white seat lands at each stop as the path passes it. The speed is set so the path reaches the action on "action", and the other stops land where that speed puts them.
- **"action" (31.70):** Get a Demo mixes to white (0.3 s).
- **31.95 to 32.90:** a white pulse (120 px) runs the whole path once and ends in the lit action.

### Line 10 (32.88 to 36.73): the open problem

- **"Docs" (32.88):** the page shrinks back to the opening's place (x 160 to 900, y 470 to 933; 0.9 s, power2.inOut), and the field's envelope follows by tone. The heading does not move.
- **33.13 to 33.33:** heading 9 drops out. **33.33:** heading 10 rises and arrives at 33.93, on "open".
- **33.35 to 33.95:** the seven row threads, the stubs and the 28 nodes return by tone, and the agent pulses run again.
- **33.95 to 34.80:** the reader's path continues at the same speed from the action, out of the page's right edge and along row 1's thread, into row 1's white human node.
- **"team" (35.46):** the four human stubs mix to white (0.3 s).
- **35.76 to 37.5:** hold, with the agent pulses running. The closing frame repeats the first: the same page among the same readers, now clean, with one person's path lit through it.
- **37.5:** hard cut to the end card.

## The spectacle map

Every piece of the current cut (round 7d revised) and every new picture of SCRIPT-v2.md's shot list, with the line it serves in v3. Nothing in the inventory is dropped.

| piece | from | where it plays in v3 |
| --- | --- | --- |
| The dithered blue gem smoke field: 3 px Bayer cells in three tones, one clock that never cuts, opening at three quarters of its tone, shaped per shot by envelopes of tone | current cut | Lines 1 to 10 without a break, to the card's cut. Envelopes are rebuilt for every new shot. |
| The heading motion: a 26 px rise with opacity (expo.out, 80 ms stagger) and an 18 px drop (power2.in) | current cut | Every heading change that is not a moving-type change. |
| The seven round 7d headings | current cut | "Human readability / and visual design" line 2; "A simpler reading experience / focused on content" line 3; "Telltale signs / of AI design" line 4; "A lot of extra lines, / links, and buttons" line 5; "A rarity in / docs sites" line 6; "Guide their attention / to what’s important" line 9; "Documentation is an / open problem in web design" line 10. |
| The page model with the GT mark as its logo | current cut | Every page shot, lines 1 to 10. |
| The isometric camera: one monotone curve with zero speed at both ends | current cut | From "product" (line 2) to the landing on "cluttered" (line 4). |
| The plates: rail +110, sidebar +210, header +330, 34 px navy slabs, dithered side faces, `#86a8ff` rims, dashed drop lines, `#86a8ff` content, a slow drift | current cut | Lines 2 and 3. |
| The flatten: plates down in order, rims back to `#2f5ce0`, a pixel-exact landing into the page box, the crosses landing | current cut | Line 3's end into line 4 (9.90 to 11.75). |
| The full round 7 clutter pile, seeded and speeding up, each piece rising in tone (eyebrow pills, badges, outline icons, toasts, the callout, the floating widget and the footer banner included) | current cut | Line 4, from "cluttered" to "clutter". |
| The toast landing over the action | current cut | Line 4, a third of the way in. The band lifts it off in line 5. |
| The spill past the page into the left margin and up beside the heading, as opaque cards over the smoke | current cut | Line 4, from halfway. |
| The twelve late spill pieces | current cut | Line 4's tail, one every 0.07 s (was 0.11 s), done before the redline. |
| The field's heading calm changing by tone around the moving type | current cut | Lines 4 into 5 (15.00 to 15.70). |
| The moving type: a heading dissolving into its 3 px cells and reassembling as the next | current cut | Twice: heading 4 to 5 at 15.10 (line 5) and heading 5 to 6 at 19.57 over the cut to the diagram (line 6). |
| The deletion band from top to bottom, uncovering the action, the spill's cards leaving the smoke behind | current cut | Line 5, on "deleting", for the pieces tagged other and the whole spill. |
| The accordion diagram: three old surfaces low on the left, the accordion at about 2 times on the right | current cut | Line 6, by the hard cut on "sidebar". |
| Three doubled-line connectors on navy casings, rows rising in tone, white crosses landing | current cut | Line 6, the last arriving on "one". |
| The rail drawing down the rows and bending inward on 45 degree runs | current cut | Line 6, on "one". |
| The white thumb sliding down the rail to the active page | current cut | Line 6, on "accordion". |
| The docs panel: its hairline frame drawn out of the top-left cross, the right edge drawn down out of the top-right corner, the corner crosses, the panel closing over the smoke cell by cell | current cut | Line 6, on "rare". |
| The 9 by 6 grid of docs page thumbnails rising in tone in Bayer order from the lower right | current cut | Line 6, on "rare". New job: the many docs sites. |
| The one lit page in white and `#86a8ff`, with its white outline drawn out of its corner | current cut | Line 6, on "sites". It is General Translation's page. |
| The bridge's opening: the lit page grows out of its slot while the other pages leave outward, the outline runs back into its corner, the hairlines run back into their crosses, the panel's ground opens to the smoke | current cut | Lines 6 into 7 (23.49 to 23.95). The growth ends flat in the page box; the iso rise now starts from the opening page (v2's start). |
| The writing printed from its own gem smoke setting (GEM7) at about 3 times, eleven lines rising in reading order, the rule drawing, the smoke's light moving along the words | current cut | Line 7, from the cut on "writing". |
| The white thumb sliding down the writing's rail | current cut | Line 7, arriving on "it". |
| The glyph planet: twenty writing systems as a lit, turning horizon, lighting from the crown down while the smoke leaves its disc | current cut | Line 8, by the hard cut. New job: translated pages. |
| The planet's script step: every cell from Latin to its region's script, keeping light, grid and shape | current cut | Line 8, on "same". |
| The reader's path: the doubled `#86a8ff` line at one constant speed, with white seats | current cut | Line 9, from "Each". |
| The action mixing to white | current cut | Line 9, on "action". |
| The white pulse running the path once into the lit action | current cut | Line 9's tail. |
| The shared end card | current cut | 37.5 to 41.5. |
| The old page's four B1 extras in `#86a8ff` (banner, toggle, search field, header rule) | v2 new | From frame 0 through the iso view and the pile, until line 5 deletes them. |
| The reader grid: 28 nodes (24 `cpu-chip` agents, 4 `user` humans), seven row threads drawn out of the page, 45 degree stubs | v2 new | Line 1, and again in line 10. |
| The agent pulses, doubling | v2 new | Line 1, on "agents"; running again in line 10. |
| The agents leaving by tone while the four humans stay | v2 new | Line 2, on "Humans". |
| The humans, stubs and threads toning out as the camera starts | v2 new | Line 2, on "product". |
| The iso rise starting from the opening page's rect | v2 new | Line 2, on "product". |
| The GT mark and name bar mixing to white | v2 new | Line 3, on "General". They stay white to the end. |
| The extras layer at +450 with drop lines, landing last | v2 new | Line 3, on "redesigned"; landing last in the flatten. |
| The white thumb on the iso contents-rail plate | v2 new | Line 3, from "people" to "read". |
| The writing printed white on the iso content plate, returning to `#2f5ce0` as the extras land | v2 new | Line 3, from "read" to "writing". |
| The pile tagged by kind | v2 new | Lines 4 and 5. The kinds are line, link, button and other; the pieces v2 removed are back as other. |
| The white redline boxes, each drawn out of its piece's top-left corner | v2 new | Line 5, on "redesign". |
| Each kind deleted on its own word | v2 new | Line 5, on "lines", "links" and "buttons". |
| Heading 5's runs turning from `#86a8ff` to white as their kind goes | v2 new | Line 5. |
| The banner shrinking into the star pill | v2 new | Line 5, on "links". |
| The toggle toning out, the search field shrinking into the search icon, the header closing into one row of five controls | v2 new | Line 5, on "buttons". |
| The second moving type at the cut to the diagram | v2 new | Line 6, on "sidebar". |
| Each old surface toning out as its connector arrives | v2 new | Line 6. |
| The accordion drawn from the clean page's sidebar, moving into the page's sidebar slot while the page rises around it | v2 new | Line 6, in the comma pause after "accordion". |
| The path re-routed through A4's five stops, from the section switcher | v2 new | Line 9. |
| The closing mirror: the page shrinks back, the reader grid returns, the path runs into a human node, the last frame repeats the first | v2 new | Line 10. |
| Headings that are runs of the post or of the spoken line | v2 new | Line 1 "Agents are the majority / of docs readers" (v2's heading 1), line 7 "More open space", line 8 "The same spacing". v2's other headings were runs of v2's own spoken lines, which are gone; "Docs for humans" is the one left for Kevin to place (see the decisions). |
| The human stubs mixing to white | v3 new (A) | Line 2, on "evaluate"; line 10, on "team". |
| The clean page shrinking into the grid slot, and every other thumbnail carrying the old navigation surfaces in miniature | v3 new (A) | Line 6, on "rare". |
| The small clean page above the planet, its ink changing in place, and E5's three dashed guides | v3 new (C) | Line 8, on "spacing" and "alignment". |

The 1.2 s silent lead and the 2.6 s silent bridge of the current cut were lengths of time with no picture of their own. Their pictures are kept: the field at the open, and the whole iso rise, hold and flatten, which now play under lines 2 to 4. The silences are not restored, because Kevin's 2026-10-05 note on pace and the 6 to 8 s gravitas rule both rule them out.

## The end card

The shared series card from `kit/endcard/`, used as built, from 37.5 to 41.5 s:

```js
addEndCard(tl, { palette: 'blue', title: ['Designing docs', 'for humans'], url: 'generaltranslation.com/blog/designing-docs-for-humans', start: 37.5 });
```

It shows the GT mark filled with the blue gem smoke, the title in two lines and the post's link, the only URL in the film. 37.5 is on the 0.5 s grid the card requires. The card is silent, and the bed's own resolution begins on its cut. The film's last frame is the poster.

## Visual changes the build must make

Against the current composition (`index.html`, `lib/film.js`, round 7d revised, frame removed). Start from it, because it holds every current-cut scene; port the v2 pieces from `audio/archive-v2-stopped/film-v2-partial.js` (`page()` with the old header, `extras()`, the kind-tagged `clutter()` and the inline Heroicons paths `ICON_CPU` and `ICON_USER`).

Kept, retimed or given a new job:
1. **The background field** (`FIELD`, its one clock, `ENV`, `envBuild`, `headCalm`). Rebuild the envelopes for the new shots: the opening page with the reader grid and heading; the iso stack; the page box with the spill's calm and line 5's wider calm; the diagram's `S6CALM`; the grid panel; the writing's panel; the planet's disc with the small page; the path page and its shrink back to the opening rect, mixed by tone along the move. The scene times have moved on the gem clock, so re-measure each shot's open-ground lit share (12 to 30 percent, as NOTES.md records) and re-choose `g0` if a shot falls outside it.
2. **The headings** (`rise()` and the drops). Ten headings as the heading clock gives them, all rising in 0.6 s.
3. **The isometric camera** (`camera()`, `matrixOf`, `hermite`, `PLATES`, rims, faces, drop lines). Re-key `CAM.c0` and `CAM.k0` to the opening page's rect (centre 530, 701.5; `k0` = 740 / 1292). Re-key `UK` to `[[4.99, 0, 0], [6.45, 0.45, m], [9.90, 0.55, m], [11.75, 1, 0]]` with `m` about 0.029 a second, so the held view drifts for 3.45 s. Move `cIso` and `cIso2` toward the lower right (about 1180, 700) and lower `kIso` toward 0.52 if needed, so that the stack with the extras at +450 stays 28 px clear of headings 2 and 3; check it on stills at 6.45 and 9.90. Keep `camera(11.75)` equal to the identity so the landing stays pixel-exact.
4. **The clutter** (`clutter()`, `drawClutter`). Keep round 7's full list, toast and spill, and tag every piece `kind: 'line' | 'link' | 'button' | 'other'` (the kinds in line 4). Keep the twelve late pieces at 0.07 s spacing. The band removes only `other` and the spill; then each kind leaves on its word in a fast top-to-bottom sweep.
5. **The moving type** (`headingCells`, `buildMT`, `drawMT`, d 0.8). Run it twice: 15.10 and 19.57.
6. **Scene 6's accordion diagram** (`drawS6`, `S6CALM`), retimed to line 6: connectors 0.6 s each, each old surface toning out on arrival, the accordion drawn from `page()`'s sidebar elements at about 2 times so it can move into the page.
7. **Scene 2's grid** (`drawS2`, `mini`, `TH2`). It now follows the accordion on "rare": the clean page shrinks into the lit slot (`TH2.lit` [3, 1]), and `mini()` draws the old navigation surfaces on every other page.
8. **The bridge's opening** (`BR.handOver`, `grid0`, `gridSpread`, `gridEach`, `openLag`, `openEach`). Reused at 23.49 for a flat growth from the lit slot to the page box (no turn), before the cut to the writing.
9. **Scene 7's writing** (`drawS7`, `GEM7`, `LINE7`, `THUMB7`), from the cut at 23.95, lines complete by 25.15, thumb arriving on "it".
10. **Scene 1's planet** (`drawS1`, `planet`, `G1`), from the cut at 26.48, its script step keyed on "same".
11. **Scene 3's path** (`len3`, `drawS3`, `PATH3`, `PULSE3`), from the cut at 29.53, re-routed through A4's five stops from the switcher, `PULSE3` at 31.95, and extended out of the page along row 1's thread into a human node.
12. **The end card**, at 37.5.
13. **The palette, the 3 px cell grid, the doubled line, `page()` and `place()`.**

New:
14. **The reader grid**, its threads, stubs, pulses, the agents' exit, the human stubs whitening and the return in line 10. Credit Heroicons 2.2.0 (MIT) in NOTES.md.
15. **The old page**: `page()` plus the old header and `extras()` (B1), and their B5 replacements (the star pill as an icon and a short bar with no number, the search icon, the header row of five controls).
16. **The extras layer in the iso view** at z 450, with drop lines.
17. **The writing printed white on the iso content plate**, and the thumb on the iso rail plate.
18. **The redline boxes**, the per-kind deletion and heading 5's runs turning white.
19. **The accordion's move into the page** and **the page's shrink into the grid slot**.
20. **The small clean page above the planet**, its in-place ink change and the three dashed guides.
21. **The closing mirror.**
22. **The cue tables** `O`, `WD` and `B`, rewritten from the new takes' `.stt.json`. The root's `data-duration` is 41.5, and the ten `<audio>` clips `vo-1` to `vo-10` take tracks 10 to 19 (the music stays on 20).

Removed: nothing.

Before rendering: `out/v9/` already holds the current final (`cmp` matched `out/blog-designing-docs.mp4` on 2026-10-06), so it needs no new copy. Then `npx -y hyperframes@0.8.106 check .` must end with "Check passed" and 0 errors, followed by the draft and delivery renders, the poster and the contact sheet, as MOTION.md lists.

## The sound plan

- **The bed:** the round 5 generation (`audio/bed.mp3`) through `audio/make-bed.py`, which needs no code change. It reads `B.card` 37.5 and `B.end` 41.5 from `index.html`. Film 0 is then source 4.857 s (past the generation's own swell, which ends at 2.0 s). The six-bar join falls at film 37.5 - 19.984 = 17.52 s, inside line 5 between "lines" and "links", and the bed's own resolution begins on the card's cut at 37.5. Run it with `--report` and confirm that the join's pad correlation is unchanged.
- **The mix:** `audio/mix.py` with `LINES` pointed at the ten new takes. It reads `O` and `B` from `index.html` as now. Ducking stays as now: about -28.5 LUFS under the narration and -20 LUFS alone, with the voice-shaped dip keeping 400 to 800 Hz about 4 dB clear of the narrator's vowels.
- **The open:** the first word comes at 0.30, so the bed opens at its ducked level. Set `FADE_IN` to 0.25 s so the bed is up before the first word.
- **The gaps:** every gap is 0.30 to 0.40 s, under `HOLD_GAP` (1.2 s), so the bed stays down from the first word to the last. Listen to the gaps. If the `GAP_LIFT` bump pumps, set it to 0 for gaps under 0.45 s. The comment about the bridge gap in `mix.py` no longer applies.
- **The close:** after the last word (36.73) the bed rises over `RAMP_OUT` (0.8 s) to its alone level under the closing frame, resolves on the cut at 37.5 and fades over the last 0.8 s of the card.
- **Targets:** narration about -16 LUFS integrated, true peak under -1 dBTP, AAC in the MP4, and the audio length equal to the video's 41.5 s. Measure with `ffmpeg -i out.mp4 -af ebur128=peak=true -f null -`.

## If the takes run long or short

- Every cue is keyed to a spoken word. The new `.stt.json` word times replace the planned times above, and the picture follows them. No silence is cut inside a line, and no take is stretched or sped up.
- Gaps stay at 0.30 s (0.40 s before lines 5 and 6) and may move inside 0.25 to 0.40 s to make a rule below hold.
- **The heading chain.** Headings 1 to 5 run on their own floors from 0.10, so heading 5's floor ends at 19.57 whatever the takes do. "sidebar" must fall at or after 19.57; if it falls earlier, widen the gaps before lines 5 and 6 (up to 0.40 s each); if it is still early, start the second moving type at 19.57 and cut on the next word. A heading that would change before its floor changes on the next keyed word instead. The floor is never shortened.
- **The iso rise** needs at least 1.4 s from "product" to the iso view, and the view must be reached before "redesigned". If "product" to "redesigned" is under 1.5 s, start the rise on "evaluate".
- **The flatten** needs at least 1.8 s and lands on "cluttered". If line 3's end to "cluttered" is under 1.8 s, start the flatten on "writing"; if that is still short, widen the gap before line 4 to 0.40 s.
- **The late spill pieces** must all land before "redesign". If they do not, space them 0.06 s apart.
- **The card** starts on the 0.5 s grid, at the first grid time after both heading 10's floor and 0.5 s after the last word. The planned card is 37.5. If it would move to 38.0, first take the gaps to 0.25 s (except before lines 5 and 6), then shorten the closing hold. If it would still pass 38.0 (a film over 42 s), retake line 3 without "from scratch" and key the extras' lift on "redesigned" as planned.
- **Short takes:** the shortfall goes into the closing hold. The card never starts before heading 10's floor ends.
- **The bed's join** sits at film `B.card - 19.984` s and must fall inside a spoken line. At the planned card it is inside line 5. Any card time from 35.0 to 39.0 keeps it inside line 5.

## Audit

### Facts

| claim | where it is in the post |
| --- | --- |
| Most docs readers are now AI agents (line 1) | "But in a world where agents are the majority of docs readers, as well as docs creators, should you still design your docs site?" The post grants this as its premise ("Yes, agents are mass executors of code"). "AI" comes from the summary, "Why design still matters in the age of AI". |
| Humans still read docs to evaluate a product (line 2) | "Humans still look at docs sites to understand and evaluate a product." |
| General Translation redesigned its docs from scratch (line 3) | "We approached our docs redesign from scratch". The post is on the General Translation blog, by its team. |
| So people would read its writing (line 3) | "We work hard on our writing, and we want people to read it. The continuous goal is to design and maintain a docs site that makes the reading experience smooth and even delightful." |
| Interfaces keep getting more cluttered (line 4) | "Interfaces are increasingly cluttered." |
| Which creates mental clutter (line 4) | "The consequence of this visual clutter is an accompanying mental clutter." |
| The redesign started by deleting extra lines, links, and buttons (line 5) | "So our first job is to cut mental clutter. This means deleting extraneous elements; in our case, a lot of extra lines, links, and buttons." |
| The sidebar is now one accordion, which is rare among docs sites (line 6) | "Our sidebar is now one singular accordion. It doesn't sound revolutionary, but has become a rarity in docs sites". |
| The writing now has more open space around it (line 7) | "We arranged these with less lines and more open space for a cleaner visual experience" and "We especially wanted to create a lot of white space to give the content breathing room". |
| Translated pages keep the same spacing and alignment (line 8) | "And of course, our docs localization experience must be top-tier: preserving spacing, alignment, and order." E5's caption. |
| Each page guides its reader toward the action they want (line 9) | "And the page supports an intuitive flow, funneling users towards what they want to achieve." A4; the actions include "getting a demo of the product". The post says the funnelling of one page, the Introduction page in A4, so "Each page" generalises it; the docs-wide part rests on "The docs highlight links to actions users might want to take". Noted after the v3 critic (2026-10-06) and kept without a retake; a retake would say "The page guides its reader toward the action they want." |
| Docs design is an open problem (line 10) | "Documentation is an open problem in web design." |
| The team keeps working on it (line 10) | "We're of course continuously working to improve our docs design and welcome any feedback." |
| The old page's banner, toggle, search field and header rule | B1: "the search field, the GitHub banner, the sidebar toggle, and the header rule". |
| Banner to star pill, search field to icon, toggle to nothing | B5: "the search field to the ⌘K icon, the GitHub banner to the star pill, and the sidebar toggle to nothing". |
| The general clutter pile (pills, badges, outline icons, toasts, boxes inside boxes) | The post's general claim ("Elements like 'eyebrow text,' random animations that move in multiple dimensions, and extraneous boxes (with rounded corners) are telltale signs of AI design") and its hit list. Only the redlined extras and the lines, links and buttons are presented as General Translation's own deletions. In the build (after the v3 critic, 2026-10-06) only those land on General Translation's page; the pieces of kind other land off the page in the spill, and the toast hangs over the page's top edge from outside. |
| Three old navigation surfaces feeding one accordion; the other pages carrying them in miniature | Docs sites "often show multiple section navigation bars in multiple places, both vertically and horizontally", and "we consolidated navigation surfaces". These show the general pattern. They are not a census of other sites or of General Translation's old page. |
| The path's five stops | A4: "orient, navigate, read, choose, act". |
| The dashed guides on the translated page | E5: "dashed guides showing the shared alignment". |
| 24 agents and 4 humans | An illustration of "the majority". The post gives no ratio, and no number appears on screen. |

### Quotes

Zero. The narration quotes no one, and no heading carries quotation marks. The post's phrases appear only where they are the fact itself ("from scratch", "mental clutter", "lines, links, and buttons", "one accordion", "open space", "spacing and alignment", "open problem").

### Writing rules

- Each of the ten lines is a complete declarative sentence in plain technical English.
- None uses a metaphor or an analogy. "Mental clutter" is the post's own term.
- None is a fragment, a rhetorical question or an exclamation. There are no em dashes, no signposts or labels and no hype words.
- None uses "X, not Y" or "not X but Y".
- Line 5's "lines, links, and buttons" is a list of three because the post deleted those three kinds, and each item drives its own deletion on screen. No other line has a list.
- There is no first person. General Translation is named once, in line 3, and "the team" in line 10 is its team.
- Nothing is said twice. "docs" recurs because it is the subject; "clutter" appears twice inside line 4, where the post itself pairs visual and mental clutter.
- On screen there are no eyebrows, no monospace, no captions or bylines, no frame overlay and no URL except the end card's. Every heading is at most two lines, from 112 to 140 px, in sentence case with no trailing period.
