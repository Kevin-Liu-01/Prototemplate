'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

import { BookHead } from '@/components/viewer/BookView';
import { Icon } from '@/components/viewer/icons';
import type { IconName } from '@/components/viewer/icons';
import { Sheet } from '@/components/viewer/Sheet';
import { ThumbShot } from '@/components/viewer/ThumbShot';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { DIRECTIONS, directionPageHref, directionPages, directionShots, getDirection } from '@/lib/directions';
import type { Direction, DirectionPage, Tone } from '@/lib/directions';
import type { PageUpdated } from '@/lib/page-updated';
import type { ShellMode } from '@/lib/shell-data';
import { NOTE_MAX, splitLead } from '@/lib/shell-data';
import { surfaceShot } from '@/lib/surfaces';
import { useMountEffect } from '@/lib/use-mount-effect';

import { DirectionFrame, FRAME_H, FRAME_W } from './DirectionFrame';
import { DIRECTION_ITEMS, DIRECTION_SECTIONS } from './sections';

import './directions.css';

/**
 * One direction on the viewer shell: /directions/<slug> for each of the
 * three sites and the thirteen explorations (the shipped reference keeps
 * /d/production). The shell draws the site map in its one order and this
 * route's sections (the direction groups shared with the gallery, Shipped,
 * Sites and Explorations) replace the groups of the same name, with this
 * direction's row active and scrolled into view; the count reads the
 * direction's place among them all, and the toolbar's Previous and
 * Next, a list pick or a digit open another direction's page (the archive
 * route's pattern). The reading column holds the
 * direction's book: the head (the name, the concept's lead in two or
 * three lines, the kind, the tone and the page count in the panel, the
 * rest of the concept and the signature in the note), the band, then the
 * live page at 1440 pixels wide in the fixed sheet's ring the
 * gallery's slide and the compare rig draw around a live frame, the light
 * and dark captures side by side in edge frames, and, for a site, its
 * pages as ruled rows with their thumbnails, and a concept too long for
 * the head's note (the deco briefs) as the last section, The brief. The
 * toolbar slot opens the
 * prototype as its own full page. Keys are flow, so Space and the arrows
 * scroll the sheet.
 */
const DIRECTIONS_MODES: readonly ShellMode[] = ['book'];

const TONE_LABEL: Readonly<Record<Tone, string>> = { light: 'Light', dark: 'Dark', alt: 'Alternating' };

function kindLabel(d: Direction): string {
  if (d.reference) return 'Shipped';
  return d.site ? 'Site' : 'Exploration';
}

/** The panel's glyph for a kind: the shell's own for the shipped site, a site and an exploration. */
const KIND_ICON: Readonly<Record<string, IconName>> = { Shipped: 'check-badge', Site: 'globe', Exploration: 'explore' };

/** The toolbar slot: the prototype as its own full page, with the page's own chrome. */
function OpenFullPage({ direction }: { direction: Direction }) {
  return (
    <Link className='pt-ib dr-open' href={`/d/${direction.slug}`} title={`Open ${direction.name} as its own full page`}>
      <Icon name='open-page' />
      <span className='pt-lb'>Open full page</span>
    </Link>
  );
}

/** A section divider in the book's grammar (BookView.css, .pt-book-sec): the ordinal and a note in the gutter, the title beside. */
function Divider({ ordinal, note, title }: { ordinal: number; note: string; title: string }) {
  return (
    <div className='pt-book-sec'>
      <small>
        <span>Section {ordinal}</span>
        <span>{note}</span>
      </small>
      <h2>{title}</h2>
    </div>
  );
}

/**
 * The live page in the flow: a 1440x900 stage scaled to the column, inside
 * the fixed sheet's ring (a hair border, a paper gap, a hair-soft outline; the
 * structural role, since a live page is a surface and not a picture). The
 * scale is measured from the ring's content box, so the frame follows the
 * column through the sidebar's width and the window; the box keeps the
 * stage's 1440 to 900 ratio, so the scaled stage fills it exactly.
 */
function LivePage({ direction }: { direction: Direction }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useMountEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const next = el.clientWidth / FRAME_W;
      setScale((prev) => (prev === next ? prev : next));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  });

  return (
    <figure className='dr-live'>
      <div className='dr-sheet-mat'>
        <div ref={box} className='dr-sheet'>
          <div
            className='dr-stage'
            style={{
              width: FRAME_W,
              height: FRAME_H,
              transform: `scale(${scale})`,
              visibility: scale > 0 ? undefined : 'hidden',
            }}
          >
            <DirectionFrame direction={direction} item={DIRECTION_ITEMS.get(direction.slug)} />
          </div>
        </div>
      </div>
      <figcaption className='dr-cap'>
        <span>
          {direction.name}, live at {FRAME_W} pixels wide
        </span>
        <span>/d/{direction.slug}</span>
      </figcaption>
    </figure>
  );
}

