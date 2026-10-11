# blog-fuma-nama: the script, v2 (the build spec)

This file is the trailer for "Fuma Nama: The philosophy of an open-sourcerer" (`apps/landing/content/blog/en-US/fuma-nama.mdx`, Taylor Fang, September 3, 2026), written again from scratch after Kevin's notes of 2026-10-05 ("a little too slow paced. the video isn't very interesting and the script is just kind of weird ... we love the diagrams and visuals") and 2026-10-06 ("I requested new scripts and visuals for these two"). It replaces the round 7d words and pictures for the next build. `SCRIPT.md` (round 7d) is left unchanged as the record of the current cut. The build writes a new `STORYBOARD.md` from Clara's takes of these lines.

Three writers each wrote a script from a different angle: the reveal, the problem and the one thing. The editor scored them (see "How this script was chosen" at the end). The reveal won. It carries grafts from the other two: the grant line, the docs page breaking along the seams, the code panel opening for the copied piece, and the GT mark seated in the end card's own box.

## Change after review (Kevin, 2026-10-06): a new opener. This section overrides lines 1, 2, 3 and 7 and their shots below

Kevin: "need a better fuma opener". The film no longer opens on Fuma finishing high school, and the schoolwork line goes with it, because it only answered that hook. The new hook is the irony the post itself sets up: Fuma Nama learned to code without reading documentation, and then he built a documentation framework. The payoff answers it with his own hope for that framework.

| n | spoken text | excerpt | source sentence (fuma-nama.mdx) | picture |
| --- | --- | --- | --- | --- |
| 1 | Fuma Nama learned to code without reading any documentation. | connecting | "I didn't look at any kind of documentation, just the code itself." and "how Fuma Nama learned to code from looking at code files" | Shot 1 as planned: the sentence rises as the heading over the fire gem smoke. On "documentation" that word turns fire over 0.3 s (in place of "high school"). |
| 2 | Then he built Fumadocs, a documentation framework. | connecting | "Fumadocs is a beautiful and flexible React documentation framework." and "Fumadocs, created by Fuma Nama." | As planned for line 2: on "Fumadocs" the heading breaks into cells that land as the Fumadocs moon, and the wordmark rises. On "documentation" the docs page builds under the lockup, with "documentation" lit in fire for 0.3 s as in line 1, so the viewer sees the same word twice. |
| 3 | "I learned to code from files. Like I would see a huge pile of JavaScript and read that," he said. | excerpt | "It's kind of crazy. I learned to code from files. Like I would see a huge pile of JavaScript and read that," he said. (the first sentence is dropped; the rest is exact, with the post's curly quotes) | Shot 2b, the glyph heap: heading "I learned to code / from files" on the cut; the glyph rain falls on "huge pile of JavaScript" and settles on "read that". Then the 25-line token-bar file lights top to bottom on "read that". The docs page fade on "documentation" from the old line 3 is dropped, because that word is no longer said here. |
| 7 | "I hope Fumadocs will be the documentation framework for the web," he said. | excerpt | "I hope Fumadocs will be the documentation framework for the web," he said. (exact) | Over the full shelf, in the hook's place, the heading "The documentation framework / for the web" rises (white, 130 px, with the post's quotation marks), and on "documentation" that word turns fire as in lines 1 and 2. This is the payoff: the man who learned without documentation wants to make the documentation framework for the web. |

Lines 4, 5, 6 and 8, the end card and the sound plan are unchanged. Clara records new takes of lines 1, 2, 3 and 7 (line 1 and line 7 are new words; lines 2 and 3 have new words and new neighbours). The film stays within 36 to 44 s; if it runs long, take time from holds first, and the end card still starts on the next 0.5 s beat after line 8 ends. The audit rules apply to the new lines: line 1 and line 2 are complete declarative connecting sentences whose facts are in the post, and lines 3 and 7 match the post character for character.

## Story

Fuma Nama just finished high school. He taught himself to code by reading code, and he built Fumadocs, a docs framework you can break, which copies its pieces into your own codebase. Vercel Turborepo, shadcn/ui, BetterAuth and Unkey use it, he has put hundreds of hours into it on top of his schoolwork, and it is General Translation's first open-source grantee.

- **Hook (0 to 3 s):** the post's own surprise, said plainly: he just completed high school last year.
- **Turn:** someone who never read documentation built a documentation framework. On screen, the docs page vanishes on "documentation" and returns as a page that breaks into parts.
- **Payoff:** the teams that use it appear with their logos and GitHub stars, and then "on top of his schoolwork" rises in the same place as the opening sentence, with its key word lit in the same fire. The grant line follows as a short final line and leads into the GT end card.

## Length and pace

