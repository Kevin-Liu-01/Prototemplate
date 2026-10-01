'use client';

import { useState, type FormEvent } from 'react';

import { T, useGT } from '@/components/plate/shims/gt-next';
import { Button } from '@/components/plate/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from '@/components/plate/ui/input-otp';
import { Label } from '@/components/plate/ui/label';
import { requestDeviceApproval } from '@/components/plate/lib/actions';
import { useFlow } from '@/components/plate/gallery/flow';
import AuthFrame from '@/components/plate/pages/auth/AuthFrame';

type DeviceCodeFormProps = {
  error?: 'invalid_code' | 'expired_code' | 'processed_code';
  /** The code the user submitted, shown again on error. */
  defaultValue?: string;
};

const CODE_LENGTH = 8;
// Slots stretch so the two groups fill the column edge to edge; 20px mono
// characters, hairline slots, the active slot's border in ink.
const groupClassName =
  'flex-1 *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:flex-1 *:data-[slot=input-otp-slot]:font-mono *:data-[slot=input-otp-slot]:text-xl *:data-[slot=input-otp-slot]:uppercase';

/**
 * Drops the separator and stray whitespace so `XXXX-XXXX` fills the slots.
 * `input-otp` clips pasted text to `maxLength` itself.
 */
function stripCode(input: string) {
  return input.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Manual code entry. The dashboard submits it as a GET so the page
 * re-verifies the code; the gallery keeps the form's method and action
 * for fidelity but handles the submit itself: the stub runs with Continue
 * in its pending face, then the gallery moves to the approval state.
 */
export default function DeviceCodeForm({
  error,
  defaultValue,
}: DeviceCodeFormProps) {
  const gt = useGT();
  const flow = useFlow();
  // Controlled: `input-otp` forwards `defaultValue` to its hidden input
  // alongside `value`, which React rejects.
  // An overlong rejected code is cleared, not truncated: its prefix would
  // resubmit as a different code than the one the server rejected.
  const initialCode = defaultValue ? stripCode(defaultValue) : '';
  const [code, setCode] = useState(
    initialCode.length > CODE_LENGTH ? '' : initialCode
  );
  const [submitting, setSubmitting] = useState(false);
  const errorMessages = {
    invalid_code: gt(
      'That code is not valid. Check your terminal and try again.'
    ),
    expired_code: gt('That code has expired. Run the login command again.'),
    processed_code: gt(
      'That code has already been used. Run the login command again for a new one.'
    ),
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await requestDeviceApproval({ userCode: code });
      flow.go('device-approval');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFrame
      title={<T>Connect a device</T>}
      lede={<T>Enter the code shown in your terminal to continue.</T>}
    >
      <form
        method='get'
        action='/signin/device'
        onSubmit={(event) => void handleSubmit(event)}
        className='flex flex-col gap-6'
      >
        <div className='flex flex-col gap-2'>
          <Label htmlFor='device-user-code'>{gt('Code')}</Label>
          <InputOTP
            id='device-user-code'
            name='user_code'
            maxLength={CODE_LENGTH}
            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
            inputMode='text'
            pasteTransformer={stripCode}
            value={code}
            onChange={setCode}
            // the slots are h-12 and mount on hydration; the row holds their
            // height from the server render so nothing under it moves
            containerClassName='w-full min-h-12 gap-2'
            autoComplete='off'
            autoCapitalize='characters'
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'device-user-code-error' : undefined}
            data-testid='device-user-code'
            required
          >
            <InputOTPGroup className={groupClassName}>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup className={groupClassName}>
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
              <InputOTPSlot index={6} />
              <InputOTPSlot index={7} />
            </InputOTPGroup>
          </InputOTP>
          {error && (
            <p
              id='device-user-code-error'
              className='typo-error'
              aria-live='polite'
            >
              {errorMessages[error]}
            </p>
          )}
        </div>
        <T>
          <Button
            type='submit'
            className='h-11 w-full'
            loading={submitting}
            data-testid='device-continue'
          >
            Continue
          </Button>
        </T>
      </form>
    </AuthFrame>
  );
}
