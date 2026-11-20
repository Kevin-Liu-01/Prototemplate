// Tests for the Locadex logo: its brand files are what pnpm
// build:locadex-logo writes from the catalog file, and the catalog opens the
// Locadex family on it. Loaded through Node's type stripping.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { test } from 'node:test';

import { ROOT } from '../lib/root.mjs';

const { dynamicFamily } = await import(new URL('../../src/lib/marks.ts', import.meta.url).href);

test('the Locadex brand files are what pnpm build:locadex-logo writes', () => {
  const run = spawnSync(process.execPath, [join(ROOT, 'scripts/build/locadex-logo.mjs'), '--check'], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr || 'pnpm build:locadex-logo --check failed');
});

test('the Locadex family opens on the Locadex logo, its variant, then the stepped, outlined and ringed variants', () => {
  const ids = dynamicFamily('locadex').map((mark) => mark.id);
  assert.deepEqual(ids.slice(0, 13), [
    'locadex-logo',
    'locadex-logo-behind',
    'stepped-lambda',
    'stepped-lambda-joined',
    'stepped-lambda-open-foot',
    'stepped-lambda-open-ends',
    'outlined-lambda',
    'outlined-lambda-open',
    'ringed-lambda',
    'ringed-lambda-round',
    'ringed-chevron-lambda',
    'ringed-chevron-lambda-wide-gap',
    'ringed-chevron-lambda-close-gap',
  ]);
});
