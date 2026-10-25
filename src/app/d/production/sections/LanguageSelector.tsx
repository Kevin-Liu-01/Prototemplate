'use client';

import { useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

import { Check, ChevronDown, Languages } from 'lucide-react';

import { useLayoutWork } from '@/lib/use-layout-work';
import { useMountEffect } from '@/lib/use-mount-effect';

import 'flag-icons/css/flag-icons.min.css';
import './prod-chrome.css';

/**
 * The live footer's and phone sheet's language selector (gt-cloud
 * packages/ui src/components/frame/LanguageSelector.tsx): the Languages
 * glyph, the current language's name and a chevron, opening a popover of
 * the site's eight locales above the trigger. The mirror is English only,
 * so it is a stub: the list, its order, its flags and its look are live's,
 * and choosing a language closes the popover without navigating or
 * calling any service. English (US) stays the active row.
 *
 * Live sorts the locales with customLocaleNativeSort and draws each flag
 * with LocaleFlag (flag-icons); the order and the flag codes below are the
 * ones the live popover rendered on 2026-10-14.
 *
 * The list is a radio group with one Tab stop: opening the popover focuses
 * the checked radio, the arrow keys, Home and End move between radios, and
 * Escape closes the popover and returns focus to the trigger. That Escape
 * is marked handled (defaultPrevented), so the nav sheet around the
 * selector stays open until a second press.
 */
const LOCALES = [
  { code: 'en-GB', name: 'English (GB)', flag: 'gb' },
  { code: 'en-US', name: 'English (US)', flag: 'us' },
  { code: 'es', name: 'Español', flag: 'es' },
  { code: 'fr', name: 'Français', flag: 'fr' },
  { code: 'it', name: 'Italiano', flag: 'it' },
  { code: 'ru', name: 'Русский', flag: 'ru' },
  { code: 'zh', name: '中文', flag: 'cn' },
  { code: 'ja', name: '日本語', flag: 'jp' },
] as const;

const ACTIVE = 'en-US';

/** Radix's collisionPadding on the live popover. */
const MARGIN = 16;

/** The popover's min-width. */
const POP_WIDTH = 200;

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useMountEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node && rootRef.current?.contains(target))) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      setOpen((current) => {
        if (current) buttonRef.current?.focus();
        return false;
      });
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  });

  const toggle = () => {
    if (!open) {
      /* the popover's right edge sits on the trigger's; where that would
         put its left edge inside the 16px margin, it moves right */
      const right = buttonRef.current?.getBoundingClientRect().right ?? 0;
      setShift(Math.max(0, MARGIN - (right - POP_WIDTH)));
    }
    setOpen(!open);
  };

  /* opening focuses the checked radio, the group's one Tab stop */
  useLayoutWork(
    () => {
      if (open) listRef.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    },
    { dependencies: [open] }
  );

  /* an Escape from inside closes the popover and is marked handled, so the
     document listeners (this one's and the nav sheet's) let it pass */
  const onRootKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || !open) return;
    event.preventDefault();
    setOpen(false);
    buttonRef.current?.focus();
  };

  /* arrows, Home and End move focus between the radios */
  const onListKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const radios = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'));
    const at = radios.findIndex((radio) => radio === document.activeElement);
    const last = radios.length - 1;
    let next = -1;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = at >= last ? 0 : at + 1;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = at <= 0 ? last : at - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    if (next < 0) return;
    event.preventDefault();
    radios[next]?.focus();
  };

  const active = LOCALES.find((locale) => locale.code === ACTIVE) ?? LOCALES[1];

  return (
    <div className='pc-lang' ref={rootRef} onKeyDown={onRootKeyDown}>
      <button
        aria-expanded={open}
        aria-haspopup='dialog'
        className='pc-lang-btn'
        ref={buttonRef}
        type='button'
        onClick={toggle}
      >
        <Languages aria-hidden className='pc-lang-icon' strokeWidth={2} />
        <span>{active.name}</span>
        <ChevronDown aria-hidden className='pc-lang-chev' strokeWidth={2} />
      </button>
      {open ? (
        <div
          aria-label='Language'
          className='pc-lang-pop'
          role='dialog'
          style={{ '--pc-shift': `${shift}px` }}
        >
          <div className='pc-lang-list' ref={listRef} role='radiogroup' onKeyDown={onListKeyDown}>
            {LOCALES.map((locale) => (
              <button
                aria-checked={locale.code === ACTIVE}
                className='pc-lang-item'
                key={locale.code}
                lang={locale.code}
                role='radio'
                tabIndex={locale.code === ACTIVE ? 0 : -1}
                type='button'
                onClick={() => setOpen(false)}
              >
                <span aria-hidden className={`fi pc-lang-flag fi-${locale.flag}`} />
                <span>{locale.name}</span>
                {locale.code === ACTIVE ? <Check aria-hidden className='pc-lang-check' strokeWidth={2} /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
