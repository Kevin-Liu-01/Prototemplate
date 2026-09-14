import { GtMark } from '@/components/viewer/GtMark';
import { ThemeButton } from '@/components/viewer/ThemeButton';

import { LINKS } from '../data';

/**
 * The top bar: the GT mark and the name, four links, the theme switch,
 * Sign In, and Get a Demo. Its inner column carries the same rail pair as
 * the scroll below it, so the two hairlines run from the top of the page.
 */
const NAV_LINKS: readonly { label: string; href: string }[] = [
  { label: 'Docs', href: LINKS.docs },
  { label: 'Pricing', href: LINKS.pricing },
  { label: 'Blog', href: LINKS.blog },
  { label: 'Enterprise', href: LINKS.enterprise },
];

export default function Nav() {
  return (
    <header className='pr-nav'>
      <div className='pr-nav-in'>
        <a className='pr-brand' href='#top'>
          <GtMark width={25} height={16} />
          <span className='pr-brand-name'>General Translation</span>
        </a>
        <nav className='pr-nav-links' aria-label='Primary'>
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className='pr-nav-acts'>
          <ThemeButton className='pr-theme' />
          <a className='pr-nav-signin' href={LINKS.signIn}>
            Sign In
          </a>
          <a className='pr-btn is-solid is-sm' href={LINKS.demo}>
            Get a Demo
          </a>
        </div>
      </div>
    </header>
  );
}
