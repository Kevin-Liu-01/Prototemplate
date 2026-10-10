# The cutter and the picture procedure

`SKILL.md` sections 6 and 7 point here: the cutter's commands and contract, and the steps to add or remove a picture in both repositories.

## The cutter

Requires Node 20 or later and Python 3 with Pillow. From the Prototemplate
root:

```sh
pnpm mood-tone <sources dir>                     # the deck set into deck/shots/tone
pnpm mood-tone <sources dir> --set plate         # the plate set into public/brand/mood
pnpm mood-tone <sources dir> --preview <dir>     # also writes preview-{name}.png, the 1 px screen
pnpm mood-tone <sources dir> --check             # cuts into a temp folder, fails unless byte-identical
pnpm mood-tone <sources dir> --out <dir>         # writes the grids and manifest elsewhere
```

In gt-cloud (PR #5133, branch `k/artifact-picture-standard`, open on
2026-10-05): `pnpm --dir apps/dashboard mood-tone <sources dir> [preview
dir]`, or the sources directory in `MOOD_SOURCES_DIR`.

On Kevin's machine the sources are in `~/gt/artifact-picture-sources` with a
`SHA256SUMS` file. `pnpm mood-tone ~/gt/artifact-picture-sources --check`
and the same with `--set plate` passed on 2026-10-05.

- `mood-tone.mjs` holds the recipes and `SOURCES` (each file's origin URL
  and sha256). It refuses a source whose sha256 differs, then sends the
  recipes and the standard to `mood_tone.py`, which writes
  `mood-{name}.jpg` and prints one manifest entry per picture. The wrapper
  writes `manifest.json` and prints each picture's levels, region stats,
  text lines and bytes.
- The cutter is deterministic. The lint ties a grid to its manifest entry
  by sha256, but only `--check` with the sources proves the entry came from
  the recipe. Never edit a grid or a manifest by hand. In gt-cloud the
  reviewer reruns the wrapper and checks that `git status` shows no change.
- A recipe holds only `name`, `source`, the size and cap, `crop`,
  `channel`, `invert`, `kind`, `writing` and `placement`. It holds no tone
  numbers. If no crop, channel, polarity, kind or placement puts a scene in
  its window, the picture does not meet the standard; tone settings are
  never added to make it pass.
- Sources are never committed. Each person keeps a sources directory
  outside the repository with the copies the grids were cut from. Keep
  those copies: the Met now serves the tablet with different bytes, and
  the wrapper refuses them.

## Adding or removing a picture

1. Choose the object against section 5. Find the original and confirm its
   license.
2. Put the source in your sources directory. Add its URL and sha256 to
   `SOURCES` in `mood-tone.mjs` and its row (file, origin, pixels, sha256)
   to `scripts/media/mood-tone/README.md`.
3. Add a recipe to `DECK` or `PLATE`. Spread `COVER` for a cover. Use
   `kind: 'marks'` for writing or engraving on a plain ground and `'scene'`
   otherwise. Declare `writing`. A deck placement is a cover at focus 0.5,
   0.5. A plate recipe is gt-cloud's too: add the same recipe to `PICTURES`
   and the source to `SOURCES` in
   `$GT_CLOUD/apps/dashboard/scripts/mood-tone/mood-tone.mjs`, and the
   source row to that folder's README.
4. Run the wrapper with `--preview` and look at `preview-{name}.png`.
   Adjust the crop, channel, polarity, kind or placement until the subject
   sits where it should and the stats meet the window.
5. Show it: a deck mood slide, or a plate registry entry made in both
   repositories so `public/brand/mood` holds the same bytes in each. The
   markup, the bookkeeping and the caption rules are in
   [references/pictures.md](references/pictures.md).
6. Run the lint in both repositories (section 8).
7. Commit the grid, `manifest.json`, the recipe, the README row and the
   slide or registry entry together. If the manifest shows `textLines`
   above 0, say so in the commit or pull request so the reviewer checks
   the writing against section 5.

To remove a picture, delete its recipe, grid and slide or registry entry,
run the wrapper so the manifest drops it, and move its pages to another
picture, in both repositories.
