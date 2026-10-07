# Workflow shapes

Detail for sections 1, 2 and 5 of `gt-orchestration`. The shapes below are the phase sequences that gt-cloud workflows used in Claude Code sessions from August to October 2026, read from their scripts on 2026-10-05. The harness's `workflow-authoring` skill holds the script API (`agent`, `parallel`, `pipeline`, `phase`, `log`, schemas, `isolation`, `effort`).

## The shapes

| Shape | Phases | Used for | Example |
| --- | --- | --- | --- |
| Understand | Map | readers map a code area before a round, with file and line numbers | `docs-architecture-map` (2026-08-26), `map-dither-artifacts` (2026-10-05) |
| Design | Map, Design, Judge, Spec | a spec before a build fan-out | `signin-field-design` (2026-09-29) |
| Build | Build, Verify, Fix, Review | lanes from a spec, verified against its acceptance criteria | `signin-field-build` (2026-09-29) |
| Review | Find, Verify, Synthesize | a PR or a feature before merge | `review-pr-4887-inter-only` (2026-09-19) |
| Prove | Review, Mutate or Refute, Critic | a risky change: refuters, plus mutants that show the tests catch a revert | `verify-pr-4825-docs-regression` (2026-09-15), `verify-5091-alias` (2026-10-03) |
| Sweep | Sweep, Audit or Sweep, Verify | one mechanical change over many files, one agent per file group, then an adversarial re-read | `gt-color-template-sweep` (2026-08-06), `localize-and-comment-sweep` (2026-08-08) |
| Parity | Record, Synthesize, Fix, Verify | a redesign that must keep every tracking call and side effect of production | `onboarding-parity` (2026-10-02) |
| PR sweep | Update, Verify, Repair | every open PR brought up to date with its base, threads answered, obsolete ones flagged | `pr-sweep` (2026-10-02) |

Run one shape per workflow and read its result before choosing the next. The 2026-09-29 sign-in round ran Design, then Build with its own Review, and each later note from Kevin opened a smaller Build.

## Design: Map, Design, Judge, Spec

1. **Map.** Parallel readers, one per area, return measured facts with file and line. Later phases use the maps as given and re-measure only a missing number.
2. **Design.** Three designers take different angles on the same CONTEXT file and maps.
3. **Judge.** Two judges score each design from 1 to 10 per criterion and list concrete problems, the winner, the ideas worth grafting from the others, and open questions only Kevin can answer (empty unless a decision needs him).
   - The taste judge reads as Kevin: the founder who judges every product surface against the brand deck and wrote the words in CONTEXT.md. It penalizes ornament, boxes, entrance animations and gimmicks.
   - The engineering judge reads as the engineer who will build and maintain it. It penalizes plans that hand-wave engine changes or ignore reduced motion, WebGL failure, theme flips, resize and 390 px.
4. **Spec.** One agent writes `SPEC.md` from the winner with the grafts, resolving every judge problem or rejecting it with a reason (`references/briefs.md`, SPEC.md). The rejected ideas are recorded so a later round does not propose them again.

## Build: Build, Verify, Fix, Review

1. **Build.** One agent per lane of the spec's file plan, in parallel, with the lane prompt from `references/briefs.md`.
2. **Verify.** One agent judges every acceptance criterion and every gate with evidence (numbers, capture file names) against the live dev server, and returns `pass`, `criteria`, `gates` and `findings`.
3. **Fix.** A fixer takes the findings above minor, the failed criteria and the failed gates, fixes each and reruns the gate or capture that proves it. Verify runs again. The 2026-09-29 build capped this at two rounds; whatever is still failing after the cap goes into the report as open.
4. **Review.** A taste reviewer reads the after captures against Kevin's words, and an engineering reviewer reads the whole diff. Each returns `ship` or `fix-first` with findings marked blocker, major or minor. A fixer applies them, and a fixer who disagrees with a finding says why and leaves it.

## Review: Find, Verify, Synthesize

The shared context block every lens and refuter reads:

- the repository, the worktree, the branch, the head SHA and the base, and the instruction to work read-only;
- the saved diff file and a one-paragraph summary of what it changes;
- the dev server URL for measurements, the Playwright location, and the scratch folder for scripts;
- known and already-handled findings (bot findings and their fix commits), not to be reported again unless the fix itself is wrong;
- the reviewer's bar in Kevin's words, and the scope: concrete defects, dead code, stale documents, wasted work, visible regressions; no style nits; nothing the diff did not touch unless the diff made it wrong.

Lenses for #4887 (Inter as the only landing face): leftovers and stale references across the whole worktree; runtime correctness and efficiency of the changed code; visual and typographic regressions with measurements; font loading per route from network captures; completeness against the PR body and the bot reviews.

Each finding goes to three refuters with distinct lenses:

