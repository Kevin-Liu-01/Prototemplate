/**
 * The rear portico: the footer as a 5 by 2 column plan, four bays for the
 * four link columns (A11). Both drawn GT marks ship and the stylesheet
 * shows the one the theme calls for; marks appear beside a link only where
 * the link names a tool. The closing bar under the plan carries the
 * copyright and the compliance line and draws the page's last rule.
 */
import { SiDiscord, SiGithub, SiNextdotjs, SiReact } from '@icons-pack/react-simple-icons';
import Image from 'next/image';

import { COMPLIANCE, COPYRIGHT, FOOTER_COLUMNS, FOOTER_SENTENCE } from '../data';
import type { FooterLink } from '../data';
import { Bay, Hall, Row } from './deco/Hall';

function Mark({ kind }: { kind: NonNullable<FooterLink['mark']> }) {
  if (kind === 'locadex') {
    return (
      <Image
        className='apg-foot-locadex'
        src='/brand/no-bg-locadex-logo-light.png'
        alt=''
        width={14}
        height={14}
      />
    );
  }
  if (kind === 'next') return <SiNextdotjs size={13} aria-hidden />;
  if (kind === 'react') return <SiReact size={13} aria-hidden />;
  if (kind === 'github') return <SiGithub size={13} aria-hidden />;
  return <SiDiscord size={13} aria-hidden />;
}

export function Footer() {
  return (
    <footer className='apg-hall is-footer' aria-label='Site footer'>
      <div className='apg-thresh is-brand'>
        <span className='apg-foot-marks'>
          <Image
            className='apg-foot-logo is-light'
            src='/brand/no-bg-gt-logo-light.png'
            alt='General Translation'
            width={30}
            height={30}
          />
          <Image
            className='apg-foot-logo is-dark'
            src='/brand/no-bg-gt-logo-dark.png'
            alt=''
            width={30}
            height={30}
          />
        </span>
        <p>{FOOTER_SENTENCE}</p>
      </div>

      <Hall cols={4} base={64} className='is-footer'>
        <Row>
          {FOOTER_COLUMNS.map((column) => (
            <Bay className='is-links' key={column.title}>
              <nav aria-label={column.title}>
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
              </nav>
            </Bay>
          ))}
        </Row>
      </Hall>

      <div className='apg-closing'>
        <span>{COPYRIGHT}</span>
        <span>{COMPLIANCE}</span>
      </div>
    </footer>
  );
}
