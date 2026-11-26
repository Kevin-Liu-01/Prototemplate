# Code quality and readability

These rules hold for every language under review. Where a rule overlaps a
group rule of this skill, the entry names that rule and does not repeat it.
Every number below is a proposed default and the owner's to confirm. All
pages were read on 2026-11-26.

## Code quality

### Q1. Names say what a thing is

**Look for:** abbreviations a new reader must guess (`cstmr`, `pc`, `ctx2`),
the type in the name (`strName`, `userList`, `kSeconds`), names that say how
a value is used in place of what it is (`data`, `tmp`, `result2`), and a
boolean that does not read as a question.

**Why:** a reader learns the code from its names before its bodies. A type
in the name lies once the type changes, and the compiler already holds it.

```ts
// Bad
const cstmrLst = await getData(id);
// Good
const customers = await customersOfOrganization(organizationId);
```

**Sources:** https://google.github.io/styleguide/tsguide.html (naming:
"Do not use Hungarian notation", no unfamiliar abbreviations) and
https://peps.python.org/pep-0008/ (naming conventions).

### Q2. Small functions with one job, early returns and no nested ternaries

**Look for:** a function that does two things joined by "and", an `if` whose
`else` holds the main path, conditions nested more than two deep where a
guard clause would return early, and a ternary inside a ternary.

**Why:** a guard clause states each exit at the top, so the main path reads
without indentation. A nested ternary hides which branch wins.

```ts
// Bad
const label = isImage ? (isAnimated ? 'video' : 'image') : isSvg ? 'svg' : 'file';
// Good
function labelOf(file: TaskFile): Label {
  if (file.isSvg) return 'svg';
  if (!file.isImage) return 'file';
  return file.isAnimated ? 'video' : 'image';
}
```

**Sources:** https://refactoring.guru/smells/long-method,
https://refactoring.guru/replace-nested-conditional-with-guard-clauses and
https://eslint.org/docs/latest/rules/no-nested-ternary.

### Q3. No dead code, commented-out code, unused export or anonymous TODO

**Look for:** a block commented out, an export nothing imports, a parameter
every caller passes the same value to, and a `TODO` with no owner and no
issue link.

**Why:** dead code is read and kept current for nothing, and a commented-out
block is history that git already holds. A TODO with an issue is a tracked
task; one without is a note nobody owns. Rule C4 covers dead paths of a
replaced system.

```python
# Bad
# old_fit = fit_v1(line)
# TODO fix this later
# Good
# TODO: <issue link> - break Thai lines by dictionary.
```

**Sources:** https://refactoring.guru/smells/dead-code and
https://google.github.io/styleguide/pyguide.html (the TODO format names an
issue link).

### Q4. One level of abstraction per function, and no speculative generality

**Look for:** a function that mixes a high-level step, such as "translate the
locale", with byte or index work; an interface with one implementation and
no second in sight; a parameter, hook or option no caller sets.

**Why:** a function at one level reads as a list of steps, and each step's
detail lives in a function named for it. Generality built for a case that
does not exist is code to read, test and keep with no caller to justify it.

```ts
// Bad
async function translateLocale(job: Job, opts: { strategy?: Strategy; hooks?: Hooks } = {}) {
  const raw = Buffer.from(await read(job.path)).subarray(8, 24).toString('latin1');
  ...
}
// Good
async function translateLocale(job: Job): Promise<void> {
  const format = await detectFormat(job.path);
  const lines = await readLines(job, format);
  await saveTranslation(job, await translateLines(job, lines));
}
```

**Sources:** https://refactoring.guru/extract-method and
https://refactoring.guru/smells/speculative-generality.

### Q5. Errors are handled at the boundary

**Look for:** a `try` around one line deep inside the logic, a bare
`except:` or `catch (e) {}`, a catch-all that logs and returns success, and
an error rethrown without its cause.

**Why:** the boundary, such as a tool's `execute`, a request handler or a
workflow activity, knows what the caller can do with the error. Inner code
lets it pass. Rules M5 and M6 cover fallbacks and retries.

```python
# Bad
try:
    fit = fit_line(line)
except Exception:
    fit = None
# Good: fit_line raises; the command's entry point turns the error into a refusal.
fit = fit_line(line)
```

**Source:** https://google.github.io/styleguide/pyguide.html (exceptions:
"Never use catch-all except: statements", unless re-raising or at an
isolation point).

### Q6. No magic numbers, and each constant names its unit

**Look for:** a literal other than 0, 1 or -1 in logic, and a constant whose
name does not say its unit.

**Why:** a name says what the number is and where else it applies; a unit in
the name stops a seconds value from reaching a milliseconds parameter. Rule
M2 covers numbers tuned on one case.

```ts
// Bad
if (Date.now() - started > 300000) abort();
// Good
const TOOL_TIMEOUT_MS = 5 * 60_000;
if (Date.now() - started > TOOL_TIMEOUT_MS) abort();
```

**Source:** https://refactoring.guru/replace-magic-number-with-symbolic-constant.

### Q7. Pure functions where possible, and side effects at the edges

**Look for:** a calculation that reads the clock, the environment, a file or
a global in its middle; a function that both computes and writes.

**Why:** a pure function is tested with inputs and outputs alone. The shell
around it reads, calls the pure core, and writes.

```python
# Bad
def plan(job):
    lines = json.loads(Path(job.folder, "read.json").read_text())
    ...
    Path(job.folder, "plan.json").write_text(json.dumps(out))
# Good
def plan(lines: list[Line]) -> Plan: ...
write_plan(job, plan(read_lines(job)))
```

