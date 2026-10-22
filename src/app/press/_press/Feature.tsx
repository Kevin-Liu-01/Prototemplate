'use client';

import Link from 'next/link';
import { Fragment, useMemo, useRef, type ReactNode } from 'react';

import { PrintFigure, sideFigure } from './BookBody';
import type { PlateFigure, Story } from './content';
import { homeOf, storyHref, useEdition } from './edition';
import { useMountEffect } from './hooks';
import { plain, type Block, type Inline as InlineNode } from './parse';
import Plate, { pad } from './plates/Plate';
import { PULLS, type Pull } from './stories';
import Cover from './ui/Cover';
import Inline from './ui/Inline';

type Props = { story: Story; next: { slug: string; title: string } | null };

/** Where a pull quote may sit, in paragraphs from its source, best first: after it, then before it, never nearer than two. */
const PULL_ORDER = [3, 4, 2, 5, 6, -4, -5, -3, -6];

/* A story as a magazine feature, in the magazine edition (/press). Every
   story shares the grammar (an opening spread with the story's art, a
   Bodoni headline, a deck and the byline; one column of Newsreader at 20px
   with a drop cap; section heads under the story's own mark; pull quotes;
   figures set wider than the text; notes and sources at the back) and
   each story brings its own palette, art, headline and mark (magazine.css,
   [data-story]). */
export default function FeatureBody({ story, next }: Props) {
  const edition = useEdition();
  const { blocks, figures } = story;
  const progress = useRef<HTMLSpanElement>(null);

  const { notes, pullsAfter, firstPara, hitItems } = useMemo(() => {
    const notes = blocks.flatMap((b) => (b.kind === 'footnote' ? [b] : []));
    // a pull quote sits between two paragraphs of prose in its source's section, never after a line ending in a colon
    // and never beside its source: three paragraphs after it where it can, else near it, else before it
    const prose = (k: number) => blocks[k]?.kind === 'para';
    const fits = (k: number) => {
      const b = blocks[k];
      return b?.kind === 'para' && prose(k + 1) && !plain(b.inline).trimEnd().endsWith(':');
    };
    const sameSection = (a: number, b: number) => !blocks.slice(Math.min(a, b) + 1, Math.max(a, b) + 1).some((x) => x.kind === 'heading');
    const pullsAfter = new Map<number, Pull>();
    for (const pull of PULLS[story.slug] ?? []) {
      const source = blocks.findIndex((b) => b.kind === 'para' && plain(b.inline).includes(pull.after));
      if (source < 0) continue;
      const at = PULL_ORDER.map((d) => source + d).find((k) => k >= 0 && fits(k) && sameSection(source, k) && !pullsAfter.has(k));
      if (at !== undefined) pullsAfter.set(at, pull);
    }
    const firstPara = blocks.findIndex((b) => b.kind === 'para');
    const lists = blocks.filter((b): b is Extract<Block, { kind: 'list' }> => b.kind === 'list');
    return { notes, pullsAfter, firstPara, hitItems: lists.at(-1)?.items ?? [] };
  }, [blocks, story.slug]);

  useMountEffect(() => {
    // the reader's place, as the line along the top
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        progress.current?.style.setProperty('--p', String(max > 0 ? Math.min(1, scrollY / max) : 0));
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  });

  const noteList =
    notes.length > 0 ? (
      <section className='gtm-notes' aria-label='Notes'>
        <h2 className='gtm-back-h'>Notes</h2>
        <ol>
          {notes.map((note) => (
            <li key={note.n} id={`fn-${note.n}`}>
              <a className='gtm-note-n' href={`#fnref-${note.n}`} aria-label={`Back to note ${note.n} in the text`}>
                {note.n}
              </a>
              <span>
                <Inline nodes={note.inline} />
              </span>
            </li>
          ))}
        </ol>
      </section>
    ) : null;
  const hasSources = blocks.some((b) => b.kind === 'heading' && b.id === 'sources');

  let figureCount = 0;

  return (
    <>
      <span ref={progress} className='gtm-progress' aria-hidden='true' />
      <article className='gtm'>
        <Opener story={story} />

        <div className='gtm-text'>
          {blocks.map((block, i) => {
            let node: ReactNode = null;
            switch (block.kind) {
              case 'heading':
                if (block.id === 'sources')
                  return (
                    <Fragment key={i}>
                      {noteList}
                      <h2 id={block.id} className='gtm-back-h'>
                        {block.text}
                      </h2>
                    </Fragment>
                  );
                node = (
                  <h2 id={block.id} className='gtm-h2'>
                    <Mark slug={story.slug} />
                    <span>{block.text}</span>
                  </h2>
                );
                break;
              case 'para':
                node = (
                  <p className={i === firstPara ? 'gtm-lead' : undefined}>
                    <Inline nodes={block.inline} />
                  </p>
                );
                break;
              case 'list': {
                const Tag = block.ordered ? 'ol' : 'ul';
                node = (
                  <Tag className='gtm-list'>
                    {block.items.map((item, k) => (
                      <li key={k}>
                        <Inline nodes={item} />
                      </li>
                    ))}
                  </Tag>
                );
                break;
              }
              case 'rules':
                node = (
                  <ul className='gtm-rules'>
                    {block.items.map((rule, k) => (
                      <li key={k} data-ok={rule.ok}>
                        <span className='gtm-rule-mark' aria-label={rule.ok ? 'Do' : 'Do not'}>
                          {rule.ok ? '✓' : '✕'}
                        </span>
                        <span>
                          <Inline nodes={rule.inline} />
                        </span>
                      </li>
                    ))}
                  </ul>
                );
                break;
              case 'note':
                node =
                  block.name === 'Epigraph' ? (
                    <blockquote className='gtm-epigraph'>
                      {block.paras.map((p, k) => (
                        <p key={k}>
                          <Inline nodes={p} />
                        </p>
                      ))}
                    </blockquote>
                  ) : block.name === 'Sources' ? (
                    <div className='gtm-sources'>
                      {block.paras.map((p, k) => (
                        <p key={k}>
                          <Inline nodes={p} />
                        </p>
                      ))}
                    </div>
                  ) : (
                    <aside className='gtm-box'>
                      {block.paras.map((p, k) => (
                        <p key={k}>
                          <Inline nodes={p} />
                        </p>
                      ))}
                    </aside>
                  );
                break;
              case 'figure': {
                const figure = figures[figureCount++];
                if (figure) node = <FeatureFigure figure={figure} story={story} hitItems={hitItems} />;
                break;
              }
              case 'side':
                node = <FeatureFigure figure={sideFigure(block)} story={story} hitItems={hitItems} side />;
                break;
              default:
                return null;
            }
            const pull = pullsAfter.get(i);
            return (
              <Fragment key={i}>
                {node}
                {pull ? <PullQuote pull={pull} /> : null}
              </Fragment>
            );
          })}
          {hasSources ? null : noteList}
        </div>

        <footer className='gtm-end'>
          {next ? (
            <Link className='gtm-next' href={storyHref(edition, next.slug)}>
              Read next: <span>{next.title}</span>
            </Link>
          ) : null}
          <Link className='gtm-all' href={homeOf(edition)}>
            All stories
          </Link>
        </footer>
      </article>
    </>
  );
}

