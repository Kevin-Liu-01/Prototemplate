# journey-to-the-west: critique 2 (fresh eyes)

Critic pass 2, 2026-10-03, on `motion/out/_draft-journey-to-the-west.mp4` (100.0 s, 1920 x 1080, 30 fps draft, AAC 100.0 s). Written before reading CRITIQUE-1.md.

How it was watched: every half second as a labelled contact sheet; full-size single frames at every move that crosses a plate (34.9 to 35.5, 38.0 to 42.0, 69.6 to 71.0, 82.1 to 82.3, 84.4 to 85.1) and at the held frame of every beat; the audio by ebur128 on the file, RMS in 0.25 s windows across the film, each stem measured, the takes' speech-to-text ledger and the narrator's word times read against the picture. Every sentence on screen and in the narration was checked against BRIEF.md sections 2 to 5.

## Verdict

The idea reads, and the best frames are studio frames: the 1592 contents falling to thirty (9.0), the boxed 悟 column against Richard's and Jenner's boxed columns (60.0), the renderings card (76.0) and the close with Waley's and Lovell's identical rows in one box (98.0). The facts hold: every date, name and hedge on screen and in the narration agrees with the BRIEF, and the contested items stay hedged. The mix measures -16.0 LUFS integrated with a true peak of -1.8 dBTP, and the audio is as long as the video.

What keeps it from delivery is one recurring craft fault and a few clarity gaps. Four times the film's type travels across a print still at full tone, so for a third to half a second the frame is two layers of ink fighting (35.0, 69.6, 82.2, 84.6). The opening holds three and a half seconds of a faint grey strip on white. A stranger meets "Richard" in the narration two beats before the screen says who he is, and in the allegory beat cannot tell which alchemical name belongs to which pilgrim.

## Defects, with time and fix

### Major

1. **0.0 to 3.5 · the opening is faint and empty.** The first frame is a title column at a third of its tone in the right sixth of the frame and white paper everywhere else; for 3.5 s the only firm marks are the box and the credit. The first image of the film never shows the print as print, which is the film's whole grammar (a name enters as print, then the type lands and the scan falls away).
   - Fix: the title column stands at full tone from the first frame. The box draws at 0.5, the type lands at 1.0, and the plate lowers to a third from 1.0 (0.6 s, power2.in), as every other registration in the film does.

2. **34.95 to 35.6 · 猢猻 travels across the full-tone naming passage.** The plate's fall starts on the same frame as the travel with power2.in, so at 35.1 to 35.4 the print is still about 90 percent ink and the two characters cross 化, 系 and 好 at full strength (frame 35.3: 猢 sits on 系者, 猻 on 嬰).
   - Fix: lift the boxes and start the plate's fall at 34.55, at the end of "macaque" (word time 33.90, line end 34.55), so the print is two thirds gone when the travel begins at the reader's 猢猻 (34.95).

