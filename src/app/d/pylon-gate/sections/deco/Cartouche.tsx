import type { ReactNode } from 'react';

/**
 * The cartouche frame: a rounded loop with the knot reduced to one vertical
 * bar past its right end. Home: frames (the T proof). The element draws its
 * own ring once in gold; the knot is the same owner's pseudo-element, so no
 * second edge is ever drawn beside the loop.
 */
type CartoucheProps = {
  children: ReactNode;
  className?: string;
  /** Render as a list item inside the descending column. */
  as?: 'div' | 'li';
  reveal?: boolean;
};

export default function Cartouche({ children, className, as = 'div', reveal = false }: CartoucheProps) {
  const cls = className ? `pg-cart ${className}` : 'pg-cart';
  if (as === 'li') {
    return (
      <li className={cls} data-reveal={reveal ? '' : undefined}>
        {children}
      </li>
    );
  }
  return (
    <div className={cls} data-reveal={reveal ? '' : undefined}>
      {children}
    </div>
  );
}
