'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';

import { ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';

import ThemeToggle from '@/components/shared/ThemeToggle';

import './v0-nav.css';

type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

/* Anchor targets live on the v0 sections rendered below the nav. */
const PRODUCT: readonly NavItem[] = [
  { label: 'Locadex', href: '#locadex' },
  { label: 'Context', href: '#context' },
  { label: 'Infrastructure', href: '#infrastructure' },
];

const RESOURCES: readonly NavItem[] = [
  { label: 'Customers', href: '#customers' },
  { label: 'Blog', href: 'https://generaltranslation.com/blog', external: true },
  { label: 'Careers', href: 'https://generaltranslation.com/careers', external: true },
];

function Menu({ label, items }: { label: string; items: readonly NavItem[] }) {
  return (
    <div className='v0-nav-drop'>
      <button className='v0-nav-drop-trigger' type='button' aria-haspopup='true'>
        {label}
        <ChevronDown aria-hidden size={13} strokeWidth={2} />
      </button>
      <div className='v0-nav-panel' role='menu'>
        {items.map((item) => (
          <a
            href={item.href}
            key={item.label}
            rel={item.external ? 'noreferrer' : undefined}
            role='menuitem'
            target={item.external ? '_blank' : undefined}
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}

/**
 * The v0 top bar: the toolchain TopNav shell (same height, hairline
 * underline, brand left, actions right) with the mock's sections. Shared by
 * all five singularity homes, so Enterprise and the brand link derive from
 * the pathname — a static relative href resolves against the parent segment
 * and would land every slug on /d/enterprise.
 */
export default function V0Nav(): ReactNode {
  const pathname = usePathname() ?? '';
  const home = pathname.replace(/\/enterprise\/?$/, '').replace(/\/+$/, '');
  const enterpriseHref = `${home}/enterprise`;

  return (
    <header className='v0-nav' data-v0-nav>
      <div className='v0-nav-in'>
        <a className='v0-nav-brand' href={home || '/'}>
          <Image className='v0-nav-logo-light' src='/brand/no-bg-gt-logo-light.png' alt='' width={22} height={22} />
          <Image className='v0-nav-logo-dark' src='/brand/no-bg-gt-logo-dark.png' alt='' width={22} height={22} />
          General Translation
        </a>

        <nav className='v0-nav-links'>
          <Menu items={PRODUCT} label='Product' />
          <Menu items={RESOURCES} label='Resources' />
          <a href={enterpriseHref}>Enterprise</a>
          <a href='https://generaltranslation.com/pricing' rel='noreferrer' target='_blank'>
            Pricing
          </a>
          <a href='https://generaltranslation.com/docs' rel='noreferrer' target='_blank'>
            Docs
          </a>
        </nav>

        <div className='v0-nav-right'>
          <ThemeToggle className='v0-nav-theme' />
          <a href='https://dash.generaltranslation.com' rel='noreferrer' target='_blank'>
            Sign in
          </a>
          <a className='v0-btn v0-btn-solid v0-btn-sm' href='#deploy'>
            Get a demo
          </a>
        </div>
      </div>
    </header>
  );
}
