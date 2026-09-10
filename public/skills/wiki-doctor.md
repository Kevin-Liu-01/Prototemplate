# Wiki Doctor

Unified health check for Kevin's agent system. Validates five layers:
wiki structure, skills, rules, automations, and config sync.

## When to use

- After large wiki edits or ingests
- When something seems broken (rendering, missing skills, stale data)
- When Kevin says "doctor", "audit", "health check", "validate"
- Before committing wiki changes (quality gate)
- On a schedule (daily via Cursor automation)

## Commands

From the wiki repo root (`~/Documents/GitHub/kevin-wiki`):

```bash
# Run all doctors
npx tsx scripts/doctor.ts

# Run a specific doctor
npx tsx scripts/doctor.ts --only wiki        # frontmatter, wikilinks, index
npx tsx scripts/doctor.ts --only skills      # SKILL.md validity, wiki pages, symlinks
npx tsx scripts/doctor.ts --only rules       # .mdc integrity, hub refs
npx tsx scripts/doctor.ts --only automations # staleness, missing refs
npx tsx scripts/doctor.ts --only x-bookmarks # per-bookmark review ledger
npx tsx scripts/doctor.ts --only config-sync # symlink health

# Output modes
npx tsx scripts/doctor.ts --verbose          # expand per-item detail + info findings
npx tsx scripts/doctor.ts --quiet            # summary table only
npx tsx scripts/doctor.ts --json             # machine-readable results (incl. scores)
npx tsx scripts/doctor.ts --min-score 90     # CI gate: exit 1 if composite score < 90
```

