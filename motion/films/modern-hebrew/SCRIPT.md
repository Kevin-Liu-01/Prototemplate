# modern-hebrew: the script

The film of the first volume of Eliezer Ben-Yehuda's dictionary, *Milon ha-lashon ha-ivrit ha-yeshana ve-ha-hadasha* מלון הלשון העברית הישנה והחדשה, Jerusalem and Berlin, 1908. The words, timings and sources are here. The pictures, motion, type, colour and sound are in `CONCEPT.md`.

## The decision

Three treatments were judged on six criteria of 10. For each one the judge read TREATMENT.md and `assets/SOURCES.md`, looked at all twelve key frames at full size and at 1280 x 720, read sheet.png, extracted every motion test at 2 fps (and single frames at full size), and measured its loudness with ebur128.

| treatment | story | facts | writing and Hebrew | picture | sound | build | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| The dictionary (`motion/concepts/modern-hebrew/dictionary/`) | 8.5 | 9.5 | 8.5 | 8.5 | 7.5 | 7.5 | **50** |
| The roots (`motion/concepts/modern-hebrew/roots/`) | 8 | 9 | 8 | 8 | 8 | 8.5 | 49.5 |
| The documents (`motion/concepts/modern-hebrew/documents/`) | 7 | 7.5 | 8 | 7.5 | 7.5 | 8.5 | 46 |

What the judge found in each:

- **The dictionary.**
  - Story: one object carries the argument. The coinage sign, cut from the key of signs, lands on the bicycle and on ice cream, meets a different sign on electricity, and finds no place at the tomato. The front matter's funder then leads out of the book to 1913. The treatment has no root-and-pattern mechanics and leaves out the 1880 column's second word, the cannon.
  - Facts: every hedge sits on screen in a numbered note. Two slips: k04 isolates "wörterbuch" on the volume's own German imprint page while the narrator speaks of *Wörterbuch*, which suggests a link the BRIEF does not make; the spoken tomato line drops "apparently" (note 13 keeps it).
  - Picture: one palette sampled from one copy of the book. Defects: in k08 the isolation box cuts the word הרבה in half; in k06 the crop marks and their number crowd a sign about 40 px wide; the Technikum photograph (500 px) is soft at 730 px.
  - Sound and build: the reading-room quartet and the withheld impression fit the idea. The test mix measured -17.2 LUFS integrated, and the bicycle take was heard back as "of name". The engine is a pure `render(t)` with flat-fielded plates, but its motion test registers the timeline after an asynchronous mount and was never checked across two renders.
- **The roots.**
  - Story: it shows the method itself, and each build ends on the page that proves it. Pines appears only in the closing quotation (the tomato and the train are in reserve), the 1913 dispute is missing, and one line carries both 1922 and 1953 over a coin.
  - Facts: careful ("can mark", no first-coinage claim, no coiner for מחשב), but the ledger's "Ben-Yehuda, 1880" under מִלּוֹן drops the hedge about the 1879 notebook.
  - Writing: "and the ending on" sounds like a preposition when spoken, and the captions lean on arrows ("wheel → bicycle"). The pointing stays exact even in motion, because moving letters are drawn from the font's shaped outlines.
  - Picture: the builds read clearly at 300 px. The mid-tone green field, sampled from a CC BY-SA poster the film never shows, caps the contrast, and the 24 px ink labels weaken at 1280 x 720.
  - Sound: letters land on the half beats of a 60 bpm bed with three pitched taps, the best sound idea of the three. The marimba risks whimsy. The test mix measured -17.3 LUFS.
- **The documents.**
  - Story: the clearest chronology, 1879 to 1953, but it tells the story of the language's status. The vocabulary appears only in captions, and eleven beats repeat one move.
  - Facts: the poster and *iton* wording is careful. However, the year odometer shows years in which nothing happened (1937 at 9.6 s of the motion test; 1917, 1926 and 1945 on other frames). The *HaZvi* front page, which prints "15e année", sits under "1884" and is filed under 1884 in the closing index (§5 item 24 leaves its date open).
  - Picture: real documents in their own colours, each shown only above the rule. In k09 the rule cuts the coin's Hebrew legend in half, and the coin's strip in the index cannot be read.
  - Build: the strongest. Two renders matched on all 330 frames.

The winner is **The dictionary**. The film never leaves the first volume of the dictionary except to lay a document on it, and the coinage sign is the only object that crosses a cut. Eleven changes were taken from the other two treatments or made by the judge. Each one works inside the book's grammar: a page of the book as the frame, set type on the book's paper, crop marks and ghosting for isolation, numbered notes for captions and hedges, and the board for documents from outside the book. None of them adds a second visual language.

