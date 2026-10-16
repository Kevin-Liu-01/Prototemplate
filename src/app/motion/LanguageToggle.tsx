'use client';

import type { KeyboardEvent } from 'react';
import { useRef } from 'react';

import LocaleFlag from '@/components/shared/LocaleFlag';
import { cn } from '@/lib/cn';
import type { MotionLanguage } from '@/lib/motion';

import '@/components/viewer/Seg.css';

export type LanguageOption = { value: string; language: MotionLanguage };

type LanguageToggleProps = {
  options: readonly LanguageOption[];
  value: string;
  onChange: (value: string) => void;
  /** the group's accessible name: `Language of the Supporting Slash companies film` */
  label: string;
};

/** The keys that move the choice, as the ARIA radio group pattern has them: the arrows wrap, Home and End jump. */
const STEP: Readonly<Record<string, number>> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/**
 * The language toggle of a film with language versions: a radio group in
 * the segmented control's look (the .pt-seg box and .pt-ib options from
 * tokens.css, the focus ring from Seg.css), one option per cut, each the
 * locale's flag (LocaleFlag, flag-icons) and the language's own name in its
 * own lang, with the English name as its title. The choice fills the
 * option with the ink pill at once; nothing slides. One tab stop: Tab
 * reaches the chosen option, the arrows move the choice and its focus, and
 * Home and End take the first and the last, so the group reads as a set of
 * radios to a screen reader. A pointer press lets go of focus, as Seg does.
 */
export default function LanguageToggle({ options, value, onChange, label }: LanguageToggleProps) {
  const root = useRef<HTMLDivElement>(null);
  const at = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  const move = (index: number) => {
    const next = options[(index + options.length) % options.length];
    if (!next) return;
    onChange(next.value);
    root.current?.querySelector<HTMLElement>(`[data-value="${next.value}"]`)?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = STEP[e.key];
    if (step !== undefined) move(at + step);
    else if (e.key === 'Home') move(0);
    else if (e.key === 'End') move(options.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div ref={root} className='pt-seg mo-lang' role='radiogroup' aria-label={label} onKeyDown={onKeyDown}>
      {options.map((option, i) => {
        const on = i === at;
        const { locale, name, language } = option.language;
        return (
          <button
            key={option.value}
            type='button'
            role='radio'
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            className={cn('pt-ib', on && 'is-on')}
            data-value={option.value}
            title={language}
            onClick={(e) => {
              onChange(option.value);
              /* a pointer press lets go of focus; Space or Enter on the focused option keeps it */
              if (e.detail > 0) e.currentTarget.blur();
            }}
          >
            <LocaleFlag locale={locale} className='mo-lang-flag' />
            <span className='pt-lb' lang={locale}>
              {name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
