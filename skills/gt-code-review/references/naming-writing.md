# Naming and writing

Code, comments, prompts, commit messages and pull request bodies use
Kevin's plain technical English. The `gt-voice` skill holds the full voice;
these rules are the parts a code review checks.

## N1. Names match the schema documents, and a rename changes all of them at once

**Look for:** a record field, tool or parameter whose name differs from the
data model or tools document, and a rename that changes the code but not
the schema, the docs and the prompts.

**Why:** a reader and a model both learn the system from its documents, and
a second name for one field is a second field to them.

**Source:** Kevin's code rule 5 for his translation pipeline repositories:
"A name change updates the schema, the code and every document in one
change".

## N2. One term for one concept

**Look for:** two words for one thing across code, prompts and UI, such as
"picture" in one module and "image" in the next.

**Why:** a model reading the prompts and a person reading the code each
assume two words mean two things.

**Source:** Brian's
[d6d77f2](https://github.com/generaltranslation/gt-cloud/commit/d6d77f2d772f4c69b8fe9a06ba1ec7f6ffbc23d3)
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

**Sources:** Kevin's writing rules for his repositories (complete
declarative sentences, one claim each). Kevin's memory note
`gtcloud-no-hashes-no-parity` for hashes.

## N4. Plain declarative English in code, prompts, commits and pull requests

**Look for:** em or en dashes (U+2014, U+2013), metaphors, parenthetical asides, contrast
pairs, fragments, adjectives where a number or mechanism would do, and
marketing words.

**Why:** a sentence that makes one claim can be checked. Kevin's rules ask
for numbers or mechanisms instead of adjectives.

```text
Bad:  Massively faster erase, a huge win for long clips!
Good: The erase takes 0.055 s per crop on the GPU, against 1.39 s on 2 CPU threads.
```

**Source:** Kevin's writing rules 1 to 3; the `gt-voice` skill.

## N5. A pull request body states what changed, the tests with counts, what is not proved and what was checked and rejected

**Look for:** a body with no test counts, no "not proved" line for what
did not run end to end, and bot findings answered with a fix and no
evidence, or dismissed with no reason.

**Why:** the reviewer decides from the body which parts need a close look.
Brian's bodies give a "Worth a close look" item, the tests with counts, a
"Not proved" line, review callouts for deploy order, and a "Not changed"
list with one reason per finding.

**Sources:** Brian's
[#6184](https://github.com/generaltranslation/gt-cloud/pull/6184),
[#6186](https://github.com/generaltranslation/gt-cloud/pull/6186) and
[#6189](https://github.com/generaltranslation/gt-cloud/pull/6189) bodies;
his replies on
[#5903](https://github.com/generaltranslation/gt-cloud/pull/5903#discussion_r4566762250)
and
[#6197](https://github.com/generaltranslation/gt-cloud/pull/6197#discussion_r4685928824),
which answer a finding with the code path and production counts.
