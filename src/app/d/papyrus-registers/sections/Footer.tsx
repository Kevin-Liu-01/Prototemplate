import { SiDiscord, SiGithub, SiNextdotjs, SiReact } from '@icons-pack/react-simple-icons';
import Image from 'next/image';

import { FOOTER_COLUMNS, FOOTER_COMPLIANCE, FOOTER_COPYRIGHT, FOOTER_SENTENCE } from '../data';
import type { FooterLink } from '../data';

/**
 * The closing column: both drawn GT marks (CSS shows the one the theme
 * calls for), one sentence, four link columns separated by rhythm, and the
 * closing bar with the copyright and the compliance line. Only the bar
 * draws a hairline. Tool marks appear only where a link names a tool.
 */
function Mark({ kind }: { kind: FooterLink['mark'] }) {
  switch (kind) {
    case 'locadex':
      return (
        <Image
          className='pr-foot-glyph pr-locadex'
          src='/brand/no-bg-locadex-logo-light.png'
          alt=''
          width={14}
          height={14}
        />
      );
    case 'next':
      return <SiNextdotjs className='pr-foot-glyph' size={14} color='currentColor' aria-hidden='true' />;
    case 'react':
      return <SiReact className='pr-foot-glyph' size={14} color='currentColor' aria-hidden='true' />;
    case 'github':
      return <SiGithub className='pr-foot-glyph' size={14} color='currentColor' aria-hidden='true' />;
    case 'discord':
      return <SiDiscord className='pr-foot-glyph' size={14} color='currentColor' aria-hidden='true' />;
    default:
      return null;
  }
}

export default function Footer() {
  return (
    <footer className='pr-col pr-foot'>
      <div className='pr-foot-top'>
        <div className='pr-foot-brand'>
          <Image
            className='pr-foot-mark is-light'
            src='/brand/no-bg-gt-logo-light.png'
            alt='General Translation'
            width={32}
            height={32}
          />
          <Image className='pr-foot-mark is-dark' src='/brand/no-bg-gt-logo-dark.png' alt='' width={32} height={32} />
          <p>{FOOTER_SENTENCE}</p>
        </div>

        <nav className='pr-foot-cols' aria-label='Footer'>
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h4>{column.title}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>
                      <Mark kind={link.mark} />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className='pr-foot-bar'>
        <span>{FOOTER_COPYRIGHT}</span>
        <span>{FOOTER_COMPLIANCE}</span>
      </div>
    </footer>
  );
}
