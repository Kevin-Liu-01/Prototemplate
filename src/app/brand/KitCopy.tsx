'use client';

import { useRef, useState, type ReactNode } from 'react';

import { Icon } from '@/components/viewer/icons';
import { usePtShell } from '@/components/viewer/shell-context';
import { useMountEffect } from '@/lib/use-mount-effect';

/** How long a copy button shows the check after a copy, as the install field does. */
const COPIED_MS = 1600;

type KitCopyProps = {
  /** what the toast names: "Ink hex", "The mark in ink as SVG" */
  what: string;
  /** the text to copy */
  text?: string;
  /** a file to copy instead: an SVG or a CSS file as text, or a PNG as an image */
  url?: string;
  /** 'image' copies the file at url as a PNG image */
  as?: 'text' | 'image';
  /** the button's class: 'ptb-kit-copy' (a link-like word) or 'ptb-kit-value' (a value row) */
  className: string;
  children: ReactNode;
};

/**
 * One copy control in the brand kit. A click writes the text, the file's
 * text or the PNG image to the clipboard, says so in the shell's toast and
 * shows the check glyph for 1.6s. A fetched file goes in as a ClipboardItem
 * that holds the fetch's promise, so Safari keeps the click's permission
 * while the file loads. Without a clipboard the toast says what failed.
 */
export function KitCopy({ what, text, url, as = 'text', className, children }: KitCopyProps) {
  const shell = usePtShell();
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useMountEffect(() => () => window.clearTimeout(timer.current));

  const write = async () => {
    if (text !== undefined) return navigator.clipboard.writeText(text);
    if (!url) throw new Error('KitCopy: no text and no url');
    const type = as === 'image' ? 'image/png' : 'text/plain';
    const blob = fetch(url).then(async (r) => {
      if (!r.ok) throw new Error(`KitCopy: ${url} answered ${r.status}`);
      return as === 'image' ? r.blob() : new Blob([await r.text()], { type });
    });
    if (typeof ClipboardItem !== 'undefined') return navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
    if (as === 'image') throw new Error('KitCopy: this browser cannot copy images');
    return navigator.clipboard.writeText(await (await blob).text());
  };

  const copy = async () => {
    try {
      await write();
      shell.say(`${what} copied`);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      shell.say(as === 'image' ? `This browser cannot copy ${what}; download it instead` : `${what} could not be copied`);
    }
  };

  return (
    <button aria-label={`Copy ${what}`} className={copied ? `${className} is-copied` : className} onClick={copy} type='button'>
      {children}
      <Icon name={copied ? 'check' : 'copy'} />
    </button>
  );
}
