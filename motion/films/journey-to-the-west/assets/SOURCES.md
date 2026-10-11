# journey-to-the-west: sources

Every picture the film shows, where it came from, what it shows, its date and edition, its rights, and the credit printed on screen. The files in `ncl/`, `nlc/`, `loc/` and `ia/` are the archives' own pixels, copied unchanged from the treatment lanes that downloaded them from the URLs in `BRIEF.md` section 4 (`motion/concepts/journey-to-the-west/woodblock/assets/` and `names/assets/scans/`; the names and woodblock copies of NCL pp. 7, 10, 12, 25 and 52 are byte-identical). Nothing is retouched, cleaned or recoloured: the NCL seal and red line, the NLC watermark and the Cornell plate edges stay as scanned.

`plates/` holds what the film draws: one crop of a scan per plate, trimmed to the paper so the scanner bed never shows, resampled once with Lanczos to the exact size it is shown on the 1920 x 1080 stage (`tools/plates.py`, crops and scales in `data/plates.js`). The browser draws each plate one image pixel to one stage pixel. No plate is shown above 1.0 stage pixel per scan pixel; the two the camera pushes reach 0.28 (Hu Shih) and 0.37 (the woodcut) at the end of the push.

## The 1592 Shidetang edition, National Central Library (Taiwan) scan

- **Edition:** 新刻出像官板大字西遊記, Shidetang 世德堂, Jinling (Nanjing), preface dated 壬辰, read as 1592 by most scholars (BRIEF item 16).
- **Scan:** National Central Library (Taiwan), call no. 08616, vol. 1, on Wikimedia Commons: https://commons.wikimedia.org/wiki/File:NCL-08616_01_新刻出像官板大字西遊記.pdf . The PDF (51,538,942 bytes, 52 pages, SHA-1 f3ca51e30d1346d6e05f8a84cf4397cf5630ad9b) was fetched by the woodblock lane, and each page's embedded 300 ppi JPEG was extracted losslessly with `pdfimages -j`. `ncl/ncl08616-v01-pNN.jpg` is PDF page NN (the `?page=NN` of the Commons URL).
- **Rights:** Commons `{{PD-scan|PD-old}}`, "a mere mechanical scan or photocopy of a public domain original". Every spread carries a grey NCL seal and the red line 臺灣國家圖書館 NATIONAL CENTRAL LIBRARY, TAIWAN, R.O.C.; both are kept wherever a crop includes them.
- **Caption rules (BRIEF image notes):** "National Central Library (Taiwan) scan"; the date as "preface dated 壬辰, read as 1592"; the library record's author line (明)吳承恩撰 is never copied; the copy is never called the National Palace Museum copy (item 25).

