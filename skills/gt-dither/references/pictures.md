# Artifact pictures: the roster, the surfaces and the lint

Detail for sections 5 to 10 of the gt-dither skill. Paths are relative to a
Prototemplate checkout unless they start with `$GT_CLOUD`. The rules
themselves are in `docs/ARTIFACT-PICTURES.md`; this file lists what holds
them on 2026-10-05.

## The roster

### The deck's mood slides (`deck/shots/tone`, cut with `--set deck`)

Every deck grid is a 1600 by 900 cover at focus 0.5, 0.5, measured over the
whole sheet, or only over the disc (`earth`) or the masked subject
(`tablet`).

| slide | name | kind | writing | credit on the plate |
| --- | --- | --- | --- | --- |
| 06 | `earth` | scene, red | none | Image: NASA, Reto Stöckli, 2007, public domain |
| 10 | `rosetta` | scene, gray | artistic | Photograph: Hans Hillewaert, CC BY-SA 4.0 |
| 14 | `tablet` | scene, gray, subject crop | artistic | Photograph: The Metropolitan Museum of Art, Open Access, public domain |
| 32 | `calligraphy` | marks, inverted | artistic | Calligraphy: Ahmed Karahisari, 16th century, public domain |
| 46 | `lighthouse` | scene, red | none | Photograph: Ken Heaton, CC BY-SA 4.0 |
| 59 | `devanagari` | marks, inverted | artistic | Photograph: Ms Sarah Welch, CC BY-SA 4.0 |
| 64 | `gloss` | marks, inverted | artistic | Image: MS f Med. 23, Boston Public Library, public domain |
| 68 | `cable` | marks, inverted | artistic | Map: Eastern Telegraph Company, 1901, public domain |
| 80 | `wave` | scene, red, inverted | artistic | Print: Katsushika Hokusai, about 1831, public domain |
| 91 | `compass` | marks, red, inverted | artistic | Engraving: Emanuel Bowen, 1748, public domain |

### The plate port's field (`public/brand/mood`, cut with `--set plate`)

