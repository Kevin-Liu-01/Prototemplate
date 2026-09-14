import Image from 'next/image';
import type { ComponentType } from 'react';

import { SiDiscord, SiGithub, SiNextdotjs, SiReact } from '@icons-pack/react-simple-icons';

import { HREF } from './data';

/**
 * The last court, narrowest on the axis: the mark and one sentence, four
 * link columns separated by rhythm, and the closing bar, the only rule the
 * footer draws. Both drawn GT marks ship; the stylesheet shows the one the
 * theme calls for.
 */
type MarkProps = { className?: string; color?: string; 'aria-hidden'?: boolean };

type FooterLink = { label: string; href: string; mark?: ComponentType<MarkProps> };

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
      { label: 'Locadex Agent', href: HREF.docs, mark: LocadexMark },
      { label: 'Next.js', href: HREF.docs, mark: SiNextdotjs },
      { label: 'React', href: HREF.docs, mark: SiReact },
      { label: 'React Native', href: HREF.docs, mark: SiReact },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: HREF.docs },
      { label: 'Blog', href: HREF.blog },
      { label: 'Pricing', href: HREF.pricing },
      { label: 'Supported Locales', href: HREF.locales },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Careers', href: HREF.careers },
      { label: 'Contact', href: HREF.contact },
      { label: 'GitHub', href: HREF.github, mark: SiGithub },
      { label: 'Discord', href: HREF.discord, mark: SiDiscord },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: HREF.terms },
      { label: 'Privacy', href: HREF.privacy },
      { label: 'Acceptable Use', href: HREF.acceptableUse },
      { label: 'Manage Cookies', href: '#top' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className='pg-court pg-foot'>
      <div className='pg-passage'>
        <div className='pg-foot-grid'>
          <div className='pg-foot-brand'>
            <Image
              alt='General Translation'
              className='pg-foot-logo is-light'
              height={30}
              src='/brand/no-bg-gt-logo-light.png'
              width={30}
            />
            <Image
              alt=''
              className='pg-foot-logo is-dark'
              height={30}
              src='/brand/no-bg-gt-logo-dark.png'
              width={30}
            />
            <p>End-to-end localization for the world&rsquo;s best companies.</p>
          </div>

          {COLUMNS.map((column) => (
            <div className='pg-foot-col' key={column.title}>
              <h4>{column.title}</h4>
              <ul>
                {column.links.map((link) => {
                  const Mark = link.mark;
                  return (
                    <li key={link.label}>
                      <a href={link.href}>
                        {Mark ? <Mark className='pg-foot-mark' color='currentColor' aria-hidden /> : null}
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className='pg-foot-bar'>
          <span>© 2026 General Translation, Inc. All rights reserved.</span>
          <span>SOC 2 Type II · GDPR · ISO 27001</span>
        </div>
      </div>
    </footer>
  );
}
