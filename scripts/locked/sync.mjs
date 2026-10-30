#!/usr/bin/env node
/* oxlint-disable no-console -- a report printed to stdout. */
// Uploads a locked area's files to the private Blob store under
// locked/<area>/, where the area's route serves them to a signed-in
// session (src/app/raise/[[...path]]/route.ts for raise). Each area names
// the files and folders its viewer needs, and only files of the web types
// below go up. Re-runnable: a manifest blob (locked/<area>.manifest.json,
// outside the area's prefix, so the route never serves it) records each
// uploaded file's SHA-256, so an unchanged file is skipped, and a blob
// whose file is gone from the folder is deleted. The report prints counts
// only, never a file's name or contents.
//
// Usage:
//   node scripts/locked/sync.mjs <area> [--dir <folder>] [--dry-run]
//   pnpm sync:locked raise --dir ~/repos/Prototemplate/raise --dry-run
//
//   <area>     an area of AREAS below (raise)
//   --dir      the local folder (default: <checkout>/<area>)
//   --dry-run  read the store and print what would change, writing nothing
//
// Requires: LOCKED_BLOB_READ_WRITE_TOKEN, the read-write token of the
// locked areas' own private store, in the environment; BLOB_READ_WRITE_TOKEN
// is never read. A dry run without it compares against an empty store.
// Last real run: none (kept for: syncing /raise before it is shared).
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { del, get, list, put } from '@vercel/blob';

import { helpIfAsked } from '../lib/help.mjs';
import { ROOT } from '../lib/root.mjs';

helpIfAsked(import.meta.url);

/** What each area uploads: its viewer's top-level files (each when present) and folders. Nothing else in the folder goes up. The raise viewer fetches status.json and decisions.json beside its index. */
export const AREAS = {
  raise: {
    files: ['index.html', 'rounds.json', 'status.json', 'decisions.json'],
    folders: ['viewer', 'rounds', 'posters'],
  },
};

/** The web types that go up, by extension; any other file is left out. */
export const TYPES = {
  html: 'text/html; charset=utf-8',
  json: 'application/json; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  woff2: 'font/woff2',
  woff: 'font/woff',
  png: 'image/png',
  webp: 'image/webp',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  mp4: 'video/mp4',
  webm: 'video/webm',
};

/** A path segment the route serves: no dot first, so no hidden file. Matches SEGMENT in the route. */
const SEGMENT = /^[A-Za-z0-9_-][A-Za-z0-9._-]*$/;

/** The content type for a relative path, or null when it does not go up. */
export function typeOf(path) {
  if (!path.split('/').every((segment) => SEGMENT.test(segment))) return null;
  const ext = path.slice(path.lastIndexOf('.') + 1).toLowerCase();
  return Object.hasOwn(TYPES, ext) ? TYPES[ext] : null;
}

/** Every relative path under a folder, depth first, in a stable order. */
function walk(dir, rel) {
  const out = [];
  for (const name of readdirSync(join(dir, rel)).sort()) {
    const path = `${rel}/${name}`;
    const stat = statSync(join(dir, path));
    if (stat.isDirectory()) out.push(...walk(dir, path));
    else if (stat.isFile()) out.push(path);
  }
  return out;
}

/** The area's files in a local folder: the relative path, its type and its SHA-256. */
export function localFiles(dir, area) {
  const paths = [
    ...area.files.filter((file) => existsSync(join(dir, file))),
    ...area.folders.filter((folder) => existsSync(join(dir, folder))).flatMap((folder) => walk(dir, folder)),
  ];
  return paths.flatMap((path) => {
    const type = typeOf(path);
    if (!type) return [];
    const sha256 = createHash('sha256').update(readFileSync(join(dir, path))).digest('hex');
    return [{ path, type, sha256 }];
  });
}

/**
 * The changes from the store to the folder: each local file whose hash the
 * manifest does not hold or whose blob is missing goes up; each blob with
 * no local file is deleted. `remote` holds the paths under the prefix.
 */
export function plan(local, manifest, remote) {
  const here = new Set(local.map((file) => file.path));
  const upload = local.filter((file) => manifest[file.path] !== file.sha256 || !remote.has(file.path));
  const remove = [...remote].filter((path) => !here.has(path)).sort();
  return { upload, unchanged: local.length - upload.length, remove };
}

/** Runs `work` over `items`, `limit` at a time. */
async function pool(items, limit, work) {
  let next = 0;
  const run = async () => {
    while (next < items.length) await work(items[next++]);
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
}

async function main() {
  const args = process.argv.slice(2);
  const name = args.find((arg, i) => !arg.startsWith('--') && args[i - 1] !== '--dir');
  const area = name && Object.hasOwn(AREAS, name) ? AREAS[name] : null;
  if (!area) {
    console.error(`sync: name an area: ${Object.keys(AREAS).join(', ')}`);
    process.exit(2);
  }
  const at = args.indexOf('--dir');
  const dir = resolve(at >= 0 ? args[at + 1] : join(ROOT, name));
  const dry = args.includes('--dry-run');
  if (!existsSync(dir)) {
    console.error(`sync: the ${name} folder is not there`);
    process.exit(2);
  }
  const token = process.env.LOCKED_BLOB_READ_WRITE_TOKEN;
  if (!token && !dry) {
    console.error('sync: LOCKED_BLOB_READ_WRITE_TOKEN is not set');
    process.exit(2);
  }

  const prefix = `locked/${name}/`;
  const manifestPath = `locked/${name}.manifest.json`;
  const local = localFiles(dir, area);

  let manifest = {};
  const remote = new Set();
  if (token) {
    const found = await get(manifestPath, { access: 'private', token, useCache: false });
    if (found && found.statusCode === 200) manifest = (await new Response(found.stream).json()).files ?? {};
    let cursor;
    do {
      const page = await list({ token, prefix, limit: 1000, ...(cursor ? { cursor } : {}) });
      for (const blob of page.blobs) remote.add(blob.pathname.slice(prefix.length));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  } else {
    console.log('sync: no token, so the store reads as empty');
  }

  const { upload, unchanged, remove } = plan(local, manifest, remote);
  const verb = dry ? 'would upload' : 'uploading';
  console.log(`sync ${name}: ${local.length} files, ${unchanged} unchanged, ${verb} ${upload.length}, ${dry ? 'would delete' : 'deleting'} ${remove.length}`);
  if (dry) return;

  const next = Object.fromEntries(local.filter((file) => !upload.includes(file)).map((file) => [file.path, file.sha256]));
  let failed = 0;
  let firstError = '';
  await pool(upload, 4, async (file) => {
    try {
      await put(`${prefix}${file.path}`, readFileSync(join(dir, file.path)), {
        access: 'private',
        token,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: file.type,
        cacheControlMaxAge: 60,
      });
      next[file.path] = file.sha256;
    } catch (error) {
      failed += 1;
      firstError ||= error instanceof Error ? error.name : 'Error';
    }
  });
  for (let i = 0; i < remove.length; i += 100) {
    await del(remove.slice(i, i + 100).map((path) => `${prefix}${path}`), { token });
  }
  await put(manifestPath, JSON.stringify({ files: next }), {
    access: 'private',
    token,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json; charset=utf-8',
    cacheControlMaxAge: 60,
  });
  console.log(`sync ${name}: uploaded ${upload.length - failed}, deleted ${remove.length}, failed ${failed}${failed ? ` (${firstError}); run it again` : ''}`);
  if (failed) process.exit(1);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`sync: ${error instanceof Error ? error.name : 'Error'}`);
    process.exit(1);
  });
}
