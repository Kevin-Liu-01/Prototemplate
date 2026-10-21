import { docsMarkdown, docsPages } from '@/app/md/text';
import { SITE_URL } from '@/lib/seo/policy';

/**
 * /llms-full.txt: the text of every docs page in the sidebar's order, the
 * components and the handbook (the agent guide among them) included, each
 * as its Markdown twin, so an agent can read the whole of Prototemplate's
 * prose in one request. Prerendered at build time.
 */
export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  const parts = [
    `# Prototemplate: the full text\n\nEvery docs page of ${SITE_URL}, the handbook's included, in reading order.\n`,
    ...(await Promise.all(docsPages().map((page) => docsMarkdown(page)))),
  ];
  return new Response(parts.join('\n\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
