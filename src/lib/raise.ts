import { readFile } from 'node:fs/promises';
import { get } from '@vercel/blob';
import { cache } from 'react';

import { formatLongDay } from '@/lib/dates';

/**
 * /raise: the media history of the funding announcement, round by round, as a
 * docs site. The rounds, their accounts and their files are read from the
 * locked areas' Blob store under locked/raise/ (scripts/locked/sync.mjs
 * uploads it) when a page is built and again every five minutes, so the
 * raise folder stays the one source and a sync updates the pages without a
 * deploy. The method page (src/app/raise/method.ts) is this repository's.
 *
 * Two text files drive every page:
 * - viewer/data.js, the raise folder's generated data (window.RAISE = {...},
 *   written by the raise folder's own build): the rounds with their media,
 *   and the run of show;
 * - writeups.json, the accounts of how each round was directed, keyed by
 *   round id, plus "overview" and "finals".
 * The media paths in data.js are relative to the folder and are served at
 * /raise/files/<path> (src/app/raise/files).
 *
 * RAISE_WRITEUPS, a local file path, replaces the store's writeups.json for
 * a review on localhost before a sync; it is never read on Vercel.
 */

const PREFIX = 'locked/raise/';

/** Where the page addresses a media file of the store. */
export const RAISE_FILES = '/raise/files/';

export type RaiseStatus = 'shipped' | 'kept' | 'pick' | 'reference' | 'dropped';

/** A still, a sheet or a film a round showed, or one more file it produced. */
export type RaiseItem = {
  key: string;
  kind: 'still' | 'sheet' | 'film';
  caption?: string;
  note?: string;
  status?: RaiseStatus | null;
  /** who picked it, for a pick: kevin, critic, judge */
  by?: string;
  /** the folder a collected file came from, for the more list */
  group?: string;
  full?: string;
  film?: string;
  poster?: string;
  preview: string;
  w: number;
  h: number;
  pw: number;
  ph: number;
  dur?: number;
};

export type RaiseRound = {
  id: string;
  tag: string;
  version: string;
  part: string;
  date: string;
  state: string;
  title: string;
  made?: string | null;
  outcome?: string | null;
  items: RaiseItem[];
  more?: RaiseItem[];
};

/** One cut of a deliverable in the run of show. */
export type RaiseCut = {
  kind: 'still' | 'film' | 'audio';
  label: string;
  name: string;
  about: string;
  /** the shipped cut */
  final: boolean;
  /** a final candidate */
  candidate?: boolean;
  /** an approved preview */
  approved?: boolean;
  note?: string;
  full?: string;
  film?: string;
  poster?: string;
  preview: string;
  w: number;
  h: number;
  pw: number;
  ph: number;
  dur?: number;
};

export type RaiseDeliverable = { id: string; title: string; place: string; state: string; cuts: RaiseCut[] };

export type RaiseGroup = { id: string; title: string; items: RaiseDeliverable[] };

export type RaiseData = {
  title: string;
  parts: Record<string, { title: string; scope: string }>;
  status_values: Record<string, string>;
  rounds: RaiseRound[];
  show: RaiseGroup[];
};

/** The text of one page: a round's account (lead, directed) or the overview's and the finals' (title, lead, body). */
export type RaiseText = { title?: string; lead?: string; directed?: string[]; body?: string[] };

export type Raise = { data: RaiseData; text: Record<string, RaiseText> };

/** The slug of the run of show's page, after the last round. */
export const FINALS = 'finals';

/** A text file of the store, or null when the store or the file is missing. */
async function readStore(path: string): Promise<string | null> {
  const token = process.env.LOCKED_BLOB_READ_WRITE_TOKEN;
  if (!token) return null;
  try {
    const result = await get(`${PREFIX}${path}`, { access: 'private', token, useCache: false });
    if (!result || result.statusCode !== 200) return null;
    return await new Response(result.stream).text();
  } catch {
    return null;
  }
}

/** The accounts: the local review file when RAISE_WRITEUPS names one off Vercel, else the store's. */
async function readWriteups(): Promise<string | null> {
  const local = process.env.RAISE_WRITEUPS;
  if (local && !process.env.VERCEL) {
    try {
      return await readFile(local, 'utf8');
    } catch {
      return null;
    }
  }
  return readStore('writeups.json');
}

/** data.js is one assignment of a JSON object; the object is everything from its first brace to its last. */
function parseData(js: string): RaiseData | null {
  const start = js.indexOf('{');
  const end = js.lastIndexOf('}');
  if (start < 0 || end < start) return null;
  try {
    const data = JSON.parse(js.slice(start, end + 1)) as RaiseData;
    return Array.isArray(data.rounds) && Array.isArray(data.show) ? data : null;
  } catch {
    return null;
  }
}

function parseText(json: string | null): Record<string, RaiseText> {
  if (!json) return {};
  try {
    const text = JSON.parse(json) as unknown;
    return text && typeof text === 'object' && !Array.isArray(text) ? (text as Record<string, RaiseText>) : {};
  } catch {
    return {};
  }
}

/** Both files, read once per request (the layout and the page share it); null when the store cannot be read. */
export const loadRaise = cache(async (): Promise<Raise | null> => {
  const [js, writeups] = await Promise.all([readStore('viewer/data.js'), readWriteups()]);
  const data = js ? parseData(js) : null;
  return data ? { data, text: parseText(writeups) } : null;
});

/** A media path of data.js as the address the page loads it from. */
export function fileUrl(path: string): string {
  return `${RAISE_FILES}${path.split('/').map(encodeURIComponent).join('/')}`;
}

/** The rounds by day, in the order data.js lists them (its own date order). */
export function roundsByDay(rounds: readonly RaiseRound[]): { day: string; label: string; rounds: RaiseRound[] }[] {
  const days: { day: string; label: string; rounds: RaiseRound[] }[] = [];
  for (const round of rounds) {
    const last = days.at(-1);
    if (last && last.day === round.date) last.rounds.push(round);
    else days.push({ day: round.date, label: formatLongDay(round.date).replace(/, \d{4}$/, ''), rounds: [round] });
  }
  return days;
}

/** A length in seconds as m:ss. */
export function duration(seconds: number): string {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
