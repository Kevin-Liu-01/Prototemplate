# Project Doctor

Stand up a **parameterized, config-driven doctor** in any project — a CLI that scores the
codebase 0-100 and that the team (and agents) drive toward a perfect **100**. This is the
executable companion to the concept in `wiki/concepts/doctor-pattern.md`; read that for the
why. This skill is the how.

## The idea (why 100 is the point)

A doctor turns "is this codebase healthy?" into a single number you can target. Scoring on
**unique rules, not occurrences** means the score rewards *systemic* fixes: silence a whole
check once and the score jumps, instead of grinding down 200 individual items. A perfect
100 means every invariant the project cares about currently holds. You **seek 100** by
fixing error rules first, then warnings, re-scanning until the score tops out — then you
**ratchet `--min-score` up to 100 in CI** so it can never regress.

## Scoring (identical across every doctor)

```
score = 100 − 1.5 × (unique error rules) − 0.75 × (unique warn rules)   # clamped [0,100]
```

A "rule" is a check key; its worst severity decides error (`fail`, −1.5) vs warn (`warn`,
−0.75). `info`/`pass` never score. Errors weigh 2× warnings, so fix them first.

## Scaffold

1. Copy `templates/doctor.ts` (bundled with this skill) into the project's `scripts/`.
2. Edit the **CONFIG block** — the parameters that define *this* project's doctor: name,
   target score, source dirs, and any thresholds your checks read (`maxFileLines`,
   `bannedTokens`, schema paths, required env keys, etc.).
3. Fill the **CHECKS array** — one entry per invariant the project must hold. Each check
   returns findings via the `rule()` helper, which emits **one summary finding per rule**
   plus per-item `info` lines. This aggregation is what keeps scoring on unique rules.
4. Run it: `npx tsx scripts/doctor.ts`. Add `"doctor": "tsx scripts/doctor.ts"` to
   `package.json` scripts.

The template is dependency-free (Node built-ins only) and already implements the scoring,
the score-trend history file, the run-over-run delta, and the `--min-score` gate — you only
write CONFIG + CHECKS.

## Choosing parameters and checks

Derive checks from what actually breaks in *this* project. Good sources:

- **Repeated review comments** — if the same problem is flagged 3+ times, it's a check.
- **Postmortems** — every incident should leave behind a doctor check so it can't recur.
- **Project invariants** — schema/migration drift, env-var coverage, API contract shape,
  dead exports, banned imports, bundle budgets, required files per package.

Severity is the lever: make must-hold invariants `fail` (error rule, −1.5) and best-practice
debt `warn` (−0.75). Set thresholds in `CONFIG.params` so they're tunable in one place — that
is what "based on parameters" means: the same engine, re-pointed per project.

## The fix loop (converge to 100)

1. **Errors first, serially** — fix one `fail` rule, re-run the narrowest validation
   (typecheck/targeted test), revert that single fix on failure, continue.
2. **Warnings in a batch** — fix all `warn` rules, validate once; fall back to serial if the
   batch breaks something, to isolate the offender.
3. **Re-scan** and confirm the score rose. Repeat until 100 or the remainder is genuine
   false-positives / intentional exceptions (suppress those explicitly, with a comment).
4. **Close the loop** — if agents keep tripping a rule, also emit a `.cursor/rules/*.mdc`
   so it's prevented at write time, not just caught at session end. Diagnose → prevent → hold.

## Wire it in (so the score ratchets, never slips)

- **package.json**: `"doctor": "tsx scripts/doctor.ts"`.
- **Pre-commit / CI**: `npx tsx scripts/doctor.ts --min-score <current-best>`. Start the floor
  at today's score and raise it as you fix things — the score becomes a one-way ratchet.
- **Monorepos**: one doctor per surface (`doctor:web`, `doctor:api`, `doctor:infra`), each
  with its own CONFIG; CI runs every doctor whose paths changed. See `doctor-pattern.md`.
- **CI on the diff**: gate new regressions, not the whole backlog, so a low starting score
  never blocks adoption.

## After scaffolding

- Register the doctor in the project's `AGENTS.md` commands and in
  `wiki/concepts/doctor-pattern.md`'s registry table.
- If this is a new recurring capability, you already did the right thing — it's a doctor now,
  not a memory of "we should check that."

## Related

- `wiki/concepts/doctor-pattern.md` — the pattern, scoring methodology, and registry
- `skills/productivity/wiki-doctor/SKILL.md` — a real, shipped instance of this pattern
- `skills/engineering/doctor-enforcement/SKILL.md` — when to *run* the doctors after edits
- `wiki/tools/react-doctor.md` — the upstream tool the scoring methodology comes from
