// Practice lint with a ratchet: every check counts its violations and
// records their locations in scripts/lint-practices.baseline.json. A run
// fails ONLY on violations not present in the baseline — existing debt is
// visible and burned down deliberately, new debt cannot land. Refresh the
// baseline after intentional cleanups with --update-baseline.
//
// Usage: pnpm lint:practices [--update-baseline]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE_PATH = join(ROOT, 'scripts/lint-practices.baseline.json');
const UPDATE = process.argv.includes('--update-baseline');

const files = execSync(
  `find ${ROOT}/src -type f \\( -name '*.tsx' -o -name '*.ts' -o -name '*.css' \\)`
)
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean);

const isComment = (line) => /^\s*(\*|\/\/|\/\*)/.test(line.trim());

/** @type {Record<string, string[]>} check -> ["path:line desc", ...] */
const found = {
  'button-missing-type': [],
  'img-missing-alt': [],
  'bare-useEffect': [],
  'any-type': [],
  'raw-hex-in-tsx': [],
  'important-in-css': [],
  'outer-rail-pair': [],
  'rail-outer-token': [],
  'retired-rail-vocabulary': [],
};

/* DESIGN.md section 3: one rail each side, drawn once by the column's own
   border-inline. Three checks keep the retired second pair from coming
   back:
   - outer-rail-pair: a ::before/::after that pushes an inline border pair
     outside its box (negative left AND right, or a negative inset-inline),
     or a centered pseudo widened past the column
     (width: calc(min(var(--tc-rail), ...) + ...)); in TSX, the Tailwind
     spelling of that widened width.
   - rail-outer-token: --tc-rail-outer, the token that sized the pair.
   - retired-rail-vocabulary: prose that still describes the pair as a
     device (outer pair, outer rail, doubled outer, doubled rails). A line
     that says it is retired is history, not a recommendation, and passes.
     The doubled LINE (the thread, DESIGN.md section 5) is a different
     device and its vocabulary is not matched. */
