'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';

import {
  SiDiscord,
  SiGithub,
  SiNextdotjs,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiSanity,
} from '@icons-pack/react-simple-icons';
import {
  BookOpen,
  Boxes,
  Briefcase,
  Languages,
  LayoutDashboard,
  Mail,
  Newspaper,
  SquareTerminal,
} from 'lucide-react';

import TcMobileNav from '@/components/shared/TcMobileNav';
import { ThemeButton } from '@/components/viewer/ThemeButton';

import NavMenu, { type MenuColumn } from '../components/NavMenu';

const DOCS = 'https://generaltranslation.com/docs';

const RESOURCES: readonly MenuColumn[] = [
  {
    title: 'Company',
    items: [
      { label: 'Blog', desc: 'News and updates', href: '/d/toolchain/blog', icon: Newspaper },
      { label: 'Careers', desc: 'Join our growing team', href: '/d/toolchain/careers', icon: Briefcase },
      { label: 'Supported Locales', desc: '100+ languages supported', href: '/d/toolchain/locales', icon: Languages },
    ],
  },
  {
    title: 'Community',
    items: [
      { label: 'GitHub', desc: 'Open source libraries', href: 'https://github.com/generaltranslation', icon: SiGithub, external: true },
      { label: 'Discord', desc: 'Join our developer community', href: 'https://generaltranslation.com/discord', icon: SiDiscord, external: true },
      { label: 'Contact', desc: 'Get in touch with us', href: '/d/toolchain/contact', icon: Mail },
    ],
  },
];

const DOCS_MENU: readonly MenuColumn[] = [
  {
    title: 'Libraries',
    items: [
      { label: 'Translation CLI', desc: 'gt', href: `${DOCS}/cli`, icon: SquareTerminal, external: true },
      { label: 'Next.js SDK', desc: 'gt-next', href: `${DOCS}/next`, icon: SiNextdotjs, external: true },
      { label: 'React SDK', desc: 'gt-react', href: `${DOCS}/react`, icon: SiReact, external: true },
      { label: 'React Native SDK', desc: 'gt-react-native', href: `${DOCS}/react-native`, img: '/logos/react-native-no-bg.svg', invertsInDark: true, external: true },
      { label: 'TanStack Start SDK', desc: 'gt-tanstack-start', href: `${DOCS}/tanstack-start`, img: '/logos/tanstack-logo.svg', external: true },
      { label: 'Node.js SDK', desc: 'gt-node', href: `${DOCS}/node`, icon: SiNodedotjs, external: true },
      { label: 'Python SDK', desc: 'gt-python', href: `${DOCS}/python`, icon: SiPython, external: true },
      { label: 'Core', desc: 'generaltranslation', href: `${DOCS}/core`, icon: Boxes, external: true },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Sanity', desc: 'gt-sanity', href: `${DOCS}/sanity`, icon: SiSanity, external: true },
      { label: 'Mintlify', desc: 'Locadex for Mintlify', href: `${DOCS}/mintlify`, icon: BookOpen, external: true },
    ],
  },
  {
    title: 'Platform',
    items: [
      { label: 'Platform', desc: 'Dashboard', href: 'https://dash.generaltranslation.com', icon: LayoutDashboard, external: true },
      { label: 'Locadex', desc: 'AI Agent', href: '/d/toolchain/locadex', img: '/brand/no-bg-locadex-logo-light.png', invertsInDark: true },
    ],
  },
];


/** Slim, ruled, and quiet — the column's top edge more than a navigation bar. */
export default function TopNav(): ReactNode {
  return (
    <header className='tc-nav' data-tc-nav>
      <div className='tc-nav-in'>
        <a className='tc-nav-brand' href='/d/toolchain'>
          <Image className='tc-logo-light' src='/brand/no-bg-gt-logo-light.png' alt='' width={22} height={22} />
          <Image className='tc-logo-dark' src='/brand/no-bg-gt-logo-dark.png' alt='' width={22} height={22} />
          General Translation
        </a>

        <nav className='tc-nav-links'>
          <NavMenu columns={RESOURCES} label='Resources' />
          <NavMenu columns={DOCS_MENU} label='Docs' wide />
          <a href='/d/toolchain/locadex'>Locadex</a>
          <a href='/d/toolchain/context'>Context</a>
          <a href='/d/toolchain/pricing'>Pricing</a>
          <a href='/d/toolchain/enterprise'>Enterprise</a>
        </nav>

        <div className='tc-nav-right'>
          <ThemeButton className='tc-nav-theme' />
          <a href='#pricing'>Sign in</a>
          <a className='tc-btn tc-btn-solid tc-btn-sm' href='#pricing'>
            Get a demo
          </a>
        </div>

        {/* the phone menu: burger + ruled sheet, last in the -in column so
            the sheet seats absolutely under the bar */}
        <TcMobileNav
          items={[
            { label: 'Locadex', href: '/d/toolchain/locadex' },
            { label: 'Context', href: '/d/toolchain/context' },
            { label: 'Pricing', href: '/d/toolchain/pricing' },
            { label: 'Enterprise', href: '/d/toolchain/enterprise' },
            { label: 'Sign in', href: '#pricing' },
            { label: 'Get a demo', href: '#pricing' },
          ]}
        />
      </div>
    </header>
  );
}
