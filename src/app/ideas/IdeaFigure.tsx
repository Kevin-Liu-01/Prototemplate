'use client';

import Image from 'next/image';
import { useState } from 'react';

import { Seg } from '@/components/viewer/Seg';
import type { IdeaCut, IdeaPicture } from '@/lib/ideas';

/** The frame's width: the reading column's plate at desktop, the viewport less the column's insets on a phone. */
const FRAME_SIZES = '(max-width: 900px) calc(100vw - 36px), 960px';
/** A reference picture's width: a quarter of the plate at desktop, half the column on a phone. */
const PICTURE_SIZES = '(max-width: 900px) 50vw, 240px';

/** A portrait cut is drawn narrower, so a tall capture is not taller than the screen. */
function frameWidth(cut: IdeaCut): string | undefined {
  return cut.h > cut.w ? 'min(100%, 420px)' : undefined;
}

type IdeaFigureProps = { title: string; cuts: readonly IdeaCut[] };

/**
 * One made thing with its versions in one place: the frame shows the
 * chosen version at its own aspect, the segmented control under it
 * switches between them, and the capture opens at full size in a new tab.
 */
export function IdeaFigure({ title, cuts }: IdeaFigureProps) {
  const first = cuts[0];
  const [key, setKey] = useState(first?.key ?? '');
  const cut = cuts.find((c) => c.key === key) ?? first;
  if (!cut) return null;
  return (
    <figure className='ix-fig'>
      <a
        className='ix-frame'
        href={cut.src}
        target='_blank'
        rel='noreferrer'
        aria-label={`Open ${title}, ${cut.label}, in a new tab`}
        style={{ aspectRatio: `${cut.w} / ${cut.h}`, width: frameWidth(cut) }}
      >
        <Image src={cut.src} alt='' width={cut.w} height={cut.h} sizes={FRAME_SIZES} quality={95} draggable={false} />
      </a>
      {cuts.length > 1 ? (
        <Seg
          className='ix-seg'
          label={`Versions of ${title}`}
          options={cuts.map((c) => ({ value: c.key, label: c.label, title: `${c.label}, ${c.w} by ${c.h}` }))}
          value={cut.key}
          onChange={setKey}
        />
      ) : null}
    </figure>
  );
}

type IdeaPicturesProps = { pictures: readonly IdeaPicture[]; credit?: string };

/** A reference grid: each picture whole on the plate, its caption under it, the credit under the grid. */
export function IdeaPictures({ pictures, credit }: IdeaPicturesProps) {
  return (
    <figure className='ix-refs'>
      <ul>
        {pictures.map((picture) => (
          <li key={picture.src}>
            <span className='ix-ref'>
              <Image src={picture.src} alt={picture.alt} width={picture.w} height={picture.h} sizes={PICTURE_SIZES} draggable={false} />
            </span>
            <span className='ix-ref-label'>{picture.label}</span>
          </li>
        ))}
      </ul>
      {credit ? <figcaption>{credit}</figcaption> : null}
    </figure>
  );
}
