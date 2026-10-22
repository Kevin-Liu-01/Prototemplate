import { MOOD_PICTURES, type PictureName } from '@/components/plate/brand/moodPictures';
import type { PictureFrame, PicturePlacement } from '@/components/plate/lib/picture-field';

import deckManifest from '../../../../../deck/shots/tone/manifest.json';
import plateManifest from '../../../../../public/brand/mood/manifest.json';

/**
 * The artifact pictures the plates on /docs/components/artifact-pictures
 * screen: the plate set (public/brand/mood, the onboarding field) and the
 * deck set (deck/shots/tone, the mood slides). Every grid and its size and
 * kind come from the set's manifest, so a recut reaches the plates
 * without an edit here. The deck's grids are served from
 * public/deck-assets under the name pnpm build:deck gives them,
 * mood-{name}.{the first 8 hex of the grid's sha256}.jpg.
 *
 * The plate set's titles and credits are its registry's (moodPictures.ts).
 * The deck set's are the deck's mood slides' (deck/slides/NN-mood-*.html),
 * which hold the credit next to the canvas; DECK_CAPTIONS repeats them,
 * because a slide is HTML and cannot be imported.
 */

export type MoodSet = 'plate' | 'deck';
export type MoodKind = 'scene' | 'marks';

export type MoodEntry = {
  /** `{set}-{name}`, unique across both sets */
  key: string;
  name: string;
  set: MoodSet;
  title: string;
  credit: string;
  /** the tone grid as a root path */
  src: string;
  /** the grid's pixel size */
  width: number;
  height: number;
  kind: MoodKind;
  /** where the grid lands on a canvas: cover at a focus, or the fitted disc */
  focusX: number;
  focusY: number;
  disc?: { cx: number; cy: number; r: number };
};

/** The deck slides' titles and credit lines, in slide order. */
const DECK_CAPTIONS: Record<string, { title: string; credit: string }> = {
  earth: { title: 'The Blue Marble', credit: 'Image: NASA, Reto Stöckli, 2007, public domain' },
  rosetta: { title: 'The Rosetta Stone', credit: 'Photograph: Hans Hillewaert, CC BY-SA 4.0' },
  tablet: {
    title: 'A proto-cuneiform tablet',
    credit: 'Photograph: The Metropolitan Museum of Art, Open Access, public domain',
  },
  calligraphy: { title: "Karahisari's calligraphy", credit: 'Calligraphy: Ahmed Karahisari, 16th century, public domain' },
  lighthouse: { title: 'Louisbourg lighthouse', credit: 'Photograph: Ken Heaton, CC BY-SA 4.0' },
  devanagari: { title: 'A Devanagari manuscript', credit: 'Photograph: Ms Sarah Welch, CC BY-SA 4.0' },
  gloss: { title: 'A marginal gloss', credit: 'Image: MS f Med. 23, Boston Public Library, public domain' },
  cable: { title: 'The Eastern Telegraph cable chart', credit: 'Map: Eastern Telegraph Company, 1901, public domain' },
  wave: { title: 'The Great Wave off Kanagawa', credit: 'Print: Katsushika Hokusai, about 1831, public domain' },
  compass: { title: "Bowen's compass rose", credit: 'Engraving: Emanuel Bowen, 1748, public domain' },
};

function kindOf(kind: string): MoodKind {
  return kind === 'marks' ? 'marks' : 'scene';
}

const PLATE: MoodEntry[] = plateManifest.pictures.flatMap((pic) => {
  const entry = MOOD_PICTURES[pic.name as PictureName];
  if (!entry) return [];
  const placement = entry.placement;
  return [
    {
      key: `plate-${pic.name}`,
      name: pic.name,
      set: 'plate' as const,
      title: entry.caption.title,
      credit: entry.caption.credit,
      src: entry.src,
      width: pic.width,
      height: pic.height,
      kind: kindOf(pic.kind),
      focusX: placement.kind === 'cover' ? placement.focusX : 0.5,
      focusY: placement.kind === 'cover' ? placement.focusY : 0.5,
      disc: placement.kind === 'disc' ? { cx: placement.cx, cy: placement.cy, r: placement.r } : undefined,
    },
  ];
});

const DECK: MoodEntry[] = deckManifest.pictures.flatMap((pic) => {
  const caption = DECK_CAPTIONS[pic.name];
  if (!caption) return [];
  return [
    {
      key: `deck-${pic.name}`,
      name: pic.name,
      set: 'deck' as const,
      title: caption.title,
      credit: caption.credit,
      src: `/deck-assets/mood-${pic.name}.${pic.sha256.slice(0, 8)}.jpg`,
      width: pic.width,
      height: pic.height,
      kind: kindOf(pic.kind),
      focusX: 0.5,
      focusY: 0.5,
    },
  ];
});

export const MOOD_ENTRIES: Record<MoodSet, readonly MoodEntry[]> = { plate: PLATE, deck: DECK };

/** The picture's name as a control label: `devanagari` reads Devanagari. */
export function nameLabel(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** The file space every placement is stated in (picture-field.ts): 1600 by 900. */
const FILE_W = 1600;
const FILE_H = 900;

/**
 * Where the picture's 1600 by 900 file space lands on a box of `w` by `h`
 * CSS px: covered at the entry's focus, or, for the plate's earth, the
 * fitted disc at `discShare` of the box's short side, centred. The rect
 * places the gray grid under the screen at the same framing, and
 * `placementOf` hands picture-field.ts the same fit.
 */
export function fileRect(entry: MoodEntry, w: number, h: number, discShare = 0.92): PictureFrame {
  if (entry.disc) {
    const scale = (Math.min(w, h) * discShare) / (2 * entry.disc.r);
    return {
      left: w / 2 - entry.disc.cx * scale,
      top: h / 2 - entry.disc.cy * scale,
      width: FILE_W * scale,
      height: FILE_H * scale,
    };
  }
  const scale = Math.max(w / FILE_W, h / FILE_H);
  return {
    left: (w - FILE_W * scale) * entry.focusX,
    top: (h - FILE_H * scale) * entry.focusY,
    width: FILE_W * scale,
    height: FILE_H * scale,
  };
}

export function placementOf(entry: MoodEntry, w: number, h: number, discShare = 0.92): PicturePlacement {
  if (entry.disc) {
    return {
      kind: 'disc',
      ...entry.disc,
      centre: { x: w / 2, y: h / 2 },
      diameter: Math.min(w, h) * discShare,
    };
  }
  return { kind: 'cover', focusX: entry.focusX, focusY: entry.focusY };
}

/**
 * The screen's two themes from scripts/media/mood-tone/standard.json: a lit
 * cell is the ink at the opacity over the ground. Written as rgb() so the
 * canvas engine and the stylesheet read the same values.
 */
export const MOOD_THEMES = {
  dark: { ink: 'rgb(255, 255, 255)', ground: 'rgb(7, 7, 7)', opacity: 0.62 },
  light: { ink: 'rgb(7, 7, 7)', ground: 'rgb(255, 255, 255)', opacity: 0.7 },
} as const;

export type MoodTheme = keyof typeof MOOD_THEMES;
