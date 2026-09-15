import { SiDiscord, SiGithub, SiNextdotjs, SiReact } from '@icons-pack/react-simple-icons';

import { FOOTER_COLUMNS, FOOTER_COMPLIANCE, FOOTER_COPYRIGHT, FOOTER_SENTENCE } from './content';
import type { FooterLink } from './content';

/**
 * The case's base plaque (A11): both drawn GT marks with CSS showing the one
 * the ground calls for, one sentence, four link columns separated by rhythm,
 * and the closing bar with the copyright and the compliance line. Only the
 * closing bar draws a hairline. Brand marks appear only where a link names a
 * tool.
 */
function Mark({ mark }: { mark: FooterLink['mark'] }) {
  switch (mark) {
    case 'locadex':
      return <img className='ct-foot-lx' src='/brand/no-bg-locadex-logo-light.png' alt='' width={14} height={14} />;
    case 'next':
      return <SiNextdotjs size={14} aria-hidden='true' />;
    case 'react':
      return <SiReact size={14} aria-hidden='true' />;
    case 'github':
      return <SiGithub size={14} aria-hidden='true' />;
    case 'discord':
      return <SiDiscord size={14} aria-hidden='true' />;
    default:
      return null;
  }
}

export default function CaseFooter() {
  return (
    <footer className='ct-foot'>
      <div className='ct-foot-in'>
        <div className='ct-foot-brand'>
          <img
            className='ct-foot-mark is-light'
            src='/brand/no-bg-gt-logo-light.png'
            alt='General Translation'
            width={30}
            height={30}
          />
          <img className='ct-foot-mark is-dark' src='/brand/no-bg-gt-logo-dark.png' alt='' width={30} height={30} />
          <p>{FOOTER_SENTENCE}</p>
        </div>
        <div className='ct-foot-cols'>
          {FOOTER_COLUMNS.map((column) => (
            <div className='ct-foot-col' key={column.title}>
              <h4>{column.title}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>
                      {link.mark ? <Mark mark={link.mark} /> : null}
                      <span>{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className='ct-foot-bar'>
        <div className='ct-foot-in'>
          <span>{FOOTER_COPYRIGHT}</span>
          <span>{FOOTER_COMPLIANCE}</span>
        </div>
      </div>
    </footer>
  );
}
