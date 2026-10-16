import type { ComponentProps } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

import LegalToc from '../../sections/LegalToc';
import ProdFooter from '../../sections/ProdFooter';
import ProdNav from '../../sections/ProdNav';
import { getLegalDocument, legalHeadings, legalHref, legalRoutes } from '../../sections/legal-docs';

import '../../../toolchain/sections/logos-icons.css';
import '../../../toolchain/styles.css';
import '../../../_v0/v0-pages.css';
import '../../sections/legal.css';

/**
 * The live page's MDX components (legal/[route]/page.tsx) as class names:
 * legal.css restates the Tailwind classes live gives each element, and
 * links between documents resolve to the mirror's pages.
 */
const components = {
  a: ({ href, ...props }: ComponentProps<'a'>) => <a {...props} href={legalHref(href)} />,
  table: (props: ComponentProps<'table'>) => (
    <div className='legal-table-wrap'>
      <table {...props} />
    </div>
  ),
};

export const dynamicParams = false;

/* The meta description for a document whose vendored frontmatter
   description is shorter than the 50 characters lint:seo B1 requires. The
   files in content/legal are pinned copies (scripts/lint/copies.json), so
   the longer text lives here and the page body keeps live's words. */
const META_DESCRIPTION: Readonly<Record<string, string>> = {
  'credit-terms':
    'Terms governing General Translation credits: how they are redeemed for Services, when they expire and their refund rules.',
};

export function generateStaticParams() {
  return legalRoutes().map((route) => ({ route }));
}

export async function generateMetadata({ params }: { params: Promise<{ route: string }> }): Promise<Metadata> {
  const { route } = await params;
  const document = getLegalDocument(route);
  const seo = document
    ? seoRoute({
        path: `/d/production/legal/${route}`,
        title: document.title,
        section: 'Shipped',
        kind: 'mirror',
        description: META_DESCRIPTION[route] ?? document.description,
      })
    : seoRoute({
        path: `/d/production/legal/${route}`,
        title: 'Legal document not found',
        section: 'Shipped',
        kind: 'error',
        description: 'No legal document on the shipped General Translation site has this address.',
      });
  return seo.metadata;
}

/**
 * PRODUCTION · LEGAL DOCUMENT: generaltranslation.com/legal/<document>.
 *
 * The live page: a two-column article on the rail. The sticky aside holds
 * the Legal Resources back link, the title, the description, the Last
 * updated date and the Contents list of the h2 headings; the body is the
 * document's markdown, compiled as live compiles it (next-mdx-remote with
 * remark-gfm and rehype-slug). The text is the vendored copy in
 * content/legal/en-US (sections/legal-docs.ts).
 */
export default async function ProductionLegalDocumentPage({ params }: { params: Promise<{ route: string }> }) {
  const { route } = await params;
  const document = getLegalDocument(route);
  if (!document) notFound();
  const headings = legalHeadings(document.content);

  return (
    <SmoothScroll>
      <div className='toolchain-root sgdh-root prod-root legal-root'>
        <ProdNav />

        <main className='tc-rail'>
          <article className='tc-sec legal-document-shell'>
            <header className='legal-document-aside'>
              <Link className='tc-back-link' href='/d/production/legal'>
                <ArrowLeft aria-hidden='true' />
                Legal Resources
              </Link>

              <h1>{document.title}</h1>
              <p>{document.description}</p>
              <p className='legal-updated'>Last updated: {document.lastUpdated}</p>

              {headings.length > 0 ? (
                <nav aria-label='Table of contents' className='legal-toc'>
                  <span className='legal-toc-label'>Contents</span>
                  <LegalToc headings={headings} />
                </nav>
              ) : null}
            </header>

            <div className='legal-document-body'>
              <MDXRemote
                components={components}
                options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } }}
                source={document.content}
              />
            </div>
          </article>
          <ProdFooter />
        </main>
      </div>
      <DirectionCorner slug='production' />
    </SmoothScroll>
  );
}
