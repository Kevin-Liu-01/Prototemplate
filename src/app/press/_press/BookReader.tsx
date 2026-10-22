'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, useMemo, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';

import type { PlateFigure, Story } from './content';
import type { Block, Inline as InlineNode } from './parse';
import { useMountEffect } from './hooks';
import { LIVE_CAPTION } from './plates/Plate';
import { VersionsDemo } from './plates/Live';
import Inline from './ui/Inline';
import PressMark from './ui/PressMark';
import { SliderStyleContext } from './ui/StopSlider';
import ThemeSwitch from './ui/ThemeSwitch';
import { landed, move, plainClick } from './transition';

type Props = { story: Story; next: { slug: string; title: string } | null };

/** From this width the text keeps to the left half and the pictures show on a stage across the right half; below it each picture follows its paragraph. */
const WIDE = '(min-width: 1250px)';

/** How tall a picture may stand on the stage, leaving room for its caption, and 15% short of that so it does not fill the stage. */
const STAGE_TALLEST = 'calc((100dvh - 300px) * 0.85)';

/* Which picture the stage shows: the cover
   until the reader reaches the first picture, then each in turn, as the
   press's other stories show their figures. Every picture belongs to the
   paragraph before it, the one about it, and comes on when that
   paragraph's first line reaches the middle of the window, so it shows
   while its paragraph is read; a live figure, such as the globe, belongs to
   all the text that leads up to it, from the picture before it, or, when it
   is the first, from where the story's first line is still a third of a
   window down (for the globe, the moment the story fades in after the
   epigraph, and the rest of the introduction). When the sources begin the
   stage empties. Pictures that follow one paragraph each get at least a
   seventh of a window, in the order of the page, and the last ones still
   come on before the sources.

   The change is the scroll's own, as a close read changes its picture: over
   the first stretch of a picture's turn (up to a third of a window) the one
   before fades out and then it fades in, the two barely overlapping, so
   their captions never print over each other; the pictures themselves hold
   still. Under reduced motion, or with no stage, each picture simply shows.
   Positions come from the layout (offsetTop, never a box that a scroll
   animation may have moved), since the pictures themselves are not in the
   text on a wide screen. */
function showStage(page: HTMLElement, stage: Element | null): number {
  const places: number[] = [];
  for (const mark of page.querySelectorAll<HTMLElement>('.gtp-print-at')) {
    if (mark.dataset.live) {
      places.push(places.at(-1) ?? innerHeight * 0.15);
      continue;
    }
    let above = mark.previousElementSibling;
    while (above?.matches('.gtp-print-at, .gtp-print-m, .gtp-print-fig')) above = above.previousElementSibling;
    places.push(above instanceof HTMLElement ? above.offsetTop : mark.offsetTop);
  }
  // the sources heading is one more stop, with nothing on it, so the last picture goes when the sources begin
  const sources = page.querySelector<HTMLElement>('h2#sources');
  if (sources) places.push(sources.offsetTop);
  const top = docTop(page) - scrollY;
  const read = innerHeight * 0.5 - top;
  // the furthest the reading line goes, with the page scrolled to its end
  const last = document.documentElement.scrollHeight - innerHeight - scrollY + innerHeight * 0.5 - top - 40;
  const hold = innerHeight * 0.15;
  const starts = places.slice();
  for (let k = 1; k < starts.length; k++) starts[k] = Math.max(starts[k] ?? 0, (starts[k - 1] ?? 0) + hold);
  for (let k = starts.length - 1, cap = last; k >= 0; k--) {
    starts[k] = Math.min(starts[k] ?? 0, cap);
    cap = (starts[k] ?? 0) - hold;
  }
  const at = starts.filter((start) => start <= read).length;

  const items = stage ? [...stage.querySelectorAll<HTMLElement>('.gtp-print-stage-item')] : [];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia(WIDE).matches) {
    for (const el of items) el.style.removeProperty('opacity');
    return at;
  }
  // each item's turn on the stage, from where it comes on to where the next does; the cover's from the page's top
  const begins = [innerHeight * 0.5 - (top + scrollY), ...starts, last + innerHeight * 0.5];
  const share = (k: number, length: number) => Math.min(1, Math.max(0, (read - (begins[k] ?? 0)) / Math.max(1, length)));
  const turn = (k: number) => (begins[k + 1] ?? 0) - (begins[k] ?? 0);
  const arrived = at === 0 ? 1 : share(at, Math.min(innerHeight / 3, turn(at)));
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  items.forEach((el, k) => {
    const opacity = k === at ? clamp((arrived - 0.4) / 0.6) : k === at - 1 ? clamp(1 - arrived / 0.6) : 0;
    el.style.opacity = String(Math.round(opacity * 1000) / 1000);
  });
  return at;
}

