'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

gsap.registerPlugin(useGSAP);

/**
 * The variant homes reuse the toolchain TopNav verbatim (the toolchain page
 * is the SSOT and is never edited during fork work), but each variant owns
 * its own enterprise page. This shim retargets the nav's hardcoded
 * enterprise link after hydration — one line of DOM surgery instead of five
 * drifting copies of the nav.
 */
export default function EnterpriseNavRebase({ href }: { href: string }) {
  useGSAP(() => {
    document
      .querySelectorAll<HTMLAnchorElement>("a[href='/d/toolchain/enterprise']")
      .forEach((a) => {
        a.href = href;
      });
  });
  return null;
}
