// Runs every generator in write mode. The generated files then match the
// tree: the lane gate runs it before lint:static, and the integrator runs it on a
// merge and commits what it writes (src/lib/updated.ts, src/lib/skills.ts,
// skills/README.md, docs/TOOLS.md, the thumbnails). build:updated runs last,
// since it dates the changes the others leave uncommitted. build:motion runs
// only where the full motion folder is (MOTION.md and its out/ renders), so a
// fresh clone or a worktree with the tracked sources alone skips it, with a
// printed line, and never rewrites src/lib/motion.ts without the renders.
//
// Usage:
//   node scripts/build/gen-all.mjs   (pnpm gen:all)
/* oxlint-disable no-console -- a runner reporting each step to stdout. */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { ROOT } from '../lib/root.mjs';
import { helpIfAsked } from '../lib/help.mjs';

helpIfAsked(import.meta.url);

const MOTION = process.env.MOTION_DIR ?? join(ROOT, 'motion');
const STEPS = ['build:skills', 'build:deck', 'build:marks', 'build:inter', 'build:thumbs', 'build:motion', 'build:tools', 'build:updated'];

for (const step of STEPS) {
  if (step === 'build:motion' && !(existsSync(join(MOTION, 'MOTION.md')) && existsSync(join(MOTION, 'out')))) {
    console.log(`gen:all: ${step} skipped: ${MOTION} has no MOTION.md or no out/ renders (the full motion folder lives in the shared checkout; set MOTION_DIR)`);
    continue;
  }
  console.log(`gen:all: ${step}`);
  const { status } = spawnSync('pnpm', ['run', '--silent', step], { cwd: ROOT, stdio: 'inherit' });
  if (status !== 0) {
    console.error(`gen:all: ${step} exited ${status}`);
    process.exit(status ?? 1);
  }
}
console.log(`gen:all: ${STEPS.length} generators done; review git status before committing`);
