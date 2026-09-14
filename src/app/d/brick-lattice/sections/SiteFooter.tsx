import Image from 'next/image';

import BrickField from '../diagrams/BrickField';
import { FOOTER_COLUMNS } from '../data';

/**
 * brick-lattice · the footer.
 *
 * Home: the foundation. One wide glazed panel with the GT mark, one
 * sentence and the four link columns; under it the closing course with
 * the copyright and the compliance line; under that the lattice steps up
 * in density to a solid base, the wall's footing. Both drawn marks ship
 * and CSS shows the one the theme calls for. Columns separate by rhythm;
 * only the closing course draws a hairline.
 */
export default function SiteFooter() {
  return (
    <footer className='bl-sec bl-foot-sec'>
      <BrickField field='foundation' />
      <div className='bl-in'>
        <div className='bl-foot bl-panel'>
          <div className='bl-foot-brand'>
            <Image
              className='bl-foot-logo is-light'
              src='/brand/no-bg-gt-logo-light.png'
              alt='General Translation'
              width={32}
              height={32}
            />
            <Image className='bl-foot-logo is-dark' src='/brand/no-bg-gt-logo-dark.png' alt='' width={32} height={32} />
            <p>End-to-end localization for the world&rsquo;s best companies.</p>
          </div>
          <div className='bl-foot-cols'>
            {FOOTER_COLUMNS.map((col) => (
              <div className='bl-foot-col' key={col.title}>
                <h4>{col.title}</h4>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className='bl-foot-bar bl-panel'>
          <span>© 2026 General Translation, Inc. All rights reserved.</span>
          <span>SOC 2 Type II · GDPR · ISO 27001</span>
        </div>
      </div>
    </footer>
  );
}
