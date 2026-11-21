'use client';

import Link from 'next/link';
import type { MouseEvent, ReactNode, RefObject } from 'react';
import { useRef } from 'react';

import GtLogoArmillary from '@/components/brand/GtLogoArmillary';
import { GT_LOGO_ARMILLARY } from '@/components/brand/GtLogoArmillary.geometry';
import GtLogoAscii from '@/components/brand/GtLogoAscii';
import GtLogoMotion from '@/components/brand/GtLogoMotion';
import { BookHead } from '@/components/viewer/BookView';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { useReadLine } from '@/components/viewer/useReadLine';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import type { ShellMode, ShellSection } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import {
  ARMILLARY_ID,
  ARMILLARY_LEAD,
  ARMILLARY_SIZES,
  ARMILLARY_TITLE,
  armillaryRows,
  ASCII_ID,
  ASCII_LEAD,
  ASCII_NOTES,
  ASCII_TITLE,
  BUILD_CODE,
  BUILD_ID,
  BUILD_LEAD,
  BUILD_PARTS,
  BUILD_TITLE,
  CHECKS,
  CHECKS_ID,
  CHECKS_LEAD,
  CHECKS_TITLE,
  COMPARE_CAPTION,
  COMPARE_ID,
  COMPARE_LEAD,
  COMPARE_NOTES,
  COMPARE_TITLE,
  ENGINES_CAPTION,
  FIX_ID,
  FIX_LEAD,
  FIX_SHEET_CAPTION,
  FIX_TITLE,
  FORM_CODE,
  FORM_ID,
  FORM_LEAD,
  FORM_LOOP,
  FORM_TITLE,
  formRows,
  HOVER_ID,
  HOVER_LEAD,
  HOVER_TITLE,
  lapOf,
  LEAD,
  LOADER_ID,
  LOADER_LEAD,
  LOADER_SIZES,
  LOADER_TITLE,
  MOTION_LOOPS,
  motionPoster,
  motionVideo,
  REDUCED_ID,
  REDUCED_LEAD,
  REDUCED_NOTES,
  REDUCED_TITLE,
  RING_CAPTION,
  SAFARI_CAPTION,
  sectionsIn,
  timingRows,
} from './content';
import type { LoaderTiming, MotionLoop } from './content';

import './loading.css';

const MODES: readonly ShellMode[] = ['book'];

/** The public folder of the page's sheets. */
const FILES = '/marks/loading';

type Part = { id: string; title: string; lead: string; count: number };

/** The page's sections in order; the finished loader leads. */
const PARTS: readonly Part[] = [
  { id: LOADER_ID, title: LOADER_TITLE, lead: LOADER_LEAD, count: LOADER_SIZES.length + 1 },
  { id: HOVER_ID, title: HOVER_TITLE, lead: HOVER_LEAD, count: MOTION_LOOPS.length + 1 },
  { id: FORM_ID, title: FORM_TITLE, lead: FORM_LEAD, count: 2 },
  { id: BUILD_ID, title: BUILD_TITLE, lead: BUILD_LEAD, count: BUILD_PARTS.length },
  { id: CHECKS_ID, title: CHECKS_TITLE, lead: CHECKS_LEAD, count: CHECKS.length },
  { id: REDUCED_ID, title: REDUCED_TITLE, lead: REDUCED_LEAD, count: REDUCED_NOTES.length },
  { id: COMPARE_ID, title: COMPARE_TITLE, lead: COMPARE_LEAD, count: COMPARE_NOTES.length },
  { id: ARMILLARY_ID, title: ARMILLARY_TITLE, lead: ARMILLARY_LEAD, count: ARMILLARY_SIZES.length + 1 },
  { id: ASCII_ID, title: ASCII_TITLE, lead: ASCII_LEAD, count: 2 },
  { id: FIX_ID, title: FIX_TITLE, lead: FIX_LEAD, count: 5 },
];

