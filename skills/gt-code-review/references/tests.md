# Tests

A test holds one rule, runs anywhere the repository is cloned, costs
nothing, and fails only when the rule breaks.

## T1. Fixtures are generated or synthetic

**Look for:** a customer's or third party's video, image or document added
to git as a fixture; a test that reads a path on one machine; a recorded
model answer standing in for a rule that a generated input could hold.

**Why:** third-party media cannot enter git, and a fixture built in the
test states the case it holds. A test that needs real media skips when the
media folder is absent.

```python
# Bad
img = load("fixtures/customer-dashboard.png")
# Good: the test draws the case it holds.
img = draw_lines([("Pricing", 48, (40, 40)), ("Start free", 18, (40, 110))], size=(640, 200))
```

**Source:** Media and git rules 1 and 2 of the translation
pipelines' agent rules: "Test fixtures are generated or synthetic".

## T2. One test per rule, named by the behaviour it holds

**Look for:** a parser, gate, retry or bound changed with no test of its
own; a test file named after the round, review or ticket that found its
case, such as `test_r4_fixes.py`; a docstring that narrates history.

**Why:** a name that states the rule tells the next reader what broke when
the test goes red. A round's name says nothing once the round is over.

```python
# Bad: tests/test_r4_fixes.py::test_case_3
# Good
def test_no_part_is_left_blank_while_the_translation_holds_a_break_for_it(): ...
```

**Sources:** Memory note `production-grade-before-push` (a focused
test for each parser, gate and retry change). The replies on
[#6207](https://github.com/generaltranslation/gt-cloud/pull/6207#discussion_r4688383333),
each naming the test that holds the fix. [97d2e5b](https://github.com/generaltranslation/gt-cloud/commit/97d2e5b054a7416a0f37cec3f3a637a494ee1842)
(the image code's tests live in `__tests__`).

## T3. No wall-clock assertion

**Look for:** `time.monotonic()`, `perf_counter()`, `time.time()`,
`Date.now()` or `performance.now()` beside an `assert` or `expect` in a
test, and a fixed `sleep` that waits for something to happen.

**Why:** gates run beside other jobs, so a bound in seconds fails at random.
On 2026-11-19 a test that asserted under 2.0 s took 2.13 s under load and
held a merge for 50 minutes. A test uses a stand-in clock that only the test
advances, or waits on a counted event.

```python
# Bad
t0 = time.monotonic(); endpoint.up(); assert time.monotonic() - t0 < 2.0
# Good
clock = FakeClock(); endpoint.up(clock=clock); assert clock.waited == 0
```

**Source:** Memory note `wall-clock-tests-fail-the-gate`.

## T4. A reader is tested on a real answer's shape, and stand-ins keep the real signature

**Look for:** a reader of a model or command answer tested only on a dict
the test wrote by hand; a monkeypatched stand-in whose arguments differ from
the function it replaces.

**Why:** six readers passed on stand-ins and failed on real files in two
days of November. Run a new reader once on a stored real answer, and save
its shape, with any customer content replaced, as a generated fixture. A
stand-in that takes `*args, **kwargs` or the real signature fails when the
signature changes.

**Sources:** Memory notes `real-files-before-a-reader-joins` and
`stand-ins-on-signature-change`.

## T5. Tests run with every key unset

**Look for:** a test that reads a provider key, a client built at import
time, and a CI job or command that runs tests with keys in its environment.

**Why:** one test started real reviewer sessions when a key was in the
shell. Run tests with the provider keys removed (`env -u` for each), so a
test that would call a paid service fails at once.

**Source:** Memory note `tests-with-keys-unset`, 2026-11-19.

## T6. A change runs the tests that read its file by path

**Look for:** a change to a prompt, a worker module or a table that tests
read as text, and a test round chosen only by the changed function names.

**Why:** some tests compare a file's source or a prompt's headings with a
table, and no search by function name reaches them. Search the tests for
the changed file's name with `rg -l -F <file name> tests` before choosing
which to run.

**Sources:** Memory notes `tests-that-read-source` and
`prompt-headings-are-keys`.
