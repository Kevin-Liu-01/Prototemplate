'use client';

import { HelpCircle } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

type PricingHelpProps = {
  children: ReactNode;
  /** A trigger in place of the HelpCircle button, given the bubble's id for its aria-describedby. */
  trigger?: (describedBy: string) => ReactNode;
};

/**
 * The pricing surfaces' one help affordance, reproduced: a HelpCircle
 * trigger in the emphasis ink with a 230px centred bubble above it. The
 * shipped page drives this with the shared Radix tooltip (hover, keyboard
 * focus, and a click that PINS the bubble so the links inside stay
 * reachable). Here the same behaviour is CSS: the bubble belongs to the
 * wrapper, so hover survives the trip from the trigger into the content,
 * and :focus-within opens it from the keyboard. The trigger names the
 * bubble with aria-describedby, and Escape hides an open bubble until the
 * pointer and focus have both left it.
 */
export default function PricingHelp({ children, trigger }: PricingHelpProps) {
  const id = useId();
  const root = useRef<HTMLSpanElement>(null);
  const [dismissed, setDismissed] = useState(false);

  useMountEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && root.current?.matches(':hover, :focus-within')) setDismissed(true);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  return (
    <span
      className='pricing-help'
      data-dismissed={dismissed ? '' : undefined}
      ref={root}
      onBlur={(event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) return;
        if (!event.currentTarget.matches(':hover')) setDismissed(false);
      }}
      onMouseLeave={(event) => {
        if (!event.currentTarget.matches(':focus-within')) setDismissed(false);
      }}
    >
      {trigger ? (
        trigger(id)
      ) : (
        <button aria-describedby={id} aria-label='More information' type='button'>
          <HelpCircle aria-hidden='true' strokeWidth={1.8} />
        </button>
      )}
      <span className='pricing-help-bubble' id={id} role='tooltip'>
        {children}
      </span>
    </span>
  );
}
