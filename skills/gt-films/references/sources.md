# Sources

Where each rule of `gt-films` comes from, with dates. Paths are relative to `$PROTOTEMPLATE`.

## The brief and the kit

- `motion/MOTION.md`: the brief, its dated sections (Round 4, 2026-10-01; Round 7, 2026-10-02; Dithered artifact pictures, 2026-10-05; Contact sheets and scripts, 2026-10-06), the roster, the credits table, "The facts the films may state" and "How a film is judged". Its ElevenLabs account lines and local paths were removed when it was first tracked (2026-10-10).
- `motion/kit/`: `tokens.css`, `dither.js`, `gemsmoke.js`, `sheet.js`, `endcard/README.md`, `audio/el.mjs`, `audio/voice.json`, `contact-sheet.sh`, `script-export.py`, `sound/README.md`, `review/README.md`, `vendor.mjs`, `picture-sources.json`.
- HyperFrames 0.8.106 itself: the render command's quality aliases (`delivery` maps to `high`, preset slow and CRF 15) and `enforceAacTruePeak`, read in the package's `dist/` on 2026-10-05.

## The films

- `motion/films/jihe-yuanben/`: `BRIEF.md`, `SCRIPT.md`, `SCRIPT-v2.md`, `CONCEPT.md`, `NOTES.md`, `CREDITS.txt`, `assets/SOURCES-zh.md`, `assets/SOURCES-west.md`.
- `motion/films/journey-to-the-west/` and `motion/films/modern-hebrew/`: `BRIEF.md`, `SCRIPT-v2.md`, `CRITIQUE-1.md`, `NOTES.md`, `CREDITS.txt`.
- `motion/films/blog-fuma-nama/` and `motion/films/blog-designing-docs/`: `SCRIPT.md` to `SCRIPT-v3.md`, `CONCEPT.md`, `DESIGN-v4.md`, `STORYBOARD.md`, `NOTES.md`.
- `motion/films/slash-announcement/`: `BRIEF.md`, `STORYBOARD.md`, `NOTES.md` (v1 to v8), `CREDITS.txt`.
- `motion/films/gif-how-gt-works/`: `DESIGN.md`, `NOTES.md`.
- The reviewed script tables of the published cuts, `motion/films/<slug>/script.json` and `script.stt.json`, which regenerate each published script page byte for byte with `kit/script-export.py` (checked 2026-10-10).

## The site

- `scripts/build/motion.mjs`, `src/lib/motion.ts`, `public/motion/published.json` (the pins and `offSite`), `public/media/README.md`, `.gitignore` (the `motion/` allowlist, 2026-10-10).

## Kevin's notes

- 2026-10-01: the films, round 4 (material, two-line headings, logos, no captions), round 5 (music and a narrator).
- 2026-10-02: rounds 6, 7, 7b, 7c and 7d; the translation series.
- 2026-10-03: the session lanes ("the videos one should be making them").
- 2026-10-04: the series frame removed; "The triangle reassembly is a bit wacky".
- 2026-10-05: the series scripts ("a little too slow paced"); the series narrator; the dictionary pictures retired.
- 2026-10-06: Frederick Surrey for every film; the stakes early, every set piece kept, the narration's own story; 4 to 6 headings made of the spoken words; one main motion at a time; the contact sheets and scripts saved to Prototemplate.
- 2026-10-07: five script variations, "humble and not cheesy"; the seven cuts approved for the site.
- 2026-10-08: 3 px dither; the 40 s cap with whole lines cut; faster pacing with holds of about 0.5 s; Slash's own card photo, never dithered; the legal line dropped.
- 2026-10-09: a plain physical move instead of a morph; thin lines at phone size; white logos on Slash's gold; the 19.5 s Slash cut taken off the site; the standing rules and the lane rules written down for every lane.
- 2026-10-10: answer films tell a story; never stop renders by a pattern; the `motion/` allowlist (decision K3 of the system v2 plan).

## Memory notes and research

- Claude memory notes for gt-cloud: film-script-rules (Kevin's script, pacing, transition and dither rules, 2026-10-06 to 2026-10-10), gt-motion-films (the rounds, 2026-10-01 to 2026-10-10), elevenlabs-account (the narrator casting, without account details), session-lanes-prototemplate (2026-10-03).
- The Videos session's workflow scripts (2026-10-01 to 2026-10-09): the three shapes and the hard rules in `references/workflows.md`.
- The script variations round's guidance page (2026-10-07).
- Video localization research, model facts approved for public use on 2026-10-10 (measured 2026-10-06): `references/sound.md`, "Model facts".
- Short media: Kevin's messages on the open-source promo (2026-08-18 and 2026-08-19), launch captures (2026-08-10, 2026-08-12, 2026-08-14) and the vendor brief (2026-09-30); `public/media/README.md`.

## Lines moved on 2026-10-10 (system v2, lane L6)

- From `gt-motion` (absorbed; `gt-motion` keeps them for the web): the 0.5 s beat grid for films, the reading hold of (words / 3) + 1 s, the 40 to 90 ms staggers, the camera drift limit, the eases, the four scene transitions and the calm-assembly rule from jihe-yuanben. They are the skill's section 3 beside Kevin's later pacing notes.
- Out of `SKILL.md` into references, to keep it under the 24,000-byte budget: the blog films' look (`look.md`), the project, kit engines and render details (`kit.md`), the workflows and lane rules (`workflows.md`), publishing (`pipeline.md`), and this provenance.
- Retired: the round 7 rules that two thirds of a blog film's words are verbatim from the post and that a heading shares no content word with its line (replaced by Kevin's 2026-10-06 notes); Clara as the narrator (Frederick Surrey since 2026-10-06); `scripts/frames.mjs` (the critic selects frames with an ffmpeg command in `critic.md`).
