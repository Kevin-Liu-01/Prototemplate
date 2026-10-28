import type { ReactNode } from 'react';

import { ThemeButton } from '@/components/viewer/ThemeButton';

import './vote.css';

/**
 * The frame of /vote, /vote/results and /vote/admin: a standalone page off
 * the viewer shell (the vote is private, so it has no sidebar row, no book
 * head and no capture), with the theme button in its corner.
 */
export default function VoteLayout({ children }: { children: ReactNode }) {
  return (
    <div className='vt'>
      {children}
      <ThemeButton className='vt-theme' />
    </div>
  );
}
