# journey-to-the-west: the script, version 2

This version replaces the words and the timing of `SCRIPT.md` for the next build. `SCRIPT.md` stays as it is, as the record of the 100 s cut. The look, the type, the palette and the moves are still those of `CONCEPT.md`. Every fact below agrees with `BRIEF.md` sections 2 to 5 and with `assets/SOURCES.md`.

## The story in one sentence

In the Chinese novel *Journey to the West* the monkey hero's surname is the word for macaque with its animal part taken off, and the novel puts more monkeys into his stable title and into the mind-monkey of its chapter titles, while Arthur Waley's English of 1942, which the scholar Hu Shih introduced to Americans as humour and satire, called him Monkey, and in 2021 that is still his English name.

## Why this version

The user found the 100 s cut slow and the script odd, and liked the diagrams. Three new scripts were scored out of 50 (interesting, clear, pace, facts, writing rules, 10 each):

| script | interesting | clear | pace | facts | rules | total |
| --- | --- | --- | --- | --- | --- | --- |
| A, the reveal | 8 | 7 | 8.5 | 9 | 8.5 | **41** |
| C, the word | 6.5 | 8 | 7.5 | 8.5 | 8 | 38.5 |
| B, the problem | 6 | 7.5 | 7 | 8 | 8.5 | 37 |

