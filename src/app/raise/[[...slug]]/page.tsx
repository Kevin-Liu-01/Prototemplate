import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/notebook/page';

import { formatLongDay } from '@/lib/dates';
import { duration, FINALS, fileUrl, loadRaise, roundsByDay } from '@/lib/raise';
import type { Raise, RaiseCut, RaiseItem, RaiseRound, RaiseText } from '@/lib/raise';
import { seoRoute } from '@/lib/seo/route';

type Params = { params: Promise<{ slug?: string[] }> };

type TocItem = { title: ReactNode; url: string; depth: number };

/** The one description every raise page carries: the page is private, so its head says what it is and nothing of the launch. */
const DESCRIPTION = 'A private record of one launch’s media, round by round, with an account of how each round was directed.';

/** The page's tab title: the round's tag alone, so a link that unfurls shows no launch copy. */
function titleOf(raise: Raise | null, slug: string | undefined): string {
  if (!slug) return 'Raise';
  if (slug === FINALS) return 'Raise finals';
  const round = raise?.data.rounds.find((r) => r.id === slug);
  return round ? `Raise ${round.tag}` : 'Raise';
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const rest = slug?.length ? `/${slug.join('/')}` : '';
  const raise = await loadRaise();
  return seoRoute({ path: `/raise${rest}`, title: titleOf(raise, slug?.[0]), kind: 'page', description: DESCRIPTION, card: false })
    .metadata;
}

/** The chip on a file the round marked: kept, picked (and by whom), shipped, dropped or shown for reference. */
function statusLabel(item: { status?: RaiseItem['status']; by?: string }): string | null {
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
      return null;
  }
}

/** One file: a still or a sheet opens its full file in a new tab, a film plays in place. */
function Media({ item }: { item: RaiseItem }) {
  const status = statusLabel(item);
  return (
    <figure className='raise-media' data-kind={item.kind}>
      {item.kind === 'film' && item.film ? (
        <video
          className='raise-frame'
          controls
          playsInline
          preload='none'
          poster={item.poster ? fileUrl(item.poster) : undefined}
          width={item.w}
          height={item.h}
        >
          <source src={fileUrl(item.film)} type='video/mp4' />
        </video>
      ) : (
        <a className='raise-frame' href={fileUrl(item.full ?? item.preview)} target='_blank' rel='noreferrer'>
          <img src={fileUrl(item.preview)} width={item.pw} height={item.ph} loading='lazy' decoding='async' alt={item.caption ?? ''} />
        </a>
      )}
      <figcaption>
        <span className='raise-caption'>
          {item.caption ?? item.key}
          {item.kind === 'film' && item.dur ? <span className='raise-quiet'> {duration(item.dur)}</span> : null}
        </span>
        {status ? (
          <span className='raise-chip' data-status={item.status}>
            {status}
          </span>
        ) : null}
        {item.note ? <span className='raise-note'>{item.note}</span> : null}
      </figcaption>
    </figure>
  );
}

/** One cut of a deliverable in the run of show: a still, a film, or a score candidate with its waveform. */
function Cut({ cut }: { cut: RaiseCut }) {
  return (
    <figure className='raise-media' data-kind={cut.kind}>
      {cut.kind === 'film' && cut.film ? (
        <video
          className='raise-frame'
          controls
          playsInline
          preload='none'
          poster={cut.poster ? fileUrl(cut.poster) : undefined}
          width={cut.w}
          height={cut.h}
        >
          <source src={fileUrl(cut.film)} type='video/mp4' />
        </video>
      ) : cut.kind === 'audio' && cut.film ? (
        <div className='raise-frame raise-track'>
          <img src={fileUrl(cut.preview)} width={cut.pw} height={cut.ph} loading='lazy' decoding='async' alt='' />
          <audio controls preload='none' src={fileUrl(cut.film)} />
        </div>
      ) : (
        <a className='raise-frame' href={fileUrl(cut.full ?? cut.preview)} target='_blank' rel='noreferrer'>
          <img src={fileUrl(cut.preview)} width={cut.pw} height={cut.ph} loading='lazy' decoding='async' alt={cut.label} />
        </a>
      )}
      <figcaption>
        <span className='raise-caption'>{cut.label}</span>
        {cut.final ? (
          <span className='raise-chip' data-status='shipped'>
            Final
          </span>
        ) : cut.candidate ? (
          <span className='raise-chip' data-status='pick'>
            Final candidate
          </span>
        ) : cut.approved ? (
          <span className='raise-chip' data-status='kept'>
            Approved
          </span>
        ) : null}
        <span className='raise-note'>
          {cut.about}
          {cut.note ? `. ${cut.note}` : ''}
        </span>
      </figcaption>
    </figure>
  );
}

