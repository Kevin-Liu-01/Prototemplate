import type { MotionFilm } from '@/lib/motion';
import { dayLabel, duration, fileUrl } from '@/lib/raise';
import type { Raise, RaiseCut, RaiseDeliverable, RaiseItem, RaiseRound, RaiseStatus } from '@/lib/raise';
import type { ShellItem, ShellSection } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';

import { METHOD, METHOD_LEAD, METHOD_SLUG, METHOD_TITLE } from './method';
import { METHOD_ID, roundId, SECTION, SECTION_LABEL } from './sections';

/**
 * The /raise pages as the viewer shell reads them, built on the server from
 * the store's two files (src/lib/raise.ts) and handed to the client as
 * plain data, so the client never parses data.js. Pure, no React.
 *
 * The store's run of show lists most deliverables twice: once in the Ready
 * group with its shipped cuts, and again under X, LinkedIn or the blog with
 * the same files and their alternates. The page shows each deliverable
 * once, as one row of the finals: the Ready item's shipped cuts in the
 * frame, and every other cut of the same deliverable (its previews, drafts
 * and alternates from the posting groups, matched by shared files) folded
 * under it. A posting group's item that shares no file with a Ready item
 * (the loader, the music, the Poster D alternates) is a row of its own
 * after them. The History group's items are the History section, kept out
 * of the finals.
 *
 * One row is not the store's: the translation demo plays the product film
 * /motion shows today (`gif-how-gt-works` in src/lib/motion.ts), and the
 * demo the launch lanes cut stays under History.
 */

/** One file as a frame on the page: a still, a film or a score, with its addresses resolved. */
export type RaiseViewCut = {
  key: string;
  kind: 'still' | 'film' | 'audio';
  label: string;
  /** format, size and length, from the store */
  about?: string;
  /** the chip: Shipped, Final candidate, Approved, a round's status, or Earlier final under History */
  chip?: string;
  /** the chip's tone, the store's status word */
  tone?: RaiseStatus;
  /** the film or the score */
  src?: string;
  /** the film's poster, the still's preview, or the score's waveform */
  image?: string;
  /** the still's full file, opened in a new tab */
  full?: string;
  w: number;
  h: number;
};

export type RaiseViewRow = {
  id: string;
  n: string;
  title: string;
  /** where it is posted: X post, LinkedIn post, Blog */
  place: string;
  /** one sentence under the title */
  note?: string;
  /** the cuts in the frame, switched by the segmented control */
  main: RaiseViewCut[];
  /** every other cut, folded under the frame */
  others: RaiseViewCut[];
  link?: { href: string; label: string };
};

export type RaiseViewRound = {
  id: string;
  /** the round's id in the store, its page's slug */
  slug: string;
  n: string;
  tag: string;
  title: string;
  date: string;
  day: string;
  part: string;
  state: string;
  lead: string;
  shown: number;
  more: number;
  /** up to four of the files the round showed, its picks first */
  thumbs: RaiseViewCut[];
};

export type RaiseIndex = {
  title: string;
  finals: RaiseViewRow[];
  history: RaiseViewRow[];
  rounds: RaiseViewRound[];
  method: { id: string; n: string; title: string; lead: string; subjects: string[] };
  /** the first and last day of the rounds */
  span: { from: string; to: string } | null;
  sections: ShellSection[];
};

/** The chip a round's file carries: kept, picked (and by whom), shipped, dropped or shown for reference. */
function itemChip(item: Pick<RaiseItem, 'status' | 'by'>): string | undefined {
  switch (item.status) {
    case 'shipped':
      return 'Shipped';
    case 'kept':
      return 'Kept';
    case 'pick':
      return item.by === 'kevin' ? 'Kevin’s pick' : item.by ? `The ${item.by}’s pick` : 'Pick';
    case 'reference':
      return 'Reference';
    case 'dropped':
      return 'Dropped';
    default:
      return undefined;
  }
}

/** A round's file as a frame. */
export function itemCut(item: RaiseItem): RaiseViewCut {
  const film = item.kind === 'film' && item.film;
  return {
    key: item.key,
    kind: film ? 'film' : 'still',
    label: item.caption ?? item.key,
    about: [item.note, film && item.dur ? duration(item.dur) : null].filter(Boolean).join(', ') || undefined,
    chip: itemChip(item),
    tone: item.status ?? undefined,
    src: film ? fileUrl(item.film as string) : undefined,
    image: film ? (item.poster ? fileUrl(item.poster) : undefined) : fileUrl(item.preview),
    full: film ? undefined : fileUrl(item.full ?? item.preview),
    w: item.w,
    h: item.h,
  };
}

