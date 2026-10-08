// Tests for scripts/lint-heads.mjs: a passing and a failing fixture per
// static rule, and each live judge fed recorded geometry (the judges are
// pure functions over what collectHead measures, so no browser runs here).
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  H9_GAP,
  aliasesIn,
  judgeBand,
  judgeClearance,
  judgeDividers,
  judgeLead,
  judgePanel,
  judgeRule,
  judgeStandard,
  judgeStructure,
  judgeTitle,
  lintHeadCss,
  lintHeadProps,
  lintHeadTsx,
  lintHeads,
  lintSpaces,
  lintTitles,
} from './lint-heads.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const rules = (problems) => problems.map((p) => p.rule);

const HEAD_OK = `const TITLE = PAGE_NAMES.motion.name;
export function V() {
  return <BookHead title={TITLE} badge={b} lead={LEAD} updated={updated} facts={[{ icon: 'done', key: 'Rendered', value: 5 }, { icon: 'planned', key: 'Planned', value: 6 }, { icon: 'index', key: 'Sections', value: 2 }]} />;
}`;

test('S1: a head carries its props; a page route titles it PAGE_NAMES', () => {
  assert.deepEqual(rules(lintHeadProps('src/app/motion/MotionViewer.tsx', HEAD_OK)), []);
  assert.deepEqual(rules(lintHeadProps('src/app/x/X.tsx', "<BookHead title={PAGE_NAMES.brand.name} badge={b} lead='x' facts={f} />")), ['S1']);
  assert.deepEqual(rules(lintHeadProps('src/app/x/X.tsx', "<BookHead title='The brand' badge={b} lead='x' updated={u} facts={f} />")), ['S1']);
  assert.deepEqual(rules(lintHeadProps('src/app/skills/SkillViewer.tsx', "<BookHead title={skill.title} badge={b} lead='x' updated={u} facts={f} />")), []);
  assert.deepEqual(rules(lintHeadProps('src/app/skills/SkillViewer.tsx', "<BookHead title={skill.title} lead='x' updated={u} facts={f} />")), ['S1']);
  /* the docs shell renders two books and reads the name by the book's id */
  assert.deepEqual(rules(lintHeadProps('src/app/docs/DocsShell.tsx', "<BookHead title={PAGE_NAMES[book].name} badge={b} lead='x' updated={u} facts={f} />")), []);
  assert.deepEqual(rules(lintHeadProps('src/app/docs/DocsShell.tsx', "<BookHead title={TITLES[book]} badge={b} lead='x' updated={u} facts={f} />")), ['S1']);
});

test('S2: a route never restyles a standard element or its alias', () => {
  const aliases = aliasesIn("<div className='mk-div pt-book-sec'><small /></div><div className={'gx-book pt-book-col'} />");
  assert.deepEqual([...aliases].sort(), ['gx-book', 'mk-div']);
  assert.deepEqual(rules(lintHeadCss('src/app/marks/marks.css', '.mk-div small { color: red; }', aliases)), ['S2']);
  assert.deepEqual(rules(lintHeadCss('src/app/marks/marks.css', '.gx-book { gap: 24px; }', aliases)), ['S2']);
  assert.deepEqual(rules(lintHeadCss('src/app/marks/marks.css', '.pt-book-lead { font-size: 18px; }', aliases)), ['S2']);
  assert.deepEqual(rules(lintHeadCss('src/app/marks/marks.css', '.mk-div { scroll-margin-top: 20px; } .mk-row h2 { color: red; }', aliases)), []);
  assert.deepEqual(rules(lintHeadCss('src/components/viewer/BookView.css', '.pt-book-lead { font-size: 17px; }', aliases)), []);
  assert.deepEqual(rules(lintHeadCss('src/app/blog/blog.css', '.blog-root:has(> .pt-book-col) { padding-top: 4px; }', aliases)), []);
});

test('S3: a book has one band', () => {
  assert.deepEqual(rules(lintHeadCss('src/app/brand/brand.css', '.ptb-x { background: repeating-linear-gradient(-45deg, red 0 1px, blue 1px 2px); }')), ['S3']);
  assert.deepEqual(rules(lintHeadCss('src/components/viewer/BookView.css', '.pt-book-band { background: repeating-linear-gradient(-45deg, red 0 1px, blue 1px 2px); }')), []);
  assert.deepEqual(rules(lintHeadTsx('src/app/brand/BrandViewer.tsx', "<div className='pt-hatch' />")), ['S3']);
  assert.deepEqual(rules(lintHeadTsx('src/app/GalleryViewer.tsx', "<div className='pt-hatch' />")), []);
});

