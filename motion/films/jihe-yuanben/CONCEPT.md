# jihe-yuanben: the concept

Two old books are read aloud and marked by hand. Every picture in the film is a real scanned page under one lamp. A camera with a long lens looks at the paper on a tilt, and the only thing that moves on the print is a reader's vermilion brush (朱).

The brush makes three marks:
- a small reading circle at the lower right of each character as the Mandarin reader says it;
- a ring round each word that matters;
- a wavy line beside a book's title.

Some things lift off their pages as paper: the Qing figure's coloured pieces, the 界說 note and Clavius's Latin figure. The film opens on the title column of the 1607 book. It closes on the same four characters set in type, with one brushed stop after 本.

The winner is The page (`motion/concepts/jihe-yuanben/page/`). Its key frames are `stills/k01-title.png` to `k12-end.png`. Its signature move is `motion-test.mp4`, built from `motion-test/index.html` and `lib/credits.js`. The words, times and sources are in `SCRIPT.md`, which also lists the seven changes made to the treatment. This file gives the look, the type, the palette, the sound, and the picture and motion of each beat.

## The look

- **The frame.** The picture sits in a 2.35:1 window, 1920 x 816, between two 132 px bars on a warm black table.
  - The table is `#0b0907`, with one lamp pool drawn as a radial gradient from `#241c15` through `#17120d`.
  - The top bar carries the citation of the scan on screen.
  - The bottom bar carries the subtitle. Both start at x 120.
- **The camera.** It works in each scan's native pixel space, so every mark is measured on the print and stays on it at any framing.
  - A 3D tilt of 11 to 30 degrees gives a long-lens depth of field, so the near and far edges of the page go soft.
  - One multiplied lamp pool lights the page. In the signature move, a warm reading light also runs down the column being read (colour-dodge, so the ink keeps its contrast).
- **The scans.** They are trimmed to their paper, so the scanner bed never shows. The bitonal Siku Quanshu facsimiles are given the tone of paper with a multiplied `#d4c4a4`.
- **Cuts.** Scenes change by hard cuts between books and never by dissolves. A cut lands on a word: "Christopher", "So", "and every theorem".
- **Determinism.** Every scan, mark, lifted slip, lifted ink sheet, paper piece and shadow is painted into a canvas texture at native resolution, in the timeline's `onUpdate`. The page's lane found the reason: inside a moving 3D layer, Chrome re-rasters an `<img>` or SVG at a scale that depends on what the worker rendered before, so the frames differ between workers. Canvas textures avoid this. Two `--workers 3` renders of the motion test matched on all 240 frames.

## The type

- **Latin and pinyin:** EB Garamond, the Garamond model of the 1574 Clavius. It covers Latin, ὅρος, pinyin tone marks and long s.
- **Chinese:** Noto Serif CJK TC, a Ming face descended from the woodblock style.
- **Fonts file:** both come from `motion/films/jihe-yuanben/fonts/fonts.css`, with private family names (JY Latin, JY Han Subset, JY Han Full). Never write a Google Fonts family name in the composition. The full CJK face is the fallback, so 啓 and every subtitle character render even where the subset lacks them.

| element | face | weight | size | colour |
| --- | --- | --- | --- | --- |
| Citation bar | EB Garamond; Chinese at 0.9 em | 400 | 21 px | `#958a78` |
| Subtitle, English | EB Garamond | 500 | 37 px | `#ece2cd` |
| Subtitle, printed Chinese | Noto Serif CJK TC | 500 | 36 px, tracking 0.08 em | `#ece2cd` |
| End-card title column | Noto Serif CJK TC | 600 | 148 px | `#ece2cd` |
| End-card block | EB Garamond (*Jihe yuanben* in italic) | 400 to 500 | 27 to 44 px | `#ece2cd`, lesser lines `#958a78` |

At 1280 x 720 the subtitle sets at about 25 px and the citation at about 14 px. Both were read legibly in the treatment's frames.

## The palette

The film adds one colour of its own, vermilion `#c9351b`, multiplied into the paper. Every other colour is named by a source:

| token | value | use |
| --- | --- | --- |
| table | `#0b0907` | table and letterbox |
| paper type | `#ece2cd` | subtitles and end card |
| label | `#958a78` | citation bar |
| 朱 vermilion | `#c9351b`, multiply | reading circles, rings, title lines, the 朱冪 pieces |
| 青 | `#3f6f68` (blue-green), multiply | the 青冪 pieces, named by the Qing figure's own label |
| 黃 | `#d6a12e`, multiply | the 黃冪 pieces, named by the Qing figure's own label |
| Latin ink | `#2a3466` (indigo) | Clavius's lifted figure, so it reads apart from the Chinese ink |
| Siku tone | `#d4c4a4`, multiply | bitonal Siku Quanshu pages |

