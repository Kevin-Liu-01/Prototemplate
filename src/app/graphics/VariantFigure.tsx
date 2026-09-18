'use client';

import { useState } from 'react';

import { Seg } from '@/components/viewer/Seg';
import type { Entry } from '@/lib/graphics-model';

type VariantFigureProps = { entry: Entry };

/**
 * One image of the set with its versions in one place: the frame shows the
 * chosen version at its own aspect (a card is wider than a visual, a clip
 * is 1400 by 788), the segmented control under it switches between them,
 * and the frame opens the file itself. A clip's video version plays inline
 * with controls; nothing autoplays.
 */
export function VariantFigure({ entry }: VariantFigureProps) {
  const first = entry.variants[0];
  const [key, setKey] = useState(first?.key ?? '');
  const variant = entry.variants.find((v) => v.key === key) ?? first;
  if (!variant) return null;
  const ratio = variant.w && variant.h ? `${variant.w} / ${variant.h}` : '16 / 9';
  return (
    <figure className='gx-fig'>
      <a className='gx-frame' href={variant.src} target='_blank' rel='noreferrer' style={{ aspectRatio: ratio }}>
        {variant.kind === 'video' ? (
          <video src={variant.src} muted loop playsInline controls preload='metadata' />
        ) : (
          <img src={variant.src} alt='' loading='lazy' decoding='async' draggable={false} />
        )}
      </a>
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
