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
    desc: 'The company name, the GT short form, and Locadex.',
    headings: [],
  },
  {
    id: 'the-idea',
    title: 'The idea',
    desc: 'Every product in every language: the mission and the positioning.',
    headings: [],
  },
  {
    id: 'the-character',
    title: 'The character',
    desc: 'The personality, the voice, and the attribute scales.',
    headings: [
      heading('the-character', 'personality', 'Personality'),
      heading('the-character', 'aesthetic', 'Aesthetic'),
      heading('the-character', 'voice', 'Voice'),
    ],
  },
  {
    id: 'the-mark',
    title: 'The mark',
    desc: 'The GT monogram: doubled-line construction, one ink, and the rules for its use.',
    headings: [],
  },
  {
    id: 'color',
    title: 'Color',
    desc: 'Four absolute colors, alpha steps for structure, one spectral accent per page.',
    headings: [],
  },
  {
    id: 'type',
    title: 'Type',
    desc: 'Switzer and Inter, and the multilingual requirements for headlines and UI.',
    headings: [],
  },
  {
    id: 'language-as-material',
    title: 'Language as material',
    desc: 'Glyphs as the signature device: the reassembler, the locale chips, and the flag prints.',
    headings: [],
  },
  {
    id: 'the-completed-reference',
    title: 'The completed reference',
    desc: 'The Dossier as the finished application of the system.',
    headings: [],
  },
  {
    id: 'made-with-the-system',
    title: 'Made with the system',
    desc: 'Finished artwork produced with the toolchain and the glyphfield studio.',
    headings: [],
  },
  {
    id: 'context-for-partners',
    title: 'Context for partners',
    desc: 'The industry, the audience, and the visual references for partners.',
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

/** The shell's list: one section, Sections, with the ten sections as items (Brand / Sections / 10 sections, parallel to Docs / Documents). */
export const BRAND_SHELL_SECTIONS: readonly ShellSection[] = [
  {
    id: 'brand-book',
    label: 'Sections',
    items: BRAND_SECTIONS.map((section, i) => ({
      id: section.id,
      n: pad2(i + 1),
      title: section.title,
      desc: section.desc,
      href: `/brand#${section.id}`,
      shot: brandShot(section.id),
    })),
  },
];
