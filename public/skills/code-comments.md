# Code Comments

A comment is for the next person reading the code, years from now, with no
knowledge of the feature, ticket, or conversation that produced it. It earns
its place by answering one of two questions:

1. **What does this do?** — the behavioral contract: inputs, outputs, failure
   modes, decision rules.
2. **What must stay true?** — a constraint or invariant the code itself
   cannot express, stated so a future "simplification" doesn't break it.

Everything else — why the feature exists, what it replaced, what trade-off
was weighed, why the change is safe — belongs in the plan doc, PR
description, or commit message, not in source.

## Banned patterns

**Justification / cost-benefit narrative.** The comment defends a decision
instead of describing behavior.

```ts
// BAD: New values of identity fields pass through without an LLM call —
// translating a `model_uid` would corrupt data, which is worse than the
// bill this feature saves.

// GOOD: 'identity' — every value of the field is byte-identical to its
// translation; 'translated' — at least one value differs. Determines
// whether an unmatched value may pass through untranslated.
```

**Implementation history.** "Before this change…", "previously this
retranslated the whole blob…", "this used to be…". The reader has git.

**Reviewer-directed commentary.** "This is safe because…", "note that we
correctly…", "this should always succeed". If it states no behavior or
constraint, delete it; if a failure genuinely can't happen, the code should
not handle it.

**Narrating the next line.** `// loop over the chunks` above a loop over the
chunks.

**Feature tours.** Module headers that explain the product problem the module
solves. Describe what the module's functions do; one or two sentences.

## What deserves a comment

**A constraint the code cannot show.** The strongest kind of comment — it
prevents a correct-looking edit that breaks a non-local assumption:

```ts
// GOOD: Non-ASCII must fail this test: CJK prose contains no spaces, so a
// whitespace check alone cannot exclude it.
const IDENTIFIER_SHAPED = /^[A-Za-z0-9_\-./+:@]*$/;
```

**A behavioral contract on an exported function.** Docblock stating what it
returns for which inputs, including the failure/null cases. Present tense,
declarative, no "we".

**A guard against wrong unification or wrong simplification.** When a future
reader will be tempted to merge two similar-looking things or delete a
"redundant" branch, state the behavioral difference or the invariant — one
sentence, as fact, not story:

```ts
// GOOD: Unlike nestedExpressionFields.ts (which skips non-literal values
// inside a field whitelist), leaf collection here is all-or-nothing: any
// non-literal node disqualifies the entire chunk.
```

## Style

- Match the density and idiom of the surrounding file; don't out-comment it.
- Docblocks (`/** … */`) on exported functions and types; `//` for local
  facts.
- Present tense, third person: "Returns null unless…", not "we return" or
  "this will return".
- If a comment needs a paragraph of justification to make sense, the
  justification goes in the PR description and the comment shrinks to the
  invariant.

## Review test

Before keeping a comment, ask: **if the feature discussion had never
happened, would this sentence still be true and useful?** Comments that only
make sense as part of the implementation conversation ("this fixes the $70
re-billing", "worse than the bill this saves") fail the test.
