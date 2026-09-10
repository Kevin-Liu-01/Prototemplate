# learn-from-projects

The brain must compound from **every** project Kevin works in, not just the wiki. Conversations
live in provider stores including `~/.codex/sessions/`, `~/.codex/archived_sessions/`,
`~/.cursor/projects/*/agent-transcripts/`, and `~/.claude/projects/`. Index them in place;
do not duplicate their bytes into the repository. Replay selected sessions into the private
evidence graph, then promote reviewed changes into existing durable owners. Procedural-memory
principle: **session signals are proposals; codified owners are law** — never silently rewrite
the brain's rules from transcript noise.

## Pipeline

```
index → select → replay → private candidate signals → review receipt → owner writeback → proof
```

## Point a conversation at the wiki

Use either entry point; both end in the same evidence and writeback gates.

### From an old project task

Finish the task first, copy its Codex task URL or native UUID, then open a
Kevin-Wiki task and say:

```text
Use /learn-from-projects to absorb completed task <task-url-or-id>.
Read every completed turn and the tool outputs, artifacts, repository diff,
and tests that support a learning. Correlate it with its project and current
wiki owners. Propose the smallest durable owner changes; do not create one page
for the conversation and do not treat the task title or summary as evidence.
```

The wiki task should use the Codex task catalog to resolve a human title or
project, show matching native task IDs when ambiguous, and page through the
selected task with outputs included. If the matching local JSONL exists, use
the indexed replay path below for content-addressed extraction. If it is only
visible through the app catalog, materialize an authorized private task capture
before calling it replayed; catalog metadata alone is discovery, not durable
evidence. Never replay the currently active turn as complete.

### From the wiki by project or month

Ask for a project/date cohort instead of opening conversations manually:

```text
Use /learn-from-projects to inventory every completed Codex, Cursor, and Claude
task for <project> from <start-date> through <end-date>. Reconcile the app task
catalog with local provider stores and the repository history. Show coverage
gaps, then absorb the cohort in bounded batches with per-task provenance.
```

Group parent tasks, forks, and subagent transcripts without erasing their
separate source identities. Reconcile claimed work against the actual checkout,
commits, PRs, generated artifacts, and test receipts. Project-level extraction
must consider current state, decisions and rationale, reusable procedures,
preferences, failures and corrections, unresolved work, and cross-project
patterns. The result updates existing project pages, decisions, workflows,
skills, design rules, tools, or postmortems; it does not become a transcript
archive in the public wiki.

1. **Index** — run `npm run brain -- sessions index`. This inventories every local Codex,
   Cursor, and Claude evidence file with provider, session ID, workspace hint, byte count,
   modification time, fingerprint, trace kind, and parent lineage under
   `.brain/sessions/index.json`. Top-level `conversation` records are counted separately from
   Claude `subagent` and `workflow` traces. It does not copy the provider stores. Use
   `--path <path> --provider <provider>` to add an exported task or another authorized transcript
   root to the standard provider index; existing local coverage remains.
2. **Select** — run `npm run brain -- sessions list --limit 50` and choose a parent conversation
   by agent-session ID, provider, project/workspace, or date. The default list excludes delegated
   traces so that subagents do not masquerade as separate human tasks. Add `--include-traces` to
   inspect the selected corpus's delegation or `--kind conversation|subagent|workflow` to isolate
   one trace class. `npm run harvest:learnings -- --days N` remains an optional ranked project
   digest, not the source of truth.
3. **Replay** — run one of:

   ```bash
   npm run brain -- replay sessions --id <task_url_or_agent_session_id>
   npm run brain -- replay sessions --path /absolute/path/to/session.jsonl
   npm run brain -- replay sessions --provider codex --since 2026-07-01T00:00:00Z --until 2026-08-01T00:00:00Z --workspace Agent-Machines --query sandbox --limit 25
   npm run brain -- sessions list --query sandbox --include-traces --limit 100
   ```

   A pasted task URL resolves to its final native task identifier. Replay streams
   user and assistant text into private, content-bound source revisions and
   candidate signals. The original transcript remains the evidence owner. Tool calls, tool
   results, attachments, and hidden reasoning are not silently treated as learned facts; expand
   them deliberately when a proposed learning depends on them. Selecting a native Claude task ID
   replays every matching parent/delegated trace in that lineage; selecting one generated
   `agent_session_*` ID replays only that exact evidence file. Parent and delegated traces retain
   distinct source IDs even when the provider reused the same native session ID.
