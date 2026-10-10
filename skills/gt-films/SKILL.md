---
name: gt-films
description: >-
  How General Translation films are made in Prototemplate's motion/ folder with
  HyperFrames: the brief, the research package, three directors and a judge for
  the script and the look, the storyboard, the kit, narration and music through
  ElevenLabs, the mix targets, draft and delivery renders, the frame-by-frame
  critic, and how a finished film reaches /motion; and the short media around
  a launch: promos, product demo videos, README GIFs, launch captures and
  briefs for the video vendor. Use when planning, scripting, building,
  critiquing or rendering a GT film, trailer, sting, showreel, promo or demo
  GIF, or when reviewing one against Kevin's standard.
metadata:
  title: Making a film
  areas: videos, motion
  updated: 2026-10-06
  origin: prototemplate
---

# Making a film
General Translation (GT) makes its brand films, blog trailers and translation-history films as HyperFrames compositions: HTML pages with one paused GSAP timeline that the HyperFrames CLI seeks and renders frame by frame to MP4. They are built in `$PROTOTEMPLATE/motion/`, one project per film, from one shared kit and one brief, `motion/MOTION.md`. A new film goes through the same steps: three directors' treatments, a judge who writes the script and the concept, a storyboard on the 0.5 s grid, the build, narration and music, a draft, critic passes and a delivery render. This skill states each step, the rules it answers to, and the checks a film passes before it reaches /motion.

Paths are relative to a Prototemplate checkout (`$PROTOTEMPLATE`) unless they name another one, and paths that start with `films/`, `kit/` or `out/` sit inside `motion/`. `references/` is this skill's folder of detail files. Its helpers need only Node and ffmpeg and run as `node <this skill's folder>/scripts/<name>.mjs` (`skills/gt-films/scripts/` in a Prototemplate checkout). `motion/` is untracked and exists only in the checkout of the session that makes the films; the public repository holds the published copies under `public/media/`, the generated `/motion` data and this skill. Where `motion/` is missing, the kit, the brief and the film sources are missing too: review against this skill, and ask Kevin for the Videos session before building a film.

## 1. Ownership

- One session owns `motion/`: Kevin calls it the Videos session. Kevin, 2026-10-03: "the videos one should be making them, and this one is just for prototemplate work". Any other session reads `motion/`, sends film requests to the Videos session by name, and runs no film lane itself (Kevin, 2026-10-02: "wait another agent is working on the motion and videos").
- `motion/` stays untracked and `motion/out/` is in `.gitignore`. Never run `git add -A` or `git add .` in the shared checkout. On 2026-10-01 a broad add in another session pushed 229 files (72.6 MiB) of `motion/` to main in b56e64c, and commit 8c8d6fb had to untrack them again. Stage paths by name.
- Renders stay in `motion/out/`. The committed outputs are the web copies in `public/media/` and the files `pnpm build:motion` writes, and the Prototemplate session commits them.
- The kit (`motion/kit/`) is read only for a film lane. A kit change goes through the Videos session, because every film loads it.
- Explorations stay local until Kevin reviews them on localhost or in a sent file. Publishing a film to main is Kevin's call.

## 2. The brief

- Read `motion/MOTION.md` whole before writing a frame. Its dated sections at the top override the older sections below them: "Dithered artifact pictures (2026-10-05)", "Round 7 direction", "Round 4 direction". A film's own `SCRIPT.md`, `CONCEPT.md` and `NOTES.md` record later rounds (7b, 7d, 8) and override MOTION.md for that film.
- The canon MOTION.md applies is `BRAND.md` (the name, the idea, the voice, the mark, color, type, language as material, the avoid list), `DESIGN.md` (the four colors, the line law, the doubled line, the isometric family, the 1-bit Bayer language, moving type, motion discipline) and the deck (`deck/`, rendered as `deck/preview/sNN-dark.jpg`; open slides 1, 3, 6, 9, 14, 17 to 23, 26, 30, 34, 37, 54 and 64 before designing).
- The roster is the `## The films` section of MOTION.md, one entry per film headed `### <slug>: <title> (<length>)`. `scripts/build/motion.mjs` parses that heading, so keep its form.
- Two kinds of film follow different rules:
  - **Blog and brand films** (blog-fuma-nama, blog-designing-docs, the brand film, the mark sting, the release board, the showreel) follow every rule in MOTION.md and its round directions.
  - **Translation series films** (jihe-yuanben, journey-to-the-west, modern-hebrew) are free of the round 4 and round 7 palette and layout rules. Kevin, 2026-10-02: "you can just take whatever creative liberties you need to make the most awesome motion designed video that also tells this story". Their directors choose the material, the faces, the structure, the captions and the sound. Each stays bound by its `BRIEF.md` facts and hedges, Kevin's writing rules, public-domain or credited sources, deterministic rendering and the studio standard.
