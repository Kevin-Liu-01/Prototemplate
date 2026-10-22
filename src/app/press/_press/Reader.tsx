'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, useMemo, useRef, useState } from 'react';

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
import BookBody from './BookBody';
import { EditionContext, homeOf, storyHref, useEdition, type Edition } from './edition';
import { landed, move, plainClick } from './transition';
import Cover from './ui/Cover';
import type { ArtBox } from './gpu/emblems';
import { Headline, isShort, leadOf, Mark, placePulls, PullQuote, subtitleOf, useSlideIn } from './ui/Decor';
import { ArrowIcon, CalendarIcon, ClockIcon, IndexIcon, LiveIcon, LoopIcon, PenIcon, PinIcon, StillIcon, ViewsIcon } from './ui/icons';

type Props = { story: Story; next: { slug: string; title: string } | null; edition?: Edition };

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

/* Every story's page: the press's one reader. It owns what every look
   shares (the root with the story's look, the theme switch, the monogram
   home, the crossfade in and out) and sets the story's body in its look: the
   book look (Translating Euclid) as a printed book with its pictures on a
   stage (BookBody), the others split between the text and the stage. In the
   magazine (/press) the body takes the magazine's text decorations
   (ui/Decor.tsx, magazine.css); on the shelf (/press/shelf) it reads as it
   did before the magazine. */
export default function Reader({ story, next, edition = 'magazine' }: Props) {
  const router = useRouter();
  const home = homeOf(edition);

  // the crossfade from the shelf can run now that the story is on the page
  useMountEffect(() => {
    landed();
  });

  return (
    <EditionContext value={edition}>
    <SliderStyleContext value={story.look === 'fuma' ? 'mask' : story.look === 'book' ? 'book' : 'stops'}>
      <div
        className='gtp gtp-reader'
        data-edition={edition}
        data-look={story.look}
        data-story={story.slug}
        onClickCapture={(e) => {
          // every link home runs the crossfade
          const link = e.target instanceof Element ? e.target.closest(`a[href="${home}"]`) : null;
          if (!link || !plainClick(e)) return;
          e.preventDefault();
          e.stopPropagation();
          move((href) => router.push(href), home);
        }}
      >
        <ThemeSwitch className='gtp-reader-theme' />
        <Link href={home} className='gtp-float-home' aria-label='GT Atlas, all stories'>
          <PressMark size={26} />
        </Link>
        {story.look === 'book' ? <BookBody story={story} decorated={edition === 'magazine'} /> : <SplitBody story={story} next={next} decorated={edition === 'magazine'} />}
      </div>
    </SliderStyleContext>
    </EditionContext>
  );
}

/* The split reading view: the text on the left in Katagami Text, the stage
   on the right with the figure the reader has reached, and the ruler at the
   left edge. On a narrow screen the stage goes away and each figure's plate
   sits in the text where the figure was. */
