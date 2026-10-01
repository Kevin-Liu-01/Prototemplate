'use client';

import { useMemo, useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

import { T, Var, useGT } from '@/components/plate/shims/gt-next';
import { Button } from '@/components/plate/ui/button';
import { Label } from '@/components/plate/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/plate/ui/select';
import { generateCliWizardCredentialsAction } from '@/components/plate/lib/actions';
import { useFlow } from '@/components/plate/gallery/flow';
import type {
  AuthorizedOrg,
  AuthorizedProject,
} from '@/components/plate/lib/authorization';
import AuthFrame from '@/components/plate/pages/auth/AuthFrame';

import CloseWindowButton from './CloseWindowButton';

type CliWizardProps = {
  sessionId: string;
  orgs: AuthorizedOrg[];
  projects: AuthorizedProject[];
};

const selectContentClassName =
  'max-h-[min(var(--radix-select-content-available-height),24rem)]';

function getDefaultOrgId(orgs: AuthorizedOrg[]) {
  return orgs[0]?.id ?? null;
}

/**
 * The CLI wizard's project picker. In the dashboard a successful Authorize
 * shows the authorized face in place; in the gallery it also moves to the
 * cli-wizard-done state, the page a second visit to the session shows.
 */
export default function CliWizard({
  sessionId,
  orgs,
  projects,
}: CliWizardProps) {
  const gt = useGT();
  const flow = useFlow();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(() =>
    getDefaultOrgId(orgs)
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [authorizing, setAuthorizing] = useState(false);
  const [authorizedProjectId, setAuthorizedProjectId] = useState<string | null>(
    null
  );
  const [error, setError] = useState(false);

  const availableProjects = useMemo(
    () => projects.filter((project) => project.org_id === selectedOrgId),
    [projects, selectedOrgId]
  );
  const authorizedProject = projects.find(
    (project) => project.id === authorizedProjectId
  );

  async function handleAuthorize() {
    if (!selectedProjectId) return;

    setAuthorizing(true);
    setError(false);
    const result = await generateCliWizardCredentialsAction(
      selectedProjectId,
      sessionId
    );

    if (result.success) {
      setAuthorizedProjectId(result.data.projectId);
      flow.go('cli-wizard-done');
    } else {
      setError(true);
    }

    setAuthorizing(false);
  }

  if (!orgs.length) {
    return (
      <AuthFrame
        title={
          <span className='flex items-center gap-2'>
            <XCircleIcon
              aria-hidden='true'
              className='text-destructive size-6 shrink-0'
            />
            <T>No organizations found</T>
          </span>
        }
        lede={<T>Create an organization before authorizing the CLI.</T>}
      >
        <CloseWindowButton />
      </AuthFrame>
    );
  }

  if (authorizedProjectId) {
    return (
      <AuthFrame
        title={
          <span className='flex items-center gap-2'>
            <CheckCircleIcon
              aria-hidden='true'
              className='text-status-success size-6 shrink-0'
            />
            <T>CLI authorized</T>
          </span>
        }
        lede={<T>You can now return to your terminal.</T>}
      >
        {authorizedProject && (
          <T>
            <p className='text-muted-foreground text-sm'>
              Authorized project:{' '}
              <span className='text-foreground font-medium'>
                <Var>{authorizedProject.name}</Var>
              </span>
            </p>
          </T>
        )}
        <CloseWindowButton />
      </AuthFrame>
    );
  }

  return (
    <AuthFrame
      title={<T>Authorize CLI access</T>}
      lede={<T>Select an organization and project to authorize CLI access.</T>}
    >
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col gap-2.5'>
          <T>
            <Label htmlFor='org-select'>Organization</Label>
          </T>
          <Select
            value={selectedOrgId ?? undefined}
            onValueChange={(value) => {
              setSelectedOrgId(value);
              setSelectedProjectId(null);
              setError(false);
            }}
          >
            <SelectTrigger id='org-select' className='h-11 w-full'>
              <SelectValue placeholder={gt('Select an organization')} />
            </SelectTrigger>
            <SelectContent className={selectContentClassName}>
              {orgs.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col gap-2.5'>
          <T>
            <Label htmlFor='project-select'>Project</Label>
          </T>
          <Select
            value={selectedProjectId ?? undefined}
            onValueChange={(value) => {
              setSelectedProjectId(value);
              setError(false);
            }}
            disabled={!selectedOrgId || availableProjects.length === 0}
          >
            <SelectTrigger id='project-select' className='h-11 w-full'>
              <SelectValue
                placeholder={
                  availableProjects.length === 0
                    ? gt('No projects in this organization')
                    : gt('Select a project')
                }
              />
            </SelectTrigger>
            <SelectContent className={selectContentClassName}>
              {availableProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && <p className='typo-error'>{gt('Failed to authorize CLI')}</p>}
      </div>

      <T>
        <Button
          type='button'
          className='h-11 w-full'
          onClick={handleAuthorize}
          disabled={!selectedProjectId}
          loading={authorizing}
        >
          Authorize
        </Button>
      </T>
    </AuthFrame>
  );
}