/** '2026-10-19' as the byline prints it: 19 October 2026, never split across lines. */
function longDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).replace(/ /g, ' ');
}

/** '2026-10-19' as the folio dates the issue: October 2026. */
function issueMonth(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/* The opening spread: the folio along the top, then the headline, the deck
   and the byline on the paper, and the story's art across the other side,
   edge to edge and the window's full height. On a phone the art comes
   first and the words follow it. */
function Opener({ story }: { story: Story }) {
  // a title with a colon sets its first part as the headline and the rest under it
  const split = /^(.+?)\s*:\s*(.+)$/.exec(story.title);
  return (
    <header className='gtm-opener'>
      <div className='gtm-art'>
        <OpenerArt story={story} />
      </div>
      <div className='gtm-head'>
        <p className='gtm-folio'>
          <span>Atlas</span>
          <span>No. {pad(story.n)}</span>
          <span>{issueMonth(story.date)}</span>
        </p>
        <h1 className='gtm-title'>
          <Headline story={story} main={split ? split[1]! : null} />
        </h1>
        {split ? <p className='gtm-sub'>{split[2]}</p> : null}
        <p className='gtm-deck'>{story.summary}</p>
        <p className='gtm-byline'>
          <span>
            By <b>{story.authors.join(', ')}</b>
          </span>
          <span>{longDate(story.date)}</span>
          <span>{story.minutes} minute read</span>
        </p>
      </div>
    </header>
  );
}

/* Each story's headline in its own hand: Euclid's in the title as written,
   with Elements in italics; Designing docs with the people it is for in
   cobalt italics; Rewriting docs with a proofreader's caret after "humans"
   and "and agents" set in red as the insertion; Fuma Nama's name alone, his
   philosophy under it. */
function Headline({ story, main }: { story: Story; main: string | null }) {
  if (main) return <>{main}</>;
  if (story.slug === 'rewriting-our-docs') {
    const m = /^(.*?)\s+(and agents)$/.exec(story.title);
    if (m) {
      // the caret holds to the word it follows, so the insertion never opens a line on its own
      const before = m[1]!.split(' ');
      const last = before.pop();
      return (
        <>
          {before.join(' ')}{' '}
          <span className='gtm-insert-at'>
            {last}
            <svg className='gtm-caret' viewBox='0 0 24 30' aria-hidden='true'>
              <path d='M3 28 L12 6 L21 28' />
            </svg>
          </span>{' '}
          <em className='gtm-insert'>{m[2]}</em>
        </>
      );
    }
  }
  if (story.slug === 'designing-docs-for-humans') {
    const m = /^(.*)\s+(\S+)$/.exec(story.title);
    if (m)
      return (
        <>
          {m[1]} <em className='gtm-accent'>{m[2]}</em>
        </>
      );
  }
  return <Inline nodes={story.titleInline} />;
}

/** The opening's art: Euclid's 1607 scan with its title in Chinese and a vermilion chop, the live cover for the others. */
function OpenerArt({ story }: { story: Story }) {
  if (story.slug === 'translating-euclid')
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element -- the story's own scan, across the spread */}
        <img className='gtm-art-picture' src={story.cover} alt='' />
        <span className='gtm-art-vertical' lang='zh-Hant' aria-hidden='true'>
          幾何原本
        </span>
        <span className='gtm-art-chop' lang='zh-Hant' aria-hidden='true'>
          <span>幾何</span>
          <span>原本</span>
        </span>
      </>
    );
  return <Cover slug={story.slug} title='' lang='en' dir='ltr' picture={story.cover} playing />;
}

