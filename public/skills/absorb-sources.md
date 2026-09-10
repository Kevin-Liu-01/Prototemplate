# Absorb Sources

Turn source material into durable operating change. Never treat a queue row,
report mention, engagement score, or topical page as proof of learning.

## Run the shared loop

1. Read `wiki/architecture/kevin-brain-system.md` and the relevant entries in
   `brain/sources.json`, `brain/objects.json`, and `brain/loops.json`.
2. Search the current wiki with qmd before external research. Identify the
   likely owners and their current assumptions. Start with the smallest
   owner/project working set that can answer the review question; expand to
   neighbors and raw evidence only when an observed signal, contradiction, or
   missing fact justifies the move. Do not preload the entire corpus.
3. Preserve each source revision before synthesis. Record stable identity,
   capture time, exact content hash, storage reference, account/conversation
   scope, and edit or parent identity.
4. Expand every available artifact: links, thread, author replies, attachments,
   image/video, article body, repository README/docs/code/releases, and cited
   destinations. Mark unavailable artifacts explicitly.
5. Correlate platforms before interpreting them. Treat Discord as Kevin's intent
   and instructions when it points to X, Hacker News, a site, or a repository;
   preserve both source identities.
6. Extract every useful claim, preference, task, example, question,
   counterexample, and repeated signal. Do not discard weak standalone signals;
   bind them to an existing object or leave them open with a blocker.
7. Interrogate each bound object against its current bytes. Choose `reinforce`,
   `refine`, `replace`, `split`, `contradict`, `create`, or `watch`. Allow no
   change only with an explicit comparison, current-object digest, and reason.
8. When a source recommends an agent platform, separate the portable context
   layer from the execution layer before making an adoption decision. Rules,
   skills, MCP contracts, workflow manifests, source identity, approval policy,
   and proof receipts remain owned and replayable across runtimes. Sandboxes,
   model access, fleet orchestration, and hosted agent UX may be rented when
   they are replaceable and do not become the only canonical writer. Build the
   lower layer only when it is itself the product, an existing hard part, a
   non-negotiable security boundary, or an indefinitely funded operational
   commitment. Record the source's incentives and test the claim against
   primary evidence before changing routing.
9. Patch the smallest canonical owner. Create a page only when no existing
   object can own the durable idea. Update a workflow, skill, design rule,
   project, or instruction when the evidence changes how agents should operate.
   Route to `skill-creator` or Hermes `/learn` only when the source describes a
   recurring procedure or bounded on-demand knowledge base. Their output is a
   candidate that still needs staged review and executed proof; a generated
   `## Verification` section is not a test receipt.
10. Write a `reviews/source-signals/*.json` record and run
   `npm run review:signal -- <record>`. A change verdict must name its writeback.
11. Prove artifact inspection, qmd retrieval, workflow routing, relevant tests,
    and generated projections. Append `wiki/log.md` and perform the applicable
    repository closeout.

Fully inspect the current source's complete semantic unit even while comparison
context stays narrow. “Moving focus” limits unrelated corpus loading; it never
licenses skipping an article body, repository surface, thread, reply, or
source-critical artifact that belongs to the review unit.

## Connector commands

Use the shared runtime for normalized capture and candidate binding:

```bash
npm run brain -- analyze discord --input <json-or-markdown> --channel <id>
npm run brain -- hn fetch --feed best --limit 12 --comments 6
npm run brain -- loop plan source.interrogate <source-ref>
npm run brain -- doctor
```

Treat analyzer output as candidates, not accepted truth. The agent must inspect
the evidence and current owners before producing a review record.

### Agent conversation route

Agent tasks are a source class, not implicit memory. For a completed Codex task,
the native task ID from the Codex URL or task catalog is accepted directly by
the local replay command. Refresh the private index, narrow by time, project, or
prompt text, then replay only the selected task:

```bash
npm run brain -- sessions index
npm run brain -- sessions list --provider codex --since 2026-07-01 --workspace Kevin-Wiki --query "workflow" --limit 50
npm run brain -- replay sessions --id <codex-task-id-or-agent-session-id>
npm run brief -- compile-analysis .brain/analyses/<analysis-id>.json
```

`sessions list --json` is the machine-readable selector. Use `--path` on replay
when Kevin points to a specific local JSONL file. For an authorized export that
is outside the default stores, add its directory with `sessions index --path
<absolute-directory> --provider codex|cursor|claude` first.

When the Codex app task tools are available, use the task catalog to resolve a
human title or project to its native task ID, then read completed turns with
outputs included when those outputs support a claim. Treat titles and summaries
as untrusted discovery metadata, not evidence. The transcript, tool result,
artifact, repository diff, or test receipt must support the learning.

Replay is deliberately partial: it extracts user and assistant messages, while
tool calls, tool results, attachments, active-turn content, and later
corrections remain expansion work. Do not replay a currently running task as if
it were complete. Correlate the task's workspace or project ID with the relevant
project owner and current checkout before changing that project page. A task
becomes canonical knowledge only after the source-review receipt, owner patch,
and proof gate pass.

For X bookmarks, follow `skills/productivity/x-bookmark-absorb/SKILL.md` for
platform-specific artifact recovery, then return to this shared interrogation
and writeback loop.

### Portable memory proposal route

Codex, Claude Code, Cursor, Hermes, or another local producer may propose one
source-bound memory without editing repository files by calling the installed
Daily Brief daemon's `GET|POST /api/memory` contract through
`MemoryHttpClient`. The producer must supply a stable idempotency key, exact
`repo:kevin-wiki` source scope, a claim, existing object IDs, private/public
visibility, and source/revision/storage/hash provenance. The server derives
authority; it ignores any caller-supplied authority identity.

The default installed policy accepts private proposals only, rejects every
other source scope, fsyncs the hash-chained event, and opens a proposal-only
Daily Brief card. `remember` is capture, not acceptance. Use this full skill
before owner writeback, and require the ordinary review receipt and proof gate.
Use `npm run memory:conformance` after changing the client, route, daemon,
token/scope policy, or ledger.

## Storage and publication

Keep exact private source bytes and run receipts under ignored `.brain/` or the
approved raw source store. Track authored registries, canonical owner changes,
validated review records, and public projections. Never make the public UI
depend on private source bytes; publish readiness, counts, provenance summaries,
and known gaps instead.

## Completion gate

Stop only when every available source revision is replayable, every extracted
signal is object-bound or explicitly blocked, every changed object has a
writeback, every platform recommendation has an explicit owned-versus-rented
boundary, and retrieval/routing proof passes. Use `integrated`, `held`, or
`blocked`; do not use a terminal rejection state.