function Paragraphs({ lines }: { lines?: readonly string[] }) {
  return lines?.map((line) => <p key={line}>{line}</p>) ?? null;
}

/** The facts under the lead: the date, then the page's own facts. */
function Facts({ items }: { items: readonly (string | null | undefined)[] }) {
  return (
    <div className='docs-meta' data-docs-meta=''>
      <p className='docs-updated raise-facts'>
        {items.filter(Boolean).map((item) => (
          <span key={item}>{item}</span>
        ))}
      </p>
    </div>
  );
}

const STATE: Record<string, string> = { done: 'Done', stopped: 'Stopped', 'in-progress': 'In progress' };

function OverviewPage({ raise }: { raise: Raise }) {
  const { data, text } = raise;
  const intro: RaiseText = text.overview ?? {};
  const days = roundsByDay(data.rounds);
  const first = data.rounds[0];
  const toc: TocItem[] = [
    { title: 'How the work was directed', url: '#process', depth: 2 },
    { title: 'Rounds', url: '#rounds', depth: 2 },
    ...days.map((day) => ({ title: day.label, url: `#day-${day.day}`, depth: 3 })),
    { title: 'Finals', url: '#finals', depth: 2 },
  ];
  return (
    <DocsPage toc={toc} breadcrumb={{ enabled: false }}>
      <DocsTitle>{intro.title ?? data.title}</DocsTitle>
      {intro.lead ? <DocsDescription className='docs-lead'>{intro.lead}</DocsDescription> : null}
      <Facts items={[first ? `From ${formatLongDay(first.date)}` : null, `${data.rounds.length} rounds`]} />
      <DocsBody>
        <h2 id='process'>How the work was directed</h2>
        <Paragraphs lines={intro.body} />
        <h2 id='rounds'>Rounds</h2>
        {days.map((day) => (
          <section key={day.day} aria-labelledby={`day-${day.day}`}>
            <h3 id={`day-${day.day}`}>{day.label}</h3>
            <Cards>
              {day.rounds.map((round) => (
                <Card
                  key={round.id}
                  href={`/raise/${round.id}`}
                  title={`${round.tag}: ${round.title}`}
                  description={text[round.id]?.lead ?? round.made ?? ''}
                />
              ))}
            </Cards>
          </section>
        ))}
        <h2 id='finals'>Finals</h2>
        <Cards>
          <Card href={`/raise/${FINALS}`} title='Run of show' description={text.finals?.lead ?? ''} />
        </Cards>
      </DocsBody>
    </DocsPage>
  );
}

/** A round's other files, grouped by the folder each came from. */
function More({ items }: { items: readonly RaiseItem[] }) {
  const groups = new Map<string, RaiseItem[]>();
  for (const item of items) {
    const name = item.group || 'Other files';
    groups.set(name, [...(groups.get(name) ?? []), item]);
  }
  return (
    <details className='raise-more'>
      <summary>
        Show {items.length} {items.length === 1 ? 'file' : 'files'}
      </summary>
      {[...groups].map(([name, group]) => (
        <section key={name}>
          <h3>{name}</h3>
          <div className='raise-grid'>
            {group.map((item) => (
              <Media key={item.key} item={item} />
            ))}
          </div>
        </section>
      ))}
    </details>
  );
}

