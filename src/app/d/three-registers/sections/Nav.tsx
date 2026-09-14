import { GtMark } from '@/components/viewer/GtMark';
import { ThemeButton } from '@/components/viewer/ThemeButton';

import { LINKS } from '../data';

/**
 * The slab's first course, under the cornice: the mark and the name, four
 * links, the theme switch, Sign In, and Get a Demo. It sticks to the top of
 * the viewport at the slab's own width and draws the one rule under itself.
 */
const NAV: readonly { label: string; href: string }[] = [
  { label: 'Docs', href: LINKS.docs },
  { label: 'Pricing', href: LINKS.pricing },
  { label: 'Blog', href: LINKS.blog },
  { label: 'Enterprise', href: LINKS.enterprise },
];

export function Nav() {
  return (
    <nav className='tr-nav' aria-label='Primary'>
      <a className='tr-nav-brand' href='#top'>
        <GtMark width={22} height={14} />
        <span>General Translation</span>
      </a>
      <ul className='tr-nav-links'>
        {NAV.map((link) => (
          <li key={link.label}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
      <div className='tr-nav-acts'>
        <ThemeButton className='tr-theme' />
        <a className='tr-nav-signin' href={LINKS.signin}>
          Sign In
        </a>
        <a className='tr-act is-solid is-sm' href={LINKS.demo}>
          Get a Demo
        </a>
      </div>
    </nav>
  );
}
