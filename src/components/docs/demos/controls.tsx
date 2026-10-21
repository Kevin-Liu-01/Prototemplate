'use client';

import { useId, useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

/**
 * The controls under a live plate. One small set for every page, so a
 * reader learns them once: a choice (a radio group drawn as a segmented
 * row), a range with its value printed beside it, a toggle and a button.
 * Labels are Title Case on buttons and sentence case on groups; corners
 * and type come from the tokens in demos.css.
 */

export type ChoiceOption<T extends string> = { value: T; label: string; lang?: string };

type ChoiceProps<T extends string> = {
  /** the group's visible and accessible name */
  label: string;
  options: readonly ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * A radio group as a segmented row. Arrow keys move the choice and wrap at
 * the ends, Home and End jump to the first and last option, and only the
 * checked option sits in the tab order (the ARIA radio group pattern); with
 * none checked, the first option takes the tab stop.
 */
export function Choice<T extends string>({ label, options, value, onChange }: ChoiceProps<T>) {
  const id = useId();
  const row = useRef<HTMLDivElement>(null);

  const move = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = options.length - 1;
    const next =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? index === last
          ? 0
          : index + 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? index === 0
            ? last
            : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : -1;
    const option = options[next];
    if (next < 0 || !option) return;
    event.preventDefault();
    onChange(option.value);
    row.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
  };

  const anyOn = options.some((option) => option.value === value);

  return (
    <div className='dmo-field'>
      <span className='dmo-field-label' id={id}>
        {label}
      </span>
      <div className='dmo-choice' role='radiogroup' aria-labelledby={id} ref={row}>
        {options.map((option, index) => {
          const on = option.value === value;
          return (
            <button
              aria-checked={on}
              className={on ? 'dmo-opt is-on' : 'dmo-opt'}
              key={option.value}
              lang={option.lang}
              role='radio'
              tabIndex={on || (!anyOn && index === 0) ? 0 : -1}
              type='button'
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => move(event, index)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type RangeProps = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  /** how the value prints beside the track; the plain number by default */
  format?: (value: number) => string;
};

/** A native range input with its label and its printed value. */
export function Range({ label, min, max, step, value, onChange, format }: RangeProps) {
  const id = useId();
  const text = format ? format(value) : String(value);
  return (
    <div className='dmo-field'>
      <label className='dmo-field-label' htmlFor={id}>
        {label}
      </label>
      <div className='dmo-range'>
        <input
          aria-valuetext={text}
          id={id}
          max={max}
          min={min}
          step={step}
          type='range'
          value={value}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
        />
        <output className='dmo-range-value' htmlFor={id}>
          {text}
        </output>
      </div>
    </div>
  );
}

type ToggleProps = {
  label: string;
  pressed: boolean;
  onChange: (pressed: boolean) => void;
  disabled?: boolean;
  title?: string;
};

/** A button that holds a state, announced through aria-pressed. */
export function Toggle({ label, pressed, onChange, disabled, title }: ToggleProps) {
  return (
    <button
      aria-pressed={pressed}
      className={pressed ? 'dmo-btn is-on' : 'dmo-btn'}
      disabled={disabled}
      title={title}
      type='button'
      onClick={() => onChange(!pressed)}
    >
      {label}
    </button>
  );
}

type ActionProps = {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
};

/** A plain button for a one-shot action: Replay, Burst, Next. */
export function Action({ children, onClick, disabled, title }: ActionProps) {
  return (
    <button className='dmo-btn' disabled={disabled} title={title} type='button' onClick={onClick}>
      {children}
    </button>
  );
}
