'use client';

import Link from 'next/link';

import { PtMark } from '@/components/viewer/PtMark';
import { brandFontVariables } from '@/lib/brand-fonts';

/**
 * The docs nameplate, fumadocs' `nav.title` slot in the sidebar head and the
 * phone header: the hub's mark and nameplate (proto in Fraunces, template in
 * Space Grotesk, DESIGN.md section 15) link to the hub's home at /, and
 * "Docs" links to /docs. fumadocs calls it with the slot's className
 * and the nav URL; each link keeps a box of at least 24 by 24 px.
 */
export default function DocsNameplate({ className }: { href?: string; className?: string }) {
  return (
    <span className={className} data-docs-nameplate=''>
      <Link href='/' aria-label='Prototemplate home' className='inline-flex min-h-6 items-center gap-2'>
        <PtMark />
        <span className={`pt-brand-word ${brandFontVariables}`}>
          <b className='pt-face-serif'>proto</b>
          <b className='pt-face-grot'>template</b>
        </span>
      </Link>
      <Link
        href='/docs'
        className='docs-nameplate-docs inline-flex min-h-6 items-center text-fd-muted-foreground hover:text-fd-foreground'
      >
        Docs
      </Link>
    </span>
  );
}
