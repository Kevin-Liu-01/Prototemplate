'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

/**
 * The mark at the top of the form column, linking home.
 *
 * The real page draws packages/ui/src/components/frame/Logo.tsx — both PNG
 * variants rendered, the theme picking one, a visually hidden name for the
 * screen reader — inside an anchor to homepageUrl, with the image sized by
 * `[&_img]:h-[clamp(26px,3.33svh+8px,38px)]`. Here home is the concept's own
 * landing page, so the destination resolves against the concept base.
 */
export default function SignInMark() {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/production';

  return (
    <a aria-label='General Translation' className='psi-mark' href={base}>
      <Image
        alt='GT, Inc. light logo'
        className='tc-logo-light'
        height={38}
        priority
        src='/brand/no-bg-gt-logo-light.png'
        width={38}
      />
      <Image
        alt='GT, Inc. dark logo'
        className='tc-logo-dark'
        height={38}
        priority
        src='/brand/no-bg-gt-logo-dark.png'
        width={38}
      />
      <span className='psi-sr'>General Translation, Inc.</span>
    </a>
  );
}