/** Where an element sits in the page, by the layout alone: a scroll animation's translate does not move it. */
function docTop(el: HTMLElement): number {
  let y = 0;
  for (let node: HTMLElement | null = el; node; node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null) y += node.offsetTop;
  return y;
}

/** A section's tick on the rail: its heading's id and words, and where it starts as a share of the scroll. */
type Tick = { id: string; label: string; at: number };

/** A picture's box from its known size, so the page holds its place before it loads: as wide as the room allows, no taller than `tallest`; an upright picture smaller by the page's --gtp-upright (85%, less on a phone). */
function sized(frame: { width?: number; height?: number }, tallest: string): CSSProperties | undefined {
  if (!frame.width || !frame.height) return undefined;
  const scale = frame.height > frame.width ? 'var(--gtp-upright, 0.85)' : '1';
  return { width: `min(${scale} * 100%, ${tallest} * ${scale} * ${frame.width / frame.height})`, aspectRatio: `${frame.width} / ${frame.height}` };
}

/** A quotation the story sets apart: the epigraph at its head, or a quotation in its text. */
function Quote({ block }: { block: Extract<Block, { kind: 'note' }> }) {
  return (
    <blockquote className={block.name === 'Epigraph' ? 'gtp-print-epigraph' : 'gtp-print-quote'}>
      {block.paras.map((p, k) => (
        <p key={k}>
          <Inline nodes={p} />
        </p>
      ))}
    </blockquote>
  );
}

/** A small picture as a one-frame figure, so it shows as every picture does: on the stage beside the text, or centred in the text on a narrow screen. */
function sideFigure(b: Extract<Block, { kind: 'side' }>): PlateFigure {
  return { id: b.frame.src, label: null, frames: [b.frame], caption: b.caption, credit: b.credit, n: 0, live: null, light: null };
}

/** Where a picture's (Source) leads: the first link its credit carries, else the list of sources. */
function sourceOf(credit: InlineNode[] | undefined): string | null {
  if (!credit?.length) return null;
  const find = (nodes: InlineNode[]): string | null => {
    for (const node of nodes) {
      if (node.t === 'link') return node.href;
      if (node.t === 'strong' || node.t === 'em') {
        const href = find(node.c);
        if (href) return href;
      }
    }
    return null;
  };
  return find(credit) ?? '#sources';
}

/** A picture's caption ending in a link to its source, as one sentence: … (Source). The full citation stays in the list of sources. */
function Captioned({ caption, credit }: { caption?: InlineNode[]; credit?: InlineNode[] }) {
  const href = sourceOf(credit);
  const away = href && !href.startsWith('#') ? { target: '_blank', rel: 'noreferrer' } : {};
  return (
    <>
      {caption?.length ? <Inline nodes={caption} /> : null}
      {href ? (
        <>
          {caption?.length ? ' ' : null}(
          <a className='gtp-print-source' href={href} {...away}>
            Source
          </a>
          )
        </>
      ) : null}
    </>
  );
}

/** The glide under way, so a second press of the rail takes over from the first. */
let gliding: (() => void) | null = null;

/** Scrolls to `to` slowly, eased at both ends; a wheel, touch or key from the reader stops it, and it jumps when the reader asked for less motion. */
function glide(to: number) {
  gliding?.();
  const from = scrollY;
  const distance = to - from;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || Math.abs(distance) < 2) {
    scrollTo({ top: to, behavior: 'instant' });
    return;
  }
  const duration = Math.min(1800, 800 + Math.abs(distance) * 0.06);
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  let start = 0;
  let frame = 0;
  const stop = () => {
    cancelAnimationFrame(frame);
    removeEventListener('wheel', stop);
    removeEventListener('touchstart', stop);
    removeEventListener('keydown', stop);
    gliding = null;
  };
  const step = (now: number) => {
    start ||= now;
    const t = Math.min(1, (now - start) / duration);
    scrollTo({ top: from + distance * ease(t), behavior: 'instant' });
    if (t < 1) frame = requestAnimationFrame(step);
    else stop();
  };
  addEventListener('wheel', stop, { passive: true });
  addEventListener('touchstart', stop, { passive: true });
  addEventListener('keydown', stop);
  gliding = stop;
  frame = requestAnimationFrame(step);
}

