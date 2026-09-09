'use client';

import { useRouter } from 'next/navigation';

import { Sheet } from '@/components/viewer/Sheet';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import {
  ARCHIVE,
  ARCHIVE_DELETION,
  archiveDate,
  archiveDesc,
  archiveFull,
  archiveHost,
  archiveShot,
  getArchiveEntry,
} from '@/lib/archive';
import type { ArchiveEntry } from '@/lib/archive';
import type { ShellItem, ShellMode, ShellSection } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';

import './archive.css';

/**
 * The archive on the viewer shell: one retired version at a time, its
 * full-page capture at 1440 pixels wide in a flow sheet under a ruled
 * record (the name, the capture date, the source address, the last commit
 * that held the code) and a line saying the image is a picture. The shell
 * draws the site map in its one order (Pages, Documents, Sites,
 * Explorations) and this route's Archive section replaces the Archive
 * group, with the eleven captures as items and the current one marked and
 * scrolled into view. Selecting another version navigates to its address.
 * Keys are flow, so Space and the arrows scroll the capture.
 */
const ARCHIVE_TITLE = 'Archive';
const ARCHIVE_MODES: readonly ShellMode[] = ['book'];

function archiveItem(item: ArchiveEntry, index: number): ShellItem {
  return {
    id: item.slug,
    n: pad2(index + 1),
    title: item.name,
    href: `/archive/${item.slug}`,
    desc: archiveDesc(item),
    shot: { light: archiveShot(item) },
  };
}

const SECTIONS: readonly ShellSection[] = [
  { id: 'archive', label: 'Archive', items: ARCHIVE.map(archiveItem) },
];

/** The record and the capture, in the flow sheet widened to the capture's own 1440 pixels. */
function ArchiveStage({ item }: { item: ArchiveEntry }) {
  return (
    <Sheet variant='flow'>
      <article className='ar-doc'>
        <header className='ar-head'>
          <div className='ar-cell ar-cell-name'>
            <span className='ar-k'>Version</span>
            <h1>{item.name}</h1>
          </div>
          <div className='ar-cell'>
            <span className='ar-k'>Captured</span>
            <span className='ar-v'>{archiveDate(item)}</span>
          </div>
          <div className='ar-cell'>
            <span className='ar-k'>Source</span>
            <span className='ar-v'>
              <a href={item.source} target='_blank' rel='noreferrer'>
                {archiveHost(item)}
              </a>
            </span>
          </div>
          <div className='ar-cell'>
            <span className='ar-k'>Last commit</span>
            <span className='ar-v'>{item.lastCommit}</span>
          </div>
        </header>
        <p className='ar-note'>
          Captured at {item.width} pixels wide in the light theme, {item.fullHeight} pixels tall, before the route
          was deleted. The code stays in the repository history under commit {item.lastCommit}. The route was
          removed in the next commit, {ARCHIVE_DELETION.hash}, &ldquo;{ARCHIVE_DELETION.subject}&rdquo;, on
          branch {ARCHIVE_DELETION.branch}.
        </p>
        <p className='ar-static'>
          This is a static capture; nothing in it is live.{' '}
          <a href={archiveShot(item)} target='_blank' rel='noreferrer'>
            Open the 1440 by 900 crop
          </a>
        </p>
        <img
          className='ar-full'
          src={archiveFull(item)}
          width={item.width}
          height={item.fullHeight}
          alt={`${item.name}, the full page at ${item.width} pixels wide`}
        />
      </article>
    </Sheet>
  );
}

export type ArchiveViewerProps = { slug: string };

export default function ArchiveViewer({ slug }: ArchiveViewerProps) {
  const router = useRouter();
  const item = getArchiveEntry(slug) ?? ARCHIVE[0];

  const onSelect = (id: string) => {
    if (id === slug) return;
    const target = getArchiveEntry(id);
    if (target) router.push(`/archive/${target.slug}`);
  };

  return (
    <ViewerShell
      id='archive'
      title={ARCHIVE_TITLE}
      mark='pt'
      count={`${ARCHIVE.length} versions`}
      sections={SECTIONS}
      active={slug}
      modes={ARCHIVE_MODES}
      surfaces='site'
      thumb='shot'
      keys='flow'
      noun='version'
      onSelect={onSelect}
    >
      {item ? <ArchiveStage item={item} /> : null}
    </ViewerShell>
  );
}
