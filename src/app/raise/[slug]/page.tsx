import { notFound } from 'next/navigation';

import { getMotionFilm } from '@/lib/motion';
import { dayLabel, loadRaise } from '@/lib/raise';
import type { Raise } from '@/lib/raise';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import { METHOD, METHOD_LEAD, METHOD_SLUG, METHOD_TITLE } from '../method';
import { DEMO_FILM_SLUG, itemCut, raiseIndex } from '../model';
import { METHOD_ID, roundId, stateWord } from '../sections';
import type { RaiseRecord, RaiseRecordPart } from './RaiseRecordViewer';
import RaiseRecordViewer from './RaiseRecordViewer';

/* the rounds are built from the store and built again from it at most every five minutes, so a sync shows within that time */
export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

/** The method and every round, from the store at build time; the method alone when the store cannot be read, and a round renders on its first request. */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const raise = await loadRaise();
  return [{ slug: METHOD_SLUG }, ...(raise?.data.rounds.map((round) => ({ slug: round.id })) ?? [])];
}

/** A round's description: its account's lead when that reads whole in a search snippet (50 to 160 characters), else one built from its tag and title. */
function describe(raise: Raise | null, slug: string): { title: string; description: string } | null {
  if (slug === METHOD_SLUG) return { title: METHOD_TITLE, description: METHOD_LEAD };
  const round = raise?.data.rounds.find((r) => r.id === slug);
  if (!raise || !round) return null;
  const lead = raise.text[slug]?.lead;
  const fits = !!lead && lead.length >= 50 && lead.length <= 160;
  return { title: `Raise ${round.tag}`, description: fits ? lead : `Round ${round.tag} of the funding announcement media: ${round.title}.` };
}

function recordRoute(slug: string, head: { title: string; description: string }) {
  return seoRoute({
    path: `/raise/${slug}`,
    title: head.title,
    kind: 'page',
    description: head.description,
    crumbs: [{ name: 'Raise', path: '/raise' }],
    updated: requireUpdated('/raise'),
  });
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const head = describe(await loadRaise(), slug);
  if (!head) notFound();
  return recordRoute(slug, head).metadata;
}

/** The method as a record: one part per subject, its lead and its points. */
function methodRecord(): RaiseRecord {
  return {
    kind: 'method',
    id: METHOD_ID,
    title: METHOD_TITLE,
    lead: METHOD_LEAD,
    facts: [
      { icon: 'document', key: 'Subjects', value: METHOD.length },
      { icon: 'queue-list', key: 'Rules', value: METHOD.reduce((n, section) => n + section.points.length, 0) },
      { icon: 'people', key: 'From', value: 'The launch lanes’ notes' },
    ],
    parts: METHOD.map((section) => ({ id: section.id, title: section.heading, note: `${section.points.length} rules`, paragraphs: [section.lead], points: section.points })),
  };
}

/** A round as a record: how it was directed, what it made, what carried forward, and every other file grouped by its folder. */
function roundRecord(raise: Raise, slug: string): RaiseRecord | null {
  const round = raise.data.rounds.find((r) => r.id === slug);
  if (!round) return null;
  const account = raise.text[round.id] ?? {};
  const more = round.more ?? [];
  const groups = new Map<string, typeof more>();
  for (const item of more) {
    const name = item.group || 'Other files';
    groups.set(name, [...(groups.get(name) ?? []), item]);
  }
  const parts: RaiseRecordPart[] = [];
  if (account.directed?.length) parts.push({ id: 'directed', title: 'How it was directed', note: 'The account', paragraphs: account.directed });
  parts.push({
    id: 'made',
    title: 'What was made',
    note: `${round.items.length} ${round.items.length === 1 ? 'file' : 'files'}`,
    paragraphs: round.made ? [round.made] : round.items.length ? [] : ['The round showed no files.'],
    cuts: round.items.map(itemCut),
  });
  if (round.outcome) parts.push({ id: 'outcome', title: 'What carried forward', note: 'The outcome', paragraphs: [round.outcome] });
  if (more.length) {
    parts.push({
      id: 'more',
      title: 'Every other file',
      note: `${more.length} ${more.length === 1 ? 'file' : 'files'}`,
      paragraphs: ['The files the round produced beyond the ones it showed: drafts, alternates and sheets, by the folder each came from.'],
      folded: [...groups].map(([name, items]) => ({ name, cuts: items.map(itemCut) })),
    });
  }
  return {
    kind: 'round',
    id: roundId(round.id),
    title: round.title,
    lead: account.lead ?? round.made ?? `Round ${round.tag} of the funding announcement media.`,
    facts: [
      { icon: 'duration', key: 'Date', value: `${dayLabel(round.date)}${round.state !== 'done' ? `, ${stateWord(round.state).toLowerCase()}` : ''}` },
      { icon: 'queue-list', key: 'Round', value: `${round.tag}, ${(raise.data.parts[round.part]?.title ?? round.part).replace(/^The /, 'the ')}` },
      { icon: 'photo', key: 'Files', value: `${round.items.length} shown${more.length ? `, ${more.length} more` : ''}` },
    ],
    parts,
  };
}

/**
 * /raise/method and /raise/<round>: the method, or one round of the
 * funding announcement media, on the viewer shell with /raise's sections
 * in the list and the record as a book in the reading column. A round is
 * read from the Blob store (src/lib/raise.ts) and rebuilt from it every
 * five minutes; the method is this repository's own text (method.ts). The
 * key on the viewer makes a change of slug a fresh mount.
 */
export default async function RaiseRecordPage({ params }: Params) {
  const { slug } = await params;
  const raise = await loadRaise();
  const head = describe(raise, slug);
  const record = slug === METHOD_SLUG ? methodRecord() : raise ? roundRecord(raise, slug) : null;
  if (!head || !record) notFound();
  const sections = raise ? raiseIndex(raise, getMotionFilm(DEMO_FILM_SLUG), slug).sections : [];
  return (
    <>
      <JsonLd nodes={recordRoute(slug, head).jsonLd} />
      <RaiseRecordViewer key={slug} slug={slug} record={record} sections={sections} updated={requireUpdated('/raise')} />
    </>
  );
}
