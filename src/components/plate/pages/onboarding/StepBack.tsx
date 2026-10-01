'use client';

import { ArrowLeft } from 'lucide-react';

import { T } from '@/components/plate/shims/gt-next';
import { Button } from '@/components/plate/ui/button';

type StepBackProps = {
  onClick: () => void;
  disabled?: boolean;
};

/**
 * The way back to the previous step, as a text control in the caption ink.
 * Under md the text keeps its size but the control is 44px tall, the
 * phone's tap target.
 */
export default function StepBack({ onClick, disabled }: StepBackProps) {
  return (
    <Button
      type='button'
      variant='link'
      className='h-auto px-0 font-normal text-(--ink-2) max-md:min-h-11'
      onClick={onClick}
      disabled={disabled}
    >
      <ArrowLeft aria-hidden='true' className='size-4' />
      <T>Back</T>
    </Button>
  );
}
