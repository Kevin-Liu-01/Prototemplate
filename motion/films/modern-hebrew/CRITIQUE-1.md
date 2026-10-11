# modern-hebrew: critique, pass 1

The critic watched `motion/out/_draft-modern-hebrew.mp4` (1920 x 1080, 30 fps, draft, built 2026-10-03 10:28) against MOTION.md ("How a film is judged"), BRIEF.md sections 2 to 5, SCRIPT.md, CONCEPT.md and the writing rules.

## How it was checked

- Frames every 0.5 s for the whole film (200 frames, full resolution), read as 3 x 4 sheets, and frames every 0.25 s from 0.25 s before to 0.5 s after each cut (8.5, 15.5, 20.0, 33.0, 42.0, 48.0, 54.0, 62.0, 66.5, 77.5, 82.0, 96.5). Single frames were cropped at full size for every note, every isolation box, every crop-mark set, the Ezekiel underline and each Hebrew run inside a Latin gloss. The board was also read downscaled to 1280 x 720.
- A per-frame scan of all 3000 frames at 320 x 180. It looked for flicker (a frame unlike both neighbours while the neighbours match), flat frames and jumps. No flicker was found. The only flat frame is frame 0. Every large jump is a cut or a planned camera move.
- Sound: `el.mjs hear` on the draft's audio (`scratchpad/mhcrit/draft.stt.json`). It heard every narrator line word for word as SCRIPT.md gives it, with "1908", "1880", "1913" and "1914" as numbers. It heard R as Hebrew word for word (מילים שחידשתי אני ושנתקבלו כבר בספרות של זמננו או בדיבור העברי בארץ ישראל). ofnayim was heard as "ov-na-yim", khashmal as "kash-mahal", Pines as "Pines" and "Pines'". The one tagged event is "[page turning]" at 99.64. It sits in the music's last decay (the sfx stem is silent after 97.7), so it is not a stray effect.
- Loudness (`ffmpeg -af ebur128=peak=true`): -16.3 LUFS integrated, LRA 3.2 LU, true peak -2.5 dBFS. Video 100.000 s (3000 frames) and AAC 100.000 s. Every effect sits on its picture event: the page turns peak on the cut, and the impressions (43.3, 53.0, 97.5), the type taps (29.5, 29.75, 30.0, 51.5) and the slides (82.0, 86.5, 91.0) fall on their events.
- Facts: every narration line, note, gloss, label and running head was read against BRIEF §2 to §5. Each one is supported, and every hedge is kept. That covers the 1879 notebook, "apparently", "dated 1913 by the collection", "can mark" and the tool sense claimed only for מַקְטֵל. Nothing from §5 items 21 to 25 appears. No em dashes, exclamations, rhetorical questions or "X, not Y" pairs were found. The only dashes are en dashes in number ranges.
- Hebrew: every Hebrew run renders right to left in the right order. This includes the runs inside Latin glosses (ק־ל־ע, פתח), the bdi runs in the notes (gershayim in ע״מ, the comma order in note 6), the Ezekiel clause with its points, and the built words at rest. The composing colour rule holds at rest: carried letters are in ink and added letters and points in ink 2.

## Defects