1. **The method is composed in type on the book's paper (from The roots).** The pattern מַקְטֵל stands on a type card. Its stand-in letters ק ט ל sink to the ghost tone the book's pages use, and the root ק ל ע drops into the empty slots. Letters carried over from the source stay in ink, and everything the pattern adds (the מ, the endings and every point) is set in the secondary ink.
2. **The 1880 column's second word, *makle'a*, is built with *mafteakh* as its model, and its gloss reads "today, a machine gun" (from The roots).** The dictionary treatment had left it out.
3. **The calque is shown as a calque (from The roots).** "Wörter" sits under מלים and "buch" under ספר, which the right-to-left order puts in the same places. This replaces the dictionary's imprint-page "Gesamtwörterbuch" (judge's fix, see above).
4. **The bicycle card builds the word (from The roots).** The ו and its holam lift out of אוֹפָן, the ן turns into נ, and ־ַיִם docks. The card ends on אָפְנַיִם as the dictionary prints it, with the rose sign before it.
5. **Moving Hebrew is drawn from the font's shaped glyph outlines (from The roots, `roots/tools/glyphs.mjs`).** At rest, every Hebrew word is one text node with `lang="he" dir="rtl"`.
6. **Type taps on the half beats (from The roots).** Each letter that lands in a slot makes a dry tap, at one of three pitches by slot.
7. **A native Hebrew reader reads the key's coinage row (judge's choice, from both readers' plans).** The row is read aloud as it prints, and note 4 translates it. This replaces the dictionary's two narrator lines on the key ("Its key of signs marks the period of each word..." and "One small sign marks...").
8. **The three documents from outside the book share one board scene (judge's fix).** The Technikum photograph, the Jaffa poster and the Mandate page are laid down in turn, so their notes can stay up long enough to be read. The poster is captioned "dated 1913 by the collection", the wording from The documents.
9. **Determinism is proven by framemd5 across two renders (from The documents' build).**
10. **Smaller fixes by the judge.**
    - The tomato line says "apparently".
    - The separate promise beat is folded into the opening line.
    - The glida beat is cut for length and held in reserve.
    - Notes rise from 23 px to 26 px.
    - The p. 110 isolation box takes in all of הרבה.
    - The Technikum photograph is shown no wider than 600 px.
11. **The script was re-timed to the narrator's measured pace (judge's fix).** See Length and pace. The dictionary's 205 words would have run about 113 s at the pace its own take was recorded at.

Not carried over:
- From The roots: the green field and its grain, Inter as the apparatus face, the ledger and the closing table, *matspen* and *makhshev*, and the opening on phrases. Pines's 1893 rule is held in reserve (see Open items).
- From The documents: the single registration rule, the year odometer (it prints years in which nothing happened), the violet bar, the *HaZvi* page (a later issue under 1884), the coin and the 1953 law. The roster closes the story on 1913 and 1922 (MOTION.md, modern-hebrew).

## The idea

A stranger reads the first volume of Ben-Yehuda's dictionary, and the book explains itself. The frame is one of the book's own pages: a running head with the page's guide words, a body window ruled off above and below, and numbered notes at the foot. The notes carry every caption, credit, translation and hedge, in the book's own manner. The story arrives in the order the book presents itself:
- the first word of its title, which is the word he put into print in 1880;
- the method that made that word and the cannon word in the same column;
- its key of signs;
- the entries where the coinage sign stands, and where it does not.

The signature move is the sign. A native reader reads the key's row aloud: מלים שחדשתי אני ושנתקבלו כבר בספרות של זמננו, או בדבור העברי בארץ ישראל. Then the looped mark is lifted off the page in the rose of the volume's marbled boards and carried to p. 110, where it comes down onto the printed sign before the bicycle and registers.

The same grammar carries every later beat:
- On electricity the sign comes down, finds the sign for the literature after the Talmud already in its place, and withdraws. The dictionary credits Gordon.
- At the tomato, Pines's word, the place before the word stays empty. The dictionary left the word out.
- The book's own front matter names a funder, the Hilfsverein, and that thread leads out of the book to Haifa in 1913 and to the Mandate in 1922.
- The film ends with the sign settling back into the row it was lifted from.

## Length and pace

- **Length:** 100.0 s at 1920 x 1080 in ten beats. The final is delivered at 60 fps (MOTION.md), and drafts render at 30 fps.
- **Rebuilt after the critics (2026-10-03, the tables below).** Three critics of the first final refused five narrator lines that set a gloss between commas inside the sentence (N2, N3, N5, N7, N8). Those five were rewritten and recorded again, with N6 (which now says what the sign is printed before) and N14 (whose "its board" could be read as the funder's board). The 15 narrator takes now run 66.5 s of speech. The picture was retimed to the new takes, the film stays at 100.0 s, and the beats run B1 0.0 to 8.25, B2 to 19.1, B3 to 31.15, B4 to 40.15, B5 to 53.15, B6 to 66.15, B7 to 77.35, B8 to 82.05, B9 to 96.5 and B10 to 100.0. B5 and B6 each gained 1.0 s and 0.5 s for the slower hairline move, the longer N6 and the new note 8; B1, B2 and B3 gave back 0.25, 0.65 and 0.95 s of their holds, never below a floor. The music, its last chord on the cut home at 96.5, and the silence under the Mandate (6.4 s) are unchanged. The effects follow the picture: page turns at 31.15, 40.15, 59.48, 77.35 and 96.5; paper ticks at 5.5, 38.15, 44.75, 63.6, 73.35, 78.85, 87.5 and 91.3; type taps at 28.3, 28.55, 28.8 and 51.25; impressions at 41.45, 52.65 and 97.5; paper slides at 81.95, 86.5 and 90.8 (`sound/plan.json`).
- **Retimed to the recorded takes (sound lane, 2026-10-03; superseded by the rebuild above).** The beat tables below place every line by its measured take (`sound/manifest.json`), not by the fitted model. The 15 narrator takes run 66.6 s of speech (the model gave 63.1 s), and the reader's take runs 6.77 s (5.5 s planned). Each take keeps its own speed. The film stays at 100.0 s, and every reading floor below is met. What moved:
  - B1 runs 0.0 to 8.5 (was 7.5): N1 runs 7.35 s.
  - B2 runs 8.5 to 20.0 (same 11.5 s). Card 1 holds 7.0 s and card 2 holds 4.5 s, because N2 runs 1.0 s shorter than planned and the German halves keep their 1.67 s floor before the cut.
  - B3 runs 20.0 to 33.0 (was 14.0 s, now 13.0 s): the glosses still hold 2.5 s, past their 2.33 s floor.
  - B4 runs 33.0 to 42.0 (was 8.5 s, now 9.0 s). R starts at 33.5 and runs to 40.27. The crop marks close at 40.0, on ישראל, and the lift runs 40.5 to 42.0. Note 4 now holds 9.0 s, its floor.
  - B5 runs 42.0 to 54.0 (was 11.5 s, now 12.0 s): N6 runs 4.78 s.
  - B6 runs 54.0 to 66.5 (same 12.5 s). N8 runs 8.14 s, so the hard cut to p. 1806 lands on the word "electricity" (62.01) instead of after the line. The Ezekiel card holds 8.0 s, and p. 1806 holds 4.5 s.
  - B7 runs 66.5 to 77.5 (same 11.0 s).
  - B8 runs 77.5 to 82.0 (was 5.0 s, now 4.5 s): its tail is 0.44 s, above the 0.3 s floor.
  - B9 runs 82.0 to 96.5 (was 15.0 s, now 14.5 s). The silence under the Mandate runs 6.4 s, from 90.11 to 96.5, and Article 22 holds 5.0 s from its crop marks.
  - B10 is unchanged.
  - Every picture event tied to a word now sits on that word's measured time (shown in brackets in the tables). The effects follow the picture: page turns at 33.0, 42.0, 62.0, 77.5 and 96.5; paper ticks at 5.5, 40.0, 46.0, 64.5, 73.5, 79.0, 87.5 and 91.5; type taps at 29.5, 29.75, 30.0 and 51.5; impressions at 43.3, 53.0 and 97.5; paper slides at 82.0, 86.5 and 91.0. `CONCEPT.md`'s per-beat times are the earlier plan. Where they differ, these tables and `sound/plan.json` govern.
- **English:** 173 written words in 15 lines as rebuilt (157 before the rebuild), 178 spoken once the four years are read out ("nineteen oh eight", "eighteen eighty", "nineteen thirteen", "nineteen fourteen").
  - At the 2.7 words a second the brief gives for the narrator, that is 60.0 s.
  - The three takes recorded for the treatments ran slower from first word to last: the Mandate line at 2.29 words a second (15 spoken words in 6.56 s), the sling line at 2.31 (15 in 6.48 s) and the bicycle line at 2.34 (6 in 2.56 s). Every gloss puts a comma in the line, and the voice pauses at each one.
  - A model fitted to those three takes (3.0 words a second, plus 0.45 s for each comma, plus 0.9 s for each full stop inside a take, plus a 0.15 s lead) gives 63.1 s for the 15 lines. At a flat 2.3 words a second they would run 70.4 s.
  - The beat times were first set with this model. They are now retimed to the recorded takes (see Retimed to the recorded takes, above).
- **Hebrew:** one passage, the key's coinage row, 13 words, planned at about 5.5 s; the recorded take runs 6.77 s.
- **Holds:** the remaining 31 s are holds, moves and silence. They cover the open, the sign's lift, the bicycle's footnote link, the build cards, the reading floor of every translation and gloss ((words / 3) + 1 s from arrival), the silence on the board under the Mandate (6.4 s as retimed), and the close.

## The voices

- **Narrator (N):** the series voice in `motion/kit/audio/voice.json`.
  - Voice: Clara, eleven_multilingual_v2, stability 0.65, style 0.2, speed 1.0. Never slow or speed a take.
  - Generate each line with `node kit/audio/el.mjs line`, passing `--prev` and `--next`, and place it by its `.json` timings.
  - N reads only English. Hebrew words inside N's lines go to the voice in the respellings below and appear on screen in the BRIEF's romanization.
  - Do not reuse the treatment's `dictionary/sound/en-bicycle.mp3`: its text differs from line N6, and `el.mjs hear` heard its *ofnayim* as "of name".
- **Hebrew reader (R):** a native Israeli Hebrew voice. It reads one passage, the key's coinage row, as the row prints in.
  - Model: **eleven_v3.** The ElevenLabs models page lists Hebrew for Eleven v3 and does not list it among Multilingual v2's 29 languages.
  - Voice: **Tomer, Calm, Curious Narrator** (male, described as having "Jerusalem-standard intonation", documentary pace). A male reader keeps him apart from Clara. Alternates: Noa, Warm, Patient Narrator (female), and Amit, Calm, Curious Narrator (male). All three came from a read-only listing of the voice library (`/v1/shared-voices?language=he`) on 2026-10-03. They are generated library voices with Hebrew as their verified language. If the API refuses an ID, the voice has to be added to the account's voices first; Kevin approves that.
  - Tool: `el.mjs line` takes its model from voice.json and has no model flag, and `motion/kit/` is read-only. The build lane therefore writes `films/modern-hebrew/tools/he-line.mjs`. It calls the same text-to-speech endpoint with `model_id: "eleven_v3"`, reads the key from the ElevenLabs config file the way el.mjs does, and never prints it. Pass the English lines around R as previous and next text only if the model accepts them. If the with-timestamps route refuses eleven_v3, use the plain route and take the timings from `el.mjs hear`.
  - Test first: one take of the single word מִלּוֹן, then `el.mjs hear` on it (Scribe should return language `he` and the word מילון). Only then generate the row. Credits are limited: one take per line unless a take is wrong.
  - R is given the pointed text below, while the screen shows the scan's unpointed print. The pointing is the judge's and goes to the native check.
- **Recorded (sound lane, 2026-10-03; details in `sound/NOTES.md`).**
  - Tomer on eleven_v3 speaks Hebrew. The one-word test of מִלּוֹן was heard as מילון (the automatic language guess on one word was Italian, "Milan"). The row was heard back word for word as Hebrew. eleven_v3 refuses previous and next text, so R was recorded without them. Each v3 take stops on its last consonant, so the reader's clip ends on a 150 ms release.
  - Years went to the voice as words ("nineteen oh eight"), as jihe-yuanben does, so the reading cannot change.
  - Three respellings changed after `el.mjs hear`. N6 "of-NIGH-yeem" was heard as "of Najim", with a hiss inside the word; it was recorded as "of-NAH-yeem", which is heard as "of Nayeem". N10 "Yehiel Michel PEE-ness" was read as "Michael" and "Pe'enas", and two retakes broke the name apart ("Pe'er, knees", "P. Innes"); it was recorded as "Yehiel Mikhel Pínes apparently coined agvaniyá", which Scribe hears in Hebrew as יהיאל מיכל פינס. N12 "PEE-ness's" was heard as "penis's"; it was recorded as "Pínes's", heard as "Pines'" in the whole film.
- **Native check, required before the final:**
  - A native Hebrew listener approves R's take, and confirms the judge's pointing of R's text.
  - The same listener approves N's Hebrew words (*sefer milim*, *mila*, *milon*, *mafteakh*, *makle'a*, *ofan*, *ofnayim*, *khashmal*, *agvaniya*). A word that fails is regenerated once with a new respelling.
  - Every non-English take is listed in NOTES.md with "native listener must approve". Kevin decides.
  - Run `el.mjs hear` on every take, English and Hebrew.

### Pronunciation

| word | say it | text sent to the voice |
| --- | --- | --- |
| 1908 | nineteen oh eight | nineteen oh eight |
| 1880 | eighteen eighty | eighteen eighty |
| 1913, 1914 | nineteen thirteen, nineteen fourteen | nineteen thirteen, nineteen fourteen |
| Eliezer Ben-Yehuda | el-ee-EH-zer ben-yeh-HOO-dah | Eliezer Ben-Yehuda |
| sefer milim | SEH-fer mee-LEEM | sefer mee-LEEM |
| Wörterbuch | VER-ter-bookh | Wörterbuch |
| mila, milon | mee-LAH, mee-LONE | mee-LAH, mee-LONE |
| mafteakh | maf-TEH-akh | maftéakh (n05c; "maf-TEH-akh" in n05b put a hiss inside the word) |
| makle'a | mak-LEH-ah | makléa (n05c, heard with Hebrew fixed as מקלעה; "makleh-ah" in n05 was heard as מכלך, and "mak-LEH-a" in n05b as מקלש) |
| ofan, ofnayim | oh-FAHN, of-NIGH-yeem | oh-FAHN, ofnáyim (n06d, n07d; "of-NIGH-yeem" put a /dʒ/ hiss inside the word in n06 and n07b, and "of-NAH-yeem" broke it in two in n06c and n07c) |
| khashmal | khash-MAHL (kh as in Bach) | hashmál (n08b: two syllables with an h, the English approximation of ח that the film's own "Haifa" uses; "khash-MAHL" in n08 was heard as "kash-mahal") |
| elektron | eh-LEK-tron | elektron |
| Judah Leib Gordon | JOO-duh LAYB GOR-dn | Judah Leib Gordon |
| Yehiel Michel Pines | yeh-khee-EL MEE-khel PEE-ness | Yehiel Mikhel Pínes (n10d), Pínes's (n12c) |
| agvaniya | ag-vah-nee-YAH | agvaniyá (n10d) |
| Haifa | HIGH-fuh | Haifa |
| R: the key's coinage row | milím shekhidáshti aní veshenitkablú kvar basifrút shel zmanénu, o badibúr ha'ivrí be'érets yisra'él | מִלִּים שֶׁחִדַּשְׁתִּי אֲנִי וְשֶׁנִּתְקַבְּלוּ כְּבָר בַּסִּפְרוּת שֶׁל זְמַנֵּנוּ, אוֹ בַּדִּבּוּר הָעִבְרִי בְּאֶרֶץ יִשְׂרָאֵל |

## The beats

Times are film seconds. These tables are the rebuild of 2026-10-03 (see Rebuild after the critics, below): seven narrator lines were recorded again and every beat was retimed to the takes. N lines are given as the film time of the first sound to the end of speech, as `sound/manifest.json` measures them, and a word in brackets is the measured start of the word a picture event is tied to. "Head" is the running head: guide words at the margins as printed on the page, and the place in the book in the centre. "Note" is the numbered footnote band. On the board the notes sit in a column at the left instead. A "gloss" is set on a type card under its word. Paragraph numbers (¶) count the prose paragraphs of BRIEF.md section 2 after its opening coordinate line: ¶1 is "In the autumn of 1881..." (BRIEF.md line 70), ¶3 the 1880 column (line 74), ¶5 root and pattern (line 78), ¶6 the dictionary (line 80), ¶7 old words (line 82), ¶8 claimants (line 84), ¶10 the Hilfsverein and the Technikum (line 88) and ¶11 the Mandate (line 90). "Item" is a §5 fact-check item. Image notes are numbered in the order of BRIEF §1 "Image notes": 1 is the series line (line 45), 2 the title page's date (46), 3 the bicycle headword (47), 4 the coinage mark (48), 5 the 1880 column (49), 8 Ezekiel (52), 12 the Jaffa poster (56), 13 the Technikum (57) and 14 the Mandate scan (58).

The scans' own printed words (the title page, the key, the entries, the poster, Article 22) are pictures of sources. They are listed where the film isolates them.

### B1 · The title page · 0.0 to 8.25

| in to out | where | words | BRIEF source |
| --- | --- | --- | --- |
| 0.5 to 7.85 | N1 | "In 1908 Eliezer Ben-Yehuda's dictionary began to appear, promising many words that the author had created." | ¶6 (began to appear in fascicles in 1908; the title page promises "מספר רב של מלים אשר יצר המחבר", a large number of words that the author created); item 4; image notes 1 and 2 |
| 0.0 to 8.25 | scan | מִלּוֹן isolated first (1.1 times the scan's pixels, right of centre), then the title, then the promise line ומספר רב של מלים אשר יצר המחבר למושגים ישנים / וחדשים isolated at 5.5 (on "promising", 5.17) | item 4 (leaf n12) |
| 1.5 to 8.25 | head, centre | vol. 1 · title page | §4 Sources (n12) |
| 1.5 to 8.25 | note 1 | 1) Eliezer Ben-Yehuda, 1858–1922. מלון הלשון העברית הישנה והחדשה, vol. 1. Jerusalem and Berlin, 1908. Princeton Theological Seminary Library, via Internet Archive. | item 13 (dates); item 4 and image note 2 (caption "vol. 1, Jerusalem and Berlin, 1908"); §4 Rights |

### B2 · Two new words · 8.25 to 19.1

| in to out | where | words | BRIEF source |
| --- | --- | --- | --- |
| 8.75 to 14.10 | N2 | "In 1880 he rejected the phrase sefer milim as a copy of German Wörterbuch." | ¶3; item 2 |
| 14.85 to 18.32 | N3 | "From mila he made milon, the word for dictionary." | ¶3 ("From מִלָּה (word) he made מִלּוֹן"); §3 row מִלּוֹן (dictionary); item 2 |
| 8.25 to 19.1 | head, centre | Magid Mishneh · Lyck · 1 January 1880 | ¶3; item 2 |
| 8.25 to 19.1 | note 2 | 2) שתי מלות חדשות, Magid Mishneh, Lyck, 1 January 1880. The Academy of the Hebrew Language calls מלון the first word he coined; his son dated it to a notebook of 1879. | ¶3 (the hedge in full); item 18 |
| 8.25 to 14.75 | card 1 | ספר מלים (on the cut) | ¶3; item 2 |
| 9.7 | card 1 | a rule strikes ספר מלים, right to left (on "rejected", 9.67) | ¶3 |
| 10.9 to 14.75 | gloss | sefer milim, book of words (on "sefer", 10.90) | ¶3 |
| 12.98 to 14.75 | card 1 | Wörter (under מלים), buch (under ספר), joined to them by hairlines (on "German", 12.98) | ¶3 (a copy of German *Wörterbuch*) |
| 14.75 to 19.1 | card 2 | מִלָּה, gloss "mila, word" (hard cut on "From", 14.76) | ¶3; §3 row מִלּוֹן |
| 15.25 to 19.1 | card 2 | + ־וֹן, gloss "-on, the thing that holds" | ¶3 ("the thing that holds within it"); §3 ("read by Ben-Yehuda as 'the thing that holds'") |
| 15.6 to 19.1 | card 2 | the sum rule draws right to left (on "made", 15.63), then מִלּוֹן at 15.95 (on "milon", 15.86), gloss "milon, dictionary" | ¶3; §3 |

### B3 · Root and pattern · 19.1 to 31.15

| in to out | where | words | BRIEF source |
| --- | --- | --- | --- |
| 19.1 to 23.33 | N4 | "A Hebrew noun is a root of consonants set into a pattern." | ¶5 (verbatim, without "of vowels and affixes") |
| 24.2 to 29.93 | N5 | "He set the root for sling into the pattern of mafteakh and made makle'a, a cannon." | ¶3 ("from the root ק־ל־ע (to sling) he made מַקְלֵעַ (makle'a) for a cannon"); ¶5 ("מַקְטֵל, the pattern of מַפְתֵּחַ"); item 2 ("מקלע for 'cannon' on the model of מפתח and מסרק"); §3 row מַקְלֵעַ |
| 19.1 to 31.15 | head, centre | Magid Mishneh · Lyck · 1 January 1880 | item 2 |
| 19.1 to 31.15 | note 3 | 3) The column argues that a prefixed mem can mark an instrument. The word מַפְתֵּחַ follows the pattern מַקְטֵל, which the Academy calls the pattern of instruments. | ¶3 ("A prefixed mem can mark an instrument"); ¶5 ("משקל המכשירים"); item 21 (the tool sense is claimed only for מַקְטֵל) |
| 19.1 to 31.15 | card | מַקְטֵל on the rail, with the label משקל · pattern beside the rail's right end | ¶5 |
| 20.6 to 31.15 | card | the tray's three cells, with the label שורש · root (on "root", 20.61) | ¶5 |
| 23.0 | card | the stand-ins ק ט ל sink to the ghost tone (on "pattern", 22.93; no words) | the convention behind the BRIEF's own pattern names (¶5, §3); never stated as a sentence |
| 25.2 to 27.85 | card | ק ל ע in the tray, gloss "ק־ל־ע, to sling" (on "sling", 25.20); the gloss sinks before the letters drop through it | ¶3 ("from the root ק־ל־ע (to sling)") |
| 26.6 to 31.15 | card | the model מַפְתֵּחַ, gloss "mafteakh, key, from פתח, to open" (on "mafteakh", 26.61) | ¶3 ("מַפְתֵּחַ (key) from פתח (to open)") |
| 28.0 | card | ק, ל and ע drop into their slots, 0.25 s apart (on "made", 28.00), landing at 28.3, 28.55 and 28.8; מַקְלֵעַ stands at 29.8 | §3 row מַקְלֵעַ (pointed מַקְלֵעַ in the column, item 2) |
| 28.55 to 31.15 | gloss | makle'a, cannon / today, a machine gun (on "makle'a", 28.28) | ¶3 ("Today מקלע means a machine gun"); §3 (Wiktionary) |

