'use client';

import { useState } from 'react';

import { IndexPanel } from '@/components/viewer/IndexPanel';
import { PtMark } from '@/components/viewer/PtMark';
import { ToolButton } from '@/components/viewer/ToolButton';
import type { SurfaceSet } from '@/lib/surfaces';

import { Choice } from '../controls';
import Plate from '../Plate';
import { DemoViewport, useDemoShell } from './demo-shell';

import '@/components/viewer/Toolbar.css';
import './interactables.css';

/**
 * IndexPanel, live in a small shell: the 460px column slides in from the
 * right over a scrimmed stage, under the bar, with the real site map or
 * the list of public places. It reads panelOpen from the shell, focuses
 * its filter on every open at desktop width, and closes on Escape, on the
 * scrim and on its own close button. Opens on picks the set the panel
 * starts on; the switch inside the panel changes it after that. A row is a
 * real link, so choosing one leaves this page.
 */
export default function IndexPanelDemo() {
  const [set, setSet] = useState<SurfaceSet>('site');
  const shell = useDemoShell({ id: 'docs-index' });
  const { state } = shell;

  return (
    <Plate
      bare
      controls={
        <>
          <Choice
            label='Opens on'
            options={[
              { value: 'site', label: 'This site' },
              { value: 'public', label: 'General Translation' },
            ]}
            value={set}
            onChange={(next) => {
              setSet(next);
              state.setPanel(false);
            }}
          />
          <p className='dmo-bar-status'>Press R while focus is inside the plate.</p>
        </>
      }
      height={520}
      label='The index panel sliding over a stage from the right'
      phoneHeight={560}
      tag='<IndexPanel set />'
    >
      <DemoViewport keys={{ index: true }} label='A small shell: R opens the index while focus is inside' shell={shell}>
        <div aria-label='Viewer controls' className='pt-toolbar' role='toolbar'>
          <div className='pt-bar-l'>
            <span className='pt-bar-brand'>
              <PtMark />
              <b>Prototemplate</b>
            </span>
          </div>
          <div className='pt-bar-r'>
            <ToolButton
              icon='index'
              label='Index'
              pressed={state.panelOpen}
              title='Show or hide the index (R)'
              onClick={() => state.setPanel(!state.panelOpen)}
            />
          </div>
        </div>
        <div className='ixa-stagewrap'>
          <div aria-label='Stage' className='ixa-sheet ixa-route' role='group' tabIndex={0}>
            <p className='ixa-route-t'>{set === 'site' ? 'This site' : 'General Translation'}</p>
            <p className='ixa-route-line'>
              {set === 'site'
                ? 'Every page on this site, in the sidebar’s groups.'
                : 'Every public place the brand is live, each opening in a new tab.'}
            </p>
            <span aria-hidden='true' className='dmo-plate-tag ixa-sheet-tag'>
              {`<IndexPanel set='${set}' />`}
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
        <IndexPanel key={set} set={set} />
      </DemoViewport>
    </Plate>
  );
}
