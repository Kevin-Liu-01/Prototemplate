# journey-to-the-west: the concept

The film is set in one ink on one paper. Every source it shows was printed in one ink: the 1592 woodblock, the 1626 gazetteer and Richard's plates of 1913, all near-bitonal in their library scans. The film's type sits on the same white paper as those scans, so a printed character and the film's type can stand in the same place.

Every name enters as print. A hairline box draws round the printed name, the film's type lands in the box at the print's size, and the scan falls away. From then on the type does what the novel or a translator did:
- a component lifts off and turns to tint;
- a character opens into its parts and closes again;
- a kept part forms a boxed column;
- a lost meaning is a line in tint;
- a translator who left a name out gets an empty rule.

Tint is the one colour for what is set aside. There is no accent colour.

The winner is The names (`motion/concepts/journey-to-the-west/names/`). Its key frames are `stills/k01-title.png` to `k11-ledger.png`. Its signature move, the surname, is `motion-test.mp4`, built from `motion-test/index.html`, `lib/surname.js` and `lib/names.js`. The words, times and sources are in `SCRIPT.md`, which also lists the seven changes made to the treatment. This file gives the look, the type, the palette, the moves, the sound, and the picture and motion of each beat.

## The look

- **The frame.** Full frame, 1920 x 1080, on paper `#ffffff`. There is no letterbox, no bar and no series frame.
  - Text keeps a 160 px margin on the left and 120 px on the other three sides.
  - The credit line sits at the lower left, starting at x 160, in one or two lines whose last baseline is at y 960 or above. It names the picture on screen and leaves with it.
- **The scans.** Each scan is a plate with its own edges, laid on the paper.
  - Trim every plate to its paper, so the black scanner bed never shows.
  - Show every plate at 1.0 css px per scan pixel or smaller. The names treatment's k03 and k10 enlarged small crops past their resolution, and the print went soft. A crop is chosen so that the characters the film needs are large enough at 1:1 or below.
  - A plate is lowered to a third of its tone (a white veil at 69 percent, so its ink reads as tint `#bbbbbb`) when type stands over it.
  - The NCL seal and its red line 臺灣國家圖書館 NATIONAL CENTRAL LIBRARY, TAIWAN, R.O.C., the NLC watermark and the Cornell marks are left as scanned wherever a crop includes them. The red line is the only colour on screen that is not the film's own.
- **The camera.** It never moves on type. Two plates get a slow push from 1.00 to 1.03 (`none` ease, over the plate only): Hu Shih's photograph and the chapter 4 woodcut.
- **Cuts.** Scenes change by hard cuts on a sentence boundary or on a named word ("Wu" at 25.0). Nothing dissolves between scenes. A scan only leaves by falling away under type that stays, or with a cut.
- **Determinism.** One paused GSAP timeline, built synchronously. Glyph outlines are pre-built, morphs are MorphSVG between precomputed paths, and transforms are attribute tweens. There are no clocks, no randomness and no network. The names lane's two renders of the motion test matched on all 330 frames; the film must match the same way.

## The type

- **Chinese:** Noto Serif CJK TC, a Ming face descended from the woodblock style. Running Chinese is live text at weight 500, one text node per line with `lang="zh-Hant"`, vertical where the print is vertical. Characters that move are drawn from their own outlines (`data/glyphs.js`, weight 600), where one contour is very nearly one stroke.
- **Latin and pinyin:** Old Standard TT Regular and Italic. It is a revival of the late 19th-century Modern roman, the model of the type on Richard's 1913 title page and plate captions, so the English names arrive in the face of the first English plates. It carries ê (Pi-ma-wên). Old Standard has no precomposed ǎ, and the shaper composes it from a and the font's own combining caron; the names lane checked this in k07 and k08.
- **Fonts file:** copy `motion/concepts/journey-to-the-west/names/fonts/` to `motion/films/journey-to-the-west/fonts/` with both OFL licences. The private family names are JN Han and JN Latin, from `fonts/fonts.css`. Never write a Google Fonts family name in a composition. Re-run `make-subset.sh` on every string in SCRIPT.md, so that 西遊一書不知其何人所為, 吳承恩, 胡適, 唐三藏 and the rest are in the subset.