A wins. It opens on the most surprising fact, keeps Hu Shih (the film's title names him), and its last word answers its first line. What was taken into it:

- **From C:** the surname set piece runs without a cutaway (the explanation follows the hook at once, and Waley's title card comes after it); Waley's footnote is shown as "Sun" joined by a hairline to "Monkey"; the stable joke ends with a hairline from the quoted macaque to the title; a last box closes round the two "Monkey" entries.
- **From B:** Richard's plates arrive one at a time on the words that name each figure, so a stranger sees who travels with the monkey.
- **Judge's fixes:**
  - A's line 13 named "the monk and his other two disciples", who had never been introduced. The close now introduces all three by Waley's names and by what they are: the pig, the river monster and the monk.
  - A's old-and-yin line is cut. It needed the 胡 morph that broke in the treatment, it is an oddly specific line for a stranger, and the film needed its 6 s.
  - Hu Shih's words are paraphrased as "humour and satire, freed from allegorical readings", which is closer to his "Freed from all kinds of allegorical interpretations" than A's "freed from allegory".
  - "In the novel," brings the viewer back from Waley's book to the story before the stable beat.

## Length and pace

- **Length:** about 73.0 s at 1920 x 1080 (the 100 s cut is replaced). Planned at 2.65 English words a second; at the 2.61 the last takes measured, it runs about 74 s.
- **English:** 12 narrator lines, 159 written words. 161 spoken words once 1942 and 2021 are read as "nineteen forty-two" and "twenty twenty-one".
- **Mandarin:** two readings of 0.78 s each, 弼馬溫 and 避馬瘟. They are the same sound, which is the point of the beat.
- **Holds:** about 7 s in all, down from 25.6 s. Gaps between lines are 0.3 to 0.5 s. The longer pauses are 1.2 s on the contents counter, 1.4 s for the swap between the two Mandarin readings, and 1.2 s at the close.
- **Shape:** a hook (0 to 9 s), its answer (9 to 16 s), Waley's English (16 to 30 s), the stable joke (30 to 47 s), the turn (47 to 59 s), and the close that pays off the first line (59 to 73 s).

## The voices

- **Narrator (N):** Frederick Surrey `j9jfwdrw7BRfcR43Qohk` (ElevenLabs library voice, British), eleven_multilingual_v2, stability 0.55, style 0.2, speed 1.0, as `kit/audio/voice-series.json`. Kevin picked him on 2026-10-05 from an audition as the narrator of the translation series; the blog films keep Clara in `kit/audio/voice.json`. `el.mjs` reads the series file when `EL_VOICE_FILE` names it, and narrator lines are never given `--voice`. He reads only English and never says a Chinese character. Record every line with `el.mjs line` (through `sound/tools/record.mjs`), passing `--prev` and `--next` set to the English lines around it, and run `el.mjs hear` on every take.
  - Every line is a new take in his voice. Line 9 is a new take too: the 100 s cut's take `n13` has the same words, but it is Clara's.
  - Line 2 ends on "Sun". Request it as "Soon" in the text given to the voice only, the fallback `SCRIPT.md` names, so it is not heard as "son". The screen keeps "Sun".
  - Line 12 is spoken "humour". Line 13 must be heard as "Pigsy the pig" and "Sandy the river monster"; check it with `el.mjs hear`.
- **Mandarin reader (R):** Yun on eleven_v3, by the route in `sound/NOTES.md`. Line 7 uses the existing clip `r04g` (弼馬溫, bì in the fourth tone by pitch track). Line 8 plays the same clip again, because 避馬瘟 is the same sound; if the native listener wants a separate reading, record 避馬瘟 inside a Mandarin carrier sentence as `r04g` was and cut it at its own edges.
  - The reader's 猢猻, 孫 and 悟空、悟能、悟淨 are not used.
  - A native listener approves both readings before the final. Kevin decides.
- **Sound to rebuild:** re-run `sound/tools/cues.py` from the new event times (taps when type lands on print, slides when a part lifts or a plate arrives, ticks for names typed against Chinese), re-cut or regenerate the bed at the new length with its closing fade, and mix to -16 LUFS as `CONCEPT.md` says.

### Pronunciation

| word | say it |
| --- | --- |
| 1942 | nineteen forty-two |
| 2021 | twenty twenty-one |
| macaque | muh-KAK |
| Sun | soon (requested as "Soon") |
| Waley | WAY-lee |
| Hu Shih | hoo SHIR |
| Pigsy | PIG-zee |
| Tripitaka | trih-PIH-tuh-kuh |
| Lovell | LUV-ul |
| 弼馬溫 and 避馬瘟 | bìmǎwēn (never bī) |

## The lines

Times are film seconds, planned at 2.65 words a second; the build re-times every arrival to the take's word times. "Cut" is a hard cut. The credit line sits at the lower left and stays until its reading floor ((words / 3) + 1 s). Paragraph numbers (¶) count the prose paragraphs of BRIEF.md section 2 after its opening coordinate line, as in `SCRIPT.md`; "item n" is the section 5 fact-check list.

| n | speaker | spoken text | picture | set piece | change needed | source |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | N | In the Chinese novel Journey to the West, the monkey hero's surname comes from the word for macaque, with the animal part removed. | 0.40 to 9.35. 0.0 the chapter 1 title column at full tone. 0.4 a box draws round the printed 西遊記; 0.9 the type lands; 1.0 the scan lowers to a third. 1.55 "Journey to the West" is typed beside the box, finishing as the narrator says it. Cut 4.7 on "surname" to the chapter 1 naming passage at full tone and 1:1. 6.7 and 6.95 boxes draw round the printed 猢 and 猻, on "macaque"; 7.4 both types land. 8.2, on "animal", the scan falls away and 猢猻 travels to the middle at 300 px; 9.2 "macaque" is typed under it. Credits: "Chapter 1, the title column · the oldest surviving edition · National Central Library (Taiwan) scan", then "Chapter 1, the naming passage · (as before)". | Chapter 1 title column; 猢猻 taken apart (its opening) | "Journey to the West" moves from 6.1 s to the word. The Monkey card waits for line 4. The naming passage arrives here with its boxes on "macaque", so the old 3 s static lead-in goes, and 猢猻 travels on the narrator's word instead of the reader's. Credits shortened to one line, with no date. | ¶6: "The monkey's surname is made from the parts of a Chinese character." and "The Patriarch then derives a surname from 猢猻 (macaque). Without the animal radical, 猢 leaves 古月". ¶1: "the Ming novel 西遊記 *Xiyou ji*, *Journey to the West*". Hero: §3 row 西遊記, "the abridgements take their titles from the monkey". |
| 2 | N | Without the animal part, the second character leaves boy and infant, so his surname is Sun. | 9.70 to 16.03. 10.45 on "animal part" the animal radical lifts off both characters and turns to tint. 11.75 on "second character" 胡 turns to tint and is set aside, "macaque" fades, and 孫 moves to the centre. 12.5 on "leaves" 孫 opens into 子 and 系. 13.3 "boy" under 子; 13.65 "infant" under 系. 14.15 on "so" 子 and 系 close into 孫; 14.6 the set-aside parts leave. 15.65 "Sun" is typed under 孫 at 160 px on the word. | 猢猻 taken apart into 孫, boy and infant, and Sun | The built moves, in the built order, re-timed to this one line (they ran 34.95 to 43.85). 胡 stays whole, so no morph is added. The reader's 孫 is dropped and the narrator says "Sun", which ends the old splice of a Mandarin syllable onto an English sentence. | ¶6: "猻 leaves 子系, "boy" and "infant," 「正合嬰兒之本論」 (exactly the root doctrine of the Infant), so the surname is 孫." §1 row 6: "becomes the surname Sun". |
| 3 | N | In 1942 Arthur Waley's English translation left this out, and a footnote translated Sun as Monkey. | 16.35 to 22.91. The same frame. 17.5 on "Arthur Waley's" the tag ARTHUR WALEY, 1942 rises under "Sun". 21.0 on "footnote" a hairline draws right from "Sun". 22.55 on "Monkey" the word "Monkey" is typed at 160 px at the hairline's end, with the label "footnote" under it in italic. Credit: "Arthur Waley, *Monkey*, 1942, a footnote in chapter VI". Cut 23.45. | 猢猻 taken apart (its last frame, under Sun) | The TIMOTHY RICHARD, 1913 and ARTHUR WALEY, 1942 tags and their two empty rules are replaced by one tag, one hairline and one word. Only the word "Monkey" is set, in the film's type; no page of the 1942 book is shown. | ¶1: "In 1942 George Allen & Unwin in London published *Monkey*, Arthur Waley's translation". ¶7: "Richard and Waley both explain the 姓/性 pun and drop the radical analysis". §3 row 孫悟空: "W omits the surname scene and glosses Sun once, in a footnote: "Monkey" (ch. VI, n. 6)". Item 8. |
| 4 | N | Waley called the book Monkey too. | 23.55 to 25.81. Cut 23.45 back to the title column as line 1 left it: the scan at a third, 西遊記 in type in its box, "Journey to the West" beside it. 23.5 the card lines "translated by Arthur Waley" and "London, 1942" rise into place. 25.05 on "Monkey" the title "Monkey" is typed at 210 px; 25.55 a hairline runs from its last letter to the box round 西遊記. | Monkey title card on the title column | The card arrives here, after the surname, as the second time the viewer meets the word. Its lines rise at the cut, and the second line is cut from "London: George Allen & Unwin, 1942" to "London, 1942" so the card meets its reading floor before the cut on "thirty". The card is the film's own type and imitates no jacket. | ¶1: "In 1942 George Allen & Unwin in London published *Monkey*". §3 row 行者: Waley "calls him "Monkey" from ch. I on". Item 1. Image notes: "Make the title card in the film's own type." |
| 5 | N | He kept thirty of the hundred chapters. | 26.30 to 28.94. Cut 27.05 on "thirty" to the 1592 contents, eleven half pages, counter "100 of 100", caption "Arthur Waley, *Monkey*, 1942". 27.1 to 28.1 the 70 columns of the chapters Waley did not keep fall to tint in reading order while the counter runs to "30 of 100". Hold to 30.1. Credit: "The contents, read right to left · the oldest surviving edition · National Central Library (Taiwan) scan". | The 1592 contents falling to thirty of a hundred | The fall runs at a 10 ms stagger (1.0 s; it was 15 ms and 1.5 s), so the counter lands sooner and the hold after the line is 1.2 s. The fall still claims the count and not a column-for-column match. | ¶1: "The Chinese book has 100 chapters ... Waley kept 30 chapters." Item 2. Item 18 governs the fall. |
| 6 | N | In the novel, Heaven gives the monkey a post in the imperial stables. | 30.20 to 35.25. Cut 30.1 to the chapter 4 woodcut, both leaves, trimmed to the paper, pushed slowly from 1.00 to 1.03 until 35.55. Credit: "Woodcut, chapter 4 · the oldest surviving edition · National Central Library (Taiwan) scan". Cut 35.55. | Chapter 4 woodcut | The woodcut stands for a whole sentence, 5.45 s (it stood 1.5 s). The line no longer shares a sentence with the reader, which removes the choppy split of the old cut. The woodcut is the appointment at court, which is what the line describes; its printed caption is not transcribed. | ¶8: "The Jade Emperor makes Monkey 弼馬溫 in the Imperial Stables". Image notes: the woodcut "shows a court audience", caption it "Woodcut, chapter 4". |
| 7 | R | 弼馬溫 (bìmǎwēn) | 35.60 to 36.38. Cut 35.55 to the chapter 4 text at 1:1 from x 160. 35.6 a box draws round the printed 弼馬溫 on the reader's 弼; 35.95 the type lands. Credit: "Chapter 4 · the oldest surviving edition · National Central Library (Taiwan) scan". 36.4 the plate lowers to a third; 36.45 to 37.05 弼馬溫 travels to the top row (溫 first, 弼 last); 37.05 a copy drops to the bottom row; 37.35 to 37.85 the swap: 弼 and 氵 slide out to tint, 避 and 疒 slide in, 馬 and 昷 never move; 37.6 "bì", "mǎ" and "wēn" are typed between the rows. | 弼馬溫 over 避馬瘟 | The travel, the drop and the swap are compressed from about 2.5 s to 1.4 s and placed between the reader's two readings. The reader now reads a title on her own and never finishes a narrator's sentence. | §3 row 弼馬溫: "Bìmǎwēn". ¶8 (the post in the Imperial Stables). |
| 8 | R | 避馬瘟 (bìmǎwēn) | 37.90 to 38.68. Both rows stand, 弼馬溫 over 避馬瘟, with the shared reading between them, while the reader says the second. | 弼馬溫 over 避馬瘟 | New. In the old cut the pun was never heard. The viewer now hears one sound under two spellings. | ¶8: "It is usually read as a homophone of 避馬瘟 (ward off horse plague)". §3 row 弼馬溫: "heard as 避馬瘟". |
| 9 | N | The title is usually heard as ward off horse plague. | 39.00 to 42.77. 41.25 "ward off horse plague" is typed in italic under 避馬瘟 as the narrator says it. | 弼馬溫 over 避馬瘟 | The four-row card of English titles (Stud Master, Pi-ma-wên, pi-ma-wen, Protector of the Horses) and the card re-set are removed. | ¶8: "It is usually read as a homophone of 避馬瘟 (ward off horse plague)". Item 22: the earliest source for the reading is unverified, so none is named, and "usually" stays. |
| 10 | N | Chinese stables kept a macaque for that job. | 43.10 to 46.12. 43.1 the horse manual's line 「馬廄畜母猴，辟馬瘟疫」 is typed as Chinese type in the lower band, and the credit becomes "本草綱目 *Compendium of Materia Medica*, quoting a horse manual". 44.6 on "macaque" a box draws round 母猴 and "macaque" is typed under it. 45.75 on "job" a hairline runs from that box up to the 弼馬溫 row. Cut 46.8. | 弼馬溫 over 避馬瘟 (the line that makes the joke) | New element in the set piece's own grammar of type, box, gloss and hairline. It restores the 本草綱目 line the old cut removed. 母猴 is glossed "macaque". No English sentence is set on screen; the narrator says the meaning. The hairline joins the stable's macaque to the monkey's title, so the picture lands the joke. | ¶8: "the practice behind that reading is recorded: the 《本草綱目》 (*Compendium of Materia Medica*) quotes a horse manual, 「馬廄畜母猴，辟馬瘟疫」 (keep a macaque in the stable to ward off horse plague)." Item 9, with its caveat to translate 母猴 as "macaque". §3 row 弼馬溫: the two sources "record monkeys kept in stables against disease". |
| 11 | N | In the oldest surviving edition, the chapter titles call him the mind-monkey. | 46.90 to 51.57. Cut 46.8 to the contents crop round chapter 14 at the left (0.75). 49.3 on "chapter titles" a box draws round 心猿; 49.75 the type lands; 50.0 the scan falls away; 50.1 to 50.7 心猿 turns into a row where it stands, at the left of the frame (132 px). 51.2 "mind-monkey" is typed under it on the word. Credit: "The contents, chapter 14 · the oldest surviving edition · National Central Library (Taiwan) scan". Cut 51.95. | 心猿 lifted from the chapter 14 contents | The chapter 86 cut (金公, 木母), its glosses, Waley's three empty rules and Yu's column are removed. 心猿 ends at the left so it can stay on the paper through the next cut. No date is shown, so item 16's hedge does not arise. | ¶9: "The allegory is printed in the oldest surviving edition." and "The 1592 chapter titles call Sun Wukong 心猿, the mind-monkey". §3 row 心猿: "in the 1592 contents (ch. 7 定心猿, ch. 14 心猿歸正; NCL scan pp. 6–7)". Item 10. |
| 12 | N | The scholar Hu Shih introduced Waley's book to Americans as humour and satire, freed from allegorical readings. | 52.05 to 58.61. Cut 51.95 to Hu Shih's 1939 photograph at the right half of the frame (about x 1200), pushed from 1.00 to 1.03 until 59.0. 心猿 and "mind-monkey" stay on the paper at the left through the cut, untouched. 52.8 "胡適 Hu Shih" is typed beside the plate on his name. 53.55 on "introduced" the label "introduction to *Monkey*, New York, 1943" is typed under it. Credit: "Photograph: Harris & Ewing, 1939 · Library of Congress". Cut 59.0. | Hu Shih photograph, sharing the frame with 心猿 | The photograph moves from the authorship beat to here, from the left of the frame to the right, and stands 7 s (it stood 3.6 s). The 1923 study title and its English are removed. Nothing happens to 心猿 while Hu Shih speaks: it is not tinted and not struck, so the frame sets the two printed readings side by side and takes no side. His 1943 introduction is in copyright, so it is paraphrased and not quoted on screen. | ¶5: "Hu Shih also introduced the American edition (New York: John Day, 1943)" and "The American introduction makes the same argument: "Freed from all kinds of allegorical interpretations," the book offers "good humor" and "good-natured satire."" Item 3. "Scholar": ¶3, his 1923 textual study. Item 19 (contested, reported without a verdict). |
| 13 | N | Waley's Monkey travels west with Pigsy the pig, Sandy the river monster and Tripitaka the monk. | 59.10 to 65.28. Cut 59.0 to paper with Richard's 孫行者 plate, with its own printed caption, in the first place and the other three places empty. Credit: "Plates: Timothy Richard's English version, *A Mission to Heaven*, 1913, after an unnamed Chinese illustrated edition · Cornell University Library". 59.1 WALEY, 1942 rises at the left of the names row. 59.5 "Monkey" is typed under 孫行者. 61.0 on "Pigsy" the 猪八戒 plate arrives and "Pigsy" is typed under it. 62.3 on "Sandy" the 沙和尚 plate arrives and "Sandy" is typed. 64.15 on "Tripitaka" 唐三藏 lands in type in the fourth place and "Tripitaka" is typed under it. | Richard's plates and the row of Waley's names | The plates arrive one at a time on the spoken names, in the row's order, so the stranger meets the cast as each is named. Waley's row is typed on the narrator's words instead of as a block. The RICHARD, 1913 tag is removed, since Richard is not narrated; the credit names him by his book. | ¶1: "His names for the pilgrims, Monkey, Pigsy, Sandy and Tripitaka". ¶6: "In chapter 8 Guanyin names the pig 豬悟能 and the river monster 沙悟淨". ¶7: "The monk's title 三藏 Sanzang ... Waley's "Tripitaka"". §3 row 西遊記: "record of a journey to the west". Image notes and §4 Rights for the plates. |
| 14 | N | In 2021 Julia Lovell's translation kept all four names, and its hero is still Monkey. | 65.60 to 71.78. 66.75 on "Julia Lovell's" LOVELL, 2021 rises under WALEY, 1942 and her four names, Monkey, Pigsy, Sandy, Tripitaka, are typed as a block in the same face, size and places. 67.9 on "kept" one hairline box closes round both rows. 71.4 on "Monkey" a second box closes round the two "Monkey" entries. Hold to 73.0, the last frame, while the bed resolves. | The closing rows of Waley's and Lovell's names | The box round both rows lands on "kept", as before. New: the second box round the Monkey column on the last word, which answers line 1. | ¶1: "His names for the pilgrims, Monkey, Pigsy, Sandy and Tripitaka, are also the names in Julia Lovell's 藍詩玲 *Monkey King* (Penguin, 2021)." Item 13: "keeps Waley's names (Ping & Wang 2024)". §3 row 孫悟空: L "Monkey". |

On-screen text is limited to names, glosses, tags, the counter, the title card, Chinese type and credits. No sentence is set on screen. None of it uses an em dash, a signpost or a hype word.

## Visual changes the build must make

1. Re-time every frame to the lines above, about 73 s in all. Old beats 2 (the preface leaf), 3 (Hu Shih in 1923 and the gazetteer) and 5 (the 悟 column) are not in this script and come off the timeline; the Hu Shih photograph moves to the allegory beat.
2. Opening frame: "Journey to the West" types from the narrator's "novel" (about 1.55 s, was 6.1); the Monkey card and its lines wait for line 4; cut on "surname" (about 4.7 s) to the chapter 1 naming passage.
3. Naming passage: the boxes round the printed 猢 and 猻 draw on "macaque" (about 6.7 and 6.95 s, were 32.5 and 33.0), and the scan falls and 猢猻 travels to the middle on "animal" (about 8.2 s), with "macaque" typed under it.
4. Surname: keep the built moves and their order, re-timed to line 2 (lift 10.45, 胡 set aside 11.75, open 12.5, "boy" 13.3, "infant" 13.65, close 14.15, set-aside parts leave 14.6, "Sun" 15.65). Add no morph; 胡 stays whole.
5. Under "Sun": remove the TIMOTHY RICHARD, 1913 and ARTHUR WALEY, 1942 tags and their empty rules. One tag, ARTHUR WALEY, 1942, rises on "Arthur Waley's"; on "footnote" a hairline draws right from "Sun"; on "Monkey" the word is typed at 160 px at its end, with the label "footnote" under it. Credit "Arthur Waley, *Monkey*, 1942, a footnote in chapter VI".
6. Title card: cut back to the title column as line 1 left it. The card lines rise at the cut, and the second line reads "London, 1942". "Monkey" types on its word and its hairline runs to the box.
7. Contents: cut on "thirty"; run the fall at a 10 ms stagger (1.0 s) so the counter lands at about 28.1; hold to about 30.1.
8. Woodcut: it stands for the whole of line 6 (about 5.45 s) with its push.
9. Chapter 4 text: the box draws on the reader's 弼 at the cut; the travel, the drop and the swap fit the 1.4 s between the reader's two readings; "bì mǎ wēn" types between the rows as the swap lands; "ward off horse plague" types on the words of line 9. Remove the card re-set and the four-row table of English titles.
10. New in the 弼馬溫 frame: 「馬廄畜母猴，辟馬瘟疫」 typed as Chinese type in the lower band at line 10's start; a box round 母猴 with "macaque" under it on "macaque"; a hairline from that box to the 弼馬溫 row on "job"; credit "本草綱目 *Compendium of Materia Medica*, quoting a horse manual". All ten characters are already in `fonts/subset-chars.txt`.
11. 心猿: chapter 14 only. 心猿 turns into its row where it stands, at the left of the frame, and "mind-monkey" types on the word. Remove the chapter 86 cut (金公, 木母), the "Wood Mother" and "Metal Lord" glosses, Waley's three empty rules and Yu's column.
12. Hu Shih: the photograph opens its frame at the right half (about x 1200) with its push and stands about 7 s. 心猿 and "mind-monkey" stay at the left through the cut and are never tinted or struck. "胡適 Hu Shih" types on his name, and "introduction to *Monkey*, New York, 1943" types on "introduced". Remove 〈西遊記考證〉 and its English.
13. Close: at the cut only the 孫行者 plate stands. WALEY, 1942 rises on "Waley's" and "Monkey" types under 孫行者; the 猪八戒 plate arrives with "Pigsy", the 沙和尚 plate with "Sandy", and 唐三藏 lands in type in the fourth place with "Tripitaka", each on its word. Remove the RICHARD, 1913 tag, and use the credit given in line 13.
14. Last line: LOVELL, 2021 and her four names type as a block on "Julia Lovell's"; one box closes round both rows on "kept"; a second box closes round the two "Monkey" entries on the last word; hold 1.2 s.
15. Credits on the 1592 scans become one line with no date: "[the part shown] · the oldest surviving edition · National Central Library (Taiwan) scan".

## If the takes run long or short

Place every take by its `.json` word times and let the gaps and holds absorb the difference. Never change a take's speed. Never shorten a hold below its reading floor.

- **If the cut runs past 75 s,** take back time in this order:
  1. Bring the close hold from 1.2 s to 0.8 s.
  2. Cut "In the novel," from line 6 (about 1.3 s). The cut to the woodcut and the present tense still mark the return to the story.
  3. Remove the caption "Arthur Waley, *Monkey*, 1942" from the contents, so only the counter's floor holds the frame.
- **If the cut runs under 68 s,** restore in this order:
  1. "I have no temper", the monkey's answer when asked his surname (¶6, the 姓 and 性 pun, both xìng), as a narrator line before line 2, with 姓 over 性 typed in the 弼馬溫 grammar.
  2. Waley's "most of the poems" (¶1, "dropped most of the verse"), as a second clause of line 5.

## Audit against BRIEF.md

Every spoken line, every word on screen and every credit was checked against sections 2 to 5 and `assets/SOURCES.md`.

- Item 15, Wu Cheng'en's authorship: not raised. No author line and no portrait appears, and the library record's author line is never copied.
- Item 16, the 1592 date: never spoken and never shown. Lines and credits say "the oldest surviving edition" (¶2), which needs no hedge.
- Item 17, the gazetteer: not shown.
- Item 18, chapter 9: the contents fall claims the count of thirty only.
- Item 19, allegory or comedy: line 11 reports what the oldest edition's chapter titles print, line 12 what Hu Shih's American introduction printed. 心猿 is never tinted or struck, and no line says who reads the book rightly. No line says that Waley left out the allegory or followed Hu Shih; Waley's own preface reads the pilgrims allegorically (¶5), so the film makes no claim about his reading.
- Item 20, Jenner: not raised.
- Item 21, Waley's Shanghai text: not raised.
- Item 22, the 避馬瘟 reading: "usually heard as" stays and no source for the reading is named. Line 10 states only the recorded stable practice (item 9).
- Item 23, Lovell: she appears only with the four names item 13 verifies.
- Item 24, Richard's plates: "after an unnamed Chinese illustrated edition"; the Internet Archive catalogue's creator field is not used.
- Item 25, the NCL copy: always "National Central Library (Taiwan) scan", never the National Palace Museum copy.
- Copyright: Waley's 1942 book appears as the title card in the film's own type and as the one word "Monkey"; Hu Shih's 1943 introduction is paraphrased and not quoted on screen (image notes, §4 Rights). The Chinese texts quoted are public domain.
- Image notes: 母猴 is glossed "macaque"; the woodcut's caption is not transcribed; the plates keep their own printed captions and nothing is retyped from them.

## Open items

- A native Mandarin listener approves 弼馬溫 and 避馬瘟, with bì in the fourth tone in both. Kevin decides.
- The narrator's "Sun", requested as "Soon", must be heard as Sun; check it with `el.mjs hear` and by ear (the v2 build's take `v02` is heard "Sun"; NOTES.md, v2 build).
- The film's title, "Waley, Hu Shih and the English names of *Journey to the West*", still fits: Hu Shih is introduced by his tie to Waley's book in line 12.
- Not used in this script: the preface leaf ("no one knows who made this book"), the gazetteer, the 悟 column, and 金公 and 木母. Each belongs to a second storyline (the author's name, the shared character, the alchemical names) that would bring back the catalogue shape inside 75 s. Their compositions stay in the project for later use.
