// Tests for scripts/lint/seo.mjs: a passing and a failing fixture per
// static rule (the passing page fixture is the real src/app/page.tsx), the
// ratchet, the head and sitemap judges on fixture HTML, the image header
// reader, and one test that the repository passes. Alias hosts are built
// from ALIAS_HOSTS, so this file never spells one (S5).
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';

import {
  BASELINE,
  applyBaseline,
  imageSize,
  judgeHead,
  judgeSitemap,
  judgeUnique,
  lintAliasHosts,
  lintRootLayout,
  lintRouteFile,
  lintStatic,
  literalValue,
  nextBaseline,
  parseSitemap,
  readBaseline,
  routeMatcher,
  routeOf,
  staticPrefix,
  topLevelProps,
} from './seo.mjs';
import { ALIAS_HOSTS, SITE_URL } from '../../src/lib/seo/policy.ts';
import { ROOT } from '../lib/root.mjs';

const rules = (findings) => findings.map((f) => f.rule);
const HOME = readFileSync(join(ROOT, 'src/app/page.tsx'), 'utf8');
const LAYOUT = readFileSync(join(ROOT, 'src/app/layout.tsx'), 'utf8');

const page = (path, extra = '') => `import { seoRoute } from '@/lib/seo/route';
const route = seoRoute({
  path: ${path},
  title: 'Design system',
  section: 'Handbook',
  kind: 'article',
  description: 'The line law, the rhythm numbers and the surfaces every Prototemplate page is built from.',${extra}
});
export const metadata = route.metadata;
export default function Page() { return null; }
`;

test('helpers: routes, prefixes, literals and object properties', () => {
  assert.equal(routeOf('src/app/page.tsx'), '/');
  assert.equal(routeOf('src/app/handbook/[slug]/page.tsx'), '/handbook/[slug]');
  assert.equal(routeOf('src/app/(site)/about/page.tsx'), '/about');
  assert.equal(staticPrefix('/handbook/[slug]'), '/handbook');
  assert.equal(staticPrefix('/[slug]'), '/');
  assert.equal(literalValue("'Kevin\\'s hub'"), "Kevin's hub");
  assert.equal(literalValue('"a, b"'), 'a, b');
  assert.equal(literalValue('`x ${y}`'), null);
  assert.equal(literalValue("'a' + 'b'"), null);
  const props = topLevelProps("{ path: '/x', crumbs: [{ name: 'A', path: '/a' }], title, ...rest, description: `d` }");
  assert.deepEqual([...props.keys()], ['path', 'crumbs', 'title', '...', 'description']);
  assert.equal(props.get('path'), "'/x'");
});

test('S1: metadata comes from seoRoute; the home page is the passing fixture', () => {
  assert.deepEqual(rules(lintRouteFile('src/app/page.tsx', HOME)), []);
  assert.deepEqual(rules(lintRouteFile('src/app/brand/page.tsx', "export const metadata = { title: 'Brand', description: 'x' };")), ['S1']);
  assert.deepEqual(rules(lintRouteFile('src/app/brand/page.tsx', 'export default function P() { return null; }')), ['S1']);
  assert.deepEqual(rules(lintRouteFile('src/app/x/not-found.tsx', 'export default function N() { return null; }')), ['S1']);
  /* a layout that exports no metadata is not a route head */
  assert.deepEqual(rules(lintRouteFile('src/app/x/layout.tsx', 'export default function L({ children }) { return children; }')), []);
  /* the default layouts are exempt */
  assert.deepEqual(rules(lintRouteFile('src/app/d/layout.tsx', 'export const metadata = { robots: { index: false, follow: true } };')), []);
  const dynamic = `import { seoRoute } from '@/lib/seo/route';
const input = (slug) => ({ path: \`/handbook/\${slug}\`, title: 'T', kind: 'article', description: 'd' });
export async function generateMetadata({ params }) {
  const { slug } = await params;
  return seoRoute({ path: \`/handbook/\${slug}\`, title: 'T', kind: 'article', description: 'A description that runs long enough to sit between the two bounds.' }).metadata;
}`;
  assert.deepEqual(rules(lintRouteFile('src/app/handbook/[slug]/page.tsx', dynamic)), []);
  const spread = page("'/handbook/design'").replace('export const metadata = route.metadata;', "export const metadata = { ...route.metadata, title: 'x' };");
  assert.deepEqual(rules(lintRouteFile('src/app/handbook/design/page.tsx', spread)), ['S1']);
});