function RoundPage({ raise, round }: { raise: Raise; round: RaiseRound }) {
  const account = raise.text[round.id] ?? {};
  const more = round.more ?? [];
  const toc: TocItem[] = [
    ...(account.directed?.length ? [{ title: 'How it was directed', url: '#directed', depth: 2 }] : []),
    { title: 'What was made', url: '#made', depth: 2 },
    ...(round.outcome ? [{ title: 'What carried forward', url: '#outcome', depth: 2 }] : []),
    ...(more.length ? [{ title: 'Every other file', url: '#more', depth: 2 }] : []),
  ];
  return (
    <DocsPage toc={toc} breadcrumb={{ enabled: false }}>
      <DocsTitle>{round.title}</DocsTitle>
      {account.lead ? <DocsDescription className='docs-lead'>{account.lead}</DocsDescription> : null}
      <Facts
        items={[formatLongDay(round.date), round.version, raise.data.parts[round.part]?.title, STATE[round.state] ?? null]}
      />
      <DocsBody>
        {account.directed?.length ? (
          <>
            <h2 id='directed'>How it was directed</h2>
            <Paragraphs lines={account.directed} />
          </>
        ) : null}
        <h2 id='made'>What was made</h2>
        {round.made ? <p>{round.made}</p> : null}
        {round.items.length ? (
          <div className='raise-grid'>
            {round.items.map((item) => (
              <Media key={item.key} item={item} />
            ))}
          </div>
        ) : (
          <p>The round showed no files.</p>
        )}
        {round.outcome ? (
          <>
            <h2 id='outcome'>What carried forward</h2>
            <p>{round.outcome}</p>
          </>
        ) : null}
        {more.length ? (
          <>
            <h2 id='more'>Every other file</h2>
            <p>The files the round produced beyond the ones it showed: drafts, alternates and sheets.</p>
            <More items={more} />
          </>
        ) : null}
      </DocsBody>
    </DocsPage>
  );
}

function FinalsPage({ raise }: { raise: Raise }) {
  const { show } = raise.data;
  const intro: RaiseText = raise.text.finals ?? {};
  const toc: TocItem[] = show.flatMap((group) => [
    { title: group.title, url: `#${group.id}`, depth: 2 },
    ...group.items.map((item) => ({ title: item.title, url: `#${group.id}-${item.id}`, depth: 3 })),
  ]);
  const cuts = show.reduce((n, group) => n + group.items.reduce((m, item) => m + item.cuts.length, 0), 0);
  return (
    <DocsPage toc={toc} breadcrumb={{ enabled: false }}>
      <DocsTitle>{intro.title ?? 'Finals'}</DocsTitle>
      {intro.lead ? <DocsDescription className='docs-lead'>{intro.lead}</DocsDescription> : null}
      <Facts items={[`${show.length} groups`, `${cuts} cuts`]} />
      <DocsBody>
        <Paragraphs lines={intro.body} />
        {show.map((group) => (
          <section key={group.id} aria-labelledby={group.id}>
            <h2 id={group.id}>{group.title}</h2>
            {group.items.map((item) => (
              <section key={item.id} aria-labelledby={`${group.id}-${item.id}`}>
                <h3 id={`${group.id}-${item.id}`}>{item.title}</h3>
                <p className='raise-quiet'>
                  {item.place}
                  {item.state === 'ready' ? ', ready' : item.state === 'progress' ? ', in progress' : ''}
                </p>
                <div className='raise-grid'>
                  {item.cuts.map((cut) => (
                    <Cut key={cut.name} cut={cut} />
                  ))}
                </div>
              </section>
            ))}
          </section>
        ))}
      </DocsBody>
    </DocsPage>
  );
}

/**
 * /raise, /raise/<round> and /raise/finals: the overview, one round, or the
 * run of show, rendered on each request from the private store
 * (src/lib/raise.ts). Every word and file comes from the store; this file
 * holds only the structure. A store that cannot be read shows one line.
 */
export default async function Page({ params }: Params) {
  const { slug = [] } = await params;
  if (slug.length > 1) notFound();
  const raise = await loadRaise();
  if (!raise) {
    return (
      <DocsPage breadcrumb={{ enabled: false }}>
        <DocsTitle>Raise</DocsTitle>
        <DocsBody>
          <p>The record could not be read from the store.</p>
        </DocsBody>
      </DocsPage>
    );
  }
  const [id] = slug;
  if (id === undefined) return <OverviewPage raise={raise} />;
  if (id === FINALS) return <FinalsPage raise={raise} />;
  const round = raise.data.rounds.find((r) => r.id === id);
  if (!round) notFound();
  return <RoundPage raise={raise} round={round} />;
}
