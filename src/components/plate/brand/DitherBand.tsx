import type { ReactNode } from 'react';

import FieldGround from '@/components/plate/brand/FieldGround';
import { cn } from '@/components/plate/lib/utils';

type DitherBandProps = {
  /** The sentence and the link, set on a paper plate in the lower left. */
  children: ReactNode;
  className?: string;
  testId?: string;
};

/**
 * An empty state as a quiet band of the hero's field, with the copy on a
 * solid paper plate in the lower left corner. The band has no border; its
 * ground is the page, and the field fades toward the plate so the words
 * sit on quiet paper.
 */
export default function DitherBand({
  children,
  className,
  testId,
}: DitherBandProps) {
  return (
    <div
      className={cn('relative min-h-52 overflow-hidden', className)}
      data-testid={testId}
    >
      <FieldGround variant='band' />
      <div className='bg-background absolute bottom-0 left-0 flex max-w-[min(100%,44ch)] flex-col items-start gap-2 pt-4 pr-6 pb-1 text-sm'>
        {children}
      </div>
    </div>
  );
}
