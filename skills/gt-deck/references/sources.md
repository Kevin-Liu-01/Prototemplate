# Sources

Where every line of `SKILL.md` and the files beside it comes from. Each line added after 2026-10-08 names its memory, transcript or inventory row and its date.

## Sources of the skill as written through 2026-10-08

- Prototemplate: `deck/DECK-GRAMMAR.md`; `deck/parts/head.html` (tokens, type, layout classes, sprite, `.gt-word`); `deck/parts/tail.html` (`SECTIONS`, `titleOf`, `cloneSlide`, the mood engine, the theme); `deck/shoot-slide.mjs`; `deck/assemble.mjs`; `scripts/build/deck.mjs`; `deck/shots/OPENERS.md`; `docs/archive/deck-round-5.md`; `deck/fonts/deck-fonts.css`; `src/lib/search-index.ts` (`DECK_SLIDES`); `next.config.ts` (the `/deck` rewrite); `src/app/brand/page.tsx`; `README.md` and `public/llms.txt` (the /deck lines); `docs/ARTIFACT-PICTURES.md`; `BRAND.md` section 6; `DESIGN.md` sections 2 ("Line law for chrome"), 6 and 7; `deck/slides/17-speed-monogram.html` to `23-speed-ascii.html`, `27-type.html`, `33-diagrams.html`, `93-fixed-points.html`; `scripts/lint/lines.mjs` (the `--shell` audit of /deck).
- gt-cloud: `tooling/oxlint-plugins/gt-ui.ts` (the Heroicons sets the icon tiers accept).
- Memory notes: `gt-brand-deck`, `speed-marks-set`, `prototemplate-interface-system`, `dashboard-deck-grammar`, `artifact-picture-standard`.
- Kevin's presentation rules: 2026-07-29 and 2026-10-05 (plan in text, each slide stands alone, introduce before relying; the 2026-10-05 rules came from a personal-project deck and Kevin framed them as how presentations are written), 2026-09-08 and 2026-09-09 (the viewer: "make this much better like a real presentation viewer with a sidebar of all slides", "the present screenn should be separate", centered slides, the openers).
- Kevin's directives: 2026-09-08 (the deck as a minimal black and white slideshow in the brand font, and the viewer as the interface for Prototemplate); 2026-09-09 (semantic icons, the GT word as the mark, Inter only, full-picture slides, the openers on better images); 2026-09-25 (the dashboard judged against the deck); 2026-09-29 (the speed mark set); 2026-10-05 (no plain English prose on artifact pictures).

## Lines added on 2026-10-10 (system v2, lane L4)

- Section 3 moved to `references/type.md`, section 1's table and section 12's registry table to `references/viewer-and-build.md`, "Borrowing the grammar for another surface" to `references/borrowing.md` and "Writing a presentation" to `references/writing.md`, unchanged, with summaries left in `SKILL.md`, to keep the body under the 24,000-byte budget (plan section 2.2).
- Section 7 and Related skills: the isometric skill merged into `gt-diagrams` on 2026-10-10.
