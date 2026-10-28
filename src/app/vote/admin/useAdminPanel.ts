import { useState } from 'react';

import { voteApi } from '../api';
import type { ApiResult } from '../api';
import { useReread } from '../useReread';

/**
 * One admin change, posted to its endpoint; the panel reads itself again
 * after it succeeds, unless `reload` is false (a bulk add in several
 * batches reads it once at the end).
 */
export type Change = <R = unknown>(path: string, body: FormData | object, reload?: boolean) => Promise<ApiResult<R>>;

/**
 * The state both admin pages share: the panel's data (null shows the key
 * form), the busy flag, the one error line, and the calls that change them.
 * A 401 or 403 from any call means the admin cookie is gone or stale, so
 * the page falls back to the key form. A page the router replays (`at`,
 * 0 for the key form) reads the panel again.
 */
export function useAdminPanel<T>(dataPath: string, initial: T | null, at: number) {
  const [data, setData] = useState<T | null>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useReread(at, () => void reload());

  async function reload(): Promise<void> {
    const result = await voteApi<T>(dataPath);
    if (result.ok) setData(result.data);
    else if (result.status === 401 || result.status === 403) setData(null);
    else setError(result.error);
  }

  const change: Change = async <R,>(path: string, body: FormData | object, again = true) => {
    setBusy(true);
    setError(null);
    const result = await voteApi<R>(path, body);
    if (result.ok && again) await reload();
    else if (!result.ok && (result.status === 401 || result.status === 403)) setData(null);
    else if (!result.ok) setError(result.error);
    setBusy(false);
    return result;
  };

  async function signIn(key: string) {
    setBusy(true);
    setError(null);
    const result = await voteApi<unknown>('/api/vote/admin/login', { key });
    if (result.ok) await reload();
    else setError(result.error);
    setBusy(false);
  }

  async function signOut() {
    setBusy(true);
    await voteApi<unknown>('/api/vote/admin/logout', {});
    setBusy(false);
    setError(null);
    setData(null);
  }

  return { data, busy, error, setError, reload, change, signIn, signOut };
}