function SplitBody({ story, next, decorated = false }: Props & { decorated?: boolean }) {
  const edition = useEdition();
  const { blocks, figures } = story;
  // the magazine's pull quotes and the paragraph that opens on the drop cap
  const pulls = useMemo(() => placePulls(decorated ? blocks : [], story.slug), [blocks, story.slug, decorated]);
  const lead = decorated ? leadOf(blocks) : -1;
  const sub = decorated ? subtitleOf(story.title) : null;
  const [plate, setPlate] = useState(0);
  const [section, setSection] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0, 1]));
  const [wide, setWide] = useState(true);
  const [marks, setMarks] = useState<RailMark[]>([]);
  const text = useRef<HTMLElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const rail = useRef<HTMLElement>(null);
  useSlideIn(text, decorated);

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
    const media = matchMedia(WIDE);
    const sync = () => setWide(media.matches);
    sync();
    media.addEventListener('change', sync);

    // the figure and section for the reader's place: the last block on the page whose top has passed the reading line,
    // so a jump or a fast scroll that lands between blocks still shows the right figure
    const settle = () => {
      const placed = [...(text.current?.querySelectorAll<HTMLElement>('[data-plate]') ?? [])];
      // a figure's stub is hidden in the magazine, so only blocks on the page count
      const last = placed.filter((el) => el.offsetHeight > 0 && el.getBoundingClientRect().top <= innerHeight * 0.4).at(-1);
      if (!last) return;
      show(Number(last.dataset.plate ?? 0));
      setSection(Number(last.dataset.section ?? 0));
    };
    requestAnimationFrame(settle);
    // the reader's place: the rail's lit lines, and the line along the top on a phone
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        const p = max > 0 ? Math.min(1, scrollY / max) : 0;
        progress.current?.style.setProperty('--p', String(p));
        rail.current?.style.setProperty('--p', String(p));
        settle();
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
    <>
      <span ref={progress} className='gtp-top-progress' aria-hidden='true' />
      <div className='gtp-reader-body'>
        {story.look === 'fuma' ? (
          <div className='gtp-fuma-nav'>
            <Link href={homeOf(edition)} className='gtp-fuma-home' aria-label='GT Atlas, all stories'>
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
            caption={decorated ? undefined : `${pad(section)}  ${sectionLabel}`}
          />
        )}

        <article ref={text} className='gtp-text'>
          <header className='gtp-title' data-plate={0} data-section={0}>
            {wide ? null : (
              <div className='gtp-phone-cover'>
                <StoryCover story={story} playing bare={decorated} />
              </div>
            )}
            {decorated ? (
              <>
                <h1>
                  <Headline story={story} />
                </h1>
                {sub ? <p className='gtm-sub'>{sub[1]}</p> : null}
                <p className='gtm-byline'>
                  <span>
                    By <b>{story.authors.join(', ')}</b>
                  </span>
                  <span>{longDate(story.date)}</span>
                  <span>{story.minutes} minute read</span>
                </p>
              </>
            ) : (
              <>
                <h1>{story.title}</h1>
                <p className='gtp-summary'>{story.summary}</p>
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
              </>
            )}
          </header>

          {blocks.map((block, i) => {
            const at = { 'data-plate': plateOf[i], 'data-section': sectionOf[i] };
            switch (block.kind) {
              case 'heading':
                return (
                  <h2 key={i} id={block.id} className={decorated ? 'gtm-h2' : undefined} {...at}>
                    {decorated ? <Mark slug={story.slug} /> : <span className='gtp-h-n'>{pad(sectionOf[i] ?? 0)}</span>}
                    {decorated ? <span>{block.text}</span> : block.text}
                  </h2>
                );
              case 'para': {
                const pull = pulls.get(i);
                return (
                  <Fragment key={i}>
                    <p className={i === lead ? 'gtm-lead' : undefined} data-short={i === lead && isShort(block) ? '' : undefined} {...at}>
                      <Inline nodes={block.inline} />
                    </p>
                    {pull ? <PullQuote pull={pull} {...at} /> : null}
                  </Fragment>
                );
              }
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
                <Link href={storyHref(edition, next.slug)}>{next.title}</Link>
              </>
            ) : null}
            <Link className='gtp-end-index' href={homeOf(edition)}>
              <IndexIcon size={14} />
              Back to the index
            </Link>
          </footer>
        </article>

        <aside className='gtp-stage-col' aria-label='Figures'>
          {wide ? (
            <div className='gtp-stage'>
              <section className='gtp-plate gtp-plate-cover' data-on={plate === 0} aria-hidden={plate !== 0} inert={plate !== 0} aria-label='Cover'>
                <StoryCover story={story} playing={plate === 0} bare={decorated} />
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
    </>
  );
}

/** '2026-10-19' as a byline prints it: 19 October 2026, never split across lines. */
function longDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).replace(/ /g, '\u00a0');
}

/** A story's live cover; bare, its art alone and centred, where the headline beside it already says the title. */
function StoryCover({ story, playing, bare = false }: { story: Story; playing: boolean; bare?: boolean }) {
  return <Cover slug={story.slug} title={bare ? '' : story.title} lang='en' dir='ltr' picture={story.cover} playing={playing} artAt={bare ? ART_CENTRE : undefined} />;
}

/** Where a bare cover's design draws: across the middle, with no title under it to make room for. */
const ART_CENTRE: ArtBox = { x: 0.12, y: 0.22, w: 0.76, h: 0.56 };

/** The kind of figure, as the stub and the plate head show it. */
export function FigureIcon({ figure }: { figure: Story['figures'][number] }) {
  if (figure.live) return <LiveIcon />;
  if (figure.frames.length > 1) return <ViewsIcon />;
  return figure.frames[0]?.video ? <LoopIcon /> : <StillIcon />;
}
