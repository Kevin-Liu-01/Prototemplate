'use client';

import { useState } from 'react';
import type { MouseEvent } from 'react';

import { HelpCard } from '@/components/viewer/HelpCard';
import { IndexPanel } from '@/components/viewer/IndexPanel';
import { Progress } from '@/components/viewer/Progress';
import type { ShellState } from '@/components/viewer/shell-context';
import { Toolbar } from '@/components/viewer/Toolbar';
import type { ShellKeyRow } from '@/components/viewer/useShellKeys';
import { pad2 } from '@/lib/shell-data';
import type { ShellItem, ShellMode } from '@/lib/shell-data';

import { Choice, Range } from '../controls';
import Plate from '../Plate';
import { DemoViewport, useDemoShell } from './demo-shell';

import './interactables.css';

/* the brand deck's first twelve slides, in order */
const SLIDES = [
  'Brand',
  'General Translation',
  'Every product in every language',
  'Reputation',
  'Why the redesign',
  'The Blue Marble',
  'Open source and platform',
  'Audience',
  'Values',
  'The Rosetta Stone',
  'Brand personality',
  'Writing style',
] as const;

const ITEMS: readonly ShellItem[] = SLIDES.map((title, i) => ({ id: `slide-${i + 1}`, n: pad2(i + 1), title }));

type Views = 'three' | 'two' | 'one';

/* the views a route offers: the deck's three, a route without a slide view, a document that only flows */
const VIEWS: Record<Views, readonly ShellMode[]> = {
  three: ['slide', 'grid', 'book'],
  two: ['grid', 'book'],
  one: ['book'],
};

/* the keys this plate binds, in the help card's groups; the docs page keeps Cmd K */
const PLATE_KEYS: readonly ShellKeyRow[] = [
  { group: 'Move', keys: 'Right arrow, Space', action: 'Next slide' },
  { group: 'Move', keys: 'Left arrow, Shift Space', action: 'Previous slide' },
  { group: 'Move', keys: 'Home, End', action: 'First and last slide' },
  { group: 'View', keys: 'G', action: 'Grid view' },
  { group: 'View', keys: 'B', action: 'Book view, read top to bottom' },
  { group: 'Panels', keys: '/', action: 'Search every page, document, direction and slide' },
  { group: 'Panels', keys: 'R', action: 'Index panel, with the filter focused' },
  { group: 'Panels', keys: '?', action: 'Keyboard shortcuts' },
  { group: 'Panels', keys: 'Esc', action: 'Back one layer: the shortcuts, the index, the view' },
  { group: 'Theme', keys: 'D', action: 'Dark or light' },
];

const NOTE = 'Click the left or right half of the slide to move. The keys act while focus is inside the plate.';

/** The stage under the bar: one slide, every slide as tiles, or the book's rows. */
function Sheet({ shell }: { shell: ShellState }) {
  const { mode, index, total } = shell;
  const current = ITEMS[index] ?? ITEMS[0];

  const onSlideClick = (event: MouseEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    shell.step(event.clientX - box.left < box.width / 2 ? -1 : 1);
  };

  const open = (item: ShellItem) => {
    shell.select(item.id);
    if (shell.modes.includes('slide')) shell.setMode('slide');
  };

  if (mode === 'grid') {
    return (
      <div className='ixa-grid pt-scroll'>
        {ITEMS.map((item, i) => (
          <button
            aria-current={i === index ? 'true' : undefined}
            className={i === index ? 'ixa-tile is-on' : 'ixa-tile'}
            key={item.id}
            type='button'
            onClick={() => open(item)}
          >
            <span className='ixa-tile-n'>{item.n}</span>
            <span className='ixa-tile-t'>{item.title}</span>
          </button>
        ))}
      </div>
    );
  }

  if (mode === 'book') {
    return (
      <div className='ixa-book pt-scroll'>
        {ITEMS.map((item, i) => (
          <button
            aria-current={i === index ? 'true' : undefined}
            className={i === index ? 'ixa-book-row is-on' : 'ixa-book-row'}
            key={item.id}
            type='button'
            onClick={() => shell.select(item.id)}
          >
            <span className='ixa-tile-n'>{item.n}</span>
            <span className='ixa-book-t'>{item.title}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      aria-label={`Slide ${index + 1} of ${total}: ${current?.title ?? ''}. Click the left half to go back and the right half to go on`}
      className='ixa-slide'
      role='group'
      onClick={onSlideClick}
    >
      <span className='ixa-slide-n'>{current?.n}</span>
      <p className='ixa-slide-t'>{current?.title}</p>
    </div>
  );
}

/**
 * The shell's toolbar, live, in a small shell of its own: the list toggle
 * and the brand, Previous, the count and Next, the search field, the view
 * seg, Index, Theme, Present, Fullscreen, Copy link and Help, each the
 * real control. The stage under it shows the active slide in the view the
 * seg picks, the progress line runs under the stage, and the index panel,
 * the help card and the toast open inside the plate. Route views sets the
 * views the route offers, so the bar drops the seg or Present as a route
 * would; the slider drives the same active slide as the count.
 */
export default function ShellToolbarDemo() {
  const [views, setViews] = useState<Views>('three');
  const shell = useDemoShell({
    id: 'docs-toolbar',
    modes: VIEWS[views],
    keys: 'paged',
    noun: 'slide',
    items: ITEMS,
    start: ITEMS[0]?.id,
    listOpen: true,
    missing: {
      sidebar: 'The list opens beside the stage, outside this plate',
      present: 'Presentation mode hides the chrome in the shell',
    },
  });
  const { state } = shell;

  return (
    <Plate
      bare
      controls={
        <>
          <Range
            format={(value) => `${pad2(value)} / ${pad2(ITEMS.length)}`}
            label='Slide'
            max={ITEMS.length}
            min={1}
            step={1}
            value={Math.max(1, state.index + 1)}
            onChange={(value) => {
              const item = ITEMS[value - 1];
              if (item) state.select(item.id);
            }}
          />
          <Choice
            label='Route views'
            options={[
              { value: 'three', label: 'Slides, Grid, Book' },
              { value: 'two', label: 'Grid, Book' },
              { value: 'one', label: 'Book' },
            ]}
            value={views}
            onChange={setViews}
          />
        </>
      }
      height={440}
      label='The viewer toolbar with its controls over a stage of twelve slides'
      phoneHeight={460}
      tag='<Toolbar />'
    >
      <DemoViewport
        keys={{ help: true, index: true, paging: true, search: true, theme: true }}
        label='A small viewer shell: the keys act while focus is inside it'
        list
        shell={shell}
      >
        <Toolbar mark='gt' title='Brand deck' />
        <div className='ixa-stagewrap'>
          <div aria-label='Stage' className='ixa-sheet' role='group' tabIndex={0}>
            <Sheet shell={state} />
            <span aria-hidden='true' className='dmo-plate-tag ixa-sheet-tag'>
              {'<Toolbar title mark />'}
            </span>
          </div>
          <button
            aria-label='Close the index (Esc)'
            className={state.panelOpen ? 'pt-panel-scrim is-on' : 'pt-panel-scrim'}
            tabIndex={-1}
            type='button'
            onClick={() => state.setPanel(false)}
          />
        </div>
        <IndexPanel set='site' />
        <Progress />
        <HelpCard note={NOTE} rows={PLATE_KEYS} />
      </DemoViewport>
    </Plate>
  );
}