/** The note numbers in a run of text, in order. */
function notesIn(nodes: InlineNode[]): string[] {
  return nodes.flatMap((node) => (node.t === 'fn' ? [node.n] : node.t === 'strong' || node.t === 'em' || node.t === 'link' ? notesIn(node.c) : []));
}

/** A zero-size box set just before a node gives the baseline of its line. */
function baseline(node: Element): number {
  const mark = document.createElement('span');
  mark.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
  node.before(mark);
  const y = mark.getBoundingClientRect().top;
  mark.remove();
  return y;
}

/* Sets the margin's notes by hand on a wide screen: each with its first line
   on its number's line, in order, each pushed down only as far as the one
   above it needs and below any wide picture in its way, with room to spare. */
function placeMargin(page: HTMLElement) {
  const items = [...page.querySelectorAll<HTMLElement>('.gtp-print-note')];
  if (!matchMedia(WIDE).matches) {
    for (const el of items) el.style.top = '';
    return;
  }
  const box = page.getBoundingClientRect();
  const edge = box.right + 24;
  const blocked = [...page.querySelectorAll('.gtp-print-media, .gtp-print-multiples, .gtp-versions')]
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.right > edge)
    .map((r) => ({ top: r.top - box.top, bottom: r.bottom - box.top }));

  let floor = -Infinity;
  for (const el of items) {
    const ref = el.dataset.ref ? document.getElementById(el.dataset.ref) : null;
    if (!ref) continue;
    const lead = baseline(el.querySelector('.gtp-print-n') ?? el) - el.getBoundingClientRect().top;
    const want = baseline(ref) - box.top - lead;
    const h = el.offsetHeight;
    let y = Math.max(want, floor);
    for (const r of blocked) if (y < r.bottom + 24 && y + h > r.top - 24) y = r.bottom + 24;
    el.style.top = `${Math.round(y)}px`;
    floor = y + h + 16;
  }
}

/* A story set like a book and laid out as the press's other stories: on a
   wide screen the title page and then the text keep to the left half, and a
   stage across the right half shows the cover and then each picture with its
   caption as the reader reaches it. On a narrow screen the cover heads the
   page and each picture follows its paragraph. One face throughout, in
   sentence case; paragraphs part by a blank line, not an indent. */
