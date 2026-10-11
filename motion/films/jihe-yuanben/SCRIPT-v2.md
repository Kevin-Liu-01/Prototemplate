# jihe-yuanben: the script, version 2

This replaces the words of `SCRIPT.md` for the next build. `SCRIPT.md` stays as it is, as the record of the 100 s cut. The look, type, palette and mark grammar stay as `CONCEPT.md` sets them. The only picture changes are the ones listed under "Visual changes the build must make".

## The decision

Three rewrites were scored out of 10 on five criteria, against the diagnosis of the 100 s cut and BRIEF.md sections 2 to 5.

| script | interesting | clear | pace | facts | rules | total |
| --- | --- | --- | --- | --- | --- | --- |
| The reveal (opens on "This title begins with the Chinese word for geometry. In 1607 it meant how much.") | 7 | 7 | 8 | 9 | 9 | **40** |
| The problem (opens on "In 1606 two men in Beijing began translating Euclid's geometry. Only one of them could read Latin.") | 7 | 7 | 6 | 9 | 9 | 38 |
| The word (opens on Yun reading 幾何原本, then the "geo" claim) | 8 | 6 | 6 | 9 | 8 | 37 |

The winner is **The reveal**. It keeps every loved diagram, drops the spoken glosses of the credit line, and runs about 73 s. Its weakness is its second line. That line gives away the answer at 4 s, so the last line only repeats the first two. Four grafts and three cuts fix it.

1. **The turn, from The word.** Line 2 now states the common explanation, that the two characters copy the sound of "geo". The answer is held back until line 14, and line 14 overturns it in The word's own sentence: "Those two characters were the ordinary word for how much."
2. **The second hook, from The problem.** On the Kircher plate the narrator now says "In 1606 two men in Beijing began to translate Euclid's geometry." and "Only one of them could read Latin." The page then answers the puzzle, because the credit columns say who spoke and who wrote.
3. **Proof by cutting, from The problem.** The Liu Hui line uses The problem's verb pair "cutting figures apart and reassembling them", and it names no single person. That way the narration never credits Liu Hui with the Qing editors' figure (SOURCES-zh correction 11).
4. **The field read aloud, from the diagnosis and The problem.** The Nine Chapters line gives the field's numbers, and the next line says that the question ends with the title's first two characters. That plants the payoff 40 s before it lands.
5. **Cut: Ricci's 齟齬 beat.** It was the least necessary beat for pace. It is the first thing to restore if the takes run short (see "If the takes run long or short").
6. **Cut: The reveal's "and later editors drew this example".** It was an oddly specific add-on. The cite bar keeps the editors' credit.
7. **Fixed: The reveal's "In their book, that same word also means quantity" and "had only their six books".** They now read "Ricci and Xu used them to mean quantity." and "For 250 years Chinese readers had only six of Euclid's books, all on plane geometry."

## The story in one sentence

The Chinese word for geometry, 幾何, is often said to copy the sound of "geo", but in the 1607 Chinese Euclid it was the ordinary word for "how much": a Jesuit who could read the Latin spoke it aloud, a scholar who could not wrote it down, they had to name the things Euclid uses, they used the question word for quantity, and because only six books of plane geometry existed in Chinese for 250 years, the word for "how much" came to mean geometry.

## Length and pace

- **Length:** about 72.5 s, in eleven shots joined by hard cuts. It is 1920 x 1080 at 30 fps, as now.
- **English:** 14 lines with 163 written words, or 168 spoken once numbers are read out. At the rate of Clara's plain lines in the current cut (about 2.9 words a second), they take about 58 s.
- **Mandarin:** three passages, 18 syllables, 5.10 s. All three are existing takes.
- **Gaps and holds:** about 9 s. That covers a 0.6 s lamp rise, gaps of 0.3 s inside a shot and 0.4 s around cuts, a 0.5 s hold on the two credit rings, a 0.4 s hold on the finished strip, a 0.5 s sink of the last indigo, and the closing title's last subtitle floor, stop and hold.
- **Range:** Clara's average over the whole current cut is 2.72 words a second, which is slowed by name-heavy lines. At that rate the film runs about 76 s, and the first steps of the long-take plan bring it back under 75 s.
- **What changed from 100 s:** no fact is heard twice, nothing is read in Mandarin and then glossed aloud, no Chinese word is spliced inside an English sentence, and every shot carries a line that moves the story.

