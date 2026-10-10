// The repository root every script under scripts/ resolves paths from:
// git's top level when it holds this file, else the nearest folder above
// this file with a package.json (a git archive export, a tarball).
import { execFileSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

/** The checkout this file sits in. */
export function repoRoot() {
  try {
    const top = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: HERE, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    /* an export inside another checkout reads that checkout's top level */
    if (realpathSync(join(top, 'scripts/lib')) === realpathSync(HERE)) return top;
  } catch {
    // no git, or not a repository: walk up
  }
  for (let dir = HERE; ; dir = dirname(dir)) {
    if (existsSync(join(dir, 'package.json'))) return dir;
    if (dirname(dir) === dir) throw new Error(`repoRoot: no package.json above ${HERE}`);
  }
}

export const ROOT = repoRoot();
