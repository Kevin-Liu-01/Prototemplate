// Tests for the glyph globe configurator
// (src/components/docs/demos/GlyphGlobeDemo.tsx): every control and every
// group has its own accessible name, as Chrome for Testing computes them
// through playwright-core from the rendered markup, and under every preset
// each slider (src/lib/glyph-globe-controls.ts) reaches its default exactly,
// so an untouched slider and one moved back print no prop. The modules
// load through Node's type stripping, with hooks that map @/ to src/, add
// .ts or .tsx to extensionless imports, compile TSX with TypeScript's
// transpiler and skip stylesheets.
//
// Usage: pnpm test:glyph-globe (node --test scripts/lint/glyph-globe.test.mjs)
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, test } from 'node:test';

import { chromium } from 'playwright-core';
import ts from 'typescript';

import { ROOT } from '../lib/root.mjs';
import { chromePath } from '../lib/site-pages.mjs';

registerHooks({
  resolve(specifier, context, nextResolve) {
    const parent = context.parentURL ?? '';
    let base = null;
    if (specifier.startsWith('@/')) base = join(ROOT, 'src', specifier.slice(2));
    else if ((specifier.startsWith('./') || specifier.startsWith('../')) && /\.tsx?$/.test(parent) && !/\.([cm]?[jt]sx?|css)$/.test(specifier)) {
      base = fileURLToPath(new URL(specifier, parent));
    }
    if (base) {
      const file = [base, `${base}.ts`, `${base}.tsx`].find((f) => /\.(tsx?|css)$/.test(f) && existsSync(f));
      if (file) return nextResolve(pathToFileURL(file).href, context);
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith('.css')) return { format: 'module', source: '', shortCircuit: true };
    if (url.endsWith('.tsx')) {
      const source = readFileSync(fileURLToPath(url), 'utf8');
      const out = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
      return { format: 'module', source: out.outputText, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});

const { GLYPH_GLOBE_FRAMING_RANGES, GLYPH_GLOBE_MAX_INKS, GLYPH_GLOBE_RANGE_GROUPS, rangeStep, snapRange } = await import(
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

/** The roles of the nodes that group controls; every focusable node is a control. */
const GROUPS = new Set(['group', 'radiogroup']);

/**
 * The accessible name of every control and every group in the configurator
 * as it first renders, as Chrome computes them, with the names of the
 * controls that state hides: the custom framing's sliders and the inks past
 * the preset's. A select's options are left out: a reader meets them only
 * in the select's open list, under the select's own name.
 */
async function accessibleNames() {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: GlyphGlobeDemo } = await import(pathToFileURL(join(ROOT, 'src/components/docs/demos/GlyphGlobeDemo.tsx')).href);
  const markup = renderToStaticMarkup(createElement(GlyphGlobeDemo));
  const browser = await chromium.launch({ executablePath: chromePath() });
  try {
    const page = await browser.newPage();
    await page.setContent(`<!doctype html><html lang="en"><body>${markup}</body></html>`);
    const cdp = await page.context().newCDPSession(page);
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    const byId = new Map(nodes.map((node) => [node.nodeId, node]));
    const rendered = nodes
      .filter((node) => {
        if (node.ignored) return false;
        const role = node.role?.value;
        if (role === 'RootWebArea') return false;
        if (role === 'option' && byId.get(node.parentId)?.role?.value === 'MenuListPopup') return false;
        const focusable = node.properties?.some((p) => p.name === 'focusable' && p.value.value);
        return focusable || GROUPS.has(role);
      })
      .map((node) => ({ role: node.role.value, name: node.name?.value ?? '' }));
    const hidden = [
      ...GLYPH_GLOBE_FRAMING_RANGES.map((f) => ({ role: 'slider', name: f.label })),
      ...Array.from({ length: GLYPH_GLOBE_MAX_INKS }, (_, i) => ({ role: 'ColorWell', name: `Ink ${i + 1}` })),
    ].filter((h) => !rendered.some((r) => r.role === h.role && r.name === h.name));
    return [...rendered, ...hidden];
  } finally {
    await browser.close();
  }
}

test('every control and every group has its own accessible name', async () => {
  const names = await accessibleNames();
  assert.ok(names.filter((n) => n.role === 'slider').length >= RANGES.length, 'the configurator renders its sliders');
  const seen = new Map();
  for (const { role, name } of names) {
    assert.ok(name.trim(), `a ${role} has no accessible name`);
    const key = name.trim().toLowerCase();
    assert.ok(!seen.has(key), `the ${seen.get(key)} and the ${role} are both named ${name}`);
    seen.set(key, role);
  }
});
