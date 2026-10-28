/* What a decision is and who sees what of it: the meta read back from the
   store and checked on every write, the option names and keys (a key from
   a name, a suffix on a collision, a name from a file name, text options
   from lines), the visibility rules per status, and the options a voter
   who had finished has not seen yet. Type imports only, so node --test
   loads it directly. */
import type { DecisionHead, DecisionKind, DecisionMeta, DecisionStatus } from './types';

export const KINDS: readonly DecisionKind[] = ['mark', 'image', 'text'];
export const STATUSES: readonly DecisionStatus[] = ['draft', 'open', 'closed', 'archived'];
/** Path segments under /vote that a decision id may not take. */
export const RESERVED_IDS: readonly string[] = ['admin', 'api', 'results', 'new'];

/** How many matchups each option gets per voter by default, capped at the number of other options. */
export const DEFAULT_APPEARANCES = 3;
export const MAX_APPEARANCES = 10;
export const MAX_NAME_LENGTH = 80;
export const MAX_TEXT_LENGTH = 280;
export const MAX_QUESTION_LENGTH = 200;
/** The most options one bulk add takes. */
export const MAX_BATCH = 100;
const ORDER_LIMIT = 1_000_000;

const KEY = /^[a-z0-9-]{1,40}$/;

export function isKind(value: unknown): value is DecisionKind {
  return typeof value === 'string' && (KINDS as readonly string[]).includes(value);
}

export function isStatus(value: unknown): value is DecisionStatus {
  return typeof value === 'string' && (STATUSES as readonly string[]).includes(value);
}

/** A decision id: a to z, 0 to 9 and hyphens, 1 to 40 long, and none of the reserved path segments. */
export function isDecisionId(value: unknown): value is string {
  return typeof value === 'string' && KEY.test(value) && !RESERVED_IDS.includes(value);
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

/** The base key when it is free, else base-2, base-3 and so on, cut to fit 40 characters. */
export function uniqueKey(base: string, taken: ReadonlySet<string>, fallback = 'option'): string {
  const root = KEY.test(base) ? base : fallback;
  if (!taken.has(root)) return root;
  for (let n = 2; ; n += 1) {
    const suffix = `-${n}`;
    const stem = root.slice(0, 40 - suffix.length).replace(/-+$/g, '') || fallback;
    const key = `${stem}${suffix}`;
    if (!taken.has(key)) return key;
  }
}

/** One key per name, in order, none taken and none repeated. */
export function keysFor(names: readonly string[], taken: ReadonlySet<string>): string[] {
  const used = new Set(taken);
  return names.map((name) => {
    const key = uniqueKey(keyFromName(name), used);
    used.add(key);
    return key;
  });
}

/** A display name: one line, spaces collapsed, 1 to MAX_NAME_LENGTH characters; null otherwise. */
export function checkName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const name = raw.trim().replace(/\s+/g, ' ');
  return name && name.length <= MAX_NAME_LENGTH && !/\p{Cc}/u.test(name) ? name : null;
}

/** A text option's text: one paragraph, spaces collapsed, 0 to MAX_TEXT_LENGTH characters; null otherwise. */
export function checkText(raw: unknown): string | null {
  if (raw === undefined || raw === null) return '';
  if (typeof raw !== 'string') return null;
  const text = raw.trim().replace(/\s+/g, ' ');
  return text.length <= MAX_TEXT_LENGTH && !/\p{Cc}/u.test(text) ? text : null;
}

/** An option name from a file name: the extension dropped, dashes and underscores to spaces. */
export function nameFromFilename(filename: string): string {
  const base = filename.split(/[\\/]/).pop() ?? '';
  const stem = base.includes('.') ? base.slice(0, base.lastIndexOf('.')) : base;
  return stem.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH).trim();
}

export type TextLine = { name: string; text: string };

/**
 * Text options from many lines: "Name" or "Name: text" per line, blank
 * lines skipped. Every bad line is reported, so nothing is added until all
 * of them read.
 */
export function parseTextLines(source: string): { options: TextLine[] } | { problems: { name: string; error: string }[] } {
  const options: TextLine[] = [];
  const problems: { name: string; error: string }[] = [];
  for (const line of source.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const colon = line.indexOf(':');
    const name = checkName(colon < 0 ? line : line.slice(0, colon));
    const text = checkText(colon < 0 ? '' : line.slice(colon + 1));
    if (name === null) problems.push({ name: line.trim().slice(0, MAX_NAME_LENGTH), error: `A name has 1 to ${MAX_NAME_LENGTH} characters.` });
    else if (text === null) problems.push({ name, error: `A text has at most ${MAX_TEXT_LENGTH} characters.` });
    else options.push({ name, text });
  }
  if (problems.length) return { problems };
  if (!options.length) return { problems: [{ name: '', error: 'Write one option per line.' }] };
  if (options.length > MAX_BATCH) return { problems: [{ name: '', error: `Add at most ${MAX_BATCH} options at once.` }] };
  return { options };
}

