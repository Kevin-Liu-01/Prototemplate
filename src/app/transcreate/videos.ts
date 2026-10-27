/**
 * The videos the /transcreate pages show, in page order, and the web copies
 * under public/media/transcreate: the grid of all eight, side by side and as
 * columns, and each video side by side and stacked; then the four Databricks
 * videos, with their grid and each video in Japanese and stacked; then Ramp
 * Procurement in English, Spanish and Japanese, with its grid and each
 * translation alone and stacked. Every copy has a .jpg poster of the same
 * name. Pure data, shared by the server pages, the viewer and the sidebar's
 * sections.
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

export type DatabricksVideo = {
  /** the file stem: `<slug>-ja`, `<slug>-stacked` */
  slug: string;
  name: string;
  /** the running time in whole seconds */
  seconds: number;
  /** true while the video's transcreate run still fixes it: its copies show the newest checkpoint, not a final */
  inProgress?: true;
};

/** The company the Databricks originals belong to. */
export const DATABRICKS_OWNER = 'Databricks';

/**
 * The four Databricks videos in the grid's column order, each 1280 by 720 in Japanese and 1280 by 1440 stacked, with
 * the original's sound. The Japanese comes from the transcreate runs' whole-video checkpoints of 2026-10-27: How Do
 * You Genie g22, Agent Memory g16 (its final), Teach AI g13 (its final) and Databricks g25, the newest of a run still
 * in progress.
 */
export const DATABRICKS: readonly DatabricksVideo[] = [
  { slug: 'databricks-how-do-you-genie', name: 'How Do You Genie', seconds: 80 },
  { slug: 'databricks-agent-memory', name: 'Agent Memory', seconds: 80 },
  { slug: 'databricks-teach-ai', name: 'Teach AI', seconds: 125 },
  { slug: 'databricks-full', name: 'Databricks', seconds: 80, inProgress: true },
];

/** The grid of the four Databricks videos as columns, English on top: 2560 by 720, 125 seconds, no sound. A shorter video holds its last frame. */
export const DATABRICKS_GRID = { file: 'databricks-grid', width: 2560, height: 720, seconds: 125 } as const;

/** Ramp Procurement: one Ramp video with no sound, each version 1280 by 1280, 15 seconds at 60 fps. */
export const RAMP = { slug: 'ramp-procurement', name: 'Ramp Procurement', owner: 'Ramp', seconds: 15, panel: 1280 } as const;

/** The English original, the Spanish version and the Japanese version of Ramp Procurement as columns: 2556 by 852. */
export const RAMP_GRID = { file: 'ramp-procurement-grid', width: 2556, height: 852 } as const;

export type RampVersion = {
  /** the file's suffix: `ramp-procurement-<key>`, and `-<key>-stacked` for a translation */
  key: 'en' | 'es' | 'ja';
  /** the language's name, the version's title and its view's label */
  language: string;
  /** true for a translation, which also plays under the English original */
  translation: boolean;
};

/** Ramp Procurement's three versions in page order. Spanish is Spain's Spanish. */
export const RAMP_VERSIONS: readonly RampVersion[] = [
  { key: 'en', language: 'English', translation: false },
  { key: 'es', language: 'Spanish', translation: true },
  { key: 'ja', language: 'Japanese', translation: true },
];

/** The companies the originals belong to, each once, in page order. */
export const OWNERS: readonly string[] = [...new Set([...VIDEOS.map((video) => video.owner), DATABRICKS_OWNER, RAMP.owner])];

/** Every video on the pages: the eight, the four Databricks videos and Ramp Procurement. */
export const VIDEO_COUNT = VIDEOS.length + DATABRICKS.length + 1;
