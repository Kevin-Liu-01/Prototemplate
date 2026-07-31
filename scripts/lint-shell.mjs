// Token discipline for the shell layer: no raw color literals — every
// stroke and fill must draw a token (var(--shell-*), var(--tc-*), or a
// local custom property defined at a root class). This is what keeps the
// shell, the outer rails and every cell rule the SAME color in both
// themes. Add files to TARGETS as they migrate onto the shell primitives.
//
// Usage: pnpm lint:shell
import { readFileSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TARGETS = [
  'src/components/shell',
  'src/app/d/toolchain/sections/bento-motion.css',
  'src/app/d/toolchain/sections/Bento.tsx',
];

const COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\(/;

const files = TARGETS.flatMap((target) => {
  const abs = join(ROOT, target);
  if (statSync(abs).isFile()) return [abs];
  return execSync(
    `find ${abs} -type f \\( -name '*.css' -o -name '*.tsx' -o -name '*.ts' \\)`
  )
    .toString()
    .trim()
    .split('\n')
    .filter(Boolean);
});

let bad = 0;
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  let inComment = false;
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (inComment) {
      if (trimmed.includes('*/')) inComment = false;
      return;
    }
    if (trimmed.startsWith('/*')) {
      if (!trimmed.includes('*/')) inComment = true;
      return;
    }
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
    // explicit, visible escape hatch — a token fallback for a runtime read
    if (line.includes('lint-shell: allow')) return;
    if (!COLOR.test(line)) return;
    // defining a token is the one place a literal belongs
    if (/^\s*--[\w-]+\s*:/.test(line)) return;
    // consuming tokens is fine even when the shorthand also matches
    if (line.includes('var(--') && !/#[0-9a-fA-F]{3,8}\b|rgba?\(\s*\d/.test(line.replace(/var\(--[^)]*\)/g, ''))) return;
    bad++;
    console.error(
      `${file.replace(`${ROOT}/`, '')}:${i + 1}  raw color: ${trimmed.slice(0, 96)}`
    );
  });
}

if (bad) {
  console.error(`\nlint:shell — ${bad} raw color literal(s). Draw tokens instead.`);
  process.exit(1);
}
console.log('lint:shell clean');
