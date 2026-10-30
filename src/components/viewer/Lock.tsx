import { cn } from '@/lib/cn';
import { isLocked } from '@/lib/seo/policy';

import { Icon } from './icons';

import './Lock.css';

export type LockProps = {
  /** the open lock, once signed in */
  open?: boolean;
  /** beside a page title: drawn larger and hidden from screen readers, since the title names the page */
  title?: boolean;
};

/** The lock glyph, Heroicons 20 solid from icons.tsx, after a name and sized by it. */
export function Lock({ open = false, title = false }: LockProps) {
  return (
    <span
      className={cn('pt-lock', title && 'is-title')}
      role={title ? undefined : 'img'}
      aria-label={title ? undefined : open ? 'Unlocked' : 'Locked'}
      aria-hidden={title || undefined}
    >
      <Icon name={open ? 'unlock' : 'lock'} />
    </span>
  );
}

/**
 * The lock after a locked page's name (LOCKED in src/lib/seo/policy.ts)
 * wherever the page itself is listed: a sidebar page row, a gallery card
 * and a search row; BookHead draws the title's. A page's own sections and
 * headings carry none, since the page's row and head already do. Nothing
 * for any other address.
 */
export function LockMark({ href }: { href?: string }) {
  return href && isLocked(href) ? <Lock /> : null;
}