## The voices

- **Narrator (N): Frederick Surrey**, the translation series' narrator in `kit/audio/voice-series.json` (ElevenLabs library voice `j9jfwdrw7BRfcR43Qohk`, eleven_multilingual_v2, stability 0.55, style 0.2, speed 1.0), chosen by Kevin on 2026-10-05 from an audition. The blog films keep Clara (`kit/audio/voice.json`); `tools/record.mjs` reaches this voice through `EL_VOICE_FILE`, never through `--voice`.
  - Frederick Surrey reads all 14 English lines (the v2 build: NOTES.md, "Round v2 build").
  - Every line is a new take through `node tools/record.mjs`, with `--prev` and `--next` set to the new neighbouring lines. No current English take is reused, because each one was recorded against different neighbours.
  - Never slow or speed a take. Place each take by its `.json` timings.
- **Mandarin reader (R): Yun**. She reads only what the camera is reading.
  - Three existing takes are reused: `zh2` 泰西，利瑪竇，口譯。 (1.51 s as placed, heard exact), `zh3s` 吳淞，徐光啓，筆受。 (2.03 s as placed), and `zh6t` 甲、乙、丙、丁。 (1.56 s, heard exact).
  - These takes are dropped: `zh1s` (齟齬), `zh4t` (界說), `zh5t` (the 界說 note) and `zh7t` (幾何). The recogniser heard `zh4t` as 借鉴说 and `zh7t` as जी हाँ (NOTES.md).
  - A native listener still signs off `zh3s` before the final, as `SCRIPT.md` requires.

### Pronunciation (text given to the narrator)

| word | say it | respell in the voice text if the first take misreads it |
| --- | --- | --- |
| 1606 | sixteen oh six | |
| 15, 16 | fifteen, sixteen | |
| 250 | two hundred and fifty | |
| geo | JEE-oh | "jee-oh" |
| Euclid | YOO-klid | |
| Ricci | REE-chee | |
| Xu | shoo | "Shoo" (two earlier "Xu" takes were heard as "She") |

## The lines

Times are film seconds, estimated at Clara's plain-line rate. Rebuild every time from the takes. "Sub" is the subtitle bar. A Mandarin line's subtitle is the printed Chinese and then one English sentence. ¶ numbers count the prose paragraphs of BRIEF.md section 2 after its coordinate line, as in `SCRIPT.md`: ¶1 is BRIEF.md line 52 and ¶12 is line 74.

