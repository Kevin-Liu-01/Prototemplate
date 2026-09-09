'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createPortal } from 'react-dom';

import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
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
import { surfaceGroups } from '@/lib/surfaces';
import type { SurfaceGroup } from '@/lib/surfaces';
import { useMountEffect } from '@/lib/use-mount-effect';

import './archive.css';

/**
 * The archive on the viewer shell: one retired version at a time, its
 * full-page capture at 1440 pixels wide in a flow sheet under a ruled
 * record (the name, the capture date, the source address, the last commit
 * that held the code). The sidebar keeps the one order every route keeps:
 * Pages, Documents, Sites and Explorations as site map rows, then Archive
 * as the shell's own section with the eleven captures as thumbs. Selecting
 * another version navigates to its address; selecting a site map row leaves
 * for that page. Keys are flow, so Space and the arrows scroll the capture.
 */
const ARCHIVE_TITLE = 'Archive';
const ARCHIVE_MODES: readonly ShellMode[] = ['book'];

/** the shell's list box, the host the site map rows are portaled into */
const SIDEBAR_LIST = '.pt-viewer[data-shell="archive"] .pt-sb .pt-thumbs';

/** the site map groups above the archive, in the one order */
const NAV_GROUPS: readonly SurfaceGroup[] = ['Pages', 'Documents', 'Sites', 'Explorations'];

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

const NAV_ROWS = surfaceGroups('site').filter((entry) => NAV_GROUPS.includes(entry.group));

/**
 * The site map above the shell's own section: Pages, Documents, Sites and
 * Explorations as rows in the ListRow grammar, portaled into the sidebar's
 * list box and ordered first by CSS. Rows are links, so every page is one
 * click away; on a narrow screen a click also closes the overlay list. The
 * host exists from the first paint because the sidebar always renders its
 * list in book mode, the only mode this route offers.
 */
function SiteMapNav() {
  const shell = usePtShell();
  const [host, setHost] = useState<HTMLElement | null>(null);

  useMountEffect(() => {
    setHost(document.querySelector<HTMLElement>(SIDEBAR_LIST));
  });

  if (!host) return null;
  return createPortal(
    <div className='ar-nav'>
      {NAV_ROWS.map((group) => (
        <div className='ar-nav-group' key={group.group}>
          <div className='pt-sec-label'>{group.group}</div>
          {group.rows.map((row) => (
            <Link
              key={row.id}
              className='pt-row ar-nav-row'
              href={row.href}
              title={row.desc}
              onClick={() => {
                if (shell.narrow) shell.setSidebar(false);
              }}
            >
              <span className='n' aria-hidden='true' />
              <span className='pt-row-title'>{row.name}</span>
            </Link>
          ))}
        </div>
      ))}
    </div>,
    host
  );
}

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
          was deleted. The code stays in the repository history under commit {item.lastCommit}; the route left in
          the commit that followed it, {ARCHIVE_DELETION.subject}, on branch {ARCHIVE_DELETION.branch}.
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
      <SiteMapNav />
      {item ? <ArchiveStage item={item} /> : null}
    </ViewerShell>
  );
}
