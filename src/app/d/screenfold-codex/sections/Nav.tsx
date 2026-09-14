import { GtMark } from '@/components/viewer/GtMark';
import { ThemeButton } from '@/components/viewer/ThemeButton';

import { DEMO, DOCS, SIGN_IN, SITE } from '../data';

/**
 * The cover board above the strip: the GT mark and name, four links, the
 * theme switch, Sign In, and the one solid call to action. Sticky, on the
 * ground, closed by a single hairline.
 */
export default function Nav() {
  return (
    <header className='sfc-nav'>
      <div className='sfc-nav-in'>
        <a className='sfc-brand' href='#top'>
          <GtMark width={25} height={16} />
          <span>General Translation</span>
        </a>
        <nav className='sfc-nav-links' aria-label='Site'>
          <a href={DOCS} rel='noreferrer' target='_blank'>
            Docs
          </a>
          <a href='#pricing'>Pricing</a>
          <a href={`${SITE}/blog`} rel='noreferrer' target='_blank'>
            Blog
          </a>
          <a href={`${SITE}/enterprise`} rel='noreferrer' target='_blank'>
            Enterprise
          </a>
        </nav>
        <div className='sfc-nav-acts'>
          <ThemeButton className='sfc-theme' />
          <a className='sfc-nav-signin' href={SIGN_IN}>
            Sign In
          </a>
          <a className='sfc-btn is-solid is-sm' href={DEMO}>
            Get a Demo
          </a>
        </div>
      </div>
    </header>
  );
}