const RETIRED_RAIL = /outer pair|outer rail|doubled outer|doubled rails/i;
const NEG_LEFT = /(?:^|[;{\s])left\s*:\s*-\d/;
const NEG_RIGHT = /(?:^|[;{\s])right\s*:\s*-\d/;
const NEG_INSET = /(?:^|[;{\s])inset-inline\s*:\s*-\d/;
// a non-zero inline border; `border-left: 0` on a full-bleed horizontal
// seam (pricing-v2's stacked enterprise card) is one rule, not a pair
const INLINE_BORDER = /(?:^|[;{\s])border-(?:inline|left|right|inline-start|inline-end)\s*:(?!\s*(?:0|none)\s*(?:;|$))/m;
const WIDENED_COLUMN = /width\s*:\s*calc\(\s*min\(\s*var\(--tc-rail\)[^)]*\)\s*\+/;
const isOuterRailBody = (body) =>
  INLINE_BORDER.test(body) &&
  ((NEG_LEFT.test(body) && NEG_RIGHT.test(body)) || NEG_INSET.test(body) || WIDENED_COLUMN.test(body));
const railLineChecks = (rel, line, i) => {
  if (line.includes('--tc-rail-outer')) found['rail-outer-token'].push(`${rel}:${i + 1}`);
  if (RETIRED_RAIL.test(line) && !/retire/i.test(line))
    found['retired-rail-vocabulary'].push(`${rel}:${i + 1}`);
};

for (const file of files) {
  const rel = file.replace(`${ROOT}/`, '');
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');

  if (file.endsWith('.tsx')) {
    // tag-spanning checks: a JSX tag may wrap lines
    for (const [check, tag, attr] of [
      ['button-missing-type', 'button', 'type='],
      ['img-missing-alt', 'img', 'alt'],
    ]) {
      const re = new RegExp(`<${tag}\\b[^>]*>`, 'gs');
      for (const m of text.matchAll(re)) {
        if (m[0].includes(attr)) continue;
        // sample-code STRINGS contain literal tags — not real JSX; skip a
        // match sitting inside an unclosed quote on its line
        const before = text.slice(0, m.index);
        const lineStart = before.lastIndexOf('\n') + 1;
        const prefix = before.slice(lineStart);
        const inString = ["'", '"', '`'].some(
          (q) => (prefix.split(q).length - 1) % 2 === 1
        );
        if (inString) continue;
        const line = before.split('\n').length;
        found[check].push(`${rel}:${line}`);
      }
    }
  }

  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    lines.forEach((line, i) => {
      if (isComment(line)) return;
      if (
        /\buseEffect\(/.test(line) &&
        !rel.includes('use-mount-effect')
      )
        found['bare-useEffect'].push(`${rel}:${i + 1}`);
      if (/:\s*any\b|\bas any\b/.test(line))
        found['any-type'].push(`${rel}:${i + 1}`);
      if (/['"`(]#[0-9a-fA-F]{6}\b/.test(line))
        found['raw-hex-in-tsx'].push(`${rel}:${i + 1}`);
      if (/calc\(min\(var\(--tc-rail\),\s*100%\)\s*\+/.test(line))
        found['outer-rail-pair'].push(`${rel}:${i + 1}`);
    });
  }

  if (file.endsWith('.css')) {
    lines.forEach((line, i) => {
      if (line.includes('!important'))
        found['important-in-css'].push(`${rel}:${i + 1}`);
    });
    // rule blocks with comments blanked (line count kept), so prose never
    // matches and a nested @media rule parses the same as a top-level one
    const bare = text.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
    for (const m of bare.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selector = m[1].trim();
      if (!/::?(?:before|after)\b/.test(selector)) continue;
      if (!isOuterRailBody(m[2])) continue;
      const at = m.index + m[1].search(/\S/);
      found['outer-rail-pair'].push(`${rel}:${bare.slice(0, at).split('\n').length}`);
    }
  }

  lines.forEach((line, i) => railLineChecks(rel, line, i));
}

/* The design docs are the part that RECOMMENDS: the same vocabulary check
   runs over them so the lab cannot drift back to describing a second pair. */
const docs = [
  ...['DESIGN.md', 'BRAND.md', 'ARCHITECTURE.md'].map((f) => join(ROOT, f)).filter(existsSync),
  ...execSync(`find ${ROOT}/docs -type f -name '*.md'`).toString().trim().split('\n').filter(Boolean),
];
for (const file of docs) {
  const rel = file.replace(`${ROOT}/`, '');
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => railLineChecks(rel, line, i));
}

if (UPDATE) {
  writeFileSync(BASELINE_PATH, JSON.stringify(found, null, 1) + '\n');
  const total = Object.values(found).reduce((n, v) => n + v.length, 0);
  console.log(`baseline updated — ${total} known violation(s) recorded`);
  process.exit(0);
}

const baseline = existsSync(BASELINE_PATH)
  ? JSON.parse(readFileSync(BASELINE_PATH, 'utf8'))
  : {};

/* Ratchet on PER-FILE COUNTS, not line numbers: unrelated edits shift
   lines constantly (two sessions work this tree in parallel), but a file's
   violation count only rises when someone actually adds a violation. */
const byFile = (locations) => {
  const counts = {};
  for (const loc of locations) {
    const file = loc.slice(0, loc.lastIndexOf(':'));
    counts[file] = (counts[file] ?? 0) + 1;
  }
  return counts;
};

let fresh = 0;
for (const [check, locations] of Object.entries(found)) {
  const knownCounts = byFile(baseline[check] ?? []);
  const nowCounts = byFile(locations);
  for (const [file, count] of Object.entries(nowCounts)) {
    const known = knownCounts[file] ?? 0;
    if (count > known) {
      fresh += count - known;
      console.error(`\n${check} — ${file}: ${count} (baseline ${known})`);
    }
  }
}

const totals = Object.entries(found)
  .map(([c, v]) => `${c}:${v.length}`)
  .join('  ');
console.log(`\nlint:practices totals — ${totals}`);
if (fresh) {
  console.error(
    `\n${fresh} new violation(s) vs baseline. Fix them, or if intentional run with --update-baseline.`
  );
  process.exit(1);
}
console.log('lint:practices clean (no new violations)');
