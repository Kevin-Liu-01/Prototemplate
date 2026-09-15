'use client';

/**
 * The copy control every window bar and the install command carry. Writes
 * the text to the clipboard and shows the check for a moment; the label
 * stays for assistive tech in both states.
 */
import { Check, Copy } from 'lucide-react';
import { useRef, useState } from 'react';

export type CopyButtonProps = { text: string; label?: string; className?: string };

export function CopyButton({ text, label = 'Copy', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard blocked: the text stays selectable on the page
    }
  };

  return (
    <button
      type='button'
      className={className ? `apg-copy ${className}` : 'apg-copy'}
      onClick={onCopy}
      aria-label={copied ? 'Copied' : label}
      title={label}
    >
      {copied ? <Check size={13} strokeWidth={1.6} aria-hidden /> : <Copy size={13} strokeWidth={1.6} aria-hidden />}
    </button>
  );
}
