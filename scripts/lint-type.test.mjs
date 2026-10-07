// Tests for scripts/lint-type.mjs: the repository passes, and each rule
// reports its defect in a fixture string and passes the fixed string.
//
// Usage: pnpm test:type (node --test scripts/lint-type.test.mjs)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { lintBindings, lintCss, lintTsx, lintType, parseCss, PATHS, ratchet, shorthandFamily } from './lint-type.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SHEET = 'src/app/example/example.css';

/** The rules a CSS string breaks, as a sorted list of rule ids. */
function rules(css, rel = SHEET) {
  return [...new Set(lintCss(rel, css).problems.map((p) => p.rule))].sort();
}

function fails(css, rule, rel) {
  assert.ok(rules(css, rel).includes(rule), `expected ${rule} for:\n${css}\ngot ${rules(css, rel).join(', ') || 'nothing'}`);
}

function passes(css, rel) {
  assert.deepEqual(rules(css, rel), [], `expected no finding for:\n${css}`);
}

describe('the repository', () => {
  test('passes the static rules', () => {
    const { problems } = lintType(ROOT);
    assert.deepEqual(problems, []);
  });

  test('holds its ratchet baseline', () => {
    const { counts } = lintType(ROOT);
    const baseline = JSON.parse(readFileSync(join(ROOT, PATHS.baseline), 'utf8'));
    assert.deepEqual(ratchet(counts, baseline).rises, []);
  });
});

describe('the parser', () => {
  test('walks @media nesting and keeps line numbers', () => {
    const parsed = parseCss('/* a */\n@media (max-width: 900px) {\n  .a h1,\n  .b {\n    font-size: 12px;\n  }\n}\n');
    assert.equal(parsed.length, 1);
    assert.deepEqual(parsed[0].selectors, ['.a h1', '.b']);
    assert.deepEqual(parsed[0].at, ['@media (max-width: 900px)']);
    assert.equal(parsed[0].decls[0].line, 5);
  });

  test('keeps a semicolon inside url() in one declaration', () => {
    const parsed = parseCss('.a { background: url(data:image/svg+xml;base64,AAA); color: red; }');
    assert.equal(parsed[0].decls.length, 2);
  });

  test('reads the family of a font shorthand', () => {
    assert.equal(shorthandFamily('500 13px/1 var(--pt-text)'), 'var(--pt-text)');
    assert.equal(shorthandFamily('inherit'), 'inherit');
  });
});

describe('T1 family', () => {
  test('a literal family fails', () => fails('.a { font-family: Georgia, serif; }', 'T1'));
  test('a type token passes', () => passes('.a { font-family: var(--pt-text); }'));
  test('a face token outside the nameplate fails', () => fails('.a { font-family: var(--pt-face-serif); }', 'T1'));
  test('a face token on the nameplate passes', () => passes('.pt-sb-head .pt-face-serif { font-family: var(--pt-face-serif); }'));
});

describe('T2 stack', () => {
  test('a bare Inter fails', () => fails(".a { font-family: var(--font-inter), 'Inter', sans-serif; }", 'T2'));
  test('Lausanne fails', () => fails(".a { font-family: 'TWK Lausanne', var(--pt-text); }", 'T2'));
  test('a stack in a custom property outside tokens.css fails', () => fails('.a { --x: var(--font-inter), system-ui, sans-serif; }', 'T2'));
  test('a local() source fails', () => fails("@font-face { font-family: x; src: local('X'); }", 'T2'));
  test('Arial after the Inter variable in tokens.css fails', () =>
    fails(":root { --pt-text: var(--font-inter), Arial, sans-serif; } :is(b, strong) { font-weight: var(--pt-w-strong); }", 'T2', PATHS.tokens));
  test('the token stack in tokens.css passes', () =>
    passes(":root { --pt-text: var(--font-inter), system-ui, sans-serif; --pt-ff-text: 'liga' 1, 'calt' 1; } :is(b, strong) { font-weight: var(--pt-w-strong); }", PATHS.tokens));
});

describe('T3 next/font', () => {
  const inter = "import localFont from 'next/font/local';\nexport const inter = localFont({ src: [] });\n";
  const pt = "import localFont from 'next/font/local';\nexport const ptInter = localFont({ src: [] });\n";
  test('the binding named inter fails', () => {
    const { problems } = lintBindings(new Map([[PATHS.fonts, inter]]));
    assert.ok(problems.some((p) => p.rule === 'T3'));
  });
  test('the binding named ptInter passes', () => {
    assert.deepEqual(lintBindings(new Map([[PATHS.fonts, pt]])).problems, []);
  });
  test('one identifier in two files outside /d/ fails, and under /d/ warns', () => {
    const twice = "const display = localFont({ src: [] });\n";
    assert.ok(lintBindings(new Map([['src/app/a.tsx', twice], ['src/app/b.tsx', twice]])).problems.length > 0);
    const under = lintBindings(new Map([['src/app/d/a/page.tsx', twice], ['src/app/d/b/page.tsx', twice]]));
    assert.deepEqual(under.problems, []);
    assert.equal(under.warnings.length, 1);
  });
});

