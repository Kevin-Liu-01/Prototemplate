'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { ComponentType, ReactNode } from 'react';

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
  ChevronDown,
  Languages,
  LayoutDashboard,
  Mail,
  Newspaper,
  SquareTerminal,
} from 'lucide-react';

import ThemeToggle from '@/components/shared/ThemeToggle';

import './topnav-menu.css';

type IconProps = { className?: string; color?: string; size?: number; strokeWidth?: number; 'aria-hidden'?: boolean };

type MenuItem = {
  label: string;
  desc: string;
  href: string;
  icon?: ComponentType<IconProps>;
  /** Image-file marks (brand glyphs that aren't currentColor components). */
  img?: string;
  /** Dark mode inverts drawn-dark glyph files, same trick as the footer. */
  invertsInDark?: boolean;
  external?: boolean;
};

type MenuColumn = { title: string; items: readonly MenuItem[] };

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
        { label: 'Mintlify', desc: 'Locadex for Mintlify', href: `${DOCS}/mintlify`, icon: BookOpen, external: true },
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

function MenuMark({ item }: { item: MenuItem }) {
  if (item.img) {
    return (
      <Image
        alt=''
        aria-hidden
        className={item.invertsInDark ? 'tc-menu-glyph is-inverting' : 'tc-menu-glyph'}
        height={15}
        loading='eager'
        src={item.img}
        unoptimized
        width={15}
      />
    );
  }
  const Icon = item.icon;
  return Icon ? <Icon aria-hidden className='tc-menu-glyph' color='currentColor' size={15} strokeWidth={1.75} /> : null;
}

function Menu({ label, columns, wide }: { label: string; columns: readonly MenuColumn[]; wide?: boolean }) {
  return (
    <div className='tc-nav-drop'>
      <button className='tc-nav-drop-trigger' type='button' aria-haspopup='true'>
        {label}
        <ChevronDown aria-hidden size={13} strokeWidth={2} />
      </button>
      <div className={wide ? 'tc-nav-panel is-wide' : 'tc-nav-panel'} role='menu'>
        {columns.map((column) => (
          <div className='tc-nav-col' key={column.title}>
            <h5>{column.title}</h5>
            {column.items.map((item) => (
              <a
                href={item.href}
                key={item.label}
                rel={item.external ? 'noreferrer' : undefined}
                role='menuitem'
                target={item.external ? '_blank' : undefined}
              >
                <span className='tc-menu-plate'>
                  <MenuMark item={item} />
                </span>
                <span className='tc-menu-text'>
                  <b>{item.label}</b>
                  <small>{item.desc}</small>
                </span>
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
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
          <Menu columns={resources(base)} label='Resources' />
          <Menu columns={docsMenu(base)} label='Docs' wide />
          <a href={`${base}/locadex`}>Locadex</a>
          <a href={`${base}/pricing`}>Pricing</a>
          <a href={`${base}/enterprise`}>Enterprise</a>
        </nav>

        <div className='tc-nav-right'>
          <ThemeToggle className='tc-nav-theme' />
          <a href='https://dash.generaltranslation.com' rel='noreferrer' target='_blank'>
            Sign in
          </a>
          <a className='tc-btn tc-btn-solid tc-btn-sm' href={`${base}/enterprise`}>
            Get a demo
          </a>
        </div>
      </div>
    </header>
  );
}
