/**
 * The eight videos the /transcreate pages show, in page order, and the web
 * copies under public/media/transcreate: the grid of all eight, side by
 * side and as columns, and each video side by side and stacked. Every copy
 * has a .jpg poster of the same name. Pure data, shared by the server pages,
 * the viewer and the sidebar's sections.
 */

export const MEDIA = '/media/transcreate';

/** The grid of all eight: side by side at 2560 by 1440, or as columns at 4096 by 576; 30 seconds, no sound. */
export const GRID = {
  side: { file: 'all-side', width: 2560, height: 1440 },
  columns: { file: 'all-columns', width: 4096, height: 576 },
  seconds: 30,
} as const;

/** A panel of the side-by-side and stacked copies is 1280 wide. */
export const PANEL_WIDTH = 1280;

export type TranscreateVideo = {
  /** the file stem: `<slug>-side`, `<slug>-stacked` */
  slug: string;
  name: string;
  /** the company the original video belongs to */
  owner: string;
  /** the running time in whole seconds */
  seconds: number;
  /** the height of one 1280-wide panel */
  panelHeight: number;
  /** the original video, where its title and address are recorded */
  source?: { title: string; url: string };
};

export const VIDEOS: readonly TranscreateVideo[] = [
  { slug: 'notion', name: 'Notion', owner: 'Notion', seconds: 30, panelHeight: 720 },
  { slug: 'linear-releases', name: 'Linear Releases', owner: 'Linear', seconds: 30, panelHeight: 640 },
  { slug: 'linear-agents', name: 'Linear Agents', owner: 'Linear', seconds: 30, panelHeight: 720 },
  {
    slug: 'ramp-budgets',
    name: 'Ramp Budgets',
    owner: 'Ramp',
    seconds: 30,
    panelHeight: 720,
    source: { title: 'Introducing Ramp Budgets', url: 'https://www.youtube.com/watch?v=PmhOGrghI5A' },
  },
  { slug: 'asana', name: 'Asana', owner: 'Asana', seconds: 30, panelHeight: 720 },
  {
    slug: 'notion-mail',
    name: 'Notion Mail',
    owner: 'Notion',
    seconds: 30,
    panelHeight: 720,
    source: { title: 'Meet Notion Mail', url: 'https://www.youtube.com/watch?v=54l-1NfXnX8' },
  },
  {
    slug: 'stripe-sessions',
    name: 'Stripe Sessions',
    owner: 'Stripe',
    seconds: 30,
    panelHeight: 720,
    source: { title: 'Stripe Sessions 2024', url: 'https://www.youtube.com/watch?v=KH0_HM6e66w' },
  },
  {
    slug: 'miro-canvas',
    name: 'Miro Canvas',
    owner: 'Miro',
    seconds: 29,
    panelHeight: 720,
    source: { title: 'Canvas 26 in 60 Seconds: Teamwork, AI-mplified', url: 'https://www.youtube.com/watch?v=_-ubUdwsxwY' },
  },
];

/** The companies the originals belong to, each once, in page order. */
export const OWNERS: readonly string[] = [...new Set(VIDEOS.map((video) => video.owner))];
