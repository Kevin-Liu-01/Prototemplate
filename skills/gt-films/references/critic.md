# The critic

This file is the detail behind section 9 of `../SKILL.md`: what a critic checks, in what order, with which tools, and how the report is written. It follows `motion/films/journey-to-the-west/CRITIQUE-1.md`, the model report, and MOTION.md's "How a film is judged". Paths are relative to `$PROTOTEMPLATE`.

## What the critic judges against

- **The rules** of MOTION.md and the film's later rounds: color and material, type, copy, texture, line, marks, motion, frame and credits.
- **The facts:** every title, name, date and sentence against its source (the post, or BRIEF.md sections 2 to 5 for a series film), with every hedge kept.
- **The craft:** timing, holds, easing, choreography, typographic quality and legibility at 1280 x 720.
- **The technical:** no blank or black frame, no flicker, no jitter, no clipped text, nothing past the safe area, no dropped frame at a scene join.
- **The plan:** SCRIPT.md, CONCEPT.md and STORYBOARD.md, and Kevin's writing rules.

## Procedure

1. **Frames.** Extract every 0.5 s at full size and every 0.25 s for 1 s either side of each cut and each major move:
   ```sh
   node skills/gt-films/scripts/frames.mjs motion/out/_draft-<slug>.mp4 <scratch>/frames --every 0.5 --around 8.0,11.5,21.0
   node skills/gt-films/scripts/frames.mjs motion/out/_draft-<slug>.mp4 <scratch>/720 --every 0 --at 10.5,20,29 --scale 1280
   ```
   Read them in 3 x 3 sheets. Read every signature move frame by frame at full size (`--at` with each frame's time). Read a handful at 1280 x 720 for legibility. Select frames by index, as the script does: `ffmpeg -ss` returned the wrong frame on these renders.
2. **Whole-film scan.**
   ```sh
   node skills/gt-films/scripts/scan.mjs motion/out/_draft-<slug>.mp4 --cuts <every cut time from STORYBOARD.md>
   ```
   It reports the darkest frame and near-black runs (each must be planned, such as a film that opens from black), single-frame flicker (a frame that differs from both neighbours while they match), and the largest frame-to-frame changes, which must be the planned cuts on their planned frames.
3. **Sound.**
   - `node motion/kit/audio/el.mjs hear <render>` and compare the words with SCRIPT.md in order. Explain each difference (the recogniser's tense, an added article, added punctuation, an accent) or report it. Check that the bed carries no voice tag.
   - `node skills/gt-films/scripts/measure-render.mjs <render> [--draft]` for the loudness, the true peak and the stream lengths.
   - Note the silence at the head and the tail and what it is (the first breath, the bed's closing fade).
4. **Facts.** Compare every narration line, title card, tag, rendering, gloss and credit with its source. List each hedge and confirm it is on screen or spoken as the source has it.
5. **Scripts.** Every non-Latin sentence is one text node with `lang` and `dir`. Registered strings match the print character for character, and a glyph variant in the print is named. Tone marks and diacritics compose at full size and at 1280 x 720.
6. **Safe area.** Measure the nearest type to each edge: at least 160 px on the heading side and 120 px elsewhere. Note credits' lowest line.
7. **Reading floors.** For each sentence, the time from its full arrival to the next change, against (words / 3) + 1 s.
8. **Determinism**, when the build changed: two lossless renders (`--crf 0`, one with `--workers 3` and one with `--workers 2`) compared by `framemd5`, which must match on every frame. Compare builds rendered back to back in one sitting. A critic on a busy machine may leave this to the final lane and say so.

## The report (`films/<slug>/CRITIQUE-<n>.md`, or a section of NOTES.md)

```markdown
# <slug>: critique, pass <n>

The critic watched `motion/out/_draft-<slug>.mp4` as rendered on <date> at <time> (<quality>, <fps>, <frames>, <audio>). The film was judged against ...

## How the draft was checked
- **Frames.** ...
- **Whole-film scan.** ...
- **Sound.** ...
- **Loudness.** ...
- **Facts.** ...
- **Safe area.** ...

## Defects
| # | time (s) | defect | fix |
| --- | --- | --- | --- |

## Left as they are
1. **<item> (<time>).** <why it stays: designed so, a rule allows it, Kevin decides it, or a retake would change nothing>

## What was fixed
| # | fixed | how it was checked |
| --- | --- | --- |
```

- A defect says what is seen, when, and which rule, plan or source it breaks, with its measurement ("a 1.2 s hold against a reading floor of 2.33 s").
- A fix is concrete: a time, a value or a method, and it keeps every cue time unless it says which one moves.
- Critics give a verdict (pass or fail) and grade each defect blocker, major or minor. A fail goes to revision, then verification of each fix on the frames that showed it, then a second verification when that pass needed fixes.
- After fixing, re-render the draft and read the same frames again. List what was not re-run and why.

## Defects the films have had

- A title or a list held for less than its reading floor.
- Two clocks out of step (a counter and the columns it counts).
- Registered type landing over the print it repeats, so the strokes read twice; fixed with a paper knockout inside the registration box that enters and leaves with the type.
- A morph whose in-between frames thinned a stroke to a needle; fixed by playing the clean opening move backwards.
- An incoming element passing under an outgoing one, a gloss crossing a glyph, two paths crossing.
- Twenty pieces flying at once read as debris; fixed by changing the idea.
- Field cells inside a heading's clearance, a cleared zone with ruled edges and chamfered corners, a halo outside a glass shape's limb, lone dither specks.
- A bed that pumped in the gaps between lines, clicks from a stepped gain curve, a name stressed on the wrong syllable, the loudness 0.5 dB off target.
- A frame overlay (rails and crosses) that crowded the picture. Kevin found this one himself.
