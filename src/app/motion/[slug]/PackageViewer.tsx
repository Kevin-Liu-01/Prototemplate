'use client';

import { useRouter } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';
import { useRef, useState } from 'react';

import BrandFilm from '@/app/brand/BrandFilm';
import { BookHead } from '@/components/viewer/BookView';
import { Icon } from '@/components/viewer/icons';
import { ListRow } from '@/components/viewer/ListRow';
import { Sheet } from '@/components/viewer/Sheet';
import type { SubRenderer } from '@/components/viewer/Sidebar';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import { MOTION_FILMS, MOTION_STATUS_LABEL, getMotionFilm, motionHref } from '@/lib/motion';
import type { MotionFilm, MotionMedia, PackageSectionId } from '@/lib/motion';
import type { ShellMode } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import { filmById, motionSections } from '../sections';

import '../../prototemplate.css';
import '../../docs/docs.css';
import '../motion.css';

const TITLE = 'Motion';
const MODES: readonly ShellMode[] = ['book'];

/** The read line: the lowest section crossing the top tenth of the sheet is the one being read. */
const SPY_MARGIN = '0px 0px -90% 0px';
/** How long the spy waits for a jump to reach its section before it reads the page again. */
const SETTLE_MS = 1200;

/**
 * The sections' names in the sidebar, where a row under a nested item has
 * about 70px for its title: the contents and the dividers keep the
 * package's own headings.
 */
const SUB_TITLE: Record<PackageSectionId, string> = {
  script: 'Script',
  post: 'Post',
  vocabulary: 'Vocabulary',
  sources: 'Sources',
  checks: 'Fact checks',
};

/** One section of the package as the server rendered it (package.ts). */
export type PackageSectionView = {
  id: PackageSectionId;
  n: string;
  title: string;
  note: string;
  body: ReactNode;
  wide: boolean;
};

function cssEscape(value: string): string {
  return typeof CSS !== 'undefined' && 'escape' in CSS ? CSS.escape(value) : value;
}

function readHash(): string {
  const raw = window.location.hash.slice(1);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function writeHash(id: string | null): void {
  try {
    const base = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, '', id ? `${base}#${encodeURIComponent(id)}` : base);
  } catch {
    // a sandboxed document: the jump still lands, the address does not change
  }
}

/** The toolbar slot: the package's markdown in a new tab, with the external glyph. */
function RawLink({ slug }: { slug: string }) {
  return (
    <a
      className='pt-ib mo-raw'
      href={`/motion/${slug}.md`}
      target='_blank'
      rel='noreferrer'
      title='Open the raw research package in a new tab'
    >
      <Icon name='external' />
      <span className='pt-lb'>Raw package</span>
    </a>
  );
}

/**
 * The film at the head of the sheet, with the blog films' player and
 * conventions (BrandFilm): the poster and a play button that keeps the
 * native control bar off the title card until the first play, the 16:9 box
 * reserved by the width and height before the metadata arrives, and a link
 * that downloads the MP4.
 */
function FilmHead({ film, media }: { film: MotionFilm; media: MotionMedia }) {
  const name = `the ${film.title} film`;
  return (
    <>
      <figure className='mo-film mo-head-film'>
        <BrandFilm name={name} poster={media.poster} src={media.video} />
      </figure>
      <p className='mo-send'>
        <a aria-label={`download the MP4 of ${name}`} download href={media.video}>
          download the MP4
        </a>
        {film.credits ? (
          <>
            {' · '}
            <a aria-label={`download the credits of ${name} as text`} download href={film.credits}>
              the credits as text
            </a>
          </>
        ) : null}
      </p>
    </>
  );
}

