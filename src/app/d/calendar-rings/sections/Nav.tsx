/**
 * calendar-rings: the navigation register.
 * One bar on the column: the mark and the name, four links, the theme
 * switch, Sign In, Get a Demo. The bar's seam is the notched rule, the
 * rim's notches unrolled, drawn once under it.
 */
import { GtMark } from '@/components/viewer/GtMark';
import { ThemeButton } from '@/components/viewer/ThemeButton';

import { HREFS } from '../data';

export function Nav() {
  return (
    <nav className='cr-nav' aria-label='Primary'>
      <div className='cr-col cr-nav-in'>
        <a className='cr-brand' href='#top'>
          <GtMark width={25} height={16} />
          <span>General Translation</span>
        </a>
        <ul className='cr-nav-links'>
          <li>
            <a href={HREFS.docs}>Docs</a>
          </li>
          <li>
            <a href={HREFS.pricing}>Pricing</a>
          </li>
          <li className='is-wide'>
            <a href={HREFS.blog}>Blog</a>
          </li>
          <li className='is-wide'>
            <a href={HREFS.enterprise}>Enterprise</a>
          </li>
        </ul>
        <div className='cr-nav-acts'>
          <ThemeButton className='cr-theme' />
          <a className='cr-nav-signin' href={HREFS.signIn}>
            Sign In
          </a>
          <a className='cr-btn is-solid is-sm' href={HREFS.demo}>
            Get a Demo
          </a>
        </div>
      </div>
      <div className='cr-ticks' aria-hidden='true' />
    </nav>
  );
}
