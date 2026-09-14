'use client';

import { useRef, useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The copy control every code bar and the hero's command carry. Writes the
 * text to the clipboard and says so for a moment; when the clipboard is
 * unavailable the text stays selectable and the label does not lie.
 */
export function CopyButton({ text, className = '' }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useMountEffect(() => () => window.clearTimeout(timer.current));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // no clipboard permission: nothing to report
    }
  };

  return (
    <button
      type='button'
      className={`tr-copy ${className}`.trim()}
      onClick={copy}
      aria-label={copied ? 'Copied' : `Copy ${text}`}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
