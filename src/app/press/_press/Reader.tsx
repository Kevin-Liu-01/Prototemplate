'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

import type { Story } from './content';
import { dmsPair } from './coords';
import { useMountEffect } from './hooks';
import type { Block } from './parse';
import Plate, { pad } from './plates/Plate';
import Inline from './ui/Inline';
import PressMark from './ui/PressMark';
import MaskToc from './ui/MaskToc';
import Rail, { type RailMark } from './ui/Rail';
import { SliderStyleContext } from './ui/StopSlider';
import ThemeSwitch from './ui/ThemeSwitch';
import { landed, move, plainClick } from './transition';
import Cover from './ui/Cover';
import { ArrowIcon, CalendarIcon, ClockIcon, IndexIcon, LiveIcon, LoopIcon, PenIcon, PinIcon, StillIcon, ViewsIcon } from './ui/icons';

type Props = { story: Story; next: { slug: string; title: string } | null };

const WIDE = '(min-width: 1000px)';

/** Which plate each block shows: a figure from the paragraph that introduces it until the next one; the cover before the first. */
function platesFor(blocks: Block[], figureIndex: Map<number, number>): number[] {
  let current = 0;
  return blocks.map((block, i) => {
    const next = blocks[i + 1];
    if (block.kind === 'figure') current = figureIndex.get(i) ?? current;
    else if (next?.kind === 'figure') current = figureIndex.get(i + 1) ?? current;
    return current;
  });
}

/* The reading view: the text on the left in Katagami Text, the stage on
   the right with the figure the reader has reached, and the ruler at the
   left edge. On a narrow screen the stage goes away and each figure's
   plate sits in the text where the figure was. */
