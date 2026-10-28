/* The vote's constants and the small pure helpers every layer shares.
   Self-contained (no runtime imports), so node --test loads it directly. */

export const ELO_START = 1000;
export const ELO_K = 32;
/** A results row with fewer games than this is provisional. */
export const PROVISIONAL_GAMES = 6;
/** A voter group shows as a results filter only with this many voters, so no one's ballot stands alone. */
export const MIN_GROUP_VOTERS = 3;

/** The decision list, each decision's options and the schedule's ratings stay in memory this long per instance. */
export const CACHE_MS = 20_000;
/** A mark file (single-ink SVG or PNG). */
export const MAX_MARK_BYTES = 1024 * 1024;
/** An image file (PNG, JPG, WebP or SVG). */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
/** One upload request; a deployment refuses a larger body, so a bulk add is sent in batches under it. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_JSON_BYTES = 16 * 1024;

export const SESSION_COOKIE = 'pt_vote';
export const DEVICE_COOKIE = 'pt_vote_device';
export const ADMIN_COOKIE = 'pt_vote_admin';
export const SESSION_MAX_AGE = 180 * 24 * 60 * 60;
/* browsers cap a cookie's life at 400 days */
export const DEVICE_MAX_AGE = 400 * 24 * 60 * 60;
export const ADMIN_MAX_AGE = 30 * 24 * 60 * 60;

/** The one domain shown by a name of its own; every other domain shows as itself. */
export const TEAM_DOMAIN = 'generaltranslation.com';
export const TEAM_LABEL = 'GT team';

const KEY = /^[a-z0-9-]{1,40}$/;
const VOTER_ID = /^[a-f0-9]{20}$/;
const DEVICE_ID = /^[a-f0-9]{24}$/;

/** The store prefix every blob lives under, read per call so a build never reads it. */
export function namespace(): string {
  const raw = process.env.VOTE_NAMESPACE;
  return raw && KEY.test(raw) ? raw : 'vote';
}

/**
 * The access list a new decision starts with: VOTE_ALLOWED, exact
 * addresses and '@domain' entries separated by commas or spaces, set only
 * in the deployment's environment. Without it, the team's domain.
 */
export function defaultAccess(): string[] {
  const entries = (process.env.VOTE_ALLOWED ?? '')
    .split(/[\s,]+/)
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return entries.length ? [...new Set(entries)] : [`@${TEAM_DOMAIN}`];
}

/** The environment the API needs; an empty list means it can serve. */
export function missingEnv(): string[] {
  return ['BLOB_READ_WRITE_TOKEN', 'VOTE_SECRET', 'VOTE_ADMIN_KEY'].filter(
    (name) => !process.env[name]
  );
}

/** An option key, or an alias a voter sends: a to z, 0 to 9 and hyphens, 1 to 40 long. */
export function isOptionKey(value: unknown): value is string {
  return typeof value === 'string' && KEY.test(value);
}

export function isVoterId(value: unknown): value is string {
  return typeof value === 'string' && VOTER_ID.test(value);
}

export function isDeviceId(value: unknown): value is string {
  return typeof value === 'string' && DEVICE_ID.test(value);
}

export function domainLabel(domain: string): string {
  return domain === TEAM_DOMAIN ? TEAM_LABEL : domain;
}

/** An option file's address by its opaque alias; the version changes on every upload, so it caches for good. */
export function optionSrc(decisionId: string, alias: string, version: number): string {
  return `/api/vote/d/${decisionId}/option/${alias}?v=${version.toString(36)}`;
}

/* ------------------------------------------------------------------ */
/* store pathnames: N is the namespace. Voters, devices and exclusions
   are global; everything else lives under decisions/<id>/. A vote's
   pathname alone carries the vote. */

export type FileExt = 'svg' | 'png' | 'jpg' | 'webp';
export type OptionExt = 'json' | FileExt;
export const FILE_EXTS: readonly FileExt[] = ['svg', 'png', 'jpg', 'webp'];

const d = (ns: string, id: string) => `${ns}/decisions/${id}`;

