# Loopy

Use this skill to turn vague "keep improving" work into a bounded loop with a check, a next action, and a stopping condition.

Primary sources:

- `wiki/tools/loopy.md`
- `raw/x-bookmarks/enriched/2070876072619765805.json`
- `https://github.com/Forward-Future/loopy`
- `https://signals.forwardfuture.ai/loop-library/`

## Loop Shape

Every loop must answer four questions:

1. What is the agent trying to accomplish?
2. How will it know whether the latest attempt worked?
3. What should it do with what it learned?
4. When should it finish or ask for help?

If one answer is missing, do not run the loop yet.

## Crafting A Loop Skill

1. **Find the repeated work.** Search the wiki, current repo, and recent task context for the recurrence.
2. **Check the catalog.** Use the Loopy page or live catalog before inventing a new loop.
3. **Write the loop contract.** Include goal, inputs, pass check, next action, stop condition, and escalation condition.
4. **Attach proof.** Require commands, screenshots, artifacts, traces, or receipts that prove each pass helped.
5. **Bound it.** Set a max pass count or a "no meaningful improvement" stop.
6. **Promote only if reusable.** If Kevin will ask twice, create or update a skill/automation.

## Running A Loop

For each pass:

1. State the pass goal.
2. Make one focused change or observation.
3. Run the check.
4. Keep the change only if evidence improved.
5. Record the action, evidence, outcome, and stop reason.

Do not quietly publish, schedule, message, mutate production, or spend money. Ask first.

## Debugging A Loop

Audit weak loops for:

- no objective check
- vague judge language
- no stop condition
- unsafe side effects
- hidden external state
- no receipt
- evaluator that never gets harder

Repair only the material weakness.

## Related Skills

- `agent-eval-library` — benchmark agent runs and evolve evaluators.
- `skill-creator` — codify reusable loops as executable skills.
- `agent-iteration-loop` — implementation loop for repo work.
- `x-bookmark-absorb` — promote loop-related bookmark artifacts into the wiki graph.
