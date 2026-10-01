import type { ReactNode } from 'react';

type OAuthDetailRowProps = {
  /** The row's key, in the ledger's key style (13px, medium, titanium). */
  label: ReactNode;
  children: ReactNode;
  'data-testid'?: string;
};

/**
 * One row of the request-details ledger: the key in the left column and
 * the value in the right, stacked on narrow screens so long values (an
 * email, a callback host) keep the full width. Rendered inside a
 * `dl.ruled`, which draws the hairline between rows.
 */
export default function OAuthDetailRow({
  label,
  children,
  'data-testid': testId,
}: OAuthDetailRowProps) {
  return (
    <div className='grid gap-x-3 gap-y-1 py-2 text-sm sm:grid-cols-[6.875rem_minmax(0,1fr)]'>
      <dt className='typo-key pt-0.5'>{label}</dt>
      <dd className='min-w-0' data-testid={testId}>
        {children}
      </dd>
    </div>
  );
}
