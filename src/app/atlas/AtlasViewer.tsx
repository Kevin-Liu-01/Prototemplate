'use client';

import type { MouseEvent, RefObject } from 'react';
import { useRef } from 'react';

import { BookHead } from '@/components/viewer/BookView';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import type { ShellMode, ShellSection } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';
import { useLayoutWork } from '@/lib/use-layout-work';
import { useMountEffect } from '@/lib/use-mount-effect';

import './atlas.css';

const TITLE = PAGE_NAMES.atlas.name;
const MODES: readonly ShellMode[] = ['book'];
const SPY_MARGIN = '0px 0px -90% 0px';
const SETTLE_MS = 1200;

const LEAD =
  'GT Atlas is where General Translation publishes long writing. Each story is a book on a shelf, with a cover of its own, and it opens in pages set for what it is about.';
const NOTE =
  'These notes give the reasons for a magazine, then show the three ways a story is set so far: the docs reader, Fumadocs’ own interface and a printed page. The covers, Taylor Fang’s seven directions for the cover and the languages follow.';

/** A capture; 1440 by 900 unless it says otherwise. */
type Figure = { src: string; alt: string; caption: string; width?: number; height?: number };
type Link = { label: string; href: string; text: string };
type Part = { id: string; title: string; note: string; lead: string; body: readonly string[]; links?: readonly Link[]; figures: readonly Figure[] };

