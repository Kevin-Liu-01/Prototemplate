'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, type CSSProperties } from 'react';

import type { PlateFigure, Story } from './content';
import { useMountEffect } from './hooks';
import { LIVE_CAPTION } from './plates/Plate';
import { VersionsDemo } from './plates/Live';
import Inline from './ui/Inline';
import PressMark from './ui/PressMark';
import StopSlider, { SliderStyleContext } from './ui/StopSlider';
import ThemeSwitch from './ui/ThemeSwitch';
import { landed, move, plainClick } from './transition';

type Props = { story: Story; next: { slug: string; title: string } | null };

/** The reader's place in the story: a rail down the left with a tick per section, or a ring around the imprint. */
const PROGRESS = ['rail', 'ring'] as const;
type Progress = (typeof PROGRESS)[number];

/* A story set like a magazine page: the cover picture across the page,
   then one centred column of large serif text on paper, with the figures in
   the flow of the text and their captions under them. One face throughout,
   in sentence case; paragraphs part by a blank line, not an indent. */
export default function BookReader({ story, next }: Props) {
  const router = useRouter();
  const { blocks, figures } = story;
  const [progress, setProgress] = useState<Progress>('rail');
  const [ticks, setTicks] = useState<number[]>([]);
  const root = useRef<HTMLDivElement>(null);

  useMountEffect(() => {
    // the move from the shelf can run now that the story is on the page
    landed();
    const asked = new URLSearchParams(location.search).get('progress');
    const known = PROGRESS.find((p) => p === asked);
    if (known) setProgress(known);

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        root.current?.style.setProperty('--p', String(max > 0 ? Math.min(1, scrollY / max) : 0));
        // the rail waits until the cover has scrolled mostly away, so it never runs over the picture
        const cover = root.current?.querySelector<HTMLElement>('.gtp-print-cover');
        if (root.current) root.current.dataset.read = String(!cover || scrollY > cover.offsetHeight * 0.6);
      });
    };
    // where each section starts, as a share of the scroll, for the rail's ticks
    const measure = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (max <= 0) return;
      const at = [...document.querySelectorAll<HTMLElement>('.gtp-print-page h2')].map((h) => Math.min(1, (h.getBoundingClientRect().top + scrollY - 120) / max));
      setTicks(at);
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const resize = new ResizeObserver(measure);
    if (root.current) resize.observe(root.current);
    return () => {
      removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
      resize.disconnect();
    };
  });

  const pickProgress = (next: string) => {
    const known = PROGRESS.find((p) => p === next);
    if (!known) return;
    setProgress(known);
    const url = new URL(location.href);
    url.searchParams.set('progress', known);
    history.replaceState(null, '', url);
  };

  let figureCount = 0;

  return (
    <SliderStyleContext value='book'>
      <div ref={root} className='gtp gtp-print' data-progress={progress}
      onClickCapture={(e) => {
        // every link home runs the move backwards: this story's cover shrinks into its book on the shelf
        const home = e.target instanceof Element ? e.target.closest('a[href="/press"]') : null;
        if (!home || !plainClick(e)) return;
        e.preventDefault();
        e.stopPropagation();
        move((href) => router.push(href), '/press', 'home', null, story.slug);
      }}
      >
        <Link href='/press' className='gtp-print-home' aria-label='GT Atlas, all stories'>
          <PressMark size={22} />
          {progress === 'ring' ? (
            <svg className='gtp-print-ring' viewBox='0 0 48 48' aria-hidden='true'>
              <circle cx='24' cy='24' r='22' pathLength='1' />
              <circle className='gtp-print-ring-fill' cx='24' cy='24' r='22' pathLength='1' />
            </svg>
          ) : null}
        </Link>
        <ThemeSwitch className='gtp-print-theme' />
        {progress === 'rail' ? (
          <span className='gtp-print-rail' aria-hidden='true'>
            {ticks.map((at, i) => (
              <span key={i} className='gtp-print-tick' style={{ '--at': at } as CSSProperties} />
            ))}
          </span>
        ) : null}

        <header className='gtp-print-opener'>
          {story.cover ? (
            <div className='gtp-print-cover'>
              {/* eslint-disable-next-line @next/next/no-img-element -- the story's own cover picture, full width */}
              <img src={story.cover} alt='' />
            </div>
          ) : null}
          <div className='gtp-print-card'>
            <h1>{story.title}</h1>
            <p className='gtp-print-sub'>{story.summary}</p>
            <p className='gtp-print-byline'>
              <span>By {story.authors.join(', ')}</span>
              <span>{longDate(story.date)}</span>
              <span>{story.minutes} minute read</span>
            </p>
          </div>
        </header>

        <article className='gtp-print-page'>
          {blocks.map((block, i) => {
            switch (block.kind) {
              case 'heading':
                return (
                  <h2 key={i} id={block.id}>
                    {block.text}
                  </h2>
                );
              case 'para':
                return (
                  <p key={i}>
                    <Inline nodes={block.inline} />
                  </p>
                );
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
                return figure ? <PrintFigure key={i} figure={figure} /> : null;
              }
              default:
                return null;
            }
          })}

          <footer className='gtp-print-end'>
            {next ? (
              <Link href={`/press/${next.slug}`} className='gtp-print-next'>
                Next: {next.title}
              </Link>
            ) : null}
            <Link href='/press' className='gtp-print-index'>
              Back to the index
            </Link>
          </footer>
        </article>

        <div className='gtp-print-try'>
          <StopSlider stops={PROGRESS.map((p) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))} value={progress} onChange={pickProgress} label='Progress' />
        </div>
      </div>
    </SliderStyleContext>
  );
}

/** '2026-10-19' as the page prints it: 19 October 2026. */
function longDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  // no-break spaces, so the date never splits across lines
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).replace(/ /g, ' ');
}

/** One figure in the flow of the text, its caption under it; a carousel shows the frame chosen above a row of all of them. */
function PrintFigure({ figure }: { figure: PlateFigure }) {
  const [shown, setShown] = useState(0);
  const frames = figure.frames;
  const frame = frames[shown];
  const many = frames.length > 1;
  return (
    <figure className='gtp-print-fig' data-live={figure.live ? true : undefined}>
      {figure.live === 'stops' ? <VersionsDemo /> : null}
      {frame ? (
        // eslint-disable-next-line @next/next/no-img-element -- the story's own scans, sized by the column
        <img className='gtp-print-media' src={frame.src} alt={frame.alt} loading='lazy' decoding='async' />
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
      <figcaption className='gtp-print-caption'>
        {figure.live && !frame ? LIVE_CAPTION[figure.live] : (frame?.alt ?? '')}
        {many ? <span className='gtp-print-count'>{`${shown + 1} of ${frames.length}`}</span> : null}
      </figcaption>
    </figure>
  );
}
