# Film rounds as workflows

This file is the detail behind section 5 of `../SKILL.md`. Every film round from 2026-10-01 to 2026-10-10 ran as a Workflow script: one lane per film and stage, with a brief shared by every lane. Three shapes cover them. Write a new script for each round; never copy an old one, because each holds its round's paths, notes and backups. Paths that start with `films/`, `kit/` or `out/` sit inside `$PROTOTEMPLATE/motion/`.

## 1. Treatments and a judge (a new film, or a from-scratch round)

1. **Sources** (a series film): lanes fetch the scans into `films/<slug>/assets/` and open-licensed faces into `films/<slug>/fonts/`, record each one's rights in a SOURCES file, and correct the brief where the sources disagree with it.
2. **Treat**: three directors in parallel, one lens each, under `motion/concepts/<slug>/<lens>/`. Each writes a one-sentence story, a treatment with every line's source, key frames from a page that draws any frame, a contact sheet of them, and a motion test of the signature move that passes `check`; a series director adds a narrator take and a music sketch, each checked with `el.mjs hear`. Directors in a from-scratch round never open the earlier cuts.
3. **Judge**: one lane scores the three on story, facts, writing, picture, sound and build (each out of 10), reads every key frame at full size and at 1280 x 720, writes `SCRIPT.md` and `CONCEPT.md`, and grafts only moves that use the winner's grammar.
4. Send the scripts to Kevin and wait for his answer before any build.

## 2. Build, critique, fix and verify (a build or a revision)

1. **Back up first**: the current build into `films/<slug>/archive-<round>/` and the current final with its records into the next `out/v<N>/`, checked byte for byte.
2. **Build**: lanes split by what they touch (an opener lane, a voice lane, the rest), each told which files it may edit. A voice lane records only the lines that changed.
3. **Integrate**: one lane wires the parts, retimes every event to the takes' word times, renders the draft and measures it.
4. **Critique**: critics in parallel, each with its own lane (the picture as a viewer, frame by frame; sound and delivery; story, facts and rights). Each returns a verdict (pass, pass with minors, fail) and findings graded major or minor, with times and evidence.
5. **Fix**: one lane answers every finding or says why it stays.
6. **Verify**: an independent, read-only lane confirms each fix on the frames and the measurements that showed the defect, and checks the delivery: `check` 0 errors, -16 LUFS within 0.5, true peak at or below -1 dBTP, no Google Fonts in the log, faststart, the length, and `el.mjs hear` against the script. A second verification follows when the first needed fixes.

## 3. Script variations and editors (when Kevin doubts a script)

Kevin, 2026-10-07: "make 5 variations of each script ... humble and not cheesy ... each in a new tab".

1. **Write**: one writer per film, five variations each, every one carried by the film's existing pictures, each written out as one paragraph to read straight through and then line by line with the picture that carries each line.
2. **Edit**: two editors split the films, check every fact against the film's sources, and hold every variation to the guidance below and the skill's section 2.
3. **Deliver** one tab or section per film that opens with the current script as one paragraph for comparison, then the five variations. `kit/review/` pages can carry the lines and their times.

The guidance every writer and editor received:

- State what happened and what is true, plainly, and let the facts carry the weight. Modest claims: General Translation helps, offers, built, uses.
- No superlatives or hype words, no "imagine", "meet" or "introducing", no slogans or taglines, no puns, no rhetorical questions, no exclamation marks.
- No drama for its own sake: no setups such as "But there was a problem", no cliffhangers, no reveals announced as reveals.
- Other people and companies get the credit, accurately: the people a post is about, the partner, the post's authors, the translators and scholars in a series film. General Translation is not the hero.
- The film ends quietly on something true and specific.
- Every fact comes from the film's sources (the post, the research brief, the GT site).

## The hard rules every lane prompt carries

- Read first: the film's NOTES.md (its rebuild, traps and deliverables sections), its SCRIPT and CONCEPT files, STORYBOARD.md, and MOTION.md's dated sections.
- Narrator takes through the film's recorder or `kit/audio/el.mjs line`, in Frederick Surrey's voice from `kit/audio/voice.json` (or the file `EL_VOICE_FILE` names); confirm each take's `.json` names him. `el.mjs` alone reads the ElevenLabs key: never read, print or copy its config file, never pass a key anywhere, and never edit `el.mjs` or the voice files.
- Spend sparingly: at most two takes per line unless a take is mis-said, and no new music when the existing bed can be re-cut on its own bar lines.
- Archive, never delete: move replaced takes and files into an archive folder inside the film.
- Every visual event is retimed to the takes' word times; no dead air longer than about 1.6 s unless the script sets a hold.
- `npx -y hyperframes@0.8.106 check` reports 0 errors; render with `--quality delivery --fps 60 --workers 3`; no line of the render log mentions Google Fonts.
- The final measures -16 LUFS integrated (within 0.5) and a true peak at or below -1.0 dBTP, with peak control in the ffmpeg masters; it is faststart, and a master over 50 MB also gets a share copy.
- Update CREDITS.txt to list only the pictures the cut shows, and copy it to `out/<slug>.credits.txt`. Add a dated round entry to NOTES.md: what was built, the takes, the measured timings, every deviation from the script with its reason, and the open items.
- On-screen and spoken English follows the skill's section 2.
- Look and listen yourself: extract frames with ffmpeg at each line's start plus 1 s and at every set piece's key moments and read them; run `el.mjs hear` on the final mix.
- Stay in your film's folder and its own files in `out/`; the kit is read only.

## Lane rules (2026-10-09 and 2026-10-10)

- Work only in your film's own folder under `motion/films/` and its own files under `motion/out/`. Never edit another film. Never edit MOTION.md or LINEUP.md; the lead does.
- Disk is tight: keep each film's prototypes under about 1 GB and delete frame dumps when done.
- The machine is shared and loaded: render with `--workers 3`, render twice and compare, and say if a render dropped frames.
- Log every ElevenLabs call's purpose in the film's NOTES.md.
- Load the `hyperframes` skill before writing a composition.
- Renders take turns: take the lock with `mkdir <scratch>/render.lock` (retry every 30 s while it exists), write your slug and the render's PID into `render.lock/owner`, and remove it the moment the render ends, success or failure.
- Stop only the processes you started, by their PIDs. Never use pkill, killall or a pattern: every lane runs the same render command, so a pattern stops other lanes' renders (this happened on 2026-10-10).
- Use a scratch folder named after your slug, never a shared name.
- No git commands that change state.

## Lessons from the runs

- Copy the published cut to the next `out/v<N>/` before a revision starts.
- After a session break, start a new script that embeds the finished results from the journal. Resuming a stopped run with an edited script re-ran its finished critiques live, because the cache keys no longer matched.
- A run that dies on a network outage may leave no file changes. Relaunch it.
- Record every round in the film's NOTES.md, newest first: what Kevin said, what changed and what did not, the deliverables, the measurements, the ElevenLabs ledger and the traps met.
- When Kevin misses something from an earlier cut (the dither, the round 5 music, the isometric view), bring it back as an addition and keep what he approved since.
