'use client';

import { useState } from 'react';

import { commandGroups, InstallField } from '@/components/viewer/InstallField';

import { Choice } from '../controls';
import Plate from '../Plate';
import { DemoViewport, useDemoShell } from './demo-shell';

import './interactables.css';

/* the installer as /skills and a skill page print it */
const COMMANDS = {
  all: 'pnpm skills:install --project <dir>',
  one: 'pnpm skills:install gt-voice --project <dir>',
  long: 'pnpm skills:install gt-landing-pages --project <dir>',
} as const;

type Command = keyof typeof COMMANDS;

type Width = 'panel' | 'column' | 'narrow';

/**
 * InstallField, live: the site's one copy control, mounted in a small
 * shell so its say() reaches a toast inside the plate. Width sets the
 * field at the book head panel's 304px, a wider column or a 220px box,
 * so the command breaks between its groups and a flag keeps its value.
 * Copy writes the command to the clipboard, the toast says so and the
 * check holds for 1.6 seconds.
 */
export default function InstallFieldDemo() {
  const [command, setCommand] = useState<Command>('one');
  const [width, setWidth] = useState<Width>('panel');
  const shell = useDemoShell({ id: 'docs-install' });
  const text = COMMANDS[command];

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Command'
            options={[
              { value: 'all', label: 'Every skill' },
              { value: 'one', label: 'One skill' },
              { value: 'long', label: 'Long slug' },
            ]}
            value={command}
            onChange={setCommand}
          />
          <Choice
            label='Width'
            options={[
              { value: 'panel', label: 'Head panel' },
              { value: 'column', label: 'Column' },
              { value: 'narrow', label: '220px' },
            ]}
            value={width}
            onChange={setWidth}
          />
          <p className='dmo-bar-status'>
            Breaks between <span className='dmo-num'>{commandGroups(text).length}</span> groups
          </p>
        </>
      }
      height={230}
      label={`The install field holding ${text}`}
      tag='<InstallField command />'
    >
      <DemoViewport label='The install field in a small shell, with its toast' shell={shell}>
        <div className='ixa-install'>
          <div className={`ixa-install-box is-${width}`}>
            <InstallField command={text} />
          </div>
        </div>
      </DemoViewport>
    </Plate>
  );
}
