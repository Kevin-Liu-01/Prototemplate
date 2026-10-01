import type { ComponentProps, ReactNode } from 'react';

import AuthFrame from '@/components/plate/pages/auth/AuthFrame';
import OAuthClientDetails from './OAuthClientDetails';

type AuthorizationShellProps = Omit<
  ComponentProps<typeof OAuthClientDetails>,
  'children'
> & {
  title: ReactNode;
  lede?: ReactNode;
  footnote?: ReactNode;
  /** Decision rail under the request details: permissions, errors, Approve/Deny. */
  children?: ReactNode;
  /** Extra ledger rows appended to the request details. */
  detailRows?: ReactNode;
  testId?: string;
};

/**
 * Authorization screen in the shared auth frame: the request-details
 * ledger, then the decision rail, in one column so the user reads who is
 * asking before the approve button. Blocks sit 24px apart so the whole
 * screen stays inside one viewport at 1440x900.
 */
export default function AuthorizationShell({
  clientName,
  clientDetails,
  accountEmail,
  trusted = false,
  title,
  lede,
  footnote,
  children,
  detailRows,
  testId,
}: AuthorizationShellProps) {
  return (
    <AuthFrame title={title} lede={lede} footnote={footnote} testId={testId}>
      <div className='flex flex-col gap-6'>
        <OAuthClientDetails
          clientName={clientName}
          clientDetails={clientDetails}
          accountEmail={accountEmail}
          trusted={trusted}
        >
          {detailRows}
        </OAuthClientDetails>
        {children}
      </div>
    </AuthFrame>
  );
}
