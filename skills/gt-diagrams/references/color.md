# Color in a diagram

`SKILL.md` section 3 points here: the fill rule with what each lint catches, and how each surface spends the accent. Moved from it on 2026-10-10, unchanged.

## Fills from tokens

- **Fills from tokens.** `var(--ink)`, `var(--paper)` and `var(--plate)` on the deck; the root's tokens on a page; `currentColor` with `fill-opacity` steps for faces. In a live component under `src/app`, `src/components` or `src/lib`, gt-ui's `no-hex-colors` rule (`pnpm lint:code`) fails a hex in a `style` prop or a Tailwind utility, but a hex written as an SVG attribute (`stroke='#2f5ce0'`) passes it, so review catches that case. Any raw color in `src/components/shell` or `src/components/viewer` fails `pnpm lint:shell`. The directions under `src/app/d` are outside both lints, and that includes the toolchain diagrams. Their dark code panels use literal whites because the panel stays dark in both themes.

## The accent per surface

Each surface spends the accent differently.

| surface | accent rule | source |
| --- | --- | --- |
| site page | One spectral accent per page (`#2f5ce0` on paper, `#86a8ff` on the dark band), spent by each drawing on exactly one element. On the toolchain page the accent's six places are all diagram states. | DESIGN.md sections 1 and 6; `src/app/d/toolchain/styles.css` |
| deck | No accent on text, lines or fills. The four semantic hues appear on icons only. | DECK-GRAMMAR.md, Color |
| film | One accent per film, spent as an edge: one pulse on a thread, one active row, one lit word. The round directions at the top of the brief override this: since round 4 a film's palette is its gem smoke material (the fuma-nama pulse is fire). | `motion/MOTION.md`, Color and Round 4 |
| blog graphic | Red for what was removed, blue for the page and what replaced it. | `docs/GRAPHICS.md` |
