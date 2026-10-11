# modern-hebrew: the concept

The film is set on the pages of one book: the first volume of Ben-Yehuda's dictionary, Jerusalem and Berlin, 1908, in the Princeton Theological Seminary copy on the Internet Archive. A copy stand looks straight down at it.

Every frame is one of three things:
- a page of that book;
- a type card set on the book's own paper;
- a document from outside the book, laid on the dark board the book rests on.

The frame is built like one of the book's pages: a running head with the page's guide words, a body window ruled off above and below, and numbered notes at the foot. Notes carry every caption, credit, translation and hedge. A passage is isolated the way a proofreader would mark it: the rest of the page sinks to a ghost, and printer's crop marks close round the passage.

One object moves across cuts: the coinage sign, the small looped mark the key of signs gives to "words that I coined and that have already been accepted". It is lifted off the key in the rose of the volume's marbled boards and carried from entry to entry. Where the dictionary marks a word as Ben-Yehuda's, the sign lands and registers on the printed sign. Where the dictionary credits someone else, it stops short and withdraws. Where the word was kept out of the book, its place stays empty.

The winner is The dictionary (`motion/concepts/modern-hebrew/dictionary/`). Its key frames are `stills/k01-first-word.png` to `k12-home.png`, and its signature move is `motion-test.mp4`, built from `motion-test/index.html` and `lib/dict.js`. The method beats graft The roots' build (`motion/concepts/modern-hebrew/roots/lib/mh.js`, `tools/glyphs.mjs`) onto the book's type cards. The words, times and sources are in `SCRIPT.md`, which also lists the eleven changes made to the treatment. This file gives the look, the type, the palette, the sound, and the picture and motion of each beat.

## The look

- **The frame (a page).**
  - Top band 0 to 132 px: the running head. The page's guide words sit at the outer margins, set in Hebrew as printed on the scan. The place in the book sits in the centre ("vol. 1 · p. 110"). On a type card the centre names the card's source ("Magid Mishneh · Lyck · 1 January 1880").
  - A 1 px rule in ink at 55 percent runs at y 131 and another at y 908, both from x 120 to 1800.
  - The body window runs from 132 to 908. Scans, isolation marks and the sign are clipped at the two rules, as a printed page clips its text block.
  - The notes band runs from 908 to 1080. Notes start at y 934 and x 120, set 1680 px wide.
- **The board.** For a document from outside the book, the bands go away and the document lies on the board `#131112`. The notes then sit in a 470 px column at the left (x 120, bottom 120) in paper colour.
- **The camera.** A copy stand: pages are always flat and square to the frame.
  - The camera only pans in straight lines and changes scale. Scale moves on a log scale and the centre follows the point that stays put, so a pull-back reads as one straight move.
  - No tilt, no lamp, no letterbox and no depth of field. The light is flat, as an archive photographs a page. That keeps it apart from jihe-yuanben's tilted page under a lamp.
- **The scans.** Every dictionary leaf is flat-fielded onto the sampled paper (`dictionary/tools/plates.py`), so the film's paper and the book's paper are one surface. Stamps, foxing and show-through stay as scanned. The Mandate page, the poster and the Technikum photograph are documents from outside the book: they keep their own paper and are never flat-fielded.
- **Isolation.** The rest of the page sinks to its ghost: the same plate with its ink lowered to about a tenth of its contrast, keeping the paper fibres, so the paper never changes tone at the edge of a hole. Crop marks close round the passage (expo.out, 0.8 s, from 64 px out to 8 px). A crop mark carries the number of the note that explains it, in 21 px figures. Fix from the judge's review: an isolation box must contain whole words. On p. 110 the box `p110.used[0]` in `dictionary/lib/data.js` cuts הרבה in half and has to be re-measured.
- **Type cards.** A type card is set type on the book's paper, under the same running head, rules and notes.
  - Rows print in one by one (out3, 0.5 s, rising 14 px).
  - A sum rule draws right to left, as the Hebrew reads.
  - A strike rule (2 px, ink) draws right to left once.
