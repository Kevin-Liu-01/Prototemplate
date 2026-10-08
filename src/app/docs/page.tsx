import type { Metadata } from 'next';

import { requireUpdated } from '@/lib/updated';

import { bookFacts } from './book';
import { buildDocs } from './docs-book';
import DocsShell from './DocsShell';
import { docWindowTitle, README_SLUG } from './model';

export const metadata: Metadata = {
  title: { absolute: docWindowTitle(README_SLUG, 'Readme') },
  description:
    'The repository documents in one place: the readme and the build log, the brand and design canons, the architecture map, the ship loop, every library running live, and the agent guide.',
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
};

/** /docs opens the book at the readme; the other five documents follow it. */
export default function DocsIndexPage() {
  const docs = buildDocs();
  return (
    <DocsShell
      book='docs'
      active={README_SLUG}
      docs={docs}
      updated={requireUpdated('/docs')}
      facts={bookFacts('docs', docs)}
    />
  );
}
