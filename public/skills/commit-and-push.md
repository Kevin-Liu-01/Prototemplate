# Commit and Push

Handle "just get this committed and pushed" — but **never blindly**. Inspect the tree,
**ask Kevin the questions that matter**, then stage, commit, and push.

If the user wants a PR too, use `yeet` instead.

## Core rule: interview before action

When Kevin says "commit and push" (or similar), **do not immediately `git add` and commit**.
First inspect, cluster the diff, surface what's ambiguous, and **ask**.

Skip the full interview only when **all** of these are true:

- Kevin named the exact branch target (`main`, or a specific branch name)
- Kevin named the exact scope ("only the wiki changes", "everything in this session")
- The working tree is a single coherent theme with no junk files
- Wiki/skill housekeeping is already done or explicitly waived

Otherwise: present a short pre-commit plan and **wait for confirmation** (or ask inline
if Kevin already gave partial answers).

---

## Workflow

### 1. Inspect the tree

```bash
git status --short
git diff --stat
git diff --cached --stat
git log --oneline -6
git branch -vv
```

Also check:

- Staged vs unstaged vs untracked — are there **multiple clusters**?
- Submodule dirty state (`?` prefix)
- Files that look like machine exhaust, secrets, or one-off artifacts
- Whether `wiki/log.md`, `wiki/_index.md`, or `state.json` are stale relative to wiki edits
- Recent commit style on this branch

### 2. Pre-commit interview (mandatory unless skip conditions met)

Present findings as a **structured plan**, then ask. Adapt questions to what's actually
in the diff — don't read a fixed script every time.

#### A. Branch target

**Ask explicitly** when Kevin didn't say where to push:

> Push to **`main`**, stay on **`current-branch`**, or create **`kevin/<slug>`**?

Do **not** assume:

- feature branch because one happens to be checked out
- `main` because Kevin said "everything"
- a new branch because we're on default

If Kevin named a branch, confirm it before pushing.

#### B. Scope and commit shape

Cluster changed files by **theme**, not directory spam. Example clusters:

| Cluster | Example paths |
|---------|---------------|
| Wiki ingest | `wiki/concepts/`, `wiki/log.md`, `wiki/_index.md` |
| Skills | `skills/personal/`, `wiki/skills/` |
| Agent config | `config/cursor/`, `.cursorrules` |
| App code | `ui/`, `scripts/` |
| Repo meta | `README.md`, `state.json`, `AGENTS.md` |
| Assets / artifacts | `wiki/assets/`, ffmpeg logs, screenshots |

When the tree mixes **multiple conversations or agent sessions**, say so plainly:

> The diff spans [A], [B], and [C]. One commit or split? What's in / out?

Ask specifically:

- **One commit or several?** (prefer one only when truly coherent)
- **Include all dirty files** or only a subset?
- **Anything to exclude** even if Kevin said "everything"? (artifacts, submodule noise, WIP)

#### C. Exclusions (propose, don't assume)

Flag and propose excluding unless Kevin confirms:

- `.playwright-mcp/`, browser screenshots/traces used only for verification
- ffmpeg / encoding logs (`*.mbtree`, etc.)
- Local env files (`.env`, credentials)
- Submodule untracked content (needs separate commit inside submodule)
- Transient build output the repo doesn't track

#### D. Wiki housekeeping (kevin-wiki)

If **any** `wiki/**`, `skills/**`, or `config/**` files are in scope, check and ask:

| Check | Command / signal |
|-------|------------------|
| Index current? | `wiki/_index.md` page counts match; or run `npx tsx scripts/build-index.ts` |
| Log entry? | `wiki/log.md` has an entry for this work |
| Skills synced? | `bash scripts/sync-skills.sh --check` |
| Search index? | `qmd update && qmd embed` after wiki writes |
| Doctor clean? | `npx tsx scripts/doctor.ts` when wiki/skills/config touched |

Ask:

> Want me to run build-index / append log / sync-skills check / wiki-doctor **before** commit?

Do not silently skip these on wiki repos — either do them or Kevin explicitly waives them.

#### E. Skill and automation gaps

If the diff reveals **recurring manual work** (same script run twice, same checklist
re-explained, new tool not in SKILL-RESOLVER), note it briefly:

> This looks like something we'd hit again — want to codify into a skill or extend
> `[existing-skill]` after push?

Do **not** block the commit on skill creation unless Kevin asks. Surface it; let Kevin decide.

#### F. Validation

Propose the narrowest honest check for what's shipping:

- Wiki/skills/config → `npx tsx scripts/doctor.ts`
- UI/code → project test or lint if obvious
- Skip if expensive and Kevin waives

Ask if unclear: **"Run [check] before commit?"**

### 3. Confirm, then stage

After Kevin confirms the plan:

```bash
git add <confirmed paths>
# or git add -A when Kevin confirmed literal everything-minus-exclusions
```

Never `git add -A` without explicit confirmation when the tree has mixed clusters or junk.

### 4. Commit

Match recent log style (conventional commits if that's what the branch uses).

```bash
git diff --cached --stat
git diff --cached   # spot-check staged matches the agreed plan
git commit -m "$(cat <<'EOF'
type(scope): concise subject

Optional body — why, not file list.
EOF
)"
```

If pre-commit hook modifies files, fix and **new commit** — never amend a failed hook.

### 5. Push

```bash
git push -u origin "$(git branch --show-current)"
```

### 6. Report

Return:

- branch pushed to
- commit hash(es)
- what was included / excluded (vs the agreed plan)
- wiki housekeeping done or deferred
- skill-gap notes (if any)
- checks run and results

---

## Example pre-commit message (mixed tree)

```
Pre-commit plan — please confirm:

**Branch:** push to `main`? (currently on `kevin/foo`)

**Clusters in working tree:**
1. Wiki — npm supply chain page + assets (8 files)
2. Skills — diagram-to-html SKILL.md (new)
3. Junk — ffmpeg2pass-0.log.mbtree (propose exclude)
4. Submodule — last30days has local untracked content (propose skip)

**Proposed:** 1 commit with clusters 1+2, exclude 3+4

**Wiki housekeeping:** append log.md + build-index before commit?

**Skill note:** diagram-to-html is new — wiki/skills page already exists ✓

**Check:** run wiki-doctor before commit?
```

---

## Guardrails

- **Never open a PR** from this skill.
- **Never commit secrets** — flag `.env`, tokens, credentials.
- **Never assume branch target** — ask.
- **Never assume "everything" means git add -A** when clusters or junk are present.
- **Prefer one coherent commit** per confirmed unit of work; split when Kevin asks or
  when unrelated clusters would make review harder.
- **Never use `git checkout` or `git restore`**. For work on another branch,
  create an isolated worktree instead of switching the shared checkout.
- If staging is ambiguous and Kevin is unavailable, **narrow scope and explain** rather
  than sweeping unrelated work in.

## Kevin-wiki defaults (reference, not auto-apply)

These are common follow-ups when shipping wiki work — propose them in the interview,
don't silently run unless Kevin confirmed:

```bash
npx tsx scripts/build-index.ts
# append wiki/log.md
bash scripts/sync-skills.sh --check
qmd update && qmd embed
npx tsx scripts/doctor.ts
```

See `AGENTS.md` § Indexing and Logging and `wiki/skills/wiki-doctor.md`.

## Related Skills

- `yeet` — commit + push + PR
- `skill-creator` — codify recurring workflows surfaced during interview
- `wiki-doctor` — validate wiki/skills/config before ship
- `doctor-enforcement` — which doctors to run for which paths
- `project-briefing` — summarize what changed after the push