export default function Reader({ story, next }: Props) {
  const router = useRouter();
  const { blocks, figures } = story;
  const [plate, setPlate] = useState(0);
  const [section, setSection] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0, 1]));
  const [wide, setWide] = useState(true);
  const [marks, setMarks] = useState<RailMark[]>([]);
  const text = useRef<HTMLElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const rail = useRef<HTMLElement>(null);

  const { plateOf, sectionOf, headings } = useMemo(() => {
    const figureIndex = new Map<number, number>();
    let n = 0;
    blocks.forEach((b, i) => {
      if (b.kind === 'figure') figureIndex.set(i, ++n);
    });
    let s = 0;
    const sectionOf = blocks.map((b) => (b.kind === 'heading' ? ++s : s));
    const headings = blocks.flatMap((b) => (b.kind === 'heading' ? [b] : []));
    return { plateOf: platesFor(blocks, figureIndex), sectionOf, headings };
  }, [blocks]);

  const hitItems = useMemo(() => {
    const lists = blocks.filter((b): b is Extract<Block, { kind: 'list' }> => b.kind === 'list');
    return lists.at(-1)?.items ?? [];
  }, [blocks]);

  const show = (p: number) => {
    setPlate(p);
    setSeen((prev) => (prev.has(p) && prev.has(p + 1) ? prev : new Set([...prev, p - 1, p, p + 1])));
  };

  useMountEffect(() => {
    // the move from the shelf can run now that the story is on the page
    landed();
    const media = matchMedia(WIDE);
    const sync = () => setWide(media.matches);
    sync();
    media.addEventListener('change', sync);

    // the reader's place: the rail's lit lines, and the line along the top on a phone
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        const p = max > 0 ? Math.min(1, scrollY / max) : 0;
        progress.current?.style.setProperty('--p', String(p));
        rail.current?.style.setProperty('--p', String(p));
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // which block sits on the reading line
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          show(Number(el.dataset.plate ?? 0));
          setSection(Number(el.dataset.section ?? 0));
        }
      },
      { rootMargin: '-38% 0px -57% 0px' }
    );
    text.current?.querySelectorAll('[data-plate]').forEach((el) => observer.observe(el));

    // the rail's numbered ticks sit where each section's heading reaches the top
    const measure = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (max <= 0) return;
      const list: RailMark[] = [{ key: 'top', label: story.title, at: 0 }];
      text.current?.querySelectorAll<HTMLElement>('h2[id]').forEach((h) => {
        const top = h.getBoundingClientRect().top + scrollY - 40;
        list.push({ key: h.id, label: h.textContent ?? '', at: Math.max(0, Math.min(1, top / max)) });
      });
      setMarks(list);
    };
    const resize = new ResizeObserver(measure);
    if (text.current) resize.observe(text.current);
    void document.fonts?.ready.then(measure);

    return () => {
      media.removeEventListener('change', sync);
      removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
    };
  });

  const seekTo = (fraction: number) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    scrollTo({ top: fraction * max });
  };

  const jump = (i: number) => {
    if (i === 0) return scrollTo({ top: 0 });
    const id = marks[i]?.key;
    const el = id ? document.getElementById(id) : null;
    el?.scrollIntoView({ block: 'start' });
  };

  const sectionLabel = section === 0 ? 'Opening' : (headings[section - 1]?.text ?? '');
  let figureCount = 0;

  return (
    <SliderStyleContext value={story.look === 'fuma' ? 'mask' : story.look === 'book' ? 'book' : 'stops'}>
    <div className='gtp gtp-reader' data-look={story.look}
      onClickCapture={(e) => {
        // every link home runs the move backwards: this story's cover shrinks into its book on the shelf
        const home = e.target instanceof Element ? e.target.closest('a[href="/press"]') : null;
        if (!home || !plainClick(e)) return;
        e.preventDefault();
        e.stopPropagation();
        move((href) => router.push(href), '/press', 'home', null, story.slug);
      }}
    >
      <span ref={progress} className='gtp-top-progress' aria-hidden='true' />
      <ThemeSwitch className='gtp-reader-theme' />
      <Link href='/press' className='gtp-float-home' aria-label='GT Atlas, all stories'>
        <PressMark size={26} />
      </Link>

      <div className='gtp-reader-body'>
        {story.look === 'fuma' ? (
          <div className='gtp-fuma-nav'>
            <Link href='/press' className='gtp-fuma-home' aria-label='GT Atlas, all stories'>
              <PressMark size={24} />
            </Link>
            <MaskToc items={headings} current={section} label='Sections' />
          </div>
        ) : (
          <Rail
            marks={marks}
            current={section}
            onSeek={seekTo}
            onJump={jump}
            railRef={rail}
            label='Sections'
            caption={`${pad(section)}  ${sectionLabel}`}
          />
        )}

        <article ref={text} className='gtp-text'>
          <header className='gtp-title' data-plate={0} data-section={0}>
            {wide ? null : (
              <div className='gtp-phone-cover'>
                <StoryCover story={story} playing />
              </div>
            )}
            <h1>{story.title}</h1>
            <p className='gtp-summary'>{story.summary}</p>
            {story.look === 'book' ? (
              <p className='gtp-byline'>
                <span>By {story.authors.join(', ')}</span>
                <span>
                  {longDate(story.date)} · {story.minutes} minute read
                </span>
              </p>
            ) : (
              <dl className='gtp-meta'>
                <dt>
                  <PenIcon size={13} />
                  By
                </dt>
                <dd>{story.authors.join(', ')}</dd>
                <dt>
                  <CalendarIcon size={13} />
                  Published
                </dt>
                <dd>{story.date}</dd>
                <dt>
                  <ClockIcon size={13} />
                  Reading
                </dt>
                <dd>
                  {story.minutes} minutes, {figures.length} figures
                </dd>
                <dt>
                  <PinIcon size={13} />
                  Filed from
                </dt>
                <dd className='gtp-mono'>{dmsPair(story.dateline)}</dd>
              </dl>
            )}
          </header>

          {blocks.map((block, i) => {
            const at = { 'data-plate': plateOf[i], 'data-section': sectionOf[i] };
            switch (block.kind) {
              case 'heading':
                return (
                  <h2 key={i} id={block.id} {...at}>
                    <span className='gtp-h-n'>{pad(sectionOf[i] ?? 0)}</span>
                    {block.text}
                  </h2>
                );
              case 'para':
                return (
                  <p key={i} {...at}>
                    <Inline nodes={block.inline} />
                  </p>
                );
              case 'list': {
                const Tag = block.ordered ? 'ol' : 'ul';
                return (
                  <Tag key={i} {...at}>
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
                  <ul key={i} className='gtp-rules' {...at}>
                    {block.items.map((rule, k) => (
                      <li key={k} data-ok={rule.ok}>
                        <span className='gtp-rule-mark' aria-label={rule.ok ? 'Do' : 'Do not'}>
                          {rule.ok ? '✓' : '✕'}
                        </span>
                        <Inline nodes={rule.inline} />
                      </li>
                    ))}
                  </ul>
                );
              case 'note':
                return (
                  <aside key={i} className='gtp-note' {...at}>
                    {block.paras.map((p, k) => (
                      <p key={k}>
                        <Inline nodes={p} />
                      </p>
                    ))}
                  </aside>
                );
              case 'figure': {
                const figure = figures[figureCount++];
                if (!figure) return null;
                return wide ? (
                  <button
                    key={i}
                    type='button'
                    className='gtp-stub'
                    data-on={plate === figure.n}
                    onClick={() => show(figure.n)}
                    {...at}
                  >
                    <FigureIcon figure={figure} />
                    <span className='gtp-mono'>Fig. {pad(figure.n)}</span>
                    <span className='gtp-stub-text'>{figure.label ?? figure.frames[0]?.alt}</span>
                    <ArrowIcon size={14} />
                  </button>
                ) : (
                  <div key={i} className='gtp-inline-plate' {...at}>
                    <Plate figure={figure} titles={story.titles} hitItems={hitItems} active mounted />
                  </div>
                );
              }
              default:
                return null;
            }
          })}

          <footer className='gtp-end'>
            {next ? (
              <>
                <span className='gtp-end-label'>Next</span>
                <Link href={`/press/${next.slug}`}>{next.title}</Link>
              </>
            ) : null}
            <Link className='gtp-end-index' href='/press'>
              <IndexIcon size={14} />
              Back to the index
            </Link>
          </footer>
        </article>

        <aside className='gtp-stage-col' aria-label='Figures'>
          {wide ? (
            <div className='gtp-stage'>
              <section className='gtp-plate gtp-plate-cover' data-on={plate === 0} aria-hidden={plate !== 0} inert={plate !== 0} aria-label='Cover'>
                <StoryCover story={story} playing={plate === 0} />
              </section>
              {figures.map((figure) => (
                <Plate
                  key={figure.id + figure.n}
                  figure={figure}
                  titles={story.titles}
                  hitItems={hitItems}
                  active={plate === figure.n}
                  mounted={seen.has(figure.n)}
                />
              ))}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
    </SliderStyleContext>
  );
}

/** '2026-10-19' as a printed page gives it: 19 October 2026, never split across lines. */
function longDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).replace(/ /g, '\u00a0');
}

/** A story's cover: its own picture for the book look, the live cover for the others. */
function StoryCover({ story, playing }: { story: Story; playing: boolean }) {
  if (story.look === 'book') {
    // eslint-disable-next-line @next/next/no-img-element -- the story's own cover picture, filling the plate
    return <img className='gtp-cover gtp-cover-picture' src={story.cover} alt='' />;
  }
  return <Cover slug={story.slug} title={story.title} lang='en' dir='ltr' picture={story.cover} playing={playing} />;
}

/** The kind of figure, as the stub and the plate head show it. */
export function FigureIcon({ figure }: { figure: Story['figures'][number] }) {
  if (figure.live) return <LiveIcon />;
  if (figure.frames.length > 1) return <ViewsIcon />;
  return figure.frames[0]?.video ? <LoopIcon /> : <StillIcon />;
}
