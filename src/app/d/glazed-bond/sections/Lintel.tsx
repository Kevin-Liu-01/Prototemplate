import { GtMark } from '@/components/viewer/GtMark';
import { ThemeButton } from '@/components/viewer/ThemeButton';

import { NAV_LINKS, URLS } from '../data';

/**
 * The lintel: the one course that spans the whole gate, sticky at the top.
 * Brand at the left, four links in the middle, the theme switch, Sign In
 * and Get a Demo at the right. It draws its own bottom seam once.
 */
export default function Lintel() {
  return (
    <header className='gb-lintel'>
      <nav className='gb-lintel-in' aria-label='Primary'>
        <a className='gb-brand' href='#top'>
          <GtMark width={25} height={16} />
          <span>General Translation</span>
        </a>
        <ul className='gb-links'>
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
        <div className='gb-lintel-acts'>
          <ThemeButton className='gb-theme' />
          <a className='gb-signin' href={URLS.getStarted}>
            Sign In
          </a>
          <a className='gb-btn is-solid is-sm' href={URLS.demo}>
            Get a Demo
          </a>
        </div>
      </nav>
    </header>
  );
}
