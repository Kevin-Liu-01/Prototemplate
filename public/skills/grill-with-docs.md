# grill-with-docs

Align with me on the design before any code gets written. The job is to reach a shared understanding of *what we're building and why*, capture the durable decisions, and leave the codebase's language sharper than you found it.

Do this in **two stages**. The mistake the original skill made was going straight to Stage 2 — walking branches depth-first before anyone could see the whole tree. A late branch then invalidates decisions you already nailed down. Map the tree's shape first.

## Stage 1 — Shape the design tree (breadth)

Before asking a single deep question, map the **shape** of the design: the major decision axes, where they branch, and which decisions block which. You cannot correctly walk a tree you cannot see.

Read [DESIGN-TREE.md](DESIGN-TREE.md) for how to enumerate and present the tree. In short:

1. From the idea + a quick codebase scan, list the **decision axes** (the questions that have genuinely different answers, not the obvious ones).
2. For each axis, note the **branches** (the realistic options) and **what each branch blocks or opens** downstream.
3. Render the whole tree compactly (a nested list or a mermaid graph) and mark the **load-bearing** branches — the few decisions the most other decisions hang off.
4. Show it to the user and get the shape confirmed or corrected **before** going deep. This is the artifact of Stage 1.

Why: surfacing dependencies up front lets you spend depth only where it pays, and tells you which branches deserve a higher-fidelity prototype (Stage 2) versus a one-line answer.

## Stage 2 — Resolve the frontier in rounds

Now walk the load-bearing branches without serializing independent decisions.
The **frontier** is every unresolved decision whose prerequisites are settled.
Ask the whole current frontier in one numbered round, with a recommended answer
for every question, then wait for the user's answers. Recompute the tree and its
frontier after each round.

```text
Q1 — <question title>: <decision and realistic choices>
Recommendation: <recommended answer and why>
```

- A question that depends on another unanswered question in the same round is
  not on the frontier yet; defer it to a later round.
- Facts are the agent's job. Inspect the codebase, source, tools, or existing
  artifacts instead of asking the user to retrieve discoverable facts.
- Decisions are the user's job. Do not silently turn a recommendation into a
  settled branch.
- Keep a visible map from each answer to the branches it settles, opens, or
  forecloses. Round size follows the frontier; it is not an arbitrary batch.

- **If a question can be answered by exploring the codebase, explore it** instead of asking.
- **Escalate fidelity where the branch warrants it.** A real state/logic question or a look-and-feel question is better answered by a throwaway prototype than by more prose — hand off to the `prototype` skill (LOGIC: a runnable terminal app pushing the state machine through hard cases; UI: several variations on one route). Keep only the *answer*.
- Resolve from highest-leverage branch downward, so a settled parent constrains its children.

The grill is complete only when the frontier is empty, every material branch is
settled or explicitly deferred with an owner, and the user confirms the shared
understanding. Then continue to the PRD (`to-prd`).

## Supporting info — capture decisions as you go

### Domain awareness

During codebase exploration, look for existing docs. Most repos have a single context (`CONTEXT.md` at root, `docs/adr/` for decisions). If a `CONTEXT-MAP.md` exists at root, the repo has multiple contexts; read it to find which one the topic relates to. Create files **lazily** — only when you have something to write.

### Build the shared language (CONTEXT.md)

- **Challenge against the glossary.** When the user uses a term that conflicts with `CONTEXT.md`, call it out immediately.
- **Sharpen fuzzy language.** When a term is vague or overloaded, propose a precise canonical term ("you're saying 'account' — Customer or User? those are different").
- **Stress-test with concrete scenarios.** Invent edge-case scenarios that force precision about boundaries between concepts.
- **Cross-reference code.** If the user states how something works, check whether the code agrees; surface contradictions.
- **Update `CONTEXT.md` inline** as terms resolve — don't batch. It is a glossary and nothing else (no implementation details). Format: [CONTEXT-FORMAT.md](CONTEXT-FORMAT.md).

### Record decisions (ADRs, sparingly)

Only offer an ADR when **all three** are true: hard to reverse, surprising without context, the result of a real trade-off. Otherwise skip it. Format: [ADR-FORMAT.md](ADR-FORMAT.md).

---

*Adapted from [Matt Pocock's `grill-with-docs` and `grilling`](https://github.com/mattpocock/skills/tree/84fdeffd12f2ee307994d1eb6feb48173b6e0502/skills) (MIT). The breadth-first Stage 1 is Kevin's local addition; dependency-frontier rounds follow the v1.2 source and saved demo. See `wiki/concepts/design-tree-exploration.md` and `wiki/workflows/ai-powered-development-phases.md`.*