describe('T4 features', () => {
  test('a literal feature list fails', () => fails(".a { font-feature-settings: 'cv11', 'ss01'; }", 'T4'));
  test('tnum through the property fails', () => fails(".a { font-feature-settings: 'tnum'; }", 'T4'));
  test('a feature token passes', () => passes('.a { font-feature-settings: var(--pt-ff-display); }'));
  test('normal on the nameplate passes', () => passes('.pt-face-grot { font-feature-settings: normal; }'));
  test('a token definition without calt fails', () =>
    fails(":root { --pt-ff-text: 'liga' 1; } :is(b, strong) { font-weight: var(--pt-w-strong); }", 'T4', PATHS.tokens));
  test('an inline literal in TSX fails, the token passes', () => {
    assert.ok(lintTsx('src/x.tsx', "<p style={{ fontFeatureSettings: \"'ss01'\" }} />").some((p) => p.rule === 'T4'));
    assert.deepEqual(lintTsx('src/x.tsx', "<p style={{ fontFeatureSettings: 'var(--pt-ff-text)' }} />"), []);
  });
});

describe('T5 variation', () => {
  test('font-variation-settings fails', () => fails(".a { font-variation-settings: 'opsz' 32; }", 'T5'));
  test('optical sizing off fails', () => fails('.a { font-optical-sizing: none; }', 'T5'));
  test('optical sizing auto passes', () => passes('.a { font-optical-sizing: auto; }'));
});

describe('T6 weight', () => {
  test('600 fails', () => fails('.a { font-weight: 600; }', 'T6'));
  test('bold in a shorthand fails', () => fails('.a { font: bold 14px var(--pt-text); }', 'T6'));
  test('500 passes', () => passes('.a { font-weight: 500; }'));
  test('the specimen rows pass', () => passes('.ptb-display { font-weight: 800; }'));
  test('tokens.css without the strong rule fails', () => fails(":root { --pt-w-strong: 500; }", 'T6', PATHS.tokens));
});

describe('T7 headings', () => {
  test('a literal heading size fails', () => fails('.page h1 { font-size: 48px; }', 'T7'));
  test('a heading family fails', () => fails('.page h2 { font-family: var(--pt-display); }', 'T7'));
  test('the display ladder passes', () =>
    passes('.page h1 { font-size: var(--pt-d1); line-height: var(--pt-d1-lh); letter-spacing: var(--pt-d1-track); }'));
});

describe('T8 tracking', () => {
  test('positive tracking on Inter fails', () => fails('.a { letter-spacing: 0.08em; }', 'T8'));
  test('negative tracking passes', () => passes('.a { letter-spacing: -0.01em; }'));
  test('positive tracking on a grotesk label passes', () => passes('.pt-src-spec { font-family: var(--pt-face-grot); letter-spacing: 0.08em; }'));
});

describe('T9 mono', () => {
  test('mono on words fails', () => fails('.caption { font-family: var(--pt-mono); }', 'T9'));
  test('mono on code passes', () => passes('.prose code { font-family: var(--pt-mono); }'));
  test('mono on a -token class passes', () => passes('.a .lct-token { font-family: var(--pt-mono); }'));
  test('mono on a named entry passes', () => passes('.ptb-swatch span { font-family: var(--pt-mono); }'));
});

describe('the ratchet', () => {
  test('a rise in literal px font sizes fails', () => {
    const { counts } = lintCss(SHEET, '.a { font-size: 13px; } .b { font-size: 14px; }');
    const now = { R1: { [SHEET]: counts.R1 }, R2: {}, R3: {} };
    assert.equal(ratchet(now, { R1: { [SHEET]: 1 }, R2: {}, R3: {} }).rises.length, 1);
    assert.equal(ratchet(now, { R1: { [SHEET]: 2 }, R2: {}, R3: {} }).rises.length, 0);
    assert.equal(ratchet(now, { R1: { [SHEET]: 3 }, R2: {}, R3: {} }).drops.length, 1);
  });

  test('a token does not count', () => {
    assert.equal(lintCss(SHEET, '.a { font-size: var(--pt-t-meta); }').counts.R1, 0);
  });
});

describe('the escape hatch', () => {
  test('a hatch with a reason passes the line under it', () =>
    passes('.a {\n  /* lint-type: allow a specimen of the old face */\n  font-family: Georgia;\n}'));
  test('a hatch without a reason fails', () => fails('.a {\n  /* lint-type: allow */\n  font-family: Georgia;\n}', 'H0'));
});
