# Python

The image and video translation code that runs in gt-cloud's sandboxes is
Python. These rules hold it to the same bar as the TypeScript around it.

## P1. Every model call has a strict response schema

**Look for:** a model call whose request carries no JSON schema
(`output_config` with `json_schema`, or the project's model module), and an
answer read by key with no typed model on the read side. A call that sends
its schema and parses the text with `json.loads` passes the first half; the
reader still validates into a `TypedDict` or `BaseModel` so the fields are
typed.

**Why:** a schema refuses a malformed answer at the call, where the retry
is cheap, and gives the rest of the code typed fields (rule M1).

```python
# Bad
kind = json.loads(resp.text)["kind"]
# Good
class Review(BaseModel):
    kind: Literal["none", "minor", "major"]
review = models.call(prompt, schema=Review)
```

**Source:** Kevin's code rule 8 for his translation pipeline repositories:
"Every model call uses a strict response schema".

## P2. Kinds and reasons are typed fields

**Look for:** a role, kind or reason carried as free text and later
compared with a string, such as `role == "headline part"` on a model's
free-text role, or a reason joined into a note with `"; "` and split back
out.

**Why:** free text is for people. Code reads a `Literal` or `StrEnum`
field that the schema or the record defines, and the note stays for
display.

```python
# Bad
if item["role"] == "headline part": ...
# Good
class Line(TypedDict):
    role: Role          # Role = Literal["headline", "paragraph", "label", ...]
    part_of: int | None
if line["part_of"] is not None: ...
```

**Source:** Brian's
[4160ff8](https://github.com/generaltranslation/gt-cloud/commit/4160ff8f4a12664703dadff713f3db22aa2c67bc)
and
[d5ae706](https://github.com/generaltranslation/gt-cloud/commit/d5ae7069c2c11a1ef477acfc715978726d8daca5)
(the leftover check knows a kept name "by its kept_as and its place").

## P3. Explicit arguments in place of ambient environment and globals

**Look for:** a function that reads `$WORK`, `$JOB` or another environment
variable to find what it works on, a module global that a test patches and
a thread swaps, and imports placed inside functions with no reason.

**Why:** an argument is visible at the call and in the tool schema; an
environment variable is set somewhere else and may be stale. A global that
two threads and a test fixture restore can end in the wrong state for the
rest of the process.

```python
# Bad
folder = Path(os.environ["WORK"]) / "image"
# Good
def run(folder: Path, job: str) -> None: ...
```

**Sources:** Brian's
[5ac7738](https://github.com/generaltranslation/gt-cloud/commit/5ac773810c7356d9d5f6365b0ba2a636d308a6e1)
("tcimg names the work folder and the job, not $WORK and $JOB") and
[cdb829d](https://github.com/generaltranslation/gt-cloud/commit/cdb829d482ac0e8528de5d4ed7445beb008a1780)
(imports at the module's top). Kevin's memory note
`monkeypatch-global-a-thread-swaps`.

## P4. A new name never hides an old one

**Look for:** a new module function, helper or local whose name is already
a local or a function in the same module.

**Why:** a local `whole` under a new module function `whole` raised
`UnboundLocalError` in every judged session, and a local `cut` hid the
module's `cut`. Search the module for the name as a word before adding it.

**Source:** Kevin's memory note `new-name-hides-old-name`.

## P5. Lint and types gate the commit by exit code

**Look for:** a `# type: ignore` or `# noqa` with no code and reason, ruff
or mypy findings left in the diff, and a command chain that commits after a
failed lint.

**Why:** a lint finding that reaches a shared branch costs a second commit
and a second review. Commit only inside `if [ $rc -eq 0 ]`, and give every
suppression its code, such as `# type: ignore[arg-type]`, and a reason.

**Sources:** Kevin's memory note `lint-rc-gates-commit`. Brian's
[#6189](https://github.com/generaltranslation/gt-cloud/pull/6189) test plan
(`uv run pytest` and `ruff check` clean).

## P6. Work on the crop, not the whole image

**Look for:** a full-image conversion, mask or copy made per line, per gap
or per component; a list of combinations built before its size is checked;
a function that returns every component at once.

**Why:** a 4000 by 3000 screenshot as float32 is 48 MB per copy, and a copy
per pair of words grows with the square of the line count. Slice first,
check the count before building, and yield one item at a time.

```python
# Bad
grey = image.astype(np.float32) @ GREY
gap = grey[y0:y1, x0:x1]
# Good
gap = image[y0:y1, x0:x1].astype(np.float32) @ GREY
```

**Source:** Brian's
[#6189](https://github.com/generaltranslation/gt-cloud/pull/6189), section
"Memory": line breaking checks the combination count before building it,
measured lines keep a cropped ink mask, and fill components are yielded one
at a time.
