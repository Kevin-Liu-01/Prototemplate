'use client';

import { useState } from 'react';
import type { FocusEvent, PointerEvent } from 'react';

import { ThemeButton } from '@/components/viewer/ThemeButton';
import { ToolButton } from '@/components/viewer/ToolButton';
import { useMountEffect } from '@/lib/use-mount-effect';

import { Choice } from '../controls';
import Plate from '../Plate';
import { forceStates } from './force-states';

import './interactables.css';

type Labels = 'words' | 'squares';

type Readout = { title: string; name: string; pressed: string };

const EMPTY: Readout = { title: '', name: '', pressed: '' };

/* the specimen's columns: the state, and how the cell gets it */
const STATES = [
  { key: 'rest', name: 'Rest' },
  { key: 'hover', name: 'Hover' },
  { key: 'focus', name: 'Focus' },
  { key: 'pressed', name: 'Pressed' },
  { key: 'solid', name: 'Solid' },
] as const;

/** The accessible name a browser computes for a plain button: aria-label, else its text. */
function nameOf(button: HTMLButtonElement): string {
  return button.getAttribute('aria-label') ?? button.textContent?.trim() ?? '';
}

/**
 * ToolButton, live: a row of the toolbar's own buttons (List, Index,
 * Theme, Help and Present), each with the title that names its key, and
 * under it every state the button draws, side by side. The specimen copies
 * the shell's own :hover and :focus-visible rules onto marked cells
 * (force-states.ts), so each cell draws what a pointer or a key would.
 * Pointing at or focusing a live button prints its tooltip and the name a
 * screen reader hears.
 */
export default function ToolButtonDemo() {
  const [labels, setLabels] = useState<Labels>('words');
  const [list, setList] = useState(true);
  const [index, setIndex] = useState(false);
  const [help, setHelp] = useState(false);
  const [presses, setPresses] = useState(0);
  const [readout, setReadout] = useState<Readout>(EMPTY);
  const words = labels === 'words';

  useMountEffect(() => forceStates(['.pt-ib']));

  const read = (event: PointerEvent<HTMLDivElement> | FocusEvent<HTMLDivElement>) => {
    const target = event.target;
    const button = target instanceof Element ? target.closest('button') : null;
    if (!button) return;
    const pressed = button.getAttribute('aria-pressed');
    setReadout({
      title: button.title,
      name: nameOf(button),
      pressed: pressed === null ? 'not a toggle' : pressed === 'true' ? 'pressed' : 'not pressed',
    });
  };

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Labels'
            options={[
              { value: 'words', label: 'Words' },
              { value: 'squares', label: 'Icon squares' },
            ]}
            value={labels}
            onChange={setLabels}
          />
          <p className='dmo-bar-status' role='status'>
            Present pressed <span className='dmo-num'>{presses}</span> {presses === 1 ? 'time' : 'times'}
          </p>
        </>
      }
      fit
      label='The toolbar buttons live, with a specimen of their rest, hover, focus, pressed and solid states'
      stageClassName='ixa-tools'
      tag='<ToolButton title onClick icon label pressed />'
    >
      <div className='ixa-tools-row' role='group' aria-label='Toolbar buttons' onFocus={read} onPointerOver={read}>
        <ToolButton
          icon='sidebar'
          pressed={list}
          quiet
          title='Show or hide the list ([)'
          onClick={() => setList(!list)}
        />
        <ToolButton
          icon='index'
          label={words ? 'Index' : undefined}
          pressed={index}
          title='Show or hide the index (R)'
          onClick={() => setIndex(!index)}
        />
        <ThemeButton label={words} />
        <ToolButton
          icon='help'
          label={words ? 'Help' : undefined}
          pressed={help}
          title='Keyboard shortcuts (?)'
          onClick={() => setHelp(!help)}
        />
        <ToolButton
          icon='present'
          label={words ? 'Present' : undefined}
          solid
          title='Presentation mode, chrome hidden (P)'
          onClick={() => setPresses((n) => n + 1)}
        />
      </div>
      <dl className='ixa-readout' aria-live='polite'>
        <div>
          <dt>Tooltip</dt>
          <dd>{readout.title || 'Point at a button or focus it'}</dd>
        </div>
        <div>
          <dt>Accessible name</dt>
          <dd>{readout.name || 'None yet'}</dd>
        </div>
        <div>
          <dt>Toggle</dt>
          <dd>{readout.pressed || 'None yet'}</dd>
        </div>
      </dl>
      <div className='ixa-states' inert>
        {STATES.map((state) => (
          <div
            className='ixa-state'
            data-ixa-force={state.key === 'hover' || state.key === 'focus' ? state.key : undefined}
            key={state.key}
          >
            <span className='ixa-state-name'>{state.name}</span>
            <ToolButton
              icon={state.key === 'solid' ? 'present' : 'index'}
              label={state.key === 'solid' ? 'Present' : 'Index'}
              pressed={state.key === 'pressed' ? true : undefined}
              solid={state.key === 'solid'}
              title={state.name}
              onClick={() => {}}
            />
            <ToolButton
              icon={state.key === 'solid' ? 'present' : 'help'}
              pressed={state.key === 'pressed' ? true : undefined}
              solid={state.key === 'solid'}
              title={state.name}
              onClick={() => {}}
            />
          </div>
        ))}
      </div>
    </Plate>
  );
}
