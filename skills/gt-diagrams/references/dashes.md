# Dashes and draw-ons in a diagram

`SKILL.md` section 7 points here. Moved from it on 2026-10-10, unchanged.

Dashes and draw-ons carry their own traps (DESIGN.md section 9; gt-motion section 7 and its `references/traps.md` hold the full list). The ones that decide how a diagram is built:

- Chromium measures dash patterns in screen pixels under `non-scaling-stroke` and ignores `pathLength` there. A progress arc drops both and writes the dash in user units: `stroke-dasharray: calc(var(--dial) * <perimeter/100>px) <perimeter>px`.
- A single traveling dash (dasharray equal to the path length, animated offset) tiles into several dashes on a scaled SVG under `non-scaling-stroke`. Move a pulse as geometry, or translate a short `<line>` in user units. The Locadex connector pulses keep a `pathLength` dash and drop `non-scaling-stroke` from the pulse paths, which holds because that SVG scales uniformly (`src/app/d/production/sections/Locadex.tsx`).
- Dashes clip at the end of a closed subpath and never wrap the loop. Start the path where the arc starts, or use a period equal to the perimeter (`dasharray d (L - d)`).
- A draw-on parked at a positive offset reveals from the path's first point, and one parked at a negative offset reveals from its last point. StackTower's taps start at the plate and park at -101, so they draw out of the rail; the extra unit keeps a dash edge off the path's end, where Chromium's rounding left a 2px accent fleck at exactly -100 (the comment above the `story` timeline in `src/app/d/_v0/sections/FullStack.tsx`). The `svg-dash-gotchas` note states the reverse; the code and a headless Chromium check (offset 50 inks the first half of a 100-unit path, -50 the last half) agree with this rule. When a draw-on runs backwards, read the first point of `d` before touching the timing.
- Cache the source `d` (`el.dataset.traceD`) before an animation rewrites it, and guard an empty path: `getPointAtLength` throws on one (Kevin, 2026-07-30).