### B4 · The key of signs · 31.15 to 40.15 (signature move, part 1)

| in to out | where | words | BRIEF source |
| --- | --- | --- | --- |
| 31.65 to 38.42 | R | מלים שחדשתי אני ושנתקבלו כבר בספרות של זמננו, או בדבור העברי בארץ ישראל (read from the pointed text under Pronunciation) | ¶6; item 4 (the key of signs, leaf n16) |
| 31.15 to 40.15 | head, centre | vol. 1 · key of signs | §4 Sources (n16) |
| 31.15 to 38.65 | label | the Bible (beside the row without a sign) | ¶6 ("marks the period of each word, from the Bible to the literature after the Talmud") |
| 31.65 to 38.65 | label | the literature after the Talmud (beside the row with ⁘) | ¶6; item 6 (the post-Talmudic sign) |
| 31.15 to 40.15 | note 4 | 4) מלים שחדשתי אני ושנתקבלו כבר בספרות של זמננו, או בדבור העברי בארץ ישראל: words that I coined and that have already been accepted in the literature of our time, or in Hebrew speech in the Land of Israel. Princeton Theological Seminary Library, via Internet Archive. | ¶6 (quoted and translated); item 4; §4 Rights |
| 38.15 | scan | rose crop marks close on the printed coinage sign (on ישראל, 37.86; no words); the lift follows, 38.65 to 40.15 | image note 4 (the sign cropped from leaf n16, never a Unicode stand-in) |

