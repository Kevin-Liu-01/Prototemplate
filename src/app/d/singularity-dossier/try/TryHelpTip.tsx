'use client';

import { useId, useRef, useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import type { ReactNode } from 'react';

/* The report rows' help affordance, house-built for the showcase (the
   production page borrows the pricing surfaces' shared tooltip; this app
   carries no shared UI package). A hairline circle-question trigger and
   an absolutely-positioned hairline panel above it: click or Enter
   toggles, Escape and outside clicks close, and only one tip stands open
   at a time. The panel floats over the card, so opening one never moves
   a row. */

/* The one-open-at-a-time latch: opening any tip closes the standing one. */
let closeStandingTip: (() => void) | null = null;

export default function TryHelpTip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  function hide() {
    if (!openRef.current) return;
    openRef.current = false;
    setOpen(false);
    if (closeStandingTip === hide) closeStandingTip = null;
  }

  function show() {
    closeStandingTip?.();
    closeStandingTip = hide;
    openRef.current = true;
    setOpen(true);
  }

  /* The dismissals live on the document for the tip's whole life and
     no-op while closed — attach-on-open juggling buys nothing here. */
  useMountEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!openRef.current) return;
      const root = rootRef.current;
      if (root && event.target instanceof Node && root.contains(event.target)) {
        return;
      }
      hide();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!openRef.current || event.key !== 'Escape') return;
      hide();
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
      if (closeStandingTip === hide) closeStandingTip = null;
    };
  });

  return (
    <span ref={rootRef} className='try-tip'>
      <button
        ref={buttonRef}
        type='button'
        className='try-tip-btn'
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (openRef.current ? hide() : show())}
      >
        {/* the house-drawn circle-question, hairline like the marks */}
        <svg
          viewBox='0 0 16 16'
          width={15}
          height={15}
          fill='none'
          stroke='currentColor'
          strokeWidth={1.25}
          strokeLinecap='square'
          aria-hidden='true'
        >
          <circle cx='8' cy='8' r='6.5' />
          <path d='M6.2 6.2a1.8 1.8 0 1 1 2.6 1.6c-.5.26-.8.6-.8 1.1v.3' />
          <path d='M8 11.4v.1' strokeLinecap='round' />
        </svg>
      </button>
      <span
        id={panelId}
        role='note'
        className='try-tip-panel'
        hidden={!open}
      >
        {children}
      </span>
    </span>
  );
}