- **correctness**: is the claim true of the code on the pinned head;
- **reproduce**: can the problem be observed in the code path, in the browser or by measurement;
- **necessity**: would the fix change behaviour, bytes or a reader's understanding, and would it break a repository lint rule.

Each refuter defaults to refuted when it cannot substantiate the finding, and names a corrected fix when the finding stands but the proposed fix is wrong. A finding stands on at least two of three. The synthesis ranks confirmed findings with file, line and an exact fix, lists what was checked and found clean, states what blocks the merge and what can follow, and receives the refuted findings for context only.

## Prove: mutation testing

A mutant agent edits one file, one guarantee at a time: it reverts the guarantee, runs the tests, and restores the file before the next mutant. It ends with `git status --short` and `git diff --stat` showing no change. A surviving mutant is a finding that names the test that would kill it.

## Schemas

```json
{
  "findings": [
    { "title": "", "file": "repo-relative path", "line": 0, "severity": "high | medium | low",
      "evidence": "code excerpt, measurement or command output", "impact": "", "fix": "exact change" }
  ],
  "checked": ["what was inspected and found clean"]
}
```

```json
{ "refuted": true, "reasoning": "", "corrected_fix": "" }
```

```json
{
  "scores": [{ "key": "", "brand": 0, "feasibility": 0, "completeness": 0, "total": 0, "problems": [] }],
  "winner": "", "graft": [], "openQuestions": []
}
```

A sweep lane adds `uncertain` to its result. A verify agent returns `pass`, `criteria` (each with `pass` and evidence), `gates` and `findings` with a severity.

## A review skeleton

Plain JavaScript for the Workflow tool, with the context block and lenses filled in per review.

```js
export const meta = {
  name: 'review-pr-NNNN',
  description: 'Multi-lens review of PR NNNN with adversarial verification of every finding',
  phases: [
    { title: 'Find', detail: 'independent lenses over the diff' },
    { title: 'Verify', detail: 'three refuters per finding, distinct lenses' },
    { title: 'Synthesize', detail: 'rank confirmed findings with exact fixes' },
  ],
}

const CTX = `...the shared context block...`
const FINDINGS = { type: 'object', properties: { findings: { type: 'array', items: { type: 'object' } }, checked: { type: 'array', items: { type: 'string' } } }, required: ['findings', 'checked'] }
const VERDICT = { type: 'object', properties: { refuted: { type: 'boolean' }, reasoning: { type: 'string' }, corrected_fix: { type: 'string' } }, required: ['refuted', 'reasoning'] }
const LENSES = [{ key: 'leftovers', prompt: '...' }, { key: 'runtime', prompt: '...' }]

const results = await pipeline(
  LENSES,
  (l) => agent(`${CTX}\n${l.prompt}`, { label: `find:${l.key}`, phase: 'Find', schema: FINDINGS }),
  (found, l) => found && parallel(found.findings.map((f) => () =>
    parallel(['correctness', 'reproduce', 'necessity'].map((lens) => () =>
      agent(`${CTX}\nTry hard to refute this finding with the ${lens} lens. Default to refuted=true if you cannot substantiate it.\n${JSON.stringify(f)}`,
        { label: `verify:${lens}`, phase: 'Verify', schema: VERDICT, effort: 'high' })))
      .then((votes) => ({ ...f, lens: l.key, stands: votes.filter(Boolean).filter((v) => !v.refuted).length >= 2, votes })))),
)

phase('Synthesize')
const all = results.filter(Boolean).flat().filter(Boolean)
const confirmed = all.filter((f) => f.stands)
const refuted = all.filter((f) => !f.stands)
log(`${confirmed.length} confirmed, ${refuted.length} refuted`)
const report = await agent(`${CTX}\nConfirmed:\n${JSON.stringify(confirmed)}\nRefuted, for context only:\n${JSON.stringify(refuted.map((f) => f.title))}\nRank the confirmed findings with exact fixes, list what was found clean, and say what blocks the merge.`, { label: 'synthesize', phase: 'Synthesize' })
return { confirmed, refuted: refuted.map((f) => f.title), report }
```

## Dead agents and resume

- `agent()` returns `null` when an agent dies on a terminal error or is skipped. Filter with `.filter(Boolean)` and report each missing lane by name.
- Relaunch an interrupted run with `Workflow({ scriptPath, resumeFromRunId })`. The unchanged prefix of agent calls returns cached results, and the first changed or new call runs live. Read the run's `journal.jsonl` before diagnosing an empty result.
- Scripts cannot call `Date.now()`, `Math.random()` or `new Date()` with no argument. Pass timestamps in through `args`.
- `isolation: 'worktree'` gives each agent a fresh worktree. Use it only for agents that edit the same files in parallel. A gt-cloud worktree costs about 6 GB once its dependencies are installed (memory scratch-worktree-disk).
- Give `effort: 'high'` to verify, judge and spec stages, and leave mechanical stages at the session default.
