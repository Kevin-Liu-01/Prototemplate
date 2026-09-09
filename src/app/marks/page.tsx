import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Metadata } from 'next';

import { MARKS } from '@/lib/marks';
import type { MarkArt } from '@/lib/marks';

import MarksViewer from './MarksViewer';

export const metadata: Metadata = {
  title: 'Marks',
  description: `${MARKS.length} new GT marks in three families, each one color and built so the picture lives in the letters, shown large, at every size, as an app icon and a favicon, and with its construction.`,
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
};

/** A public path (`/marks/x.svg`) read from the public folder at build time. */
function readSvg(publicPath: string): string {
  return readFileSync(join(process.cwd(), 'public', publicPath), 'utf8').trim();
}

/**
 * /marks opens the book at its head. The SVG files under public/marks are
 * read here, on the server, and handed to the viewer as markup, so every
 * mark is inlined and takes currentColor from the plate it sits on; the
 * same files stay downloadable at their public paths.
 */
export default function MarksPage() {
  const art: Readonly<Record<string, MarkArt>> = Object.fromEntries(
    MARKS.map((mark) => [mark.id, { clean: readSvg(mark.file), construction: readSvg(mark.constructionFile) }])
  );
  return <MarksViewer art={art} />;
}