| # | who | spoken (and the subtitle) | picture | set piece | change needed | source |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | N | This title begins with the Chinese word for geometry. | 0.60 to 3.80. LOC vol. 1 sp=8: the title column 幾何原本第一卷之首 beside the collector's red seal, tilted under one lamp, rising from black. On "title" the brush draws the wavy title line beside 幾何原本. On "word for geometry" it rings 幾何. | The 1607 title column | The lamp rise shortens from 1.5 s to 0.6 s. The wavy line moves from "Euclid" to "title". **New ring on 幾何**, drawn tight to the two characters. It may cross the seal's lower-left corner and is multiplied over it. The ring stays on the paper for lines 15 and 16. | §2 ¶12 (l. 74): "Because only Books I to VI, all plane geometry, circulated for 250 years, the word narrowed until it meant geometry." §3, row 幾何: "quantity → geometry", "幾何 later became shorthand for 幾何學". The title column is SOURCES-zh crop `loc-v1-p008-credit-columns.png`. |
| 2 | N | It is often said to copy the sound of *geo*. | 4.10 to 7.50. The same column. A slow push in on the ringed 幾何. | The 1607 title column | The 8 s track down the column is replaced by a slow push in on the head of the column. The shot ends at 7.70, about 7.7 s in place of 10.1 s. | §2 ¶12 (l. 74): "幾何 jihe is often explained as a sound-borrowing of 'geo-.'" The line reports the explanation and never calls it wrong. The film answers it only with the brief's evidence (lines 8, 14 to 17). |
| 3 | N | In 1606 two men in Beijing began to translate Euclid's geometry. | 7.90 to 12.50. Hard cut to Kircher's plate (Villanova master). Both men are in the lamp, with the seal-script panel and the cross between them. Slow push in. | The Kircher plate of Ricci and Xu | The plate now opens on this line. Both men are lit. No names are set in the subtitle here, because the credit columns name them. | §2 ¶1 (l. 52): "A Jesuit and a Hanlin Academy scholar sat down in Beijing to put Euclid into a language that had no word for 'definition,' 'axiom,' or 'proof.'" ¶3 (l. 56): "Every afternoon from the autumn of 1606, Xu went to Ricci's residence near Xuanwumen." "Began" keeps §5 item 12 ("translated 1606–07, printed 1607"). |
| 4 | N | Only one of them could read Latin. | 12.80 to 15.20. On "one" the lamp narrows onto Ricci, on the left, and stays there. | The Kircher plate of Ricci and Xu | The lamp no longer starts on Xu and slides across. It finds Ricci on "one". **The hard cut to the Clavius 1574 title page is removed**, along with its CHRISTOPHORO CLAVIO underline and its wavy line. | ¶2 (l. 54): "He had learned mathematics in Rome from Christopher Clavius, and he had carried Clavius's Latin edition ... to Macau in 1582" and "The scholar was Xu Guangqi 徐光啟. He had passed the highest civil examination in 1604 and read no Latin at all." |
| 5 | R | 泰西，利瑪竇，口譯。 Sub: 泰西利瑪竇口譯 "Matteo Ricci translated by mouth." | 15.60 to 17.11. Hard cut to the two credit columns on LOC vol. 1 sp=8. The lamp comes up on 泰西, the warm read light runs down Ricci's column, circles land on 泰 西 利 瑪 竇 at the take's character times, and 口譯 is ringed from 口. | The credit columns 泰西利瑪竇口譯 / 吳淞徐光啓筆受, read aloud and ringed | The motion is as built, offset. The narrator's gloss after it (`en06`) is gone. There is no camera cross to Xu's column, because the framing already holds both columns. The read light moves to Xu's column in the 0.45 s gap. | ¶3 (l. 56): "Their method is printed at the head of the text: 利瑪竇口譯，徐光啟筆受. Ricci translated by mouth." SOURCES-zh correction 2: the print reads 泰西利瑪竇口譯 / 吳淞徐光啓筆受. ¶2: "Matteo Ricci, known in Chinese as Li Madou 利瑪竇." |
| 6 | R | 吳淞，徐光啓，筆受。 Sub: 吳淞徐光啓筆受 "Xu Guangqi wrote it down with the brush." | 17.56 to 19.59. Xu's column: circles on 吳 淞 徐 光 啓, and 筆受 ringed from 筆. Hold 0.5 s on the two rings side by side, then cut at 20.10. | The credit columns, read aloud and ringed | The narrator's gloss (`en07`) is gone. The slow push-out becomes a 0.5 s still hold. The subtitle gloss is plain English ("wrote it down", in place of "received it"). Its 3.67 s floor rolls into the top row of the bar over the next shot. | ¶3 (l. 56): "Xu received it with the brush." and "Ricci explained the Latin in spoken Chinese, and Xu turned what he understood into literary Chinese." SOURCES-zh correction 2 (printed 啓). |
| 7 | N | Chinese mathematics was written as questions, such as how large a field 15 paces by 16 is. | 20.30 to 26.30. Hard cut to the Siku Quanshu Nine Chapters, vols 1 to 3 p. 19, toned to paper, close on the column 今有田廣十五步從十六步問為田幾何答曰一畝. A reading circle lands under each of 十 五 步 on "15 paces" and under each of 十 六 步 on "by 16". | The Nine Chapters page | The run of eleven circles becomes six, timed to Clara's numbers. Nothing else is marked in this line. | §2 ¶5 (l. 60): "Chinese mathematics was written from problem to rule." and "Each has three parts: 問, the problem (a field is fifteen paces by sixteen, how large is it)". SOURCES-zh section B, p. 19: 今有田廣十五步從十六步問為田幾何答曰一畝. |
| 8 | N | That question ends with the title's first two characters. | 26.60 to 29.70. The camera travels down to 問為田幾何. On "first two characters" the brush rings 幾何. | The Nine Chapters page | The ring tightens from 問為田幾何 to 幾何 alone. The rings on 答曰一畝 and 方田術曰, and the pull back to the 術曰 column, are dropped. | ¶12 (l. 74): "the question that closes problem after problem in the Nine Chapters: 問…幾何." SOURCES-zh section B: on p. 19 the question ends 問為田幾何, before 答曰. The title column 幾何原本第一卷之首 begins with 幾何 (line 1). |
| 9 | N | A commentary written in 263 CE justified those methods by cutting figures apart and reassembling them. | 30.10 to 34.70, hold to 35.10. Hard cut to the 句股容圓圖 (Siku vols 7 to 9 p. 132) on its end framing, with the three plain paper copies already on the table. On "Chinese mathematicians" the regions and copies take 朱, 青 and 黃. On "cutting" the hairline runs along every cut. On "apart and" the two 朱 halves turn into the strip's first rectangle with one tap. During "reassembling them" the other eleven rectangles print in place. As the line ends the brush measures the strip (4, 6, 8, 10, 24). A 0.4 s still hold follows. | Liu Hui's figure, its coloured triangles and the 4 by 24 rectangle printed in place | The 3.3 s pull back is gone, because the shot opens on the end framing. Each colour takes 0.25 s in place of 0.4 s. The print-in runs 0.10 s apart in place of 0.12 s. The 1.25 s hold becomes 0.4 s. The shot runs about 5.2 s in place of 9.9 s. The cite is unchanged and still credits the figure to the Qing editors (原本缺圖今補). | ¶5 (l. 60): "Liu Hui's commentary of 263 CE justifies the procedures, including the right-triangle rule, by cutting figures apart and reassembling them. So there was proof." §5 item 15: "Chemla argues the tradition had its own generality and justification." SOURCES-zh correction 11: the figure, and the note that describes the rearrangement, are the Qing editors'. The line names no one, so it credits no one with this figure. |
| 10 | N | Euclid never asks a question, and he defines every object first. | 35.30 to 39.20. Hard cut to Clavius 1574 fol. 1r: EVCLIDIS ELEMENTVM PRIMVM, DEFINITIONES and Def. 1, PVNCTVM est, cuius pars nulla est. On "defines" the brush underlines DEFINITIONES. | Clavius's DEFINITIONES | The underline moves to "defines". **The cut to Clavius 1591 p. 20 is removed**, with its ringed margin references a to e and its vermilion lines, because no line now says that each theorem depends on earlier ones. | ¶5 (l. 60): "Euclid works by deduction: he names each object first, states what he will assume about it, and only then proves anything" and "He never asks a question." SOURCES-west correction 5: DEFINITIONES is printed on fol. 1r of the 1574 edition. |
| 11 | N | Chinese had no word for definition, so Ricci and Xu made one meaning "an account of boundaries." | 39.60 to 45.50. Hard cut to LOC vol. 1 sp=8: the heading 界說三十六則 and the one-column note under it. The page still carries the rings from lines 1, 5 and 6. On "made one" the brush rings the heading's 界說. On "meaning" the note column lifts off as a slip hinged at its foot and stands toward the camera. On "boundaries" the brush rings the slip's last 界說 (in 故曰界說). | The 界說 note lifting off its page | There is no Mandarin in this shot: the 界說 splice (`zh4t`) and the 5.1 s reading of the note (`zh5t`) are both gone. The heading ring moves to "made one". The lift moves to "meaning" and shortens from 1.5 s to 1.0 s. The camera does not travel down the slip. It takes the standing slip whole and holds. The subtitle is this line only. | ¶1 (l. 52): "a language that had no word for 'definition,' 'axiom,' or 'proof.'" ¶6 (l. 62): "So they named the parts of a proof. A definition became 界說 jieshuo, 'an account of boundaries.'" §5 item 4. SOURCES-zh correction 1 places the note. |
| 12 | N | A, B and C were only sounds, so they used a series every literate reader could recite. | 45.90 to 51.30. Hard cut to Clavius 1574 fol. 21v, the Prop. I.1 figure lettered A B C D. On "sounds" the figure's ink lifts off as one indigo sheet. Hard cut on "so" to the 1607 Prop. I.1 (LOC vol. 1 sp=23). During "a series every literate reader could recite" the sheet travels in and settles with A on 甲 and B on 乙 (1.2 s). | Clavius's A, B handing off to 甲乙丙丁 in Proposition 1 | Timing only. The peel stays on "sounds" and the cut stays on "so". | ¶8 (l. 66): "A, B, and C are sounds, and a Chinese reader had no use for them. Ricci and Xu used the ten Heavenly Stems, 甲乙丙丁戊己庚辛壬癸, a fixed ordinal series every literate reader could recite." SOURCES-west correction 7 (A B C D) and SOURCES-zh correction 8 (丙 甲 乙 丁). |
| 13 | R | 甲、乙、丙、丁。 Sub: 甲 乙 丙 丁 "These are the first four Heavenly Stems." | 51.65 to 53.21. On each Stem's first sound, 0.47 s apart, that Latin letter sinks into the paper while the brush rings the Stem. The rest of the indigo then sinks, leaving four vermilion rings. Cut at 53.71. | Clavius's A, B handing off to 甲乙丙丁 in Proposition 1 | The motion is as built, using `zh6t`. The remaining indigo sinks in 0.5 s in place of 0.8 s. | ¶8 (l. 66), which lists all ten Stems, so "first four" holds. SOURCES-zh correction 8. |
| 14 | N | Those two characters were the ordinary word for "how much." | 53.90 to 57.20. Hard cut back to the Nine Chapters p. 19, with line 8's ring on 幾何 still on the paper. On "ordinary word" the brush rings the 幾何 that ends the second problem in the next column (又有田廣十二步從十四步問為田幾何). | 幾何 ringed on both books | There is no Mandarin 幾何 splice (`zh7t`). **New ring on the second problem's 幾何**, so that two questions on one page end in the same two characters. The framing already holds both columns. | ¶12 (l. 74): "And 幾何 was the ordinary word for 'how much,' the question that closes problem after problem in the Nine Chapters". §5 item 7 (Ogawa; Engelfriet pp. 138–42; Siu). SOURCES-zh section B: p. 19 prints both 問為田幾何. |
| 15 | N | Ricci and Xu used them to mean quantity. | 57.50 to 60.20. On "Ricci and Xu" the 1607 first text page (LOC vol. 1 sp=8) slides in from the right with its soft edge shadow (1.0 s) and brings its 幾何, in 依賴十府中幾何府屬, to the same height. On "quantity" the brush rings it. | 幾何 ringed on both books | The slide moves from "magnitude" to "Ricci and Xu". The ring moves to "quantity". | ¶12 (l. 74): "The book's opening note files its subject under the 幾何府, the 'department of quantity,' one of ten categories borrowed from Aristotle" and "It was a translation of 'magnitude.'" SOURCES-zh correction 15: Ricci's own preface uses 幾何 for "how many" and "how large". |
| 16 | N | For 250 years Chinese readers had only six of Euclid's books, all on plane geometry. | 60.50 to 66.70. During the line the camera eases back and to the right across the 1607 page until its title column is in frame, carrying line 1's ring on 幾何 beside the 幾何府 ring. The Nine Chapters ring may leave the left edge. Cut at 66.90. | 幾何 ringed on both books | **New camera move** in place of a static hold. The page already carries every earlier mark, so nothing new is drawn. If the move cannot keep both 1607 rings in the window, hold the two-page frame as built. | ¶12 (l. 74): "Because only Books I to VI, all plane geometry, circulated for 250 years". ¶13 (l. 76): "Books VII to XV waited until Li Shanlan and Alexander Wylie translated them from Henry Billingsley's 1570 English Euclid, published in 1857." |
| 17 | N | So the word for "how much" came to mean geometry. | 67.10 to 70.50. Hard cut to the empty table under the lamp. 幾何原本 arrives in one column in reading order (90 ms stagger). The subtitle holds to its 4.33 s floor (71.43). As it clears, the brush adds the vermilion stop after 本 (0.3 s). Hold to about 72.5. The bed resolves on its last note. | The closing title | The closing title now carries the payoff line. **The EB Garamond block is dropped**, so only the title and the last subtitle share the frame, and the stop lands in a clear frame. The cite bar keeps the image credits, without ETH (see visual change 7). | ¶12 (l. 74): "the word narrowed until it meant geometry." §3, row 幾何: "Meant 'how much / magnitude'; narrowed to 'geometry.'" |

