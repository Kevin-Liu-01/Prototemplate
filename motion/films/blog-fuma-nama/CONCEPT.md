# blog-fuma-nama: the concept (round 7)

Fuma Nama learned to code by reading code instead of documentation, and he went on to build Fumadocs, a documentation framework that any developer can take apart and reshape. The pictures follow one object through the middle of the film: the Fumadocs moon is lit, printed and cut into four layers, gives up one layer to be reshaped, and comes back whole in glyphs from many writing systems before the GT mark closes the film.

The winner is r7-viewer (`motion/concepts/blog-fuma-nama/r7-viewer/`, key frames from `keyframes.html?f=1..7`, rendered by `render.mjs`). The earlier concept was moved, unread, to `CONCEPT-r6a.md`. The words, timings and sources are in `SCRIPT.md`.

**Material:** fire gem smoke only (`kit/gemsmoke.js`, palette 'fire'), shown as a glass shape or printed through the 8 by 8 Bayer screen (`kit/dither.js`) in its own tones: black, #7a2a08, #fe5b16, #f7ff61 and white. Every dithered field uses one 3 px cell for the whole film. Type is Inter 500 through `var(--font)`. The series frame has its rails and crosses, a blank counter, and the small doubled-line GT mark in the lower left margin, which is hidden on the end card. Headings start at x 160 with cap tops at y 172. Scene changes are hard cuts on the 0.5 s beat or tone mixes on one cell grid. Eases are expo.out or power3.out for arrivals, power2.inOut for moves, and none for processes.

## 1. The pile

- **Heading:** A huge pile / of JavaScript (140 px)
- **Picture:** A wide heap of code characters fills the lower right two thirds of the frame on black. The characters are braces, brackets, semicolons, equals signs and the letters of const, let, function, return, import and export. They are set on an 18 px grid as a glyph halftone, with each glyph's size and ink read from the fire gem smoke at a fixed time. The left flank faces the light in white and #f7ff61, the body is #fe5b16, and the shadowed right flank is small #7a2a08 glyphs. Glyphs tilt up to 15 degrees.
- **Motion:** The rails draw out of their crosses from 0.0 to 0.6 s (expo.out). From 0.2 s a glyph rain falls (ease none) and condenses onto the heap from the base up, with each glyph locking into its cell. The heading arrives at 0.5 s (expo.out, 0.6 s, lines 60 ms apart). After the crest lands, the smoke light drifts under 3 percent. Hard cut at 5.0 s.
- **Lands on:** "files" (about 3.1 s), when the last glyphs settle on the crest.
- **Judge's fix:** Remove any loose glyph within 60 px of the heading block. The still has a stray "/" at about (1340, 386), just right of "JavaScript".
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/blog-fuma-nama/r7-viewer/frames/f01.png`

## 2. The file

- **Heading:** The primary / source (140 px)
- **Picture:** One whole file sits in the right column, from x 975 to 1736. It has 25 lines of token bars with the indentation of real code and two blank lines between blocks. The bars are printed through the Bayer screen in black, #7a2a08, #fe5b16 and #f7ff61, lit by the fire smoke that passes beneath them. No character on screen is legible.
- **Motion:** Hard cut at 5.0 s. The lines raise their tone from 0 one at a time, top to bottom, 40 ms apart, and are done by 6.0 s. The smoke behind the print runs at half rate, so the lit band travels down the file. Hard cut at 11.0 s.
- **Lands on:** "itself" (about 10.4 s), when the brightest band lies across the middle block.
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/blog-fuma-nama/r7-viewer/frames/f02.png`

## 3. The moon