## The sound

- **Voices.** The narrator is the series voice in `motion/kit/audio/voice.json` (Australian Baritone, eleven_multilingual_v2, stability 0.85, style 0, speed 1.0). The Mandarin reader is Yun (eleven_multilingual_v2).
  - Yun reads only what the camera is reading.
  - 界說 and 幾何 are spliced in her voice between the narrator's clips, generated with `--prev` and `--next`.
  - The 齟齬 sentence and the 界說 note are heard in Mandarin and translated in the subtitle bar. The narrator does not re-read them.
  - Every take, and the native check, follow `SCRIPT.md`, The voices.
- **Music.** One bed from the Music API (`el.mjs music --seconds 100`), instrumental, at most two beds for the film. The prompt: "Instrumental chamber piece, exactly 100 seconds, 56 bpm. A low sustained cello and a felt piano playing single notes at wide intervals, with a soft bowed double bass under the longest holds. No percussion, no vocals, no build, no risers, no drops. No guqin, no pentatonic or 'oriental' figures, no gong. Sparse and warm, it stays low under speech. In the last two seconds it resolves on a held low note, and the final piano note is left to ring."
  - The treatment's 10 s sketch (`page/sound/music-sketch.mp3`) had guqin harmonics. Its cello and felt piano are kept, and the guqin is removed (`SCRIPT.md`, change 6).
- **Effects.** Short effects play at fixed timeline times.
  - Room tone runs throughout (`page/sound/sfx-room.mp3`).
  - One dry brush dab plays for each reading circle and a longer stroke for each ring. Both are cut from `page/sound/sfx-brush.mp3` and varied over three levels, as the motion test does.
  - A soft paper settle plays on each cut to a new book.
  - A paper lift plays for the 界說 slip.
  - The Liu Hui beat has three cues, all from one generated bed of short cues: one dry paper cut on "cutting", a soft paper slide as the three copies come out, and quiet paper taps in three pitches as the twenty pieces land.
  - The Latin ink sheet gets a faint paper peel when it lifts.
- **Mix.** Load the `hyperframes-audio` skill.
  - Voices at -16 LUFS integrated for the film.
  - The bed at about -27 LUFS under speech and -20 alone, ducked about 10 dB under each line.
  - Effects 12 dB under the voice. True peak below -1 dBTP. Fades of 0.3 to 0.8 s.
  - The bed resolves with a 0.8 s fade from 99.2 s.
  - Measure the final with `ffmpeg -i out.mp4 -af ebur128=peak=true -f null -`. The AAC length must equal the video length.
  - The treatment's 8 s test measured -16.3 LUFS integrated and a -3.0 dBFS peak, with AAC at 8.000 s.

## The beats

### 1. The title (0.0 to 10.0)

- **Picture:** The first text page of 卷一 (LOC vol. 1 sp=8). The camera is on the title column 幾何原本第一卷之首 beside the collector's red seal. The page is tilted 30 degrees.
- **Motion:**
  - From black, the lamp comes up (1.5 s, power2.out).
  - The camera tracks down the title column (8 s, power1.inOut).
  - On "Euclid" (about 4.6 s), the brush draws a wavy title line beside 幾何原本 (0.9 s, power2.out).