- The standard is a studio reel. Every move explains structure (things assemble, reveal, connect or translate), timing is designed on a beat grid, type and lines are crafted at the pixel, and one idea holds each beat.

## 3. The pipeline

| step | output | rule |
| --- | --- | --- |
| Research package (series films) | `films/<slug>/BRIEF.md` | five numbered sections: an animation script table, the long-form post, a vocabulary table, sources with rights, a fact-check list in three groups |
| Three directors | `motion/concepts/<slug>/<lens>/` | each writes a one-sentence story, a script, key frames and a motion test of the signature move |
| Judge | `films/<slug>/SCRIPT.md`, `CONCEPT.md` | scores the three on six criteria of 10, picks one, grafts only moves that use the winner's grammar |
| Kevin reads the scripts | a sent page or file | the build waits for his answer |
| Storyboard | `films/<slug>/STORYBOARD.md` | beats on the 0.5 s grid, words verbatim, picture, motion and easing, transition out |
| Takes and bed | `films/<slug>/audio/` (`sound/` in journey-to-the-west and modern-hebrew) | one take per line through `kit/audio/el.mjs`, the bed edited to the film's length |
| Build | `index.html`, `lib/` | key actions timed to the takes' word timings |
| Check | `npx -y hyperframes@0.8.106 check .` | ends with 0 errors; every kept warning is intentional and named in NOTES.md |
| Draft | `motion/out/_draft-<slug>.mp4` | 30 fps, draft quality |
| Critics | `CRITIQUE-<n>.md` or NOTES.md | a defect table with times and fixes; picture, sound and story, and history and rights for a series film |
| Revise and verify | a new draft | each fix checked on the frames that showed the defect |
| Delivery | `motion/out/<slug>.mp4` | 60 fps, delivery quality, the earlier final copied to `motion/out/v<N>/` first |
| Finish | poster, contact sheet, credits, NOTES.md | see section 10 |

- **Directors.** Each round uses three lenses chosen for the film: the blog films' round 7 used people, idea and viewer; jihe-yuanben used page, words and geometry; journey-to-the-west used names, editions and woodblock; modern-hebrew used dictionary, roots and documents. In a from-scratch round the directors never open the earlier cuts (Kevin, 2026-10-02: "the new scripts and visuals and stuff have to be done from scratch ... it needs to be coherent and tell a clear simple story taking excerpts from the blogs").
- **Scripts.** A blog film tells one simple story, at least two thirds of its spoken words verbatim excerpts from the post (the Fuma Nama film is 0.80). Every excerpt matches the post's MDX by exact string, curly quotes included, and the post's hedges stay. A heading never shares a content word with the line spoken under it.
- **The judge's table.** Story, facts, writing, picture, sound and build, each out of 10, so out of 60 (jihe-yuanben: The page 52, The geometry 45, The words 44). The judge reads every key frame at full size and at 1280 x 720, the contact sheets and the motion tests read frame by frame with ffmpeg, then writes the decision, the lines with their source sentences, the heading sources, pronunciation and an audit into SCRIPT.md, and the look, the type and every beat into CONCEPT.md.
- **When Kevin rejects a script, diagnose the story first.** His note on the three series films (2026-10-05): "a little too slow paced. the video isnt very interesting and the script is just kind of weird ... we love the diagrams and visuals though". The scripts were fact inventories with no hook. The rewrite ran a story editor's diagnosis, three writers on different angles (reveal, problem, word), and an editor who fact-checked and wrote `SCRIPT-v2.md` with a list of the visual changes, at 60 to 75 s and about 140 to 190 words.
- **When a move fails twice, change the idea.** Kevin called jihe-yuanben's triangle reassembly "a bit wacky" (2026-10-04). Rounds 3 to 6 retuned the paths of twenty thin pieces, and every critic still saw a scatter, because twenty pieces cannot travel calmly in about 4 s. Round 7 changed the idea: one pair moves and the rest of the strip prints in place. Round 8 refined that idea and passed.

`references/pipeline.md` has the package format, the director and judge briefs, the storyboard format and the workflow lessons.

## 4. The project

```sh
cd motion/films
npx -y hyperframes@0.8.106 init <slug> --example blank --non-interactive
cd <slug> && ln -sfn ../../kit kit
```

