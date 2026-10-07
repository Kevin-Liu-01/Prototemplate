import { PAGE_NAMES } from '@/lib/page-names';
import type { ShellSection } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';
import { SKILL_AREAS, SKILLS, skillFileHref, skillHref } from '@/lib/skills';
import type { Skill, SkillArea } from '@/lib/skills';

/**
 * The shapes the skills routes share: the index (/skills, SkillsViewer)
 * and the page (/skills/[slug], SkillViewer) list the same skills in the
 * same order, number them the same way and feed the shell the same run.
 * Pure data and string helpers on top of the generated src/lib/skills.ts,
 * so both client viewers, the server pages and the raw-file routes import
 * one set of names.
 */

/** One skill with its place in the whole set, 1-based, and its number padded to two digits. */
export type Numbered = { skill: Skill; n: string; pos: number };

/** One area as the index shows it: its rows and the range they cover. */
export type Block = {
  area: SkillArea;
  label: string;
  ordinal: number;
  rows: readonly Numbered[];
};

/* SKILLS is sorted by area, then by the reading order inside it, so the
   position in the whole set is the array index plus one */
export const NUMBERED: readonly Numbered[] = SKILLS.map((skill, i) => ({ skill, n: pad2(i + 1), pos: i + 1 }));

const NUMBERED_BY_SLUG: ReadonlyMap<string, Numbered> = new Map(NUMBERED.map((row) => [row.skill.id, row]));

/** The label of an area id. */
export function areaLabel(area: SkillArea): string {
  return SKILL_AREAS.find((entry) => entry.id === area)?.label ?? area;
}

/** Every area a skill is filed under, by label: `Motion, Landing pages, Films, Diagrams`. */
export function areaList(skill: Skill): string {
  return skill.areas.map(areaLabel).join(', ');
}

/** The areas that hold at least one skill, each with its rows. */
export const BLOCKS: readonly Block[] = SKILL_AREAS.map((area) => ({
  area: area.id,
  label: area.label,
  rows: NUMBERED.filter((row) => row.skill.areas[0] === area.id),
}))
  .filter((block) => block.rows.length > 0)
  .map((block, i) => ({ ...block, ordinal: i + 1 }));

/**
 * The sidebar names of the titles that would run to three lines in the
 * 208px run (ShellItem.short); the title stays the grid caption, the
 * preview title, the filter text and the row's hover title.
 */
const SHORT: Readonly<Record<string, string>> = {
  'gt-orchestration': 'Agent fleets and long runs',
};

/**
 * The whole set as one run under the Knowledge group's Skills row
 * (`under`): every skill numbered 01 onward in area order, with its full
 * title, each row a link to its page. One run instead of a group per area,
 * since most areas hold one or two skills. The description carries the
 * areas first, so the sidebar filter matches a skill by its area as well as
 * by its words.
 */
export const SECTIONS: readonly ShellSection[] = [
  {
    id: 'skill-set',
    label: 'Skills',
    under: 'skills',
    items: NUMBERED.map(({ skill, n }) => ({
      id: skill.id,
      n,
      title: skill.title,
      short: SHORT[skill.id],
      href: skillHref(skill.id),
      desc: `${areaList(skill)}. ${skill.description}`,
    })),
  },
];

/** The skill's padded position in the whole set. */
export function skillNumber(slug: string): string {
  return NUMBERED_BY_SLUG.get(slug)?.n ?? '';
}

/** The raw SKILL.md the page's toolbar opens. */
export function skillRawHref(slug: string): string {
  return skillFileHref(slug, 'SKILL.md');
}

/** The window title for a skill page, written whole: `Voice and the humanizer, Skills, Prototemplate`. */
export function skillWindowTitle(title: string): string {
  return `${title}, ${PAGE_NAMES.skills.name}, Prototemplate`;
}

/** A neighbour in the whole set: the title and the address of its page. */
export type Neighbour = { slug: string; title: string; href: string };

/** The skills before and after one in the whole set, in reading order; null at either end. */
export function neighbours(slug: string): { prev: Neighbour | null; next: Neighbour | null } {
  const at = SKILLS.findIndex((skill) => skill.id === slug);
  if (at < 0) return { prev: null, next: null };
  const near = (skill: Skill | undefined): Neighbour | null =>
    skill ? { slug: skill.id, title: skill.title, href: skillHref(skill.id) } : null;
  return { prev: near(SKILLS[at - 1]), next: near(SKILLS[at + 1]) };
}

/** The installer, run from a Prototemplate checkout. */
export const INSTALLER = 'scripts/install-skills.mjs';

/** The command that links one skill into a project: `node scripts/install-skills.mjs gt-voice --project <dir>`. */
export function installLine(slug?: string): string {
  return slug ? `node ${INSTALLER} ${slug} --project <dir>` : `node ${INSTALLER} --project <dir>`;
}

/** A description in its three parts, for the heads and the rows. */
export type DescriptionParts = {
  /** what the skill is, as one short sentence: the first sentence up to its colon */
  summary: string;
  /** what it covers: the rest of the text before the sentence that says when to use it, its first letter raised; null when there is none */
  covers: string | null;
  /** when to use it: the sentence that opens with `Use when` (or before, after, for) and what follows */
  use: string | null;
};

const USE_AT = /\bUse (?:when|before|after|for)\b/;

/**
 * Splits a description the way the contract writes them (scripts/build-skills.mjs):
 * a first sentence that names the skill and lists what it covers after a
 * colon, then a sentence that says when to use it. The summary is the
 * first sentence up to its colon, closed with a period; the list after the
 * colon (and any sentences after it) is what it covers; the `Use when`
 * sentence is kept whole. A first sentence with no colon is the summary as
 * written.
 */
export function describe(description: string): DescriptionParts {
  const text = description.trim();
  const useAt = text.search(USE_AT);
  const before = (useAt >= 0 ? text.slice(0, useAt) : text).trim();
  const use = useAt >= 0 ? text.slice(useAt).trim() : null;
  const sentenceEnd = before.search(/[.!?](\s|$)/);
  const first = sentenceEnd >= 0 ? before.slice(0, sentenceEnd + 1) : before;
  const colon = first.indexOf(': ');
  let summary: string;
  let rest: string;
  if (colon > 0) {
    summary = `${first.slice(0, colon)}.`;
    rest = before.slice(colon + 2).trim();
  } else {
    summary = first.trim();
    rest = before.slice(first.length).trim();
  }
  return { summary, covers: rest.length > 0 ? raiseFirst(rest) : null, use };
}

/**
 * The text with its first letter raised when its first word is a plain
 * lowercase word (`the`, `measure`); a code name (`gt-cloud's`,
 * `packages/ui`) keeps its case.
 */
function raiseFirst(text: string): string {
  const word = text.split(/\s/)[0] ?? '';
  return /^[a-z][a-z']*$/.test(word) ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

/** The `Use when` sentence as the answer to "when to use it": `When writing ...`, `Before making ...`. */
export function whenToUse(use: string): string {
  return raiseFirst(use.replace(/^Use\s+/, ''));
}

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** A count under a hundred in words, `twenty-two`; the digits from a hundred on. */
export function countWord(n: number): string {
  if (n < 1 || n > 99 || !Number.isInteger(n)) return String(n);
  if (n < 20) return ONES[n] ?? String(n);
  const tens = TENS[Math.floor(n / 10)] ?? '';
  return n % 10 === 0 ? tens : `${tens}-${ONES[n % 10]}`;
}

/** `twenty-two` as `Twenty-two`, for the start of a sentence. */
export function capitalized(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

