# Checking a figure

`SKILL.md` section 9 points here: the figure check script with its commands, what it fails on, what to read in each crop, and the surface gates.

## The check

`scripts/lint/lines.mjs` reconstructs lines from computed CSS and returns early for any element inside an `svg` or a `canvas`. A figure's strokes, junctions and crossings are therefore checked by eye at 2x crops of the junctions in both themes (DESIGN.md section 2).

`scripts/figure-check.mjs` in this skill does the capture and the checks a script can make. It needs `playwright-core` (a Prototemplate dependency) and a Chromium (the Playwright build, or installed Chrome through `--chrome` or `CHROME_PATH`), and runs from the Prototemplate root. A copy of the skill outside a Prototemplate checkout needs `playwright-core` installed where it runs, and `deck-page.mjs` then takes `--deck <path to deck/>`. Crops are `x,y,w,h` in CSS px from the figure's top left corner:

```bash
# the DoubledLine plate on /docs, with a 2x crop of the merge where the two forks join the trunk
node skills/gt-diagrams/scripts/figure-check.mjs http://localhost:3005/docs \
  --selector .ptc-threads --crop 350,105,90,70 --out /tmp/gt-fig

# the same figure on a phone
node skills/gt-diagrams/scripts/figure-check.mjs http://localhost:3005/docs \
  --selector .ptc-threads --width 390 --height 844 --out /tmp/gt-fig-390

# a deck slide: assemble the deck with its fonts, then open slide 30 in present mode,
# where CSS px are sheet px, with a crop of the first border cross
node skills/gt-diagrams/scripts/deck-page.mjs /tmp/gt-deck.html
node skills/gt-diagrams/scripts/figure-check.mjs "file:///tmp/gt-deck.html#30" \
  --selector '#stage .slide.is-on svg.dia' --width 1600 --height 900 --press p --min 18 \
  --crop 430,40,40,40 --out /tmp/gt-fig-deck
```

It writes the figure and each crop at 2x for light and dark, prints each SVG's viewBox and rendered scale, and fails on a label under `--min`, a label that is rotated, skewed or stretched, a stroke in a stretched viewBox without `non-scaling-stroke`, a dash that relies on `pathLength` under `non-scaling-stroke`, and geometry that differs between themes. It warns on curves in a stretched viewBox. It cannot judge a junction; read the crops.

Read each crop at full size and check:

- each merge and fork: one clean pair, no third stroke, no stripe where the core misses the ground;
- each crossing: a border cross on the intersection, or no crossing;
- each leader meeting a hull: no gap and no anti-aliased seam;
- each label: 12px clear of every line;
- the still: reduced motion shows the complete composition with the accent where it belongs.

The surface's own gates run too: `node deck/shoot-slide.mjs <n>` for a slide (both themes, with an overflow report; it loads `playwright-core` from a gt-cloud worktree path and a Chromium path on Kevin's machine, so on another machine use `deck-page.mjs` with `figure-check.mjs`), `pnpm graphics:audit` for a blog graphic, `pnpm check:pages` for the route, and `pnpm lint:lines:shell` for the chrome around the figure.
