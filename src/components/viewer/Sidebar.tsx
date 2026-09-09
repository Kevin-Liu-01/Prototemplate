'use client';

import { Fragment, type ReactNode } from 'react';

import { cn } from '@/lib/cn';
import type {
  ShellItem,
  ShellMark,
  ShellSection,
  ShellThumb,
} from '@/lib/shell-data';

import { GtMark } from './GtMark';
import { activateOnKey, ListRow } from './ListRow';
import { PtMark } from './PtMark';
import { usePtShell } from './shell-context';
import { ThumbMini, type MiniSource } from './ThumbMini';
import { ThumbShot } from './ThumbShot';

import './Sidebar.css';

/**
 * Finds the nodes a 'mini' item clones. `index` is the item's position across
 * every section, in order. The default reads the deck stage: the nth .slide
 * under .stage.pt-slides, and that stage's .frame when it has one.
 */
export type MiniResolver = (item: ShellItem, index: number) => MiniSource;

/**
 * Rows a route hangs under an item: the headings under the active document
 * on /docs, the sub-beats under a slide on /present. Return null for none.
 */
export type SubRenderer = (item: ShellItem, active: boolean) => ReactNode;

export type ThumbListProps = {
  sections: readonly ShellSection[];
  thumb: ShellThumb;
  mini?: MiniResolver;
  renderSub?: SubRenderer;
  /** Defaults to the shell's select. GridView passes one that returns to slide mode first. */
  onSelect?: (id: string) => void;
  /** Scroll the active item into view when it changes or when the list becomes visible. */
  follow?: boolean;
  /** Extra classes on .pt-thumbs; the sidebar passes pt-scroll, the grid does not. */
  className?: string;
};

export type SidebarProps = {
  title: string;
  mark: ShellMark;
  /** `52 slides`, `17 directions`; already worded by the route. */
  count: string;
  sections: readonly ShellSection[];
  thumb: ShellThumb;
  mini?: MiniResolver;
  renderSub?: SubRenderer;
};

/**
 * The default MiniResolver, and the one a deck route passes to BookView's
 * renderPage: the nth .slide under the stage, plus the stage's .frame.
 */
export function stageMini(_item: ShellItem, index: number): MiniSource {
  const stage =
    document.querySelector('.pt-stagewrap .stage.pt-slides') ??
    document.querySelector('.stage.pt-slides');
  if (!stage) return { slide: null };
  return {
    slide: stage.querySelectorAll('.slide').item(index),
    frame: stage.querySelector('.frame'),
  };
}

/**
 * A ref callback, not an effect: React calls it when the active thumb
 * mounts or when the ref prop switches on, so the item follows every
 * selection and reappears in view when a hidden list is shown again.
 */
function scrollNearest(el: HTMLDivElement | null): void {
  if (!el) return;
  try {
    el.scrollIntoView({ block: 'nearest' });
  } catch {
    el.scrollIntoView();
  }
}

type ThumbItemProps = {
  item: ShellItem;
  index: number;
  thumb: 'mini' | 'shot';
  active: boolean;
  mini: MiniResolver;
  onSelect: (id: string) => void;
  follow: boolean;
};

function ThumbItem({
  item,
  index,
  thumb,
  active,
  mini,
  onSelect,
  follow,
}: ThumbItemProps) {
  const select = () => onSelect(item.id);
  return (
    <div
      className={cn('pt-thumb', active && 'is-active')}
      role='button'
      tabIndex={0}
      data-id={item.id}
      aria-current={active || undefined}
      onClick={select}
      onKeyDown={(event) => activateOnKey(event, select)}
      ref={active && follow ? scrollNearest : undefined}
    >
      <div className='n'>{item.n ?? ''}</div>
      <div className='pt-thumb-body'>
        <div className='pt-thumb-frame'>
          {thumb === 'mini' ? (
            <ThumbMini resolve={() => mini(item, index)} />
          ) : (
            <ThumbShot item={item} />
          )}
        </div>
        <div className='pt-thumb-title'>{item.title}</div>
      </div>
    </div>
  );
}

/**
 * The item list on its own: section labels and one item per ShellItem,
 * rendered as ThumbMini, ThumbShot or ListRow by `thumb`. The sidebar
 * renders it as its scroll region; GridView renders a second one over the
 * stage and restyles .pt-thumbs, .pt-sec-label and .pt-thumb under .pt-grid.
 * Every item carries data-id so the shell can find it from outside.
 */
export function ThumbList({
  sections,
  thumb,
  mini = stageMini,
  renderSub,
  onSelect,
  follow = true,
  className,
}: ThumbListProps) {
  const shell = usePtShell();
  const pick = onSelect ?? shell.select;
  let offset = 0;
  return (
    <div className={cn('pt-thumbs', thumb === 'row' && 'is-rows', className)}>
      {sections.map((section) => {
        const start = offset;
        offset += section.items.length;
        return (
          <Fragment key={section.id}>
            <div className='pt-sec-label'>{section.label}</div>
            {section.items.map((item, i) => {
              const active = item.id === shell.active;
              const sub = renderSub ? renderSub(item, active) : null;
              return (
                <Fragment key={item.id}>
                  {thumb === 'row' ? (
                    <ListRow item={item} active={active} onSelect={pick} />
                  ) : (
                    <ThumbItem
                      item={item}
                      index={start + i}
                      thumb={thumb}
                      active={active}
                      mini={mini}
                      onSelect={pick}
                      follow={follow}
                    />
                  )}
                  {sub ? <div className='pt-sub'>{sub}</div> : null}
                </Fragment>
              );
            })}
          </Fragment>
        );
      })}
    </div>
  );
}

/**
 * Column one of the shell: the mark, the title and the count in a 52px head,
 * then the item list as a .pt-scroll region. Visibility follows shell state:
 * hidden while presenting, in grid mode, or when the list is toggled off;
 * at or below 900px an open list is an absolute overlay, and selecting an
 * item closes it. ViewerShell collapses the grid column to match.
 */
export function Sidebar({
  title,
  mark,
  count,
  sections,
  thumb,
  mini,
  renderSub,
}: SidebarProps) {
  const { mode, present, narrow, sidebarOpen, select, setSidebar } =
    usePtShell();
  const hidden = present || mode === 'grid' || !sidebarOpen;
  const overlay = narrow && !hidden;
  const pick = (id: string) => {
    select(id);
    if (narrow) setSidebar(false);
  };
  return (
    <aside
      className={cn('pt-sb', hidden && 'is-hidden', overlay && 'is-overlay')}
      aria-label={title}
    >
      <div className='pt-sb-head'>
        <span className='pt-sb-mark'>
          {mark === 'gt' ? <GtMark /> : <PtMark />}
        </span>
        <b>{title}</b>
        <span>{count}</span>
      </div>
      <ThumbList
        className='pt-scroll'
        sections={sections}
        thumb={thumb}
        mini={mini}
        renderSub={renderSub}
        onSelect={pick}
        follow={!hidden}
      />
    </aside>
  );
}
