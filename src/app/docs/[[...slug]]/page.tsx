import { notFound } from 'next/navigation';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/notebook/page';
import defaultMdxComponents from 'fumadocs-ui/mdx';

import DocsPageActions from '@/components/docs/DocsPageActions';
import { selfUrl } from '@/lib/seo/policy';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { source } from '@/lib/source';
import type { DocsPage as Page } from '@/lib/source';
import { requireUpdated } from '@/lib/updated';

/* every page is prerendered from content/docs; any other address under /docs is a 404 */
export const dynamicParams = false;

export function generateStaticParams() {
  return source.generateParams();
}

type Params = { params: Promise<{ slug?: string[] }> };

/** The page's source on GitHub, for the actions menu. */
const CONTENT_BLOB = 'https://github.com/Kevin-Liu-01/Prototemplate/blob/main/content/docs/';

/** The page that documents the docs site as a template carries a SoftwareSourceCode node for the docs code. */
const TEMPLATE_SLUG = 'template';

/**
 * The route's head and JSON-LD from one seoRoute call: a TechArticle under
 * Docs, dated by src/lib/updated.ts, with the page's Markdown twin as its
 * text/markdown alternate.
 */
function docsRoute(page: Page) {
  const tail = page.slugs.join('/');
  const rest = tail ? `/${tail}` : '';
  return seoRoute({
    path: `/docs${rest}`,
    title: page.data.title,
    section: 'Docs',
    kind: 'article',
    description: page.data.description ?? '',
    crumbs: tail ? [{ name: 'Docs', path: '/docs' }] : [],
    updated: requireUpdated(page.url),
    markdown: `${page.url}.md`,
    source: tail === TEMPLATE_SLUG ? 'src/app/docs' : undefined,
  });
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  return docsRoute(page).metadata;
}

/** The date the page last changed, as the panel on the hub's book pages writes it. */
function updatedLabel(day: string): string {
  const date = new Date(`${day}T12:00:00Z`);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

/**
 * /docs and /docs/<slug>: one MDX page of the docs site in the notebook
 * layout. The head carries the describedby link to /llms.txt, and the body
 * one machine-only llms.txt anchor (screen readers and the tab order skip
 * it), the agent-readability checklist's items 2 and 3 in gt-cloud's
 * skills/gt-website/references/docs.md.
 */
export default async function Page({ params }: Params) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  const route = docsRoute(page);
  const MDX = page.data.body;
  const updated = requireUpdated(page.url);
  return (
    <DocsPage toc={page.data.toc} full={page.data.full} breadcrumb={{ enabled: false }}>
      <link rel='describedby' href='/llms.txt' />
      <JsonLd nodes={route.jsonLd} />
      <a href='/llms.txt' className='sr-only' aria-hidden='true' tabIndex={-1}>
        llms.txt
      </a>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className='docs-meta' data-docs-meta=''>
        <p className='docs-updated'>
          Updated <time dateTime={updated.at}>{updatedLabel(updated.day)}</time>
        </p>
        <DocsPageActions
          markdownUrl={`${page.url}.md`}
          githubUrl={`${CONTENT_BLOB}${page.path}`}
          pageUrl={selfUrl(page.url)}
        />
      </div>
      <DocsBody>
        <MDX components={{ ...defaultMdxComponents }} />
      </DocsBody>
    </DocsPage>
  );
}
