import type { PicturePlacement } from '@/components/plate/lib/picture-field';

/**
 * The pictures the scene 1 field can show: the Blue Marble and the
 * Rosetta Stone, whose subject is what the product does, and five
 * pictures of human writing across cultures (Karahisari's calligraphy, a
 * proto-cuneiform tablet, the Oxford English Dictionary open at its own
 * entry for the word, Johnson's Dictionary of 1755 at its grammar's
 * letter O, and a marginal gloss of about 1500, the step before any
 * dictionary), so the set carries language and culture without repeating
 * the two. The last two come from the University of Glasgow Library's
 * April 2007 Book of the Month on Johnson's Dictionary, which Kevin
 * named as more significant than a photograph of the volumes.
 */
export type PictureName =
  | 'earth'
  | 'rosetta'
  | 'calligraphy'
  | 'tablet'
  | 'dictionary'
  | 'johnson'
  | 'gloss';

/**
 * A placement without the canvas point and diameter a disc is fit to or
 * the frame a region is fit inside: all depend on the viewport, so the
 * field adds them at render time. The conditional distributes Omit over
 * the placement union; a plain Omit would keep only the union's shared
 * key.
 */
export type MoodPlacement = PicturePlacement extends infer P
  ? P extends PicturePlacement
    ? Omit<P, 'frame' | 'centre' | 'diameter'>
    : never
  : never;

/**
 * The plate for a picture: its name, why it is in the set, and the credit
 * line. The field prints it in its lower right corner.
 */
export type MoodCaption = { title: string; note: string; credit: string };

/**
 * The most characters a plate note may run to: the card's note column is
 * 208px at 11px, three lines of about 32 characters, and a note is one
 * factual sentence about the picture, never a line about the company.
 */
export const NOTE_MAX_CHARS = 90;

export type MoodPicture = {
  src: string;
  placement: MoodPlacement;
  caption: MoodCaption;
};

/**
 * Each picture's file under public/ and where it lands. The files are the
 * tone grids apps/dashboard/scripts/mood-tone.mjs cuts from the source
 * photographs, 8-bit gray JPEGs at 1600 by 900, the earth at 2400 by 1350
 * because the field draws it at about 2x; the field screens them itself
 * at one CSS px per cell. Placements are in the 1600 by 900 file space.
 * The earth's disc is fitted to the limb on its grid and is the only disc:
 * the field puts its left limb five sevenths of the way along the ramp,
 * inside the ramp's last part, at 1.7 times the stack's height across, so
 * the ramp thins the limb and the rest bleeds off the top, right and
 * bottom (FieldStack DISC_LIMB_RAMP_SHARE). The other pictures cover the
 * field. The Rosetta Stone sits
 * right in its file with its right edge past the file's, so its cover is
 * pinned to the file's left edge (focus 0): the black pad on the left
 * sits under the plate and the region right of the ramp is inscription.
 * The tablet fills its file and is centred, so the crack and the right
 * piece's impressions sit right of the ramp. The calligraphy keeps its
 * focus on the side the plate leaves open, so the tall strokes stay in
 * view. The dictionary is a close crop of the OED's page whose cover is
 * pinned to the file's right edge (focus 1), so the headword always ends
 * inside the viewport and starts in the ramp's last part, whole at every
 * width, with the neighbouring column dissolving under the ramp
 * (mood-tone.mjs works the numbers). The
 * plate titles are the deck's in title case (Kevin: "Proto-Cuneiform
 * Tablet"), the credits the deck's; each note is one factual sentence
 * about the picture within NOTE_MAX_CHARS, so it holds two lines on the
 * plate.
 */
export const MOOD_PICTURES: Record<PictureName, MoodPicture> = {
  earth: {
    src: '/brand/mood/mood-earth.jpg',
    placement: { kind: 'disc', cx: 450.1, cy: 450.1, r: 398.2 },
    caption: {
      title: 'The Blue Marble',
      note: "NASA's composite of the western hemisphere, assembled from satellite passes in 2007.",
      credit: 'Image: NASA, Reto Stöckli, 2007, public domain',
    },
  },
  rosetta: {
    src: '/brand/mood/mood-rosetta.jpg',
    placement: { kind: 'cover', focusX: 0, focusY: 0.5 },
    caption: {
      title: 'The Rosetta Stone',
      note: 'A decree of 196 BCE carved three times, in hieroglyphic, Demotic and Greek.',
      credit: 'Photograph: Hans Hillewaert, CC BY-SA 4.0',
    },
  },
  calligraphy: {
    src: '/brand/mood/mood-calligraphy.jpg',
    placement: { kind: 'cover', focusX: 0.6, focusY: 0.5 },
    caption: {
      title: "Karahisari's Calligraphy",
      note: 'A sixteenth-century practice sheet where the letterforms are the whole design.',
      credit: 'Calligraphy: Ahmed Karahisari, 16th century, public domain',
    },
  },
  tablet: {
    src: '/brand/mood/mood-tablet.jpg',
    placement: { kind: 'cover', focusX: 0.5, focusY: 0.5 },
    caption: {
      title: 'Proto-Cuneiform Tablet',
      note: 'Malt and barley accounted for in clay in Sumer about 3100 BCE, among the earliest writing.',
      credit: 'Photograph: The Metropolitan Museum of Art, public domain',
    },
  },
  dictionary: {
    src: '/brand/mood/mood-dictionary.jpg',
    placement: { kind: 'cover', focusX: 1, focusY: 0.5 },
    caption: {
      title: 'The Oxford English Dictionary',
      note: "The entry for dictionary in the first edition's third volume, printed at Oxford in 1897.",
      credit:
        'Oxford University Press, 1897, scanned by the Internet Archive, public domain',
    },
  },
  johnson: {
    src: '/brand/mood/mood-johnson.jpg',
    placement: { kind: 'cover', focusX: 1, focusY: 0.1 },
    caption: {
      title: "Johnson's Dictionary",
      note: 'The letter O from the grammar in A Dictionary of the English Language, London, 1755.',
      credit:
        'Samuel Johnson, 1755, scanned by the Wellcome Collection, public domain',
    },
  },
  gloss: {
    src: '/brand/mood/mood-gloss.jpg',
    placement: { kind: 'cover', focusX: 1, focusY: 0.5 },
    caption: {
      title: 'A Marginal Gloss',
      note: 'Glosses beside and between the lines of an Alexandreis copied in France about 1250.',
      credit:
        'MS f Med. 23, Boston Public Library, public domain',
    },
  },
};
