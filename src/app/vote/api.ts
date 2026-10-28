/**
 * The vote screens' one way to call /api/vote. A body makes the call a
 * POST (JSON, or multipart for a FormData); no body makes it a GET. Nothing
 * is cached. A failure carries the sentence to show: the API's own `error`
 * sentence when it sent one, else one written here, so a screen never shows
 * a raw status or a stack.
 */

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

function fallback(status: number): string {
  if (status === 0) return 'The connection dropped. Try again.';
  if (status === 429) return 'Too many tries. Wait a minute and try again.';
  if (status === 503) return 'Voting is not set up on this deployment.';
  return 'Something went wrong. Try again.';
}

async function sentenceOf(response: Response): Promise<string> {
  try {
    const body: { error?: unknown } | null = await response.json();
    const error = body?.error;
    if (typeof error === 'string' && error.length > 0 && error.length <= 200) return error;
  } catch {
    /* not JSON: the fallback below */
  }
  return fallback(response.status);
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
    return { ok: false, status: 0, error: fallback(0) };
  }
  if (!response.ok) return { ok: false, status: response.status, error: await sentenceOf(response) };
  try {
    return { ok: true, data: (await response.json()) as T };
  } catch {
    return { ok: false, status: 0, error: fallback(0) };
  }
}
