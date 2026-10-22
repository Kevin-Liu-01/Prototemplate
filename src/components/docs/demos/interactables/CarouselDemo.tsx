'use client';

import { useState } from 'react';

import CarouselGallery from '@/components/blog/CarouselGallery';
import type { CarouselImage } from '@/components/blog/CarouselGallery';

import { Choice } from '../controls';
import Plate from '../Plate';

// the gallery's rules (.blog-carousel and its frame, edges, arrows and dots) live in the blog sheet
import '@/app/blog/blog.css';
import './interactables.css';

/* the docs redesign post's UI primitives gallery, as the post sets it */
const IMAGES: readonly CarouselImage[] = [
  {
    src: '/static/blogs/designing-docs-E2-solid-vs-outline.webp?v=20260924-1200',
    alt: 'The icon rule of the new docs: thin outline glyphs on the controls and solid glyphs where an icon carries meaning',
    width: 3840,
    height: 2160,
  },
  {
    src: '/static/blogs/designing-docs-E3-corners.webp?v=20260920-0930',
    alt: 'The old pill button and search field over the new button and copy control at the same scale, beside a radius scale where the pill is struck out',
    width: 3840,
    height: 2160,
  },
  {
    src: '/static/blogs/designing-docs-E7-quiet-scrollbar.webp?v=20260920-0930',
    alt: 'The sidebar with its thin rounded scrollbar thumb on a transparent track, and the thumb enlarged',
    width: 3840,
    height: 2160,
  },
  {
    src: '/static/blogs/designing-docs-E4-micro-ui.webp?v=20260920-0930',
    alt: 'The language menu with custom matte SVG flags next to the same list drawn with emoji flags',
    width: 3840,
    height: 2160,
  },
];

type Autoplay = '0' | '2500' | '4500';

type Count = '1' | '2' | '4';

/**
 * CarouselGallery, live: the blog's image gallery with the docs redesign
 * post's four UI primitive figures. A click on the left half of the image
 * goes back and on the right half forward; the chevrons and their scrims
 * surface on hover or focus; the dots jump. Autoplay sets the interval,
 * which the gallery reads when it mounts, and Images shows the one-image
 * form, which drops the arrows, the dots and autoplay.
 */
export default function CarouselDemo() {
  const [autoplay, setAutoplay] = useState<Autoplay>('4500');
  const [count, setCount] = useState<Count>('4');
  const items = IMAGES.slice(0, Number(count));

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Autoplay'
            options={[
              { value: '0', label: 'Off' },
              { value: '2500', label: '2.5 s' },
              { value: '4500', label: '4.5 s' },
            ]}
            value={autoplay}
            onChange={setAutoplay}
          />
          <Choice
            label='Images'
            options={[
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '4', label: '4' },
            ]}
            value={count}
            onChange={setCount}
          />
        </>
      }
      fit
      label='The blog image gallery with four figures'
      moves
      stageClassName='ixa-carousel'
      tag={`<CarouselGallery items interval={${autoplay}} />`}
    >
      <CarouselGallery interval={Number(autoplay)} items={items} key={`${autoplay}-${count}`} label='UI primitives' />
    </Plate>
  );
}
