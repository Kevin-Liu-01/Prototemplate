/**
 * The videos the /transcreate pages show, in page order, and the web copies
 * under public/media/transcreate: the featured film, Introducing Profound,
 * as one file that packs its original and its Japanese version; the grid of all eight, side by side and as
 * columns, and each video side by side and stacked; then the four Databricks
 * videos, with their grid and each video in Japanese and stacked; then Ramp
 * Procurement in English, Spanish and Japanese, with its grid and each
 * translation alone and stacked. Every copy has a .jpg poster of the same
 * name. Pure data, shared by the server pages, the viewer and the sidebar's
 * sections.
 */

export const MEDIA = '/media/transcreate';

/**
 * A film the compare viewer (PairViewer) plays: one file that packs the
 * original above its translation, the two paired by frame index, with a
 * .jpg poster of the same name in the same layout. Every stacked copy on
 * these pages has that layout, so each one opens in the viewer at
 * /transcreate/view/<slug>.
 */
export type PairFilm = {
  slug: string;
  name: string;
  /** the file stem under MEDIA */
  file: string;
  /** the translation's language, as the divider and the sound switch name it */
  language: 'Japanese' | 'Spanish';
  /** one picture of the pair */
  panel: { width: number; height: number };
  frames: number;
  fps: number;
  /**
   * the sound: `dub` is 5.1 with the original's stereo in the front pair and
   * the dub's in the surround pair; `original` is the original's stereo; `none` is silent
   */
  sound: 'dub' | 'original' | 'none';
  /** the row the film sits on, where the viewer's back link returns */
  back: string;
};

/**
 * The featured film: Profound's launch film and its Japanese version. The
 * Japanese picture is the free agent's run of 2026-11-21 and the dub its
 * ElevenLabs pass. The poster is frame 552 of the packed picture.
 */
export const PROFOUND: PairFilm & { owner: string; seconds: number } = {
  slug: 'profound',
  name: 'Introducing Profound',
  owner: 'Profound',
  file: 'profound-pair',
  language: 'Japanese',
  panel: { width: 1280, height: 720 },
  frames: 2406,
  fps: 30000 / 1001,
  seconds: 80,
  sound: 'dub',
  back: '/transcreate#profound',
};

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
  /** the stacked copy's frame count and frame rate, which the compare viewer steps by */
  frames: number;
  fps: number;
  /** the original video, where its title and address are recorded */
  source?: { title: string; url: string };
};

