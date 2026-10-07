import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { renderInline } from '@/app/docs/markdown';
import { MOTION_FILMS } from '@/lib/motion';
import { PAGE_NAMES } from '@/lib/page-names';
import { requireUpdated } from '@/lib/updated';

import { langText } from './lang-text';
import MotionViewer from './MotionViewer';
import { scriptBlock, sheetBlock } from './records';

export const metadata: Metadata = {
  title: PAGE_NAMES.motion.name,
  description:
    'Every film on the motion roster with its length and status: the brand film, the mark sting, the blog films and the showreel, and the translation series with its research packages.',
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
};

/**
 * /motion: the film roster on the viewer shell. Each film's one-sentence
 * summary is rendered here on the server with the docs' inline renderer
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
  return <MotionViewer summaries={summaries} records={records} updated={requireUpdated('/motion')} />;
}