- **Heading:** Four modular / layers (150 px)
- **Picture:** The Fumadocs moon (`kit/gem-shapes/fumadocs-moon.png`, the logo's circle) as a glass shape in fire gem smoke. It is 762 px across and centred at (1355, 534). White and #f7ff61 smoke pools at the top, the body is #fe5b16, a bright filament runs along the lower limb, and a faint outer wisp shows on black. The moon sits in the column the file held in line 2.
- **Motion:** Hard cut to black at 11.0 s, with the heading landing on the cut (expo.out, 0.5 s). From 12.4 s the moon raises its own glow: innerGlow from 0 to 1 and outerGlow from 0 to 0.25 (power3.out, 1.5 s). The smoke inside turns at rate 0.4.
- **Lands on:** "Fumadocs" (about 13.9 s), when the moon is fully lit.
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/blog-fuma-nama/r7-viewer/frames/f03.png`

## 4. The seams

- **Heading:** Less magic (150 px, one line)
- **Picture:** The same moon in the same place, printed through the Bayer screen in black, #7a2a08, #fe5b16 and #f7ff61 and kept to its disc. Three doubled-line seams (a 6 px white stroke under a 3 px black core) cut it at quarter heights into four horizontal layers, one for each of the framework's four layers, with no labels. Each seam runs past the limb and ends in a registration cross. The layers stand 22 px apart.
- **Motion:** At 17.0 s a tone mix turns the glass moon into its Bayer print on one cell grid (smoothstep, 0.5 s). The seams draw out of their left crosses one per beat, at 17.5, 18.0 and 18.5 s (expo.out, 0.6 s each). On the key word the layers part along the seams by 11 and 33 px (power3.out, 0.4 s, snapped to the 3 px cell). The moon carries on into line 5 with no cut.
- **Lands on:** "break" (about 22.0 s).
- **Judge's fix:** Shorten each seam's left overrun so that its left cross sits at least 60 px clear of the heading. In the still, the top seam's cross at (888, 323) is about 20 px from "magic".
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/blog-fuma-nama/r7-viewer/frames/f04.png`

## 5. The piece

- **Heading:** Building / blocks (140 px)
- **Picture:** The layers stand further apart, at 15 and 42 px. The third layer has left its slot, and the slot keeps a 1 px hairline outline of the piece. The piece now sits at the left, reshaped from a curved band into a 552 by 270 px block. Its print is re-sampled onto the same cell grid, so its light still matches the moon. A straight doubled-line connector with a cross at each end joins the empty slot to the block.
- **Motion:** At 22.5 s the heading cuts and the layers spread (power2.inOut, 0.6 s). From 24.0 s the third layer slides left out of its slot (power2.inOut, 1.2 s, snapped to the cell), and its outline stays behind as one hairline drawn once. On the key word, the band's curved ends square off: its rows are re-sampled each frame from arc to rectangle on the same grid (power2.inOut, 0.8 s). At 30.0 s the connector draws out of the slot's cross toward the block (expo.out, 0.6 s).
- **Lands on:** "reshape" (about 29.3 s).
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/blog-fuma-nama/r7-viewer/frames/f05.png`

## 6. The glyph moon

- **Heading:** Designed / to be that way (120 px)
- **Picture:** The same moon is whole again in the same place, now printed in glyphs from 16 writing systems: Latin, Greek, Cyrillic, Hebrew, Arabic, Devanagari, Tamil, Kannada, Bengali, Thai, Georgian, Armenian, Ethiopic, kana, Han and Hangul, with a few code characters among them. Each glyph is one text node on a 30 px grid, with `lang` set so Arabic and Devanagari keep their shaping. Its size and ink are read from the same gem smoke frame: white and #f7ff61 at the lit top, #fe5b16 in the body, and small #7a2a08 glyphs on the shadowed limb.
- **Motion:** At 31.5 s the heading cuts and the pieces return to the circle (power2.inOut, 0.8 s), with the block taking back its band shape as it slides in. On "from scratch" (about 33.6 s) the Bayer print leaves by lowering its tone to 0 (0.5 s). From 34.4 s the glyph moon fills the same circle row by row from the top, in reading order (ease none, about 160 ms per row). Hard cut at 40.0 s.
- **Lands on:** "shape" (about 39.0 s), when the last row lands.
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/blog-fuma-nama/r7-viewer/frames/f06.png`

## 7. The end card

- **Heading:** Fuma Nama: The philosophy / of an open-sourcerer (104 px, centred, the post's exact title)
- **Picture:** The doubled-line GT mark (`kit/gem-shapes/gt-mark.png`) as a glass shape in fire gem smoke, above centre, with faint smoke around it. The title sits in two lines centred below it on black. The rails and crosses stay, and the small margin mark is hidden. Nothing else is on screen.
- **Motion (judge's fix):** Hard cut at 40.0 s. The title arrives on the cut (expo.out, 0.6 s, lines 60 ms apart) and is fully set by about 40.7 s. The mark's inner glow rises from 0 between 40.0 and 40.8 s (expo.out). The frame holds to 44.5 s, so the title stays up for 3.8 s against the 3.33 s reading floor. The treatment's title arrived at 40.5 s and held only about 2.8 s. The music bed resolves with a 0.8 s fade from 43.7 s.
- **Lands on:** nothing. The card follows the last spoken word, "shape".
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/blog-fuma-nama/r7-viewer/frames/f07.png`

## Build notes

- Build one paused timeline. At most one gem mount is live per scene: the heap's and the file's tone fields sample a smoke frame, and lines 3 to 6 reuse the moon's mount. Hide the gem canvas when only its print shows.
- The moon keeps one centre and one size from line 3 to line 6. Every change to it is a tone mix, a seam drawn once, or a move snapped to the 3 px cell, so the dither never resizes or swims.
- All key actions are retimed to the narrator's `.json` timings after the takes are generated (see `SCRIPT.md`, Timing).
- The film is 44.5 s and silent until the sound pass. Picture and sound must both read alone, and no beat depends on audio.

## Changes after judging (orchestrator, 2026-10-02)

- Line 3's heading is "Four modular / layers" in place of "The moon, Luna"; same size and placement.
- Line 7 (the end card) is narrated: "Fumadocs is General Translation’s first grantee project." The GT mark forms in fire smoke under the line, and the title arrives as the line ends and holds at least 3.4 s.

## Round 7b changes (Kevin, 2026-10-02; these override everything above where they differ)

- **Line 7 (new), the adopters.** Heading "Each site looks / vastly different". The picture: the teams that use Fumadocs, each a true logo from `kit/logos/adopters/` with its GitHub star count (star glyph and GitHub's rounding: shadcn/ui 125k, Turborepo 31.2k, Better Auth 30.2k, Orama 10.6k, Unkey 5.5k, General Translation 1.1k), arranged around or out of the Fumadocs moon, with Fumadocs' own 13.3k stars largest; in the fire material (logos keep their drawing; render them in white or the fire tones on black, never in their own brand colors). The key action lands on "Vercel". This beat is the one place counts appear on screen.
- **Line 8, the grant.** Heading "Software for / the public good". The moon and the GT mark together, joined by a doubled-line connector, in fire gem smoke; it leads into the end card.
- **End card:** the shared series end card from `kit/endcard/` with this film's palette, title and link `generaltranslation.com/blog/fuma-nama`, silent. It replaces the old line 7 end card.

## Lines 7 and 8 (round 7b key frames)

The working files are in `motion/concepts/blog-fuma-nama/r7b-adopters/`: `adopters.js` draws both lines as a pure function of the time after each line's cut, `keyframes.html?f=7|8&s=<seconds>` renders any moment, `render.mjs` writes the key frames, and `motion-test/` is a HyperFrames project (check passed, 0 errors, 0 warnings). Both lines share one layout grid. Every mark's bottom sits on y 760 (the mark line), and the moon stands at the right end of that line in both lines, so it holds still through the cut from line 7 to line 8. Times are seconds after the line's cut, with the planned film time in brackets. They are estimated at 3.8 syllables a second, with a 0.35 s pause at a sentence comma and 0.15 s at each list comma. Retime every action to the take's `.json` character timings and keep the cuts on the 0.5 s grid.

### 7. The adopters

- **Heading:** Each site looks / vastly different (130 px, x 160, cap top 172, as lines 1 to 6). The lines end at x 958 and x 947.
- **Voice:** "Fumadocs has since grown to over 13,000 stars on GitHub, and is used by companies like Vercel, Unkey, Orama, and yours truly." Planned from 0.4 to 10.7 s (40.4 to 50.7 s).
- **Picture, the moon:** the Fumadocs moon as a glass shape in fire gem smoke (`kit/gem-shapes/fumadocs-moon.png`), centred at (1530, 530) with radius 230 (x 1300 to 1760, y 300 to 760). It is drawn in a 718 px square host at scale 1 (the moon is 0.641 of the padded texture), with innerGlow 1 and outerGlow 0, so no smoke leaves the disc. The smoke phase is offset 38.6 plus 0.2 per second, which puts phase 40 (line 3's look: white and #f7ff61 pooled at the top, a filament on the lower limb) at the key frame. Its centre sits 4 px above the centre it held in lines 3 to 6 (y 534), so the cut from line 6's glyph moon reads as the same moon set smaller at the right.
- **Picture, the marks:** six marks drawn true in white on black, in the post's order, each left-aligned on a column at x 160 + 180 i (160, 340, 520, 700, 880, 1060) with its bottom on the mark line. Turborepo is 104 px tall, shadcn/ui 98, Better Auth 74, Unkey 92, Orama 98 and General Translation 88. These heights are set by eye so the six read at one optical size. The two round marks drop 2 px below the line, as round letters drop below a baseline. The files are in `r7b-adopters/logos/`:
  - `turborepo.svg`: thesvg's Turborepo mark (`kit/logos/adopters/turborepo-light.svg`) in one ink. The ring and three arcs keep their drawing, and the brand gradient is dropped.
  - `shadcn-ui.svg`: thesvg's two strokes with round caps, cropped to their extent.
  - `better-auth.svg`: thesvg's mark with its square ground removed.
  - `unkey.svg`: the U with its lower right cut, traced from the GitHub organization avatar. It is a polygon in the avatar's own pixel coordinates (the cut on x + y = 612.5, a 53 px corner radius), and the black ground is dropped.
  - `orama.svg`: the two rings, traced from the GitHub organization avatar as four circles fitted to the avatar's edges by least squares (IoU 0.977 with the thresholded avatar). The gradient and dark ground are dropped. `logo-check.png` shows each trace against its source.
  - `gt-mark.svg`: `kit/brand/gt-mark.svg` in white.
  - The Vercel triangle is not used. The figure under the first mark is the vercel/turborepo repository's, and the post names "Vercel Turborepo", so Turborepo's own mark carries it. A triangle with 31.2k would credit Vercel's whole organization with one repository's stars. The GitHub mark is not used either, because the star glyph already says what the figures count.
- **Picture, the rule:** one doubled line (a 6 px white gauge under a 3 px black core, the stroke of line 4's seams) at y 800, from x 160 to x 1760, with a registration cross 16 px beyond each end at (144, 800) and (1776, 800).
- **Picture, the counts:** each count hangs from the cap line y 840, left-aligned on its mark. It is a sharp five-point star in #fe5b16 at cap height (the brand draws no rounded corners), a 0.24 em space, then the figure in Inter 500 with tabular figures, in white. The adopters' counts are 40 px: 31.2k, 125k, 30.2k, 5.5k, 10.6k and 1.1k. Fumadocs' 13.3k is 80 px and is left-aligned on the moon's left edge at x 1300. It ends at x 1590 with its baseline at y 898, and it is the largest count. These seven figures are the only numbers in the film.
- **Picture, the frame:** the rails and crosses, a blank counter, and the small margin GT mark.
- **Motion:**
  - 0.0 s (40.0 s): a hard cut from line 6. The moon is at full glow on the cut. The heading arrives on the cut (expo.out, 0.6 s, lines 60 ms apart, rising 0.18 em with its opacity).
  - 1.7 s, "grown": Fumadocs' count arrives (expo.out, 0.5 s) and tallies from 0 to 13.3k in GitHub's rounding (ease none, as a process). It lands on "stars" at 3.8 s.
  - 7.3 s, "Vercel": the key action. The rule draws out of its left cross (power3.out, 1.6 s). As its head passes each column (7.30, 7.36, 7.43, 7.51, 7.59 and 7.68 s, so 62 to 95 ms apart in reading order), that mark raises its tone from 0 to 1 on a 0.5 s smoothstep. The mark is masked by the frame's own 3 px cell grid, anchored at (0, 0) like every print in the film, so its cells switch on in Bayer order, and at full tone it is exactly its vector drawing. Each count arrives 0.12 s after its mark (expo.out, 0.5 s). All six are set by 8.30 s, and the right cross appears when the rule completes at 8.63 s.
  - 9.9 s, "yours", to 10.6 s, "truly": a fire pulse runs the rule from under the GT mark (x 1130) to under the moon's centre (x 1530) at ease none. It is a third copy of the path in #fe5b16, 160 px long, drawn between the gauge and the core, so the two threads turn fire. Its tail closes from 10.6 to 10.8 s. The pulse tells the viewer that "yours truly" is the GT mark and sets up line 8.
  - 11.5 s (51.5 s): a hard cut to line 8. The moon's smoke turns at 0.2 the whole time, and nothing else moves after 8.63 s except the pulse.
- **Lands on:** "Vercel" (7.3 s, planned 47.3 s). The first mark lights on the word, and the other five follow within 0.38 s.
- **Holds:** the heading is fully set at 0.66 s and holds 10.8 s, against a reading floor of 3.0 s. The counts are set by 8.30 s and hold 3.2 s before the cut.
- **Key frame (s 9.0):** `$PROTOTEMPLATE/motion/concepts/blog-fuma-nama/r7b-adopters/frames/f07.png`
- **Motion test (the signature move, 4.5 s from s 7.0 to the cut, 30 fps draft):** `$PROTOTEMPLATE/motion/concepts/blog-fuma-nama/r7b-adopters/motion-test.mp4`

### 8. The grant

- **Heading:** Software for / the public good (130 px, x 160, cap top 172). The lines end at x 821 and x 980.
- **Voice:** "Fumadocs is General Translation’s first grantee project." Planned from 0.3 to 4.25 s (51.8 to 55.75 s).
- **Picture:** the moon unchanged from line 7: the same centre, radius, glow and smoke clock (phase offset 40.9 at the cut). The doubled-line GT mark is a glass shape in fire gem smoke (`kit/gem-shapes/gt-mark.png`, a 614 px square host centred at (366, 630), scale 1, outerGlow 0). It is 260 px tall and 412 px wide, at x 160 to 572 and y 500 to 760, with its left edge on the heading's x and its bottom on the mark line. At this size, the centre line of the T's doubled crossbar (y 310 of the mark's 222 to 977) falls at y 530, the moon's centre line. One doubled-line connector (6 px gauge, 3 px core) runs at y 530 from x 596 to x 1276, which stops it 24 px short of the T's arm and of the moon's limb, with registration crosses at (584, 530) and (1288, 530). It reads as the T's arm carried across to the moon. The margin GT mark is hidden, as on the end card, because the GT mark is the subject. There is no count, logo or other type.
- **Motion:**
  - 0.0 s (51.5 s): a hard cut. The moon holds its place through the cut. The heading arrives on the cut (expo.out, 0.6 s, lines 60 ms apart). The GT mark is at innerGlow 0, so nothing shows at its place.
  - 1.35 s, "General": the GT mark forms in fire smoke as its innerGlow rises from 0 to 1 (power3.out, 1.2 s), the same way the moon lit in line 3.
  - 2.95 s, "first": the key action. The connector draws out of the GT mark's cross toward the moon (expo.out, 0.6 s), from the grant's giver to its grantee and in reading order. It reaches the moon's cross on "grantee" (about 3.2 s), and the cross appears when the line completes.
  - 3.7 s, "project": a fire pulse (160 px, #fe5b16 between gauge and core) runs the connector from the GT mark into the moon (ease none, 0.6 s). Its tail closes by 4.5 s.
  - 5.5 s (57.0 s): a hard cut on the beat to the series end card (`kit/endcard/`), with this film's fire palette, the title in two lines and `generaltranslation.com/blog/fuma-nama`, silent, as SCRIPT.md's round 7b changes set it. Nothing from line 8 carries into the end card except the fire material and the rails. `kit/endcard/` did not exist when these frames were made. If its mark turns out to sit where line 8's GT mark sits, the cut can become a hold on the mark.
- **Lands on:** "first grantee" (2.95 to 3.2 s, planned 54.45 to 54.7 s), when the connector joins the GT mark to the moon.
- **Holds:** the heading is set at 0.66 s and holds 4.8 s, against a reading floor of 2.7 s. The connector is complete by 3.55 s and holds 1.95 s.
- **Key frame (s 4.6):** `$PROTOTEMPLATE/motion/concepts/blog-fuma-nama/r7b-adopters/frames/f08.png`

### Build notes for lines 7 and 8

- Gem mounts: line 7 uses one (the moon) and line 8 uses two (the moon and the GT mark), both square hosts smaller than the frame. That is within the two-mount limit. Neither shape has any outer glow, so no smoke reaches the heading or the counts. In the key frames, the moon's rim glow ends at y 799, 40 px above the counts' cap line.
- The six traced and recolored marks live in `r7b-adopters/logos/`. Copy them into the film's own assets, or ask the kit lead to add them to `kit/logos/adopters/`.
- The star counts are SCRIPT.md's figures (GitHub API, 2026-10-02) in GitHub's rounding: one decimal place under 100,000, whole thousands above it.
- Planned length: line 7 runs 11.5 s and line 8 runs 5.5 s, so the end card starts at 57.0 s if lines 1 to 6 keep their 40.0 s. If the takes run shorter, take the slack out of line 7's hold after 8.63 s first, never out of the heading's reading floor.
