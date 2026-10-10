# The film pipeline in detail

This file is the detail behind section 3 of `../SKILL.md`: the research package, the director and judge briefs, the storyboard, the way the rounds ran as workflows, and Kevin's direction round by round. Paths are relative to `$PROTOTEMPLATE`, and paths that start with `films/`, `kit/` or `out/` sit inside `motion/`.

## The research package (`films/<slug>/BRIEF.md`)

A translation series film starts from a five-part research package. jihe-yuanben's is Kevin's own research, saved verbatim. journey-to-the-west's and modern-hebrew's were compiled for their films by a workflow of history, sources, vocabulary, writer, claim checker, link and rights checker and finalizer lanes, in the same format.

`scripts/build/motion.mjs` parses every BRIEF.md and publishes its body at `/motion/<slug>`, so the shape is fixed:

- A `# Brief: <slug>` header block: Kevin's request quoted with its date, and how the research binds the film (the script is a starting point; the facts may not move; contested items stay hedged). A `---` line closes it. build-motion leaves this block out of the public body.
- The package h1 (`# Ricci, Xu Guangqi, and the Chinese vocabulary of Euclid`) and, under it, a series line that opens with `<Name> series` (`Chinese series, installment: *Jihe yuanben* 幾何原本, Beijing, 1607.`).
- `## 1. Animation script (about N seconds)`: a table of Time, Voiceover, Visual, Caption (on screen, not spoken) and Link. Under it, coordinates for any globe build and image notes that say how each scan may be captioned.
- `## 2. The post`: the long-form post. It is the source of truth for every sentence the film says.
- `## 3. Vocabulary table`: term, reading, source-language word, English, status today, note and source.
- `## 4. Sources`: primary texts, scholarship and the rights of every image source.
- `## 5. Fact-check list`: three groups that open `**Verified`, `**Contested` and `**Unverified`, with items numbered without a gap across all three.

build-motion throws before writing anything when a package has other than five h2 sections, a section out of order, no table in section 1 or 3, a missing group, or a gap in the numbering.

