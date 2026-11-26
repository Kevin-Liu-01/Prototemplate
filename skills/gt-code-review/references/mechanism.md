# Mechanism over patch

A patch makes one observed case pass. A mechanism decides from a typed
field, a measurement or a maintained library, so it holds on inputs nobody
looked at. Kevin asked on 2026-11-24 for the image pull requests' "regexes
and fragile patches" to become "robust, maintainable mechanisms", and Brian
Lou's cleanup of the same stack removed regexes and temporary workarounds.

Commit links below are to `github.com/generaltranslation/gt-cloud`.

## M1. No regex or substring test on model output, prompt text or note prose to make a decision

**Look for:** `.match`, `.test`, `.includes`, `startswith`, `split("; ")`
or `re.search` applied to a prompt, a model answer, a tool's text reply, a
task description or a note written for people, where the result picks a
branch. Also a constant that holds a sentence and is searched for in a
string. A test that asserts a prompt holds a sentence makes no decision and
is not a finding.

**Why:** a model or a person may reword the text at any time, and the
branch then changes with no error. The decision belongs in a field that a
schema types. Brian named this class on 2026-11-25: "doing a regex match on
the existence of a sentence in the prompt".

```ts
// Bad: the folder is read back out of the worker's prompt.
const folder = task.match(/image folder: (\S+)/)?.[1];
// Good: the folder is an argument the tool schema types.
inputSchema: z.object({ imageFolder: z.string() });
```

```python
# Bad: a kept line's reason is parsed from its human-readable note.
is_name = line["note"].startswith("kept as a name")
# Good: the reason is its own field.
is_name = line["kept_as"] == "name"
```