export default function BookReader({ story }: Props) {
  const router = useRouter();
  const { blocks, figures } = story;
  const [ticks, setTicks] = useState<Tick[]>([]);
  const root = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLElement>(null);
  // the stage's pictures in the order of the page, after the cover: each figure, and each small picture as a one-frame figure
  const pictures = useMemo(() => {
    let n = 0;
    return blocks.flatMap((b): PlateFigure[] => {
      if (b.kind === 'figure') {
        const figure = figures[n++];
        return figure ? [figure] : [];
      }
      if (b.kind === 'side') return [sideFigure(b)];
      return [];
    });
  }, [blocks, figures]);
  const [stage, setStage] = useState(0);
  // the epigraph that heads the story, which the opening shows as its second slide
  const epigraph = blocks[0]?.kind === 'note' && blocks[0].name === 'Epigraph' ? blocks[0] : null;
  const notes = useMemo(() => new Map(blocks.flatMap((b) => (b.kind === 'footnote' ? [[b.n, b.inline] as const] : []))), [blocks]);

  useMountEffect(() => {
    // the move from the shelf can run now that the story is on the page
    landed();
    let frame = 0;
    const onScroll = () => {
      if (page.current) setStage(showStage(page.current, root.current?.querySelector('.gtp-print-stage') ?? null));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        root.current?.style.setProperty('--p', String(max > 0 ? Math.min(1, scrollY / max) : 0));
        // where the cover heads the page (a narrow screen), the rail waits until it has scrolled mostly away
        const cover = root.current?.querySelector<HTMLElement>('.gtp-head-pic');
        if (root.current) root.current.dataset.read = String(!cover?.offsetHeight || scrollY > cover.offsetHeight * 0.6);
      });
    };
    // where each section starts, as a share of the scroll, for the rail's ticks; the pictures hold their size, so these stay put
    const measure = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (max <= 0) return;
      const marks = [...document.querySelectorAll<HTMLElement>('.gtp-print-page h2')].map((h) => ({
        id: h.id,
        label: h.textContent ?? '',
        at: Math.round(Math.min(1, Math.max(0, (docTop(h) - 120) / max)) * 1000) / 1000,
      }));
      setTicks((old) => (old.length === marks.length && old.every((t, k) => t.at === marks[k]?.at) ? old : marks));
    };
    // the margin, set again whenever the page reflows: a font arriving, a picture loading, the window resizing
    const place = () => {
      if (page.current) placeMargin(page.current);
    };
    const reflow = () => {
      measure();
      place();
      if (page.current) setStage(showStage(page.current, root.current?.querySelector('.gtp-print-stage') ?? null));
    };
    // a note's number and the note light up together
    const lit = (on: boolean) => (e: MouseEvent) => {
      const hit = e.target instanceof Element ? e.target.closest<HTMLElement>('.gtp-fn, .gtp-print-note') : null;
      if (!hit) return;
      const n = hit.id.replace(/^fn(ref)?-/, '');
      for (const id of [`fn-${n}`, `fnref-${n}`]) document.getElementById(id)?.classList.toggle('is-lit', on);
    };
    const over = lit(true);
    const out = lit(false);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const resize = new ResizeObserver(reflow);
    if (root.current) resize.observe(root.current);
    const margin = matchMedia(WIDE);
    margin.addEventListener('change', reflow);
    addEventListener('load', reflow);
    void document.fonts?.ready.then(reflow);
    reflow();
    root.current?.addEventListener('mouseover', over);
    root.current?.addEventListener('mouseout', out);
    // a picture loading anywhere in the page moves what follows it (load does not bubble, so it is caught on the way down)
    page.current?.addEventListener('load', reflow, true);
    return () => {
      page.current?.removeEventListener('load', reflow, true);
      margin.removeEventListener('change', reflow);
      removeEventListener('load', reflow);
      removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
      resize.disconnect();
      root.current?.removeEventListener('mouseover', over);
      root.current?.removeEventListener('mouseout', out);
    };
  });

  // the rail moves the reader: anywhere on the line to that share of the story (its top to the start), a tick to its section
  const seek = (e: ReactMouseEvent<HTMLElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const max = document.documentElement.scrollHeight - innerHeight;
    glide(Math.max(0, Math.min(1, (e.clientY - box.top) / box.height)) * max);
  };
  const toSection = (id: string) => {
    const heading = document.getElementById(id);
    if (heading) glide(docTop(heading) - 80);
  };

  // the notes a block's numbers call for, set after it
  const marginNotes = (nodes: InlineNode[]) =>
    notesIn(nodes).map((n) => {
      const note = notes.get(n);
      return note ? (
        <aside key={`fn-${n}`} id={`fn-${n}`} data-ref={`fnref-${n}`} className='gtp-print-m gtp-print-note'>
          <span className='gtp-print-n'>{n}.</span> <Inline nodes={[...note]} />
        </aside>
      ) : null;
    });

  let figureCount = 0;

  return (
    <SliderStyleContext value='book'>
      <div
        ref={root}
        className='gtp gtp-print'
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
        </Link>
        <ThemeSwitch className='gtp-print-theme' />
        <nav className='gtp-print-rail' aria-label='Sections'>
          <button type='button' className='gtp-print-track' tabIndex={-1} aria-hidden='true' onClick={seek} />
          {ticks.map((t) => (
            <button
              key={t.id}
              type='button'
              className='gtp-print-tick'
              style={{ '--at': t.at } as CSSProperties}
              data-label={t.label}
              aria-label={t.label}
              onClick={() => toSection(t.id)}
            />
          ))}
        </nav>

        <div className='gtp-print-body'>
          <div className='gtp-print-text'>
            {/* the opening as slides on a wide screen: the title page, then the epigraph where it stood, then the story (press.css, the opening) */}
            <div className='gtp-print-opening'>
              <div className='gtp-print-opening-frame'>
                <Opener story={story} />
                {epigraph ? (
                  <div className='gtp-print-opening-next'>
                    <Quote block={epigraph} />
                  </div>
                ) : null}
              </div>
            </div>

            <article ref={page} className='gtp-print-page'>
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
                      <Fragment key={i}>
                        <p>
                          <Inline nodes={block.inline} />
                        </p>
                        {marginNotes(block.inline)}
                      </Fragment>
                    );
                  case 'list': {
                    const Tag = block.ordered ? 'ol' : 'ul';
                    return (
                      <Fragment key={i}>
                        <Tag>
                          {block.items.map((item, k) => (
                            <li key={k}>
                              <Inline nodes={item} />
                            </li>
                          ))}
                        </Tag>
                        {marginNotes(block.items.flat())}
                      </Fragment>
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
                    if (block.name === 'Sources')
                      return (
                        <div key={i} id='gtp-sources' className='gtp-print-sources'>
                          {block.paras.map((p, k) => (
                            <p key={k}>
                              <Inline nodes={p} />
                            </p>
                          ))}
                        </div>
                      );
                    return <Quote key={i} block={block} />;
                  case 'figure': {
                    const figure = figures[figureCount++];
                    if (!figure) return null;
                    // the mark holds the picture's place for the stage; the picture itself shows here only on a narrow screen
                    return (
                      <Fragment key={i}>
                        <span className='gtp-print-at' data-live={figure.live ? true : undefined} aria-hidden='true' />
                        <PrintFigure figure={figure} />
                      </Fragment>
                    );
                  }
                  case 'side':
                    return (
                      <Fragment key={i}>
                        <span className='gtp-print-at' aria-hidden='true' />
                        <PrintFigure figure={sideFigure(block)} />
                      </Fragment>
                    );
                  default:
                    return null;
                }
              })}
            </article>
          </div>

          {/* the stage across the right half on a wide screen: the cover, then each picture in turn; only the pictures beside the one shown are mounted, so the next is ready to fade in */}
          <aside className='gtp-print-stage' aria-label='Pictures'>
            <div className='gtp-print-stage-item gtp-print-stage-cover' data-shown={stage === 0}>
              {story.cover ? (
                // eslint-disable-next-line @next/next/no-img-element -- the story's own cover picture, across the stage
                <img src={story.cover} alt='' />
              ) : null}
            </div>
            {pictures.map((figure, k) => (
              <div key={figure.id} className='gtp-print-stage-item' data-shown={stage === k + 1}>
                {Math.abs(stage - (k + 1)) <= 1 ? <PrintFigure figure={figure} tallest={STAGE_TALLEST} /> : null}
              </div>
            ))}
          </aside>
        </div>

      </div>
    </SliderStyleContext>
  );
}

