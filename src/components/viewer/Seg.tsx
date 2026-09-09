'use client';

import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';

import type { IconName } from '@/components/viewer/icons';
import { ToolButton } from '@/components/viewer/ToolButton';
import { useMountEffect } from '@/lib/use-mount-effect';

import './Seg.css';

/**
 * The segmented control: a ruled group of ToolButtons with one active
 * option. Generic over its value type so it serves the view modes on every
 * shell route, Left | Right on /compare, the sidebar's density toggle, the
 * index panel's Site | Public switch, and any chip row that migrates.
 * Clicking the active option that is not the first returns to the first, as
 * the deck viewer does (parts/tail.html, the data-mode click handler). A
 * click lets go of focus afterwards: the reader's attention moves to the
 * stage, and a focus ring left on the clicked option would read as a second
 * selection.
 *
 * The active fill is one indicator shared by every option (directive 7.4):
 * an absolutely positioned span under the buttons, moved with a transform
 * (translateX for its place, scaleX for its width, so nothing lays out
 * while it slides) over the slide duration. Its geometry is measured from
 * the active option in a layout effect, so the first paint already shows it
 * in place, and re-measured whenever the group's box changes (the toolbar's
 * label collapse, a font load). Until the first measurement the active
 * option fills itself (tokens.css, the :not(.has-ind) rule).
 */
export type SegOption<T extends string> = {
  value: T;
  label: string;
  icon?: IconName;
  /** tooltip naming the key, as in 'Every slide as a grid (G)' */
  title: string;
};

export type SegProps<T extends string> = {
  options: readonly SegOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** the group's accessible name, as in 'View' */
  label: string;
  /** icon squares with the label as the accessible name; the sidebar's density toggle */
  iconOnly?: boolean;
  className?: string;
};

/** Where the indicator sits: its left edge and its width, in CSS pixels inside the group's border. */
type Indicator = { x: number; w: number };

function letGo(): void {
  const focused = document.activeElement;
  if (focused instanceof HTMLElement && focused.closest('.pt-seg')) focused.blur();
}

/** The active option's box inside the group, or null while no option is on. */
function measure(group: HTMLElement): Indicator | null {
  const on = group.querySelector<HTMLElement>('.pt-ib.is-on');
  if (!on) return null;
  return { x: on.offsetLeft, w: on.offsetWidth };
}

export function Seg<T extends string>({ options, value, onChange, label, iconOnly = false, className }: SegProps<T>) {
  const root = useRef<HTMLDivElement>(null);
  const [ind, setInd] = useState<Indicator | null>(null);

  const first = options[0]?.value;
  const pick = (next: T) => {
    if (next === value && first !== undefined && next !== first) onChange(first);
    else onChange(next);
    letGo();
  };

  const place = () => {
    const group = root.current;
    if (!group) return;
    const next = measure(group);
    setInd((prev) => (prev && next && prev.x === next.x && prev.w === next.w ? prev : next));
  };

  /* before paint, on every change of the active option or the option set */
  useGSAP(place, { dependencies: [value, options, iconOnly] });

  /* and whenever the group's box changes: the toolbar collapsing its labels
     moves every option, and a late font load can change their widths */
  useMountEffect(() => {
    const group = root.current;
    if (!group || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(place);
    observer.observe(group);
    return () => observer.disconnect();
  });

  const classes = ['pt-seg', ind ? 'has-ind' : '', className ?? ''].filter(Boolean).join(' ');

  return (
    <div ref={root} className={classes} role='group' aria-label={label}>
      {ind ? (
        <span
          className='pt-seg-ind'
          aria-hidden='true'
          style={{ transform: `translateX(${ind.x}px) scaleX(${ind.w})` }}
        />
      ) : null}
      {options.map((option) => (
        <ToolButton
          key={option.value}
          icon={option.icon}
          label={iconOnly ? undefined : option.label}
          ariaLabel={iconOnly ? option.label : undefined}
          title={option.title}
          pressed={option.value === value}
          onClick={() => pick(option.value)}
        />
      ))}
    </div>
  );
}
