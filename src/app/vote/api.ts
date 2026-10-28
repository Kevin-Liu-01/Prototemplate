/**
 * The vote screens' one way to call /api/vote. A body makes the call a
 * POST (JSON, or multipart for a FormData); no body makes it a GET. Nothing
 * is cached. A failure carries the sentence to show: the API's own `error`
 * sentence when it sent one, else one written here, so a screen never shows
 * a raw status or a stack. A bulk add that refuses some files or lines
 * names each one in `problems`.
 */

export type Problem = { name: string; error: string };

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; problems: Problem[] };

function fallback(status: number): string {
  if (status === 0) return 'The connection dropped. Try again.';
  if (status === 413) return 'The upload is too large. Send fewer files at once.';
  if (status === 429) return 'Too many tries. Wait a minute and try again.';
  if (status === 503) return 'Voting is not set up on this deployment.';
  return 'Something went wrong. Try again.';
}

function problemsOf(raw: unknown): Problem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Problem => typeof item?.name === 'string' && typeof item?.error === 'string')
    .slice(0, 50);
}

async function failureOf(response: Response): Promise<{ error: string; problems: Problem[] }> {
  try {
    const body: { error?: unknown; problems?: unknown } | null = await response.json();
    const error = body?.error;
    const problems = problemsOf(body?.problems);
    if (typeof error === 'string' && error.length > 0 && error.length <= 200) return { error, problems };
    return { error: fallback(response.status), problems };
  } catch {
    /* not JSON: the fallback */
    return { error: fallback(response.status), problems: [] };
  }
}

export async function voteApi<T>(path: string, body?: FormData | object): Promise<ApiResult<T>> {
  const init: RequestInit = { method: body === undefined ? 'GET' : 'POST', cache: 'no-store', credentials: 'same-origin' };
  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }
  let response: Response;
  try {
    response = await fetch(path, init);
  } catch {
    return { ok: false, status: 0, error: fallback(0), problems: [] };
  }
  if (!response.ok) return { ok: false, status: response.status, ...(await failureOf(response)) };
  try {
    return { ok: true, data: (await response.json()) as T };
  } catch {
    return { ok: false, status: 0, error: fallback(0), problems: [] };
  }
}

/** A decision's voter route: /api/vote/d/<id>/<rest>. */
export function decisionPath(id: string, rest: string): string {
  return `/api/vote/d/${encodeURIComponent(id)}/${rest}`;
}

/** A decision's admin route: /api/vote/admin/d/<id>/<rest>. */
export function adminPath(id: string, rest: string): string {
  return `/api/vote/admin/d/${encodeURIComponent(id)}/${rest}`;
}
