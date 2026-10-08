import type { ShellSection, ShellShot } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';

/**
 * The brand book's shape as data: the ten sections in reading order, each
 * with the h3 headings inside it, and the helpers that turn them into the
 * shell's section list. Pure data, so the server page and the client viewer
 * read the same source. Section ids are the anchors the article has always
 * had (`/brand#the-mark`); heading ids are the section id plus the heading
 * slug, so a heading link never collides with a section link.
 */
export type BrandHeading = {
  /** the DOM id of the h3 and the ListRow item id */
  id: string;
  title: string;
};

export type BrandSectionDef = {
  /** the DOM id of the section and the shell item id */
  id: string;
  title: string;
  /** one sentence for the grid card and the index panel */
  desc: string;
  /** the second line of the section's gutter note: where its text comes from (105px or less at 13px) */
  source: string;
  headings: readonly BrandHeading[];
};

/** `the-character` plus `voice` becomes `the-character-voice`. */
export function headingId(sectionId: string, slug: string): string {
  return `${sectionId}-${slug}`;
}

function heading(sectionId: string, slug: string, title: string): BrandHeading {
  return { id: headingId(sectionId, slug), title };
}

export const BRAND_SECTIONS: readonly BrandSectionDef[] = [
  {
    id: 'the-name',
    title: 'The name',
    desc: 'The company name, its short form, and Locadex.',
    source: 'BRAND.md part 1',
    headings: [],
  },
  {
    id: 'the-idea',
    title: 'The idea',
    desc: 'Every product in every language: the mission and the positioning.',
    source: 'BRAND.md part 2',
    headings: [],
  },
  {
    id: 'the-character',
    title: 'The character',
    desc: 'The personality, the voice, and the attribute scales.',
    source: 'BRAND.md part 3',
    headings: [
      heading('the-character', 'personality', 'Personality'),
      heading('the-character', 'aesthetic', 'Aesthetic'),
      heading('the-character', 'voice', 'Voice'),
    ],
  },
  {
    id: 'the-mark',
    title: 'The mark',
    desc: 'The monogram: doubled-line construction, one ink, and the rules for its use.',
    source: 'BRAND.md part 4',
    headings: [],
  },
  {
    id: 'color',
    title: 'Color',
    desc: 'Four absolute colors, alpha steps for structure, one spectral accent per page.',
    source: 'BRAND.md part 5',
    headings: [],
  },
  {
    id: 'type',
    title: 'Type',
    desc: 'Inter as the one typeface, the weight cap, and the multilingual requirements for headlines and UI.',
    source: 'BRAND.md part 6',
    headings: [],
  },
  {
    id: 'language-as-material',
    title: 'Language as material',
    desc: 'Glyphs as the signature device: the reassembler, the locale chips, and the flag prints.',
    source: 'BRAND.md part 7',
    headings: [],
  },
  {
    /* the anchor keeps its first name so links and the section captures still resolve */
    id: 'the-completed-reference',
    title: 'Where it ships',
    desc: 'Where the identity ships today: the site, the product surfaces, the films and the marks.',
    source: 'BRAND.md part 8',
    headings: [],
  },
  {
    id: 'made-with-the-system',
    title: 'Made with the system',
    desc: 'Finished artwork made with the system: the Open Source reel, the X banner, two blog films and three partnership globes.',
    source: 'Finished artwork',
    headings: [
      heading('made-with-the-system', 'blog-films', 'Blog films'),
      heading('made-with-the-system', 'partnership-globes', 'Partnership globes'),
    ],
  },
  {
    id: 'context-for-partners',
    title: 'Context for partners',
    desc: 'The industry, the audience, and the visual references for partners.',
    source: 'BRAND.md part 9',
    headings: [
      heading('context-for-partners', 'direction', 'Direction'),
      heading('context-for-partners', 'references', 'References'),
      heading('context-for-partners', 'admired', 'Admired'),
      heading('context-for-partners', 'avoid', 'Avoid'),
    ],
  },
];

export const BRAND_COUNT = BRAND_SECTIONS.length;

/** The h3 rows under a section, or none. */
export function headingsOf(sectionId: string): readonly BrandHeading[] {
  return BRAND_SECTIONS.find((section) => section.id === sectionId)?.headings ?? [];
}

/**
 * The section captures: public/shots/thumb/brand-<id>.jpg in light and
 * brand-<id>-dark.jpg in dark, each a 16:9 crop from the section's top,
 * shot by the capture pass against the running route.
 */
export function brandShot(sectionId: string): ShellShot {
  return {
    light: `/shots/thumb/brand-${sectionId}.jpg`,
    dark: `/shots/thumb/brand-${sectionId}-dark.jpg`,
  };
}

/**
 * The shell's list: one section, Sections, with the ten sections as items.
 * It opens as the run under Pages > Brand in the sidebar (`under`); the
 * grid keeps the label.
 */
export const BRAND_SHELL_SECTIONS: readonly ShellSection[] = [
  {
    id: 'brand-book',
    label: 'Sections',
    under: 'brand',
    items: BRAND_SECTIONS.map((section, i) => ({
      id: section.id,
      n: pad2(i + 1),
      title: section.title,
      desc: section.desc,
      href: `/brand#${section.id}`,
      shot: brandShot(section.id),
      /* the surfaces.ts id, for the preview layer */
      surface: `brand-${section.id}`,
    })),
  },
];
