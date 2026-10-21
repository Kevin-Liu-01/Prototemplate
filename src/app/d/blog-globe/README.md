# Blog globe rounds

The blog globe figure's four variants (A dithered, B line globe with a route, C glyph globe, D dot globe) in all three review rounds, live. The code is a copy of the folder `apps/landing/src/components/blog/globe/` in gt-cloud, taken from the branch `k/blog-globe` at commit `5ba413acfb`. `/docs/components/blog-globe` records the directions, their measurements and the ranking, and it is the only page that links here.

| Round | Code | Route | What it shows |
| --- | --- | --- | --- |
| 1 | `_rounds/r1`, frozen in gt-cloud from `c7031e2ca8` | `/d/blog-globe/r1` | The whole globe, one line of the passage, a language control of its own in each variant (a pill, chips or a year timeline) and decimal coordinates |
| 2 | `_rounds/r2`, frozen in gt-cloud from `ee19373e96` | `/d/blog-globe/r2` | Round 1 with a click target on every city on the globe |
| 3 | `_rounds/r3`, gt-cloud's live folder at `5ba413acfb` | `/d/blog-globe` | A zoomed globe, the eight definitions changing row by row, underlined language names and coordinates in degrees, minutes and seconds |

`?v=a` to `?v=d` on a round's route shows one variant with the links between rounds around it. `?v=<variant>&embed=1` shows the figure alone and posts its height to the page that frames it, so the frame never scrolls. `/d/blog-globe/all` frames every round of every variant: a row per variant in the review's order (D, A, B, C) and a column per round.

Every route is noindex, follow and stays out of the sitemap, as every `/d/` page does (`src/app/d/layout.tsx`, `src/lib/seo/policy.ts`).

## The folders

- `_rounds/r1`, `_rounds/r2`, `_rounds/r3`: one round each. Every file is gt-cloud's, with two changes and no others. Import paths point into this folder, and each round's stylesheets are scoped under the round's own root class (`.globe-r1`, `.globe-r2`, `.globe-r3`) in place of gt-cloud's `.blog-root`. The rounds reuse their class names with different rules, so the roots keep them apart on any page, and `/blog` already styles `.blog-root`.
- `_stage`: gt-cloud's dev stage (`stage/`), with the hand edits listed below.
- `_shared`: what the rounds import from outside the globe folder.
  - `ditherMask.ts`: a whole copy.
  - `versions-field.ts`: the eight exports the globes use, verbatim.
  - `figure-types.ts`: the `LineProps` and `VersionPanel` types.
  - `i18n.tsx`: pass-throughs for `T`, `Var`, `msg`, `useMessages`, `useGT` and `getGT`, so the call sites stay as gt-cloud has them.
  - `port-compat.css`: the `--tc-*` tokens in both themes and the landing's element rules, under `.globe-root`.

The docs frames that embed the figures live in `src/components/blog-globe/`. They load each figure from its round's route, so the docs bundle carries none of the figures' code and no round's stylesheet meets another's.

## The stage's hand edits

- `GlobeDevPage.tsx` imports `port-compat.css` in place of the landing's three stylesheets, wraps the round in `globe-root globe-<round>` and takes `base` in place of the locale.
- `GlobeDevStage.tsx` drops the rule that hid gt-cloud's cookie banner inside a frame, and marks the embedded figure's `main` with `globe-embed`, which sets the figure's outer margins to 0.
- `rounds.ts` gives round 3 its commit, `5ba413acfb`, since it is a copy here, and types the list (`GlobeRound`, with `commit: string | null`) instead of reading the keys from an `as const` array: with every round frozen, the stage's label for a live round would narrow to `never` and fail the type check.
- The comments name the routes under `/d/blog-globe`.

## Copying a later gt-cloud round

1. Extract the folder from the commit, not a working tree: `git archive <sha> apps/landing/src/components/blog/globe | tar -x -C <scratch>`.
2. Copy `rounds/r1` and `rounds/r2` to `_rounds/r1` and `_rounds/r2`, and the folder without `rounds`, `stage` and every `__tests__` to `_rounds/r3`. A new round goes to `_rounds/r<N>` with a route of its own, in the shape of `r2/page.tsx`, and an entry in `_stage/rounds.ts` with its key added to `GlobeRoundKey`.
3. In the `.ts` and `.tsx` files, rewrite the import paths in this order:
   - `@/components/blog/globe/rounds/r<N>/` to `@/app/d/blog-globe/_rounds/r<N>/`
   - `@/components/blog/globe/` to `@/app/d/blog-globe/_rounds/r3/`
   - `@/components/blog/ditherMask`, `versions-field`, `Versions` and `VersionsFigure` to their files in `_shared`
   - `@generaltranslation/ui/hooks/use-mount-effect` to `@/lib/use-mount-effect`
   - `gt-next` and `gt-next/server` to `@/app/d/blog-globe/_shared/i18n`
4. In each round's stylesheets, rewrite `:is([data-theme='dark'], .dark) .blog-root` to `[data-theme='dark'] .globe-r<N>`, then `.blog-root` to `.globe-r<N>`.
5. Search the copy for `@/components/blog`, `@generaltranslation`, `gt-next` and `blog-root`. Each search must find nothing.
6. Measure each figure's height at 712 and 343 px wide with its margins at 0, update `FIGURE_HEIGHTS` in `src/components/blog-globe/figures.ts`, then load `/docs/components/blog-globe` and `/d/blog-globe/all`.
