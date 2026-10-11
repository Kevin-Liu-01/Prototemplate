# journey-to-the-west: the script

The film of *Monkey*, London, 1942, and the English names of 西遊記 *Journey to the West*. It is the second installment of the Chinese series. The words, timings and sources are here. The pictures, motion, type, colour and sound are in `CONCEPT.md`.

## The decision

Three treatments were judged on six criteria of 10. For each one the judge read TREATMENT.md and SOURCES.md, looked at every key frame at full size and at 1280 x 720, read the contact sheet, and pulled the motion test apart with ffmpeg (two frames a second, plus single frames at full size where a move looked wrong). Sound was judged from each lane's narrator take and its speech-to-text check, each music sketch's check, and an ebur128 pass on each motion test.

| treatment | story | facts | writing and Chinese | picture | sound | build | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| The names (`motion/concepts/journey-to-the-west/names/`) | 7.5 | 8.5 | 9 | 8.5 | 7.5 | 8.5 | **49.5** |
| The editions (`motion/concepts/journey-to-the-west/editions/`) | 7.5 | 9 | 8 | 6.5 | 8 | 8 | 47 |
| The woodblock (`motion/concepts/journey-to-the-west/woodblock/`) | 9 | 8 | 7 | 8.5 | 6.5 | 7.5 | 46.5 |