- **Asset and credit:** `motion/films/jihe-yuanben/assets/zh/pages/loc-wdl17216-v1-p008-full.jpg`. *Jihe yuanben* 幾何原本 · early 17th-century printing · Library of Congress / National Library of China (World Digital Library; no known restrictions).
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/jihe-yuanben/page/stills/k01-title.png`

### 2. Two men (10.0 to 17.4)

- **Picture:** The Kircher plate, from the unretouched Villanova master, with both men in frame. Ricci is on the left and Xu on the right. The seal-script panel and the cross are between them. The engraved cartouches stay out of the subtitle, and the names are set in type there. A hard cut at 15.5, on "Christopher", goes to the Clavius 1574 woodcut title page.
- **Motion:**
  - The lamp sits on Xu for his line, then slides to Ricci at 12.7 (0.7 s, power2.inOut).
  - On "Clavius" (about 16.0), the brush underlines CHRISTOPHORO CLAVIO (0.6 s).
  - The camera tilts up the page, and the brush draws the same wavy title line under ELEMENTORVM that it drew beside 幾何原本 (16.6 to 17.4). It is the same mark on the two books.
- **Assets and credits:**
  - `motion/films/jihe-yuanben/assets/west/kircher-plate-villanova-full.jpg`. Athanasius Kircher, *La Chine illustrée*, Amsterdam, 1670, plate facing p. 201 · Villanova University, Falvey Library. The 1670 engraving is public domain, and Villanova claims no license. The CC BY-SA 3.0 Commons retouch is not used.
  - `motion/films/jihe-yuanben/assets/west/clavius1574-leaf004-title-page.png`. Christoph Clavius, *Euclidis Elementorum libri XV*, Rome: Vincenzo Accolti, 1574, title page · Boston College Library, via Internet Archive. It is public domain by age, and the IA item has no rights field.
- **Key frames:** `$PROTOTEMPLATE/motion/concepts/jihe-yuanben/page/stills/k02-two-men.png` and `$PROTOTEMPLATE/motion/concepts/jihe-yuanben/page/stills/k03-clavius.png`

### 3. It grinds (17.4 to 28.0)

- **Picture:** Ricci's preface, vol. 1 sp=7, right half. The camera is on the column that ends 言象之粗而齟齬若是.
- **Motion:**
  - A hard cut lands at 17.4, and the camera reads down the column.
  - A reading circle lands at the lower right of 言, 象, 之, 粗 and 而, each on its syllable in the take's alignment.
  - On 齟齬, the brush rings the two characters twice round, the heaviest mark so far (0.9 s).
  - The subtitle holds to 28.0.
- **Asset and credit:** `motion/films/jihe-yuanben/assets/zh/pages/loc-wdl17216-v1-p007-full.jpg`. Ricci's preface 譯幾何原本引 · *Jihe yuanben*, early 17th-century printing · Library of Congress / National Library of China.
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/jihe-yuanben/page/stills/k04-juyu.png`

### 4. Mouth and brush (28.0 to 36.6), the signature move

- **Picture:** The two credit columns on vol. 1 sp=8, read on a tilted page. The shot ends on both columns, with the IHS seals of Ricci's preface across the fold.
- **Motion:** This is the motion test exactly, offset to 28.0. Its offsets are the clips' `data-start` values in `motion-test/index.html`.
  - The lamp comes up on 泰西 (0.6 s).
  - The camera reads down Ricci's column in step with the voice, and a warm read light runs down the column.
  - Each reading circle starts at its character's start time in `zh-credit-ricci.json`. 口譯 is ringed in one stroke while it is spoken (0.72 s, power1.inOut).
  - The camera crosses to Xu's column and pulls back while the narrator glosses (1.3 s, power2.inOut). Xu's column is read and marked the same way, and 筆受 is ringed.
  - The shot holds on the two rings side by side, with a slow push out from 36.0.
- **Assets and credit:**
  - `motion/films/jihe-yuanben/assets/zh/pages/loc-wdl17216-v1-p008-full.jpg`, with the LOC credit as beat 1.
  - Sound: `page/sound/zh-credit-ricci.mp3` and `zh-credit-xu.mp3` (pending the native check), and `en-mouth.mp3` and `en-brush.mp3`.
- **Key frames:** `$PROTOTEMPLATE/motion/concepts/jihe-yuanben/page/stills/k05-credits.png` and `$PROTOTEMPLATE/motion/concepts/jihe-yuanben/page/motion-test.mp4`

### 5. Problems (36.6 to 45.5)

- **Picture:** The opening of chapter 1 in the Siku Quanshu text (vols 1 to 3, p. 19), with five columns: 今有, 問, 答曰, 又有 and 方田術曰. It is a bitonal facsimile given the tone of paper. The camera starts closer than the treatment's key frame, so that the 今有田 column fills most of the window's height. It pulls back on "procedure" to take in the 術曰 column four columns to the left.
- **Motion:**
  - A hard cut lands at 36.6.
  - During the first line, reading circles run down 今有田廣十五步從十六步 at a reading pace.
  - On "question" (about 43.0), the brush rings 問為田幾何. On "answer" (about 43.8) it rings 答曰一畝. On "procedure" (about 44.7) it rings the 方田術曰 column, 0.6 s each.
  - The rings follow the page's own order: question, answer, procedure.
