'use client';

import Image from 'next/image';
import { useState } from 'react';

import { Seg } from '@/components/viewer/Seg';
import type { Entry } from '@/lib/graphics-model';

type VariantFigureProps = { entry: Entry };

/**
 * The frame's width: the reading column's 960px plate at desktop, the
 * viewport less the column's 18px insets on a phone. The image optimizer
 * picks the candidate nearest that width times the screen's pixel ratio
 * (next.config.ts), so a phone never downloads the 1920px master.
 */
const FRAME_SIZES = '(max-width: 900px) calc(100vw - 36px), 960px';

/**
 * One image of the set with its versions in one place: the frame shows the
 * chosen version at its own aspect (a card is wider than a visual, a clip
 * is 1400 by 788), the segmented control under it switches between them,
 * and the frame opens the file itself in a new tab. An image comes through
 * the image optimizer at quality 95, which keeps the dither and the text
 * edges; a GIF is passed through as it is. A clip's video version plays in
 * place with its own controls and is not a link, so pressing play never
 * opens a tab; nothing autoplays.
 */
export function VariantFigure({ entry }: VariantFigureProps) {
  const first = entry.variants[0];
  const [key, setKey] = useState(first?.key ?? '');
  const variant = entry.variants.find((v) => v.key === key) ?? first;
  if (!variant) return null;
  const ratio = variant.w && variant.h ? `${variant.w} / ${variant.h}` : '16 / 9';
  return (
    <figure className='gx-fig'>
      {variant.kind === 'video' ? (
        <div className='gx-frame' style={{ aspectRatio: ratio }}>
          <video
            src={variant.src}
            aria-label={`${entry.title}, ${variant.label}`}
            muted
            loop
            playsInline
            controls
            preload='metadata'
          />
        </div>
      ) : (
        <a
          className='gx-frame'
          href={variant.src}
          target='_blank'
          rel='noreferrer'
          aria-label={`Open ${entry.title}, ${variant.label}, in a new tab`}
          style={{ aspectRatio: ratio }}
        >
          <Image
            src={variant.src}
            alt=''
            width={variant.w ?? 1920}
            height={variant.h ?? 1080}
            sizes={FRAME_SIZES}
            quality={95}
            unoptimized={variant.kind === 'gif'}
            draggable={false}
          />
        </a>
      )}
      {entry.variants.length > 1 ? (
        <Seg
          className='gx-seg'
          label={`Versions of ${entry.title}`}
          options={entry.variants.map((v) => ({ value: v.key, label: v.label, title: `${v.label}${v.w && v.h ? `, ${v.w} by ${v.h}` : ''}` }))}
          value={variant.key}
          onChange={setKey}
        />
      ) : null}
    </figure>
  );
}