- Pin the CLI at 0.8.106 in every command (`check`, `snapshot`, `render`, `preview`). The wiki's `hyperframes` skill suggests upgrading a pinned project; the films keep 0.8.106 until the Videos session moves every film together.
- Load every script, stylesheet, font and picture through `kit/...` or the film's own folder. Never load from a CDN: renders must not touch the network.
- Type is `var(--font)` from `kit/tokens.css`. A literal `font-family: 'Inter'` anywhere in a composition makes the compiler fetch Inter from Google Fonts and override the kit's InterVariable ("[Compiler] Fetched 11 font face(s) for "Inter" from Google Fonts"); the static cut is about 5 percent wider and line masks clip. A film's own faces (JetBrains Mono for a code panel, a CJK serif, a Hebrew face with niqqud) live in its `fonts/` folder under private family names. Fallback families for glyph text are set from JavaScript, because the compiler reads family names from `<style>` text and fetches any it cannot find.
- One paused GSAP timeline per composition, built synchronously and registered on `window.__timelines['<composition-id>']` (initialise `window.__timelines` first). The root carries `data-composition-id`, `data-start="0"`, `data-width`, `data-height` and `data-duration`.
- Every frame is a function of time. No `Date.now`, `performance.now`, unseeded `Math.random` (use `GTDither.rng(seed)`), `requestAnimationFrame`, timers or `repeat: -1`. Canvas drawing happens in the timeline's or a tween's `onUpdate` from tween-driven proxies. A picture a canvas reads is also a hidden `<img>` in the DOM, so the renderer waits for it.
- Animate transforms, opacity and colors only. A transformed element is block level and sized. Never pair a CSS `transform` with a GSAP tween on the same element; set the start inside `fromTo`.
- A short film may be one `index.html` (`composition_file_too_large` and `timeline_track_too_dense` are then kept warnings). A long film splits scenes into sub-compositions (journey-to-the-west builds eight with `tools/compose.py`).
- Read the working examples before building: `films/_smoke/` (a dither field mixing two pictures, Inter type, the bar monogram), `films/_gem/` (gem smoke, a glass shape, a dithered field) and `films/_endcard-fire/` and `_endcard-blue/`.
- A film folder holds `index.html`, `lib/`, `audio/` (or `sound/`), `assets/`, `fonts/`, `archive/` (earlier compositions and storyboards), `SCRIPT.md`, `CONCEPT.md`, `STORYBOARD.md`, `NOTES.md` and, for a published film, `CREDITS.txt`. `init` also writes `hyperframes.json`, `meta.json`, `package.json` and its own `AGENTS.md` and `CLAUDE.md`. Each film builds its sound with its own scripts, and its NOTES.md names them: Fuma Nama's `lib/` holds `cues.mjs`, `make-voice.mjs`, `make-bed.mjs` and `make-mix.mjs`; the docs film keeps its drawing in `lib/film.js` and its sound in `audio/make-bed.py` and `audio/mix.py`; the series films use Python tools under `tools/` and `sound/`.
- `references/traps.md` lists the composition and render traps the films met, each with its fix.

## 5. The kit

| path | what it is |
| --- | --- |
| `kit/tokens.css` | the Inter `@font-face` on `kit/fonts/InterVariable.woff2`, `--font`, the colors and the deck ladder at 1920 (`.t-display` 106, `.t-h1` 88, `.t-h2` 53, `.t-lead` 31, `.t-body` 26, `.t-cap` 18) |
| `kit/dither.js` | `window.GTDither`: `grid(canvas, cell)`, `toneFromImage(img, grid, { fit, focusX, focusY, gamma, invert, blur, lift, region })`, `draw(grid, field, { ink, paper })`, `mix(a, b, p)` on one smoothstep, `fields.ramp`, `fields.disc`, `fields.horizon`, `rng(seed)` |
| `kit/gemsmoke.js` | `window.GTGem` (ES module, fires `gtgem-ready`): `mount(host, { palette, params, image, width, height, pixelRatio, offset, rate })` resolves to `{ at(t), set(params), dither(grid, { tones, gain, gamma, amount }), canvas, mount }` |
| `kit/endcard/` | the shared series end card, `addEndCard(tl, { palette, title: [line1, line2], url, start })` |
| `kit/sheet.js` | `window.GTSheet`, the deck's series frame (rails 67 px in, registration crosses). The blog films dropped it on 2026-10-04 |
| `kit/marks/`, `kit/brand/gt-mark.svg` | the speed marks (bar monogram, lockup, dithered, ASCII, plate inverted, double cut, livery stack, two-way, globe G) and the doubled-line GT mark |
| `kit/logos/`, `kit/logos/adopters/` | Fumadocs, MDX, Next.js, React, TanStack and Mintlify marks; the thesvg marks and GitHub avatars of Fumadocs' adopters |
| `kit/gem-shapes/` | processed shape PNGs for gem smoke glass (`gt-bar-monogram`, `gt-mark`, `fumadocs-moon`); add a row to `make.mjs` and run it for a new one |
| `kit/sources/`, `kit/two-tone/`, `kit/tone/`, `kit/blog/` | full-resolution picture sources, the deck's dithered mood and opener files, the sign-in plate's tone grids, every image the blog posts ship |
| `kit/lottie/` | the Ramp demo's translated `.lottie` files in en, de, es, ja and zh with a manifest |
| `kit/gsap.min.js` and plugins, `kit/lottie.min.js`, `kit/fflate.min.js`, `kit/paper-shaders/` | GSAP 3.15 with DrawSVG, MorphSVG, SplitText, Flip, MotionPath and CustomEase; lottie-web 5.13; Paper Shaders 0.0.78 (Apache-2.0) |
| `kit/audio/el.mjs`, `kit/audio/voice.json` | ElevenLabs narration, beds, music and transcription; the narrator's settings |
| `kit/_retired/` | the dictionary pictures, retired 2026-10-05. Never use them |

