import { SKILL_AREAS, SKILLS, skillFileHref, skillHref } from '@/lib/skills';

import { installLine } from '../model';

/**
 * /skills/index.json: the curated skills as data, for an agent that wants
 * the whole set in one request. Each entry carries the title, the areas,
 * the description, the last update, the page, the raw SKILL.md, every
 * supporting file and the command that installs it; the head carries the
 * areas in order and the commands for the whole set. Prerendered at build
 * time from the generated registry (src/lib/skills.ts).
 */

export const dynamic = 'force-static';

const SITE_URL = 'https://prototemplate.vercel.app';

export function GET(): Response {
  const body = {
    name: 'Prototemplate skills',
    description:
      'The skills Kevin uses for General Translation work, filed by area, each a SKILL.md that Claude Code, Codex and other agents load.',
    source: 'https://github.com/Kevin-Liu-01/Prototemplate/tree/main/skills',
    install: {
      all: installLine(),
      one: installLine('<slug>'),
      copy: `${installLine()} --copy`,
      dryRun: `${installLine()} --dry-run`,
      note: 'Run from a Prototemplate checkout. The default links each folder into <dir>/.claude/skills and <dir>/.agents/skills; --copy vendors it instead.',
    },
    areas: SKILL_AREAS.map((area) => ({ id: area.id, label: area.label })),
    skills: SKILLS.map((skill) => ({
      slug: skill.id,
      title: skill.title,
      areas: skill.areas,
      description: skill.description,
      updated: skill.updated,
      page: `${SITE_URL}${skillHref(skill.id)}`,
      skill: `${SITE_URL}${skillFileHref(skill.id)}`,
      files: skill.files.map((file) => ({ path: file, url: `${SITE_URL}${skillFileHref(skill.id, file)}` })),
      install: installLine(skill.id),
    })),
  };
  return new Response(`${JSON.stringify(body, null, 2)}\n`, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
