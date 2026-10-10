# The round charter

Detail for sections 1 and 2 of `gt-explorations`. Trigger: every exploration round, written before the first direction is built and given to every builder and reviewer of the round.

A charter is the binding contract of one round. It states what every direction keeps, what every direction must contain, where the round's new idea may live, the copy rules, the technical limits for builders, and the checklist a reviewer runs by reading code. On 2026-09-14 Kevin rejected a deco round as not keeping GT's design elements, not thought through, and incomplete (a hero and a few strips). The next three rounds ran from a charter, and seven of their directions landed on Prototemplate main (b6a7eba, 2026-09-15). The charter file itself lived in a scratchpad and was lost at a reboot; it was rebuilt from its transcript on 2026-10-10 with `gt-orchestration/scripts/replay-edits.py`. Write the next one into the round's notes folder or the repository.

Every rule in a charter names the file that governs it. Sources of authority come first, in order: `BRAND.md`, `DESIGN.md`, `ARCHITECTURE.md` (the SSOT rule), `docs/SHIP-LOOP.md`, the direction the round copies as its base, `src/app/d/production/` (the shipped element set and copy) and `src/app/d/toolchain/` (the shared vocabulary and diagrams).

## A. The elements that persist

One entry per GT element that every direction keeps. A direction that drops one is incomplete. Each entry has three parts:

- **What it is**, in one or two sentences.
- **Files**: the file to reuse or copy, with line ranges, and the canonical source when the copy differs.
- **Code-level facts to keep**: tokens, class names, the one owner of each line, the reduced-motion and offscreen behaviour, the dark-mode remap.

The deco charter listed seventeen: the ruled column and its seams; the Bayer dither engine as the base texture (at least two dither surfaces per direction); SVG flags as data chips through `LocaleTag`; the windowed translation demo; the trust strip; the review workspace; the locales atlas; the bento; the dark band; the pricing file; the footer; the marks and the doubled line; type discipline; the measured copy register; the motion rules; corners and radii; and the CTA conventions. The four line defects of DESIGN.md section 2 (doubled lines, missing seams, self-stacks, invisible seams) are failures in every direction.

## B. The section contract

1. **Ordered sections.** The sections a complete direction renders, in order, each with the base file it copies from, and where each sits relative to the rail wrappers. The deco contract had ten: nav, hero, frameworks, bento, locales, story, review, dark band, pricing, footer, with `DirectionCorner` after the root.
2. **How to start.** The exact commands that copy the base into `src/app/d/<slug>/`, the root-class rename (the slug without hyphens plus `-root`), and the greps that prove the rename is complete. The list of slugs already taken under `src/app/d/`.
3. **Pitfalls**, each with its fix:
   - every copied selector is scoped to the root class, so a missed rename leaves a section unstyled;
   - a component that only styles under another direction's root needs that root class on the div too, and that direction's base sheet is never imported beside the copy;
   - keyframe names are global, so new or edited keyframes take the slug as a prefix;
   - shared diagrams read tokens from the root, so those tokens stay defined while restyling;
   - Inter is already on `<html>`; a display face loads once in `page.tsx` with a CSS variable on the root;
   - the practices ratchet (`pnpm lint:practices`) counts a copied violation under a new path as new, so the copy step sweeps the base's known exceptions first (a bare `useEffect`, blurred shadows, rendered em dashes), listed by file and line;
   - every new token is remapped in the dark block.

## C. Where the round's idea lives

The round's idea is a documented layer on top of the GT system.

1. **Homes.** The places the new idea may appear, and nowhere else. The deco round allowed five: section heads, dividers (the hatch band and section rules), frames (mounts, framed cells, code bars), the hero crown above the h1, and the dark band. Grids, cells, chips, demos, diagrams, code, tables, plan cards, footer columns and all copy stay GT.
2. **Color.** What may move and the limits: ink on ground holds WCAG AA at 14px, hairlines stay visible on every surface in both themes, one accent spent as a controlled edge, one ornament color used only in the homes, dark mode as a remap of the same tokens, and no tonal gradients outside dither tiers (no iridescence, glass, drop shadows or glow). The sanctioned CSS devices that draw lines or clip are listed by file and line.
3. **The token block.** The first rule of the direction's stylesheet: a comment that states the thesis, the reference, the homes used, the accent's one job and the display face, then a fixed set of round tokens (the deco round used six `--deco-*` names, so a reviewer can grep them across the round) mapped onto the shared `--tc-*` tokens, and the dark remap of the same names.
4. **Display type.** At most one display face, in named slots only (h1, h2 and one crown element); everything else stays Inter; CJK, RTL and Indic samples fall back to a face that has the script; no eyebrows.

The deco round added one more rule that applies to any named lineage: research the lineage before drawing, and take geometry only from it. Kevin meant the revival of Egyptian, Mayan and Assyrian forms, and the first round drew machine-age forms instead (SKILL.md section 2).

## D. Copy

The register (plain declarative sentences, technical terms explained), then what is forbidden in rendered copy: exclamation marks outside quoted product output, em and en dashes, marketing words, anything sensitive (funding, revenue, headcount, dates of launches), invented numbers (the allowed figures are listed), AI iconography other than the Locadex mark, emoji, and placeholder text. Section heads and sub lines are reused from the base; new copy is limited to the layer's own captions, in the same register (`gt-voice`).

## E. Technical rules for builders

- Write only inside `src/app/d/<slug>/`. Registration in `src/lib/directions.ts` is the orchestrator's job after review.
- Start no dev server, run no build, lint run or screenshot harness, and make no commit or branch. The shared review server on 3005 belongs to Kevin's review (`prototemplate` section 8).
- Type check the whole repository and require zero diagnostics under the direction's folder.
- Every import resolves from a listed root (`@/app/d/toolchain/*`, `@/components/*`, `@/lib/*`, the direction's own folder, installed packages); no new dependencies.
- `page.tsx` is a server component with the directions' standard metadata, imports `./styles.css`, and renders `DirectionCorner` last.
- Colors in TSX come from CSS tokens; no quoted hex, no `!important`; every button has `type`, every image `alt`, every decorative canvas `aria-hidden`.
- The direction reflows at 390, 768, 1280 and 1440 pixels without horizontal scroll.
- New components for the layer live in `sections/<round>/` or `diagrams/<round>/`, each with a header comment naming its home.

## F. The completeness checklist

A checklist a reviewer runs by reading code, every line true or the direction is returned: structure (files, section order, root classes, no stray renames, nothing outside the folder changed), tokens and color (the comment block, the token set, the dark remap, a grep for gradients, shadows and filters), rails and lines (one owner per line), elements (one line per element of part A with the data it must import unchanged), type (no second Inter, one display face in its slots, weights at 500 or less, the mobile floor tokens), motion (reduced-motion guards, paused loops, no smooth scroll or pinning, engines destroyed on cleanup) and copy (a dash grep, an exclamation grep, a flag-emoji grep). Each line carries the command that checks it, with every `--include` glob quoted for zsh.
