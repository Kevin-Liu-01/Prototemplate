/**
 * The stair: the sticky bar the reader climbs into the portico by. GT mark
 * and name on the left, four links, then the theme switch, Sign In and
 * Get a Demo (A17). Its bottom rule is the top step; the walls of the rail
 * run behind it.
 */
import { GtMark } from '@/components/viewer/GtMark';
import { ThemeButton } from '@/components/viewer/ThemeButton';

import { DEMO_URL, NAV_LINKS, SIGNIN_URL, SITE } from '../data';

export function Nav() {
  return (
    <header className='apg-nav'>
      <div className='apg-nav-in'>
        <a className='apg-brand' href={SITE}>
          <GtMark width={25} height={16} />
          <span>General Translation</span>
        </a>
        <nav className='apg-nav-links' aria-label='Primary'>
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className='apg-nav-acts'>
          <ThemeButton className='apg-theme' />
          <a className='apg-nav-signin' href={SIGNIN_URL}>
            Sign In
          </a>
          <a className='apg-btn is-solid is-sm' href={DEMO_URL}>
            Get a Demo
          </a>
        </div>
      </div>
    </header>
  );
}
