import { XCircleIcon } from '@heroicons/react/24/solid';

import { T } from '@/components/plate/shims/gt-next';
import AuthFrame from '@/components/plate/pages/auth/AuthFrame';

/**
 * The consent page's terminal state for a request that cannot be shown.
 * Under sm the glyph sits above the words, so a 288px column breaks the
 * heading in two lines instead of one word per line.
 */
export default function InvalidConsentState() {
  return (
    <AuthFrame
      title={
        <span className='flex items-center gap-2 max-sm:flex-col max-sm:items-start max-sm:gap-3'>
          <XCircleIcon
            aria-hidden='true'
            className='text-destructive size-6 shrink-0'
          />
          <T>Invalid authorization request</T>
        </span>
      }
      lede={
        <T>
          This request has expired or is missing required information. Return to
          the application and try again.
        </T>
      }
    />
  );
}
