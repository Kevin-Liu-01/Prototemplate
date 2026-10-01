'use client';

import * as React from 'react';
import { cn } from '@/components/plate/lib/utils';
import {
  OTPInput,
  OTPInputContext,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from 'input-otp';
import { MinusIcon } from 'lucide-react';

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot='input-otp'
      containerClassName={cn(
        'cn-input-otp group/otp flex items-center has-disabled:opacity-50',
        containerClassName
      )}
      spellCheck={false}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='input-otp-group'
      className={cn('flex items-center rounded-md', className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot='input-otp-slot'
      data-active={isActive}
      className={cn(
        // Mirrors `Input`: border-only focus and invalid states, no ring/shadow.
        // Invalid styling responds to `aria-invalid` on a slot or on the
        // underlying input.
        'border-input aria-invalid:border-destructive group-has-aria-invalid/otp:border-destructive data-[active=true]:border-ring dark:bg-input/30 relative flex size-9 items-center justify-center border-y border-r text-sm transition-colors outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10',
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
          <div className='animate-caret-blink bg-foreground h-4 w-px duration-1000' />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='input-otp-separator'
      className="flex items-center [&_svg:not([class*='size-'])]:size-4"
      role='separator'
      {...props}
    >
      <MinusIcon />
    </div>
  );
}

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  REGEXP_ONLY_DIGITS_AND_CHARS,
};
