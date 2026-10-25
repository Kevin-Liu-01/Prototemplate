'use client';

import { Check, Copy } from 'lucide-react';
import { useRef, useState } from 'react';

/**
 * The copy control on a code window's bar and on the install command.
 * Writes the text to the clipboard and, once the write has succeeded,
 * swaps its glyph to a check and its label to `copied` for a moment. The
 * label is the only text; the glyph is identification.
 */
export type CopyButtonProps = {
  text: string;
  label?: string;
  className?: string;
};

export function CopyButton({ text, label = 'copy', className }: CopyButtonProps) {
  const [done, setDone] = useState(false);
  const timer = useRef(0);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setDone(false), 1400);
    } catch {
      // clipboard blocked: the text stays selectable on the page
    }
  };

  return (
    <button
      type='button'
      className={className ? `tt-copy ${className}` : 'tt-copy'}
      onClick={onClick}
      aria-label={done ? 'Copied' : `Copy ${text}`}
    >
      {done ? <Check size={13} strokeWidth={1.75} aria-hidden='true' /> : <Copy size={13} strokeWidth={1.75} aria-hidden='true' />}
      <span>{done ? 'copied' : label}</span>
    </button>
  );
}

export default CopyButton;
