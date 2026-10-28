/* POST multipart {name, key?, order?, replace?, file}: adds a logo, or with
   replace=1 replaces the mark of an existing key; an add never overwrites a
   logo that has the key. An SVG is sanitized and normalized to one ink; a
   PNG must have a transparent background. */
import { isLogoKey, keyFromName, MAX_LOGO_BYTES, MAX_NAME_LENGTH } from '@/lib/vote/config';
import { fail, isAdmin, json, route } from '@/lib/vote/api';
import { checkPng, detectKind, normalizeSvg } from '@/lib/vote/mark-file';
import { registry, saveLogo } from '@/lib/vote/store';

import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ORDER_LIMIT = 1_000_000;

export const POST = route(async (req: NextRequest) => {
  if (!(await isAdmin())) return fail(401, 'Sign in with the admin key.');
  if (Number(req.headers.get('content-length') ?? 0) > MAX_LOGO_BYTES + 64 * 1024) {
    return fail(413, 'The file is over 1 MB.');
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, 'Send a form with a name and a file.');
  }
  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) return fail(400, 'Attach an SVG or PNG file.');
  if (file.size > MAX_LOGO_BYTES) return fail(413, 'The file is over 1 MB.');
  const name = String(form.get('name') ?? '').trim().replace(/\s+/g, ' ');
  if (!name || name.length > MAX_NAME_LENGTH || /\p{Cc}/u.test(name)) {
    return fail(400, `Give the logo a name of at most ${MAX_NAME_LENGTH} characters.`);
  }
  const rawKey = String(form.get('key') ?? '').trim();
  const key = rawKey || keyFromName(name);
  if (!isLogoKey(key)) {
    return fail(400, rawKey ? 'A key uses a to z, 0 to 9 and hyphens, at most 40.' : 'Give the logo a key.');
  }
  const rawOrder = String(form.get('order') ?? '').trim();
  const order = rawOrder ? Number(rawOrder) : undefined;
  if (order !== undefined && !(Number.isFinite(order) && Math.abs(order) <= ORDER_LIMIT)) {
    return fail(400, 'The order is a number.');
  }
  const replace = form.get('replace') === '1';
  if (!replace && (await registry(true)).byKey.has(key)) {
    return fail(409, 'A logo with that key exists. Use Replace on its row.');
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = detectKind(bytes);
  if (!kind) return fail(400, 'Attach an SVG or PNG file.');
  let body: Buffer;
  if (kind === 'svg') {
    const result = normalizeSvg(new TextDecoder().decode(bytes));
    if ('error' in result) return fail(400, result.error);
    body = Buffer.from(result.svg);
  } else {
    const error = checkPng(bytes);
    if (error) return fail(400, error);
    body = Buffer.from(bytes);
  }
  await saveLogo({ key, name, order, kind, bytes: body });
  return json({ ok: true, key });
});
