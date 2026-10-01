'use client';

import { useRef } from 'react';

import { useMountEffect } from '@/components/plate/hooks/use-mount-effect';

/**
 * The fade at the scroll area's end: a 56px band from transparent to the
 * page ground over the bottom of the frame's main (the overlay's previous
 * sibling), shown only while main can scroll further down, so a column
 * taller than the room dissolves into the foot row instead of ending in
 * a flat cut. From md up it is the plate's width (--plate-edge), so the
 * picture region and the mood plate in the lower right are never dimmed.
 * An absolutely positioned overlay with no pointer events: it moves no
 * layout box. Opacity only, so reduced motion needs nothing. The state is
 * read again on main's scroll, on a resize of main or of its column (the
 * survey reveals rows, the payment form grows) and on a window resize,
 * and written to data-visible, which the class list reads.
 */
export default function PlateScrollFade() {
  const ref = useRef<HTMLDivElement>(null);

  useMountEffect(() => {
    const overlay = ref.current;
    const area = overlay?.previousElementSibling;
    if (!overlay || !(area instanceof HTMLElement)) return;

    const update = () => {
      const below = area.scrollTop + area.clientHeight < area.scrollHeight - 1;
      overlay.dataset.visible = below ? 'true' : 'false';
    };
    update();
    area.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const resize =
      typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null;
    resize?.observe(area);
    const column = area.firstElementChild;
    if (column) resize?.observe(column);
    return () => {
      area.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      resize?.disconnect();
    };
  });

  return (
    <div
      ref={ref}
      className='to-background pointer-events-none absolute bottom-0 left-0 h-14 w-full bg-gradient-to-b from-transparent opacity-0 transition-opacity duration-150 data-[visible=true]:opacity-100 md:w-(--plate-edge)'
      data-visible='false'
      data-testid='plate-scroll-fade'
      aria-hidden='true'
    />
  );
}
