/* Who is voting: the normalized email, whether it is on a decision's
   access list, the voter id derived from it, the device id, the signed
   cookie values and the opaque id a voter sees for each option. Imports
   node:crypto only, so node --test loads it directly; the secret is passed
   in by the caller. */
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
 * True when a normalized email is on an access list: an array of entries,
 * or one string of entries separated by commas or spaces. An entry is an
 * exact address (compared normalized, so a +tag on either side drops), an
 * '@domain' entry for every address there, or '*' for any address.
 */
export function isAllowedEmail(email: string, list: string | readonly string[]): boolean {
  const domain = emailDomain(email);
  const entries = typeof list === 'string' ? list.split(/[\s,]+/) : list;
  return entries
    .map((entry) => entry.trim().toLowerCase())
    .some((entry) => {
      if (entry === '*') return true;
      if (entry.startsWith('@')) return entry.slice(1) === domain;
      return entry !== '' && normalizeEmail(entry) === email;
    });
}

/** The most entries one access list holds. */
export const MAX_ACCESS_ENTRIES = 500;

/**
 * An access list as the admin wrote it (an array, or text with entries
 * separated by commas, spaces or new lines), each entry normalized: '*',
 * '@domain' or an exact address. '*' anywhere makes the list ['*']. An
 * error names the first entry that is neither an address nor a domain.
 */
export function parseAccess(input: unknown): { access: string[] } | { error: string } {
  const raw = typeof input === 'string' ? input.split(/[\s,]+/) : Array.isArray(input) ? input : null;
  if (!raw || !raw.every((entry) => typeof entry === 'string')) return { error: 'Send the access list as text or a list.' };
  const out: string[] = [];
  for (const value of raw as string[]) {
    const entry = value.trim().toLowerCase();
    if (!entry) continue;
    if (entry === '*') return { access: ['*'] };
    if (entry.startsWith('@')) {
      const labels = entry.slice(1).split('.');
      if (labels.length < 2 || !labels.every((label) => LABEL.test(label)) || !/^[a-z]{2,}$/.test(labels[labels.length - 1] ?? '')) {
        return { error: `${value.trim()} is not a domain.` };
      }
      out.push(entry);
      continue;
    }
    const email = normalizeEmail(entry);
    if (!email) return { error: `${value.trim()} is not an email address or an @domain.` };
    out.push(email);
  }
  const access = [...new Set(out)];
  if (access.length > MAX_ACCESS_ENTRIES) return { error: `An access list holds at most ${MAX_ACCESS_ENTRIES} entries.` };
  return { access };
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

/**
 * The id a voter sees for an option: its key could name it, and voting is
 * blind. The decision id is in the message, so one key in two decisions
 * has two unrelated aliases.
 */
export function optionAlias(secret: string, decisionId: string, key: string): string {
  return hmac(secret, `opt:${decisionId}:${key}`).slice(0, 12);
}