/** The gutter note of each section. */
const FACTS: Readonly<Record<string, (part: Part) => string>> = {
  [LOADER_ID]: () => 'Live',
  [ARMILLARY_ID]: () => 'Exploration',
  [ASCII_ID]: () => 'Exploration',
  [HOVER_ID]: (part) => `${part.count - 1} videos`,
  [FORM_ID]: () => 'For videos',
  [BUILD_ID]: (part) => `${part.count} parts`,
  [CHECKS_ID]: (part) => `${part.count} checks`,
  [REDUCED_ID]: () => 'Still',
  [COMPARE_ID]: () => '2 panes',
  [FIX_ID]: (part) => `${part.count} sheets`,
};

/** The list under Knowledge > Marks > Loading. */
const SECTIONS: readonly ShellSection[] = [
  {
    id: 'loading-book',
    label: PAGE_NAMES.loading.name,
    under: 'loading',
    items: PARTS.map((part, i) => ({ id: part.id, n: pad2(i + 1), title: part.title })),
  },
];

/** The page's theme, read from html[data-theme]: dark when it is unset. */
const pageTheme = (): 'light' | 'dark' => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

/**
 * One hover or loading loop as its light and dark videos, of which the
 * stylesheet shows the one for the page's theme, cropped to the ring. Each
 * starts and ends on the logo, which is also its poster, so the first paint
 * and reduced motion show the still logo. The shown video plays only while
 * the figure is in view and motion is allowed, and nothing loads before that.
 */
function MotionFigure({ loop }: { loop: MotionLoop }) {
  const figureRef = useRef<HTMLElement>(null);
  const lightRef = useRef<HTMLVideoElement>(null);
  const darkRef = useRef<HTMLVideoElement>(null);
  useMountEffect(() => {
    const figure = figureRef.current;
    const light = lightRef.current;
    const dark = darkRef.current;
    if (!figure || !light || !dark) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false;
    const sync = () => {
      const shown = pageTheme() === 'light' ? light : dark;
      const hidden = shown === light ? dark : light;
      hidden.pause();
      if (inView && !reduce.matches) {
        shown.play().catch(() => {});
      } else {
        shown.pause();
      }
    };
    const io = new IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      sync();
    });
    io.observe(figure);
    const themeWatch = new MutationObserver(sync);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    reduce.addEventListener('change', sync);
    return () => {
      io.disconnect();
      themeWatch.disconnect();
      reduce.removeEventListener('change', sync);
      light.pause();
      dark.pause();
    };
  });
  return (
    <figure ref={figureRef} className='ld-fig'>
      <div className='ld-clip'>
        <video ref={lightRef} className='ld-vid is-light' src={motionVideo(loop.id, 'light')} poster={motionPoster(loop, 'light')} muted loop playsInline preload='none' aria-hidden='true' />
        <video ref={darkRef} className='ld-vid is-dark' src={motionVideo(loop.id, 'dark')} poster={motionPoster(loop, 'dark')} muted loop playsInline preload='none' aria-hidden='true' />
      </div>
      <figcaption>
        <h4>
          {loop.name}
          {loop.shipped && <span className='ld-tag'>Shipped</span>}
        </h4>
        <p>{loop.caption}</p>
      </figcaption>
    </figure>
  );
}

/** A sheet from the page's folder at its own size, scaled to the column, with what it shows. */
function SheetFigure({ file, width, height, alt, caption, wide = false }: { file: string; width: number; height: number; alt: string; caption: string; wide?: boolean }) {
  return (
    <figure className={cn('ld-fig ld-sheet', wide && 'is-wide')}>
      <img src={`${FILES}/${file}`} width={width} height={height} alt={alt} loading='lazy' decoding='async' />
      <figcaption>
        <p>{caption}</p>
      </figcaption>
    </figure>
  );
}

/** A capture in both themes, of which the stylesheet shows the one for the page's theme. */
function ThemedSheet({ stem, width, height, alt, caption }: { stem: string; width: number; height: number; alt: string; caption: string }) {
  return (
    <figure className='ld-fig ld-sheet is-wide'>
      <img className='ld-themed is-light' src={`${FILES}/${stem}-light.webp`} width={width} height={height} alt={alt} loading='lazy' decoding='async' />
      <img className='ld-themed is-dark' src={`${FILES}/${stem}-dark.webp`} width={width} height={height} alt={alt} loading='lazy' decoding='async' />
      <figcaption>
        <p>{caption}</p>
      </figcaption>
    </figure>
  );
}

