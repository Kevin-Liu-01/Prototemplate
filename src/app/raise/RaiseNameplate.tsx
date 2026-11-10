'use client';

import { Nameplate } from '@/components/docs/DocsNameplate';

/** The raise site's nameplate: the hub's mark to /, and Raise to /raise. */
export default function RaiseNameplate({ className }: { href?: string; className?: string }) {
  return <Nameplate className={className} section='Raise' sectionHref='/raise' />;
}
