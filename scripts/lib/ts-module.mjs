// Loads a TypeScript module from src/ into a Node script through Node's
// type stripping (on by default in Node 24, the version engines pins). The
// repository's package.json names no module type, so Node detects the
// module syntax and warns MODULE_TYPELESS_PACKAGE_JSON on every load; this
// module drops that one warning and passes every other warning on to the
// listeners Node installed. The TypeScript module must import nothing at
// runtime (import type only), as src/lib/seo/policy.ts and card-url.ts do.
//
//   const { SITE_URL } = await importTs(new URL('../../src/lib/seo/policy.ts', import.meta.url));

const listeners = process.listeners('warning');
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning?.code === 'MODULE_TYPELESS_PACKAGE_JSON') return;
  for (const listener of listeners) listener(warning);
});

/** The module at `url` (a file URL), loaded with the typeless-package warning dropped. */
export function importTs(url) {
  return import(url.href);
}
