// Tests for stack-shape.mjs: node --test skills/gt-code-review/scripts/stack-shape.test.mjs
// Every pull request here is generated, and each rule has a case it must flag
// and a case it must pass.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ADDED_MAX, TINY_MAX, checkPr, readLines, sharedBeside, SHARED } from './stack-shape.mjs';

/** A pull request with one file per [path, added] pair. */
function pr(head, title, files) {
  return { number: 1, head, title, files: files.map(([path, added]) => ({ path, added, removed: 0 })) };
}

const rules = (p, options) => checkPr(p, options).map((f) => f.rule);
const product = ['packages/translation/src/agent/loop.ts', 200];

describe('K1: a branch or title named by a review round', () => {
  it('flags r4-fixes and "review findings"', () => {
    assert.ok(rules(pr('k/image-r4-fixes', 'fix: titles', [product])).includes('K1'));
    assert.ok(rules(pr('k/image-grouping', 'fix: review findings fixed', [product])).includes('K1'));
  });
  it('passes a branch named by its concept', () => {
    assert.ok(!rules(pr('k/image-line-breaks', 'fix: line breaks follow ICU', [product])).includes('K1'));
  });
});

describe('K2: a shared package beside product code', () => {
  it('flags agent-core beside translation', () => {
    const files = [product, ['packages/agent-core/src/store/a.ts', 40]].map(([path, added]) => ({ path, added, removed: 0 }));
    assert.deepEqual(sharedBeside(files, SHARED), ['packages/agent-core']);
  });
  it('passes shared packages beside a lockfile or a copied path', () => {
    const p = pr('k/usage', 'feat: usage record', [
      ['packages/billing/src/usage.ts', 40],
      ['packages/node/src/record.ts', 30],
      ['pnpm-lock.yaml', 6],
      ['vendor/x.py', 9],
    ]);
    assert.ok(!rules(p, { copied: ['vendor/'] }).includes('K2'));
  });
  it('passes a pull request that changes only the shared package', () => {
    assert.ok(!rules(pr('k/store-admit', 'feat: store admits', [['packages/agent-core/src/store/a.ts', 40]])).includes('K2'));
  });
});

describe('K3 and K4: copied lines and lines to read', () => {
  const big = ADDED_MAX + 1;
  it('counts copied paths, lockfiles and licenses apart from lines to read', () => {
    const files = [['vendor/x.py', big], ['pnpm-lock.yaml', 900], ['fonts/licenses/OFL.txt', 90], ['src/a.ts', 10]];
    const p = pr('k/vendor', 'chore: vendor', files);
    assert.equal(readLines(p.files, ['vendor/']), 10);
    assert.deepEqual(rules(p, { copied: ['vendor/'] }), ['K3']);
  });
  it('counts only --copied paths as copied, not licences or lockfiles', () => {
    const p = pr('k/fonts', 'test: font fixtures', [['fonts/licenses/OFL.txt', ADDED_MAX + 1], ['pnpm-lock.yaml', ADDED_MAX + 1]]);
    assert.ok(!rules(p).includes('K3'));
  });
  it('flags a pull request with more lines to read than a reviewer holds', () => {
    assert.ok(rules(pr('k/flow', 'feat: flow', [['src/a.ts', big]])).includes('K4'));
  });
});

describe('K5 and N6', () => {
  it('flags a change too small to stand alone', () => {
    assert.ok(rules(pr('k/one-line', 'feat: one line', [['src/a.ts', TINY_MAX]])).includes('K5'));
  });
  it('flags a title that names a commit hash, and passes plain numbers', () => {
    assert.ok(rules(pr('k/folder', "feat: the folder at 13ebf5d40", [product])).includes('N6'));
    assert.ok(!rules(pr('k/fonts', 'feat: Katagami 1.5 and 20260101', [product])).includes('N6'));
  });
});
