import type { ShellItem, ShellSection } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';

/**
 * The deck's shape as data: the eight sections by their first slide, and the
 * helpers that turn the built slide markup into the shell's sections. Pure
 * string work, so the server page can call it and hand the result to the
 * client viewer.
 */
export const SLIDE_COUNT = 52;

/** The longest a slide title gets in the list and the book. */
export const TITLE_MAX = 72;

export type DeckSectionStart = {
  /** 1-based number of the section's first slide */
  start: number;
  label: string;
};

export const DECK_SECTIONS: readonly DeckSectionStart[] = [
  { start: 1, label: 'Brand' },
  { start: 13, label: 'Design system' },
  { start: 25, label: 'Website' },
  { start: 34, label: 'Documentation' },
  { start: 36, label: 'Blog and content' },
  { start: 43, label: 'Developer experience' },
  { start: 44, label: 'Prototemplate and glyphfield' },
  { start: 49, label: 'Status and plan' },
];

/** The item id the hash carries: the slide number, `#12`. */
export function slideId(n: number): string {
  return String(n);
}

const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

function textOf(markup: string): string {
  return markup
    .replace(/<[^>]+>/g, '')
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity] ?? entity)
    .replace(/\s+/g, ' ')
    .trim();
}

/** Cut at TITLE_MAX on a word boundary, the way the deck viewer did. */
function cut(title: string): string {
  if (title.length <= TITLE_MAX) return title;
  return `${title.slice(0, TITLE_MAX - 3).replace(/\s+\S*$/, '')}...`;
}

const TITLE_SOURCE = /<(h1|h2)\b[^>]*>([\s\S]*?)<\/\1>|<(\w+)\b[^>]*class="[^"]*\bbig\b[^"]*"[^>]*>([\s\S]*?)<\/\3>/;

/**
 * One title per slide from the built markup: the first h1, h2 or .big in
 * each section, or `Slide 12` when a slide has none. Scoped style blocks are
 * skipped so a selector never reads as a heading.
 */
export function slideTitles(html: string): readonly string[] {
  const chunks = html.split(/<section class="slide\b/).slice(1);
  return chunks.map((chunk, i) => {
    const body = chunk.replace(/<style>[\s\S]*?<\/style>/g, '');
    const match = TITLE_SOURCE.exec(body);
    const text = match ? textOf(match[2] ?? match[4] ?? '') : '';
    return cut(text || `Slide ${i + 1}`);
  });
}

function sectionSlug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** The shell's sections: every slide as an item under its section label. */
export function deckSections(titles: readonly string[]): readonly ShellSection[] {
  return DECK_SECTIONS.map((section, i) => {
    const next = DECK_SECTIONS[i + 1];
    const end = next ? next.start - 1 : titles.length;
    const items: ShellItem[] = [];
    for (let n = section.start; n <= end; n += 1) {
      items.push({ id: slideId(n), n: pad2(n), title: titles[n - 1] ?? `Slide ${n}` });
    }
    return { id: sectionSlug(section.label), label: section.label, items };
  });
}