- **Gem smoke.** Draw a frame with `gem.at(seconds)` inside the timeline's `onUpdate`. Change uniforms per frame with `mount.setUniformValues` (cached and synchronous); `gem.set()` loads its image asynchronously, so never call it per frame. Keep at most two full-frame mounts live at once. Use `pixelRatio: 0.5` for a mount that is only read or dithered. An outer glow lays a faint smoke wash over the whole frame (plain above about 0.2, and visible in a dithered field's black cells at any value), so keep it at 0 under a field. Clip glass 1 px outside its limb when hard dither cells sit beside it.
- **Dither.** One cell size per film (2 or 3 px at 1920 x 1080), anchored at (0, 0), never resized inside a transition. A dithered field changes state only by mixing tone on one grid with one smoothstep, so cells switch in Bayer order. Alpha fades, wipes and moving masks are refused on dithered fields. Pictures of writing that carry readable plain text are retired (Kevin, 2026-10-05: "never distract with text on the artifacts. this disqualifies the dictionary and oxford"). `gt-dither` owns the Blue Marble tone standard for dithered artifact pictures.
- **End card.** The card is 4.0 s from a hard cut on the beat: the doubled-line GT mark in the film's gem smoke, the post's title in two lines at 120 px (it shrinks to no less than 100 px for a long line), and the link at 40 px, every margin 160 px. Set the root's `data-duration` to `start + 4`, end the film's clips at `start`, add the card after the film's own tweens and register the timeline after it. The card is silent; the bed resolves under it. `frame` defaults to `false`. `hyperframes check` reports two `text_occluded` infos at `start + 0.33`, which are expected. The card's last frame is the blog films' poster. `kit/endcard/README.md` has every measurement.

## 6. Look

These rules bind the blog and brand films. The series films choose their own look inside section 2's limits.

- **Material palettes.** A film's palette is its gem smoke material and the Bayer dither in that material's tones (Kevin, 2026-10-01: "the color we can use is the color and dither and shaders we used (gem smoke from glyphfield)"):
  - blue: ground `#2f5ce0`, smoke `#ffffff` and `#86a8ff` (Designing docs for humans);
  - fire: ground `#000000`, smoke `#fe5b16`, `#f7ff61` and `#ffffff`, with ember `#7a2a08` in prints (Fuma Nama);
  - ink `#070707` stays the ground between material scenes.