test('S2: the path literal is the route the file serves', () => {
  assert.deepEqual(rules(lintRouteFile('src/app/handbook/design/page.tsx', page("'/handbook/design'"))), []);
  assert.deepEqual(rules(lintRouteFile('src/app/handbook/design/page.tsx', page("'/brand'"))), ['S2']);
  assert.deepEqual(rules(lintRouteFile('src/app/handbook/[slug]/page.tsx', page('`/handbook/${slug}`'))), []);
  assert.deepEqual(rules(lintRouteFile('src/app/handbook/[slug]/page.tsx', page('`/docs/${slug}`'))), ['S2']);
  assert.deepEqual(rules(lintRouteFile('src/app/handbook/[slug]/page.tsx', page('`/handbookish/${slug}`'))), ['S2']);
  assert.deepEqual(rules(lintRouteFile('src/app/handbook/design/page.tsx', page('`/handbook/design`'))), []);
  assert.deepEqual(rules(lintRouteFile('src/app/handbook/design/page.tsx', page('pathFor()'))), ['S2']);
  /* a path held in a const resolves */
  const viaConst = `const PATH = '/brand';\n${page('PATH')}`;
  assert.deepEqual(rules(lintRouteFile('src/app/brand/page.tsx', viaConst)), []);
});

test('S3: title and description literals', () => {
  const at = (title, description) =>
    rules(
      lintRouteFile(
        'src/app/brand/page.tsx',
        `const route = seoRoute({ path: '/brand', title: ${title}, kind: 'page', description: ${description} });\nexport const metadata = route.metadata;`,
      ),
    );
  const ok = "'The brand book, its rules and every mark, color and type size General Translation uses.'";
  assert.deepEqual(at("'Brand'", ok), []);
  assert.deepEqual(at("'Brand — GT Redesign'", ok), ['S3']);
  assert.deepEqual(at("'Brand!'", ok), ['S3']);
  assert.deepEqual(at("'Brand.'", ok), ['S3']);
  assert.deepEqual(at("'Brand'", "'Too short.'"), ['S3']);
  assert.deepEqual(at("'Brand'", `'${'x'.repeat(161)}'`), ['S3']);
  assert.deepEqual(at("'Brand'", "'The brand book — its rules and every mark, color and type size General Translation uses.'"), ['S3']);
  /* a description that is not a literal is judged on the built page (B1) */
  assert.deepEqual(at("'Brand'", 'direction.concept'), []);
});

test('S4: the root layout sets metadataBase and no inherited canonical or og:url', () => {
  assert.deepEqual(rules(lintRootLayout(LAYOUT)), []);
  const base = "import { SITE_URL } from '@/lib/seo/policy';\nexport const metadata = { metadataBase: new URL(SITE_URL), openGraph: { title: 'P', images: [{ url: '/x.png' }] } };";
  assert.deepEqual(rules(lintRootLayout(base)), []);
  assert.deepEqual(rules(lintRootLayout(base.replace('openGraph:', "alternates: { canonical: '/' }, openGraph:"))), ['S4']);
  assert.deepEqual(rules(lintRootLayout(base.replace("openGraph: { title: 'P',", "openGraph: { url: '/', title: 'P',"))), ['S4']);
  assert.deepEqual(rules(lintRootLayout(base.replace('new URL(SITE_URL)', "new URL('https://example.com')"))), ['S4']);
  assert.deepEqual(rules(lintRootLayout("const SITE_URL = 'x';\nexport const metadata = { metadataBase: new URL(SITE_URL) };")), ['S4']);
});