/** The file a cut plays or shows, which two groups' copies of one deliverable share. */
function cutPath(cut: RaiseCut): string {
  return cut.film ?? cut.full ?? cut.preview;
}

/** A run-of-show cut as a frame; under History a shipped cut is an earlier final. */
function showCut(cut: RaiseCut, history: boolean): RaiseViewCut {
  const chip = cut.final
    ? history
      ? 'Earlier final'
      : 'Shipped'
    : cut.candidate
      ? 'Final candidate'
      : cut.approved
        ? 'Approved'
        : undefined;
  const tone: RaiseStatus | undefined = cut.final ? (history ? 'kept' : 'shipped') : cut.candidate ? 'pick' : cut.approved ? 'kept' : undefined;
  const about = [cut.about, cut.note].filter(Boolean).join('. ') || undefined;
  if (cut.kind === 'audio' && cut.film) {
    return { key: cut.name, kind: 'audio', label: cut.label, about, chip, tone, src: fileUrl(cut.film), image: fileUrl(cut.preview), w: cut.w, h: cut.h };
  }
  if (cut.kind === 'film' && cut.film) {
    return {
      key: cut.name,
      kind: 'film',
      label: cut.label,
      about,
      chip,
      tone,
      src: fileUrl(cut.film),
      image: cut.poster ? fileUrl(cut.poster) : undefined,
      w: cut.w,
      h: cut.h,
    };
  }
  return { key: cut.name, kind: 'still', label: cut.label, about, chip, tone, image: fileUrl(cut.preview), full: fileUrl(cut.full ?? cut.preview), w: cut.w, h: cut.h };
}

/** The cuts of one deliverable: the shipped ones in the frame, or its first when none shipped; every other one folded. */
function splitCuts(cuts: readonly RaiseCut[], history: boolean): { main: RaiseViewCut[]; others: RaiseViewCut[] } {
  const finals = cuts.filter((cut) => cut.final);
  const main = finals.length ? finals : cuts.slice(0, 1);
  const rest = cuts.filter((cut) => !main.includes(cut));
  return { main: main.map((cut) => showCut(cut, history)), others: rest.map((cut) => showCut(cut, history)) };
}

/** Appends the cuts whose files the list does not hold yet. */
function addNew(into: RaiseCut[], cuts: readonly RaiseCut[]): void {
  const seen = new Set(into.map(cutPath));
  for (const cut of cuts) {
    if (seen.has(cutPath(cut))) continue;
    seen.add(cutPath(cut));
    into.push(cut);
  }
}

/** The groups of the run of show by id. */
const READY = 'ready';
const HISTORY = 'history';

/** The row's id: the store's item id without the Ready group's prefix. */
function rowId(item: RaiseDeliverable): string {
  return item.id.replace(/^ready-/, '');
}

/** The current product film from /motion that replaces the launch's translation demo. */
export const DEMO_FILM_SLUG = 'gif-how-gt-works';

function demoRow(film: MotionFilm | undefined): RaiseViewRow | null {
  const media = film?.media;
  if (!film || !media) return null;
  return {
    id: 'translation-demo',
    n: '',
    title: 'Translation demo',
    place: 'X, LinkedIn and the blog',
    note: 'The product film /motion shows today. The demo cut for the launch is under History.',
    main: [
      {
        key: film.slug,
        kind: 'film',
        label: film.title,
        about: `16:9, 1920 x 1080, ${film.runtime ?? film.length}`,
        chip: 'Current',
        tone: 'shipped',
        src: media.video,
        image: media.poster,
        w: 1920,
        h: 1080,
      },
    ],
    others: [],
    link: { href: `/motion#${film.id}`, label: 'See it on /motion' },
  };
}

