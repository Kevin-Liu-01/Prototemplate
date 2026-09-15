import { GtMark } from '@/components/viewer/GtMark';
import { ThemeButton } from '@/components/viewer/ThemeButton';

import { LINKS } from './content';

/**
 * The case label bar: a sticky 58px band on the case ground with the GT mark
 * and name, the four links, the theme switch, Sign In, and Get a Demo (A17).
 * Its one hairline is the shelf line under it.
 */
export default function CaseNav() {
  return (
    <header className='ct-nav'>
      <div className='ct-nav-in'>
        <a className='ct-brand' href={LINKS.site}>
          <GtMark width={25} height={16} />
          <span>General Translation</span>
        </a>
        <nav className='ct-nav-links' aria-label='Site'>
          <a href={LINKS.docs}>Docs</a>
          <a href={LINKS.pricing}>Pricing</a>
          <a href={LINKS.blog}>Blog</a>
          <a href={LINKS.enterprise}>Enterprise</a>
        </nav>
        <div className='ct-nav-acts'>
          <ThemeButton className='ct-theme' />
          <a className='ct-nav-signin' href={LINKS.signin}>
            Sign In
          </a>
          <a className='ct-btn ct-btn-solid ct-btn-sm' href={LINKS.contact}>
            Get a Demo
          </a>
        </div>
      </div>
    </header>
  );
}
