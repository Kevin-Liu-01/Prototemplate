import { GtMark } from '@/components/viewer/GtMark';
import { ThemeButton } from '@/components/viewer/ThemeButton';

import { LINKS } from '../data';

/**
 * brick-lattice · the navigation.
 *
 * Home: the top of the page, sticky. One glazed course above the wall: the
 * GT mark and the name at the left, four links, the theme switch, Sign In
 * as text and Get a Demo as the one solid control (charter A17). Its
 * bottom hairline is the first seam of the page; the lattice begins under it.
 */
const NAV_LINKS: readonly { label: string; href: string }[] = [
  { label: 'Docs', href: LINKS.docs },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: LINKS.blog },
  { label: 'Enterprise', href: LINKS.enterprise },
];

export default function TopNav() {
  return (
    <header className='bl-nav'>
      <nav className='bl-nav-in' aria-label='Primary'>
        <a className='bl-brand' href='#top'>
          <GtMark width={25} height={16} />
          <span>General Translation</span>
        </a>
        <ul className='bl-nav-links'>
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
        <div className='bl-nav-acts'>
          <ThemeButton className='bl-theme' />
          <a className='bl-nav-signin' href={LINKS.signIn}>
            Sign In
          </a>
          <a className='bl-btn bl-btn-solid bl-btn-sm' href={LINKS.demo}>
            Get a Demo
          </a>
        </div>
      </nav>
    </header>
  );
}