test('S4: no guide on the head, the mast or the title', () => {
  assert.deepEqual(rules(lintHeadCss('src/components/viewer/BookView.css', '.pt-book-mast::before { content: ""; border-top: 1px dashed red; }')), ['S4']);
  assert.deepEqual(rules(lintHeadCss('src/components/viewer/BookView.css', '.pt-book-head h1::after { content: ""; background: red; }')), ['S4']);
  assert.deepEqual(rules(lintHeadCss('src/components/viewer/BookView.css', '.pt-book-toc a::after { content: ""; background: red; }')), []);
});

test('S5: a page title reads PAGE_NAMES, never absolute', () => {
  assert.deepEqual(rules(lintTitles('src/app/marks/page.tsx', "export const metadata: Metadata = {\n  title: 'Marks',\n};\n")), ['S5']);
  assert.deepEqual(rules(lintTitles('src/app/compare/page.tsx', "export const metadata: Metadata = {\n  title: { absolute: 'Compare directions' },\n};\n")), ['S5']);
  assert.deepEqual(rules(lintTitles('src/app/marks/page.tsx', "export const metadata: Metadata = {\n  title: PAGE_NAMES.marks.name,\n};\n")), []);
  assert.deepEqual(rules(lintTitles('src/app/page.tsx', "export const metadata: Metadata = {\n  title: 'Prototemplate',\n};\n")), []);
});

test('S6: the book page spaces read their tokens', () => {
  assert.deepEqual(rules(lintSpaces('src/components/viewer/BookView.css', '.pt-book-mast { padding-bottom: 26px; }')), ['S6']);
  assert.deepEqual(rules(lintSpaces('src/components/viewer/BookView.css', '.pt-book-mast { padding-bottom: var(--pt-head-rule-pad); }')), []);
  assert.deepEqual(rules(lintSpaces('src/components/viewer/Sheet.css', '.pt-flow-col { padding: 44px 56px 120px; }')), ['S6', 'S6']);
});

/* a recorded head at 1440: the numbers collectHead returns on /brand, which
   sits in the reading column with no mat (round three, 2026-10-06) */
const HAIR = 'rgba(242, 242, 240, 0.22)';
const TITANIUM = 'rgb(138, 143, 152)';
const tokens = { titleClear: 44, headRulePad: 26, secPad: 30, secOver: 48, bandH: 42, hair: HAIR, titanium: TITANIUM, measureLead: 510 };
const head = () => ({
  headers: 1,
  mastChildren: ['h1', 'p.pt-book-lead', 'aside.pt-book-panel'],
  after: ['nav.pt-book-toc', 'div.pt-book-band', 'section.pt-book-part.ptb-page', 'section.pt-book-part.ptb-page'],
  sectionBeforeBand: false,
  frame: { kind: 'column', x1: 264, x2: 1380, top: 52, contentTop: 96, contentX1: 264, contentX2: 1380 },
  h1: { rect: { x: 264, y: 96, w: 113, h: 45.76, r: 377, b: 141.76 }, lh: 45.76 },
  lead: { rect: { x: 264, y: 155.76, w: 500, h: 79.05, r: 764, b: 234.81 }, lh: 26.35, lines: 3, chars: 157, first: 174 },
  panel: {
    rect: { x: 1076, y: 157.76, w: 304, h: 105.4, r: 1380, b: 263.16 },
    rows: [26.35, 26.35, 26.35, 26.35].map((h, i) => ({ cls: i === 0 ? 'pt-book-fact is-updated' : 'pt-book-fact', rect: { y: 157.76 + i * h }, field: false, svgs: 1, cut: false, baseline: 174 + i * 26.35, time: i === 0 ? '2026-10-06' : null, copy: null })),
  },
  rule: { y: 289.16, w: 1, st: 'solid', col: HAIR, x1: 264, x2: 1380, bleed: true },
  bands: 1,
  band: { rect: { x: 264, y: 584.47, w: 1116, h: 42, r: 1380, b: 626.47 }, bleed: true, top: { w: 1, st: 'solid', col: HAIR }, bottom: { w: 1, st: 'solid', col: HAIR }, aboveBottom: 536.47, above: 'nav.pt-book-toc', near: [] },
  dividers: [
    { rect: { y: 626.47 }, borderTop: { w: 0, st: 'none', col: HAIR }, bleed: false, first: true, note: { lines: 2, spans: ['Section 1', 'BRAND.md part 1'], col: TITANIUM }, h2: { y: 661.97 } },
    { rect: { y: 1327.5 }, borderTop: { w: 1, st: 'solid', col: HAIR }, bleed: true, first: false, note: { lines: 2, spans: ['Section 2', 'BRAND.md part 2'], col: TITANIUM }, h2: { y: 1364 } },
  ],
  /* the reading column draws no line above the title; the toolbar's rule is outside the region */
  titleLines: [],
  h2s: [{ x: 420, y: 661.97, w: 300, h: 33.6, r: 720, b: 695.57 }],
  tokens,
});