**Sources:** Brian's relayed Slack words, 2026-11-25. Brian's
[b1551e9](https://github.com/generaltranslation/gt-cloud/commit/b1551e9535428d41d8d9f3195c735a71953cf56c)
(a worker works in the folder passed as its args, "rather than one read from
its task's words"),
[4160ff8](https://github.com/generaltranslation/gt-cloud/commit/4160ff8f4a12664703dadff713f3db22aa2c67bc)
(a kept line records why it was kept as its own field, `kept_as`), and the
body of [#6186](https://github.com/generaltranslation/gt-cloud/pull/6186)
("nothing parses the worker's prompt"). Kevin, decisions log 2026-11-24
23:28 PST.

## M2. No case-tuned constant

**Look for:** a threshold changed with a comment such as "was 0.9", a
comment that names one picture, video, run or round, a literal that only
one test case reaches, a word list of one language that decides layout, and
a branch for one named input.

**Why:** a value tuned on one case breaks the next case, and nothing records
which case it was tuned on. On 2026-10-16 an audit counted 72 case-tuned
rules among 108 added in one day, and Kevin said "i dont want band aids. i
want this to just be able to do it". A rule that must be tuned is measured
from the input itself, or it is registered with its case and the mechanism
that will replace it.

```python
# Bad
PARA_PITCH = 0.6  # was 0.9; boxes of one screenshot sit tight
# Good: the pitch is measured from the block's own lines.
pitch = median(b.top - a.top for a, b in pairs(lines)) / median_height(lines)
```

A comment that names one picture or run is a lead. A constant whose comment
states the sample it was measured on, such as "188 word pairs of eleven
images", is the registered form and passes. A codec or library setting with
its purpose stated is no tuned rule.

**Sources:** Kevin, decisions log 2026-10-16, "Fixes are mechanisms, not
band-aids". Kevin's memory note `no-bandaids-and-self-tagging`.

## M3. No hand-rolled parser or language table where a maintained library exists

**Look for:** a character loop that parses a format, a table of Unicode
ranges, particles, month names or abbreviations, and byte reads of a file
header. Check the table below and the repository's dependencies first;
gt-cloud's `packages/node` already depends on
`@formatjs/icu-messageformat-parser`.

**Why:** a format's edge cases are many, and a library has met them. Brian
flagged "a hand-rolled icu parser" on 2026-11-25. His own fixes read a
file's bit depth from OpenCV's decode and a face's monospace from its font
tables, in place of rules written by hand.

| Job | Use |
| --- | --- |
| Parse an ICU message | `@formatjs/icu-messageformat-parser` in TypeScript; pass Python the parsed pieces as typed data |
| Break Japanese or Chinese lines | BudouX, with the Unicode line breaking algorithm (UAX #14) through ICU for the rest |
| Split words or graphemes | `Intl.Segmenter`, or ICU's BreakIterator through PyICU |
| Know a character's script | `\p{Script=Han}` in a Unicode-aware TypeScript pattern; in Python, `fontTools.unicodedata.script` and `script_extension` (fontTools is often pinned already) or the `regex` module; never a hand-typed range table |
| Know a locale's script | `new Intl.Locale(tag).maximize().script` (CLDR likely subtags), passed to Python as an argument |
| Parse or compare locale tags | `Intl.Locale`, or `langcodes` in Python |
| Names of months and days | `Intl.DateTimeFormat`, or Babel |
| Bit depth and colour mode of an image | The decoder (OpenCV or Pillow), not header bytes |
| Is a face monospace | Its font tables through fontTools (`post.isFixedPitch`, `hmtx` advances) |

Where no library is a dependency yet, the change either adds one, pinned
under rule S5, or keeps a short parser that follows the format's published
grammar and says so, with a test per case of the grammar. The pull request
states which, and why.

```python
# Bad: a loop that unescapes quotes and splits on braces.
def message_pieces(message): ...  # 40 lines of index arithmetic
```

```ts
// Good: the library returns a typed tree, and a literal or argument is a node kind.
import { parse, TYPE } from '@formatjs/icu-messageformat-parser';
const pieces = parse(message).map((el) => (el.type === TYPE.argument ? { arg: el.value } : { text: el.value }));
```

**Sources:** Brian's relayed Slack words, 2026-11-25. Brian's
[7a43680](https://github.com/generaltranslation/gt-cloud/commit/7a43680b635333d8e0232ece1b871b823c4222c6)
(bit depth from OpenCV's decode) and
[24435db](https://github.com/generaltranslation/gt-cloud/commit/24435db67a0bda651f2e430387d02295d524c803)
(monospace from the font tables).

## M4. One owner for each fact

**Look for:** the same number, table, rule sentence or pattern in two
files, in two languages (TypeScript and Python), or in code and a prompt.
Examples are a time bound written in a tool, a script and a goal prompt, or
a script table kept in four modules.

**Why:** two copies drift, and the reader cannot tell which one wins. One
module owns the fact; the others read it from that module, or the owner
serves it, for example as a field of the command's answer.

```ts
// Bad: the bound is typed in TypeScript, in Python and in goal.md.
const CRITIC_GAP_MS = 30 * 60_000;
// Good: the command that owns the bound returns it.
const { criticGapMinutes } = await tcimg.start(job);
```

**Sources:** Brian's
[90a1f11](https://github.com/generaltranslation/gt-cloud/commit/90a1f11e4b83afba69928e81e651bb5622381717)
(a rule in one prompt file that every judge reads),
[9891f59](https://github.com/generaltranslation/gt-cloud/commit/9891f59c6e271c55800e0866103e379fafa889e7)
(the particles listed once),
[23c4e13](https://github.com/generaltranslation/gt-cloud/commit/23c4e13aabc6b2a1a3195ec77c9ec6afbc165a1b)
(a pattern written once),
[c2c8689](https://github.com/generaltranslation/gt-cloud/commit/c2c868948917add4e3359738b011ff1c6619d83f)
(one big-lama module behind both GPU servers),
[4d5780f](https://github.com/generaltranslation/gt-cloud/commit/4d5780fdca1dd4325726be023ea3bb8c7282bf81)
(one image budget for every session) and
[eaa3b96](https://github.com/generaltranslation/gt-cloud/commit/eaa3b968997cd7b88182435cad4c74eb2972b0b5)
(the critic hold reads its due time from the image code).

## M5. No silent fallback

**Look for:** an empty `catch`, `except: pass`, a default returned where a
read failed, an input converted into a form it does not fit, and a step
that is off but still records success.

**Why:** a fallback hides the failure from the person who could fix it, and
a result that looks finished passes every later gate. A step that cannot
run refuses with a line that names why, and a job that cannot be done ends
with its reason.

```python
# Bad: a 16-bit file is clipped to 8 bits and translated as near white.
img = (img / 256).astype("uint8")
# Good
if img.dtype != np.uint8:
    raise ImageRefused(f"{img.dtype} images are not supported; send an 8-bit PNG or JPEG")
```

**Sources:** Kevin, decisions log 2026-11-25 04:59 PST (an off step that
recorded its keys and drew nothing is "a silent fallback"). Kevin's memory
note `free-agent-no-flag-gpu-required` (a job with no GPU fails at its start
with a plain line). Brian's
[#6189](https://github.com/generaltranslation/gt-cloud/pull/6189) (16-bit,
float and CMYK images "are refused up front instead of being clipped") and
[eaa3b96](https://github.com/generaltranslation/gt-cloud/commit/eaa3b968997cd7b88182435cad4c74eb2972b0b5)
(a call whose due time cannot be read fails).

## M6. A retryable failure is never stored as an answer

**Look for:** a `catch` that writes the error into the answer file or the
cache, a retry loop with no bound, and an error type that does not say
whether it is retryable.

M5 applies when any failure becomes a default or a success; M6 applies
when a failure that a retry could clear is recorded as the final outcome.

**Why:** a stored transient failure is replayed as the answer forever, and
an unbounded retry spends money without end. A retryable failure leaves its
request open; a permanent one is written with `retryable: false`; retries
stop at a stated bound.

```ts
// Bad
catch (error) { await writeAnswer(ask, { error: String(error) }); }
// Good
catch (error) {
  if (isRetryable(error)) return; // the request stays open for the next round
  await writeAnswer(ask, { error: describe(error), retryable: false });
}
```

**Sources:** Brian's
[812353e](https://github.com/generaltranslation/gt-cloud/commit/812353ec6791f7998e5ebcd1b7e0f5b14c0f840b)
(settle every ask before failing, bound failed retries) and
[#6189](https://github.com/generaltranslation/gt-cloud/pull/6189) ("A
retryable model or service failure leaves its request open").

## M7. Bound the work before a paid call, and bill what was spent

**Look for:** a paid call made before its input's size is checked, a batch
loop that can pass its deadline with finished work unsaved, and a path
where spent GPU or model time is not billed because a later step failed.

**Why:** a refusal before the call costs nothing, while a refusal after it
costs the call. Work that finished before a deadline is saved, and time
that a provider charged is billed even when the request failed.

```ts
// Bad: ElevenLabs is charged, then the take does not fit its file.
const audio = await synthesize(text);
// Good
if (text.length > MAX_TAKE_CHARS) throw new ToolInputError('split the text into takes');
```

**Sources:** Brian on
[#5904](https://github.com/generaltranslation/gt-cloud/pull/5904#issuecomment-6926079504)
(`synthesize_speech` refuses text over 3,000 characters "before it calls
ElevenLabs") and
[#5904](https://github.com/generaltranslation/gt-cloud/pull/5904#issuecomment-6872880659)
(batches stop starting when the next may not finish, and finished batches
are written). Kevin's review on
[#5902](https://github.com/generaltranslation/gt-cloud/pull/5902#issuecomment-6871659893)
(a turn recorded while a call still runs bills that call as 0). Brian's
[#6189](https://github.com/generaltranslation/gt-cloud/pull/6189) ("GPU time
spent on a failed or timed-out POST is billed").

## M8. Code never overrides the judgement it asked a model for

**Look for:** a code detector that runs after a model's answer and replaces
it, such as an abbreviation check that refuses a wording the review
accepted.

**Why:** two judges of one question disagree on some inputs, and the code
judge is the patch. When the model owns a judgement, the code gives it the
rule in its prompt and reads its typed answer.

```python
# Bad
if review.accepts(wording) and not looks_abbreviated(wording): ...
# Good: the review's schema has the field, and its prompt states the rule.
if review.accepts(wording) and not review.is_short_form: ...
```

**Source:** Brian's
[10633dd](https://github.com/generaltranslation/gt-cloud/commit/10633ddd8ab0fbcd4a176c9fc0d734097336eccd)
("the reading's review alone decides a short form, with no code detector
that overrides it").

## M9. A new route or kind keeps the invariants of the records and queues it joins

**Look for:** a new session namespace, job kind, reroute or format that
shares a queue, workspace, cache key or table with existing ones, and no
check that the old invariant still holds: one namespace per workspace, one
consumer per queue name on every deployed worker, one row per key.

**Why:** the new path works alone and breaks the old one where they meet,
for example when an old worker in a rolling deploy picks up a session kind
it has no consumer for, or when a rerouted job attaches to a session of
another kind. The change states each shared key, checks the invariant where
records join, and names the deploy order.

```ts
// Bad: any active session on the workspace takes the job.
const session = await activeSession(workspaceKey);
// Good
if (session && session.namespace !== job.namespace) throw new AgentCoreError('workspace held by another kind', { retryable: true });
```

**Sources:** Kevin's review on
[#5905](https://github.com/generaltranslation/gt-cloud/pull/5905#issuecomment-6871660755)
(media sessions started in the same deploy that registers their consumer
reach old workers) and Brian's answer on
[#5905](https://github.com/generaltranslation/gt-cloud/pull/5905#issuecomment-6872880985)
(the flags stay off until every worker has the consumer). Brian's
[#6189](https://github.com/generaltranslation/gt-cloud/pull/6189) callout
on deploy order.
