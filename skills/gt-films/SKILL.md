---
name: gt-films
description: >-
  How General Translation films are made in Prototemplate's motion/ folder with
  HyperFrames: Kevin's standing rules for scripts, pacing and narration, the
  brief, directors and a judge, the kit and its sound tools, ElevenLabs
  narration and music, the mix targets, renders and their records, the
  critic, which motion/ sources the public repository tracks, and how a film
  reaches /motion; and the short media around a launch. Use when planning,
  scripting, building, critiquing or rendering a GT film, trailer, sting,
  showreel, promo or demo GIF, when tracking or publishing a film's sources,
  or when reviewing one against Kevin's standard.
metadata:
  title: Making a film
  areas: videos, motion
  updated: 2026-10-10
  origin: prototemplate
  owner: V
---

# Making a film
General Translation (GT) makes its blog films, announcement films and translation-history films as HyperFrames compositions: HTML pages with one paused GSAP timeline that the HyperFrames CLI seeks and renders frame by frame to MP4. They are built in `$PROTOTEMPLATE/motion/`, one project per film, from one shared kit and one brief, `motion/MOTION.md`. This skill states Kevin's rules, each step of a film, and the checks a film passes before it reaches /motion.

Paths are relative to a Prototemplate checkout (`$PROTOTEMPLATE`), and paths that start with `films/`, `kit/` or `out/` sit inside `motion/`. `references/` is this skill's folder of detail files; `scripts/` holds two critic tools that need only Node and ffmpeg (`node <this skill's folder>/scripts/<name>.mjs`).

## 1. Ownership and the repository

- One session owns `motion/`: Kevin calls it the Videos session (2026-10-03: "the videos one should be making them, and this one is just for prototemplate work"). Other sessions read `motion/`, send film requests to it by name and run no film lane; a session without the local `motion/` folder reviews against this skill and asks Kevin for the Videos session before building a film.
- The repository is public, so `motion/` is tracked through an allowlist in `.gitignore` (lane L6 of the system v2 plan, 2026-10-10): `MOTION.md`, the kit's code, the four kit examples (`films/_smoke`, `_gem`, `_endcard-blue`, `_endcard-fire`), the partnership globe's core in `stills/`, and the text sources of the films the site publishes (`public/motion/published.json`; a film in its `offSite` list is not published). Renders, audio, pictures, fonts, archives, unreleased films, `concepts/`, `LINEUP.md` and scratch stay local.
- In a fresh clone, `node motion/kit/vendor.mjs` writes the vendored libraries and the brand twins (files the repository already tracks in `public/` and `deck/`), each checked by SHA-256. `motion/kit/picture-sources.json` lists every picture, logo, mark and font in the kit and the published films' folders, with its source, licence, hash and the code that loads it; fetch the ones without a twin by hand. Audio is never tracked.
- When a film is published, the Videos session adds its folder to the allowlist, copies its reviewed script table to `films/<slug>/script.json` (and the final's transcript to `script.stt.json`), scrubs machine paths and account lines, runs the public scan on `motion/` (`PT_DENYLIST=<private list> node scripts/lint/public.mjs --root motion`, because `pnpm lint:public` skips `motion/`), and stages the paths by name. Never run `git add -A` or `git add .`: on 2026-10-01 a broad add pushed 229 files of `motion/` to main in b56e64c, and 8c8d6fb had to untrack them.
- Commits to Prototemplate are authored as Kevin with his GitHub noreply address (system v2 decision K8). Kevin reads a staged `motion/` diff before it is committed. Publishing a film to main is his call; explorations stay local until he reviews them.
- The kit is read only for a film lane; a kit change goes through the Videos session, because every film loads it. Lane rules: work only in your film's folder and its own files in `out/`; never edit another film, MOTION.md or LINEUP.md (the lead does); name your scratch folder after your slug; no git command that changes state. `references/workflows.md` has the full lane rules.

## 2. Kevin's standing rules

These hold for every film (Kevin's notes, 2026-10-01 to 2026-10-10). A film's own SCRIPT, CONCEPT and NOTES files may add to them, never loosen them.

- **Plain technical English** in narration and on screen: complete declarative sentences, concrete nouns and numbers. No metaphors, no "X, not Y" or other negative parallelism, no strings of fragments, no one-word sentences, no hype words, no exclamation marks, no rhetorical questions, no em dashes.
- **Humble and not cheesy** (Kevin's words, 2026-10-07): state what happened and what is true and let the facts carry the weight. GT helps, offers, built, uses. No superlatives, no "imagine", "meet" or "introducing", no slogans, puns or cliffhangers, no reveals announced as reveals. Other people and companies get the credit; GT is not the hero. The film ends quietly on something true and specific.
- **The narration tells its own story** (2026-10-06). A quote is at most a garnish: one short quote in a film, or none. A how-to or answer film tells a story too: a product moment, its stakes, the change and the payoff. Reciting an article's points as headings over code panels is rejected, even when every fact is right (2026-10-10).
- **The stakes land in the first 6 to 8 s**: what this is and why it matters. Kevin rejected opening on a personal fact (2026-10-06).
- **Headings**: 4 to 6 in a film, each made of the words spoken at that moment and shown in step with them, none where the picture already says it, and no leftover post phrases (2026-10-06).
- **Spectacle stays.** A revision never removes a set piece Kevin has seen; it retimes, reorders or re-purposes it. Inventory the current cut (its set pieces and its quotes) before rewriting a script.
- **Transitions.** When one object leads into the next shot, it moves physically: it slides, passes behind or is occluded. No morph, no merge, and never shrink an object to a dot (2026-10-09). A connecting element, such as a bar that introduces the boxes under it, never waits about 2 s for what it connects.
- **Readability at phone size.** Thin lines over a textured ground must read at 640 x 360; check them there. Logos keep their own drawing; on a colored ground such as Slash's gold, a logo is white (2026-10-09).
- **Dither** is the 8 x 8 Bayer screen at 3 px cells wherever a film uses it (2026-10-08: "we use 3 px dither"). Never re-measure a coarser screen from a reference image. Real photos and logos are never printed through the screen.
- **Narrator**: Frederick Surrey, for every film since 2026-10-06 ("remember, we're using Frederick Surrey"). Send respellings in the request text only: Vercel (VER-sel) as "Vursell", shadcn as "shad C N".
- **Type** is the real rsms Inter (InterVariable, opsz and wght axes) through `var(--font)`, and every film credits General Translation clearly.
- **Kevin's own script** is read verbatim. To meet a length cap he sets ("cap it at 40 seconds"), cut whole lines in his order; reword only where he asks.

## 3. Pacing

- **One main motion at a time**, and about two picture events a second at most (2026-10-06: "too many visuals that are rapidly playing").
- **Holds.** A shot holds about 0.5 s once it reads, and no still lasts over about 2 s except the end card (2026-10-08: "we hang around on many shots for too long"). A sentence the viewer must read holds at least (words / 3) + 1 s after it has fully arrived; that floor protects reading, and once a piece reads, the film moves on.
- **Animations are quick**: the Slash film's moves went about 30 percent faster in v3. Lengthen the film (pauses between lines) before cramming events.
- **The grid.** Arrivals and scene changes land on the 0.5 s beat grid. Arrivals ease `expo.out` or `power3.out`, moves `power2.inOut`, processes `none`; no bounce, elastic or back overshoot. Staggers are 40 to 90 ms in reading direction.
- **Calm assemblies.** One group moves at a time with rests of 0.25 s or more, turns stay in the plane, paths stay short and never cross. When planning paths cannot make a move calm, change the idea (jihe-yuanben's twenty slivers failed four rounds; one moving pair passed, 2026-10-05).
- **Scene transitions** come from MOTION.md's four: a tone mix between dither fields, a hard cut on a beat, a hairline that draws a seam, or moving type. A whole-frame dissolve, push or slide is refused; the physical move above is for an object.
- A camera drift (scale 1.00 to 1.04 over a scene) is allowed on a plate or a dither field, never on type. `gt-motion` holds the motion rules shared with the web.

## 4. The brief

- Read `motion/MOTION.md` whole before writing a frame. Its dated sections at the top override the older sections below them ("Dithered artifact pictures (2026-10-05)", "Round 7 direction", "Round 4 direction"); a film's own SCRIPT, CONCEPT and NOTES files record later rounds for that film; section 2 above overrides both where they differ.
- The roster is MOTION.md's `## The films`, one entry per film headed `### <slug>: <title> (<length>)`, whose first paragraph is the public summary. `scripts/build/motion.mjs` parses both, so keep their form.
- Three kinds of film:
  - **Blog and brand films** (blog-fuma-nama, blog-designing-docs, the brand film, the mark sting, the release board, the showreel) follow MOTION.md's look: material palettes, two-line headings, the end card (`references/look.md`).
  - **Announcement films** (slash-announcement) follow the partner's post and Kevin's own script, in a palette measured from the partner's material (`references/look.md`).
  - **Translation series films** (jihe-yuanben, journey-to-the-west, modern-hebrew) are free of the palette and layout rules (Kevin, 2026-10-02: "you can just take whatever creative liberties you need"). Each stays bound by its `BRIEF.md` facts and hedges, section 2, public-domain or credited sources and deterministic rendering.