Findings are **aggregated**: each check prints one summary line (e.g. "111 broken body
wikilink(s)"); the individual items are `info` lines shown only under `--verbose`. This
keeps the default output high-signal while staying exhaustive underneath.

## Health score (react-doctor methodology)

Each doctor earns a **0-100 score**, plus a composite across all five. The formula
mirrors [[react-doctor]]:

```
score = 100 − 1.5 × (error rules) − 0.75 × (warn rules)   # clamped to [0,100]
```

The critical design choice: scoring is on **unique rules (check keys), not occurrences**.
A check is one "rule"; its worst severity decides whether it's an error rule (any `fail`)
or a warn rule (`warn`, no `fail`). `132 broken wikilinks` is **one** warn rule, not 132
penalty points. This rewards *systemic* fixes — silence a whole check once and the score
jumps — instead of grinding down individual items (the same incentive react-doctor's
per-rule scoring creates).

The composite score and its fail/warn-rule counts are appended to
`wiki/meta/doctor-history.json` on every **full** run (skipped under `--only` so the trend
stays comparable). The summary prints the **delta vs the last run** so drift is visible.

## Fix loop (converge toward 100)

Adapted from react-doctor's triage playbook — fix the score up, don't whack-a-mole:

1. **Errors first, serially.** Fix each `fail` rule, then re-run the doctor (or the
   narrowest validation) after each. If a fix breaks something, revert that one and move on.
   Errors are weighted 2× warnings, so they move the score most.
2. **Warnings in a batch.** Fix all `warn` rules, then validate once at the end. If the
   batch breaks something, fall back to fixing them serially to isolate the offender.
3. **Re-scan and confirm the score rose.** Repeat until the score is 100 or the remainder
   is genuine false-positives/intentional exceptions.
4. **Close the loop.** If a failure class will recur, encode it as a new check here (or a
   Cursor rule) so the next run can't regress — doctor diagnoses → rule prevents → score holds.

## What each doctor checks

### wiki-structure
- Frontmatter present + closed; `title` required (fail), `type`/`created` recommended (warn)
- `type` is a recognized value; `updated` is not before `created` or in the future
- No broken `[[wikilinks]]` in **body or `related:`/frontmatter**
- No manually authored `## Backlinks` section (backlinks are computed)
- `person`/`project`/`tool` pages have a `## Timeline`
- Page size: stub nudge under 15 lines; bloat nudge only over ~400 lines **and** not marked `longform: true` (length follows the content — good long pages opt out) — info
- **Unfilled placeholder/boilerplate text** (fail): code-stripped body matched against shared sentinels in `scripts/lib/placeholders.ts` (e.g. "catalog stub auto-created", "replace with a real summary", `TODO: replace/fill`, "to be written", template "{compiled truth"). Catches auto-generated pages (dedalus catalog stubs) that were synced but never written — these sit at exactly 15 lines and dodge the length nudge. `log.md` is exempt (it quotes the sentinels when recording fixes). Same check runs as a fast pre-commit gate (`scripts/check-placeholders.ts`, scoped to staged `wiki/*.md`) and at session start (`check-freshness.ts`).
- `_index.md` has no **dangling** entries (links to missing pages); flags staleness when many pages are uncatalogued (root docs excluded)
- Duplicate page slugs across directories; orphan pages with no inbound backlinks (info)
- `log.md` has valid YAML frontmatter

### skills
- Every `SKILL.md` under `skills/{engineering,productivity,personal,misc,in-progress,deprecated}/` exists with valid frontmatter where applicable
- Every executable skill appears in generated `wiki/meta/skill-registry.json` and `wiki/meta/skill-registry.md`
- Every registry entry routes to a family synthesis page under `wiki/concepts/*-skills.md`
- Retired individual `wiki/skills/<slug>.md` mirrors fail as article sprawl; `wiki/skills/README.md` remains the thin hub
- `name` matches dir slug (info); description ≤ 1024 chars; body ≤ 500 lines (info)
- `skills/README.md` present; runtime skill symlinks are intact across Cursor, Claude, Codex, and `~/.agents/skills`
- Cross-namespace slugs (shared personal/claude, namespaced dedalus) reported as info, not warnings

### rules
- Every `.mdc` in `config/cursor/rules/` is non-empty and has a frontmatter `description`
- Rules referenced in `agent-operations-hub.md` exist on disk
- Dedalus cursor rules are valid

### automations
- Each definition has frontmatter; stale runs (>14 days) are warned
- Never-run-locally automations are `info` (cloud runs aren't tracked locally)

### x-bookmarks
- `raw/x-bookmarks/bookmarks.jsonl` exists and parses
- `wiki/meta/x-bookmark-artifact-audit.json` exists, parses, and covers every raw bookmark ID
- Ledger is not older than the raw bookmark source
- Pending or deferred rows warn until each bookmark has a final one-by-one review status
- Source, visual, local-media, and direct-reference flags warn until resolved or explicitly deferred
- Completed rows must include structured decisions for `articles`, `skills`, `tools`, `objects`, and `versioning`, plus `reviewedArtifacts` evidence
- `promoted` rows must list `promotedPages`

### config-sync
- All expected config symlinks point to correct wiki targets: Cursor rules/hooks/skills/settings, Claude skills/preset, Codex skills/preset, and the universal `~/.agents/skills` bridge
- Missing targets, non-symlinks, or wrong paths fail the doctor (and bootstrap)

## Interpreting results

| Severity | Scores as | Meaning |
|----------|-----------|---------|
| pass | — | Check passed |
| info | — | Stat or low-priority finding; hidden unless `--verbose` |
| warn | warn rule (−0.75) | Non-critical issue, should be fixed when convenient |
| fail | error rule (−1.5) | Critical issue, fix before committing (doctor exits 1) |

## After running

Results are written to `wiki/meta/doctor-results.json` (now including per-doctor and
composite `score`), the score trend is appended to `wiki/meta/doctor-history.json`, and
`state.json` is updated. The doctor exits 1 if there are any fails **or** (with
`--min-score N`) if the composite score is below the threshold. If there are fails, fix
them before committing. If there are warns, batch-fix during maintenance and watch the
score climb run-over-run.

## Closing the loop (self-heal)

The doctor detects and scores; it does not fix. To close the loop autonomously — triage each
finding, auto-fix the provably-safe class, propose content fixes behind a PR, escalate the
destructive ones, and notify selectively — run the self-heal layer built on top of this doctor:

```bash
npx tsx scripts/self-heal.ts           # detect + triage + selective digest (no writes)
npx tsx scripts/self-heal.ts --apply   # apply safe deterministic fixes + verify (re-run doctor)
```

See `automations/self-heal.md` (the agentic loop + PR step) and the
`wiki/concepts/self-maintaining-systems.md` concept for the full pattern.

## Related

- `scripts/self-heal.ts` — closes the loop: triage + auto-safe fix + selective digest (`automations/self-heal.md`)
- `scripts/lint.ts` — compatibility alias for `doctor.ts --only wiki`
- `scripts/build-discovery.ts` — generates `wiki/meta/discovery-index.json` and `wiki/llms.txt`
- `scripts/check-freshness.ts` — sync + automation staleness checks
