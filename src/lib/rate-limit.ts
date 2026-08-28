import { isIP } from 'node:net';

import type { NextRequest } from 'next/server';

type WindowEntry = { count: number; resetAt: number };

const WINDOW_MS = 60_000;
const buckets = new Map<string, Map<string, WindowEntry>>();

/* Expands an IPv6 address to its eight 16-bit words, folding a dotted
   IPv4 tail into the last two, so every spelling of an address reduces
   to the same words. */
function ipv6Words(ip: string): number[] | null {
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
  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 2 ? missing < 1 : missing !== 0) return null;
  const words = [
    ...head.map((p) => parseInt(p, 16)),
    ...(halves.length === 2 ? Array(missing).fill(0) : []),
    ...tail.map((p) => parseInt(p, 16)),
  ] as number[];
  if (words.some((w) => Number.isNaN(w) || w < 0 || w > 0xffff)) return null;
  return words;
}

/* An IPv6 subscriber typically controls a whole /64, so keying on the full
   address would let one client mint a fresh bucket per request by rotating
   within its prefix. IPv6 keys are therefore the /64 prefix. IPv4 keeps the
   full address, as do addresses whose top 64 bits are all zero (loopback
   and embedded-IPv4 forms, where the prefix is not a subscriber allocation)
   and anything unparseable. */
function bucketKey(ip: string): string {
  if (isIP(ip) !== 6) return ip;
  const words = ipv6Words(ip);
  if (!words) return ip;
  const prefix = words.slice(0, 4);
  if (prefix.every((w) => w === 0)) return ip;
  return `${prefix.map((w) => w.toString(16)).join(':')}::/64`;
}

/* Fixed-window per-IP limiter, per server instance. Enough to stop one
   client burning the fetch and translate budgets from a loop; a fleet-wide
   limiter would need shared storage. */
export function isRateLimited(
  bucket: string,
  ip: string,
  max: number
): boolean {
  let entries = buckets.get(bucket);
  if (!entries) {
    entries = new Map();
    buckets.set(bucket, entries);
  }
  const now = Date.now();
  if (entries.size > 10_000) {
    for (const [key, entry] of entries) {
      if (now > entry.resetAt) entries.delete(key);
    }
  }
  const id = bucketKey(ip);
  const entry = entries.get(id);
  if (!entry || now > entry.resetAt) {
    entries.set(id, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

/* Only x-vercel-forwarded-for is trusted: Vercel writes it on every
   request and clients cannot. Any x-forwarded-for chain that reaches this
   code un-appended is client-chosen, so without the platform header every
   caller shares one bucket instead of minting fresh ones by rotation. */
export function getClientIp(req: NextRequest): string {
  return req.headers.get('x-vercel-forwarded-for')?.trim() || '__unknown__';
}