/* The mark over each section head, drawn for its story: Euclid's first
   construction (two circles and the triangle they make), the docs page as
   stacked isometric panels, a proofreader's caret, and a Fumadocs table of
   contents with its thumb on the rail. */
function Mark({ slug }: { slug: string }) {
  let drawing: ReactNode;
  switch (slug) {
    case 'translating-euclid':
      drawing = (
        <>
          <circle cx='15' cy='22' r='11' />
          <circle cx='27' cy='22' r='11' />
          <path d='M15 22 L27 22 L21 11.6 Z' />
        </>
      );
      break;
    case 'designing-docs-for-humans':
      drawing = (
        <>
          <path d='M21 8 L35 15 L21 22 L7 15 Z' />
          <path d='M7 21 L21 28 L35 21' />
          <path d='M7 27 L21 34 L35 27' />
        </>
      );
      break;
    case 'rewriting-our-docs':
      drawing = (
        <>
          <path d='M8 34 L21 10 L34 34' />
          <path d='M4 38 H38' />
        </>
      );
      break;
    default:
      // a table of contents: its rail with the thumb on it, and three headings, the middle one nested
      drawing = (
        <>
          <path d='M8 6 V36' />
          <path className='gtm-mark-thumb' d='M8 17 V25' />
          <path d='M15 10 H34 M21 21 H34 M15 32 H34' />
        </>
      );
  }
  return (
    <svg className='gtm-mark' viewBox='0 0 42 42' aria-hidden='true'>
      {drawing}
    </svg>
  );
}

/** A pull quote: the words large, with whoever said them under them. */
function PullQuote({ pull }: { pull: Pull }) {
  return (
    <figure className='gtm-pull'>
      <blockquote>
        <p>{pull.text}</p>
      </blockquote>
      {pull.by ? <figcaption>{pull.by}</figcaption> : null}
    </figure>
  );
}

/** A figure set wider than the text: Euclid's pictures and versions with their sourced captions, the live plates for the others. */
function FeatureFigure({ figure, story, hitItems, side = false }: { figure: PlateFigure; story: Story; hitItems: InlineNode[][]; side?: boolean }) {
  const printed = side || figure.live === 'stops' || Boolean(figure.caption?.length || figure.credit?.length);
  if (printed)
    return (
      <div className='gtm-figure' data-kind={side ? 'side' : figure.live ? 'live' : 'picture'}>
        <PrintFigure figure={figure} />
      </div>
    );
  return (
    <div className='gtm-figure' data-kind='plate'>
      <div className='gtp-inline-plate'>
        <Plate figure={figure} titles={story.titles} hitItems={hitItems} active mounted />
      </div>
    </div>
  );
}