test('S5: alias hosts appear only in the exempt files', () => {
  const [alias] = ALIAS_HOSTS;
  const text = `const SITE_URL = 'https://${alias}';`;
  assert.deepEqual(rules(lintAliasHosts('src/app/sitemap.ts', text)), ['S5']);
  assert.deepEqual(rules(lintAliasHosts('scripts/build/x.mjs', `// see https://${ALIAS_HOSTS[1]}/docs`)), ['S5']);
  assert.deepEqual(rules(lintAliasHosts('src/lib/seo/policy.ts', text)), []);
  assert.deepEqual(rules(lintAliasHosts('src/lib/archive.ts', text)), []);
  assert.deepEqual(rules(lintAliasHosts('src/app/sitemap.ts', `const SITE_URL = '${SITE_URL}';`)), []);
});

test('S6: a page writes no icons, openGraph or twitter of its own', () => {
  const direct = "export const metadata = { title: 'Brand', icons: { icon: '/pt-mark.svg' }, openGraph: { title: 'Brand' }, twitter: { card: 'summary' } };";
  assert.deepEqual(rules(lintRouteFile('src/app/brand/page.tsx', direct)), ['S1', 'S6', 'S6', 'S6']);
  /* a social-links object in the page body is not metadata */
  assert.deepEqual(rules(lintRouteFile('src/app/handbook/design/page.tsx', `${page("'/handbook/design'")}\nconst LINKS = { twitter: 'https://x.com/generaltxn' };`)), []);
});

test('R1: the baseline excuses S1 and S6, flags stale entries and only shrinks', () => {
  const findings = [
    { file: 'src/app/a/page.tsx', line: 1, rule: 'S1', message: '' },
    { file: 'src/app/a/page.tsx', line: 1, rule: 'S6', message: '' },
    { file: 'src/app/b/page.tsx', line: 1, rule: 'S1', message: '' },
    { file: 'src/app/c/page.tsx', line: 1, rule: 'S2', message: '' },
  ];
  const files = ['src/app/a/page.tsx', 'src/app/b/page.tsx', 'src/app/c/page.tsx', 'src/app/d/page.tsx'];
  const kept = applyBaseline(findings, ['src/app/a/page.tsx', 'src/app/d/page.tsx', 'src/app/gone/page.tsx'], files);
  assert.deepEqual(
    kept.map((f) => `${f.rule} ${f.file}`),
    ['S1 src/app/b/page.tsx', 'S2 src/app/c/page.tsx', `R1 ${BASELINE}`, `R1 ${BASELINE}`],
  );
  assert.match(kept[2].message, /src\/app\/d\/page\.tsx adopts seoRoute now/);
  assert.match(kept[3].message, /src\/app\/gone\/page\.tsx is listed but gone/);
  /* S2 to S5 are never excused */
  assert.equal(applyBaseline(findings, ['src/app/c/page.tsx'], files).filter((f) => f.rule === 'S2').length, 1);
  /* the first write lists every failing file; a later one may not add any */
  assert.deepEqual(nextBaseline(findings, null), { files: ['src/app/a/page.tsx', 'src/app/b/page.tsx'], added: [] });
  assert.deepEqual(nextBaseline(findings, ['src/app/a/page.tsx']).added, ['src/app/b/page.tsx']);
});

