import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { SKILLS, getSkill } from '@/lib/skills';

/**
 * The raw files of every skill, as agents fetch them:
 * /skills/<slug>/SKILL.md (frontmatter included) and each supporting file
 * the registry lists (/skills/<slug>/references/<file>,
 * /skills/<slug>/scripts/<file>). Every address is prerendered at build
 * time from skills/<slug>/ and served as a static file; any other path
 * under a skill is a 404, since dynamicParams is off. The old raw links
 * (/skills/<slug>.md) redirect here from next.config.ts.
 */

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams(): { slug: string; path: string[] }[] {
  return SKILLS.flatMap((skill) =>
    ['SKILL.md', ...skill.files].map((file) => ({ slug: skill.id, path: file.split('/') }))
  );
}

/** The type each published extension is served with; build/skills.mjs allows only these. Python, shell, text and plain JavaScript go out as text/plain, so a browser shows them and never runs them. */
const TYPES: Readonly<Record<string, string>> = {
  md: 'text/markdown; charset=utf-8',
  mjs: 'text/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
  py: 'text/plain; charset=utf-8',
  sh: 'text/plain; charset=utf-8',
  txt: 'text/plain; charset=utf-8',
  js: 'text/plain; charset=utf-8',
};

type Context = { params: Promise<{ slug: string; path: string[] }> };

export async function GET(_request: Request, { params }: Context): Promise<Response> {
  const { slug, path } = await params;
  const skill = getSkill(slug);
  const file = path.join('/');
  const type = TYPES[file.split('.').pop() ?? ''];
  if (!skill || !type || (file !== 'SKILL.md' && !skill.files.includes(file))) {
    return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  /* the folder is a literal (SKILL_DIR's value), so the build traces skills/ and not the whole project */
  const body = readFileSync(join(process.cwd(), 'skills', skill.id, ...file.split('/')), 'utf8');
  return new Response(body, {
    headers: {
      'Content-Type': type,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
