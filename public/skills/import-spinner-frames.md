# Import Spinner Frames

## The Rule

Kevin's canonical spinner library is [`unicode-animations`](https://github.com/gunnargray-dev/unicode-animations)
(npm-installable, framework-agnostic, 18 braille spinners). Do not swap it out. Instead,
when a new spinner library is interesting, **extract the frame data into the wiki's
runtime-agnostic catalog** at `wiki/assets/spinners-catalog.json` and leave the canonical
library untouched.

This keeps `unicode-animations` as the one-line npm install for any project, while giving
every future project agent a palette of extra frames to adopt without taking on a new
dependency (especially important when the upstream is React Native–only, CLI-only, or
otherwise wrong-runtime).

## When to Trigger

- Kevin shares a spinner repo URL and asks for a comparison ("do a 1v1", "which should I use")
- Kevin says "import the spinners from X", "grab those frames", "add these to my catalog"
- Kevin mentions expanding the loading-screens catalog
- A signal-radar or frontier automation surfaces a new spinner library worth cataloguing

## Step 0: 1v1 evaluation (before extracting anything)

Before any git clone, do the comparison. The answer is almost always "keep the canonical
library, extract the frames into the catalog" — but the 1v1 forces an honest look. Check:

| Dimension | Why it matters |
|---|---|
| Target runtime | If it imports from `react-native`, `ink`, `blessed`, etc., it's the wrong stack for Kevin's Next.js web work. Never a library swap. |
| Distribution | npm-installable > copy-paste. Copy-paste libraries can only contribute frame data, not be adopted whole. |
| Spinner count & variety | Count per category (braille / ASCII / arrow / emoji). If it's < 5 new distinct frames, probably skip. |
| Frame data format | Are frames inline as `const FRAMES = [...]`? Good — extractable. If the frames are generated at runtime from shaders/canvas, skip — this skill doesn't apply. |
| License | MIT or compatible. Attribution is mandatory in the catalog JSON. |
| Stars / activity | Not decisive, but a rough health signal. |

Present the comparison as a table in chat. Then confirm with Kevin: extract all? a subset?
which categories? where should it land (wiki-only is the default)?

## Step 1: Shallow clone to /tmp

Never pollute the repo with an upstream clone. Always `/tmp` and never commit.

```bash
mkdir -p /tmp/<repo-slug>
git clone --depth 1 <repo-url> /tmp/<repo-slug>
```

## Step 2: Locate the frame source files

Most spinner libraries use one of two layouts:

1. **One file per spinner** — e.g., `src/components/spinners/*.tsx`, each with
   `const FRAMES = [...]` and `const INTERVAL = N`. (expo-agent-spinners, most React Native
   libraries.)
2. **Single catalog file** — e.g., `src/spinners.ts` with a big object literal mapping
   names to `{ frames, interval }`. (unicode-animations, cli-spinners, ora.)

Read one or two source files first to confirm the format before running the extraction
script. If it's layout 2, the extraction is a single file read + JSON stringify. If it's
layout 1, use the bundled extractor.

## Step 3: Run the extractor

The extractor at `scripts/extract-frames.mjs` handles layout 1. Invoke it with the source
directory and output path:

```bash
node skills/engineering/import-spinner-frames/scripts/extract-frames.mjs \
  --src /tmp/<repo-slug>/src/components/spinners \
  --out /Users/kevinliu/Documents/GitHub/kevin-wiki/wiki/assets/spinners-catalog.json \
  --source-url <repo-url> \
  --license MIT \
  --attribution "frames derived from <owner>/<repo>"
```

The script:

- Walks every `*.tsx` / `*.ts` / `*.jsx` / `*.js` file in the source dir
- Matches `const FRAMES = [...]` (single- or multi-line) and `const INTERVAL = N`
- Uses a safe `Function(...)` eval on the array literal (no expressions, just string lits)
- Writes a JSON object `{ source, license, attribution, extracted, count, spinners: {...} }`
- Each spinner entry is `{ category, frames, interval }` — category defaults to
  `"uncategorized"` and gets set via the optional category map below

