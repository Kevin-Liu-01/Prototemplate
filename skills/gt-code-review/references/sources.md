# Sources

Every source of `gt-code-review`, read on 2026-11-25 and, for the
teammate reviews, on 2026-11-26. Each rule's reference
file gives the exact link or row beside the rule.

## Rulings, notes and rules

- The decisions log of the translation pipeline, rows of 2026-10-16
  ("Fixes are mechanisms, not band-aids"), 2026-11-16 14:53 PST ("Yes, full
  cutover"), 2026-11-21 (no flag for the definitive system), 2026-11-24
  10:24 PST (dead code removed after a whole-tree search), 2026-11-24
  23:28 PST (replace the regexes and fragile patches with mechanisms) and
  2026-11-25 04:59 PST (an off step refuses; no silent fallback).
- The agent rules of the same repositories: code rules 5 and 8, media and
  git rules 1 and 2, key rules 1, 2 and 4, rented machine rule 1, and
  writing rules 1 to 3.
- Claude memory notes: `production-grade-before-push` (2026-11-24,
  "idk why you keep shipping sloppy code"), `no-bandaids-and-self-tagging`,
  `free-agent-no-flag-gpu-required`, `gtcloud-no-hashes-no-parity`,
  `whole-tree-before-a-change-of-names`, `stand-ins-on-signature-change`,
  `grep-tests-before-key-removal`, `wall-clock-tests-fail-the-gate`,
  `real-files-before-a-reader-joins`, `tests-with-keys-unset`,
  `tests-that-read-source`, `prompt-headings-are-keys`,
  `new-name-hides-old-name`, `lint-rc-gates-commit`,
  `monkeypatch-global-a-thread-swaps` and `smart-tools-1123`.
- The wiki page `cutover-not-compatibility`.
- Review comments on gt-cloud
  [#5902](https://github.com/generaltranslation/gt-cloud/pull/5902#issuecomment-6871659893),
  [#5903](https://github.com/generaltranslation/gt-cloud/pull/5903#issuecomment-6871660219),
  [#5904](https://github.com/generaltranslation/gt-cloud/pull/5904#issuecomment-6871660487)
  and
  [#5905](https://github.com/generaltranslation/gt-cloud/pull/5905#issuecomment-6871660755),
  and the replies on
  [#6207](https://github.com/generaltranslation/gt-cloud/pull/6207#discussion_r4688383333).

## Stack shape

- The gt-cloud stacks of 2026-11-26, read with `scripts/stack-shape.mjs`:
  video [#6053](https://github.com/generaltranslation/gt-cloud/pull/6053),
  [#6158](https://github.com/generaltranslation/gt-cloud/pull/6158) to
  [#6161](https://github.com/generaltranslation/gt-cloud/pull/6161) and
  [#6194](https://github.com/generaltranslation/gt-cloud/pull/6194); image
  [#6191](https://github.com/generaltranslation/gt-cloud/pull/6191) to
  [#6212](https://github.com/generaltranslation/gt-cloud/pull/6212); captions
  [#6213](https://github.com/generaltranslation/gt-cloud/pull/6213) to
  [#6221](https://github.com/generaltranslation/gt-cloud/pull/6221).
- The second review round of #6213 on 2026-11-26, 18:28 to 19:58 UTC, against
  the fixes of its first round.
- https://google.github.io/eng-practices/review/developer/small-cls.html.

## gt-cloud reviews and cleanups

- A review of 2026-11-25, relayed to the coordinator: it removed regexes and
  temporary workarounds and patches from the pull request stack; one
  example was a regex match on a sentence in a prompt; a hand-rolled ICU
  parser remains to be replaced.
- The rebuilt image stack and its bodies:
  [#6184](https://github.com/generaltranslation/gt-cloud/pull/6184),
  [#6185](https://github.com/generaltranslation/gt-cloud/pull/6185),
  [#6186](https://github.com/generaltranslation/gt-cloud/pull/6186),
  [#6187](https://github.com/generaltranslation/gt-cloud/pull/6187), and
  the review findings in
  [#6189](https://github.com/generaltranslation/gt-cloud/pull/6189).
- The workflow patch removal in
  [#6200](https://github.com/generaltranslation/gt-cloud/pull/6200) and
  [#6203](https://github.com/generaltranslation/gt-cloud/pull/6203), and
  the replies on
  [#6197](https://github.com/generaltranslation/gt-cloud/pull/6197#discussion_r4685929131),
  [#5903](https://github.com/generaltranslation/gt-cloud/pull/5903#discussion_r4566762250)
  and
  [#5904](https://github.com/generaltranslation/gt-cloud/pull/5904#issuecomment-6926079504).
- The commits on the image stack, each linked beside its rule: b1551e9,
  4160ff8, d5ae706, 7a43680, 24435db, 90a1f11, 9891f59, 23c4e13, c2c8689,
  4d5780f, eaa3b96, 812353e, 10633dd, 8677867, 26cd4d1, 97d2e5b, 5ac7738,
  cdb829d, d6d77f2, aa4d8d0 and d858ade.
- The bots' findings on the image stack that the note
  `production-grade-before-push` lists (Greptile and Cursor Bugbot): lost
  parallel writes, failed translations that looked finished, stale critic
  approvals, and one false difference that dropped real faults.

## Teammate reviews on gt-cloud

Read on 2026-11-26 through the GitHub API, for rules M5, M7, M11 to M14,
C4, C7, Q5, Q8, Q14, Q15, TS1, TS5, TS11, S1 and S7, and the order of the
report in section 2. Read again on 2026-11-27, every comment of the two
teammate reviewers on Kevin's pull requests, 73 in all, for rules M15, Q16
to Q18 and S8:

- The review of a Cloudflare Worker stack,
  [#6213](https://github.com/generaltranslation/gt-cloud/pull/6213),
  2026-11-26: a summary that puts correctness first and approach second,
  and 23 line comments. Its main approach finding is text logic that
  assumes an English source.
- Earlier line reviews of the agent, translation, sandbox, landing and
  dashboard pull requests, each linked beside its rule:
  [#6121](https://github.com/generaltranslation/gt-cloud/pull/6121),
  [#6028](https://github.com/generaltranslation/gt-cloud/pull/6028),
  [#6004](https://github.com/generaltranslation/gt-cloud/pull/6004),
  [#5428](https://github.com/generaltranslation/gt-cloud/pull/5428),
  [#5422](https://github.com/generaltranslation/gt-cloud/pull/5422),
  [#5402](https://github.com/generaltranslation/gt-cloud/pull/5402),
  [#5401](https://github.com/generaltranslation/gt-cloud/pull/5401),
  [#5291](https://github.com/generaltranslation/gt-cloud/pull/5291),
  [#5195](https://github.com/generaltranslation/gt-cloud/pull/5195),
  [#5098](https://github.com/generaltranslation/gt-cloud/pull/5098),
  [#5086](https://github.com/generaltranslation/gt-cloud/pull/5086),
  [#5046](https://github.com/generaltranslation/gt-cloud/pull/5046),
  [#4978](https://github.com/generaltranslation/gt-cloud/pull/4978),
  [#4973](https://github.com/generaltranslation/gt-cloud/pull/4973),
  [#4933](https://github.com/generaltranslation/gt-cloud/pull/4933),
  [#4882](https://github.com/generaltranslation/gt-cloud/pull/4882),
  [#4877](https://github.com/generaltranslation/gt-cloud/pull/4877),
  [#4865](https://github.com/generaltranslation/gt-cloud/pull/4865) and
  [#4798](https://github.com/generaltranslation/gt-cloud/pull/4798).
- Memory note `gt-next-reviewer-patterns` (no compatibility code for URLs
  only days old).

## TypeScript pages

- https://www.totaltypescript.com/how-to-use-satisfies-operator
- https://www.totaltypescript.com/books/total-typescript-essentials/annotations-and-assertions
- https://www.totaltypescript.com/books/total-typescript-essentials/deriving-types
- https://www.totaltypescript.com/books/total-typescript-essentials/unions-literals-and-narrowing
- https://www.totaltypescript.com/books/total-typescript-essentials/mutability
- https://www.totaltypescript.com/books/total-typescript-essentials/objects
- https://www.totaltypescript.com/why-i-dont-like-typescript-enums
- https://www.totaltypescript.com/discriminated-unions-are-a-devs-best-friend
- https://www.totaltypescript.com/any-considered-harmful
- https://www.totaltypescript.com/when-should-you-use-zod
- https://www.totaltypescript.com/workshops/advanced-typescript-patterns/branded-types/what-is-a-branded-type
- https://www.totaltypescript.com/tips/know-when-to-use-generics
- https://www.totaltypescript.com/workshops/typescript-generics/function-overloads/function-overloads-vs-union-types/solution
- https://www.totaltypescript.com/type-vs-interface-which-should-you-use
- https://www.totaltypescript.com/the-empty-object-type-in-typescript
- https://www.totaltypescript.com/should-you-declare-return-types
- https://www.totaltypescript.com/tips/dont-use-return-types-unless
- https://www.totaltypescript.com/tsconfig-cheat-sheet
- https://www.totaltypescript.com/ts-reset and https://github.com/total-typescript/ts-reset

## Code quality and readability pages

Read on 2026-11-26 for `references/quality.md`:

- https://google.github.io/styleguide/tsguide.html and https://google.github.io/styleguide/pyguide.html
- https://peps.python.org/pep-0008/
- https://refactoring.guru/smells/long-method, https://refactoring.guru/smells/dead-code, https://refactoring.guru/smells/speculative-generality, https://refactoring.guru/smells/duplicate-code and https://refactoring.guru/smells/comments
- https://refactoring.guru/replace-nested-conditional-with-guard-clauses, https://refactoring.guru/replace-magic-number-with-symbolic-constant and https://refactoring.guru/extract-method
- https://eslint.org/docs/latest/rules/no-nested-ternary, https://eslint.org/docs/latest/rules/max-depth and https://eslint.org/docs/latest/rules/max-lines
- https://rules.sonarsource.com/typescript/RSPEC-3776/
- https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell
- https://oxc.rs/docs/guide/usage/formatter and https://docs.astral.sh/ruff/formatter/
- https://google.github.io/eng-practices/review/developer/small-cls.html
- https://abseil.io/resources/swe-book/html/ch12.html and https://abseil.io/resources/swe-book/html/ch13.html
- https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html

## gt-cloud configuration

- At head be57221fc0: `tooling/ts-config/tsconfig.base.json`,
  `tsconfig.node.json`, `tsconfig.nextjs.json`,
  `packages/translation/tsconfig.json`, `apps/admin/tsconfig.json`,
  `.oxlintrc.json`, and `packages/node/package.json` for the ICU parser
  dependency.