The asterisk row (Ben Sira, the Mishnah, the Talmud and the Midrash, as printed) prints in but carries no label. The BRIEF gives the key only as a range.

### B5 · The bicycle · 40.15 to 53.15 (signature move, part 2)

| in to out | where | words | BRIEF source |
| --- | --- | --- | --- |
| 40.2 to 45.23 | N6 | "The dictionary prints this sign before the word for bicycle, ofnayim." | ¶6 ("It stands before the bicycle"); item 5 (the sign before the headword printed אָפְנַיִם) |
| 47.0 to 52.18 | N7 | "The word for wheel is ofan. The ending for pairs turned it into ofnayim." | ¶5 ("The dual ending ־ַיִם, used for pairs, turned אוֹפָן (wheel) into the bicycle"); §3 row אָפְנַיִם |
| 40.15 to 53.15 | head | אופן (right), אוץ (left), vol. 1 · p. 110 (centre) | guide words as printed on leaf n131; item 5 |
| 40.15 to 46.95 | scan | the sign comes down and registers at 41.45 (on "sign", 41.48); the camera pulls back to the entry; the headword אָפְנַיִם isolated at 44.75 (on "ofnayim", 44.54); the footnote mark ¹) draws its hairline along the gap over its line, down the gutter between the columns and over to note 1 (45.05 to 46.15, the camera following), and note 1 is isolated at 46.2 | item 5; image note 3 (the headword as printed) |
| 40.15 to 46.95 | note 5 | 5) Vol. 1, p. 110: the bicycle, with the sign. Princeton Theological Seminary Library, via Internet Archive. | item 5; §4 Rights |
| 45.05 to 53.15 | note 6 | 6) Its note 1: מן, אופן, ע״מ אזנים, from ofan, on the pattern of oznayim. Today the word is pointed אוֹפַנַּיִם. | ¶5 ("names its model in a footnote, אָזְנַיִם, ears; today it is pointed אוֹפַנַּיִם"); item 5; image note 3 (today's form only in a separate caption) |
| 46.95 to 53.15 | card | the model אָזְנַיִם, gloss "oznayim, ears, the model"; אוֹפָן on the rail (hard cut on "The word", 46.89) | ¶5; §3 row אָפְנַיִם |
| 48.15 to 50.95 | gloss | ofan, wheel (on "ofan", 48.16) | ¶5 |
| 49.45 to 52.1 | card | ־ַיִם at the left end of the rail, gloss "the ending for pairs" (on "The ending", 49.49) | ¶5 |
| 50.7 | card | on "turned it into" (50.72): the ו and its holam lift, ן turns into נ, ־ַיִם docks on the tap at 51.25; אָפְנַיִם stands at 51.9 | ¶5; image note 3 (אָפְנַיִם as the dictionary prints it) |
| 51.45 to 53.15 | gloss | ofnayim, bicycle (on "ofnayim", 51.47) | ¶5; §3 |
| 52.05 | card | the rose sign comes down before אָפְנַיִם from above and to the right, clear of the word, and registers at 52.65 (no words) | ¶6; item 5 |

### B6 · Electricity · 53.15 to 66.15

| in to out | where | words | BRIEF source |
| --- | --- | --- | --- |
| 53.4 to 62.35 | N8 | "The Greek translation renders Ezekiel's khashmal as elektron. The poet Judah Leib Gordon followed it and used the word to mean electricity." | ¶7 ("the Septuagint rendered it ἤλεκτρον. The poet Judah Leib Gordon followed the Greek and used the word for electricity"); item 6 |
| 62.75 to 64.01 | N9 | "The dictionary credits Gordon." | ¶7 (his note, which the dictionary quotes); §3 row חַשְׁמַל ("credits Gordon"); item 6 |
| 53.15 to 59.48 | head, centre | Ezekiel 1:4 | ¶7; item 6 |
| 53.15 to 59.48 | card | וּמִתּוֹכָהּ כְּעֵין הַחַשְׁמַל מִתּוֹךְ הָאֵשׁ (one text node), with its translation, both on the cut | ¶7; §4 (the public-domain "Tanach with Nikkud" text); image note 8 |
| 53.15 to 59.48 | card | and from its midst, like the look of the khashmal, from the midst of the fire | ¶7 (translation as given) |
| 55.6 | card | a rule underlines הַחַשְׁמַל (on "khashmal", 55.61; no words) | ¶7 |
| 56.45 to 59.48 | card | ἤλεκτρον, above הַחַשְׁמַל (on "elektron", 56.46) | ¶7 ("the Septuagint rendered it ἤλεκτρον") |
| 53.15 to 59.48 | note 7 | 7) Ezekiel 1:4. The meaning of חשמל is uncertain; the Septuagint renders it ἤλεκτρον. Text: Tanach with Nikkud, public domain. | ¶7 ("The meaning of חשמל is uncertain"); §4 Rights |
| 59.48 to 66.15 | head | חשמל (right), חשמן (left), vol. 4 · p. 1806 (centre) | guide words as printed on leaf n408; item 6 |
| 59.48 to 61.64 | scan | hard cut on "followed" (59.40) to vol. 4, p. 1806; Gordon's note isolated, crop marks numbered 8) at 59.8 | item 6 (Gordon's poem and note, quoted in the dictionary) |
| 61.64 to 66.15 | scan | a cut inside the page on "electricity" (61.64) to the sense line ג) at 1.6, pushed in to 2.4 on its printed ⁘ (61.64 to 62.85); on "credits" (63.26) the rose sign comes down from above the frame, stops in the gap between the lines as rose crop marks numbered 9) close on the printed ⁘ (63.6), holds and withdraws (64.15 to 64.95) | item 6 (the post-Talmudic sign on the electricity sense) |
| 59.48 to 66.15 | note 8 | 8) Gordon's note: "I mean the natural force called Elektrizität, since the Greek translation of khashmal is elektron." | ¶7 (his note, quoted and translated) |
| 59.48 to 66.15 | note 9 | 9) Vol. 4, p. 1806: the sign for the literature after the Talmud. Princeton Theological Seminary Library, via Internet Archive. | item 6; §3 row חַשְׁמַל; §4 Rights |