- **Asset and credit:** `motion/films/jihe-yuanben/assets/zh/pages/sl-ninechapters-siku-v1-3-p019-full.jpg`. 九章算術 *Nine Chapters on the Mathematical Art*, compiled by the 1st century CE · Qing edition, Siku Quanshu · Source Library / Internet Archive (CADAL), CC BY-SA 4.0.
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/jihe-yuanben/page/stills/k06-problems.png`

### 6. Cut and reassembled (45.5 to 54.8), with the reassembly taken from The geometry

- **Picture:** The 句股容圓圖 page (Siku vols 7 to 9, p. 132). It shows a right triangle on a grid with its inscribed circle. Its regions are labelled 朱冪, 青冪 and 黃冪, and the 案 note sits below the figure. The note ends 原本缺圖今補 and describes the rearrangement: 截朱青冪各成小句股者二今倒順相補各成小長方合四朱四青四黃而成大長方以容圓之徑為廣并句股弦為袤.
- **The geometry of the print** (crop `sl-siku-v7-9-p132-figure.png`, box 1090, 700, 2490, 2445 on the page). The judge read these approximate crop pixels by eye. Re-measure them with `page/tools/grid.py` and `fitellipse.py` before building.

  | point | crop pixels |
  | --- | --- |
  | right angle | (100, 1730) |
  | top vertex | (100, 95) |
  | far vertex | (1390, 1730) |
  | incentre | (520, 1320) |
  | radius | about 420 px, which is 2 cells |

  The printed triangle is 6 cells by 8 with a hypotenuse of 10. The woodblock grid is a little out of square, at cells of 205 to 215 px.
- **How the pieces tile.** The pieces are four 黃 squares, 2 by 2. The 朱 and 青 kites are cut into eight 朱 right triangles with legs 2 and 6, and eight 青 right triangles with legs 2 and 4. These close exactly into one rectangle 4 cells by 24, which is the diameter by the sum of the three sides. Lay it out in two rows of 黃, 青, 朱, 黃, 青, 朱 (2 + 4 + 6 + 2 + 4 + 6 = 24).
- **Motion:**
  - At 45.5, a hard cut lands with the camera on the figure.
  - On "Liu Hui" (about 48.7), the three regions take the colours their own labels name, multiplied into the paper: 朱 at 48.7, 青 at 49.1 and 黃 at 49.5, 0.4 s each.
  - On "cutting" (about 50.9), a hairline of lamp light runs along the printed dividing lines. The five printed pieces lift off as paper with soft shadows, and the 朱 and 青 kites part along their diagonals (0.6 s, power2.out).
  - From 51.3, three unprinted paper copies of the triangle, cut along the same lines in the same flat colours, slide out from under the page edge (0.6 s).
  - On "reassembling" (about 52.2), the twenty pieces travel to the table beside the page. They turn and flip over (倒順相補) and close into the 4 by 24 rectangle. This takes 1.6 s, power3.inOut, with a 40 ms stagger in the note's order: 朱, then 青, then 黃.
  - The printed pieces keep their ink and their labels, so 朱冪, 青冪 and 黃冪 ride on their own pieces.
  - The camera pulls back over the same 1.6 s (power2.inOut), so the whole strip and the figure's empty outline sit in frame.
  - The build fits the printed triangle to an exact 6-8-10 triangle while the pieces are in the air. The correction is under 5 percent, so the strip closes with no gap.
  - The result holds from about 53.8 to 54.8.
- **Assets and credit:** `motion/films/jihe-yuanben/assets/zh/pages/sl-ninechapters-siku-v7-9-p132-full.jpg`; the figure crop `assets/zh/sl-siku-v7-9-p132-figure.png`; the note crop `assets/zh/sl-siku-v7-9-p132-annotation.png`. 句股容圓圖 and its note, supplied by the Qing editors (原本缺圖今補) · *Nine Chapters*, Qing edition, Siku Quanshu · Source Library / Internet Archive (CADAL), CC BY-SA 4.0.
- **Key frames:**
  - Colour state: `$PROTOTEMPLATE/motion/concepts/jihe-yuanben/page/stills/k07-figure.png`.
  - The landed strip needs a new frame at 54.2. Its layout reference is `$PROTOTEMPLATE/motion/concepts/jihe-yuanben/geometry/stills/k08-b5.png`. Note that this frame shows the 8-15-17 problem as a 6 by 40 strip. The page film uses the printed 6-8-10 figure and a 4 by 24 strip.

### 7. Rule first (54.8 to 61.0)

- **Picture:**
  - Shot A (54.8 to 57.2): Clavius 1574 fol. 1r, with the heading DEFINITIONES and Def. 1.
  - Shot B (57.2 to 61.0): Clavius 1591 p. 20, Prop. I.1 with its lettered margin references. Frame shot B below the running head "EVCLIDIS GEOMETRIÆ", so the word *geometria* stays off screen before the 幾何 beat (SOURCES-west correction 8).
- **Motion:**
  - In shot A, on "names" (about 55.4), the brush underlines DEFINITIONES (0.6 s).
  - The hard cut to shot B lands on "and every theorem".
  - On "depends" (about 58.0), the brush rings the five superscript letters a to e in reading order, 0.3 s apart. Each is rung together with its margin reference: 3. petit., 1. petit., 20. definit., 15. definit. and 1. pronun.
  - From each reference, a fine vermilion line runs up the margin to the top of the text block (59.2 to 60.1, expo.out). The lines stop below the running head.
  - The shot holds to 61.0.
- **Assets and credits:**
  - `motion/films/jihe-yuanben/assets/west/clavius1574-leaf084-fol1r-book1-definitiones.png`. Christoph Clavius, *Euclidis Elementorum libri XV*, Rome: Vincenzo Accolti, 1574, fol. 1r · Boston College Library, via Internet Archive.
  - `motion/films/jihe-yuanben/assets/west/clavius1591-eth-p020.jpg`. Christoph Clavius, *Euclidis Elementorum libri XV*, 3rd ed., Cologne: G. B. Ciotti, 1591, p. 20 · ETH-Bibliothek Zürich, e-rara, Public Domain Mark 1.0.
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/jihe-yuanben/page/stills/k08-references.png`. Re-render it with the running head framed out and the lines ending at the text block.