The cite bars and the closing title column are title-card text and credits, as in `SCRIPT.md`. Every narration line and every English subtitle above is a complete declarative sentence.

## Visual changes the build must make

1. **The title column (0.0 to 7.7).** The shot runs about 7.7 s in place of 10.1 s. The lamp rises in 0.6 s. The camera holds the head of the column and pushes in slowly, with no track down. The wavy title line falls on "title". A new ring closes round 幾何 on "word for geometry" and stays on the page for lines 15 and 16.
2. **The Kircher plate (7.7 to 15.4).** It is one shot carrying lines 3 and 4. Both men are lit for line 3, and the lamp narrows onto Ricci on "one". The cut to the Clavius 1574 title page is removed, with its underline and wavy line, and that title page's cite goes with it. The names are no longer set in type in this shot's subtitles.
3. **The credit columns (15.4 to 20.1).** The motion is as built, offset. The narrator's glosses are gone. The camera cross is dropped, because both columns are already in frame, and the read light moves to Xu's column in the 0.45 s gap. The push-out becomes a 0.5 s hold on the two rings. The subtitle glosses read "Matteo Ricci translated by mouth." and "Xu Guangqi wrote it down with the brush."
4. **Ricci's preface (齟齬) is removed** from this version, along with its five syllable circles, its double ring and its 4.8 s hold. It comes back only under the short-take plan below.
5. **The Nine Chapters page (20.1 to 29.9).** The eleven circles become six, under 十五步 and 十六步, on Clara's numbers. One tight ring goes on 幾何 on "first two characters". The answer ring, the procedure ring and the pull back to 方田術曰 are dropped.
6. **Liu Hui's figure (29.9 to 35.1).** The shot opens on the end framing with the copies on the table. The colours, hairline, demonstration, print-in and measures follow the words of line 9 (see its row), the hold is 0.4 s, and the shot is about 5.2 s long. The cite is unchanged.
7. **Clavius's DEFINITIONES (35.1 to 39.4).** The underline falls on "defines". The cut to Clavius 1591 p. 20 is removed, with its margin rings and vermilion lines. "ETH-Bibliothek Zürich, e-rara" leaves the end-card credits, because no ETH page is shown.
8. **The 界說 slip (39.4 to 45.7).** The heading ring falls on "made one". The slip lifts on "meaning" in 1.0 s. The slip's last 界說 is ringed on "boundaries". The camera holds the standing slip whole and does not travel down it.
9. **A B C D to 甲乙丙丁 (45.7 to 53.7).** The timing is retimed to line 12, with the peel on "sounds" and the cut on "so". The hand-offs stay as built on `zh6t`. The last indigo sinks in 0.5 s.
10. **幾何 on both books (53.7 to 66.9).** The Nine Chapters page returns carrying line 8's ring, and a new ring falls on the second problem's 幾何 on "ordinary word". The 1607 page slides in on "Ricci and Xu", and its 幾何府 ring falls on "quantity". During line 16 the camera eases across the 1607 page to its title column, so line 1's ring is in frame.
11. **The closing title (66.9 to 72.5).** Line 17 plays over the title column. The subtitle clears at its floor, and then the stop after 本 lands in a clear frame. The Garamond block is dropped.
12. **Every mark and cut is re-timed from the new takes** (`audio/cues.json`, `audio/events.json`), and the storyboard is regenerated with `tools/storyboard.py`.