- **Refused** in every blog film: gradients other than the material, CSS glows and shadows, blur filters, glass UI chrome, rounded corners, any color from outside the film's material.
- **Dither in the background.** Kevin, 2026-10-02: "im sad to see the dither disappear from background". Since round 7d both blog films print their free gem smoke through the Bayer screen as a field behind every scene. The field is kept clear of the type and the objects by zones drawn from their own ink, and it changes only by tone mix (Fuma Nama holds it 44 px off a heading's ink and 18 px off an object's).
- **Headings.** At most two lines, set at 100 to 150 px (the line length decides), Inter 500 through `var(--font)`, sentence case, proper nouns capitalised, no trailing period. Seat each line's first glyph ink on x 160 from the loaded face's side bearing. Fuma Nama's cap tops sit at y 172; the docs film sets its heading box at top 146. A sentence that cannot fit two lines at 100 px is replaced by the post's own shorter wording.
- **No captions and no subheaders** in the blog films (Kevin, 2026-10-01: "no need for captions/subheaders"): no bylines, dates, quote attributions, labels, tags, counters or URLs. One heading or one quote per beat, plus the picture. The one URL a film shows is the post's link on the end card (round 7).
- **Logos** appear where they say more than words and where the post supports them. A logo keeps its drawing and proportions; a one-color mark is recolored only to the film's ink, paper or material tones. Fuma Nama's adopters beat shows true marks with GitHub star counts; it uses Turborepo's mark for "Vercel Turborepo" so one repository's stars are never credited to a whole organization.
- **No series frame** on the blog films. Kevin, 2026-10-04: "remove the frame that seems to be overlaid on top of everything, its overlapping with a lot of stuff and is not the cleanest."
- **Safe areas.** No text closer than 120 px to an edge at 1920 x 1080, and 160 px for titles and the heading axis.
- **Credits.** Every photograph or scan on screen carries its credit, from MOTION.md's credits table or the film's `CREDITS.txt`. The blog films show no photographs or scans, so they print no credit line; their third-party logos follow the Logos rule below.
- **Motion.** Arrivals on `expo.out` or `power3.out`, moves on `power2.inOut`, processes on `none`, no overshoot. Arrivals and scene changes land on the 0.5 s grid. A sentence holds at least (words / 3) + 1 s after it has fully arrived. Transitions come from MOTION.md's four: a tone mix between dither fields, a hard cut on a beat, a hairline that draws a seam, or moving type. `gt-motion` carries the full motion rules.

## 7. Sound

Every film carries a narrator and a music bed, both through `kit/audio/el.mjs` (`references/sound.md` has the commands, the mix recipe and the traps).

- **The key** lives in the ElevenLabs config file that `el.mjs` reads (`~/.config/elevenlabs-sfx/config.yml`). Never print it, copy it, pass it on a command line or put it in a prompt. Which account the key belongs to has changed more than once; test the Music API with a short request before composing a new bed.
- **The narrator** is whatever `kit/audio/voice.json` names: Clara since 2026-10-02 (eleven_multilingual_v2, stability 0.65, style 0.2, speed 1.0). Kevin chose her after "make the voice more australian and make the voice less shaky", "a much more friendly australian voice", "like 2 but more female" and "lets use clara". Never generate below speed 1.0: the slowed takes measured the most pitch wobble. Calm comes from the gaps between lines.
- Kevin asked on 2026-10-05 whether the series films need another narrator ("why are we using clara? what are some better voices?"). Auditions are in `kit/audio/auditions/series/in-context/`. A series narrator gets its own voice file or `--voice` per take, so the blog films keep Clara.
- **Takes.** One request per line with `--prev` and `--next`, the request text exactly the script's. Respell a name in the request text only (line 7 of Fuma Nama sent "Ver-sell" for Vercel) and keep the script's spelling everywhere else. One take per line unless a take is wrong. Check every take, the bed and the final with `el.mjs hear`. A non-English take (Mandarin, Hebrew) needs a native listener's sign-off before release.
- **Music.** The blog films use round 5's peaceful sound-generation bed, edited to each film's length (Kevin: "for the blogs i liked the peaceful music from before"). Other films compose with the Music API at the film's exact length. Prompts are instrumental with no vocals, drops, risers or genre clichés: fire is warm, dark and slow; blue is airy, glassy and precise; the series films avoid pastiche (jihe-yuanben's bed has no guqin, pentatonic figures or gong). The Music API ignores timing in a prompt, so plan an edit.
- **Mix targets** (MOTION.md): narrator about -16 LUFS integrated for the film, bed about -26 LUFS under speech and about -20 LUFS alone, true peak under -1 dBTP, fades of 0.3 to 0.8 s, no clicks, AAC in the MP4, audio as long as the video. The five delivered films read -16.0 to -16.5 LUFS with true peaks of -2.0 to -3.0 dBTP.
- **Intelligibility outranks the bed figure.** The docs film's bed sits almost all in 160 to 800 Hz, and at -26 LUFS under speech it covered Clara's vowels, so it plays at about -28.5 LUFS under speech with a dip shaped by her voice. A film that leaves a target says why in NOTES.md, with the measurement.
- **The renderer's AAC trap.** HyperFrames 0.8.106 turns the whole AAC track down to -1.5 dBTP whenever its true peak passes -1 dBTP (`enforceAacTruePeak`), and its limiter has no lookahead. Control peaks in the ffmpeg masters before the mix: Fuma Nama limits each narration master to -3.6 dBTP at 192 kHz, and the docs film to a -3.5 dBFS ceiling at 4x oversampling. A film measuring about -1.5 dBTP, or quieter than the sum of its stems, has been corrected.
- The picture reads with the sound off. No beat depends on audio alone.

