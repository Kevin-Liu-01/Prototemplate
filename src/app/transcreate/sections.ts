import type { PageId } from '@/lib/page-names';
import type { ShellItem, ShellSection } from '@/lib/shell-data';

import { VIDEOS } from './videos';

/**
 * The three Transcreate pages and the shell's section they share, so every
 * route lists the same rows in the same order. The section opens under
 * Knowledge > Transcreate in the sidebar (`under`) as the row's run: the
 * overview, the videos page with its eight videos after it, and the
 * credits. Each page's own row carries the page's path, so the sidebar
 * marks it as the page the reader is on. A video is selected in place on
 * the videos page and is a link to its row there from the other pages,
 * whose shell reads the hash on mount. The id carries a `transcreate-`
 * prefix so it never matches a site map group.
 */

export type TranscreateRoute = 'overview' | 'videos' | 'credits';

export const ROUTE_PATH: Readonly<Record<TranscreateRoute, string>> = {
  overview: '/transcreate',
  videos: '/transcreate/videos',
  credits: '/transcreate/credits',
};

/** Each page's name in src/lib/page-names.ts. */
export const ROUTE_PAGE: Readonly<Record<TranscreateRoute, PageId>> = {
  overview: 'transcreate',
  videos: 'transcreateVideos',
  credits: 'transcreateCredits',
};

/** The row ids of the overview's grid, of the videos page's head and of the credits. */
export const GRID_ROW = 'all-eight';
export const VIDEOS_ROW = 'videos';
export const CREDITS_ROW = 'credits';

/** A video's row id on the videos page. */
export function videoRow(slug: string): string {
  return `video-${slug}`;
}

/** The section for one route: the pages' rows by their paths, and the videos in place on the videos page. */
export function transcreateSections(route: TranscreateRoute): readonly ShellSection[] {
  const video = (slug: string): Pick<ShellItem, 'href' | 'inPlace'> =>
    route === 'videos' ? { inPlace: true } : { href: `${ROUTE_PATH.videos}#${videoRow(slug)}` };
  return [
    {
      id: 'transcreate-pages',
      label: 'Transcreate',
      under: 'transcreate',
      items: [
        { id: GRID_ROW, title: 'Overview', href: ROUTE_PATH.overview, desc: 'The eight videos in one frame, English and Japanese' },
        { id: VIDEOS_ROW, title: 'Videos', href: ROUTE_PATH.videos, desc: 'Each video side by side or stacked' },
        ...VIDEOS.map((entry, i) => ({
          id: videoRow(entry.slug),
          n: String(i + 1).padStart(2, '0'),
          title: entry.name,
          desc: 'English to Japanese',
          ...video(entry.slug),
        })),
        { id: CREDITS_ROW, title: 'Credits', href: ROUTE_PATH.credits, desc: 'Each original video and the company it belongs to' },
      ],
    },
  ];
}
