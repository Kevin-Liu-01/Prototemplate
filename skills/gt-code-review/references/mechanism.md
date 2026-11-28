# Mechanism over patch

A patch makes one observed case pass. A mechanism decides from a typed
field, a measurement or a maintained library, so it holds on inputs nobody
looked at. The decisions log of 2026-11-24 asks for the image pull
requests' regexes and fragile patches to become maintainable mechanisms,
and the cleanup of the same stack removed regexes and temporary
workarounds.

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
schema types. A review of 2026-11-25 named this class: "doing a regex match on
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

**Sources:** A review relayed on 2026-11-25. Commits [b1551e9](https://github.com/generaltranslation/gt-cloud/commit/b1551e9535428d41d8d9f3195c735a71953cf56c)
(a worker works in the folder passed as its args, "rather than one read from
its task's words"),
[4160ff8](https://github.com/generaltranslation/gt-cloud/commit/4160ff8f4a12664703dadff713f3db22aa2c67bc)
(a kept line records why it was kept as its own field, `kept_as`), and the
body of [#6186](https://github.com/generaltranslation/gt-cloud/pull/6186)
("nothing parses the worker's prompt"). Decisions log 2026-11-24
23:28 PST.

## M2. No case-tuned constant

**Look for:** a threshold changed with a comment such as "was 0.9", a
comment that names one picture, video, run or round, a literal that only
one test case reaches, a word list of one language that decides layout, and
a branch for one named input.

**Why:** a value tuned on one case breaks the next case, and nothing records
which case it was tuned on. On 2026-10-16 an audit counted 72 case-tuned
rules among 108 added in one day, and the ruling that followed asked for
no band-aids: the system has to handle the case itself. A rule that must be tuned is measured
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

**Sources:** Decisions log 2026-10-16, "Fixes are mechanisms, not
band-aids". Memory note `no-bandaids-and-self-tagging`.

## M3. No hand-rolled parser or language table where a maintained library exists

**Look for:** a character loop that parses a format, a table of Unicode
ranges, particles, month names or abbreviations, and byte reads of a file
header. Check the table below and the repository's dependencies first;
gt-cloud's `packages/node` already depends on
`@formatjs/icu-messageformat-parser`.

**Why:** a format's edge cases are many, and a library has met them. A review of
2026-11-25 flagged "a hand-rolled icu parser". The cleanup's fixes read a
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

**Sources:** A review relayed on 2026-11-25. Commits [7a43680](https://github.com/generaltranslation/gt-cloud/commit/7a43680b635333d8e0232ece1b871b823c4222c6)
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

**Sources:** [90a1f11](https://github.com/generaltranslation/gt-cloud/commit/90a1f11e4b83afba69928e81e651bb5622381717)
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

The opposite mistake fails a whole batch for one bad item. One missing
source or one failed glossary group is skipped and reported, and the rest
of the batch goes on; only a failure that makes every result wrong ends the
run.

```python
# Bad: a 16-bit file is clipped to 8 bits and translated as near white.
img = (img / 256).astype("uint8")
# Good
if img.dtype != np.uint8:
    raise ImageRefused(f"{img.dtype} images are not supported; send an 8-bit PNG or JPEG")
```

**Sources:** Decisions log 2026-11-25 04:59 PST (an off step that
recorded its keys and drew nothing is "a silent fallback"). Memory
note `free-agent-no-flag-gpu-required` (a job with no GPU fails at its start
with a plain line). [#6189](https://github.com/generaltranslation/gt-cloud/pull/6189) (16-bit,
float and CMYK images "are refused up front instead of being clipped") and
[eaa3b96](https://github.com/generaltranslation/gt-cloud/commit/eaa3b968997cd7b88182435cad4c74eb2972b0b5)
(a call whose due time cannot be read fails).
[#4798](https://github.com/generaltranslation/gt-cloud/pull/4798#discussion_r4020560726)
and [#4798](https://github.com/generaltranslation/gt-cloud/pull/4798#discussion_r4020569679)
(one missing source or glossary result skips that item instead of failing
the whole context run).

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

**Sources:** [812353e](https://github.com/generaltranslation/gt-cloud/commit/812353ec6791f7998e5ebcd1b7e0f5b14c0f840b)
(settle every ask before failing, bound failed retries) and
[#6189](https://github.com/generaltranslation/gt-cloud/pull/6189) ("A
retryable model or service failure leaves its request open").

## M7. Bound the work before a paid call, and bill what was spent

**Look for:** a paid call made before its input's size is checked, a batch
loop that can pass its deadline with finished work unsaved, and a path
where spent GPU or model time is not billed because a later step failed.
Also a spend or rate check that runs again on a resume and fails a job
whose model work is already spent, and a usage write whose failure lets the
job finish with nothing billed and nothing left to retry.

**Why:** a refusal before the call costs nothing, while a refusal after it
costs the call. Work that finished before a deadline is saved, and time
that a provider charged is billed even when the request failed.

```ts
// Bad: ElevenLabs is charged, then the take does not fit its file.
const audio = await synthesize(text);
// Good
if (text.length > MAX_TAKE_CHARS) throw new ToolInputError('split the text into takes');
```

**Sources:** [#5904](https://github.com/generaltranslation/gt-cloud/pull/5904#issuecomment-6926079504)
(`synthesize_speech` refuses text over 3,000 characters "before it calls
ElevenLabs") and
[#5904](https://github.com/generaltranslation/gt-cloud/pull/5904#issuecomment-6872880659)
(batches stop starting when the next may not finish, and finished batches
are written). The review on
[#5902](https://github.com/generaltranslation/gt-cloud/pull/5902#issuecomment-6871659893)
(a turn recorded while a call still runs bills that call as 0). [#6189](https://github.com/generaltranslation/gt-cloud/pull/6189) ("GPU time
spent on a failed or timed-out POST is billed").
[#5422](https://github.com/generaltranslation/gt-cloud/pull/5422#discussion_r4330312410)
(a resumed turn's spend check fails the job after its model work is spent)
and [#5428](https://github.com/generaltranslation/gt-cloud/pull/5428#discussion_r4330319288)
(a failed usage write completes the job with nothing billed).

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

**Source:** [10633dd](https://github.com/generaltranslation/gt-cloud/commit/10633ddd8ab0fbcd4a176c9fc0d734097336eccd)
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

**Sources:** The review on
[#5905](https://github.com/generaltranslation/gt-cloud/pull/5905#issuecomment-6871660755)
(media sessions started in the same deploy that registers their consumer
reach old workers) and the answer on
[#5905](https://github.com/generaltranslation/gt-cloud/pull/5905#issuecomment-6872880985)
(the flags stay off until every worker has the consumer). [#6189](https://github.com/generaltranslation/gt-cloud/pull/6189) callout
on deploy order.

## M10. Name the class of a problem, and fix the class once

**Look for:** a fix with no stated class, such as "the headline on clip B
broke"; a branch keyed by an input's name, id or index; three special cases
that share a cause; a constant changed until one case passes.

**Why:** a case fix holds for the case and the next input of the class
fails. Before writing a fix, name the class it belongs to, state the
invariant that the class breaks, and write one rule over a measured
property. Prefer data, a table or a record, to a chain of branches, so the
next member of the class is a row. Rule M2 covers the tuned constant itself.

```python
# Bad: one branch per clip that showed the fault.
if clip == "promo-a": pitch = 1.3
elif clip == "promo-b": pitch = 1.1
elif clip == "launch": pitch = 1.45
# Good: the class is "paragraph lines set at their own pitch", and the rule reads it.
pitch = measured_pitch(block.lines)  # median gap between baselines over the line height
```

The `less-is-more` skill holds the rule to fix a problem's class once, and
`codebase-design` holds where the rule's module belongs.

**Sources:** Decisions log 2026-10-16, "Fixes are mechanisms, not
band-aids", and the owner's ruling of 2026-11-26 on abstract thinking,
relayed by the coordinator session. https://refactoring.guru/replace-conditional-with-polymorphism
and https://refactoring.guru/smells/switch-statements.

## M11. Text logic works in every source language

**Look for:** a list of words in one language that picks a branch (filler
words, negations, stop words, greetings, words a caption lowercases); a
test of a capital letter, a space or ASCII punctuation to find a name, a
word or a sentence end; a regex for sentence ends, written again in each
file that needs one; `text.split(' ')` to count words; `locale.split('-')[0]`;
a hand-typed set of language codes, such as the languages written without
spaces; and two definitions of one text concept, such as two functions
named `units`.

**Why:** General Translation translates from any source language, so the
text under the code can be Japanese, German or Arabic as often as English.
A word list holds for the languages someone typed and fails silently on
the rest: a negation list for eight languages counts "personne" as a
negation in every French sentence and finds none at all in most languages,
and "capitalized and not the first word" makes every German noun a name.
Boundaries come from `Intl.Segmenter`, which segments sentences, words and
graphemes per locale and runs in Workers; plural forms from
`Intl.PluralRules` or CLDR data, since Japanese, Chinese and Korean never
use `one`; locale parts from `Intl.Locale` or `@generaltranslation/locales`
(`getBaseLanguage`, `canonicalTag`). A judgement that depends on meaning,
such as whether a correction changes what a line says, is never read from
a word list: it compares segmented words, or it asks the model that already
reads the line for a typed answer (rule M8). A feature that cannot work in
every source language is removed, not kept for English.

```ts
// Bad: English fillers, an ASCII sentence end and a hand-split locale.
const FILLER_WORDS = new Set(['um', 'uh', 'like']);
const ended = /[.!?]\s*$/.test(text);
const base = locale.split('-')[0];
// Good: boundaries per locale, and the base language from the shared helper.
const segmenter = new Intl.Segmenter(locale, { granularity: 'word' });
const words = [...segmenter.segment(text)].filter((s) => s.isWordLike).map((s) => s.segment);
const base = getBaseLanguage(locale);
```

Check a change to text logic against a source language with no spaces
between words and no capitals (Japanese), one that capitalizes every noun
(German) and one written right to left (Arabic), before English.

**Sources:** The review of [#6213](https://github.com/generaltranslation/gt-cloud/pull/6213)
on 2026-11-26, whose main approach finding was logic that assumes an
English source: the English word lists in
[voice.ts:34](https://github.com/generaltranslation/gt-cloud/pull/6213#discussion_r4712216398),
the negation list in
[meaning.ts:4](https://github.com/generaltranslation/gt-cloud/pull/6213#discussion_r4712216407),
capitals as names in
[meaning.ts:118](https://github.com/generaltranslation/gt-cloud/pull/6213#discussion_r4712216413),
four sentence-end regexes in
[voice.ts:29](https://github.com/generaltranslation/gt-cloud/pull/6213#discussion_r4712216419),
two definitions of unspaced scripts in
[voice.ts:56](https://github.com/generaltranslation/gt-cloud/pull/6213#discussion_r4712216426)
and `split('-')[0]` five times in
[context.ts:21](https://github.com/generaltranslation/gt-cloud/pull/6213#discussion_r4712216477).
The plural review of [#6121](https://github.com/generaltranslation/gt-cloud/pull/6121)
(a target that never uses `one` gets no exact branch). The `gt-components`
skill's "Locales" section: never hand-roll locale code.

## M12. A value the code built stays data

**Look for:** a label, key or id assembled as a string and later read back
with a regex or `split`; JSON cut out of a model reply with
`indexOf('{')` and `lastIndexOf('}')`; and a second parse of a string the
same process wrote.

**Why:** the parse repeats the format by hand and breaks when the format
changes or a value holds the separator. Keep the parts as fields and
format them only where a person reads them. A model reply that code reads
is requested as structured output and parsed with its schema (rule TS1),
never cut out of prose (rule M1).

```ts
// Bad: the speaker number is written into a label, then read back out.
const label = `Speaker ${index + 1}`;
const index = Number(/Speaker (\d+)/.exec(label)?.[1]) - 1;
// Good: the parts are the data, and the label is drawn from them.
type Speaker = { index: number; name: string | null };
```

**Sources:** [#6213](https://github.com/generaltranslation/gt-cloud/pull/6213)
review: the speaker label regexed back into a number in
[room.ts:739](https://github.com/generaltranslation/gt-cloud/pull/6213#discussion_r4712216431),
and JSON sliced from a reply with `indexOf` in
[suggest.ts:74](https://github.com/generaltranslation/gt-cloud/pull/6213#discussion_r4712216437).

## M13. Every connection, retry and timer is bounded

**Look for:** a reconnect on the next event with no backoff; a cooldown
that starts when an open fails but not when the server closes the socket
after an error (a bad key, no quota, a rate limit); a network call with no
deadline or no retry policy; a stream or socket a client can hold open
for ever; and a stop interval of 0 that means never.

**Why:** a provider that rejects a key often accepts the open and closes
the socket right after it. A reconnect on every audio chunk then calls it
for the whole session, and each attempt logs an error and tells every
viewer. A slow dependency with no deadline holds up the batch behind it.
Each connection backs off after any close that carries an error, each call
has a deadline and a bounded retry (`withRetry` in `packages/clients` where
it applies), and each long-lived stream has a maximum life or an idle
timeout.

```ts
// Bad: the cooldown starts only when the open throws.
socket.addEventListener('close', () => (this.socket = null)); // the next chunk reconnects at once
// Good
socket.addEventListener('close', (event) => {
  this.socket = null;
  if (event.code !== 1000) this.reconnectAt = Date.now() + this.backoff.next();
});
```

**Sources:** [#6213](https://github.com/generaltranslation/gt-cloud/pull/6213)
review, no backoff after an error close in
[voice.ts:269](https://github.com/generaltranslation/gt-cloud/pull/6213#discussion_r4712216355).
[#5422](https://github.com/generaltranslation/gt-cloud/pull/5422#discussion_r4330312420)
(a Temporal `describe()` on the enqueue path takes the same 5 s deadline as
the others), [#5086](https://github.com/generaltranslation/gt-cloud/pull/5086#discussion_r4202513026)
and [#5046](https://github.com/generaltranslation/gt-cloud/pull/5046) (a
sandbox call wrapped in a retry),
[#4933](https://github.com/generaltranslation/gt-cloud/pull/4933#discussion_r4089348741)
(an event stream kept open for every tab left open) and
[#4877](https://github.com/generaltranslation/gt-cloud/pull/4877) (an
auto-stop interval of 0).

## M14. A failure is classified by its cause

**Look for:** every failure of a step mapped to one status, such as every
token refresh failure becoming a 401; a hand-kept list of retryable error
classes; a provider's authentication or permission error that defaults to
retryable; and a 401 or 403 from a dependency that is caught and ignored for
the rest of a session.

**Why:** the class decides what happens next. A 5xx or a network failure is
retried. A rejected grant asks the person to sign in again. A credential
that dies in the middle of a session stops the session with an error, as
running out of credit does, and stops anything that bills. A failure is
handled like its siblings of the same cause, so a reviewer checks the other
members of the class. Mixing them sends a person to
sign in after a network blip, or keeps a session transcribing, and billing,
with no translations and no error. Classify where the failure happens, from
its typed cause (the status, the provider's error code), not from a list of
class names that drifts each time the SDK adds an error. Rule M6 then
decides what is stored.

```ts
// Bad: a 503 from the token endpoint tells the host to sign in again.
if (!res.ok) throw new HTTPException(401, { message: 'Sign in again.' });
// Good
if (res.status === 400 && body.error === 'invalid_grant') throw new HTTPException(401, { message: 'Sign in again.' });
if (!res.ok) throw new RetryableError(`token refresh failed with ${res.status}`);
```

**Sources:** [#6213](https://github.com/generaltranslation/gt-cloud/pull/6213)
review: every refresh failure as a 401 in
[credentials.ts:46](https://github.com/generaltranslation/gt-cloud/pull/6213#discussion_r4712216375),
and a 401 or 403 from translate swallowed for the rest of the meeting in
[room.ts:615](https://github.com/generaltranslation/gt-cloud/pull/6213#discussion_r4712216367),
which its reviewer corrected the same day to "captions should stop with an error
like the out of credit case does"
([room.ts:615](https://github.com/generaltranslation/gt-cloud/pull/6213#discussion_r4712889646)).
[#5195](https://github.com/generaltranslation/gt-cloud/pull/5195#discussion_r4209891606)
(a list of retryable errors to keep current) and
[#5195](https://github.com/generaltranslation/gt-cloud/pull/5195#discussion_r4209857812)
(provider authentication errors defaulting to retryable).

## M15. Writes that must hold together commit in one transaction

**Look for:** two or more writes where a failure after the first leaves a
record without the record it depends on, such as an organization without
its billing alias, a job without its first task, or a reservation without
its holder; an outside call between two database writes that it does not
order.

**Why:** a partial write is a state the code never meant to exist, and
every later reader must handle it or break on it. The writes go in one
database transaction, so they commit or roll back together. An outside
call that cannot join the transaction runs last, inside it, so its failure
rolls the rest back, or runs first with an idempotency key, so a retry
repeats it safely.

```ts
// Bad: a failed alias leaves the org with no billing customer.
const org = await db.org.create({ data });
await metronome.addIngestAlias(org.id);
// Good
await db.$transaction(async (tx) => {
  const org = await tx.org.create({ data });
  await metronome.addIngestAlias(org.id);
});
```

**Sources:** the
[#5091](https://github.com/generaltranslation/gt-cloud/pull/5091#pullrequestreview-5397925272)
review: "do all of the metronome ingest alias stuff in the same transaction".

