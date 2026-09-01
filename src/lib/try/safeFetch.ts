import type { LookupAddress } from 'node:dns';
import { isIP } from 'node:net';
import type { LookupFunction } from 'node:net';
// undici stays a dependency: its Agent is the SSRF DNS-pinning seam below,
// and Node's global fetch exposes no dispatcher to hook.
import { Agent, fetch as undiciFetch } from 'undici';

import {
  isPublicIp,
  normalizeHostname,
  resolveHostAddresses,
} from '@/lib/networking-ip';

import type {
  FetchedPage,
  FetchLogEntry,
  FetchPageOptions,
  SafeFetcher,
} from '@/lib/try/fetcher';

export type {
  FetchedPage,
  FetchLogEntry,
  FetchPageOptions,
  SafeFetcher,
} from '@/lib/try/fetcher';

const UA = 'GT-Localization-Report-Card/0.1 (+https://generaltranslation.com)';
const MAX_BYTES = 1_500_000;
const MAX_REDIRECTS = 5;

type UpstreamResponse = Awaited<ReturnType<typeof undiciFetch>>;

export type UrlGateResult =
  | { ok: true; url: URL }
  | { ok: false; reason: string };

export function gateUrl(raw: string): UrlGateResult {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: 'That does not look like a valid URL.' };
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { ok: false, reason: 'Only http and https URLs are supported.' };
  }
  if (url.username || url.password) {
    return {
      ok: false,
      reason: 'URLs with embedded credentials are not supported.',
    };
  }
  if (url.port !== '' && url.port !== '80' && url.port !== '443') {
    return {
      ok: false,
      reason: 'Only default http and https ports are supported.',
    };
  }
  return { ok: true, url };
}

/* Resolves the hostname once and validates every returned address. The same
   records are then pinned into the connection, so what was validated is
   what gets dialed. */
async function resolvePublic(
  hostname: string
): Promise<LookupAddress[] | null> {
  const bare = normalizeHostname(hostname);
  const family = isIP(bare);
  if (family) return isPublicIp(bare) ? [{ address: bare, family }] : null;
  try {
    const records = await resolveHostAddresses(bare);
    if (records.length === 0) return null;
    return records.every((r) => isPublicIp(r.address)) ? records : null;
  } catch {
    return null;
  }
}

/* The socket layer asks this dispatcher for addresses instead of
   re-resolving DNS, which closes the rebinding window between validation
   and connect. SNI and the Host header still come from the original URL. */
function pinnedDispatcher(hostname: string, records: LookupAddress[]): Agent {
  const bare = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  const pinnedLookup: LookupFunction = (host, options, callback) => {
    if (host.toLowerCase() !== bare) {
      callback(new Error(`Connection to unpinned host refused: ${host}`), '');
      return;
    }
    if (options.all) {
      callback(null, records);
    } else {
      const first = records[0];
      callback(null, first?.address ?? '', first?.family ?? 4);
    }
  };
  /* maxResponseSize is the transport ceiling: undici refuses to hand
     over a response past it even in one oversized chunk, so readCapped's
     1.5MB truncation can never be out-bought on memory. */
  return new Agent({
    connect: { lookup: pinnedLookup },
    maxResponseSize: MAX_BYTES * 4,
  });
}

function timeoutError(): Error {
  const error = new Error('timed out');
  error.name = 'TimeoutError';
  return error;
}

function remainingMs(deadline: number): number {
  const remaining = deadline - Date.now();
  if (remaining <= 0) throw timeoutError();
  return remaining;
}

async function withinDeadline<Value>(
  work: Promise<Value>,
  deadline: number
): Promise<Value> {
  const remaining = remainingMs(deadline);
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(timeoutError()), remaining);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/* Reads at most `cap` bytes, then cancels the stream, so a huge response
   never buffers past the limit. */
