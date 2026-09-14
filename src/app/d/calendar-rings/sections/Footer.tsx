/**
 * calendar-rings: the base register.
 * The ring flattened: the mark and one sentence, four link columns
 * separated by rhythm, and the closing bar under the notched rule with the
 * copyright and the compliance line.
 */
import Image from 'next/image';

import { FOOTER_COLUMNS } from '../data';

export function Footer() {
  return (
    <footer className='cr-foot'>
      <div className='cr-col cr-foot-in'>
        <div className='cr-foot-brand'>
          {/* both drawn marks ship; the stylesheet shows the one the theme calls for */}
          <Image className='cr-foot-mark is-light' src='/brand/no-bg-gt-logo-light.png' alt='General Translation' width={30} height={30} />
          <Image className='cr-foot-mark is-dark' src='/brand/no-bg-gt-logo-dark.png' alt='' width={30} height={30} />
          <p>End-to-end localization for the world&rsquo;s best companies.</p>
        </div>
        <div className='cr-foot-cols'>
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className='cr-foot-col'>
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
      <div className='cr-ticks' aria-hidden='true' />
      <div className='cr-col cr-foot-bar'>
        <span>© 2026 General Translation, Inc. All rights reserved.</span>
        <span>SOC 2 Type II · GDPR · ISO 27001</span>
      </div>
    </footer>
  );
}
