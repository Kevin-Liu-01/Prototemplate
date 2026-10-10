---
name: gt-dither
description: >-
  General Translation's 1-bit material and its artifact pictures: the 4x4
  and 8x8 Bayer screens, coverage tiers that nest, the CPU engine
  (dither.ts) and the GPU studio field with its BAYER_PRESETS, the landing
  hero's bayer-8x8 field as the one material on product surfaces, Glyphfield
  as the authoring source for new shaders, and the Blue Marble standard for
  dithered photographs and scans with its cutter (pnpm mood-tone), its lint
  and its retired pictures. Use when adding a dithered field, picture, cover
  or texture to any GT surface, when choosing or tuning a studio preset, or
  when cutting, replacing, crediting or reviewing a mood picture in
  Prototemplate or gt-cloud.
metadata:
  title: Dither and artifact pictures
  areas: graphics, aesthetic
  updated: 2026-10-10
  origin: prototemplate
  owner: P
---

# Dither and artifact pictures

General Translation (GT) builds the full stack for localization: i18n
libraries, context-aware translation APIs, a CDN that serves translations
and Locadex, its AI agent (BRAND.md sections 1 and 9). Its product monorepo
is gt-cloud
(github.com/generaltranslation/gt-cloud): `apps/landing` serves
generaltranslation.com and `apps/dashboard` holds the sign-in and
onboarding pages, a form plate on the left over a dithered field on the
right. Prototemplate (github.com/Kevin-Liu-01/Prototemplate) is Kevin Liu's
hub for GT design work: the brand deck, the docs, and the plate port, a copy
of the dashboard's sign-in and onboarding gallery under
`src/components/plate`, served at `/d/production/{signin,onboarding,consent,device,cli}`.

GT draws texture with one device: an ordered Bayer dither that prints whole
square cells in one ink. The same screen runs the procedural fields on the
landing, the dashboard and Prototemplate, and the artifact pictures, which
are photographs and scans of objects screened at 1 CSS px cells to the Blue
Marble standard. This skill holds the rules, the engines, the commands and
the review standard for both.

Paths are relative to a Prototemplate checkout (`$PROTOTEMPLATE`) unless
they start with `$GT_CLOUD`, a gt-cloud checkout. Engine detail is in
[references/engines.md](references/engines.md); the picture roster, the
per-surface constants and the full lint list are in
[references/pictures.md](references/pictures.md).

## 1. The language

- A tone ramp is drawn as ordered dither. Density never comes from an
  alpha veil (DESIGN.md section 7), and texture is only ordered dither
  (BRAND.md section 3).
- Error diffusion (Floyd-Steinberg) is out. Its output is serial, it reads
  as noise, and it shimmers when animated. A Bayer matrix is a fixed
  threshold map, so every cell is decided alone and the repeating cell
  structure reads as print halftone (`src/lib/dither.ts`, module header).
- The house screens:

  | screen | values | where |
  | --- | --- | --- |
  | 4x4 | rows `0 8 2 10`, `12 4 14 6`, `3 11 1 9`, `15 7 13 5` | `bayer4` in `src/lib/studio-field.ts`, preset 01 and most of the family |
  | 8x8 | `BAYER_8`, built by M(2n) = [[4M, 4M+2], [4M+3, 4M+1]] | `src/lib/dither.ts`, the cutter, the deck engine, presets 02, 10 and `bayerSphere` |
  | 2x2 | four thresholds | preset 07 bayer-chunk only |

- The 8x8 matrix is an exact permutation of 0 to 63. A constant tone k/64
  lights exactly k cells in every tile, so the screen has 65 tonally linear
  levels. A cell is lit when its tone is over `(m + 0.5) / 64`.
- Coverage tiers nest by construction. A tier lights the cells whose
  threshold is under its tone, so every tier's lit cells are a subset of
  the next tier's. Regions filled with different tiers compose an exact
  ramp, and an opaque glint ink drawn over a lower tier never brightens a
  doubled cell (`DitheredMark`, DESIGN.md section 6; see gt-diagrams
  `references/isometric.md`).
- Cells are square screen pixels.
  - Canvas engines write one buffer pixel per cell and CSS upscales the
    buffer with `image-rendering: pixelated` (`applyStyles` in
    `ditherToCanvas`). The CPU engine never renders at devicePixelRatio: a
    retina cell is subpixel and the screen collapses into flat gray.
  - SVG dithers carry `shape-rendering: crispEdges`.
  - A transform that would foreshorten the cells (an iso plane seat) goes
    inside the alpha mask, so the cells stay square. A rotated window is a
    pre-rotated clip path swept by pure horizontal translate, because
    GSAP's transform origin makes `rotate()` windows fragile (DESIGN.md
    section 6).
