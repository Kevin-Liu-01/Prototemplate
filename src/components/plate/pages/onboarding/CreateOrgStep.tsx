'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';

import FieldPicture from '@/components/plate/brand/FieldPicture';
import { useFlow } from '@/components/plate/gallery/flow';
import {
  STUB_LATENCY_MS,
  saveOnboardingOrgAction,
} from '@/components/plate/lib/actions';
import { SUPPORT_EMAIL } from '@/components/plate/lib/onboarding/settings';
import { T, Var, useGT } from '@/components/plate/shims/gt-next';
import { Button } from '@/components/plate/ui/button';
import { Input } from '@/components/plate/ui/input';
import { Label } from '@/components/plate/ui/label';

import StepBack from './StepBack';

type Blocked =
  | { reason: 'org_limit_reached' }
  | { reason: 'project_limit_reached'; orgId: string };

type CreateOrgStepProps = {
  enterpriseId?: string;
  // Set once the org exists (created earlier this session, or carried in the
  // URL) so a resubmit renames it instead of creating a second one.
  existingOrgId?: string;
  // The user's organizations, offered as the way into the dashboard when
  // the org limit leaves nothing to create here.
  existingOrgs: { id: string; name: string }[];
  // The server's org-limit verdict for a fresh create; the step then shows
  // the existing organizations instead of a form it knows would fail.
  orgLimitReached: boolean;
  // A verdict the step starts on, for a load that already knows the org
  // cannot take its first project (the development gallery shows it).
  initialBlocked?: Blocked;
  orgName: string;
  onOrgNameChange: (orgName: string) => void;
  // Fires as soon as the org is saved so the wizard records the id in state
  // and in the URL; a later retry then renames instead of duplicating.
  onOrgSaved: (orgId: string, renamed: boolean) => void;
  onNext: (orgId: string) => void;
  // Completes onboarding and leaves for a dashboard path (an existing org,
  // the upgrade page). The dashboard gate admits no route before completion,
  // so a plain link would only bounce back here.
  onOpenDashboard: (path: string, via: string) => void;
  onBack: () => void;
};

// The gallery state a saved organization leads to.
const NEXT_STATE = 'payment';

/**
 * Step 2. Creates the organization and its first project, or renames the
 * org when one already rides along. Input survives a failed submit; errors
 * show inline. A user already at the org limit gets their existing
 * organizations instead of the form, and an org whose first project hit
 * the project limit gets the upgrade page. In the gallery a saved org
 * moves to the payment state; the dashboard destinations (an existing
 * org, the upgrade page) have no state here, so those buttons show their
 * pending face for the stub's latency and return.
 */
