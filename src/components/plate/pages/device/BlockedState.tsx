import { XCircleIcon } from '@heroicons/react/24/solid';

import { T } from '@/components/plate/shims/gt-next';
import AuthFrame from '@/components/plate/pages/auth/AuthFrame';

/**
 * The device page when the session's network is not allowed in. Under sm
 * the glyph sits above the words, as on the consent page's terminal state,
 * so the heading keeps two lines on a 288px column.
 */
export default function BlockedState() {
  return (
    <AuthFrame
      testId='device-ip-blocked'
      title={
        <span className='flex items-center gap-2 max-sm:flex-col max-sm:items-start max-sm:gap-3'>
          <XCircleIcon
            aria-hidden='true'
            className='text-destructive size-6 shrink-0'
          />
          <T>Network access restricted</T>
        </span>
      }
      lede={
        <T>
          Your organization restricts dashboard access to trusted network
          locations. Connect from an allowed network and reload this page to
          continue.
        </T>
      }
    />
  );
}
