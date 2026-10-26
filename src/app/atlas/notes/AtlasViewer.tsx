'use client';

import type { RefObject } from 'react';
import { useRef } from 'react';

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

import './atlas.css';

const TITLE = PAGE_NAMES.atlas.name;
const MODES: readonly ShellMode[] = ['book'];

const LEAD =
  'Atlas is where General Translation publishes long writing. Each story is an issue of a magazine, with a cover, art and colors of its own, and it reads as a magazine feature.';
const NOTE =
  'These notes give the reasons for a magazine and show the magazine as it stands. Then come the shelf it grew from, kept to explore, and the shelf’s three ways of setting a story: the docs reader, Fumadocs’ own interface and a printed book. The covers, Taylor Fang’s seven directions for the cover and the languages follow.';

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
      'A figure in Atlas can be live: the table of contents, the corner radii and the hit list from the docs essays are rebuilt in the page, so the reader can use what the paragraph describes.',
      'The first model was Stripe Press: a shelf of books, each with a cover designed for it. The magazine keeps a cover for every story and sets each one as a feature, with its own art, headline and colors.',
      'General Translation translates software, so the magazine reads in nine languages. The languages round the globe’s dial set every title in the reader’s language, and the globe shows a city where each language is spoken.',
      'A story takes its look from its subject. In the magazine each story’s colors and drawings come from what it is about; on the shelf, Fuma Nama’s profile was set in Fumadocs, the interface he made, and the history of Euclid’s Elements as a printed book.',
      'Atlas is one module, src/app/atlas/(magazine)/_atlas in Prototemplate, with its own type and colors, so gt-cloud’s Atlas app serves the same module at generaltranslation.com/atlas without the hub around it.',
    ],
    figures: [
      { src: '/shots/atlas/rack.webp', alt: 'The Atlas front page in the dark theme: four magazines in a row over the layout guides, the nameplate at the top left with the view and theme controls opposite, the globe at the bottom left and the city with its coordinates at the bottom right', caption: 'The front page in the dark theme. Each story is a magazine printed on its story’s stock; a click opens the story.' },
      { src: '/shots/atlas/rack-light.webp', alt: 'The Atlas front page in the light theme: four magazines in a row over the layout guides', caption: 'The same front page in the light theme.' },
      { src: '/shots/atlas/phone.webp', alt: 'The Atlas front page on a phone, 390px wide: Translating Euclid, with the edge of the next magazine at the right', caption: 'The front page at 390px wide: the first magazine, with the edge of the next at the right.', width: 390, height: 844 },
    ],
  },
  {
    id: 'magazine',
    title: 'The magazine',
    note: 'Every story',
    lead: 'Every story keeps its own layout and type (the docs reader, Fumadocs’ own look, the printed book) and takes the magazine’s text over them: a drop cap in the story’s own color (Euclid’s N cut out of a vermilion seal), the story’s mark over each section head, and its headline in its own hand. As in a New York Times story, the stage beside the text is the page’s own paper, the stage changes by itself as the reader reaches each figure, and a short scroll past each section brings it in as one slide.',
    body: [
      'The marks are drawn for each story. Euclid’s three sections open under the drawings of its three opening slides in turn (the first construction of Book I, Ricci’s road from Macau to Peking and the gougu figure), Designing docs under the docs page as stacked panels, Rewriting docs under a proofreader’s caret, and Fuma Nama under the line of a Fumadocs table of contents. Designing docs sets the people it is for in its color’s italics, and Rewriting docs sets “and agents” into its headline over a red caret. Euclid keeps Taylor Fang’s book and opens on her slides: the title page, then the epigraph, then the story.',
      'On the front page each story is a thin magazine in the form of Riffle, the first of Taylor Fang’s directions, printed on the story’s own stock: its cover’s colors, marbling and design, with the folds, specks and grain of a scanned sheet over them, its name up the right edge in Katagami Text, and the folio at the foot. A click opens the story. The bottom right corner rests curled up and lifts under the pointer to show the inside page, a survey sheet of the story’s place drawn from the globe’s land at a dot to the degree in the magazine’s own colours, its legend and scale bar where the corner lifts (Ricci’s road from Macau to Peking for Euclid, Hong Kong for Fuma Nama, San Francisco for the docs essays), and a click on the lifted corner opens the magazine itself over the hall on that sheet, faced by the cover’s pale inside: a click on the right page turns it, a click on the left page turns it back, as do the arrows under it, each leaf one rigid sheet turned by the compositor in under half a second. After the map sheet the magazine holds the whole article, fetched as the corner lifts and set on a Swiss grid after a printed museum magazine: an opening spread of the story’s picture across the gutter over the headline and the deck, then every paragraph, list and note in two columns with a drop cap under a running head and over a folio line, and each picture placed by its shape: to the edges over a band for its caption, on a page of its own inside the margins, in a band across the top of a page, in a whole column beside the text, or within a column. The back cover holds a legend as a map’s: an inset map of the story’s place beside the issue, the byline and the date. Every line is in Katagami Text and Katagami Serif. The front page is drawn over a layout sheet whose guides are measured from the page: each magazine’s sides and top, the horizon its leaves stand on, the nameplate’s cap height and baseline, and the globe’s centre, with Euclid’s first construction faint behind the middle magazines. The guides run the sheet’s full width and height in one ink. The nameplate takes its size from the globe’s dial, so the imprint’s right side and the globe’s centre stand on one guide. The nameplate is the book imprint drawn in lines of one weight, exactly as tall as the capitals, then Atlas in Katagami Serif at its regular weight, with the view and theme controls opposite it in the cell the guides draw there, three parts between hairlines; along the foot run the globe with the languages round its dial, the chosen one at its right (under the pointer the others stand out round it, and a pick turns the ring until the chosen one is at the right), and, in the cell between the lines over and under the globe, the city the reader is in with its coordinates, as the host’s edge reads it from their address (San Francisco until then, or where it cannot say).',
      'The shelf, the direction before the magazine, is kept to explore: the same stories as hardcovers on one shelf, read in the same looks without the magazine’s text.',
    ],
    links: [{ label: 'The shelf', href: '/atlas/shelf', text: 'Atlas before the magazine: each story a book on one shelf, read in a look of its own.' }],
    figures: [
      { src: '/shots/atlas/corner.webp', alt: 'The Atlas front page with the bottom right corner of Designing docs for humans lifted to show the legend of the map sheet inside', caption: 'Designing docs for humans with its bottom right corner lifted under the pointer, showing the legend of the map sheet printed inside.' },
      { src: '/shots/atlas/magazine.webp', alt: 'Designing docs for humans opened on its first spread: the cover’s pale inside on the left, the map sheet of San Francisco on the right', caption: 'A click on the corner opens the magazine on that map sheet, faced by the cover’s pale inside.' },
      { src: '/shots/atlas/spread.webp', alt: 'Designing docs for humans turned one leaf on: its picture across the gutter, the headline under it on the left page, and the deck, byline and date on the right page', caption: 'One leaf on, the opening spread: the story’s picture across the gutter over the headline and the deck.' },
      { src: '/shots/atlas/pages.webp', alt: 'Pages 6 and 7 of Designing docs for humans: two columns of text under a running head, the drop cap D in blue, a picture and its caption in a band across the top of the right page, and a folio line at the foot of each page', caption: 'The article in two columns under a running head and over a folio line, opening on its drop cap; this picture runs in a band across the top of the page.' },
      { src: '/shots/atlas/back.webp', alt: 'The back cover of Translating Euclid: the Atlas imprint at the foot, beside a ruled box with an inset map, the issue number, Taylor Fang, the date and Macau to Peking, 1582 to 1601', caption: 'The back cover of Translating Euclid: its legend holds an inset map of Ricci’s road beside the issue, the byline and the date.' },
      { src: '/shots/atlas/feature.webp', alt: 'Translating Euclid in the magazine in the light theme: the opening paragraph under a drop cap N cut out of a vermilion seal, and on the stage the globe over the first eight definitions in English', caption: 'Translating Euclid in the magazine: the opening paragraph under its drop cap, the N cut out of a vermilion seal, and the first definitions with the globe on the stage beside it.' },
      { src: '/shots/atlas/headline.webp', alt: 'Rewriting docs for humans and agents in the magazine: a red caret after humans and “and agents” in red italics in the headline, the proof mark over the first section head, a drop cap D in a red ring, and the cover’s proof lines on the stage', caption: 'Rewriting docs for humans and agents in the magazine: “and agents” set into its headline over a red caret, and the story’s proof mark over the first section head.' },
      { src: '/shots/atlas/shelf.webp', alt: 'The Atlas shelf in the dark theme: four hardcovers in a row with Designing docs for humans turned to face the reader, the topic tags at the top right, and the globe and flags at the foot', caption: 'The shelf, kept at /atlas/shelf. The book under the pointer turns to face the reader and lifts; a click opens the story.' },
    ],
  },
  {
    id: 'docs-reader',
    title: 'The docs reader',
    note: 'Designing docs, Rewriting docs',
    lead: 'On the shelf, the two docs essays use the split reader: the text on the left, a stage on the right that shows the figure the reader has reached, and a rail of ticks at the left edge that marks each section.',
    body: [
      'A figure with several views has a slider in its foot, a pill whose labels show through the thumb as it passes. The stage opens on the story’s live cover.',
    ],
    figures: [
      {
        src: '/shots/atlas/docs.webp',
        alt: 'Designing docs for humans in the split reader: the rail of ticks at the left edge, the text with its figure lines, and on the stage the old and new Introduction pages side by side with a slider for two views under them',
        caption: 'Designing docs for humans on the shelf: the text and its rail on the left, and Figure 5 on the stage with the slider for its two views in its foot.',
      },
    ],
  },
  {
    id: 'fumadocs',
    title: 'Fumadocs’ own look',
    note: 'Fuma Nama',
    lead: 'On the shelf, Fuma Nama’s profile is set in the interface he built: Fumadocs’ neutral greys, sans text, cards with a hairline border, and his orange.',
    body: [
      'His table of contents replaces the rail. It is the one Fumadocs ships: a line down the headings, drawn as an SVG path and used as a mask, so the orange thumb shows only where the line runs and follows it into the nested headings. Every slider in the story is drawn the same way, as a stepped line under its labels.',
    ],
    figures: [
      {
        src: '/shots/atlas/fuma.webp',
        alt: 'Fuma Nama on the shelf in the Fumadocs look: the masked table of contents on the left with its orange thumb, the text in the middle, and a live Fumadocs table of contents on the stage with its Live and Picture slider',
        caption: 'Fuma Nama: the masked table of contents on the left, and a live Fumadocs table of contents on the stage.',
      },
    ],
  },
  {
    id: 'printed-page',
    title: 'A printed book',
    note: 'Translating Euclid',
    lead: 'On the shelf, Translating Euclid is set as the book it is about, by Taylor Fang: light brown paper taken from the cover scan’s own paper, one serif face (Katagami Serif), a title page, and a stage beside the text for its pictures.',
    body: [
      'On a wide screen the text keeps to the left 61.8% at a 620px measure and the stage holds the rest: the cover, then each of the story’s 21 pictures with a short caption that links to its source, fading from one to the next as the reader reaches the paragraph about it. The stage empties at the sources. Notes sit in the margin level with their numbers, and on a phone each picture and note follows its paragraph.',
      'It is still the shared reader, with the same theme switch, monogram home and crossfade from the shelf as the other stories. The first figure shows the first eight definitions of Book I in five versions, English, Greek, Arabic, Latin and Chinese: the globe turns to each city in turn every six seconds until the reader picks one.',
    ],
    figures: [
      { src: '/shots/atlas/book.webp', alt: 'Translating Euclid on the shelf in the light theme: its title page on brown paper on the left, and the 1607 page of the Jihe Yuanben on the stage', caption: 'Translating Euclid opens on its title page, with the 1607 page on the stage beside it.' },
      { src: '/shots/atlas/figure.webp', alt: 'The first eight definitions of Book I in Translating Euclid: the globe turned to Cambridge with its coordinates, a switch of the five versions, and the definitions in English', caption: 'The first eight definitions on the stage in English, the globe turned to Cambridge, where Heath’s version was printed in 1908.' },
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
    figures: [
      {
        src: '/shots/atlas/covers.webp',
        alt: 'The four covers on the shelf: Translating Euclid in vellum with the 1607 page, Designing docs for humans in cobalt with the exploded docs page, Rewriting docs for humans and agents in graphite with red edits, and Fuma Nama in orange with the crescent and its orbit',
        caption: 'The four covers on the shelf, each title at the foot and its authors on the spine.',
        width: 1440,
        height: 480,
      },
    ],
  },
  {
    id: 'directions',
    title: 'Seven cover directions',
    note: 'Taylor Fang',
    lead: 'Taylor Fang drew seven directions for opening Atlas on a single issue, the first Chinese translation of Euclid, as one cover that fills the screen. Each has its own page under /atlas/directions, and the number keys move between them.',
    body: [],
    links: [
      { label: 'Riffle', href: '/atlas/directions/riffle', text: 'The issue as a thin paper magazine on the Atlas shelf. A click riffles every page past, and a scroll turns one page at a time.' },
      { label: 'Atlas book', href: '/atlas/directions/atlas', text: 'The Atlas shelf reduced to one book, which opens on Book I as it was set in 1607.' },
      { label: 'Signal', href: '/atlas/directions/signal', text: 'A General Translation poster: a Morse field, the first definition in five languages and the coordinates of each city.' },
      { label: 'Proof poster', href: '/atlas/directions/proof', text: 'A printer’s proof: grey type, construction lines at the letter boundaries and a second page of definitions.' },
      { label: 'Light poster', href: '/atlas/directions/light', text: 'A column of light and film grain behind Book I, Proposition 1, drawn with a compass and lettered as in 1607.' },
      { label: 'Route', href: '/atlas/directions/route', text: 'Wayfinding signage for Matteo Ricci’s road from Macau to Peking, with a sign that changes at each stop.' },
      { label: 'Measure', href: '/atlas/directions/measure', text: 'A drafting sheet: Book I, Proposition 47 in heavy black, dimensioned 30, 40 and 50, with a title block.' },
    ],
    figures: [{ src: '/shots/atlas/directions.webp', alt: 'The seven cover directions, then Riffle opened on its spread', caption: 'The seven directions in order, then Riffle opened on its spread.', width: 1436, height: 1810 }],
  },
  {
    id: 'languages',
    title: 'Languages and places',
    note: 'Nine languages',
    lead: 'The flags under the shelf set every title in one of nine languages. Each language has several cities where it is spoken, and picking a language again moves to its next city, so no language is pinned to one country.',
    body: [
      'The coordinates in the corner change with the city, digit by digit like a split-flap board. The globe beside the flags opens into the locator: the globe with its coordinate lines, a leader from the city to its locale, its name, and its latitude and longitude on a line each.',
    ],
    figures: [
      {
        src: '/shots/atlas/locator.webp',
        alt: 'The locator open over the Atlas front page in the light theme: the globe with its coordinate lines, a leader from San Francisco to en-US, the city’s name and coordinates, and the nine languages in a list',
        caption: 'The locator over the front page, open on San Francisco, with the nine languages beside it.',
      },
      {
        src: '/shots/atlas/ring.webp',
        alt: 'The Atlas front page with the languages open round the globe’s dial, JA at its right, the globe turned to Japan, the three essay titles and the dates in Japanese, and Fuma Nama under his own name',
        caption: 'The languages round the globe’s dial on the front page, with Japanese picked: the ring turns JA to the right, and each title takes its Japanese form.',
      },
    ],
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

type BookProps = {
  sheetRef: RefObject<HTMLDivElement | null>;
  jumpRef: RefObject<(id: string) => void>;
  activeOut: RefObject<string>;
  updated: PageUpdated;
};

/**
 * The book: a head, the contents, then one section per part. The shared
 * read line (useReadLine) selects the part under the line through the
 * shell, so the list and the hash follow the reader, and a selection from
 * the list scrolls the sheet to its part.
 */
function AtlasBook({ sheetRef, jumpRef, activeOut, updated }: BookProps) {
  const { active, ready, select } = usePtShell();
  activeOut.current = active;
  const { jump, onContents } = useReadLine({ rootRef: sheetRef, selector: '.an-sec', active, select, ready, smooth: true });
  jumpRef.current = jump;

  return (
    <div className='an-book pt-book-col'>
      <BookHead
        title={TITLE}
        lead={LEAD}
        note={NOTE}
        updated={updated}
        facts={[
          { icon: 'book', key: 'Stories', value: 4 },
          { icon: 'columns', key: 'Editions', value: 2 },
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
