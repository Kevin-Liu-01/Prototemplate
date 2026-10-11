# modern-hebrew: notes

*Ben-Yehuda, Pines, and the vocabulary of Modern Hebrew.* The first film of the Hebrew series.

**Current cut: v2 (2026-10-05) after its fix round, 69.6 s at 1920 x 1080, twelve pictures, built on `SCRIPT-v2.md` with Frederick Surrey as narrator.** The final is `motion/out/modern-hebrew.mp4` (60 fps, delivery quality, AAC, `--no-browser-gpu`), with its poster `motion/out/modern-hebrew.png`, its contact sheet `motion/out/_sheets/modern-hebrew.png` and its credits `motion/out/modern-hebrew.credits.txt`. What was built, the takes, the timings, the deviations and the open items are in **Round 2026-10-05: v2 build** at the end of this file, and what the critic found and what was fixed is in its **Fix round** (line 6 taken a third time, so every time after line 6 is 0.2 s earlier than the build's tables), and the Rebuild section below has the v2 commands. The sections from "What the film is" to "Open items" otherwise record the 100 s cut of 2026-10-03, whose final, poster and credits are backed up in `motion/out/series-100s/` and whose engine, sound and takes are in `archive-100s/` and `sound/takes/archive-100s/`.

The 100 s cut: 100.0 s at 1920 x 1080, ten beats. Its final was `motion/out/modern-hebrew.mp4` (60 fps, delivery quality, AAC, `--no-browser-gpu`, rebuilt 2026-10-03 after three critics), with its poster `motion/out/modern-hebrew.png` (53.0 s, the bicycle card with the sign registered) and its contact sheet `motion/out/_sheets/modern-hebrew.png` (now `archive-100s/out/sheet-modern-hebrew.png`). The last draft was `motion/out/_draft-modern-hebrew.mp4` (30 fps, draft quality), with `motion/out/_draft-modern-hebrew.png` and `motion/out/_sheets/_draft-modern-hebrew.png`; the v2 fix round moved them to `motion/out/series-100s/_draft-modern-hebrew.mp4`, `_draft-modern-hebrew.png` and `_draft-sheet-modern-hebrew.png`.

## What the film is

A stranger reads the first volume of Eliezer Ben-Yehuda's dictionary (מלון הלשון העברית הישנה והחדשה, Jerusalem and Berlin, 1908), and the book explains itself. Every frame is one of three things: a page of that book under a copy-stand camera, a type card set on the book's paper, or a document from outside the book laid on the dark board. The frame is built like one of the book's pages: a running head, a body window between two rules, and numbered notes at the foot that carry every caption, credit, translation and hedge. A passage is isolated the way a proofreader marks it: the rest of the page sinks to its ghost and crop marks close round the passage.

The one object that moves across a cut is the coinage sign, the looped mark the key of signs gives to "words that I coined and that have already been accepted". It is lifted off the key in the rose of the volume's marbled boards and carried to p. 110, where it registers on the printed sign before the bicycle. On electricity it comes down, finds the sign for the literature after the Talmud already there, stops in the gap between the lines and withdraws. At the tomato, Pines's word, the place before the word stays empty. The film ends with the sign settling back into the row it was lifted from.

The words, timings and sources are `SCRIPT.md` (its beat tables are the storyboard this build follows). The look is `CONCEPT.md`; where its per-beat times differ, `SCRIPT.md` and `sound/plan.json` govern. The sound is `sound/` (`sound/NOTES.md`). The research package is `BRIEF.md`.

| beat | time (s) | picture |
| --- | --- | --- |
| B1 The title page | 0.0 to 8.25 | Vol. 1 title page: מלון prints out of the ghost at 1.1 times the scan's pixels, right of centre; the page prints in, the camera pulls back to the title and comes down to the promise line; crop marks close on it at 5.5 |
| B2 Two new words | 8.25 to 19.1 | Card 1: ספר מלים struck right to left on "rejected", its gloss on "sefer", Wörter under מלים and buch under ספר on "German". Card 2 (cut on "From", 14.75): מִלָּה + ־וֹן = מִלּוֹן |
| B3 Root and pattern | 19.1 to 31.15 | The composing card: מַקְטֵל on the rail with its label beside the rail's end, its stand-ins ק ט ל sink to the ghost tone, ק ל ע print into the tray on "sling", the model מַפְתֵּחַ on "mafteakh", the letters drop into the slots on the three taps (28.3, 28.55, 28.8), מַקְלֵעַ |
| B4 The key of signs | 31.15 to 40.15 | The key, rows printing in; the coinage row prints right to left as the reader reads it; rose crop marks on the sign at 38.15; the lift 38.65 to 40.15 |
| B5 The bicycle | 40.15 to 53.15 | Cut to p. 110 under the lifted sign; it comes down and registers on "sign" (41.45); the camera pulls back to the entry, crop marks on the headword at 44.75; the footnote mark's hairline runs along the gap over its line, down the gutter between the columns and over to note 1 (45.05 to 46.15, 1.1 s), note 1 isolated at 46.2. The bicycle card (cut on "The word", 46.95): the ו lifts out of אוֹפָן, ן turns into נ, ־ַיִם docks on the tap at 51.25, the sign comes down from above and to the right and registers before אָפְנַיִם at 52.65 |
| B6 Electricity | 53.15 to 66.15 | Ezekiel 1:4's clause and its translation on the cut, הַחַשְׁמַל underlined on "khashmal", ἤλεκτρον above it on "elektron". Cut on "followed" (59.48) to vol. 4, p. 1806, Gordon's note isolated and translated in note 8. A cut inside the page on "electricity" (61.64) to the sense line ג) at 1.6, pushed in to 2.4 on its printed ⁘. On "credits" the sign comes down from above the frame, stops in the gap between the lines as rose crop marks numbered 9) close on the ⁘ (63.6), holds and withdraws |
| B7 The tomato | 66.15 to 77.35 | עַגְבָנִיָּה; בַּדּוּרָה below it on "Ben-Yehuda"; rose crop marks close on the empty place before the word on "kept" (73.35); בַּדּוּרָה sinks to the ghost tone on "in use" |
| B8 The funders | 77.35 to 82.05 | Vol. 1 front matter; crop marks close on "Hilfsverein der Deutschen Juden;" at 78.85, with 11) in the margin past the right arms |
| B9 The board | 82.05 to 96.5 | The Technikum photograph at its own 500 px, the Jaffa poster and Cmd. 1785's Article 22 (laid below the poster's subject lines) laid down in turn; every credit stays while its picture does; 6.4 s without narration under the Mandate |
| B10 The sign goes home | 96.5 to 100.0 | The key again; the sign comes down and registers on its row at 97.5; the close in the notes band on the cut |