### Categorizing

If you know the library's category structure from its README, pass a category map as a
JSON file:

```bash
--categories /tmp/categories.json
```

Where `categories.json` looks like:

```json
{
  "braille": ["dots", "dots2", "sand", ...],
  "ascii":   ["arc", "rolling_line", ...],
  "arrow":   ["arrow", "double_arrow"],
  "emoji":   ["moon", "earth", "hearts"]
}
```

If omitted, everything lands in `"uncategorized"` and you can categorize later by hand
in the JSON.

### Merging with an existing catalog

If `--out` already exists, the script reads it first and merges. Same-name spinners are
overwritten (upstream is authoritative). A run summary is printed showing adds, updates,
and skips.

## Step 4: Verify extraction

Sanity-check the JSON before touching docs:

```bash
node -e 'const c = require("<path>/spinners-catalog.json");
const counts = {}; for (const s of Object.values(c.spinners)) counts[s.category] = (counts[s.category]||0)+1;
console.log("total:", c.count, "by category:", counts);
const pick = Object.keys(c.spinners)[0];
console.log("sample:", pick, "→", c.spinners[pick].frames.slice(0,8).join(" "));'
```

Render a few frames in the terminal to confirm the Unicode didn't get mangled. If
anything looks broken (question-mark boxes, escape sequences), the source file probably
had a multi-character frame split across template literal expressions — re-read that
source file and extract manually.

## Step 5: Update the wiki doc

`wiki/design/loading-screens.md` is the canonical reference. Update:

1. Bump `updated:` to today's date in frontmatter
2. Add any new category tags (e.g., `emoji`, `ascii`) to the `tags:` list
3. Reaffirm `unicode-animations` as the default at the top of the "Braille Spinners"
   section — do not let the expanded catalog displace the canonical recommendation
4. Under the "Expanded Catalog" section:
   - Update the category counts
   - Add/update the "Highlights per category" tables with a representative sample
     (4-8 spinners per category, with preview frames and interval)
   - Keep the selection guide ("When to use what") current
5. Attribute the new library in the Expanded Catalog intro paragraph (name + URL + license)

The JSON is the source of truth for frame data. The doc should not duplicate every
frame — it curates and points agents at the JSON for the full set.

Also update `wiki/skills/loading-screens.md` if a new category appears (ASCII, arrow,
emoji were the initial additions from expo-agent-spinners).

## Step 6: Log it

Append a `[YYYY-MM-DD] asset-add` entry to `wiki/log.md` explaining:

- What was extracted (count, source repo, commit)
- Why the swap was rejected (usually: wrong runtime)
- What landed in the catalog and what changed in the docs
- Attribution + license

## Anti-patterns

- **Adopting the upstream library as a dependency.** Almost never correct. Extract the
  data, keep the canonical.
- **Letting the new library redefine the default.** `unicode-animations` stays default.
  The catalog is a palette, not a replacement.
- **Committing the /tmp clone.** Shallow clone, extract, never add to git.
- **Hand-typing frame arrays.** Use the extractor. Unicode characters silently break
  when transcribed; the extractor reads the source bytes directly.
- **Extracting without a 1v1 comparison.** If the 1v1 would have concluded "adopt this
  instead," the whole catalog-merge approach might be wrong. Don't skip Step 0.
- **Losing attribution.** License + attribution go in the JSON top-level and in the
  doc's Expanded Catalog intro. MIT is permissive but still requires attribution.

## Generalization note

The same extraction pattern works for any component library that inlines animation
frame data: keyframe arrays, ASCII art sequences, easing tables, sprite sheet indices.
If a second use case emerges (e.g., extracting color palettes, icon sets, sound
libraries), generalize this skill at that point — don't pre-generalize now.
