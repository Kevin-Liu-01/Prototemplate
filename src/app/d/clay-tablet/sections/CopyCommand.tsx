'use client';

import { useRef, useState } from 'react';

/**
 * A command with its copy control. The command is the text the reader will
 * run; the button writes it to the clipboard and says so for a moment.
 * `compact` is the bar form inside a code panel: the control alone.
 */
export type CopyCommandProps = {
  text: string;
  compact?: boolean;
  label?: string;
};

export default function CopyCommand({ text, compact = false, label = 'Copy' }: CopyCommandProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard unavailable: the command is already on the page to select
    }
  };

  if (compact) {
    return (
      <button type='button' className='ct-copy is-compact' onClick={copy} aria-label={`${label} ${text}`}>
        {copied ? 'Copied' : label}
      </button>
    );
  }

  return (
    <div className='ct-cmd'>
      <code className='ct-cmd-text'>{text}</code>
      <button type='button' className='ct-copy' onClick={copy} aria-label={`${label} ${text}`}>
        {copied ? 'Copied' : label}
      </button>
    </div>
  );
}
