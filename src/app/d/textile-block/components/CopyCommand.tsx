'use client';

import { useRef, useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import { INSTALL_COMMAND } from '../data';

/**
 * textile-block: the install command, cast into the claim block's foot.
 *
 * A recessed mono line with one copy control. The button reports "copied"
 * for a moment and returns to rest; the clipboard call is guarded because a
 * page inside the viewer's frame may not have permission.
 */
export default function CopyCommand() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useMountEffect(() => () => window.clearTimeout(timer.current));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className='tb-cmd'>
      <span aria-hidden='true' className='tb-cmd-prompt'>
        $
      </span>
      <code>{INSTALL_COMMAND}</code>
      <button aria-label='Copy the install command' className='tb-cmd-copy' onClick={copy} type='button'>
        {copied ? 'copied' : 'copy'}
      </button>
    </div>
  );
}
