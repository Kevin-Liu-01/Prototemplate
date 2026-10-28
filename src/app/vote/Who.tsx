import type { ReactNode } from 'react';

type WhoProps = { email: string; leaving: boolean; onSwitch: () => void; children?: ReactNode };

/** The signed-in voter's address and the way to vote as someone else, with any links after them. */
export default function Who({ email, leaving, onSwitch, children }: WhoProps) {
  return (
    <p className='vt-who'>
      <span className='vt-who-email' data-testid='vote-who'>
        {email}
      </span>
      <span>Not you?</span>
      <button type='button' className='pt-ib vt-chip' onClick={onSwitch} disabled={leaving} data-testid='vote-switch'>
        Switch Email
      </button>
      {children}
    </p>
  );
}