## 8. Facts

- A film states only what its post (`$PROTOTEMPLATE/content/blog/<post>.mdx`, or the MDX in gt-cloud `apps/landing/content/blog/en-US/`) or its `BRIEF.md` states. Titles, names and dates appear exactly as published.
- Hedges stay. Fuma's "I think" and "probably" are spoken. The contested items in a BRIEF's fact-check list stay hedged on screen and in the narration (jihe-yuanben dates the book as translated in 1606 and 1607 and printed in 1607). Captions follow the BRIEF's image notes ("early 17th-century printing", "Qing edition").
- No numbers about the company (customers, revenue, funding, team) and no launch dates. Customers appear only as BRAND.md names them.
- Star counts are read from the GitHub API on the day and rounded as GitHub rounds them (one decimal under 100,000, whole thousands above). NOTES.md records the date.
- A work in copyright is named on a typographic card and never shown (Waley's *Monkey*, 1942). A CC BY-SA source is credited on the end card and in the credits file; whether the film as a whole is published under share-alike is Kevin's decision.
- Copy follows MOTION.md and `gt-voice`: plain declarative English, no marketing adjectives, no exclamation marks, no rhetorical questions, no em dashes, no "X, not Y" pairs, no metaphors, no eyebrows. Product tokens keep their exact form (`gt`, `gt-next`, `npx gt translate`) and never start a sentence.

## 9. The critic

A critic watches the render frame by frame against MOTION.md's "How a film is judged", the BRIEF, SCRIPT.md, CONCEPT.md and the writing rules, and reports every defect with its time and a fix. `references/critic.md` has the full procedure and the report format.

- **Frames.** Every 0.5 s at full size, and every 0.25 s for 1 s either side of each cut and each major move (`skills/gt-films/scripts/frames.mjs`, which selects by frame index). Read signature moves frame by frame. Read a handful at 1280 x 720 for legibility.
- **Whole-film scan.** Every frame decoded small in grey: no blank or black frame that the storyboard does not plan, no single-frame flicker, and the largest changes on the planned cuts (`skills/gt-films/scripts/scan.mjs --cuts ...`).
- **Sound.** `el.mjs hear` on the render against SCRIPT.md, `skills/gt-films/scripts/measure-render.mjs` for loudness, peak and stream lengths, silence at the head and tail.
- **Facts and scripts.** Every line, heading, tag, gloss and credit against its source. Each non-Latin sentence is one text node with `lang` and `dir`, because per-character spans break Arabic joining and Devanagari matras.
- **Safe area and reading floors.** Measured on frames.
- **The report.** A table of `# | time (s) | defect | fix`, then "Left as they are" with a reason for each, then what was fixed and how each fix was checked on a new draft.
- Separate critics by lane: picture, sound and story, and history and rights for a series film. A failed critic sends the film to revision, then verification, then a second verification if fixes were needed.
- Kevin's note outranks a critic's pass. A beat he called wrong stays open until he says otherwise.

## 10. Renders

```sh
# from motion/films/<slug>
npx -y hyperframes@0.8.106 check .
npx -y hyperframes@0.8.106 render . -o ../../out/_draft-<slug>.mp4 --quality draft --fps 30 --workers 3 --quiet
npx -y hyperframes@0.8.106 render . -o ../../out/<slug>.mp4 --quality delivery --fps 60 --workers 3
npx -y hyperframes@0.8.106 snapshot . --at <seconds> --no-end --describe false
```

- Drafts render at 30 fps and draft quality. The final renders at 60 fps and delivery quality at 1920 x 1080. In 0.8.106 `delivery` is an alias of `high` (x264, preset slow, CRF 15); the wiki's `hyperframes-cli` skill writes `--quality high` for the same preset.
- `--workers 3` on the shared machine, where several films and other lanes render at once. Record the machine's load in NOTES.md when a render or a timing check runs slow.
- Before overwriting a final, copy it to the next `motion/out/v<N>/` folder (today v1 to v5, v7, v7d and v8; there is no v6). Earlier finals are never deleted.
- Render the delivery cut without `--quiet`, save its log (`| tee`), and check that the log never mentions Google Fonts (`skills/gt-films/scripts/measure-render.mjs <film.mp4> --log <file>`).
- Prove determinism before a final: two lossless renders (`--crf 0`) with different worker counts compared by `framemd5` must match on every frame. When large type rasterises differently between render processes on the hardware GPU, render with `--no-browser-gpu` (modern-hebrew does).
- Deliverables: `out/<slug>.mp4`; `out/<slug>.png`, the poster (the blog films use the settled end card, snapshotted on the hardware GPU path, since `--no-browser-gpu` moves the smoke by up to 5 levels); `out/_sheets/<slug>.png`, a contact sheet of one frame per second in six columns of 480 px tiles with the time under each (`films/journey-to-the-west/tools/sheet.py`); `films/<slug>/NOTES.md` with the deliverables, measurements, ElevenLabs ledger and traps; and for a published film `out/<slug>.credits.txt` and `films/<slug>/CREDITS.txt`.
- A share copy for a large master: `ffmpeg -i <slug>.mp4 -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -c:a copy -movflags +faststart <slug>-share.mp4` (jihe-yuanben went from 153 MB to 39 MB).

## 11. Reaching the site

- `/motion` lists every roster film with its length and status, plays the published films, and shows each series film's research package at `/motion/<slug>`. `/brand` shows the blog films under "Made with the system".
- The Prototemplate session publishes a film only after Kevin approves the cut: it copies the final (or the share copy) to `public/media/<name>-film.mp4` with the moov atom at the front (`ffmpeg -i <in> -c copy -movflags +faststart <out>` when the streams stay unchanged), writes `public/media/<name>-poster.jpg` at 1920 x 1080, lists both in `public/media/README.md`, adds the film's `film` and `poster` paths to `public/motion/published.json` (a new film) and pins the cut with `node scripts/build/motion.mjs --pin <slug>`, then runs `pnpm build:motion`.
- The version rule: the film on the site, its credits, its contact sheet and its script describe one cut. `public/motion/published.json` pins each published cut by the SHA-256 of its video and audio streams (a faststart remux hashes the same as its render), its label and its length. `pnpm build:motion` copies `<slug>.credits.txt`, `sheets/<slug>.webp` (and the `.png` up to 20 MB) and `scripts/<slug>.md` to `public/motion` only from the folder in `motion/out` whose render has the pinned streams (`out/` itself, or an archive folder with the kit's `sheets/` or `scripts/`, such as `out/series-100s`), and checks the script's label and length against the pin. A newer render in `out/` is listed on the site as "in review" by its label and length only. So keep each cut's records beside its render: when a final is replaced, move the old render with its credits, sheet and script into an archive folder with the same layout.
- `pnpm build:motion` also reads `motion/MOTION.md` and each `films/<slug>/BRIEF.md` and writes `src/lib/motion.ts` and `public/motion/<slug>.md`. A film's status comes from the files: rendered when its final or web copy exists, in production when its folder exists, planned otherwise. The script throws before writing anything when a BRIEF's shape or a script's shape changes or a web copy is not its pinned cut, and refuses quoted hex colors in `motion.ts` and absolute local paths anywhere. Its outputs are committed, so the site builds without `motion/`.
- After any re-render of a published film, the Videos session tells the Prototemplate session, which refreshes the public copy and poster and reruns `pnpm build:motion`. The Videos session regenerates the credits files first when a picture changed.

## 12. Short media

Promos, product demo videos, README and launch GIFs, launch captures and vendor briefs are made outside `motion/` and follow [references/short-media.md](references/short-media.md).

- A promo opens on the finished result and cuts quickly between different scenes on the beat of the music, with no narration, in under about 30 s. When Kevin dislikes a new cut, the previous cut comes back exactly (2026-08-19).
- A product demo starts inside the product, sets the value proposition large and centered, and holds its last frame about 1.5 s longer.
- A README or launch GIF runs the real CLI with fresh results and ships with its render script. A launch capture records the real shipped pages from CDP screencast frames (2026-08-14).
- A brief for the video vendor is pasteable, names the priority deliverable, cites prototemplate.com/deck for the brand rules and uses dummy brands until a customer's permission is confirmed (2026-09-30).
- Kevin directs media. Finished pieces go onto `/brand` or `/motion` in the same round.

## Review checklist

- [ ] MOTION.md's dated directions and the film's later rounds were applied; the series rules or the blog rules were used as the film's kind requires.
- [ ] The script is one clear story; a blog film's spoken words are at least two thirds verbatim from the post and match it by exact string; hedges are kept.
- [ ] Headings are at most two lines at 100 to 150 px, seated on x 160, and share no content word with the spoken line under them.
- [ ] No caption, byline, date, label, counter or URL in a blog film except the end card's link; no series frame.
- [ ] Type is `var(--font)` and the render log has no Google Fonts line; nothing loads from a CDN.
- [ ] Every arrival and cut is on the 0.5 s grid; every sentence holds (words / 3) + 1 s; transitions are from MOTION.md's four.
- [ ] Dithered fields change only by tone mix on one grid; at most two full-frame gem mounts are live.
- [ ] No text inside 120 px of an edge (160 px for titles); every picture is credited.
- [ ] Narration is the voice.json narrator (or the film's own voice file) at speed 1.0, every take passed `el.mjs hear`, and non-English takes are flagged for a native listener.
- [ ] `measure-render.mjs` passes: -17 to -15 LUFS, true peak under -1 dBTP, AAC, audio length equals video length, 1920 x 1080 at 60 fps.
- [ ] `scan.mjs` shows no unplanned black frame, no single-frame flicker and the largest changes on the planned cuts.
- [ ] `hyperframes check` ends with 0 errors and NOTES.md names every kept warning.
- [ ] The earlier final is in `out/v<N>/`; poster, contact sheet, NOTES.md and credits are written.
- [ ] Nothing under `motion/` is staged, and the Prototemplate session was told about a re-render of a published film.
- [ ] Short media: a promo cuts on the beat with no narration; a demo starts inside the product; a GIF runs the real CLI and ships its script; captures show the real shipped pages; a vendor brief uses dummy brands (`references/short-media.md`).

## Related skills

Wiki skills this one depends on: `hyperframes` (the entry point), `hyperframes-core` (the composition contract; read `references/variables-and-media.md` for `<audio>` clips), `hyperframes-animation` (motion rules and the Lottie adapter), `hyperframes-keyframes` (seek-safe moves), `hyperframes-cli` (check, snapshot, render), `hyperframes-audio` (the mix, `<hf-audio-group>` and `carve.mjs`), `elevenlabs-sfx` (the config path `el.mjs` shares). GT skills beside it: `gt-motion` (the motion rules for pages and films), `gt-voice` (the writing rules and replies to the vendor), `gt-dither` (the Bayer material and the artifact picture standard), `gt-brand` (the marks and the palettes), `gt-diagrams` (the doubled-line connector, and the docs film's isometric bridge in `references/isometric.md`), `gt-graphics` (still artwork such as the partnership globes), `prototemplate` (the /motion page).

## Sources

- Prototemplate: `motion/MOTION.md` (the brief, round directions dated 2026-10-01 to 2026-10-05); `motion/kit/endcard/README.md`; `motion/kit/audio/el.mjs`; `motion/kit/audio/voice.json`; `motion/kit/tokens.css`; `motion/kit/dither.js`; `motion/kit/gemsmoke.js`.
- Prototemplate films: `motion/films/jihe-yuanben/BRIEF.md`, `SCRIPT.md`, `CONCEPT.md`, `NOTES.md`, `CREDITS.txt`; `motion/films/blog-fuma-nama/SCRIPT.md`, `CONCEPT.md`, `STORYBOARD.md`, `NOTES.md`; `motion/films/blog-designing-docs/NOTES.md`, `STORYBOARD.md`; `motion/films/journey-to-the-west/CRITIQUE-1.md`, `NOTES.md`; `motion/films/modern-hebrew/NOTES.md`.
- HyperFrames 0.8.106 itself: the render command's quality aliases (`delivery` maps to `high`, preset slow and CRF 15) and `enforceAacTruePeak`, read in the package's `dist/` on 2026-10-05.
- Prototemplate site: `scripts/build/motion.mjs`, `src/lib/motion.ts`, `public/media/README.md`, `.gitignore`.
- Kevin's wiki: `skills/engineering/hyperframes/SKILL.md`, `skills/engineering/hyperframes-core/SKILL.md`, `skills/engineering/hyperframes-cli/SKILL.md`, `skills/.runtime/all/hyperframes-audio/SKILL.md`, `skills/misc/elevenlabs-sfx/SKILL.md`.
- Claude memory notes: gt-motion-films (seven rounds of Kevin's direction, 2026-10-01 to 2026-10-05), elevenlabs-account (narrator casting and the key's handling), session-lanes-prototemplate (Kevin, 2026-10-03).
- Short media: Kevin's messages on the open-source promo (2026-08-18 and 2026-08-19), launch captures (2026-08-10, 2026-08-12, 2026-08-14) and the vendor brief (2026-09-30); `public/media/README.md`.
- Kevin's directives: 2026-10-01 (the films, round 4, the sound pass), 2026-10-02 (rounds 6, 7, 7b, 7c and 7d; the series films), 2026-10-03 (session lanes), 2026-10-04 (the frame, the reassembly), 2026-10-05 (the series scripts, the series narrator, the dictionary pictures).