export default function CreateOrgStep({
  enterpriseId,
  existingOrgId,
  existingOrgs,
  orgLimitReached,
  initialBlocked,
  orgName,
  onOrgNameChange,
  onOrgSaved,
  onNext,
  onOpenDashboard,
  onBack,
}: CreateOrgStepProps) {
  const gt = useGT();
  const flow = useFlow();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<Blocked | null>(
    initialBlocked ?? null
  );
  const [leaving, setLeaving] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!orgName.trim()) {
      setError(gt('Please enter an organization name'));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const result = await saveOnboardingOrgAction({
        orgName: orgName.trim(),
        enterpriseId,
        orgId: existingOrgId,
      });

      if (result.success && result.orgId) {
        onOrgSaved(result.orgId, Boolean(existingOrgId));
        onNext(result.orgId);
        flow.go(NEXT_STATE);
        return;
      }

      if (result.reason === 'org_limit_reached') {
        setBlocked({ reason: 'org_limit_reached' });
      } else if (result.reason === 'project_limit_reached' && result.orgId) {
        // The organization exists without its first project; keep its id in
        // state and the URL so a refresh or a later visit resumes here.
        onOrgSaved(result.orgId, Boolean(existingOrgId));
        setBlocked({ reason: 'project_limit_reached', orgId: result.orgId });
      } else if (result.reason === 'project_failed' && result.orgId) {
        // Same org, failed project: keep the id so the retry adds the
        // project to this org instead of opening a second one.
        onOrgSaved(result.orgId, Boolean(existingOrgId));
        setError(result.error ?? gt('Something went wrong'));
      } else {
        setError(result.error ?? gt('Something went wrong'));
      }
    } catch {
      // A rejected action (network drop, server crash) must read as a
      // failure the user can retry. The typed name stays in the form.
      setError(gt('Something went wrong. Please try again.'));
    } finally {
      setSaving(false);
    }
  }

  // The dashboard completes onboarding and navigates away here; the gallery
  // has no dashboard, so the button holds its pending face for the stub's
  // latency and comes back.
  function leaveFor(destination: string, via: string) {
    setLeaving(destination);
    onOpenDashboard(destination, via);
    window.setTimeout(() => setLeaving(null), STUB_LATENCY_MS);
  }

  // Nothing to create: the user is already in the maximum number of
  // organizations. Offer each of them, and support for a higher limit.
  const atOrgLimit =
    blocked?.reason === 'org_limit_reached' ||
    (orgLimitReached && !existingOrgId);

  if (atOrgLimit) {
    return (
      // The gap between the heading block, the list and the note is the
      // frame's --plate-section-gap (plate.css .plate-root), which
      // compresses under 880px tall; the same token on every view of the
      // step keeps them one step.
      <div className='flex flex-col gap-(--plate-section-gap)'>
        <FieldPicture name='rosetta' />
        <div className='flex flex-col gap-(--plate-heading-gap)'>
          <h1 className='typo-page-heading'>
            <T>Create your organization</T>
          </h1>
          <p className='typo-lede'>
            <T>You already have the maximum number of organizations.</T>
          </p>
        </div>

        <ul className='ruled border-y' data-testid='onboarding-existing-orgs'>
          {existingOrgs.map((org) => (
            <li key={org.id}>
              <Button
                variant='ghost'
                className='h-11 w-full justify-between rounded-none px-0 font-medium hover:bg-transparent'
                loading={leaving === `/org/${org.id}`}
                disabled={leaving !== null}
                aria-label={gt('Open {name}', { name: org.name })}
                onClick={() => leaveFor(`/org/${org.id}`, 'existing_org')}
              >
                <span className='truncate'>{org.name}</span>
                <ArrowRight aria-hidden='true' className='size-4 shrink-0' />
              </Button>
            </li>
          ))}
        </ul>

        <div className='flex flex-col gap-4'>
          <p className='text-muted-foreground text-sm'>
            <T>
              To raise the limit, contact{' '}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className='text-foreground underline underline-offset-4 max-md:inline-flex max-md:min-h-11 max-md:items-center'
              >
                <Var>{SUPPORT_EMAIL}</Var>
              </a>
              .
            </T>
          </p>
          <div className='flex items-center justify-between gap-4'>
            <StepBack onClick={onBack} disabled={leaving !== null} />
          </div>
        </div>
      </div>
    );
  }

  // The org exists but its first project could not be created: the org is
  // at its project limit, which the upgrade page lifts.
  if (blocked?.reason === 'project_limit_reached') {
    const upgradePath = `/org/${blocked.orgId}/upgrade`;
    return (
      <div className='flex flex-col gap-(--plate-section-gap)'>
        <FieldPicture name='rosetta' />
        <div className='flex flex-col gap-(--plate-heading-gap)'>
          <h1 className='typo-page-heading'>
            <T>Create your organization</T>
          </h1>
          <p className='typo-lede'>
            <T>
              Your organization was created, but it has reached its project
              limit, so its first project could not be added. Upgrading the plan
              raises the limit.
            </T>
          </p>
        </div>
        <div className='flex flex-col gap-3'>
          <Button
            className='h-11 w-full'
            loading={leaving === upgradePath}
            onClick={() => leaveFor(upgradePath, 'project_limit')}
          >
            <T>Open the upgrade page</T>
          </Button>
          <p className='text-muted-foreground text-sm'>
            <T>
              Or contact{' '}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className='text-foreground underline underline-offset-4 max-md:inline-flex max-md:min-h-11 max-md:items-center'
              >
                <Var>{SUPPORT_EMAIL}</Var>
              </a>
              .
            </T>
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className='flex flex-col gap-(--plate-section-gap)'
    >
      <FieldPicture name='rosetta' />
      <div className='flex flex-col gap-(--plate-heading-gap)'>
        <h1 className='typo-page-heading'>
          {existingOrgId ? (
            <T>Update your organization</T>
          ) : (
            <T>Create your organization</T>
          )}
        </h1>
        <p className='typo-lede'>
          {existingOrgId ? (
            <T>Update the name of your organization.</T>
          ) : (
            <T>This will also create your first project.</T>
          )}
        </p>
      </div>

      <div className='flex flex-col gap-2.5'>
        <Label htmlFor='org-name'>
          <T>Organization name</T>
          <span className='text-destructive' aria-hidden='true'>
            *
          </span>
        </Label>
        <Input
          id='org-name'
          value={orgName}
          onChange={(e) => {
            onOrgNameChange(e.target.value);
            setError(null);
          }}
          placeholder={gt('My Company')}
          className='h-11'
          autoComplete='organization'
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'org-name-error' : undefined}
          autoFocus
        />
        {error && (
          <p id='org-name-error' className='typo-error'>
            {error}
          </p>
        )}
      </div>

      <div className='flex flex-col gap-3'>
        <Button type='submit' loading={saving} className='h-11 w-full'>
          <T>Next</T>
        </Button>
        <div className='flex items-center justify-between gap-4'>
          <StepBack onClick={onBack} disabled={saving} />
        </div>
      </div>
    </form>
  );
}
