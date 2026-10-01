'use client';

import { useState } from 'react';

import { T } from '@/components/plate/shims/gt-next';
import { Button } from '@/components/plate/ui/button';

export default function CloseWindowButton() {
  const [closeBlocked, setCloseBlocked] = useState(false);

  function handleClose() {
    window.close();

    if (!window.closed) {
      setCloseBlocked(true);
    }
  }

  return (
    <div className='space-y-2'>
      <T>
        <Button type='button' variant='outline' onClick={handleClose}>
          Close Window
        </Button>
      </T>
      {closeBlocked ? (
        <T>
          <p
            className='text-muted-foreground text-sm'
            role='status'
            aria-live='polite'
          >
            Your browser blocked automatic closing. You can safely close this
            tab manually.
          </p>
        </T>
      ) : null}
    </div>
  );
}