4. **Extract and interrogate** — for each selected session:
   - Mine for **durable, reusable** signal only:
     - **Patterns / conventions** that recurred (→ candidate for `wiki/concepts/` or a rule)
     - **Decisions** with rationale (→ `wiki/decisions/`)
     - **Skill gaps** — a workflow done by hand 2+ times across sessions/projects (→ a new skill; this is the no-one-off-work rule applied across projects)
     - **Tool/pattern discoveries** worth a tool page or SKILL-RESOLVER ranking change
     - **Postmortems** — a bug + fix + lesson (→ `wiki/postmortems/`)
   - Ignore one-off task chatter and secrets. Preserve private material in the private replay;
     do not project it publicly unless the workflow has authority.
   - Bind candidates to existing IDs in `brain/objects.json`. Search qmd before proposing a new
     owner. A missing stable owner is a filing decision, not a reason to create an inbox page.
5. **Review** — write a machine-valid `reviews/source-signals/*.json` receipt that names exact
   session revisions, candidate owners, verdicts, follow-ups, and proposed writebacks. Use the
   `source.absorb@1.0.0` workflow contract. Repeated patterns may be reviewed as a coherent cohort,
   but every retained signal keeps its session provenance.
6. **Codify** — within the active task's authority, apply accepted changes to the existing
   concept, decision, skill, workflow, project, postmortem, or router. Ask Kevin before publicizing
   private material or crossing an external/destructive authority boundary. A separate inbox page
   is not the default.
7. **Prove** — run `npm run brain -- doctor`, the affected skill/workflow doctors,
   `npm run build-index`, and retrieval checks. The replay checkpoint only proves extraction;
   the review receipt and owner diff prove learning.

## Review unit shape

```json
{
  "sources": [{ "sourceId": "agent-session:<provider>:<session-id>", "revisionIds": ["..."] }],
  "objectReviews": [{ "objectId": "workflow:source-compile", "verdict": "refine" }],
  "writebacks": [{ "path": "wiki/workflows/source-compile-workflow.md", "change": "..." }],
  "proof": { "artifactsInspected": ["..."], "retrievalQueries": ["..."], "routeChecks": ["..."] }
}
```

Delegated evidence uses
`agent-session:<provider>:<session-id>:<trace-id>` and names its parent session in revision
metadata. A coherent parent-plus-delegation review may cite all of those sources, but it must not
merge their revisions or claim that a delegated trace is a separate user conversation.

## Rules

- **Test before bulk** — replay 2-3 sessions, validate the review/owner result, then widen.
- **Cross-project > single-project** — a pattern seen in 2+ projects is higher-signal than one session.
- **No secrets** — never copy keys/tokens/private data into candidates (env var *names* only).
- **Dedup against the brain** — `qmd search` each candidate; update the existing owner instead of creating a transcript-shaped page.
- **The receipt is mandatory** — no session signal changes canonical behavior without a validated review disposition and writeback proof.
- **Authority is preserved** — review approval does not authorize publication, external messages, destructive actions, credentials, spend, or production changes.

## Related

- `scripts/harvest-learnings.ts` — the collection half (`npm run harvest:learnings`)
- `automations/cross-project-learning.md` — runs this on a cadence
- `skill-audit` skill — the Cursor-only, skill-focused predecessor (this generalizes it to all projects + all knowledge types)
- `signal-detector.mdc` — ambient per-message capture (this is the batched, cross-project version)
- `wiki/concepts/brain-agent-loop.md` — the read/write compounding loop this feeds
