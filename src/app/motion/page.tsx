import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { renderInline } from '@/app/docs/markdown';
import { MOTION_FILMS } from '@/lib/motion';

import { langText } from './lang-text';
import MotionViewer from './MotionViewer';

export const metadata: Metadata = {
  title: 'Motion',
  description:
    'Every film on the motion roster with its length and status: the brand film, the mark sting, the blog films and the showreel, and the translation series with its research packages.',
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
};

/**
 * /motion: the film roster on the viewer shell. Each film's one-sentence
 * summary is rendered here on the server with the docs' inline renderer
 * and the script hook (lang-text.tsx), so the client receives elements and
 * the markdown renderer never ships in its bundle. The roster itself is
 * the generated src/lib/motion.ts.
 */
export default function MotionPage() {
  const summaries: Record<string, ReactNode> = {};
  for (const film of MOTION_FILMS) {
    summaries[film.id] = renderInline(film.summary, film.id, { text: langText });
  }
  return <MotionViewer summaries={summaries} />;
}
