import { CheckCircleIcon } from '@heroicons/react/24/solid';

import { T } from '@/components/plate/shims/gt-next';
import AuthFrame from '@/components/plate/pages/auth/AuthFrame';

import CloseWindowButton from './CloseWindowButton';

/** The CLI wizard once its session already carries credentials. */
export default function CompletedSessionState() {
  return (
    <AuthFrame
      title={
        <span className='flex items-center gap-2'>
          <CheckCircleIcon
            aria-hidden='true'
            className='text-status-success size-6 shrink-0'
          />
          <T>CLI already authorized</T>
        </span>
      }
      lede={
        <T>
          This CLI authorization session has already been completed. You can
          return to your terminal.
        </T>
      }
    >
      <CloseWindowButton />
    </AuthFrame>
  );
}