/* The story's opening, as an open book: the title page, with the title, a
   short rule, the author and the date at its foot, on the left half, and
   the cover edge to edge across the right half at the screen's full height
   (on a wide screen the cover is the stage's first picture instead). */
function Opener({ story }: { story: Story }) {
  return (
    <header className='gtp-print-opener gtp-head-spread'>
      <div className='gtp-head-leaf gtp-head-pic'>
        {story.cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- the story's own cover picture
          <img src={story.cover} alt='' />
        ) : null}
      </div>
      <div className='gtp-head-leaf gtp-head-title'>
        <h1>
          <Inline nodes={story.titleInline} />
        </h1>
        <span className='gtp-head-mark' aria-hidden='true' />
        <p className='gtp-head-by'>By {story.authors.join(', ')}</p>
        <p className='gtp-head-date'>{longDate(story.date)}</p>
      </div>
    </header>
  );
}

/** '2026-10-19' as the page prints it: October 19th, 2026. */
function longDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  const day = date.getUTCDate();
  const teen = day % 100 >= 11 && day % 100 <= 13;
  const suffix = teen ? 'th' : (({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[day % 10] ?? 'th');
  const month = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
  // no-break spaces, so the date never splits across lines
  return `${month}\u00a0${day}${suffix},\u00a0${date.getUTCFullYear()}`;
}

/** One figure in the flow of the text, its caption under it; a carousel shows the frame chosen above a row of all of them. */
function PrintFigure({ figure, tallest = '78vh' }: { figure: PlateFigure; tallest?: string }) {
  const [shown, setShown] = useState(0);
  const frames = figure.frames;
  const frame = frames[shown];
  const many = frames.length > 1;
  const said = Boolean(figure.caption?.length || figure.credit?.length);
  // a live figure without a caption of its own shows none
  const plain = figure.live && !frame ? LIVE_CAPTION[figure.live] : (frame?.alt ?? '');
  return (
    <figure className='gtp-print-fig' data-live={figure.live ? true : undefined}>
      {figure.live === 'stops' ? <VersionsDemo /> : null}
      {frame ? (
        // eslint-disable-next-line @next/next/no-img-element -- the story's own scans, sized by the column
        <img className='gtp-print-media' src={frame.src} alt={frame.alt} width={frame.width} height={frame.height} style={sized(frame, tallest)} loading='lazy' decoding='async' />
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
      {said || plain || many ? (
        <figcaption className='gtp-print-caption'>
          {/* one span, so the caption's italics stay in its line rather than becoming rows of the caption's grid */}
          <span>{said ? <Captioned caption={figure.caption} credit={figure.credit} /> : plain}</span>
          {many ? <span className='gtp-print-count'>{`${shown + 1} of ${frames.length}`}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
