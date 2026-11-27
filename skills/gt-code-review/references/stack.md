# Stack and pull request shape

A pull request is the unit that a reviewer reads. These rules decide whether
a reviewer can read it, trust it and approve it in one sitting. A review
checks them before it reads a line of code, because a stack of the wrong
shape cannot be reviewed well, however good its lines are.
`scripts/stack-shape.mjs` checks K1 to K5 and N6 on a list of pull
requests. K6 to K8 need reading.

## K1. A stack splits by concept, not by review round

**Look for:** a branch or title named by when the work happened, such as
`r3-fixes`, `r4-fixes`, `review-mechanisms` or "review findings fixed"; one
mechanism changed in three pull requests of one stack; and a later pull
request that undoes an earlier one.

**Why:** a round's name tells the reviewer when a change was made, not what
it does. A reviewer who reads a stack by concept reads each mechanism once,
whole. A stack in round order makes the reviewer rebuild each mechanism
from its pieces. When review rounds pile up, restack before asking for the
next review. Write one pull request per concept, in the order the concepts
depend on each other, and keep any approval that still applies.

**Source:** the gt-cloud image stack of 2026-11-26.
[#6204](https://github.com/generaltranslation/gt-cloud/pull/6204) is
`k/image-r3-fixes`, [#6207](https://github.com/generaltranslation/gt-cloud/pull/6207)
is `k/image-r4-fixes`, and
[#6208](https://github.com/generaltranslation/gt-cloud/pull/6208) is titled
"image review findings fixed" over 133 files.

## K2. A change to a shared package is its own pull request, first in the stack

**Look for:** `packages/agent-core`, `packages/node`, `packages/sandbox-core`,
`packages/settings`, `apps/api` or `tooling` changed in a pull request whose
title names a product, such as translation or captions.

**Why:** a shared package has its own owners and its own callers. Its
change needs its own title, its own tests and a reviewer who knows that
package. Inside a product pull request it is missed, and a revert of the
product change reverts it too. Put it first in the stack, so the product
pull requests build on a reviewed base.

**Source:** [#6158](https://github.com/generaltranslation/gt-cloud/pull/6158)
is titled agent-core and carries image tests, `tcimg` and a `uv.lock`.
[#6194](https://github.com/generaltranslation/gt-cloud/pull/6194) changes
agent-core's store, subagents and session inside a translation pull request.
[#6208](https://github.com/generaltranslation/gt-cloud/pull/6208) adds
1,480 lines to `packages/node/src/formats` and 490 to
`packages/node/src/database` under an image title.

## K3. Copied code enters only as far as it runs, and the pull request names it

**Look for:** a folder copied from another repository, with modules that no
entry point of gt-cloud imports; a vendored update of thousands of lines in
one pull request; and a pull request body that does not name which paths
are copied, from where and by what command.

**Why:** nobody reads 46,000 copied lines, so their review is a formality.
Measure the import closure from the commands that gt-cloud runs, and delete
every copied module outside it (rule C4). Then ask whether copying is the
right boundary at all. A pinned package or image, built from the source
repository, leaves gt-cloud with only the contract it calls. That boundary
is a system decision for the owner. The review lays out the options with
the lines that remain under each and how an update flows.

**Source:** [#6159](https://github.com/generaltranslation/gt-cloud/pull/6159)
adds 65,928 lines, of which 46,673 are under the copied
`packages/translation/transcreate/`, and 30,680 of them in a scene package
that the definitive pipeline may no longer run.

## K4. A pull request holds what one reviewer reads in one sitting

**Look for:** more than 1,500 added lines that are not copied, generated, a
lockfile or a license. This bound is a proposed default and is Kevin's to
confirm.

**Why:** review quality falls with size. Past a few hundred lines a
reviewer skims, and past a thousand they approve on trust. Split by concept
(K1), and move shared packages out first (K2). When a pull request cannot be
split, its body says why and gives a reading order.

**Source:** [#6161](https://github.com/generaltranslation/gt-cloud/pull/6161)
adds 5,840 lines to read,
[#6213](https://github.com/generaltranslation/gt-cloud/pull/6213) adds
7,596 and [#6221](https://github.com/generaltranslation/gt-cloud/pull/6221)
adds 11,097. https://google.github.io/eng-practices/review/developer/small-cls.html.

## K5. A change too small to stand alone joins the pull request it completes

**Look for:** a pull request of 20 or fewer changed lines in a stack, such as
one line of a prompt.

**Why:** each pull request costs a reviewer a context switch and the stack
a rebase. A five-line change that only makes sense beside another change
belongs in that change.

**Source:** [#6205](https://github.com/generaltranslation/gt-cloud/pull/6205)
adds 5 lines to `tcimg` as its own pull request.

## K6. One mechanism across products

**Look for:** two products, such as image and video translation, that each
write a loop to a critic, an end by kind, a bound on rounds without
progress, a retry or a state of a job.

**Why:** rule Q8 catches duplication across files. The same mechanism
written twice in two products is the same defect at the system level, and
the two copies drift apart. Before a stack adds a loop, a state or a check,
search the other products' stacks for the concept. If it exists there, name
one owner for it in a shared package, as rule K2 places it.

**Source:** the gt-cloud video and image stacks of 2026-11-26. Each makes a
job work to a critic, ends it by kind and bounds the rounds without
progress, in `packages/translation/src/agent` and in `tcimg`.

## K7. A review round fixes classes, and a fix never grows the heuristic its finding questions

**Look for:** a reply "fixed" that adds a special case to the code the
finding named. Examples are a script list for character splitting, a
punctuation exception or a second wait. Another sign is a second review
round whose findings ask to remove what the first round's fixes added.

**Why:** a finding often shows that a mechanism is wrong, not that it misses
a case. Before writing a fix, ask these questions in order:

1. Should this code exist at all?
2. Does the platform or a library already do it?
3. Can a model judge it through a schema?
4. Is it a new rule over a measured property?

Only after all four is a special case the answer. The fix that deletes the
heuristic closes every later finding about it. Rule M10 states the class
rule for a single fix. This rule applies it to a whole review round.

**Source:** the first review round of
[#6213](https://github.com/generaltranslation/gt-cloud/pull/6213) was
answered with character splitting for six scripts, number punctuation kept
in `plain()` and owed speaker labels. The second round on 2026-11-26 asked
to remove the English filler list, the negation lists and the capital-letter
name test that those fixes had extended
([voice.ts:34](https://github.com/generaltranslation/gt-cloud/pull/6213#discussion_r4712216398),
[meaning.ts:4](https://github.com/generaltranslation/gt-cloud/pull/6213#discussion_r4712216407)
and [meaning.ts:118](https://github.com/generaltranslation/gt-cloud/pull/6213#discussion_r4712216413)).

## K8. A reply states the design change, once per thread

**Look for:** the same reply pasted on several threads; a reply that gives
only a commit hash; and a reply longer than the change it describes.

**Why:** the reviewer reads the reply to decide whether the thread is done.
In two or three sentences, say what changed in the design and why, or why
the behaviour stays. Answer duplicate threads once and link the others to
it.

**Source:** [#6213](https://github.com/generaltranslation/gt-cloud/pull/6213)
voice.ts:35, where one reply was posted on seven threads.
