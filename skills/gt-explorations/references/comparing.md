# Comparing directions and variants

Detail for section 4 of `gt-explorations`. Paths are relative to `$PROTOTEMPLATE` unless they name gt-cloud.

## Variants on the real page

For variants of a production page in gt-cloud, put the switch on the real route. The variants round of 2026-08-12 (seven pages, five variants each) used:

- a `?v=1..5` parameter with a per-page cookie;
- a thin dispatcher per page that renders the chosen variant;
- slot 1 as the committed page, unchanged;
- a development-only dock with chips 1 to 5 and the keys 1 to 5.

The dispatcher stayed thin so that removing the losers was one delete. Kevin chose slot 1 on all seven pages, and the flatten removed about 16k lines (gt-cloud commit `1db410568`). The plan, `VARIANTS-PLAN.md` at the root of the commit before it, also set the copy law for every variant: production wording, approved wording, or no words.

## Effect variants

Shaders, dithers, hover effects and palettes get an options menu inside the page, so Kevin tries each one in place. Kevin, 2026-08-05: "add an option menu around the bottom right of the singularity hero component".

- `src/components/shared/FieldEffectsMenu.tsx` is the pattern for a hero's cursor effects: a row of chips docked at the bottom right of the field, one per mode plus off. Hover or focus previews a mode, and a click commits it.
- A switch reads its options from one roster, so the switch, the craft page and the default agree. `BAYER_PRESETS` in `src/lib/studio-field.ts` is the roster of the Bayer family. `src/components/shared/HeroFieldSwitcher.tsx` swaps the Dossier hero's field through it, and the craft page's Bayer demo maps over the same list.
- A palette search takes the same form: "create a 20 blue example switcher to try out differnt palettes" (2026-08-13).

## Showing options outside a page

- Layout options are whole-page screenshots, so the relationships across the page are visible. Kevin, 2026-09-07: "show versions where its the whole page as screenshots so we get a better sense of the dock varieties". The next day he picked one from them. Scroll through the page before a full-page capture so lazy sections mount (`gt-aesthetic`, "Local review"). A change to one area is still shown as before and after crops (`gt-aesthetic`, "Showing the work").
- Every option carries its number where Kevin sees it: on a contact sheet for stills and frames, and on a listening page for audio takes (`gt-reporting` section 1).
- A direction's own captures are `public/shots/light/<slug>.jpg` and `public/shots/dark/<slug>.jpg`: the first fold at 1440 by 900 under `?chrome=0`, which `directionShots()` in `src/lib/directions.ts` reads. `pnpm capture:pages --direction <slug>` writes them from the server at `PT_BASE` (default `http://localhost:3005`) and writes nothing for a page that fails to load. Open every capture before using it.

## Module by module

A review of many directions goes module by module: one module across every direction, then the next. Kevin's July list was hero, story, product bentos, banners, Locadex, footer, context groups, dashboard, integrations and pricing (2026-07-29). Write the plan in that order (`docs/archive/MODULES_PLAN.md`) so one module can be pulled up across every direction and rated alone. The July viewer for this is `tools/module-review` on gt-cloud's `redesign/diagram-standard` branch. It frames one module across every direction and rates each out of five.
