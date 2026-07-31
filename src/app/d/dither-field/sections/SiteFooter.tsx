import Image from 'next/image';
import type { ComponentType } from 'react';

import { SiDiscord, SiGithub, SiNextdotjs, SiReact } from '@icons-pack/react-simple-icons';

type MarkProps = { className?: string; color?: string; 'aria-hidden'?: boolean };

type FooterLink = {
  label: string;
  href?: string;
  /** Brand mark, only where the cell names a tool. Functional, never ornament. */
  mark?: ComponentType<MarkProps>;
};

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

const COLUMNS: readonly { title: string; links: readonly FooterLink[] }[] = [
  {
    title: 'Guides',
    links: [
      { label: 'Locadex Agent', href: '/d/toolchain/locadex', mark: LocadexMark },
      { label: 'Next.js', mark: SiNextdotjs },
      { label: 'React', mark: SiReact },
      { label: 'React Native', mark: SiReact },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation' },
      { label: 'Blog' },
      { label: 'Pricing' },
      { label: 'Supported Locales' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Careers' },
      { label: 'Contact' },
      { label: 'GitHub', mark: SiGithub },
      { label: 'Discord', mark: SiDiscord },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service' },
      { label: 'Privacy' },
      { label: 'Acceptable Use' },
      { label: 'Manage Cookies' },
    ],
  },
];

/** Quiet close: the same rules, one more time, then nothing. */
export default function SiteFooter() {
  return (
    <footer className='tc-sec'>
      <div className='tc-foot'>
        <div className='tc-foot-brand'>
          {/* Both drawn marks ship; CSS shows the one the theme calls for. */}
          <Image
            className='tc-foot-logo is-light'
            src='/brand/no-bg-gt-logo-light.png'
            alt='General Translation'
            width={30}
            height={30}
          />
          <Image
            className='tc-foot-logo is-dark'
            src='/brand/no-bg-gt-logo-dark.png'
            alt=''
            width={30}
            height={30}
          />
          <p>End-to-end localization for the world&rsquo;s best companies.</p>
        </div>

        <div className='tc-foot-cols'>
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h4>{column.title}</h4>
              <ul>
                {column.links.map((link) => {
                  const Mark = link.mark;
                  return (
                    <li key={link.label}>
                      <a href={link.href ?? '#top'}>
                        {Mark ? (
                          <Mark className='tc-foot-mark' color='currentColor' aria-hidden />
                        ) : null}
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className='tc-foot-bar'>
        <span>© 2026 General Translation, Inc. All rights reserved.</span>
        <span>SOC 2 Type II · GDPR · ISO 27001</span>
      </div>
    </footer>
  );
}