- The standard is a studio reel: every move explains structure (things assemble, reveal, connect or translate), timing is designed, type and lines are crafted at the pixel, and one idea holds each beat.

## 5. The pipeline

| step | output | rule |
| --- | --- | --- |
| Research package (series) | `films/<slug>/BRIEF.md` | five numbered sections; opens `# Brief: <slug>` |
| Three directors | `motion/concepts/<slug>/<lens>/` | a one-sentence story, a script, key frames, a motion test of the signature move |
| Judge | `films/<slug>/SCRIPT.md`, `CONCEPT.md` | six criteria of 10; picks one; grafts only moves in the winner's grammar |
| Kevin reads the scripts | a sent page or file | the build waits for his answer |
| Storyboard | `films/<slug>/STORYBOARD.md` | beats on the 0.5 s grid, words verbatim, picture, motion and easing, transition out |
| Takes and bed | `audio/` (or `sound/`) | one take per line through `kit/audio/el.mjs`; the bed edited to length |
| Build and check | `index.html`, `lib/` | key actions timed to the takes' word times; `check` ends with 0 errors |
| Draft, critics, fixes | `out/_draft-<slug>.mp4`, `CRITIQUE-<n>.md` | a defect table with times and fixes; each fix checked on the frames that showed it |
| Delivery and records | `out/<slug>.mp4`, poster, sheet, script, credits, NOTES.md | section 9 |

