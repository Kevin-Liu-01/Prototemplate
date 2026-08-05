import Image from 'next/image';
import type { ComponentType } from 'react';

import { SiDiscord, SiGithub, SiNextdotjs, SiReact, SiX } from '@icons-pack/react-simple-icons';

import ThemeToggle from '@/components/shared/ThemeToggle';

import './v0-footer.css';

type MarkProps = { className?: string; color?: string; 'aria-hidden'?: boolean };

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
  /** Brand mark, only where the cell names a tool or venue. Functional, never ornament. */
  mark?: ComponentType<MarkProps>;
};

const DOCS = 'https://generaltranslation.com/docs';

/** The real lambda mark, drawn dark for light ground; dark mode inverts it
    in CSS the way the story chip does. */
function LocadexMark({ className }: MarkProps) {
  return (
    <Image
      alt=''
      aria-hidden
      className={`${className ?? ''} is-locadex`}
      height={14}
      src='/brand/no-bg-locadex-logo-light.png'
      width={14}
    />
  );
}

/** LinkedIn shipped out of both icon packs (trademark policy), so the glyph
    is inlined once here — same 24-box, same currentColor contract as the
    Si* marks beside it. */
function LinkedInMark({ className, color, ...rest }: MarkProps) {
  return (
    <svg
      className={className}
      fill={color ?? 'currentColor'}
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      {...rest}
    >
      <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z' />
    </svg>
  );
}

/* The production footer's full roster, regrouped under the ledger's heads. */
const COLUMNS: readonly { title: string; links: readonly FooterLink[] }[] = [
  {
    title: 'Guides',
    links: [
      { label: 'Locadex Agent', href: DOCS, external: true, mark: LocadexMark },
      { label: 'Next.js', href: DOCS, external: true, mark: SiNextdotjs },
      { label: 'React', href: DOCS, external: true, mark: SiReact },
      { label: 'React Native', href: DOCS, external: true, mark: SiReact },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: DOCS, external: true },
      { label: 'Blog', href: 'https://generaltranslation.com/blog', external: true },
      { label: 'Pricing', href: 'https://generaltranslation.com/pricing', external: true },
      { label: 'Supported Locales', href: `${DOCS}/platform/locales`, external: true },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'GitHub', href: 'https://github.com/generaltranslation', external: true, mark: SiGithub },
      { label: 'X', href: 'https://x.com/generaltranslation', external: true, mark: SiX },
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/company/general-translation',
        external: true,
        mark: LinkedInMark,
      },
      { label: 'Discord', href: 'https://discord.gg/generaltranslation', external: true, mark: SiDiscord },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Careers', href: 'https://generaltranslation.com/careers', external: true },
      { label: 'Contact', href: 'https://generaltranslation.com/contact', external: true },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: 'https://generaltranslation.com/terms', external: true },
      { label: 'Privacy', href: 'https://generaltranslation.com/privacy', external: true },
      { label: 'Acceptable Use Policy', href: 'https://generaltranslation.com/aup', external: true },
      { label: 'Manage Cookies', href: '#' },
    ],
  },
];

/* ---------- the compliance seals ----------
   The actual badge shapes — the AICPA SOC 2 rosette, the GDPR shield and
   lock, the ISO 27001 rosette — drawn in the sheet's own monochrome ink
   (currentColor throughout), side by side, all three doors into the same
   trust center. */

/** A scalloped seal edge: n outward arcs whose endpoints sit on radius r.
    k ≥ 1 scales each arc's radius from the half-chord — 1 is a semicircle
    scallop, larger flattens toward the circle. */
function sealPath(cx: number, cy: number, r: number, n: number, k: number): string {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });
  const arcR = r * Math.sin(Math.PI / n) * k;
  const first = pts[0] ?? ([cx, cy - r] as const);
  const segs = pts.map((p, i) => {
    const q = pts[(i + 1) % n] ?? first;
    return `A${arcR.toFixed(2)} ${arcR.toFixed(2)} 0 0 1 ${q[0].toFixed(2)} ${q[1].toFixed(2)}`;
  });
  return `M${first[0].toFixed(2)} ${first[1].toFixed(2)}${segs.join('')}Z`;
}

const SOC_EDGE = sealPath(24, 24, 22.2, 22, 1.08);
const ISO_EDGE = sealPath(24, 24, 22.2, 16, 1.04);