### 8. An account of boundaries (61.0 to 72.0)

- **Picture:** The first text page of 卷一 again, on the heading 界說三十六則 and the one-column note under it.
- **Motion:**
  - A hard cut lands at 61.0.
  - On the reader's 界說 (62.5), the brush rings the heading's 界說.
  - As she begins the note (65.2), the note column lifts off the page as a slip of paper. It is hinged at its foot and stands toward the camera (1.5 s, power2.inOut). Its shadow falls on the page, and the place it left is bare paper.
  - The camera tilts up the slip as she reads.
  - On the final 界說 (about 70.3), the brush rings it on the slip.
  - The subtitle holds to 71.9.
- **Assets and credit:** `motion/films/jihe-yuanben/assets/zh/pages/loc-wdl17216-v1-p008-full.jpg`, and `motion/concepts/jihe-yuanben/page/lib/derived/p008-note-slip.jpg`, a lossless cut of the note column (box 932, 492, 1063, 2628). LOC credit as beat 1.
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/jihe-yuanben/page/stills/k09-jieshuo.png`

### 9. A B C becomes 甲 乙 丙 (72.0 to 84.7), with the handoff taken from The geometry

- **Picture:** First, Clavius 1574 fol. 21v and its Prop. I.1 figure, lettered A B C D. Then the 1607 Prop. I.1 (LOC vol. 1 sp=23), with its figure labelled 丙 甲 乙 丁 beside 第一題 and 于有界直線上求立平邊三角形.
- **Motion:**
  - On "sounds" (about 73.6), the Latin figure's ink lifts off its page as one indigo sheet (0.8 s), with a faint peel.
  - The film cuts on "So" (77.7) to the 1607 page.
  - The lifted figure travels in and settles by a similarity transform computed from the two printed constructions: A on 甲, B on 乙, C on 丙 and D on 丁, with the circles coinciding (1.2 s, power3.out).
  - On each of the reader's four syllables (from 81.4, at the take's character times), that Latin letter sinks into the paper (0.25 s, power2.in) while the brush rings the Chinese label beneath it. Each Stem comes out from under its letter at the moment it is heard.
  - After 丁, the remaining indigo circles and lines sink into the paper (83.4 to 84.2), leaving the woodblock figure with four vermilion rings.
- **Assets and credits:**
  - `motion/films/jihe-yuanben/assets/west/clavius1574-leaf125-fol21v-prop1.png`, and the lifted ink `motion/concepts/jihe-yuanben/page/lib/derived/clavius1574-f21v-prop1-ink.png` (box 940, 1946, 1288, 2230). Christoph Clavius, *Euclidis Elementorum libri XV*, Rome: Vincenzo Accolti, 1574, fol. 21v · Boston College Library, via Internet Archive.
  - `motion/films/jihe-yuanben/assets/zh/pages/loc-wdl17216-v1-p023-full.jpg`, with the LOC credit as beat 1.
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/jihe-yuanben/page/stills/k10-stems.png`. This frame shows the old state, with the Latin letters over the Stems. Re-render it at 82.5, with 甲 and 乙 ringed and clear and C and D still indigo.