- **Directors** use three lenses chosen for the film (people, idea, viewer for the blog films; page, words, geometry for jihe-yuanben). In a from-scratch round they never open the earlier cuts.
- **When Kevin rejects a script, diagnose the story first.** His note on the series (2026-10-05): "a little too slow paced. the video isnt very interesting and the script is just kind of weird ... we love the diagrams and visuals though". The scripts were fact inventories with no hook; a story editor's diagnosis, three writers and a fact-checking editor wrote SCRIPT-v2.md.
- **When a move fails twice, change the idea** instead of tuning it again.
- Every round runs as a workflow: `references/workflows.md` has the three shapes (treatments and judge; build, critique, fix and verify; script variations and editors) and the hard rules every lane prompt carries. `references/pipeline.md` has the package format, the briefs and Kevin's direction round by round.

## 6. The project and the kit

```sh
cd motion/films
npx -y hyperframes@0.8.106 init <slug> --example blank --non-interactive
cd <slug> && ln -sfn ../../kit kit
```

- Pin the CLI at 0.8.106 in every command. Load the `hyperframes` skill before writing a composition. Load scripts, fonts and pictures through `kit/...` or the film's folder, never from a CDN: renders must not touch the network.
- Type is `var(--font)` from `kit/tokens.css`. A literal `font-family: 'Inter'` makes the compiler fetch Inter from Google Fonts; the render log must never mention Google Fonts. A film's own faces live in its `fonts/` folder under private family names.
- One paused GSAP timeline per composition, registered on `window.__timelines['<id>']`. Every frame is a function of time: no `Date.now`, `performance.now`, unseeded `Math.random` (use `GTDither.rng(seed)`), `requestAnimationFrame`, timers or `repeat: -1`. Animate transforms, opacity and colors only.
- Read the kit examples first (`films/_smoke`, `_gem`, `_endcard-fire`, `_endcard-blue`).

| path | what it is |
| --- | --- |
| `kit/tokens.css`, `kit/fonts/` | Inter `@font-face`, `--font`, colors and the deck's type ladder |
| `kit/dither.js` | `window.GTDither`: grids, tone from images, the Bayer draw, `mix` on one smoothstep, seeded `rng` |
| `kit/gemsmoke.js`, `kit/gem-shapes/` | `window.GTGem`, the seekable gem smoke shader; `make.mjs` makes glass shapes from marks |
| `kit/endcard/` | the shared end card, `addEndCard(tl, { palette, title, url, start })`; its README has every measurement |
| `kit/sheet.js` | `window.GTSheet`, the deck's series frame (the blog films dropped it on 2026-10-04) |
| `kit/audio/el.mjs`, `voice.json` | ElevenLabs narration, beds, music and transcription; the narrator's settings |
| `kit/sound/`, `kit/sound/tones/` | the canonical take recorder, ledger, click, chroma and loudness checks, the mix functions, and the Mandarin tone tools; published films keep their frozen copies |
| `kit/contact-sheet.sh`, `kit/script-export.py` | the contact sheet and the script as built (section 9) |
| `kit/review/` | the script review and narrator audition pages, filled from a JSON file |
| `kit/vendor.mjs`, `kit/picture-sources.json` | the vendored libraries and twins; the picture and font manifest |

