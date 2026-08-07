'use client';

import { useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The tc families' phone menu — a burger of two stacked hairlines (the
 * brand's doubled line) that opens a ruled sheet under the bar. One shared
 * client component for all three nav families (toolchain TopNav, the
 * singularity subpage TopNav, V0Nav on the finals' homes); each family's
 * own stylesheet scopes the .tc-nav-burger / .tc-nav-sheet rules, and the
 * component stays a fragment so it can sit as the last child of the nav's
 * -in column, where the sheet can seat absolutely below the bar.
 */
export type MobileNavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export default function TcMobileNav({ items }: { items: readonly MobileNavItem[] }) {
  const [open, setOpen] = useState(false);

  useMountEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  return (
    <>
      <button
        aria-controls='tc-nav-sheet'
        aria-expanded={open}
        className='tc-nav-burger'
        type='button'
        onClick={() => setOpen((v) => !v)}
      >
        <i aria-hidden />
        <i aria-hidden />
        <span className='tc-sr-only'>Menu</span>
      </button>
      <nav aria-label='Site' className='tc-nav-sheet' hidden={!open} id='tc-nav-sheet'>
        {items.map((item) => (
          <a
            href={item.href}
            key={`${item.href}-${item.label}`}
            rel={item.external ? 'noreferrer' : undefined}
            target={item.external ? '_blank' : undefined}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </>
  );
}
