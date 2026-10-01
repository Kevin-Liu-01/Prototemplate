import type { ReactNode } from 'react';
import { MinusIcon, PlusIcon } from '@heroicons/react/16/solid';

type DisclosureSummaryProps = {
  children: ReactNode;
};

/**
 * The `summary` of an inline `details.group`: caption ink, a plus that
 * becomes a minus while the details is open, no marker and no box. Under
 * md it is 44px tall, the phone's tap target.
 */
export default function DisclosureSummary({
  children,
}: DisclosureSummaryProps) {
  return (
    <summary className='text-muted-foreground hover:text-foreground focus-visible:border-ring inline-flex cursor-pointer list-none items-center gap-1 rounded-md border border-transparent text-[13px] transition-colors duration-150 ease-out select-none focus-visible:outline-none max-md:min-h-11 [&::-webkit-details-marker]:hidden'>
      <PlusIcon
        aria-hidden='true'
        className='size-3.5 shrink-0 group-open:hidden'
      />
      <MinusIcon
        aria-hidden='true'
        className='hidden size-3.5 shrink-0 group-open:block'
      />
      {children}
    </summary>
  );
}
