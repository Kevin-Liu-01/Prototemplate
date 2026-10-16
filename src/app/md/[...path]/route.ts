import { notFound } from 'next/navigation';

import { docsMarkdown, docsPages, handbookDocs, handbookMarkdown, twinHeaders } from '../text';

/**
 * The Markdown twins: every docs page and every handbook document as
 * Markdown, at its address plus .md or .mdx (/docs/seo.md,
 * /handbook/design.md), which next.config.ts rewrites here; the internal
 * address (/md/docs/seo) answers the same. Each is prerendered at build
 * time and never rendered on demand: dynamicParams is off, so an unknown
 * path is a 404 that reads no file, the contract that kept gt-cloud's
 * twins from failing in production (gt-cloud #4499). The Link header names
 * the HTML page as the canonical, so a citation points there.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = false;

type Context = { params: Promise<{ path: string[] }> };

export function generateStaticParams(): { path: string[] }[] {
  return [
    ...docsPages().map((page) => ({ path: ['docs', ...page.slugs] })),
    ...handbookDocs().map(({ path }) => ({ path: path.slice(1).split('/') })),
  ];
}

export async function GET(_request: Request, { params }: Context): Promise<Response> {
  const { path } = await params;
  const pathname = `/${path.join('/')}`;
  if (path[0] === 'docs') {
    const page = docsPages().find((p) => p.url === pathname);
    if (!page) notFound();
    return new Response(await docsMarkdown(page), { headers: twinHeaders(page.url) });
  }
  const doc = handbookDocs().find((d) => d.path === pathname);
  if (!doc) notFound();
  return new Response(handbookMarkdown(doc.entry, doc.path), { headers: twinHeaders(doc.path) });
}
