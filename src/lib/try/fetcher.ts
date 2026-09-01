/* The report pipeline's fetch contract. The pipeline runs in the browser
   and reaches other sites only through /api/try/fetch, a relay that does
   one SSRF-gated fetch per call; the per-report budget, pacing, and log
   live here on the client so the server holds no per-report state. */

export type FetchedPage = {
  status: number;
  finalUrl: string;
  contentType: string;
  body: string;
  headers: Headers;
  error?: string;
};

export type FetchLogEntry = {
  url: string;
  purpose: string;
  status: number | null;
  finalUrl: string | null;
  ms: number | null;
  note: string;
};

export type FetchPageOptions = {
  purpose?: string;
  acceptLanguage?: string;
  timeoutMs?: number;
  countsAgainstBudget?: boolean;
};

export type SafeFetcher = {
  fetchPage: (
    url: string,
    opts?: FetchPageOptions
  ) => Promise<FetchedPage | null>;
  log: FetchLogEntry[];
  remaining: () => number;
};

type RelayResult = {
  status: number;
  finalUrl: string;
  contentType: string;
  body: string;
  error?: string;
};

export function normalizeUserUrl(raw: string): string {
  const trimmed = raw.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

const RELAY_GRACE_MS = 4000;

/* Beyond the SafeFetcher contract: a relay 429 throws a RateLimitError
   so the run surfaces the limit instead of grading on missing fetches,
   and an aborted signal makes every further call answer null. */
export function createRelayFetcher(
  maxFollowUps = 8,
  signal?: AbortSignal
): SafeFetcher {
  const log: FetchLogEntry[] = [];
  let followUps = 0;

  async function fetchPage(
    url: string,
    opts: FetchPageOptions = {}
  ): Promise<FetchedPage | null> {
    const {
      purpose = 'fetch',
      acceptLanguage,
      timeoutMs = 8000,
      countsAgainstBudget = true,
    } = opts;

    if (signal?.aborted) return null;
    if (countsAgainstBudget) {
      if (followUps >= maxFollowUps) return null;
      followUps += 1;
      await new Promise((r) => setTimeout(r, 250));
      if (signal?.aborted) return null;
    }

    const entry: FetchLogEntry = {
      url,
      purpose,
      status: null,
      finalUrl: null,
      ms: null,
      note: '',
    };
    log.push(entry);
    const started = Date.now();

    const fail = (note: string): FetchedPage => {
      entry.ms = Date.now() - started;
      entry.note = note;
      return {
        status: 0,
        finalUrl: url,
        contentType: '',
        body: '',
        headers: new Headers(),
        error: note,
      };
    };

    let relayed: RelayResult;
    try {
      const deadline = AbortSignal.timeout(timeoutMs + RELAY_GRACE_MS);
      const res = await fetch('/api/try/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, acceptLanguage, timeoutMs }),
        signal: signal ? AbortSignal.any([signal, deadline]) : deadline,
      });
      const data = (await res.json().catch(() => null)) as
        | (RelayResult & { error?: string })
        | null;
      if (res.status === 429) {
        entry.ms = Date.now() - started;
        entry.note = 'rate limited';
        const error = new Error(
          data?.error ||
            'Too many requests from this address. Wait a minute and retry.'
        );
        error.name = 'RateLimitError';
        throw error;
      }
      if (!res.ok || !data) {
        return fail(data?.error || `relay error (HTTP ${res.status})`);
      }
      relayed = data;
    } catch (err) {
      if (err instanceof Error && err.name === 'RateLimitError') throw err;
      const timedOut =
        err instanceof Error &&
        (err.name === 'TimeoutError' || err.name === 'AbortError');
      return fail(
        timedOut
          ? 'timed out'
          : err instanceof Error
            ? err.message
            : 'fetch failed'
      );
    }

    if (relayed.error || relayed.status === 0) {
      return fail(relayed.error || 'fetch failed');
    }
    entry.status = relayed.status;
    entry.finalUrl = relayed.finalUrl;
    entry.ms = Date.now() - started;
    return {
      status: relayed.status,
      finalUrl: relayed.finalUrl,
      contentType: relayed.contentType,
      body: relayed.body,
      headers: new Headers(
        relayed.contentType ? { 'content-type': relayed.contentType } : {}
      ),
    };
  }

  return {
    fetchPage,
    log,
    remaining: () => maxFollowUps - followUps,
  };
}
