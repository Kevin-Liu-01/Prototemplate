import { GtMark } from '@/components/viewer/GtMark';
import { ThemeButton } from '@/components/viewer/ThemeButton';

import { LINKS } from './content';

/**
 * The top course: a thin ruled band on the wall column with the mark, the
 * four links, the theme switch, Sign In, and the one solid act. Its column
 * carries the same rail pair the wall below continues.
 */
export default function Nav() {
  return (
    <header className='rr-nav'>
      <div className='rr-nav-in'>
        <a className='rr-brand' href={LINKS.top}>
          <GtMark width={25} height={16} />
          <span>General Translation</span>
        </a>
        <nav className='rr-nav-links' aria-label='Site'>
          <a href={LINKS.docs}>Docs</a>
          <a href='#pricing'>Pricing</a>
          <a href={LINKS.blog}>Blog</a>
          <a href={LINKS.enterprise}>Enterprise</a>
        </nav>
        <div className='rr-nav-acts'>
          <ThemeButton className='rr-theme' />
          <a className='rr-nav-signin' href={LINKS.signIn}>
            Sign In
          </a>
          <a className='rr-btn is-solid is-sm' href={LINKS.demo}>
            Get a Demo
          </a>
        </div>
      </div>
    </header>
  );
}
