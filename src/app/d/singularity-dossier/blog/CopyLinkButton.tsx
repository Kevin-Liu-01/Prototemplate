'use client';

import { useState } from 'react';
import { Check, Link } from 'lucide-react';

/* The landing's copy-link control on a plain button — the UI package's
   Button ghost chrome is carried by the engine's .blog-copy-link rule. */

type CopyLinkButtonProps = {
  url: string;
  className?: string;
};

export default function CopyLinkButton({
  url,
  className = '',
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <button
      type='button'
      className={`blog-copy-link relative ${className}`}
      onClick={copyToClipboard}
      title='Copy link to clipboard'
      aria-label='Copy link to clipboard'
    >
      <span
        className={`blog-copy-check absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${copied ? 'opacity-100' : 'opacity-0'}`}
      >
        <Check className='size-4' />
      </span>
      <span
        className={`flex items-center justify-center transition-opacity duration-300 ${copied ? 'opacity-0' : 'opacity-100'}`}
      >
        <Link className='size-4' />
      </span>
      <span role='status' className='sr-only'>
        {copied ? 'Link copied' : ''}
      </span>
    </button>
  );
}