| element | face | weight | size at 1920 | colour |
| --- | --- | --- | --- | --- |
| Hero characters that move (猢猻, 孫, 子, 系, 弼馬溫, 避馬瘟) | JN Han outlines | 600 | 230 to 380 px | ink, tint when set aside |
| Name cards (悟 column, 心猿 rows, 唐三藏) | JN Han | 500 | 96 to 132 px | ink; 空 能 淨 in tint |
| Type registered on print | JN Han | 500 | the print's ink height | ink |
| English hero words ("Monkey", "Sun") | JN Latin | 400 | 160 to 210 px | ink |
| English renderings and names | JN Latin | 400 | 44 to 76 px | ink, or label for the rest of a rendering after its kept word |
| Glosses ("macaque", "boy", "mind-monkey", the preface's English) | JN Latin italic | 400 | 30 to 54 px | label |
| Tags (RICHARD, 1913) | JN Latin, capitals, letter-spaced 0.18 em | 400 | 22 px | ink |
| Counter ("30 of 100") | JN Latin, tabular figures | 400 | 64 px figures, 30 px "of 100" | ink |
| Credit line | JN Latin; Chinese in JN Han at 0.95 em | 400 | 21 px | label |

At 1280 x 720 the credit line sets at 14 px, the tags at about 15 px and the smallest glosses at 20 px. All three read in the names lane's stills scaled to that size.

## The palette

Every colour is measured from a source.

| token | value | use | source |
| --- | --- | --- | --- |
| paper | `#ffffff` | the ground of every frame | the paper of the NCL scan of the 1592 edition (255 in the page area; Richard's Cornell scans are also 255) |
| ink | `#202020` | Chinese and English type, hairlines, boxes | the 1592 print's ink in the NCL scan (mean of the darkest 4 percent of the page area) |
| tint | `#bbbbbb` | what is set aside: the lifted 犭, 胡, the fallen contents columns, Waley's empty rules, 避馬瘟's lost meaning | the grey of the NCL seal printed across every spread (187) |
| label | `#6b6b6b` | glosses, credits, the rest of a rendering after its kept word | the same ink at 66 percent |
| hair | `#dbdbdb` | rules between the rows of a card | the same ink at 16 percent |

## The moves

1. **Register.** A 1.5 px hairline box draws round a printed character or column, from its top left corner (0.45 s, expo.out). The type lands in the box at the print's ink height, its ink centre on the print's ink centre (`JN.register`).
2. **Fall away.** The scan lowers to a third of its tone or leaves (0.6 s, power2.in), and the type is free.
3. **Lift.** A component leaves its character in a straight line (0.6 s, power2.inOut) and turns to tint as it goes, which marks it as set aside.
4. **Take apart and set again.** A component first moves and scales as a whole, its strokes unchanged, to the height and centre of its standalone glyph (55 percent of the move, power3.inOut). Then each stroke changes in place into the matching stroke of the standalone glyph (45 percent, power2.inOut). The same two moves close parts back into a character.
5. **Type against.** An English rendering appears letter by letter at 26 letters a second (14 for a hero word), on a baseline aligned with the Chinese it renders. A kept part lines up, and a hairline box closes round the column it makes.
6. **Swap.** For the pun, the differing component slides out along a straight path and turns to tint, and the other slides in on the same path. The shared parts never move.
7. **Fall to tint.** A printed column a translation left out is veiled to tint in reading order (0.3 s each, power2.out, 15 ms apart).

Arrivals are expo.out or power3.out, moves power2.inOut or power3.inOut, and processes (the fall, the counter) linear. Nothing bounces or overshoots.

## The sound

- **Voices.** The narrator is the series voice in `motion/kit/audio/voice.json` (Clara, eleven_multilingual_v2, stability 0.65, style 0.2, speed 1.0). The Mandarin reader is Yun (eleven_multilingual_v2).
  - Yun reads only what the camera is reading: 猢猻, 孫, 悟空、悟能、悟淨 and 弼馬溫, each spliced between the narrator's clips and generated with `--prev` and `--next`.
  - The narrator never says a Chinese character.
  - Every take, and the native check, follow `SCRIPT.md`, The voices.
- **Music.** One bed from the Music API, at most two beds for the film. Generate it after the takes are placed and the cut is locked (98.5 s planned), at the locked length rounded up to the next whole second, and cut it to the picture with the closing fade. The prompt: "Instrumental chamber piece, exactly 99 seconds, 84 bpm. Pizzicato cello and viola play a light, precise figure of short single notes, like type being set, and a clarinet holds long low notes above it. It thins to the pizzicato alone under speech and opens out in the gaps between lines. Dry room, close microphones, quiet and clear. No percussion, no vocals, no piano, no synthesizer, no pentatonic or 'oriental' figures, no guqin, no gong, no erhu, no risers, no drops. In the last three seconds it ends on a held clarinet note over a last pizzicato."
  - This is the names lane's prompt at the film's length. Its 10 s sketch (`names/sound/music-sketch.mp3`) set the instruments, and speech-to-text heard no voice in it.
  - Nothing in the music points at China. The film is about English type.
- **Effects.** Short effects play at fixed timeline times, made from seeded filtered noise with ffmpeg (`names/sound/sfx/`), so the mix is the same on every render.
  - A soft tap when type lands on print.
  - A paper slide when a component lifts, a character opens or closes, or a plate arrives.
  - One long, quiet paper grain under the contents fall in beat 1.
  - One dry tick per typed letter, in three pitches, only for renderings and names typed against Chinese (beats 5, 6, 7 and 8). Credits, tags, glosses and the title card are typed silently. The names lane put a tick on every letter, which would chatter under the narrator in this cut.
  - Nothing plays on a cut.
- **Mix.** Load the `hyperframes-audio` skill.
  - Voices at -16 LUFS integrated for the film. The names motion test measured -17.7 LUFS integrated over its 11 s, so raise the voice stem until the film measures -16.
  - The bed at about -20 LUFS alone and ducked 10 dB under each line with 0.3 s ramps (about -26 under speech).
  - Taps and slides at least 12 dB under the voice, ticks at least 15 dB under. True peak below -1 dBTP. Fades of 0.3 to 0.8 s.
  - The bed resolves with a 0.8 s fade from 97.7 s.
  - Measure the final with `ffmpeg -i out.mp4 -af ebur128=peak=true -f null -`. The AAC length must equal the video length.

## The beats

Times are those of `SCRIPT.md`. On 2026-10-03 the sound lane re-timed `SCRIPT.md`'s beat table to the recorded takes (100.0 s; "Re-timed to the takes" there): where a time below differs from that table, the table wins, and `sound/manifest.json` gives every clip and word time. Scan paths are in the treatment folders, all downloaded from the URLs in BRIEF.md section 4. Copy each file into `motion/films/journey-to-the-west/assets/` and record it in `assets/SOURCES.md` with its URL, what it shows, its date and edition, its rights and its on-screen credit, using the treatments' SOURCES.md files as the starting text.

### 1. The title, and thirty of a hundred (0.0 to 12.0)

- **Picture A (0.0 to 8.0):** the names treatment's title frame.
  - The first page of chapter 1 (NCL PDF p. 12), cropped to the title column 新刻出像官板大字西遊記月字卷之一 and the two credit columns, at a third of its tone, bleeding off the right edge. 西遊記 is at x 1440 to 1530, y 1262 to 1528 on the scan.
  - "Monkey" at 210 px from x 160, its baseline near y 560. Under it, "translated by Arthur Waley" at 44 px in ink and "London: George Allen & Unwin, 1942" at 36 px in label.
  - "Journey to the West" in italic, 36 px, label, right-aligned to the left edge of the box round 西遊記, sitting on the hairline.
- **Motion A:**
  - The plate is on the paper from the first frame.
  - 0.5: the box draws round 西遊記. 1.0: the type lands.
  - 3.5: "Monkey" is typed, and the two card lines rise 12 px into place under it (0.5 s, power3.out, 90 ms apart), so the card is complete by 4.1 and its reading floor ends before the cut at 8.0.
  - 4.0: a hairline runs from the last letter of "Monkey" to the box (0.5 s, expo.out).
  - 5.5: "Journey to the West" is typed.
- **Picture B (8.0 to 12.0):** the 1592 contents, NCL PDF pp. 6 to 11, as eleven half pages on the paper in two rows read right to left: six on the top row, five on the bottom, the bottom-left half page ending 出像西遊記目錄終. The band fills y 60 to 880. The counter sits at the lower right, ending at x 1800. The chapter-list caption and the credit sit at the lower left.
- **Motion B:**
  - 8.0: hard cut. The counter reads "100 of 100".
  - 8.5 to 10.0: the 70 columns of the chapters Waley did not keep fall to tint in reading order, 15 ms apart, 0.3 s each, power2.out. The counter runs down to "30 of 100" on the same clock (linear). Every kept column stays in full ink.
  - 9.0: the caption rises.
  - Hold to 12.0.
- **Assets and credits:**
  - `names/assets/scans/shidetang-ncl08616-v1-pdf-p012.jpg` (3286 x 3041).
  - `woodblock/assets/ncl/ncl08616-v01-p06.jpg` to `-p11.jpg`, with the chapter-to-column map `woodblock/data/contents.json` (from `woodblock/tools/grid.py`).
  - Credits as `SCRIPT.md` beat 1.
- **Key frames:** `$PROTOTEMPLATE/motion/concepts/journey-to-the-west/names/stills/k01-title.png` (add "Journey to the West"). For picture B the layout reference is `$PROTOTEMPLATE/motion/concepts/journey-to-the-west/woodblock/stills/k02-thirty.png`, re-set on the paper with the film's tint. That frame's veils run past the foot of the pages (white bars below the top row); each veil must stop at its column's printed border.

### 2. No author (12.0 to 21.5)

- **Picture:** the right leaf of the preface (NCL PDF p. 2), at about 0.6 of its scan size, standing at the right of the frame from x 1000 and bleeding off the top and bottom. The second column from the right reads 遺西遊一書不知其何人所為. The box takes the eleven characters from 西 to 為 and leaves 遺 out.
- **Motion:**
  - 12.0: hard cut, the plate at full tone.
  - 16.5: the box draws round the eleven characters (0.45 s, expo.out).
  - 17.0: the type lands, one vertical text node. The plate lowers to a third.
  - 17.0 to 18.2: "no one knows who made this book" is typed in italic at 54 px, in ink, on one line from x 160, its baseline level with the box's mid-height.
  - Hold to 21.5.
- **Asset and credit:** `woodblock/assets/ncl/ncl08616-v01-p02.jpg` (3286 x 3041). Credit as `SCRIPT.md` beat 2.
- **Key frame:** a new frame at 20.0. Layout references: `$PROTOTEMPLATE/motion/concepts/journey-to-the-west/woodblock/stills/k04-preface.png` and `$PROTOTEMPLATE/motion/concepts/journey-to-the-west/editions/stills/k02-no-author.png`.

### 3. The author's name (21.5 to 29.5)

- **Picture A (21.5 to 25.0):** Hu Shih's photograph as a plate from x 160, y 120 to 870, as in the names treatment's k09. "胡適 Hu Shih" at the upper right of the frame: 胡適 at 90 px, "Hu Shih" at 76 px.
- **Picture B (25.0 to 29.5):** the 1626 gazetteer (NLC vol. 7, PDF p. 4).
  - Crop it at 1:1 to the two columns that matter: the column with 吳承恩 in large type and its small-type note, and the column to its left, whose head carries the end of the note, 秋列傳序 and 西遊記.
  - The plate stands at the right of the frame. The NLC watermark stays.
  - "attributed to Wu Cheng'en" in italic at 54 px, in ink, from x 160, level with 吳承恩.
- **Motion:**
  - 21.5: hard cut. The push runs from 1.00 to 1.03 on the photograph until 25.0.
  - 23.5: "胡適 Hu Shih" is typed.
  - 25.0: hard cut on "Wu". The box draws round 吳承恩, and the type lands at 25.5.
  - 25.5 to 26.5: "attributed to Wu Cheng'en" is typed.
  - 27.5: on "only a title", a second box draws round 西遊記 at the head of the next column, so the eye follows the note from the name to the title. The type lands in it at 28.0.
  - Hold to 29.5.
- **Assets and credits:**
  - `names/assets/scans/hushih-1939-harris-ewing-loc2016876181.jpg` (3840 x 4797).
  - `woodblock/assets/nlc/nlc-huaian-fuzhi-1626-v7-p04.jpg` (1969 x 1581, the page's 300 ppi master). Do not use the editions lane's 3840 px render of the same page, which is an upsampled render.
  - Credits as `SCRIPT.md` beat 3.
- **Key frames:** a new frame at 24.5 (photograph) and one at 29.0 (gazetteer). Layout references: `$PROTOTEMPLATE/motion/concepts/journey-to-the-west/names/stills/k09-hushih.png` and the aperture path in `$PROTOTEMPLATE/motion/concepts/journey-to-the-west/editions/stills/k04-new-york.png`.

### 4. The surname (29.5 to 46.0), the signature move

- **Picture:** the naming passage (NCL PDF p. 25, right half-leaf) at 1:1, cropped about 760 px wide by the frame's height, standing from x 1000 to 1760. The rightmost column opens 猢字去了个獸傍乃是个古月, and the next column has 猻字去了獸傍乃是个子系.
  - 猢 has its ink box at (2969, 692) to (3040, 766) on the scan, and the second 猻 at (2848, 1375) to (2936, 1451). At 1:1 both sit inside the crop, and each character is about 75 px.
  - The empty paper to the left is the stage the characters travel onto.
- **Motion:** this is the names treatment's `motion-test.mp4`, rebuilt to the simplified path (SCRIPT.md change 4).
  - 29.5: hard cut.
  - 32.5 and 33.0: the boxes draw round the printed 猢 and 猻. 33.5: both types land.
  - 34.5: on the reader's 猢猻, the scan falls away (0.6 s, power2.in), and the two characters travel to the middle as the word 猢猻, scaling to 300 px (0.9 s, power3.inOut).
  - 35.5: "macaque" is typed in italic under the word.
  - 36.5: the animal radical lifts off both characters and turns to tint (0.6 s, power2.inOut).
  - 37.5: 胡 turns to tint and slides left (0.6 s, power2.inOut), and 孫 moves to the centre.
  - 38.5: 孫 opens into 子 and 系 by the two moves (0.8 s). 39.0: "boy" is typed under 子. 39.5: "infant" is typed under 系.
  - 40.0: 子 and 系 close into 孫 by the two moves (0.9 s).
  - 40.5: the set-aside parts leave (the two radicals, 胡, "macaque", "boy" and "infant"; opacity, 0.5 s).
  - 42.0: on the reader's 孫, "Sun" is typed under it at 160 px.
  - The frame holds through the narrator's last line. Nothing is struck out: the line says what the translations did, and the picture keeps the analysis they left out.
- **Fixes to the treatment's build:**
  - 胡 no longer opens into 古 and 月, which removes the broken in-between frame inside 胡 (test time 4.3 s).
  - At test time 7.2 s, 子's cross stroke is drawn out as a long bar to the left of 孫 and through 系. Re-pair 子's strokes with the 子 component of 孫 (`JN.pair`), or finish the whole-component move before any stroke changes, so that no stroke leaves the target glyph's box. Check every frame of the close at full size.
- **Asset and credit:** `names/assets/scans/shidetang-ncl08616-v1-pdf-p025.jpg` (3302 x 3028). Credit as `SCRIPT.md` beat 4.
- **Key frames:** `$PROTOTEMPLATE/motion/concepts/journey-to-the-west/names/stills/k03-print.png` (re-crop at 1:1 as above), `k05-sun.png` (without the 正合嬰兒之本論 lines), and `$PROTOTEMPLATE/motion/concepts/journey-to-the-west/names/motion-test.mp4`. Make a new frame at 38.0 for the set-aside 胡 beside 子 and 系, replacing `k04-parts.png`.

### 5. 悟 (46.0 to 61.5)

- **Picture:** the names treatment's k06 on paper.
  - The 悟 column at x 160, the characters at 108 px, in rows at about y 360, 550 and 740. 空, 能 and 淨 stand beside them in tint.
  - Richard's column from about x 510, Jenner's from about x 990, Waley's from about x 1540. Tags at y 218.
  - Each rendering is set at 44 px: the kept word in ink, the rest in label.
  - Give every box at least 12 px of inner padding. The treatment's boxes touch "of Truth" and "to Emptiness".
- **Motion:**
  - 46.0: hard cut to paper.
  - 48.5: the three 悟 land in the column (0.5 s, power3.out, 90 ms apart, top to bottom). 49.0: the box draws round the column.
  - 50.5, 51.0, 52.0: 空, 能 and 淨 land in tint on the reader's syllables.
  - 52.5: RICHARD, 1913. 53.0: his three renderings are typed together, each row 90 ms after the one above. 54.0: a box closes round the column of "Seeker".
  - 55.0: JENNER, FROM 1982. 55.5: his three renderings are typed the same way. 56.5: a box closes round the column of "Awakened".
  - 56.5: WALEY, 1942. 57.5, 58.0, 58.5: "Monkey", "Pigsy" and "Sandy" are typed on their words, in ink. No box forms.
  - Hold to 61.5.
- **Assets:** none. Type only.
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/journey-to-the-west/names/stills/k06-wu.png`. Re-render without the 悟空 gloss and Waley's "once" line, and with the box padding fixed.

### 6. 弼馬溫 (61.5 to 76.5)

- **Picture A (61.5 to 63.0):** the chapter 4 woodcut (NCL PDF p. 51), both leaves, trimmed to the paper and centred, y 90 to 880. It shows a court audience: an enthroned figure under a canopy, attendants, a kneeling official holding a tablet, and guards, with no horses. The woodcut's printed caption is in the picture and is never transcribed.
- **Picture B (63.0 to 71.0):** the chapter 4 text (NCL PDF p. 52) as in the names treatment's k07.
  - The column 問曰我這弼馬溫是个甚麼官銜 at 1:1 at the left, from x 160. 弼馬溫 is at x 1156 to 1235, y 1000 to 1275 on the scan.
  - 弼馬溫 at 230 px on the top row (y 150 to 380), the copy on the bottom row (y 560 to 790), the syllables between them at 54 px, and the gloss under the bottom row in italic at 44 px.
- **Picture C (71.0 to 76.5):** the renderings card, as in the names treatment's k08.
  - 弼馬溫 at 150 px from x 160, "bìmǎwēn" at 54 px beside it, and "避馬瘟, ward off horse plague" in tint at 36 px beneath.
  - Five hairline rules in hair. Tags at x 160 and renderings at 64 px from x 640.
- **Motion:**
  - 61.5: hard cut. The push runs from 1.00 to 1.03 on the woodcut until 63.0.
  - 63.0: hard cut to the text. 63.5: the box draws round 弼馬溫. 64.0: the type lands.
  - 67.5: the plate lowers to a third, and 弼馬溫 travels to the top row (0.8 s, power3.inOut).
  - 68.5: a copy drops to the bottom row (0.5 s, power3.out).
  - 69.0: the swap. 溫's 氵 slides out to the left and turns to tint, and 疒 slides in over the same 昷. 弼 gives way to 避 by the two moves. Each change is 0.6 s, and 馬 never moves.
  - 69.5: a hairline draws between each pair, and "bì", "mǎ" and "wēn" are typed on them.
  - 70.0: "ward off horse plague" is typed under 避馬瘟.
  - 71.0: the card re-sets (0.8 s, power2.inOut). The top row shrinks to the card's heading, 避馬瘟 and its gloss shrink to the tint line under it, and the plate leaves. The pair stays on screen through the move, so its reading continues on the new card.
  - 71.5 to 72.5: the rules draw from the left (expo.out), and the four rows are typed, 0.25 s apart. They are complete before the narrator says "these" (73.2).
  - Hold to 76.5.
- **Build note:** 溫 and 瘟 share 昷 (8 contours each), so 昷 stays put while 氵 and 疒 trade places. 弼 and 避 share no component and use the two-move change on all their strokes. The swap is designed in the treatment and not yet built.
- **Assets and credits:**
  - `woodblock/assets/ncl/ncl08616-v01-p51.jpg` (3313 x 3018).
  - `names/assets/scans/shidetang-ncl08616-v1-pdf-p052.jpg` (3313 x 3018).
  - Credits as `SCRIPT.md` beat 6. The 本草綱目 credit in the treatment's k07 goes, with the line it named.
- **Key frames:** `$PROTOTEMPLATE/motion/concepts/journey-to-the-west/woodblock/stills/k08-court.png` (re-set on the paper), `$PROTOTEMPLATE/motion/concepts/journey-to-the-west/names/stills/k07-bimawen.png` (without the 本草綱目 line), and `$PROTOTEMPLATE/motion/concepts/journey-to-the-west/names/stills/k08-renderings.png`.

### 7. The allegory (76.5 to 91.5)

- **Picture:**
  - The contents for chapter 14 (NCL PDF p. 7), cropped at 1:1 to the columns round 心猿歸正, as a plate at the left from x 120. 心猿 is at x 2436 to 2504, y 1085 to 1215 on the scan. This print is faint, so check that the box reads at 1:1.
  - Then the contents for chapter 86 (NCL PDF p. 10) in the same place, cropped to the chapter 86 column, where 木母 heads the title and 金公 starts its second half. This print writes 恠 for 怪 in 征恠物. Only 金公 and 木母 are registered, and the title is never transcribed.
  - The rows 心猿, 金公 and 木母 at 132 px from x 640, at about y 330, 525 and 720, each with its gloss in italic at 30 px under it.
  - Waley's column at about x 1100 and Yu's at about x 1400, with tags at y 205.
- **Motion:**
  - 76.5: hard cut.
  - 79.0: the box draws round 心猿. 79.5: the type lands, and "mind-monkey" is typed.
  - 80.0: the plate falls away, and 心猿 moves to the first row (0.6 s, power3.inOut).
  - 80.5: the chapter 86 plate appears in the same place by a hard cut. The type does not move, and 心猿 stays in its row.
  - 80.5: the box draws round 金公. 81.0: the type lands. 81.5: the box draws round 木母. 82.0: the type lands.
  - 82.5: the plate lowers to a third, and 金公 and 木母 move to the second and third rows (0.8 s, power3.inOut).
  - 83.0: "Metal Lord" and "Wood Mother" are typed. WALEY, 1942 rises.
  - 85.0: on "Waley", three short rules draw in tint in Waley's column (0.45 s each, 90 ms apart). Nothing is typed there.
  - 86.0: YU, 1977 TO 1983 rises. 87.5: "Mind Monkey", "Metal Squire" and "Wood Mother" are typed together, each row 90 ms after the one above, so the column is complete by 88.2 and its reading floor ends before the cut.
  - Hold to 91.5.
- **Assets and credits:** `names/assets/scans/shidetang-ncl08616-v1-pdf-p007.jpg` and `names/assets/scans/shidetang-ncl08616-v1-pdf-p010.jpg` (3286 x 3041). Credits as `SCRIPT.md` beat 7.
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/journey-to-the-west/names/stills/k10-allegory.png`. Its plate is enlarged past 1:1 and soft; re-crop it.

### 8. The names that stayed (91.5 to 98.5)

- **Picture:** the names treatment's k02, on paper.
  - Richard's three plates, 孫行者, 猪八戒 and 沙和尚, each with its own printed caption, in a row from about x 225 to 1305, y 120 to 620. RICHARD, 1913 sits above them at y 100.
  - 唐三藏 in type, 132 px, in the fourth place, where there is no plate.
  - Two rows of names at 64 px, one name under each place: WALEY, 1942 at about y 730, LOVELL, 2021 at about y 830, each tag at x 160.
- **Motion:**
  - 91.5: hard cut. The plates, 唐三藏 and RICHARD, 1913 are on the paper. Waley's row is typed (0.5 s).
  - 92.5: Lovell's row is typed, in the same face, size and places.
  - 95.0: on "keeps Waley's names", one hairline box closes round both rows (0.45 s, expo.out).
  - The music resolves on the hold, and the bed fades from 97.7. The last frame is 98.5.
- **Assets and credit:** `names/assets/scans/richard-1913-cu31924074502034-n58-plate.jpg`, `-n234-plate.jpg` and `-n250-plate.jpg` (1545 x 2402, Cornell via Internet Archive). Credit as `SCRIPT.md` beat 8.
- **Key frame:** a new frame at 96.5. Layout references: `$PROTOTEMPLATE/motion/concepts/journey-to-the-west/names/stills/k02-pilgrims.png`, with the retyped plate captions removed, and the boxed columns of `$PROTOTEMPLATE/motion/concepts/journey-to-the-west/names/stills/k11-ledger.png`.

## Build notes

- **Composition.** Build in `motion/films/journey-to-the-west/` from the names lane's library:
  - `names/lib/names.js`: the palette, glyph placement, component splits (`SPLITS`), stroke pairing (`pair`), plates with a native-to-stage map, registration, hairline boxes, and typed Old Standard text.
  - `names/lib/surname.js`: the signature scene, to be reworked to the simplified path.
  - `names/tools/glyphs.py`: writes `data/glyphs.js`. Add 避, 瘟, 疒 and every other character that moves.
  - `woodblock/data/contents.json` and `woodblock/tools/grid.py`: the contents' chapter columns, for beat 1.
  - One paused GSAP timeline registered on `window.__timelines`, `fromTo` tweens only, built synchronously.
  - Symlink `motion/kit` into the project as the other films do. Pin the CLI at `npx -y hyperframes@0.8.106`.
- **Registered strings.** Before any type is registered on print, compare it with the print character by character. This copy of the 1592 edition writes a variant with the heart radical for 悟 in chapter 1 (the names lane read 悮, the woodblock lane 悞), 以為猻，猻也 in the preface where modern transcriptions print 孫 for the first character (BRIEF image notes), and 恠 for 怪 in the chapter 86 title. Register only where the type and the print are the same characters. Where they differ, set the type on paper and never over the print.
- **Plates.** Trim to paper and never show the scanner bed. Never scale a plate above 1.0 css px per scan pixel. Keep library marks as scanned. A plate is an `<img>` in the DOM so the renderer waits for it. The camera is 2D, so the 3D re-raster problem the jihe-yuanben page lane found does not arise.
- **Checks.**
  - `npx -y hyperframes@0.8.106 check .` must pass with 0 errors. The contrast warnings on text that has turned to tint are intentional (the names lane kept six of them); list each one in NOTES.md.
  - Render twice with `--workers 3` and compare framemd5 on every frame.
  - Look at the render at 1280 x 720. Check the reading floor ((words / 3) + 1 s), the 120 px text margin and the 160 px left margin, and the morph frames of beat 4 at full size.
  - Keep renders lean while other sessions are rendering: draft at `--quality draft --fps 30 --workers 3`, and run one full-length render at a time.
