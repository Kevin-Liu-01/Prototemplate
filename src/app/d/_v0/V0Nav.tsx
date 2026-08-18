'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
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
  Search,
  SquareTerminal,
  Users,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

import TcMobileNav from '@/components/shared/TcMobileNav';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { useMountEffect } from '@/lib/use-mount-effect';

import './v0-nav.css';

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

/** Every column carries a small-caps eyebrow so the three sheets share one
    panel grammar (PRODUCT / COMPANY+COMMUNITY / LIBRARIES+CONTENT+PLATFORM). */
type MenuColumn = { title: string; items: readonly MenuItem[] };

const DOCS = 'https://generaltranslation.com/docs';

/* The old flat list (Customers / Blog / Careers) folded into the shared
   two-column Resources sheet: Customers keeps its home anchor (every final
   mounts the trusted-by section) and joins the Company column. */
function resources(base: string): readonly MenuColumn[] {
  return [
    {
      title: 'Company',
      items: [
        { label: 'Customers', desc: 'Trusted by global teams', href: '#customers', icon: Users },
        { label: 'Blog', desc: 'News and updates', href: `${base}/blog`, icon: Newspaper },
        { label: 'Careers', desc: 'Join our growing team', href: `${base}/careers`, icon: Briefcase },
        { label: 'Supported Locales', desc: '100+ languages supported', href: `${base}/supported-locales`, icon: Languages },
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

function MenuMark({ item }: { item: MenuItem }) {
  if (item.img) {
    return (
      <Image
        alt=''
        aria-hidden
        className={item.invertsInDark ? 'v0-menu-glyph is-inverting' : 'v0-menu-glyph'}
        height={15}
        loading='eager'
        src={item.img}
        unoptimized
        width={15}
      />
    );
  }
  const Icon = item.icon;
  return Icon ? <Icon aria-hidden className='v0-menu-glyph' color='currentColor' size={15} strokeWidth={1.75} /> : null;
}

type MenuProps = {
  label: string;
  columns: readonly MenuColumn[];
  wide?: boolean;
  /** Open state lives in V0Nav — ONE slot for all three menus, so a
      keyboard-opened Product can never stack under a hovered Resources. */
  open: boolean;
  onOpenChange: (next: boolean) => void;
};

function Menu({ label, columns, wide, open, onOpenChange }: MenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  /* Escape refocuses the trigger, which re-fires onFocus; the flag keeps
     that programmatic refocus from reopening the sheet it just closed. */
  const refocusing = useRef(false);
  /* A tap/click focuses the button first — the timestamp lets onClick tell
     "focus already opened this" (ignore) from a real keyboard Enter toggle. */
  const focusOpenedAt = useRef(0);

  return (
    <div
      className='v0-nav-drop'
      data-open={open ? 'true' : undefined}
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => onOpenChange(false)}
      onFocus={() => {
        if (refocusing.current) {
          refocusing.current = false;
          return;
        }
        focusOpenedAt.current = Date.now();
        onOpenChange(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onOpenChange(false);
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !open) return;
        event.preventDefault();
        if (document.activeElement !== triggerRef.current) {
          refocusing.current = true;
          triggerRef.current?.focus();
        }
        onOpenChange(false);
      }}
    >
      <button
        aria-expanded={open}
        aria-haspopup='true'
        className='v0-nav-drop-trigger'
        // type sits before onClick: the practices scanner reads a tag only
        // up to the first close-angle, and the handler's arrow hides
        // anything declared after it
        type='button'
        onClick={() => {
          if (Date.now() - focusOpenedAt.current < 350) return;
          onOpenChange(!open);
        }}
        ref={triggerRef}
      >
        {label}
        <ChevronDown aria-hidden size={13} strokeWidth={2} />
      </button>
      <div
        className={wide ? 'v0-nav-panel is-wide' : 'v0-nav-panel'}
        onClick={(event) => {
          /* Following a link dismisses the sheet — hash anchors stay on the
             page, so without this the panel would sit over the scrolled-to
             section. */
          if ((event.target as HTMLElement).closest('a')) onOpenChange(false);
        }}
        role='menu'
      >
        {columns.map((column) => (
          <div className='v0-nav-col' key={column.title}>
            <h5>{column.title}</h5>
            {column.items.map((item) => (
              <a
                href={item.href}
                key={item.label}
                rel={item.external ? 'noreferrer' : undefined}
                role='menuitem'
                target={item.external ? '_blank' : undefined}
              >
                <span className='v0-menu-plate'>
                  <MenuMark item={item} />
                </span>
                <span className='v0-menu-text'>
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

/**
 * The v0 top bar: the toolchain TopNav shell (same height, hairline
 * underline, brand left, actions right) with the mock's sections, carrying
 * the same Resources/Docs mega-menus the singularity subpage nav ships.
 * Shared by all five singularity homes, so every internal link resolves
 * against the CURRENT final's base — a static href would land every slug on
 * one final's routes.
 *
 * Open state is React-managed (data-open), not :hover/:focus-within: one
 * shared slot means hover + keyboard can never stack two sheets, Escape
 * dismisses, and aria-expanded always matches what's on screen.
 */
export default function V0Nav(): ReactNode {
  // /d/singularity-dossier/... -> /d/singularity-dossier
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '';

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  /* The per-menu Escape handler only hears keys while focus is inside its
     drop; this catches Escape against a hover-opened sheet too. */
  useMountEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  const menu = (label: string) => ({
    label,
    open: openMenu === label,
    onOpenChange: (next: boolean) =>
      setOpenMenu((current) => (next ? label : current === label ? null : current)),
  });

  return (
    <header className='v0-nav' data-v0-nav>
      <div className='v0-nav-in'>
        <a className='v0-nav-brand' href={base || '/'}>
          <Image className='v0-nav-logo-light' src='/brand/no-bg-gt-logo-light.png' alt='' width={40} height={40} />
          <Image className='v0-nav-logo-dark' src='/brand/no-bg-gt-logo-dark.png' alt='' width={40} height={40} />
          <span className='v0-nav-sr'>General Translation</span>
        </a>

        <nav className='v0-nav-links'>
          <Menu columns={resources(base)} {...menu('Resources')} />
          <Menu columns={docsMenu(base)} {...menu('Docs')} wide />
          <a href={`${base}/pricing`}>Pricing</a>
          <a href={`${base}/enterprise`}>Enterprise</a>
        </nav>

        <div className='v0-nav-right'>
          <button aria-label='Search documentation' className='v0-nav-search' type='button'>
            <Search aria-hidden size={15} strokeWidth={1.8} />
            <span>Search</span>
            <kbd>⌘</kbd>
            <kbd>K</kbd>
          </button>
          <ThemeToggle className='v0-nav-theme' />
          <a className='v0-btn v0-btn-outline v0-btn-sm' href={`${base}/signin`}>
            Sign In
          </a>
          <a className='v0-btn v0-btn-solid v0-btn-sm' href={`${base}/enterprise/contact`}>
            Get a Demo
          </a>
        </div>

        <a className='v0-mobile-demo v0-btn v0-btn-solid' href={`${base}/enterprise/contact`}>
          Get a Demo
        </a>

        {/* the phone menu: burger + ruled sheet, last in the -in column so
            the sheet seats absolutely under the bar */}
        <TcMobileNav
          items={[
            { label: 'Enterprise', href: `${base}/enterprise` },
            { label: 'Pricing', href: `${base}/pricing` },
            { label: 'Sign In', href: `${base}/signin` },
            { label: 'Get a Demo', href: `${base}/enterprise/contact` },
          ]}
        />
      </div>
    </header>
  );
}