### 10. How much (84.7 to 96.6)

- **Picture:** The Nine Chapters page with 問為田幾何 (the same page as beat 5) and the 1607 first text page with 依賴十府中幾何府屬. The two pages lie edge to edge.
- **Motion:**
  - A hard cut lands at 84.7. The shot holds on 問為田幾何 with 幾何 at frame centre, and the brush rings it as she says it (85.0).
  - On "magnitude" (about 90.5), the 1607 page slides in over it from the right in one straight move (1.0 s, power2.inOut). It carries its own 幾何 to the same height, and the brush rings that too (91.6).
  - The edge of the 1607 page throws a soft shadow.
  - The hold runs through the first half of the last line. The cut to the end card lands at 96.6, just after "years".
- **Assets and credits:**
  - `motion/films/jihe-yuanben/assets/zh/pages/sl-ninechapters-siku-v1-3-p019-full.jpg`, credited as beat 5.
  - `motion/films/jihe-yuanben/assets/zh/pages/loc-wdl17216-v1-p008-full.jpg`, credited as beat 1.
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/jihe-yuanben/page/stills/k11-jihe.png`

### 11. The title (96.6 to 100.0)

- **Picture:** The empty table under the lamp.
  - 幾何原本 is set in one column (Noto Serif CJK TC 600, 148 px) right of centre.
  - The EB Garamond block sits to its left: *Jihe yuanben* / Euclid's *Elements*, Books I to VI / Matteo Ricci and Xu Guangqi / Beijing, translated 1606 to 1607, printed 1607.
  - The citation bar carries the image credits for the whole film.
  - The subtitle bar carries the last line until it ends.
- **Motion:**
  - The title column arrives in reading order, one character at a time (90 ms stagger, opacity and an 8 px rise, power3.out, 96.6 to 97.3). The Latin block follows (97.0 to 97.6).
  - The narrator's "so the word narrowed to mean geometry" plays over the title.
  - When the line ends (about 99.0), the brush adds one vermilion stop after 本 (0.3 s).
  - The bed fades from 99.2.
- **Assets and credits:**
  - Fonts from `motion/films/jihe-yuanben/fonts/` (SIL OFL 1.1).
  - Citation bar, verbatim: "Images: Library of Congress / National Library of China (World Digital Library); Villanova University, Falvey Library; Boston College Library via Internet Archive; ETH-Bibliothek Zürich, e-rara; Source Library / Internet Archive (CADAL), CC BY-SA 4.0."
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/jihe-yuanben/page/stills/k12-end.png`

## Build notes

- **Composition.** Build in `motion/films/jihe-yuanben/` from the page lane's library: `page/lib/page.js` (the stage and canvas marks), `data.js` (measured page coordinates and citations), `credits.js` (the signature move) and `page.css`. Use one paused GSAP timeline registered on `window.__timelines`, with `fromTo` tweens only, built synchronously with build-time start values.
- **Drawing.** Draw everything in the timeline's `onUpdate`. Brush jitter takes its seed from each mark's `seed`.
  - No `Math.random`, no `Date`, no `performance.now`, no timers.
- **Layers to convert.** The treatment's frames still use four DOM elements:
  - the bare-paper patch and the slip shadow in beat 8;
  - the lifted-ink `<img>` in beat 9;
  - the page-edge shadow in beat 10.

  All four must become canvases before they move. The twenty Liu Hui pieces and their shadows are canvases from the start.
- **Note slip.** Keep the treatment's structure for the slip: composite the page flat and give the slip its own small plane. A tall 3D plane with a large image was culled unevenly by Chrome.
- **Audio.** Audio clips are `<audio>` elements with `data-start` and `data-duration`, placed from each take's `.json`. Retime each key action (circle, ring, lift, cut) to the take's character times, as `credits.js` does.
- **Checks.**
  - Run `npx -y hyperframes@0.8.106 check .` and get 0 errors.
  - Render twice with `--workers 3` and compare framemd5 on every frame.
  - Look at the render at 1280 x 720. The subtitle floor is (words / 3) + 1 s, and no text sits closer than 120 px to a frame edge.