### B7 · The tomato · 66.15 to 77.35

| in to out | where | words | BRIEF source |
| --- | --- | --- | --- |
| 66.65 to 70.92 | N10 | "Yehiel Michel Pines apparently coined agvaniya, the tomato." | ¶8 (Sivan concludes that Pines "apparently" coined it); item 8; item 18 hedge kept |
| 71.35 to 74.73 | N11 | "Ben-Yehuda found it immodest and kept it out of his dictionary." | ¶8; item 8 |
| 75.25 to 76.74 | N12 | "Pines's word is in use." | §3 row עַגְבָנִיָּה (status Identical); ¶8 |
| 66.15 to 77.35 | head, centre | Yehiel Michel Pines · Jerusalem, 5646 (1885–86) | §3 row עַגְבָנִיָּה (his translation of Anderlind, Jerusalem 5646); item 8 |
| 66.15 to 77.35 | card | עַגְבָנִיָּה | ¶8; §3 |
| 69.15 to 77.35 | gloss | agvaniya, tomato (on "agvaniya", 69.15) | ¶8 |
| 71.35 to 77.35 | card | בַּדּוּרָה, gloss "badura, from Arabic bandūra" (on "Ben-Yehuda", 71.35) | ¶8 ("used בַּדּוּרָה, from Arabic *bandūra*"); §3 row בַּדּוּרָה |
| 73.35 | card | rose crop marks close on the empty place before עַגְבָנִיָּה (on "kept", 73.24; no words) | ¶8 (kept out of his dictionary) |
| 76.2 | card | בַּדּוּרָה and its gloss sink to the ghost tone (on "in use", 76.17; no words) | §3 row בַּדּוּרָה (status Failed) |
| 66.15 to 77.35 | note 10 | 10) עַגְבָנִיָּה, from ע־ג־ב, to desire, after German Liebesapfel, love apple. Pines, 5646 (1885–86), "apparently" (Sivan 1971). | ¶8; §3 row עַגְבָנִיָּה; item 8 |

