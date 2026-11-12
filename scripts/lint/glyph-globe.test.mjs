// Tests for the glyph globe configurator's controls
// (src/lib/glyph-globe-controls.ts): under every preset, each slider
// reaches its default exactly, so an untouched slider and one moved back
// print no prop. Loaded
// through Node's type stripping, with a resolve hook that maps @/ to src/
// and adds .ts to extensionless imports.
//
// Usage: pnpm test:glyph-globe (node --test scripts/lint/glyph-globe.test.mjs)
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, test } from 'node:test';

import { ROOT } from '../lib/root.mjs';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const base = join(ROOT, 'src', specifier.slice(2));
      const file = ['.ts', '.tsx'].map((ext) => base + ext).find((f) => existsSync(f)) ?? base;
      return nextResolve(pathToFileURL(file).href, context);
    }
    const relative = specifier.startsWith('./') || specifier.startsWith('../');
    if (relative && !/\.[cm]?[jt]sx?$/.test(specifier) && context.parentURL?.endsWith('.ts')) return nextResolve(`${specifier}.ts`, context);
    return nextResolve(specifier, context);
  },
});

const { GLYPH_GLOBE_COLORS, GLYPH_GLOBE_RANGE_GROUPS, rangeStep, snapRange } = await import(
  pathToFileURL(join(ROOT, 'src/lib/glyph-globe-controls.ts')).href
);
const { GLYPH_GLOBE_PRESET_IDS, glyphGlobeSettings } = await import(pathToFileURL(join(ROOT, 'src/lib/glyph-globe-presets.ts')).href);

const RANGES = GLYPH_GLOBE_RANGE_GROUPS.flatMap((group) => group.ranges);

/** The value a range input holds n steps from min, as the browser's decimal arithmetic gives it. */
const stepValue = (min, step, n) => Number((min + n * step).toFixed(10));

describe('every slider reaches its default', () => {
  for (const preset of GLYPH_GLOBE_PRESET_IDS) {
    const base = glyphGlobeSettings(preset);
    test(preset, () => {
      for (const range of RANGES) {
        const value = base[range.key];
        const where = `${preset}: ${range.label} (${range.key}) at ${value}`;
        assert.ok(value >= range.min && value <= range.max, `${where} lies outside ${range.min} to ${range.max}`);
        const step = rangeStep(range, value);
        assert.ok(step > 0 && step <= range.step, `${where} takes step ${step}`);
        const n = Math.round((value - range.min) / step);
        /* the thumb's nearest stop, read back through the snap, is the default to the bit */
        assert.equal(snapRange(stepValue(range.min, step, n), step, value), value, `${where}: the nearest stop does not give it back`);
        /* the stops either side stay their own values */
        for (const m of [n - 1, n + 1]) {
          const other = stepValue(range.min, step, m);
          if (other < range.min || other > range.max) continue;
          assert.notEqual(snapRange(other, step, value), value, `${where}: the stop at ${other} snaps to it`);
        }
      }
    });
  }
});

test('the 39.81 latitude, 0.32 roll and launch tile are reached', () => {
  const base = glyphGlobeSettings('launch');
  const range = (key) => RANGES.find((r) => r.key === key);
  assert.equal(rangeStep(range('latitude'), 39.81), 0.01);
  assert.equal(rangeStep(range('roll'), 0.32), 0.01);
  assert.equal(snapRange(0.04, rangeStep(range('tile'), base.tile), base.tile), base.tile);
});
