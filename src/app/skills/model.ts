import type { ShellSection } from '@/lib/shell-data';
import { SKILL_CATEGORIES, SKILL_GROUPS, SKILLS, getSkill, skillHref } from '@/lib/skills';
import type { Skill, SkillCategory, SkillSource } from '@/lib/skills';

/**
 * The shapes the two skills routes share: the index (/skills, SkillsViewer)
 * and the page (/skills/[slug], SkillViewer) list the same skills in the
 * same order, number them the same way and feed the shell the same
 * sections. Pure data and URL helpers on top of the generated
 * src/lib/skills.ts, so both client viewers and the server page import one
 * set of names.
 */

/** `7` becomes `007`: three digits, since the list runs past a hundred. */
export function pad3(n: number): string {
  return String(n).padStart(3, '0');
}

/** One skill with its place in the whole list, 1-based. */
export type Numbered = { skill: Skill; n: string; pos: number };

/** One category as the index shows it: its rows and the range they cover. */
export type Block = {
  category: SkillCategory;
  label: string;
  ordinal: number;
  rows: readonly Numbered[];
};

/* SKILLS is sorted by category in SKILL_CATEGORIES order, then by name, so
   the position in the whole list is the array index plus one */
export const NUMBERED: readonly Numbered[] = SKILLS.map((skill, i) => ({ skill, n: pad3(i + 1), pos: i + 1 }));

const NUMBERED_BY_SLUG: ReadonlyMap<string, Numbered> = new Map(NUMBERED.map((row) => [row.skill.id, row]));

export const BLOCKS: readonly Block[] = SKILL_CATEGORIES.map((category, i) => ({
  category: category.id,
  label: category.label,
  ordinal: i + 1,
  rows: NUMBERED.filter((row) => row.skill.category === category.id),
})).filter((block) => block.rows.length > 0);

/**
 * The categories as the shell's sections, one item per skill with the
 * address of its page, nested under the Knowledge group's Skills row
 * (`under`), so the sidebar shows them beneath the page they belong to on
 * every route that carries them. The description feeds the sidebar filter.
 */
export const SECTIONS: readonly ShellSection[] = SKILL_GROUPS.map((group) => ({
  id: group.id,
  label: group.label,
  under: 'skills',
  items: group.skills.map((entry) => ({
    id: entry.slug,
    n: NUMBERED_BY_SLUG.get(entry.slug)?.n,
    title: entry.name,
    href: entry.href,
    desc: getSkill(entry.slug)?.description,
  })),
}));

/** The category label for an id. */
export function categoryLabel(category: SkillCategory): string {
  return SKILL_CATEGORIES.find((entry) => entry.id === category)?.label ?? category;
}

/** The skill's padded position in the whole list. */
export function skillNumber(slug: string): string {
  return NUMBERED_BY_SLUG.get(slug)?.n ?? '';
}

/** The repository the SKILL.md lives in, short enough for the head's meta column. */
export function sourceLabel(source: SkillSource): string {
  return source === 'wiki' ? 'Kevin wiki' : 'gt-cloud';
}

/** The raw body file the page's toolbar opens. */
export function skillRawHref(slug: string): string {
  return `${skillHref(slug)}.md`;
}

/** The window title for a skill page: `accessibility, Prototemplate skills`. */
export function skillWindowTitle(name: string): string {
  return `${name}, Prototemplate skills`;
}

/** A neighbour in the same category: the name and the address of its page. */
export type Neighbour = { slug: string; name: string; href: string };

/** The skills before and after one in its category, in list order; null at either end. */
export function neighbours(slug: string): { prev: Neighbour | null; next: Neighbour | null } {
  const skill = getSkill(slug);
  const group = skill ? SKILL_GROUPS.find((entry) => entry.id === skill.category) : undefined;
  if (!group) return { prev: null, next: null };
  const at = group.skills.findIndex((entry) => entry.slug === slug);
  return { prev: group.skills[at - 1] ?? null, next: group.skills[at + 1] ?? null };
}
