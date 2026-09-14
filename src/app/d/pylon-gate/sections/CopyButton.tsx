'use client';

import { useRef, useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The copy control on a command or a code face. Writes the text to the
 * clipboard and reports it for a beat; the label change is the only state.
 */
type CopyButtonProps = { text: string; className?: string };

export default function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useMountEffect(() => () => window.clearTimeout(timer.current));

  const copy = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 1400);
      })
      .catch(() => undefined);
  };

  return (
    <button type='button' className={className ?? 'pg-copy'} onClick={copy} aria-live='polite'>
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
