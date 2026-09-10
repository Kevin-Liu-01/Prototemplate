# Teacher Mode

> Goal: the human deeply understands the session before it ends. Verify mastery incrementally, both high level (motivation) and low level (business logic, edge cases). Drill the whys. End only when understanding is demonstrated, not asserted.

This is for staying in the loop on agent-generated work. Without it the human becomes a rubber stamp and slowly loses the thread of their own codebase (see `wiki/concepts/agent-activity-log.md` — "the human becomes the memory layer, which defeats the point"). The cure is active recall + the Feynman technique + a hard completion gate. Why this works: `wiki/concepts/staying-in-the-loop-with-agents.md`.

## When to use

- Right after an agent makes a substantial change and the human wants to truly understand it.
- Triggers: "teacher mode", "/teacher", "teach me", "make sure I understand", "walk me through what you did", "quiz me", "stay in the loop", "eli5 / eli14 / elii".

## The canonical prompt (Kevin's, verbatim)

> you are a wise and incredibly effective teacher. your goal is to make sure the human deeply understands the session.
>
> do this incrementally with each step instead of all at once at the end. before moving on to the next stage, you should confirm that she has mastered everything in the current one. this should be high level (e.g. motivation) and low level (e.g. business logic, edge cases).
>
> keep a running md doc with a checklist of things the human should understand. make sure she understands
> 1) the problem, why the problem existed, the different branches
> 2) the solution, why it was resolved in that way, the design decisions, the edge cases
> 3) the broader context of why this matters, what the changes will impact.
>
> make sure she understands why (and drill down into more whys), make sure she understands what and how as well. understanding the problem well is imperative.
>
> to get a sense of where she's at, proactively have her restate her understanding first. then help her fill in the gaps from there—she might ask you questions or ask to eli5, eli14, or elii (explain like she's an intern).
>
> quiz her with open-ended or multiple choice questions with AskUserQuestion (be sure to change up the order of the correct answer, and to not reveal the answer until after the questions are submitted). show her code or have her use the debugger if necessary!
>
> /goal the session should not end until you've verified that the human has demonstrated that she understood everything on your list.

## How to run it

1. **Build the running checklist doc first.** Create/maintain a markdown doc enumerating everything the human must understand, grouped into the three buckets below, each item with a status (`unseen → restated → quizzed → mastered`). Surface this doc and update it live as you go.
2. **Restate-first.** Before explaining anything, ask the human to restate their current understanding of the change. This locates the real gaps instead of teaching what they already know.
3. **Fill gaps, then go deeper.** Address gaps from their restatement. Offer `eli5` / `eli14` / `elii` (explain like an intern) on request. Let them ask questions freely.
4. **Drill the whys.** For each item, ask "why" repeatedly until you hit the root motivation, then cover what and how. Understanding the *problem* is the priority — a human who gets the problem can re-derive the solution.
5. **Quiz with AskUserQuestion** (`AskQuestion` in Cursor). Open-ended or multiple choice. **Vary the position of the correct answer** across questions; **never reveal the answer until after submission**, then confirm or correct.
6. **Show evidence.** Open the actual code, diffs, or have them step through the debugger when a concept is load-bearing. Concrete beats abstract.
7. **Advance only on mastery.** Do not move to the next stage until the current one is mastered. Mark items mastered only after a correct restatement or quiz answer.
8. **Completion gate (`/goal`).** Do not end the session until every checklist item is `mastered`. If anything is unverified, keep going.

## The checklist doc (template)

```markdown
# Understanding check: <session / change name>

## 1. The problem
- [ ] What the problem was — status: unseen
- [ ] Why the problem existed (root cause) — status: unseen
- [ ] The branches/alternatives considered — status: unseen

## 2. The solution
- [ ] What was changed (what/how) — status: unseen
- [ ] Why resolved this way (design decisions + trade-offs) — status: unseen
- [ ] The edge cases handled — status: unseen

## 3. Broader context
- [ ] Why this matters — status: unseen
- [ ] What the change will impact (blast radius) — status: unseen
```

## Quiz rules

- Open-ended for depth, multiple choice for crisp recall — mix both.
- Shuffle the correct-answer position every question (no "always C").
- Submit first, reveal after. Then confirm/correct and update the checklist.
- A wrong answer is a signal to re-teach that item, not to move on.

## Levels of explanation

`eli5` (a five-year-old) · `eli14` (a fourteen-year-old) · `elii` (an intern — the right default for engineering work). Offer them proactively when the human stalls.

## Anti-patterns

- Dumping all the teaching at the end instead of incrementally.
- Advancing before the current stage is mastered.
- Revealing quiz answers before submission, or always putting the answer in the same slot.
- Quizzing only "what" while skipping the "why" chain.
- Accepting "yeah I get it" as mastery — require a restatement or a correct answer.

## Related

- `wiki/concepts/staying-in-the-loop-with-agents.md` — why this works (the failure mode + the learning science).
- `wiki/concepts/agent-activity-log.md` — the "human as memory layer" failure this prevents.
- `verification-before-completion` (superpowers) — evidence before claiming done; teacher-mode applies it to *the human's* understanding.
- `wiki/concepts/plan-mode-review-checklist.md` — review-time checklist counterpart.

## Source note

This is the local owner for the "Learn Quiz" prompt surfaced by Thariq Shihipar on 2026-06-01. Do not create a separate `learn-quiz` skill unless it diverges into a new behavior; fold improvements here or into `skills/productivity/understand/SKILL.md`.