test('the static run on a fixture checkout: a scratch page without seoRoute fails', () => {
  const root = mkdtempSync(join(tmpdir(), 'seo-lint-'));
  try {
    const put = (file, text) => {
      mkdirSync(dirname(join(root, file)), { recursive: true });
      writeFileSync(join(root, file), text);
    };
    put('src/app/layout.tsx', LAYOUT);
    put('src/app/page.tsx', HOME);
    put('src/app/brand/page.tsx', "export const metadata = { title: 'Brand' };");
    put(BASELINE, JSON.stringify({ files: ['src/app/brand/page.tsx'] }));
    const first = lintStatic(root);
    assert.deepEqual(rules(applyBaseline(first.findings, readBaseline(root), first.files)), []);
    put('src/app/scratch/page.tsx', 'export default function P() { return null; }');
    const second = lintStatic(root);
    assert.deepEqual(rules(applyBaseline(second.findings, readBaseline(root), second.files)), ['S1']);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

const head = ({
  canonical = `${SITE_URL}/brand`,
  ogUrl = canonical,
  robots = 'index, follow',
  description = 'The brand book, its rules and every mark, color and type size General Translation uses.',
  title = 'Brand, Prototemplate',
  jsonLd = '{"@context":"https://schema.org","@type":"BreadcrumbList"}',
} = {}) => `<!DOCTYPE html><html><head><title>${title}</title>
<meta name="description" content="${description}"/><meta name="robots" content="${robots}"/>
${canonical ? `<link rel="canonical" href="${canonical}"/>` : ''}
<meta property="og:title" content="Brand"/><meta property="og:description" content="${description}"/>
<meta property="og:url" content="${ogUrl}"/><meta property="og:image" content="${SITE_URL}/og?v=1&amp;t=Brand"/>
<meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/>
<meta name="twitter:card" content="summary_large_image"/></head>
<body><svg><title>an icon</title></svg><script type="application/ld+json">${jsonLd}</script></body></html>`;

const judged = (path, html, opts) => judgeHead(path, html, opts).findings.map(([rule]) => rule);

test('B1 to B4: the head judge on fixture HTML', () => {
  assert.deepEqual(judged('/brand', head()), []);
  assert.deepEqual(judged('/brand', head({ canonical: '' })), ['B1']);
  assert.deepEqual(judged('/brand', head({ description: 'Short.' })), ['B1']);
  assert.deepEqual(judged('/brand', head({ title: 'Brand — GT Redesign' })), ['B1']);
  assert.deepEqual(judged('/brand', head({ canonical: `https://${ALIAS_HOSTS[0]}/brand` })), ['B2']);
  assert.deepEqual(judged('/brand', head({ canonical: `${SITE_URL}/` })), ['B2']);
  assert.deepEqual(judged('/brand', head({ ogUrl: `${SITE_URL}/` })), ['B2']);
  assert.deepEqual(judged('/brand', head({ robots: 'noindex, follow' })), ['B3']);
  assert.deepEqual(judged('/brand', head({ jsonLd: '{"@type":"WebSite"}' })), ['B4']);
  assert.deepEqual(judged('/brand', head({ jsonLd: '{not json' })), ['B4']);
  /* the home page's canonical without its slash is the same URL */
  assert.deepEqual(judged('/', head({ canonical: SITE_URL })), []);
  /* the mirror: GT canonical, index */
  const gt = 'https://generaltranslation.com/en-US/pricing';
  assert.deepEqual(judged('/d/production/pricing', head({ canonical: gt })), []);
  assert.deepEqual(judged('/d/production/pricing', head({ canonical: `${SITE_URL}/d/production/pricing` })), ['B2']);
  /* a study: noindex, follow */
  assert.deepEqual(judged('/d/toolchain', head({ canonical: `${SITE_URL}/d/toolchain`, robots: 'noindex, follow' })), []);
  assert.deepEqual(judged('/d/toolchain', head({ canonical: `${SITE_URL}/d/toolchain` })), ['B3']);
  /* a page still in the baseline: no head checks, robots by its layout's default */
  assert.deepEqual(judged('/d/production/pricing', head({ canonical: '', robots: 'noindex, follow' }), { adopted: false }), []);
  assert.deepEqual(judged('/brand', head({ canonical: '' }), { adopted: false }), []);
  assert.deepEqual(judged('/d/toolchain', head({ canonical: '' }), { adopted: false }), ['B3']);
});

test('B5: the sitemap judge', () => {
  const xml = `<urlset><url><loc>${SITE_URL}/</loc></url><url><loc>${SITE_URL}/brand</loc><lastmod>2026-10-11T14:17:52.000Z</lastmod></url>
<url><loc>${SITE_URL}/d/toolchain</loc></url><url><loc>https://${ALIAS_HOSTS[0]}/marks</loc></url><url><loc>${SITE_URL}/missing</loc></url></urlset>`;
  const entries = parseSitemap(xml);
  assert.equal(entries.length, 5);
  const pages = new Map([
    ['/', judgeHead('/', head({ canonical: SITE_URL }))],
    ['/brand', judgeHead('/brand', head())],
    ['/d/toolchain', judgeHead('/d/toolchain', head({ canonical: `${SITE_URL}/d/toolchain`, robots: 'noindex, follow' }))],
  ]);
  for (const page of pages.values()) page.adopted = true;
  const updated = { '/brand': { at: '2026-10-11T07:17:52-07:00' }, '/missing': { at: '2026-10-11T07:17:52-07:00' } };
  const [findings, notes] = judgeSitemap(entries, pages, updated);
  assert.deepEqual(
    findings.map(([rule, message]) => `${rule} ${message.split(' ')[0]}`),
    [`B5 ${SITE_URL}/d/toolchain`, `B5 ${SITE_URL}/d/toolchain`, `B5 https://${ALIAS_HOSTS[0]}/marks`, `B5 ${SITE_URL}/missing`, `B5 ${SITE_URL}/missing`],
  );
  assert.equal(notes.length, 2);
  const [wrongDate] = judgeSitemap(parseSitemap(`<url><loc>${SITE_URL}/brand</loc><lastmod>2026-10-01</lastmod></url>`), pages, updated);
  assert.deepEqual(wrongDate.map(([rule]) => rule), ['B5']);
});

test('B7: indexable pages have unique titles and descriptions', () => {
  const a = { ...judgeHead('/brand', head()), adopted: true };
  const b = { ...judgeHead('/marks', head({ canonical: `${SITE_URL}/marks` })), adopted: true };
  assert.deepEqual(
    judgeUnique(new Map([['/brand', a], ['/marks', b]])).map(([, rule]) => rule),
    ['B7', 'B7'],
  );
  assert.deepEqual(judgeUnique(new Map([['/brand', a], ['/marks', { ...b, adopted: false }]])), []);
});

test('route files for built pages: static first, then the fewest dynamic segments', () => {
  const match = routeMatcher([
    'src/app/page.tsx',
    'src/app/handbook/page.tsx',
    'src/app/handbook/[slug]/page.tsx',
    'src/app/handbook/decisions/page.tsx',
    'src/app/d/production/[...missing]/page.tsx',
    'src/app/d/production/pricing/page.tsx',
  ]);
  assert.equal(match('/'), 'src/app/page.tsx');
  assert.equal(match('/handbook/decisions'), 'src/app/handbook/decisions/page.tsx');
  assert.equal(match('/handbook/design'), 'src/app/handbook/[slug]/page.tsx');
  assert.equal(match('/d/production/pricing'), 'src/app/d/production/pricing/page.tsx');
  assert.equal(match('/d/production/a/b'), 'src/app/d/production/[...missing]/page.tsx');
  assert.equal(match('/nothing'), null);
});

test('image headers: PNG and JPEG sizes', () => {
  const png = Buffer.alloc(33);
  png.writeUInt32BE(0x89504e47, 0);
  png.writeUInt32BE(1200, 16);
  png.writeUInt32BE(630, 20);
  assert.deepEqual(imageSize(png), { width: 1200, height: 630 });
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x04, 0xec, 0x09, 0x60, 0x03, 0, 0, 0, 0]);
  assert.deepEqual(imageSize(jpeg), { width: 2400, height: 1260 });
  assert.equal(imageSize(Buffer.from('GIF89a')), null);
});

test('the repository passes the static mode', () => {
  const { findings, files } = lintStatic(ROOT);
  const kept = applyBaseline(findings, readBaseline(ROOT), files);
  assert.deepEqual(kept.map((f) => `${f.file}:${f.line} ${f.rule} ${f.message}`), []);
});
