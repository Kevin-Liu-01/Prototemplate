import { COMPLIANCE, COPYRIGHT, FOOTER_COLUMNS, FOOTER_SENTENCE } from '../data';
import { Tablero, Talud, Terrace } from './deco/Terrace';

/**
 * The base course, the widest tier. The brand mark (both drawings; CSS
 * shows the one the theme calls for) with one sentence, four link columns
 * separated by rhythm, and the closing bar with the copyright and the
 * compliance line, the one rule the footer draws. The chevron talud under
 * it is the foot of the platform.
 */
export default function Footer() {
  return (
    <Terrace tier={0} className='tt-footer' id='footer'>
      <Tablero depth={1}>
        <footer className='tt-foot'>
          <div className='tt-foot-top'>
            <div className='tt-foot-brand'>
              <img className='tt-foot-mark is-light' src='/brand/no-bg-gt-logo-light.png' alt='General Translation' width={40} height={40} />
              <img className='tt-foot-mark is-dark' src='/brand/no-bg-gt-logo-dark.png' alt='General Translation' width={40} height={40} />
              <p>{FOOTER_SENTENCE}</p>
            </div>
            <div className='tt-foot-cols'>
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.title} className='tt-foot-col'>
                  <h4>{column.title}</h4>
                  <ul>
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <a href={link.href}>{link.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className='tt-foot-bar'>
            <span>{COPYRIGHT}</span>
            <span>{COMPLIANCE}</span>
          </div>
        </footer>
      </Tablero>
      <Talud relief='chevron' className='is-foot' />
    </Terrace>
  );
}
