'use client';

import { useGSAP } from '@gsap/react';
import type { KeyboardEvent, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { GtMark } from '@/components/viewer/GtMark';
import { PtMark } from '@/components/viewer/PtMark';
import { Search } from '@/components/viewer/Search';
import { Seg } from '@/components/viewer/Seg';
import type { SegOption } from '@/components/viewer/Seg';
import { ThemeButton } from '@/components/viewer/ThemeButton';
import { ToolButton } from '@/components/viewer/ToolButton';
import { usePtShell } from '@/components/viewer/shell-context';
import { toggleFullscreen } from '@/components/viewer/useShellKeys';
import { MODE_ORDER, pad2, previewId } from '@/lib/shell-data';
import type { ShellMark, ShellMode } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import './Toolbar.css';

/**
 * The 52px bar over the stage, the first row of .pt-main. Left group: the
 * list toggle, the brand (in the DOM always, shown by Toolbar.css only
 * while the sidebar column is closed, so the first paint of a saved closed
 * list already names the route), Previous, the
 * count (a button: click it, type a number, press Enter), Next. Right
 * group: the search bar first (directive 8.3: the field-shaped button with
 * the ⌘K hint, left of the mode control on every shell route), then the
 * route's own controls, the mode seg in one fixed order (Slides, Grid,
 * Book) when the route offers more than one mode, then Index, Theme,
 * Present (whenever the route has a slide mode), Fullscreen, Copy link and
 * Help. Every control is a labeled ToolButton with a title naming its key
 * (decision 7). One treatment per meaning: the seg's active fill is the one
 * solid in the bar, so Present is a labeled button like Fullscreen, since
 * after directive 7.1 it is a mode toggle (Escape leaves it) and not an
 * action that leaves the page. The labels collapse in two stages when the
 * bar runs short (Toolbar.css): the conventional glyphs first, everything
 * only when that is not enough. State and actions come from the shell
 * context; the props carry only what the context does not hold.
 */
export type ToolbarProps = {
  /** the route's title, shown with the mark while the sidebar is hidden */
  title: string;
  mark: ShellMark;
  /** the route's own controls, first in the right group */
  slot?: ReactNode;
  /** the route's own words for the seg: `{ slide: 'Live' }` on the gallery */
  modeLabels?: Partial<Record<ShellMode, string>>;
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

/** How far the labels have collapsed: none, the conventional glyphs, everything. */
type Tight = 0 | 1 | 2;

const TIGHT_CLASS: Record<Tight, string> = {
  0: 'pt-toolbar',
  1: 'pt-toolbar is-tight-1',
  2: 'pt-toolbar is-tight',
};

/**
 * Seg options for the modes a route offers, always in the one order Slide,
 * Grid, Book, whichever mode is the default. The default mode's title says
 * that Escape returns to it; the others name their letter; the slide, which
 * has no letter on a route where it is not the default, says so plainly. A
 * route may reword a label (`Live` for the gallery's one live exhibit).
 */
export function modeOptions(
  modes: readonly ShellMode[],
  labels?: Partial<Record<ShellMode, string>>
): readonly SegOption<ShellMode>[] {
  const first = modes[0];
  return MODE_ORDER.filter((mode) => modes.includes(mode)).map((mode) => {
    const key = MODE_KEY[mode];
    let title: string;
    if (mode === first) title = `${MODE_ACTION[mode]}, where Escape returns`;
    else if (key) title = `${MODE_ACTION[mode]} (${key})`;
    else title = `Slide view: ${MODE_ACTION[mode].toLowerCase()}`;
    return { value: mode, label: labels?.[mode] ?? MODE_LABEL[mode], icon: mode, title };
  });
}

/**
 * The count as a control (directive 7.6): `01 / 52` reads the place, a
 * click opens a number field, Enter goes there. While nothing paged is
 * marked (the gallery's book at its top) it names the total instead, `17
 * directions`, so the number is never a dash. The route may put a word
 * before it (`Left 01 / 17` on /compare). Hovering it previews the next
 * item through the preview layer (directive 8.6).
 */
function Count() {
  const shell = usePtShell();
  const { index, total, paged, noun, countLabel } = shell;
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const next = paged[index + 1];

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
      title={`Go to a ${noun} by number (click, type it, press Enter)`}
      data-preview={next ? previewId(next) : undefined}
      onClick={open}
    >
      {countLabel ? <span className='pt-count-word'>{countLabel}</span> : null}
      {index < 0 ? (
        <>
          <b>{total}</b>
          <span> {noun}s</span>
        </>
      ) : (
        <>
          <b>{pad2(index + 1)}</b>
          <span> / {pad2(total)}</span>
        </>
      )}
    </button>
  );
}

/**
 * How far the labels have to collapse for the bar's controls to fit its
 * box. Measured with each stage applied in turn, so the answer does not
 * depend on the state it decides. The two groups are measured by their
 * content, not the bar by its scroll width: the left group is allowed to
 * shrink (the brand truncates inside it), so its buttons would overlap the
 * right group before the bar itself overflowed. At most two forced layouts,
 * and only when the bar or a group's content has changed size.
 */
function fitLabels(bar: HTMLElement): Tight {
  bar.classList.remove('is-tight-1', 'is-tight');
  const style = getComputedStyle(bar);
  const frame = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + parseFloat(style.columnGap);
  const groups = bar.querySelectorAll<HTMLElement>(':scope > .pt-bar-l, :scope > .pt-bar-r');
  const need = () => {
    let width = frame;
    groups.forEach((group) => {
      width += group.scrollWidth;
    });
    return width;
  };
  const room = bar.clientWidth + 1;
  if (need() <= room) return 0;
  bar.classList.add('is-tight-1');
  if (need() <= room) return 1;
  bar.classList.remove('is-tight-1');
  bar.classList.add('is-tight');
  return 2;
}

export function Toolbar({ title, mark, slot, modeLabels }: ToolbarProps) {
  const shell = usePtShell();
  const { modes, keys, noun, mode, index, sidebarOpen, panelOpen, helpOpen, narrow } = shell;
  const [fullscreen, setFullscreen] = useState(false);
  const [tight, setTight] = useState<Tight>(0);
  const bar = useRef<HTMLDivElement>(null);
  const showSeg = modes.length > 1;
  const slideOffered = modes.includes('slide');
  const hasRouteControls = Boolean(slot) || showSeg;
  /* the count is wider while it names the total (`17 directions`) than while it reads a place */
  const countNamesTotal = index < 0;

  useMountEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    onChange();
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  });

  /* the label collapse: measured against the bar's own box whenever the bar
     or either group changes size (the sidebar and the panel change the bar
     without a window resize; the route's slot and the count change the
     groups). The observer fires only after a real box change, so a slide
     change costs no measurement. */
  useMountEffect(() => {
    const el = bar.current;
    if (!el) return;
    const measure = () => setTight(fitLabels(el));
    measure();
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure);
      observer.observe(el);
      el.querySelectorAll<HTMLElement>(':scope > .pt-bar-l, :scope > .pt-bar-r').forEach((group) => {
        observer?.observe(group);
      });
    }
    return () => observer?.disconnect();
  });

  /* and before paint when what the bar holds changes shape */
  useGSAP(
    () => {
      const el = bar.current;
      if (el) setTight(fitLabels(el));
    },
    { dependencies: [slot, modes, sidebarOpen, shell.countLabel, countNamesTotal] }
  );

  /* a paged route's toast names the item (`Link to slide 12 copied`); a flow
     route's link has no number. On a phone the share sheet is the way to
     hand a link on; a dismissed sheet is not an error. */
  const copyLink = async () => {
    const url = window.location.href;
    const done = keys === 'paged' && index >= 0 ? `Link to ${noun} ${index + 1} copied` : 'Link copied';
    if (narrow && typeof navigator.share === 'function') {
      try {
        await navigator.share({ url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
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
    <div ref={bar} className={TIGHT_CLASS[tight]} role='toolbar' aria-label='Viewer controls'>
      <div className='pt-bar-l'>
        <ToolButton
          icon='sidebar'
          label='List'
          title='Show or hide the list ([)'
          pressed={sidebarOpen}
          className='pt-list'
          onClick={() => shell.setSidebar(!sidebarOpen)}
        />
        {/* always rendered; Toolbar.css shows it while the shell root says the column is closed */}
        <span className='pt-bar-brand'>
          {mark === 'gt' ? <GtMark /> : <PtMark />}
          <b>{title}</b>
        </span>
        <span className='pt-sep' aria-hidden='true' />
        <ToolButton
          icon='prev'
          label='Previous'
          title='Previous (left arrow)'
          className='pt-prev'
          onClick={() => shell.step(-1)}
        />
        <Count />
        <ToolButton icon='next' label='Next' title='Next (right arrow)' className='pt-next' onClick={() => shell.step(1)} />
      </div>
      <div className='pt-bar-r'>
        <Search />
        <span className='pt-sep' aria-hidden='true' />
        {slot ? <div className='pt-bar-slot'>{slot}</div> : null}
        {showSeg ? (
          <Seg options={modeOptions(modes, modeLabels)} value={mode} onChange={shell.setMode} label='View' />
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
            hideSm
            onClick={presentNow}
          />
        ) : null}
        <ToolButton
          icon={fullscreen ? 'exit-fullscreen' : 'fullscreen'}
          label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          title={fullscreen ? 'Leave fullscreen (F)' : 'Fullscreen (F)'}
          hideSm
          className='pt-full'
          onClick={() => {
            void toggleFullscreen();
          }}
        />
        <ToolButton
          icon='link'
          label='Copy link'
          title='Copy a link to this view'
          className='pt-copy'
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