### B8 · The funders · 77.35 to 82.05

| in to out | where | words | BRIEF source |
| --- | --- | --- | --- |
| 77.85 to 81.41 | N13 | "One of the book's funders was building a technical school in Haifa." | ¶10 ("The Hilfsverein was building a technical school in Haifa, the Technikum"); items 4 and 11 |
| 77.35 to 82.05 | head, centre | vol. 1 · front matter | §4 Sources (n19) |
| 78.85 | scan | crop marks close on "Hilfsverein der Deutschen Juden;" with 11) in the margin past the right arms (on "funders", 78.58; no words) | item 4 (funders, leaf n19); image note 1 |
| 77.35 to 82.05 | note 11 | 11) Vol. 1 names the Hilfsverein der Deutschen Juden among its funders. Princeton Theological Seminary Library, via Internet Archive. | ¶10; item 4; §4 Rights |

### B9 · The board · 82.05 to 96.5

| in to out | where | words | BRIEF source |
| --- | --- | --- | --- |
| 82.45 to 86.56 | N14 | "In 1913 the school's board chose German for the sciences." | ¶10 ("the school's board resolved ... the natural sciences will be taught in the German language"); item 11 |
| 87.0 to 90.11 | N15 | "By 1914 the school was to teach in Hebrew." | ¶10; item 11 |
| 82.05 to 96.5 | note 12 | 12) The Technikum under construction, Haifa, 1913. Photograph: Albert Bär, Central Zionist Archives. The board's resolution is dated 26 October 1913. | item 15 and image note 13 (photograph, date, photographer); §4 Rights; ¶10 and item 11 (26 October 1913) |
| 86.8 to 96.5 | note 13 | 13) Neve Shalom, Jaffa, Tuesday 18 Heshvan, dated 1913 by the collection: a public meeting on Hebrew as the language of instruction in the Hebrew schools. National Library of Israel, via Wikimedia Commons. CC BY-SA 3.0, creativecommons.org/licenses/by-sa/3.0. Scaled and marked. | ¶10; item 11; item 20 and image note 12 (the year rests on the collection); §4 Rights (CC BY-SA 3.0: credit, licence link, changes noted) |
| 87.5 | scan | crop marks close on the poster's subject lines, השפה העברית־ שפת הלמוד בבתי הספר העבריים בא״י (no words) | §1 caption; image note 12 |
| 90.8 to 96.5 | note 14 | 14) Mandate for Palestine, Art. 22, London, 24 July 1922, as printed in Cmd. 1785. University of Toronto, via Internet Archive. | ¶11; item 12; image note 14 (caption it as the Command Paper) |
| 91.3 | scan | crop marks close on "English, Arabic and Hebrew shall be the official languages of Palestine." (no narration: the page says it) | ¶11 (quoted); item 12 |

