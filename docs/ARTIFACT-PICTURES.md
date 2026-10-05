# Artifact pictures

An artifact picture is a photograph or scan of an object, artwork or place,
screened through the house dither. In this repository they appear in three
places:

| Surface                                   | Pictures                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| The plate port's field (`src/components/plate`) | earth, rosetta, calligraphy, tablet, gloss                                           |
| The brand deck's mood slides (`deck/`)    | earth, rosetta, tablet, calligraphy, lighthouse, devanagari, gloss, cable, wave, compass   |
| The /craft transition demo                | earth and rosetta, the deck's grids                                                        |

On the plate port, the onboarding steps show earth, rosetta, calligraphy and
tablet, the OAuth consent states show rosetta, the device flow shows
calligraphy, and the CLI wizard shows gloss (`gallery/devStates.ts`), as on
the dashboard.

Procedural fields (the sign-in globe, the ramp), marks, glyph fields, the
deck's shader openers and blog covers are not artifact pictures, and these
rules do not apply to them.

The same standard covers gt-cloud's dashboard sign-in and onboarding field
(`.agents/skills/artifact-pictures` there). `standard.json` and
`mood_tone.py` are the same files in both repositories.

## Files

| File                                          | Role                                                            |
| --------------------------------------------- | --------------------------------------------------------------- |
| `scripts/mood-tone/standard.json`             | The standard: screen, tone, file sizes, windows, retired names  |
| `scripts/mood-tone/mood_tone.py`              | The cutter (Python 3 with Pillow)                               |
| `scripts/mood-tone/mood-tone.mjs`             | The recipes for the deck and plate sets, and the wrapper        |
| `deck/shots/tone/mood-{name}.jpg`             | The deck's tone grids                                           |
| `deck/shots/tone/manifest.json`               | One entry per deck grid, written by the wrapper                 |
| `public/brand/mood/mood-{name}.jpg`           | The plate's tone grids, the same bytes as gt-cloud's            |
| `public/brand/mood/manifest.json`             | One entry per plate grid, written by the wrapper                |
| `public/craft/mood-{earth,rosetta}.jpg`       | Byte copies of the deck's earth and rosetta grids for /craft    |
| `src/components/plate/brand/moodPictures.ts`  | The plate registry: src, placement and caption per picture      |
| `deck/slides/NN-mood-{name}.html`             | The deck's mood slides, one canvas per grid, with the credit    |
| `deck/parts/tail.html`                        | The deck engine that screens the grids                          |
| `scripts/lint-pictures.mjs`                   | The lint                                                        |

## The rules

### 1. No plain English prose

A picture may not be a page of readable English: dictionary entries, book
pages, documents, signs or captions. That text reads as copy and distracts
from the form beside it.

Writing is welcome when it is the artistic or design subject of the object:
carved inscriptions (the Rosetta Stone), calligraphy, manuscripts in other
scripts or old hands (Devanagari, the gloss), signs pressed in clay (the
tablet), and the lettering engraved on a historical chart or instrument (the
cable chart, the compass rose).

Each recipe declares `writing: 'none' | 'artistic'`. The cutter's text-line
detector counts rows of six or more letter-sized marks and records the count
as `textLines`. A picture with any text lines must declare `'artistic'`. The
detector cannot read meaning, so a reviewer checks every `'artistic'`
declaration against this rule. Plain English prose never qualifies.

### 2. Sources

- Cut from the original scan or photograph. Never cut from a screened,
  two-tone or resized copy.
- The license is public domain or Creative Commons.
- The credit is shown with the picture: on the deck slide's plate, and in the
  picture's caption in `moodPictures.ts`, which the plate port's field shows.
- Sources are never committed. Each person keeps a sources directory and
  passes it to the wrapper. `scripts/mood-tone/README.md` lists each file's
  name, origin, pixel size and sha256, and the wrapper refuses a source whose
  sha256 differs from `SOURCES` in `mood-tone.mjs`.

### 3. The tone grid is the Blue Marble's

The Blue Marble on the onboarding field is the reference. Its numbers are in
`standard.json` under `tone`.

Fixed for every picture:

- no blur;
- gamma 1.2;
- autocontrast that clips 0.5 percent at each tail, over the frame, or over
  the subject mask for a masked object;
- an 8-bit gray JPEG at quality 82, or 75 when 82 is over the cap.

Chosen per picture, in the recipe:

