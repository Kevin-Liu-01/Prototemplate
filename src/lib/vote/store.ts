/* The vote's private Blob store. Event-sourced: votes, likes, voters and
   device links are written once and never overwritten, so the store's
   overwrite caching can never show a stale vote. Only a decision's meta,
   an option's meta and an option's file are replaced, and those are read
   with useCache: false. Every list() page is read. Write-once bodies are
   kept in memory for good; the decision list, each decision's options and
   each signed-in voter's record for CACHE_MS per instance, cleared by this
   instance's writes. Each of those is one read in flight, so a burst of
   requests on a cold instance shares one list.

   Layout under the namespace N: voters/, devices/ and excluded/ are global;
   decisions/<id>/ holds meta.json, options/<key>.json and its file,
   hidden/<key>, votes/<voterId>/<ts>_<winner>_<loser>.json (a changed
   vote is a new one: the latest per pair counts), the claim a change puts
   on the vote it replaces at changes/<voterId>/<ts>_<winner>_<loser>, and
   likes/<voterId>/<ts>.json. */
import { BlobNotFoundError, del, get, list, put } from '@vercel/blob';

import {
  CACHE_MS,
  FILE_EXTS,
  isOptionKey,
  namespace,
  parseDecisionFolder,
  parseDevicePath,
  parseHiddenPath,
  parseLikesPath,
  parseMarkerPath,
  parseOptionPath,
  parseVotePath,
  pathnames,
} from './config';
import { isDecisionId, parseDecisionMeta, sortDecisions } from './decisions';

import type { FileExt } from './config';
import type { DecisionMeta } from './types';

/* the SDK retries a failed call 10 times with doubling waits by default; two is enough here */
process.env.VERCEL_BLOB_RETRIES ??= '2';

export type OptionRecord = {
  key: string;
  name: string;
  /** a text option's words; empty otherwise */
  text: string;
  addedAt: string;
  order: number;
  hidden: boolean;
  /** the file's pathname; null for a text option, or a file option whose file is missing */
  file: string | null;
  ext: FileExt | null;
  /** the file's upload time in ms: the version in its URL */
  version: number;
};

export type Registry = { options: OptionRecord[]; byKey: Map<string, OptionRecord> };

export type VoterRecord = { voterId: string; email: string; domain: string; createdAt: string };
export type VoteRecord = { voterId: string; ts: number; winner: string; loser: string; pathname: string };
export type VoteBody = {
  decision: string;
  winner: string;
  loser: string;
  left: string;
  right: string;
  ts: number;
  voterId: string;
  deviceId: string;
};
export type LikesRecord = { liked: string[]; seen: string[]; ts: number };
/** A voter's latest likes record, with how many records they have written in the decision. */
export type LatestLikes = LikesRecord & { records: number };

type Listed = { pathname: string; uploadedAt: Date };

export const CONTENT_TYPES: Record<FileExt, string> = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
};

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

/* the folders directly under a prefix, every page read */
async function listFolders(prefix: string): Promise<string[]> {
  const out: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ token: token(), prefix, mode: 'folded', limit: 1000, ...(cursor ? { cursor } : {}) });
    out.push(...page.folders);
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