## Files

| path | what |
| --- | --- |
| `index.html` | the composition: one root (`main`, 100 s), one clip that the engine draws into, the 18 audio clips from `sound/audio-clips.html`, and the one paused GSAP timeline (registered synchronously) whose `onUpdate` calls `render(t)` |
| `lib/film.js` | the engine: builds the frame once (page canvas, SVG type layer, running head, notes, board notes, close) and applies a frame state; `render(t)` is a pure function of film time. The 14 notes are set here |
| `lib/beats.js` | the ten beats: each writes the frame state for time t, every time taken from `SCRIPT.md`'s tables and `sound/manifest.json`; the beat bounds are the array `B` |
| `lib/build.js` | the composing move (ported from the roots lane): every glyph of a built word is its own outline, so a letter, a point and an ending move separately |
| `lib/util.js` | easings, the copy-stand camera (log-scale zoom), the inks |
| `lib/data.js` | every plate and every isolated box, in scan pixels (with p. 110's gutter for the hairline) |
| `lib/film.css` | the page furniture, the notes and the board's note column |
| `data/cues.js` | v2: written by `sound/tools/mix.py` from `sound/plan.json` and the takes; every time the picture lands on, in film seconds, and the film's length |
| `data/glyphs.js` | written by `tools/glyphs.mjs`: shaped outlines of the built words, and the shaped advance and word edges of every Hebrew line the cards set, from the film's own Hebrew face at weight 500 |
| `fonts/` | the three faces under private family names, with `fonts.css` and the OFL licences |
| `assets/` | the scans, plates, documents and the lifted sign; `assets/SOURCES.md` records each one |
| `sound/` | takes, masters, stems, mix, manifest (`sound/NOTES.md`) |
| `archive-100s/` | v2: the 100 s cut's engine and beats, `index.html.100s`, sound plan, lines, manifest, masters, stems, mix and checks, glyph tool, credits, contact sheet, and SCRIPT-v2.md before the build (the takes are in `sound/takes/archive-100s/`) |
| `tools/` | `glyphs.mjs`, `plates.py`, `sign.py`, `docs.py`, `sheet.py` (contact sheet), `shoot.mjs` and `still.html` (single frames for checking; `still.html?t=40.9&from=33` draws every frame from 33 s first, to test that a frame does not depend on the ones before it), `test/overlay.html` (outlines over text), `build/MHHebrew-VF.ttf` (the unpacked face fontkit reads) |

## Rebuild

v2 (2026-10-05), from the film root:
- Narrator takes: `EL_VOICE_FILE=$PROTOTEMPLATE/motion/kit/audio/voice-series.json node sound/tools/record.mjs <id> ...` (a retake: `--as <id>b --text "..." <id>`; never `--voice`). Then point `sound/plan.json` (lines) at the take.
- Sound and the picture's times: `python3 sound/tools/mix.py` lays out the takes, writes the masters, stems, mix, `sound/manifest.json`, `sound/audio-clips.html` and `data/cues.js`; paste the clips into `index.html` and set the root and film clip's `data-duration` to the `DUR` in `data/cues.js`. `python3 sound/tools/clicks.py` checks the clip edges.
- The title's ink: `python3 tools/inkcut.py` (writes `assets/derived/title-milon-ink.png`).
- Glyph data: as below (`node tools/glyphs.mjs`).
- Stills: `node tools/shoot.mjs --times <outdir> 0.3,38.2` (the stills page reads `data/cues.js`).
- Check and final render: the commands below.
- Poster: frame 2280 of the final (38.0 s, p. 110 with the sign registered and the headword isolated; frame 2292 in the build, before line 6's new take moved the picture 0.2 s earlier), `ffmpeg -i ../../out/modern-hebrew.mp4 -vf "select=eq(n\,2280)" -vsync 0 -frames:v 1 ../../out/modern-hebrew.png`.

The 100 s cut:

- Glyph data, after a change to the Hebrew face or a built word: `python3 -c "from fontTools.ttLib import TTFont; f=TTFont('fonts/MHHebrew-VF.woff2'); f.flavor=None; f.save('tools/build/MHHebrew-VF.ttf')"`, then `node tools/glyphs.mjs`.
- Plates and the sign: `python3 tools/plates.py`, `python3 tools/sign.py`, `python3 tools/docs.py`. The rose sign `assets/derived/sign-key-rose.png` is the alpha of `sign-key.png` filled with `#823c4b`.
- A still at time t: `node tools/shoot.mjs --times <outdir> 12.0,40.2`.
- Check: `npx -y hyperframes@0.8.106 check .` (passes: 0 errors and 0 warnings in lint, runtime, layout and motion; 47 of 47 text checks pass WCAG AA).
- Draft: `npx -y hyperframes@0.8.106 render . -o ../../out/_draft-modern-hebrew.mp4 --quality draft --fps 30 --workers 3 --no-browser-gpu --quiet`.
- Final: `npx -y hyperframes@0.8.106 render . -o ../../out/modern-hebrew.mp4 --quality delivery --fps 60 --workers 3 --no-browser-gpu` (4 min 10 s on this machine at a load average near 50).
- Contact sheets: `python3 tools/sheet.py ../../out/modern-hebrew.mp4 ../../out/_sheets/modern-hebrew.png`, and the same for the draft.
- Poster: frame 3180 of the final (53.0 s), `ffmpeg -i ../../out/modern-hebrew.mp4 -vf "select=eq(n\,3180)" -vsync 0 -frames:v 1 ../../out/modern-hebrew.png`.
- Sound, after a change to `sound/plan.json`: `python3 sound/tools/mix.py`, then `python3 sound/tools/clicks.py` (no API call), then paste `sound/audio-clips.html` into `index.html`.

## Determinism

- Every frame is `render(t)`: no clock, no random number, no network, no state carried from one frame to the next. The timeline is built synchronously and registered at once; every plate, ghost, document and the sign live in the DOM as `<img>`, so the renderer waits for them. The composition redraws the current time when each picture and the fonts are ready, because the renderer's seek to 0 does not fire `onUpdate`.
- The scans and the sign are drawn on a software canvas (`willReadFrequently`), so every worker rasterises them the same way. With the hardware GPU (Metal), Chrome rasterised the 200 and 220 px card words a little differently in each render process; the film renders with `--no-browser-gpu` (SwiftShader), which removed that.
- **The proof at 60 fps (this rebuild).** Two lossless renders of the finished composition (`--quality draft --fps 60 --crf 0 --no-browser-gpu`), one with `--workers 3` and one with `--workers 2`, so the workers' frame ranges split at different frames: framemd5 matches on all 6000 of 6000 frames. A frame that depended on the frames drawn before it would differ where the ranges split. The final was rendered with the same composition at delivery quality and 60 fps with `--workers 3`.
- Earlier proofs, before the rebuild: two lossless 30 fps renders with 3 and 2 workers matched on all 3000 frames; a 60 fps and a 30 fps render of the same composition differed in 2 of 3000 shared frames by at most 18 levels on the edge pixels of one Hebrew outline of the composing move, because Chrome rasterises an SVG outline that has stood still for one frame at 30 fps and for two at 60 fps slightly differently. A render repeats exactly with the same settings, and the final is rendered at 60 fps with `--workers 3`.

## Measurements

- **Final** (`out/modern-hebrew.mp4`, 28.0 MB): H.264 High, 1920 x 1080, yuv420p, 60 fps, 6000 frames, 100.000 s; AAC LC, 48 kHz stereo, 100.000 s. The two durations are equal.
- Loudness of the final (`ffmpeg -af ebur128=peak=true`): -16.4 LUFS integrated, loudness range 3.2 LU, true peak -2.3 dBTP. The offline mix measures -16.3 LUFS, 3.2 LU and -2.3 dBTP. The final's audio matches `sound/mix-offline.wav` at zero lag with a gain of -0.04 dB and an AAC residual of -31 dB, so the renderer's -1 dBTP trigger was not reached and the track was not turned down.
- `el.mjs hear` on the final's AAC track (copied out of the MP4 without re-encoding, `scratchpad .../finish/b2/final2.stt.json`): all 15 English lines word for word, with "1908", "1880", "1913" and "1914" as numbers. The reader's row comes back romanised word for word ("Milim shihadashiti ani, v'shenitkabulu k'var ba-sifrut shel zmanenu o ba-dibbur ha-ivri be-Eretz Yisrael"). The Hebrew words in the English lines are heard as "Sefer Milim", "mileh" and "milon", "mafteah", "markea" (*makle'a*; with Hebrew fixed, the take's word is heard as מקלעה), "ofnaim" twice, "ofan", "hashmal", "agvania", and the names as "Yechiel Mikhel Pines" and "Pines'". The one tagged event is "[pages turning]" from 90.18 to 99.94, which covers the Command Paper's slide, the ticks and the page turn home.
- A per-frame scan of all 6000 frames at 192 x 108: no flicker (no frame unlike both neighbours while they match), no flat frame (frame 0 is the ghost title page), and every large jump is a cut (59.48, 61.65, 66.15, 77.35, 82.05, 96.5; the cuts between cards are smaller) or B1's planned move down to the promise line (4.35 to 4.82).
- Peak screen speed of the camera moves, at 60 fps: the hairline's travel to note 1 on p. 110 is 48 px a frame (it was about 60), B1's pull-back 4 and its move down 19. The push on p. 1806's sense line is a zoom held on the printed sign: the sign does not move, and the window's corners move at most 16 px a frame.

## Sources and credits

Every picture is credited in the note that appears with it, and every credit stays on screen while its picture does (`assets/SOURCES.md` has the URL, date, edition and rights of each):

- Vol. 1 title page, key of signs, front matter and p. 110, and vol. 4, p. 1806: Princeton Theological Seminary Library, via Internet Archive. Public domain (vols. 1 to 5).
- The Technikum under construction, Haifa, 1913: photograph by Albert Bär, Central Zionist Archives, `{{PD-Israel}}`. Shown at the source's own 500 px, pushed in from 480 px.
- The Jaffa meeting poster: note 13 reads "National Library of Israel, via Wikimedia Commons. CC BY-SA 3.0, creativecommons.org/licenses/by-sa/3.0. Scaled and marked." Captioned "dated 1913 by the collection". Share-alike is open (below).
- Cmd. 1785, p. 8, Article 22: University of Toronto, via Internet Archive, not in copyright.
- Ezekiel 1:4: "Tanach with Nikkud" (tanach.us, via Sefaria), public domain.
- Type: Frank Ruhl Libre, Source Serif 4 and Noto Serif (Greek), all SIL OFL 1.1.
- Voices and music: narrator Clara (ElevenLabs, eleven_multilingual_v2, `kit/audio/voice.json`); Hebrew reader Tomer (ElevenLabs, eleven_v3); music from the ElevenLabs Music API; effects from ElevenLabs sound generation.

## Rebuild after the three critics (2026-10-03)

The three critics of the first final (picture, sound and story, history and rights) each failed it. The two majors common to them were five narrator lines that set a gloss between commas inside the sentence, which the user's writing rules forbid, and the poster's incomplete CC BY-SA attribution; the picture critic's third major was the electricity beat, too small to read. Every major and every minor was fixed or is listed below with its reason.

| finding | what was done |
| --- | --- |
| Five lines with a gloss between commas (N2, N3, N5, N7, N8), major | Rewritten as plain sentences and recorded again: N2 "In 1880 he rejected the phrase sefer milim as a copy of German Wörterbuch."; N3 "From mila he made milon, the word for dictionary."; N5 "He set the root for sling into the pattern of mafteakh and made makle'a, a cannon."; N7 "The word for wheel is ofan. The ending for pairs turned it into ofnayim."; N8 "The Greek translation renders Ezekiel's khashmal as elektron. The poet Judah Leib Gordon followed it and used the word to mean electricity." The cards' glosses still carry the translations. Every line is checked against BRIEF.md in `SCRIPT.md` (Audit) |
| The electricity beat cannot be read, major | B6 now cuts inside p. 1806 on "electricity" to the sense line at 1.6 and pushes in to 2.4 (about 1.9 in vol. 1's terms), with the printed ⁘ right of centre. The sign comes down from above the frame at three times its size and shrinks to its registration size (ink about 120 px, against about 40 before). It stops in the 110 px gap between the lines, clear of ערבות, about 44 px above the ⁘, as rose crop marks numbered 9) close on the ⁘ with the tick (63.6). It holds 0.55 s and withdraws. A camera move from Gordon's note at this scale would have run 50 to 85 px a frame, so the film cuts instead, as one critic offered for B5 |
| The poster's licence not honoured, major | Note 13 now gives the credit (National Library of Israel, via Wikimedia Commons), the licence with its address and the changes ("Scaled and marked"), and it stays until the poster leaves. Whether share-alike attaches to the film is Kevin's decision (Open items), with the publishing text below |
| N6 never says what the sign is | "The dictionary prints this sign before the word for bicycle, ofnayim." The registration now lands on the spoken word "sign" (41.45) |
| N14's "its board" | "In 1913 the school's board chose German for the sciences." |
| Two rushed joins | N4 to N5 is 0.87 s (was 0.27) and N10 to N11 is 0.43 s (was 0.23) |
| *khashmal* and *makle'a* mispronounced | Respelled "hashmál" (two syllables; h is the English approximation of ח, as in the narrator's "Haifa") and "makléa", heard with Hebrew fixed as מקלעה. Still on the native listener's list |
| Gordon's note isolated untranslated, his name never on screen | Note 8: "Gordon's note: 'I mean the natural force called Elektrizität, since the Greek translation of khashmal is elektron.'" (BRIEF ¶7's translation). Note 9 keeps the sign's caption. Notes 9 to 13 became 10 to 14 |
| Notes 11 and 12 leave while their pictures stay | All three board notes stay to 96.5, in a column re-spaced so they fit (tops 300, 470, 790) |
| Notes under the reading floor (words/3 + 1 s) | Note 6 prints with the hairline at 45.05 and holds 8.1 s (floor 7.67); note 9 (the p. 1806 caption) holds 6.67 s (4.67); note 11 holds 4.7 s (4.67); note 14 was cut to 14 words and holds 5.7 s (5.67); the Ezekiel translation holds 6.33 s (6.33); note 8 holds 6.67 s (6.67); "the ending for pairs" holds 2.4 s (2.33). The close holds 3.5 s against 3.67 (below) |
| The bicycle card's sign fades in on the א | It enters above and to the right of the word at 1.5 times its size and comes down along a path that stays right of the word's edge |
| A 4-level seam where the plates meet the film's paper | `tools/plates.py` scales each channel so the plate's paper median is exactly `#dbcfba` (it was 3 to 5 levels under); every plate measures 219, 207, 186 |
| The open is soft and blocky at 1.42 times the scan | The open sits at 1.1 times the scan's pixels, the word right of centre so the frame stays inside the scan, and the plates are saved at JPEG quality 95 (was 90 and 88). The higher-resolution Internet Archive file was not downloaded |
| The Command Paper cuts through the poster's headline; its ghost too readable | It is laid at y 722, below the poster's subject lines (which end at y 704), and its paragraph sinks fully to the ghost (veil 1.0, was 0.9) |
| "10)" reads as "Judentums;10)" | The number (now 11)) stands in the margin past the right arms, beside the line; the camera moved to 0.82 so the margin is inside the window |
| The camera's move down to note 1 strobes; the hairline crosses eight lines of text | The move takes 1.1 s (was 0.75) and starts 0.2 s after the headword's marks close; the hairline runs along the gap over its line and down the clear gutter between the columns (x 1164 on the scan) before it turns to the note |
| The Technikum photograph is soft at 600 px; the board unbalanced | It is shown at its own 500 px, pushed in from 480 px, and centred in the right half while it stands alone |
| Type cards leave the lower third empty; the pattern label far from its word | Every card is centred in the body window (moved down 25 to 45 px), and the label "pattern · משקל" stands beside the rail's right end |
| The 60 fps final was never proven against a second 60 fps render | Done (Determinism) |

**New takes.** Eleven narrator takes (about 900 characters) and three transcriptions of cut-out words, in addition to the two `hear` runs on whole renders. Two takes came back with a hiss inside the respelled words and two broke *ofnayim* in two; each was taken again, and one take (`n07e`) is n07d with 0.35 s cut out of the silence between its sentences. `sound/NOTES.md` (Rebuild) has each take and why.

**Kept, with the reason.**
- The page is clipped at the two rules, "e-ty" stays as the dictionary prints it, and B1's move down to the promise line stays fast (19 px a frame at its peak; nothing is meant to be read during it). `CRITIQUE-1.md` accepted all three, and `CONCEPT.md` (The look) sets the clipping.
- The close holds 3.5 s against a floor of 3.67 s for its eight words. It is the film's title, not a translation, quotation or gloss, which is what `CONCEPT.md` (Build notes) puts under the floor. Holding it longer would move the cut home off the music's last chord (96.5).
- The bed now rises for about 1.5 s on the composing card's hold before the cut to the key (30.1 to 31.6), because the gap before the reader grew to 1.72 s. Nothing is said there.
- The tomato card still opens with עַגְבָנִיָּה alone for 5.2 s before בַּדּוּרָה prints below it; the card is now centred for both rows, so the first state sits above centre. The second row is the reveal on "Ben-Yehuda".

## Open items (Kevin decides)

- **Share-alike for the Jaffa poster.** The poster (File:Asefa_Nave_Shalom.jpg, from the National Library of Israel collection) is CC BY-SA 3.0. The film now meets the attribution terms on screen. BRIEF §4 Rights says to share alike unless the NLI item page says otherwise, and that page sits behind a human check that was not bypassed. Kevin chooses one of: open the NLI item page by hand and follow its terms; publish the film, or at least the board sequence (86.5 to 96.5), under CC BY-SA 3.0; or replace the poster with a type card of its subject lines. Publishing text to go with the film wherever it is posted: "Poster for a public meeting at Neve Shalom, Jaffa (dated 1913 by the collection): National Library of Israel collection, via Wikimedia Commons, https://commons.wikimedia.org/wiki/File:Asefa_Nave_Shalom.jpg, licensed CC BY-SA 3.0, https://creativecommons.org/licenses/by-sa/3.0/. Scaled and marked with crop marks."
- **Native checks.** A native Hebrew listener approves R's take and the judge's pointing of its text, and N's Hebrew words: *sefer milim*, *mila*, *milon*, *mafteakh* (now nearer k than kh at its end), *makle'a*, *ofan*, *ofnayim*, *khashmal* (now said with an h), *agvaniya*, and the names Yehiel Michel Pines and "Pines's". A native reader checks the set type letter by letter and point by point, and whether Frank Ruhl Libre's heavy פ reads as a dagesh in ספר, מַפְתֵּחַ and אָפְנַיִם at card size. `sound/NOTES.md` lists what to listen for.
- **The 1880 column.** The NLI scan of *Magid Mishneh*, 1 January 1880, sits behind a human check and must be pulled by hand. With it, card 1 can become the column with ספר מלים isolated.
- **The Technikum photograph** is 500 px; it is now shown at its own size. The sharper Library of Congress view dates from 1925 to 1933 and cannot stand for 1913.
- **The open's source.** The picture critic suggested the Internet Archive's JP2 of leaf n12, which may be larger than the page JPEG the film uses (2571 x 3887). With it the open could sit tighter than 1.1 without softness. Downloads were out of scope for this pass, so it was not fetched.
- **The poster frame** is 53.0 s (the bicycle card with the sign registered). The lift at 40.0 and the withheld landing at 63.9 are the other candidates.
- **Rasterisation across frame rates** (Determinism): a 60 fps and a 30 fps render can differ by a few edge levels on one outline of the composing move. Renders with the same settings repeat exactly.

## Round 2026-10-05: v2 build

Kevin found the 100 s cut slow, not very interesting and oddly scripted, and liked its diagrams and pictures. This round builds `SCRIPT-v2.md` end to end: 14 new narrator lines in Frederick Surrey's voice, twelve pictures re-timed to his takes, the diagrams kept and adapted, a new mix on the same music bed, and the final render. The final is `motion/out/modern-hebrew.mp4` (69.6 s), with its poster `motion/out/modern-hebrew.png` (frame 2292, 38.2 s, p. 110 with the sign registered and the headword isolated), its contact sheet `motion/out/_sheets/modern-hebrew.png` and its credits `motion/out/modern-hebrew.credits.txt`. The 100 s final, poster and credits are backed up in `motion/out/series-100s/`; the 100 s takes are in `sound/takes/archive-100s/`, and every file this round replaced is in `archive-100s/` (the 100 s engine and beats, `index.html.100s`, the sound plan, lines, manifest, masters, stems, mix and checks, the glyph tool, the 100 s contact sheet, CREDITS.txt and SCRIPT-v2.md as it was before this round).

### What was built

| picture | film s | what happens, and the word it lands on |
| --- | --- | --- |
| The title page | 0.00 to 4.38 | מִלּוֹן prints in alone at 1.5x (0.0 to 0.6), the ghost page prints in round it (1.2 to 2.2), the camera holds; note 1 prints at 0.3 |
| Card 1 | 4.38 to 20.66 | בתי עיניים on the cut; "Eyeglasses were houses for the eyes." on "phrases" (7.76); ספר מלים on "dictionary" (9.71); its sentence on "sefer" (10.67); Wörter and buch and their hairlines on "German" (12.62); note 2 on "In 1880" (13.91); the strike and the first row's sink on "such copies" (17.57) |
| Card 2 | 20.66 to 24.42 | מִלָּה with its sentence on the cut; + ־וֹן at 21.01; the sum rule on "made" (21.57); מִלּוֹן on "milon" (21.79) |
| The composing card | 24.42 to 31.39 | crop marks round the pattern's מ on "mem" (close 25.07, tick); the model and its sentence on "tool" (25.87); the stand-ins sink on "root" (27.54); the tray, ק ל ע and the root's sentence on "sling" (27.94); the letters drop on "made" (28.68), landing on the taps at 28.98, 29.23 and 29.48, with "Makle'a meant a cannon." under the rail; the mem's marks fade as the letters drop; a 1.0 s hold |
| The title page again | 31.39 to 32.59 | framed as at the open, with note 3, on a page turn |
| The key of signs | 32.59 to 36.39 | page turn on "this sign"; the page and the row in ghost, the printed sign in ink; rose crop marks with vertical arms close on "sign" (32.94, tick); the row rises from ghost to ink right to left from "words" (33.44) to "accepted" (35.26); the lift on "accepted" (35.26 to 36.26) while the page sinks |
| p. 110 | 36.39 to 38.40 | page turn; the lifted sign holds at the centre, comes down on "stands" (36.60) and registers on the printed sign (37.20, impression); the headword isolated on "bicycle" (37.44) |
| The bicycle card | 38.40 to 41.99 | hard cut on "a word"; אוֹפָן with "Ofan means wheel.", ־ַיִם at the rail's end, the model אָזְנַיִם with "Oznayim means ears." and note 4 on the cut; the build on "two wheels" (39.03), the ending docking on the tap at 39.63; "Ofnayim means bicycle." at 39.83; the hairline joins the two endings on "ears" (40.80); a 0.8 s hold |
| The Ezekiel card | 41.99 to 49.41 | the clause, the verse as a sentence and note 5 on the cut; the underline on "khashmal" (44.54); ἤλεκτρον on "Greek" (46.69) |
| p. 1806 | 49.41 to 54.48 | page turn on "poet"; one steady frame at 1.6 with the sense line, its printed ⁘ and "Elektrizität; électricité" isolated, and note 6; on "mark" (52.72) the sign comes down from above the frame and stops in the gap over the line as rose crop marks numbered 6) close on the ⁘ (52.82, tick, no impression); it withdraws on "his own" (53.56) and is out of the frame by 54.36 |
| The tomato card | 54.48 to 68.00 | עַגְבָנִיָּה with ע ג ב in ink and the rest in ink 2, and note 7, on the cut; "Agvaniya means tomato." on "agvaniya" (57.37); the root's sentence on "desire" (59.52); בַּדּוּרָה and its sentence on "Ben-Yehuda" (60.32); rose crop marks on the empty place on "kept it out" (62.77, tick, no impression); בַּדּוּרָה sinks on "Today" (64.24) |
| The sign goes home | 68.00 to 69.60 | page turn home to the key with the row in ink; the sign comes down and registers at 68.80 (impression); an empty note band |

