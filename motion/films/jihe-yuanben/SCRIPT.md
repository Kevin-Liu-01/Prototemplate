# jihe-yuanben: the script

The film of *Jihe yuanben* 幾何原本, Beijing, 1607. The words, timings and sources are here. The pictures, motion, type, colour and sound are in `CONCEPT.md`.

## The decision

Three treatments were judged on six criteria of 10. Their contact sheets, every key frame at full size and at 1280 x 720, and all three motion tests were reviewed.

| treatment | story | facts | writing and Chinese | picture | sound | build | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| The page (`motion/concepts/jihe-yuanben/page/`) | 9 | 9 | 9 | 9 | 9 | 7 | **52** |
| The geometry (`motion/concepts/jihe-yuanben/geometry/`) | 8.5 | 8 | 6 | 8 | 6 | 8.5 | 45 |
| The words (`motion/concepts/jihe-yuanben/words/`) | 7 | 9 | 7 | 8 | 6 | 7 | 44 |

The winner is **The page**. Every picture is a real scanned page under one lamp, and all the motion comes from a reader's vermilion brush working on the print. The film keeps that idea whole. Seven changes were taken from the other two treatments or made by the judge. Each one uses the brush-and-paper grammar, so none of them adds a second visual language.

1. **Liu Hui's reassembly is shown in full, using the page's paper grammar (from The geometry).** The page's own beat only parted the coloured regions and closed them again. Now the coloured pieces of the Qing figure are cut along their printed lines and lift off as paper. Three plain paper copies join them, and the pieces close into one long rectangle, as the Qing editors' note under the figure describes (合四朱四青四黃而成大長方). The judge measured the printed figure. It is a 6-8-10 triangle with an inscribed radius of 2 grid cells, so the printed pieces tile a rectangle 4 cells by 24 with nothing left over. The picture shows a reassembly the page itself describes. It does not invent one.
2. **Each Latin letter hands off to its Stem on the reader's syllable (from The geometry's "turn").** In the page's key frame at 86.2 s, the indigo Latin letters cover 甲 乙 丙 丁 just as the reader says them. In the new version, each letter sinks into the paper on its own syllable while the brush rings the Chinese label under it.
3. **The last line explains why the word came to mean geometry (from The words).** It now reads "Only the six books of plane geometry circulated for 250 years, so the word narrowed to mean geometry." The page's version said only "six books".
4. **The two men are introduced in two short, parallel lines (from The geometry and The words).** "The scholar Xu Guangqi read no Latin." and "The Jesuit Matteo Ricci had learned mathematics from Christopher Clavius."
5. **The Chinese-mathematics hinge uses the post's own sentence (judge's fix).** "Chinese mathematics was written from problem to rule." replaces "built on a different logic". The Nine Chapters line becomes "In the Nine Chapters, each problem states a question, its answer and a procedure."
6. **The music bed has no pastiche (from The words and The geometry).** The page's sketch used guqin harmonics. The full bed is prompted with no guqin, no pentatonic figures and no gong. The page itself flagged the risk of a chinoiserie cliché.
7. **The script was re-timed to fit the cap (judge's fix).** At the narrator's measured 2.75 words a second, with numbers read out ("sixteen oh six", "two sixty-three C E", "two hundred and fifty"), the page's script ran about 103 to 105 s. Four cuts bring it under 100 s:
   - "Nothing was translated on paper." It is the first line to restore if the takes run short.
   - "So Ricci and Xu named the parts of a proof."
   - The 246-problem sentence.
   - Euclid's two lines, now merged into one.

   "Rests on" became "depends on", which is literal.

## The idea

A stranger watches two old books being read aloud and marked by hand. The story arrives the way it reached the two translators, column by column and word by word. The film opens on the title column of the 1607 book. It ends on the same four characters set in type, with one brushed stop after 本.

The signature move is the credit line 泰西利瑪竇口譯 / 吳淞徐光啓筆受. A Mandarin voice reads it while the brush circles each character as it is spoken. 口譯 and 筆受 are each ringed, and the shot holds on the two rings side by side: the mouth and the brush.

The same grammar carries every later beat:
- The Qing figure's coloured pieces lift off as paper and reassemble.
- The 界說 note lifts off its page as a slip.
- Clavius's A B C D lifts off the Latin page and settles onto 甲 乙 丙 丁.
- 幾何 is ringed on a Nine Chapters page and again on the 1607 page.

## Length and pace

- **Length:** 100.0 s at 1920 x 1080, 30 fps, in eleven beats. The picture sits in a 2.35:1 window with a citation bar above and a subtitle bar below.
- **English:** 173 written words in 17 lines, about 183 spoken words once numbers are read out. That is 66.5 s at 2.75 words a second. Two English lines already exist as takes ("Ricci translated by mouth.", 1.80 s, and "Xu received it with the brush.", 1.78 s).
- **Mandarin:** seven passages, about 15.6 s. Two are existing takes: 泰西，利瑪竇，口譯。 (2.04 s) and 吳淞，徐光啓，筆受。 (1.96 s as placed).
- **Holds:** the remaining 18 s are holds. Each one serves a subtitle reading floor ((words / 3) + 1 s), a move that lands, or the end card.

## The voices

- **Narrator (N):** the series voice in `motion/kit/audio/voice.json`.
  - Voice: Australian Baritone, eleven_multilingual_v2, stability 0.85, style 0, speed 1.0. Never slow or speed a take.
  - N reads only English and never re-reads a Chinese passage.
  - Generate each line with `el.mjs line`, passing `--prev` and `--next`, and place it by its `.json` timings.
  - Reuse `motion/concepts/jihe-yuanben/page/sound/en-mouth.mp3` and `en-brush.mp3`.
- **Mandarin reader (R):** Yun, a native Beijing Mandarin broadcast voice from the ElevenLabs library.
  - Voice: Yun, eleven_multilingual_v2.
  - R reads only what the camera is reading, as printed (啓, not 啟, in the credit column).
  - Reuse `page/sound/zh-credit-ricci.mp3` and `zh-credit-xu.mp3` only after the native check below.
  - The single words 界說 and 幾何 are spliced inside the narrator's sentences. Generate them with `--prev` and `--next` set to the English around them.
- **Native check, required before the final:**
  - The speech-to-text pass heard 吴宋 for 吳淞 and 毕手 or 毕首 for 筆受. That can be a homophone return, but it can also mean wrong tones: sòng for sōng, or bìshǒu for bǐshòu.
  - A native listener must approve every Mandarin take.
  - If a take fails, retake it on eleven_v3, or use Mr. Chen, Siqi Liu or James Gao from `page/sound/zh-voices.json`.
  - Run `el.mjs hear` on every take, Mandarin and English.

### Pronunciation

| word | say it |
| --- | --- |
| 1606 | sixteen oh six |
| 1590 | fifteen ninety |
| 263 CE | two sixty-three C E |
| 250 | two hundred and fifty |
| Xu Guangqi | shoo gwahng-chee |
| Matteo Ricci | mah-TEH-oh REE-chee |
| Clavius | KLAH-vee-us |
| Shaozhou | shaow-JOH |
| Liu Hui | lyoh HWAY |
| 言象之粗，而齟齬若是 | yán xiàng zhī cū, ér jǔyǔ ruò shì |
| 泰西，利瑪竇，口譯 | Tàixī, Lì Mǎdòu, kǒuyì |
| 吳淞，徐光啓，筆受 | Wúsōng, Xú Guāngqǐ, bǐshòu |
| 界說 | jièshuō (never shuì) |
| 凡造論，先當分別解說論中所用名目，故曰界說 | fán zào lùn, xiān dāng fēnbié jiěshuō lùn zhōng suǒ yòng míngmù, gù yuē jièshuō |
| 甲、乙、丙、丁 | jiǎ, yǐ, bǐng, dīng |
| 幾何 | jǐhé |

## The beats

Times are film seconds. "Sub" is the subtitle bar. "Cite" is the citation bar at the top, which names the scan on screen. A Mandarin line is subtitled as the printed Chinese plus an English sentence. Paragraph numbers (¶) count the prose paragraphs of BRIEF.md section 2 after its opening coordinate line. ¶1 is "A Jesuit and a Hanlin Academy scholar...", and ¶12 is "And the title. 幾何..." (BRIEF.md line 74).

| # | time | spoken (who) | on screen | BRIEF.md source of each fact |
| --- | --- | --- | --- | --- |
| 1 | 0.0 to 10.0 | N 1.0 to 6.1: "In 1606 two men in Beijing began to put Euclid into Chinese." N 6.4 to 9.7: "Chinese had no words for definition, axiom or proof." | Cite: *Jihe yuanben* 幾何原本 · early 17th-century printing · Library of Congress / National Library of China. Sub: each line as spoken. | Beijing, 1606 and Euclid: §2 opening line and ¶1, and ¶3 ("Every afternoon from the autumn of 1606"). "Began" keeps §5 item 12 (translated 1606 to 1607). No words for definition, axiom or proof: §2 ¶1. Caption: §1 image notes ("early 17th-century printing", never "1607 first edition"). |
| 2 | 10.0 to 17.4 | N 10.2 to 12.7: "The scholar Xu Guangqi read no Latin." N 13.0 to 16.6: "The Jesuit Matteo Ricci had learned mathematics from Christopher Clavius." | Cite (plate): Athanasius Kircher, *La Chine illustrée*, Amsterdam, 1670, plate facing p. 201 · Villanova University, Falvey Library. Cite (from 15.5): Christoph Clavius, *Euclidis Elementorum libri XV*, Rome: Vincenzo Accolti, 1574, title page · Boston College Library, via Internet Archive. Sub: "The scholar Xu Guangqi 徐光啟 read no Latin." / "The Jesuit Matteo Ricci 利瑪竇 had learned mathematics from Christopher Clavius." | Xu read no Latin: §2 ¶2 ("read no Latin at all"). Ricci a Jesuit who learned mathematics from Clavius: §2 ¶1 and ¶2. Clavius's edition, Rome, Accolti, 1574: §2 ¶2, §4, §5 item 1. Its caveat about later Clavius editions is not contradicted, because nothing is said about notes. The 1670 French edition, Villanova and public domain follow SOURCES-west correction 1. The names are set in type because the engraved cartouches are miscut (SOURCES-west correction 2). |
| 3 | 17.4 to 28.0 | N 17.7 to 21.3: "Ricci had tried once before in Shaozhou, around 1590." R 21.7 to 24.5: 言象之粗，而齟齬若是。 | Cite: Ricci's preface 譯幾何原本引 · *Jihe yuanben*, early 17th-century printing · Library of Congress / National Library of China. Sub (21.7 to 28.0): 言象之粗，而齟齬若是 “This is only the coarse layer of words and figures, and still it grinds like this.” | Shaozhou, around 1590: §2 ¶4, with §5 item 14 hedged ("around 1590"; no claim of five books; Qu Rukui is not named). The quotation and its English: §2 ¶4. The print matches it (SOURCES-zh correction 4, vol. 1 sp=7). The cite places the sentence in the 1607 preface, and the film never says it was written in Shaozhou. |
| 4 | 28.0 to 36.6 | R 28.40: 泰西，利瑪竇，口譯。 N 30.45: "Ricci translated by mouth." R 32.25: 吳淞，徐光啓，筆受。 N 34.22 to 36.00: "Xu received it with the brush." | Cite: the LOC line as beat 1. Sub: 泰西利瑪竇口譯 "Ricci translated by mouth." then 吳淞徐光啓筆受 "Xu received it with the brush." | The credit line and its two glosses: §2 ¶3, §5 item 2. The printed columns read 泰西利瑪竇口譯 / 吳淞徐光啓筆受 with 啓 (SOURCES-zh correction 2, vol. 1 sp=8). These are the motion test's offsets from 28.0. |
| 5 | 36.6 to 45.5 | N 36.9 to 39.8: "Chinese mathematics was written from problem to rule." N 40.1 to 45.2: "In the Nine Chapters, each problem states a question, its answer and a procedure." | Cite: 九章算術 *Nine Chapters on the Mathematical Art*, compiled by the 1st century CE · Qing edition, Siku Quanshu · Source Library / Internet Archive (CADAL), CC BY-SA 4.0. Sub: each line. | "Written from problem to rule": §2 ¶5, verbatim. The three parts 問, 術, 答: §2 ¶5, §5 item 10. The order question, answer, procedure is the page's own (SOURCES-zh correction 9). "Compiled by the 1st century CE": §2 ¶5. "Qing edition": §1 image notes. |
| 6 | 45.5 to 54.8 | N 45.8 to 53.1: "In a commentary of 263 CE, Liu Hui justified the procedures by cutting figures apart and reassembling them." | Cite: 句股容圓圖 and its note, supplied by the Qing editors (原本缺圖今補) · *Nine Chapters*, Qing edition, Siku Quanshu · Source Library / Internet Archive (CADAL), CC BY-SA 4.0. Sub: the line, on two lines. | Liu Hui's commentary, 263 CE, cutting and reassembling: §2 ¶5, §5 item 10. This is the post's own hedge that proof existed (§5 item 15), and the film never calls the tradition inductive. The figure and the rearrangement are the Qing editors': the figure is supplied (原本缺圖今補) and the note describes the rearrangement (SOURCES-zh correction 11, vol. 7 to 9 p. 132). The cite says so, and the narration does not attribute this figure to Liu Hui. |
| 7 | 54.8 to 61.0 | N 55.1 to 60.2: "Euclid names each object first, and every theorem depends on the ones before it." | Cite (to 57.2): Christoph Clavius, *Euclidis Elementorum libri XV*, Rome: Vincenzo Accolti, 1574, fol. 1r · Boston College Library, via Internet Archive. Cite (from 57.2): Christoph Clavius, *Euclidis Elementorum libri XV*, 3rd ed., Cologne, 1591, p. 20 · ETH-Bibliothek Zürich, e-rara, Public Domain Mark. Sub: the line. | Euclid names first, and each theorem rests on the ones before: §2 ¶5. DEFINITIONES and *definitio* are printed in 1574 (SOURCES-west correction 5). The 1591 margin references are keyed a to e (SOURCES-west correction 3). LOC wdl_18198 has no margin references, so it is not used (SOURCES-west correction 3). |
| 8 | 61.0 to 72.0 | N 61.3 to 62.4: "A definition became" R 62.5 to 63.2: 界說 N 63.3 to 64.8: "an account of boundaries." R 65.2 to 70.7: 凡造論，先當分別解說論中所用名目，故曰界說。 | Cite: the LOC line. Sub: "A definition became 界說, an account of boundaries." then (65.2 to 71.9) “Whenever one builds an argument, one must first explain the names it uses; hence ‘boundary accounts’.” | 界說, "an account of boundaries": §2 ¶6, §5 item 4. The note and its translation: §2 ¶6. The note is one full-size column under 界說三十六則 on vol. 1 sp=8 (SOURCES-zh correction 1). |
| 9 | 72.0 to 84.7 | N 72.3 to 77.4: "A, B and C are sounds, and a Chinese reader had no use for them." N 77.7 to 81.0: "So they labelled the points with the Heavenly Stems." R 81.4 to 83.3: 甲、乙、丙、丁。 | Cite (to 77.7): Christoph Clavius, *Euclidis Elementorum libri XV*, Rome: Vincenzo Accolti, 1574, fol. 21v · Boston College Library, via Internet Archive. Cite (from 77.7): the LOC line. Sub: each line, then (81.4 to 84.7) 甲 乙 丙 丁 "These are the first four Heavenly Stems." | The quotation and the use of the ten Stems 甲乙丙丁戊己庚辛壬癸: §2 ¶8, which lists all ten, so "first four" holds. Clavius's figure is lettered A B C D with D at the lower crossing (SOURCES-west correction 7). The 1607 figure is lettered 丙 甲 乙 丁 (SOURCES-zh correction 8, vol. 1 sp=23). Nothing is said about Earthly Branches (§5 item 17) or about when textbooks switched (§5 item 16). |
| 10 | 84.7 to 96.6 | R 85.0 to 85.7: 幾何 N 85.8 to 88.3: "was the ordinary word for how much." N 88.6 to 91.1: "Ricci and Xu used it for magnitude." N 91.4 to 99.0 (runs over the cut): "Only the six books of plane geometry circulated for 250 years, so the word narrowed to mean geometry." | Cite: Left: 九章算術, Qing edition, Siku Quanshu · Source Library / Internet Archive, CC BY-SA 4.0 · Right: *Jihe yuanben*, early 17th-century printing · Library of Congress / National Library of China. Sub: "幾何 was the ordinary word for “how much.”" / "Ricci and Xu used it for magnitude." / the last line. | 幾何 as the ordinary word for "how much" in the Nine Chapters (問…幾何), its use for magnitude, and the six books of plane geometry circulating for 250 years until the word narrowed: §2 ¶12 (BRIEF.md line 74) and §5 item 7. 問為田幾何 is on Siku vol. 1 to 3 p. 19. The 幾何府 note is on vol. 1 sp=8 (SOURCES-zh). The film never says 幾何 is a sound-borrowing of "geo-". |
| 11 | 96.6 to 100.0 | No new line. N's last line ends about 99.0. | 幾何原本 in one column with a vermilion stop after 本. Beside it: *Jihe yuanben* / Euclid's *Elements*, Books I to VI / Matteo Ricci and Xu Guangqi / Beijing, translated 1606 to 1607, printed 1607. Cite: Images: Library of Congress / National Library of China (World Digital Library); Villanova University, Falvey Library; Boston College Library via Internet Archive; ETH-Bibliothek Zürich, e-rara; Source Library / Internet Archive (CADAL), CC BY-SA 4.0. Sub: the last line until it ends. | Books I to VI and Beijing: §2 ¶12 and ¶13 ("The six books were printed in Beijing in 1607"). "Translated 1606 to 1607, printed 1607" is §5 item 12 in its hedged form. The credits follow §4 Rights, SOURCES-west and SOURCES-zh. |

The end card's title block and the citation bar are title-card text and credits, so by convention they sit outside the no-fragments rule. Every narration line and every English subtitle is a complete declarative sentence. None of them uses an em dash, a rhetorical question, an exclamation, an "X, not Y" pair or a mid-sentence comma aside.

## If the takes run long or short

Place every take by its `.json` timings and let the holds absorb the difference. Never change a take's speed.

- **If the cut runs past 100.0 s,** take back time in this order:
  1. Bring the holds down to their floors. Beat 2's tail can lose 0.2 s, beat 4's push-out 0.2 s, beat 6's hold 0.4 s and beat 7's hold 0.4 s.
  2. Cut "Chinese mathematics was written from problem to rule." (3.2 s), and open beat 5 on the Nine Chapters line.
- **Subtitle floor:** never shorten a subtitle hold below (words / 3) + 1 s.
- **If the cut runs short by 2 s or more,** restore "Nothing was translated on paper." at the end of beat 4, after "Xu received it with the brush.", over the slow push-out on the two rings. It is the post's own line (§2 ¶3).

## Audit against BRIEF.md

Every spoken line, subtitle, cite and end-card line above was checked against sections 2 to 5. Nothing contradicts them, and every contested item stays hedged:
- §5 item 12: "began" in 1606, and "translated 1606 to 1607, printed 1607".
- §5 item 14: "around 1590". The film makes no claim of five books and does not name Qu Rukui.
- §5 item 15: the Liu Hui hedge.
- §5 item 13: Li Shanlan and Wylie are not dated in the film, so the 1857 against 1859 question does not arise.

Drift found and fixed during the audit:
- The page's Liu Hui risk note asked for a "generic" parting motion so it would not imply a dissection. The final shows the reassembly that the Qing note on the same page describes, and its cite credits the Qing editors.
- Two items in The geometry were not carried over: the 15 × 16 = 240 counter beside 答曰一畝, which implies 1 畝 = 240 square paces (not in BRIEF.md), and the 齟齬 crop pinned to Shaozhou, which implies it was written there.
- The words treatment's dictionary-style gloss tags were not carried over.
- The 1591 running head "EVCLIDIS GEOMETRIÆ" is framed out of beat 7 (SOURCES-west correction 8). The film makes no *geometria* claim, so it can never seem to contradict the post.

## Open items

- A native Mandarin listener signs off every R take (see The voices).
- The Source Library scans are credited CC BY-SA 4.0, following §4's caution. The page images are probably public-domain Qing prints, but share-alike may attach to the film unless Source Library confirms otherwise.
- This film is free of the Round 7 layout rules (MOTION.md, jihe-yuanben). It ends on its own title card. The shared series end card carries a blog post link, and no post exists for this film.
