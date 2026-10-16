import { absoluteLinks, MARKDOWN_TYPE } from '@/app/md/text';
import { readDoc } from '@/components/book/book';
import { selfUrl } from '@/lib/seo/policy';

/**
 * /AGENTS.md: the repository's agent guide as raw Markdown, with every
 * relative link resolved to the address the site serves it at (siteHref in
 * src/components/book/links.ts), so an agent outside a checkout can follow
 * it. Its page on the site is /handbook/agents, named as the canonical.
 * Prerendered at build time.
 */
export const dynamic = 'force-static';

export function GET(): Response {
  return new Response(absoluteLinks(readDoc('AGENTS.md')), {
    headers: { 'Content-Type': MARKDOWN_TYPE, Link: `<${selfUrl('/handbook/agents')}>; rel="canonical"` },
  });
}
