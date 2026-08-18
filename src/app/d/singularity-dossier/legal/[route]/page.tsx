import type { ComponentProps } from 'react';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import { getLegalDocument, legalDocuments, normalizeLegalDocumentHref } from '@/lib/legal';

import V0Footer from '../../../_v0/V0Footer';
import V0Nav from '../../../_v0/V0Nav';

import '../../../toolchain/styles.css';
import '../../../_v0/v0-pages.css';
import '../legal.css';

const legalMdxComponents = {
  h2: (props: ComponentProps<'h2'>) => <h2 {...props} />,
  h3: (props: ComponentProps<'h3'>) => <h3 {...props} />,
  h4: (props: ComponentProps<'h4'>) => <h4 {...props} />,
  p: (props: ComponentProps<'p'>) => <p {...props} />,
  ul: (props: ComponentProps<'ul'>) => <ul {...props} />,
  ol: (props: ComponentProps<'ol'>) => <ol {...props} />,
  a: ({ href, ...props }: ComponentProps<'a'>) => (
    <a {...props} href={normalizeLegalDocumentHref(href)} />
  ),
  blockquote: (props: ComponentProps<'blockquote'>) => <blockquote {...props} />,
  hr: (props: ComponentProps<'hr'>) => <hr {...props} />,
  table: (props: ComponentProps<'table'>) => (
    <div className='legal-table-wrap'>
      <table {...props} />
    </div>
  ),
  th: (props: ComponentProps<'th'>) => <th {...props} />,
  td: (props: ComponentProps<'td'>) => <td {...props} />,
};

export const dynamicParams = false;

export function generateStaticParams() {
  return legalDocuments.map((document) => ({ route: document.route }));
}

export async function generateMetadata({ params }: { params: Promise<{ route: string }> }) {
  const { route } = await params;
  const document = await getLegalDocument(route);
  return document
    ? { title: `${document.title} — General Translation`, description: document.description }
    : { title: 'Legal Document Not Found' };
}

export default async function LegalDocumentPage({ params }: { params: Promise<{ route: string }> }) {
  const { route } = await params;
  const document = await getLegalDocument(route);
  if (!document) notFound();

  return (
    <div className='toolchain-root sgdh-root legal-root'>
      <V0Nav />
      <main className='tc-rail'>
        <article className='tc-sec legal-document-shell'>
          <header className='legal-document-aside'>
            <a
              aria-label='Back to Legal Resources'
              className='legal-back-link'
              href='/d/singularity-dossier/legal'
            >
              <ArrowLeft aria-hidden='true' />
              <span>Legal Resources</span>
            </a>
            <h1>{document.title}</h1>
            <p>{document.description}</p>
            <p className='legal-updated'>Last updated: {document.lastUpdated}</p>
          </header>

          <div className='legal-document-body'>
            <MDXRemote
              components={legalMdxComponents}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } }}
              source={document.content}
            />
          </div>
        </article>
        <V0Footer />
      </main>
    </div>
  );
}
