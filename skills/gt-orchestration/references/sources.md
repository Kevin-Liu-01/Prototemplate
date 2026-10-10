# Sources

Provenance for `gt-orchestration`. The first list is the skill's sources as written on 2026-10-07. The second list cites each line added on 2026-10-10 (Prototemplate system v2, lane L3) with its memory note, transcript or inventory row and its date. Inventory rows are in the system v2 working folder kept outside the repository (`inventory/<sweep>.json`, item index).

## Sources as of 2026-10-07

- Prototemplate: `docs/archive/DESIGN_STANDARD.md` section 8; `skills/gt-ship/SKILL.md` sections 1, 2, 3 and 8; `skills/gt-aesthetic/SKILL.md` section 1 and "Rules of the loop"; `skills/gt-films/SKILL.md` (the judge and section 9); `skills/prototemplate/SKILL.md` section 10; all read 2026-10-05.
- gt-cloud Workflow scripts from Claude Code sessions, read 2026-10-05: `gt-color-template-sweep` (2026-08-06), `review-pr-4887-inter-only` (2026-09-19), `signin-field-design` and `signin-field-build` (2026-09-29), `managed-org-atomic` (2026-10-02), `verify-5091-alias` (2026-10-03), and the round files `CONTEXT.md` to `CONTEXT9.md` (2026-09-28 to 2026-09-30).
- Handoffs Kevin pasted to agents: the gt-cloud landing and dashboard stack (2026-08-11, written to the wiki `handoff` template), and three from personal projects whose method only is kept (2026-07-30, 2026-09-11, 2026-10-02). Two task chips: the gt-landing skill refresh (2026-09-15) and the flaky Temporal test (2026-10-02).
- Claude memory (gt-cloud project): workflow-lane-relay-trap.md, redesign-v0-verdict.md, turboslide-ship-two-lessons.md, turboslide-pipeline-cost-rules.md, scratch-worktree-disk.md, session-lanes-prototemplate.md, blog-graphics-pipeline-traps.md, signin-field-transition.md.
- Kevin's wiki (github.com/Kevin-Liu-01/Kevin-Wiki): skills/productivity/handoff, skills/productivity/loopy, skills/productivity/agent-iteration-loop, skills/engineering/improve. The harness's `workflow-authoring` skill (resume, dead agents, worktree isolation).
- The 2026-10-05 mining round's synthesis of Kevin's messages from 2026-07-20 to 2026-10-05: A1, A9, B1 to B7, C5 and H7.
- Kevin's directives: full specs from the strongest model (2026-07-21); all waves (2026-07-24); the hours-long prompt and research first (2026-07-28); handoff inputs (2026-07-29); the named bar (2026-07-30); the end state (2026-08-01); no new spawns (2026-08-06); all updates (2026-09-09); git preview costs (2026-09-15); fast and linear (2026-09-21); Do this task here (2026-10-02); the capped campaign, timeouts and codifying prompts (2026-10-05).

Quotes moved out of SKILL.md on 2026-10-10, with their dates:

- The orchestration prompt (2026-07-28): "your goal here is just to set up the prompt that will go for hours building this and spinning up subagents that evaluate".
- Research first (2026-07-28): "read through our entire wiki and x bookmarks to learn lessons about design".
- The end state (2026-08-01): "scope out and imagine the end state ... and then build that out fully".
- Timeouts (2026-10-05): "why do we have timeout failrues, fix this and continnue until its done" (kept in `references/campaigns.md`).
- Section 4's examples and numbers moved to `references/convergence.md` unchanged; section 8's list of parts is in `references/handoffs.md`.

## Added on 2026-10-10