- Scale is the design control. `scale` is the CSS px width of one cell,
  and eight times it is the grain the eye reads. The artifact pictures use
  1 for fidelity, and the sign-in globe and the deck's ramp use 2. At 3
  and 4 the screen reads as halftone, and 3 is the default for a
  full-bleed procedural field. At 8 or more it reads as pixel art.
  Each number belongs to its medium: the 1 CSS px of the artifact
  pictures holds on the web; films use 3 px cells everywhere (Kevin,
  2026-10-08: "currently all dithers are a lil TOO dithered"), and a film
  never re-measures a coarser screen from a reference image; the
  partnership globe stills use 6 px cells so they read at a small size
  (`gt-graphics`).
- A dissolve multiplies the field's tone (`rampField` in
  `src/components/plate/brand/FieldStack.tsx`), so the dither drops whole
  cells across the ramp. A fading CSS mask over a picture prints its cells
  at partial alpha, so picture layers take a hard cut at the plate's edge
  and do their dissolve in the field.
- Alpha on a dither layer is limited to its fixed opacity (0.62 and 0.7
  for pictures, 0.55 for the hero's field) and to the measured masks that
  quiet a procedural field behind a plate (section 3). A picture layer
  never fades by mask.
- One grid per transition (`TRANSITION_RULES` in
  `src/app/craft/libraries.ts`): both states at the same cells and one cell
  size, the Bayer tile keeping its phase, the tone and the ink mixed on one
  smoothstep, and reduced motion drawing the end state once. Alpha fades,
  wipes, moving masks and entrance animation are refused; a resolve takes
  350 ms and a step 150 ms (Kevin, 2026-09-29: "make the dither transitions
  2x faster"). The full list is in
  [references/engines.md](references/engines.md) ("One grid per transition").
- On a dithered cover or deck opener, the dither shades one large
  hard-edged form at sheet scale on a quiet ground, with the plate area
  solid ink or paper. Round ten replaced two openers whose dither was the
  subject: a 7.3x blow-up that read as a checker and a band of mid-tone
  with no edge (`deck/shots/OPENERS.md`).

## 2. The engines

| engine | file | use it for |
| --- | --- | --- |
| CPU dither | `src/lib/dither.ts` | any scalar field `fn(u, v, t)` to 0..1 through the 8x8 screen: field factories (`radialBurst`, `globe`, `streakBands`, `gradientRamp`, `makeGlyphField`), combinators (`multiplyFields`, `maxFields`, `mixFields`, `mapField`), pictures, transitions, the deck ramp (`redrawDithers`) |
| GPU studio field | `src/lib/studio-field.ts` | the Bayer family of animated materials: `createStudioField(canvas, { preset, dpr, speed, params })`, `BAYER_PRESETS`, `BAYER_DEFAULT_ID = '02'` |
| React wrapper | `src/components/shared/StudioField.tsx` | a canvas that mounts one studio field and destroys it on unmount |
| picture sampler | `src/components/plate/lib/picture-field.ts` | a tone grid placed by `cover`, `disc` or `region`, read at the loop's cells |

- `createDitherLoop(canvas, fn, opts)` returns `render`, `start`, `stop`,
  `setField`, `setOptions` and `destroy`. Defaults: `scale` 3, `fps` 30,
  `pauseOffscreen` true, `gamma` 1, `bias` 0.
- `createStudioField` returns `setParams`, `pause`, `resume`,
  `renderStatic` and `destroy`, or null when WebGL is unavailable. The
  canvas then stays transparent and the parent's own ground shows.
- The studio family is ten presets on an ink ground in the blue family
  (`#2f5ce0`, `#5f86f2`, `#9db9ff`, `#cfe0ff`), white only in 10: 01
  bayer-flow (the Glyphfield original), 02 bayer-8x8 (the default and the
  hero's material), then contour, radial, sweep, waves, chunk (the 2x2),
  pulse, ink and hot, with `bayerSphere` outside the roster (the report
  card globe). What each moves is in
  [references/engines.md](references/engines.md) ("The studio family").
- Every engine follows the lifecycle in DESIGN.md section 11: mount lazily
  behind an IntersectionObserver, pause offscreen and on a hidden tab,
  draw exactly one still under `prefers-reduced-motion`, release
  everything the instance owns in `destroy()`, and re-resolve ink on a
  `data-theme` flip. The studio field draws one ink set in both themes and
  leaves the light theme to the page's CSS filter (section 3).
- The studio field holds exactly one WebGL context per session for every
  subscriber, blitting into each subscriber's 2D canvas. Per-component
  contexts exhausted the browser's budget of about 16 and went black, so
  `destroy()` keeps the shared context by design. Switch a preset by
  remounting a keyed canvas (`src/components/shared/HeroFieldSwitcher.tsx`).
- The studio field has four copies with identical shaders and presets,
  two here and two in gt-cloud (the landing's on main and `packages/ui`'s
  on PR #4977, listed in [references/engines.md](references/engines.md)
  with the gotchas). Change a preset in every copy in the same round, or
  the app's material drifts from the hero's.

## 3. Material on product surfaces

- The landing hero's field is the one material on the dashboard and the
  auth pages. Kevin, 2026-09-25: "they should be as tasteful as our dither
  shader in hero of landing". It is preset 02 bayer-8x8 drawn by
  `createStudioField`.
- The hero mounts it in `shared/HeroField.tsx` on
  `canvas.tc-hero-field.tch-field`, and three files under
  `$GT_CLOUD/apps/landing/src/components/landing/` set its composite:
  - `shell/engine.css`: absolute, full bleed, `mix-blend-mode: screen`,
    inside an isolated dark cell;
  - `home/sections/hero-terminal.css`: opacity 0.55 and a seven-stop
    horizontal mask, 0.72 at the edges to 0.12 in the centre behind the
    window;
  - `home/v0-pages.css`, light theme:
    `filter: invert(1) hue-rotate(180deg) brightness(1.07) saturate(1.15)`,
    so the clouds print pale blue on paper.
- In the app the field mounts through `FieldGround` (`ground` for page
  grounds, `band` inside a block) and `DitherBand` (an empty state with its
  copy on a paper plate in the lower left). They live in
  `$GT_CLOUD/apps/dashboard/src/components/brand/` on PR #4977 and in
  `src/components/plate/brand/`. The composite is the hero's, measured:
  - `.brand-field-host` is `isolation: isolate`, `pointer-events: none`;
  - `.brand-field` is opacity 0.55;
  - `ground` masks the field to nothing left of `--plate-edge`, then ramps
    to full over 600 px; under md it is a faint top band gone by mid-page;
  - `band` ramps from 0.12 to full across the block;
  - the light theme uses the hero's filter, because a screen blend is inert
    in an isolated host with a transparent backdrop.
- Measure the hero's composite before inventing a new one. Never draw the
  material as a pattern, a border, a boxed plate or a heavier form. Kevin
  judged the horizon ring at page scale too heavy, and it was deleted.
- Glyph rain (`glyph-field`) keeps its glyphs as anti-aliased type at the
  page's pixel ratio. Its depth is glyph size and a quantized alpha ramp,
  and every tier is solid ink (`TIER_COVER` `[1, 1, 1]` in
  `src/lib/glyph-field.ts` and `$GT_CLOUD/packages/ui/src/lib/glyph-field.ts`),
  because a dither pattern on moving glyphs shimmers with every step. Kevin
  removed the rain's far-tier dither for that reason (commit b59f7d4,
  2026-08-06: "the dither is making it flicker every time it moves"). A
  later pass that redrew the rain as enlarged two-tone pixel type was
  reverted on his word (2026-09-28: "make the glyphs look like how they did
  before, and dont make them dithered").
- On gt-cloud main the sign-in page draws the blue globe alone on the CPU
  loop at `GLOBE_SCALE` 2 (the rain left it on 2026-09-29), and the
  onboarding, consent, device and CLI pages draw artifact pictures at
  `PICTURE_SCALE` 1
  (`$GT_CLOUD/apps/dashboard/src/components/brand/FieldStack.tsx`). The
  dashboard field's file map is gt-cloud's `artifact-pictures` skill
  (PR #5133).
- A field is decoration: `aria-hidden`, no pointer capture, and a readable
  page without WebGL.

## 4. Glyphfield, the source of new material

New material starts in Glyphfield, Kevin's open-source studio (glyphfield.com/studio, MIT), from which the studio field was ported. What ships is material code or exported assets, never an editor iframe, a local checkout or a generation request per page view; the shader holds texture and motion while masks, fades and theme blending stay in the page's CSS; and copied code keeps its source, revision, settings and licence notices. The full rules and the agent API are in [references/glyphfield.md](references/glyphfield.md).

## 5. Artifact pictures

An artifact picture is a photograph or scan of an object, artwork or place,
screened through the house dither. They appear on the plate port's field
(`src/components/plate`), the brand deck's mood slides (`deck/`), the
transition demo on /docs (`src/app/craft`) and gt-cloud's dashboard sign-in
and onboarding field. Procedural fields (the sign-in globe, the ramp),
marks, glyph fields, the deck's shader openers and blog covers are not
artifact pictures.

Choosing a picture:

- No plain English prose. Dictionary entries, book pages, documents, signs
  and captions read as copy and distract from the form beside them. Kevin,
  2026-10-05: "the dictionaries are plain english and distracting instead
  of artistic or design meaningful".
- Writing is welcome when it is the artistic or design subject: carved
  inscriptions (the Rosetta Stone), calligraphy, manuscripts in other
  scripts or old hands (Devanagari, the gloss), signs pressed in clay (the
  tablet), and lettering engraved on a historical chart or instrument (the
  cable chart, the compass rose).
- The picture applies to the page it sits on. On the dashboard Kevin cut
  the Great Wave ("does not really make sense here") and asked for human,
  cultural and language objects such as Karahisari's calligraphy and a
  Devanagari manuscript (2026-09-29).
- The source is the original scan or photograph, and the credit is shown
  with the picture. Choose in licence order: public domain or CC0 first
  (Wikimedia Commons public domain files, the Met, the Smithsonian, the
  Cleveland Museum of Art, the Rijksmuseum, the Library of Congress), then
  CC BY, then CC BY-SA only when nothing else shows the subject. Never a
  non-commercial (NC) or no-derivatives (ND) licence, and never the British
  Museum's own collection images. Pin every source by sha256.
- Subjects exclude flags, emblems and coats of arms, maps with borders,
  captions that state sovereignty, private people and replicas (a cast or a
  reprint of the object); the original object or document is shown.
- On the dashboard and the plate port, the caption card has a title in
  title case, a note of at most 90 characters (`NOTE_MAX_CHARS`) that
  states one fact about the object, and the credit in italic (Kevin,
  2026-10-01). Kevin asked for notes of two lines at most, and the note
  never mentions the company (2026-09-30: "dont write the corny stuff about
  gt relating").
- On the deck, a mood slide's plate has the title at 44px, one or two
  sentences on why the picture is in the deck (these may name GT), and the
  credit in titanium at 15px (`deck/shots/OPENERS.md`). The gt-deck skill
  owns that format.

The tone grid (`scripts/media/mood-tone/standard.json` under `tone` and `file`):

- Fixed for every picture: no blur, gamma 1.2, an autocontrast that clips
  0.5 percent at each tail (over the frame, or over the subject mask for a
  masked object), an 8-bit gray JPEG at quality 82, or 75 when 82 is over
  the cap.
- Chosen per picture in the recipe: the crop, the channel (`red` or
  `gray`), the polarity (`invert` puts the subject lit on a black ground)
  and the kind.
- Solved per picture by the cutter: the black and white points.
  - A `scene` lands on the Blue Marble's mean tone 0.361 and standard
    deviation 0.342 over the region of the grid that is shown.
  - `marks` (writing, engraving, lines on a plain ground) put the ground at
    black with an Otsu threshold and the 90th percentile of the marks at
    white.
  - The solver returns levels 80 and 230 for the plate's earth, which is
    the earth's own recipe, so the earth is the reference.
- Sizes: a cover is 1600 by 900, one grid cell per CSS px at a 1440 by 900
  view; a disc is 2400 by 1350. The cap is 573440 bytes.

The screen (`standard.json` under `screen`):

- the 8x8 Bayer matrix with threshold `(m + 0.5) / 64`;
- cells of 1 CSS px, screened live at display size. A pre-screened bitmap
  that is then scaled never ships;
- tone floor 10: bytes at or under 10 read as 0, above the JPEG ringing on
  black;
- the loop at gamma 1 and bias 0, because the whole curve is in the grid;
- dark theme: white cells at 0.62 over `#070707`; light theme: `#070707`
  cells at 0.7 over white.

The windows the lint holds each grid's shown region to:

| kind | mean | std | at white (250 and up) | at the floor (10 and under) |
| --- | --- | --- | --- | --- |
| scene | 0.30 to 0.42 | 0.28 to 0.44 | at least 2% | at least 5% |
| marks | at most 0.35 | any | at least 0.5% | at least 50% |

The constants on each surface, the picture roster and the crop kinds are in
[references/pictures.md](references/pictures.md).

## 6. The cutter

`pnpm mood-tone <sources dir>` cuts the deck set into `deck/shots/tone`; `--set plate` cuts the plate set into `public/brand/mood`; `--preview <dir>` writes the 1 px screen previews; `--check` cuts into a temp folder and fails unless the result is byte-identical. It needs Node 20 or later and Python 3 with Pillow. The cutter is deterministic: never edit a grid or a manifest by hand, a recipe holds no tone numbers (a picture that no crop, channel, polarity, kind or placement puts in its window does not meet the standard), and sources are never committed. Each person keeps a sources directory outside the repository, because a museum can change the bytes it serves and the wrapper refuses them. The full commands, gt-cloud's copy and the contract are in [references/cutter.md](references/cutter.md).

## 7. Adding or removing a picture

Choose the object against section 5 and confirm its licence; add the source's URL and sha256 and its README row; add a recipe (a plate recipe goes into both repositories); preview and adjust until the stats meet the window; show it on a deck slide or a plate registry entry in both repositories; run the lint in both; and commit the grid, the manifest, the recipe, the README row and the entry together, saying so when `textLines` is above 0. Removing a picture deletes its recipe, grid and entry in both repositories. The numbered steps are in [references/cutter.md](references/cutter.md).

## 8. The lint

| repository | command | runs in |
| --- | --- | --- |
| Prototemplate | `node scripts/lint/pictures.mjs` (`pnpm lint:pictures`), tests `pnpm test:pictures` | `pnpm build` before `next build`, `pnpm lint:all` |
| gt-cloud (PR #5133) | `node scripts/check-artifact-pictures.mjs` (`pnpm check:artifact-pictures`), tests `pnpm exec vitest run scripts/__tests__` | `pnpm lint` |

Prototemplate's lint fails when a grid, its manifest entry, the registry or
a slide disagree, when a grid or its stats are off the standard, when a
credit is missing, when a retired name appears, when a screen constant is
off on any surface, and when `standard.json` differs from its pin.
gt-cloud's applies the same rules to its one manifest and registry, and
also reads scene 1's `makeLoop` call. The full list, and what the lint
cannot see, are in [references/pictures.md](references/pictures.md).

## 9. Changing the standard

`standard.json` and `mood_tone.py` are byte-identical in Prototemplate and gt-cloud, and `STANDARD_SHA256` pins them in both lints. A change edits both repositories in one round and recuts every grid. The steps and the current pin are in [references/pictures.md](references/pictures.md) under "Changing the standard".

## 10. Retired names

`dictionary`, `johnson`, `oed-volumes`, `oxford` and `oed` never return as picture names, files, registry keys, `mood-{name}` tokens or string literals in picture code. They are listed in `standard.json` under `writing.retired`; [references/pictures.md](references/pictures.md) under "Retired names" says what each was and why it went.

## Review checklist

- Every density ramp is dither. No alpha veil carries tone, and a
  picture's dissolve is in the field.
- Cells are square and crisp at 1x and 2x zoom in both themes: pixelated
  upscale, crispEdges in SVG, transforms inside the mask.
- A product surface uses the hero's bayer-8x8 field with the hero's
  measured composite, and nothing heavier. Glyph rain stays solid type.
- The engine pauses offscreen and on a hidden tab, draws one still under
  reduced motion, cleans up in `destroy()`, and the page reads without
  WebGL. A CPU loop re-reads its ink on a theme flip (`data-theme` in
  Prototemplate, the `.dark` class in gt-cloud); the studio field takes the
  light theme from the page's CSS filter.
- A transition keeps one cell grid, one anchored tile and one smoothstep
  for tone and ink, and draws the end state under reduced motion.
- A new artifact picture has no plain English prose, applies to its page,
  has an original source with a license and a sha256 in `SOURCES`, and a
  credit shown with it.
- Its grid and manifest were cut by the wrapper, `--check` passes with the
  sources, and the page matches `preview-{name}.png`.
- On the dashboard and the plate port, its caption note is one fact in 90
  characters or fewer, with no line about the company.
- `node scripts/lint/pictures.mjs` passes, and for any plate change
  gt-cloud's `node scripts/check-artifact-pictures.mjs` passes on PR
  #5133's branch (or main once it merges).
- A standard change touched both repositories and both pins in one round.

## Related skills

GT: gt-graphics (covers, blog graphics, the Glyphfield headless export),
gt-aesthetic, gt-diagrams (`DitheredMark`, `references/isometric.md`),
gt-deck (mood slides and openers), gt-landing-pages, gt-lints, gt-verify
(the browser checks). Wiki: create-graphics, design-engineering-polish. gt-cloud's own skills under
`.agents/skills`: `artifact-pictures` (PR #5133) maps the dashboard field's
files, `glyphfield` maps Glyphfield and the landing's studio field, and
`gt-landing` lists the landing's shared pieces.

## Sources

Dated provenance for every rule is in `references/sources.md`: DESIGN.md, BRAND.md and `docs/ARTIFACT-PICTURES.md`, the engines and the cutter, the gt-cloud files, and Kevin's dated directives.
