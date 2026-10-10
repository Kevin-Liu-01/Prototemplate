# Sources

Where every line of `SKILL.md` and the files beside it comes from. Each line added after 2026-10-06 names its memory, transcript or inventory row and its date.

## Sources of the skill as written through 2026-10-06

- Prototemplate: `DESIGN.md` sections 1 (the four-color system), 2 (the line law, crossings, the auditor's blind spot for SVG), 3 (the rails), 5 (the doubled line), 6 (the isometric family), 8 (the moving type law), 9 (motion discipline, the dash gotchas), 11 (engine lifecycle).
- Prototemplate: `deck/DECK-GRAMMAR.md` (Type, Color, Diagrams, Dark mode, What a defect is); `deck/slides/30-lines.html`, `31-doubled-line.html`, `33-diagrams.html`, `35-iso.html`, `76-line-law.html`; `deck/parts/head.html` (`svg.dia` rules, `--cross`); `deck/shoot-slide.mjs`.
- Prototemplate: `src/components/shared/diagrams/DoubledLine.tsx`, `DiagramFrame.tsx`, `diagrams.css`, `src/components/shared/FeatureBento.tsx`.
- Prototemplate: commit 04d8410 (2026-07-31, the TranslationFlow pulse moves from the accent to the page ink); `.oxlintrc.json` and `scripts/lint/oxlint-plugins/gt-ui.ts` (`no-hex-colors`, `no-gif-mark`); `scripts/lint/shell.mjs` (`TARGETS`).
- Prototemplate: `src/app/d/toolchain/diagrams/TranslationFlow.tsx`, `LocaleRouting.tsx`, `flow.css` (`.tf-pulse` in `--tc-ink`), `lang/lang.css` (`.lang-cr-pulse` in `--lang-accent`), `EdgeGlobe.tsx`, `SdkStack.tsx`, `SdkLedger.tsx`, `StatRow.tsx`, `IsoFrame.tsx`, `IsoSolid.tsx`, `tc-ctx-layers.tsx`, `tc-stack-iso.tsx`, `lang/*.tsx`, `surface/*.tsx`; `src/app/d/toolchain/styles.css` (`--thread-*`, the accent's six places); `src/app/d/_v0/sections/StackTower.tsx` (taps, buried leader ends, founder notes) and `FullStack.tsx` (the taps' -101 park); `src/app/d/production/sections/Locadex.tsx` (seated marks, the pulses without `non-scaling-stroke`) and `Global.tsx` (`GlobeAtmosphere`).
- Prototemplate: `src/app/craft/ThreadsDemo.tsx`, `CraftArticle.tsx`, `libraries.ts`, `craft.css`; `docs/LIBRARIES.md`; `docs/GRAPHICS.md` (Sizing); `graphics/build/gen-lib.js` (`MIN_TEXT`, `line`, `elbow`); `scripts/lint/lines.mjs` (`ALLOW`, the SVG skip); `BRAND.md` sections 6 and 9 (mono as an instrument voice, the avoid list).
- Prototemplate: `motion/MOTION.md` (Round 4 direction, Color, Type, Line), `motion/films/blog-fuma-nama/index.html` (`doubledH`), `motion/films/blog-designing-docs/index.html` (`F.doubled`, the casing); local and untracked, owned by the Videos session.
- gt-cloud: `apps/landing/src/components/landing/shell/engine.css` (`--thread-*`); `.agents/skills/gt-landing/SKILL.md` and `references/design.md` (the landing's diagram files).
- wiki: `skills/engineering/create-graphics/SKILL.md`; `skills/misc/diagram-to-html/SKILL.md`.
- Session notes: svg-dash-gotchas (2026-08-05 and 2026-08-11; its park-direction bullet is inverted, see section 7), k-pages-restart-round (2026-08-11), redesign-v0-verdict (2026-08-04), blog-graphics-pipeline-traps (2026-09-18 to 2026-09-24), explorations-stay-local.
- In this set: the isometric skill's section 5 (seating marks, now `references/isometric.md`), gt-motion section 7 and `references/traps.md` (dash traps).
- Kevin, 2026-07-29 (the doubled line in diagrams); Kevin, 2026-07-30 (the bar is generaltranslation.com and resend.com; the empty-path error); Kevin, 2026-08-04 (mount the existing components; Locadex carries its mark and is never a gif); Kevin, 2026-08-05 and 2026-08-11 (no invented content); Kevin, 2026-08-06 (overlapped lines as the named antipattern, the hatch spacer, border crosses); Kevin, 2026-08-11 (restart the landing diagrams); Kevin, 2026-08-12 (numbered boxes joined to the GT layer by doubled lines); Kevin, 2026-09-09 (a dedicated diagrams slide in the brand deck); Kevin, 2026-09-18 (dark and light diagrams must line up).

## Isometric drawings

The sources of `references/isometric.md` and `references/isometric-recipes.md`, as the isometric skill listed them through 2026-10-07:

- Prototemplate: DESIGN.md sections 2 (the line law and the auditor's blind spot for SVG), 6 (the isometric family), 7 (the 1-bit language), 9 (motion discipline and the dash rules) and 14 (the two read lines).
- Prototemplate: BRAND.md section 4 (marks as alpha masks, the shimmer as the one flourish), section 5 (the accent and its dark-band lift), section 8 (where the identity ships, with the Dossier, `/d/singularity-dossier`, as the direction the site grew from) and section 9 (the direction line and the avoid list, including glassmorphism).
- Prototemplate: `src/app/d/toolchain/diagrams/iso.ts`, `IsoSolid.tsx`, `IsoFrame.tsx`, `iso.css`, `DitheredMark.tsx` and `tc-stack-iso.tsx`.
- Prototemplate: `src/app/d/_v0/sections/Locadex.tsx`, `locadex.css`, `StackTower.tsx`, `FullStack.tsx` and `fullstack.css`; the production copies in `src/app/d/production/sections/`.
- Prototemplate: `src/app/d/toolchain/enterprise/GovernedColumn.tsx`, `src/app/d/toolchain/locadex/LocadexIso.tsx`, `src/app/craft/IsoDemo.tsx`, `src/app/craft/craft.css` and `src/app/craft/libraries.ts` (the kit entry shown on /docs).
- Prototemplate: `deck/slides/35-iso.html` (the brand deck's iso slide) and `docs/figma-v0-spec.md` (Locadex is an isometric diagram, never a gif).
- Prototemplate, local: `motion/films/blog-designing-docs/index.html`, the bridge block (round 7d).
- gt-cloud: `apps/landing/src/components/landing/shared/iso.ts`, `DitheredMark.tsx` and `DitheredLedgerMark.tsx`; `apps/landing/src/components/landing/sections/fullstack/StackTower.tsx`; `apps/landing/src/components/landing/sections/locadex/Locadex.tsx`; `apps/landing/src/components/pages/pricing/PricingStackDiagram.tsx` and `pricing-page.css`; `.agents/skills/gt-landing/references/design.md` (the landing's code map).
- Kevin, 2026-08-04: the first v0 build's only approved element was the Locadex animation, which "should have the locadex logo on it"; Locadex is never a gif.
- Kevin, 2026-08-11: the k/ pages restart. Pricing had "nothing redeeming but the isometrics"; marks are seated as alpha masks (the small PNG assets, never a flat logo overlay); seated words at chip scale are illegible.
- Kevin, the tower and Locadex rounds of 2026, quoted in the comments of `StackTower.tsx`, `FullStack.tsx` and `Locadex.tsx`: tags lie on the layers, the scanner stays inside the slab, the shimmer crosses the whole mark, the warm-to-accent pulse read as flashing, the top plate full size, no words by the diagram, the figure never moves down.
- Kevin, 2026-10-02: bring the isometric view back into the designing-docs film as a bridge, replacing nothing.
- Kevin's memory notes in Claude Code: `redesign-v0-verdict` (2026-08-04), `k-pages-restart-round` (2026-08-11, the seated-mark technique) and `gt-motion-films` (the 2026-10-02 request and round 7d landing on 2026-10-03).

## Lines added on 2026-10-10 (system v2, lane L4)

- The isometric skill merged into this one: its body became `references/isometric.md` and its recipes `references/isometric-recipes.md`, with section numbers kept; section 10 of `SKILL.md`, the description's isometric clause and the `isometry` area summarize it. Plan section 2.2 (the isometric skill merged into gt-diagrams; only the Locadex iso survived review, memory note `redesign-v0-verdict`) and lane L4 in plan section 5.4. The old skill's URL and every path under it redirect to `/skills/gt-diagrams` (308, `next.config.ts`).
- Section 2's lookup table and the live-component list moved to `references/components.md`, section 7's dash traps to `references/dashes.md`, section 3's fill lint detail and accent table to `references/color.md`, and section 9 to `references/checking.md`, unchanged, with summaries left in `SKILL.md`, to keep the body under the 24,000-byte budget (plan section 2.2).
- Related skills: `gt-verify` replaces `agent-browser` as the live check (inventory `skills.json` row 38, plan row N-28).