/** One capture in an edge frame with its theme as the caption. */
function Capture({ direction, theme }: { direction: Direction; theme: 'light' | 'dark' }) {
  const shots = directionShots(direction.slug);
  const src = theme === 'light' ? shots.light : shots.dark;
  if (!src) return null;
  return (
    <figure className='dr-shot'>
      <span className='dr-shot-frame'>
        <img
          src={src}
          width={FRAME_W}
          height={FRAME_H}
          loading='lazy'
          decoding='async'
          draggable={false}
          alt={`${direction.name}, the first fold in the ${theme} theme at ${FRAME_W} pixels wide`}
        />
      </span>
      <figcaption>{theme === 'light' ? 'Light' : 'Dark'}</figcaption>
    </figure>
  );
}

/** A page of a site as a ruled row: its 96x54 thumbnail from the surfaces registry, its name, its address. */
function PageRow({ page }: { page: DirectionPage }) {
  const shot = surfaceShot(page.id) ?? page.shot;
  return (
    <li>
      <Link className='dr-page' href={page.href} data-preview={page.id}>
        <span className='dr-page-frame'>
          <ThumbShot item={{ id: page.id, title: page.name, shot }} />
        </span>
        <span className='dr-page-main'>
          <span className='dr-page-name'>{page.name}</span>
          <span className='dr-page-addr'>{page.href}</span>
        </span>
        <Icon name='open-page' />
      </Link>
    </li>
  );
}

function DirectionBook({ direction, updated }: { direction: Direction; updated: PageUpdated }) {
  const pages = directionPages(direction);
  const kind = kindLabel(direction);

  /* the lead in two or three lines; the rest of the concept under the
     head's rule with the signature, or, past NOTE_MAX (the deco briefs), as
     the last section, which leaves the signature alone in the note */
  const split = splitLead(direction.concept, direction.lead ? 0 : undefined);
  const lead = direction.lead ?? split.lead;
  const note = direction.note ?? split.note;
  const brief = note && note.length > NOTE_MAX ? note : null;
  const briefOrdinal = direction.site ? 4 : 3;
  const signature = (
    <p>
      <b>Signature.</b> {direction.signature}
    </p>
  );

  return (
    <article className='dr-doc pt-book-col'>
      <BookHead
        title={direction.name}
        lead={lead}
        note={
          brief || !note ? (
            signature
          ) : (
            <>
              <p>{note}</p>
              {signature}
            </>
          )
        }
        updated={updated}
        facts={[
          { icon: KIND_ICON[kind] ?? 'pages', key: 'Kind', value: kind },
          { icon: 'swatch', key: 'Tone', value: TONE_LABEL[direction.tone] },
          { icon: 'pages', key: 'Pages', value: pages.length },
        ]}
      />

      <section className='pt-book-part dr-sec' aria-label='Live page'>
        <Divider ordinal={1} note={`${FRAME_W} pixels wide`} title='Live page' />
        <LivePage direction={direction} />
      </section>

      <section className='pt-book-part dr-sec' aria-label='Captures'>
        <Divider ordinal={2} note={`${FRAME_W} by ${FRAME_H}`} title='Captures' />
        <div className='dr-shots'>
          <Capture direction={direction} theme='light' />
          <Capture direction={direction} theme='dark' />
        </div>
      </section>

      {direction.site ? (
        <section className='pt-book-part dr-sec' aria-label='Pages'>
          <Divider ordinal={3} note={`${pages.length} pages`} title='Pages' />
          <ul className='dr-page-list'>
            {pages.map((page) => (
              <PageRow key={page.id} page={page} />
            ))}
          </ul>
        </section>
      ) : null}

      {brief ? (
        <section className='pt-book-part dr-sec' aria-label='The brief'>
          <Divider ordinal={briefOrdinal} note='The concept' title='The brief' />
          <div className='pt-book-note dr-brief'>
            <p>{brief}</p>
          </div>
        </section>
      ) : null}
    </article>
  );
}

export type DirectionViewerProps = {
  slug: string;
  /** the direction's entry in src/lib/updated.ts, from the server page */
  updated: PageUpdated;
};

export default function DirectionViewer({ slug, updated }: DirectionViewerProps) {
  const router = useRouter();
  const direction = getDirection(slug);
  /* stable, so the memoized toolbar skips this route's renders */
  const openPage = useMemo(() => (direction ? <OpenFullPage direction={direction} /> : null), [direction]);

  /* a selection from the list, the arrows or a digit opens that direction's page */
  const onSelect = (id: string) => {
    if (id === slug || !getDirection(id)) return;
    router.push(directionPageHref(id));
  };

  if (!direction) return null;

  return (
    <ViewerShell
      id='directions'
      title={direction.name}
      mark='pt'
      count={`${DIRECTIONS.length} directions`}
      sections={DIRECTION_SECTIONS}
      active={direction.slug}
      modes={DIRECTIONS_MODES}
      surfaces='site'
      thumb='shot'
      keys='flow'
      noun='direction'
      onSelect={onSelect}
      toolbarSlot={openPage}
    >
      <Sheet variant='flow'>
        <DirectionBook direction={direction} updated={updated} />
      </Sheet>
    </ViewerShell>
  );
}
