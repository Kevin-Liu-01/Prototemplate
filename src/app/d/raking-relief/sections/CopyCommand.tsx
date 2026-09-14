'use client';

import { useRef, useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The copy control. CopyButton writes a string to the clipboard and says
 * so for a moment; CopyCommand is the inline command with the button beside
 * it. When the clipboard is blocked the text stays selectable and nothing
 * else happens. Home: the hero acts and the code tablet's bar.
 */
export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  const timer = useRef(0);

  useMountEffect(() => () => window.clearTimeout(timer.current));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setDone(false), 1600);
    } catch {
      // clipboard unavailable: the text remains selectable
    }
  };

  return (
    <button type='button' className='rr-copy' onClick={copy} aria-live='polite'>
      {done ? 'Copied' : label}
    </button>
  );
}

export default function CopyCommand({ command }: { command: string }) {
  return (
    <span className='rr-cmd'>
      <code>{command}</code>
      <CopyButton text={command} />
    </span>
  );
}
