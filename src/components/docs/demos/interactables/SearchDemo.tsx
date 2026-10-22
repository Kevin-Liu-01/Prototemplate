'use client';

import { useState } from 'react';

import { PtMark } from '@/components/viewer/PtMark';
import { Search } from '@/components/viewer/Search';

import { Choice } from '../controls';
import Plate from '../Plate';
import { DemoViewport, useDemoShell } from './demo-shell';

import '@/components/viewer/Toolbar.css';
import './interactables.css';

type Trigger = 'field' | 'tool';

/* the palette's keys, as its foot names them */
const KEYS = [
  { key: '/', what: 'Opens' },
  { key: 'Up, Down', what: 'Move' },
  { key: 'Enter', what: 'Opens the row' },
  { key: 'Esc', what: 'Closes' },
] as const;

/**
 * Search, live: the toolbar's field-shaped trigger (or the labeled
 * ToolButton the direction corner stacks) over a stage, and the palette it
 * opens. The palette is the real one over the real index: pages,
 * documents and their headings, directions, archive versions, brand
 * sections and the deck's slides. The plate's viewport is a containing
 * block, so the scrim and the card open inside the plate. In the shell
 * Cmd K opens it; on this page that key belongs to the docs search, so the
 * plate opens it from its button or from / while focus is inside.
 */
export default function SearchDemo() {
  const [trigger, setTrigger] = useState<Trigger>('field');
  const shell = useDemoShell({ id: 'docs-search' });

  return (
    <Plate
      bare
      controls={
        <>
          <Choice
            label='Trigger'
            options={[
              { value: 'field', label: 'Field' },
              { value: 'tool', label: 'Tool button' },
            ]}
            value={trigger}
            onChange={setTrigger}
          />
          <p className='dmo-bar-status'>Press / while focus is inside the plate.</p>
        </>
      }
      height={460}
      label='The search trigger in a toolbar, and the palette it opens inside the plate'
      phoneHeight={500}
      tag='<Search />'
    >
      <DemoViewport keys={{ search: true }} label='The search in a small shell: / opens it while focus is inside' shell={shell}>
        <div aria-label='Viewer controls' className='pt-toolbar' role='toolbar'>
          <div className='pt-bar-l'>
            <span className='pt-bar-brand'>
              <PtMark />
              <b>Prototemplate</b>
            </span>
          </div>
          <div className='pt-bar-r'>
            {trigger === 'field' ? (
              <Search key='field' />
            ) : (
              <span className='ixa-search-tool'>
                <Search key='tool' trigger='tool' />
              </span>
            )}
          </div>
        </div>
        <div className='ixa-stagewrap'>
          <div aria-label='Stage' className='ixa-sheet ixa-keys' role='group' tabIndex={0}>
            <dl className='ixa-keylist'>
              {KEYS.map((row) => (
                <div key={row.key}>
                  <dt>
                    <kbd className='pt-search-kbd'>{row.key}</kbd>
                  </dt>
                  <dd>{row.what}</dd>
                </div>
              ))}
            </dl>
            <span aria-hidden='true' className='dmo-plate-tag ixa-sheet-tag'>
              {`<Search trigger='${trigger}' />`}
            </span>
          </div>
        </div>
      </DemoViewport>
    </Plate>
  );
}
