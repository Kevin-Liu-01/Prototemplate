'use client';

import { useState } from 'react';

import { GtMark } from '@/components/viewer/GtMark';
import { ThemeButton } from '@/components/viewer/ThemeButton';

import { HREF } from './data';

/**
 * The lintel over the passage: a sticky bar on the forecourt's own column,
 * the GT mark and name at the left, four links on the axis, the theme
 * switch and the two actions at the right. Under 900px the links fold into
 * a panel under the bar.
 */
const LINKS: readonly { label: string; href: string }[] = [
  { label: 'Docs', href: HREF.docs },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: HREF.blog },
  { label: 'Enterprise', href: HREF.enterprise },
];

export default function TopNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className={open ? 'pg-nav is-open' : 'pg-nav'}>
      <div className='pg-passage pg-nav-in'>
        <a className='pg-brand' href='#top'>
          <GtMark width={25} height={16} />
          <span>General Translation</span>
        </a>

        <nav className='pg-links' aria-label='Primary' id='pg-links'>
          {LINKS.map((link) => (
            <a href={link.href} key={link.label} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className='pg-nav-acts'>
          <ThemeButton className='pg-theme' />
          <a className='pg-signin' href={HREF.signIn}>
            Sign In
          </a>
          <a className='pg-btn pg-btn-solid pg-btn-sm' href={HREF.demo}>
            Get a Demo
          </a>
          <button
            type='button'
            className='pg-menu'
            aria-expanded={open}
            aria-controls='pg-links'
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(open === false)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