The photograph is laid down at 81.95 at the source's own 500 px (pushed in from 480 px), the poster at 86.5 and the Command Paper at 90.8, below the poster's subject lines. Every credit stays on the board while its picture does.

### B10 · The sign goes home · 96.5 to 100.0

| in to out | where | words | BRIEF source |
| --- | --- | --- | --- |
| 96.5 to 100.0 | head, centre | vol. 1 · key of signs | as B4 |
| 96.5 | scan | the rose sign comes down onto the coinage row and registers at 97.5 (no words) | ¶6; item 4 |
| 96.5 to 100.0 | note band | Ben-Yehuda, Pines, and the vocabulary of Modern Hebrew | BRIEF title |
| 96.5 to 100.0 | note band | Hebrew series · מלון הלשון העברית הישנה והחדשה, vol. 1, Jerusalem and Berlin, 1908 | BRIEF series line; image note 2 |

Every picture is credited in the note that appears with it, so the close carries no credits block. The running heads, notes, glosses, labels and the closing block are captions and credits, so by convention they are outside the no-fragments rule, and credit lines are outside the reading floor. Every narration line is a complete declarative sentence. None uses an em dash, an exclamation, a rhetorical question, an "X, not Y" pair, a metaphor, a signpost or a gloss set between commas inside the sentence. Every translation on screen is either a sentence or a quotation.