- **The names** is the clearest film. Every name enters as print, a hairline box draws round it, the film's type lands on it, and the type then does what the novel or a translator did. Its frames are the cleanest of the three: 悟 in a boxed column beside Richard's and Jenner's boxed columns, and 弼馬溫 over 避馬瘟 with one reading between them. Its narration is the plainest, and its build is proven (two renders of the motion test matched on all 330 frames).
  - Against it: it leaves out the 1592 edition's missing author, Hu Shih's 1923 case for Wu Cheng'en and Waley's thirty chapters. The roster lists all three, and the film's title names Hu Shih.
  - The surname morph shows two broken in-between frames (test time 4.3 s, inside 胡, and 7.2 s, where 子's cross stroke is drawn out as a long bar left of 孫).
  - Key frame k03 leaves two thirds of the frame empty beside a scan enlarged past its resolution. The scan in k10 is soft for the same reason.
  - Its close retypes two of Richard's plate captions ("Sun the Monkey", "Chu Pa Kiei the Pig") that the BRIEF does not give.
  - The narrator's take said the surname as English "sun", and speech-to-text heard "Son".
- **The editions** has the best single idea for Waley's selection, the collation of the 1592 chapter strip into Waley's row, and the most careful facts. Its picture is a spreadsheet.
  - Entries sit at 18 to 26 px. The column heads at y 21 to 50 and the thumbnails at x 16 are outside the 120 px safe area.
  - The close, both ledger pages at half scale, cannot be read at 1280 x 720.
  - It has no surname beat, one of the roster's five strands.
  - Its motion test is a progress bar: the move that matters is a cursor reading a row of small cells.
- **The woodblock** tells the whole story, and it has the strongest single frames: Waley's names set into the empty ruled columns at the end of the 1592 contents, and the chapter 4 woodcut. Its weaknesses are in the writing, the build and the sound.
  - Its captions are two-line chains of claims joined by middle dots, and some are fragments ("a collator and a printer.").
  - Its enlarged print glyphs are soft (k06), and its attribution beat is crowded (k05).
  - Its column veils overshoot the page foot (k02, and the motion test at 2.0 s).
  - Its motion test credits the edition as "Shidetang edition, Jinling (Nanjing), 1592", with no hedge.
  - Its one take ran at 1.8 words a second and had no speech-to-text check. Its music sketch decays to silence by 8 s.

The winner is **The names**. The film keeps its idea and its grammar whole. Seven changes were taken from the other two treatments or made by the judge. Each one uses a move the names treatment already has (a box, type landing on print, a fall to tint, a plate with its own edges), so none of them adds a second visual language.

1. **The author's name enters in the names grammar (from The woodblock and The editions).** Two beats now carry the 1592 edition's missing author and Hu Shih's case.
   - On the preface leaf, a box draws round 西遊一書不知其何人所為, the type lands on it, and "no one knows who made this book" is typed beside it.
   - On the 1626 gazetteer, a box draws round 吳承恩. A second box follows the small-type note to 西遊記 at the head of the next column, which is the editions treatment's aperture path. "attributed to Wu Cheng'en" is typed beside the name.
   - Hu Shih's 1939 photograph moves here from the allegory beat, so the man in the film's title is on screen while his case is made.
2. **Thirty of a hundred (from The woodblock, with The editions' collation).** The 1592 contents stand on the paper as eleven half pages. The 70 chapter columns Waley did not keep fall to tint in reading order while a counter runs from 100 to 30. Tint is the names treatment's colour for what is set aside, so the move needs no new grammar. The woodblock lane's chapter-to-column map (`woodblock/data/contents.json`) is reused.
3. **The chapter 4 woodcut opens the 弼馬溫 beat (from The woodblock and The editions).** The Shidetang woodcuts are this film's named material, and the names treatment showed none. The woodcut stands as a plate with its own edges for one line, "Heaven makes him", captioned "Woodcut, chapter 4".
4. **The surname is simplified, and the Mandarin reader says 孫 (judge's fix).**
   - Only 猻 is analysed. 胡 goes to tint whole when the narrator says "the second character", which removes the old-and-yin sentence (5.6 s) and the broken in-between frame inside 胡.
   - The reader says 孫 at the end of the narrator's sentence, and the screen types "Sun". This removes the "Son" problem.
   - "In chapter 1" moves from the narration to the credit line.
5. **The close puts Waley's and Lovell's names under Richard's plates (judge's fix).** The names treatment's two frames with the pilgrims become one: Richard's three plates and 唐三藏, Waley's four names under them, then Lovell's identical four, with one box round both rows. The table's Richard and Jenner columns are gone, and with them the plate captions retyped from outside the BRIEF.
6. **Cut for length and reading (judge's fix).** Each of these is true by the BRIEF, and each cost a reading floor the film could not carry under 100 s:
   - Hu Shih's "good-natured satire". The allegory-or-comedy question (§5 item 19) stays out of the film.
   - "and left out most of the poems".
   - 「正合嬰兒之本論」 and its English.
   - The 本草綱目 line about the macaque in the stable.
   - 未入流 and its box.
   - Waley's single gloss, "Aware-of-Vacuity", and the gloss of 悟空.

   The lines to restore if the takes run short are listed under "If the takes run long or short".
7. **The script was re-timed to the cap (judge's fix).** At 2.7 words a second with numbers read out, the names treatment's script plus the grafts ran about 105 s. Merges and the cuts above bring the film to 98.5 s.

## The idea

A name in this novel is made out of the parts of a character, and every English version decides which parts to keep. The film shows that decision one name at a time. Every name enters as print: the 1592 woodblock, the 1626 gazetteer, or Richard's plates of 1913. A hairline box draws round the printed name, the film's type lands on it at the print's size, and the scan falls away. From then on the type does what the novel or the translator did.

- The book's name: 西遊記 is registered in the 1592 title column, and Waley's one English word, *Monkey*, is set beside it.
- The author's name: the preface of the oldest surviving edition says no one knows who made the book, and the gazetteer's 吳承恩 is typed as "attributed".
- The monkey's surname: the animal radical lifts off 猻, what remains opens into 子 "boy" and 系 "infant", and the two close again as 孫.
- The disciples' names: 悟 stands as one boxed column. Richard's "Seeker" and Jenner's "Awakened" each form a boxed column of their own, and Waley's Monkey, Pigsy and Sandy form none.
- The stable title: a copy of 弼馬溫 changes two of its three characters and becomes 避馬瘟, over one shared reading, and four English titles are typed under it without the second meaning.
- The allegorical names: 心猿, 金公 and 木母 get three empty rules in Waley's column and three names in Yu's.

The film opens on 西遊記 and *Monkey*. It ends on Richard's plates, with Waley's four names and Lovell's same four inside one box.

The signature move is the surname. It is the names treatment's motion test, rebuilt to the simplified path in change 4. The camera never moves on type, and nothing is ever struck out: the picture keeps what the translations left out.

## Length and pace

- **Length:** 100.0 s at 1920 x 1080 in eight beats (planned 98.5 s; re-timed to the takes, see "Re-timed to the takes").
- **English:** 18 lines, 174 written words since critic pass 3 (n03 was 12 words and is 13), 183 spoken words once numbers are read out ("nineteen forty-two", "fifteen ninety-two", "nineteen twenty-three", "twenty twenty-one"). Planned at 67.4 s at 2.7 words a second; the takes measure 69.6 s from each line's first sound to its last letter, 2.61 words a second.
- **Mandarin:** four passages, 4.8 s as cut: 猢猻 0.83 s, 孫 0.44 s, 悟空、悟能、悟淨 2.78 s and 弼馬溫 0.78 s.
- **Holds:** the remaining 25.6 s are holds and the gaps between lines. Each hold serves a reading floor ((words / 3) + 1 s after the text has fully arrived), a move that lands, or the close.
- **Measured pace:** `kit/audio/voice.json` records 2.73 words a second for Clara at natural speed. The three treatment takes ran slower, counting their pauses: 2.50 (editions, 20 spoken words in 7.99 s), 1.99 (names, 11 in 5.53 s) and 1.81 (woodblock, 27 in 14.91 s). If the film's takes run near 2.4 words a second, speech grows by about 8 s, and the ladder under "If the takes run long or short" takes it back.
- No treatment take is reused. Every line's wording changed.

## The voices

- **Narrator (N):** the series voice in `motion/kit/audio/voice.json`.
  - Voice: Clara, eleven_multilingual_v2, stability 0.65, style 0.2, speed 1.0. Never slow or speed a take.
  - N reads only English and never says a Chinese character.
  - Generate each line with `el.mjs line`, passing `--prev` and `--next`, and place it by its `.json` timings. "Heaven makes him" and "a post in the imperial stables." are two takes around the reader's 弼馬溫. "A patriarch makes ... macaque," and "Without the animal radical ... his surname is" end on the reader's words.
- **Mandarin reader (R):** Yun, a native Beijing Mandarin broadcast voice from the ElevenLabs library, the reader of jihe-yuanben, so the Chinese series keeps one Mandarin voice.
  - Voice: Yun, eleven_multilingual_v2, through `el.mjs line --voice Yun`.
  - R reads only the Chinese the camera is reading, as printed.
  - Generate each passage with `--prev` and `--next` set to the English around it.
  - As recorded (2026-10-03): every eleven_multilingual_v2 take of the four passages came back in the wrong tones by pitch track (猻 and 孫 falling, 悟 rising, 溫 low), in characters, in pinyin and inside a carrier sentence. The film uses the fallback below: Yun on eleven_v3, which refuses `--prev` and `--next`, so those takes have none. Short v3 takes clip their first and last sounds, so 孫 and 弼馬溫 were read inside a short Mandarin carrier sentence and cut out at their own edges, 猢猻 joins 猢 from one take to 孫 from the 孫 take at the onset of the s, and 悟能 was requested as the homophone 誤能 (v3 read 悟能 as yùnéng twice). `sound/NOTES.md` has the ledger.
- **Native check, required before the final:**
  - A native listener must approve every R take. Kevin decides. NOTES.md carries one item per take.
  - 弼馬溫 must come out bìmǎwēn, with bì in the fourth tone. It is the one place in the film where the sound is the subject, and the same take stands for both 弼馬溫 and 避馬瘟.
  - 孫 is a single syllable spliced at the end of an English sentence, and a one-syllable request can come back clipped or in the wrong tone. If it fails, N says "so his surname is Sun" in one take, with the word spelled "Soon" in the request text only. The screen keeps "Sun".
  - If a take fails, retake it on eleven_v3, or use Mr. Chen, Siqi Liu or James Gao from `motion/concepts/jihe-yuanben/page/sound/zh-voices.json`.
  - Run `el.mjs hear` on every take, Mandarin and English.

### Pronunciation

| word | say it |
| --- | --- |
| 1942 | nineteen forty-two |
| 1592 | fifteen ninety-two |
| 1923 | nineteen twenty-three |
| 2021 | twenty twenty-one |
| Waley | WAY-lee |
| Hu Shih | hoo SHIR |
| Wu Cheng'en | woo chung-UN |
| macaque | muh-KAK |
| Pigsy | PIG-zee |
| Jenner | JEN-er |
| Anthony Yu | AN-thuh-nee YOO |
| Lovell | LUV-ul |
| 猢猻 | húsūn |
| 孫 | sūn |
| 悟空、悟能、悟淨 | wùkōng, wùnéng, wùjìng |
| 弼馬溫 | bìmǎwēn (never bī) |

## The beats

Times are film seconds. Cuts and untied arrivals sit on the 0.5 s grid. The table was re-timed on 2026-10-03 to the recorded takes (see "Re-timed to the takes" below): every spoken time is the take's measured first and last sound as placed in `sound/manifest.json`, and each arrival tied to a word sits at that word's time in the take's `.json`, given in brackets. Holds absorb the difference. "Cut" is a hard cut. "Credit" is the credit line at the lower left, which names the picture on screen and leaves with it. Paragraph numbers (¶) count the prose paragraphs of BRIEF.md section 2 after its opening coordinate line: ¶1 is "In 1942 George Allen & Unwin in London published *Monkey*" (BRIEF.md line 66), and ¶12 is "The Euclid installment of this series" (line 88). "Item n" is the section 5 fact-check list.

| # | time | spoken (who) | on screen | BRIEF.md source of each fact |
| --- | --- | --- | --- | --- |
| 1 | 0.0 to 11.5 | N 0.5 to 7.1: "In 1942 a London publisher issued Monkey, Arthur Waley's translation of Journey to the West." N 8.0 to 10.7: "He kept thirty of its hundred chapters." | 0.0 the chapter 1 title column, at a third of its tone. 0.5 a box draws round the printed 西遊記. 0.5 credit: "Right: chapter 1, the title column · 新刻出像官板大字西遊記, Shidetang 世德堂, Jinling (Nanjing), preface dated 壬辰, read as 1592 / National Central Library (Taiwan) scan". 1.0 西遊記 in type, in the box. 3.5 "Monkey" (the narrator says it at 3.45), "translated by Arthur Waley" and "London: George Allen & Unwin, 1942". 6.1 "Journey to the West", beside the box, on "Journey" (6.13). Cut 8.0 to the 1592 contents. 8.0 counter "100 of 100". 8.0 credit: "The contents, read right to left · 新刻出像官板大字西遊記, Shidetang 世德堂, Jinling (Nanjing), preface dated 壬辰, read as 1592 / National Central Library (Taiwan) scan". 8.5 to 10.0 the counter runs to "30 of 100" as 70 columns fall to tint ("thirty" at 8.52). 8.5 "Arthur Waley, *Monkey*, 1942" (critic pass 3: the chapter list, "chapters 1 to 15, 18, 19, 22, 37 to 39, 44 to 49 and 98 to 100", needed 8 s to read and the picture stands 3.5 s; it is in NOTES.md). Hold to 11.5. | 1942, London, George Allen & Unwin, Arthur Waley, *Monkey*, 西遊記 *Journey to the West*: ¶1, item 1. The card in the film's own type, imitating no jacket: §1 image notes, §4 Rights. A hundred chapters and thirty kept, by number: ¶1, item 2. "Read as 1592" and "National Central Library (Taiwan) scan", with no author line: §1 row 3, image notes, items 4, 16 and 25. The 1592 edition lacks the later chapter 9 (item 18), so the fall claims the count and not a column-for-column identity (see "Audit"). |
| 2 | 11.5 to 21.0 | N 12.0 to 18.5: "Most scholars date the oldest surviving edition to 1592. It names no author." | Cut 11.5 to the preface leaf. 12.0 credit: "Preface by Chen Yuanzhi 陳元之, dated 壬辰, read as 1592 by most scholars / 新刻出像官板大字西遊記, Shidetang 世德堂 · National Central Library (Taiwan) scan". 15.8 a box draws round 西遊一書不知其何人所為 (on "ninety-two", 15.80). 16.3 the eleven characters in type, in the box; the scan lowers to a third. 16.4 to 17.6 "no one knows who made this book" is typed beside the column, in the pause before "It names no author" (17.07 to 18.5); its reading floor ends at 20.9. Hold to 21.0. | The oldest surviving edition names no author: ¶2, item 4. "Dated 1592 by most scholars": §1 row 3, item 16 (Huang Yongnian read 1532, so the date stays hedged). The preface, Chen Yuanzhi, 壬辰, the sentence and its English: ¶2, item 4. |
| 3 | 21.0 to 29.5 | N 21.5 to 28.9: "In 1923 Hu Shih argued for Wu Cheng'en, from a gazetteer entry that gives only a title." | Cut 21.0 to Hu Shih's photograph. 21.0 credit: "Photograph: Harris & Ewing, 1939 · Library of Congress". 22.45 "胡適 Hu Shih", before "Hu" (23.25). 23.9 to 25.3 under it 〈西遊記考證〉 and "A textual study of *Xiyou ji*, 1923", on "argued" (23.97); the name and the study are type and stay through the cut. Cut 24.6, on "Wu" (24.63), to the gazetteer. 24.6 a box draws round 吳承恩. 24.6 credit: "天啓淮安府志, juan 19, printed 1626 · National Library of China scan". 25.1 吳承恩 in type, in the box. 25.4 to 26.4 "attributed to Wu Cheng'en" is typed level with it, close to the plate. 26.4 to 27.45 a hairline runs from the box down the small-type note, up the rule between the columns and into the head of the next column. 27.5 a second box draws round 西遊記 there, where the note ends, on "gives" (27.53). 28.0 西遊記 in type, in that box. Hold to 29.5. | Hu Shih in 1923 argued for Wu Cheng'en from the gazetteer entry, and the entry gives a title only: §1 row 4, ¶3, item 5. His study 〈西遊記考證〉, "A textual study of *Xiyou ji*," 1923: ¶3, item 3. "Attributed": item 15 (contested). Juan 19 and "printed 1626": items 5 and 17, §1 row 4, image notes. The photograph, its date and credit: §1 row 9, §4 Rights. No portrait of Wu Cheng'en exists, so none is shown: image notes, §4 Rights. Wu's dates are not shown, so item 15's date range does not arise. |
| 4 | 29.5 to 47.0 | N 30.0 to 34.6: "A patriarch makes the monkey's surname from the word for macaque," R 34.95 to 35.75: 猢猻 N 36.1 to 43.1: "Without the animal radical, the second character leaves boy and infant, so his surname is" R 43.45 to 43.85: 孫 N 44.35 to 46.6: "Richard and Waley both drop this analysis." | Cut 29.5 to the naming passage. 30.0 credit: "Chapter 1, the naming passage · 新刻出像官板大字西遊記, Shidetang 世德堂, Jinling (Nanjing), preface dated 壬辰, read as 1592 / National Central Library (Taiwan) scan" (it leaves with the scan at 34.95). 32.5 a box draws round the printed 猢, and 33.0 round the printed 猻. 33.5 both in type. 34.95 on the reader's 猢猻, the scan falls away and 猢猻 travels to the middle. 36.0 "macaque". 37.0 the animal radical lifts off both characters and turns to tint (on "animal radical", 36.74 to 37.72). 38.5 胡 turns to tint and is set aside (on "second character", 38.36 to 39.18). 39.5 孫 opens into 子 and 系 (on "leaves", 39.25). 39.6 "boy", on the word (39.62). 40.6 "infant", on the word (40.64). 41.0 子 and 系 close into 孫. 42.0 the set-aside parts leave. 43.45 "Sun", on the reader's 孫. 44.2 and 44.6 the tags TIMOTHY RICHARD, 1913 and ARTHUR WALEY, 1942 rise under "Sun", just ahead of the names; 45.45 an empty rule in tint draws under each, on "drop". Hold to 47.0. | The Patriarch, the surname derived from 猢猻 (macaque), 猻 without the animal radical leaving 子系, "boy" and "infant", and the surname 孫: ¶6, item 8. "Sun": §1 row 6. Richard and Waley drop the radical analysis: ¶7, item 8. The page is NCL PDF p. 25. Both 猻 in the passage carry the animal radical as printed, and no other words are quoted from it. |
| 5 | 47.0 to 63.5 | N 47.5 to 50.6: "The three disciples' religious names share one character." R 50.95 to 53.75: 悟空、悟能、悟淨 N 54.1 to 58.0: "Richard writes Seeker in all three, and Jenner writes Awakened." N 58.3 to 61.4: "Waley calls them Monkey, Pigsy and Sandy." | Cut 47.0 to paper, with 悟, 悟, 悟 standing in a column. 48.0 "disciples of the monk Tripitaka" is typed under the names, on "disciples'" (48.01). 49.43 a box draws round the column, on "share". 51.2 空, 52.2 能 and 53.4 淨 land in tint, on the reader's syllables (51.21, 52.24, 53.39). 54.0 "RICHARD, 1913". 54.5 "Seeker of Truth", "Seeker after Strength", "Seeker after Purity", typed together ("Seeker" at 54.82). 55.5 a box closes round the column of "Seeker". 56.5 "JENNER, FROM 1982" ("Jenner" at 56.70). 57.0 "Awakened to Emptiness", "Awakened to Power", "Awakened to Purity", typed together ("Awakened" at 57.40). 58.0 a box closes round the column of "Awakened". 58.3 "WALEY, 1942". 59.3 "Monkey", 60.1 "Pigsy" and 60.9 "Sandy", each on its word (59.27, 60.11, 60.88). 59.55 "glossed once as “Aware-of-Vacuity”" in label grey under "Monkey" (restore item 2 below). No box forms. Hold to 63.5 (the reading floor ends at 63.5). | The three religious names share 悟: §1 row 7, ¶6 (悟空 takes 悟 from a lineage; 豬悟能 and 沙悟淨 in chapter 8). Richard's three "Seeker" names and Jenner's three "Awakened" names: ¶7, item 8. Waley's Monkey, Pigsy and Sandy, and his single gloss "Aware-of-Vacuity": §1 row 7, ¶7, item 8. Tripitaka the monk: ¶7, §3 row 唐三藏. "From 1982" for Jenner, with no volume count: items 11 and 20. The names are set in type and never registered on the chapter 1 print, which writes a variant with the heart radical for 悟 in this copy (read as 悮 in the names lane's SOURCES and as 悞 in the woodblock lane's). |
| 6 | 63.5 to 78.5 | N 64.0 to 64.85: "Heaven makes him" R 65.1 to 65.85: 弼馬溫 N 66.1 to 68.25: "a post in the imperial stables." N 69.5 to 72.6: "The title is usually heard as ward off horse plague." N 74.5 to 76.8: "None of these English titles keeps the pun." | Cut 63.5 to the chapter 4 woodcut. 63.5 credit: "Woodcut, chapter 4 · 新刻出像官板大字西遊記, Shidetang 世德堂, Jinling (Nanjing), preface dated 壬辰, read as 1592 / National Central Library (Taiwan) scan". Cut 65.0 to the chapter 4 text. 65.0 credit: "Chapter 4 · 新刻出像官板大字西遊記, Shidetang 世德堂, Jinling (Nanjing), preface dated 壬辰, read as 1592 / National Central Library (Taiwan) scan". 65.13 a box draws round the printed 弼馬溫, on the reader's 弼. 65.6 弼馬溫 in type. 69.0 the scan lowers to a third. 69.5 弼馬溫 travels to the top row. 70.5 a copy drops to the bottom row. 71.0 it becomes 避馬瘟, before "ward" (71.22): 弼 and 氵 turn to tint and are gone by 71.2, and 避 and 疒 come down into their places from 71.25. 71.5 "bì", "mǎ", "wēn" between the rows. 72.0 "ward off horse plague" under 避馬瘟, as the narrator says it (71.22 to 72.57). 73.0 the card re-sets: 弼馬溫 "bìmǎwēn" at the top, and "避馬瘟, ward off horse plague" in tint beneath. 73.5 to 74.5 "RICHARD, 1913" "Stud Master", "WALEY, 1942" "Pi-ma-wên", "YU, 1977 TO 1983" "pi-ma-wen", "JENNER, FROM 1982" "Protector of the Horses", complete before "these" (74.85). 74.5 an empty rule in tint draws after each title, on "None". Hold to 78.5. | Heaven makes him 弼馬溫, a post in the imperial stables: §1 row 8, ¶8 (the Jade Emperor, the Imperial Stables). "Usually heard as" 避馬瘟, ward off horse plague, and the shared reading bìmǎwēn: §1 row 8, ¶8, §3 row 弼馬溫. The earliest source for that reading is unverified (item 22), so no source is named. The woodcut, its caption, and the uncaptioned scene: image notes. Stud Master, Pi-ma-wên, pi-ma-wen, Protector of the Horses, and none carries the pun: ¶8, §3 row 弼馬溫, item 12. Lovell's rendering is not checked (item 23), so she is not on the card. |
| 7 | 78.5 to 93.5 | N 79.0 to 84.6: "The chapter titles call him the mind-monkey, and give Monkey and Pig alchemical names." N 85.0 to 87.3: "None of these names appears in Waley." N 88.0 to 91.2: "Anthony Yu's complete translation renders them all." | Cut 78.5 to the contents, chapter 14. 78.5 credit: "The contents, chapter 14 · 新刻出像官板大字西遊記, Shidetang 世德堂, Jinling (Nanjing), preface dated 壬辰, read as 1592 / National Central Library (Taiwan) scan". 81.0 a box draws round 心猿. 81.5 心猿 in type, and "mind-monkey" (the narrator says it 80.76 to 81.59). 81.75 the scan falls away. 82.0 心猿 moves to the first row as one word: it rises, then goes across, and 猿 swings from under 心 to beside it on the way. Cut 82.5 to the contents, chapter 86, with credit "The contents, chapter 86 · (as above)". 82.5 a box draws round 金公. 83.0 金公 in type. 83.5 a box draws round 木母. 84.0 木母 in type. 84.2 the scan lowers to a third. 84.5 木母 moves to the second row and 84.85 金公 to the third, each as one word that turns from the print's vertical line into the row (critic pass 1 put 木母 above 金公, in the order the title prints them). 85.0 "Wood Mother, for Pig" and 85.5 "Metal Lord, for Monkey". 85.0 "WALEY, 1942". 86.8 three empty rules in Waley's column, on "Waley" (86.80). 88.0 "YU, 1977 TO 1983". 89.5 "Mind Monkey", "Wood Mother", "Metal Squire", typed together, complete by 90.2. Hold to 93.5. | 心猿 "the mind-monkey" in the 1592 chapter titles, and 金公 Metal Lord for Monkey and 木母 Wood Mother for Pig, names from internal alchemy: ¶9, item 10. 心猿 in the 1592 contents for chapter 14: §3 row 心猿 (NCL pp. 6 to 7). 金公 and 木母 in the chapter 86 title: ¶9, §3 rows 金公 and 木母 (NCL p. 10). None of these terms in Waley: ¶9, item 10. Yu's complete translation, 1977 to 1983, renders them, with "Mind Monkey", "Metal Squire" and "Wood Mother": §1 row 9, ¶10, §3 rows 心猿, 金公 and 木母, item 12. |
| 8 | 93.5 to 100.0 | N 94.0 to 98.7: "Julia Lovell's Monkey King of 2021 keeps Waley's names." | Cut 93.5 to paper: Richard's plates of 孫行者, 猪八戒 and 沙和尚, with their own printed captions, and 唐三藏 in type in the fourth place. 93.5 credit: "Plates: Richard, *A Mission to Heaven*, 1913, after an unnamed Chinese illustrated edition · Cornell University Library" (shortened for its reading floor; the full record is in assets/SOURCES.md). 93.5 "RICHARD, 1913" above the plates. 93.5 "WALEY, 1942" "Monkey", "Pigsy", "Sandy", "Tripitaka". 94.5 "LOVELL, 2021" "Monkey", "Pigsy", "Sandy", "Tripitaka". 97.4 one box closes round both rows, on "keeps" (97.35). Hold to 100.0. | Waley's names for the pilgrims, Monkey, Pigsy, Sandy and Tripitaka, are also the names in Lovell's *Monkey King* of 2021: ¶1, item 13. Waley's "Monkey" stands where Tripitaka gives the name 行者: ¶7. Richard's plates and their caption rule: §1 rows 6 and 7, image notes, §4 Rights. 唐三藏 and "Tripitaka": ¶7, §3 row 唐三藏. |

The title card lines, the tags (RICHARD, 1913 and the rest), the counter, the caption, the glosses and labels ("macaque", "disciples of the monk Tripitaka", "glossed once as “Aware-of-Vacuity”") and the credit lines are title-card text and credits, so by convention they sit outside the no-fragments rule. Every narration line is a complete declarative sentence once the reader's word completes it. None of them uses an em dash, a rhetorical question, an exclamation, an "X, not Y" pair or a metaphor.

## Re-timed to the takes

The sound lane recorded every line on 2026-10-03 (`sound/NOTES.md`, `sound/manifest.json`). The takes ran 2.2 s longer than planned in English and 0.4 s longer in Mandarin, and three passages needed a later start to keep a breath between voices. No take was slowed or sped, and no line was cut. What changed:

- **Beat lengths.** Beat 1 12.0 to 11.5 s (the hold after "chapters" comes down from 1.4 to 0.8 s), beat 2 9.5 s (unchanged), beat 3 8.0 to 8.5 s (the line ends at 28.9, and the cut needs a breath after it), beat 4 16.5 to 17.5 s, beat 5 15.5 to 16.5 s, beats 6 and 7 15.0 s (unchanged), beat 8 7.0 to 6.5 s (step 1 of the ladder below: the close keeps 1.3 s after the last word). The film is 100.0 s.
- **Beat 1.** "Journey to the West" is typed on "Journey" (6.1), 0.6 s later than planned.
- **Beat 2.** The line runs 6.0 s against 5.2 and ends at 18.1. The box (16.0) and the type (16.5) keep their planned place in the line, so "no one knows who made this book" is complete at 17.7 and its floor ends at 21.0, the cut.
- **Beat 3.** The cut to the gazetteer moves to "Wu" as said (24.6), and the second box to "gives" (27.5).
- **Beat 4.** Every passage after the first starts later than planned, because "macaque" ends at 34.6 and the second line runs 6.9 s against 5.6: the reader's 猢猻 at 34.95, the second line at 36.1, the reader's 孫 at 43.45 and "Richard and Waley both drop this analysis." at 44.35. The surname moves follow the words (lift 37.0, 胡 set aside 38.5, open 39.5, close 41.0).
- **Beat 5.** The reader's three names run 2.8 s against 2.2, with a pause between names, so 空, 能 and 淨 land at 51.2, 52.2 and 53.4, and Richard's, Jenner's and Waley's columns move with the lines that name them.
- **Beat 6.** "The title is usually heard as ward off horse plague." starts at 69.5 (0.5 s later than its place in the plan), so that 弼馬溫 travels, its copy drops and the swap lands (71.0) before "ward" (71.22).
- **Beats 7 and 8.** Every time moves with the beat start, and the three empty rules and the closing box land on their words ("Waley" 86.8, "keeps" 97.35).

## If the takes run long or short

Place every take by its `.json` timings and let the holds absorb the difference. Never change a take's speed. With the takes of 2026-10-03 the cut runs 100.0 s after step 1 below; steps 2 and 3 are not used.

- **If the cut runs past 100.0 s,** take back time in this order:
  1. Bring the holds down to their floors. The close can lose 1.0 s of its last hold, and beat 5 can cut at 61.0 (its reading floor ends at 60.9).
  2. Cut "Richard and Waley both drop this analysis." (2.6 s plus its gap). Beat 4 then holds on 孫 "Sun" for 1.5 s and cuts.
  3. Cut the woodcut. "Heaven makes him" plays over the chapter 4 text, which saves 1.5 s.
- **Reading floor:** never shorten a hold below (words / 3) + 1 s after the text has fully arrived.
- **If the cut runs short by 2 s or more,** restore in this order:
  1. The reader's 西遊一書不知其何人所為 in beat 2, after the narrator's line, with "no one knows who made this book" typed as she reads (about 2.8 s). It is the preface's own sentence (¶2).
  2. "glossed once as “Aware-of-Vacuity”" in label grey under Waley's "Monkey" in beat 5 (¶7), with 2.5 s more hold.

## Audit against BRIEF.md

Every spoken line, every word on screen and every credit above was checked against sections 2 to 5. Nothing contradicts them, and every contested item stays hedged:

- Item 15, Wu Cheng'en's authorship: the narration says "argued for", the screen says "attributed to Wu Cheng'en", and the 1592 edition is shown as anonymous. No portrait, statue or library author line appears.
- Item 16, the 1592 date: the narration says "Most scholars date the oldest surviving edition to 1592" once (until critic pass 3 it said "dated 1592 by most scholars", an aside between subject and verb), and every credit says "preface dated 壬辰, read as 1592".
- Item 17, the gazetteer: "printed 1626".
- Item 18, chapter 9: Waley's chapter numbers are those of his later text, which has the Kangxi-era chapter 9, and the 1592 edition lacks that chapter. Every chapter from 1 to 15 is lit, so the lit columns match the count of thirty without claiming that each 1592 column is the chapter Waley translated under that number. The caption gives Waley's numbers as Waley's.
- Item 19, allegory or comedy: not raised. Hu Shih's American introduction is not quoted.
- Item 20, Jenner's volumes: "from 1982", with no volume count.
- Items 21 to 25, unverified: the edition behind Waley's Shanghai text is not mentioned; no source for the 避馬瘟 reading is named; Lovell appears only with the names item 13 verifies; Richard's plates are "after an unnamed Chinese illustrated edition"; the NCL copy is never called the National Palace Museum copy.

Drift found and fixed during the audit:

- The woodblock motion test's credit printed "Shidetang edition, Jinling (Nanjing), 1592" with no hedge. The film's credits all carry "preface dated 壬辰, read as 1592".
- The names treatment retyped "Sun the Monkey" and "Chu Pa Kiei the Pig" from Richard's plates; only "SUN THE MONKEY" and "Sa Ho Shang the Dandy Dolphin" are in the BRIEF. The plates now carry their own printed captions, and nothing is retyped from them.
- This copy of the 1592 print writes a variant for 悟 in chapter 1 (悮 or 悞; the two lanes read it differently), and 恠 for 怪 in the chapter 86 title 木母助威征怪物. The film registers type only where the print and the type are the same characters: 悟 is set in type on paper, and only 金公 and 木母 are registered on the chapter 86 column, whose credit names the chapter and does not transcribe the title.
- The editions treatment showed Hayes's 1930 title page, which is public domain in the US only. This film does not show it.

## Open items

- A native Mandarin listener signs off every R take (see The voices). Kevin decides.
- The surname: the eleven_v3 孫 is a level first tone by pitch track and is heard as 孙, so the narrator's fallback ("Sun", requested as "Soon") was not recorded. If the native listener rejects 孫, record that fallback before the final mix.
- Waley's *Monkey* (1942), Hu Shih's 1943 introduction, and the Yu, Jenner and Lovell books are in copyright. They appear only as titles, names and short renderings in the film's own type.
- This film is free of the Round 4 and Round 7 layout rules (MOTION.md, journey-to-the-west). It ends on its own close. The shared series end card carries a blog post link, and no post exists for this film.

## Critic pass 3 (2026-10-03)

Three critics reviewed the delivery (picture, sound and story, facts). The finish lane changed the script in these places; NOTES.md has the whole pass.

- **n03, a new take.** "The oldest surviving edition, dated 1592 by most scholars, names no author." put a comma-bounded aside between subject and verb. The new take (`n03b`, Clara, same settings, with `--prev` and `--next`) says "Most scholars date the oldest surviving edition to 1592. It names no author." The hedge of item 16 stays, and the line ends on the fact the preface shows.
- **n11, a new take.** The take of "Heaven makes him" ended on the m of "him" and was heard clipped. `n11c` was requested as "Heaven makes him Bimawen," and is cut in the closure of the b, so the m decays on its own; the reader's 弼馬溫 follows 0.29 s later (65.1) and "a post in the imperial stables." 0.25 s after her (66.1).
- **On screen, silent.** Hu Shih's study is named under his name (〈西遊記考證〉, "A textual study of *Xiyou ji*," 1923, ¶3); the disciples are said to be the monk Tripitaka's ("disciples of the monk Tripitaka", ¶7); Waley's one gloss of 悟空 stands under his "Monkey" (restore item 2 above, ¶7 and item 8).
- **Cut for reading.** The chapter list under the contents (it is in NOTES.md), and the long forms of the photograph and plate credits (assets/SOURCES.md keeps them).
- **Not changed.** No other line or take; n13 ("ward off horse plague", 3.4 words a second) stays, since the typed gloss carries it. The narration still runs 100.0 s.

