'use client';

import { useRef, useState } from 'react';
import { SiGithub } from '@icons-pack/react-simple-icons';

import FieldPicture from '@/components/plate/brand/FieldPicture';
import { useFlow } from '@/components/plate/gallery/flow';
import {
  completeOnboardingAction,
  initiateGithubAction,
} from '@/components/plate/lib/actions';
import { SIGNUP_CREDIT_GRANT_DOLLARS } from '@/components/plate/lib/onboarding/settings';
import { T, useGT } from '@/components/plate/shims/gt-next';
import { Button } from '@/components/plate/ui/button';
import { useToast } from '@/components/plate/ui/toast';

import StepBack from './StepBack';

type ConnectGithubStepProps = {
  orgId: string;
  onBack: () => void;
};

// The gallery state a finished onboarding leads to: the dashboard goes to
// its home (or to GitHub's installation page), which the gallery has no
// state for, so the journey starts over at sign-in.
const DONE_STATE = 'signin';

/**
 * Step 4. Both buttons complete onboarding (which also claims the signup
 * grant when a card was added); in the dashboard Connect then continues to
 * the GitHub App installation page and Skip goes to the dashboard. The
 * port moves the gallery to the sign-in state on either. A refused
 * completion (the org has no project yet) stays here with its reason,
 * since the dashboard gate would only bounce the user back.
 */
export default function ConnectGithubStep({
  orgId,
  onBack,
}: ConnectGithubStepProps) {
  const flow = useFlow();
  const gt = useGT();
  const { toast } = useToast();
  const [connecting, setConnecting] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // A completion may be retried (grant error, failed GitHub redirect); the
  // server-side completion already happened on the first success, so the
  // completion is recorded exactly once per completion, not per click.
  const completionCaptured = useRef(false);
  const busy = connecting || skipping;

  function captureCompleted() {
    if (completionCaptured.current) return;
    completionCaptured.current = true;
  }

  async function handleConnect() {
    setConnecting(true);
    setError(null);

    try {
      // Completing onboarding also claims the signup credit grant when a card
      // was added, so this await covers the provisioning + grant round-trips.
      const completion = await completeOnboardingAction(orgId);

      if (!completion.success) {
        setError(
          completion.error ?? gt('Something went wrong. Please try again.')
        );
        setConnecting(false);
        return;
      }
      captureCompleted();

      // Surface a grant failure BEFORE navigating away to GitHub, otherwise
      // the promised credits vanish silently. Retrying is safe and effective:
      // an unfinished claim resumes, and the grant is at-most-once even if a
      // prior attempt actually landed.
      if (completion.creditsError) {
        setError(
          gt(
            'Your ${amount} in credits could not be added. Please try again.',
            {
              amount: SIGNUP_CREDIT_GRANT_DOLLARS,
            }
          )
        );
        setConnecting(false);
        return;
      }

      const result = await initiateGithubAction(orgId);

      // The dashboard leaves for result.redirectUrl here; the stub carries
      // no URL, so a successful initiation starts the gallery over.
      if (result.success) {
        flow.go(DONE_STATE);
        return;
      }
      setError(result.error ?? gt('Failed to connect GitHub'));
    } catch {
      setError(gt('Something went wrong. Please try again.'));
    }
    setConnecting(false);
  }

  async function handleSkip() {
    setSkipping(true);
    setError(null);
    try {
      const result = await completeOnboardingAction(orgId);
      if (!result.success) {
        setError(result.error ?? gt('Something went wrong. Please try again.'));
        setSkipping(false);
        return;
      }
      captureCompleted();
      // The toast renders where the gallery mounts the Toaster.
      if (result.creditsGranted) {
        toast({
          title: gt("You're all set"),
          description: gt(
            '${amount} in free credits were added to your account.',
            {
              amount: SIGNUP_CREDIT_GRANT_DOLLARS,
            }
          ),
        });
      } else if (result.creditsError) {
        // The grant errored (not mere ineligibility): don't let the promised
        // credits vanish silently; tell the user how to recover.
        toast({
          title: gt('Your ${amount} in credits could not be added', {
            amount: SIGNUP_CREDIT_GRANT_DOLLARS,
          }),
          description: gt(
            'We hit a temporary error on our end. Please contact support and we will add them for you.'
          ),
          variant: 'destructive',
        });
      }
      flow.go(DONE_STATE);
    } catch {
      setError(gt('Something went wrong. Please try again.'));
      setSkipping(false);
    }
  }

  return (
    // The gap between the heading block and the actions is the frame's
    // --plate-section-gap (plate.css .plate-root), which compresses under
    // 880px tall.
    <div className='flex flex-col gap-(--plate-section-gap)'>
      <FieldPicture name='tablet' />
      <div className='flex flex-col gap-(--plate-heading-gap)'>
        <h1 className='typo-page-heading'>
          <T>Connect GitHub</T>
        </h1>
        <p className='typo-lede'>
          <T>
            Connect your GitHub organization to automate translations in code.
          </T>
        </p>
      </div>

      <div className='flex flex-col gap-3'>
        <Button
          onClick={handleConnect}
          loading={connecting}
          disabled={skipping}
          className='h-11 w-full'
        >
          <SiGithub aria-hidden='true' className='size-4' />
          <T>Connect GitHub</T>
        </Button>
        <div className='flex items-center justify-between gap-4'>
          <StepBack onClick={onBack} disabled={busy} />
          {/* Under md the link is 44px tall, the phone's tap target. */}
          <Button
            variant='link'
            onClick={() => void handleSkip()}
            disabled={connecting}
            loading={skipping}
            className='h-auto px-0 font-normal text-(--ink-2) max-md:min-h-11'
          >
            <T>Skip and Finish</T>
          </Button>
        </div>
        {error && <p className='typo-error'>{error}</p>}
      </div>
    </div>
  );
}
