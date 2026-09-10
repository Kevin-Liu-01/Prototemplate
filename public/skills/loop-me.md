# loop-me

Interview Kevin about recurring work until each useful loop is specified tightly enough
that an implementer agent could build it without asking another question.

This is not a brainstorming chat. The output is a workflow spec: trigger, inputs,
tools, checkpoints, approval gates, outputs, and a first implementation path.

## First Move

1. Identify the workspace:
   - In `kevin-wiki`, use `wiki/inbox/loop-specs/<slug>.md` for candidate specs unless
     Kevin explicitly wants a committed workflow page.
   - In an application repo, use `workflows/<slug>.md` when the loop belongs to that repo.
   - Use `NOTES.md` for raw notes about the user's world, tools, channels, and terminology
     when the workspace is thin or the loop is not yet spec-ready.
2. Search before creating:
   - `rg -n "<topic>|<tool>|<workflow>" workflows wiki/workflows wiki/inbox plans 2>/dev/null`
   - `qmd search "<topic>"` if available.
3. Read the relevant wiki pages when present: `wiki/philosophies/no-one-off-work.md`,
   `wiki/tools/loopy.md`, `wiki/concepts/borrowed-intelligence.md`, and
   `wiki/projects/loop.md`.
4. Tell Kevin whether you found an existing loop/spec. Update it if it exists; do not fork
   a parallel spec.

## Loop Lens

A **loop** is a recurring pattern in Kevin's life or work: a morning routine, a repeated
review, a weekly scan, a recurring build chore, or a repeated decision. A **workflow**
is the spec that makes that loop delegable. Workflows run on loops.

Do not mandate AI, checkpoints, or schedules by default. Some workflows are scripts,
some are agent tasks, some are read-only monitors, and some should not exist after the
interview clarifies the actual cost.

Vocabulary:

- **Trigger**: event or schedule that starts the workflow.
- **Checkpoint**: human verification or decision point.
- **Push right**: do as much useful work as possible before involving Kevin.
- **Brief**: the checkpoint artifact. It should be decision-ready, with links to raw
  output. Kevin reads the brief, not a dump.

## Interview Protocol

Ask one question at a time. Keep the session moving by proposing concrete defaults and
asking Kevin to correct them.

Cover these questions:

- What recurring situation starts the loop?
- What does Kevin do today, step by step?
- Which parts require taste, judgment, authority, or private context?
- Which parts can be pushed right to an agent, automation, script, or scheduled check?
- What inputs does the agent need?
- What artifacts should the agent leave behind?
- What tools, accounts, repos, docs, or people are involved?
- What must be read-only, dry-run, or approval-gated?
- What would make Kevin trust the result?
- What would make the loop annoying enough to delete?
- Where can checkpoints be pushed right without hiding risk?

Useful vocabulary:

- **Trigger**: the event or phrase that starts the loop.
- **Checkpoint**: a human-readable proof point before the agent continues.
- **Push right**: move the work laterally to an agent/tool while Kevin keeps approval.
- **Brief**: the smallest complete task packet another agent can execute.

## Spec Format

Write one file per loop:

```markdown
---
title: <Loop Name>
type: workflow
status: candidate
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: loop-me interview
tags: [loop, workflow, delegation, agents]
related: ["[[no-one-off-work]]", "[[tools/loopy|Loopy and Loop Library]]"]
---

# <Loop Name>

> One-line outcome.

## Trigger

What starts the loop.

## Current Path

How Kevin does it today.

## Agent-Delegable Path

What the agent should do instead.

## Inputs

Files, URLs, accounts, repos, people, calendars, APIs, or prior wiki pages required.

## Tools And Skills

Named tools, skills, MCPs, CLIs, scripts, or browser surfaces to use.

## Checkpoints

Human-readable proof points before writes, sends, deletes, payments, or external actions.
Push checkpoints right: present a decision-ready brief after the agent has prepared the
work, not before the agent has done anything useful.

## Output Artifact

The exact artifact the loop leaves behind.

## Acceptance Criteria

Concrete checks that mean the loop worked.

## Failure Modes

What can go wrong and how the agent should stop, ask, or recover.

## Implementation Brief

The first build ticket, script, skill change, or automation definition.

---

## Timeline

- **YYYY-MM-DD** | Created from loop-me interview. [Source: User]
```

## Definition Of Done

A loop spec is done when:

- It has a concrete trigger.
- It names the current manual path.
- It names the agent-delegable path.
- It includes explicit read/write/approval boundaries.
- It says what artifact gets produced.
- It includes enough acceptance criteria that another agent can implement it.

If the spec implies a recurring automation, propose the automation after the spec is
complete. Do not silently create a scheduled job.

## Related Skills

- `grill-with-docs` for feature/product design interrogation.
- `skill-creator` when a completed loop should become an executable skill.
- `codex-automation-admin` when a completed loop should become a Codex automation.
- `learn-from-projects` when repeated work is discovered from transcripts instead of interview.

Upstream: `github.com/mattpocock/skills/skills/in-progress/loop-me/SKILL.md` at
`0877403d1e867fd9d574117e9b34ade404f36d2a`.