3. **69.5 to 70.1 · 弼馬溫 travels across the full-tone chapter 4 column.** The plate lowers from 69.5 with power2.in while the three characters leave from 69.5; at 69.8 溫 is over 冷 and 一 at full tone and the printed column shows the knock-out holes.
   - Fix: the box lifts and the plate lowers from 69.0 (the narrator's "stables" ends 68.65), so the plate is at a third before the travel starts at 69.5.

4. **82.0 to 82.4 and 84.5 to 85.2 · 心猿, 木母 and 金公 travel across the full-tone contents.** Same fault. At 82.25 心 is drawn over 賂; at 84.7 母 lies over 助威.
   - Fix: 心猿: the plate and its box fall from 81.75 (type landed 81.5 + 0.2), travel at 82.0 unchanged. 木母 and 金公: the plate lowers from 84.2 (木母 landed at 84.0 + 0.2), boxes lift with it, travel at 84.5 unchanged.

5. **44.35 · "Richard" is named before the film says who he is.** The narrator says "Richard and Waley both drop this analysis." over a held 孫 "Sun"; the screen names no Richard until the tag RICHARD, 1913 at 54.0, and never gives his first name before the closing credit. A stranger hears a surname with no book behind it, and the picture does nothing while the line says what the translators did.
   - Fix: on the line, two translator tags rise under "Sun": TIMOTHY RICHARD, 1913 on "Richard" (44.35) and ARTHUR WALEY, 1942 on "Waley" (44.83). On "drop" (45.45) an empty rule in tint draws under each tag: the film's own sign for what a translator left out (beat 7). Nothing is struck out.

6. **84.5 to 93.5 · which alchemical name is whose is never shown.** The narrator says "give Monkey and Pig alchemical names", and the rows then run 心猿, 木母, 金公 with the glosses "Wood Mother" and "Metal Lord". Nothing on screen or in the narration says that 金公 is Monkey and 木母 is Pig, and the rows run in the opposite order to the sentence.
   - Fix: the glosses name the pilgrim: "Wood Mother, for Pig" and "Metal Lord, for Monkey" (BRIEF ¶9: 金公 for Monkey, 木母 for Pig). The row order stays (it is the chapter 86 title's order, and critic pass 1's reason for it holds).

### Minor

7. **37.0 to 42.0 · "macaque" stays under 胡 after the word is broken.** The gloss belongs to the word 猢猻. From 38.5 it travels to sit under the set-aside 胡, where it reads as the meaning of 胡.
   - Fix: "macaque" leaves when the word breaks: it fades out over 0.5 s from 38.5 as 胡 turns to tint, in place.

8. **38.5 to 42.0 · the set-aside parts crowd each other.** The two lifted 犭 stand at x 160 to 375, y 130 to 410, and 胡 is set at x 360 to 630, y 345 to 615: the second radical's foot and 胡's top-left corner overlap by about 15 px by 65 px (frame 39.3).
   - Fix: set 胡 aside 70 px lower (its em box at y 400), so it sits below and right of the radicals with clear paper between them.

9. **0.0 to 4.0 · the music enters at 4.0, not with the film.** `build_mix.py` places the take's first note at BED_AT 4.0 so its closing clarinet decays into the film's last second (the take is 95 s long). The narrator opens at 0.5 over room tone and effects. This is a choice, and the entry lands on "Monkey" (3.45 to 4.1); it is listed so the next editor knows it is deliberate. No change.

10. **58.3 · the take n10's speech-to-text heard "Waley calls the monkey Pigsy and Sandy".** The picture types Monkey, Pigsy and Sandy on their words, so the meaning reads with the sound off. Add a listening item to NOTES.md (an English listener confirms "them Monkey" is heard); a retake only if it fails. No change to the cut.

11. **47.0 · the three 悟 stand from the cut, before "share" (49.43).** Deliberate (b5.js: the beat's first frame is not empty), and the box still draws on "share". No change.

### Checked and clean

- Facts: every on-screen string and spoken line against BRIEF.md sections 2 to 5. "Dated 1592 by most scholars" and "read as 1592" (item 16), "attributed to Wu Cheng'en" and the anonymous 1592 edition (item 15), "printed 1626" (item 17), "from 1982" with no volume count (item 20), "usually heard as" with no source named (item 22), Lovell only with the names item 13 verifies, Richard's plates "after an unnamed Chinese illustrated edition", the NCL scan never called the NPM copy. No Hayes title page, no Waley page or jacket, no portrait of Wu Cheng'en.
- Waley's chapter list sums to 30; the counter lands on "30 of 100" with the last column.
- Text margins: credit lines from x 160 with their last baseline at y 960 or above; no text within 120 px of an edge. The 悟 column's box hairline stands at x 146, a hairline and not text.
- Sound: integrated -16.0 LUFS, true peak -1.8 dBTP, LRA 3.1 LU, dialogue stem -16.1 LUFS, bed ducked -26.6 LUFS (-20.0 alone), effects -42.7 LUFS. Audio and video both 100.000 s. The bed fades from 99.2 and the last half second is silent under the held close.
- Determinism: see "What was fixed" below; the film was rendered three times after this pass and compared.

## Against CRITIQUE-1.md (read after the findings above)

- No regression of pass 1's ten fixes. The paper knockouts are in every box and still leave with or lower with their plate; the 孫 close is the reversed opening, with no needle (frames 41.4 to 41.8); the swap and the card re-set are clean; "Journey to the West" and "胡適 Hu Shih" meet their reading floors; the counter runs on the columns' clock; the mix is at -16.0 LUFS.
- Pass 1 left the sparse opening (its "Left as they are", item 2) as designed. This pass keeps the design and changes one thing in it: the title column opens at full tone and lowers to a third as the type lands, which is the film's registration grammar.
- Pass 1 fixed the doubled print with knockouts but kept each plate's fall on the frame the type leaves it. Defects 2 to 4 above are the remainder of that fault: the knockout leaves with the plate, so the moving type crossed the full-tone print. Moving the falls earlier finishes pass 1's fix.
- Pass 1 re-ordered beat 7's rows to 心猿, 木母, 金公 so the paths do not cross. That order stays; defect 6 is answered in the glosses.
- Pass 1 did not re-run the two-render check; this pass did (below).

## What was fixed

Changed files: `lib/b1.js`, `lib/b4.js`, `lib/b6.js`, `lib/b7.js`, `NOTES.md`. No sound file, take, cue or clip time changed, and no move that carries a sound cue changed its time (the slides at 34.95, 69.5, 82.0 and 84.5 still start their travels).

| # | fixed | how it was checked |
| --- | --- | --- |
| 1 | The title column opens at full tone; the box draws at 0.5, the type lands at 1.0, and the column lowers to a third from 1.0 (0.6 s, power2.in). | New draft frames 0.0, 0.5, 1.0, 1.3, 1.6, 2.0. |
| 2 | Beat 4: the boxes, the knockouts, the scan and its credit fall from 34.5 (0.6 s, power2.inOut), so the scan is seven eighths gone at 34.95, when 猢猻 starts to travel. | Frames 34.4, 34.6, 34.8, 34.95, 35.1, 35.25, 35.4, 35.6: the characters cross white paper. |
| 3 | Beat 6: the box lifts and the chapter 4 plate lowers to a third from 69.0 (0.5 s, power2.inOut), with its knockout; the travel stays at 69.5. | Frames 68.9 to 70.1: the plate is at its third before 溫 leaves it. |
| 4 | Beat 7: the chapter 14 plate, its box, knockout and credit fall from 81.75 (0.45 s, power2.out); the chapter 86 plate lowers from 84.2 (0.5 s, power2.out) with its boxes and knockouts. Travels unchanged at 82.0 and 84.5. | Frames 81.6 to 82.3 and 84.1 to 85.2. |
| 5 | Beat 4: TIMOTHY RICHARD, 1913 rises under "Sun" on "Richard" (44.35) and ARTHUR WALEY, 1942 on "Waley" (44.83), either side of the centre line; an empty rule in tint draws under each on "drop" (45.45, 0.45 s, 90 ms apart). Tags are typed silently, as all tags are. | Frames 44.5, 45.0, 45.6, 46.5. |
| 6 | Beat 7: the glosses read "Wood Mother, for Pig" (85.0) and "Metal Lord, for Monkey" (85.4). | Frames 85.2, 86.3, 88.0; complete at 85.8 and 86.25, held to 93.5. |
| 7 | "macaque" fades in place from 38.5 (0.5 s) and no longer travels under 胡; it is out of the 42.0 fade list, so it never reappears. | Frames 37.5, 38.6, 39.0. |
| 8 | 胡 is set aside at y 400 (was 330), clear of the radicals' feet. | Snapshot 41.0 at full size: no overlap. |
| 9, 10, 11 | Left as they are (see above). The n10 listening item is now in NOTES.md, "Native listener approval". | |

**The new draft.** `motion/out/_draft-journey-to-the-west.mp4` re-rendered with `--quality draft --fps 30 --workers 3`: 3000 frames, audio and video both 100.000 s, -16.0 LUFS integrated, true peak -1.8 dBTP, LRA 3.1 LU. `npx -y hyperframes@0.8.106 check .` passes (0 errors, 0 warnings, contrast 95/95). A grey scan of all 3000 frames finds no blank frame (darkest mean 224 of 255) and no single-frame flicker; the largest frame-to-frame changes are the cuts and the card re-set at 73.1. Against the critique 1 draft, the frames from 50.0 to 63.0 are pixel-identical and the frames of beat 8 differ only by encoder noise (PSNR 58 dB): only the moves listed above changed. The contact sheet `motion/out/_sheets/_draft-journey-to-the-west.png` was re-made with `tools/sheet.py`.

**Determinism.** Three renders after the last edit (A, B, C) match on all 3000 frames by `framemd5`. The audio does not: A's decoded audio is sample-identical to the critique 1 draft, while B and C match each other and differ from A from 8.7 s on by a residual of -45 to -55 dBFS, at zero lag, and both sit the same distance from the sound lane's reference mix (`sound/mix/draft-mix.wav`, -47 to -54 dB residual including the AAC). The renderer's audio mixdown has two outcomes between runs; it is not audible as a change of timing or level, but it is not sample-identical as NOTES.md said before. The installed draft is render A. Before the final, render it twice and compare the decoded audio; if it still varies, mix the clips to one WAV with `sound/tools/build_mix.py` and place that single file, so the delivery's audio is fixed.
