/* POST multipart: adds options to a decision in bulk, or replaces one
   option's file.
   - Add, mark or image kind: one or more `file` fields. Each file's name
     becomes its option's name (the extension dropped, dashes and
     underscores to spaces).
   - Add, text kind: a `lines` field, "Name" or "Name: text" per line.
   - Replace: `replace` set to an option key, and one `file`.
   - Check: `check` set to 1 with an add's fields checks every file or line
     and writes nothing, so a bulk add sent in several requests can check
     them all before it writes any.
   Keys come from the names, with -2, -3 on a collision, and an add never
   overwrites an option. Every file or line is checked before any is
   written, so a request with a bad one adds nothing. A mark is an SVG
   normalized to one ink or a PNG with a transparent background; an image
   is a PNG, JPG, WebP or sanitized SVG, with no metadata. */
import { isOptionKey, MAX_IMAGE_BYTES, MAX_MARK_BYTES, MAX_UPLOAD_BYTES } from '@/lib/vote/config';
import {
  checkName,
  isDecisionId,
  keyFromName,
  keysFor,
  MAX_BATCH,
  nameFromFilename,
  parseTextLines,
  uniqueKey,
} from '@/lib/vote/decisions';
import { fail, isAdmin, json, route } from '@/lib/vote/api';
import { prepareFile } from '@/lib/vote/mark-file';
import { addOption, decision, mapLimit, registry, replaceOptionFile } from '@/lib/vote/store';

import type { FileExt } from '@/lib/vote/config';
import type { DecisionParams } from '@/lib/vote/api';
import type { ApiError, DecisionKind } from '@/lib/vote/types';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Problem = { name: string; error: string };
type Item = { name: string; text: string; file?: { ext: FileExt; bytes: Buffer } };

function megabytes(bytes: number): string {
  return `${bytes / (1024 * 1024)} MB`;
}

function refuse(problems: Problem[], noun: 'files' | 'lines') {
  const first = problems[0];
  const error = problems.length === 1 && first ? (first.name ? `${first.name}: ${first.error}` : first.error) : `${problems.length} ${noun} were refused.`;
  const body: ApiError = { error, problems };
  return json(body, 400);
}

async function readFile(
  kind: Exclude<DecisionKind, 'text'>,
  file: File
): Promise<{ ext: FileExt; bytes: Buffer } | { error: string; status: 400 | 413 }> {
  const limit = kind === 'mark' ? MAX_MARK_BYTES : MAX_IMAGE_BYTES;
  if (file.size === 0) return { error: 'The file is empty.', status: 400 };
  if (file.size > limit) return { error: `The file is over ${megabytes(limit)}.`, status: 413 };
  const prepared = prepareFile(kind, new Uint8Array(await file.arrayBuffer()));
  return 'error' in prepared ? { error: prepared.error, status: 400 } : { ext: prepared.ext, bytes: Buffer.from(prepared.bytes) };
}

export const POST = route(async (req: NextRequest, { params }: DecisionParams) => {
  if (!(await isAdmin())) return fail(401, 'Sign in with the admin key.');
  const { id } = await params;
  if (!isDecisionId(id)) return fail(404, 'No such decision.');
  if (Number(req.headers.get('content-length') ?? 0) > MAX_UPLOAD_BYTES + 64 * 1024) {
    return fail(413, `Send at most ${megabytes(MAX_UPLOAD_BYTES)} at once.`);
  }
  const meta = await decision(id, true);
  if (!meta) return fail(404, 'No such decision.');
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, 'Send a form with files or lines.');
  }
  const files = form.getAll('file').filter((value): value is File => value instanceof File);

  const replace = form.get('replace');
  if (replace !== null) {
    if (meta.kind === 'text') return fail(400, 'A text option has no file. Edit it on its row.');
    if (!isOptionKey(replace)) return fail(400, 'Send the option key to replace.');
    if (files.length !== 1) return fail(400, 'Attach one file.');
    if (!(await registry(id, true)).byKey.has(replace)) return fail(404, 'No such option.');
    const file = await readFile(meta.kind, files[0] as File);
    if ('error' in file) return fail(file.status, file.error);
    await replaceOptionFile(id, replace, file);
    return json({ ok: true, key: replace });
  }

  const items: Item[] = [];
  const problems: Problem[] = [];
  if (meta.kind === 'text') {
    const parsed = parseTextLines(String(form.get('lines') ?? ''));
    if ('problems' in parsed) return refuse(parsed.problems, 'lines');
    items.push(...parsed.options);
  } else {
    if (!files.length) return fail(400, 'Attach one or more files.');
    if (files.length > MAX_BATCH) return fail(400, `Add at most ${MAX_BATCH} files at once.`);
    for (const value of files) {
      const name = checkName(nameFromFilename(value.name));
      const file = await readFile(meta.kind, value);
      if (name === null) problems.push({ name: value.name, error: 'The file name gives the option no name.' });
      else if ('error' in file) problems.push({ name: value.name, error: file.error });
      else items.push({ name, text: '', file });
    }
    if (problems.length) return refuse(problems, 'files');
  }
  if (form.get('check') === '1') return json({ ok: true, checked: items.length });

  const current = await registry(id, true);
  const taken = new Set(current.options.map((option) => option.key));
  const keys = keysFor(
    items.map((item) => item.name),
    taken
  );
  for (const key of keys) taken.add(key);
  const base = Math.max(-1, ...current.options.map((option) => option.order)) + 1;
  const added = await mapLimit(items.map((item, i) => ({ item, i })), 4, async ({ item, i }) => {
    let key = keys[i] as string;
    /* another add took the key since the list was read: the next free suffix */
    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (await addOption(id, { key, name: item.name, text: item.text, order: base + i, file: item.file })) {
        return { key, name: item.name };
      }
      taken.add(key);
      key = uniqueKey(keyFromName(item.name), taken);
      taken.add(key);
    }
    throw new Error(`No free key for ${item.name}.`);
  });
  return json({ ok: true, added });
});