## Sound

- Run `tools/mix.py` against the new cues. It sets the bed's offset so that its last piano note lands on the cut to the closing title, as it does now.
- The ducking, the 15 dB narrator floor and the 17 dB reader floor are unchanged.
- Brush dabs, rings, the slip lift, the peel and the slide follow the new events. The Liu Hui cut, slide and taps follow the compressed beat.
- Effects for the removed shots are dropped: the 齟齬 circles and ring, the Clavius title page settle and marks, and the 1591 margin rings and lines.

## If the takes run long or short

Place every take by its `.json` timings, and let the gaps and holds absorb the difference. Never change a take's speed, and never shorten a subtitle below (words / 3) + 1 s.

- **Past 75 s,** take time back in this order:
  1. Bring the holds to their floors: the credit rings from 0.5 s to 0.2 s, the strip from 0.4 s to 0.2 s, and the closing hold from 0.75 s to 0.4 s. That saves about 0.85 s.
  2. Line 11 says "so they made one" in place of "so Ricci and Xu made one". That saves about 0.7 s.
  3. Line 7 says "Chinese mathematics was written as questions, such as how large a field is.", and the six number circles are dropped. That saves about 1.2 s.
- **Under 68 s,** restore in this order:
  1. After line 6, hard cut to Ricci's preface (LOC vol. 1 sp=7, the column ending 言象之粗而齟齬若是). N says "Ricci wrote that even the basic words were hard to translate." The read light runs down the column, and the brush rings 齟齬 twice round on "hard". There is no Mandarin, no syllable circles and no hold. It takes about 4.2 s. Source: ¶4 (l. 58), "His verdict on the difficulty survives: 言象之粗，而齟齬若是 (this is only the coarse layer of words and figures, and still it grinds like this)", and SOURCES-zh correction 4. The line gives no place or date for the sentence.
  2. After line 11, over the standing slip, N says "The Latin word definitio also comes from finis, a boundary." It takes about 3.6 s. Source: ¶6 (l. 62), "The choice tracks the Latin: definitio comes from finis, a boundary, and Euclid's Greek horos means the same", and §5 item 4.