Source lanes come before the directors on a series film. They fetch the scans into `films/<slug>/assets/` and open-licensed faces into `films/<slug>/fonts/`, record the rights of each, and correct the brief where the sources disagree with it. jihe-yuanben's source lanes wrote `assets/SOURCES-zh.md` and `assets/SOURCES-west.md`, which correct several of the brief's readings (the layout of the 界說 note, the preface's wording, Definition 12's wording, the order of a Nine Chapters problem's parts) and identify the unverified Euclid edition.

## The director brief

Each round has three directors, each with a lens, working in parallel under `motion/concepts/<slug>/<lens>/` (the blog films' round 7 lanes are `r7-<lens>`).

| film | lenses | winner |
| --- | --- | --- |
| blog-fuma-nama, blog-designing-docs (round 7) | people, idea, viewer | Fuma: viewer; docs: idea, with frames from viewer and people |
| blog-fuma-nama, blog-designing-docs (round 6, two art directors) | material, product | none; the round was stopped and replaced by round 7 |
| jihe-yuanben | page, words, geometry | The page (52 of 60) |
| journey-to-the-west | names, editions, woodblock | The names (49.5) |
| modern-hebrew | dictionary, roots, documents | The dictionary (50) |

A director delivers:

- a one-sentence story that a viewer could repeat afterwards;
- a treatment with the script, each line's source sentence and the beats (`TREATMENT.md`; earlier lanes kept it as `treatment.json` or `script.json`), and for a series film its sources;
- for a blog film, a script at least two thirds of whose spoken words are verbatim excerpts from the post;
- key frames rendered from a page that draws any frame (`keyframes.html?f=<n>`, written to `frames/` or `stills/` by a `render.mjs`) and a contact sheet of them;
- a motion test of the signature move: a small HyperFrames project in `motion-test/` that passes `check`, and its draft MP4;
- for a series film, a narrator take and a music sketch, each with its `el.mjs hear` check.

In a from-scratch round the directors are forbidden to open the earlier cuts. Plan the script's length from the narrator's measured pace: Clara reads about 2.5 to 2.7 words a second at speed 1.0, and numbers take longer read aloud ("sixteen oh six", "two sixty-three C E").

## The judge brief

The judge scores the three treatments on six criteria of 10 and writes the two files the build follows.

- **Criteria.** Story, facts, writing (with the Chinese or Hebrew for a series film), picture, sound and build.
- **Evidence.** Each treatment and its sources; every key frame at full size and at 1280 x 720; the contact sheet; the motion test read with ffmpeg (two frames a second, and single frames at full size where a move looks wrong); the narrator take and its transcription; the music sketch's check; an ebur128 pass on each motion test.
- **Grafts.** The judge may take moves from the losing treatments only when they use the winner's grammar. jihe-yuanben's SCRIPT.md lists seven changes and says of them: "none of them adds a second visual language".
- **Length.** The judge retimes the script to the length cap at the narrator's measured rate and lists each cut, with the first line to restore if the takes run short.
- **SCRIPT.md** holds the decision table, the numbered changes, a Lines table (n, spoken text, heading, source sentence), the heading sources (heading, size, source sentence), pronunciation notes and an audit: every excerpt matched once against the post by exact string with curly quotes; no em dash, parenthesis, exclamation mark or question mark in a spoken line; no two adjacent lines sharing a two-word phrase; connecting lines complete declarative sentences.
- **CONCEPT.md** holds the story in one paragraph, the winner's folder and key frames, the material and the type, and per beat the heading, the picture, the motion with its eases and times, the word the key action lands on, the judge's fix and the key frame path, then build notes.

The orchestrator's own changes after judging go at the end of each file under a dated heading (for example, Fuma's line 3 heading became "Four modular / layers" in place of "The moon, Luna", which needed the post's context). Later rounds add sections ("Round 7b changes", "Round 7d") and mark the sections they supersede. Nothing is deleted: an earlier script is kept as `SCRIPT-r6a.md`, an earlier concept as `CONCEPT-r6a.md`, and a series rewrite as `SCRIPT-v2.md` beside the old `SCRIPT.md`.

Kevin reads the scripts before the build starts. The Videos session sends them as a page or a file and waits for his answer.

## The storyboard (`films/<slug>/STORYBOARD.md`)

- A header block: the length at 60 fps, the beat grid and every cut time, the material, the type, the transitions in use, and anything the round changed.
- A beats table: beat, time, heading on screen, and the voice (the line with its key words' film times).
- Per beat: Picture, Motion (each action with its ease, duration and the word it lands on) and Out (the transition).
- After the takes exist, every time comes from them. In Fuma Nama `lib/cues.mjs` places each line so its first sound falls 0.1 to 0.3 s after its cut and prints every word's film time, and `index.html` holds the same table as `CUE`; the docs film keeps its cue table as `O` in `index.html`. Every cut stays on the 0.5 s grid. A heading that arrives on a cut starts its mask rise 0.067 s before the cut, so the cut frame already shows it.
- To retime Fuma Nama: change a placement in `lib/cues.mjs`, copy the words it prints into `CUE`, move the cut in `CUT`, rerun `make-mix.mjs`, the carve, the flatten and the stems, and check that every bed join still sits under a line.

## How the rounds ran

Kevin's film rounds ran as Workflow scripts with one lane per film and stage:

- a build at high effort, an adversarial frame-by-frame critique, a revision, a verification and a fix;
- a sound pass with its own lanes: sound, a measured listen, and a sound fix;
- for a series film, source lanes, the three directors and the judge, then a separate build workflow with picture, sound and story, and history and rights critics.

Lessons from those runs:

- Copy the published cut to the next `motion/out/v<N>/` before a revision starts.
- After a session break, start a new script that embeds the finished results from the journal. Resuming a stopped run with an edited script re-ran its finished critiques live, because the cache keys no longer matched.
- A run that dies on a network outage may leave no file changes. Relaunch it.
- Record every round in the film's NOTES.md, newest first: what Kevin said, what changed and what did not, the deliverables, the measurements, the ElevenLabs ledger and the traps met.

## Kevin's direction, round by round

| date | round | Kevin | what changed |
| --- | --- | --- | --- |
| 2026-10-01 | 1 to 3 | "check everything about our brand and visual design and our blogs and make incredible motion design videos showing off your talents as a graphic designer" | MOTION.md, the kit and an eight-film roster; narrowed the same day to two films ("just make one for fuma nama and one for the docs redesign") |
| 2026-10-01 | 4 | "the color we can use is the color and dither and shaders we used (gem smoke from glyphfield). make headers no more than 2 lines large. feel free to use logos. no need for captions/subheaders" | material palettes, two-line headings at 100 to 150 px, logos, no captions |
| 2026-10-01 | 5 | "add music and an australian voice from elevenlabs" | a narrator and a bed through `el.mjs` |
| 2026-10-02 | 6 | "make the videos a lot better and more properly scripted"; "for the new videos, we need new visuals too" | scripts first; the visuals run was stopped and replaced |
| 2026-10-02 | 7 | "the new scripts and visuals and stuff have to be done from scratch ... it needs to be coherent and tell a clear simple story taking excerpts from the blogs" | three directors and a judge per film |
| 2026-10-02 | 7b | "add links at end ... a consistent end card after videos that also adds link. for fuma, mention the teams that fumadocs is used by with their logos and stars ... make the voice more australian and make the voice less shaky" | `kit/endcard/`, the adopters beat, a steadier narrator at speed 1.0 |
| 2026-10-02 | 7c, 7d | "for the blogs i liked the peaceful music from before"; "like 2 but more female. and also im sad to see the dither disappear from background"; "lets use clara" | Clara, round 5's bed edited to length, the dithered field behind every scene |
| 2026-10-02 | 7d | "i also wonder if theres a way to bring back the isometric view that transitions into more in the designing docs film, no need to replace anything" | round 5's isometric move returned as a bridge between two beats, replacing nothing |
| 2026-10-02 | series | "let's add a new video to the roster, where you have more creative freedom" | jihe-yuanben, then journey-to-the-west and modern-hebrew |
| 2026-10-04 | 8 | "remove the frame that seems to be overlaid on top of everything" | the series frame removed from both blog films; the end card's frame off by default |
| 2026-10-04 | jihe 3 to 8 | "The triangle reassembly is a bit wacky" | path tuning failed; the idea changed to one moving pair and a print-in |
| 2026-10-05 | series v2 | "a little too slow paced. the video isnt very interesting and the script is just kind of weird ... we love the diagrams and visuals though" | a story editor's diagnosis, three writers, `SCRIPT-v2.md` at 60 to 75 s |
| 2026-10-05 | pictures | "never distract with text on the artifacts. this disqualifies the dictionary and oxford" | the dictionary pictures moved to `kit/_retired/` |
| 2026-10-05 | narrator | "why are we using clara? what are some better voices?" | series auditions in `kit/audio/auditions/series/in-context/`, waiting on his pick |

When Kevin misses something from an earlier cut (the dither, the round 5 music, the isometric view), bring it back as an addition and keep what he approved since.