| file | PDF page | what it shows | plate(s), crop in scan pixels, scale | beat | on-screen credit |
| --- | --- | --- | --- | --- | --- |
| `ncl/ncl08616-v01-p12.jpg` | 12 | Chapter 1, first page: the title column 新刻出像官板大字西遊記月字卷之一, 華陽洞天主人校, 金陵世德堂梓行 | `title` [1195, 700, 1590, 2050], 0.8, at full tone, then at a third once the type lands; the paper knockout inside the box round 西遊記 stops above the red line (plate rows 639 to 670), which runs whole under 記 | 1 | Right: chapter 1, the title column · 新刻出像官板大字西遊記, Shidetang 世德堂, Jinling (Nanjing), preface dated 壬辰, read as 1592 / National Central Library (Taiwan) scan |
| `ncl/ncl08616-v01-p06.jpg` to `p11.jpg` | 6 to 11 | The contents (目錄), eleven half pages, chapters 1 to 100; p. 11 left ends 出像西遊記目錄終 | `c-p06L` to `c-p11L`, each half page's ruled block plus a margin of paper, 0.168 | 1 | The contents, read right to left · 新刻出像官板大字西遊記, Shidetang 世德堂, Jinling (Nanjing), preface dated 壬辰, read as 1592 / National Central Library (Taiwan) scan |
| `ncl/ncl08616-v01-p02.jpg` | 2 | Chen Yuanzhi's preface, right leaf: 遺西遊一書不知其何人所為 | `preface` [1620, 606, 3090, 2830], 0.45 | 2 | Preface by Chen Yuanzhi 陳元之, dated 壬辰, read as 1592 by most scholars / 新刻出像官板大字西遊記, Shidetang 世德堂 · National Central Library (Taiwan) scan |
| `ncl/ncl08616-v01-p25.jpg` | 25 | Chapter 1, the naming passage: 猢字去了个獸傍乃是个古月 and 猻字去了獸傍乃是个子系 | `naming` [2300, 560, 3058, 1640], 1.0 | 4 | Chapter 1, the naming passage · 新刻出像官板大字西遊記, Shidetang 世德堂, Jinling (Nanjing), preface dated 壬辰, read as 1592 / National Central Library (Taiwan) scan |
| `ncl/ncl08616-v01-p51.jpg` | 51 | Chapter 4 woodcut, both leaves: a court audience (an enthroned figure under a canopy, attendants, a kneeling official holding a tablet, guards; no horses). Its own caption is in the picture and is not transcribed | `woodcut` [224, 520, 3090, 2740], 0.356 | 6 | Woodcut, chapter 4 · 新刻出像官板大字西遊記, Shidetang 世德堂, Jinling (Nanjing), preface dated 壬辰, read as 1592 / National Central Library (Taiwan) scan |
| `ncl/ncl08616-v01-p52.jpg` | 52 | Chapter 4 text: the column 問曰我這弼馬溫是个甚麼官銜 | `ch4` [990, 700, 1430, 1580], 1.0 | 6 | Chapter 4 · 新刻出像官板大字西遊記, Shidetang 世德堂, Jinling (Nanjing), preface dated 壬辰, read as 1592 / National Central Library (Taiwan) scan |
| `ncl/ncl08616-v01-p07.jpg` | 7 | Contents, chapters 10 to 29, with chapter 14 心猿歸正 (a faint impression in this copy) | `ch14` [2130, 626, 2690, 1799], 0.75 | 7 | The contents, chapter 14 · 新刻出像官板大字西遊記, Shidetang 世德堂, Jinling (Nanjing), preface dated 壬辰, read as 1592 / National Central Library (Taiwan) scan |
| `ncl/ncl08616-v01-p10.jpg` | 10 | Contents, chapters 70 to 89, with chapter 86 木母助威征恠物　金公施法滅妖邪 (this print writes 恠 for 怪) | `ch86` [322, 858, 882, 2031], 0.75 | 7 | The contents, chapter 86 · 新刻出像官板大字西遊記, Shidetang 世德堂, Jinling (Nanjing), preface dated 壬辰, read as 1592 / National Central Library (Taiwan) scan |

Printed ink boxes the film registers type on (scan pixels): 西 [1442, 1262, 1527, 1348], 遊 [1440, 1352, 1528, 1438], 記 [1442, 1442, 1530, 1528] on p. 12; the preface sentence 西 to 為 [2640, 902, 2805, 2710] on p. 2; 猢 [2969, 692, 3040, 766] and the second 猻 [2839, 1372, 2920, 1436] on p. 25 (the names lane's 猻 box took in the head of 字 below it and was re-measured); 弼 [1165, 1024, 1225, 1090], 馬 [1162, 1103, 1216, 1180], 溫 [1162, 1190, 1222, 1255] on p. 52; 心 [2395, 1066, 2477, 1120], 猿 [2400, 1135, 2470, 1217] on p. 7 (the names lane's box sat about 40 px to the right); 木 [575, 1047, 657, 1136], 母 [570, 1153, 652, 1228], 金 [562, 1826, 660, 1911], 公 [575, 1923, 661, 1989] on p. 10. The contents' chapter columns are the woodblock lane's grid (`woodblock/tools/grid.py`), with each column's top and bottom border re-measured inside the column (`tools/contents.py`, `data/contents.js`), so the veils stop on the printed border.

Type is registered only where the print and the type are the same characters. This copy writes a variant of 悟 in chapter 1 and 恠 for 怪 in the chapter 86 title, so 悟 is set on paper and only 金公 and 木母 are registered on the chapter 86 column; the chapter titles are never transcribed.

## 天啓淮安府志, printed 1626, National Library of China

