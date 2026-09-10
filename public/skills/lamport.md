# /lamport

Reason about state, not stories.

When a problem feels complicated, do not start by listing every possible
sequence of events. The number of sequences grows too quickly, and cases get
missed. Instead, name the property of the state that must be true at each point
for the final answer to be correct. That boolean-valued property is the
invariant.

Use the invariant to simplify the problem. Once the invariant is clear, each
operation only has to prove that it preserves the invariant.

## The pass

Start with the final answer. Say plainly what must be correct when the work is
done.

Then describe the state. Use concrete fields, flags, records, counters, sets,
locks, files, tables, or UI state as appropriate.

For each part of the problem, answer:

1. What state exists here?
2. What property of that state makes the final answer correct?
3. Which operations can change the state?
4. For each operation, why is the property still true afterward?
5. Which cases become impossible once the invariant is stated?
6. Which cases remain real and need handling?
7. What evidence, test, assertion, type, or observation would catch an
   invariant violation?

When the problem has multiple parts, split it into subsystems. Give each
subsystem its own invariant, then write the composition law that explains how
the subsystem invariants combine into the overall result.

## Output shape

Use this shape unless the user asked for something narrower:

```text
Product promise:
  ...

State:
  ...

Invariant:
  ...

Operations:
  operation X:
    state before:
    state after:
    why invariant still holds:

Tests:
  ...

Decision:
  ...
```

If there are subsystems, add:

```text
Subsystem invariants:
  A: ...
  B: ...

Composition law:
  externally_visible_result = ...
```

Keep it concrete. Prefer real field names, enum variants, counters, sets,
files, tables, UI states, requests, and observations over abstract labels.

## Coding guidance

Encode states as types or enums when practical. Prefer exhaustive case
analysis over open-ended conditionals when the state space is finite.

Add proof comments where a future reader needs the invariant:

```text
Invariant: every assigned item is in exactly one bucket.
Preservation: moving an item removes it from the old bucket before inserting it
into the new bucket.
Witness: the test sums bucket sizes and compares against the item count.
```

For concurrent or distributed work, also name fences and witnesses:

```text
Fence: commit only if latest_epoch is still the epoch used to build the plan.
Witness: fsync returns after records <= durable_seq are present in the log.
```

Do not add fallback behavior to hide an invariant violation. Classify surprising
cases as impossible-by-invariant, real runtime behavior, or stale/corrupt state
that must fail closed.

## Review questions

- What is the final answer supposed to be?
- What state determines that answer?
- What boolean property of the state makes the answer correct?
- After each operation, why is that property still true?
- Which edge cases disappear once the invariant is stated?
- Which edge cases remain real?
- What exact test would fail if the invariant were false?

## When not to use this

Do not use `/lamport` for pure formatting or simple copy edits. Use it when
the direct case-by-case story is getting too large to trust.

<!-- auto-promoted from skills/engineering/dedalus-lamport by sync-dedalus on 2026-06-13; review & generalize any Dedalus-specific references. -->

<!-- folded-skills:auto:start -->
## Folded Skill References

These former standalone skills are bundled here as references to keep the runtime list compact. Load only the reference that matches the user's exact product, framework, or failure mode.

| Former skill | Reference | Description |
| --- | --- | --- |
| `dedalus-lamport` | [`references/skills/dedalus-lamport/SKILL.md`](references/skills/dedalus-lamport/SKILL.md) | Simplify a problem by replacing sequence reasoning with state invariants. Use when the user invokes /lamport, asks for Lamport-style reasoning, or when a task has many cases, phases, interactions, or edge conditions that are hard to reason about directly. |
<!-- folded-skills:auto:end -->
