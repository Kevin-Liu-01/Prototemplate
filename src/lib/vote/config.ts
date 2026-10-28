/* The logo vote's constants and the small pure helpers every layer shares.
   Self-contained (no runtime imports), so node --test loads it directly. */

/** How many matchups each logo gets per voter, capped at the number of other logos. */
export const APPEARANCES = 3;
export const ELO_START = 1000;
export const ELO_K = 32;
/** A results row with fewer games than this is provisional. */
export const PROVISIONAL_GAMES = 6;
/** A voter group shows as a results filter only with this many voters, so no one's ballot stands alone. */
export const MIN_GROUP_VOTERS = 3;

/** The logo registry and the schedule's ratings stay in memory this long per instance. */
export const CACHE_MS = 20_000;
export const MAX_LOGO_BYTES = 1024 * 1024;
export const MAX_JSON_BYTES = 16 * 1024;
export const MAX_NAME_LENGTH = 80;

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
  return raw && /^[a-z0-9-]{1,40}$/.test(raw) ? raw : 'vote';
}

/**
 * Who may vote: VOTE_ALLOWED, exact addresses and '@domain' entries
 * separated by commas, set only in the deployment's environment. Without
 * it, only the team's domain may vote.
 */
export function voteAllowList(): string {
  return process.env.VOTE_ALLOWED?.trim() || `@${TEAM_DOMAIN}`;
}

/** The environment the API needs; an empty list means it can serve. */
export function missingEnv(): string[] {
  return ['BLOB_READ_WRITE_TOKEN', 'VOTE_SECRET', 'VOTE_ADMIN_KEY'].filter(
    (name) => !process.env[name]
  );
}

export function isLogoKey(value: unknown): value is string {
  return typeof value === 'string' && KEY.test(value);
}

export function isVoterId(value: unknown): value is string {
  return typeof value === 'string' && VOTER_ID.test(value);
}

export function isDeviceId(value: unknown): value is string {
  return typeof value === 'string' && DEVICE_ID.test(value);
}

/** A key from a display name: lowercase ASCII letters, digits and single hyphens, at most 40. */
export function keyFromName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
}

export function domainLabel(domain: string): string {
  return domain === TEAM_DOMAIN ? TEAM_LABEL : domain;
}

/** The image address by the logo's opaque id; the version changes on every upload, so it caches for good. */
export function logoSrc(id: string, version: number): string {
  return `/api/vote/logo/${id}?v=${version.toString(36)}`;
}

/* ------------------------------------------------------------------ */
/* store pathnames: N is the namespace; a vote's pathname alone carries it */

export type LogoExt = 'json' | 'svg' | 'png';

export const pathnames = {
  logos: (ns: string) => `${ns}/logos/`,
  logo: (ns: string, key: string, ext: LogoExt) => `${ns}/logos/${key}.${ext}`,
  hidden: (ns: string, key = '') => `${ns}/hidden/${key}`,
  voters: (ns: string) => `${ns}/voters/`,
  voter: (ns: string, voterId: string) => `${ns}/voters/${voterId}.json`,
  devices: (ns: string) => `${ns}/devices/`,
  device: (ns: string, deviceId: string, voterId: string) => `${ns}/devices/${deviceId}/${voterId}`,
  votes: (ns: string, voterId = '') => `${ns}/votes/${voterId ? `${voterId}/` : ''}`,
  vote: (ns: string, voterId: string, ts: number, winner: string, loser: string) =>
    `${ns}/votes/${voterId}/${ts}_${winner}_${loser}.json`,
  likes: (ns: string, voterId = '') => `${ns}/likes/${voterId ? `${voterId}/` : ''}`,
  like: (ns: string, voterId: string, ts: number) => `${ns}/likes/${voterId}/${ts}.json`,
  excluded: (ns: string, voterId = '') => `${ns}/excluded/${voterId}`,
};

function rest(pathname: string, prefix: string): string[] | null {
  return pathname.startsWith(prefix) ? pathname.slice(prefix.length).split('/') : null;
}

export function parseVotePath(
  ns: string,
  pathname: string
): { voterId: string; ts: number; winner: string; loser: string } | null {
  const parts = rest(pathname, pathnames.votes(ns));
  if (!parts || parts.length !== 2 || !isVoterId(parts[0])) return null;
  const match = /^(\d{1,15})_([a-z0-9-]{1,40})_([a-z0-9-]{1,40})\.json$/.exec(parts[1] ?? '');
  if (!match || match[2] === match[3]) return null;
  return { voterId: parts[0], ts: Number(match[1]), winner: match[2] as string, loser: match[3] as string };
}

export function parseLikesPath(ns: string, pathname: string): { voterId: string; ts: number } | null {
  const parts = rest(pathname, pathnames.likes(ns));
  if (!parts || parts.length !== 2 || !isVoterId(parts[0])) return null;
  const match = /^(\d{1,15})\.json$/.exec(parts[1] ?? '');
  return match ? { voterId: parts[0], ts: Number(match[1]) } : null;
}

export function parseDevicePath(ns: string, pathname: string): { deviceId: string; voterId: string } | null {
  const parts = rest(pathname, pathnames.devices(ns));
  if (!parts || parts.length !== 2 || !isDeviceId(parts[0]) || !isVoterId(parts[1])) return null;
  return { deviceId: parts[0], voterId: parts[1] };
}

export function parseLogoPath(ns: string, pathname: string): { key: string; ext: LogoExt } | null {
  const parts = rest(pathname, pathnames.logos(ns));
  const match = parts?.length === 1 ? /^([a-z0-9-]{1,40})\.(json|svg|png)$/.exec(parts[0] ?? '') : null;
  return match ? { key: match[1] as string, ext: match[2] as LogoExt } : null;
}

/** The key or voter id an empty marker names (hidden/<key>, excluded/<voterId>, voters/<voterId>.json). */
export function parseMarkerPath(ns: string, pathname: string, kind: 'hidden' | 'excluded' | 'voters'): string | null {
  const parts = rest(pathname, `${ns}/${kind}/`);
  if (!parts || parts.length !== 1) return null;
  const name = kind === 'voters' ? (parts[0] ?? '').replace(/\.json$/, '') : (parts[0] ?? '');
  if (kind === 'hidden') return isLogoKey(name) ? name : null;
  if (kind === 'voters' && !(parts[0] ?? '').endsWith('.json')) return null;
  return isVoterId(name) ? name : null;
}
