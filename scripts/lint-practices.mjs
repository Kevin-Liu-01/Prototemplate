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
    });
  }

  if (file.endsWith('.css')) {
    lines.forEach((line, i) => {
      if (line.includes('!important'))
        found['important-in-css'].push(`${rel}:${i + 1}`);
    });
  }
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
