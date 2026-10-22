'use client';

import { useState } from 'react';

import { HelpCard } from '@/components/viewer/HelpCard';
import { PtMark } from '@/components/viewer/PtMark';
import { TOAST_HOLD_MS } from '@/components/viewer/Toast';
import { ToolButton } from '@/components/viewer/ToolButton';
import type { ShellKeys, ShellMode } from '@/lib/shell-data';

import { Action, Choice } from '../controls';
import Plate from '../Plate';
import { DemoViewport, useDemoShell } from './demo-shell';

import '@/components/viewer/Toolbar.css';
import './interactables.css';

type Route = 'deck' | 'doc';

/* two shell routes: the deck pages through its slides, a handbook document scrolls */
const ROUTES: Record<Route, { title: string; keys: ShellKeys; modes: readonly ShellMode[]; noun: string; line: string }> = {
  deck: {
    title: 'Brand deck',
    keys: 'paged',
    modes: ['slide', 'grid', 'book'],
    noun: 'slide',
    line: 'A paged route: the arrows and Space move from slide to slide.',
  },
  doc: {
    title: 'Handbook',
    keys: 'flow',
    modes: ['book'],
    noun: 'document',
    line: 'A flow route: Space and the arrows scroll the sheet.',
  },
};

type Message = 'link' | 'digits' | 'install';

/* messages the shell says, word for word */
const MESSAGES: Record<Message, string> = {
  link: 'Link to slide 12 copied',
  digits: 'Slide 12, press Enter',
  install: 'Install command copied',
};

type Hold = 'short' | 'long';

const HOLDS: Record<Hold, number> = { short: TOAST_HOLD_MS, long: 4000 };

/**
 * HelpCard and Toast, live in a small shell. The card's rows come from
 * the shell's one key table (shellKeyRows), so Route switches between a
 * paged route and a flow route and the card follows: the paging rows and
 * the view letters appear only where they act. Say shows the toast for
 * its hold, and a second Say restarts the timer.
 */
export default function HelpToastDemo() {
  const [route, setRoute] = useState<Route>('deck');
  const [message, setMessage] = useState<Message>('link');
  const [hold, setHold] = useState<Hold>('short');
  const spec = ROUTES[route];
  const shell = useDemoShell({ id: 'docs-help', keys: spec.keys, modes: spec.modes, noun: spec.noun });
  const { state } = shell;

  return (
    <Plate
      bare
      controls={
        <>
          <Choice
            label='Route'
            options={[
              { value: 'deck', label: 'Paged' },
              { value: 'doc', label: 'Flow' },
            ]}
            value={route}
            onChange={setRoute}
          />
          <Choice
            label='Toast'
            options={[
              { value: 'link', label: 'Link copied' },
              { value: 'digits', label: 'Digits' },
              { value: 'install', label: 'Install' },
            ]}
            value={message}
            onChange={setMessage}
          />
          <Choice
            label='Hold'
            options={[
              { value: 'short', label: '1.4 s' },
              { value: 'long', label: '4 s' },
            ]}
            value={hold}
            onChange={setHold}
          />
          <Action onClick={() => state.say(MESSAGES[message], HOLDS[hold])}>Say</Action>
        </>
      }
      height={520}
      label='The keyboard shortcuts card and the toast in a small shell'
      phoneHeight={560}
      tag='<HelpCard />'
    >
      <DemoViewport keys={{ help: true }} label='A small shell: ? opens the shortcuts while focus is inside' shell={shell}>
        <div aria-label='Viewer controls' className='pt-toolbar' role='toolbar'>
          <div className='pt-bar-l'>
            <span className='pt-bar-brand'>
              <PtMark />
              <b>{spec.title}</b>
            </span>
          </div>
          <div className='pt-bar-r'>
            <ToolButton
              icon='help'
              label='Help'
              pressed={state.helpOpen}
              title='Keyboard shortcuts (?)'
              onClick={() => state.setHelp(!state.helpOpen)}
            />
          </div>
        </div>
        <div className='ixa-stagewrap'>
          <div aria-label='Stage' className='ixa-sheet ixa-route' role='group' tabIndex={0}>
            <p className='ixa-route-t'>{spec.title}</p>
            <p className='ixa-route-line'>{spec.line}</p>
            <span aria-hidden='true' className='dmo-plate-tag ixa-sheet-tag'>
              {'<HelpCard /> <Toast message on />'}
            </span>
          </div>
        </div>
        <HelpCard />
      </DemoViewport>
    </Plate>
  );
}