Every time above comes from `data/cues.js`, which `sound/tools/mix.py` now writes from the takes: `plan.json` names the word each cue lands on, the layout places every take by its own first and last sound, and the effects sound at the same cues. A new take moves the picture with it.

**Engine changes.** `lib/beats.js` is rewritten for the twelve pictures. `lib/film.js` sets the notes 1 to 7 and every gloss as a sentence (SCRIPT-v2's table), adds the first row of card 1, the bicycle card's hairline and its model's sentence, the composing card's crop-mark box for the מ, the tomato word's ink rule (an outline overlay, as on the other cards), and a ghost-only page base for the open. The board, its notes, the running-head centres, the card labels and the closing heading are gone. `tools/glyphs.mjs` adds בתי עיניים, אָזְנַיִם and עַגְבָנִיָּה. `tools/inkcut.py` (new) cuts the title's מלון out of the plate as ink alone (`assets/derived/title-milon-ink.png`), because a hole cut from the plate showed its rectangle of the plate's paper on the bare paper while the ghost page was still printing in. `lib/data.js` stops loading the funders' page, the photograph, the poster and the Mandate page (kept under `longerCut` with their boxes) and adds the box of "Elektrizität; électricité" on p. 1806, read off the plate's ink columns.

### The takes

Frederick Surrey (`kit/audio/voice-series.json`), recorded with `EL_VOICE_FILE` set to that file through `sound/tools/record.mjs`, which now refuses to run without it and checks the voice in every take's `.json`. 15 takes for 14 lines, 1,131 characters of speech; 16 transcriptions with `el.mjs hear` (one per take and one of the final). Only line 6 was taken twice in the build, and a third time (n06c) in the fix round, because both takes said *makle'a* wrong. The table, the hearings and the formant checks of *makle'a* and *Pines* are in `sound/NOTES.md` (v2 build).

### Measured timings

| line | first sound to last sound (film s) | take length (s) |
| --- | --- | --- |
| 1 | 0.30 to 3.93 | 4.27 |
| 2 | 4.43 to 9.02 | 5.25 |
| 3 | 9.37 to 13.64 | 5.06 |
| 4 | 13.99 to 20.36 | 7.20 |
| 5 | 20.71 to 23.97 | 3.99 |
| 6 | 24.47 to 30.44 | 6.78 |
| 7 | 31.44 to 35.94 | 5.39 |
| 8 | 36.44 to 41.24 | 5.76 |
| 9 | 42.04 to 45.07 | 3.76 |
| 10 | 46.12 to 50.92 | 5.71 |
| 11 | 51.42 to 53.98 | 3.34 |
| 12 | 54.53 to 60.06 | 6.55 |
| 13 | 60.41 to 63.98 | 4.41 |
| 14 | 64.33 to 67.61 | 3.62 |

Speech runs 61.0 s, against SCRIPT-v2's estimate of 64 s at Clara's pace. The cut home is at 68.00 and the film ends at 69.60. The longest gap between lines is 1.05 s (lines 9 to 10); the only longer stretch without speech is SCRIPT-v2's close (67.61 to 69.60, the 0.39 s hold on the tomato card and the 1.6 s close).

Every sentence on screen holds at least (words / 3) + 1 s from its arrival, counting every word including the note's number: the tightest are the Ezekiel sentence (7.41 s against 7.33), note 6 (5.07 against 5.00), the ־וֹן gloss (3.41 against 3.33), note 1 (4.08 against 4.00) and "Ofnayim means bicycle." (2.16 against 2.00).

### Measurements of the final

- **The file** (`motion/out/modern-hebrew.mp4`, 7,965,328 bytes): H.264 High, yuv420p, 1920 x 1080, 60 fps, 4176 frames, 69.600 s; AAC LC, 48 kHz stereo, 69.600 s. The two durations are equal. It is faststart as written (top-level atoms ftyp, moov at byte 32, free, mdat), so no remux was needed. It is under 50 MB, so no share file was made.
- **Loudness** (`ffmpeg -af ebur128=peak=true` on the mp4's audio): -15.9 LUFS integrated, loudness range 1.5 LU, true peak -2.6 dBTP. `loudnorm` reads -16.02 LUFS and -2.55 dBTP. The offline mix measures -15.9 LUFS, 1.5 LU and -2.5 dBTP, so the renderer's -1 dBTP trigger was not reached and the track was not turned down.
- **Check:** `npx -y hyperframes@0.8.106 check .` passes with 0 errors and 0 warnings in lint, runtime, layout and motion, and 27 of 27 text checks pass WCAG AA. The first pass flagged one layout error (card 1's first row and its sentence overlapped as text boxes), fixed by the spacing below.
- **Render:** `npx -y hyperframes@0.8.106 render . -o ../../out/modern-hebrew.mp4 --quality delivery --fps 60 --workers 3 --no-browser-gpu`, 9 min 39 s at a load average near 500. The log (`sound/checks/render-final.log`) has no line that mentions Google Fonts. The final was rendered twice with the same command (the first log was overwritten by another lane's render in the shared scratch folder), and the two files are byte-identical (`cmp`), so every frame (framemd5, 4176 of 4176) and the audio repeat exactly.
- **What is said** (`el.mjs hear` on the mp4's AAC, copied out without re-encoding; `sound/checks/final.stt.json`): all 14 lines, 183 words, the same count as the script, in English with no audio event tagged. The names and the Hebrew words are heard as "Sefer Milim", "Milon", "mila", "mem", "maklya", "hashmal", "electron", "Yechiel Michel Pines" and "agvaniyah"; "1880" and "17" come back as numbers; "Ben-Yehuda" three times. Each heard word starts within 0.1 s of its cue (for example "Milon" 21.82 against 21.79, "mem" 25.02 against 24.97, "hashmal" 44.54 against 44.54).
- **The picture:** frames at every line's start plus 1 s and at every set piece's key moments were read (the open's print-in, card 1 to the strike, card 2, each step of the composing move, the key's crop marks, the row rising and the lift, the descent and registration on p. 110, the bicycle build and the hairline, the underline and ἤλεκτρον, the withheld landing and the withdrawal on p. 1806, every step of the tomato card, and the sign going home). A per-frame scan of all 4176 frames at 192 x 108 finds 11 jumps, each one of the 11 hard cuts (4.38, 20.67, 24.43, 31.40, 32.60, 36.40, 38.42, 42.00, 49.42, 54.48, 68.00), no flicker and no flat frame. Frame 0 is the bare page with its two rules, because the word prints in from 0.0, as SCRIPT-v2 sets it.
- **The poster** is frame 2292 (38.2 s): p. 110 with the rose sign registered on the printed sign and the headword isolated. The contact sheet was made with `tools/sheet.py`.

### Deviations from SCRIPT-v2, with the reasons

- **Length 69.6 s, not about 72.** Frederick's takes run 61.0 s of speech, 3 s under the estimate. SCRIPT-v2's rule for short takes applies only under 60 s, so no hold was lengthened for its own sake, and the film sits inside the accepted 68 to 76 s.
- **Gaps wider than 0.35 s after lines 1, 5, 9, 10 and 11** (0.5, 0.5, 1.05, 0.5 and 0.55 s), each so that a reading floor is met at Frederick's pace: note 1, the ־וֹן gloss, the Ezekiel sentence (which needs 7.33 s from the cut to "poet") and note 6. The gap after line 7 is 0.5 s so the lifted sign holds 0.13 s at the centre before the cut to p. 110. The holds after lines 6 (1.0 s) and 8 (0.8 s) are SCRIPT-v2's.
- **The cut home sits 0.39 s after the last word, not 0.4 s,** so that it falls on 68.00: the music then starts on its own bar line (music 44.0) and its final chord (music 112.0) lands on the cut. SCRIPT-v2 started the music at 41.3, between bar lines.
- **The printed sign on the key is in ink from the cut.** SCRIPT-v2 sets the page and the coinage row in ghost; the sign the line calls "this sign", and the crop marks close on, stays in ink, and the rest of its row rises from ghost.
- **The headword on p. 110 is isolated without a tick,** as SCRIPT-v2's effect list has none there.
- **"Makle'a meant a cannon." prints on "made",** as SCRIPT-v2's glosses table says, while the letters drop.
- **The bicycle card's glosses.** "Ofan means wheel." stays to the end of the card (its floor of 2.0 s would not be met if it left at the build, 0.63 s after the cut), and "Ofnayim means bicycle." prints a line under it. Both are set flush with the rail word's right edge. "Oznayim means ears." stands to the right of the model, so the hairline from the model's ending to the bicycle's ending crosses no text.
- **The composing card's model sentence is set in two lines** ("Mafteakh means key and comes / from פתח, to open."), so it stays left of the tray and of the letters' fall.
- **The composing card's crop marks round the מ fade as the letters drop** (on "made"), so the finished word stands without them.
- **The sign on p. 1806 is drawn at the page's own registration size** (about 102 px at 1.6) and stops in the gap between ערבות and the sense line.
- **Card 1 is spaced** (rows at baselines 280 and 580, Wörter and buch at 750, the sentence at 822) so no two text boxes overlap, which `hyperframes check` flagged at the first spacing.

### Open items (Kevin decides)

- **The 1913 and 1922 story is cut,** as SCRIPT-v2 writes it: the funders' page, the Technikum photograph, the Jaffa poster and the Mandate's Article 22. Kevin was told and did not object. MOTION.md's roster entry still says they close the story, so whether the cut stands is Kevin's decision. The scans and their notes stay in `assets/` and `lib/data.js` (`longerCut`) for a longer cut, and the 100 s engine is in `archive-100s/lib/`.
- **Native Hebrew listener sign-off** on Frederick's Hebrew words and the name: *sefer milim* (n03), *mila* and *milon* (n05), *mem* and *makle'a* (n06c since the fix round, heard as "maqleh ah"; the build's n06 was heard as "maclia", and its vowel, which the build first described as a close-mid e, is the English vowel of "kit"), *khashmal* (n09; said with an h, "hashmál"), *agvaniya* and Yehiel Mikhel Pines (n12; the surname heard as "Penas", vowel measured as ee). A word that fails is taken once more with a new respelling (`EL_VOICE_FILE=... node sound/tools/record.mjs --as <id>b --text "..." <id>`), then `python3 sound/tools/mix.py` and a new render; the picture follows the take through `data/cues.js`.
- **A native reader** still checks the set type letter by letter and point by point, now including בתי עיניים (unpointed, as the brief prints it) and the ink rule on עַגְבָנִיָּה.
- **The open's softness.** SCRIPT-v2 sets the open at 1.5x the scan, where the 100 s cut used 1.1x because a critic found 1.42x soft. The higher-resolution Internet Archive JP2 of leaf n12 was not fetched in this round.
- **Determinism** was proven for the 100 s cut (framemd5 across worker counts). The engine's rendering paths are unchanged, and this round did not repeat the proof.

### Fix round (2026-10-05, after the critic)

The critic failed the v2 build's final on one major (line 6 said *makle'a* wrong) and listed nine minors. Every major and minor was fixed, or it is listed below with the reason it stands. The final was rendered again with the documented command. The v2 build's state before this round (its final, poster and contact sheet, `lib/beats.js`, `lib/film.js`, `lib/data.js`, `tools/inkcut.py` and the ink it wrote, `index.html`, `sound/plan.json`, `sound/lines.json`, `sound/manifest.json`, `sound/audio-clips.html`, `data/cues.js`, the final's transcript and render log, and NOTES.md, sound/NOTES.md, SCRIPT-v2.md and CREDITS.txt as they were) is in `archive-v2-build/`. The build's masters, stems and mix can be made again from those files with `python3 sound/tools/mix.py`, because n06 is still in `sound/takes/`.

| finding | what was done |
| --- | --- |
| *makle'a* said "mak-LIH-a" (n06), major | One more take, n06c, in Frederick Surrey's voice (`EL_VOICE_FILE=<motion>/kit/audio/voice-series.json node sound/tools/record.mjs --as n06c --text "... made mak-LEH-ah, a cannon." n06`, with n06's `--prev` and `--next`, no `--voice`; the take's `.json` names Frederick Surrey). `el.mjs hear` returned "maqleh ah". An LPC track of the take measures the vowel after the l at F1 460 to 600 Hz and F2 1410 to 1630 Hz, the same as the narrator's own e in "mem" and "letter" in the same take, followed by a 60 ms break before the final a. `plan.json` points at n06c and `mix.py` was run again, so the cues, the effects and the picture followed the take. n06c's speech is 0.2 s shorter than n06's, so lines 7 to 14 and every cue after line 6 moved 0.2 s earlier. The cut home stays on the music's bar line at 68.0, and the tomato card now holds 0.59 s after the last word (0.39 s before). The build's description of n06's vowel as a close-mid e was wrong (its values are the English vowel of "kit"), and it is corrected here, in `sound/NOTES.md` and in SCRIPT-v2's pronunciation table |
| p. 1806: the descending sign touched the crop marks' number "6)", minor | The sign stops 8 px higher (scan y 2388, it was 2393), so its ink (screen y 282 to 319) ends 10 px above the upper arms (from y 330) and starts just under the last of the ghost of ערבות above it. The number moved under the lower-right arm (the engine's `belowRight` place, 10 px clear of the arm), so nothing is over it |
| p. 1806: the sense line was in ink to the window's edge and cut mid-word, minor | The isolation now runs from ג) to גופים, the last whole word inside the window (`lib/data.js` `p1806.senseIso`, from scan x 1870, in the gap before the word), and the rest of the line stays ghost |
| The composing card's three empty tray cells stayed up for 1.9 s, minor | The cells fade out over 0.3 s after the third tap (29.12 to 29.42). The root's sentence stays to the cut |
| Scan dirt beside מִלּוֹן drawn in ink at the open and the return, minor | `tools/inkcut.py` keeps only the connected parts of the ink with an area of at least 60 px that do not touch the box's edge: the four letters and the three points (holam, dagesh, hiriq). Three specks are dropped (areas 7, 10 and 90 px, the last cut by the box's lower edge), and alpha outside the kept parts, grown by 2 px, is 0. The specks now print only at the ghost tone with the rest of the page |
| The open's word is soft at 1.5x, minor | Not fixed. The fix is the Internet Archive's higher-resolution JP2 of leaf n12, which is a download that needs Kevin's approval. It stays an open item |
| The close: the sign came home at about 35 px on the wide key, minor | The cut home now lands on the sign as the lift left it, at its lifted size (640 px) in the centre of the window, and it comes down and shrinks onto the printed sign in its row over 0.8 s, as on p. 110, registering on the impression at 68.8. The shot, the framing, the length and the music are unchanged. Ending 0.3 to 0.4 s later is Kevin's decision, as the critic says, so the film still ends at 69.6 |
| The Ezekiel card is the slowest stretch (7.4 s), minor | Not changed. The critic's fix shortens the verse sentence that SCRIPT-v2 sets, which is Kevin's decision. The card's length is set by the sentence's reading floor (7.33 s for 19 words) |
| The gloss "Eyeglasses were houses for the eyes." reads as a figure of speech, minor | It now reads "The phrase for eyeglasses meant houses for the eyes." (9 words, floor 4.0 s, on screen 9.8 s before it sinks with its row). SCRIPT-v2's table and line 2 were updated to match |
| khashmal said with an English h, minor | Not changed. It was chosen on purpose in the 100 s round (h is the English approximation of ח), the critic's fix is to leave it to the native listener, and a "kh" respelling was heard as "kash mahal" in Clara's voice. It stays on the native listener's list |
| The 100 s cut's draft files in `out/`, minor | Moved, not deleted: `out/series-100s/_draft-modern-hebrew.mp4`, `out/series-100s/_draft-modern-hebrew.png` and `out/series-100s/_draft-sheet-modern-hebrew.png` |

**Timings after the fix round** (first sound to last sound, film s): line 6 24.47 to 30.24 (n06c), line 7 31.24 to 35.74, line 8 36.24 to 41.04, line 9 41.84 to 44.87, line 10 45.92 to 50.72, line 11 51.22 to 53.78, line 12 54.33 to 59.86, line 13 60.21 to 63.78, line 14 64.13 to 67.41. Lines 1 to 5 are unchanged. The pictures after line 6 start 0.2 s earlier: the title page again at 31.19, the key at 32.39, p. 110 at 36.19, the bicycle card at 38.20, the Ezekiel card at 41.79, p. 1806 at 49.21 and the tomato card at 54.28. The cut home is at 68.00 and the end at 69.60. The cues the critic checked move with the take: mem 24.87, made 28.32 (taps 28.62, 28.87 and 29.12), khashmal 44.34, poet 49.21, mark 52.52, today 64.04. Every reading floor still holds, because every hold after line 6 moved by the same 0.2 s; the composing card's sentences hold 5.58 s (floor 4.0), 3.56 s (3.0) and 2.87 s (2.33), and the new card 1 gloss 9.81 s (4.0).

**Measurements of the final after the fix round** (`motion/out/modern-hebrew.mp4`, 8,074,706 bytes):
- **The file:** H.264 High, yuv420p, 1920 x 1080, 60 fps, 4176 frames, 69.600 s; AAC LC, 48 kHz stereo, 69.600 s. The two durations are equal. Faststart as written (ftyp, moov at byte 32, free, mdat at byte 79,603). Under 50 MB, so no share file.
- **Loudness** (`ffmpeg -af ebur128=peak=true` on the mp4): -16.0 LUFS integrated, loudness range 1.6 LU, true peak -2.3 dBTP. `loudnorm` reads -16.06 LUFS and -2.32 dBTP. The final's audio matches `sound/mix-offline.wav` at zero lag with a gain of -0.05 dB, so the renderer's -1 dBTP trigger was not reached. The offline mix measures -15.9 LUFS, 1.6 LU and -2.3 dBTP.
- **Check:** `npx -y hyperframes@0.8.106 check .` passes with 0 errors and 0 warnings in lint, runtime, layout and motion (0 layout issues across 9 samples), and 27 of 27 text checks pass WCAG AA.
- **Render:** the documented command (`--quality delivery --fps 60 --workers 3 --no-browser-gpu`), 6 min 40 s at a load average near 420. The log is `sound/checks/render-final.log`, and no line of it mentions Google Fonts.
- **What is said** (`el.mjs hear` on the mp4's AAC, copied out without re-encoding to `sound/checks/final.m4a`; `sound/checks/final.stt.json`): all 14 lines word for word, 183 words, in English, with no audio event tagged. *makle'a* is heard as "makleh-ah" (28.62 to 29.26), and the other words and names as "Sefer Milim", "Milon", "mila", "mem", "hashmal", "electron", "Yechiel Michel Pines" and "agvaniyah". Every one of the 32 picture cues has its word heard within 0.12 s after the cue (the largest are "Today" +0.12 and "In 1880" +0.11, both a word's soft onset).
- **The picture:** frames at every line's start plus 1 s and at every set piece's key moments were read from the final. On p. 1806 at 53.2 s the sign's ink ends 10 px above the upper arms and the "6)" stands under the lower-right arm, 10 px clear of it, with nothing over it; the sense line is in ink from ג) to גופים, and שבהת is ghost. At the open (1.7 s) and the return (31.5 s) מִלּוֹן has only its letters and three points in ink. On the composing card the cells are fading at 29.2 s and gone at 29.5 s. At the close the sign is 640 px at the centre on the cut (68.0), comes down (68.3, 68.5) and is registered at 68.8. A per-frame scan of all 4176 frames at 192 x 108 finds the 11 largest jumps at the 11 hard cuts (4.38, 20.67, 24.43, 31.20, 32.40, 36.20, 38.22, 41.80, 49.22, 54.28 and 68.00, 3.3 to 9.1 levels), every other frame-to-frame change at or under 1.1 levels (the largest is the sign's descent home), no flicker and no flat frame.
- **The poster** is frame 2280 (38.0 s), p. 110 with the sign registered and the headword isolated (frame 2292 in the build). The contact sheet is `motion/out/_sheets/modern-hebrew.png`. CREDITS.txt is unchanged (the pictures and the length are the same) and copied again to `motion/out/modern-hebrew.credits.txt`.

**Deviation added by the fix round.** The tomato card now holds 0.59 s after the last word, where SCRIPT-v2 sets 0.4 s, because n06c is 0.2 s shorter and the cut home stays on the music's bar line at 68.0. The stretch without speech from the last word to the end is 2.19 s (0.59 s on the tomato card and SCRIPT-v2's 1.6 s close), under music.

### Open items after the fix round (Kevin decides)

- The 1913 and 1922 story stays cut, as above.
- A native Hebrew listener still signs off on Frederick's Hebrew words and the name, now with n06c's *makle'a* ("mak-LEH-ah", heard "maqleh ah" and "makleh-ah") and *khashmal* said with an h.
- A native reader still checks the set type, as above.
- The open's softness at 1.5x needs the Internet Archive JP2 of leaf n12, a download Kevin approves.
- The Ezekiel card's sentence could be shortened to the critic's 14-word version ("The verse reads, “like the look of the khashmal, from the midst of the fire.”"), with the gap after line 9 back at 0.35 s, which saves about 0.7 s. It changes SCRIPT-v2's sentence, so it waits for Kevin.
- Ending the film 0.3 to 0.4 s later, with the music's fade moved with it, would hold the registered sign longer. It waits for Kevin.
