# Skill Audit

## Overview

Review recent Cursor agent transcripts to identify opportunities for new or improved shared skills. Modify the source category folders under `skills/{engineering,productivity,personal,misc}/`; never edit `~/.cursor/skills-cursor/` (reserved for Cursor internals) or project `.cursor/skills/`.

## Workflow

### 1) Locate transcripts

Cursor stores agent transcripts per-project under:

```
~/.cursor/projects/*/agent-transcripts/
```

Each transcript directory contains a `<uuid>.jsonl` file with conversation history.

- List all project transcript directories
- Filter to transcripts modified in the last 24 hours (use `find` with `-mtime -1` or `ls -lt`)
- Read the first few lines of each `.jsonl` to understand the conversation topic

### 2) Analyze for patterns

Look for:

- **Repeated workflows** the user performs across multiple sessions (e.g., always running the same git commands, always asking for the same kind of refactor)
- **Struggles or failures** where the agent had to retry, backtrack, or the user expressed frustration
- **Skills that were invoked but didn't help** enough (check if any skill files were read but the outcome was poor)
- **Domain knowledge** that keeps being re-explained (project conventions, API patterns, framework quirks)

### 3) Decide what to create or update

Be conservative. Only create/update a skill if:

- The pattern appeared in **2+ sessions** or was a significant time sink in one session
- The skill would save meaningful effort in future sessions
- No existing skill already covers it

### 4) Create or update skills

For each new skill:

- Follow the structure in `~/.cursor/skills-cursor/create-skill/SKILL.md`
- Place in the right category, e.g. `skills/engineering/<skill-name>/SKILL.md`, `skills/productivity/<skill-name>/SKILL.md`, `skills/personal/<skill-name>/SKILL.md`, or `skills/misc/<skill-name>/SKILL.md`
- Keep under 500 lines, use progressive disclosure for detail
- Write a specific description with trigger terms

For updates to existing skills:

- Read the current skill file first
- Use `skill-creator`'s no-op pruning pass before adding text: delete vague advice, duplicates, and lines whose removal would not change behavior
- Make targeted improvements (add missing steps, fix incorrect guidance, add examples)
- Don't rewrite skills that are working fine

### 5) Report

Summarize:

- How many transcripts were reviewed
- What patterns were identified
- Which skills were created or updated (with brief rationale)
- What was considered but skipped (and why)
