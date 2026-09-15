import Image from 'next/image';

import BrickField from '../diagrams/BrickField';
import { PATTERN_BOOK } from '../diagrams/lattice';
import PatternSwatch from '../diagrams/PatternSwatch';
import { FOOTER_COLUMNS } from '../data';

/**
 * brick-lattice · the footer, the lattice base.
 *
 * Home: the foundation. One wide glazed panel with the GT mark, one
 * sentence and the four link columns; under it the pattern book, the six
 * bond patterns of the page printed at tile scale with their names, each
 * linking to the section it grounds; under that the plinth, the closing
 * course with the copyright and the compliance line, set wider than the
 * panels above it the way a wall's footing steps out; and under that the
 * lattice steps up in density to solid lapis and a gold plinth course.
 * Both drawn marks ship and CSS shows the one the theme calls for. Columns
 * separate by rhythm; no panel draws a border.
 */
export default function SiteFooter() {
  return (
    <footer className='bl-sec bl-foot-sec' id='footer'>
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

        <nav className='bl-book bl-panel' aria-label='Pattern book'>
          <h4>Pattern book</h4>
          <ol className='bl-book-row'>
            {PATTERN_BOOK.map((entry) => (
              <li key={entry.field}>
                <a className='bl-book-item' href={entry.href}>
                  <PatternSwatch field={entry.field} size={56} brick={16} />
                  <span className='bl-book-name'>{entry.name}</span>
                  <span className='bl-book-home'>{entry.home}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className='bl-foot-bar bl-panel is-plinth'>
          <span>© 2026 General Translation, Inc. All rights reserved.</span>
          <span>SOC 2 Type II · GDPR · ISO 27001</span>
        </div>
      </div>
    </footer>
  );
}
