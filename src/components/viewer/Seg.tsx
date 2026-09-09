'use client';

import type { IconName } from '@/components/viewer/icons';
import { ToolButton } from '@/components/viewer/ToolButton';

import './Seg.css';

/**
 * The segmented control: a ruled group of ToolButtons with one active
 * option. Generic over its value type so it serves the view modes on every
 * shell route, Left | Right on /compare, the sidebar's density toggle, and
 * any chip row that migrates. Clicking the active option that is not the
 * first returns to the first, as the deck viewer does (parts/tail.html, the
 * data-mode click handler). A click lets go of focus afterwards: the
 * reader's attention moves to the stage, and a focus ring left on the
 * clicked option would read as a second selection.
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

function letGo(): void {
  const focused = document.activeElement;
  if (focused instanceof HTMLElement && focused.closest('.pt-seg')) focused.blur();
}

export function Seg<T extends string>({ options, value, onChange, label, iconOnly = false, className }: SegProps<T>) {
  const first = options[0]?.value;
  const pick = (next: T) => {
    if (next === value && first !== undefined && next !== first) onChange(first);
    else onChange(next);
    letGo();
  };
  return (
    <div className={className ? `pt-seg ${className}` : 'pt-seg'} role='group' aria-label={label}>
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
