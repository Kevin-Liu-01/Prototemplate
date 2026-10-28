/* The vote's private Blob store. Event-sourced: votes, likes, voters and
   device links are written once and never overwritten, so the store's
   overwrite caching can never show a stale vote. Only a logo's meta and
   file are replaced, and those are read with useCache: false. Every list()
   page is read. Write-once bodies are kept in memory for good; the logo
   registry for CACHE_MS per instance, cleared by this instance's writes. */
import { BlobNotFoundError, del, get, list, put } from '@vercel/blob';

import {
  CACHE_MS,
  isLogoKey,
  namespace,
  parseDevicePath,
  parseLikesPath,
  parseLogoPath,
  parseMarkerPath,
  parseVotePath,
  pathnames,
} from './config';

import type { LogoExt } from './config';

/* the SDK retries a failed call 10 times with doubling waits by default; two is enough here */
process.env.VERCEL_BLOB_RETRIES ??= '2';

export type MarkKind = 'svg' | 'png';

export type LogoRecord = {
  key: string;
  name: string;
  addedAt: string;
  order: number;
  hidden: boolean;
  kind: MarkKind;
  /** the mark file's pathname */
  file: string;
  /** the mark file's upload time in ms: the version in its URL */
  version: number;
};

export type VoterRecord = { voterId: string; email: string; domain: string; createdAt: string };
export type VoteRecord = { voterId: string; ts: number; winner: string; loser: string; pathname: string };
export type VoteBody = {
  winner: string;
  loser: string;
  left: string;
  right: string;
  ts: number;
  voterId: string;
  deviceId: string;
};
export type LikesRecord = { liked: string[]; seen: string[]; ts: number };

type Listed = { pathname: string; uploadedAt: Date };

const CONTENT_TYPES: Record<MarkKind, string> = { svg: 'image/svg+xml', png: 'image/png' };

function token(): string {
  const value = process.env.BLOB_READ_WRITE_TOKEN;
  if (!value) throw new Error('BLOB_READ_WRITE_TOKEN is not set.');
  return value;
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isMissing(error: unknown): boolean {
  return error instanceof BlobNotFoundError || /requested blob does not exist/i.test(message(error));
}

async function listAll(prefix: string): Promise<Listed[]> {
  const out: Listed[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ token: token(), prefix, limit: 1000, ...(cursor ? { cursor } : {}) });
    for (const blob of page.blobs) out.push({ pathname: blob.pathname, uploadedAt: new Date(blob.uploadedAt) });
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return out;
}

