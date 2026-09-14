'use client';

import { Check, Copy } from 'lucide-react';
import { useRef, useState } from 'react';

/**
 * brick-lattice · the copyable command.
 *
 * Home: the hero's claim panel (`npx gt@latest`) and the kiln's code
 * window bar. A mono line with one control: the button writes the command
 * to the clipboard and shows the check for a beat. The state is the only
 * thing that changes; the box does not move.
 */
export type CopyCommandProps = {
  command: string;
  /** a leading prompt glyph, drawn but not copied */
  prompt?: string;
  className?: string;
};

export default function CopyCommand({ command, prompt = '$', className }: CopyCommandProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* no clipboard permission: the text stays selectable */
    }
  };

  return (
    <div className={className ? `bl-cmd ${className}` : 'bl-cmd'}>
      <span className='bl-cmd-prompt' aria-hidden='true'>
        {prompt}
      </span>
      <code className='bl-cmd-text'>{command}</code>
      <button
        type='button'
        className='bl-cmd-copy'
        onClick={copy}
        aria-label={copied ? 'Copied' : `Copy ${command}`}
        data-copied={copied ? 'true' : undefined}
      >
        {copied ? <Check size={14} strokeWidth={1.75} aria-hidden /> : <Copy size={14} strokeWidth={1.75} aria-hidden />}
      </button>
    </div>
  );
}
