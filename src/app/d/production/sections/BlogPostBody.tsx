import { CheckIcon, XMarkIcon } from '@heroicons/react/16/solid';
import rehypeShiki from '@shikijs/rehype';
import { CircleCheck, CircleX, Info, Lightbulb, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote/rsc';
import type { ComponentProps, ReactNode } from 'react';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import Carousel, { CarouselItem } from '@/components/blog/Carousel';
import Spotlight from '@/components/blog/Spotlight';

import PostFumadocsArchitecture from './PostFumadocsArchitecture';
import PostGitHub from './PostGitHub';
import { PostAccordion, PostAccordions, PostCodeBlock, PostHeading, PostVideo } from './PostMdxControls';
import PostTweet from './PostTweet';

/**
 * PRODUCTION · a post body, compiled the way live compiles it
 * (apps/landing/src/components/blog/PostMdx.tsx): next-mdx-remote with
 * remark-gfm, rehype-slug for the heading ids and @shikijs/rehype with
 * github-dark, over live's MDX map (apps/landing/src/mdx-components.tsx):
 * fumadocs' defaults (headings with a copy-anchor button, code blocks with
 * a copy button, links, images, tables, callouts) and the blog's own
 * components. Each component renders live's markup with pba- classes,
 * which blog-article.css dresses with live's computed values.
 */

const BASE = '/d/production';
const LIVE = 'https://generaltranslation.com';

/**
 * The generaltranslation.com paths the mirror carries: its pages and the
 * live redirects next.config.ts repeats under /d/production. Every other
 * path (the docs, the knowledge base, the SEO posts, /dashboard, which live
 * sends to the dashboard app, and the agent files such as /llms.txt and
 * /sitemap.xml) stays on the live site.
 */
const MIRRORED =
  /^\/(?:home|blog|devlog|pricing|pricing-catalog|enterprise|careers|contact|supported-locales|legal|privacy|terms|data-processing|report-card|try|yc|a16z|mercury|slash|speedrun|rho|residency)?(?:[/?#]|$)/;
const LIVE_URL = /^https?:\/\/(?:www\.)?generaltranslation\.com(?:\/en-US)?(?=\/|$)/;

/** A live path's address: the mirror's page when it carries one, else live's. */
function pathHref(path: string): string {
  if (!MIRRORED.test(path)) return `${LIVE}${path}`;
  return path === '/' ? BASE : `${BASE}${path}`;
}

/**
 * Where a post link lands in the mirror. A path on generaltranslation.com
 * that the mirror carries opens the mirror's page, any other path stays on
 * the live site, and other addresses pass through.
 */
function postHref(href: string): string {
  if (href.startsWith('/') && !href.startsWith('//')) return pathHref(href);
  const live = LIVE_URL.exec(href);
  if (live) return pathHref(href.slice(live[0].length) || '/');
  return href;
}

/** fumadocs-core's Link: an absolute address opens in a new tab, as live's do. */
function PostLink({ href = '', children, ...props }: ComponentProps<'a'>) {
  const target = postHref(href);
  if (/^[a-z][a-z\d+.-]*:/i.test(href)) {
    return (
      <a {...props} href={target} rel='noreferrer noopener' target='_blank'>
        {children}
      </a>
    );
  }
  if (target.startsWith('#')) {
    return (
      <a {...props} href={target}>
        {children}
      </a>
    );
  }
  return (
    <Link {...props} href={target}>
      {children}
    </Link>
  );
}

/**
 * fumadocs' Image for a markdown image with no size: a plain img at the
 * column's sizes. Every body image sits below the cover, so each loads
 * lazily and decodes off the main thread.
 */
function PostImage({ alt = '', src, title }: ComponentProps<'img'>) {
  if (typeof src !== 'string' || !src) return null;
  return (
    // oxlint-disable-next-line nextjs/no-img-element -- live renders this plain img, unsized and unoptimized
    <img
      alt={alt}
      className='pba-img'
      decoding='async'
      fetchPriority='auto'
      loading='lazy'
      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px'
      src={src}
      title={title}
    />
  );
}

/** fumadocs' Table: a scrolling wrapper around the table. */
function PostTable(props: ComponentProps<'table'>) {
  return (
    <div className='pba-table'>
      <table {...props} />
    </div>
  );
}

type CalloutProps = {
  type?: string;
  title?: ReactNode;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
};

/** fumadocs' default callout icons, Lucide glyphs filled with the callout's color. */
const CALLOUT_ICONS: Record<string, ReactNode> = {
  info: <Info aria-hidden='true' className='pba-callout-icon' />,
  warning: <TriangleAlert aria-hidden='true' className='pba-callout-icon' />,
  error: <CircleX aria-hidden='true' className='pba-callout-icon' />,
  success: <CircleCheck aria-hidden='true' className='pba-callout-icon' />,
  idea: <Lightbulb aria-hidden='true' className='pba-callout-icon is-idea' />,
};

/**
 * fumadocs' Callout. The posts pass Tailwind classes that live's build
 * compiles from the post text; this mirror reads the two class lists the
 * vendored posts use and names each effect: a muted ground with no frame
 * (bg-fd-muted, border-0, shadow-none, rounded-md, p-5), a hidden side bar
 * ([&>div:first-child]:hidden) and snug paragraphs and list items
 * ([&_p]:my-3!, leading-snug!).
 */
function PostCallout({ type = 'info', title, icon, className = '', children }: CalloutProps) {
  const kind = type === 'warn' ? 'warning' : type === 'tip' ? 'info' : type;
  const classes = ['pba-callout', `is-${kind}`];
  if (className.includes('bg-fd-muted')) classes.push('is-muted');
  if (className.includes('[&>div:first-child]:hidden')) classes.push('is-barless');
  if (className.includes('[&_p]:my-3!')) classes.push('is-snug');
  return (
    <div className={classes.join(' ')}>
      <div className='pba-callout-bar' role='none' />
      {icon ?? CALLOUT_ICONS[kind] ?? null}
      <div className='pba-callout-body'>
        {title ? <p className='pba-callout-title'>{title}</p> : null}
        <div className='pba-callout-text prose-no-margin'>{children}</div>
      </div>
    </div>
  );
}

/**
 * live's OpenSourceGrants (gt-cloud #5598): the grants note that opens every
 * open-source grantee post, fumadocs' Callout with the class list the posts
 * used to pass it, the repository button and live's three paragraphs.
 */
function PostOpenSourceGrants() {
  return (
    <PostCallout
      className='bg-fd-muted w-full max-w-none rounded-md border-0 p-5 shadow-none [&_.not-prose]:my-3'
      icon=' '
      type='info'
    >
      <p>
        <em>About General Translation Open-Source Grants</em>
      </p>
      <p>
        The open-source ethos is core to what we do at General Translation. Our flagship internationalization (i18n)
        libraries are open source under the MIT license.
      </p>
      <PostGitHub />
      <p>
        We’re now supporting other open-source developers who build and maintain software for the public good, starting
        with $15,000 in no-strings-attached funds as well as $75,000 in GT platform credits across fifteen developers.
        Nominations are rolling and still open! Read more <PostLink href='/blog/supporting-open-source-software'>here</PostLink>.
      </p>
    </PostCallout>
  );
}

/** live's MdxCheck and MdxCross: Heroicons 16 solid at the inline icon scale, green and red as the posts color them. */
function PostCheck({ className = '' }: { className?: string }) {
  return <CheckIcon aria-hidden='true' className={`pba-mdx-icon${className.includes('text-green') ? ' is-yes' : ''}`} />;
}

function PostCross({ className = '' }: { className?: string }) {
  return <XMarkIcon aria-hidden='true' className={`pba-mdx-icon${className.includes('text-red') ? ' is-no' : ''}`} />;
}

type Heading = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
const heading = (as: Heading) =>
  function PostHeadingAs(props: ComponentProps<'h2'>) {
    return <PostHeading as={as} {...props} />;
  };

const components: NonNullable<MDXRemoteProps['components']> = {
  a: PostLink,
  img: PostImage,
  pre: PostCodeBlock,
  table: PostTable,
  h1: heading('h1'),
  h2: heading('h2'),
  h3: heading('h3'),
  h4: heading('h4'),
  h5: heading('h5'),
  h6: heading('h6'),
  Accordion: PostAccordion,
  Accordions: PostAccordions,
  Callout: PostCallout,
  Carousel,
  CarouselItem,
  Check: PostCheck,
  FumadocsArchitecture: PostFumadocsArchitecture,
  GitHub: PostGitHub,
  OpenSourceGrants: PostOpenSourceGrants,
  Spotlight,
  Tweet: PostTweet,
  Video: PostVideo,
  X: PostCross,
};

/** One MDX source rendered as live renders a post body or its header intro. */
export default function BlogPostBody({ source }: { source: string }) {
  return (
    <MDXRemote
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug, [rehypeShiki, { theme: 'github-dark', inline: 'tailing-curly-colon', tokenizeTimeLimit: 0 }]],
        },
      }}
      source={source}
    />
  );
}
