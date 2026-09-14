import { SiDiscord, SiGithub, SiNextdotjs, SiReact } from '@icons-pack/react-simple-icons';
import Image from 'next/image';

import { COMPLIANCE, COPYRIGHT, FOOTER_COLUMNS, FOOTER_LINE } from '../data';
import type { FooterLink } from '../data';

/**
 * The foundation: the footer as the gate's plinth. Both drawn GT marks
 * ship and the sheet shows the one the theme calls for; one sentence; four
 * link columns separated by rhythm; the closing bar with the copyright and
 * the compliance line draws the only hairline.
 */
function Mark({ kind }: { kind: NonNullable<FooterLink['mark']> }) {
  if (kind === 'locadex') {
    return (
      <Image
        className='gb-foot-lx'
        src='/brand/no-bg-locadex-logo-light.png'
        alt=''
        width={14}
        height={14}
        unoptimized
      />
    );
  }
  if (kind === 'next') return <SiNextdotjs size={13} aria-hidden='true' />;
  if (kind === 'react') return <SiReact size={13} aria-hidden='true' />;
  if (kind === 'github') return <SiGithub size={13} aria-hidden='true' />;
  return <SiDiscord size={13} aria-hidden='true' />;
}

export default function Foundation() {
  return (
    <footer className='gb-foundation'>
      <div className='gb-foundation-in'>
        <div className='gb-foot-brand'>
          <Image
            className='gb-foot-logo is-light'
            src='/brand/no-bg-gt-logo-light.png'
            alt='General Translation'
            width={30}
            height={30}
            unoptimized
          />
          <Image
            className='gb-foot-logo is-dark'
            src='/brand/no-bg-gt-logo-dark.png'
            alt=''
            width={30}
            height={30}
            unoptimized
          />
          <p>{FOOTER_LINE}</p>
        </div>

        <div className='gb-foot-cols'>
          {FOOTER_COLUMNS.map((column) => (
            <div className='gb-foot-col' key={column.title}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>
                      {link.mark ? <Mark kind={link.mark} /> : null}
                      <span>{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className='gb-foot-bar'>
        <div className='gb-foundation-in'>
          <span>{COPYRIGHT}</span>
          <span>{COMPLIANCE}</span>
        </div>
      </div>
    </footer>
  );
}
