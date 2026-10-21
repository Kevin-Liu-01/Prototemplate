// Tests for src/lib/seo/policy.ts, loaded directly through Node's type
// stripping: policyFor against every row of the policy table (SEO plan
// section 2.2), and the path normalization the table relies on.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { importTs } from './seo.mjs';

const {
  ALIAS_HOSTS,
  GT_URL,
  MIRROR_WITHOUT_LIVE,
  SITE_URL,
  normalizePath,
  policyFor,
  selfUrl,
} = await importTs(new URL('../../src/lib/seo/policy.ts', import.meta.url));

const indexed = (path) => ({ index: true, canonical: path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`, inSitemap: true });
const study = (path) => ({ index: false, canonical: `${SITE_URL}${path}`, inSitemap: false });

test('the hosts: www is canonical and the aliases are named once', () => {
  assert.equal(SITE_URL, 'https://www.prototemplate.com');
  assert.equal(GT_URL, 'https://generaltranslation.com');
  assert.equal(ALIAS_HOSTS.length, 2);
  assert.ok(ALIAS_HOSTS.every((host) => !SITE_URL.includes(host)));
});

test('hub pages: index, follow, self canonical on www, in the sitemap', () => {
  for (const path of [
    '/',
    '/brand',
    '/deck',
    '/present',
    '/compare',
    '/marks',
    '/graphics',
    '/motion',
    '/motion/translation-series',
    '/skills',
    '/skills/gt-voice',
    '/handbook',
    '/handbook/decisions',
    '/docs',
    '/docs/seo',
    '/blog',
    '/directions/toolchain',
    '/archive/concrete-mono',
  ]) {
    assert.deepEqual(policyFor(path), indexed(path), path);
  }
});

test('posts: index, canonical on generaltranslation.com/en-US/blog, not listed', () => {
  assert.deepEqual(policyFor('/blog/fuma-nama'), {
    index: true,
    canonical: 'https://generaltranslation.com/en-US/blog/fuma-nama',
    inSitemap: false,
  });
});

test('GT Atlas: a story that is a GT post takes the post as its canonical; the rest are their own', () => {
  assert.deepEqual(policyFor('/press/fuma-nama'), {
    index: true,
    canonical: 'https://generaltranslation.com/en-US/blog/fuma-nama',
    inSitemap: false,
  });
  assert.deepEqual(policyFor('/press'), indexed('/press'));
  assert.deepEqual(policyFor('/press/translating-euclid'), indexed('/press/translating-euclid'));
});

test('the mirror: index with the GT canonical; the dashboard states noindex with their own', () => {
  assert.deepEqual(policyFor('/d/production'), { index: true, canonical: 'https://generaltranslation.com/en-US', inSitemap: false });
  assert.deepEqual(policyFor('/d/production/pricing'), { index: true, canonical: 'https://generaltranslation.com/en-US/pricing', inSitemap: false });
  assert.deepEqual(policyFor('/d/production/enterprise/contact/vercel'), {
    index: true,
    canonical: 'https://generaltranslation.com/en-US/enterprise/contact/vercel',
    inSitemap: false,
  });
  assert.deepEqual(policyFor('/d/production/blog/fuma-nama'), {
    index: true,
    canonical: 'https://generaltranslation.com/en-US/blog/fuma-nama',
    inSitemap: false,
  });
  assert.deepEqual([...MIRROR_WITHOUT_LIVE], ['signin', 'onboarding', 'consent', 'device', 'cli']);
  for (const state of MIRROR_WITHOUT_LIVE) {
    assert.deepEqual(policyFor(`/d/production/${state}`), study(`/d/production/${state}`), state);
    assert.deepEqual(policyFor(`/d/production/${state}/step`), study(`/d/production/${state}/step`), state);
  }
  /* a page whose name only starts like a state is a mirror page */
  assert.equal(policyFor('/d/production/signing').index, true);
});

test('every other /d/ page: noindex, follow, self canonical, not listed', () => {
  for (const path of ['/d', '/d/toolchain', '/d/singularity-dossier', '/d/singularity-dossier/careers', '/d/singularity-dossier/legal/privacy', '/d/production-notes']) {
    assert.deepEqual(policyFor(path), study(path), path);
  }
});

test('paths normalize: trailing slash, query and fragment', () => {
  assert.equal(normalizePath('/brand/'), '/brand');
  assert.equal(normalizePath('/brand?x=1#y'), '/brand');
  assert.equal(normalizePath('/'), '/');
  assert.equal(normalizePath('//'), '/');
  assert.equal(selfUrl('/'), `${SITE_URL}/`);
  assert.deepEqual(policyFor('/d/toolchain/'), policyFor('/d/toolchain'));
  assert.throws(() => normalizePath('brand'));
});
