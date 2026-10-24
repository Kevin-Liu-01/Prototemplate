import type { KeyboardEvent } from 'react';

/* Keyboard for a group of role="radio" buttons, as native radios behave: one
   Tab stop, the checked radio (radioTab), and the arrow keys move to the
   next or previous radio and pick it (onRadioKeys, on the group). */

/** The checked radio takes the group's one Tab stop. */
export function radioTab(checked: boolean): 0 | -1 {
  return checked ? 0 : -1;
}

/** Moves focus and the choice to the next radio with Right or Down, and the previous one with Left or Up, wrapping round. */
export function onRadioKeys(e: KeyboardEvent<HTMLElement>) {
  if (e.altKey || e.metaKey || e.ctrlKey) return;
  const step =
    e.key === 'ArrowRight' || e.key === 'ArrowDown'
      ? 1
      : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
        ? -1
        : 0;
  if (!step) return;
  const radios = [
    ...e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'),
  ];
  const at = radios.findIndex((r) => r === document.activeElement);
  const next = radios[(at + step + radios.length) % radios.length];
  if (!next) return;
  e.preventDefault();
  next.focus();
  next.click();
}
