---
name: gt-code-review
description: >-
  The code review General Translation applies to gt-cloud and to Kevin's
  translation pipelines, built from Kevin Liu's rulings, Brian Lou's reviews
  and cleanups of the image and video translation stacks, and Matt Pocock's
  TypeScript guidance. Its rules cover mechanism over patch (no regex on
  model or prompt text, no case-tuned constants, no hand-rolled parser where
  a library exists, no silent fallback), cutover over compatibility, tests,
  TypeScript, Python, naming and writing, and security and keys, each with
  what to look for, why, a bad and good example and its source. A diff scan
  lists candidate lines by rule. Use when reviewing a diff, a branch or a
  pull request in gt-cloud or a pipeline repository, before any push to
  gt-cloud, or when Kevin asks for a review to Brian's standard.
metadata:
  title: Code review
  areas: lints, workflow
  updated: 2026-11-26
  origin: prototemplate
  owner: P
---

# Code review

General Translation (GT) ships its product from gt-cloud
(`generaltranslation/gt-cloud`). Brian Lou reviews the image and video
translation stacks there. On 2026-11-24 Kevin said "idk why you keep
shipping sloppy code" after Brian rebuilt the image stack as #6184 to #6187
and opened #6189 for its findings. On 2026-11-25 Brian named what he removed
next: regexes, temporary workarounds and patches, a regex match on a
sentence in a prompt, and a hand-rolled ICU parser. This skill turns those
reviews into rules that an agent applies before Brian has to.

Every rule is stated once, in the reference file of its group, with what to
look for, why, a short bad and good example, and its source: a decisions
log row or memory note for Kevin, a pull request or commit link for Brian,
and a URL for Matt Pocock. `references/sources.md` lists every source.

## 1. How to run a review

1. **Fix the scope.** Name the base and the head by hash, for example
   `git diff <base>...<head>`. Read the pull request's body and the commits
   in order. A stacked pull request is reviewed against its parent branch,
   not against main.
2. **Run the scan.** Pipe the diff into the candidate scan of section 4. It
   lists lines that may break a rule. A scan line is a lead to read and is
   never a finding by itself.
3. **Read whole files.** For each changed file, read the functions the diff
   touches from top to bottom, and the callers of every changed signature.
   A rule about duplication or ownership needs the whole tree, so search it
   with `git grep -I -F -e <name>` for each new or removed name, constant
   and prompt heading (rule C5).
4. **Walk the groups.** Apply each group's rules in the order of section 3.
   The mechanism group comes first because it held most of Brian's
   findings. Code that the diff moves verbatim from another file is
   reviewed like new code, and its findings are marked "carried", so the
   author can decide whether the fix belongs in this change.
5. **Verify each finding.** A finding names the file and line, the input
   that breaks it, and what goes wrong. Check it against the whole stack
   before it is reported, as Brian's #6189 states it did. A finding that
   does not hold up after the check goes to a "checked and not a finding"
   list with the reason, as #6189's "Not changed" section does.
6. **Report.** Use the format of section 2. Post nothing to GitHub or
   Slack unless Kevin asks; the review goes to the session or person that
   asked for it.

The review reads code. It runs tests only where the asker allows it, and it
never runs a command that calls a paid service or holds a key.

## 2. Severity and the report

| Severity | Meaning | Example from the image stack |
| --- | --- | --- |
| P1 | A wrong result, lost work, a wrong bill or a security hole on a real input | Parallel stack writes overwrote each other; failed translations looked finished |
| P2 | A rule of this skill broken in a way that will cost a later change | A decision read from a sentence in a prompt; a table of scripts kept in four places |
| P3 | Naming, writing or test hygiene | A test file named after the round that found its case |

Each finding is one block:

```
[P1] M5 imageTools.ts:389 readCriticDue
Input: the sandbox exec times out while reading critic_due.
Wrong: the error leaves holdForCritic, so the worker's own write fails though it never ran.
Fix: catch every error that is not an abort, return undefined, re-read in 5 minutes.
```

Code behind a flag that defaults to off is graded by what happens on the
first org that turns the flag on. The report ends with the "checked and not
a finding" list and with what the review did not read or run.

## 3. The rules

Each ID links to the group's reference, where the rule is stated with its
example and source.

**Mechanism over patch:** [references/mechanism.md](references/mechanism.md)

| ID | Rule |
| --- | --- |
| M1 | No regex or substring test on model output, prompt text or note prose to make a decision |
| M2 | No case-tuned constant |
| M3 | No hand-rolled parser or language table where a maintained library exists |
| M4 | One owner for each fact |
| M5 | No silent fallback |
| M6 | A retryable failure is never stored as an answer |
| M7 | Bound the work before a paid call, and bill what was spent |
| M8 | Code never overrides the judgement it asked a model for |
| M9 | A new route or kind keeps the invariants of the records and queues it joins |

**Cutover, not compatibility:** [references/cutover.md](references/cutover.md)

