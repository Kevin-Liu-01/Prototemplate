'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

import BlogHeroFigure from './BlogHeroFigure';
import {
  BOARD_DARK,
  BOARD_LIGHT,
  createBoardField,
  type BoardFieldHandle,
  type BoardInk,
  type BoardWord,
} from './board-field';

/* The terminus board re-inked for the landing: same quiet tone cells,
   but the phosphor moment is the house accent blue, not amber. */
const HERO_LIGHT: BoardInk = {
  ...BOARD_LIGHT,
  flash: [37, 99, 235],
  glow: [59, 130, 246],
  glowAlpha: 0.3,
};

const HERO_DARK: BoardInk = {
  ...BOARD_DARK,
  flash: [134, 168, 255],
  glow: [134, 168, 255],
  glowAlpha: 0.28,
};

/* The tickers' vocabulary: "news" across the catalog's scripts. Vetted
   words only — per-cell-safe scripts, same rule as the greetings. */
const NEWS_WORDS: readonly BoardWord[] = [
  { chars: Array.from('NEWS'), stamp: 'EN' },
  { chars: Array.from('NOTICIAS'), stamp: 'ES' },
  { chars: Array.from('ACTUALITÉS'), stamp: 'FR' },
  { chars: Array.from('ニュース'), stamp: 'JA' },
  { chars: Array.from('NACHRICHTEN'), stamp: 'DE' },
  { chars: Array.from('뉴스'), stamp: 'KO' },
  { chars: Array.from('新闻'), stamp: 'ZH' },
  { chars: Array.from('NOTÍCIAS'), stamp: 'PT' },
  { chars: Array.from('NOTIZIE'), stamp: 'IT' },
  { chars: Array.from('NIEUWS'), stamp: 'NL' },
  { chars: Array.from('NYHETER'), stamp: 'SV' },
  { chars: Array.from('AKTUALNOŚCI'), stamp: 'PL' },
  { chars: Array.from('НОВИНИ'), stamp: 'UK' },
  { chars: Array.from('HABERLER'), stamp: 'TR' },
  { chars: Array.from('חדשות'), stamp: 'HE', rtl: true },
];

/**
 * The blog masthead as a terminus hall: two split-flap ticker strips
 * run flush along the band's top and bottom edges, "news" resolving
 * across the catalog's languages in the house blue, while the copy and
 * the dotted GT figure stand on the same board pitch between them —
 * the figure tall enough that the tickers pass behind its outline.
 * Children are the hero copy.
 */
export default function BlogHeroBoard({
  children,
}: {
  children: React.ReactNode;
}) {
  const topRef = useRef<HTMLCanvasElement>(null);
  const bottomRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const doc = document.documentElement;
    const inkFor = () =>
      doc.getAttribute('data-theme') === 'dark' ? HERO_DARK : HERO_LIGHT;
    /* the board letters set in the page's own sans — no mono here */
    const face = getComputedStyle(document.body).fontFamily;

    const fields: BoardFieldHandle[] = [];
    const strips: Array<[HTMLCanvasElement | null, number, number]> = [
      [topRef.current, 0x6e657773, 0],
      [bottomRef.current, 0x74696b72, 5],
    ];
    for (const [canvas, seed, offset] of strips) {
      if (!canvas) continue;
      /* a two-row strip wants a faster desk: announcements land often
         enough that several languages are always on the board; the two
         strips read from offset points in the vocabulary so they never
         announce in unison */
      const field = createBoardField(canvas, {
        ink: inkFor(),
        font: face,
        words: [
          ...NEWS_WORDS.slice(offset),
          ...NEWS_WORDS.slice(0, offset),
        ],
        seed,
        params: {
          annFirst: 0.4,
          annPeriod: 2.2,
          annHold: 7,
          wavePeriod: 9.5,
        },
      });
      if (field) fields.push(field);
    }
    if (!fields.length) return;

    const theme = new MutationObserver(() => {
      const ink = inkFor();
      for (const field of fields) field.setInk(ink);
    });
    theme.observe(doc, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      theme.disconnect();
      for (const field of fields) field.destroy();
    };
  }, []);

  return (
    <div className='blog-hero-board'>
      {/* the figure sits UNDER the terminus: cells flip over its dashes,
          and the strip zones dim it the way a board in front would */}
      <div className='blog-hero-figure-slot' aria-hidden='true'>
        <BlogHeroFigure />
      </div>
      <canvas ref={topRef} className='blog-hero-ticker' aria-hidden />
      <div className='blog-hero-mast'>
        <div className='blog-hero-copy'>{children}</div>
      </div>
      <canvas ref={bottomRef} className='blog-hero-ticker' aria-hidden />
    </div>
  );
}
