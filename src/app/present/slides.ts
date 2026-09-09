import type { ShellSection } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';

/**
 * The seven slides of the presenter and what the shell shows for them.
 *
 * `jump` is the extra stage heights to land past a slide's top when the
 * shell selects it. Pinned slides scrub their content in from scroll
 * progress 0, so landing exactly on the top shows an empty stage; the offset
 * drops you on the slide's first fully revealed beat instead. `subs` are the
 * beats inside a pinned slide, each positioned as a fraction of the slide's
 * pin length (matching where that beat sits in the scrubbed timeline), so
 * the sidebar rows and their jumps stay accurate at any stage size.
 */
export type SlideSub = { label: string; f: number };

export type PresenterSlide = {
  id: string;
  /** the section label in the sidebar: the slide's short name */
  label: string;
  /** the item title under the thumbnail: what the slide says */
  title: string;
  jump: number;
  subs?: readonly SlideSub[];
};

export const SLIDES: readonly PresenterSlide[] = [
  { id: 'intro', label: 'Intro', title: 'The website redesign', jump: 0 },
  {
    id: 'why',
    label: 'Why',
    title: 'Three reasons to redesign',
    jump: 0.6,
    subs: [
      { label: 'Why?', f: 0.06 },
      { label: 'Three reasons', f: 0.35 },
    ],
  },
  {
    id: 'need',
    label: 'What we need',
    title: 'First principles for the new site',
    jump: 0.35,
    subs: [
      { label: 'First principles', f: 0.02 },
      { label: 'A barbell audience', f: 0.13 },
      { label: 'Show, do not define', f: 0.38 },
      { label: 'End to end', f: 0.62 },
      { label: 'Context Groups', f: 0.86 },
    ],
  },
  {
    id: 'craft',
    label: 'How',
    title: 'How the identity was built',
    jump: 0.3,
    subs: [
      { label: 'Guidelines', f: 0.02 },
      { label: 'Sketches', f: 0.17 },
      { label: 'Color', f: 0.42 },
      { label: 'Type', f: 0.66 },
      { label: 'Motion', f: 0.9 },
    ],
  },
  {
    id: 'detail',
    label: 'Details',
    title: 'Two builds of Inter',
    /* far enough in for the headline and the two specimens to have landed */
    jump: 0.6,
    subs: [
      { label: 'Two Inters', f: 0.02 },
      { label: 'The overlay', f: 0.5 },
      { label: 'General Translation', f: 0.67 },
      { label: 'So I built 12', f: 0.87 },
    ],
  },
  /* 0.3 stage heights past the top: the frame has finished growing (that
     transition ends at the top) and the dwell is still in its deadzone, so
     the embedded page shows its own top */
  { id: 'prototypes', label: 'Prototypes', title: 'The live prototypes', jump: 0.3 },
  { id: 'scoreboard', label: 'Verdict', title: 'The verdict', jump: 0 },
];

export const SLIDE_COUNT = SLIDES.length;

/** Position of the live prototypes slide; its sidebar rows are the directions. */
export const PROTOTYPES_INDEX = SLIDES.findIndex((slide) => slide.id === 'prototypes');

/** The sidebar head and the toolbar brand. */
export const PRESENT_TITLE = 'Presenter';

/** The capture the sidebar and the grid show for a slide. */
export function presentShot(id: string): string {
  return `/shots/thumb/present-${id}.jpg`;
}

/** The slide's position, or -1 for an id that is not a slide. */
export function slideIndex(id: string): number {
  return SLIDES.findIndex((slide) => slide.id === id);
}

/** One section per slide: the label, then the slide itself as the one item. */
export const PRESENT_SECTIONS: readonly ShellSection[] = SLIDES.map((slide, i) => ({
  id: slide.id,
  label: slide.label,
  items: [
    {
      id: slide.id,
      n: pad2(i + 1),
      title: slide.title,
      shot: { light: presentShot(slide.id) },
    },
  ],
}));
