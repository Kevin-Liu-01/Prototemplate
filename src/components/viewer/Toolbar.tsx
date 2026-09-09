'use client';

import type { ReactNode } from 'react';

import { GtMark } from '@/components/viewer/GtMark';
import { PtMark } from '@/components/viewer/PtMark';
import { Seg } from '@/components/viewer/Seg';
import type { SegOption } from '@/components/viewer/Seg';
import { ThemeButton } from '@/components/viewer/ThemeButton';
import { ToolButton } from '@/components/viewer/ToolButton';
import { usePtShell } from '@/components/viewer/shell-context';
import { pad2 } from '@/lib/shell-data';
import type { ShellMark, ShellMode } from '@/lib/shell-data';

import './Toolbar.css';

/**
 * The 52px bar over the stage, the first row of .pt-main. Left group: the
 * list toggle, the brand (only while the sidebar is hidden or the grid is
 * up), previous, the count, next. Right group: the route's own controls,
 * the mode seg when the route offers more than one mode, then Index, theme,
 * Present (paged routes only), Fullscreen, Copy link and the ? card. Every
 * control is a ToolButton with a title naming its key; labels collapse at
 * 1180px and again when the bar itself runs short (Toolbar.css). State and
 * actions come from the shell context; the props carry only what the
 * context does not hold.
 */
export type ToolbarProps = {
  /** the route's title, shown with the mark while the sidebar is hidden */
  title: string;
  mark: ShellMark;
  /** the route's own controls, first in the right group */
  slot?: ReactNode;
};

const MODE_LABEL: Record<ShellMode, string> = {
  slide: 'Slide',
  grid: 'Grid',
  book: 'Book',
};

const MODE_ACTION: Record<ShellMode, string> = {
  slide: 'One at a time',
  grid: 'Everything as a grid',
  book: 'Read top to bottom',
};

const MODE_KEY: Partial<Record<ShellMode, string>> = { grid: 'G', book: 'B' };

/**
 * Seg options for the modes a route offers. The first mode is where Escape
 * returns, so its title names Esc; the others name their letter.
 */
export function modeOptions(modes: readonly ShellMode[]): readonly SegOption<ShellMode>[] {
  return modes.map((mode, i) => {
    const key = i === 0 ? 'Esc' : MODE_KEY[mode];
    return {
      value: mode,
      label: MODE_LABEL[mode],
      icon: mode,
      title: key ? `${MODE_ACTION[mode]} (${key})` : MODE_ACTION[mode],
    };
  });
}

async function toggleFullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    // refused by the browser (an iframe without allowfullscreen, or no gesture); nothing to report
  }
}

export function Toolbar({ title, mark, slot }: ToolbarProps) {
  const shell = usePtShell();
  const { id, modes, keys, mode, index, total, sidebarOpen, panelOpen, helpOpen } = shell;
  const showBrand = !sidebarOpen || mode === 'grid';
  const showSeg = modes.length > 1;
  const hasRouteControls = Boolean(slot) || showSeg;

  const copyLink = async () => {
    const url = window.location.href;
    /* the deck's toast names the slide (specification 2.8); other routes say Link copied */
    const done = id === 'deck' ? `Link to slide ${index + 1} copied` : 'Link copied';
    try {
      await navigator.clipboard.writeText(url);
      shell.say(done);
    } catch {
      // no clipboard (an insecure context, or permission refused): show the address instead
      shell.say(url);
    }
  };

  return (
    <div className='pt-toolbar' role='toolbar' aria-label='Viewer controls'>
      <div className='pt-bar-l'>
        <ToolButton
          icon='sidebar'
          label='List'
          title='Show or hide the list ([)'
          onClick={() => shell.setSidebar(!sidebarOpen)}
        />
        {showBrand ? (
          <span className='pt-bar-brand'>
            {mark === 'gt' ? <GtMark /> : <PtMark />}
            <b>{title}</b>
          </span>
        ) : null}
        <span className='pt-sep' aria-hidden='true' />
        <ToolButton icon='prev' title='Previous (left arrow)' onClick={() => shell.step(-1)} />
        <span className='pt-count'>
          <b>{pad2(index + 1)}</b> / {pad2(total)}
        </span>
        <ToolButton icon='next' title='Next (right arrow)' onClick={() => shell.step(1)} />
      </div>
      <div className='pt-bar-r'>
        {slot ? <div className='pt-bar-slot'>{slot}</div> : null}
        {showSeg ? (
          <Seg options={modeOptions(modes)} value={mode} onChange={shell.setMode} label='View' />
        ) : null}
        {hasRouteControls ? <span className='pt-sep' aria-hidden='true' /> : null}
        <ToolButton
          icon='index'
          label='Index'
          title='Show or hide the index (R)'
          pressed={panelOpen}
          onClick={() => shell.setPanel(!panelOpen)}
        />
        <ThemeButton />
        {keys === 'paged' ? (
          <ToolButton
            icon='present'
            label='Present'
            title='Presentation mode, chrome hidden (P)'
            solid
            hideSm
            onClick={() => shell.setPresent(true)}
          />
        ) : null}
        <ToolButton
          icon='fullscreen'
          label='Fullscreen'
          title='Fullscreen (F)'
          onClick={() => {
            void toggleFullscreen();
          }}
        />
        <ToolButton
          icon='link'
          label='Copy link'
          title='Copy a link to this view'
          hideSm
          onClick={() => {
            void copyLink();
          }}
        />
        <ToolButton title='Keyboard shortcuts (?)' onClick={() => shell.setHelp(!helpOpen)}>
          ?
        </ToolButton>
      </div>
    </div>
  );
}
