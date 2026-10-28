/* Who is voting: the normalized email, whether it is on the vote, the
   voter id derived from it, the device id, the signed cookie values and
   the opaque id a voter sees for each logo. Imports node:crypto only, so
   node --test loads it directly; the secret is passed in by the caller. */
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const LOCAL = /^[a-z0-9!#$%&'*/=?^_`{|}~-]+(\.[a-z0-9!#$%&'*/=?^_`{|}~-]+)*$/;
const LABEL = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

/** Trimmed, lowercased, the +tag dropped from the local part; null when it is not an address. */
export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const email = raw.trim().toLowerCase();
  if (email.length > 254) return null;
  const at = email.lastIndexOf('@');
  if (at < 1) return null;
  const local = email.slice(0, at).split('+')[0] ?? '';
  const domain = email.slice(at + 1);
  if (!local || local.length > 64 || !LOCAL.test(local)) return null;
  const labels = domain.split('.');
  if (labels.length < 2 || !labels.every((label) => LABEL.test(label))) return null;
  if (!/^[a-z]{2,}$/.test(labels[labels.length - 1] ?? '')) return null;
  return `${local}@${domain}`;
}

/** The part after the @ of a normalized email: the voter's group. */
export function emailDomain(email: string): string {
  return email.slice(email.lastIndexOf('@') + 1);
}

/**
 * True when a normalized email is on the list: entries separated by commas
 * or spaces, each an exact address or '@domain' for every address there.
 */
export function isAllowedEmail(email: string, list: string): boolean {
  const domain = emailDomain(email);
  return list
    .split(/[\s,]+/)
    .map((entry) => entry.trim().toLowerCase())
    .some((entry) => (entry.startsWith('@') ? entry.slice(1) === domain : entry !== '' && normalizeEmail(entry) === email));
}

function hmac(secret: string, message: string): string {
  return createHmac('sha256', secret).update(message).digest('hex');
}

/** Equal-time comparison of two strings of any length. */
export function safeEqual(a: string, b: string): boolean {
  const da = createHash('sha256').update(a).digest();
  const db = createHash('sha256').update(b).digest();
  return timingSafeEqual(da, db) && a.length === b.length;
}

export function voterIdFor(secret: string, normalizedEmail: string): string {
  return hmac(secret, normalizedEmail).slice(0, 20);
}

export function newDeviceId(): string {
  return randomBytes(12).toString('hex');
}

/** The pt_vote cookie value: voterId.deviceId.signature. */
export function sessionToken(secret: string, voterId: string, deviceId: string): string {
  return `${voterId}.${deviceId}.${hmac(secret, `session:${voterId}.${deviceId}`)}`;
}

/** The ids a valid pt_vote value carries; only ids this server signed pass. */
export function readSessionToken(
  secret: string,
  token: string | undefined
): { voterId: string; deviceId: string } | null {
  const [voterId, deviceId, sig, ...rest] = (token ?? '').split('.');
  if (rest.length || !voterId || !deviceId || !sig) return null;
  return safeEqual(sig, hmac(secret, `session:${voterId}.${deviceId}`)) ? { voterId, deviceId } : null;
}

function adminSignature(secret: string, adminKey: string, issuedAt: string): string {
  return hmac(secret, `admin:${issuedAt}:${createHash('sha256').update(adminKey).digest('hex')}`);
}

/** The pt_vote_admin cookie value: the issue time and a signature over it and the admin key. */
export function adminToken(secret: string, adminKey: string, issuedAt: number): string {
  const at = String(Math.floor(issuedAt));
  return `${at}.${adminSignature(secret, adminKey, at)}`;
}

/** True for a pt_vote_admin value signed with this admin key and issued less than maxAgeMs ago. */
export function readAdminToken(secret: string, adminKey: string, token: string | undefined, maxAgeMs: number, now: number): boolean {
  const [at, sig, ...rest] = (token ?? '').split('.');
  if (rest.length || !adminKey || !at || !sig || !/^\d{1,15}$/.test(at)) return false;
  /* a minute of clock skew between instances is allowed */
  const age = now - Number(at);
  return age > -60_000 && age < maxAgeMs && safeEqual(sig, adminSignature(secret, adminKey, at));
}

/** The id a voter sees for a logo: the logo's key would name it, and voting is blind. */
export function logoAlias(secret: string, key: string): string {
  return hmac(secret, `logo:${key}`).slice(0, 12);
}