/** The page's own sentence about the film: who makes it, where, and whether its final render exists and plays here. */
function StatusLine({ film }: { film: MotionFilm }) {
  const folder = film.local?.folder ?? `motion/films/${film.slug}`;
  const render = film.local?.video ?? `motion/out/${film.slug}.mp4`;
  if (film.status === 'rendered' && film.media) {
    return (
      <p>
        The Videos session made this film in <code>{folder}</code> from the research package below. The final render,{' '}
        <code>{render}</code>, plays here from its web copy.
      </p>
    );
  }
  if (film.status === 'rendered') {
    return (
      <p>
        The Videos session made this film in <code>{folder}</code> from the research package below. The final render is{' '}
        <code>{render}</code>. It stays in the motion folder and is not published on this site.
      </p>
    );
  }
  if (film.status === 'in-production') {
    return (
      <p>
        The Videos session is making this film in <code>{folder}</code> from the package below. It has no final render
        yet.
      </p>
    );
  }
  return <p>The Videos session will make this film from the package below. It has no folder in the motion folder yet.</p>;
}

export type PackageViewerProps = {
  slug: string;
  /** the series line, rendered on the server */
  lead: ReactNode;
  /** the paragraphs after the series line, or null */
  leadRest: ReactNode | null;
  /** the published film's credits from the Videos session's file, rendered on the server, or null */
  credits: ReactNode | null;
  sections: readonly PackageSectionView[];
};

/**
 * One film of the translation series on the viewer shell: the roster in
 * the list under Knowledge > Motion with this film's row marked and its
 * five sections as rows under it, and the research package as a book in
 * the 1280px flow sheet (the book head with the film's facts, the film's
 * player when its web copy is published, the status line, a contents list,
 * then each section under its divider in the docs' prose grammar). An IntersectionObserver marks the section under the read
 * line in the list; a contents link or a section row jumps the sheet there
 * and writes `#<section>` to the address, which a later visit lands on.
 * The shell ignores that hash, since it names no item. Selecting another
 * film navigates to it; the raw package is one click away in the toolbar.
 */
