'use client';

import { Check, Copy, X } from 'lucide-react';

import { useCopyFace } from './useCopyFace';

type CopyPromptButtonProps = {
  /** the text written to the clipboard: the vendored agent prompt */
  prompt: string;
};

/**
 * The hero's second button, ported from gt-cloud
 * apps/landing/src/components/landing/sections/agent/CopyPromptButton.tsx.
 * It always reads Setup for Agents and copies the prompt it is given. For
 * COPIED_MS after a copy the glyph after the label is an accent check on
 * success or an X on failure, and a visually hidden live region announces
 * the outcome. The live Cta renders the outline face as tc-btn-line, which
 * this mirror writes directly.
 */
export default function CopyPromptButton({ prompt }: CopyPromptButtonProps) {
  const { copy, outcome } = useCopyFace();

  const mark =
    outcome === 'copied' ? (
      <Check aria-hidden className='tc-hero-copy-check' size={15} strokeWidth={1.75} />
    ) : outcome === 'failed' ? (
      <X aria-hidden size={15} strokeWidth={1.75} />
    ) : (
      <Copy aria-hidden size={15} strokeWidth={1.75} />
    );
  const announcement = outcome === 'copied' ? 'Copied' : outcome === 'failed' ? 'Copy failed' : '';

  return (
    <>
      <button className='tc-btn tc-btn-line tc-hero-copy' type='button' onClick={() => void copy(prompt)}>
        Setup for Agents
        {mark}
      </button>
      {/* outside the button, so the outcome never joins the button's
          accessible name */}
      <span aria-live='polite' className='tc-sr-only'>
        {announcement}
      </span>
    </>
  );
}