## If the takes run long or short

Place every take by its `.json` timings and let the holds absorb the difference. Never change a take's speed.

With the recorded takes (see Length and pace), the holds absorbed the difference inside 100.0 s. Nothing below was cut or restored: N12 stays, R reads the whole row, and no reserve line was recorded.

- **If the cut runs past 100.0 s,** take back time in this order:
  1. Bring the holds down to their floors: B1's tail 0.4 s, B5's tail 0.2 s, B6's tail 0.5 s, B8's tail 0.3 s, and the board's silence before the Mandate (90.0 to 90.5).
  2. Cut N12, "Pines's word is in use.", and end B7 at 74.5 (2.0 s). Put the gloss "in use today" under עַגְבָנִיָּה instead, at 74.0, and sink בַּדּוּרָה at the same time.
  3. R stops at the comma after זְמַנֵּנוּ (about 1.7 s). Note 4 ends its translation at "the literature of our time" and keeps the Hebrew in full.
- **Reading floor:** never hold a translation, quotation or gloss for less than (words / 3) + 1 s from its arrival.
- **If the cut runs short by 2.5 s or more,** restore these in order:
  1. "Some new words were old ones." (¶7, "Other modern words are old ones with new senses"). It goes at 53.5, at the head of B6, and N8 moves to 56.0.
  2. R reads the title at the open, מִלּוֹן הַלָּשׁוֹן הָעִבְרִית הַיְשָׁנָה וְהַחֲדָשָׁה (about 3 s), with N1 after it.
  3. Glida (5 s, vol. 2, p. 779): "In the second volume it stands before glida, ice cream." (¶6; item 5).

## Audit against BRIEF.md

Every spoken line, label, gloss, note, running head and closing line above was checked against sections 2 to 5. Nothing contradicts them, and every contested item stays hedged:
- Item 18, מלון as his first coinage: N3 says only that he made *milon* in the 1880 column (item 2). Note 2 carries the Academy's claim and the son's 1879 notebook together.
- Item 18, the tomato: "apparently", in N10 and in note 10.
- Item 18, the sign in posthumous volumes: only vol. 1 (p. 110) and vol. 4 (p. 1806, a lifetime printing, item 6) are shown.
- Item 20, the poster's year: "dated 1913 by the collection".
- Item 11, the board's quotation: the narration paraphrases it. The Academy's Hebrew rendering (of a German original not seen) is not quoted on screen.
- Item 17, Ben-Yehuda's individual role and the word "revival": the film never uses "revival" and never says he made the language alone. N1 gives his dictionary's own claim ("the author had created"), and B6 and B7 give words made by Gordon and by Pines.
- Item 16 ("first Hebrew child", "first native speaker") is not used.
- Items 21 to 25 (unverified) are off screen and out of the narration. That means no coiner for מחשב, no first-use dates for any word, no life dates for Gordon or Devora, no Technikum reversal date, no counts of coinages, and none of the lines cut for lack of a source.
- The rebuild's new words (2026-10-03): N2 "rejected the phrase sefer milim as a copy of German Wörterbuch" (¶3); N3 "milon, the word for dictionary" (¶3, §3 row מִלּוֹן); N5 "set the root for sling into the pattern of mafteakh" (¶3, ¶5 "מַקְטֵל, the pattern of מַפְתֵּחַ", item 2); N6 "prints this sign before the word for bicycle" (item 5); N7 "The word for wheel is ofan" (¶5, §3); N8 "The Greek translation renders Ezekiel's khashmal as elektron" and Gordon "followed it and used the word to mean electricity" (¶7, item 6); N14 "the school's board" (¶10); note 8, Gordon's note in the BRIEF's own translation (¶7), which puts his name on screen without his unverified life dates (item 23).

Drift found and fixed during the audit:
- The dictionary's k04 isolated "wörterbuch" in the volume's own imprint while the narrator spoke of the 1880 column. It is replaced by the calque card.
- The dictionary's tomato narration dropped "apparently". It is restored.
- The roots' ledger dated מִלּוֹן "Ben-Yehuda, 1880" without the 1879 hedge. The ledger is not used, and note 2 carries the hedge.
- The documents' odometer and its *HaZvi* page are not used.
- The milon caption "a book that holds within it the words of the language" appears only in §1's caption column, so it is not used. The gloss "the thing that holds" comes from ¶3 and §3.

## Open items

- **The 1880 column.** The National Library of Israel scan of *Magid Mishneh*, 1 January 1880, must be pulled by hand: the site sits behind a human check, which must not be bypassed. With the scan, B2's card 1 becomes the column with ספר מלים isolated, and B3 ends on a cut to the column's own pointed מַקְלֵעַ (item 2). The Academy's JPEG of the column is never used (§4 Rights).
- **Native checks.** R's take and the judge's pointing of its text, N's Hebrew words (with the rebuild's respellings: *maftéakh*, *makléa*, *ofnáyim*, *hashmál*), and a reading of the set type. In Frank Ruhl Libre the פ has a heavy tongue in its counter; a native reader should confirm that it does not read as a dagesh in ספר, מַפְתֵּחַ and אָפְנַיִם.
- **Share-alike.** The Jaffa poster is CC BY-SA 3.0 from the NLI collection. Note 13 now gives the credit, the licence and its address, and the changes (scaled and marked). Whether share-alike attaches to the film is Kevin's decision (NOTES.md, Open items); BRIEF §4 Rights says to share alike unless the NLI item page says otherwise (item 24).
- **The Technikum photograph** is 500 x 500 px. The Library of Congress view of the finished building is sharper, but it dates from between 1925 and 1933, so it cannot stand for 1913.
- **Pines's rule** of 1893, "הגדולה שבמעלות למלה חדשה אם איננה חדשה" (the highest rank for a new word is if it is not new; ¶7, item 9), is a reserve note for B6 if the film gains time.
- This film is free of the Round 4 and Round 7 layout rules (MOTION.md, modern-hebrew). It ends on its own close and does not use `kit/endcard/`.