| ID | Rule |
| --- | --- |
| C1 | A replacement deletes the old path in the same change |
| C2 | No feature flag keeps an old implementation alive |
| C3 | A removal that persisted state depends on is proved and staged |
| C4 | Dead code leaves |
| C5 | A rename or removal searches the whole tree |
| C6 | No bookkeeping between repositories |

**Tests:** [references/tests.md](references/tests.md)

| ID | Rule |
| --- | --- |
| T1 | Fixtures are generated or synthetic |
| T2 | One test per rule, named by the behaviour it holds |
| T3 | No wall-clock assertion |
| T4 | A reader is tested on a real answer's shape, and stand-ins keep the real signature |
| T5 | Tests run with every key unset |
| T6 | A change runs the tests that read its file by path |

**TypeScript:** [references/typescript.md](references/typescript.md), with
the adoption table for gt-cloud

| ID | Rule |
| --- | --- |
| TS1 | Outside data is `unknown` until a schema parses it |
| TS2 | No `as unknown as`, and no `!` where a check can stand |
| TS3 | `satisfies` checks a value and keeps its type |
| TS4 | `as const` objects and derived unions in place of enums |
| TS5 | States are discriminated unions, and a switch over them is exhaustive |
| TS6 | Branded types for values that were validated |
| TS7 | A generic or an overload only where the types need one |
| TS8 | `type` by default, readonly parameters, `Record` for dynamic keys |
| TS9 | An exported top-level function declares its return type |
| TS10 | The strict compiler options of the TSConfig cheat sheet |

**Python:** [references/python.md](references/python.md)

| ID | Rule |
| --- | --- |
| P1 | Every model call has a strict response schema |
| P2 | Kinds and reasons are typed fields |
| P3 | Explicit arguments in place of ambient environment and globals |
| P4 | A new name never hides an old one |
| P5 | Lint and types gate the commit by exit code |
| P6 | Work on the crop, not the whole image |

**Naming and writing:** [references/naming-writing.md](references/naming-writing.md)

| ID | Rule |
| --- | --- |
| N1 | Names match the schema documents, and a rename changes all of them at once |
| N2 | One term for one concept |
| N3 | Comments state invariants, not history |
| N4 | Plain declarative English in code, prompts, commits and pull requests |
| N5 | A pull request body states what changed, the tests with counts, what is not proved and what was checked and rejected |

**Security and keys:** [references/security.md](references/security.md)

| ID | Rule |
| --- | --- |
| S1 | Keys come from the environment through the key runner and are never printed |
| S2 | No key in the sandbox |
| S3 | Arguments, not shell strings |
| S4 | Untrusted sizes and shapes are checked before they are read |
| S5 | New dependencies are pinned and held back seven days |
| S6 | Customer content goes only to paid API tiers, and services bind 127.0.0.1 |

## 4. The candidate scan

`scripts/scan-diff.mjs` reads a unified diff on stdin and prints each added
line that matches a rule's pattern, as `path:line  RULE  text`. It reads
code, which is text that people wrote and that has a grammar, so pattern
matching suits it; rule M1 is about model output and prompt prose, which
have neither.

```bash
git diff <base>...<head> | node skills/gt-code-review/scripts/scan-diff.mjs
git diff <base>...<head> | node skills/gt-code-review/scripts/scan-diff.mjs --json
```

The scan covers M1, M2, M3, M5, C1, C2, T2, T3, TS1, TS2, TS4, P5, S1,
S3 and N3. It skips test files for M1 and for the non-null part of TS2. On
gt-cloud #6208 (133 files, 10,085 added lines) it lists 20 candidates. Two
trial reviewers confirmed 14 of them, in 3 findings, and found 25 more
findings by reading, so the scan is a start and never the review. The other rules need reading. `node --test
skills/gt-code-review/scripts/scan-diff.test.mjs` runs its tests, which
build a diff for every rule from generated lines.

## 5. Review checklist

- [ ] The base and head are named by hash, and the stack's parent is the base.
- [ ] The scan ran, and each of its lines was read and either became a finding or was dismissed.
- [ ] Every new or removed name was searched across the whole tree, tests and prompts included.
- [ ] Each finding names a file and line, an input, what goes wrong and a fix.
- [ ] Each finding was checked against the whole stack before it was written.
- [ ] Findings that did not hold up are listed with the reason.
- [ ] Nothing was posted to GitHub or Slack without Kevin's word.

## Authors

Kevin Liu wrote this skill and owns its rules. The mechanism, cutover,
naming and writing rules come from his rulings on the translation
pipelines. Brian Lou's reviews and cleanups of the image and video
translation stacks are the source of the rules that cite him, and each of
those rules links his commit or pull request. Matt Pocock's published
TypeScript guidance is the source of the rules that cite his pages.

## Sources

Every rule's source is beside the rule in its reference file, and
[references/sources.md](references/sources.md) lists them all with the date
each was read.