- **Scan:** vol. 7, PDF p. 4, https://commons.wikimedia.org/wiki/File:NLC892-0618-208676_天啓淮安府志_第7冊.pdf?page=4 (PDF 15,820,391 bytes, SHA-1 aca6b77a77a05a47ea4f4900233932278e2dc2e2), rendered at 300 dpi with `pdftoppm` by the woodblock lane: `nlc/nlc-huaian-fuzhi-1626-v7-p04.jpg`, 1969 x 1581.
- **Shows:** juan 19 (淮賢文目): 吳承恩 in large type, his small-type note, and 秋列傳序 and 西遊記 at the head of the next column.
- **Date:** printed 1626 by its own colophon (BRIEF items 5 and 17).
- **Rights:** Commons `{{PD-old-100-expired}}` and `{{PD-scan}}`, with the notice that the image carries a digital watermark; the large NLC watermark is kept.
- **Plate:** `gazetteer` [1020, 50, 1560, 1520], 0.7. Registered: 吳 [1203, 1000, 1278, 1064], 承 [1197, 1067, 1279, 1129], 恩 [1199, 1133, 1277, 1199]; 西 [1114, 179, 1143, 226], 遊 [1111, 241, 1147, 294], 記 [1113, 308, 1144, 362].
- **On-screen credit (beat 3):** 天啓淮安府志, juan 19, printed 1626 · National Library of China scan. The type beside it says "attributed to Wu Cheng'en" (item 15). A hairline drawn on the plate (not on the file) runs from the box round 吳承恩 down the small-type note, up the rule between the columns and into the box round 西遊記. No portrait of Wu Cheng'en exists and none is shown.

## Hu Shih, Washington, 1939

- **Source:** Wikimedia Commons, https://commons.wikimedia.org/wiki/File:Chinese_Ambassador_to_U.S.,_Dr._Hu_Shih,_Sept._1939_LCCN2016876181.jpg , the 3840-pixel rendition of the 8104 x 10123 original, fetched by the names lane: `loc/hushih-1939-harris-ewing-loc2016876181.jpg`, 3840 x 4797.
- **Original:** Library of Congress, Harris & Ewing collection, LCCN 2016876181, glass negative, September 1939.
- **Rights:** Library of Congress "No known restrictions on publication"; Commons `{{PD-Harris-Ewing}}`.
- **Plate:** `hushih` [1120, 860, 3220, 3660], 0.268, at x 160, y 120; a push from 1.00 to 1.03 over 21.0 to 24.6 s.
- **On-screen credit (beat 3):** Photograph: Harris & Ewing, 1939 · Library of Congress. Shortened by the finish lane (critic pass 3) to meet its reading floor in the 3.6 s the photograph stands; the name stands beside it as 胡適 Hu Shih, and the rights statement ("No known restrictions on publication") is recorded here. Until then the credit read "Hu Shih 胡適, Washington, 1939 · Photograph: Harris & Ewing, Library of Congress, no known restrictions on publication".

## Timothy Richard, *A Mission to Heaven*, Shanghai, 1913, Cornell copy

- **Source:** Internet Archive item `cu31924074502034`, https://archive.org/details/cu31924074502034 , page images `https://archive.org/download/cu31924074502034/page/nN.jpg`, 1545 x 2402, greyscale, fetched by the names lane.
- **Rights:** the Cornell notice leaf reads "There are no known copyright restrictions in the United States on the use of the text." Richard died in 1919. The plates reproduce Chinese woodcuts.
- **Caption rule:** "after an unnamed Chinese illustrated edition" (Richard names only "the 146 prepared for the Chinese edition of the book"). The Internet Archive record's creator field (Li Zhichang) belongs to another book; nothing is taken from the catalogue.

| file | page | shows | plate, crop, scale |
| --- | --- | --- | --- |
| `ia/richard-1913-cu31924074502034-n58-plate.jpg` | n58 | 孫行者, with its printed caption | `r58` [300, 300, 1460, 2220], 0.2552 |
| `ia/richard-1913-cu31924074502034-n234-plate.jpg` | n234 | 猪八戒, with its printed caption | `r234` [222, 300, 1382, 2220], 0.2552 |
| `ia/richard-1913-cu31924074502034-n250-plate.jpg` | n250 | 沙和尚, with its printed caption | `r250` [212, 282, 1372, 2202], 0.2552 |