## Audit

### Facts, line by line, against BRIEF.md sections 2 to 5

Each row of the table quotes its source sentence. These are the judgement calls:

- **Line 2** reports the sound-borrowing explanation as the brief does ("often explained"). Nothing in the film calls it wrong. Lines 14 to 17 give only the brief's evidence: the ordinary word for "how much", the 幾何府, and the narrowing. ¶12 asserts all three.
- **Line 3** dates only the start: "In 1606 ... began". The print date is never spoken, so §5 item 12 does not arise. Neither does the image note that the LOC scan "may be the 1611 revision". The LOC cites keep "early 17th-century printing".
- **Line 4.** Ricci read Latin: he learned mathematics in Rome and carried Clavius's Latin edition (¶2). Xu "read no Latin at all" (¶2).
- **Lines 5 and 6** gloss the print as ¶3 does. "Wrote it down" renders 筆受 by ¶3's own account, "Xu turned what he understood into literary Chinese". 泰西 and 吳淞 are left untranslated, because the brief does not gloss them.
- **Line 7** is a paraphrase. "Written as questions" restates ¶5's "written from problem to rule" through its own example, 問, "how large is it". The numbers are as printed on p. 19.
- **Line 9** names no one. Liu Hui is the brief's case (¶5, 263 CE). §5 item 15 says the tradition had "its own generality and justification". The figure on screen and its rearrangement note are the Qing editors' (SOURCES-zh correction 11), and the cite says so. The film never calls the tradition inductive.
- **Line 10.** "Defines every object first" renders ¶5's "names each object first". The picture is the printed DEFINITIONES.
- **Line 12.** "Were only sounds" keeps ¶8's "A, B, and C are sounds". "A series every literate reader could recite" is ¶8 word for word.
- **Line 16.** "250 years" is ¶12's figure. The Li Shanlan and Wylie date is not spoken, so §5 item 13 (1857 or 1859) does not arise.
- **Left out on purpose:** Clavius's name, Shaozhou, Qu Rukui and the first attempt (§5 items 1 and 14), Liu Hui's name and date, the margin references, 凡三易稿, the 1611 revision, and Xujiahui. Nothing touches the unverified §5 items 16 to 22. There is no claim about when textbooks moved to A, B, C, and nothing about the Earthly Branches. Nor does the film mention the Def. 12 "vertex" gloss (SOURCES-zh correction 7), 平角, or the survival of the object words.

