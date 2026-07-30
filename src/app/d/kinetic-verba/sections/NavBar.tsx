import Image from 'next/image';

const LINKS = [
  { label: 'Docs', href: '#how' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Enterprise', href: '#pricing' },
  { label: 'Blog', href: '#features' },
];

/**
 * Compact floating pill. The story pins over it and morphs a proxy of the same
 * geometry into its dock, so the resting shape (rounded, centred, fixed
 * height) has to stay simple.
 */
export default function NavBar() {
  return (
    <nav className='kv-nav'>
      <div className='kv-nav-pill' data-navpill>
        <a className='kv-brand' href='#top' aria-label='General Translation home'>
          <span className='kv-brand-mark'>
            <Image
              src='/brand/no-bg-gt-logo-dark.png'
              alt=''
              width={1198}
              height={1198}
              aria-hidden
            />
          </span>
          <span className='kv-brand-name'>General Translation</span>
        </a>
        <div className='kv-nav-links'>
          {LINKS.map((link) => (
            <a href={link.href} key={link.label}>
              {link.label}
            </a>
          ))}
        </div>
        <div className='kv-nav-cta'>
          <a className='kv-btn kv-btn-ghost' href='#pricing'>
            Sign In
          </a>
          <a className='kv-btn kv-btn-solid' href='#cta'>
            <span className='kv-iri' aria-hidden />
            Get a Demo
          </a>
        </div>
      </div>
    </nav>
  );
}