function SocSeal() {
  return (
    <svg aria-hidden className='v0-fb' viewBox='0 0 48 48'>
      <path className='v0-fb-line' d={SOC_EDGE} />
      <circle className='v0-fb-line is-thin' cx='24' cy='24' r='17.4' />
      <text className='v0-fb-t is-tiny' x='24' y='17'>
        AICPA
      </text>
      <text className='v0-fb-t is-big' x='24' y='27.2'>
        SOC 2
      </text>
      <text className='v0-fb-t is-tiny' x='24' y='34'>
        TYPE II
      </text>
    </svg>
  );
}

function GdprShield() {
  return (
    <svg aria-hidden className='v0-fb' viewBox='0 0 48 48'>
      <path
        className='v0-fb-line'
        d='M24 4.5 L39.5 10.2 V21.4 C39.5 33 32.9 40.4 24 44 C15.1 40.4 8.5 33 8.5 21.4 V10.2 Z'
      />
      <path className='v0-fb-line' d='M20.8 16.4 V13.9 A3.2 3.2 0 0 1 27.2 13.9 V16.4' />
      <rect className='v0-fb-line' height='8.8' rx='1' width='12.4' x='17.8' y='16.4' />
      <circle className='v0-fb-dot' cx='24' cy='20.8' r='1' />
      <text className='v0-fb-t is-big' x='24' y='35.4'>
        GDPR
      </text>
    </svg>
  );
}

function IsoSeal() {
  return (
    <svg aria-hidden className='v0-fb' viewBox='0 0 48 48'>
      <path className='v0-fb-line' d={ISO_EDGE} />
      <circle className='v0-fb-line is-thin' cx='24' cy='24' r='17.4' />
      <text className='v0-fb-t is-big' x='24' y='23'>
        ISO
      </text>
      <text className='v0-fb-t is-mono' x='24' y='30.6'>
        27001
      </text>
      <text className='v0-fb-t is-stars' x='24.6' y='37'>
        ★ ★ ★
      </text>
    </svg>
  );
}

const BADGES: readonly { label: string; Art: ComponentType }[] = [
  { label: 'AICPA SOC 2 Type II', Art: SocSeal },
  { label: 'GDPR', Art: GdprShield },
  { label: 'ISO 27001', Art: IsoSeal },
];

/**
 * The v0 close: the production footer's full contents on one open sheet.
 * The metal-masked mark and the drawn compliance seals in the left cell,
 * five link columns beside it — no interior seams (founder note): the
 * columns separate by rhythm alone, and only the closing strip keeps its
 * hairline — then live status, the copyright line, and the theme switch.
 */
export default function V0Footer() {
  return (
    <footer className='tc-sec v0-foot'>
      <div className='v0-foot-grid'>
        <div className='v0-foot-cell v0-foot-brand'>
          {/* The mark in metal: the drawn glyph is a CSS mask over a chromed
              banding gradient — one asset serves both themes, since only its
              alpha survives the masking. */}
          <span aria-label='General Translation' className='v0-foot-gt' role='img' />
          <p>End-to-end localization for the world&rsquo;s best companies.</p>

          <div className='v0-foot-badges'>
            {BADGES.map(({ label, Art }) => (
              <a
                aria-label={`${label} compliance — General Translation trust center`}
                className='v0-foot-badge'
                href='https://trust.generaltranslation.com/'
                key={label}
                rel='noreferrer'
                target='_blank'
              >
                <Art />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((column) => (
          <nav aria-label={column.title} className='v0-foot-cell v0-foot-col' key={column.title}>
            <h4>{column.title}</h4>
            <ul>
              {column.links.map((link) => {
                const Mark = link.mark;
                return (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      rel={link.external ? 'noreferrer' : undefined}
                      target={link.external ? '_blank' : undefined}
                    >
                      {Mark ? <Mark aria-hidden className='v0-foot-mark' color='currentColor' /> : null}
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        ))}
      </div>

      <div className='v0-foot-bar'>
        <a
          className='v0-foot-status'
          href='https://status.generaltranslation.com/'
          rel='noreferrer'
          target='_blank'
        >
          <span aria-hidden className='v0-foot-dot' />
          All Systems Operational
        </a>
        <span className='v0-foot-copy'>© 2026 General Translation, Inc. All rights reserved.</span>
        <ThemeToggle className='v0-foot-theme' />
      </div>
    </footer>
  );
}