- **Film:** 42.0 s at 60 fps, 1920 x 1080. Eight lines from 0.25 to 37.30 s, then the shared end card from 38.0 to 42.0 s, silent.
- **Words:** 88 spoken words in 8 lines. The excerpts are the post's sentences and quotes word for word: 49 words, 56 percent (line 3's two quotes, 18 words; line 4, 11; line 5's predicate, 8; line 6, 12). The connecting lines are built from the post's own phrases.
- **Pace basis:** Clara's eight current takes in this film read 112 words in 44.36 s of speech (2.53 words a second, 14.5 characters a second). Her plain sentences run 16.3 to 18.2 characters a second (vo-1 to vo-4). Her list line (vo-7) runs 3.66 syllables a second, with 0.23 to 0.53 s pauses between names. The planned speech totals 34.6 s (2.54 words a second, her own rate). Every line's estimate below comes from her measured word durations in vo-1 to vo-8 ("Fumadocs" 0.61 to 0.64 s, "documentation sites" 1.29 s, "General Translation's" 1.04 s, list names 0.57 to 0.66 s).
- **Gaps:** 0.30 to 0.40 s between lines (the current cut has 0.55 to 0.99). The film opens with 0.25 s of music before the first word. The last word ends 0.70 s before the end card, so the grant's pulse can land first.
- **Cuts:** all on the 0.5 s beat, at 0, 7.5, 11.0, 14.5, 21.5 and 33.5 s, with the card at 38.0 s. Inside shot 1, the moving-type transition lands on the 4.5 beat. No line runs longer than 7.6 s, and the picture changes every 1 to 3 s.

## Voice

- **Narrator:** Clara, from `kit/audio/voice.json` (eleven_multilingual_v2, stability 0.65, style 0.2, speed 1.0). Never slow a take below 1.0 and never speed one up. Record one request per line with `--prev` and `--next`, using the request text exactly as in the table below with its curly quotes, except for the respellings listed here.
- **Takes:** seven new requests (lines 1, 2, 3, 5, 6, 7 and 8). Line 4 is vo-4 word for word, so reuse `audio/vo-4.mp3` if it leads into line 5 naturally. If its falling end sounds final before line 5, retake it once with `--prev` set to line 3 and `--next` set to line 5. Line 3 is one request that holds both quotes, so the attribution sits naturally between them. Move the old takes vo-1 to vo-3 and vo-5 to vo-8 to `audio/archive-r7d-final/` before the new takes are written.
- **Pronunciation:**
  - **Fuma Nama:** FOO-mah NAH-mah, two words.
  - **Fumadocs:** FOO-mah-docks. If a take splits it oddly, send "Fuma docs" in that request only.
  - **Vercel** (line 6): ver-SELL. Send "Ver-sell" in the request text only, as in the round 7d retake. `lib/cues.mjs` joins the respelt parts back into "Vercel".
  - **shadcn/ui** (line 6): audition "shad C N U I" in the request text and check it with `el.mjs hear`. The script and the screen keep "shadcn/ui".
  - **BetterAuth** (line 6): send "Better Auth".
  - **UI** (line 5): send "U I".
  - **Unkey:** UN-key, kept as Clara says it. The transcriber writes "Anki", as in every earlier run, and the mark rises on the name.
  - **Quotes** (line 3): say "he said" lower and after a short pause, as vo-1 does before "said" (0.26 s). Expect a pause of about 0.4 s between the two quotes and about 0.48 s at the comma before "just".
- **Credit check:** after the takes, run `el.mjs hear` on every take and on the final, and require all 88 words in order.

## Lines

The times are planned from Clara's measured pace. The build retimes every event to each take's `.json` word times through `lib/cues.mjs`, as now. A word in quotation marks in the picture column is the spoken word the event lands on.