/** The finals and the history rows, numbered in reading order. */
function showRows(raise: Raise, demo: MotionFilm | undefined): { finals: RaiseViewRow[]; history: RaiseViewRow[] } {
  const groups = raise.data.show;
  const ready = groups.find((group) => group.id === READY)?.items ?? [];
  const posting = groups.filter((group) => group.id !== READY && group.id !== HISTORY).flatMap((group) => group.items);

  /* each posting item joins the Ready item it shares the most files with */
  const merged = new Map<string, RaiseCut[]>(ready.map((item) => [item.id, [...item.cuts]]));
  const own: RaiseDeliverable[] = [];
  for (const item of posting) {
    const paths = new Set(item.cuts.map(cutPath));
    let best: RaiseDeliverable | null = null;
    let bestShared = 0;
    for (const candidate of ready) {
      const shared = candidate.cuts.filter((cut) => paths.has(cutPath(cut))).length;
      if (shared > bestShared) {
        best = candidate;
        bestShared = shared;
      }
    }
    if (best) addNew(merged.get(best.id) as RaiseCut[], item.cuts);
    else own.push(item);
  }

  const finals: RaiseViewRow[] = [];
  for (const item of ready) {
    const cuts = merged.get(item.id) ?? item.cuts;
    finals.push({ id: rowId(item), n: '', title: item.title, place: item.place, ...splitCuts(cuts, false) });
  }
  /* the translation demo after the launch films, where the launch posted it */
  const demoAt = finals.findIndex((row) => row.id === 'launch') + 1;
  const demoView = demoRow(demo);
  if (demoView) finals.splice(demoAt, 0, demoView);
  for (const item of own) {
    const note =
      item.state === 'progress' ? 'Still in progress.' : item.state === 'alternates' ? 'Alternates that were not posted.' : undefined;
    finals.push({ id: rowId(item), n: '', title: item.title, place: item.place, note, ...splitCuts(item.cuts, false) });
  }

  const history: RaiseViewRow[] = (groups.find((group) => group.id === HISTORY)?.items ?? []).map((item) => ({
    id: item.id,
    n: '',
    title: item.title,
    place: item.place,
    ...splitCuts(item.cuts, true),
  }));

  let n = 0;
  for (const row of [...finals, ...history]) row.n = pad2(++n);
  return { finals, history };
}

/** Up to four of the files a round showed: its shipped, picked and kept files first. */
function roundThumbs(round: RaiseRound): RaiseViewCut[] {
  const rank = (item: RaiseItem) => (item.status === 'shipped' ? 0 : item.status === 'pick' ? 1 : item.status === 'kept' ? 2 : 3);
  const shown = round.items.filter((item) => item.kind !== 'film' || item.poster);
  return [...shown]
    .map((item, i) => ({ item, i }))
    .sort((a, b) => rank(a.item) - rank(b.item) || a.i - b.i)
    .slice(0, 4)
    .map(({ item }) => itemCut(item));
}

function roundRows(raise: Raise, from: number): RaiseViewRound[] {
  return raise.data.rounds.map((round, i) => ({
    id: roundId(round.id),
    slug: round.id,
    n: pad2(from + i),
    tag: round.tag,
    title: round.title,
    date: round.date,
    day: dayLabel(round.date),
    part: raise.data.parts[round.part]?.title ?? round.part,
    state: round.state,
    lead: raise.text[round.id]?.lead ?? round.made ?? '',
    shown: round.items.length,
    more: round.more?.length ?? 0,
    thumbs: roundThumbs(round),
  }));
}

/** The four shell sections, for the index (`index`) or a round's or the method's page (its slug). */
function shellSections(route: string, finals: readonly RaiseViewRow[], history: readonly RaiseViewRow[], rounds: readonly RaiseViewRound[], methodN: string): ShellSection[] {
  const inPage = (row: RaiseViewRow): ShellItem =>
    route === 'index'
      ? { id: row.id, n: row.n, title: row.title, desc: row.place, inPlace: true }
      : { id: row.id, n: row.n, title: row.title, desc: row.place, href: `/raise#${row.id}` };
  return [
    { id: SECTION.finals, label: SECTION_LABEL.finals, under: 'raise', items: finals.map(inPage) },
    { id: SECTION.history, label: SECTION_LABEL.history, under: 'raise', items: history.map(inPage) },
    {
      id: SECTION.rounds,
      label: SECTION_LABEL.rounds,
      under: 'raise',
      items: rounds.map((round) => ({ id: round.id, n: round.n, title: round.title, desc: `${round.tag}, ${round.day}. ${round.lead}`, href: `/raise/${round.slug}` })),
    },
    {
      id: SECTION.method,
      label: SECTION_LABEL.method,
      under: 'raise',
      items: [{ id: METHOD_ID, n: methodN, title: METHOD_TITLE, desc: METHOD_LEAD, href: `/raise/${METHOD_SLUG}` }],
    },
  ];
}

/** Everything the index and the record pages read, for one route. */
export function raiseIndex(raise: Raise, demo: MotionFilm | undefined, route = 'index'): RaiseIndex {
  const { finals, history } = showRows(raise, demo);
  const rounds = roundRows(raise, finals.length + history.length + 1);
  const methodN = pad2(finals.length + history.length + rounds.length + 1);
  const first = raise.data.rounds[0];
  const last = raise.data.rounds.at(-1);
  return {
    title: raise.text.overview?.title ?? raise.data.title,
    finals,
    history,
    rounds,
    method: { id: METHOD_ID, n: methodN, title: METHOD_TITLE, lead: METHOD_LEAD, subjects: METHOD.map((section) => section.heading) },
    span: first && last ? { from: dayLabel(first.date), to: dayLabel(last.date) } : null,
    sections: shellSections(route, finals, history, rounds, methodN),
  };
}
