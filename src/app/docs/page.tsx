import type { Metadata } from 'next';

import { buildDocs } from './book';
import DocsShell from './DocsShell';
import { docWindowTitle, README_SLUG } from './model';

export const metadata: Metadata = {
  title: { absolute: docWindowTitle(README_SLUG, 'Readme') },
  description:
    'The repository documents in one place: the readme and the build log, the brand and design canons, the architecture map, the ship loop, and every library running live.',
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
};

/** /docs opens the book at the readme; the other five documents follow it. */
export default function DocsIndexPage() {
  return <DocsShell active={README_SLUG} docs={buildDocs()} />;
}
