# The film pipeline in detail

This file is the detail behind sections 5 and 11 of `../SKILL.md`: the research package, the director and judge briefs, the storyboard, Kevin's direction round by round, and how a cut is published. The workflow shapes and the lane rules are in `workflows.md`. Paths are relative to `$PROTOTEMPLATE`, and paths that start with `films/`, `kit/` or `out/` sit inside `motion/`.

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
- a script that tells its own story, with at most one short quote (round 7 asked for two thirds verbatim excerpts; Kevin replaced that on 2026-10-06: "make the script not driven by quotes but tell its own story");
- key frames rendered from a page that draws any frame (`keyframes.html?f=<n>`, written to `frames/` or `stills/` by a `render.mjs`) and a contact sheet of them;
- a motion test of the signature move: a small HyperFrames project in `motion-test/` that passes `check`, and its draft MP4;
- for a series film, a narrator take and a music sketch, each with its `el.mjs hear` check.

In a from-scratch round the directors are forbidden to open the earlier cuts. Plan the script's length from the narrator's measured pace: Frederick Surrey read his audition at about 2.6 words a second at speed 1.0 (Clara read 2.5 to 2.7), numbers take longer read aloud ("sixteen oh six", "two sixty-three C E"), and gaps of 0.3 to 0.5 s between lines are part of the length.

## The judge brief

The judge scores the three treatments on six criteria of 10 and writes the two files the build follows.

- **Criteria.** Story, facts, writing (with the Chinese or Hebrew for a series film), picture, sound and build.
- **Evidence.** Each treatment and its sources; every key frame at full size and at 1280 x 720; the contact sheet; the motion test read with ffmpeg (two frames a second, and single frames at full size where a move looks wrong); the narrator take and its transcription; the music sketch's check; an ebur128 pass on each motion test.
- **Grafts.** The judge may take moves from the losing treatments only when they use the winner's grammar. jihe-yuanben's SCRIPT.md lists seven changes and says of them: "none of them adds a second visual language".
- **Length.** The judge retimes the script to the length cap at the narrator's measured rate and lists each cut, with the first line to restore if the takes run short.
- **SCRIPT.md** holds the decision table, the numbered changes, a Lines table (n, spoken text, heading, source sentence), the heading sources (heading, size, the spoken words it is made of), pronunciation notes and an audit: the quote count (at most one) with the quote matched against its source by exact string, curly quotes included; the set pieces of the current cut and where each went; the 4 to 6 headings; the stakes inside the first 6 to 8 s; no em dash, parenthesis, exclamation mark or question mark in a spoken line; no two adjacent lines sharing a two-word phrase; every line a complete declarative sentence.
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