/* ------------------------------------------------------------------ */
/* meta                                                                */

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * A stored meta.json read back. A bad kind makes it unreadable; any other
 * bad field takes the value that shows the least: a draft, an empty access
 * list.
 */
export function parseDecisionMeta(raw: unknown, id: string): DecisionMeta | null {
  const v = raw as Partial<Record<keyof DecisionMeta, unknown>> | null;
  if (!v || typeof v !== 'object' || !isDecisionId(id) || !isKind(v.kind)) return null;
  const appearances = finite(v.appearances) ? Math.round(v.appearances) : DEFAULT_APPEARANCES;
  return {
    id,
    title: checkName(v.title) ?? id,
    question: typeof v.question === 'string' ? v.question.trim().slice(0, MAX_QUESTION_LENGTH) : '',
    kind: v.kind,
    status: isStatus(v.status) ? v.status : 'draft',
    access: Array.isArray(v.access) ? v.access.filter((entry): entry is string => typeof entry === 'string') : [],
    appearances: Math.min(MAX_APPEARANCES, Math.max(1, appearances)),
    likes: typeof v.likes === 'boolean' ? v.likes : true,
    createdAt: typeof v.createdAt === 'string' ? v.createdAt : new Date(0).toISOString(),
    order: finite(v.order) ? v.order : 0,
  };
}

/** The settings a meta change may set; access is checked by identity.parseAccess. */
export type MetaPatch = Partial<Pick<DecisionMeta, 'title' | 'question' | 'status' | 'appearances' | 'likes' | 'order'>>;

function checkQuestion(raw: unknown): string | null {
  if (raw === undefined || raw === null) return '';
  if (typeof raw !== 'string') return null;
  const question = raw.trim().replace(/\s+/g, ' ');
  return question.length <= MAX_QUESTION_LENGTH && !/\p{Cc}/u.test(question) ? question : null;
}

/** The fields of a meta change that are present, each checked; an error names the first bad one. */
export function checkMetaPatch(body: Record<string, unknown>): { patch: MetaPatch } | { error: string } {
  const patch: MetaPatch = {};
  if (body.title !== undefined) {
    const title = checkName(body.title);
    if (title === null) return { error: `A title has 1 to ${MAX_NAME_LENGTH} characters.` };
    patch.title = title;
  }
  if (body.question !== undefined) {
    const question = checkQuestion(body.question);
    if (question === null) return { error: `A question has at most ${MAX_QUESTION_LENGTH} characters on one line.` };
    patch.question = question;
  }
  if (body.status !== undefined) {
    if (!isStatus(body.status)) return { error: 'The status is draft, open, closed or archived.' };
    patch.status = body.status;
  }
  if (body.appearances !== undefined) {
    const n = body.appearances;
    if (!(finite(n) && Number.isInteger(n) && n >= 1 && n <= MAX_APPEARANCES)) {
      return { error: `Appearances is a whole number from 1 to ${MAX_APPEARANCES}.` };
    }
    patch.appearances = n;
  }
  if (body.likes !== undefined) {
    if (typeof body.likes !== 'boolean') return { error: 'Likes is on or off.' };
    patch.likes = body.likes;
  }
  if (body.order !== undefined) {
    if (!(finite(body.order) && Math.abs(body.order) <= ORDER_LIMIT)) return { error: 'The order is a number.' };
    patch.order = body.order;
  }
  return { patch };
}

/** A new decision's title, id, kind and question; the id comes from the title when none is sent. */
export function checkNewDecision(
  body: Record<string, unknown>,
  taken: ReadonlySet<string>
): { value: { id: string; title: string; kind: DecisionKind; question: string } } | { error: string; status: 400 | 409 } {
  const title = checkName(body.title);
  if (title === null) return { error: `A title has 1 to ${MAX_NAME_LENGTH} characters.`, status: 400 };
  if (!isKind(body.kind)) return { error: 'The kind is mark, image or text.', status: 400 };
  const question = checkQuestion(body.question);
  if (question === null) return { error: `A question has at most ${MAX_QUESTION_LENGTH} characters on one line.`, status: 400 };
  const sent = typeof body.id === 'string' ? body.id.trim() : '';
  if (sent) {
    if (!isDecisionId(sent)) {
      return { error: `An id uses a to z, 0 to 9 and hyphens, at most 40, and is not ${RESERVED_IDS.join(', ')}.`, status: 400 };
    }
    if (taken.has(sent)) return { error: 'A decision with that id exists.', status: 409 };
    return { value: { id: sent, title, kind: body.kind, question } };
  }
  const id = uniqueKey(keyFromName(title), new Set([...taken, ...RESERVED_IDS]), 'decision');
  return { value: { id, title, kind: body.kind, question } };
}

