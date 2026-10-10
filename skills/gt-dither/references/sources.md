# Sources

Where every line of `SKILL.md` and the files beside it comes from. Each line added after 2026-10-08 names its memory, transcript or inventory row and its date.

## Sources of the skill as written through 2026-10-08

- Prototemplate: DESIGN.md sections 6, 7 and 11; BRAND.md sections 3, 4
  and 7; docs/ARTIFACT-PICTURES.md; docs/LIBRARIES.md;
  deck/DECK-GRAMMAR.md; deck/shots/OPENERS.md; scripts/media/mood-tone/
  (standard.json, mood-tone.mjs, mood_tone.py, README.md);
  scripts/lint/pictures.mjs; src/lib/dither.ts; src/lib/studio-field.ts;
  src/components/shared/StudioField.tsx and HeroFieldSwitcher.tsx;
  src/lib/glyph-field.ts; src/components/plate/brand/ (FieldStack.tsx,
  FieldGround.tsx, DitherBand.tsx, FieldMoodPlate.tsx, moodPictures.ts);
  src/components/plate/lib/picture-field.ts;
  src/components/plate/gallery/devStates.ts;
  src/components/plate/plate.css; src/app/craft/CraftArticle.tsx,
  TransitionDemo.tsx and libraries.ts; deck/parts/tail.html and head.html.
- gt-cloud: apps/landing/src/lib/studio-field.ts; under
  apps/landing/src/components/landing/, shared/HeroField.tsx,
  shell/engine.css, home/sections/hero-terminal.css and home/v0-pages.css;
  apps/dashboard/src/components/brand/FieldStack.tsx and
  moodPictures.test.ts; packages/ui/src/lib/glyph-field.ts and
  picture-field.ts;
  .agents/skills/glyphfield/ (SKILL.md, references/source-map.md); on
  `k/dashboard-shell-ia` (PR #4977) FieldGround.tsx, DitherBand.tsx and
  brand-tokens.css; on `k/artifact-picture-standard` (PR #5133)
  .agents/skills/artifact-pictures/SKILL.md and
  scripts/check-artifact-pictures.mjs.
- Kevin's directives: by 2026-08-06 (the rain's dither flickers, so it
  goes); 2026-09-25 (the hero's field as the app's only material; the ring
  too heavy); 2026-09-28 (glyph rain stays type); 2026-09-29 (pictures
  apply to the page; human and language objects; less distracting,
  higher-fidelity pictures at 1 px cells; transitions twice as fast);
  2026-09-30 (caption notes of two lines with no company tie-in);
  2026-10-01 (italic credits); 2026-10-05 (no plain English prose; the
  Blue Marble as the standard). Memory notes: dashboard-deck-grammar,
  signin-field-transition, artifact-picture-standard,
  prototemplate-plate-port.

## Lines added on 2026-10-10 (system v2, lane L4)

- Section 5, the licence order and the subject exclusions: Kevin's memory note `world-language-map` (the artifact research of 2026-10-03, applied by two licence checkers to 134 images through 2026-10-05) and the generator's `artifacts.lock.json` on the unpushed world map branch in gt-cloud. Inventory `labs.json` row "Rule: artifact image license order and subject exclusions" and `memories.json` row "world-language-map", plan row N-11. `docs/ARTIFACT-PICTURES.md` section 2 takes the same rule in lane L5.
- Section 1, the cell size by medium: Kevin's memory note `film-script-rules` (2026-10-08, "we use 3 px dither, currently all dithers are a lil TOO dithered") and `gt-motion-films` (the partnership globes at 6 px cells, 2026-10-01). Inventory `memories.json` row "film-script-rules" (its overlap note asks each number to be scoped to its medium) and `skills.json` row for gt-dither; plan section 2.2 ("cell size scoped").
- Sections 6 and 7 moved to `references/cutter.md`, section 4 to `references/glyphfield.md`, and the studio family table and the transition rules to `references/engines.md`, unchanged, with summaries left in `SKILL.md`, to keep the body under the 24,000-byte budget (plan section 2.2).
- Related skills: `gt-verify` replaces `agent-browser` (inventory `skills.json` row 38, plan row N-28); the isometric skill merged into `gt-diagrams` on 2026-10-10.
