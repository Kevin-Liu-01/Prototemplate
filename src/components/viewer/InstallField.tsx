'use client';

import { Fragment, useRef, useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import { Icon } from './icons';
import { usePtShell } from './shell-context';

import './InstallField.css';

/** How long the copy button shows the check after a copy. */
const COPIED_MS = 1600;

/**
 * `node scripts/install-skills.mjs --project <dir>` as the groups a line may
 * break between: a flag keeps its value, so `--project <dir>` never splits.
 */
export function commandGroups(command: string): string[] {
  const out: string[] = [];
  for (const word of command.split(' ')) {
    const last = out[out.length - 1];
    if (last && last.startsWith('--') && !last.includes(' ') && !word.startsWith('--')) out[out.length - 1] = `${last} ${word}`;
    else out.push(word);
  }
  return out;
}

export type InstallFieldProps = {
  /** the command, as the reader would type it */
  command: string;
};

/**
 * The site's one copy control: the command in a field at the control
 * corner, in the mono face, breaking only between its groups, with the copy
 * button as the field's last segment (the segmented control's grammar). A
 * click writes the command to the clipboard, says so in the shell's toast
 * (the live region) and shows the check glyph for 1.6s; with no clipboard
 * the toast shows the command itself. One click on the command selects all
 * of it for a manual copy. Used by the /skills head's panel and by a skill
 * page's Install section.
 */
export function InstallField({ command }: InstallFieldProps) {
  const shell = usePtShell();
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useMountEffect(() => () => window.clearTimeout(timer.current));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      shell.say('Install command copied');
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      /* no clipboard (an insecure context, or permission refused): the toast shows the command */
      shell.say(command);
    }
  };

  return (
    <div className={copied ? 'pt-cmd is-copied' : 'pt-cmd'}>
      <code>
        {commandGroups(command).map((group, i) => (
          <Fragment key={`${i}-${group}`}>
            {i > 0 ? ' ' : null}
            <span className='pt-cmd-w'>{group}</span>
          </Fragment>
        ))}
      </code>
      <button
        type='button'
        className='pt-cmd-copy'
        onClick={copy}
        aria-label='Copy the install command'
        title='Copy the install command'
      >
        <Icon name={copied ? 'check' : 'copy'} />
      </button>
    </div>
  );
}
