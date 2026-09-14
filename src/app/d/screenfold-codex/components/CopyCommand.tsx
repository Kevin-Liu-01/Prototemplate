'use client';

import { useRef, useState } from 'react';

import { cn } from '@/lib/cn';
import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * A command or code sample with its copy control. The text stays
 * selectable when the clipboard is unavailable; the control confirms for a
 * moment and returns to its label.
 */
export type CopyCommandProps = {
  text: string;
  /** what the control copies when it differs from the printed text */
  payload?: string;
  className?: string;
  /** hide the printed text and render only the control */
  controlOnly?: boolean;
};

export default function CopyCommand({ text, payload, className, controlOnly = false }: CopyCommandProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useMountEffect(() => () => window.clearTimeout(timer.current));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(payload ?? text);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard blocked: the text stays selectable
    }
  };

  return (
    <span className={cn('sfc-cmd', controlOnly && 'is-control', className)}>
      {controlOnly ? null : <code className='sfc-cmd-text'>{text}</code>}
      <button type='button' className='sfc-cmd-btn' onClick={copy} aria-live='polite'>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </span>
  );
}
