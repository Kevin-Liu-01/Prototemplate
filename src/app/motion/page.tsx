import type { ReactNode } from 'react';

import { renderInline } from '@/components/book/markdown';
import { MOTION_FILMS, MOTION_SECTIONS, MOTION_STATUS_LABEL } from '@/lib/motion';
import type { MotionFilm, MotionLocal, MotionVersion } from '@/lib/motion';
import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import { filmCuts } from './cuts';
import { langText } from './lang-text';
import MotionViewer from './MotionViewer';
import type { MotionRoster } from './MotionViewer';
import { scriptBlock, sheetBlock } from './records';
import { motionSections } from './sections';

const route = seoRoute({
  path: '/motion',
  title: PAGE_NAMES.motion.name,
  kind: 'page',
  description:
    'Every film on the motion roster with its length and status, and the translation series with its six research packages.',
  updated: requireUpdated('/motion'),
});

export const metadata = route.metadata;

/** The local paths a roster row prints: the folder of a film in production and the final render of an unpublished one. */
function rosterLocal(local: MotionLocal | undefined): MotionLocal | undefined {
  return local && { folder: local.folder, video: local.video };
}

/** A language version as the client roster reads it: without the published cut's credits and render, which the roster never shows. */
function rosterVersion({ credits, cut, local, ...version }: MotionVersion): MotionVersion {
  return { ...version, local: rosterLocal(local) };
}

/** A film as the client roster reads it: without the published cut's credits and render, which the roster never shows. */
function rosterFilm({ credits, cut, local, versions, ...film }: MotionFilm): MotionFilm {
  return { ...film, local: rosterLocal(local), versions: versions?.map(rosterVersion) };
}

/**
 * /motion: the film roster on the viewer shell. Each film's one-sentence
 * summary is rendered here on the server with the book's inline renderer
 * and the script hook (lang-text.tsx), and so are the contact sheet and
 * script of each cut of a film with no page of its own (records.tsx), so the client
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
    /* each cut's own blocks, keyed by its row id, so the language toggle swaps them with the film */
    for (const cut of filmCuts(film)) {
      const sheet = sheetBlock(cut.film);
      const script = scriptBlock(cut.film);
      if (sheet || script) {
        records[cut.rowId] = (
          <>
            {sheet}
            {script}
          </>
        );
      }
    }
  }
  const roster: MotionRoster = {
    films: MOTION_FILMS.map(rosterFilm),
    sections: MOTION_SECTIONS,
    statusLabel: MOTION_STATUS_LABEL,
    shellSections: motionSections('index', MOTION_FILMS, MOTION_SECTIONS),
  };
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <MotionViewer roster={roster} summaries={summaries} records={records} updated={requireUpdated('/motion')} />
    </>
  );
}