- **The composing move (from The roots).** On a type card, a word can be built from its parts.
  - A pattern stands on a rail. Its stand-in letters sink to the ghost tone (the plates' ghost ink is `#c5b9a5` on the paper) and stay as faint slots.
  - The root's letters wait in a row of three square cells above the rail, in reading order. Each drops into its slot (0.7 s, expo.out, growing from tray size to rail size), right to left, 0.25 s apart.
  - The pattern's points slide from the template's places to the word's (power2.inOut). A point that changes falls 30 px and fades; a new point rises 30 px into place.
  - An ending waits at the left end of the rail and docks (0.6 s, expo.out). A letter that changes form when it stops being final cross-fades while it moves (ן to נ).
  - Colour rule: letters carried over from the source word are ink, and everything the pattern or ending adds (the prefixed מ, the ending, every point) is the secondary ink.
- **Cuts.** A page or card changes only by a hard cut, landing on a word or in a silence. Documents arrive on the board by being laid down: they slide in from the right a little lifted (scale 1.02, 0.8 s, power3.out) and settle. That move has no shadow; a document casts none on the board.
- **The sign.** It is cut from the scan of the key (`dictionary/assets/derived/sign-key.png`, an alpha mask of the printed impression with its irregularities kept) and printed in rose. It never stands in for a Unicode character. It is the only object that crosses a cut, and the only rose thing in the film.
- **Determinism.**
  - Every frame is `render(t)`, a pure function of film time (`dictionary/lib/dict.js`). No clock, no random number, no network.
  - Build the GSAP timeline synchronously and register it on `window.__timelines` at once. The treatment's motion test registered it only after an asynchronous mount, so the film keeps every plate as a hidden `<img>` in the DOM and lets the renderer wait for them.
  - Render twice with `--workers 3` and compare framemd5 on every frame (The documents matched 330 of 330 this way). If DOM-transformed plates differ between workers, paint them into canvases in the timeline's `onUpdate`, as jihe-yuanben does.

## The type

- **Hebrew: Frank Ruhl Libre** (OFL), self-hosted as `MH Hebrew`.
  - It revives the Frank-Rühl type of the dictionary's own decade, so set type sits beside the scans without imitating them. The film makes no claim about which face the book was set in.
  - Its niqqud placement was checked in Chrome at 210 px by the dictionary lane, and with fontkit's shaped outlines by the roots lane.
  - Every Hebrew line at rest is one text node with `lang="he" dir="rtl"`. Inside an English note, each Hebrew run is one `<bdi lang="he" dir="rtl">`. A Hebrew phrase never breaks across lines.
  - A word in motion is drawn from its shaped glyph outlines (`roots/tools/glyphs.mjs`, fontkit with GPOS mark and mkmk positioning), so a letter and its points can move separately. When it rests, the text node replaces the outlines, and the two coincide (the roots lane's overlay test).
- **Latin: Source Serif 4** (OFL), `MH Latin`. Roman for notes and running heads, italic for glosses. Its optical sizes keep 26 px notes legible at 1280 x 720.
- **Greek: Noto Serif**, Greek subset only (`MH Greek`), for the one word ἤλεκτρον.
- **Fonts file:** `motion/films/modern-hebrew/fonts/fonts.css`, with the private family names above and the OFL licences beside the files (copy them from `motion/concepts/modern-hebrew/dictionary/fonts/`). Never name a Google Fonts family in the composition. Figures are lining and tabular.

| element | face | weight | size | colour |
| --- | --- | --- | --- | --- |
| Running head, centre | MH Latin | 400 | 22 px | ink 2 `#615546` |
| Running head, guide words | MH Hebrew | 500 | 31 px | ink `#332617` |
| Notes | MH Latin; Hebrew runs in MH Hebrew 500 at 1.13 em | 400 | 26 px (raised from the treatment's 23), line height 1.42 | ink; note numbers ink 2 |
| Notes on the board | as notes | 400 | 26 px | paper `#dbcfba` |
| Crop-mark numbers | MH Latin | 400 | 21 px | ink (rose when they mark the sign or its place) |
| Card Hebrew, the word being built | MH Hebrew | 500 | 200 to 220 px | ink for carried letters, ink 2 for added ones |
| Tray letters, model words (מַפְתֵּחַ, אָזְנַיִם) | MH Hebrew | 500 | 110 px | ink (tray), ink 2 (model) |
| Card labels (משקל · pattern, שורש · root) | MH Hebrew 500 31 px with MH Latin 400 24 px | | | ink 2 |
| Glosses | MH Latin italic | 400 | 34 px | ink 2 |
| German on the calque card (Wörter, buch) | MH Latin | 400 | 96 px | ink 2 |
| Ezekiel's clause | MH Hebrew | 500 | 104 px | ink |
| ἤλεκτρον | MH Greek | 400 | 64 px | ink |
| Close, title | MH Latin | 500 | 40 px | ink |
| Close, series line | MH Latin, Hebrew run in MH Hebrew | 400 | 22 px | ink 2 |

At 1280 x 720 the notes set at about 17 px and the glosses at about 23 px. Nothing on screen is under 18 px at 1920.

## The palette

Every colour is sampled from the Princeton copy of vol. 1, or mixed from two sampled colours. The film adds no colour from outside the book.

| token | value | source | use |
| --- | --- | --- | --- |
| paper | `#dbcfba` | vol. 1, p. 110 (leaf n131), median of the brightest 40 % of the scan | the ground of every page and card; every dictionary plate is flat-fielded onto it |
| ink | `#332617` | vol. 1 title page (leaf n12), median of the darkest 2 % | set type, rules, crop marks, carried letters; 9.5:1 on paper |
| ink 2 | `#615546` | ink mixed toward paper, the darkest mix that passes 4.5:1 | running-head centre, glosses, labels, note numbers, everything a pattern adds; 4.7:1 on paper |
| ghost | `#c5b9a5` | the plates' own ghost ink, measured on `v1-n12-ghost.jpg` | the rest of an isolated page; the stand-in letters of a pattern once they leave; a failed word |
| board | `#131112` | the marbled board of the Princeton copy (leaf n0), median of its dark field | the table under the documents from outside the book |
| rose, the one accent | `#823c4b` | the rose veins of the same marbling, 90th percentile of its red pixels | the coinage sign, and crop marks that frame the sign or its empty place; 5.1:1 on paper |

The Jaffa poster keeps its own grey-green paper, the Command Paper its cream, and the Technikum photograph its grey. They are documents from outside the book and are never reprinted on the book's paper.

## The sound

- **Voices.** The narrator is the series voice in `motion/kit/audio/voice.json` (Clara, eleven_multilingual_v2, stability 0.65, style 0.2, speed 1.0). The Hebrew reader is Tomer on eleven_v3, with Noa and Amit as alternates.
  - The reader says one passage, the key's coinage row, as it prints in.
  - The narrator never re-reads it. Note 4 translates it.
  - Every take, and the native check, follow `SCRIPT.md`, The voices.
- **Music.** One bed from the Music API (`el.mjs music --seconds 100`), instrumental, at most two beds for the film. The treatment's 10 s sketch (`dictionary/sound/music-sketch.mp3`) has the right instruments. The prompt:

  > Instrumental chamber piece for string quartet and felt piano, exactly 100 seconds, 60 bpm, in E-flat major: the sound of a quiet reading room. Long, quiet sustained string chords change every two bars. The felt piano plays one soft single note on most beats, and a muted cello pizzicato marks each downbeat. Plain diatonic harmony, exact and unhurried, low under a narrator. The second violin enters at 19 seconds. The viola leaves at 81 seconds. From 90 seconds the quartet thins and holds long chords. From 97 seconds only piano and cello remain, and the piece ends on a held low E-flat with the last piano note left to ring. No percussion, no vocals, no build, no risers, no drops. No klezmer, no oud, no Middle Eastern or Phrygian scales and no ornaments in those styles.

  At 60 bpm one beat is one second, so the film's 0.5 s grid is the half beat. The prompt's times follow the film: the composing card at 19.0, the board at 81.5, the silence under the Mandate from 90.0 and the close at 96.5.
- **Effects.** All effects come from one generated set of short cues (the sound generation endpoint) and play at fixed timeline times.
  - A single heavy page turn on each hard cut to another page of the book: 33.0 (the key), 41.5 (p. 110), 60.0 (p. 1806), 76.5 (the front matter) and 96.5 (the key). Cuts to type cards have no page turn.
  - A dry paper tick when crop marks close, quiet (about -32 LUFS) and not on every mark: 5.5, 39.5, 45.5, 62.5, 72.5, 78.5, 87.0 and 91.0.
  - A dry type tap for each letter that lands in a slot, at one of three fixed pitches by slot, so every root sounds the same three-step figure (from The roots): 29.0, 29.25 and 29.5 in B3, a quarter beat apart from the half beat at 29.0, and the ending docking at 50.5 in B5.
  - A soft impression of type into paper each time the sign registers: 42.8 (p. 110), 52.0 (the bicycle card) and 97.5 (home). The withheld landing at 62.5 and the empty place at 72.5 get no impression.
  - A paper slide and settle for each document laid on the board: 81.5 (the Technikum photograph), 86.0 (the poster, the heaviest paper) and 90.5 (the Command Paper, the lightest).
- **Mix.** Load the `hyperframes-audio` skill.
  - Voices at -16 LUFS integrated for the film.
  - The bed at about -20 LUFS alone and about -27 LUFS under speech, ducked about 8 dB under each N and R line with 0.3 s ramps.
  - Effects 12 dB under the voice. True peak below -1 dBTP. Fades of 0.3 to 0.8 s, and nothing starts or stops on a click.
  - The bed enters with the film and resolves with a 0.8 s fade from 99.2 s. The 6.5 s of silence under the Mandate (90.0 to 96.5) belongs to the bed undocked.
  - Measure the final with `ffmpeg -i out.mp4 -af ebur128=peak=true -f null -`. The AAC length must equal the video length, 100.000 s.
  - The treatment's 9 s test measured -17.2 LUFS integrated with a -4.2 dBTP true peak and audio of 9.000 s; the film is measured over its whole length.

## The beats

The per-beat times below are the first plan. The film follows `SCRIPT.md`'s tables, retimed to the recorded takes and rebuilt on 2026-10-03 after three critics (`NOTES.md`, Rebuild after the three critics). The rebuild changed four things this file describes: B6 cuts inside p. 1806 to the sense line and pushes in on its printed ⁘ instead of moving the camera up the page, and the sign stops in the gap between the lines; the bicycle card's sign comes down from above and to the right of the word; the Technikum photograph is shown at its own 500 px; and the Command Paper is laid below the poster's subject lines.

### 1. The title page (0.0 to 7.5)

- **Picture:** The vol. 1 Hebrew title page (leaf n12).
- **Motion:**
  - At 0.0 the frame is tight on the first word of the title, מִלּוֹן, at 1.5x, on the paper with no bands. The rest of the page is ghost.
  - The word prints in (0.3 to 1.1, out3).
  - At 1.5 the page prints in round it (1.5 to 2.6), and the running head, both rules and note 1 print in (0.5 s).
  - The camera pulls back to the title block (2.0 to 4.0, log scale, power2.inOut), then moves down to the promise line at reading scale, 0.84x (4.0 to 5.5).
  - Crop marks close on "ומספר רב של מלים אשר יצר המחבר למושגים ישנים / וחדשים" at 5.5. The page holds to 7.5.
- **Asset and credit:** `motion/concepts/modern-hebrew/dictionary/assets/raw/v1-n12.jpg` (https://archive.org/details/thesaurustotiush01benj/page/n12/mode/1up), with the plate and ghost from `tools/plates.py`. Note 1 credits it: Princeton Theological Seminary Library, via Internet Archive. Public domain (vols. 1 to 5, BRIEF §4 Rights).
- **Key frames:** `$PROTOTEMPLATE/motion/concepts/modern-hebrew/dictionary/stills/k01-first-word.png` (the open) and `$PROTOTEMPLATE/motion/concepts/modern-hebrew/dictionary/stills/k03-promise.png` (the end state, with notes 1 and 2 replaced by the new note 1). The treatment's k02 framing (the whole page on the board) is not used.

### 2. Two new words (7.5 to 19.0)

- **Picture:** Two type cards under the running head "Magid Mishneh · Lyck · 1 January 1880".
  - Card 1 (7.5 to 15.0) sets ספר מלים at 200 px. "Wörter" sits under מלים and "buch" under ספר, joined to them by 1 px hairlines in ink 2.
  - Card 2 (15.0 to 19.0) is the sum: מִלָּה, then + ־וֹן, a sum rule, then מִלּוֹן. Each row has its gloss to the left.
- **Motion:**
  - Card 1 prints at 7.5. On "rejected" (9.5) a strike rule crosses ספר מלים right to left (0.6 s). The gloss "sefer milim, book of words" prints at 10.5. On "German Wörterbuch" (13.5) the two German halves rise into place and their hairlines draw up to the Hebrew they translate (0.5 s, expo.out).
  - Hard cut on "From" (15.0) to card 2.
  - Card 2's rows print with the voice: מִלָּה at 15.0, + ־וֹן at 16.0, the sum rule right to left from 16.5, and מִלּוֹן at 17.0. In מִלּוֹן the מ and ל are ink and the וֹן and every point are ink 2, which is the composing colour rule used throughout the film.
- **Assets:** none. All type. If the NLI scan of the column is pulled by hand, card 1 becomes the column itself with ספר מלים isolated (SCRIPT.md, Open items).
- **Key frames:**
  - Card 1 needs a new frame at 14.0. Its layout reference is `$PROTOTEMPLATE/motion/concepts/modern-hebrew/roots/stills/k02-book-of-words.png`, re-set on the book's paper in the book's faces and inks.
  - Card 2: `$PROTOTEMPLATE/motion/concepts/modern-hebrew/dictionary/stills/k05-milon.png`, re-rendered with the two inks and the new note 2.

### 3. Root and pattern (19.0 to 33.0)

- **Picture:** The composing card. The rail runs at y 610 across the body window, carrying the word, centred at x 1120.
  - The pattern מַקְטֵל stands on the rail, all in ink 2, with its label משקל · pattern at the top right.
  - The tray is three 132 px cells above the rail, with שורש · root at its right end.
  - The model מַפְתֵּחַ sits at the upper left once it arrives.
- **Motion:**
  - The card prints at 19.0.
  - On "root of consonants" (20.5) the tray's cells draw.
  - On "pattern" (22.5) the stand-ins ק ט ל sink to the ghost tone (0.6 s, power2.in), leaving the מ, the patah, the shva and the tsere standing over empty slots.
  - On "sling" (25.5) ק ל ע print into the tray, right to left (60 ms stagger), with the gloss "ק־ל־ע, to sling".
  - On "mafteakh" (27.0) the model prints at the upper left with its gloss.
  - On "he made" (29.0) the three letters drop into their slots, right to left, 0.25 s apart. Each makes a type tap as it lands, and the points settle (29.0 to 30.2). מַקְלֵעַ stands at 30.5, and the resting text node replaces the outlines.
  - The glosses "makle'a, cannon" and "today, a machine gun" print at 30.0 and hold to 33.0.
- **Assets:** none. All type, with glyph outlines from `roots/tools/glyphs.mjs` (add מַקְטֵל, מַקְלֵעַ, מַפְתֵּחַ, אוֹפָן, אָזְנַיִם and אָפְנַיִם to its word list).
- **Key frames:** new frames needed at 23.0 (the empty pattern) and 29.6 (mid-drop). Layout references: `$PROTOTEMPLATE/motion/concepts/modern-hebrew/roots/stills/k04-pattern.png` and `$PROTOTEMPLATE/motion/concepts/modern-hebrew/roots/stills/k05-makle-a-drop.png`, re-set in the book's faces and inks, with ghosted stand-ins in place of the hollow ones and no ledger.

### 4. The key of signs (33.0 to 41.5), the signature move, part 1

- **Picture:** Vol. 1, leaf n16, the note and the key of signs, at 0.92x. The rest of the page is ghost.
- **Motion:**
  - A hard cut lands at 33.0, with a page turn.
  - The heading ואלה הסימנים שהשתמשתי בהם prints in at 33.0. The three rows follow in reading order (33.3, 33.6, 33.9), each rising from ghost to ink (0.5 s). The italic labels "the Bible" and "the literature after the Talmud" print beside their rows at 33.0 and 33.5. Note 4 prints at 33.0.
  - The Hebrew reader begins at 34.0, and the coinage row prints in right to left as he reads it (34.0 to 34.6).
  - Rose crop marks close on the printed sign at 39.5, numbered "4)" in rose and spaced so the mark and its number never touch the sign, which is about 40 px wide on screen.
  - The lift (40.0 to 41.5, power3.inOut): a copy of the printed sign, in rose, rises off the page and grows from 46 px to 640 px at the centre of the body window. Meanwhile the page sinks to its ghost and the labels fade. The running head and note 4 stay.
- **Assets and credit:** `motion/concepts/modern-hebrew/dictionary/assets/raw/v1-n16.jpg` and `assets/derived/sign-key.png`. Princeton Theological Seminary Library, via Internet Archive.
- **Key frames:** `$PROTOTEMPLATE/motion/concepts/modern-hebrew/dictionary/stills/k06-key.png` and `$PROTOTEMPLATE/motion/concepts/modern-hebrew/dictionary/stills/k07-lift.png`. The treatment's motion test runs this move and the next one as film 37.0 to 46.0: `$PROTOTEMPLATE/motion/concepts/modern-hebrew/dictionary/motion-test.mp4`.

### 5. The bicycle (41.5 to 53.0), the signature move, part 2

- **Picture:**
  - From 41.5, vol. 1, p. 110 (leaf n131), framed so that the printed sign before אָפְנַיִם sits exactly under the lifted one.
  - From 47.0, the bicycle card: the model אָזְנַיִם above the rail in ink 2, and אוֹפָן on the rail.
- **Motion:**
  - At 41.5 the page under the sign cuts to p. 110, with a page turn. The sign comes down onto the printed sign (41.5 to 42.8, power3.inOut) and registers: the rose copy from the key covers the black impression, and the two printings differ by a hair at the edges. The impression sounds at 42.8.
  - The page prints in round the entry (42.5 to 43.5). The camera pulls back to the entry (43.5 to 45.5), and crop marks close on the headword at 45.5.
  - The book's footnote mark ¹) draws a hairline down the column to the foot of the page while the camera follows it (45.5 to 46.5, expo.out). Crop marks close on note 1, "מן, אופן, ע״מ אזנים.", at 46.5.
  - Hard cut on "The ending" (47.0) to the bicycle card. ־ַיִם waits at the left end of the rail with its gloss (47.5), and "ofan, wheel" prints at 48.5.
  - On "into" (50.5):
    - the ו and its holam lift out of אוֹפָן (0.6 s, power2.in, rising 130 px and fading);
    - the qamats under פ falls and a shva rises in its place, and a qamats rises under the א;
    - the ן cross-fades to נ while ־ַיִם docks (0.6 s, expo.out), and the ending's patah lands under the נ.
    אָפְנַיִם stands at 51.0, with "ofnayim, bicycle".
  - At 51.5 the rose sign comes down before the word (0.5 s) and registers, as the dictionary prints it. The card holds to 53.0.
- **Assets and credit:** `motion/concepts/modern-hebrew/dictionary/assets/raw/v1-n131.jpg` and its plates, credited in note 5. The card is type.
- **Key frames:**
  - `$PROTOTEMPLATE/motion/concepts/modern-hebrew/dictionary/stills/k08-bicycle.png`, re-rendered with the second isolation box widened to take in all of הרבה and with the new notes 5 and 6.
  - The card needs a new frame at 50.8 (mid-build). Layout reference: `$PROTOTEMPLATE/motion/concepts/modern-hebrew/roots/stills/k07-dual.png`, without the ledger.

### 6. Electricity (53.0 to 65.5)

- **Picture:**
  - 53.0 to 60.0: a type card with Ezekiel 1:4's clause וּמִתּוֹכָהּ כְּעֵין הַחַשְׁמַל מִתּוֹךְ הָאֵשׁ (one text node, 104 px) and its English below.
  - From 60.0: vol. 4, p. 1806 (leaf n408).
- **Motion:**
  - The card prints at 53.0. On "Greek translation" (55.5) a 2 px rule underlines הַחַשְׁמַל right to left. The underline's box is measured with a DOM Range on the single text node, never by splitting it.
  - On "elektron" (57.0) ἤλεκτρον prints above the word (out3, 0.5 s).
  - Hard cut at 60.0 to p. 1806, with a page turn. Gordon's note is isolated with crop marks (60.0 to 60.8).
  - At 61.0 the camera rises to the sense line ג), where the printed ⁘ and "Elektrizität; électricité" stand (0.8 s, power2.inOut).
  - The rose sign comes down from above the frame toward the place before the sense (61.5 to 62.5) and stops 40 px short, because a different sign is already printed there. Crop marks close on the printed ⁘ at 62.5, with no impression. The rose sign withdraws upward (63.0 to 63.8, power2.in).
  - The page holds to 65.5.
- **Assets and credits:**
  - The clause comes from the public-domain "Tanach with Nikkud" text, `motion/concepts/modern-hebrew/roots/assets/raw/ezekiel-1-4.json` (https://www.sefaria.org/api/v3/texts/Ezekiel.1.4?version=hebrew%7CTanach%20with%20Nikkud), set without the final sof pasuq because the film quotes a clause. Credit in note 7.
  - `motion/concepts/modern-hebrew/dictionary/assets/raw/v4-n408.jpg`, vol. 4, a lifetime Langenscheidt printing. Princeton Theological Seminary Library, via Internet Archive.
- **Key frames:**
  - The card needs a new frame at 58.0. Layout reference: `$PROTOTEMPLATE/motion/concepts/modern-hebrew/roots/stills/k10-ezekiel.png`, set on the book's paper with the clause only.
  - `$PROTOTEMPLATE/motion/concepts/modern-hebrew/dictionary/stills/k09-electricity.png` (the sign held short over the printed ⁘), with the new note 8.

### 7. The tomato (65.5 to 76.5)

- **Picture:** A type card. עַגְבָנִיָּה at 200 px in the upper half, and בַּדּוּרָה at 140 px below it, each with its gloss.
- **Motion:**
  - The card prints עַגְבָנִיָּה at 65.5, and its gloss prints at 67.5.
  - On "Ben-Yehuda" (70.0) בַּדּוּרָה and its gloss print below.
  - On "kept it out" (72.5) rose crop marks close on an empty place to the right of עַגְבָנִיָּה, where the dictionary prints the sign before a headword. Nothing lands there, and no impression sounds.
  - On "in use" (75.5) בַּדּוּרָה and its gloss sink to the ghost tone (0.6 s), and עַגְבָנִיָּה stays in ink.
- **Assets:** none. All type.
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/modern-hebrew/dictionary/stills/k10-tomato.png`, with the running head "Yehiel Michel Pines · Jerusalem, 5646 (1885–86)" and the new note 9.

### 8. The funders (76.5 to 81.5)

- **Picture:** Vol. 1, leaf n19, the end of the abbreviations, where the societies that shared the cost of printing are named.
- **Motion:**
  - A hard cut lands at 76.5, with a page turn.
  - The page holds at reading scale. On "funders" (78.5) crop marks close on "Hilfsverein der Deutschen Juden;". Paul Nathan's line further down stays in ghost, because the narration does not name him.
- **Asset and credit:** `motion/concepts/modern-hebrew/dictionary/assets/raw/v1-n19.jpg` and its plates. Princeton Theological Seminary Library, via Internet Archive.
- **Key frame:** a new frame at 80.0. Layout reference: the box `funders.hilfsverein` in `dictionary/lib/data.js`. `$PROTOTEMPLATE/motion/concepts/modern-hebrew/documents/stills/k05-funders.png` shows the same line on the same leaf.

### 9. The board (81.5 to 96.5)

- **Picture:** The board, with three documents laid down in turn at the right half, each on its own paper. The notes sit in the left column in paper colour.
  1. The Technikum under construction (Albert Bär, 1913), shown no wider than 600 px because its source is 500 x 500 px.
  2. The Jaffa poster on its grey-green paper, laid overlapping the photograph.
  3. Cmd. 1785, p. 8, cropped to Article 22 and laid over both.
- **Motion:**
  - A hard cut lands at 81.5. The photograph is laid down (81.5 to 82.3) with a paper slide, then holds with a 2.5 percent push over 4 s (the only camera drift in the film; MOTION.md allows one on a plate image).
  - The poster is laid down at 86.0. Crop marks close on its subject lines at 87.0.
  - The Command Paper is laid down at 90.5, and crop marks close on "English, Arabic and Hebrew shall be the official languages of Palestine." at 91.0.
  - Note 11 leaves at 90.5, note 12 stays to 94.5, and note 13 holds to the cut.
  - From 90.0 to 96.5 there is no narration. The page says it, and the bed carries the silence.
- **Assets and credits:**
  - `motion/concepts/modern-hebrew/dictionary/assets/raw/technikum-1913.png` (https://commons.wikimedia.org/wiki/File:%D7%98%D7%99%D7%95%D7%9C_%D7%A7%D7%91%D7%95%D7%A6%D7%AA%D7%99_%D7%A9%D7%9C_%D7%A6%D7%99%D7%95%D7%A0%D7%99%D7%9D_%D7%91%D7%92%D7%A8%D7%9E%D7%A0%D7%99%D7%94_%D7%9C%D7%90%D7%A8%D7%A5_%D7%99%D7%A9%D7%A8%D7%90%D7%9C_%D7%91-_1913._%D7%97%D7%99%D7%A4%D7%94_%D7%94%D7%98%D7%9B%D7%A0%D7%99%D7%95%D7%9F._%D7%A6%D7%9C%D7%9D_%D7%90%D7%9C%D7%91%D7%A8%D7%98_%D7%91%D7%A8-PHAL-1619662.png), `{{PD-Israel}}`. Photograph: Albert Bär, Central Zionist Archives.
  - `motion/concepts/modern-hebrew/dictionary/assets/raw/asefa-nave-shalom.jpg` (https://commons.wikimedia.org/wiki/File:Asefa_Nave_Shalom.jpg). National Library of Israel, CC BY-SA 3.0. Shown unretouched.
  - `motion/concepts/modern-hebrew/dictionary/assets/raw/mandate-n7.jpg` (https://archive.org/details/mandateforpalest00leaguoft/page/n7/mode/1up), Cmd. 1785, p. 8. University of Toronto, via Internet Archive, not in copyright.
- **Key frames:**
  - `$PROTOTEMPLATE/motion/concepts/modern-hebrew/dictionary/stills/k11-technikum.png` shows the board and its note column (the photograph there is 730 px; reduce it to 600).
  - The poster and the Mandate on the board need new frames at 89.0 and 94.0. Scan references: `$PROTOTEMPLATE/motion/concepts/modern-hebrew/documents/stills/k07-poster.png` and `k08-mandate.png`.

### 10. The sign goes home (96.5 to 100.0)

- **Picture:** The key of signs again, framed as in beat 4, with the page in ghost and the coinage row in ink.
- **Motion:**
  - A hard cut lands at 96.5, with a page turn.
  - The rose sign comes down from above the frame (96.5 to 97.5, power3.out) and settles on the printed sign in the coinage row, the impression it was lifted from. It registers exactly, and the impression sounds at 97.5.
  - The notes band takes the close at 97.0, the title and then the series line, 90 ms apart. Every picture was credited in its own note, so the close carries no credits block.
  - The bed resolves, with a fade from 99.2.
- **Key frame:** `$PROTOTEMPLATE/motion/concepts/modern-hebrew/dictionary/stills/k12-home.png`, with the ghost plate trimmed to the body window. The treatment's frame lets the plate run past x 1800 on the right.

## Build notes

- **Composition.** Build in `motion/films/modern-hebrew/` from the dictionary lane's library: `dictionary/lib/dict.js` (the engine: `MH.mount(el, [from, to])` resolves to `render(t)`), `lib/dict.css` and `lib/data.js` (every box in scan pixels). The beats there are the treatment's. Rewrite them to this file's ten, and drop the imprint page, glida and the separate promise beat.
- **The composing move.** Port the roots lane's `build().set(state)` (`roots/lib/mh.js`) into the dictionary engine as a card type. Use the dictionary's inks, faces and ghost tone in place of the roots' field and paper colours, with the rail, tray and pattern geometry from `roots/lib/frames.js`. Generate the glyph outlines with `roots/tools/glyphs.mjs`.
- **Timeline.** Use one paused GSAP timeline registered synchronously on `window.__timelines`, with `fromTo` tweens only and build-time start values. Draw everything in the timeline's `onUpdate`. Keep every plate as a hidden `<img>` in the DOM.
- **Audio.** Audio clips are `<audio>` elements with `data-start` and `data-duration`, placed from each take's `.json`. Retime each key action (a print-in, a strike, a drop, the lift, a landing, a crop mark) to the word times of the takes, as the beat tables in SCRIPT.md mark them.
- **Assets.** Copy every scan the film uses into `motion/films/modern-hebrew/assets/`, and record each in `assets/SOURCES.md` with its URL, what it shows, its date and edition, its rights and its on-screen credit. Start from `motion/concepts/modern-hebrew/dictionary/assets/SOURCES.md` and add the Ezekiel text from the roots lane's.
- **Checks.**
  - Run `npx -y hyperframes@0.8.106 check .` and get 0 errors.
  - Render twice with `--workers 3` and compare framemd5 on every frame.
  - Look at the render at 1280 x 720. Every translation, quotation and gloss holds for at least (words / 3) + 1 s from its arrival. No text sits closer than 120 px to the left or right edge. The running head and the notes are the page's margin furniture, as the series frame's is in MOTION.md, and sit in the top and bottom margins as a book's do; no note runs below y 1050.
  - Read every Hebrew line on screen against the BRIEF and the scans, letter by letter and point by point.
