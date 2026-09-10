# CI Integrity Audit

## Overview

Getting many PRs green quickly is exactly when check-suppression creeps in. This skill audits the CI-related changes in a set of PRs (yours or an agent's) for "green-washing" — making CI pass by silencing, skipping, or weakening checks instead of fixing the underlying issue — and produces an evidence-backed verdict per PR.

The bar: **a green check must mean the thing it checks is actually true.** Suppressing a check is acceptable only when the check is a proven false positive or a genuine conflict between two correct gates, the suppression is the narrowest possible scope (a single line), and it carries a documented reason. Everything else is debt disguised as green. Be brutally honest here — this is the one audit you must not grade charitably, because you are usually auditing your own work.

## The anti-pattern catalog (what to look for)

1. **Inline suppression comments** — `oxlint-disable` / `eslint-disable`, `// @ts-ignore`, `// @ts-expect-error`, `// @ts-nocheck`, `# noqa`, `# type: ignore`, `# ruff: noqa`, `#[allow(...)]`, `//nolint`, `prettier-ignore`. Worst form: file-level or blanket disables, or any with no `-- reason`.
2. **Test skips & weakened assertions** — `.skip(`, `.only(`, `xit(`, `xdescribe`, `it.skip` / `describe.skip` / `test.skip`, `t.Skip()`, `@pytest.mark.skip`, an early `return` in a test, commented-out assertions, or assertions softened to tautologies (`expect(true).toBe(true)`, `assert True`, `toBeDefined()` where a value check was meant).
3. **Deleted tests** — removing a `*.test.*` / `*.spec.*` file or `it`/`test`/`describe` blocks. Legitimate ONLY if the code under test was itself deleted; never to dodge a red suite.
4. **Threshold / budget weakening** — raising `max-warnings`, audit budgets (low/moderate/high/critical), coverage minimums, allowed-failure counts, or any "N is acceptable" knob.
5. **Editing the gate itself** — changes under `.github/workflows/`, `tsconfig*.json` (loosening `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`), `.oxlintrc` / `eslintrc` (rules → `off`/`warn`), `ruff.toml`, ignore files (`.oxlintignore`, `.eslintignore`), or **a custom guard script** (`tools/guards/…`). The most dangerous class: you can make any check pass by editing the check.
6. **Swallowing failures in CI** — `continue-on-error: true`, `if: false`, `|| true`, `|| exit 0`, redirecting a failing command to `/dev/null`, or rewording a step so it always succeeds.
7. **Hook / pipeline bypass** — `git commit --no-verify`, `--no-gpg-sign`, `[skip ci]` / `[ci skip]` in a commit message, force-push to hide history.
8. **Fake green** — stubbing or mocking the thing under test so it passes trivially (Mickey-Mouse tests), hardcoding a return value to satisfy an assertion, or catch-and-swallow that hides the real error.
9. **Silent fallbacks** — a `catch` that quietly substitutes a second implementation/default so the happy path "always works" (banned per the No-Fallbacks rule). Distinct from honest "data unavailable" degradation, which must be *surfaced as unavailable*, not silently replaced.
10. **Retry-until-green** — re-running CI hoping a *real* failure passes. Re-running is legitimate only for a proven infra flake (registry rate-limit, port collision) or after rebasing onto a fixed base.

## Workflow

1. **Enumerate the PRs.** From the runbook / `gh pr list`, list every PR whose CI you touched — include merged ones.
2. **Dump diffs to files** (avoids SIGPIPE on big diffs): `for n in $PRS; do gh pr diff "$n" > /tmp/audit_pr_$n.diff; done`. In zsh, build `$PRS` as an array (`PRS=(2438 2439 …)`); zsh does not word-split a plain string.
3. **Flag touched gates first** — highest signal: `gh pr diff $n --name-only | rg -i 'github/workflows|tsconfig|oxlintrc|\.oxlintignore|vitest\.config|jest\.config|guards/|ruff\.toml|\.npmrc|codecov'`. Any hit gets a full read.
4. **Grep added lines** for the catalog signatures with the Grep tool over the dumped diffs: `^\+.*(oxlint-disable|eslint-disable|ts-ignore|ts-expect-error|ts-nocheck|# *noqa|type: *ignore|\.skip\(|\.only\(|it\.skip|describe\.skip|test\.skip|xit\(|xdescribe|continue-on-error|\[skip ci\]|\[ci skip\]|no-verify|max-warnings|\bnolint\b)`.
5. **Check for deleted tests**: `rg -B5 "deleted file mode" /tmp/audit_pr_$n.diff | rg "^diff --git" | rg -i '\.(test|spec)\.|/tests?/'`.
6. **Check commit hygiene**: `git log --oneline -60 | rg -i 'skip[ -]ci|no.verify'`. `--no-verify` can't be seen post-hoc, so state explicitly whether you used it.
7. **Judge every hit** against the rubric below — read the surrounding context, never just count. Attribute each hit to *you* vs. the original author.
8. **Write the verdict**: per-PR + overall, with file:line evidence and any remediations. If you suppressed something, name it and either defend it against the rubric or fix it.

## Judgment rubric (justified vs. green-washing)

A suppression/skip is **justified** only if ALL hold:

- It targets a **proven false positive** or a **genuine conflict between two correct gates** (e.g. oxlint `no-restricted-types` wanting `X?` while `exactOptionalPropertyTypes` requires `X | undefined` for an explicitly-passed value).
- It is the **narrowest scope** — a single line, not a file or project.
- It carries a **`-- reason`** a reviewer can evaluate.
- The underlying behavior is still **correct** — you didn't hide a real bug.

It is **green-washing** if: the check was right and you silenced it; the scope is a whole file/project; there is no reason; a test was skipped or deleted to dodge a real failure; a threshold was bumped; or the gate itself was edited to stop flagging.

**Editing a guard** is its own category: allowed only to fix a false positive, and you must (a) **keep detection of the real cases** and (b) ideally **add a regression test** proving both halves — still catches real drift AND now ignores the false positive. A guard edit with no test is an unproven claim.

## Output

A short report: the catalog, then a per-PR table (PR · suppressions/skips/gate-edits found · justified? · file:line evidence), then an overall verdict and remediations (tighten a suppression, add a guard test, restore a check). Prefer a canvas when the result set is large. Pairs with `gh-fix-ci` (fix the failure) as its integrity counterpart, and with `cross-modal-review` when you want a second model to re-judge your calls.
