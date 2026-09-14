import { SiDiscord, SiGithub, SiNextdotjs, SiReact } from '@icons-pack/react-simple-icons';

import { FOOTER } from '../data';
import type { FooterLink } from '../data';
import { Band, Register } from './Register';

/**
 * Register VII, the base of the stele: the mark and one sentence, four
 * columns of real links, and the closing bar with the copyright and the
 * compliance line. Marks appear only where a link names a tool. Under this
 * register the slab dissolves into the ground.
 */
function Mark({ kind }: { kind: FooterLink['mark'] }) {
  switch (kind) {
    case 'next':
      return <SiNextdotjs size={12} color='currentColor' aria-hidden />;
    case 'react':
      return <SiReact size={12} color='currentColor' aria-hidden />;
    case 'github':
      return <SiGithub size={12} color='currentColor' aria-hidden />;
    case 'discord':
      return <SiDiscord size={12} color='currentColor' aria-hidden />;
    case 'locadex':
      return (
        <img
          className='tr-ldx is-sm'
          src='/brand/no-bg-locadex-logo-light.png'
          alt=''
          aria-hidden='true'
          width={12}
          height={12}
        />
      );
    default:
      return null;
  }
}

export function Base() {
  return (
    <Register id='base' numeral='VII' name='The base'>
      <Band className='is-brand'>
        <p className='tr-foot-brand' data-cut>
          <span className='tr-foot-logos' role='img' aria-label='General Translation'>
            <img className='tr-foot-logo is-light' src='/brand/no-bg-gt-logo-light.png' alt='' width={26} height={26} />
            <img className='tr-foot-logo is-dark' src='/brand/no-bg-gt-logo-dark.png' alt='' width={26} height={26} />
          </span>
          <span>Full-stack infrastructure for localizing apps, docs, and websites.</span>
        </p>
      </Band>

      <Band className='is-links'>
        <div className='tr-foot-cols'>
          {FOOTER.map((column) => (
            <div className='tr-foot-col' key={column.title} data-cut>
              <h4>{column.title}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>
                      {link.mark ? <Mark kind={link.mark} /> : null}
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Band>

      <Band className='is-close'>
        <div className='tr-foot-bar'>
          <span>© 2026 General Translation, Inc. All rights reserved.</span>
          <span>SOC 2 Type II · GDPR · ISO 27001</span>
        </div>
      </Band>
    </Register>
  );
}
