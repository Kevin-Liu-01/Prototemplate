'use client';

import { useState, type ReactNode } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

import FieldPicture from '@/components/plate/brand/FieldPicture';
import { useFlow } from '@/components/plate/gallery/flow';
import { useMountEffect } from '@/components/plate/hooks/use-mount-effect';
import {
  SIGNUP_CREDIT_GRANT_DOLLARS,
  formatWholeDollars,
  type SignupGrantUiAvailability,
} from '@/components/plate/lib/onboarding/settings';
import { T, useGT } from '@/components/plate/shims/gt-next';
import { Button } from '@/components/plate/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/plate/ui/dialog';

import BillingFormPreview from './BillingFormPreview';
import CreditsCard from './CreditsCard';
import StepBack from './StepBack';

// The gallery state the step leads to, with or without a card.
const NEXT_STATE = 'github';

type PaymentStepProps = {
  orgId: string;
  // Prefills the address form's organization-name field (Stripe's
  // AddressElement cannot hide it) so users aren't asked to retype the name
  // they just chose in the previous step.
  orgName?: string;
  initialHasCard: boolean;
  initialGrantAvailability: SignupGrantUiAvailability;
  // The dashboard verifies a returned SetupIntent on mount; the port has no
  // Stripe, so the id is accepted for the dashboard's prop shape and read
  // by nothing.
  initialSetupIntentId?: string;
  // Fires in the dashboard once the real form saves a card; the port never
  // saves one, so it is accepted and never called.
  onCardSaved: (availability: SignupGrantUiAvailability) => void;
  onUseDifferentCard: () => void;
  onNext: () => void;
  onBack: () => void;
  // The development gallery's static stand-in of the billing form. The
  // port always renders a stand-in: this node when set, else
  // BillingFormPreview with the organization name.
  formPreview?: ReactNode;
};

/**
 * Step 3. In the dashboard it saves a card through the Stripe setup-intent
 * flow and reports whether the saved card can still earn the signup grant.
 * The port keeps the step's states and copy and renders the static card
 * form in place of Stripe's; Continue and Skip for now move the gallery to
 * the GitHub state. The credits are named only while `grantAvailability`
 * is 'available'; a card that was already used elsewhere, or an account
 * that already claimed, gets the status copy without the promise.
 */
