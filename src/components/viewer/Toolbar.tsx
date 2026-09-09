'use client';

import { useGSAP } from '@gsap/react';
import type { KeyboardEvent, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { GtMark } from '@/components/viewer/GtMark';
import { PtMark } from '@/components/viewer/PtMark';
import { Seg } from '@/components/viewer/Seg';
import type { SegOption } from '@/components/viewer/Seg';
import { ThemeButton } from '@/components/viewer/ThemeButton';
import { ToolButton } from '@/components/viewer/ToolButton';
import { usePtShell } from '@/components/viewer/shell-context';
import { toggleFullscreen } from '@/components/viewer/useShellKeys';
import { MODE_ORDER, pad2 } from '@/lib/shell-data';
import type { ShellMark, ShellMode } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import './Toolbar.css';

/**
 * The 52px bar over the stage, the first row of .pt-main. Left group: the
 * list toggle, the brand (only while the sidebar is hidden), Previous, the
 * count (a button: click it, type a number, press Enter), Next. Right
 * group: the route's own controls, the mode seg in one fixed order (Slides,
 * Grid, Book) when the route offers more than one mode, then Index, Theme,
 * Present (whenever the route has a slide mode), Fullscreen, Copy link and
 * Help. Every control is a labeled ToolButton with a title naming its key
 * (decision 7); the labels collapse to 32px icon squares when the bar
 * itself runs short (Toolbar.css owns that one breakpoint). State and
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

/* the action words of directive 7.6 */
const MODE_LABEL: Record<ShellMode, string> = {
  slide: 'Slides',
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
 * Seg options for the modes a route offers, always in the one order Slide,
 * Grid, Book, whichever mode is the default. The default mode's title says
 * that Escape returns to it; the others name their letter; the slide, which
 * has no letter on a route where it is not the default, says so plainly.
 */
export function modeOptions(modes: readonly ShellMode[]): readonly SegOption<ShellMode>[] {
  const first = modes[0];
  return MODE_ORDER.filter((mode) => modes.includes(mode)).map((mode) => {
    const key = MODE_KEY[mode];
    let title: string;
    if (mode === first) title = `${MODE_ACTION[mode]}, where Escape returns`;
    else if (key) title = `${MODE_ACTION[mode]} (${key})`;
    else title = `Slide view: ${MODE_ACTION[mode].toLowerCase()}`;
    return { value: mode, label: MODE_LABEL[mode], icon: mode, title };
  });
}

/**
 * The count as a control (directive 7.6): `01 / 52` reads the place, a
 * click opens a number field, Enter goes there. A dash stands for the
 * current number while nothing paged is marked (the gallery's book at its
 * top). The route may put a word before it (`Left 01 / 17` on /compare).
 */
function Count() {
  const shell = usePtShell();
  const { index, total, paged, noun, countLabel } = shell;
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');

  const open = () => {
    setValue('');
    setEditing(true);
  };

  const close = () => setEditing(false);

  const onKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const n = parseInt(value, 10);
    const item = paged[n - 1];
    if (!item) {
      shell.say(`No ${noun} ${value || n}`);
      return;
    }
    close();
    if (shell.mode === 'grid') shell.setMode(shell.modes.includes('slide') ? 'slide' : shell.modes[0]);
    shell.select(item.id);
  };

  if (editing) {
    return (
      <span className='pt-count is-editing'>
        {countLabel ? <span className='pt-count-word'>{countLabel}</span> : null}
        <input
          ref={(el) => el?.focus()}
          className='pt-count-field'
          type='text'
          inputMode='numeric'
          maxLength={3}
          value={value}
          placeholder={pad2(Math.max(1, index + 1))}
          aria-label={`Go to a ${noun} by number`}
          onChange={(event) => setValue(event.target.value.replace(/\D/g, ''))}
          onKeyDown={onKey}
          onBlur={close}
        />
        <span> / {pad2(total)}</span>
      </span>
    );
  }

  return (
    <button
      type='button'
      className='pt-ib pt-count'
      title={`Go to a ${noun} by number: click, type it, press Enter`}
      onClick={open}
    >
      {countLabel ? <span className='pt-count-word'>{countLabel}</span> : null}
      <b>{index < 0 ? '–' : pad2(index + 1)}</b>
      <span> / {pad2(total)}</span>
    </button>
  );
}

/**
 * True when the bar's controls, with their labels shown, would overflow its
 * box. Measured with the labels forced on, so the answer does not depend on
 * the state it decides. The two groups are measured by their content, not
 * the bar by its scroll width: the left group is allowed to shrink (the
 * brand truncates inside it), so its buttons would overlap the right group
 * before the bar itself overflowed.
 */
function overflows(bar: HTMLElement): boolean {
  bar.classList.remove('is-tight');
  const style = getComputedStyle(bar);
  const frame = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + parseFloat(style.columnGap);
  let need = frame;
  bar.querySelectorAll<HTMLElement>(':scope > .pt-bar-l, :scope > .pt-bar-r').forEach((group) => {
    need += group.scrollWidth;
  });
  const tight = need > bar.clientWidth + 1;
  bar.classList.toggle('is-tight', tight);
  return tight;
}

export function Toolbar({ title, mark, slot }: ToolbarProps) {
  const shell = usePtShell();
  const { modes, keys, noun, mode, index, sidebarOpen, panelOpen, helpOpen } = shell;
  const [fullscreen, setFullscreen] = useState(false);
  const [tight, setTight] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const showBrand = !sidebarOpen;
  const showSeg = modes.length > 1;
  const slideOffered = modes.includes('slide');
  const hasRouteControls = Boolean(slot) || showSeg;

  useMountEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    onChange();
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  });

  /* the label collapse: measured against the bar's own box on every resize
     of the bar (the sidebar and the panel change it without a window resize)
     and again after every render, since the route's slot can change */
  useMountEffect(() => {
    const el = bar.current;
    if (!el) return;
    const measure = () => setTight(overflows(el));
    measure();
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure);
      observer.observe(el);
    }
    return () => observer?.disconnect();
  });

  useGSAP(
    () => {
      const el = bar.current;
      if (el) setTight(overflows(el));
    },
    { dependencies: [slot, modes, sidebarOpen, shell.countLabel, shell.index] }
  );

  const copyLink = async () => {
    const url = window.location.href;
    /* a paged route's toast names the item (`Link to slide 12 copied`); a flow route's link has no number */
    const done = keys === 'paged' && index >= 0 ? `Link to ${noun} ${index + 1} copied` : 'Link copied';
    try {
      await navigator.clipboard.writeText(url);
      shell.say(done);
    } catch {
      // no clipboard (an insecure context, or permission refused): show the address instead
      shell.say(url);
    }
  };

  /* presenting from the book or the grid opens the slide on the current item first */
  const presentNow = () => {
    if (mode !== 'slide') shell.setMode('slide');
    shell.setPresent(true);
  };

  return (
    <div ref={bar} className={tight ? 'pt-toolbar is-tight' : 'pt-toolbar'} role='toolbar' aria-label='Viewer controls'>
      <div className='pt-bar-l'>
        <ToolButton
          icon='sidebar'
          label='List'
          title='Show or hide the list ([)'
          pressed={sidebarOpen}
          onClick={() => shell.setSidebar(!sidebarOpen)}
        />
        {showBrand ? (
          <span className='pt-bar-brand'>
            {mark === 'gt' ? <GtMark /> : <PtMark />}
            <b>{title}</b>
          </span>
        ) : null}
        <span className='pt-sep' aria-hidden='true' />
        <ToolButton icon='prev' label='Previous' title='Previous (left arrow)' onClick={() => shell.step(-1)} />
        <Count />
        <ToolButton icon='next' label='Next' title='Next (right arrow)' onClick={() => shell.step(1)} />
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
        <ThemeButton className='pt-theme' label />
        {slideOffered ? (
          <ToolButton
            icon='present'
            label='Present'
            title='Presentation mode, chrome hidden (P)'
            solid
            hideSm
            onClick={presentNow}
          />
        ) : null}
        <ToolButton
          icon={fullscreen ? 'exit-fullscreen' : 'fullscreen'}
          label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          title={fullscreen ? 'Leave fullscreen (F)' : 'Fullscreen (F)'}
          hideSm
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
        <ToolButton
          icon='help'
          label='Help'
          title='Keyboard shortcuts (?)'
          pressed={helpOpen}
          onClick={() => shell.setHelp(!helpOpen)}
        />
      </div>
    </div>
  );
}