export const pathnames = {
  voters: (ns: string) => `${ns}/voters/`,
  voter: (ns: string, voterId: string) => `${ns}/voters/${voterId}.json`,
  devices: (ns: string) => `${ns}/devices/`,
  device: (ns: string, deviceId: string, voterId: string) => `${ns}/devices/${deviceId}/${voterId}`,
  excluded: (ns: string, voterId = '') => `${ns}/excluded/${voterId}`,
  decisions: (ns: string) => `${ns}/decisions/`,
  meta: (ns: string, id: string) => `${d(ns, id)}/meta.json`,
  options: (ns: string, id: string) => `${d(ns, id)}/options/`,
  option: (ns: string, id: string, key: string, ext: OptionExt) => `${d(ns, id)}/options/${key}.${ext}`,
  hidden: (ns: string, id: string, key = '') => `${d(ns, id)}/hidden/${key}`,
  votes: (ns: string, id: string, voterId = '') => `${d(ns, id)}/votes/${voterId ? `${voterId}/` : ''}`,
  vote: (ns: string, id: string, voterId: string, ts: number, winner: string, loser: string) =>
    `${d(ns, id)}/votes/${voterId}/${ts}_${winner}_${loser}.json`,
  likes: (ns: string, id: string, voterId = '') => `${d(ns, id)}/likes/${voterId ? `${voterId}/` : ''}`,
  like: (ns: string, id: string, voterId: string, ts: number) => `${d(ns, id)}/likes/${voterId}/${ts}.json`,
  /** the claim a change puts on the counted vote it replaces, named by that vote; never listed */
  change: (ns: string, id: string, voterId: string, ts: number, winner: string, loser: string) =>
    `${d(ns, id)}/changes/${voterId}/${ts}_${winner}_${loser}`,
};

function rest(pathname: string, prefix: string): string[] | null {
  return pathname.startsWith(prefix) ? pathname.slice(prefix.length).split('/') : null;
}

/** The folder name a decisions/ folder has (N/decisions/<id>/); the caller checks it is a decision id. */
export function parseDecisionFolder(ns: string, folder: string): string | null {
  const parts = rest(folder, pathnames.decisions(ns));
  if (!parts || parts.length !== 2 || parts[1] !== '') return null;
  return isOptionKey(parts[0]) ? parts[0] : null;
}

export function parseVotePath(
  ns: string,
  id: string,
  pathname: string
): { voterId: string; ts: number; winner: string; loser: string } | null {
  const parts = rest(pathname, pathnames.votes(ns, id));
  if (!parts || parts.length !== 2 || !isVoterId(parts[0])) return null;
  const match = /^(\d{1,15})_([a-z0-9-]{1,40})_([a-z0-9-]{1,40})\.json$/.exec(parts[1] ?? '');
  if (!match || match[2] === match[3]) return null;
  return { voterId: parts[0], ts: Number(match[1]), winner: match[2] as string, loser: match[3] as string };
}

export function parseLikesPath(ns: string, id: string, pathname: string): { voterId: string; ts: number } | null {
  const parts = rest(pathname, pathnames.likes(ns, id));
  if (!parts || parts.length !== 2 || !isVoterId(parts[0])) return null;
  const match = /^(\d{1,15})\.json$/.exec(parts[1] ?? '');
  return match ? { voterId: parts[0], ts: Number(match[1]) } : null;
}

export function parseDevicePath(ns: string, pathname: string): { deviceId: string; voterId: string } | null {
  const parts = rest(pathname, pathnames.devices(ns));
  if (!parts || parts.length !== 2 || !isDeviceId(parts[0]) || !isVoterId(parts[1])) return null;
  return { deviceId: parts[0], voterId: parts[1] };
}

export function parseOptionPath(ns: string, id: string, pathname: string): { key: string; ext: OptionExt } | null {
  const parts = rest(pathname, pathnames.options(ns, id));
  const match = parts?.length === 1 ? /^([a-z0-9-]{1,40})\.(json|svg|png|jpg|webp)$/.exec(parts[0] ?? '') : null;
  return match ? { key: match[1] as string, ext: match[2] as OptionExt } : null;
}

/** The option key a decision's hidden marker names (hidden/<key>). */
export function parseHiddenPath(ns: string, id: string, pathname: string): string | null {
  const parts = rest(pathname, pathnames.hidden(ns, id));
  return parts && parts.length === 1 && isOptionKey(parts[0]) ? parts[0] : null;
}

/** The voter id a global marker names (excluded/<voterId>, voters/<voterId>.json). */
export function parseMarkerPath(ns: string, pathname: string, kind: 'excluded' | 'voters'): string | null {
  const parts = rest(pathname, `${ns}/${kind}/`);
  if (!parts || parts.length !== 1) return null;
  const last = parts[0] ?? '';
  if (kind === 'voters' && !last.endsWith('.json')) return null;
  const name = kind === 'voters' ? last.replace(/\.json$/, '') : last;
  return isVoterId(name) ? name : null;
}