const PARTS: readonly Part[] = [
  {
    id: 'why',
    title: 'Why a magazine',
    note: 'Long writing',
    lead: 'Our long posts carry many figures, and the blog sets every figure in the text column. A reader scrolls past each picture to keep reading and loses the paragraph that explains it.',
    body: [
      'Atlas sets a story’s text and its figures side by side. The figure beside the text changes as the reader reaches the paragraph that discusses it. A figure can be live: the table of contents, the corner radii and the hit list from the docs essays are rebuilt in the page, so the reader can use what the paragraph describes.',
      'The model is Stripe Press: a shelf of books, each with a cover designed for it. Atlas gives each of our stories the same treatment, and the shelf is the index.',
      'General Translation translates software, so the magazine reads in nine languages. The flags under the shelf set every title in the reader’s language, and the globe shows a city where each language is spoken.',
      'A story can be set in the look of its subject. Fuma Nama’s profile is set in Fumadocs, the interface he made, and the history of Euclid’s Elements is set as a printed page.',
      'Atlas is one module, src/app/press/_press in Prototemplate, with its own type and colors, so it can move to a General Translation subdomain without the hub around it.',
    ],
    figures: [{ src: '/shots/atlas/shelf.webp', alt: 'The GT Atlas shelf: four books in a row, turned to show their spines', caption: 'The shelf. The book under the pointer turns to face the reader and lifts; a click opens the story.' }],
  },
  {
    id: 'docs-reader',
    title: 'The docs reader',
    note: 'Designing docs, Rewriting docs',
    lead: 'The two docs essays use the split reader: the text on the left, a stage on the right that shows the figure the reader has reached, and a rail of ticks at the left edge that marks each section.',
    body: [
      'A figure with several views has a slider in its foot, a pill whose labels show through the thumb as it passes. The stage opens on the story’s live cover.',
    ],
    figures: [{ src: '/shots/atlas/docs.webp', alt: 'Designing docs for humans in the split reader', caption: 'Designing docs for humans: the text on the left, a figure on the stage.' }],
  },
  {
    id: 'fumadocs',
    title: 'Fumadocs’ own look',
    note: 'Fuma Nama',
    lead: 'Fuma Nama’s profile is set in the interface he built: Fumadocs’ neutral greys, sans text, cards with a hairline border, and his orange.',
    body: [
      'His table of contents replaces the rail. It is the one Fumadocs ships: a line down the headings, drawn as an SVG path and used as a mask, so the orange thumb shows only where the line runs and follows it into the nested headings. Every slider in the story is drawn the same way, as a stepped line under its labels.',
    ],
    figures: [{ src: '/shots/atlas/fuma.webp', alt: 'Fuma Nama in the Fumadocs look', caption: 'Fuma Nama: the masked table of contents on the left, and a live Fumadocs table of contents on the stage.' }],
  },
  {
    id: 'printed-page',
    title: 'A printed page',
    note: 'Translating Euclid',
    lead: 'Translating Euclid is the history of a book, so it is set as a magazine page: light brown paper, the cover picture across the page, then one centred column of large serif text.',
    body: [
      'Everything is in Katagami Serif and in sentence case. Paragraphs part by a blank line, not an indent. Each figure sits in the flow of the text with its caption under it, and a figure with several pages shows the page chosen above a row of all of them.',
      'The reader’s place shows as a line along the top of the page. A rail down the left and a ring around the imprint are the other two options on trial.',
      'The first figure shows the first definition of Elements in eight versions at once, from Alexandria to Beijing: each city pinned on a globe with its coordinate lines, and a leader from each pin to its line.',
    ],
    figures: [
      { src: '/shots/atlas/book.webp', alt: 'Translating Euclid as a magazine page', caption: 'Translating Euclid: the cover across the page, then the title, the byline and the date.' },
      { src: '/shots/atlas/figure.webp', alt: 'The locator in Translating Euclid', caption: 'The first definition at Alexandria, 300 BCE, with the other four versions under the passage.' },
    ],
  },
  {
    id: 'covers',
    title: 'The covers',
    note: 'Four designs',
    lead: 'Every cover has a design of its own over the same ground: Glyphfield’s Fluid Energy, run on WebGPU and printed through a one-pixel Bayer dither in the cover’s inks. The title sets in Katagami Serif at the foot, and the authors are on the spine.',
    body: [
      'Translating Euclid is vellum, with the 1607 Jihe Yuanben page in full ink and a vermilion seal reading 幾何原本.',
      'Designing docs for humans is cobalt, with the docs page exploded in isometric as sky-blue lines over dithered panels.',
      'Rewriting docs for humans and agents is a graphite proof sheet, its edits marked in red.',
      'Fuma Nama is orange, with Luna, the Fumadocs moon, drawn as a crescent, an orbit and his table of contents line.',
    ],
    figures: [],
  },
  {
    id: 'directions',
    title: 'Seven cover directions',
    note: 'Taylor Fang',
    lead: 'Taylor Fang drew seven directions for opening Atlas on a single issue, the first Chinese translation of Euclid, as one cover that fills the screen. Each has its own page under /press/directions, and the number keys move between them.',
    body: [],
    links: [
      { label: 'Riffle', href: '/press/directions/riffle', text: 'The issue as a thin paper magazine on the Atlas shelf. A click riffles every page past, and a scroll turns one page at a time.' },
      { label: 'Atlas book', href: '/press/directions/atlas', text: 'The Atlas shelf reduced to one book, which opens on Book I as it was set in 1607.' },
      { label: 'Signal', href: '/press/directions/signal', text: 'A General Translation poster: a Morse field, the first definition in five languages and the coordinates of each city.' },
      { label: 'Proof poster', href: '/press/directions/proof', text: 'A printer’s proof: grey type, construction lines at the letter boundaries and a second page of definitions.' },
      { label: 'Light poster', href: '/press/directions/light', text: 'A column of light and film grain behind Book I, Proposition 1, drawn with a compass and lettered as in 1607.' },
      { label: 'Route', href: '/press/directions/route', text: 'Wayfinding signage for Matteo Ricci’s road from Macau to Peking, with a sign that changes at each stop.' },
      { label: 'Measure', href: '/press/directions/measure', text: 'A drafting sheet: Book I, Proposition 47 in heavy black, dimensioned 30, 40 and 50, with a title block.' },
    ],
    figures: [{ src: '/shots/atlas/directions.webp', alt: 'The seven cover directions, then Riffle opened on its spread', caption: 'The seven directions in order, then Riffle opened on its spread.', width: 1436, height: 1812 }],
  },
  {
    id: 'languages',
    title: 'Languages and places',
    note: 'Nine languages',
    lead: 'The flags under the shelf set every title in one of nine languages. Each language has several cities where it is spoken, and picking a language again moves to its next city, so no language is pinned to one country.',
    body: [
      'The coordinates in the corner change with the city, digit by digit like a split-flap board. The globe beside the flags opens into the locator: the globe with its coordinate lines, a leader from the city to its locale, its name, and its latitude and longitude on a line each.',
    ],
    figures: [{ src: '/shots/atlas/locator.webp', alt: 'The locator open on San Francisco', caption: 'The locator, open on San Francisco, with the nine languages beside it.' }],
  },
];

const SECTIONS: readonly ShellSection[] = [
  {
    id: 'notes',
    label: 'Notes',
    under: 'atlas',
    items: PARTS.map((part, i) => ({ id: part.id, n: pad2(i + 1), title: part.title, desc: part.lead })),
  },
];

function cssEscape(value: string): string {
  return typeof CSS !== 'undefined' && 'escape' in CSS ? CSS.escape(value) : value;
}

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

type BookProps = {
  sheetRef: RefObject<HTMLDivElement | null>;
  jumpRef: RefObject<(id: string) => void>;
  activeOut: RefObject<string>;
  updated: PageUpdated;
};

/**
 * The book: a head, the contents, then one section per part. An
 * IntersectionObserver marks the part under the read line and selects it
 * through the shell, so the list and the hash follow the reader; a
 * selection from the list scrolls the sheet to its part and mutes the spy
 * until it arrives.
 */
