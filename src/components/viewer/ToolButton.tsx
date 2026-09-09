'use client';

import type { ReactNode } from 'react';

import { Icon } from '@/components/viewer/icons';
import type { IconName } from '@/components/viewer/icons';

import './ToolButton.css';

/**
 * The shell's button. Every control in the toolbar, the segmented control
 * and the panel head is one of these: a .pt-ib with type="button" and a
 * title that names its key. With a label it is a text button whose label
 * Toolbar.css may collapse when the bar runs short; without one it is the
 * 32px icon square (.pt-icon), which also carries a text glyph such as the
 * theme button's half disc. A labeled button with no icon (the compare
 * rig's Both) is .is-text, and the collapse rules leave its label alone,
 * since an icon square with nothing in it would be a blank block.
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
  /**
   * aria-pressed without the ink frame: for a toggle whose state is already
   * visible elsewhere (the list toggle, while the list is the state), so the
   * frame stays reserved for transient toggles like Index and Help.
   */
  quiet?: boolean;
  /** .is-solid, the one filled call to action */
  solid?: boolean;
  /** .hide-sm: hidden at or below 900px */
  hideSm?: boolean;
  /** accessible name; icon squares default to the title without its key */
  ariaLabel?: string;
  className?: string;
  /** replaces the icon: the theme glyph */
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
  quiet = false,
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
    !iconOnly && !icon && !children ? 'is-text' : '',
    pressed && !quiet ? 'is-on' : '',
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
