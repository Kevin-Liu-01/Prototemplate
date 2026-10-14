'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

import {
  BookOpenIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  CodeBracketIcon,
  CommandLineIcon,
  CpuChipIcon,
  MapPinIcon,
  NewspaperIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/solid';
import {
  SiDiscord,
  SiGithub,
  SiGoogledrive,
  SiMintlify,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiSanity,
  SiStoryblok,
  SiVuedotjs,
} from '@icons-pack/react-simple-icons';
import { ChevronDown, Search } from 'lucide-react';

import { ThemeButton, readTheme, toggleTheme } from '@/components/viewer/ThemeButton';
import type { Theme } from '@/components/viewer/ThemeButton';
import { useMountEffect } from '@/lib/use-mount-effect';

import './prod-nav.css';

/**
 * The shipped header of generaltranslation.com, rebuilt for /d/production.
 *
 * The source is NewHeader.tsx and DashboardButton.tsx in gt-cloud's
 * packages/ui/src/components/frame (origin/main, PRs #4932, #4712, #4557,
 * #4855 and #5007): the GT mark, the Resources and Docs menus, Pricing and
 * Enterprise, then Search with its key chips, the theme switch and Sign In.
 * There is no Product menu and no Get a Demo button. Below 1024px the
 * Search control leaves and a menu toggle opens a full-height sheet, and
 * below 768px the links leave the bar too, as the live header does.
 *
 * Mirror conventions over the live code: internal pages resolve to their
 * /d/production copies, Sign In opens the mirror's sign-in plate, the theme
 * is html[data-theme] through ThemeButton, and Search is an inert control,
 * since the mirror has no docs index to search. Docs links leave for the
 * live documentation, which the mirror does not copy.
 */

const BASE = '/d/production';
const DOCS = 'https://generaltranslation.com/docs';

/** The report card lives at /try in the mirror; the live site serves it at /report-card. */
const REPORT_CARD = `${BASE}/try`;

type NavLink = {
  label: string;
  desc: string;
  href: string;
  icon: ReactNode;
  external?: boolean;
  /** A simple-icons mark where live draws one too: the live phone sheet draws these at 24px and every other glyph at 20px. */
  brand?: boolean;
};

type NavColumn = { title: string; links: readonly NavLink[] };

type NavMenu = { label: string; columns: readonly NavColumn[] };

/** A drawn logo file worn as a mask, so it takes currentColor like the glyphs beside it. */
function MaskMark({ src }: { src: string }) {
  return <span aria-hidden className='pn-mask' style={{ maskImage: `url(${src})`, WebkitMaskImage: `url(${src})` }} />;
}

const RESOURCES: NavMenu = {
  label: 'Resources',
  columns: [
    {
      title: 'Company',
      links: [
        { label: 'Blog', desc: 'Changelog and writing', href: `${BASE}/blog`, icon: <NewspaperIcon /> },
        { label: 'Careers', desc: 'Join our team', href: `${BASE}/careers`, icon: <BriefcaseIcon /> },
        { label: 'Locales', desc: '120 locales supported', href: `${BASE}/supported-locales`, icon: <MapPinIcon /> },
        {
          label: 'Report Card',
          desc: "Grade your site's localization",
          href: REPORT_CARD,
          icon: <ClipboardDocumentCheckIcon />,
        },
      ],
    },
    {
      title: 'Community',
      links: [
        {
          label: 'GitHub',
          desc: 'Open-source libraries',
          href: 'https://github.com/generaltranslation/gt',
          icon: <SiGithub />,
          brand: true,
          external: true,
        },
        {
          label: 'Discord',
          desc: 'Join our developer community',
          href: 'https://generaltranslation.com/discord',
          icon: <SiDiscord />,
          brand: true,
          external: true,
        },
        { label: 'Contact', desc: 'Get in touch with us', href: `${BASE}/contact`, icon: <ChatBubbleLeftRightIcon /> },
      ],
    },
  ],
};

/* The Docs sheet keeps the live page's four columns, the second titled with
   a no-break space so its rows line up under the Libraries head. */
const DOCS_MENU: NavMenu = {
  label: 'Docs',
  columns: [
    {
      title: 'Libraries',
      links: [
        { label: 'Documentation', desc: 'Start here', href: `${DOCS}/overview/get-started`, icon: <BookOpenIcon /> },
        { label: 'Translation CLI', desc: 'gt', href: `${DOCS}/cli/quickstart`, icon: <CommandLineIcon /> },
        {
          label: 'Next.js SDK',
          desc: 'gt-next',
          href: `${DOCS}/react/nextjs-quickstart`,
          icon: <MaskMark src='/logos/nextjs-no-bg.svg' />,
        },
        { label: 'React SDK', desc: 'gt-react', href: `${DOCS}/react/overview`, icon: <SiReact />, brand: true },
        {
          label: 'React Native SDK',
          desc: 'gt-react-native',
          href: `${DOCS}/react/react-native-quickstart`,
          icon: <SiReact />,
          brand: true,
        },
      ],
    },
    {
      title: ' ',
      links: [
        {
          label: 'TanStack Start SDK',
          desc: 'gt-tanstack-start',
          href: `${DOCS}/react/tanstack-start-quickstart`,
          icon: <MaskMark src='/logos/tanstack-logo.svg' />,
        },
        { label: 'Node.js SDK', desc: 'gt-node', href: `${DOCS}/node/quickstart`, icon: <SiNodedotjs />, brand: true },
        { label: 'Python SDK', desc: 'gt-python', href: `${DOCS}/python/quickstart`, icon: <SiPython />, brand: true },
        { label: 'Vue SDK', desc: 'gt-vue', href: `${DOCS}/vue/quickstart`, icon: <SiVuedotjs />, brand: true },
      ],
    },
    {
      title: 'Content',
      links: [
        { label: 'Sanity', desc: 'gt-sanity', href: `${DOCS}/integrations/sanity/quickstart`, icon: <SiSanity /> },
        {
          label: 'Mintlify',
          desc: 'Locadex for Mintlify',
          href: `${DOCS}/integrations/mintlify/quickstart`,
          icon: <SiMintlify />,
        },
        {
          label: 'Storyblok',
          desc: 'CMS content source',
          href: `${DOCS}/integrations/storyblok/quickstart`,
          icon: <SiStoryblok />,
          brand: true,
        },
        {
          label: 'Google Drive',
          desc: 'Docs and Slides',
          href: `${DOCS}/integrations/google-drive/quickstart`,
          icon: <SiGoogledrive />,
          brand: true,
        },
      ],
    },
    {
      title: 'Platform',
      links: [
        {
          label: 'Dashboard',
          desc: 'Review translations',
          href: `${DOCS}/platform/dashboard/get-started`,
          icon: <Squares2X2Icon />,
        },
        {
          label: 'Locadex',
          desc: 'AI Agent',
          href: `${DOCS}/platform/locadex/quickstart`,
          icon: <MaskMark src='/brand/no-bg-locadex-logo-light.png' />,
        },
        { label: 'Core', desc: 'generaltranslation', href: `${DOCS}/platform/core/quickstart`, icon: <CpuChipIcon /> },
        { label: 'OpenAPI', desc: 'HTTP API', href: `${DOCS}/platform/openapi/overview`, icon: <CodeBracketIcon /> },
      ],
    },
  ],
};

const MENUS: readonly NavMenu[] = [RESOURCES, DOCS_MENU];

const PLAIN_LINKS: readonly { label: string; href: string }[] = [
  { label: 'Pricing', href: `${BASE}/pricing` },
  { label: 'Enterprise', href: `${BASE}/enterprise` },
];

const SIGN_IN = `${BASE}/signin`;

/** The Docs menu opens the live documentation, so every one of its rows opens a new tab. */
function isExternal(link: NavLink): boolean {
  return link.external === true || link.href.startsWith('http');
}

function LinkRow({ link, className, onNavigate }: { link: NavLink; className: string; onNavigate?: () => void }) {
  const external = isExternal(link);
  return (
    <a
      className={className}
      href={link.href}
      rel={external ? 'noopener noreferrer' : undefined}
      target={external ? '_blank' : undefined}
      onClick={onNavigate}
    >
      <span className='pn-glyph' data-brand={link.brand ? '' : undefined}>
        {link.icon}
      </span>
      <span className='pn-row-text'>
        <span className='pn-row-label'>{link.label}</span>
        <span className='pn-row-desc'>{link.desc}</span>
      </span>
    </a>
  );
}

type DropProps = {
  menu: NavMenu;
  open: boolean;
  onOpenChange: (next: boolean) => void;
};

/**
 * One menu: a disclosure button and its sheet. Open state lives in ProdNav,
 * one slot for both menus, so hover and keyboard never stack two sheets.
 * Hover opens, a click toggles, Escape closes and returns focus to the
 * trigger, and leaving the trigger and the sheet closes it.
 */
function Drop({ menu, open, onOpenChange }: DropProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <li
      className='pn-drop'
      data-open={open ? 'true' : undefined}
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => onOpenChange(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onOpenChange(false);
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !open) return;
        event.preventDefault();
        onOpenChange(false);
        triggerRef.current?.focus();
      }}
    >
      <button
        aria-expanded={open}
        className='pn-trigger'
        ref={triggerRef}
        type='button'
        onClick={() => onOpenChange(!open)}
      >
        {menu.label}
        <ChevronDown aria-hidden className='pn-chev' strokeWidth={2} />
      </button>
      <div className='pn-panel'>
        <div className='pn-grid'>
          {menu.columns.map((column, index) => (
            <div className='pn-col' key={`${column.title}-${index}`}>
              <div className='pn-col-title'>{column.title}</div>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <LinkRow className='pn-row' link={link} onNavigate={() => onOpenChange(false)} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </li>
  );
}

/** The two-line menu glyph that turns into a cross, the live header's MobileMenuToggleIcon. */
function ToggleGlyph({ open }: { open: boolean }) {
  return (
    <span aria-hidden className='pn-toggle-glyph' data-open={open ? 'true' : undefined}>
      <i />
      <i />
    </span>
  );
}

/** The sheet's labeled theme switch: the half disc and the current mode's name. */
function SheetThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');
  useMountEffect(() => {
    setTheme(readTheme());
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  });
  const name = theme === 'dark' ? 'Dark' : 'Light';
  return (
    <button
      aria-label={`${name}, switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className='pn-sheet-theme'
      type='button'
      onClick={() => {
        toggleTheme();
      }}
    >
      <span aria-hidden className='pn-sheet-theme-glyph'>
        {theme === 'dark' ? '◑' : '◐'}
      </span>
      {name}
    </button>
  );
}

function SheetMenu({ menu, onNavigate }: { menu: NavMenu; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className='pn-sheet-menu' data-open={open ? 'true' : undefined}>
      <button aria-expanded={open} className='pn-sheet-head' type='button' onClick={() => setOpen((v) => !v)}>
        <span>{menu.label}</span>
        <ChevronDown aria-hidden className='pn-sheet-chev' strokeWidth={2} />
      </button>
      <div className='pn-sheet-body'>
        {/* the clip and the list are two boxes, as live: the list's 12px
            bottom padding then folds away with the 0fr row */}
        <div className='pn-sheet-clip'>
          <div className='pn-sheet-inner'>
            {menu.columns.flatMap((column) => column.links).map((link) => (
              <LinkRow className='pn-sheet-row' key={link.label} link={link} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The phone and tablet sheet, mounted only while open: a full-height panel
 * under the bar with the two menus as disclosures, the two plain links, then
 * Sign In and the labeled theme switch. It locks the page's scroll and
 * closes on Escape, as the live MobileMenuPanel does. It seats on the bar's
 * rule wherever the bar sits: the viewer's corner bar pushes the page down
 * on a phone, so a fixed 56px would cover the header.
 */
function Sheet({ onClose, top }: { onClose: () => void; top: number }) {
  useMountEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKeyDown);
    };
  });
  return (
    <div
      aria-label='Navigation menu'
      aria-modal='true'
      className='pn-sheet'
      id='pn-sheet'
      role='dialog'
      style={{ top }}
    >
      <div className='pn-sheet-in'>
        <div className='pn-sheet-list'>
          {MENUS.map((menu) => (
            <SheetMenu key={menu.label} menu={menu} onNavigate={onClose} />
          ))}
          {PLAIN_LINKS.map((link) => (
            <a className='pn-sheet-link' href={link.href} key={link.label} onClick={onClose}>
              {link.label}
            </a>
          ))}
        </div>
        <div className='pn-sheet-foot'>
          <a className='pn-signin is-block' href={SIGN_IN} onClick={onClose}>
            Sign In
          </a>
          <div className='pn-sheet-tools'>
            <SheetThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProdNav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [sheetTop, setSheetTop] = useState<number | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  /* A hover-opened sheet never holds focus, so Escape is caught here too. */
  useMountEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  const slot = (label: string) => ({
    open: openMenu === label,
    onOpenChange: (next: boolean) => setOpenMenu((current) => (next ? label : current === label ? null : current)),
  });

  return (
    <>
      <header className='pn' data-prod-nav ref={headerRef}>
        <div className='pn-in'>
          <a className='pn-brand' href={BASE}>
            <Image alt='' className='pn-logo-light' height={40} src='/brand/no-bg-gt-logo-light.png' width={40} />
            <Image alt='' className='pn-logo-dark' height={40} src='/brand/no-bg-gt-logo-dark.png' width={40} />
            <span className='pn-sr'>General Translation, Inc.</span>
          </a>

          <nav aria-label='Main' className='pn-links'>
            <ul>
              {MENUS.map((menu) => (
                <Drop key={menu.label} menu={menu} {...slot(menu.label)} />
              ))}
              {PLAIN_LINKS.map((link) => (
                <li key={link.label}>
                  <a className='pn-trigger' href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className='pn-right'>
            {/* inert: the mirror has no docs index behind the live search dialog */}
            <button aria-label='Search' className='pn-search' type='button'>
              <Search aria-hidden className='pn-search-icon' strokeWidth={2} />
              Search
              <span className='pn-keys'>
                <kbd>⌘</kbd>
                <kbd>K</kbd>
              </span>
            </button>
            <ThemeButton className='pn-theme' />
            <a className='pn-signin' href={SIGN_IN}>
              Sign In
            </a>
            <button
              aria-controls='pn-sheet'
              aria-expanded={sheetTop !== null}
              aria-label={sheetTop !== null ? 'Close Menu' : 'Open Menu'}
              className='pn-toggle'
              type='button'
              onClick={() => {
                const bottom = headerRef.current?.getBoundingClientRect().bottom ?? 57;
                setSheetTop((current) => (current === null ? Math.max(0, bottom - 1) : null));
              }}
            >
              <ToggleGlyph open={sheetTop !== null} />
            </button>
          </div>
        </div>
      </header>
      {sheetTop !== null ? <Sheet top={sheetTop} onClose={() => setSheetTop(null)} /> : null}
    </>
  );
}