export const VIDEOS: readonly TranscreateVideo[] = [
  { slug: 'notion', frames: 720, fps: 24000 / 1001, name: 'Notion', owner: 'Notion', seconds: 30, panelHeight: 720 },
  { slug: 'linear-releases', frames: 1800, fps: 60, name: 'Linear Releases', owner: 'Linear', seconds: 30, panelHeight: 640 },
  { slug: 'linear-agents', frames: 900, fps: 30, name: 'Linear Agents', owner: 'Linear', seconds: 30, panelHeight: 720 },
  {
    slug: 'ramp-budgets', frames: 750, fps: 25,
    name: 'Ramp Budgets',
    owner: 'Ramp',
    seconds: 30,
    panelHeight: 720,
    source: { title: 'Introducing Ramp Budgets', url: 'https://www.youtube.com/watch?v=PmhOGrghI5A' },
  },
  { slug: 'asana', frames: 720, fps: 24, name: 'Asana', owner: 'Asana', seconds: 30, panelHeight: 720 },
  {
    slug: 'notion-mail', frames: 720, fps: 24,
    name: 'Notion Mail',
    owner: 'Notion',
    seconds: 30,
    panelHeight: 720,
    source: { title: 'Meet Notion Mail', url: 'https://www.youtube.com/watch?v=54l-1NfXnX8' },
  },
  {
    slug: 'stripe-sessions', frames: 720, fps: 24000 / 1001,
    name: 'Stripe Sessions',
    owner: 'Stripe',
    seconds: 30,
    panelHeight: 720,
    source: { title: 'Stripe Sessions 2024', url: 'https://www.youtube.com/watch?v=KH0_HM6e66w' },
  },
  {
    slug: 'miro-canvas', frames: 876, fps: 30,
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
  /** the stacked copy's frame count and frame rate, which the compare viewer steps by */
  frames: number;
  fps: number;
  /** true while the video's transcreate run still fixes it: its copies show the newest checkpoint, not a final */
  inProgress?: true;
};

/** The company the Databricks originals belong to. */
export const DATABRICKS_OWNER = 'Databricks';

/**
 * The four Databricks videos in the grid's column order, each 1280 by 720 in Japanese and 1280 by 1440 stacked, with
 * the original's sound. The Japanese comes from the transcreate runs' whole-video checkpoints of 2026-10-27: How Do
 * You Genie g27, Agent Memory g16 (its final), Teach AI g13 (its final) and Databricks g25, the newest of a run still
 * in progress.
 */
export const DATABRICKS: readonly DatabricksVideo[] = [
  { slug: 'databricks-how-do-you-genie', frames: 4781, fps: 60000 / 1001, name: 'How Do You Genie', seconds: 80 },
  { slug: 'databricks-agent-memory', frames: 2401, fps: 30, name: 'Agent Memory', seconds: 80 },
  { slug: 'databricks-teach-ai', frames: 3134, fps: 25, name: 'Teach AI', seconds: 125 },
  { slug: 'databricks-full', frames: 2403, fps: 30, name: 'Databricks', seconds: 80, inProgress: true },
];

/** The grid of the four Databricks videos as columns, English on top: 2560 by 720, 125 seconds, no sound. A shorter video holds its last frame. */
export const DATABRICKS_GRID = { file: 'databricks-grid', width: 2560, height: 720, seconds: 125 } as const;

/** Ramp Procurement: one Ramp video with no sound, each version 1280 by 1280, 15 seconds at 60 fps. */
export const RAMP = { slug: 'ramp-procurement', name: 'Ramp Procurement', owner: 'Ramp', seconds: 15, panel: 1280, frames: 923, fps: 60 } as const;

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
export const OWNERS: readonly string[] = [
  ...new Set([PROFOUND.owner, ...VIDEOS.map((video) => video.owner), DATABRICKS_OWNER, RAMP.owner]),
];

/** Every video on the pages: Introducing Profound, the eight, the four Databricks videos and Ramp Procurement. */
export const VIDEO_COUNT = 1 + VIDEOS.length + DATABRICKS.length + 1;

/** Every film the compare viewer opens, by its slug: the featured film, the eight, the four Databricks videos and the two Ramp translations. */
export const PAIR_FILMS: readonly PairFilm[] = [
  PROFOUND,
  ...VIDEOS.map((video) => ({
    slug: video.slug,
    name: video.name,
    file: `${video.slug}-stacked`,
    language: 'Japanese' as const,
    panel: { width: PANEL_WIDTH, height: video.panelHeight },
    frames: video.frames,
    fps: video.fps,
    sound: 'original' as const,
    back: `/transcreate/videos#video-${video.slug}`,
  })),
  ...DATABRICKS.map((video) => ({
    slug: video.slug,
    name: video.name,
    file: `${video.slug}-stacked`,
    language: 'Japanese' as const,
    panel: { width: PANEL_WIDTH, height: 720 },
    frames: video.frames,
    fps: video.fps,
    sound: 'original' as const,
    back: `/transcreate/databricks#video-${video.slug}`,
  })),
  ...RAMP_VERSIONS.filter((version) => version.translation).map((version) => ({
    slug: `${RAMP.slug}-${version.key}`,
    name: RAMP.name,
    file: `${RAMP.slug}-${version.key}-stacked`,
    language: version.language as 'Japanese' | 'Spanish',
    panel: { width: RAMP.panel, height: RAMP.panel },
    frames: RAMP.frames,
    fps: RAMP.fps,
    sound: 'none' as const,
    back: `/transcreate/ramp#video-${RAMP.slug}-${version.key}`,
  })),
];

export function pairFilm(slug: string): PairFilm | undefined {
  return PAIR_FILMS.find((film) => film.slug === slug);
}

/** The compare viewer's address for a film. */
export function pairPath(slug: string): string {
  return `/transcreate/view/${slug}`;
}
