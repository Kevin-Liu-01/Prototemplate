'use client';

import { ListRow } from '@/components/viewer/ListRow';
import { usePtShell } from '@/components/viewer/shell-context';
import { DIRECTIONS } from '@/lib/directions';
import type { ShellItem } from '@/lib/shell-data';

import { jumpToDirection, useDirectionIndex, usePresenterPosition } from './presenterStore';
import { PROTOTYPES_INDEX, SLIDES, slideIndex } from './slides';

export type PresentSubsProps = {
  /** the slide's item in the list */
  item: ShellItem;
  /** scrolls the stage to a beat, as a fraction of that slide's pin */
  goTo: (slide: number, subFraction: number) => void;
};

/**
 * The rows under a slide in the sidebar. Story slides list their beats,
 * numbered `2.1`, `2.2` under slide 02; the prototypes slide lists every
 * direction, so any prototype is one click away now that the roll and the
 * grid overlay are gone. A row is marked while the scroll sits on its beat,
 * or while its direction is the one loaded, and only under the active slide,
 * so the list marks one location at a time. Nothing renders in grid mode:
 * the grid shows the captures alone.
 */
export default function PresentSubs({ item, goTo }: PresentSubsProps) {
  const { active, mode } = usePtShell();
  const position = usePresenterPosition();
  const direction = useDirectionIndex();
  if (mode === 'grid') return null;
  const index = slideIndex(item.id);
  const slide = SLIDES[index];
  if (!slide) return null;
  const onSlide = active === item.id;

  if (index === PROTOTYPES_INDEX) {
    return DIRECTIONS.map((d, i) => (
      <ListRow
        key={d.slug}
        item={{ id: `direction:${d.slug}`, n: d.label ?? '', title: d.name }}
        active={onSlide && direction === i}
        onSelect={() => jumpToDirection(d.slug)}
      />
    ));
  }

  if (!slide.subs) return null;
  return slide.subs.map((sub, j) => (
    <ListRow
      key={sub.label}
      item={{ id: `${slide.id}:${j + 1}`, n: `${index + 1}.${j + 1}`, title: sub.label }}
      active={onSlide && position.sub === j}
      onSelect={() => goTo(index, sub.f)}
    />
  ));
}
