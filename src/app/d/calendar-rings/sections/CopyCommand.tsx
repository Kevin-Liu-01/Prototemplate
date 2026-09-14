'use client';

/**
 * calendar-rings: the copyable install command on the plinth.
 * A mono command in a hairline box with one button that writes it to the
 * clipboard and reports the copy for a moment.
 */
import { useRef, useState } from 'react';

import { INSTALL_COMMAND } from '../data';

export function CopyCommand() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard unavailable: the command stays selectable as text
    }
  };

  return (
    <div className='cr-cmd'>
      <code className='cr-cmd-text'>{INSTALL_COMMAND}</code>
      <button type='button' className='cr-cmd-btn' onClick={copy} aria-label='Copy the install command'>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