`references/kit.md` has the gem smoke, dither and end card rules; `references/traps.md` has the composition and render traps with their fixes.

## 7. Sound

- **The key** lives in the ElevenLabs config file that `el.mjs` reads, and `el.mjs` alone reads it. Never read, print or copy that file, never pass a key on a command line or in a prompt, and log the purpose of every ElevenLabs call in the film's NOTES.md.
- **Takes.** One request per line with `--prev` and `--next`, the request text exactly the script's except respellings. Never generate below speed 1.0, and never speed up or time-stretch a take: calm comes from the gaps. One take per line unless a take is wrong. Check every take, the bed and the final with `el.mjs hear`. A non-English take needs a native listener's sign-off before release.
- **Music.** The blog films use round 5's sound-generation bed edited to length ("for the blogs i liked the peaceful music from before"). Other films compose with the Music API at the film's length; it ignores timing in a prompt, so plan an edit on the bed's bar lines. Prompts are instrumental, with no vocals, drops, risers or pastiche.
- **Mix targets**: the film at -16 LUFS integrated (lanes hold it within 0.5), true peak at or below -1 dBTP, the bed about -26 LUFS under speech and about -20 LUFS alone, fades of 0.3 to 0.8 s, no clicks, AAC in the MP4, audio as long as the video. Intelligibility outranks the bed figure; a film that leaves a target says why in NOTES.md.
- **The AAC trap.** HyperFrames 0.8.106 turns the whole AAC track down to -1.5 dBTP when its true peak passes -1 dBTP, and its limiter has no lookahead, so peak control belongs in the ffmpeg masters.
- The picture reads with the sound off. `references/sound.md` has the commands, the narrator's history, the mix recipes, model facts and the traps.

## 8. Facts

- A film states only what its post, its brief or its `BRIEF.md` states, with titles, names and dates exactly as published. Hedges stay, spoken and on screen.
- No numbers about the company (customers, revenue, funding, team) and no launch dates. Customers appear only as BRAND.md names them.
- Star counts come from the GitHub API on the day, rounded as GitHub rounds them, with the date in NOTES.md.
- A work in copyright is named on a typographic card and never shown. Every photograph or scan on screen carries its credit; a CC BY-SA source is credited on the end card and in CREDITS.txt, and whether the whole film goes out under share-alike is Kevin's call (jihe-yuanben does, 2026-10-07).
- Product tokens keep their exact form (`gt`, `gt-next`, `npx gt translate`) and never start a sentence.

## 9. Renders and records

```sh
# from motion/films/<slug>
npx -y hyperframes@0.8.106 check .
npx -y hyperframes@0.8.106 render . -o ../../out/_draft-<slug>.mp4 --quality draft --fps 30 --workers 3 --quiet
npx -y hyperframes@0.8.106 render . -o ../../out/<slug>.mp4 --quality delivery --fps 60 --workers 3
```