**Source:** https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell.

### Q8. No duplication across files

**Look for:** the same block, table or conversion in two files, often with
one changed constant.

**Why:** a fix lands in one copy and not the other. Shared logic lives in one
module that both import. Rule M4 covers duplicated facts.

```python
# Bad: read.py and fast.py each convert to grey.
grey = img @ [0.299, 0.587, 0.114]
# Good
from .image import grey
```

**Source:** https://refactoring.guru/smells/duplicate-code.

### Q9. Formatting comes from the formatter only

**Look for:** hand alignment, a diff whose lines change only in whitespace,
and a formatter setting changed in the same pull request as logic.

**Why:** a formatter ends the debate and keeps diffs to real changes.
gt-cloud runs oxfmt (`.oxfmtrc.json`) on TypeScript, and its Python projects
run ruff. A change to the formatter's settings goes in a pull request of
its own.

**Sources:** https://oxc.rs/docs/guide/usage/formatter and
https://docs.astral.sh/ruff/formatter/.

### Q10. Small diffs, and one concern per pull request

**Look for:** a pull request that mixes a refactor, a feature and a fix; a
rename or a format pass inside a behaviour change; a diff a reviewer cannot
hold in one sitting.

**Why:** a small change is reviewed well and reverted cleanly. A refactor in
its own pull request shows that behaviour did not change.

**Source:** https://google.github.io/eng-practices/review/developer/small-cls.html.

### Q11. Tests read as the spec

**Look for:** a test named after a method, a test that asserts private
state, a mock of the unit under test, and a test whose setup hides the case
in a shared helper. Rule T3 covers wall-clock asserts.

**Why:** a test that names a behaviour and calls the public interface says
what the code promises, and it survives a refactor. A mock of the unit
under test proves only the mock. Real collaborators or fakes are preferred
to mocks.

```ts
// Bad
it('calls computeRows', () => { const spy = vi.spyOn(flow, 'computeRows'); flow.layout(item); expect(spy).toHaveBeenCalled(); });
// Good
it('keeps a name on one line when the headline breaks', () => {
  expect(layout(headline('Try Locadex today', { keep: ['Locadex'] })).rows).toContain('Locadex');
});
```

**Sources:** https://abseil.io/resources/swe-book/html/ch12.html ("Test
behaviors, not methods", "Test via public APIs") and
https://abseil.io/resources/swe-book/html/ch13.html ("Prefer realism over
isolation").

### Q12. Logs say what happened, with ids and no secrets

**Look for:** a log line with no id of the job, session or request; a log
of a whole request or response body; a log that prints a token, a key, a
session value or customer text.

**Why:** a log line is read during an incident by someone who did not write
it, so it names the event and the ids that find the record. Secrets and
customer content in logs reach every system that stores them. Rule S1
covers keys.

```ts
// Bad
console.log('done', response);
// Good
logger.info('erase answered', { jobId, sessionId, crops: bundle.count, gpuSeconds });
```

**Source:** https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html.

### Q13. Public interfaces are documented by their types first

**Look for:** an exported function whose doc comment repeats its parameter
types, a `string` or `object` parameter where a union or a named type
would say what is allowed, and a doc comment where a type would do.

**Why:** a type is checked and a comment is not. The doc comment states only
what the types cannot: the unit, the invariant, the error it throws. Rules
TS5, TS6 and TS9 give the type forms.

```ts
// Bad
/** @param kind one of "image", "video" or "svg" */
export function route(kind: string): Namespace
// Good
/** Throws when the organization has no media access. */
export function route(kind: 'image' | 'video' | 'svg'): Namespace
```

**Source:** https://google.github.io/styleguide/tsguide.html (JSDoc and
type annotations).

## Readability

### R1. The code reads top-down in call order

**Look for:** a file whose entry point sits at the bottom, helpers defined
far from their one caller, and a module that a reader must enter at a
function named in another file.

**Why:** a reader starts at the top. The exported entry comes first, and
each helper follows the function that calls it, in call order.

```python
# Bad: _fit, _break and _measure come first, and run is the last function.
# Good
def run(job): plan = _measure(job); return _fit(plan)
def _measure(job): ...
def _fit(plan): ...
```

**Source:** the owner's ruling of 2026-11-26 (a full readability review),
relayed by the coordinator session.

### R2. A reader needs no history to follow the code

**Look for:** a name, comment or branch that makes sense only to someone who
saw an earlier version, a run or a review round.

**Why:** the reader has the code and nothing else. Rule N3 covers history in
comments; this rule covers names and structure too, such as `fit_v2` beside
no `fit` or a flag named after a round.

**Source:** https://refactoring.guru/smells/comments.

### R3. File length, function length, nesting and complexity stay in bounds

**Look for:** a new or grown file over 500 lines, a function body over 60
lines, blocks nested more than 4 deep, and a function whose cognitive
complexity passes 15.

**Why:** past these bounds a reader cannot hold the unit in mind. The bounds
are proposed defaults and the owner's to confirm. gt-cloud's
`.oxlintrc.json` sets `sonarjs/cognitive-complexity` to 50 today; 15 is
SonarSource's default. A file that already passes a bound is not split in
an unrelated change, and it does not grow.

**Sources:** https://eslint.org/docs/latest/rules/max-lines,
https://eslint.org/docs/latest/rules/max-depth and
https://rules.sonarsource.com/typescript/RSPEC-3776/.
