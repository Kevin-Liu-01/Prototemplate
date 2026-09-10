'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { BookHead } from '@/components/viewer/BookView';
import type { BookMeta } from '@/components/viewer/BookView';
import { Icon } from '@/components/viewer/icons';
import { Sheet } from '@/components/viewer/Sheet';
import { ThumbShot } from '@/components/viewer/ThumbShot';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { DIRECTIONS, directionPageHref, directionPages, directionShots, getDirection } from '@/lib/directions';
import type { Direction, DirectionPage, Tone } from '@/lib/directions';
import type { ShellMode } from '@/lib/shell-data';
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
 * direction's place among the seventeen, and the toolbar's Previous and
 * Next, a list pick or a digit open another direction's page (the archive
 * route's pattern). The flow sheet holds the
 * direction's book: the head (the name, the concept as the lead, the
 * label, the kind and the tone in the meta table, the signature as a ruled
 * row under it), the live page at 1440 pixels wide in the sheet ring the
 * gallery's slide and the compare rig draw around a live frame, the light
 * and dark captures side by side in edge frames, and, for a site, its
 * pages as ruled rows with their thumbnails. The toolbar slot opens the
 * prototype as its own full page. Keys are flow, so Space and the arrows
 * scroll the sheet.
 */
const DIRECTIONS_MODES: readonly ShellMode[] = ['book'];

const TONE_LABEL: Readonly<Record<Tone, string>> = { light: 'Light', dark: 'Dark', alt: 'Alternating' };

function kindLabel(d: Direction): string {
  if (d.reference) return 'Shipped';
  return d.site ? 'Site' : 'Exploration';
}

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
 * the sheet ring (a hair border, a paper gap, a hair-soft outline; the
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

function DirectionBook({ direction }: { direction: Direction }) {
  const pages = directionPages(direction);
  /* the direction's place among the seventeen, the number its sidebar row and the toolbar count read (sections.ts), not the gallery article's registry label */
  const meta: BookMeta[] = [
    { key: 'Direction', value: DIRECTION_ITEMS.get(direction.slug)?.n ?? direction.label ?? '' },
    { key: 'Kind', value: kindLabel(direction) },
    { key: 'Tone', value: TONE_LABEL[direction.tone] },
    { key: 'Pages', value: String(pages.length) },
  ];

  return (
    <article className='dr-doc'>
      <div className='dr-head'>
        <BookHead title={direction.name} lead={direction.concept} meta={meta} />
        <dl className='dr-sig'>
          <dt>Signature</dt>
          <dd>{direction.signature}</dd>
        </dl>
      </div>

      <section className='dr-sec' aria-label='Live page'>
        <Divider ordinal={1} note={`${FRAME_W} pixels wide`} title='Live page' />
        <LivePage direction={direction} />
      </section>

      <section className='dr-sec' aria-label='Captures'>
        <Divider ordinal={2} note={`${FRAME_W} by ${FRAME_H}`} title='Captures' />
        <div className='dr-shots'>
          <Capture direction={direction} theme='light' />
          <Capture direction={direction} theme='dark' />
        </div>
      </section>

      {direction.site ? (
        <section className='dr-sec' aria-label='Pages'>
          <Divider ordinal={3} note={`${pages.length} pages`} title='Pages' />
          <ul className='dr-page-list'>
            {pages.map((page) => (
              <PageRow key={page.id} page={page} />
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}

export type DirectionViewerProps = { slug: string };

export default function DirectionViewer({ slug }: DirectionViewerProps) {
  const router = useRouter();
  const direction = getDirection(slug);

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
      toolbarSlot={<OpenFullPage direction={direction} />}
    >
      <Sheet variant='flow' width={1280}>
        <DirectionBook direction={direction} />
      </Sheet>
    </ViewerShell>
  );
}