| n | planned | said | kind | source (fuma-nama.mdx, exact) | picture: what moves, on which word |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.25 to 3.10 | Fuma Nama just completed high school last year. | connecting | (Did you know he just completed high school last year?) | Shot 1. Ink and the field (0.0 to 0.6 s). The heading "Fuma Nama just completed / high school last year" is set by 0.45. On "high school" (1.75) those two words turn fire. |
| 2 | 3.40 to 7.15 | He created Fumadocs, a framework for documentation sites. | connecting | We’re excited to announce our first grantee project: Fumadocs, created by Fuma Nama. / Fumadocs is a beautiful and flexible React documentation framework. | On "Fumadocs" (4.15) the heading breaks into its 3 px glyph cells, which land at 4.5 as the moon's Bayer print. From 4.6 the print turns to glass and the wordmark "Fumadocs" rises beside it. On "documentation" (5.86) the docs page builds under the lockup. On "sites" (6.71) its table-of-contents highlight steps down one section. Hard cut at 7.5. |
| 3 | 7.55 to 14.30 | “I learned to code from files,” he said. “I didn’t look at any kind of documentation, just the code itself.” | excerpt (two quotes, the post's attribution between them) | “It’s kind of crazy. I learned to code from files. Like I would see a huge pile of JavaScript and read that,” he said. “I didn’t look at any kind of documentation, just the code itself.” (The first quote is the post's second sentence. Its period becomes a comma before "he said".) | Shot 2, the heap: the heading "“I learned to code / from files”" rises on the cut. The glyph rain falls from 7.55 and the last glyphs settle on the crest on "files" (8.73). Shot 3, hard cut at 11.0 during "any kind": the heading "“Just the code / itself”" rises on the cut. On the left is the docs page, and on the right is the file at tone 0. On "documentation" (11.67) the docs page lowers its tone to 0. On "just the code" (13.01) the file's lines light top to bottom, and the lit band lies across the middle block on "itself" (13.79). Hard cut at 14.5. |
| 4 | 14.65 to 17.67 | Fumadocs is built to be a docs framework you can break. | excerpt | In the Philosophy section of the Fumadocs documentation, Fuma defines the core thesis: Fumadocs is built to be a docs framework you can break. (The clause after the colon, word for word: vo-4.) | Shot 4, the docs page at full size: the heading "A docs framework / you can break" rises on the cut. Three doubled-line seams draw out of their crosses at 14.75, 15.05 and 15.35. On "break" (17.31) the four parts of the page move apart along the seams. |
| 5 | 18.00 to 21.30 | It can copy UI components directly into your codebase. | excerpt (the post's predicate, with "It" for "The framework") | The framework puts the route files in your repository, has you create the search handler, lets you call the content loader from your own code, and can copy UI components directly into your codebase via the CLI. | There is no cut. The parted page eases to the left half, and a code panel draws on the right. The heading becomes "Into your codebase" (18.0). On "copy" (18.30) the table-of-contents part lifts out and leaves a fire hairline outline. On "U I" (18.72) a short connector draws. On "components" (19.25) the part travels into the code panel. On "directly" (19.97) the panel's rows open a gap, and on "into" (20.5) the part seats in it. On "codebase" (20.92) a sun highlight runs down its curved line. Hard cut at 21.5. |
| 6 | 21.65 to 29.25 | Fumadocs is used by Vercel Turborepo, shadcn/ui, BetterAuth, Unkey, and many others. | excerpt | Fumadocs is used by Vercel Turborepo, shadcn/ui, BetterAuth, Unkey, and many others. (Link markup removed.) | Shot 5, the shelf: there is no heading. On "Fumadocs" (21.65) the moon's 13.3k rises and tallies. On "used by" (22.37) the rule draws. Each mark and its stars light on its own name: Turborepo on "Vercel" (22.97), shadcn/ui on "shadcn" (24.78), Better Auth on "BetterAuth" (26.35) and Unkey on "Unkey" (27.40). Orama comes in on "many" (28.42) and the GT mark in fire on "others" (28.78). The post names both as users. |
| 7 | 29.55 to 33.15 | He has put hundreds of hours into it on top of his schoolwork. | connecting | Over the past three years, Fuma Nama has continued building and maintaining the framework, investing hundreds of hours on top of his schoolwork and other obligations. | There is no cut, and the full shelf holds. The heading "On top of / his schoolwork" rises at 29.43 in the place where the hook stood. On "schoolwork" (32.45) the word turns fire, as "high school" did at 1.75. Hard cut at 33.5. |
| 8 | 33.55 to 37.30 | Fumadocs is General Translation’s first open-source grantee. | connecting | We’re excited to announce our first grantee project: Fumadocs, created by Fuma Nama. / About General Translation Open-Source Grants (the post's callout title) | Shot 6, the grant: the heading "First open-source / grantee" rises on the cut. The GT mark stands in the end card's own mark box. On "Fumadocs" (33.55) the moon lights, and on "General Translation’s" (34.41) the GT mark forms in smoke. On "first" (35.55) the connector draws from the mark to the moon. On "grantee" (36.73) a fire pulse runs into the moon, which thickens at 37.23. Hard cut at 38.0 to the card. |

## Shot list

The same rules apply to every shot.
- **Field:** the dithered fire gem-smoke field, kept from the current cut. Mount A is printed through the 8 by 8 Bayer screen on one 3 px cell grid anchored at (0, 0), in black, ember `#7a2a08` and fire `#fe5b16`, with its black cells transparent. It turns on one slow clock from the first frame to the card. It is held off every heading and object by zones drawn from their own ink, the round 7d zones and distances.
- **Type:** Inter 500 through `var(--font)` in sentence case, at most two lines, seated at x 160 with cap tops at y 172.
- **Not used:** no frame, no eyebrow, no caption, no monospace and no URL.
- **Headings:** every heading is words spoken in its shot. A heading that arrives on a cut starts its mask rise 0.067 s before the cut (expo.out 0.4, lines 60 ms apart).
- **Colours:** only the material's black, ember, fire, sun `#f7ff61` and white, plus raised ink `#101010` for interface panels.
- **The docs page:** one object, used at four scales, rebuilt in the film from the post's two images (`kit/blog/fumadocs-landing.png`, the docs preview inside the landing page, and `kit/blog/fumadocs-slider.png`, the table of contents).
  - It is vector, with raised-ink `#101010` panels, square corners and 1 px hairline seams (`rgba(242,242,240,0.11)`).
  - The nav bar carries the Fumadocs moon at 28 px (`kit/logos/fumadocs.png`, its own drawing) and no text.
  - The sidebar has six token bars, and the content column has a white title bar over five ember paragraph bars.
  - The table of contents has six short bars with the curved line beside them. As in the slider image, the line jogs right where nested entries sit and has a dot at its top. The active stretch is sun and the rest is ember.
  - Full size is 1600 x 480: the nav is 68 px tall, the sidebar 320 px wide, the content 920 px wide and the table of contents 360 px wide.
  - There is no readable text on the page, so it never competes with the heading.

### Shot 1, the hook (0.0 to 4.5)

- 0.00: the film opens on ink. The field raises its tone from 0 in Bayer order and is full by 0.6 s.
- 0.05: the heading "Fuma Nama just completed / high school last year" rises out of its masks at 112 px in white, and is fully set by 0.45. The lower two thirds of the frame show the field alone.
- 1.75, "high school": those two words turn fire `#fe5b16` over 0.3 s. This is the film's first accent, and it matches the payoff's "schoolwork" at 32.45. The heading holds 3.70 s, which meets the 3.67 s floor for 8 words.
- 4.15, "Fumadocs" (line 2): moving type, transition (d).
  - The heading breaks into its 3 px glyph cells in reading order. The first cells leave at 4.15 and the last at 4.30.
  - The cells travel right on seeded paths (power2.inOut, 0.2 to 0.35 s each) and land by 4.50 as the Fumadocs moon's Bayer print: a disc of r 230 at (1390, 400) in black, ember, fire and sun.
  - The disc's remaining cells raise their tone from 0 between 4.30 and 4.60 on a smoothstep.

### Shot 2, the lockup (4.5 to 7.5)

- 4.60 to 5.00: the print tone-mixes into the glass moon, inside the disc only (smoothstep 0.4). The glass is mount B, `kit/gem-shapes/fumadocs-moon.png`, with outer glow 0 and clipped 1 px outside its limb.
- 4.60: the wordmark "Fumadocs" (150 px, white) rises at x 160 on the moon's centre line, y 400 (expo.out 0.5). Moon and name stand as a lockup, as on Fumadocs' own site.
- 5.86, "documentation": the docs page builds at 0.6 scale, 960 x 288 at x 160 to 1120 and y 672 to 960. Its panels rise (expo.out 0.5), then its nav, sidebar, content and table of contents fill 60 ms apart from left to right, done by 6.7.
- 6.71, "sites": the table-of-contents highlight steps down one section (power2.inOut 0.35), so the page reads as live.
- Hard cut at 7.5.

### Shot 2b, the heap (7.5 to 11.0), kept from the current cut's line 1

- 7.43: the heading "“I learned to code / from files”" rises (130 px, quotation marks hung outside the x 160 axis) and is set by 7.85.
- 7.5, hard cut: the glyph heap fills the lower right two thirds of the frame, with its glyphs on the 18 px grid in white, sun, fire and ember, lit by mount A sampled once.
- 7.55 to 8.73: a glyph rain falls (ease none) and condenses base first. The last glyphs settle on the crest on "files" (8.73).
- From 8.73 the heap holds while its light drifts by less than 3 percent of each glyph's size. Heading 1 holds 3.15 s before the cut, which meets its 3.0 s floor.
- Hard cut at 11.0, in the middle of "any kind". The cut must not land inside "files" or "he said".

### Shot 3, the file (11.0 to 14.5), the file kept from the current cut's line 2

- 10.93: the heading "“Just the code / itself”" rises (130 px). It is a fragment of the spoken quote, with its first letter capitalised as a heading.
- 11.0, hard cut. On the left is the docs page at 0.45 scale, 720 x 216 at x 160 to 880 and y 560 to 776. On the right is the file: 25 lines of token bars with real code indentation at x 975 to 1736, its top lowered to y 450 so that the heading keeps its 44 px clearance. The file is at tone 0.
- 11.67, "documentation": the docs page leaves by a tone mix on the 3 px grid. Its cells switch off in Bayer order (0.6 s smoothstep) and are gone by 12.27, and the field returns into its zone.
- 13.01, "just the code": the file's lines raise their tone from 0, top to bottom and 40 ms apart, done by 14.0. They are printed through the Bayer screen in black, ember, fire and sun. The smoke behind the print runs at half rate, re-anchored so that the lit band lies across the middle block on "itself" (13.79).
- Hard cut at 14.5.

### Shot 4, the page breaks (14.5 to 21.5)

- 14.43: the heading "A docs framework / you can break" rises (130 px) and is set by 14.85. Its floor is 3.0 s, and it holds until 18.0.
- 14.5, hard cut: the docs page at full size, x 160 to 1760 and y 480 to 960, with its table-of-contents highlight lit.
- 14.75, 15.05 and 15.35: three doubled-line seams draw out of registration crosses (expo.out 0.5 each). They are the current cut's moon seams: a 7 px white gauge under a 3 px black core.
  - The nav seam is horizontal at y 548, from a cross at x 136 to x 1784.
  - The sidebar seam is vertical at x 480.
  - The table-of-contents seam is vertical at x 1400.
  - Both vertical seams run from the nav seam to a cross at y 984.
- 17.31, "break": the four parts move apart along the seams (power3.out 0.4, snapped to the 3 px cell). The nav rises 24 px, the sidebar moves left 36 px and the table of contents moves right 36 px. The field is black in the gaps.
- 17.75 to 18.35: the parted page eases to 0.625 scale about its left edge, to x 160 to 1160 and y 480 to about 790 (power2.inOut 0.6).
- 18.0, line 5: the heading cuts to "Into your codebase" (130 px, one line), set by 18.4.
- 18.0 to 18.6: the code panel draws on the right, a raised-ink panel at x 1280 to 1760 and y 420 to 960 with square corners. Its 1 px edge draws out of its top-left cross (expo.out 0.6). Then 18 rows of token bars with real indentation, in white and ember (the file's language from shot 3, now your code), rise top to bottom 40 ms apart, from 18.2 to 18.9.
- 18.30, "copy": the table-of-contents part lifts 24 px up out of the page (power2.inOut 0.4). Its place keeps a 1 px fire hairline outline, the current cut's slot outline.
- 18.72, "U I": a straight doubled-line connector draws from a cross on the part's right edge to a cross on the panel's left edge, x 1268 (expo.out 0.5).
- 19.25, "components": the part travels along the connector into the panel (power2.inOut 1.2).
- 19.97, "directly": the panel's rows part at its middle to open a gap of the part's height (power2.inOut 0.4).
- 20.5, "into": the part seats in the gap.
- 20.92, "codebase": a sun block runs down the part's curved line once (ease none, 0.5 s). This is the post's highlight travelling to the active section, now inside your code.
- Hard cut at 21.5.

### Shot 5, the shelf (21.5 to 33.5), kept from the current cut's line 7 and retimed

- 21.5, hard cut. The moon is glass, 460 px across at (1530, 530), with no outer glow and clipped 1 px outside its limb. A doubled-line rule runs at y 800 from x 160 to 1760, with a cross 16 px beyond each end, still undrawn. There is no heading, so the upper band is the field.
- 21.65, "Fumadocs": Fumadocs' count rises under the moon, left-aligned on its left limb: a sharp fire star and "13.3k" in Inter 500 tabular figures at 80 px. It tallies in GitHub's rounding to 13.3k by 22.65 (ease none).
- 22.37, "used by": the rule draws out of its left cross (power3.out 1.0).
- Each mark raises its tone from 0 on the 3 px Bayer grid on its spoken name (0.5 s smoothstep). The marks are white and drawn true from `assets/logos`, with their feet on y 760, on columns at x 160 + 180 i. The field clears around each mark 0.45 s before it rises. Its count, a fire star and the figure in Inter 500 tabular at 40 px, rises 0.12 s after it.

  | mark | count | lights on | time |
  | --- | --- | --- | --- |
  | Turborepo | 31.2k | "Vercel" | 22.97 |
  | shadcn/ui | 125k | "shadcn" | 24.78 |
  | Better Auth | 30.2k | "BetterAuth" | 26.35 |
  | Unkey | 5.5k | "Unkey" | 27.40 |
  | Orama | 10.6k | "many" | 28.42 |
  | GT mark, in fire | 1.1k | "others" | 28.78 |

- 29.43, line 7: the heading "On top of / his schoolwork" (130 px, white) rises in the hook's place, x 160 with cap top 172, and is set by 29.85. Its floor of 2.67 s is met by 32.5.
- 32.45, "schoolwork": the word turns fire over 0.3 s, as "high school" did.
- Hard cut at 33.5.

### Shot 6, the grant (33.5 to 38.0), the current cut's line 8 re-laid

- 33.43: the heading "First open-source / grantee" (120 px) rises and is set by 33.85. Line 1 ends near x 1282, 146 px clear of the mark.
- 33.5, hard cut, with innerGlow 0 on both shapes:
  - The doubled-line GT mark (`kit/gem-shapes/gt-mark.png`) is a glass shape in fire gem smoke on mount C, its own 614 px canvas. It sits exactly in the end card's mark box, x 1428 to 1760 and y 160 to 369, at the card's scale. This is `kit/endcard/endcard.js` LAYOUT: the mark's height equals the title's cap height plus one pitch, and its right edge is on x 1760.
  - The moon is glass on mount B, centre (1100, 740), r 180.
- 33.55, "Fumadocs": the moon lights (innerGlow 0 to 1, power3.out 0.8).
- 34.41, "General Translation’s": the GT mark forms in the smoke (innerGlow 0 to 1, power3.out 1.0).
- 35.55, "first": one doubled-line connector draws out of a cross under the mark at (1594, 393). It runs down to y 740 and left to a cross at the moon's limb, x 1292, as one path with a square corner (expo.out 0.7).
- 36.73, "grantee": a 160 px fire pulse runs along the connector into the moon (ease none 0.5), between the gauge and the core. When it arrives (37.23) the moon's smoke thickens inside its disc (innerGlow 1 to 1.4, power3.out 0.3) and settles by 37.8.
- 37.5 to 38.0: the GT mark's density eases to the card's opening state, the bloom's from 0.4 (power2.inOut 0.5). The cut then holds the mark in place.
- Hard cut at 38.0, 0.70 s after the last word.

## End card

- **Timing:** 38.0 to 42.0 s.
- **Card:** the shared series end card from `kit/endcard`, used as it is: `addEndCard(tl, { palette: 'fire', title: ['Fuma Nama: The philosophy', 'of an open-sourcerer'], url: 'generaltranslation.com/blog/fuma-nama', start: 38.0 })`. It shows the doubled-line GT mark in fire gem smoke (already in its place from shot 6), the post's title in two lines and the link, which is the film's only URL.
- **Composition:** the root `data-duration` is 42.0. Mounts A, B and C and the field stop drawing at 38.0.
- **Sound:** the card is silent, and the music resolves under it.

## Visual changes the build must make

These are listed against the current composition (`index.html`, round 8).

### Kept

1. **The field** (mount A's Bayer print, its zones drawn from each thing's own ink, its clock and tones) is unchanged. Only its zone windows move to the new times.
2. **The type system** stays: Inter 500 through `var(--font)`, the x 160 axis, cap tops at y 172, the mask rise, and the heading zones painted with the cv11 FontFace.
3. **The glyph heap and its rain** (current line 1) move to 7.5 to 11.0 under the new heading 1, with the crest on "files".
4. **The file of 25 token-bar lines with its lit band** (current line 2) moves to 11.0 to 14.5, lighting on "just the code" with the band on "itself". Its top is lowered to y 450. Its bar language is reused for shot 4's code panel.
5. **The doubled-line seams with registration crosses** (current lines 4 and 5) keep their gauge and draw-on, but now cut the docs page.
6. **The slot's 1 px fire hairline outline and the straight doubled-line connector** (current line 5) now belong to the table-of-contents part.
7. **The adopters shelf** (current line 7) keeps its moon, rule, crosses, columns, marks, star glyphs, 40 px and 80 px counts and per-mark field clearing. It is retimed to line 6's names, with Orama on "many" and the GT mark on "others".
8. **The grant picture** (current line 8) keeps the GT mark glass on mount C, the doubled-line connector, the pulse and the moon thickening, re-laid as in shot 6.
9. **The `addEndCard` call** is unchanged except `start` (50.0 to 38.0). The root duration goes from 54.0 to 42.0.

### New

10. **The hook frame:** the heading over the field alone, with "high school" turning fire on its words.
11. **The moving-type transition:** the hook heading's cells travel into the moon's Bayer print (4.15 to 4.5). It is the film's one use of MOTION.md transition (d).
12. **The Fumadocs lockup:** the glass moon at (1390, 400), r 230, and the 150 px wordmark.
13. **The docs page:** one vector object built from the post's two images, used at 0.6 scale (shot 2), 0.45 (shot 3), full size (shot 4) and 0.625 (shot 4 after "break"). It includes its live table-of-contents highlight and its exit by tone mix on "documentation".
14. **The page breaking:** three seams (nav, sidebar, table of contents) and the parting on "break".
15. **The code panel, and the table-of-contents part's journey into it:** the lift, the connector, the travel, the rows opening, the seat, and the sun run on "codebase".
16. **Line 7's heading in the hook's place,** with "schoolwork" turning fire.
17. **Shot 6's layout:** the GT mark in the end card's mark box, the moon at (1100, 740), r 180, and the connector with a square corner. The mark's density eases into the card's bloom.
18. **The headings,** each made of the words spoken under it:
    - "Fuma Nama just completed / high school last year" (112 px)
    - "Fumadocs" (150 px wordmark)
    - "“I learned to code / from files”" (130)
    - "“Just the code / itself”" (130)
    - "A docs framework / you can break" (130)
    - "Into your codebase" (130)
    - "On top of / his schoolwork" (130)
    - "First open-source / grantee" (120)
19. **Timing data:** `lib/cues.mjs` gets the new FIRST_SOUND (0.25, 3.40, 7.55, 14.65, 18.00, 21.65, 29.55, 33.55), CUTS (0, 7.5, 11.0, 14.5, 21.5, 33.5) and CARD (38.0), taken from the new takes' measured onsets. A new `CUE` table is copied into `index.html`.

### Removed

20. **The eight old headings,** each of which differed from the line spoken under it: "A huge pile of JavaScript", "The primary source", "Four modular layers", "Less magic", "Building blocks", "Designed to be that way", "Each site looks vastly different" and "Software for the public good".
21. **The glyph moon in 16 writing systems** (current line 6), with its per-glyph `lang` nodes. The post never mentions it.
22. **The 762 px glass moon scene with its crosses on "sites"** (current line 3), the glass-to-print switch at 14.0, the moon's four layers, their spread, and the band squaring off into a block (current lines 4 and 5). The seams and the slot outline survive on the docs page.
23. **The fire pulse along the shelf's rule from the GT mark to the moon** (end of current line 7). The grant's pulse now runs in shot 6.
24. **The old takes** vo-1 to vo-3 and vo-5 to vo-8, archived. vo-4 stays if it is reused.

## Sound plan

- **Music:** round 5's peaceful bed (`audio/archive-r6a/bed.mp3`: a low drone, a slow pulse and sparse low piano), re-cut to 42.0 s with `lib/make-bed.mjs`.
  - It uses passages A and B as now, with each join under a line and never in a gap (the gaps are now only 0.30 to 0.40 s). Run `--search` for any new join point.
  - The last passage runs into the source's own settle under the card.
  - It is mastered with round 5's EQ, as now.
- **Ducking:** as now, 5.8 dB on 0.3 s ramps that end 0.05 s before each line's first sound.
  - Because line 1 starts at 0.25 s, the bed enters already ducked and fades in from 0.0 to 0.2 s.
  - The duck holds flat across every gap, with no breath, since gaps of 0.30 to 0.40 s are too short to lift without pumping.
  - After line 8 the duck lets go over 0.8 s on a smoothstep to -1.5 dB for the card, and the bed fades over the card's last 0.8 s.
  - The 260 Hz dip and the hyperframes-audio carve (strength 0.3, `--flatten-carve-level`) stay as in round 7d.
- **Narrator:** one `hf-audio-group` bus at 0 dB. Each clip has a 20 ms fade in and a 60 ms fade out and ends 0.18 s after its last word. It is mastered by `lib/make-voice.mjs` as now: each take brought to -26.5 LUFS, then the compressor, then the limiter at -3.6 dBTP.
- **Targets:** narrator about -16 LUFS integrated, bed about -26 LUFS under speech and about -20 on the card, true peak below -1 dBTP. The audio stream must be exactly 42.0 s. Measure with `ffmpeg -i out.mp4 -af ebur128=peak=true -f null -`.

## If the takes run long or short

- **Retiming:** retime every event to the takes' word times (`lib/cues.mjs`). Each cut snaps to the 0.5 s beat that keeps the gap at 0.25 to 0.40 s and puts the next line's first sound 0 to 0.3 s after the cut. Never move a cut inside a word.
- **Reading floors** come first. A heading holds at least (words / 3) + 1 s after it is set: 3.67 s for the hook, 3.0 for heading 1 and for line 4's heading, 2.33 for "Just the code itself", 2.0 for "Into your codebase", 2.67 for "On top of his schoolwork" and 2.0 for "First open-source grantee". If a take is fast enough to break a floor, the cut moves to the next beat, and the gap may grow to 0.5 s at that one place.
- **Line 3's inner cut** (11.0) sits on the first beat after "he said" ends and at least 3.0 s after heading 1 is set. If the second quote starts later than 11.0, keep the cut at 11.0 in the pause between the quotes.
- **The moving type** starts on line 2's "Fumadocs" but never before 4.15 (the hook's floor). If "Fumadocs" comes earlier, the cells start at 4.15. They always land on the next beat.
- **Line 5's travel** needs 1.0 s or more between "components" and "into". If the take is faster, the part starts travelling on "U I" and the connector draws on "copy".
- **Long:** the film must stay at or under 44.0 s. If the takes run long, apply these in order:
  1. Tighten the gaps to 0.25 s.
  2. Cut to the card 0.45 s after the last word instead of 0.70, and start the pulse on "open-source".
  3. Retake the line that ran furthest over its estimate once, with `--prev` and `--next` (most likely line 6, the list).
  4. Change line 2 to "He created Fumadocs, a documentation framework." (the post's own noun phrase, about 0.6 s shorter), and record it once.

  Never speed up a take.
- **Short:** the card moves to the first beat at least 0.45 s after line 8's last word, and the film may run down to 41.0 s. Do not add holds anywhere else.

## Audit

### Facts (each checked in fuma-nama.mdx with the link markup removed; every string occurs exactly once)

| claim in the film | where it is in the post |
| --- | --- |
| He just completed high school last year. | "(Did you know he just completed high school last year?)" |
| He created Fumadocs. | "our first grantee project: Fumadocs, created by Fuma Nama." |
| Fumadocs is a framework for documentation sites. | "a beautiful and flexible React documentation framework"; "to build very different docs sites" |
| The two quotes, and "he said" | "“It’s kind of crazy. I learned to code from files. Like I would see a huge pile of JavaScript and read that,” he said. “I didn’t look at any kind of documentation, just the code itself.”" |
| A docs framework you can break | "Fumadocs is built to be a docs framework you can break." |
| It can copy UI components directly into your codebase. | "and can copy UI components directly into your codebase via the CLI." |
| The adopters | "Fumadocs is used by Vercel Turborepo, shadcn/ui, BetterAuth, Unkey, and many others." Orama: "used by companies like Vercel, Unkey, Orama, and yours truly". GT: "General Translation uses Fumadocs for our own documentation". |
| Hundreds of hours on top of his schoolwork | "investing hundreds of hours on top of his schoolwork and other obligations" |
| General Translation's first open-source grantee | "our first grantee project: Fumadocs"; the callout "About General Translation Open-Source Grants" |
| The star counts | From Kevin, read from GitHub: fumadocs 13,283 (13.3k; the post says "over 13,000 stars"), shadcn/ui 124,997 (125k), turborepo 31,159 (31.2k), better-auth 30,152 (30.2k), orama 10,569 (10.6k), unkey 5,456 (5.5k), gt 1,065 (1.1k). Rounded as GitHub rounds them. |
| The moon is Fumadocs' logo. | "The logo of Fumadocs is a circle that I would call the moon, Luna." |
| The heap of code characters | "Like I would see a huge pile of JavaScript and read that" |
| The docs page and its table-of-contents highlight | The post's images `fumadocs-landing.png` and `fumadocs-slider.png`; "a glowing block sliding behind it so the “active section” highlight travels along the line" |
| The page's parts and the part copied into your code | "pulling a single slot of a layout (for example, only the table of contents)" |

- **Quotes:** both quotes are said as quotes and attributed with the post's own "he said". The first quote takes a comma for its period before the attribution, the standard form, and nothing inside either quote is changed.
- **Not stated:** nothing from outside the post or Kevin's star counts is stated. The film says no company number, launch date or age.

### Writing rules (Kevin's, checked line by line)

- **Sentences:** every spoken line is a complete declarative sentence: lines 1, 2, 4, 5, 6, 7 and 8 in narration, and line 3 as two quoted sentences with their attribution.
- **Banned forms:** there is no metaphor or analogy ("break" is the post's literal term for taking the framework apart, and the picture shows that literally). There are no fragments for rhythm and no "X, not Y" or "not X but Y". There is no triad for rhythm: line 6's list is the post's list of names, and it is content. There are no rhetorical questions (line 1 turns the post's question into a statement), no exclamations, no em dashes, no signposts or labels and no hype words.
- **First person:** it appears only inside Fuma's quotes.
- **Repetition:** no idea is said twice. "Fumadocs" is spoken four times (lines 2, 4, 6 and 8) against six times in the current cut, and each time it is the subject of a new fact.
- **Headings:** the headings are phrases (brand headings take no trailing period). Every heading is words spoken in its own shot, so the screen never shows one sentence while the voice says another. "“Just the code / itself”" capitalises the quote's "just" as a heading's first letter, and that is the only typographic change to a quoted word on screen.
- **Screen rules:** no eyebrow, caption, label, byline or date appears. The only figures are the seven star counts. The only URL is on the end card. There is no monospace and no frame.

## How this script was chosen

I watched the current render (`out/blog-fuma-nama.mp4`, 54.0 s) at one frame a second. It has eight lines and 113 words, about 80 percent quotes strung together. Every heading differs from its spoken line on purpose. The subject first arrives at 9.6 s, the moon is on screen for 26 s straight, and three beats run 8 to 11 s.

Scores out of 10:

| script | interesting | clear | pace | faithful | rules | visuals | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A, the reveal | 8 | 7 | 8 | 8 | 9 | 8 | 48 |
| B, the problem | 6 | 6 | 7 | 7 | 7 | 9 | 42 |
| C, the one thing | 7 | 7 | 8 | 7 | 8 | 8 | 45 |

- **A wins.**
  - **Strengths:** it has the strongest hook for a stranger, the post's own flagged surprise said inside 3 s, and a payoff that closes it in the same place and the same fire. Every fact checks.
  - **Weaknesses:** it dropped the grant, which is why the post is on General Translation's blog and which MOTION.md asks the film to say plainly. Its line 6 estimate (6.56 s) was short of Clara's measured list rate (about 7.6 s). Its line 5 listed two mechanisms, and its picture turned a moon layer into a table of contents with no reason given.
- **B** has the best diagrams: the sealed isometric box, the copy rewritten by hand after a release, and the pulse that stops at the copy.
  - **Story:** it is a developer's problem with the person absent, and Fumadocs is not named until 12.5 s.
  - **Quotes:** line 1 drops the quote's opening "But" and recapitalises inside the quotation marks. Line 2 splices narration into a quote, which a listener cannot hear as a boundary. Lines 3 and 5 are marked as excerpts but reworded.
  - **Screen:** the "CLI" diagram label breaks round 4's no-labels rule.
- **C** has the most coherent visual thread: one table-of-contents line carries the whole film.
  - **Hook:** the opening admission is quiet.
  - **Facts:** "He meant the table of contents" states an inference as fact, since the post never says what "notice" refers to.
  - **Line 5:** it packs two ideas into 7 s.

### Grafts into A

1. **The grant line** (from B and C) is line 8, "Fumadocs is General Translation’s first open-source grantee."
2. **The docs page breaking along the seams** (from C's shot 4) is used in place of the moon. This makes "you can break" literal, and the docs that vanished on "documentation" come back as the thing that breaks.
3. **The table-of-contents part leaving its slot for your code** (from C's shot 5 and the current cut's slot and connector) shows line 5's single mechanism.
4. **The code panel's rows opening to receive the copy** comes from B's line 4.
5. **The GT mark seated in the end card's own mark box** (from C's shot 7) makes the cut to the card hold it in place.

### Fixes to A

1. **Line 5** is cut to the post's single predicate, "can copy UI components directly into your codebase". This saves about 2.4 s and keeps one idea.
2. **Line 6** is retimed to Clara's measured list rate.
3. **The moving type** starts at 4.15 so the hook meets its 3.67 s reading floor.
4. **Line 3's inner cut** moves to 11.0 so heading 1 meets its 3.0 s floor.
5. **The file's top** is lowered so heading 2 clears it.
6. **The ending** is ordered hours, then grant, so "it" in line 7 refers to line 6's Fumadocs and the grant leads straight into the GT card.