- **On-screen credit (beat 8):** Plates: Richard, *A Mission to Heaven*, 1913, after an unnamed Chinese illustrated edition · Cornell University Library. Shortened by the finish lane (critic pass 3) to meet its reading floor in the 6.5 s the plates stand; Richard's first name is on screen in beat 4 (TIMOTHY RICHARD, 1913), and the place (Shanghai) and the scan's host (Internet Archive, item `cu31924074502034`) are recorded here. The plates keep their own printed captions; nothing is retyped from them.

## Shown only as type (in copyright)

- Arthur Waley, *Monkey*, London: George Allen & Unwin, 1942 (UK copyright to the end of 2036; title page and jacket by Duncan Grant). Named on the title card in the film's own type ("Monkey", "translated by Arthur Waley", "London: George Allen & Unwin, 1942"); no page, jacket, layout or device of the book is shown or imitated.
- Hu Shih's introduction to the American edition (John Day, 1943): not quoted.
- Yu (University of Chicago Press), Jenner (Foreign Languages Press), Lovell (Penguin): their names, years and the short renderings BRIEF.md gives, set as type.
- Hayes 1930 (public domain in the US only) is not shown.

## Fonts (`../fonts/`, SIL OFL 1.1, licences beside the files)

| file | private family | source |
| --- | --- | --- |
| `JWHan-NotoSerifCJKtc-subset-VF.woff2` | JW Han | Noto Serif CJK TC (variable), subset by `fonts/make-subset.sh` from `motion/films/jihe-yuanben/fonts/NotoSerifCJKtc-VF.otf` (read only) to the 476 CJK characters of BRIEF.md, SCRIPT.md and CONCEPT.md plus the film's strings (`fonts/subset-chars.txt`). Licence `OFL-NotoSerifCJK.txt` |
| `OldStandard-Regular.ttf`, `OldStandard-Italic.ttf` | JW Latin | Old Standard TT 3.000 (google/fonts `ofl/oldstandardtt`), copied from the names lane. Licence `OFL-OldStandardTT.txt` |

`data/glyphs.js` holds the outline contours of the 23 characters the film draws as paths (`tools/glyphs.py`, from the same Noto Serif CJK TC file instanced at weight 600 for the characters taken apart and 500 for type registered on print).

## Sound

Every voice clip, the bed and the effects are the sound lane's (`../sound/NOTES.md`, `../sound/manifest.json`): Clara and Yun from ElevenLabs through `kit/audio/el.mjs`, one Music API bed, and effects made from seeded noise with ffmpeg.

## v2 build (2026-10-05): what the 73 s cut shows

The v2 cut (`SCRIPT-v2.md`) shows the NCL scan's chapter 1 title column (p. 12) and naming passage (p. 25), the contents (pp. 6 to 11), the chapter 4 woodcut (p. 51) and text (p. 52) and the contents round chapter 14 (p. 7); Hu Shih's photograph; and Richard's three plates. It no longer shows the preface (p. 2), the chapter 86 crop (p. 10) or the Huai'an gazetteer; their files stay here. Its on-screen credits, each one line:

- "[the part shown] · the oldest surviving edition · National Central Library (Taiwan) scan" on every 1592 picture (no date: SCRIPT-v2 audit, item 16);
- "Arthur Waley, *Monkey*, 1942, a footnote in chapter VI" under Waley's footnote "Monkey" (type only);
- "本草綱目 *Compendium of Materia Medica*, quoting a horse manual" under the line 「馬廄畜母猴，辟馬瘟疫」 (type only; public domain);
- "Photograph: Harris & Ewing, 1939 · Library of Congress";
- "Plates: Timothy Richard's English version, *A Mission to Heaven*, 1913, after an unnamed Chinese illustrated edition · Cornell University Library".

The narrator is Frederick Surrey (ElevenLabs library voice, `kit/audio/voice-series.json`). The 100 s cut's copy of this file is `../archive-100s/SOURCES.md`.