| Line | Where | Source |
| --- | --- | --- |
| The reboot: what it empties, what survives, keep durable state outside the scratchpad | SKILL.md section 6, `references/harness-traps.md` | memory scratch-wiped-on-reboot (gt-cloud project, 2026-10-07); inventory memories item 2 |
| Resume with byte-identical `args`; new information only through one unfinished agent's prompt | SKILL.md section 6 step 3, `references/harness-traps.md` | memory scratch-wiped-on-reboot (2026-10-07); a research project's memory note of 2026-10-09 (inventory memories item 83) |
| No pattern kills; exact PIDs only | `references/harness-traps.md` | memory never-pkill-patterns (claude-of-tanks project, 2026-10-01 incident, written 2026-10-02); inventory memories item 4 |
| Background tasks stop at two hours; detach long chains; poll with a milestone loop; resumable runners | `references/harness-traps.md` | memory long-chains-run-detached (claude-of-tanks project, 2026-10-05, updated 2026-10-08); inventory memories item 4 |
| Lane Bash rules: no `rm`, edits apart from deletions, git network calls alone under an alarm, background and redirect long work | `references/harness-traps.md` | memory subagent-bash-never-blocks (claude-of-tanks project, 2026-10-08); inventory memories item 4 |
| The relay trap, cross-referenced | `references/harness-traps.md` | memory workflow-lane-relay-trap (gt-cloud project, 2026-10-01); inventory memories item 30 |
| The guard line and its text | SKILL.md section 6, `references/harness-traps.md`, `examples/research.js` | a workflow script in transcript b96145a9 (2026-10-09); inventory labs item 7 |
| The resume file (`RESUME.md`) | SKILL.md section 6, `references/handoffs.md` | memory resume-2026-10-09 (gt-cloud project, 2026-10-10) and a research project's memory note (2026-10-09); inventory memories items 83 and 85 |
| A project may lift its spend caps on Kevin's explicit order, keeps a runaway-loop stop, logs and reports every dollar | SKILL.md section 7, `references/campaigns.md`, `references/harness-traps.md` | Kevin's order of 2026-10-08 for one research project, recorded in a gt-cloud project memory note (inventory memories item 83, skills item 21); written as a generic rule per the owning session's reply of 2026-10-10 |
| `scripts/replay-edits.py` and its test | SKILL.md section 6 | `recover.py` of the July 2026 redesign harness (gt-cloud worktree `apps/redesign/docs/harness`, 2026-07-29); the 2026-09 lost-work audit (memory lost-work-audit-2026-09); system v2 plan item C1. First real run 2026-10-10: the exploration charter rebuilt from transcript 6fd2c510 |
| Write shape | `references/workflow-shapes.md`, `examples/write.js` | workflow scripts `seo-pages-research-spec` (transcript 3e8b26b4, 2026-10-09) and `docs-part2-rewrite-kevin-voice` (transcript 85703a0f, 2026-09-09) |
| Probe shape and the INTENDED list | `references/workflow-shapes.md`, `examples/probe.js` | workflow script `routing-adversarial-probe` (transcript 85703a0f, 2026-08-20); inventory docs item 1 |
| Investigate shape | `references/workflow-shapes.md` | workflow script `docs-perf-deep-dive` (transcript 85703a0f, 2026-09-14); inventory docs item 1 |
| Research shape, adversarial fact and license checks | `references/workflow-shapes.md`, `examples/research.js` | a research workflow script (transcript b96145a9, 2026-10-05); the `/world` scripts `gt-world-map-simplify-and-facts` and `gt-world-artifacts-research` (transcript bd16123d, 2026-10-02 and 2026-10-03); inventory labs item 21 |
| Package shape and the clean-checkout gate | `references/workflow-shapes.md` | the `/world` scripts `gt-world-map-package-prs`, `gt-world-map-fix-and-repackage` and `gt-world-map-chrome-pin` (transcript bd16123d, 2026-10-03 to 2026-10-05); inventory labs item 21 |
| Library PR gauntlet, customer-free | `references/workflow-shapes.md` | workflow script `gauntlet-gt-middleware-stack` (transcript 85703a0f, 2026-09-09); inventory docs item 15 |
| Critic loop example | `examples/critic-loop.js` | workflow script `founder-batch-final` (transcript 0472faa4, 2026-07-30) |
| `metadata.owner: P` | frontmatter | system v2 plan section 2.2 (2026-10-10) |