- the crop;
- the channel: `red` (the earth's) or `gray`;
- the polarity: `invert` so the subject is lit on a black ground;
- the kind: `scene` or `marks`.

Solved per picture by the cutter, never set by hand: the black and white
points.

- A **scene** lands on the Blue Marble's mean tone 0.361 and standard
  deviation 0.342, over the region of the grid that is shown.
- **Marks** (writing, engraving, lines on a plain ground) put the ground at
  black with an Otsu threshold and the 90th percentile of the marks at white.

The solver returns levels 80 and 230 for the plate's earth, which is the
earth's own recipe.

Sizes: a cover is 1600 by 900, one grid cell per CSS px at a 1440 by 900
view. A disc is 2400 by 1350. The cap is 560 KB (573440 bytes).

### 4. The screen is the Blue Marble's

`standard.json` under `screen`:

- an ordered 8x8 Bayer matrix with threshold `(m + 0.5) / 64`;
- cells of 1 CSS px, screened live at display size. Never ship a pre-screened
  bitmap that is then scaled;
- tone floor 10: bytes at or under 10 read as 0;
- the loop runs at gamma 1 and bias 0, because the whole curve is in the grid;
- dark theme: white cells at opacity 0.62 over the #070707 ground. Light
  theme: #070707 cells at opacity 0.7 over white.

Where each surface states these:

| Surface    | Cell                                   | Tone floor                              | Bayer and threshold                    | Ink and opacity                                                                 |
| ---------- | -------------------------------------- | --------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| Plate port | `PICTURE_SCALE` in `FieldStack.tsx`    | `TONE_FLOOR` in `lib/picture-field.ts`  | `BAYER_8` in `lib/dither.ts`           | `--tc-picture-ink`, `--field-picture-opacity` in `plate.css`                    |
| Deck       | `MOOD_CELL_PX` in `deck/parts/tail.html` | `MOOD_TONE_FLOOR` in `tail.html`      | `bayer8` in `tail.html`                | `--mood-ink`, `--mood-opacity` in `deck/parts/head.html`                        |
| /craft     | `CELL` in `TransitionDemo.tsx`         | `TONE_FLOOR` in `TransitionDemo.tsx`    | `BAYER_8` in `src/lib/dither.ts`       | `--ptc-picture-ink`, `--ptc-picture-opacity` in `craft.css`, the dark values, because the plate is dark in both themes |

The deck engine sizes each mood canvas's backing store to its box on screen
(`getBoundingClientRect`, because the stage is CSS-scaled), so a cell is 1
CSS px on the sheet, in a thumbnail, in the book view and on the full-stage
backdrop. It reads the grid at cover fit, centred, and draws again on slide
activation, resize and a theme flip.

### 5. The windows

The cutter measures each grid over the region shown (the deck's full 1600 by
900 sheet; on the plate, the part right of the ramp at 1440 by 900; only the
disc or the masked subject where there is one) and records the stats in the
manifest. The lint holds them to `standard.json` under `windows`:

| Kind  | Mean         | Std          | At white (250 and up) | At the floor (10 and under) |
| ----- | ------------ | ------------ | --------------------- | --------------------------- |
| scene | 0.30 to 0.42 | 0.28 to 0.44 | at least 2%           | at least 5%                 |
| marks | at most 0.35 | any          | at least 0.5%         | at least 50% (the ground)   |

## The cutter

From the repository root:

```sh
pnpm mood-tone <sources dir> [--set deck|plate] [--preview <dir>] [--check]
```

The wrapper sends the recipes and the standard to `mood_tone.py`, which
writes `mood-{name}.jpg` for each recipe (the deck set to `deck/shots/tone`,
the plate set to `public/brand/mood`) and prints one manifest entry per
picture. The wrapper writes those entries to `manifest.json` and prints each
picture's levels and stats. With `--preview`, the cutter also saves the 1 px
screen of each grid at the view size as `preview-{name}.png`.

The cutter is deterministic. A run on the same sources writes the same bytes,
so a grid's `sha256` in the manifest proves it came from its recipe.
`--check` cuts into a temporary folder and fails unless every grid and the
manifest equal the committed files byte for byte. Never edit a grid or a
manifest by hand.

A recipe holds only: `name`, `source`, the size and cap from `standard.json`,
`crop`, `channel`, `invert`, `kind`, `writing` and `placement`. It holds no
tone numbers. The crop kinds are documented above `DECK` in `mood-tone.mjs`.

## Adding a picture

1. Choose the object against rule 1. Find the original scan or photograph and
   confirm its license (rule 2).
2. Put the source file in your sources directory, add its origin and sha256
   to `SOURCES` in `mood-tone.mjs`, and add its row to the source table in
   `scripts/mood-tone/README.md`.
3. Add a recipe to `DECK` or `PLATE` in `mood-tone.mjs`. Spread `COVER` for a
   cover. Set `kind: 'marks'` for writing or engraving on a plain ground and
   `kind: 'scene'` for anything else. Declare `writing`. A deck recipe's
   placement is a cover at focus 0.5, 0.5.
4. Run the wrapper with `--preview` and look at `preview-{name}.png`.
5. If the subject is not where it should be, or the stats miss the window,
   change the crop, the channel, the polarity, the kind or the placement and
   run it again. If no crop puts a scene in its window, the picture does not
   meet the standard. Do not add tone settings to make it pass.
6. Show it.
   - On the deck: add `deck/slides/NN-mood-{name}.html` from an existing mood
     slide, with `<canvas class="mood-img" data-tone="shots/tone/mood-{name}.jpg" role="img" aria-label="...">`,
     the plate's title, sentence and credit, then update `SLIDE_COUNT` in
     `scripts/build-deck.mjs`, `SECTIONS` in `deck/parts/tail.html`,
     `DECK_SLIDES` in `src/lib/search-index.ts`, and the entry in
     `deck/shots/OPENERS.md`. Run `pnpm build:deck`.
   - On the plate port: add the name to `PictureName` and an entry to
     `MOOD_PICTURES` in `moodPictures.ts`: `src` is
     `/brand/mood/mood-{name}.jpg`, `placement` equals the recipe's (a disc
     also carries the manifest's `disc` values `cx`, `cy` and `r`), and the
     caption has a title, a note of at most 90 characters that says what the
     object is, and the credit. Make the same change in gt-cloud.
7. Run `node scripts/lint-pictures.mjs` (it also runs before `next build` and
   in `pnpm lint:all`).
8. Commit the grid, `manifest.json`, the recipe, the README row and the slide
   or registry entry. If the manifest shows `textLines` above 0, say so in
   the commit so the reviewer checks rule 1.

To remove a picture, delete its recipe, its grid and its slide or registry
entry, run the wrapper so the manifest drops it, and move its pages to
another picture.

## The lint

`scripts/lint-pictures.mjs` runs before `next build` (`pnpm build`), in
`pnpm lint:all`, and on its own with `pnpm lint:pictures`. Its tests are in
`scripts/lint-pictures.test.mjs`; run them with `pnpm test:pictures`. It
fails when:

- a grid file has no manifest entry, or an entry has no grid file;
- a grid's sha256 or byte count differs from its entry;
- a grid is not an 8-bit gray JPEG of its entry's size;
- the plate registry's names, `src` or `placement` differ from its manifest;
- a deck mood slide does not name a manifest picture on a canvas, a manifest
  picture has no slide, a slide shows a bitmap, a pre-screened `mood-*` file
  sits in `deck/shots`, or `public/brand-deck.html` inlines grids other than
  the manifest's (run `pnpm build:deck`);
- the /craft grids are not byte copies of the deck's, or its disc differs
  from the deck earth's fitted disc;
- an entry's blur, gamma, autocontrast cutoff or quality is off the standard;
- a grid's size is off its placement's size, or its bytes are over the cap;
- an entry's region stats are outside its kind's window;
- `writing` is not `'none'` or `'artistic'`;
- `textLines` is above 0 and `writing` is not `'artistic'`;
- a retired name appears in a manifest, a grid file name, the registry, a
  `mood-{name}` token under `deck/`, `src/` or the built deck, or a string
  literal in the picture code;
- the screen constants differ from the standard on any of the three
  surfaces: the 1 CSS px cell, the loop at gamma 1 and bias 0, tone floor
  10, the Bayer matrix and threshold, and the picture ink and opacity per
  theme.

## Changing the standard

`standard.json` is the same file in gt-cloud and Prototemplate. A change to
it is made in both repositories in the same round, and every grid in both is
cut again with the new standard.

## Retired pictures

These names never return as picture names, files or registry keys. They are
listed in `standard.json` under `writing.retired`, and the lint rejects them.

| Name          | What it was                             | Why it was retired                                    |
| ------------- | --------------------------------------- | ----------------------------------------------------- |
| `dictionary`  | A page of the Oxford English Dictionary | Plain English prose reads as copy, not as an artifact |
| `johnson`     | A page of Johnson's Dictionary          | Plain English prose reads as copy, not as an artifact |
| `oed-volumes` | The Oxford English Dictionary volumes   | The spines are plain English titles                   |

Retiring the first two deleted the deck's Design system and Documentation
mood slides on 2026-10-05; the deck went from 95 to 93 slides.