export function headOf(meta: DecisionMeta): DecisionHead {
  return { id: meta.id, title: meta.title, question: meta.question, kind: meta.kind, status: meta.status, likes: meta.likes };
}

/** Decisions by order, then age, then id. */
export function sortDecisions<T extends Pick<DecisionMeta, 'id' | 'order' | 'createdAt'>>(metas: readonly T[]): T[] {
  return [...metas].sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}

/* ------------------------------------------------------------------ */
/* who sees what                                                       */

/** A voter on the access list sees open and closed decisions; drafts and archived ones are the admin's. */
export function voterSees(status: DecisionStatus): boolean {
  return status === 'open' || status === 'closed';
}

/**
 * The decisions a voter sees on the hub: open or closed, with their email
 * on the access list (onList is the caller's identity.isAllowedEmail). A
 * session starts only when this is not empty.
 */
export function visibleDecisions<T extends Pick<DecisionMeta, 'status' | 'access'>>(
  metas: readonly T[],
  onList: (access: readonly string[]) => boolean
): T[] {
  return metas.filter((meta) => voterSees(meta.status) && onList(meta.access));
}

/**
 * The voter groups a reader may see and filter the results by, from the
 * voters per domain who took part. The admin sees every group. Anyone else
 * sees the groups of at least `min` voters, and only while All minus those
 * groups leaves no one or a group of `min` or more beside two or more
 * listed groups: the counts are sums, so a smaller rest would show its
 * voters' ballots.
 */
export function visibleGroups(byDomain: ReadonlyMap<string, number>, admin: boolean, min: number): [string, number][] {
  const all = [...byDomain];
  if (admin) return all;
  const listed = all.filter(([, count]) => count >= min);
  const sum = (entries: readonly [string, number][]) => entries.reduce((total, [, count]) => total + count, 0);
  const rest = sum(all) - sum(listed);
  return rest === 0 || (rest >= min && listed.length > 1) ? listed : [];
}

/** Votes and likes are taken only while a decision is open. */
export function votingOpen(status: DecisionStatus): boolean {
  return status === 'open';
}

/** Whether a decision opens for this reader: the admin always, a voter on its list while it is open or closed. */
export function canOpen(status: DecisionStatus, onList: boolean, admin: boolean): boolean {
  return admin || (onList && voterSees(status));
}

/** Whether the results open: the admin always; a voter once closed, or once they finish an open decision. */
export function resultsOpen(status: DecisionStatus, complete: boolean, admin: boolean): boolean {
  if (admin) return true;
  return status === 'closed' || (status === 'open' && complete);
}

/**
 * The options added since a voter finished, which the hub counts as new.
 * With likes on, a likes record is written only after the matchups, so its
 * seen list is what the voter had finished with. With likes off, the
 * options added before the voter's newest vote are the ones they voted
 * among; the voter had finished when the schedule has no pair left among
 * those alone, and the new ones are the options added since. Empty for a
 * voter who has not finished once, or who is part way through.
 */
export function newOptions(input: {
  keys: readonly string[];
  /** when each active option was added, as an ISO time */
  addedAt: ReadonlyMap<string, string>;
  /** the time of the voter's newest vote in ms; 0 when they have none */
  lastVoteAt: number;
  latestSeen: readonly string[] | null;
  likes: boolean;
  /** whether the schedule has no pair left for this voter among these options alone */
  finishedAmong: (keys: readonly string[]) => boolean;
}): string[] {
  const { keys } = input;
  if (input.likes) {
    if (!input.latestSeen) return [];
    const seen = new Set(input.latestSeen);
    return keys.filter((key) => !seen.has(key));
  }
  if (!input.lastVoteAt) return [];
  const old = new Set(keys.filter((key) => Date.parse(input.addedAt.get(key) ?? '') <= input.lastVoteAt));
  if (old.size < 2 || old.size === keys.length || !input.finishedAmong([...old])) return [];
  return keys.filter((key) => !old.has(key));
}
