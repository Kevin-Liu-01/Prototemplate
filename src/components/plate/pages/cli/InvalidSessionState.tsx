import { XCircleIcon } from '@heroicons/react/24/solid';

import { T } from '@/components/plate/shims/gt-next';
import AuthFrame from '@/components/plate/pages/auth/AuthFrame';

import CloseWindowButton from './CloseWindowButton';

/** The CLI wizard for an unknown or expired session id. */
export default function InvalidSessionState() {
  return (
    <AuthFrame
      title={
        <span className='flex items-center gap-2'>
          <XCircleIcon
            aria-hidden='true'
            className='text-destructive size-6 shrink-0'
          />
          <T>Session expired</T>
        </span>
      }
      lede={
        <T>
          This CLI authorization session has expired or is invalid. Start the
          CLI setup wizard again.
        </T>
      }
    >
      <CloseWindowButton />
    </AuthFrame>
  );
}
