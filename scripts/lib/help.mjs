// --help for the entry points under scripts/: prints the file's opening
// comment, which holds its usage, and exits.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Prints the opening comment of the file at `url` and exits 0 when --help or -h was passed, and that file is the entry point (or a shim imports it: entryOnly false). */
export function helpIfAsked(url, entryOnly = true) {
  const file = fileURLToPath(url);
  if (entryOnly && (!process.argv[1] || resolve(process.argv[1]) !== file)) return;
  if (!process.argv.slice(2).some((a) => a === '--help' || a === '-h')) return;
  const head = [];
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (/^(import|const|let|export|async|function)\b/.test(line)) break;
    if (line.startsWith('#!') || line.includes('oxlint-disable')) continue;
    head.push(line.replace(/^\s*(\/\*\*?|\*\/|\*|\/\/)\s?/, '').replace(/\s*\*\/\s*$/, ''));
  }
  console.log(head.join('\n').trim());
  process.exit(0);
}
