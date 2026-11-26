# Sources

Every source of `gt-code-review`, read on 2026-11-25. Each rule's reference
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

## gt-cloud configuration

- At head be57221fc0: `tooling/ts-config/tsconfig.base.json`,
  `tsconfig.node.json`, `tsconfig.nextjs.json`,
  `packages/translation/tsconfig.json`, `apps/admin/tsconfig.json`,
  `.oxlintrc.json`, and `packages/node/package.json` for the ICU parser
  dependency.