test('H1: the structure', () => {
  assert.deepEqual(judgeStructure(head()), []);
  const d = head();
  d.after = ['div.pt-book-band', 'div.ptb-hatch', 'section.pt-book-part'];
  assert.match(judgeStructure(d)[0], /^H1 /);
  const two = head();
  two.headers = 2;
  assert.match(judgeStructure(two)[0], /^H1 /);
});

test('H2: the title sits on the content top', () => {
  assert.deepEqual(judgeTitle(head()), []);
  const d = head();
  d.h1.rect.y = 102;
  assert.match(judgeTitle(d)[0], /^H2 /);
});

test('H3: an h1 with a line 1px above it fails', () => {
  assert.deepEqual(judgeClearance(head()), []);
  const d = head();
  d.titleLines.push({ o: 'h', y: 94, x1: 264, x2: 1380, w: 1, by: 'div.pt-book-mast::before' });
  assert.match(judgeClearance(d)[0], /^H3 /);
  const cross = head();
  cross.titleLines.push({ o: 'h', y: 102, x1: 264, x2: 1380, w: 1, by: 'div.guide' });
  assert.ok(judgeClearance(cross).some((f) => /crosses the title/.test(f)));
});

test('H4: the lead', () => {
  assert.deepEqual(judgeLead(head(), { wide: true }), []);
  const d = head();
  d.lead.lines = 7;
  d.lead.chars = 320;
  assert.equal(judgeLead(d, { wide: true }).length, 2);
});

test('H5: the panel', () => {
  assert.deepEqual(judgePanel(head(), { day: '2026-10-06', wide: true }), []);
  const d = head();
  d.panel.rows[2].baseline += 3;
  d.panel.rows[3].svgs = 0;
  assert.equal(judgePanel(d, { day: '2026-10-05', wide: true }).length, 3);  const f = head();
  for (const r of f.panel.rows) r.baseline -= 2;
  assert.match(judgePanel(f, { day: '2026-10-06', wide: true })[0], /^H5 the panel's first row sits -2px from the lead's first baseline/);
});

test('H6: the mast rule', () => {
  assert.deepEqual(judgeRule(head()), []);
  const d = head();
  d.rule.y += 6;
  d.rule.col = 'rgb(242, 242, 240)';
  assert.equal(judgeRule(d).length, 2);
  const f = head();
  f.rule.near = [{ o: 'h', y: f.rule.y - 1, w: 1, by: 'div.pt-cmd' }];
  assert.equal(judgeRule(f).length, 1);
  const g = head();
  g.rule.bleed = false;
  assert.match(judgeRule(g)[0], /^H6 the mast's rule stops at the column/);
});

test('H7: the band draws its own rules', () => {
  assert.deepEqual(judgeBand(head()), []);
  const d = head();
  d.band.top = { w: 0, st: 'none', col: HAIR };
  assert.match(judgeBand(d)[0], /^H7 the band's top rule/);
  const g = head();
  g.band.bleed = false;
  assert.match(judgeBand(g)[0], /^H7 the band's rules stop at the column/);
});

test('H8: the dividers', () => {
  assert.deepEqual(judgeDividers(head(), { wide: true }), []);
  const d = head();
  d.dividers[1].note = { lines: 3, spans: ['8 films', 'Films 01 to 08', 'Monogram'], col: TITANIUM };
  d.dividers[0].borderTop.w = 1;
  assert.equal(judgeDividers(d, { wide: true }).length, 2);
  const g = head();
  g.dividers[1].bleed = false;
  assert.match(judgeDividers(g, { wide: true })[0], /^H8 divider 2's rule stops at the column/);
  const h = head();
  h.dividers[0].bleed = true;
  assert.match(judgeDividers(h, { wide: true })[0], /^H8 the first part's divider draws a rule/);
});

test('H9: one standard mast at 1440', () => {
  assert.deepEqual(judgeStandard(head()), []);
  assert.equal(H9_GAP, 193.16);
  const d = head();
  d.rule.y += 1.28;
  assert.match(judgeStandard(d)[0], /^H9 /);
});

test('the repository passes', () => {
  const { problems, heads } = lintHeads(ROOT);
  assert.deepEqual(problems, []);
  assert.ok(heads >= 10);
});