/** Terms and what each does, in two columns on a wide column and one on a phone. */
function Terms({ items }: { items: readonly { term: string; body: string }[] }) {
  return (
    <dl className='ld-terms'>
      {items.map((item) => (
        <div key={item.term}>
          <dt>{item.term}</dt>
          <dd>{item.body}</dd>
        </div>
      ))}
    </dl>
  );
}

function Notes({ items }: { items: readonly string[] }) {
  return (
    <ul className='ld-notes'>
      {items.map((note) => (
        <li key={note}>{note}</li>
      ))}
    </ul>
  );
}

type SectionProps = { id: string; n: number; fact: string; title: string; lead: string; active: boolean; children: ReactNode };

/** One section of the book: the shared divider, its h2 and its lead, and its fact in the gutter note. */
function Section({ id, n, fact, title, lead, active, children }: SectionProps) {
  return (
    <section className={cn('pt-book-part ld-sec', active && 'is-active')} data-id={id} aria-labelledby={`ld-${id}`}>
      <div className='pt-book-sec'>
        <small>
          <span>Section {n}</span>
          <span>{fact}</span>
        </small>
        <div>
          <h2 id={`ld-${id}`}>{title}</h2>
          <p>{lead}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

type BookProps = {
  sheetRef: RefObject<HTMLDivElement | null>;
  jumpRef: RefObject<(id: string) => void>;
  activeOut: RefObject<string>;
  updated: PageUpdated;
  timing: LoaderTiming;
};

function LoadingBook({ sheetRef, jumpRef, activeOut, updated, timing }: BookProps) {
  const { active, ready, select } = usePtShell();
  activeOut.current = active;

  const { jump, onContents } = useReadLine({ rootRef: sheetRef, selector: '.ld-sec', active, select, ready, smooth: true });
  jumpRef.current = jump;

  const body = (id: string): ReactNode => {
    if (id === LOADER_ID)
      return (
        <div className='ld-body'>
          <div className='ld-hero'>
            <figure className='ld-fig ld-stage'>
              <GtLogoMotion mode='loader' size={200} label='The loader, running' />
              <figcaption>
                <h3>Meridian, then G</h3>
                <p>The loader at 200 pixels, the live component this site uses. Every frame outside the moving line is the logo.</p>
              </figcaption>
            </figure>
            <table className='ld-timing'>
              <caption>One lap takes {lapOf(timing)} ms and repeats while the page loads.</caption>
              <thead>
                <tr>
                  <th scope='col'>Beat</th>
                  <th scope='col'>Time</th>
                  <th scope='col'>What moves</th>
                </tr>
              </thead>
              <tbody>
                {timingRows(timing).map((row, i) => (
                  <tr key={`${row.name}-${i}`}>
                    <th scope='row'>{row.name}</th>
                    <td>{row.ms} ms</td>
                    <td>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='ld-sizes'>
            {LOADER_SIZES.map(({ size, where }) => (
              <figure key={size} className='ld-fig ld-size'>
                <div className='ld-size-box'>
                  <GtLogoMotion mode='loader' size={size} label={`The loader at ${size} pixels`} />
                </div>
                <figcaption>
                  <h3>{size} px</h3>
                  <p>{where}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      );
    if (id === ARMILLARY_ID)
      return (
        <div className='ld-body'>
          <div className='ld-hero'>
            <figure className='ld-fig ld-stage'>
              <GtLogoArmillary size={200} label='The armillary loader, running' />
              <figcaption>
                <h3>The armillary loader</h3>
                <p>At 200 pixels, live. Its rest frame is the logo’s own path, so the lap starts and ends on the still logo.</p>
              </figcaption>
            </figure>
            <table className='ld-timing'>
              <caption>One lap takes {Math.round((GT_LOGO_ARMILLARY.beats.rest + GT_LOGO_ARMILLARY.beats.open + GT_LOGO_ARMILLARY.beats.swing + GT_LOGO_ARMILLARY.beats.close) * 1000)} ms and repeats while the page loads.</caption>
              <thead>
                <tr>
                  <th scope='col'>Beat</th>
                  <th scope='col'>Time</th>
                  <th scope='col'>What moves</th>
                </tr>
              </thead>
              <tbody>
                {armillaryRows(GT_LOGO_ARMILLARY.beats).map((row) => (
                  <tr key={row.name}>
                    <th scope='row'>{row.name}</th>
                    <td>{row.ms} ms</td>
                    <td>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='ld-sizes'>
            {ARMILLARY_SIZES.map(({ size, where }) => (
              <figure key={size} className='ld-fig ld-size'>
                <div className='ld-size-box'>
                  <GtLogoArmillary size={size} label={`The armillary loader at ${size} pixels`} />
                </div>
                <figcaption>
                  <h3>{size} px</h3>
                  <p>{where}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      );
    if (id === ASCII_ID)
      return (
        <div className='ld-body'>
          <div className='ld-ascii'>
            <figure className='ld-fig ld-stage'>
              <GtLogoAscii width={450} palette='image' label='The ASCII loader, running' />
              <figcaption>
                <h3>On its own ground</h3>
                <p>45 by 21 characters at 450 pixels, the ramp - = + * # % @, 24 frames a second.</p>
              </figcaption>
            </figure>
            <figure className='ld-fig ld-stage'>
              <GtLogoAscii width={450} palette='ink' label='The ASCII loader in the text color' />
              <figcaption>
                <h3>In the text color</h3>
                <p>The same frames in the page’s ink, lit at the upper left, on paper and on ink.</p>
              </figcaption>
            </figure>
          </div>
          <Notes items={ASCII_NOTES} />
        </div>
      );
    if (id === HOVER_ID)
      return (
        <div className='ld-body'>
          <figure className='ld-fig ld-stage'>
            <Link className='ld-host' href='/marks' aria-label='Marks'>
              <GtLogoMotion mode='hover' size={200} />
            </Link>
            <figcaption>
              <h3>The live hover</h3>
              <p>Hover or focus this mark, a link back to the marks. The loader runs for as long as the pointer stays; on leave it runs on to the end of its lap and stops on the logo. Inside a link, a button or an element marked data-gt-logo-host, the mark moves with its host.</p>
            </figcaption>
          </figure>
          <div className='ld-row'>
            {MOTION_LOOPS.map((loop) => (
              <MotionFigure key={loop.id} loop={loop} />
            ))}
          </div>
        </div>
      );
    if (id === FORM_ID)
      return (
        <div className='ld-body'>
          <div className='ld-hero'>
            <MotionFigure loop={FORM_LOOP} />
            <table className='ld-timing'>
              <caption>The logo form runs once in {timing.formReturn[1]} ms, from the logo to the logo.</caption>
              <thead>
                <tr>
                  <th scope='col'>Beat</th>
                  <th scope='col'>Time</th>
                  <th scope='col'>What moves</th>
                </tr>
              </thead>
              <tbody>
                {formRows(timing).map((row, i) => (
                  <tr key={`${row.name}-${i}`}>
                    <th scope='row'>{row.name}</th>
                    <td>{row.ms} ms</td>
                    <td>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <pre className='ld-code'>
            <code>{FORM_CODE}</code>
          </pre>
        </div>
      );
    if (id === BUILD_ID)
      return (
        <div className='ld-body'>
          <Terms items={BUILD_PARTS} />
          <pre className='ld-code'>
            <code>{BUILD_CODE}</code>
          </pre>
        </div>
      );
    if (id === CHECKS_ID)
      return (
        <div className='ld-body'>
          <Terms items={CHECKS} />
          <SheetFigure file='engines.webp' width={2240} height={540} alt='The loader at three moments in Chrome, Firefox and WebKit, on paper and on ink' caption={ENGINES_CAPTION} wide />
        </div>
      );
    if (id === REDUCED_ID)
      return (
        <div className='ld-body ld-pair'>
          <figure className='ld-fig ld-stage is-small'>
            <GtLogoMotion mode='static' size={120} />
            <figcaption>
              <h3>What reduced motion shows</h3>
              <p>The still logo, the same path as the logo everywhere else, in place of the loader and the hover.</p>
            </figcaption>
          </figure>
          <Notes items={REDUCED_NOTES} />
        </div>
      );
    if (id === COMPARE_ID)
      return (
        <div className='ld-body'>
          <Notes items={COMPARE_NOTES} />
          <ThemedSheet stem='compare' width={1440} height={900} alt='The compare page with both panes showing the loader while their pages load' caption={COMPARE_CAPTION} />
        </div>
      );
    return (
      <div className='ld-body'>
        <SheetFigure
          file='fix-sheet.webp'
          width={2098}
          height={2644}
          alt='Frames of the hover and the loader from the first loader and after the third fix, each beside its difference from the logo, and the meridian’s bottom cut face at 8x'
          caption={FIX_SHEET_CAPTION}
          wide
        />
        <SheetFigure
          file='ring-tick.webp'
          width={1854}
          height={1222}
          alt='The four points where the meridian leaves the ring, at 8x, old and new, each beside the pixels that differ from the ring drawn alone'
          caption={RING_CAPTION.points}
          wide
        />
        <SheetFigure
          file='ring-tick-webkit.webp'
          width={1623}
          height={412}
          alt='The north pole merge in WebKit at 8x, old with a grey fringe on the ring and new without it'
          caption={RING_CAPTION.webkit}
          wide
        />
        <div className='ld-row is-two'>
          <SheetFigure file='safari-hover-before.webp' width={960} height={538} alt='The hover in Safari before the fix, the live mark beside the published video' caption={SAFARI_CAPTION.before} />
          <SheetFigure file='safari-hover-after.webp' width={960} height={538} alt='The hover in Safari after the fix, the live mark beside the published video' caption={SAFARI_CAPTION.after} />
        </div>
      </div>
    );
  };

  return (
    <div className='pt-book-col'>
      <BookHead
        skill='gt-motion'
        title={PAGE_NAMES.loading.name}
        lead={LEAD}
        updated={updated}
        facts={[
          { icon: 'sync', key: 'Lap', value: `${lapOf(timing)} ms` },
          { icon: 'film', key: 'Videos', value: MOTION_LOOPS.length + 1 },
          { icon: 'check', key: 'Checks', value: CHECKS.length },
        ]}
        contents={
          <nav className='pt-book-toc' aria-label='Contents'>
            {PARTS.map((part) => (
              <a key={part.id} href={`#${part.id}`} onClick={(e: MouseEvent<HTMLAnchorElement>) => onContents(e, part.id)}>
                <span>{part.title}</span>
                <small>{part.count}</small>
              </a>
            ))}
          </nav>
        }
      />

      {PARTS.map((part, i) => (
        <Section key={part.id} id={part.id} n={i + 1} fact={FACTS[part.id](part)} title={part.title} lead={part.lead} active={active === part.id}>
          {body(part.id)}
        </Section>
      ))}
    </div>
  );
}

export type LoadingViewerProps = {
  /** the /marks/loading entry in src/lib/updated.ts, from the server page */
  updated: PageUpdated;
  /** the beats of the motion, from scripts/build/logo-motion.json */
  timing: LoaderTiming;
};

/**
 * The logo while a page loads, on the viewer shell: the finished loader
 * first, then the hovers, the logo form, how it is built, the checks, reduced motion, the
 * loader on /compare and the before and after of the fix. The list hangs
 * under Marks > Loading; flow keys, so Space and the arrows scroll.
 */
export default function LoadingViewer({ updated, timing }: LoadingViewerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(id: string) => void>(() => {});
  const activeOut = useRef<string>(PARTS[0].id);

  return (
    <ViewerShell
      id='loading'
      title={PAGE_NAMES.loading.name}
      mark='pt'
      count={sectionsIn(PARTS.length)}
      sections={SECTIONS}
      modes={MODES}
      thumb='row'
      surfaces='site'
      keys='flow'
      noun='section'
      onSelect={(id) => {
        /* re-clicking the active row brings its section back to the read line */
        if (id === activeOut.current) jumpRef.current(id);
      }}
    >
      <Sheet variant='flow' scrollRef={sheetRef}>
        <LoadingBook sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} updated={updated} timing={timing} />
      </Sheet>
    </ViewerShell>
  );
}