export default function PackageViewer({ slug, lead, leadRest, credits, sections }: PackageViewerProps) {
  const router = useRouter();
  const film = getMotionFilm(slug);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const settling = useRef<Element | null>(null);
  const settleTimer = useRef(0);

  const sectionFor = (id: string): HTMLElement | null =>
    sheetRef.current?.querySelector<HTMLElement>(`.mo-sec[data-section="${cssEscape(id)}"]`) ?? null;

  /** An instant jump to a section's divider (or any element with that id in the sheet); the spy waits for it to land. */
  const jump = (id: string): boolean => {
    const root = sheetRef.current;
    if (!root) return false;
    const section = sectionFor(id);
    const target = section?.querySelector<HTMLElement>('.ptd-sec') ?? document.getElementById(id);
    if (!target || !root.contains(target)) return false;
    settling.current = section ?? target.closest('.mo-sec');
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      settling.current = null;
    }, SETTLE_MS);
    target.scrollIntoView({ block: 'start', behavior: 'auto' });
    if (section) setActiveSection(id);
    return true;
  };

  const go = (id: string) => {
    if (jump(id)) writeHash(id);
  };

  const onContents = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    go(id);
  };

  /* the landing: a hash that names a section (or a heading in the sheet) is jumped to once the layout and the fonts settle */
  useMountEffect(() => {
    const hash = readHash();
    if (!hash) return;
    const frame = requestAnimationFrame(() => jump(hash));
    document.fonts?.ready.then(() => jump(hash)).catch(() => {});
    return () => cancelAnimationFrame(frame);
  });

  /* the spy: the section under the read line names the row marked in the list */
  useMountEffect(() => {
    const root = sheetRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const blocks = Array.from(root.querySelectorAll<HTMLElement>('.mo-sec'));
    const order = new Map<Element, number>(blocks.map((el, i) => [el, i]));
    const visible = new Set<Element>();
    const lowest = (): HTMLElement | null => {
      let best: HTMLElement | null = null;
      let rank = -1;
      for (const el of visible) {
        const i = order.get(el) ?? -1;
        if (i > rank) {
          rank = i;
          best = el as HTMLElement;
        }
      }
      return best;
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        const best = lowest();
        if (settling.current) {
          if (best !== settling.current) return;
          settling.current = null;
          window.clearTimeout(settleTimer.current);
        }
        setActiveSection(best?.dataset.section ?? null);
      },
      { root, rootMargin: SPY_MARGIN, threshold: 0 }
    );
    blocks.forEach((el) => observer.observe(el));
    const onScrollEnd = () => {
      if (!settling.current) return;
      settling.current = null;
      window.clearTimeout(settleTimer.current);
    };
    root.addEventListener('scrollend', onScrollEnd);
    return () => {
      observer.disconnect();
      root.removeEventListener('scrollend', onScrollEnd);
      window.clearTimeout(settleTimer.current);
    };
  });

  if (!film?.pkg) return null;
  const pkg = film.pkg;

  const renderSub: SubRenderer = (item) =>
    item.id === film.id
      ? sections.map((section) => (
          <ListRow
            key={section.id}
            item={{ id: `${slug}-${section.id}`, n: section.n, title: SUB_TITLE[section.id] }}
            active={section.id === activeSection}
            onSelect={() => go(section.id)}
          />
        ))
      : null;

  const onSelect = (id: string) => {
    if (id === film.id) {
      /* this film's own row: back to the head, the address without a hash */
      sheetRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      writeHash(null);
      return;
    }
    const next = filmById(id);
    if (next) router.push(motionHref(next));
  };

  return (
    <ViewerShell
      id='motion'
      title={TITLE}
      mark='pt'
      count={`${MOTION_FILMS.length} films`}
      sections={motionSections(slug)}
      active={film.id}
      modes={MODES}
      thumb='row'
      surfaces='site'
      keys='flow'
      noun='film'
      renderSub={renderSub}
      toolbarSlot={<RawLink slug={slug} />}
      onSelect={onSelect}
    >
      <Sheet variant='flow' width={1280} scrollRef={sheetRef}>
        <div className='ptd-book mo-book'>
          <BookHead
            title={film.title}
            lead={lead}
            meta={[
              { key: 'Film', value: `${film.n} of ${MOTION_FILMS.length}` },
              { key: 'Length', value: film.runtime ?? film.length },
              { key: 'Status', value: MOTION_STATUS_LABEL[film.status] },
              { key: 'Series', value: pkg.seriesName },
            ]}
          />

          <div className='ptd-row ptd-lead'>
            <div className='ptd-pn' aria-hidden='true' />
            <div className='ptd-body pt-root'>
              {film.media ? <FilmHead film={film} media={film.media} /> : null}
              <StatusLine film={film} />
              {credits ? (
                <div className='mo-credits'>
                  <h3>Credits</h3>
                  {credits}
                </div>
              ) : null}
              {leadRest}
            </div>
          </div>

          <nav className='ptd-toc' aria-label='Contents'>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={section.id === activeSection ? 'true' : undefined}
                onClick={(e) => onContents(e, section.id)}
              >
                <span>{section.title}</span>
                <small>{section.n}</small>
              </a>
            ))}
          </nav>

          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className='ptd-doc mo-sec'
              data-section={section.id}
              aria-labelledby={`mo-${section.id}`}
            >
              <div className='ptd-sec'>
                <small>
                  <span>Section {section.n}</span>
                  {section.note.split(', ').map((part) => (
                    <span key={part}>{part}</span>
                  ))}
                </small>
                <h2 id={`mo-${section.id}`}>{section.title}</h2>
              </div>
              <div className={cn('ptd-row', section.id === activeSection && 'is-active')}>
                <div className='ptd-pn' aria-hidden='true' />
                <div className={cn('ptd-body pt-root', `mo-${section.id}`, section.wide && 'mo-wide')}>{section.body}</div>
              </div>
            </section>
          ))}
        </div>
      </Sheet>
    </ViewerShell>
  );
}
