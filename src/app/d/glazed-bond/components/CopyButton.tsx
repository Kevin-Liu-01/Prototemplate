'use client';

import { useRef, useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The page's one copy control: a button that writes `text` to the
 * clipboard and says so for a moment. Used for the hero command and the
 * code tablet's bar. The label flips to `copied` and back; the timer is
 * cleared on unmount.
 */
export type CopyButtonProps = {
  text: string;
  className?: string;
  /** Visible content of the button, for example the command itself. */
  children?: React.ReactNode;
  /** Label when idle. Default 'copy'. */
  idle?: string;
};

export default function CopyButton({ text, className, children, idle = 'copy' }: CopyButtonProps) {
  const [done, setDone] = useState(false);
  const timer = useRef(0);

  useMountEffect(() => () => window.clearTimeout(timer.current));

  const copy = () => {
    void navigator.clipboard?.writeText(text);
    setDone(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(false), 1400);
  };

  return (
    <button
      type='button'
      className={className ? `gb-copy ${className}` : 'gb-copy'}
      onClick={copy}
      aria-live='polite'
    >
      {children}
      <span className='gb-copy-label'>{done ? 'copied' : idle}</span>
    </button>
  );
}
