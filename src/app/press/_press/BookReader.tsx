'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { PlateFigure, Story } from './content';
import { useMountEffect } from './hooks';
import type { Inline as InlineNode } from './parse';
import { LIVE_CAPTION } from './plates/Plate';
import { StopsDemo } from './plates/Live';
import Cover from './ui/Cover';
import Inline from './ui/Inline';
import PressMark from './ui/PressMark';
import { SliderStyleContext } from './ui/StopSlider';

type Props = { story: Story; next: { slug: string; title: string } | null };

/* A story set as a printed book, after Tufte's pages: a running head in
   small caps, one column of serif text with a wide margin beside it, each
   figure in the flow of the text with its caption in the margin, and a
   carousel shown as small multiples under the frame being looked at. */
export default function BookReader({ story, next }: Props) {
  const { blocks, figures } = story;
  const [section, setSection] = useState(0);
  const headings = blocks.flatMap((b) => (b.kind === 'heading' ? [b] : []));

  useMountEffect(() => {
    // the running head names the last heading that has passed under it
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let at = 0;
        document.querySelectorAll<HTMLElement>('.gtp-print-page h2').forEach((h, i) => {
          if (h.getBoundingClientRect().top < 140) at = i + 1;
        });
        setSection(at);
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  });

  let figureCount = 0;
  let sectionCount = 0;
  // the first paragraph of the story and of each section opens in small capitals
  let lead = true;

  return (
    <SliderStyleContext value='book'>
      <div className='gtp gtp-print'>
        <header className='gtp-print-running'>
          <Link href='/press' className='gtp-print-home' aria-label='GT Atlas, all stories'>
            <PressMark size={18} />
          </Link>
          <span className='gtp-print-running-title'>{story.title}</span>
          <span className='gtp-print-running-section'>
            {section ? headings[section - 1]?.text : null}
            <span className='gtp-print-running-n'>{section || ''}</span>
          </span>
        </header>

        <article className='gtp-print-page'>
          <header className='gtp-print-titlepage'>
            <h1>{story.title}</h1>
            <p className='gtp-print-sub'>{story.summary}</p>
            <p className='gtp-print-by'>
              {story.authors.join(', ')}, {longDate(story.date)}
            </p>
          </header>
          <aside className='gtp-print-frontis' aria-label='Cover'>
            <Cover
              slug={story.slug}
              number={`No. ${String(story.n).padStart(2, '0')}`}
              title={story.title}
              authors={story.authors.join(', ')}
              lang='en'
              dir='ltr'
              picture={story.cover}
              playing
            />
          </aside>

          {blocks.map((block, i) => {
            switch (block.kind) {
              case 'heading':
                sectionCount += 1;
                lead = true;
                return (
                  <h2 key={i} id={block.id}>
                    <span className='gtp-print-h-n'>{sectionCount}</span>
                    {block.text}
                  </h2>
                );
              case 'para': {
                const opens = lead;
                lead = false;
                return (
                  <p key={i}>
                    <Lead nodes={block.inline} opens={opens} />
                  </p>
                );
              }
              case 'list': {
                const Tag = block.ordered ? 'ol' : 'ul';
                return (
                  <Tag key={i}>
                    {block.items.map((item, k) => (
                      <li key={k}>
                        <Inline nodes={item} />
                      </li>
                    ))}
                  </Tag>
                );
              }
              case 'rules':
                return (
                  <ul key={i}>
                    {block.items.map((rule, k) => (
                      <li key={k}>
                        <Inline nodes={rule.inline} />
                      </li>
                    ))}
                  </ul>
                );
              case 'note':
                return (
                  <blockquote key={i} className='gtp-print-quote'>
                    {block.paras.map((p, k) => (
                      <p key={k}>
                        <Inline nodes={p} />
                      </p>
                    ))}
                  </blockquote>
                );
              case 'figure': {
                const figure = figures[figureCount++];
                return figure ? <BookFigure key={i} figure={figure} /> : null;
              }
              default:
                return null;
            }
          })}

          <footer className='gtp-print-end'>
            {next ? (
              <Link href={`/press/${next.slug}`} className='gtp-print-next'>
                <span className='gtp-print-sc'>Next</span> {next.title}
              </Link>
            ) : null}
            <Link href='/press' className='gtp-print-index'>
              <span className='gtp-print-sc'>Back to the index</span>
            </Link>
          </footer>
        </article>
      </div>
    </SliderStyleContext>
  );
}

/** '2026-10-19' as a book prints it: October 19, 2026. */
function longDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  // no-break spaces, so the date never splits across lines
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).replace(/ /g, '\u00a0');
}

/** A paragraph whose first words are set in small capitals when it opens a section. */
function Lead({ nodes, opens }: { nodes: InlineNode[]; opens: boolean }) {
  const first = nodes[0];
  if (!opens || first?.t !== 'text') return <Inline nodes={nodes} />;
  const match = /^(\S+(?:\s+\S+)?)([\s\S]*)$/.exec(first.v);
  if (!match) return <Inline nodes={nodes} />;
  return (
    <>
      <span className='gtp-print-lead'>{match[1]}</span>
      <Inline nodes={[{ t: 'text', v: match[2] ?? '' }, ...nodes.slice(1)]} />
    </>
  );
}

/** One figure in the flow of the text, its caption in the margin beside it. */
function BookFigure({ figure }: { figure: PlateFigure }) {
  const [shown, setShown] = useState(0);
  const frames = figure.frames;
  const frame = frames[shown];
  const many = frames.length > 1;
  return (
    <figure className='gtp-print-fig' data-live={figure.live ? true : undefined}>
      <div className='gtp-print-media'>
        {figure.live === 'stops' ? <StopsDemo globe={false} /> : null}
        {frame ? (
          // eslint-disable-next-line @next/next/no-img-element -- the story's own scans, sized by the column
          <img src={frame.src} alt={frame.alt} loading='lazy' decoding='async' />
        ) : null}
        {many ? (
          <ol className='gtp-print-multiples' aria-label='Every view of this figure'>
            {frames.map((f, k) => (
              <li key={f.src}>
                <button type='button' aria-pressed={k === shown} aria-label={f.alt} onClick={() => setShown(k)}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- the story's own scans, as small multiples */}
                  <img src={f.src} alt='' loading='lazy' decoding='async' />
                </button>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
      <figcaption className='gtp-print-caption'>
        {figure.label ? <span className='gtp-print-sc'>{figure.label}</span> : null}
        {figure.live && !frame ? LIVE_CAPTION[figure.live] : (frame?.alt ?? '')}
        {many ? <span className='gtp-print-count'>{`${shown + 1} of ${frames.length}`}</span> : null}
      </figcaption>
    </figure>
  );
}
