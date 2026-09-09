'use client';

import type { IconName } from '@/components/viewer/icons';
import { ToolButton } from '@/components/viewer/ToolButton';

import './Seg.css';

/**
 * The segmented control: a ruled group of ToolButtons with one active
 * option. Generic over its value type so it serves the view modes on every
 * shell route, Left | Right on /compare, and any chip row that migrates.
 * Clicking the active option that is not the first returns to the first,
 * as the deck viewer does (parts/tail.html, the data-mode click handler).
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
  className?: string;
};

export function Seg<T extends string>({ options, value, onChange, label, className }: SegProps<T>) {
  const first = options[0]?.value;
  const pick = (next: T) => {
    if (next === value && first !== undefined && next !== first) {
      onChange(first);
      return;
    }
    onChange(next);
  };
  return (
    <div className={className ? `pt-seg ${className}` : 'pt-seg'} role='group' aria-label={label}>
      {options.map((option) => (
        <ToolButton
          key={option.value}
          icon={option.icon}
          label={option.label}
          title={option.title}
          pressed={option.value === value}
          onClick={() => pick(option.value)}
        />
      ))}
    </div>
  );
}
