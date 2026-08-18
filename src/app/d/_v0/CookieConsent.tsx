'use client';

import { useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

const storageKey = 'gt-cookie-consent';

export default function CookieConsent() {
  const [open, setOpen] = useState(true);

  useMountEffect(() => {
    if (window.localStorage.getItem(storageKey)) setOpen(false);
    const reopen = () => setOpen(true);
    window.addEventListener('gt-open-cookie-consent', reopen);
    return () => window.removeEventListener('gt-open-cookie-consent', reopen);
  });

  const choose = (value: 'accepted' | 'rejected' | 'customized') => {
    window.localStorage.setItem(storageKey, value);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <section aria-label='Cookie preferences' className='v0-cookie' role='dialog'>
      <h2>We value your privacy</h2>
      <p>
        General Translation uses analytics cookies to understand how you use our site. Please
        accept cookies to help us improve your experience.
      </p>
      <div className='v0-cookie-actions'>
        <button className='is-primary' type='button' onClick={() => choose('accepted')}>
          Accept
        </button>
        <button type='button' onClick={() => choose('rejected')}>
          Reject all
        </button>
        <button className='is-customize' type='button' onClick={() => choose('customized')}>
          Customize
        </button>
      </div>
    </section>
  );
}