function AtlasBook({ sheetRef, jumpRef, activeOut, updated }: BookProps) {
  const { active, ready, select } = usePtShell();
  activeOut.current = active;
  const activeRef = useRef(active);
  activeRef.current = active;
  const selectRef = useRef(select);
  selectRef.current = select;
  const lastActive = useRef<string | null>(null);
  const landed = useRef(false);
  const fromScroll = useRef<string | null>(null);
  const settling = useRef<Element | null>(null);
  const settleTimer = useRef(0);

  const sectionFor = (id: string): HTMLElement | null => sheetRef.current?.querySelector<HTMLElement>(`.an-sec[data-id="${cssEscape(id)}"]`) ?? null;

  const scrollTo = (id: string, behavior: ScrollBehavior) => {
    const el = sectionFor(id);
    if (!el) return;
    settling.current = el;
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      settling.current = null;
    }, SETTLE_MS);
    el.scrollIntoView({ block: 'start', behavior });
  };

  jumpRef.current = (id: string) => scrollTo(id, scrollBehavior());

  /* the spy: the lowest part crossing the read line names the active item */
  useMountEffect(() => {
    const root = sheetRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const sections = Array.from(root.querySelectorAll<HTMLElement>('.an-sec'));
    const order = new Map<Element, number>(sections.map((el, i) => [el, i]));
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        let best: HTMLElement | null = null;
        let rank = -1;
        for (const el of visible) {
          const i = order.get(el) ?? -1;
          if (i > rank) {
            rank = i;
            best = el as HTMLElement;
          }
        }
        if (!best) return;
        if (settling.current) {
          if (best !== settling.current) return;
          settling.current = null;
          window.clearTimeout(settleTimer.current);
        }
        const id = best.dataset.id;
        if (!id || id === activeRef.current) return;
        fromScroll.current = id;
        selectRef.current(id);
      },
      { root, rootMargin: SPY_MARGIN, threshold: 0 }
    );
    sections.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      window.clearTimeout(settleTimer.current);
    };
  });

  /* the active part changed from outside the book: bring it to the read line; a deep link lands without motion */
  useLayoutWork(
    () => {
      const wasLanded = landed.current;
      if (ready) landed.current = true;
      const previous = lastActive.current;
      lastActive.current = active;
      if (previous === null || previous === active) return;
      if (fromScroll.current === active) {
        fromScroll.current = null;
        return;
      }
      scrollTo(active, wasLanded ? scrollBehavior() : 'instant');
    },
    { dependencies: [active, ready] }
  );

  const onContents = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (id === activeRef.current) scrollTo(id, scrollBehavior());
    else select(id);
  };

  return (
    <div className='an-book pt-book-col'>
      <BookHead
        title={TITLE}
        lead={LEAD}
        note={NOTE}
        updated={updated}
        facts={[
          { icon: 'book', key: 'Stories', value: 4 },
          { icon: 'columns', key: 'Looks', value: 3 },
          { icon: 'sparkles', key: 'Cover directions', value: 7 },
        ]}
        contents={
          <nav className='an-toc pt-book-toc' aria-label='Contents'>
            {PARTS.map((part, i) => (
              <a key={part.id} href={`#${part.id}`} onClick={(e) => onContents(e, part.id)}>
                <span>{part.title}</span>
                <small>{pad2(i + 1)}</small>
              </a>
            ))}
          </nav>
        }
      />

      {PARTS.map((part, i) => (
        <section
          key={part.id}
          className={cn('pt-book-part an-sec', active === part.id && 'is-active')}
          data-id={part.id}
          aria-labelledby={`at-${part.id}`}
          aria-current={active === part.id ? 'true' : undefined}
        >
          <div className='an-div pt-book-sec'>
            <small>
              <span>Section {i + 1}</span>
              <span>{part.note}</span>
            </small>
            <div>
              <h2 id={`at-${part.id}`}>{part.title}</h2>
              <p>{part.lead}</p>
            </div>
          </div>
          <div className='an-body'>
            {part.body.map((text) => (
              <p key={text}>{text}</p>
            ))}
            {part.links ? (
              <ul className='an-links'>
                {part.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href}>{link.label}</a>
                    <span>{link.text}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {part.figures.map((figure) => (
              <figure key={figure.src} className='an-fig'>
                {/* eslint-disable-next-line @next/next/no-img-element -- a capture of the press page, at its own size */}
                <img src={figure.src} alt={figure.alt} width={figure.width ?? 1440} height={figure.height ?? 900} loading='lazy' decoding='async' />
                <figcaption>{figure.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/**
 * The notes on the viewer shell: the list holds one row per part, the book
 * reads them in the flow sheet. Flow keys, so Space and the arrows scroll.
 */
export default function AtlasViewer({ updated }: { updated: PageUpdated }) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(id: string) => void>(() => {});
  const activeOut = useRef(PARTS[0]!.id);

  return (
    <ViewerShell
      id='atlas'
      title={TITLE}
      mark='pt'
      count={`${PARTS.length} parts`}
      sections={SECTIONS}
      modes={MODES}
      thumb='row'
      surfaces='site'
      keys='flow'
      noun='part'
      onSelect={(id) => {
        if (id === activeOut.current) jumpRef.current(id);
      }}
    >
      <Sheet variant='flow' scrollRef={sheetRef}>
        <AtlasBook sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} updated={updated} />
      </Sheet>
    </ViewerShell>
  );
}
