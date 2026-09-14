import { GtMark } from '@/components/viewer/GtMark';
import { ThemeButton } from '@/components/viewer/ThemeButton';

import { DEMO_HREF, NAV_LINKS, SIGN_IN_HREF } from '../data';

/**
 * The top register: a sticky 56px bar on the rail with the monogram and the
 * name, four links, the theme switch, Sign In and Get a Demo. Its bottom
 * hairline is the seam the hero starts from; nothing below draws a top rule.
 */
export default function Nav() {
  return (
    <header className='sf-nav'>
      <div className='sf-nav-in'>
        <a className='sf-brand' href='#top' aria-label='General Translation, top of page'>
          <GtMark width={25} height={16} />
          <span className='sf-brand-name'>General Translation</span>
        </a>
        <nav className='sf-nav-links' aria-label='Site'>
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className='sf-nav-acts'>
          <ThemeButton className='sf-theme' />
          <a className='sf-nav-signin' href={SIGN_IN_HREF}>
            Sign In
          </a>
          <a className='sf-btn sf-btn-solid sf-btn-sm' href={DEMO_HREF}>
            Get a Demo
          </a>
        </div>
      </div>
    </header>
  );
}
