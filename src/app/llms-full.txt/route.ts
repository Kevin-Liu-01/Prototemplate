import { docsMarkdown, docsPages, handbookDocs, handbookMarkdown } from '@/app/md/text';
import { SITE_URL } from '@/lib/seo/policy';

/**
 * /llms-full.txt: the text of every docs page, then every handbook
 * document (the agent guide among them), in reading order, each as its
 * Markdown twin, so an agent can read the whole of Prototemplate's prose
 * in one request. Prerendered at build time.
 */
export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  const parts = [
    `# Prototemplate: the full text\n\nEvery docs page and every handbook document of ${SITE_URL}, in reading order.\n`,
    ...(await Promise.all(docsPages().map((page) => docsMarkdown(page)))),
    ...handbookDocs().map(({ entry, path }) => handbookMarkdown(entry, path)),
  ];
  return new Response(parts.join('\n\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