These are gt-cloud's dashboard recipes, and the grids are the same bytes as
`$GT_CLOUD/apps/dashboard/public/brand/mood` (on PR #5133's branch). Each
is measured at the 1440 by 900 view over the part right of the ramp, which
runs from x 806.4 to 1072, and only over the disc (`earth`) or the masked
subject (`tablet`).

| name | placement | kind | plate title |
| --- | --- | --- | --- |
| `earth` | disc, 2400 by 1350, fitted `cx`, `cy`, `r` | scene, red | The Blue Marble |
| `rosetta` | cover, focus 0, 0.5 | scene, gray | The Rosetta Stone |
| `calligraphy` | cover, focus 0.6, 0.5 | marks, inverted | Karahisari's Calligraphy |
| `tablet` | cover, focus 0.5, 0.5, subject crop at 1.25 of the height | scene, gray | Proto-Cuneiform Tablet |
| `gloss` | cover, focus 1, 0.5 | marks, inverted | A Marginal Gloss |

The pages (`src/components/plate/gallery/devStates.ts`, as on the
dashboard once PR #5133 merges): the onboarding survey shows earth, create
organization rosetta, payment calligraphy and GitHub tablet; the OAuth
consent states show rosetta, the device flow calligraphy, and the CLI
wizard gloss.

### The transition demo on /docs (`src/app/craft/TransitionDemo.tsx`)

`public/craft/mood-earth.jpg` and `public/craft/mood-rosetta.jpg` are byte
copies of the deck's grids. `DISC` equals the deck earth's fitted disc
(`cx` 420.1, `cy` 450.1, `r` 409.4). The plate is dark in both themes, so
it carries the dark screen values. The figcaption in `CraftArticle.tsx`
carries each deck credit without its label.

## The screen constants on each surface

| surface | cell | tone floor | Bayer and threshold | ink and opacity |
| --- | --- | --- | --- | --- |
| plate port | `PICTURE_SCALE` in `src/components/plate/brand/FieldStack.tsx` | `TONE_FLOOR` in `src/components/plate/lib/picture-field.ts` | `BAYER_8` in `src/components/plate/lib/dither.ts` and `src/lib/dither.ts` | `--tc-picture-ink`, `--field-picture-opacity` in `src/components/plate/plate.css` |
| deck | `MOOD_CELL_PX` in `deck/parts/tail.html` | `MOOD_TONE_FLOOR` in `tail.html` | `bayer8` (`B4`, `Q`) in `tail.html` | `--mood-ink`, `--mood-opacity` in `deck/parts/head.html` |
| /docs demo | `CELL` in `TransitionDemo.tsx` | `TONE_FLOOR` in `TransitionDemo.tsx` | `BAYER_8` in `src/lib/dither.ts` | `PICTURE_OPACITY` in `TransitionDemo.tsx`; `--ptc-picture-ink`, `--ptc-picture-opacity` in `src/app/craft/craft.css`, dark values |
| gt-cloud dashboard | `PICTURE_SCALE` in `apps/dashboard/src/components/brand/FieldStack.tsx` | `TONE_FLOOR` in `packages/ui/src/lib/picture-field.ts` | `packages/ui/src/lib/dither.ts` | `--tc-picture-ink`, `--field-picture-opacity` in `apps/dashboard/src/app/brand-tokens.css` |

Each ink and opacity token is set only in its own rules, and every
declaration there carries the standard's value:

- `plate.css`: `.brand-field-stack` (light) and
  `:root[data-theme='dark'] .brand-field-stack` (dark);
- the deck's sources and the built deck: `:root` (light) and
  `:root[data-theme="dark"]` (dark);
- `craft.css`: `.ptc-plate.is-transition` (dark);
- gt-cloud `brand-tokens.css`: `.brand-field-stack` and
  `.dark .brand-field-stack`, including any later rule or one inside a
  media query.

The loop that screens a picture runs at gamma 1 and bias 0
(`LOOP_OPTIONS` in the plate's `FieldStack.tsx` and in
`TransitionDemo.tsx`), because the whole curve is in the grid. The lint
also reads the cutter's `BAYER_8` and its threshold in
`scripts/mood-tone/mood_tone.py`, and the deck's `--paper` ground (white
in light, `#070707` in dark) in `deck/parts/head.html` and the built deck.

## Recipes

A recipe holds `name`, `source`, `width`, `height`, `cap`, `crop`,
`channel`, `invert`, `kind`, `writing` and `placement`.

| crop kind | fields | what it does |
| --- | --- | --- |
| `box` | `onLongSide`, `box` | left, top, right, bottom in the source scaled to `onLongSide` px on its long side |
| `disc` | `centre`, `radius`, `limbOver` | finds the lit disc on its black ground (any channel over `limbOver`) and puts its centre and radius on the grid; the radius comes from the top and bottom limbs because the right limb is the night side |
| `subject` | `centreX`, `centreY`, `fillHeight`, `mask` | finds the object on a light studio ground (`mask.bright`, `mask.saturation`, `mask.feather`), fits its height to `fillHeight` of the grid at `centreX`, `centreY`, and darkens the ground to black |

- A box past the source edge pads with black, and with paper for an
  inverted picture, so the padding is unlit after the inversion.
- The views: the deck is the 1600 by 900 sheet with no ramp; the plate is
  1440 by 900 with the ramp from x 806.4 to 1072, and the earth's disc is
  1.7 times the height across with its left limb five sevenths of the way
  along the ramp.
- `textLines` counts rows of six or more letter-sized marks on the grid
  resized to 800 wide, lit marks and dark marks both. It cannot read
  meaning, so a reviewer checks every `'artistic'` declaration against
  rule 1.
- A manifest entry records `name`, `file`, `sha256`, `width`, `height`,
  `bytes`, `quality`, `source`, `sourceBox`, `crop`, `channel`, `invert`,
  `kind`, `placement`, `writing`, `levels`, `house`, `region` (mean, std,
  white share, floor share, lit share) and `textLines`, and `disc` for a
  disc.

## Showing a new picture

### On the deck

The full slide markup and placement rules are in the gt-deck skill
(`references/full-picture-slides.md`).

- Copy an existing mood slide to `deck/slides/NN-mood-{name}.html` with
  `<canvas class="mood-img" data-tone="shots/tone/mood-{name}.jpg" role="img" aria-label="...">`.
- The plate sits lower right: the picture's title at 44px, one or two
  sentences on why the picture is in the deck, and `<div class="credit">`.
- Place it after a dense slide, at least one content slide away from the
  next section opener (`deck/shots/OPENERS.md`).
- Update `SLIDE_COUNT` in `deck/assemble.mjs` (93 on 2026-10-05),
  `SECTIONS` in `deck/parts/tail.html`, `DECK_SLIDES` in
  `src/lib/search-index.ts` and the entry in `deck/shots/OPENERS.md`, then
  run `pnpm build:deck`.

### On the plate, in both repositories

- Add the name to `PictureName` and an entry to `MOOD_PICTURES` in
  `src/components/plate/brand/moodPictures.ts` and in
  `$GT_CLOUD/apps/dashboard/src/components/brand/moodPictures.ts`.
- `src` is `/brand/mood/mood-{name}.jpg`. `placement` equals the recipe's;
  a disc also carries the manifest's `disc` values.
- The caption has a title in title case (Kevin's example: "Proto-Cuneiform
  Tablet"), a note and the credit in italic. The note is one factual
  sentence ending in a full stop, at most `NOTE_MAX_CHARS` (90) characters.
  Kevin asked for two lines at most (2026-09-30), when the note column was
  312px at 13px. In today's 272px card (`FieldMoodPlate.tsx`) the column is
  208px at 11px, about 32 characters a line by the comment on
  `NOTE_MAX_CHARS`, so a note near the cap runs to three lines; the
  registry's docblock still says two. gt-cloud's `moodPictures.test.ts`
  refuses any note containing "General Translation", "the company", "the
  design system", "the docs", "software", "brand section", an em dash or an
  exclamation mark.
- In gt-cloud a page points at a picture with `picture='{name}'` on
  `AuthShell` or `<FieldPicture name='{name}' />` in an onboarding step.

## Everything the lint fails on

Prototemplate's `scripts/lint-pictures.mjs`, for each of the two manifests
(`deck/shots/tone`, `public/brand/mood`):

- the manifest is missing or is not `{ view, pictures }`;
- a grid file has no entry, or an entry has no grid file, or a name
  appears twice, or the file is not `mood-{name}.jpg`;
- a grid's sha256 or byte count differs from its entry;
- a grid is not an 8-bit, one-component JPEG of its entry's size;
- blur, gamma, autocontrast cutoff or quality is off the standard;
- the size is off its placement's size, or the bytes are over the cap;
- the kind is not `scene` or `marks`, or the channel not `red` or `gray`;
- the region stats are outside the kind's window;
- `writing` is not `'none'` or `'artistic'`, or `textLines` is above 0
  without `'artistic'`;
- a disc has no fitted `disc`.

Across the surfaces:

- the plate registry's names, `src` or `placement` differ from its
  manifest;
- a deck mood slide names no manifest picture on a canvas, a manifest
  picture has no slide, a slide shows a bitmap, a pre-screened `mood-*`
  file sits in `deck/shots`, a deck placement is not a centred cover, or
  the deck view is not the 1600 by 900 sheet;
- `public/brand-deck.html` inlines grids other than the manifest's (run
  `pnpm build:deck`);
- a mood slide's plate has no `<div class="credit">`, or the text around
  the transition demo does not carry the credit of each picture it shows;
- the demo's grids are not byte copies of the deck's, a stray `mood-*` file
  sits in `public/craft`, or `DISC` differs from the deck earth's disc;
- the view's disc differs from `DISC_DIAMETER_RATIO` and
  `DISC_LIMB_RAMP_SHARE` in the plate's `FieldStack.tsx`;
- a screen constant is off the standard on any surface or in the built
  deck, is declared more than once, or is reassigned;
- an ink or opacity token is set outside its own rules or to a value off
  the standard;
- a retired name appears as a picture name, a file name, a registry key, a
  `mood-{name}` token under `deck/`, `src/` or the built deck, or a string
  literal in the picture code;
- `standard.json`'s sha256 differs from `STANDARD_SHA256`.

gt-cloud's `scripts/check-artifact-pictures.mjs` (PR #5133) checks one
manifest and the registry with the same rules, and also fails when scene
1's `makeLoop` call in `FieldStack.tsx` passes a scale other than
`PICTURE_SCALE` or a gamma or bias of its own.

The lint reads constants by declaration with comments stripped, and every
constant must be declared once and never reassigned. It does not follow
how code uses a constant, so a draw call that halves the cell passes. Only
a look catches that: compare the page with `preview-{name}.png` at 1 px.

## Changing the standard

- `standard.json` and `mood_tone.py` are byte-identical in Prototemplate
  (`scripts/mood-tone/`) and gt-cloud (`apps/dashboard/scripts/mood-tone/`
  on PR #5133's branch; gt-cloud main still has the older cutter and no
  `standard.json`).
- A change edits both files in both repositories in one round, updates
  `STANDARD_SHA256` in `scripts/lint-pictures.mjs` and in
  `scripts/check-artifact-pictures.mjs` in the same commits, and recuts
  every grid in both. Each lint fails until its pin matches.
- The pin on 2026-10-05 is
  `2cffdb2ce624b5075a02e07fb8d2011039480f2b24d901afe8aa1e0fc896668e` in
  both.

## Retired names

These never return as picture names, files, registry keys, `mood-{name}`
tokens or string literals in picture code. They are in `standard.json`
under `writing.retired`.

| name | what it was | why |
| --- | --- | --- |
| `dictionary` | a page of the Oxford English Dictionary | plain English prose |
| `johnson` | a page of Johnson's Dictionary | plain English prose |
| `oed-volumes` | the Oxford English Dictionary volumes | plain English titles on the spines |
| `oxford` | any page or volume of the Oxford English Dictionary | plain English prose |
| `oed` | the dictionary by its initials | plain English prose |

Retiring them deleted the deck's Design system and Documentation mood
slides on 2026-10-05, and the deck went from 95 to 93 slides. gt-cloud main
still ships `dictionary` and `johnson` until PR #5133 merges and removes
them.
