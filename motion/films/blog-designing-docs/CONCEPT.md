# Designing docs for humans: the concept (round 7)

## The idea

One docs page carries the film, drawn in the post's own cover material: blue gem smoke and blue Bayer dither on a dark navy page. Agents read docs by the thousand and a person still reads one page to judge a product, so the film buries that page in clutter, deletes the clutter until the page has its parts and one accordion, and leaves only its writing printed from the smoke before the smoke forms the GT mark.

The words are in SCRIPT.md. The film is r7-idea's treatment with two pictures grafted in. Line 1 takes r7-viewer's glyph planet, because it shows what "localization tools" means and puts the brand's glyph field where a writing system belongs. Line 2 takes r7-people's grid of docs pages with one lit page, because it shows agents' volume and the one page a person reads, and it hands that page to line 3 in the same panel. These two pictures replace r7-idea's smoke window, which did not read as a page, and its glyph wall, which used the languages field to mean agent traffic.

## The frame and the rules every line keeps

- 1920 x 1080 at 60 fps, 44.5 s, one HyperFrames composition. The ground is the cover's navy page `#071124`. The palette is `#2f5ce0`, `#86a8ff`, white and the blue gem smoke (white and `#86a8ff` smoke on `#2f5ce0`), and nothing else.
- One 3 px Bayer cell for the whole film, on the kit's anchored 8 by 8 tile (`GTDither.grid`). Dithered pieces enter, change and leave only by tone on that grid, so their cells switch in Bayer order. Dithered pieces never use alpha fades, wipes or masks.
- No series frame (removed 2026-10-04 at Kevin's request; it used to be `GTSheet.mount` at inset 67, rails and crosses only, drawn out at 0.0 s). Every remaining cross and hairline belongs to a scene.
- The page box is the same from line 2 to line 5: x 560 to 1855, y 455 to the frame foot. Lines 6 and 7 enlarge parts of that page, and line 8 is the end card.
- Headings are Inter 500 through `var(--font)` at 112 to 144 px, two lines at most, from x 160 with tops at y 146 or lower, and they end by x 1662. Each arrives by rising 24 to 28 px with opacity (expo.out, 0.8 to 0.9 s, 80 ms line stagger) and holds at least (words / 3) + 1 s. No captions, labels, counters, bylines, dates or URLs appear.
- Connectors are the doubled line: one path stroked twice, with whole-pixel threads in `#86a8ff` and a navy core. A thumb or pulse is a white third copy, rewritten as a sub-path each frame and never driven by a dash offset. Rails draw outward from their owner with expo.out or power3.out.
- Scene changes are hard cuts on the 0.5 s grid, plus one moving-type heading change at 23.5 s. At most one gem smoke mount is live at a time: the dithered corners in line 2, the smoke sampled into the writing in line 7, and the full-colour end card in line 8.
- Voice placement assumes 2.3 words a second. Each clip goes in at the start time given below, and its `.json` word timings move each "lands on" cue to the real word.

## Lines

### 1. 0.0 to 8.0 s. Voice 0.5 to 7.5 s.

- **Heading:** Documentation is an / open problem in web design (112 px).
- **Picture:** The glyph planet. A sphere of characters from twenty writing systems rises as a horizon across the lower half of the navy page. They are Latin, Greek, Cyrillic, Hebrew, Arabic, Devanagari, Tamil, Kannada, Bengali, Thai, Georgian, Armenian, Ethiopic, Hiragana, Katakana, Han, Hangul, Mongolian, Tibetan and Javanese. Each 21 px cell holds one glyph whose size carries the sphere's light, so the glyphs read as a halftone. The ocean is in `#2f5ce0`, the land in `#86a8ff` and the lit land in white, as on the sign-in globe lit from the upper left (`stills/partnership-globe/index.html`). The heading sits on clear navy above the planet's crown.
- **Motion:** At 0.5 s the heading rises into place. From 1.0 to 1.9 s the planet's tone rises from 0, so its glyph cells light in Bayer order from the crown down. The sphere turns slowly for the whole beat (spin 0.14 a second, re-sampled each frame), and each cell keeps its glyph between steps, so nothing shimmers. On "localization" every cell steps once to its next writing system, in Bayer order over 0.6 s, so the planet visibly changes language and keeps its light. Hard cut at 8.0 s.
- **Lands on:** localization (about 5.8 s).
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/blog-designing-docs/r7-viewer/stills/f1.png`. In the still the heading breaks after "open" on a `#071022` ground. The film breaks after "an" to keep "open problem" together, and it uses the film's `#071124` ground.

### 2. 8.0 to 14.5 s. Voice 8.2 to 14.3 s.

- **Heading:** Human readability / and visual design (128 px).
- **Picture:** The docs panel in the page box, with a 1 px hairline frame. It holds a grid of identical docs pages at thumbnail size, drawn in whole 3 px cells of `#2f5ce0`. Each page has a top band, sidebar rows, a title, text lines and two card outlines. One page in the second row is lit in white and `#86a8ff` inside a white hairline outline. The blue gem smoke, printed through the Bayer screen in navy, `#2f5ce0` and `#86a8ff` with fit cover, holds the top-right and lower-left corners as it does on the post's cover.
- **Motion:** Hard cut at 8.0 s. The panel's frame draws out of its top-left cross (0.6 s, expo.out). From 8.2 to 10.6 s the pages rise in tone from 0 in Bayer order, starting at the lower right, so the mass of pages builds while the voice says "Agents are mass executors of code". The corner smoke drifts by less than 3 percent of its window over the beat. On "but" the heading lands. On the same beat one page mixes from `#2f5ce0` to white and `#86a8ff` on one smoothstep (0.5 s, Bayer order), and its white outline draws out of its top-left corner (0.4 s, power3.out). The rest of the mass holds still. Hard cut at 14.5 s.
- **Lands on:** but (11.0 s).
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/blog-designing-docs/r7-people/stills/f2.png`. The still carries r7-people's heading ("Agents are mass executors of code") and the frame's corner mark. The film sets "Human readability and visual design" in the same place, drops the mark and moves the panel's left edge to x 560.

### 3. 14.5 to 20.0 s. Voice 14.7 to 19.9 s.

- **Heading:** Guide their attention / to what’s important (120 px).
- **Picture:** The page from the lit thumbnail, drawn at full size in the page box in one muted ink. It has `#2f5ce0` bars, hairlines and dithered icons on navy, with the GT mark as its logo. One reader's path runs over it as a doubled line in `#86a8ff`. The path goes from the logo to the active sidebar row, then to the title, then down to a quickstart card, then up to the one filled action in the header, which is white. A small white seat marks each stop.
- **Motion:** Hard cut at 14.5 s. The page's tone rises from 0 in Bayer order, top to bottom (0.5 s), and the heading lands. At 15.0 s the path draws out of the logo node as real geometry, with both strokes on a growing sub-path (ease none, because reading is a process). Each seat lands as the path passes it: the sidebar row on "at", the title on "docs" and the card on "understand". The path reaches the action on "evaluate", and the button fills white. Hold to 20.0 s.
- **Lands on:** evaluate (about 18.6 s).
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/blog-designing-docs/r7-idea/stills/f3.png`

### 4. 20.0 to 23.5 s. Voice 20.2 to 21.9 s.

- **Heading:** Telltale signs / of AI design (130 px).
- **Picture:** The same page buried under the clutter the post names, in `#86a8ff` and white dither and louder than the page. The clutter includes a GitHub banner and a search field in the header, a tab bar, breadcrumbs, eyebrow pills, extra rules, boxes inside boxes, toasts, a callout, a row of extra buttons, badges and outline icons on every card, a second navigation, an icon rail, a floating widget and a footer banner. It spills past the page into the frame and climbs to the right of the heading. The heading keeps a clear field.
- **Motion:** Hard cut at 20.0 s. The path is gone, and the heading lands (0.6 s, expo.out). The clutter lands piece by piece in a seeded order (`GTDither.rng`), 30 ms apart. Each piece's tone rises from 0 in Bayer order over 0.2 s. The page fills first and the frame around it fills after. The last pieces land on "cluttered". The shot holds to 23.5 s, so the heading reads for 2.9 s.
- **Lands on:** cluttered (about 21.3 s).
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/blog-designing-docs/r7-idea/stills/f4.png`

### 5. 23.5 to 29.5 s. Voice 23.0 to 29.4 s, with 0.3 s between its two sentences.

- **Heading:** A lot of extra lines, / links, and buttons (124 px).
- **Picture:** The deletion, caught halfway. The clutter leaves in reading order, and each piece's tone falls so its cells switch off in Bayer order. Above the page and across the header it is already gone. The paragraph and the right zone are thinning to sparse cells, and the cards and the spill at the lower left still carry theirs. Every part of the page underneath stays.
- **Motion:** The voice starts at 23.0 s over line 4's held frame. At 23.5 s the heading changes by moving type: "Telltale signs of AI design" dissolves into glyph cells and reassembles as the new heading (0.8 s, readable from 24.3 s). If that cannot be built clean, the old lines drop out and the new lines rise in on the same beat while the page holds. From "cut" (about 25.6 s) to 29.0 s the clutter leaves top to bottom. Each piece's tone falls to 0 over 0.5 s (power2.inOut) on the one cell grid, so a band of deletion moves down the frame. On "deleting" the upper half is clear. By 29.0 s only the page remains.
- **Lands on:** deleting (about 28.1 s).
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/blog-designing-docs/r7-idea/stills/f5.png`

### 6. 29.5 to 33.0 s. Voice 29.8 to 32.8 s.

- **Heading:** A rarity in / docs sites (130 px).
- **Picture:** The sidebar, close up. Three old navigation surfaces sit low on the left in `#2f5ce0`: a tab bar, a row of sub-tabs and a second vertical section nav. A doubled line in `#86a8ff` carries each one into a group of the single accordion on the right, which is drawn at about twice the page's size. The accordion has the section switcher and three groups, and the open group shows its pages indented. Its rail bends inward on 45-degree runs where the tree nests, and a white thumb marks the active page.
- **Motion:** Hard cut at 29.5 s. The old surfaces and the switcher are in place, and the heading lands. At 30.0 s the three connectors draw out of their surfaces toward the accordion (power3.out, 0.9 s, 0.2 s apart). As each one arrives, its group's rows rise in tone from 0, top to bottom, and its cross lands. The last connector meets the accordion on "one". At 31.5 s the rail draws down the rows and bends in at the nested group (power3.out, 0.7 s). The thumb slides to the active page and arrives on "accordion". Hold to 33.0 s.
- **Lands on:** one (about 31.5 s), then the thumb on accordion (about 32.4 s).
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/blog-designing-docs/r7-idea/stills/f6.png`

### 7. 33.0 to 39.0 s. Voice 33.2 to 38.9 s.

- **Heading:** A simpler reading experience / focused on content (118 px).
- **Picture:** A close view of the cleaned page's content column at about three times its size. It has a title, a summary, a rule, a paragraph, a section heading and the section's first lines, with open space around them. The accordion's rail runs down the column's left edge, with its white thumb at the section being read. Only the writing is printed from the gem smoke through the Bayer screen. It stays at least solid `#2f5ce0` where the smoke is thin and turns `#86a8ff` and white where the smoke's rim sweeps through the lines. End the column above the frame's bottom rule, with the lowest line at y 990 or above. In the still it runs to y 1043.
- **Motion:** Hard cut at 33.0 s, and the heading lands. The lines rise in tone from 0 in reading order (0.3 s each, 90 ms apart) and are complete on "writing". The sampled smoke advances with film time, so its light travels along the words. At 37.1 s the thumb slides down the rail from the title to the section heading (power2.inOut, 0.9 s) and arrives on "read". Hold to 39.0 s.
- **Lands on:** read (about 38.0 s).
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/blog-designing-docs/r7-idea/stills/f7.png`

### 8. 39.0 to 44.5 s. Voice 39.3 to 43.2 s.

- **Heading:** Designing docs / for humans (144 px), the post's title.
- **Picture:** The end card. The doubled-line GT mark (`kit/gem-shapes/gt-mark.png`) is a glass shape full of the film's gem smoke on brand blue `#2f5ce0`, with white and `#86a8ff` smoke turning around it. The title sits beside the mark in two lines, with its cap height and baseline aligned to the mark's top and foot, and the lockup is centred. Nothing else is on the card (no rails or crosses).
- **Motion:** Hard cut at 39.0 s to the colour material. The mark fills as the smoke's glow rises from 0 to the preset (`gem.set` from the timeline's onUpdate, power2.inOut, 1.2 s), with no opacity fade. At 39.5 s the title lands line by line (expo.out, 0.9 s, 80 ms stagger) and is complete on "post". The smoke keeps turning. The frame holds to 44.5 s while the music resolves with a 0.8 s fade from 43.7 s.
- **Lands on:** post (about 40.2 s).
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/blog-designing-docs/r7-idea/stills/f8.png`

## Sound

- The narrator is Patrick from `kit/audio/voice.json`, with one clip per line placed at the start times above. SCRIPT.md has the delivery notes.
- The bed comes from the Music API: `node kit/audio/el.mjs music audio/bed.mp3 "<prompt>" --seconds 44.5`. Use one bed, or two at most. The prompt asks for something airy, glassy and precise. It is instrumental with a slow, even pulse, and it has no drops, no risers and no vocals. Check the bed with `el.mjs hear` to confirm it has no voice.
- The bed enters with the film and ducks about 10 dB under each line. It resolves on the end card with a 0.8 s fade. Mix to MOTION.md's Sound section: narration about -16 LUFS integrated, the bed about -26 LUFS under speech, true peak under -1 dBTP, and AAC in the MP4 at the video's length.

## Build sources

The treatments' key-frame code is the starting point for each scene. Line 1 is `concepts/blog-designing-docs/r7-viewer/f1.html` and `lib.js`. Line 2 is `r7-people/f2.html`, `page.js` and `common.js`. Lines 3 to 8 are `r7-idea/frames/f3.html` to `f8.html`, `lib.js`, `clutter.js` and `frame.css`. Each scene is rebuilt as a seekable scene on one paused GSAP timeline, with canvas drawing in onUpdate and nothing driven by the wall clock.

## Changes after judging (orchestrator, 2026-10-02)

- Line 6's heading is "A rarity in / docs sites" in place of "It doesn’t sound revolutionary"; same size and placement.

## Round 7b changes (Kevin, 2026-10-02; these override everything above where they differ)

- **End card:** the shared series end card from `kit/endcard/` with this film's palette, title and link `generaltranslation.com/blog/designing-docs-for-humans`, silent, after line 7. It replaces the old line 8 end card.