export default function PaymentStep({
  orgId,
  orgName,
  initialHasCard,
  initialGrantAvailability,
  onUseDifferentCard,
  onNext,
  onBack,
  formPreview,
}: PaymentStepProps) {
  const gt = useGT();
  const flow = useFlow();
  const [hasCard] = useState(initialHasCard);
  const [grantAvailability] = useState(initialGrantAvailability);
  const [skipDialogOpen, setSkipDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const grantAmount = formatWholeDollars(SIGNUP_CREDIT_GRANT_DOLLARS);

  // Where the dashboard's wizard routes to the next step, the gallery
  // moves to the GitHub state.
  function next() {
    onNext();
    flow.go(NEXT_STATE);
  }

  // "Use a different card": in the dashboard, back to the form with a fresh
  // SetupIntent. The duplicate card stays attached as a regular payment
  // method; the grant picks the newest card, so the replacement becomes the
  // granting card.
  function handleUseDifferentCard() {
    onUseDifferentCard();
  }

  // The skip dialog exists to name the credits the user forfeits by leaving
  // without a card. When the grant is not available there is nothing to
  // forfeit, so the amount must not appear and the skip advances directly.
  function handleSkip() {
    if (grantAvailability !== 'available') {
      next();
      return;
    }
    setSkipDialogOpen(true);
  }

  useMountEffect(() => {
    // Card already on file (refresh, back-button, abandoned 3DS): if it
    // can't earn the grant, raise the alert immediately.
    if (initialHasCard && initialGrantAvailability === 'card-used') {
      setDuplicateDialogOpen(true);
    }
  });

  return (
    // The gap between the heading block, the card and the form is the
    // frame's --plate-section-gap (plate.css .plate-root), which
    // compresses under 880px tall.
    <div className='flex flex-col gap-(--plate-section-gap)'>
      <FieldPicture name='calligraphy' />
      <div className='flex flex-col gap-(--plate-heading-gap)'>
        <h1 className='typo-page-heading'>
          <T>Add a payment method</T>
        </h1>
        {hasCard ? (
          <p className='typo-lede'>
            <T>
              Your card is saved for future use. You will not be charged until
              you choose to buy credits.
            </T>
          </p>
        ) : grantAvailability === 'available' ? (
          <p className='typo-lede'>
            <T>
              Add a card to your account and claim {grantAmount} in platform
              credits. You won’t be charged unless you choose to buy more.
            </T>
          </p>
        ) : (
          <p className='typo-lede'>
            <T>
              Add a card to your account. You won’t be charged unless you choose
              to buy credits.
            </T>
          </p>
        )}
      </div>

      <CreditsCard grantAvailability={grantAvailability} />

      <div className='flex flex-col gap-6'>
        {hasCard ? (
          grantAvailability === 'available' ? (
            <>
              <p className='text-muted-foreground flex items-start gap-2 text-sm'>
                <CheckCircleIcon
                  aria-hidden='true'
                  className='text-status-success mt-px size-5 shrink-0'
                />
                <T>
                  Card added. Your {grantAmount} in credits is waiting at the
                  finish.
                </T>
              </p>
              <Button onClick={next} className='h-11 w-full'>
                <T>Continue</T>
              </Button>
              <div className='flex items-center justify-between gap-4'>
                <StepBack onClick={onBack} />
              </div>
            </>
          ) : grantAvailability === 'card-used' ? (
            <>
              <p className='text-muted-foreground flex items-start gap-2 text-sm'>
                <CheckCircleIcon
                  aria-hidden='true'
                  className='text-status-success mt-px size-5 shrink-0'
                />
                <T>
                  Card added, but it was already used to claim the free signup
                  credits, so no credits will be granted with this card.
                </T>
              </p>
              <div className='flex flex-col gap-2'>
                <Button
                  onClick={handleUseDifferentCard}
                  className='h-11 w-full'
                >
                  <T>Use a different card</T>
                </Button>
                <Button
                  variant='outline'
                  onClick={next}
                  className='h-11 w-full'
                >
                  <T>Continue without the {grantAmount} credits</T>
                </Button>
              </div>
              <div className='flex items-center justify-between gap-4'>
                <StepBack onClick={onBack} />
              </div>
            </>
          ) : (
            <>
              <p className='text-muted-foreground flex items-start gap-2 text-sm'>
                <CheckCircleIcon
                  aria-hidden='true'
                  className='text-status-success mt-px size-5 shrink-0'
                />
                <T>
                  Card added. The {grantAmount} free credits have already been
                  claimed by this organization, so they can't be claimed again.
                </T>
              </p>
              <Button onClick={next} className='h-11 w-full'>
                <T>Continue</T>
              </Button>
              <div className='flex items-center justify-between gap-4'>
                <StepBack onClick={onBack} />
              </div>
            </>
          )
        ) : (
          <>
            {/* The slot keeps the form's height from first paint, so the
                step's Back row and the foot never move. */}
            <div
              className='flex flex-col gap-6'
              data-testid='onboarding-payment-form-slot'
            >
              <div className='min-h-[27rem]'>
                {formPreview ?? <BillingFormPreview orgName={orgName} />}
              </div>
            </div>

            <div className='flex items-center justify-between gap-4'>
              <StepBack onClick={onBack} />
              <Button
                variant='link'
                className='h-auto px-0 font-normal text-(--ink-2) max-md:min-h-11'
                onClick={handleSkip}
              >
                <T>Skip for now</T>
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Speed bump for a card that already claimed the grant elsewhere: swap
          it for a fresh card, or knowingly continue without the credits. */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <T>
            <DialogHeader>
              <DialogTitle>This card was already used</DialogTitle>
              <DialogDescription>
                This card was used to claim the {grantAmount} free credits in
                another organization. To claim the credits here, use a different
                card.
              </DialogDescription>
            </DialogHeader>
          </T>
          <T>
            <DialogFooter className='mt-2 flex-col gap-2 sm:flex-col'>
              <Button
                onClick={handleUseDifferentCard}
                className='w-full max-md:h-11'
              >
                Use a different card
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  setDuplicateDialogOpen(false);
                  next();
                }}
                className='w-full max-md:h-11'
              >
                It's ok, I don't want the {grantAmount} credits
              </Button>
            </DialogFooter>
          </T>
        </DialogContent>
      </Dialog>

      {/* Skipping forfeits the grant: completing onboarding without a card
          closes the claim window, so the dialog names the credits before
          the user leaves them. Opened only while the grant is available. */}
      <Dialog open={skipDialogOpen} onOpenChange={setSkipDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <T>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                Completing onboarding earns you {grantAmount} in platform
                credits.
              </DialogDescription>
            </DialogHeader>
          </T>
          <T>
            <DialogFooter className='flex-col gap-2 sm:flex-col'>
              <Button
                variant='outline'
                onClick={() => {
                  setSkipDialogOpen(false);
                  next();
                }}
                className='w-full max-md:h-11'
              >
                Continue without credits
              </Button>
              <Button
                onClick={() => setSkipDialogOpen(false)}
                className='w-full max-md:h-11'
              >
                Complete onboarding
              </Button>
            </DialogFooter>
          </T>
        </DialogContent>
      </Dialog>
    </div>
  );
}
