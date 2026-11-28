---
name: gt-code-review
description: >-
  General Translation's code review for gt-cloud and its pipelines: mechanism
  over patch, reuse, cutover, stack shape, tests, TypeScript, Python, naming,
  security and a diff scan. Use when reviewing a gt-cloud diff or pull request,
  or before a push.
metadata:
  title: Code review
  areas: lints, workflow
  updated: 2026-11-26
  origin: prototemplate
  owner: P
---

# Code review

General Translation (GT) ships its product from gt-cloud
(`generaltranslation/gt-cloud`). The image and video translation stacks
reached it in late 2026 through
[#6184](https://github.com/generaltranslation/gt-cloud/pull/6184) to
[#6187](https://github.com/generaltranslation/gt-cloud/pull/6187), and the
review findings that followed are in
[#6189](https://github.com/generaltranslation/gt-cloud/pull/6189). The
cleanup removed regexes over prompt text, temporary workarounds and
patches, and named a hand-rolled ICU parser for replacement. The review of
a Cloudflare Worker stack
([#6213](https://github.com/generaltranslation/gt-cloud/pull/6213),
2026-11-26) and a teammate's earlier reviews of the agent, translation and
dashboard pull requests added the rest: text logic that assumes an English
source, helpers written again instead of reused, unbounded reconnects,
failures put in the wrong class, and compatibility for callers that never
shipped. This skill turns those reviews into rules that an agent applies
before a person has to.

Every rule is stated once, in the reference file of its group, with what to
look for, why, a short bad and good example, and its source: a decisions
log row, a memory note, a pull request, a commit or a published page.
`references/sources.md` lists every source.

## 1. How to run a review

1. **Check the stack's shape.** Run `scripts/stack-shape.mjs` over the
   stack's pull requests (section 4) and read each line against the rules
   of `references/stack.md`. A stack of the wrong shape is restacked before
   its lines are reviewed.
2. **Question the approach.** Before reading a line, write down what the
   change sets out to do and the mechanism it uses. Then ask "what is wrong
   with this approach?", and answer it in writing: which inputs break it,
   which simpler mechanism would do, which concept already exists for it,
   and what a reviewer would ask first. Answer the same question again of
   each fix that the review proposes. Every answer that holds is a finding.
3. **Fix the scope.** Name the base and the head by hash, for example
   `git diff <base>...<head>`. Read the pull request's body and the commits
   in order. A stacked pull request is reviewed against its parent branch,
   not against main.
4. **Run the scan.** Pipe the diff into the candidate scan of section 4. It
   lists lines that may break a rule. A scan line is a lead to read and is
   never a finding by itself.
5. **Read whole files.** For each changed file, read the functions the diff
   touches from top to bottom, and the callers of every changed signature.
   A rule about duplication or ownership needs the whole tree, so search it
   with `git grep -I -F -e <name>` for each new or removed name, constant
   and prompt heading (rule C5).
6. **Walk the groups.** Apply each group's rules in the order of section 3.
   Step 1 covered the stack group. The mechanism group comes next because
   it held most of the image stack's findings. Code that the diff moves verbatim from another file is
   reviewed like new code, and its findings are marked "carried", so the
   author can decide whether the fix belongs in this change. Where the code
   reads or writes text, check it against a source language with no spaces
   and no capitals (Japanese), one that capitalizes every noun (German) and
   one written right to left (Arabic) before English (rule M11).
7. **Read the bots' threads.** Each Greptile, Cursor or CodeQL finding on
   the pull request is fixed or answered with the reason. A reviewer holds
   approval while one is unanswered, and three bots flagging one line is
   reason enough to look.
8. **Verify each finding.** A finding names the file and line, the input
   that breaks it, and what goes wrong. Check it against the whole stack
   before it is reported, as #6189 states its findings were. A finding that
   does not hold up after the check goes to a "checked and not a finding"
   list with the reason, as #6189's "Not changed" section does.
9. **Report.** Use the format of section 2. Post nothing to GitHub or
   Slack unless the owner asks; the review goes to the session or person that
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

The report lists correctness findings first and approach and style
findings after them, and says which is which, as the #6213 review did, so
the author fixes what is wrong before what is shaped badly. Code behind a
flag that defaults to off is graded by what happens on the first org that
turns the flag on. The report ends with the "checked and not a finding"
list and with what the review did not read or run.

## 3. The rules

Each ID links to the group's reference, where the rule is stated with its
example and source.

**Stack and pull request shape:** [references/stack.md](references/stack.md)

| ID | Rule |
| --- | --- |
| K1 | A stack splits by concept, not by review round |
| K2 | A change to a shared package is its own pull request, first in the stack |
| K3 | Copied code enters only as far as it runs, and the pull request names it |
| K4 | A pull request over 1,500 lines to read justifies its size, and one idea is never split to fit a number |
| K5 | A change too small to stand alone joins the pull request it completes |
| K6 | One mechanism across products |
| K7 | A review round fixes classes, and a fix never grows the heuristic its finding questions |
| K8 | A reply states the design change, once per thread |

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
| M10 | Name the class of a problem, and fix the class once |
| M11 | Text logic works in every source language |
| M12 | A value the code built stays data |
| M13 | Every connection, retry and timer is bounded |
| M14 | A failure is classified by its cause |
| M15 | Writes that must hold together commit in one transaction |

**Cutover, not compatibility:** [references/cutover.md](references/cutover.md)

| ID | Rule |
| --- | --- |
| C1 | A replacement deletes the old path in the same change |
| C2 | No feature flag keeps an old implementation alive |
| C3 | A removal that persisted state depends on is proved and staged |
| C4 | Dead code leaves |
| C5 | A rename or removal searches the whole tree |
| C6 | No bookkeeping between repositories |
| C7 | Compatibility only for callers that shipped |

**Code quality:** [references/quality.md](references/quality.md)

| ID | Rule |
| --- | --- |
| Q1 | Names say what a thing is |
| Q2 | Small functions with one job, early returns and no nested ternaries |
| Q3 | No dead code, commented-out code, unused export or anonymous TODO |
| Q4 | One level of abstraction per function, and no speculative generality |
| Q5 | Errors are handled at the boundary |
| Q6 | No magic numbers, and each constant names its unit |
| Q7 | Pure functions where possible, and side effects at the edges |
| Q8 | No duplication across files |
| Q9 | Formatting comes from the formatter only |
| Q10 | Small diffs, and one concern per pull request |
| Q11 | Tests read as the spec |
| Q12 | Logs say what happened, with ids and no secrets |
| Q13 | Public interfaces are documented by their types first |
| Q14 | A lifecycle is an explicit state machine |
| Q15 | Reuse before writing: the repository, the framework and the platform |
| Q16 | Visible controls stay interactive and reachable |
| Q17 | Dependencies come from the workspace catalog |
| Q18 | A file lives in the package that owns and runs it |
| Q19 | A layer passes the deletion test |
| Q20 | A fixed class gets a check that keeps it out |

**Readability:** [references/quality.md](references/quality.md#readability)

| ID | Rule |
| --- | --- |
| R1 | The code reads top-down in call order |
| R2 | A reader needs no history to follow the code |
| R3 | File length, function length, nesting, and cyclomatic and cognitive complexity stay in bounds |

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
| TS11 | One schema per shape, and its type is inferred from it |

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
| N6 | Code in gt-cloud reads as gt-cloud's own |

**Security and keys:** [references/security.md](references/security.md)

| ID | Rule |
| --- | --- |
| S1 | Keys come from the environment through the key runner and are never printed |
| S2 | No key in the sandbox |
| S3 | Arguments, not shell strings |
| S4 | Untrusted sizes and shapes are checked before they are read |
| S5 | New dependencies are pinned and held back seven days |
| S6 | Customer content goes only to paid API tiers, and services bind 127.0.0.1 |
| S7 | Anonymous writes are throttled, and a client's ids are checked against their owner |
| S8 | A credential is held only while it is in use |

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

The scan covers M1, M2, M3, M5, M11, M12, Q2, Q3, Q14, Q15, C1, C2, T2,
T3, TS1, TS2, TS4, P5, S1, S3, N3 and N6. M11 flags word lists by name, a
pattern of five or more alternated words, a set of language codes,
`split('-')[0]`, a sentence-end class, a capital-letter test and a
whitespace split of text. N6 flags comment blocks over 6 lines, a limit
confirmed 2026-11-26. Q14 flags a type with 3 or more boolean fields as a
candidate state machine, never a finding by itself. It skips test files
for M1 and for the non-null part of TS2. On gt-cloud #6208 (133 files,
10,085 added lines) the rules of the first trial listed 20 candidates, and
two trial reviewers confirmed 14 of them, in 3 findings, and found 25 more
findings by reading. With N6, Q2 and Q3 the scan lists 53 candidates
there, 24 of them comment blocks and 9 nested conditionals. On #6213 at
8e7c440ab7 (the commit its 2026-11-26 review read), M11, M12, Q15 and S1
list 21 candidates, and they sit on 9 of the 10 review comments that a
pattern could find; the error-class ladder of rule Q5 needed reading. The
scan is a start and never the review. The other rules need reading. `node --test
skills/gt-code-review/scripts/scan-diff.test.mjs` runs its tests, which
build a diff for every rule from generated lines.

The stack check reads pull requests through the gh CLI and prints each
one that breaks K1 to K5, or N6 in its title, as `#number  RULE  reason`.

```bash
node skills/gt-code-review/scripts/stack-shape.mjs --repo generaltranslation/gt-cloud 6191 6192 6193 \
  --copied packages/translation/transcreate/
```

On 2026-11-26 it listed 8 lines on the video stack, 10 on the image stack
and 6 on the captions stack, among them #6053's title naming a commit and
#6159's 46,673 copied lines. `node --test
skills/gt-code-review/scripts/stack-shape.test.mjs` runs its tests.

## 5. Review checklist

- [ ] The approach was questioned in writing ("what is wrong with this approach?") before the lines, and again for each proposed fix.
- [ ] The stack check ran, and each shape finding was restacked or answered (K1 to K5).
- [ ] Every loop, state or check the stack adds was searched for in the other products' stacks (K6).
- [ ] Every fix of a finding was asked whether the code should exist at all before a case was added (K7).
- [ ] The base and head are named by hash, and the stack's parent is the base.
- [ ] The scan ran, and each of its lines was read and either became a finding or was dismissed.
- [ ] Every new or removed name was searched across the whole tree, tests and prompts included.
- [ ] Text logic was read against Japanese, German and Arabic sources, not only English (M11).
- [ ] Every new helper was searched for in the repository and its dependencies first (Q15).
- [ ] Every bot thread on the pull request is fixed or answered.
- [ ] Each finding names a file and line, an input, what goes wrong and a fix.
- [ ] Each finding was checked against the whole stack before it was written.
- [ ] Findings that did not hold up are listed with the reason.
- [ ] Nothing was posted to GitHub or Slack without the owner's word.

## Related skills, by the code under review

- TypeScript: the rules in `references/typescript.md`, and `fix-types` when the compiler reports errors to clear.
- Security: `security-best-practices` for a language's secure defaults, `security-threat-model` for a new surface or trust boundary, and `security-doctor-chain` for a full scan.
- React: `react-doctor` for a React or Next.js codebase health check, and `vercel:react-best-practices` for rendering and data fetching.
- Tests: `tdd` when the change starts from a failing test, and `test-writing` for the tests a change needs.
- Design: `codebase-design` for module boundaries and interfaces, and `less-is-more` when a change adds more than it removes.
- Bugs: `diagnosing-bugs` when a finding needs a reproduction before a fix.
- State: `state-machine-dfa` when a review finds flags or a phase field that encode a lifecycle (rule Q14).
- Performance: `perf` for a measured slowdown, and `gt-performance` for GT's visual surfaces.
- Accessibility: `accessibility` for UI code.
- Prototemplate: `gt-lints` for the lints and gates that hold a rule, and `gt-verify` to prove a fix is done.

## Authors

Kevin Liu wrote this skill and owns its rules.

## Sources

Every rule's source is beside the rule in its reference file, and
[references/sources.md](references/sources.md) lists them all with the date
each was read.