- The machine is shared: render with `--workers 3`, take turns through a render lock (`mkdir <scratch>/render.lock`, your slug and the render's PID in `owner`, removed the moment the render ends), and free disk first. Stop only the processes you started, by PID; never pkill, killall or a pattern, which stopped other lanes' renders on 2026-10-10.
- Render the delivery cut twice and compare; prove determinism with two lossless renders compared by `framemd5`. Keep its log and check it never mentions Google Fonts. The final is faststart; a master over 50 MB also gets a share copy.
- Before overwriting a final, copy it with its records to the next `out/v<N>/`. Never delete an earlier final or an archive.
- **Records** of every final: the poster `out/<slug>.png`; the contact sheet `out/sheets/<slug>.png` and `.webp` from `kit/contact-sheet.sh` (two frames a second, 384 px tiles, eight to a row, 3 px white gaps, the grid Kevin asked to keep on 2026-10-06); the script as built, `out/scripts/<slug>.md`, from `kit/script-export.py` with the reviewed line table and the final's own transcript (`el.mjs hear`); `CREDITS.txt` copied to `out/<slug>.credits.txt`; and a dated round entry in NOTES.md. Regenerate all of them after any re-render.

## 10. The critic

A critic watches the render frame by frame against MOTION.md's "How a film is judged", section 2, the brief, SCRIPT.md and CONCEPT.md, and reports every defect with its time and a fix (`references/critic.md`).

- Frames every 0.5 s and around every cut, selected by frame index; signature moves frame by frame; a handful at 1280 x 720 and the thin lines at 640 x 360.
- The whole-film scan (`scripts/scan.mjs`): no unplanned black frame, no single-frame flicker, the largest changes on the planned cuts.
- Sound: `el.mjs hear` against SCRIPT.md, then loudness, true peak and stream lengths (`scripts/measure-render.mjs`).
- Facts, non-Latin text (one text node with `lang` and `dir`), safe areas (120 px, 160 px for titles), reading floors, holds and the count of headings and quotes.
- Critics are separated by lane: picture, sound and story, and history and rights for a series film. Kevin's note outranks a critic's pass: a beat he called wrong stays open until he says otherwise.

## 11. Reaching the site

- `/motion` lists every roster film with its status, plays the published ones, and shows each series film's research package at `/motion/<slug>`.
- The Prototemplate session publishes a cut after Kevin approves it: the web copy in `public/media/<name>-film.mp4` (faststart) with its poster, the entry in `public/motion/published.json`, `node scripts/build/motion.mjs --pin <slug>`, then `pnpm build:motion`. A film Kevin takes off the site goes into `offSite` and stays on the roster.
- The version rule: the film on the site, its credits, its sheet and its script describe one cut, pinned by the SHA-256 of its streams. `build:motion` copies the records only from the `out/` folder whose render has the pinned streams, so keep each cut's records beside its render.
- `build:motion` reads MOTION.md, each `BRIEF.md` and `out/`, and writes `src/lib/motion.ts` and `public/motion/`. Run it where the full `motion/` folder exists: a clone without `out/` drops the display-only local paths and the in-review entries, and lists an unreleased film whose folder is only local as planned.
- After any re-render of a published film, tell the Prototemplate session and regenerate the records first.

## 12. Short media

Promos, product demo videos, README and launch GIFs, launch captures and vendor briefs are made outside `motion/` and follow `references/short-media.md`: a promo opens on the result and cuts on the beat with no narration, a demo starts inside the product, a GIF runs the real CLI, and a vendor brief uses dummy brands. Kevin directs media.

## Review checklist

- [ ] MOTION.md's dated sections, the film's own rounds and the rules of its kind (section 4) were applied, and section 2 holds: plain and humble copy, its own story with at most one quote, stakes in 6 to 8 s, 4 to 6 spoken headings, every set piece Kevin saw kept, physical transitions, 3 px dither, Frederick Surrey.
- [ ] Section 3 holds: one main motion at a time, holds about 0.5 s, no still over about 2 s except the end card, reading floors met, cuts on the grid.
- [ ] Type is `var(--font)`; the render log has no Google Fonts line; nothing loads from a CDN.
- [ ] `hyperframes check` ends with 0 errors; NOTES.md names every kept warning.
- [ ] -16 LUFS within 0.5, true peak at or below -1 dBTP, AAC, audio length equals video length, 1920 x 1080 at 60 fps; every take at speed 1.0 passed `el.mjs hear`; non-English takes have a native listener's sign-off.
- [ ] `scan.mjs` shows no unplanned black frame or flicker; thin lines read at 640 x 360.
- [ ] Every picture is credited; facts and hedges match the sources.
- [ ] The earlier final is in `out/v<N>/`; poster, sheet, script, credits and NOTES.md are written.
- [ ] Only allowlisted `motion/` paths are staged, by name, after the public scan; the Prototemplate session knows about a re-render of a published film.

## Related skills

Kevin's wiki: `hyperframes` (the entry point), `hyperframes-core`, `hyperframes-animation`, `hyperframes-keyframes`, `hyperframes-cli`, `hyperframes-audio`, `elevenlabs-sfx` (its config path). GT skills: `gt-motion`, `gt-voice`, `gt-dither`, `gt-brand`, `gt-diagrams`, `gt-graphics` (the partnership globes), `prototemplate` (the /motion page).

## Sources

Dated provenance for every rule is in `references/sources.md`: MOTION.md and its dated sections, the films' NOTES, SCRIPT, CONCEPT and CREDITS files, Kevin's notes from 2026-10-01 to 2026-10-10 and the memory notes that recorded them.
