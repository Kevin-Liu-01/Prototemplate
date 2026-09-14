import { SiDiscord, SiGithub, SiNextdotjs, SiReact } from '@icons-pack/react-simple-icons';
import Image from 'next/image';

import { COMPLIANCE, COPYRIGHT, FOOTER_COLUMNS, FOOTER_SENTENCE } from './content';
import type { FooterLink } from './content';

/**
 * The last course: the mark and one sentence, four link columns separated
 * by rhythm, and the closing bar, the only rule the footer draws.
 */
function Mark({ mark }: { mark: FooterLink['mark'] }) {
  switch (mark) {
    case 'locadex':
      return (
        <Image
          className='rr-lx rr-foot-mark'
          src='/brand/no-bg-locadex-logo-light.png'
          alt=''
          width={14}
          height={14}
        />
      );
    case 'next':
      return <SiNextdotjs size={13} className='rr-foot-mark' aria-hidden='true' />;
    case 'react':
      return <SiReact size={13} className='rr-foot-mark' aria-hidden='true' />;
    case 'github':
      return <SiGithub size={13} className='rr-foot-mark' aria-hidden='true' />;
    case 'discord':
      return <SiDiscord size={13} className='rr-foot-mark' aria-hidden='true' />;
    default:
      return null;
  }
}

export default function Footer() {
  return (
    <footer className='rr-course rr-footer'>
      <div className='rr-foot'>
        <div className='rr-foot-brand'>
          <Image
            className='rr-foot-logo is-light'
            src='/brand/no-bg-gt-logo-light.png'
            alt='General Translation'
            width={30}
            height={30}
          />
          <Image
            className='rr-foot-logo is-dark'
            src='/brand/no-bg-gt-logo-dark.png'
            alt=''
            width={30}
            height={30}
          />
          <p>{FOOTER_SENTENCE}</p>
        </div>
        {FOOTER_COLUMNS.map((column) => (
          <div className='rr-foot-col' key={column.title}>
            <h4>{column.title}</h4>
            <ul>
              {column.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>
                    <Mark mark={link.mark} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className='rr-foot-bar'>
        <span>{COPYRIGHT}</span>
        <span>{COMPLIANCE}</span>
      </div>
    </footer>
  );
}