async function readJson(pathname: string): Promise<unknown> {
  const text = await readText(pathname, true);
  if (text === null) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
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
/* caches                                                              */

/* a read kept from the moment it starts, so callers that arrive while it runs share it */
type Kept<T> = { at: number; value: Promise<T> };

/* starts a read and keeps it under `slot`; a read that fails, or whose value `keepIf` refuses, is dropped, so the next caller reads again */
function keep<T>(cache: Map<string, Kept<T>>, slot: string, read: () => Promise<T>, keepIf: (value: T) => boolean = () => true): Promise<T> {
  const entry: Kept<T> = { at: Date.now(), value: read() };
  cache.set(slot, entry);
  const drop = () => {
    if (cache.get(slot) === entry) cache.delete(slot);
  };
  entry.value.then((value) => {
    if (!keepIf(value)) drop();
  }, drop);
  return entry.value;
}

function kept<T>(cache: Map<string, Kept<T>>, slot: string, ms: number): Promise<T> | null {
  const entry = cache.get(slot);
  return entry && Date.now() - entry.at < ms ? entry.value : null;
}

/* by namespace */
const decisionsCache = new Map<string, Kept<DecisionMeta[]>>();
/* by namespace and decision id */
const registryCache = new Map<string, Kept<Registry>>();
/* by voter pathname */
const voterCache = new Map<string, Kept<VoterRecord | null>>();
/* the list is read again for an id it lacks at most this often, so a stream of unknown ids costs one list */
const RELIST_MS = 5_000;

/** Drops this instance's copy of the decision list and of one decision's options (every decision's without an id). */
export function invalidate(decisionId?: string): void {
  decisionsCache.clear();
  if (decisionId === undefined) registryCache.clear();
  else registryCache.delete(`${namespace()}:${decisionId}`);
}

/* ------------------------------------------------------------------ */
/* decisions                                                           */

async function readDecision(id: string): Promise<DecisionMeta | null> {
  return parseDecisionMeta(await readJson(pathnames.meta(namespace(), id)), id);
}

/** Every decision with a readable meta.json, any status, by order, then age, then id. */
export function decisions(fresh = false): Promise<DecisionMeta[]> {
  const ns = namespace();
  return (
    (!fresh && kept(decisionsCache, ns, CACHE_MS)) ||
    keep(decisionsCache, ns, async () => {
      const ids = (await listFolders(pathnames.decisions(ns)))
        .map((folder) => parseDecisionFolder(ns, folder))
        .filter((id): id is string => id !== null && isDecisionId(id));
      const metas = await mapLimit(ids, 8, readDecision);
      return sortDecisions(metas.filter((meta): meta is DecisionMeta => meta !== null));
    })
  );
}

/**
 * One decision's meta. From this instance's list; an id the list lacks
 * lists the decisions again past the cache, at most once per RELIST_MS, so
 * a decision another instance just created opens within seconds. A fresh
 * read (the admin's) reads its meta.json directly.
 */
export async function decision(id: string, fresh = false): Promise<DecisionMeta | null> {
  if (!isDecisionId(id)) return null;
  if (fresh) return readDecision(id);
  const listed = (await decisions()).find((meta) => meta.id === id);
  if (listed) return listed;
  if (kept(decisionsCache, namespace(), RELIST_MS)) return null;
  return (await decisions(true)).find((meta) => meta.id === id) ?? null;
}

/** Writes a new decision's meta; false when the id is taken. */
export async function createDecision(meta: DecisionMeta): Promise<boolean> {
  const made = await putOnce(pathnames.meta(namespace(), meta.id), JSON.stringify(meta), 'application/json');
  invalidate(meta.id);
  return made;
}

/** Replaces a decision's meta. */
export async function writeDecision(meta: DecisionMeta): Promise<void> {
  await putReplace(pathnames.meta(namespace(), meta.id), JSON.stringify(meta), 'application/json');
  invalidate(meta.id);
}

/* ------------------------------------------------------------------ */
/* options                                                             */

type OptionMeta = { name: string; text: string; addedAt: string; order: number };

async function readOptionMeta(id: string, key: string): Promise<OptionMeta | null> {
  const raw = (await readJson(pathnames.option(namespace(), id, key, 'json'))) as Partial<OptionMeta> | null;
  if (!raw || typeof raw !== 'object') return null;
  return {
    name: typeof raw.name === 'string' && raw.name ? raw.name : key,
    text: typeof raw.text === 'string' ? raw.text : '',
    addedAt: typeof raw.addedAt === 'string' ? raw.addedAt : new Date(0).toISOString(),
    order: typeof raw.order === 'number' && Number.isFinite(raw.order) ? raw.order : 0,
  };
}

function writeOptionMeta(id: string, key: string, meta: OptionMeta): Promise<void> {
  return putReplace(pathnames.option(namespace(), id, key, 'json'), JSON.stringify({ key, ...meta }), 'application/json');
}

/**
 * Every option of a decision that has a meta or a file, hidden ones
 * included, by order, then age, then key. A key with files of two types
 * takes the newest.
 */
export function registry(id: string, fresh = false): Promise<Registry> {
  const slot = `${namespace()}:${id}`;
  return (!fresh && kept(registryCache, slot, CACHE_MS)) || keep(registryCache, slot, () => readRegistry(id));
}

async function readRegistry(id: string): Promise<Registry> {
  const ns = namespace();
  const [listed, hidden] = await Promise.all([listAll(pathnames.options(ns, id)), listAll(pathnames.hidden(ns, id))]);
  const metas = new Set<string>();
  const files = new Map<string, { file: Listed; ext: FileExt }>();
  const firstSeen = new Map<string, Date>();
  for (const blob of listed) {
    const parsed = parseOptionPath(ns, id, blob.pathname);
    if (!parsed) continue;
    const seen = firstSeen.get(parsed.key);
    if (!seen || blob.uploadedAt < seen) firstSeen.set(parsed.key, blob.uploadedAt);
    if (parsed.ext === 'json') metas.add(parsed.key);
    else {
      const prev = files.get(parsed.key);
      if (!prev || blob.uploadedAt > prev.file.uploadedAt) files.set(parsed.key, { file: blob, ext: parsed.ext });
    }
  }
  const hiddenKeys = new Set(hidden.map((h) => parseHiddenPath(ns, id, h.pathname)).filter(isOptionKey));
  const options = await mapLimit([...firstSeen.keys()], 8, async (key): Promise<OptionRecord> => {
    const meta = metas.has(key) ? await readOptionMeta(id, key) : null;
    const file = files.get(key);
    return {
      key,
      name: meta?.name ?? key,
      text: meta?.text ?? '',
      addedAt: meta?.addedAt ?? (firstSeen.get(key) ?? new Date(0)).toISOString(),
      order: meta?.order ?? 0,
      hidden: hiddenKeys.has(key),
      file: file?.file.pathname ?? null,
      ext: file?.ext ?? null,
      version: file?.file.uploadedAt.getTime() ?? 0,
    };
  });
  options.sort((a, b) => a.order - b.order || a.addedAt.localeCompare(b.addedAt) || a.key.localeCompare(b.key));
  return { options, byKey: new Map(options.map((option) => [option.key, option])) };
}

/** A decision's options, listed again past the cache only when this instance has not listed them within `ms`. */
export function registryWithin(id: string, ms: number): Promise<Registry> {
  return registry(id, !kept(registryCache, `${namespace()}:${id}`, ms));
}

/* every file of one key, whatever its type */
async function filesOf(id: string, key: string): Promise<string[]> {
  const ns = namespace();
  return (await listAll(`${pathnames.options(ns, id)}${key}.`))
    .map((blob) => blob.pathname)
    .filter((pathname) => {
      const parsed = parseOptionPath(ns, id, pathname);
      return parsed !== null && parsed.key === key && parsed.ext !== 'json';
    });
}

/**
 * Adds an option under a key no option holds: the meta is written first
 * and never over another, so two adds of one key cannot overwrite each
 * other; false when the key is taken. A file that fails to write takes its
 * meta with it.
 */
export async function addOption(
  id: string,
  input: { key: string; name: string; text: string; order: number; file?: { ext: FileExt; bytes: Buffer } }
): Promise<boolean> {
  const ns = namespace();
  const meta: OptionMeta = { name: input.name, text: input.text, addedAt: new Date().toISOString(), order: input.order };
  const claimed = await putOnce(pathnames.option(ns, id, input.key, 'json'), JSON.stringify({ key: input.key, ...meta }), 'application/json');
  if (!claimed) return false;
  if (input.file) {
    try {
      await putReplace(pathnames.option(ns, id, input.key, input.file.ext), input.file.bytes, CONTENT_TYPES[input.file.ext]);
    } catch (error) {
      await remove([pathnames.option(ns, id, input.key, 'json')]).catch(() => undefined);
      throw error;
    }
  }
  invalidate(id);
  return true;
}

/** Replaces an option's file (its version changes, so every cached copy of the old one is passed over) and drops its files of other types. */
export async function replaceOptionFile(id: string, key: string, file: { ext: FileExt; bytes: Buffer }): Promise<void> {
  const ns = namespace();
  const target = pathnames.option(ns, id, key, file.ext);
  await putReplace(target, file.bytes, CONTENT_TYPES[file.ext]);
  await remove((await filesOf(id, key)).filter((pathname) => pathname !== target));
  invalidate(id);
}

/** Renames, rewords or reorders an option; false when the key has no option. */
export async function updateOption(id: string, key: string, change: { name?: string; text?: string; order?: number }): Promise<boolean> {
  const current = (await registry(id, true)).byKey.get(key);
  if (!current) return false;
  const meta = (await readOptionMeta(id, key)) ?? { name: current.name, text: current.text, addedAt: current.addedAt, order: current.order };
  await writeOptionMeta(id, key, {
    name: change.name ?? meta.name,
    text: change.text ?? meta.text,
    addedAt: meta.addedAt,
    order: change.order ?? meta.order,
  });
  invalidate(id);
  return true;
}

/** Hides an option from voting and results, or shows it again; its votes stay either way. */
export async function setHidden(id: string, key: string, hidden: boolean): Promise<void> {
  const pathname = pathnames.hidden(namespace(), id, key);
  if (hidden) await putMarker(pathname);
  else await remove([pathname]);
  invalidate(id);
}

/** An option file's bytes as a stream, read past the cache so a replaced file shows at once. */
export async function openFile(id: string, file: string): Promise<{ stream: ReadableStream<Uint8Array>; contentType: string } | null> {
  const parsed = parseOptionPath(namespace(), id, file);
  if (!parsed || parsed.ext === 'json' || !FILE_EXTS.includes(parsed.ext)) return null;
  try {
    const result = await get(file, { access: 'private', token: token(), useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    return { stream: result.stream, contentType: CONTENT_TYPES[parsed.ext] };
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/* voters and devices (global)                                         */

function parseVoter(raw: unknown): VoterRecord | null {
  const v = raw as Partial<VoterRecord> | null;
  if (!v || typeof v.voterId !== 'string' || typeof v.email !== 'string' || typeof v.domain !== 'string') return null;
  return { voterId: v.voterId, email: v.email, domain: v.domain, createdAt: typeof v.createdAt === 'string' ? v.createdAt : '' };
}

/**
 * A signed-in voter's record, read past the cache at most every CACHE_MS
 * per instance, so a record deleted from the store ends that voter's
 * session within CACHE_MS. A missing record is not kept: the next request
 * reads again, so a voter who signs in again is found at once.
 */
export function getVoter(voterId: string): Promise<VoterRecord | null> {
  const pathname = pathnames.voter(namespace(), voterId);
  return (
    kept(voterCache, pathname, CACHE_MS) ||
    keep(voterCache, pathname, async () => parseVoter(await readJson(pathname)), (voter) => voter !== null)
  );
}

/** Writes the voter's record unless the store holds one; an existing record stands. Every sign-in asks the store, never this instance's copy. */
export async function ensureVoter(record: VoterRecord): Promise<void> {
  const pathname = pathnames.voter(namespace(), record.voterId);
  const written = await putOnce(pathname, JSON.stringify(record), 'application/json');
  voterCache.delete(pathname);
  if (written) keep(voterCache, pathname, async () => record);
}

export async function allVoters(): Promise<VoterRecord[]> {
  const ns = namespace();
  const ids = (await listAll(pathnames.voters(ns)))
    .map((blob) => parseMarkerPath(ns, blob.pathname, 'voters'))
    .filter((id): id is string => id !== null);
  /* the list names the voters that exist, so each record is read once for the life of the instance */
  const voters = await mapLimit(ids, 16, (id) => readOnce(pathnames.voter(ns, id), parseVoter));
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
/* votes and likes (per decision)                                      */

async function listVotes(id: string, prefix: string): Promise<VoteRecord[]> {
  const ns = namespace();
  const out: VoteRecord[] = [];
  for (const blob of await listAll(prefix)) {
    const vote = parseVotePath(ns, id, blob.pathname);
    if (vote) out.push({ ...vote, pathname: blob.pathname });
  }
  return out;
}

export function voterVotes(id: string, voterId: string): Promise<VoteRecord[]> {
  return listVotes(id, pathnames.votes(namespace(), id, voterId));
}

export function allVotes(id: string): Promise<VoteRecord[]> {
  return listVotes(id, pathnames.votes(namespace(), id));
}

/**
 * Writes one vote under a new pathname and answers its time; a vote never
 * overwrites another. A change passes the time of the vote it replaces and
 * is written after it, so it is the latest even within one millisecond.
 */
export async function writeVote(vote: Omit<VoteBody, 'ts'>, after = 0): Promise<number> {
  const ts = Math.max(Date.now(), after + 1);
  const body: VoteBody = { ...vote, ts };
  /* the same pathname within one millisecond is the same vote sent twice */
  await putOnce(
    pathnames.vote(namespace(), vote.decision, vote.voterId, ts, vote.winner, vote.loser),
    JSON.stringify(body),
    'application/json'
  );
  return ts;
}

type Claimed = Pick<VoteRecord, 'ts' | 'winner' | 'loser'>;

function changePath(id: string, voterId: string, vote: Claimed): string {
  return pathnames.change(namespace(), id, voterId, vote.ts, vote.winner, vote.loser);
}

/**
 * Claims a counted vote for the change that replaces it; false when another
 * change claimed it first. Changes sent at once read the same counted vote,
 * so only one of them writes, and a pair never passes MAX_CASTS.
 */
export function claimChange(id: string, voterId: string, vote: Claimed): Promise<boolean> {
  return putOnce(changePath(id, voterId, vote), Buffer.alloc(0), 'application/octet-stream');
}

/** Gives a claim back when its change was not written, so the vote can still be changed. */
export function releaseChange(id: string, voterId: string, vote: Claimed): Promise<void> {
  return remove([changePath(id, voterId, vote)]);
}

function parseVoteBody(raw: unknown): VoteBody | null {
  const v = raw as Partial<VoteBody> | null;
  if (!v || !isOptionKey(v.winner) || !isOptionKey(v.loser) || typeof v.ts !== 'number') return null;
  return {
    decision: typeof v.decision === 'string' ? v.decision : '',
    winner: v.winner,
    loser: v.loser,
    left: isOptionKey(v.left) ? v.left : v.winner,
    right: isOptionKey(v.right) ? v.right : v.loser,
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
  return { liked: liked.filter(isOptionKey), seen: seen.filter(isOptionKey), ts: v.ts };
}

/** The newest likes record per voter, read from the pathnames' times, and how many each wrote. */
async function latestFrom(id: string, prefix: string): Promise<Map<string, LatestLikes>> {
  const ns = namespace();
  const newest = new Map<string, { ts: number; pathname: string; records: number }>();
  for (const blob of await listAll(prefix)) {
    const parsed = parseLikesPath(ns, id, blob.pathname);
    if (!parsed) continue;
    const prev = newest.get(parsed.voterId);
    const records = (prev?.records ?? 0) + 1;
    newest.set(parsed.voterId, !prev || parsed.ts > prev.ts ? { ts: parsed.ts, pathname: blob.pathname, records } : { ...prev, records });
  }
  const entries = await mapLimit([...newest], 16, async ([voterId, { pathname, records }]) => {
    const likes = await readOnce(pathname, parseLikes);
    return [voterId, likes ? { ...likes, records } : null] as const;
  });
  const out = new Map<string, LatestLikes>();
  for (const [voterId, likes] of entries) if (likes) out.set(voterId, likes);
  return out;
}

export async function latestLikes(id: string, voterId: string): Promise<LatestLikes | null> {
  return (await latestFrom(id, pathnames.likes(namespace(), id, voterId))).get(voterId) ?? null;
}

export function allLatestLikes(id: string): Promise<Map<string, LatestLikes>> {
  return latestFrom(id, pathnames.likes(namespace(), id));
}

/** Writes a new likes record; the newest per voter wins, so none is overwritten. */
export async function writeLikes(id: string, voterId: string, liked: string[], seen: string[]): Promise<void> {
  const ns = namespace();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const ts = Date.now() + attempt;
    if (await putOnce(pathnames.like(ns, id, voterId, ts), JSON.stringify({ liked, seen, ts }), 'application/json')) return;
  }
  throw new Error('Could not write the likes record.');
}
