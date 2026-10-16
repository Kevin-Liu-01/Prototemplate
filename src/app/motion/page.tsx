import type { ReactNode } from 'react';

import { renderInline } from '@/components/book/markdown';
import { MOTION_FILMS } from '@/lib/motion';
import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import { langText } from './lang-text';
import MotionViewer from './MotionViewer';
import { scriptBlock, sheetBlock } from './records';

const route = seoRoute({
  path: '/motion',
  title: PAGE_NAMES.motion.name,
  kind: 'page',
  description:
    'Every film on the motion roster with its length and status, and the translation series with its six research packages.',
  updated: requireUpdated('/motion'),
});

export const metadata = route.metadata;

/**
 * /motion: the film roster on the viewer shell. Each film's one-sentence
 * summary is rendered here on the server with the book's inline renderer
 * and the script hook (lang-text.tsx), and so are the contact sheet and
 * script of a film with no page of its own (records.tsx), so the client
 * receives elements and the markdown renderer never ships in its bundle.
 * The roster itself is the generated src/lib/motion.ts.
 */
export default function MotionPage() {
  const summaries: Record<string, ReactNode> = {};
  const records: Record<string, ReactNode> = {};
  for (const film of MOTION_FILMS) {
    summaries[film.id] = renderInline(film.summary, film.id, { text: langText });
    /* a film with a page shows its records there; the row links to them */
    if (film.pkg) continue;
    const sheet = sheetBlock(film);
    const script = scriptBlock(film);
    if (sheet || script) {
      records[film.id] = (
        <>
          {sheet}
          {script}
        </>
      );
    }
  }
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <MotionViewer summaries={summaries} records={records} updated={requireUpdated('/motion')} />
    </>
  );
}
