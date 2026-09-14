import { GtMark } from '@/components/viewer/GtMark';
import { ThemeButton } from '@/components/viewer/ThemeButton';

import { LINKS } from '../data';

/**
 * textile-block: the lintel.
 *
 * A sticky bar the width of the wall, set above the first course like the
 * cast lintel over a textile-block doorway. The GT mark and the name, four
 * links, the theme switch, Sign In, and Get a Demo. Its own hairline ring;
 * the wall's top edge sits a course gap below it, so the two rules never
 * meet.
 */
export default function Nav() {
  return (
    <header className='tb-nav' id='top'>
      <a className='tb-nav-brand' href='#top'>
        <GtMark height={16} width={25} />
        <span>General Translation</span>
      </a>
      <nav aria-label='Site' className='tb-nav-links'>
        <a href={LINKS.docs}>Docs</a>
        <a href='#pricing'>Pricing</a>
        <a className='tb-nav-wide' href={LINKS.blog}>
          Blog
        </a>
        <a className='tb-nav-wide' href={LINKS.enterprise}>
          Enterprise
        </a>
      </nav>
      <div className='tb-nav-acts'>
        <ThemeButton className='tb-nav-theme' />
        <a className='tb-nav-signin tb-nav-wide' href={LINKS.signIn}>
          Sign In
        </a>
        <a className='tb-btn tb-btn-solid tb-btn-sm' href={LINKS.demo}>
          Get a Demo
        </a>
      </div>
    </header>
  );
}
