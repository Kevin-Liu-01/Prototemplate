# Naming and writing

Code, comments, prompts, commit messages and pull request bodies use
plain technical English. The `gt-voice` skill holds the full voice;
these rules are the parts a code review checks.

## N1. Names match the schema documents, and a rename changes all of them at once

**Look for:** a record field, tool or parameter whose name differs from the
data model or tools document, and a rename that changes the code but not
the schema, the docs and the prompts.

**Why:** a reader and a model both learn the system from its documents, and
a second name for one field is a second field to them.

**Source:** Code rule 5 of the translation pipelines' agent rules:
"A name change updates the schema, the code and every document in one
change".

## N2. One term for one concept

**Look for:** two words for one thing across code, prompts and UI, such as
"picture" in one module and "image" in the next.

**Why:** a model reading the prompts and a person reading the code each
assume two words mean two things.

**Source:** [d6d77f2](https://github.com/generaltranslation/gt-cloud/commit/d6d77f2d772f4c69b8fe9a06ba1ec7f6ffbc23d3)
("name tcimg's picture an image").

## N3. Comments state invariants, not history

**Look for:** "was 0.9", "used to", "previously", "no longer", "round 4",
"once drew X", a run's or a picture's name, a commit hash, and a docstring
that contradicts the code.

**Why:** history lives in git. A comment that states the rule the code
holds stays true until the code changes, and the reviewer can check it.

```python
# Bad
# Round 2 once drew the headline's last word alone, so we keep a break here.
# Good
# Every later line keeps at least one break.
```

**Sources:** The writing rules of the translation pipelines (complete
declarative sentences, one claim each). Memory note
`gtcloud-no-hashes-no-parity` for hashes.

## N4. Plain declarative English in code, prompts, commits and pull requests

**Look for:** em or en dashes (U+2014, U+2013), metaphors, parenthetical asides, contrast
pairs, fragments, adjectives where a number or mechanism would do, and
marketing words.

**Why:** a sentence that makes one claim can be checked. The writing rules ask
for numbers or mechanisms instead of adjectives.

```text
Bad:  Massively faster erase, a huge win for long clips!
Good: The erase takes 0.055 s per crop on the GPU, against 1.39 s on 2 CPU threads.
```

**Source:** Writing rules 1 to 3; the `gt-voice` skill.

## N5. A pull request body states what changed, the tests with counts, what is not proved and what was checked and rejected

**Look for:** a body with no test counts, no "not proved" line for what
did not run end to end, and bot findings answered with a fix and no
evidence, or dismissed with no reason.

**Why:** the reviewer decides from the body which parts need a close look.
The bodies of the image stack give a "Worth a close look" item, the tests with counts, a
"Not proved" line, review callouts for deploy order, and a "Not changed"
list with one reason per finding.

**Sources:** [#6184](https://github.com/generaltranslation/gt-cloud/pull/6184),
[#6186](https://github.com/generaltranslation/gt-cloud/pull/6186) and
[#6189](https://github.com/generaltranslation/gt-cloud/pull/6189) bodies;
the replies on
[#5903](https://github.com/generaltranslation/gt-cloud/pull/5903#discussion_r4566762250)
and
[#6197](https://github.com/generaltranslation/gt-cloud/pull/6197#discussion_r4685928824),
which answer a finding with the code path and production counts.

## N6. Code in gt-cloud reads as gt-cloud's own

**Look for:** in a gt-cloud diff,
- words of the translation pipeline that gt-cloud does not use, such as
  "the first pass", "the lead", "the box", "scenepass" or "the free agent",
  in names, comments, prompts or test names;
- machinery that gt-cloud's harness never calls: a runner, a resume path, a
  stored-job reader, a parameter or a hook kept for the pipeline's own
  command line;
- a comment that restates what the code says, and any comment block longer
  than 6 lines.

**Why:** gt-cloud's code runs on gt-cloud's harness, and its readers know
that harness and nothing else. Code that lands there carries no pipeline
hashes, no machinery for another harness and no text a reader must decode.
A comment is kept only where the code cannot state the invariant, and it
is short. Hashes and history in comments are rule N3 and stay there.

The bar is the density of gt-cloud's existing product files. Twelve files
of the agent and GPU stacks, such as
[`agent-core/src/store/externalCalls.ts`](https://github.com/generaltranslation/gt-cloud/blob/main/packages/agent-core/src/store/externalCalls.ts),
[`agent-core/src/session/budgetAlerts.ts`](https://github.com/generaltranslation/gt-cloud/blob/main/packages/agent-core/src/session/budgetAlerts.ts)
and
[`translation/gpu/operations.py`](https://github.com/generaltranslation/gt-cloud/blob/main/packages/translation/gpu/operations.py),
hold 109 comment lines in 866, 12.6 percent, and 9 of the 12 have no
comment block over 6 lines. The image code `tcimg` held 1,937 comment lines
in 10,667, 18.2 percent, with 43 blocks over 6 lines, at #6208's head. The
limit of 6 lines was confirmed 2026-11-26.

```python
# Bad
# The lead hands this stack to the first pass, which the free agent's
# critic reads back on its next turn. The box runner passes `box` so a
# stored job resumes where it stopped; gt-cloud's sandbox is the job's box,
# so it passes None. `lead` stays for the pipeline's command line. The
# order of the two writes matters because the critic reads the stack
# first, and an older run once read a stack that the second write had
# not reached yet.
def write_stack(job, stack, box=None, lead=None): ...

# Good
def write_stack(job: Job, stack: Stack) -> None:
    """Writes the stack before the render, since the critic reads the stack first."""
```

**Sources:** The owner's ruling of 2026-11-26, relayed by the coordinator
session. The pull requests
[#6184](https://github.com/generaltranslation/gt-cloud/pull/6184),
[#6186](https://github.com/generaltranslation/gt-cloud/pull/6186) and
[#6189](https://github.com/generaltranslation/gt-cloud/pull/6189), and
[8677867](https://github.com/generaltranslation/gt-cloud/commit/8677867e13cc354c4170a20febc40db4c74ef5f5)
(removes a standalone runner gt-cloud never calls). Memory note
`gtcloud-no-hashes-no-parity`, which rule N3 cites for hashes.
