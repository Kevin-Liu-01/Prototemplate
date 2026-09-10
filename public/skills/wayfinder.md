# Wayfinder

Chart a multi-session route through uncertainty. A Wayfinder map contains questions whose
answers unblock later decisions; it is not an implementation backlog.

## Contract

- Plan by default. Do not execute the destination unless the map explicitly says execution is in scope.
- Resolve at most one decision per session. Bounded parallel research is allowed only when the user
  explicitly authorizes subagents.
- Refer to maps and tickets by descriptive name, with an identifier or link inside the name when one exists.
- Keep each decision's full answer in exactly one ticket. The map stores a one-line pointer, not a duplicate.
- Use local Markdown unless the user explicitly authorizes GitHub, Linear, or another external write.
- Never create accounts, provision access, spend money, expose an endpoint, or mutate production merely to
  clear a ticket. Those actions keep their normal authority gates.

## Choose The Mode

### Chart

Use when the user brings a large or foggy effort.

1. Read the current conversation, existing plans, canonical wiki owners, and applicable project instructions.
2. Name the **destination**: the spec, decision, or changed state the map must make reachable.
3. Use `grill-with-docs` and domain language to explore breadth-first.
4. If the entire path is already clear and fits one session, stop and use `to-prd` or `to-issues`; no map is needed.
5. Create `plans/wayfinder/<slug>/map.md` and one file per currently specifiable ticket in
   `plans/wayfinder/<slug>/tickets/`.
6. Add blocking edges only after all initial tickets have stable names. Reject cycles.
7. Mark the frontier: every ticket that is open, unblocked, and unclaimed.
8. Leave uncertain but in-scope territory under **Not yet specified**. Do not invent premature tickets.

### Advance

Use when the user provides an existing map or asks to continue one.

1. Load the map first, not every ticket.
2. Select the named ticket or the first frontier ticket.
3. Claim it in the ticket before doing work so another session can skip it.
4. Load related decisions on demand and resolve only this ticket.
5. Record the answer in the ticket, mark it resolved, and append a one-line linked gist to the map.
6. Graduate newly sharp questions from fog into tickets, add or remove edges, and recalculate the frontier.
7. Move anything beyond the destination to **Out of scope**; do not disguise it as fog.
8. Stop when that one decision is resolved or when an authority gate needs the user.

## Map Template

```markdown
# <Map name>

## Destination
<One or two lines describing what becomes reachable when the map is complete.>

## Notes
<Standing constraints, vocabulary, skills, proof bar, and whether execution is ever allowed.>

## Decisions so far
- [<Resolved ticket name>](tickets/<file>.md) — <one-line gist>

## Frontier
- [<Open, unblocked, unclaimed ticket name>](tickets/<file>.md)

## Not yet specified
- <In-scope area whose precise question cannot yet be stated>

## Out of scope
- <Explicit boundary and why>
```

## Ticket Template

```markdown
# <Decision name>

Type: research-AFK | prototype-HITL | grilling-HITL | task-AFK | task-HITL
Status: open | claimed | resolved | out-of-scope
Blocked by: <ticket names or none>
Claimed by: <session/task or none>

## Question
<One precise decision or investigation that fits one fresh session.>

## Resolution
<Answer, evidence, resulting constraints, and links to any artifacts. Empty while open.>
```

## Ticket Types

- **Research (AFK):** inspect primary sources or local evidence to establish facts.
- **Prototype (HITL):** make the smallest concrete artifact needed for a human taste or behavior decision.
- **Grilling (HITL):** resolve a domain or product decision through live questioning; use `grill-with-docs`.
- **Task (AFK/HITL):** complete bounded prerequisite work only when a later decision cannot be made without it.

A ticket is a decision, not a deliverable. If it says “build the backend,” it belongs in `to-issues`, not here.

## Graph Invariants

- Every blocking edge points to an existing ticket.
- The dependency graph is acyclic.
- A frontier ticket is open, has no unresolved blockers, and is unclaimed.
- A resolved ticket cannot remain on the frontier.
- Fog is in scope but not yet precisely askable; out-of-scope work never graduates.
- Completion means the route is clear: no open decision tickets and no unresolved in-scope fog.

## Tracker Projection

Local Markdown is canonical by default. If the user explicitly requests an external tracker, project the same
map and tickets using native parent/child and blocking relations where available. Publish in dependency order,
preserve names, and record the external URLs back in the local map. External creation, assignment, comments,
and closure are mutations and require the authority granted by the request.

## Related Routes

- `grill-with-docs` sharpens the destination and HITL decisions.
- `to-prd` synthesizes a clear route into a product spec.
- `to-issues` converts a clear plan into executable vertical slices.
- `workflow-run-contract` governs later execution and proof.
- The brain goal graph shows active goals and loops; Wayfinder describes uncertainty inside one goal.

## Verification

Before handing off a chart or resolution:

1. Check all ticket links and blocking references.
2. Prove the graph is acyclic.
3. Recompute the frontier from status, blockers, and claims rather than copying it blindly.
4. Confirm decisions are pointers on the map and full answers live only in tickets.
5. Confirm no implementation backlog or unauthorized external mutation slipped into the map.

Adapted from `mattpocock/skills` `skills/engineering/wayfinder/SKILL.md` at
`84fdeffd12f2ee307994d1eb6feb48173b6e0502` (MIT), with local-first storage and Kevin's authority,
shared-worktree, and subagent constraints.