async function readText(pathname: string, fresh: boolean): Promise<string | null> {
  try {
    const result = await get(pathname, { access: 'private', token: token(), useCache: !fresh });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    return await new Response(result.stream).text();
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
}

/* write-once bodies, kept for the life of the instance */
const bodies = new Map<string, unknown>();

async function readOnce<T>(pathname: string, parse: (raw: unknown) => T | null): Promise<T | null> {
  if (bodies.has(pathname)) return bodies.get(pathname) as T;
  /* a miss is read again past the cache, in case the cache kept a miss from before the write */
  const text = (await readText(pathname, false)) ?? (await readText(pathname, true));
  if (text === null) return null;
  let value: T | null = null;
  try {
    value = parse(JSON.parse(text));
  } catch {
    value = null;
  }
  if (value !== null) {
    if (bodies.size > 50_000) bodies.clear();
    bodies.set(pathname, value);
  }
  return value;
}

/** Writes a pathname that must never change; false when it already exists. */
async function putOnce(pathname: string, body: string | Buffer, contentType: string): Promise<boolean> {
  try {
    await put(pathname, body, { access: 'private', token: token(), addRandomSuffix: false, allowOverwrite: false, contentType });
    return true;
  } catch (error) {
    if (/already exists/i.test(message(error))) return false;
    throw error;
  }
}

async function putReplace(pathname: string, body: string | Buffer, contentType: string): Promise<void> {
  await put(pathname, body, { access: 'private', token: token(), addRandomSuffix: false, allowOverwrite: true, contentType });
}

/* an empty marker; the SDK refuses an empty string body, so it is an empty buffer */
async function putMarker(pathname: string): Promise<void> {
  await putOnce(pathname, Buffer.alloc(0), 'application/octet-stream');
}

async function remove(pathnames: string[]): Promise<void> {
  if (pathnames.length) await del(pathnames, { token: token() });
}

export async function mapLimit<T, R>(items: readonly T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next;
      next += 1;
      out[i] = await fn(items[i] as T);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

function stringList(raw: unknown): string[] | null {
  return Array.isArray(raw) && raw.every((item) => typeof item === 'string') ? raw : null;
}

/* ------------------------------------------------------------------ */
/* logos                                                               */

type Meta = { name: string; addedAt: string; order: number };
type Registry = { logos: LogoRecord[]; byKey: Map<string, LogoRecord> };

let registryCache: { at: number; ns: string; value: Registry } | null = null;

/** Drops this instance's logo registry, so the next read lists the store again. */
export function invalidate(): void {
  registryCache = null;
}

async function readMeta(key: string): Promise<Meta | null> {
  const text = await readText(pathnames.logo(namespace(), key, 'json'), true);
  if (text === null) return null;
  try {
    const raw = JSON.parse(text) as Partial<Meta> | null;
    return {
      name: typeof raw?.name === 'string' && raw.name ? raw.name : key,
      addedAt: typeof raw?.addedAt === 'string' ? raw.addedAt : new Date(0).toISOString(),
      order: typeof raw?.order === 'number' && Number.isFinite(raw.order) ? raw.order : 0,
    };
  } catch {
    return null;
  }
}

/** Every logo with a mark file, hidden ones included, by order, then age, then key. */
export async function registry(fresh = false): Promise<Registry> {
  const ns = namespace();
  if (!fresh && registryCache && registryCache.ns === ns && Date.now() - registryCache.at < CACHE_MS) {
    return registryCache.value;
  }
  const [files, hidden] = await Promise.all([listAll(pathnames.logos(ns)), listAll(pathnames.hidden(ns))]);
  const metas = new Set<string>();
  const marks = new Map<string, { file: Listed; kind: MarkKind }>();
  for (const file of files) {
    const parsed = parseLogoPath(ns, file.pathname);
    if (!parsed) continue;
    if (parsed.ext === 'json') metas.add(parsed.key);
    else {
      const prev = marks.get(parsed.key);
      if (!prev || file.uploadedAt > prev.file.uploadedAt) marks.set(parsed.key, { file, kind: parsed.ext });
    }
  }
  const hiddenKeys = new Set(hidden.map((h) => parseMarkerPath(ns, h.pathname, 'hidden')).filter(isLogoKey));
  const logos = await mapLimit([...marks], 8, async ([key, mark]): Promise<LogoRecord> => {
    const meta = metas.has(key) ? await readMeta(key) : null;
    return {
      key,
      name: meta?.name ?? key,
      addedAt: meta?.addedAt ?? mark.file.uploadedAt.toISOString(),
      order: meta?.order ?? 0,
      hidden: hiddenKeys.has(key),
      kind: mark.kind,
      file: mark.file.pathname,
      version: mark.file.uploadedAt.getTime(),
    };
  });
  logos.sort((a, b) => a.order - b.order || a.addedAt.localeCompare(b.addedAt) || a.key.localeCompare(b.key));
  const value = { logos, byKey: new Map(logos.map((logo) => [logo.key, logo])) };
  registryCache = { at: Date.now(), ns, value };
  return value;
}

/** Writes a mark file (a re-upload replaces it, so its version changes) and its meta. */
export async function saveLogo(input: { key: string; name: string; order?: number; kind: MarkKind; bytes: Buffer }): Promise<void> {
  const ns = namespace();
  const current = (await registry(true)).byKey.get(input.key);
  const meta = current ? await readMeta(input.key) : null;
  const order = input.order ?? meta?.order ?? Math.max(0, ...(await registry()).logos.map((logo) => logo.order + 1));
  await putReplace(pathnames.logo(ns, input.key, input.kind), input.bytes, CONTENT_TYPES[input.kind]);
  const other: LogoExt = input.kind === 'svg' ? 'png' : 'svg';
  if (current && current.kind === other) await remove([pathnames.logo(ns, input.key, other)]);
  const next: Meta = { name: input.name, addedAt: meta?.addedAt ?? new Date().toISOString(), order };
  await putReplace(pathnames.logo(ns, input.key, 'json'), JSON.stringify({ key: input.key, ...next }), 'application/json');
  invalidate();
}

/** Renames or reorders a logo; false when the key has no mark. */
export async function updateLogoMeta(key: string, change: { name?: string; order?: number }): Promise<boolean> {
  const current = (await registry(true)).byKey.get(key);
  if (!current) return false;
  const meta = (await readMeta(key)) ?? { name: current.name, addedAt: current.addedAt, order: current.order };
  const next: Meta = { name: change.name ?? meta.name, addedAt: meta.addedAt, order: change.order ?? meta.order };
  await putReplace(pathnames.logo(namespace(), key, 'json'), JSON.stringify({ key, ...next }), 'application/json');
  invalidate();
  return true;
}

export async function setHidden(key: string, hidden: boolean): Promise<void> {
  const pathname = pathnames.hidden(namespace(), key);
  if (hidden) await putMarker(pathname);
  else await remove([pathname]);
  invalidate();
}

/** The mark file's bytes as a stream, read past the cache so a re-upload shows at once. */
export async function openMark(file: string): Promise<{ stream: ReadableStream<Uint8Array>; contentType: string } | null> {
  const ns = namespace();
  if (!parseLogoPath(ns, file) || file.endsWith('.json')) return null;
  try {
    const result = await get(file, { access: 'private', token: token(), useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    return { stream: result.stream, contentType: file.endsWith('.png') ? CONTENT_TYPES.png : CONTENT_TYPES.svg };
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/* voters and devices                                                  */

function parseVoter(raw: unknown): VoterRecord | null {
  const v = raw as Partial<VoterRecord> | null;
  if (!v || typeof v.voterId !== 'string' || typeof v.email !== 'string' || typeof v.domain !== 'string') return null;
  return { voterId: v.voterId, email: v.email, domain: v.domain, createdAt: typeof v.createdAt === 'string' ? v.createdAt : '' };
}

export async function getVoter(voterId: string): Promise<VoterRecord | null> {
  return readOnce(pathnames.voter(namespace(), voterId), parseVoter);
}

/** Writes the voter once; an existing record stands. */
export async function ensureVoter(record: VoterRecord): Promise<void> {
  const pathname = pathnames.voter(namespace(), record.voterId);
  if (bodies.has(pathname)) return;
  if (await putOnce(pathname, JSON.stringify(record), 'application/json')) bodies.set(pathname, record);
}

export async function allVoters(): Promise<VoterRecord[]> {
  const ns = namespace();
  const ids = (await listAll(pathnames.voters(ns)))
    .map((blob) => parseMarkerPath(ns, blob.pathname, 'voters'))
    .filter((id): id is string => id !== null);
  const voters = await mapLimit(ids, 16, (id) => getVoter(id));
  return voters.filter((voter): voter is VoterRecord => voter !== null);
}

export async function linkDevice(deviceId: string, voterId: string): Promise<void> {
  await putMarker(pathnames.device(namespace(), deviceId, voterId));
}

export async function deviceLinks(): Promise<{ deviceId: string; voterId: string }[]> {
  const ns = namespace();
  return (await listAll(pathnames.devices(ns)))
    .map((blob) => parseDevicePath(ns, blob.pathname))
    .filter((link): link is { deviceId: string; voterId: string } => link !== null);
}

export async function excludedVoters(): Promise<Set<string>> {
  const ns = namespace();
  return new Set(
    (await listAll(pathnames.excluded(ns)))
      .map((blob) => parseMarkerPath(ns, blob.pathname, 'excluded'))
      .filter((id): id is string => id !== null)
  );
}

export async function setExcluded(voterId: string, excluded: boolean): Promise<void> {
  const pathname = pathnames.excluded(namespace(), voterId);
  if (excluded) await putMarker(pathname);
  else await remove([pathname]);
}

/* ------------------------------------------------------------------ */
/* votes and likes                                                     */

async function listVotes(prefix: string): Promise<VoteRecord[]> {
  const ns = namespace();
  const out: VoteRecord[] = [];
  for (const blob of await listAll(prefix)) {
    const vote = parseVotePath(ns, blob.pathname);
    if (vote) out.push({ ...vote, pathname: blob.pathname });
  }
  return out;
}

export function voterVotes(voterId: string): Promise<VoteRecord[]> {
  return listVotes(pathnames.votes(namespace(), voterId));
}

export function allVotes(): Promise<VoteRecord[]> {
  return listVotes(pathnames.votes(namespace()));
}

/** Writes one vote under a new pathname; a vote never overwrites another. */
export async function writeVote(vote: Omit<VoteBody, 'ts'>): Promise<void> {
  const ns = namespace();
  const ts = Date.now();
  const body: VoteBody = { ...vote, ts };
  /* the same pathname within one millisecond is the same vote sent twice */
  await putOnce(pathnames.vote(ns, vote.voterId, ts, vote.winner, vote.loser), JSON.stringify(body), 'application/json');
}

function parseVoteBody(raw: unknown): VoteBody | null {
  const v = raw as Partial<VoteBody> | null;
  if (!v || !isLogoKey(v.winner) || !isLogoKey(v.loser) || typeof v.ts !== 'number') return null;
  return {
    winner: v.winner,
    loser: v.loser,
    left: isLogoKey(v.left) ? v.left : v.winner,
    right: isLogoKey(v.right) ? v.right : v.loser,
    ts: v.ts,
    voterId: typeof v.voterId === 'string' ? v.voterId : '',
    deviceId: typeof v.deviceId === 'string' ? v.deviceId : '',
  };
}

export function voteBody(pathname: string): Promise<VoteBody | null> {
  return readOnce(pathname, parseVoteBody);
}

function parseLikes(raw: unknown): LikesRecord | null {
  const v = raw as { liked?: unknown; seen?: unknown; ts?: unknown } | null;
  const liked = stringList(v?.liked);
  const seen = stringList(v?.seen);
  if (!liked || !seen || typeof v?.ts !== 'number') return null;
  return { liked: liked.filter(isLogoKey), seen: seen.filter(isLogoKey), ts: v.ts };
}

/** The newest likes record per voter, read from the pathnames' times. */
async function latestFrom(prefix: string): Promise<Map<string, LikesRecord>> {
  const ns = namespace();
  const newest = new Map<string, { ts: number; pathname: string }>();
  for (const blob of await listAll(prefix)) {
    const parsed = parseLikesPath(ns, blob.pathname);
    if (!parsed) continue;
    const prev = newest.get(parsed.voterId);
    if (!prev || parsed.ts > prev.ts) newest.set(parsed.voterId, { ts: parsed.ts, pathname: blob.pathname });
  }
  const entries = await mapLimit([...newest], 16, async ([voterId, { pathname }]) => [voterId, await readOnce(pathname, parseLikes)] as const);
  const out = new Map<string, LikesRecord>();
  for (const [voterId, likes] of entries) if (likes) out.set(voterId, likes);
  return out;
}

export async function latestLikes(voterId: string): Promise<LikesRecord | null> {
  return (await latestFrom(pathnames.likes(namespace(), voterId))).get(voterId) ?? null;
}

export function allLatestLikes(): Promise<Map<string, LikesRecord>> {
  return latestFrom(pathnames.likes(namespace()));
}

/** Writes a new likes record; the newest per voter wins, so none is overwritten. */
export async function writeLikes(voterId: string, liked: string[], seen: string[]): Promise<void> {
  const ns = namespace();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const ts = Date.now() + attempt;
    if (await putOnce(pathnames.like(ns, voterId, ts), JSON.stringify({ liked, seen, ts }), 'application/json')) return;
  }
  throw new Error('Could not write the likes record.');
}
