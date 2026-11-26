# Cutover, not compatibility

When a system, component or pattern is replaced, the old one is deleted and
every call site moves in the same change. Two implementations of one thing
double the places a bug can live and leave every reader asking which one is
canonical. The wiki page `cutover-not-compatibility` states the rule for
all of the owner's work.

## C1. A replacement deletes the old path in the same change

**Look for:** a new function, module or prompt beside the old one that it
replaces; a `legacy`, `old`, `compat` or `fallback` name; an adapter that
turns the new shape back into the old one; docs and tests of the old path
left in place.

**Why:** the old path keeps running somewhere, and its bugs come back in
review after review. A cutover is more work in one change and less in every
change after it.

```ts
// Bad
export const runImage = useNewWorker ? runImageWorker : runImageLegacy;
// Good: runImageLegacy, its tests and its docs are gone, and every caller calls runImageWorker.
```

**Sources:** The wiki page `cutover-not-compatibility`. Decisions log 2026-11-16 14:53 PST, on removing the old runtime with its
API, editor and evaluation harness: "Yes, full cutover".

## C2. No feature flag keeps an old implementation alive

**Look for:** a flag, an environment switch or a profile setting that
chooses between the new system and the one it replaces, and a flag that
defaults to off for the system the change calls definitive.

**Why:** a flag at 0 is a second system that still ships. Safety comes from
order: prove the new path end to end in development, then merge it as a
cutover. A rollout flag that gates who reaches a new route is different: it
is allowed when the owner of the route asks for it, and the pull request
names when it is removed. The `image-transcreation` flag of #6189 is
that kind, with a deploy order in its callouts.

```python
# Bad
if os.environ.get("TC_FREE_AGENT") == "1": run_agent(job)
else: run_old_loop(job)
# Good
run_agent(job)
```

**Sources:** Decisions log 2026-11-21, "The free agent is
transcreate and carries no flag"; Memory note
`free-agent-no-flag-gpu-required` ("why is free agent a flag?? it is the
definitive transcreate"). [#6189](https://github.com/generaltranslation/gt-cloud/pull/6189) review
callouts for the rollout flag.

## C3. A removal that persisted state depends on is proved and staged

**Look for:** removal of a code path that stored records, workflow
histories, queued messages or cached files can still reach, with no count
of what is in flight.

**Why:** a cutover of code is one commit, but data written by the old code
may still be read. The pull request gives the count from production, and a
removal that a replay depends on goes in steps, as Temporal's
`deprecatePatch` and then the removal do. A branch guarded by Temporal's
`patched()` that no new workflow reaches is never extended; new behaviour
goes on the live branch only.

**Source:** [#6200](https://github.com/generaltranslation/gt-cloud/pull/6200): 0
running workflows and 4,753 recent ones carrying the marker were counted
before the old path was removed, and
[#6203](https://github.com/generaltranslation/gt-cloud/pull/6203) removes
the `deprecatePatch` call once every older workflow has finished. The
reply on
[#6197](https://github.com/generaltranslation/gt-cloud/pull/6197#discussion_r4685929131)
gives the same evidence.

## C4. Dead code leaves

**Look for:** a tool nothing registers, a request path nothing sends, an
operation the server does not serve, a standalone runner the product never
calls, and an output field or model answer that no later step reads.

**Why:** dead code is read, reviewed and kept current for nothing, and it
hides which path is live. A field that no step reads also costs tokens
every time a model writes it.

```ts
// Bad: exported, tested, never registered.
export function createEraseTool() { ... }
// Good: deleted with its test.
```

**Sources:** [#6189](https://github.com/generaltranslation/gt-cloud/pull/6189) (removes
`createEraseTool`, "which was never registered", the unused multipart path
and two unserved operations),
[8677867](https://github.com/generaltranslation/gt-cloud/commit/8677867e13cc354c4170a20febc40db4c74ef5f5)
(removes a standalone runner) and
[26cd4d1](https://github.com/generaltranslation/gt-cloud/commit/26cd4d15b119125fce9ec5b1b2904652778102b1)
(the critic no longer names fault kinds, "since no end reads them"). Decisions log 2026-11-24 10:24 PST, removing every unreferenced file after
a search of the whole tree.

## C5. A rename or removal searches the whole tree

**Look for:** a renamed or removed function, constant, argument, flag,
prompt heading or file, and no search outside the folders the change
touched.

**Why:** tests stand in for functions with their old argument counts,
benchmark scripts read removed constants, and tests read source and prompt
files by path. Each missed caller is a red gate after the merge. Search
with `git grep -I -F -f <names-file>` over the whole repository, tests,
docs, scripts and prompts included.

**Sources:** Memory notes `whole-tree-before-a-change-of-names`
(four misses in one evening from searching chosen folders),
`stand-ins-on-signature-change` (15 failed tests from stand-ins of the old
arity) and `grep-tests-before-key-removal`.

## C6. No bookkeeping between repositories

**Look for:** a commit hash, branch or pull request number of another
repository in code, comments, tests or a pull request body; a "copied from"
or "parity with" line; a stamp file.

**Why:** git already records where code came from, and gt-cloud's readers
need what changes in gt-cloud and why.

```python
# Bad
# Synced from the pipeline repo at 3f2a91c; keep in parity.
# Good: no line. The commit message says what this change does here.
```

**Source:** Memory note `gtcloud-no-hashes-no-parity`, 2026-11-21: gt-cloud
holds no hash or parity record of another repository.
