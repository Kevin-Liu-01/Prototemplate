'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
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

import NavMenu, { type MenuColumn } from '@/app/d/toolchain/components/NavMenu';

import './topnav-menu.css';

const DOCS = 'https://generaltranslation.com/docs';

/** The shared nav serves five finals; every internal link resolves against
    the CURRENT final's base so /d/<final>/pricing never leaks cross-final. */
function resources(base: string): readonly MenuColumn[] {
  return [
    {
      title: 'Company',
      items: [
        { label: 'Blog', desc: 'News and updates', href: `${base}/blog`, icon: Newspaper },
        { label: 'Careers', desc: 'Join our growing team', href: `${base}/careers`, icon: Briefcase },
        { label: 'Supported Locales', desc: '100+ languages supported', href: `${base}/locales`, icon: Languages },
      ],
    },
    {
      title: 'Community',
      items: [
        { label: 'GitHub', desc: 'Open source libraries', href: 'https://github.com/generaltranslation', icon: SiGithub, external: true },
        { label: 'Discord', desc: 'Join our developer community', href: 'https://generaltranslation.com/discord', icon: SiDiscord, external: true },
        { label: 'Contact', desc: 'Get in touch with us', href: `${base}/contact`, icon: Mail },
      ],
    },
  ];
}

function docsMenu(base: string): readonly MenuColumn[] {
  return [
    {
      title: 'Libraries',
      items: [
        { label: 'Translation CLI', desc: 'gt', href: `${DOCS}/cli`, icon: SquareTerminal, external: true },
        { label: 'Next.js SDK', desc: 'gt-next', href: `${DOCS}/next`, icon: SiNextdotjs, external: true },
        { label: 'React SDK', desc: 'gt-react', href: `${DOCS}/react`, icon: SiReact, external: true },
        { label: 'React Native SDK', desc: 'gt-react-native', href: `${DOCS}/react-native`, img: '/logos/react-native-no-bg.svg', invertsInDark: true, external: true },
        { label: 'TanStack Start SDK', desc: 'gt-tanstack-start', href: `${DOCS}/tanstack-start`, img: '/logos/tanstack-logo.svg', invertsInDark: true, external: true },
        { label: 'Node.js SDK', desc: 'gt-node', href: `${DOCS}/node`, icon: SiNodedotjs, external: true },
        { label: 'Python SDK', desc: 'gt-python', href: `${DOCS}/python`, icon: SiPython, external: true },
        { label: 'Core', desc: 'generaltranslation', href: `${DOCS}/core`, icon: Boxes, external: true },
      ],
    },
    {
      title: 'Content',
      items: [
        { label: 'Sanity', desc: 'gt-sanity', href: `${DOCS}/sanity`, icon: SiSanity, external: true },
        { label: 'Mintlify', desc: 'Locadex for Mintlify', href: `${DOCS}/locadex/mintlify`, icon: BookOpen, external: true },
      ],
    },
    {
      title: 'Platform',
      items: [
        { label: 'Platform', desc: 'Dashboard', href: 'https://dash.generaltranslation.com', icon: LayoutDashboard, external: true },
        { label: 'Locadex', desc: 'AI Agent', href: `${base}/locadex`, img: '/brand/no-bg-locadex-logo-light.png', invertsInDark: true },
      ],
    },
  ];
}

/** Slim, ruled, and quiet — the column's top edge more than a navigation bar.
    Resources and Docs open ruled flyouts (CSS :hover/:focus-within, ported
    from the toolchain nav and re-inked to this system's tokens). */
export default function TopNav(): ReactNode {
  // /d/singularity-dossier/enterprise -> /d/singularity-dossier
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/singularity';

  return (
    <header className='tc-nav' data-tc-nav>
      <div className='tc-nav-in'>
        <a className='tc-nav-brand' href={base}>
          <Image className='tc-logo-light' src='/brand/no-bg-gt-logo-light.png' alt='' width={22} height={22} />
          <Image className='tc-logo-dark' src='/brand/no-bg-gt-logo-dark.png' alt='' width={22} height={22} />
          General Translation
        </a>

        <nav className='tc-nav-links'>
          <NavMenu columns={resources(base)} label='Resources' />
          <NavMenu columns={docsMenu(base)} label='Docs' wide />
          <a href={`${base}/locadex`}>Locadex</a>
          <a href={`${base}/pricing`}>Pricing</a>
          <a href={`${base}/enterprise`}>Enterprise</a>
        </nav>

        <div className='tc-nav-right'>
          <ThemeButton className='tc-nav-theme' />
          <a href='https://dash.generaltranslation.com' rel='noreferrer' target='_blank'>
            Sign in
          </a>
          <a className='tc-btn tc-btn-solid tc-btn-sm' href={`${base}/enterprise`}>
            Get a demo
          </a>
        </div>

        {/* the phone menu: burger + ruled sheet, last in the -in column so
            the sheet seats absolutely under the bar */}
        <TcMobileNav
          items={[
            { label: 'Locadex', href: `${base}/locadex` },
            { label: 'Pricing', href: `${base}/pricing` },
            { label: 'Enterprise', href: `${base}/enterprise` },
            { label: 'Sign in', href: 'https://dash.generaltranslation.com', external: true },
            { label: 'Get a demo', href: `${base}/enterprise` },
          ]}
        />
      </div>
    </header>
  );
}
