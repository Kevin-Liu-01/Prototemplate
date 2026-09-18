import type { ReactNode } from 'react';
import { Children, isValidElement } from 'react';

import CarouselGallery from '@/components/blog/CarouselGallery';
import type { CarouselImage } from '@/components/blog/CarouselGallery';

export type CarouselItemProps = {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
};

/** Marker for MDX authors. Carousel reads its props; it never renders. */
export function CarouselItem(_props: CarouselItemProps) {
  return null;
}

type CarouselProps = {
  label?: string;
  width?: number | string;
  height?: number | string;
  interval?: number | string;
  children?: ReactNode;
};

const toSize = (value: number | string | undefined): number | undefined => {
  if (value === undefined) return undefined;
  const size = Number(value);
  return Number.isFinite(size) && size > 0 ? size : undefined;
};

/**
 * The MDX face of the gallery. Blog MDX is compiled with JavaScript
 * expressions blocked, so a post cannot pass an array prop; authors list
 * the images as <CarouselItem /> children with string attributes and this
 * server component turns them into the items array the client gallery
 * takes.
 */
export default function Carousel({ label, width, height, interval, children }: CarouselProps) {
  const items: CarouselImage[] = [];
  for (const child of Children.toArray(children)) {
    if (!isValidElement<CarouselItemProps>(child)) continue;
    if (child.type !== CarouselItem || !child.props.src) continue;
    items.push({
      src: child.props.src,
      alt: child.props.alt ?? '',
      width: toSize(child.props.width ?? width),
      height: toSize(child.props.height ?? height),
    });
  }
  const every = interval === undefined ? undefined : Number(interval);
  return <CarouselGallery items={items} label={label} interval={every !== undefined && Number.isFinite(every) ? every : undefined} />;
}
