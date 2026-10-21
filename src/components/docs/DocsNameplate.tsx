'use client';

import Link from 'next/link';

/**
 * The docs nameplate, fumadocs' `nav.title` slot in the sidebar head and the
 * phone header: the mark and "Prototemplate" link to the hub's home at /,
 * and "Docs" links to /docs. fumadocs calls it with the slot's className
 * and the nav URL; each link keeps a box of at least 24 by 24 px.
 */
export default function DocsNameplate({ className }: { href?: string; className?: string }) {
  return (
    <span className={className} data-docs-nameplate=''>
      <Link href='/' aria-label='Prototemplate home' className='inline-flex min-h-6 items-center gap-2'>
        {/* a decorative mark beside the name the link already carries */}
        <img src='/pt-mark.svg' alt='' width={20} height={20} />
        <span>Prototemplate</span>
      </Link>
      <Link href='/docs' className='inline-flex min-h-6 items-center text-fd-muted-foreground hover:text-fd-foreground'>
        Docs
      </Link>
    </span>
  );
}
