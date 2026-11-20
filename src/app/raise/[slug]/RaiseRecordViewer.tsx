'use client';

import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';

import { BookHead } from '@/components/viewer/BookView';
import type { IconName } from '@/components/viewer/icons';
import { Sheet } from '@/components/viewer/Sheet';
import type { SubRows } from '@/components/viewer/Sidebar';
import { useReadLine } from '@/components/viewer/useReadLine';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import type { PageUpdated } from '@/lib/page-updated';
import type { ShellMode, ShellSection } from '@/lib/shell-data';
import { flattenShellItems, pad2 } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import type { RaiseViewCut } from '../model';
import { CutGrid } from '../RaiseMedia';

import '../../prototemplate.css';
import '@/components/book/book.css';
import '../../graphics/graphics.css';
import '../raise.css';

const TITLE = 'Raise';
const MODES: readonly ShellMode[] = ['book'];

/** One fact of the head's panel: plain data, so the server page can pass it. */
type RecordFact = { icon: IconName; key: string; value: string | number };

/** One part of a record: its prose, then a round's files, or its other files folded by folder. */
export type RaiseRecordPart = {
  id: string;
  title: string;
  /** the divider's right-hand note */
  note: string;
  paragraphs: readonly string[];
  /** the method's rules */
  points?: readonly string[];
  /** a round's files, shown */
  cuts?: readonly RaiseViewCut[];
  /** a round's other files by folder, folded */
  folded?: readonly { name: string; cuts: readonly RaiseViewCut[] }[];
};

/** A round or the method as the server page shapes it. */
export type RaiseRecord = {
  kind: 'round' | 'method';
  /** its item id in the list */
  id: string;
  title: string;
  lead: string;
  /** the panel's three facts after Updated */
  facts: readonly [RecordFact, RecordFact, RecordFact];
  parts: readonly RaiseRecordPart[];
};

function writeHash(id: string | null): void {
  try {
    const base = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, '', id ? `${base}#${encodeURIComponent(id)}` : base);
  } catch {
    // a sandboxed document: the jump still lands, the address does not change
  }
}

function readHash(): string {
  const raw = window.location.hash.slice(1);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** A part's body: its paragraphs, its rules, its files, and its folded folders. */
function PartBody({ part, title }: { part: RaiseRecordPart; title: string }) {
  return (
    <>
      {part.paragraphs.map((line) => (
        <p key={line}>{line}</p>
      ))}
      {part.points?.length ? (
        <ul>
          {part.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      ) : null}
      {part.cuts?.length ? <CutGrid title={title} cuts={part.cuts} className='ra-files' /> : null}
      {part.folded?.map((group) => (
        <details key={group.name} className='ra-more'>
          <summary>
            {group.name}, {group.cuts.length} {group.cuts.length === 1 ? 'file' : 'files'}
          </summary>
          <CutGrid title={title} cuts={group.cuts} />
        </details>
      ))}
    </>
  );
}

type RaiseRecordViewerProps = {
  slug: string;
  record: RaiseRecord;
  /** /raise's four sections, with this record's row as the active one */
  sections: readonly ShellSection[];
  /** the /raise entry in src/lib/updated.ts */
  updated: PageUpdated;
};

/**
 * A round or the method on the viewer shell, in the format of a /motion
 * package: /raise's sections in the list with this record's row marked
 * and its parts as rows under it, and the record as a book in the reading
 * column (the head with its facts and a contents list, then each part
 * under its divider in the book's prose grammar). The read line marks the
 * part under it; a contents link or a part's row jumps the sheet there and
 * writes `#<part>` to the address. Another row in the list navigates.
 */
export default function RaiseRecordViewer({ slug, record, sections, updated }: RaiseRecordViewerProps) {
  const router = useRouter();
  const [activePart, setActivePart] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const { scrollTo } = useReadLine({
    rootRef: sheetRef,
    selector: '.ra-part',
    active: activePart ?? '',
    select: (id) => setActivePart(id || null),
    idOf: (el) => el.dataset.section ?? '',
    none: '',
    follow: false,
  });

  const jump = (id: string): boolean => {
    const root = sheetRef.current;
    const section = root?.querySelector<HTMLElement>(`.ra-part[data-section="${CSS.escape(id)}"]`);
    const target = section?.querySelector<HTMLElement>('.ptd-sec');
    if (!root || !section || !target) return false;
    scrollTo(target, 'auto', section);
    setActivePart(id);
    return true;
  };
  const go = (id: string) => {
    if (jump(id)) writeHash(id);
  };
  const goRef = useRef(go);
  goRef.current = go;

  const { id: recordId, parts } = record;
  const subRows: SubRows = useCallback(
    (item) =>
      item.id === recordId
        ? parts.map((part) => ({
            id: `${recordId}-${part.id}`,
            title: part.title,
            href: `/raise/${slug}#${part.id}`,
            active: part.id === activePart,
            onSelect: () => goRef.current(part.id),
          }))
        : null,
    [recordId, parts, slug, activePart]
  );

  const items = useMemo(() => flattenShellItems(sections), [sections]);

  const onContents = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    go(id);
  };

  useMountEffect(() => {
    const hash = readHash();
    if (!hash) return;
    const frame = requestAnimationFrame(() => jump(hash));
    document.fonts?.ready.then(() => jump(hash)).catch(() => {});
    return () => cancelAnimationFrame(frame);
  });

  const onSelect = (id: string) => {
    if (id === recordId) {
      sheetRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      writeHash(null);
      return;
    }
    const next = items.find((item) => item.id === id);
    if (next?.href) router.push(next.href);
  };

  return (
    <ViewerShell
      id='raise'
      title={TITLE}
      mark='pt'
      count={`${items.length} pieces`}
      sections={sections}
      active={recordId}
      modes={MODES}
      thumb='row'
      surfaces='site'
      keys='flow'
      noun='piece'
      subRows={subRows}
      onSelect={onSelect}
    >
      <Sheet variant='flow' scrollRef={sheetRef}>
        <div className='ptd-book ra-book pt-book-col'>
          <BookHead
            title={record.title}
            lead={record.lead}
            updated={updated}
            facts={record.facts}
            contents={
              <nav className='ptd-toc pt-book-toc' aria-label='Contents'>
                {parts.map((part, i) => (
                  <a
                    key={part.id}
                    href={`#${part.id}`}
                    aria-current={part.id === activePart ? 'true' : undefined}
                    onClick={(e) => onContents(e, part.id)}
                  >
                    <span>{part.title}</span>
                    <small>{pad2(i + 1)}</small>
                  </a>
                ))}
              </nav>
            }
          />

          {parts.map((part, i) => (
            <section
              key={part.id}
              id={part.id}
              className='pt-book-part ptd-doc ra-part'
              data-section={part.id}
              aria-labelledby={`ra-${part.id}`}
            >
              <div className='ptd-sec pt-book-sec'>
                <small>
                  <span>Section {i + 1}</span>
                  <span>{part.note}</span>
                </small>
                <h2 id={`ra-${part.id}`}>{part.title}</h2>
              </div>
              <div className={cn('ptd-row', part.id === activePart && 'is-active')}>
                <div className='ptd-pn' aria-hidden='true' />
                <div className={cn('ptd-body pt-root', (part.cuts || part.folded) && 'ra-wide')}>
                  <PartBody part={part} title={record.title} />
                </div>
              </div>
            </section>
          ))}
        </div>
      </Sheet>
    </ViewerShell>
  );
}