Every round ran as a Workflow script. `workflows.md` has the three shapes, the hard rules every lane prompt carries, the lane rules and the lessons from the runs.

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
| 2026-10-05 | narrator | "why are we using clara? what are some better voices?" | thirteen series auditions; Kevin picked Frederick Surrey for the series |
| 2026-10-06 | narrator | "remember, we're using Frederick Surrey" | Frederick Surrey narrates every film; Clara's settings kept in a separate voice file, unused |
| 2026-10-06 | blog v3 | "we need to convey the gravitas better earlier ... keep all the visual spectacle, i would hate to see removals. make the script not driven by quotes but tell its own story"; "need a better fuma opener" | the stakes in the first 6 to 8 s; at most one quote; every set piece kept; no opening on a personal fact |
| 2026-10-06 | blog v4 | "way too many headers ... they dont actually line up with whats being said"; "too many visuals that are rapidly playing ... we can just increase the length" | 4 to 6 headings made of the spoken words; one main motion at a time; the film lengthened instead of crammed |
| 2026-10-06 | records | "save these kind of sheets to prototemplate as well as the scripts" | `kit/contact-sheet.sh` and `kit/script-export.py`; every published cut's sheet and script on /motion |
| 2026-10-07 | scripts | "make 5 variations of each script ... humble and not cheesy ... each in a new tab" | the script variations round and its guidance (`workflows.md`) |
| 2026-10-07 | publish | the series v2 cuts, the v4 blog films, the Slash partnership cut and the product GIF approved | seven cuts pinned in `public/motion/published.json`; jihe-yuanben goes out under CC BY-SA 4.0 |
| 2026-10-08 | Slash v2 to v5 | "we use 3 px dither ... all dithers are a lil TOO dithered"; "cap it at 40 seconds"; "make its pacing a lil faster, we hang around on many shots for too long" | 3 px cells everywhere; Kevin's lines cut whole in his order; holds about 0.5 s and moves about 30 percent quicker; the card opens on Slash's own photo, never dithered; the legal line dropped |
| 2026-10-09 | Slash v6 to v8 | "make the card transition and become the globe", then "make the transition less weird ... make it slide right behind the globe"; "its a bit hard to see the lines" | a plain physical move instead of a morph; routes 2.5 px over a keyline so they read at phone size; the white wordmark on the gold; v8 approved and published; the 19.5 s cut taken off the site (`offSite`) |
| 2026-10-10 | how-to films | the films must "feel like telling a story instead of just saying lines from the articles" | an answer film tells a story (a product moment, its stakes, the change, the payoff); headings over code panels that recite an article are rejected |
| 2026-10-10 | repository | system v2, decision K3 | `motion/` sources tracked through an allowlist; renders, audio and pictures stay local |

When Kevin misses something from an earlier cut (the dither, the round 5 music, the isometric view), bring it back as an addition and keep what he approved since.

## Publishing a cut

- The Prototemplate session publishes a film only after Kevin approves the cut. It copies the final (or the share copy) to `public/media/<name>-film.mp4` with the moov atom at the front (`ffmpeg -i <in> -c copy -movflags +faststart <out>` when the streams stay unchanged), writes `public/media/<name>-poster.jpg` at 1920 x 1080, lists both in `public/media/README.md`, adds the film's `film` and `poster` paths to `public/motion/published.json`, pins the cut by the SHA-256 of its video and audio streams (a faststart remux hashes the same as its render), its label and its length with `node scripts/build/motion.mjs --pin <slug>`, then runs `pnpm build:motion` and commits the web copies and the generated files. `/brand` shows the blog films under "Made with the system".
- `pnpm build:motion` copies `<slug>.credits.txt`, `sheets/<slug>.webp` (and the `.png` up to 20 MB) and `scripts/<slug>.md` to `public/motion` only from the folder in `motion/out` whose render has the pinned streams (`out/` itself, or an archive folder with the kit's `sheets/` or `scripts/`, such as `out/series-100s`), and checks the script's label and length against the pin. A newer render in `out/` is listed on the site as in review by its label and length only. When a final is replaced, move the old render with its credits, sheet and script into an archive folder with the same layout.
- It also reads MOTION.md's roster and each series `BRIEF.md` and writes `src/lib/motion.ts` and `public/motion/<slug>.md`. A film's status comes from the files: rendered when its final or web copy exists, in production when its folder exists, planned otherwise. It throws before writing anything when a BRIEF's or a script's shape changes or a web copy is not its pinned cut, and it refuses quoted hex colors in `motion.ts` and absolute local paths anywhere.
- In a clone whose `motion/` holds only the tracked sources (no `out/`, no unreleased film folders), `build:motion` still runs and leaves `public/motion/` as it is, but `motion.ts` loses the display-only paths into `out/` (each published film's local video, poster, checking sheet, draft and cut render) and an unreleased film whose folder exists only locally drops from in production to planned. So the generated files are written where the full `motion/` folder exists, and they are committed, so the site builds without `motion/`.
- The Videos session then tracks the film's sources (the skill's section 1): its folder line in `.gitignore`, `films/<slug>/script.json` and `script.stt.json` from `out/scripts/source/`, the public scan on `motion/`, and the paths staged by name for Kevin to read.
