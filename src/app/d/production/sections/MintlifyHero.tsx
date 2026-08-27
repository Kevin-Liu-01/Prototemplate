import Image from 'next/image';

import MintlifyHeroDiagram from './MintlifyHeroDiagram';
import { MINTLIFY_LINKS } from './mintlify-links';

/**
 * The shipped hero's forward arrow — Arrow.tsx (apps/landing/src/components/
 * ui/Arrow.tsx) at direction 'forward', which resolves to 'right' and 0deg
 * of rotation on an ltr document. Its path is not lucide's, so it is drawn
 * here rather than substituted.
 */
function ForwardArrow({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
    >
      <path
        d='M5 12h12M13 6l6 6-6 6'
        stroke='currentColor'
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

/**
 * THE SHIPPED /mintlify MASTHEAD, reproduced.
 *
 * 1-1 with the `mintlify-hero` section of apps/landing/src/components/pages/
 * mintlify/MintlifyPage.tsx: the partner lockup (GT × the Mintlify mark,
 * itself a link to the GitHub integration), the one-line display, the
 * two-sentence sub with its two bold marks, and the two actions — Get
 * Started on the OAuth start redirect and Guide on the docs quickstart.
 *
 * The real hero carries NO colophon line under the actions; nothing stands
 * between them and the diagram.
 */
export default function MintlifyHero() {
  return (
    <section className='tc-sec mintlify-hero'>
      <div className='mintlify-hero-copy'>
        <a
          className='mintlify-partner-lockup'
          href={MINTLIFY_LINKS.integration.href}
          aria-label='Mintlify Integration'
        >
          <span>GT</span>
          <i>×</i>
          <Image
            src='/logos/favicons/mintlify.ico'
            alt=''
            width={28}
            height={28}
          />
        </a>

        <h1>Translate your docs in one click</h1>
        <p>
          Make your documentation accessible to developers everywhere.
          <br />
          <strong>General Translation</strong> automates localization for{' '}
          <strong>Mintlify</strong>.
        </p>
        <div className='mintlify-actions'>
          <span className='tc-cta-ring'>
            <a
              className='tc-btn tc-btn-solid tc-btn-lg'
              href={MINTLIFY_LINKS.heroGetStarted.href}
            >
              Get Started
              <ForwardArrow size={16} />
            </a>
          </span>
          <a
            className='tc-btn tc-btn-line tc-btn-lg'
            href={MINTLIFY_LINKS.guide.href}
          >
            Guide
          </a>
        </div>
      </div>
      <MintlifyHeroDiagram />
    </section>
  );
}
