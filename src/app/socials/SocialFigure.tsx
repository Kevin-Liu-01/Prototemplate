'use client';

import Image from 'next/image';
import { useState } from 'react';

import { Seg } from '@/components/viewer/Seg';
import { filmNote, pictureNote } from '@/lib/previous-mark';
import type { SocialVariant } from '@/lib/socials';

/** The frame's width: the reading column's plate at desktop, the viewport less the column's insets on a phone. */
const FRAME_SIZES = '(max-width: 900px) calc(100vw - 36px), 960px';

/** What the figure says under a cut that shows the previous mark (src/lib/previous-mark.ts), else null. */
function markNote(variant: SocialVariant): string | null {
  if (variant.kind === 'video') return filmNote(variant.src) ?? pictureNote(variant.poster);
  return pictureNote(variant.src);
}

/** A portrait cut is drawn narrower, so a 4:5 picture is not taller than the screen. */
function frameWidth(variant: SocialVariant): string | undefined {
  return variant.h > variant.w ? 'min(100%, 520px)' : undefined;
}

type SocialFigureProps = { title: string; variants: readonly SocialVariant[] };

/**
 * One picture or film with its cuts in one place: the frame shows the
 * chosen cut at its own aspect, the segmented control under it switches
 * between them, and a still opens at full size in a new tab. A film plays
 * in place with its own controls and its poster frame; nothing autoplays.
 */
export function SocialFigure({ title, variants }: SocialFigureProps) {
  const first = variants[0];
  const [key, setKey] = useState(first?.key ?? '');
  const variant = variants.find((v) => v.key === key) ?? first;
  if (!variant) return null;
  const note = markNote(variant);
  const style = { aspectRatio: `${variant.w} / ${variant.h}`, width: frameWidth(variant) };
  return (
    <figure className='sx-fig'>
      {variant.kind === 'video' ? (
        <div className='sx-frame' style={style}>
          <video
            key={variant.src}
            src={variant.src}
            poster={variant.poster}
            aria-label={`${title}, ${variant.label}`}
            playsInline
            controls
            preload='none'
          />
        </div>
      ) : (
        <a
          className='sx-frame'
          href={variant.src}
          target='_blank'
          rel='noreferrer'
          aria-label={`Open ${title}, ${variant.label}, in a new tab`}
          style={style}
        >
          <Image src={variant.src} alt='' width={variant.w} height={variant.h} sizes={FRAME_SIZES} quality={95} draggable={false} />
        </a>
      )}
      {note ? <figcaption className='sx-note'>{note}</figcaption> : null}
      {variants.length > 1 ? (
        <Seg
          className='sx-seg'
          label={`Cuts of ${title}`}
          options={variants.map((v) => ({ value: v.key, label: v.label, title: `${v.label}, ${v.w} by ${v.h}` }))}
          value={variant.key}
          onChange={setKey}
        />
      ) : null}
    </figure>
  );
}
