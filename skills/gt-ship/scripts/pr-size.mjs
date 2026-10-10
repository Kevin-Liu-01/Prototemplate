#!/usr/bin/env node
// Groups a branch's diff by kind so every large group in a PR can be
// justified before it is pushed. It reads git only and writes nothing.
//
//   node pr-size.mjs [--base origin/main] [--head HEAD] [--top 5]
//
// Run it inside the checkout or worktree that holds the branch. The range is
// <base>...<head>, the diff GitHub shows for the PR.
//
// Groups, first match wins: lockfile, generated, fixtures (recorded data,
// snapshots, ledgers), tests, scripts (scripts/, tools/, .github/), assets
// (images, video, fonts), docs (Markdown), product (everything else).
//
// It also prints the share of added product code lines that are comments and
// the test lines added per product line, and a note for each group a reviewer
// will ask about. Exit code 0 whatever the numbers say, since they are for
// the author to read; 2 when the base has no merge base with the head.
//
// Requires: Node 20 or later and git.
// Last real run: none (kept for: every PR loop; Kevin reads a PR's size first).
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const at = args.indexOf(name);
  return at >= 0 && args[at + 1] ? args[at + 1] : fallback;
};
const base = flag('--base', 'origin/main');
const head = flag('--head', 'HEAD');
const top = Number(flag('--top', '5'));
const range = `${base}...${head}`;

const git = (...gitArgs) =>
  execFileSync('git', gitArgs, { encoding: 'utf8', maxBuffer: 1 << 28 });

const GROUPS = [
  ['lockfile', (p) => /(^|\/)(pnpm-lock\.yaml|package-lock\.json|yarn\.lock|bun\.lockb?)$/.test(p)],
  ['generated', (p) => /\.gen\.[cm]?[jt]sx?$|(^|\/)next-env\.d\.ts$/.test(p)],
  [
    'fixtures',
    (p) =>
      /(^|\/)(__fixtures__|fixtures|recordings?|__snapshots__|ledgers?|golden)\//.test(p) ||
      /\.(snap|har)$/.test(p),
  ],
  [
    'tests',
    (p) => /(^|\/)(__tests__|tests?|e2e)\//.test(p) || /\.(test|spec)\.[cm]?[jt]sx?$/.test(p),
  ],
  ['scripts', (p) => /(^|\/)(scripts|tools|\.github)\//.test(p)],
  ['assets', (p) => /\.(png|jpe?g|webp|avif|gif|svg|mp4|webm|mov|woff2?|ttf|otf)$/i.test(p)],
  ['docs', (p) => /\.(md|mdx)$/i.test(p)],
  ['product', () => true],
];
const groupOf = (p) => GROUPS.find(([, test]) => test(p))[0];
const CODE = /\.(c|m)?(j|t)sx?$|\.(s?css)$/;

let mergeBase;
try {
  mergeBase = git('merge-base', base, head).trim();
} catch {
  console.error(`No merge base between ${base} and ${head}. Fetch ${base} first.`);
  process.exit(2);
}

const files = git('diff', '--numstat', '--no-renames', range)
  .split('\n')
  .filter(Boolean)
  .map((line) => {
    const [added, deleted, ...rest] = line.split('\t');
    const file = rest.join('\t');
    const binary = added === '-';
    return {
      file,
      group: groupOf(file),
      added: binary ? 0 : Number(added),
      deleted: binary ? 0 : Number(deleted),
      binary,
    };
  });

const totals = new Map(GROUPS.map(([name]) => [name, { files: 0, added: 0, deleted: 0, binary: 0 }]));
for (const f of files) {
  const t = totals.get(f.group);
  t.files += 1;
  t.added += f.added;
  t.deleted += f.deleted;
  if (f.binary) t.binary += 1;
}

// Comment share of added product code lines, read from a zero-context diff.
const productCode = files.filter((f) => f.group === 'product' && CODE.test(f.file)).map((f) => f.file);
let codeLines = 0;
let commentLines = 0;
if (productCode.length) {
  const diff = git('diff', '-U0', '--no-renames', range, '--', ...productCode);
  for (const line of diff.split('\n')) {
    if (!line.startsWith('+') || line.startsWith('+++')) continue;
    const text = line.slice(1).trim();
    if (!text) continue;
    codeLines += 1;
    if (/^(\/\/|\/\*|\*|\{\s*\/\*)/.test(text)) commentLines += 1;
  }
}

const pad = (value, width) => String(value).padStart(width);
const all = files.reduce((sum, f) => ({ added: sum.added + f.added, deleted: sum.deleted + f.deleted }), {
  added: 0,
  deleted: 0,
});

console.log(`${range} (merge base ${mergeBase.slice(0, 9)})\n`);
console.log('group        files    added  deleted');
for (const [name, t] of totals) {
  if (!t.files) continue;
  const bin = t.binary ? `  (${t.binary} binary)` : '';
  console.log(`${name.padEnd(10)} ${pad(t.files, 7)} ${pad(t.added, 8)} ${pad(t.deleted, 8)}${bin}`);
}
console.log(`${'total'.padEnd(10)} ${pad(files.length, 7)} ${pad(all.added, 8)} ${pad(all.deleted, 8)}\n`);

const product = totals.get('product');
const tests = totals.get('tests');
if (codeLines) {
  const share = Math.round((commentLines / codeLines) * 100);
  console.log(`comments: ${commentLines} of ${codeLines} added product code lines (${share}%)`);
}
if (product.added) {
  console.log(`test lines per product line: ${(tests.added / product.added).toFixed(2)}`);
}

console.log('\nlargest files');
for (const [name, t] of totals) {
  if (!t.files) continue;
  const biggest = files
    .filter((f) => f.group === name)
    .sort((a, b) => b.added + b.deleted - (a.added + a.deleted))
    .slice(0, top);
  for (const f of biggest) {
    const size = f.binary ? 'binary' : `+${f.added} -${f.deleted}`;
    console.log(`  ${name.padEnd(10)} ${size.padStart(13)}  ${f.file}`);
  }
}

const notes = [];
const fixtures = totals.get('fixtures');
if (fixtures.files) {
  notes.push(
    `fixtures: ${fixtures.files} files, +${fixtures.added}. Recorded data, ledgers and harnesses stay on their own branch or in the scratchpad.`,
  );
}
if (codeLines && commentLines / codeLines > 0.1) {
  notes.push('comments run above 10% of added product code. Keep comments to one or two lines that say why.');
}
if (product.added && tests.added > product.added) {
  notes.push('tests add more lines than the product. Pin each behaviour once.');
}
if (totals.get('lockfile').files) notes.push('the lockfile changed. Name the dependency change in the PR body.');
if (totals.get('generated').files) notes.push('generated files changed. Confirm each one belongs in the PR.');
const addedMarkdown = git('diff', '--name-only', '--diff-filter=A', '--no-renames', range, '--', '*.md', '*.mdx')
  .split('\n')
  .filter((p) => p && !/(^|\/)SKILL\.md$/i.test(p) && !/(^|\/)\.(agents|claude|codex|cursor)\/skills\//.test(p));
if (addedMarkdown.length) {
  notes.push(
    `new Markdown (${addedMarkdown.join(', ')}). In gt-cloud, run node scripts/check-plan-files.mjs --base ${base}: the required check-planning-files check fails on new files that read as plans.`,
  );
}
if (totals.get('assets').files) {
  notes.push('images or media are in the diff. Confirm each one ships with the product; PR screenshots go on the pr-assets branch.');
}
if (notes.length) {
  console.log('\nnotes');
  for (const note of notes) console.log(`  - ${note}`);
}
