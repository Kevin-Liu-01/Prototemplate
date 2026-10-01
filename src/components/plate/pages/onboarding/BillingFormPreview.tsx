'use client';

import { useId } from 'react';
import { CreditCardIcon, LinkIcon } from '@heroicons/react/24/solid';
import {
  SiAmericanexpress,
  SiDiscover,
  SiMastercard,
  SiVisa,
} from '@icons-pack/react-simple-icons';
import { ChevronDown } from 'lucide-react';

import { T, useGT } from '@/components/plate/shims/gt-next';
import { Button } from '@/components/plate/ui/button';
import { Input } from '@/components/plate/ui/input';
import { Label } from '@/components/plate/ui/label';

type BillingFormPreviewProps = {
  // The organization-name field's value, as the real form prefills it.
  orgName?: string;
};

// The survey's choice buttons (SurveyStep.tsx, CHOICE_CLASS and
// CHOICE_OUTLINE_CLASS), copied so the two tabs are the frameworks row's
// pressed and unpressed buttons.
const CHOICE_CLASS = 'h-10 px-3 font-normal';
const CHOICE_OUTLINE_CLASS = `${CHOICE_CLASS} bg-transparent dark:bg-transparent`;

// The shared SelectTrigger's box (ui/select.tsx) at the survey's h-11, for
// the country row Stripe draws as a select.
const SELECT_BOX_CLASS =
  'border-input dark:bg-input/30 flex h-11 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm';

/**
 * A static replica of the dashboard's BillingSetupForm as it looks once
 * Stripe's frames are ready. The real form is not ported (it needs
 * Stripe.js and a key), so the payment step renders this in its place. It
 * is built from the plate's own Input, Label and Button, so it matches the
 * survey step's fields and choice buttons by construction. Nothing here
 * takes input: the fields are read only and out of the tab order, the tabs
 * are inert, and the submit is disabled as the real one is before the card
 * is complete.
 */
export default function BillingFormPreview({
  orgName,
}: BillingFormPreviewProps) {
  const gt = useGT();
  const id = useId();

  return (
    <div
      role='group'
      className='space-y-4'
      data-testid='billing-form-preview'
      aria-label={gt('Preview of the card form')}
    >
      {/* The AddressElement's first render: billing mode, the name shown as
          an organization, autocomplete on, so one address line. */}
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2.5'>
          <Label htmlFor={`${id}-org`}>
            <T>Organization name</T>
          </Label>
          <Input
            id={`${id}-org`}
            className='h-11'
            type='text'
            readOnly
            tabIndex={-1}
            value={orgName ?? ''}
          />
        </div>
        <div className='flex flex-col gap-2.5'>
          <Label>
            <T>Country or region</T>
          </Label>
          <div className={SELECT_BOX_CLASS}>
            <span>
              <T>United States</T>
            </span>
            <ChevronDown aria-hidden='true' className='size-4 opacity-50' />
          </div>
        </div>
        <div className='flex flex-col gap-2.5'>
          <Label htmlFor={`${id}-line1`}>
            <T>Address line 1</T>
          </Label>
          <Input
            id={`${id}-line1`}
            className='h-11'
            type='text'
            readOnly
            tabIndex={-1}
            placeholder={gt('Street address')}
          />
        </div>
      </div>

      {/* The PaymentElement in its tabs layout. The dashboard creates the
          intent with payment_method_types card and link, so Stripe shows a
          Card tab and a Link tab, Card open. */}
      <div className='flex flex-col gap-4'>
        <div className='grid grid-cols-2 gap-2'>
          <Button
            type='button'
            variant='default'
            className={CHOICE_CLASS}
            aria-pressed={true}
            tabIndex={-1}
          >
            <CreditCardIcon aria-hidden='true' className='size-4' />
            <T>Card</T>
          </Button>
          <Button
            type='button'
            variant='outline'
            className={CHOICE_OUTLINE_CLASS}
            aria-pressed={false}
            tabIndex={-1}
          >
            <LinkIcon aria-hidden='true' className='size-4' />
            <T>Link</T>
          </Button>
        </div>
        <div className='flex flex-col gap-2.5'>
          <Label htmlFor={`${id}-number`}>
            <T>Card number</T>
          </Label>
          <div className='relative'>
            <Input
              id={`${id}-number`}
              className='h-11 pr-32'
              type='text'
              readOnly
              tabIndex={-1}
              placeholder='1234 1234 1234 1234'
            />
            {/* The brand marks Stripe shows at the right of an empty card
                number, 24x16 each. */}
            <span
              aria-hidden='true'
              className='text-muted-foreground absolute inset-y-0 right-2.5 flex items-center gap-1'
            >
              <span className='flex h-4 w-6 items-center justify-center'>
                <SiVisa size={16} />
              </span>
              <span className='flex h-4 w-6 items-center justify-center'>
                <SiMastercard size={16} />
              </span>
              <span className='flex h-4 w-6 items-center justify-center'>
                <SiAmericanexpress size={16} />
              </span>
              <span className='flex h-4 w-6 items-center justify-center'>
                <SiDiscover size={16} />
              </span>
            </span>
          </div>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div className='flex flex-col gap-2.5'>
            <Label htmlFor={`${id}-expiry`}>
              <T>Expiration date</T>
            </Label>
            <Input
              id={`${id}-expiry`}
              className='h-11'
              type='text'
              readOnly
              tabIndex={-1}
              placeholder={gt('MM / YY')}
            />
          </div>
          <div className='flex flex-col gap-2.5'>
            <Label htmlFor={`${id}-cvc`}>
              <T>Security code</T>
            </Label>
            <div className='relative'>
              <Input
                id={`${id}-cvc`}
                className='h-11 pr-10'
                type='text'
                readOnly
                tabIndex={-1}
                placeholder={gt('CVC')}
              />
              <CreditCardIcon
                aria-hidden='true'
                className='text-muted-foreground absolute top-1/2 right-2.5 size-5 -translate-y-1/2'
              />
            </div>
          </div>
        </div>
      </div>

      <Button disabled className='h-11 w-full'>
        <T>Save billing details</T>
      </Button>
    </div>
  );
}
