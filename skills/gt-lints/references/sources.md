# Sources

Where every line of `SKILL.md` and the files beside it comes from. Each line added after 2026-10-08 names its memory, transcript or inventory row and its date.

## Sources of the skill as written through 2026-10-08

- Prototemplate: `package.json` (scripts); `scripts/lint/lines.mjs`;
  `scripts/lint/shell.mjs`; `scripts/lint/practices.mjs` and
  `scripts/lint/practices.baseline.json`; `scripts/lint/pictures.mjs` and
  `scripts/lint/pictures.test.mjs`; `.oxlintrc.json`;
  `scripts/lint/oxlint-plugins/gt-ui.ts`; `scripts/check/pagecheck/README.md`;
  `docs/SHIP-LOOP.md` sections 0 to 4 and 7; `DESIGN.md` sections 2, 3, 7
  and 15; `docs/ARTIFACT-PICTURES.md` ("The lint"); `ARCHITECTURE.md`
  (the direction registry); commits 8c989de (2026-09-28), 946b1c9
  (2026-10-01), d0f6c7e and f8dfa8b (2026-10-05).
- gt-cloud (main): `package.json` (`lint`, `lint:fix`, `format`);
  `.oxlintrc.json`; `.oxfmtrc.json`; `lefthook.yml`;
  `.github/workflows/ci.yml`; `scripts/check-email-identities.mjs`;
  `tooling/oxlint-plugins/gt-ui.ts` and `gt-ui.test.ts`; #5007 (0cfb5844a,
  2026-09-29). Open branches, read 2026-10-05: `k/artifact-picture-standard`
  (#5133), `k/dashboard-shell-ia` (#4977), `k/dashboard-icon-tiers` (#5029).
- Prototemplate working tree, 2026-10-05: `scripts/lint/type.mjs` (its header
  comment and `ALLOW_FILES`), written in the type round; `tsconfig.json`.
- Claude memory notes: landing-icon-rule, ship-loop-hard-gates,
  page-check-system, dashboard-deck-grammar, artifact-picture-standard.
- Kevin's directives: 2026-09-28 ("lint for this properly now", the single
  rail), 2026-10-01 ("carry over the system of checking the pages into
  prototemplate"), 2026-10-05 (the artifact picture standard, the correct
  Rasmus Inter).

## Lines added on 2026-10-10 (system v2, lane L4)

- Section 2, the rows for `lint:registries`, `lint:tools`, `lint:copies` and `test:copies`, `lint:public` and `test:public`, and `test:skill-scripts`, and the `lint:static`, `lint:all`, `build` and `gen:all` chains: `package.json` on Prototemplate main at 39ce9645 (the scripts restructure, L1b) and the headers of `scripts/lint/public.mjs`, `scripts/lint/copies.mjs`, `scripts/lint/registries.mjs`, `scripts/build/tools.mjs` and `scripts/skills/script-tests.mjs`, read on 2026-10-10. Plan section 2.2 (gt-lints row) and plan rows C7, C12, C13, C14 and C24.
- Section 3, "Gates on open branches", and `references/gt-ui-rules.md` and `references/prototemplate-gates.md`: each branch-only fact tagged with its pull request's state, read with `gh pr view` on 2026-10-10 (#5133, #4977 and #5029 open). Inventory `skills.json` row 9 (gt-lints documents gates that exist only on open branches), plan row N-27.
- Section 2's per-gate subsections moved to `references/prototemplate-gates.md`, unchanged, with a summary left in `SKILL.md`, to keep the body under the 24,000-byte budget (plan section 2.2).
- Related skills: `gt-verify` replaces `agent-browser` as the visual check (inventory `skills.json` row 38, plan row N-28).
