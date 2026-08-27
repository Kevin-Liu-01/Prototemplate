'use client';

import { HelpCircle } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * The pricing surfaces' one help affordance, reproduced: a HelpCircle
 * trigger in the emphasis ink with a 230px centred bubble above it. The
 * shipped page drives this with the shared Radix tooltip (hover, keyboard
 * focus, and a click that PINS the bubble so the links inside stay
 * reachable). Here the same behaviour is CSS: the bubble belongs to the
 * wrapper, so hover survives the trip from the trigger into the content,
 * and :focus-within opens it from the keyboard.
 */
export default function PricingHelp({ children }: { children: ReactNode }) {
  return (
    <span className='pricing-help'>
      <button type='button' aria-label='More information'>
        <HelpCircle aria-hidden='true' strokeWidth={1.8} />
      </button>
      <span className='pricing-help-bubble' role='tooltip'>
        {children}
      </span>
    </span>
  );
}