### The writing rules

- All 14 English lines and the three English subtitle glosses (lines 5, 6 and 13) are complete declarative sentences with a subject and a finite verb. The shortest is line 4, at seven words. There are no fragments, no one-word sentences, no questions, no exclamations and no em dashes.
- There are no metaphors or analogies. "Copy the sound of geo" is the literal sense of a sound-borrowing. "Came to mean" is the literal change of meaning. "Such as" in line 7 introduces an example and is not a comparison.
- There is no "X, not Y" and no "not X but Y". Line 10's "never asks a question" is a plain negative with no contrast pair. The contrast with line 7 comes from the order of the lines.
- There are no triads for rhythm. "A, B and C" names the actual letters (¶8).
- There are no labels or signposts. Line 8 points at the ring on the page and announces nothing.
- The frames are short ("In 1606", "For 250 years"). Every subject before its verb has five words or fewer. The longest is "the word for 'how much'" in line 17, which is the film's repeated phrase.
- No commas set off an aside in the middle of a sentence. The commas join two clauses (lines 10, 11 and 12), introduce a trailing example (line 7), introduce a trailing appositive (line 16), or separate the letters (line 12).
- Every name is introduced by what the person did, once:
  - Euclid by his geometry (line 3), and then by what his book does (line 10).
  - Matteo Ricci and Xu Guangqi by the page's own credit, "translated by mouth" and "wrote it down with the brush" (lines 5 and 6). The lamp has already shown which man could read Latin (line 4).
  - The Heavenly Stems by what they are (line 12) before the subtitle names them (line 13).
  - Clavius and the Nine Chapters appear only in the cite bar.
- Interest:
  - The hook is lines 1 and 2: the Chinese word for geometry and the common story about it.
  - A second hook lands at 13 s, when only one of the two men can read Latin, and the page answers it.
  - The plant is line 8, at about 28 s, where a Chinese question ends with the title's characters.
  - The middle turn is line 10: Euclid never asks a question.
  - The main turn is line 14: the two characters were the ordinary word for "how much".
  - The payoff is line 17, which answers line 2.
- Nothing is heard twice. No English line restates a Mandarin line, and no Chinese word is spoken inside an English sentence.

## Change after review (orchestrator, 2026-10-05)

- Line 9 now reads "A commentary written in 263 CE justified those methods by cutting figures apart and reassembling them." The judged line said "Chinese mathematicians proved their methods", which generalizes from one source: BRIEF.md says Liu Hui's commentary of 263 CE "justifies the procedures ... by cutting figures apart and reassembling them". The commentary is still not named, so the narration never credits Liu Hui with the Qing editors' figure.
