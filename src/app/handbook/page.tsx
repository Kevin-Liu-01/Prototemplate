import type { Metadata } from 'next';

import { bookFacts, buildBook } from '@/app/docs/book';
import DocsShell from '@/app/docs/DocsShell';
import { README_SLUG } from '@/app/docs/model';
import { PAGE_NAMES } from '@/lib/page-names';
import { requireUpdated } from '@/lib/updated';

export const metadata: Metadata = {
  title: PAGE_NAMES.handbook.name,
  description:
    'How Kevin Liu runs General Translation work: the operating principles, the quality bar, the multi-session playbook, the product map, the glossary and the decisions log.',
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
};

/** /handbook opens the handbook at its readme; the six documents follow it in the docs shell. */
export default function HandbookPage() {
  const docs = buildBook('handbook');
  return (
    <DocsShell
      book='handbook'
      active={README_SLUG}
      docs={docs}
      updated={requireUpdated('/handbook')}
      facts={bookFacts('handbook', docs)}
    />
  );
}
