import type { PageId } from '@/lib/page-names';
import type { ShellItem, ShellSection } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';

import { DATABRICKS, RAMP, RAMP_VERSIONS, VIDEOS } from './videos';

/**
 * The five Transcreate pages and the shell's section they share, so every
 * route lists the same rows in the same order. The section opens under
 * Knowledge > Transcreate in the sidebar (`under`) as the row's run: the
 * overview, the videos page with its eight videos after it, the Databricks
 * page with its four videos after it, the Ramp page with its three versions
 * after it, and the credits. Each page's own row
 * carries the page's path, so the sidebar marks it as the page the reader
 * is on. A video is selected in place on its own page and is a link to its
 * row there from the other pages,
 * whose shell reads the hash on mount. The id carries a `transcreate-`
 * prefix so it never matches a site map group.
 */

export type TranscreateRoute = 'overview' | 'videos' | 'databricks' | 'ramp' | 'credits';

export const ROUTE_PATH: Readonly<Record<TranscreateRoute, string>> = {
  overview: '/transcreate',
  videos: '/transcreate/videos',
  databricks: '/transcreate/databricks',
  ramp: '/transcreate/ramp',
  credits: '/transcreate/credits',
};

/** Each page's name in src/lib/page-names.ts. */
export const ROUTE_PAGE: Readonly<Record<TranscreateRoute, PageId>> = {
  overview: 'transcreate',
  videos: 'transcreateVideos',
  databricks: 'transcreateDatabricks',
  ramp: 'transcreateRamp',
  credits: 'transcreateCredits',
};

/** The row ids of the overview's grid, of the videos page's head, of the Databricks and Ramp pages' grids and of the credits. */
export const GRID_ROW = 'all-eight';
export const VIDEOS_ROW = 'videos';
export const DATABRICKS_ROW = 'databricks';
export const RAMP_ROW = 'ramp';
export const CREDITS_ROW = 'credits';

/** A video's row id on the videos page. */
export function videoRow(slug: string): string {
  return `video-${slug}`;
}

/** The section for one route: the pages' rows by their paths, and each video in place on its own page. */
export function transcreateSections(route: TranscreateRoute): readonly ShellSection[] {
  const on = (page: 'videos' | 'databricks' | 'ramp', slug: string): Pick<ShellItem, 'href' | 'inPlace'> =>
    route === page ? { inPlace: true } : { href: `${ROUTE_PATH[page]}#${videoRow(slug)}` };
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
          n: pad2(i + 1),
          title: entry.name,
          desc: 'English to Japanese',
          ...on('videos', entry.slug),
        })),
        { id: DATABRICKS_ROW, title: 'Databricks', href: ROUTE_PATH.databricks, desc: 'Four Databricks videos, English to Japanese' },
        ...DATABRICKS.map((entry, i) => ({
          id: videoRow(entry.slug),
          n: pad2(i + 1),
          title: entry.name,
          desc: entry.inProgress ? 'Databricks, English to Japanese, in progress' : 'Databricks, English to Japanese',
          ...on('databricks', entry.slug),
        })),
        { id: RAMP_ROW, title: 'Ramp', href: ROUTE_PATH.ramp, desc: 'Ramp Procurement in English, Spanish and Japanese' },
        ...RAMP_VERSIONS.map((version, i) => ({
          id: videoRow(`${RAMP.slug}-${version.key}`),
          n: pad2(i + 1),
          title: version.language,
          desc: version.translation ? `Ramp, English to ${version.language}` : 'Ramp, the original',
          ...on('ramp', `${RAMP.slug}-${version.key}`),
        })),
        { id: CREDITS_ROW, title: 'Credits', href: ROUTE_PATH.credits, desc: 'Each original video and the company it belongs to' },
      ],
    },
  ];
}