| # | time (s) | defect | fix |
| --- | --- | --- | --- |
| 1 | 0.000 | Frame 0 is a flat field of paper (every pixel 207). The engine calls `render(0)` once at mount, before the plates have loaded. The renderer's seek to 0 does not move the timeline, so its `onUpdate` never redraws. From frame 1 on, the ghost page is there. | Redraw the current time when each plate, ghost and the sign finish loading, and again when the fonts are ready. The renderer waits for all of these before it captures, and `render(t)` stays pure. |
| 2 | 29.2 to 29.8 | B3: the root letters fall out of the tray through the gloss "ק־ל־ע, to sling". The ל crosses the gloss at 29.5. | The gloss has stood since 25.5 (3.5 s, floor 2.0 s). Lower it to 0 from 29.05 to 29.35, before the first drop. |
| 3 | 30.5 to 33.0 | B3: "makle'a, cannon" and "today, a machine gun" print at 30.5 and 30.6. The second line has fully arrived at 31.1, so it holds 1.9 s. Its floor is 2.33 s, and SCRIPT.md promises 2.5 s. | Print both on "makle'a" (29.97): at 30.0 and 30.09, so the second line holds 2.41 s. |
| 4 | 40.0 to 40.5 | B4: the crop marks round the 40 px coinage sign keep their right horizontal arms. The two short dashes beside the sign read as an equals sign. | Use the vertical arms only, as on p. 1806, with the number "4)" clear at the upper right. |
| 5 | 43.6 to 48.0 | B5: the isolation box of the p. 110 entry (`p110.entry`, x0 = 222) cuts the column's last words in half: עומדים, האופנים, and הרבה ("ד" shows). CONCEPT.md and SCRIPT.md item 10 required this fix, and the build did not make it. | Measured on the plate, the column's left edge is at x 135. Set x0 to 126. |
| 6 | 48.5 to 51.1 | B5 card: "ofan, wheel" arrives at 50.0 and starts to fade at 50.8, a hold of 0.8 s against its 1.67 s floor. "the ending for pairs" holds 1.8 s against a 2.33 s floor. | Print ־ַיִם and its gloss at 48.3 and "ofan, wheel" at 48.9. Lower both glosses to 0 from 51.15 to 51.45, as the ending docks. The holds become 2.35 s and 1.75 s. |
| 7 | 52.0 to 54.0 | B5 card: "ofnayim, bicycle" arrives at 52.5 and holds 1.5 s against a 1.67 s floor. | Print it at 51.75, when the ending has docked. It then holds 1.75 s. |
| 8 | 62.3 to 63.4 | B6: Gordon's note is isolated for 0.3 s after its crop marks close. Then the camera whips 1500 px up the page in 0.8 s (about 60 px a frame at 30 fps), so the camera leaves the note as the narrator starts "The dictionary credits Gordon". | Hold the note to 62.9. Move the camera from 62.9 to 63.8 (power2.inOut) and isolate the sense line from 63.4. The sign then comes down from 63.8 to 64.5 and still meets the tick at 64.5. |
| 9 | 62.0 to 62.9 | B6: the box of Gordon's first line (`p1806.gordon[0]`, x1 = 2542) cuts the כ of כונתי, the first word of the quotation. | Set x1 to 2564, which covers the כ and stops before the colon of וז״ל:. |
| 10 | 64.5 to 66.5 | B6: the crop-mark number "8)" touches the right arm of the vertical-only marks round the printed ⁘. | For vertical-only marks, set the number 10 px clear of the arm. |
| 11 | 79.0 to 82.0 | B8: the top arms of the crop marks and the number "10)" sit on the ghosted line above (הללו:, בהוצאת). | Use shorter arms (14 px) with a smaller gap. Put the number at the left, beside the passage's first line, in the gap before "Hilfsverein". |
| 12 | 82.000 | B9: the cut lands on an empty board with only note 11, because the photograph starts fully off frame (p = 0 at 82.0). | Start the lay-down at 81.9, so the photograph is already sliding in on the cut frame. |
| 13 | 82.8 to 96.5 | B9: with the 2.5 % push, the Technikum photograph reaches 605 px wide. The source is 500 px, and CONCEPT.md caps it at 600. | Base width 585 px, so the push ends at 600 px. |
| 14 | 91.0 to 96.5 | B9: Article 22's sentence is set at 0.56 of the scan. Its capitals are about 17 px at 1920 and 11 px at 1280 x 720. The page carries the beat alone, with no narration. | Lay the Command Paper at 0.6 of the scan, at x 660 (clear of the note column, which ends at x 640). The text's right end is then at x 1727. |
| 15 | 96.5 to 100.0 | B10: the film's title appears only here. It prints at 97.0 and holds 2.5 s. At 8 words its floor is 3.67 s. | Put the close on the cut at 96.5, as the film's notes do. It then holds 3.5 s. |

## Not defects, recorded

- The page is clipped at the two rules even when a line is cut through: 2.0 to 4.5 on the title page, and the top line of the key and the front matter. That is CONCEPT.md's page grammar.
- "e-ty" after électricité on p. 1806 is how the dictionary prints it.
- In B1, the camera's move down to the promise line (4.0 to 5.1) is fast. Nothing on screen is meant to be read during it.
- The page turns begin about 1 s before each cut, and each one's flip peaks on the cut frame. That is how the sound lane designed them.

## Left for the native check (not changed here)

- In Frank Ruhl Libre the פ has a heavy tongue that reads, at card size, like a dagesh in ספר, מַפְתֵּחַ and אָפְנַיִם. NOTES.md already lists it for the native reader. Changing the face would mean regenerating every glyph outline and re-measuring every card.
- Scribe heard khashmal as "kash-mahal" and ofnayim as "ov-na-yim". Both are on the native listener's list in NOTES.md.
