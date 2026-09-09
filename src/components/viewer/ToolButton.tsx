'use client';

import type { ReactNode } from 'react';

import { Icon } from '@/components/viewer/icons';
import type { IconName } from '@/components/viewer/icons';

import './ToolButton.css';

/**
 * The shell's button. Every control in the toolbar, the segmented control
 * and the panel head is one of these: a .pt-ib with type="button" and a
 * title that names its key. With a label it is a text button whose label
 * collapses at 1180px; without one it is the 32px icon square (.pt-icon),
 * which also carries a text glyph such as the ? on the help button.
 */
export type ToolButtonProps = {
  /** tooltip; names the key in parentheses, as in 'Dark or light (D)' */
  title: string;
  onClick: () => void;
  /** the 16px solid glyph from icons.tsx */
  icon?: IconName;
  /** text label in .pt-lb; absent makes the button an icon square */
  label?: string;
  /** aria-pressed plus .is-on; leave undefined for buttons that do not toggle */
  pressed?: boolean;
  /** .is-solid, the one filled call to action */
  solid?: boolean;
  /** .hide-sm: hidden at or below 900px */
  hideSm?: boolean;
  /** accessible name; icon squares default to the title without its key */
  ariaLabel?: string;
  className?: string;
  /** replaces the icon: the ? glyph on the help button */
  children?: ReactNode;
};

/** 'Dark or light (D)' -> 'Dark or light' */
function nameFromTitle(title: string): string {
  return title.replace(/\s*\([^)]*\)\s*$/, '');
}

export function ToolButton({
  title,
  onClick,
  icon,
  label,
  pressed,
  solid = false,
  hideSm = false,
  ariaLabel,
  className,
  children,
}: ToolButtonProps) {
  const iconOnly = label === undefined;
  const classes = [
    'pt-ib',
    iconOnly ? 'pt-icon' : '',
    pressed ? 'is-on' : '',
    solid ? 'is-solid' : '',
    hideSm ? 'hide-sm' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  /* a labeled button is named by its label, with the title as the fallback
     once the label collapses; an icon square needs the name spelled out */
  const name = ariaLabel ?? (iconOnly ? nameFromTitle(title) : undefined);
  return (
    <button
      type='button'
      className={classes}
      title={title}
      aria-label={name}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {icon ? <Icon name={icon} /> : children}
      {label !== undefined ? <span className='pt-lb'>{label}</span> : null}
    </button>
  );
}
