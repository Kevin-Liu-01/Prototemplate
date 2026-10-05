'use client';

import type { ComponentProps } from 'react';

import BlockedState from './BlockedState';
import DeviceApproval from './DeviceApproval';
import DeviceCodeForm from './DeviceCodeForm';

type DevicePageProps = {
  /** The code from the query, shown again in the form on error. */
  userCode?: string;
  /** Why the code form shows again after a submit. */
  error?: ComponentProps<typeof DeviceCodeForm>['error'];
  /** The session's network is not allowed in. */
  blocked?: boolean;
  /** A verified, pending code: the approval screen's facts. */
  approval?: Omit<ComponentProps<typeof DeviceApproval>, 'userCode'>;
};

/**
 * The RFC 8628 verification page (the dashboard's signin/device/page.tsx).
 * There a server component claims the code for the signed-in user and
 * picks the face from the result; here the result arrives as props: no
 * code shows the form, an error shows the form with its message, a pending
 * code with its client shows the approval screen. The gallery's frame
 * supplies the field (scene 1, the calligraphy picture), the mark and the foot.
 */
export default function DevicePage({
  userCode,
  error,
  blocked = false,
  approval,
}: DevicePageProps) {
  if (blocked) return <BlockedState />;
  if (approval && userCode) {
    return <DeviceApproval userCode={userCode} {...approval} />;
  }
  return <DeviceCodeForm error={error} defaultValue={userCode} />;
}