async function readCapped(res: UpstreamResponse, cap: number): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return (await res.text()).slice(0, cap);
  const decoder = new TextDecoder('utf-8', { fatal: false });
  let out = '';
  let bytes = 0;
  let truncated = false;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const remaining = cap - bytes;
    const chunk =
      value.byteLength > remaining ? value.subarray(0, remaining) : value;
    bytes += chunk.byteLength;
    out += decoder.decode(chunk, { stream: true });
    if (bytes >= cap) {
      truncated = true;
      await reader.cancel().catch(() => {});
      break;
    }
  }
  /* No flush after a capped read: the cap can cut mid-character, and
     flushing turns the dangling bytes into U+FFFD, which the charset
     grade would read as broken encoding. */
  if (!truncated) out += decoder.decode();
  return out.slice(0, cap);
}

export function createSafeFetcher(maxFollowUps = 8): SafeFetcher {
  const log: FetchLogEntry[] = [];
  let followUps = 0;

  async function fetchOnce(
    url: URL,
    dispatcher: Agent,
    acceptLanguage: string,
    timeoutMs: number
  ): Promise<UpstreamResponse> {
    return undiciFetch(url, {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
        'Accept-Language': acceptLanguage,
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(timeoutMs),
      dispatcher,
    });
  }

  async function fetchPage(
    rawUrl: string,
    opts: FetchPageOptions = {}
  ): Promise<FetchedPage | null> {
    const {
      purpose = 'fetch',
      acceptLanguage = 'en-US,en;q=0.8',
      timeoutMs = 8000,
      countsAgainstBudget = true,
    } = opts;

    if (countsAgainstBudget) {
      if (followUps >= maxFollowUps) return null;
      followUps += 1;
      await new Promise((r) => setTimeout(r, 250));
    }

    const entry: FetchLogEntry = {
      url: rawUrl,
      purpose,
      status: null,
      finalUrl: null,
      ms: null,
      note: '',
    };
    log.push(entry);
    const started = Date.now();
    const deadline = started + timeoutMs;

    const fail = (note: string): FetchedPage => {
      entry.ms = Date.now() - started;
      entry.note = note;
      return {
        status: 0,
        finalUrl: rawUrl,
        contentType: '',
        body: '',
        headers: new Headers(),
        error: note,
      };
    };

    const dispatchers: Agent[] = [];
    try {
      let current = gateUrl(rawUrl);
      if (!current.ok) return fail(current.reason);

      let res: UpstreamResponse | null = null;
      for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
        const records = await withinDeadline(
          resolvePublic(current.url.hostname),
          deadline
        );
        if (!records) {
          return fail('This address is not reachable from the demo.');
        }
        const dispatcher = pinnedDispatcher(current.url.hostname, records);
        dispatchers.push(dispatcher);
        res = await withinDeadline(
          fetchOnce(
            current.url,
            dispatcher,
            acceptLanguage,
            remainingMs(deadline)
          ),
          deadline
        );
        if (res.status < 300 || res.status >= 400) break;
        const location = res.headers.get('location');
        if (!location) break;
        const next = gateUrl(new URL(location, current.url).href);
        if (!next.ok) return fail(next.reason);
        if (res.body) {
          await withinDeadline(res.body.cancel(), deadline);
        }
        current = next;
        res = null;
      }
      if (!res) return fail('Too many redirects.');

      const contentType = res.headers.get('content-type') || '';
      let body = '';
      if (!contentType || /html|xml|text/i.test(contentType)) {
        body = await withinDeadline(readCapped(res, MAX_BYTES), deadline);
      }
      const headers = new Headers();
      res.headers.forEach((value, key) => {
        headers.append(key, value);
      });
      entry.status = res.status;
      entry.finalUrl = current.url.href;
      entry.ms = Date.now() - started;
      return {
        status: res.status,
        finalUrl: current.url.href,
        contentType,
        body,
        headers,
      };
    } catch (err) {
      const isTimeout =
        err instanceof Error &&
        (err.name === 'TimeoutError' || err.name === 'AbortError');
      return fail(
        isTimeout
          ? 'timed out'
          : err instanceof Error
            ? err.message
            : 'fetch failed'
      );
    } finally {
      await Promise.all(dispatchers.map((d) => d.destroy().catch(() => {})));
    }
  }

  return {
    fetchPage,
    log,
    remaining: () => maxFollowUps - followUps,
  };
}
