'use client';

import { Check, Copy } from 'lucide-react';
import { useRef, useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The copy control every code register and the hero command carry: one
 * icon button, the check standing in for the copy glyph for a moment after
 * a successful write. When the clipboard is blocked the text stays
 * selectable and nothing else happens.
 */
export type CopyButtonProps = { text: string; label: string };

const HOLD_MS = 1400;

export default function CopyButton({ text, label }: CopyButtonProps) {
  const [done, setDone] = useState(false);
  const timer = useRef(0);

  useMountEffect(() => () => window.clearTimeout(timer.current));

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setDone(false), HOLD_MS);
    } catch {
      // clipboard unavailable: the text is still selectable in place
    }
  };

  return (
    <button type='button' className='pr-copy' onClick={onClick} aria-label={done ? 'Copied' : label} title={label}>
      {done ? (
        <Check size={13} strokeWidth={1.75} aria-hidden='true' />
      ) : (
        <Copy size={13} strokeWidth={1.75} aria-hidden='true' />
      )}
    </button>
  );
}
