# mood-tone

Cuts Prototemplate's artifact pictures from the original scans and
photographs, and writes `manifest.json` beside the grids. The grids and the
manifests are committed. The sources are not.

| Set               | Grids                                                  | Shown by                                                    |
| ----------------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| `deck` (default)  | `deck/shots/tone/mood-*.jpg`, 10 covers at 1600 by 900 | the brand deck's mood slides, and two of them in the transition demo on /docs (`src/app/craft`) |
| `plate`           | `public/brand/mood/mood-*.jpg`, 4 covers and 1 disc    | the plate port's field (`src/components/plate`)             |

The rules for artifact pictures are in `docs/ARTIFACT-PICTURES.md`.
`scripts/lint-pictures.mjs` holds the grids, the manifests, the registry, the
deck slides and the screen constants to them. It runs before `next build` and
in `pnpm lint:all`, which also runs its tests (`pnpm test:pictures`).

Requires Node 20 or later and Python 3 with Pillow (`python3 -m pip install Pillow`).

## Files

| File            | What it holds                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `standard.json` | The standard: the screen, the fixed tone settings, the scene target, the file sizes and cap, the lint windows and the retired names |
| `mood_tone.py`  | The cutter. It reads a recipe on stdin and prints one manifest entry per picture                                                    |
| `mood-tone.mjs` | The recipes for both sets and the wrapper that runs the cutter and writes `manifest.json`                                           |

`standard.json` and `mood_tone.py` are the same files as gt-cloud's
`apps/dashboard/scripts/mood-tone`. Keep the copies identical. The `plate`
recipes are gt-cloud's dashboard recipes, so `public/brand/mood` holds the
same bytes as gt-cloud's `apps/dashboard/public/brand/mood`.

## Source files

Put the source files in one directory with these names:

| Picture       | File                      | Origin                                                                                                                                         | Pixels        | sha256                                                             |
| ------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------ |
| `earth`       | `earth.jpg`               | [Commons](https://commons.wikimedia.org/wiki/File:Blue_Marble_Western_Hemisphere.jpg)                                                          | 3718 by 3718  | `4564966126c338326d57347ec87cf2f8dee60d07dafb8b4f6482cb2a8244d71d` |
| `rosetta`     | `rosetta.jpg`             | [Commons](https://commons.wikimedia.org/wiki/File:Rosetta_Stone.JPG)                                                                           | 3665 by 4288  | `ab849e48eca5e8cf5bb2466b83e04b13d7da1c427652f3c57fda09311869c388` |
| `tablet`      | `met-327385-DP293245.jpg` | [The Met, image DP293245](https://images.metmuseum.org/CRDImages/an/original/DP293245.jpg)                                                     | 3000 by 4000  | `fa975c43b50532786b5f7c57edb1b6e105496f8a1e9a92465d7fa896fa183aec` |
| `calligraphy` | `calligraphy.jpg`         | [Commons](https://commons.wikimedia.org/wiki/File:Ahmed_Karahisari_-_Karalama_%28calligraphy_exercise%29_-_Google_Art_Project.jpg)             | 1937 by 2601  | `7e4d0092230d4251933580bcd26c8e1b6d5b1b0006e9c980439480eea70df1aa` |
| `lighthouse`  | `lighthouse.jpg`          | [Commons](https://commons.wikimedia.org/wiki/File:Louisbourg_Lighthouse,_waves_breaking_in_a_fall_storm_1.jpg)                                 | 3888 by 2592  | `1dfb1e670e2de3fb09723f52e2aa6fe8bb29d26f7b4fac556d46aac84fe83361` |
| `devanagari`  | `devanagari.jpg`          | [Commons](https://commons.wikimedia.org/wiki/File:Prashna_Upanishad_sample_manuscript_page,_Sanskrit,_Devanagari_script.jpg)                   | 2350 by 1048  | `5f8077777cb1eb181b422b59c02959cd0249265f89c441a12d0c5491412585ef` |
| `gloss`       | `alexandreis-p69.jpg`     | [Commons](https://commons.wikimedia.org/wiki/File:Alexandreis_with_gloss_-_in_Latin_-_DPLA_-_98b56ea1ebec780d88ec0bdfa6750159_%28page_69%29.jpg) | 6696 by 10057 | `9b84d0a5a2c53d90c3014fe9f71619d864f960645a3e232a42b481496f446ae3` |
| `cable`       | `cable.png`               | [Commons](https://commons.wikimedia.org/wiki/File:1901_Eastern_Telegraph_cables.png)                                                           | 1800 by 1458  | `9ab9d44eb7332b2d9352f446083a6f2f3ece75eb3d1a3ebc263f6cb39756df51` |
| `wave`        | `wave.jpg`                | [Commons](https://commons.wikimedia.org/wiki/File:Tsunami_by_hokusai_19th_century.jpg)                                                         | 3859 by 2594  | `30c170260de393f51bd592adacc6f0714b60f157c09744e9c5b6d46e6a613718` |
| `compass`     | `compass.jpg`             | [Commons](https://commons.wikimedia.org/wiki/File:1748_Bowen_Mariner%27s_Compass_and_Armillary_Sphere_-_Geographicus_-_CircleofWinds-bowen-1747.jpg) | 3866 by 2449  | `9b656f50affeec8cf569548aaf79ac9fa6531c07a3e4f407ef2e0730d6d6077f` |

The first five are gt-cloud's sources with the same hashes. The wrapper
checks each source's sha256 before it cuts and refuses a source that differs.
A new or replaced source needs its row here and its entry in `SOURCES` in
`mood-tone.mjs`.

The credits shown with the pictures are on each deck slide's plate, in
`src/components/plate/brand/moodPictures.ts`, and in the credit line under
the transition demo on /docs (`src/app/craft/CraftArticle.tsx`).
`deck/shots/OPENERS.md` records each deck picture's subject, license and
crop.

## Invocation

From the repository root:

```sh
pnpm mood-tone <sources dir>                    # the deck set into deck/shots/tone
pnpm mood-tone <sources dir> --set plate        # the plate set into public/brand/mood
pnpm mood-tone <sources dir> --preview <dir>    # also writes preview-{name}.png, the 1 px screen
pnpm mood-tone <sources dir> --check            # cuts into a temporary folder and compares
node scripts/lint-pictures.mjs
pnpm build:deck                                 # after a deck grid changes
```

The wrapper writes the grids and `manifest.json` and prints each picture's
levels and region stats. `--out <dir>` writes them somewhere else.

The cutter is deterministic: the same sources and recipes write the same
bytes. `--check` exits 1 unless every grid and the manifest equal the
committed files byte for byte.

## Recipes

A recipe sets only `name`, `source`, the size and cap (from `standard.json`),
`crop`, `channel`, `invert`, `kind`, `writing` and `placement`. The black and
white points are solved by the cutter. Never set tone numbers by hand.

A deck recipe's placement is a cover at focus 0.5, 0.5, because the deck
engine draws every grid as a centred cover. A plate recipe's placement equals
the picture's entry in `moodPictures.ts`; for the earth, the disc fit (`cx`,
`cy`, `r`) is in the manifest entry's `disc` and in the registry's placement.
