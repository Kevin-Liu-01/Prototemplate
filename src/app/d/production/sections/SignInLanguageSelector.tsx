'use client';

import 'flag-icons/css/flag-icons.min.css';

import { useRef, useState } from 'react';

import { Check, ChevronDown, Languages } from 'lucide-react';

import { SIGNIN_LOCALE, SIGNIN_LOCALES } from './signin-locales';
import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The footer's language selector.
 *
 * Reproduces packages/ui/src/components/frame/LanguageSelector.tsx at
 * dropdownPosition='above': the Languages glyph, the current locale's native
 * name, a chevron that flips when open, and a scrolling list of flag + native
 * name rows with a check on the active one. The rows are the dashboard's own
 * configured locales, frozen in signin-locales.ts.
 *
 * The real trigger is a Radix popover; here it is a plain button with the
 * panel positioned in the sheet, since Radix is not a dependency of this
 * repo. Choosing a row does not switch the page's language — nothing in this
 * control is translated, so the selector reports the pick and closes.
 */
export default function SignInLanguageSelector() {
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState(SIGNIN_LOCALE);
  const root = useRef<HTMLDivElement>(null);

  /* Outside click and Escape close it, the way the popover does. */
  useMountEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  });

  const current = SIGNIN_LOCALES.find((row) => row.code === locale);

  return (
    <div className='psi-lang' ref={root}>
      {open ? (
        <div className='psi-lang-menu' role='listbox'>
          {SIGNIN_LOCALES.map((row) => {
            const active = row.code === locale;
            return (
              <button
                type='button'
                aria-selected={active}
                className={active ? 'psi-lang-row is-active' : 'psi-lang-row'}
                key={row.code}
                onClick={() => {
                  setLocale(row.code);
                  setOpen(false);
                }}
                onMouseDown={(e) => e.preventDefault()}
                role='option'
              >
                {row.flag ? (
                  <span aria-hidden className={`fi fi-${row.flag}`} />
                ) : null}
                <span>{row.name}</span>
                {active ? (
                  <Check
                    aria-hidden
                    className='psi-lang-check'
                    color='currentColor'
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
      <button
        type='button'
        aria-expanded={open}
        className='psi-lang-trigger'
        onClick={() => setOpen((was) => !was)}
      >
        <Languages aria-hidden color='currentColor' />
        <span>{current ? current.name : 'Language'}</span>
        <ChevronDown aria-hidden className='psi-lang-chev' color='currentColor' />
      </button>
    </div>
  );
}
