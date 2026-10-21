import { docsPages } from '@/app/md/text';
import { docHref } from '@/components/book/model';
import { DIRECTIONS } from '@/lib/directions';
import { selfUrl, SITE_URL } from '@/lib/seo/policy';
import { SITE_DESCRIPTION } from '@/lib/seo/site';
import { SKILLS } from '@/lib/skills';
import type { DocsPage } from '@/lib/source';
import { SITE_SURFACES } from '@/lib/surfaces';

/**
 * /llms.txt: the site described for agents (llmstxt.org), generated at
 * build time from the registries the pages render from, so it lists every
 * docs page, every skill and every route the day each one is added: the
 * docs site (content/docs through src/lib/source.ts, split into the docs,
 * the components and the handbook by folder), the generated skills
 * registry, the surfaces' Pages and Knowledge rows and the directions.
 * Every link is on www, and every docs page names its Markdown twin. It
 * replaced the hand-kept public/llms.txt on 2026-10-15.
 */
export const dynamic = 'force-static';

/** The first sentence of a registry description, which is what a list line needs. */
function sentence(text: string): string {
  const end = text.search(/[.!?](\s|$)/);
  return (end >= 0 ? text.slice(0, end + 1) : text).trim();
}

/** A docs page's list line: its title, its address, its description and its Markdown twin. */
function docsLine(page: DocsPage): string {
  return `- [${page.data.title}](${selfUrl(page.url)}): ${page.data.description ?? ''} Markdown: ${selfUrl(page.url)}.md`;
}

/** A docs page in a folder of content/docs: its index or a page under it. */
function inFolder(page: DocsPage, folder: string): boolean {
  return page.url === `/docs/${folder}` || page.url.startsWith(`/docs/${folder}/`);
}

function body(): string {
  const lines: string[] = [];
  const add = (...more: string[]) => lines.push(...more);

  add(
    '# Prototemplate',
    '',
    `> ${SITE_DESCRIPTION} General Translation (https://generaltranslation.com) is the localization platform for developers.`,
    '',
    `Prototemplate is served at ${SITE_URL}, the canonical address, and every link here uses it. Every docs page, the handbook's included, has a Markdown twin at its address plus .md, and ${SITE_URL}/llms-full.txt holds the text of all of them in reading order.`,
    '',
    `An agent starts with the agent guide (${SITE_URL}/AGENTS.md, and ${selfUrl(docHref('agents'))} on the site), then the operating principles in the handbook, then the skill for its task.`,
    ''
  );

  const pages = docsPages();
  const components = pages.filter((page) => inFolder(page, 'components'));
  const handbook = pages.filter((page) => inFolder(page, 'handbook'));
  const docs = pages.filter((page) => !components.includes(page) && !handbook.includes(page));

  add('## Docs', '', 'The pages on how Prototemplate works and one on the directions for the blog globe figure, in the docs layout generaltranslation.com runs. The last page explains how to use the docs site as a template.', '');
  add(...docs.map(docsLine), '');

  add('## Components', '', 'The live component library: every instrument of the hub mounted on its page with controls, its import path, its props and its reduced-motion still.', '');
  add(...components.map(docsLine), '');

  add('## Handbook', '', 'How Kevin runs General Translation work, and the canon: the agent guide, the brand and design canons, the architecture map, the ship loop, the tools, the libraries, the graphics pipeline and the artifact pictures.', '');
  add(...handbook.map(docsLine), '');

  add(
    '## Skills',
    '',
    `Each skill is a folder in the SKILL.md format Claude Code, Codex and other agents load. ${SITE_URL}/skills/index.json lists the whole set with every file and install line, and \`node scripts/skills/install.mjs --project <dir>\` from a checkout links them into a project.`,
    ''
  );
  for (const skill of SKILLS) {
    add(`- [${skill.title}](${selfUrl(`/skills/${skill.id}`)}): ${sentence(skill.description)} Raw file: ${selfUrl(`/skills/${skill.id}/SKILL.md`)}`);
  }
  add('');

  add('## Routes', '');
  for (const row of SITE_SURFACES.filter((s) => s.group === 'Pages' || s.group === 'Knowledge')) {
    // a row that links off the site (Turboslide) keeps its own address
    add(`- [${row.name}](${/^https?:\/\//.test(row.href) ? row.href : selfUrl(row.href)}): ${row.desc}`);
  }
  add('');

  add(
    '## Directions',
    '',
    'The design lab: each direction for the General Translation website has a page that presents it with its captures. The prototypes themselves run under /d/<slug> and are kept out of search results.',
    ''
  );
  for (const direction of DIRECTIONS.filter((d) => !d.reference)) {
    add(`- [${direction.name}](${selfUrl(`/directions/${direction.slug}`)}): ${direction.concept}`);
  }
  add('');

  add('## Optional', '', `- [Full text](${SITE_URL}/llms-full.txt): every docs page in reading order, the components and the handbook with its agent guide included.`, `- [Sitemap](${SITE_URL}/sitemap.xml): every indexable page with its last change.`, '');
  return lines.join('\n');
}

export function GET(): Response {
  return new Response(body(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
