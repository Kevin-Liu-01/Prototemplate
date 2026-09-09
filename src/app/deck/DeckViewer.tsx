'use client';

import { useGSAP } from '@gsap/react';
import type { ReactNode } from 'react';
import { useRef } from 'react';

import { BookView } from '@/components/viewer/BookView';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { ThumbMini } from '@/components/viewer/ThumbMini';
import type { MiniSource } from '@/components/viewer/ThumbMini';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { redrawDithers } from '@/lib/dither';
import type { ShellItem, ShellMode, ShellSection } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import { DECK_SECTIONS, SLIDE_COUNT } from './sections';

const DECK_TITLE = 'GT brand deck';
const DECK_MODES: readonly ShellMode[] = ['slide', 'grid', 'book'];
const BOOK_LEAD = `The General Translation brand in ${SLIDE_COUNT} slides: the thesis, the design system, the shipped site, the documentation, the blog, developer experience, prototemplate and glyphfield, and the current plan. Read it top to bottom, or click a page to open it as a slide.`;
const BOOK_META: readonly string[] = [`${DECK_SECTIONS.length} sections`, `${SLIDE_COUNT} slides`, 'September 2026'];
const BOOK_NOUN = { one: 'Slide', many: 'Slides' };

/** What a theme change or a new clone has to revisit. */
const THEMED = 'canvas.dither, img[data-dark]';

/**
 * The dither canvas on slide 20 sits in a grid column of the 1326px slide
 * body: 1326 minus the 220px matrix column and the 64px gap, less its own
 * 1px border on each side, by its 220px height less the same border. A
 * canvas that is not laid out (a slide that is off, a list that is
 * collapsed) is drawn at this box so it shows the same cells once it
 * appears.
 */
const DITHER_BOX = { fallbackWidth: 1040, fallbackHeight: 218 };

/** `GT brand deck, 12 of 52` */
function titleFor(index: number, total: number): string {
  return `${DECK_TITLE}, ${index + 1} of ${total}`;
}

function stageRoot(): Element | null {
  return document.querySelector('.pt-stagewrap .pt-deck-slides');
}

/** The nth slide on the stage, and the sheet frame drawn under every clone. */
function deckMini(_item: ShellItem, index: number): MiniSource {
  const stage = stageRoot();
  return {
    slide: stage?.querySelectorAll(':scope > .slide').item(index) ?? null,
    frame: document.querySelector('.pt-stagewrap .pt-sheet-frame'),
  };
}

function isDark(): boolean {
  return document.documentElement.dataset.theme === 'dark';
}

/**
 * Light and dark screenshot twins in the slides: `data-dark` names the dark
 * file, `data-light` remembers the authored one. Clones carry both
 * attributes, so a swap reaches every copy under `root`.
 */
function swapImages(root: ParentNode, dark: boolean): void {
  root.querySelectorAll<HTMLImageElement>('img[data-dark]').forEach((img) => {
    if (!img.dataset.light) img.dataset.light = img.getAttribute('src') ?? '';
    const want = dark ? img.dataset.dark : img.dataset.light;
    if (want && img.getAttribute('src') !== want) img.setAttribute('src', want);
  });
}

function applyTheme(root: ParentNode): void {
  swapImages(root, isDark());
  redrawDithers(root, DITHER_BOX);
}

/** True when a node the observer saw carries something the theme has to touch. */
function needsTheme(node: Node): node is Element {
  return node instanceof Element && (node.matches(THEMED) || node.querySelector(THEMED) !== null);
}

/**
 * The deck's behavior on the stage: moves `.is-on` to the active slide,
 * names the document after it, and keeps the slides in the current theme.
 * The stage markup is injected HTML, so the slide toggle is imperative; it
 * runs in a layout effect keyed to the index so the cut lands before paint.
 * Theme work runs from one MutationObserver: html[data-theme] flipping
 * redraws the whole document, and a clone appearing (the list, the grid, the
 * book) redraws that clone, since a cloned canvas carries no bitmap.
 */
function DeckSlides() {
  const { index, total } = usePtShell();
  /* read by the mount-time title re-assert, so it names the slide the hash chose */
  const position = useRef({ index, total });
  position.current = { index, total };

  useGSAP(
    () => {
      const stage = stageRoot();
      if (!stage) return;
      stage.querySelectorAll(':scope > .slide').forEach((slide, k) => {
        const on = k === index;
        slide.classList.toggle('is-on', on);
        /* the slide is laid out now, so its canvas can take its real box */
        if (on) redrawDithers(slide, DITHER_BOX);
      });
      document.title = titleFor(index, total);
    },
    { dependencies: [index, total] }
  );

  useMountEffect(() => {
    applyTheme(document);
    /* the route's metadata title lands when the head hydrates, after the
       layout effect above and on no fixed frame; a guard on the head puts
       the position back whenever the title is rewritten */
    const guard = new MutationObserver(() => {
      const want = titleFor(position.current.index, position.current.total);
      if (document.title !== want) document.title = want;
    });
    guard.observe(document.head, { childList: true, characterData: true, subtree: true });
    let frame = 0;
    const pending = new Set<ParentNode>();
    const flush = () => {
      frame = 0;
      const targets = pending.has(document) ? [document] : [...pending];
      pending.clear();
      targets.forEach((target) => {
        if (target === document || (target as Element).isConnected) applyTheme(target);
      });
    };
    const schedule = (target: ParentNode) => {
      pending.add(target);
      if (!frame) frame = requestAnimationFrame(flush);
    };
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'attributes') {
          schedule(document);
          return;
        }
        record.addedNodes.forEach((node) => {
          if (needsTheme(node)) schedule(node);
        });
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
      childList: true,
      subtree: true,
    });
    return () => {
      observer.disconnect();
      guard.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  });

  return null;
}

/** The book, mounted only while the mode is book; pages are live clones. */
function DeckBook({ sections }: { sections: readonly ShellSection[] }) {
  const { mode } = usePtShell();
  if (mode !== 'book') return null;
  return (
    <BookView
      title={DECK_TITLE}
      lead={BOOK_LEAD}
      meta={BOOK_META}
      sections={sections}
      noun={BOOK_NOUN}
      renderPage={(item, i) => <ThumbMini resolve={() => deckMini(item, i)} />}
    />
  );
}

export type DeckViewerProps = {
  /** from deckSections(slideTitles(html)) on the server */
  sections: readonly ShellSection[];
  /** the DeckStage, a server component holding the slide markup */
  children: ReactNode;
};

/**
 * The brand deck on the viewer shell: 52 slides on a 1600 x 900 sheet with
 * the frame, live thumbnails in the list and the grid, the book, and the
 * public surfaces in the index panel. Paged keys; the hash carries the slide.
 */
export default function DeckViewer({ sections, children }: DeckViewerProps) {
  return (
    <ViewerShell
      id='deck'
      title={DECK_TITLE}
      mark='gt'
      count={`${SLIDE_COUNT} slides`}
      sections={sections}
      modes={DECK_MODES}
      thumb='mini'
      surfaces='public'
      keys='paged'
      noun='slide'
      mini={deckMini}
    >
      <Sheet variant='fixed'>{children}</Sheet>
      <DeckSlides />
      <DeckBook sections={sections} />
    </ViewerShell>
  );
}
