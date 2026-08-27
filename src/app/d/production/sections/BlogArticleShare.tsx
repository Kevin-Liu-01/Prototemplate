'use client';

import { Check, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * PRODUCTION · the article's share row — the shipped SideBar's own
 * controls (apps/landing/src/components/blog/SideBar.tsx): LinkedIn, X,
 * and copy-link, in that order. It renders twice on the shipped page, and
 * twice here: in the desktop rail under a "Share" heading, and at the foot
 * of the small-screen contents popover.
 *
 * The two glyphs are the simple-icons paths the shipped SocialIcon draws,
 * inlined rather than imported so this control never drifts with an icon
 * package. The copy button is the shipped CopyLinkButton without the design
 * system's Button shell: same icon swap, same 2s hold, same live region.
 *
 * The share URL is the page's own address, so it can only be read after
 * mount — the shipped page reads it through useMounted for the same reason.
 */

function LinkedInGlyph() {
  return (
    <svg
      aria-hidden='true'
      className='fill-current'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg
      aria-hidden='true'
      className='fill-current'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z' />
    </svg>
  );
}

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type='button'
      aria-label='Copy link to clipboard'
      className='pba-share-copy'
      data-copied={copied ? 'true' : undefined}
      title='Copy link to clipboard'
      onClick={() => {
        void navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      }}
    >
      <span aria-hidden='true' className='is-mark'>
        <Check />
      </span>
      <span aria-hidden='true' className='is-link'>
        <LinkIcon />
      </span>
      <span role='status' className='sr-only'>
        {copied ? 'Link copied' : ''}
      </span>
    </button>
  );
}

export default function BlogArticleShare({ postTitle }: { postTitle: string }) {
  const [shareUrl, setShareUrl] = useState('');

  useMountEffect(() => {
    setShareUrl(window.location.href);
  });

  const encodedShareUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(postTitle);

  return (
    <>
      <a
        aria-label='Share on LinkedIn'
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`}
        rel='noopener noreferrer'
        target='_blank'
      >
        <LinkedInGlyph />
      </a>
      <a
        aria-label='Share on X'
        href={`https://x.com/intent/tweet?url=${encodedShareUrl}&text=${encodedTitle}`}
        rel='noopener noreferrer'
        target='_blank'
      >
        <XGlyph />
      </a>
      <CopyLinkButton url={shareUrl} />
    </>
  );
}
