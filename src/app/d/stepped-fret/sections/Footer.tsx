import Image from 'next/image';
import type { ComponentType } from 'react';

import { SiDiscord, SiGithub, SiNextdotjs, SiReact } from '@icons-pack/react-simple-icons';

import { COMPLIANCE, COPYRIGHT, FOOTER_COLUMNS, FOOTER_LINE } from '../data';
import type { FooterLink } from '../data';
import Register from './deco/Register';

type MarkProps = { className?: string; color?: string; 'aria-hidden'?: boolean };

const MARKS: Record<NonNullable<FooterLink['mark']>, ComponentType<MarkProps> | 'locadex'> = {
  locadex: 'locadex',
  next: SiNextdotjs,
  react: SiReact,
  github: SiGithub,
  discord: SiDiscord,
};

/**
 * The last register, flush with the rail: both drawn GT marks (CSS shows the
 * one the theme calls for), one sentence, four link columns separated by
 * rhythm, and the closing bar, which draws the footer's only hairline.
 * Brand marks appear only where a cell names a tool.
 */
export default function Footer() {
  return (
    <Register k={0} className='sf-footer'>
      <footer>
        <div className='sf-foot'>
          <div className='sf-foot-brand'>
            <Image
              className='sf-foot-logo is-light'
              src='/brand/no-bg-gt-logo-light.png'
              alt='General Translation'
              width={30}
              height={30}
            />
            <Image className='sf-foot-logo is-dark' src='/brand/no-bg-gt-logo-dark.png' alt='' width={30} height={30} />
            <p>{FOOTER_LINE}</p>
          </div>

          <div className='sf-foot-cols'>
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <h4 className='sf-h4'>{column.title}</h4>
                <ul>
                  {column.links.map((link) => {
                    const Mark = link.mark ? MARKS[link.mark] : undefined;
                    return (
                      <li key={link.label}>
                        <a href={link.href} rel='noreferrer' target='_blank'>
                          {Mark === 'locadex' ? (
                            <Image
                              className='sf-foot-mark is-locadex'
                              src='/brand/no-bg-locadex-logo-light.png'
                              alt=''
                              aria-hidden
                              width={14}
                              height={14}
                            />
                          ) : Mark ? (
                            <Mark className='sf-foot-mark' color='currentColor' aria-hidden />
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

        <div className='sf-foot-bar'>
          <span>{COPYRIGHT}</span>
          <span>{COMPLIANCE}</span>
        </div>
      </footer>
    </Register>
  );
}
