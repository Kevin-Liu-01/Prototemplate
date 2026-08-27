import { lookup } from 'node:dns/promises';
import type { LookupAddress } from 'node:dns';
import { isIP } from 'node:net';
import type { LookupFunction } from 'node:net';
import { Agent, fetch as undiciFetch } from 'undici';

const UA = 'GT-Localization-Report-Card/0.1 (+https://generaltranslation.com)';
const MAX_BYTES = 1_500_000;
const MAX_REDIRECTS = 5;

type UpstreamResponse = Awaited<ReturnType<typeof undiciFetch>>;

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

type FetchPageOptions = {
  purpose?: string;
  acceptLanguage?: string;
  timeoutMs?: number;
  countsAgainstBudget?: boolean;
};

/* Every address class that must never be reachable from this server:
   loopback, RFC1918, link-local, site-local, CGN, benchmarking,
   documentation, multicast, reserved, and the IPv6 transport prefixes
   that embed an IPv4 address (mapped, compatible, NAT64, Teredo, 6to4). */
function isPublicIpv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return false;
  const a = parts[0] ?? -1;
  const b = parts[1] ?? -1;
  const c = parts[2] ?? -1;
  if (a === 0 || a === 10 || a === 127) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return false;
  if (a === 192 && b === 168) return false;
  if (a === 198 && (b === 18 || b === 19)) return false;
  if (a === 198 && b === 51 && c === 100) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  if (a >= 224) return false;
  return true;
}

/* Expands an IPv6 address to its eight 16-bit words, folding a dotted
   IPv4 tail into the last two, so every spelling of an address reduces
   to the same words before classification. */
function parseIpv6Words(ip: string): number[] | null {
  let s = ip;
  const dotted = /^(.*:)(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(s);
  if (dotted) {
    const quads = dotted.slice(2, 6).map(Number);
    if (quads.some((q) => q > 255)) return null;
    const hi = ((quads[0] ?? 0) << 8) | (quads[1] ?? 0);
    const lo = ((quads[2] ?? 0) << 8) | (quads[3] ?? 0);
    s = `${dotted[1] ?? ''}${hi.toString(16)}:${lo.toString(16)}`;
  }
  const halves = s.split('::');
  if (halves.length > 2) return null;
  const headParts = halves[0] ? halves[0].split(':') : [];
  const tailParts =
    halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const missing = 8 - headParts.length - tailParts.length;
  if (halves.length === 2 ? missing < 1 : missing !== 0) return null;
  const words = [
    ...headParts.map((p) => parseInt(p, 16)),
    ...(halves.length === 2 ? Array(missing).fill(0) : []),
    ...tailParts.map((p) => parseInt(p, 16)),
  ] as number[];
  if (words.some((w) => Number.isNaN(w) || w < 0 || w > 0xffff)) return null;
  return words;
}

function isPublicIpv6(ip: string): boolean {
  const words = parseIpv6Words(ip);
  if (!words) return false;
  const w0 = words[0] ?? 0;
  const w1 = words[1] ?? 0;
  const w2 = words[2] ?? 0;
  const w4 = words[4] ?? 0;
  const w5 = words[5] ?? 0;
  const w6 = words[6] ?? 0;
  const w7 = words[7] ?? 0;
  const zeroTo4 = words.slice(0, 5).every((w) => w === 0);
  const embeddedV4 = `${w6 >> 8}.${w6 & 0xff}.${w7 >> 8}.${w7 & 0xff}`;
  if (zeroTo4 && w5 === 0) {
    if (w6 === 0 && w7 <= 1) return false;
    return isPublicIpv4(embeddedV4);
  }
  if (zeroTo4 && w5 === 0xffff) return isPublicIpv4(embeddedV4);
  const zeroTo3 = words.slice(0, 4).every((w) => w === 0);
  if (zeroTo3 && w4 === 0xffff && w5 === 0) {
    return isPublicIpv4(embeddedV4);
  }
  if (w0 === 0x64 && w1 === 0xff9b) return false;
  if ((w0 & 0xfe00) === 0xfc00) return false;
  if ((w0 & 0xffc0) === 0xfe80) return false;
  if ((w0 & 0xffc0) === 0xfec0) return false;
  if ((w0 & 0xff00) === 0xff00) return false;
  if (w0 === 0x2001 && w1 === 0x0db8) return false;
  if (w0 === 0x2001 && w1 === 0) return false;
  if (w0 === 0x2002) {
    return isPublicIpv4(`${w1 >> 8}.${w1 & 0xff}.${w2 >> 8}.${w2 & 0xff}`);
  }
  return true;
}

export function isPublicIp(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) return isPublicIpv4(ip);
  if (family !== 6) return false;
  return isPublicIpv6(ip);
}

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

export function gateUserInput(raw: string): UrlGateResult {
  if (!raw) return { ok: false, reason: 'Enter a URL first.' };
  return gateUrl(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
}

/* Resolves the hostname once and validates every returned address. The same
   records are then pinned into the connection, so what was validated is
   what gets dialed. */
async function resolvePublic(
  hostname: string
): Promise<LookupAddress[] | null> {
  const bare = hostname.replace(/^\[|\]$/g, '');
  const family = isIP(bare);
  if (family) return isPublicIp(bare) ? [{ address: bare, family }] : null;
  try {
    const records = await lookup(bare, { all: true, verbatim: true });
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
  return new Agent({ connect: { lookup: pinnedLookup } });
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

export type SafeFetcher = {
  fetchPage: (
    url: string,
    opts?: FetchPageOptions
  ) => Promise<FetchedPage | null>;
  log: FetchLogEntry[];
  remaining: () => number;
};

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
