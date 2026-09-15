import { GtMark } from '@/components/viewer/GtMark';
import { ThemeButton } from '@/components/viewer/ThemeButton';

import { LINKS, NAV_LINKS } from '../data';

/**
 * The lintel: one flat stone beam across the top of the platform, sticky.
 * The mark and the name at the left, four links in the middle, the theme
 * switch, Sign In and the one solid call to action at the right.
 */
export default function Nav() {
  return (
    <header className='tt-nav'>
      <div className='tt-nav-in'>
        <a className='tt-brand' href='#top'>
          <GtMark width={25} height={16} />
          <span>General Translation</span>
        </a>
        <nav className='tt-nav-links' aria-label='Site'>
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className='tt-nav-acts'>
          <ThemeButton className='tt-theme' />
          <a className='tt-nav-signin' href={LINKS.signIn}>
            Sign In
          </a>
          <a className='tt-btn tt-btn-solid tt-btn-sm' href={LINKS.demo}>
            Get a Demo
          </a>
        </div>
      </div>
    </header>
  );
}
