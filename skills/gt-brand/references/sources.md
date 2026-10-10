# Sources

Where every line of `SKILL.md` and the files beside it comes from. Each line added after 2026-10-07 names its memory, transcript or inventory row and its date.

## Sources of the skill as written through 2026-10-07

- Prototemplate: BRAND.md sections 1 to 9 (the name, the idea, the character and voice, the mark, color, type, language as material, where it ships, the context for partners and the final avoid list).
- Prototemplate: DESIGN.md sections 1 (the four-color system), 4 (voices), 5 (the doubled line), 7 (the Bayer language), 8 (the moving type law), 12 (the mobile type ladder) and 15 (chrome exceptions).
- Prototemplate: `deck/parts/head.html` (tokens, the type rules at lines 55 to 69, the GT word at 74 to 78, the book head at 279 to 293, semantic icon hues at 113 to 125) and `deck/DECK-GRAMMAR.md` (type, color, speed marks, defects).
- Prototemplate: deck slides 12 (voice), 15 (naming), 16 (the mark), 25 (small sizes), 26 (color), 27 (type), 28 (scripts), 29 (the ladder), 36 (language as material), 39 (anti-patterns), 93 (fixed points).
- Prototemplate: `src/lib/fonts.ts`, `src/lib/brand-fonts.ts`, `src/components/viewer/tokens.css` (type tokens and base rules), `src/app/globals.css`, `deck/fonts/deck-fonts.css`, `scripts/build/deck.mjs`.
- Prototemplate: `src/app/present/presenter.css` (the mark inverted on paper), `src/lib/marks.ts`, `scripts/build/speed-marks.mjs`, `src/app/d/toolchain/diagrams/DitheredMark.tsx`, `src/app/d/toolchain/components/LocaleTag.tsx`, `src/components/shared/EverySentence.tsx`, `src/components/shared/diagrams/DoubledLine.tsx`.
- Prototemplate: `motion/MOTION.md`, local and untracked (the films' material palettes and one accent per film).
- Prototemplate: `scripts/lint/type.mjs`, `scripts/lint/oxlint-plugins/gt-ui.ts` and `.oxlintrc.json`; `src/app/present/fonts.ts`; `src/app/system-ledger.css` and `src/app/anatomy-wall.css` (the gallery's accents).
- gt-cloud at origin/main e17fce499 (2026-10-05): `apps/landing/src/lib/fonts.ts`, `apps/landing/src/lib/fonts-prose.ts`, `apps/dashboard/src/app/brand-tokens.css`, `tooling/oxlint-plugins/gt-ui.ts`, `packages/ui/src/components/icons/BrandMark.tsx`, `packages/ui/src/components/ui/LocaleFlag.tsx`.
- rsms.me/inter (the quick start's `font-feature-settings: 'liga' 1, 'calt' 1; /* fix for Chrome */`) and rsms.me/inter/dynmetrics (removed), read 2026-10-05; the font file read with fontkit.
- Kevin, 2026-10-05: enforce the correct Rasmus Inter, one type system in tokens, held by a lint.
- Kevin, 2026-09-29: the speed set chosen; regenerate from the script.
- Kevin, 2026-09-25: the dashboard verdict ("kerning needs to be adjusted"), the deck as the standard, and the tracking ladder measured from the deck and the landing.
- Kevin, 2026-09-18: "change switzer to inter everywhere" (gt-cloud PR 4887).
- Kevin, 2026-08-11: the final basement questionnaire and its avoid list; zero em dashes in rendered prose.
- Kevin, 2026-08-06: the Dossier (`/d/singularity-dossier`) is the completed reference; sensitive questionnaire facts stay off the public site. Kevin, 2026-10-06: the brand has evolved past the Dossier, and BRAND.md section 8 waited for his decision. Kevin, 2026-10-07: "fix the dossier references"; the shipped site is the site's reference, and the Dossier is the direction it grew from.
- Third-party material: Kevin, 2026-08-05 (the gray customer logo), 2026-09-25 (the licence), 2026-10-02 (never privatize the repository); `LICENSE`, `public/media/README.md`, `public/fonts/google/README.md`.

## Lines added on 2026-10-10 (system v2, lane L4)

- `references/marks.md`, "Reviewing a new GT mark", and the "A new mark" line in section 5: Kevin's memory note `gt-globe-marks` (updated 2026-10-09 after he rejected round 3; round 2 rated 5 out of 10). Inventory `memories.json` row "gt-globe-marks", plan row N-9. The round log, the sources and the artifact stay in the memory note.
- `references/color.md` holds section 3's four color exceptions, `references/type.md` ("The rules of SKILL.md section 4 in full") holds the binding, tracking table, ladders, scripts, exceptions and enforcement blocks, and section 8's third-party bullets fold into one paragraph over `references/third-party.md`. All moved unchanged to keep the body under the 24,000-byte budget (plan section 2.2). Section 6's devices moved to `references/language.md` the same way.
- Related skills: `gt-verify` replaces `agent-browser` (inventory `skills.json` row 38, plan row N-28); the isometric skill merged into `gt-diagrams` on 2026-10-10.
