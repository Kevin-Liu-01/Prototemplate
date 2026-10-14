'use client';

import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import { Check, ChevronDown, Languages } from 'lucide-react';

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

  useMountEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
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

  const active = LOCALES.find((locale) => locale.code === ACTIVE) ?? LOCALES[1];

  return (
    <div className='pc-lang' ref={rootRef}>
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
          style={{ '--pc-shift': `${shift}px` } as CSSProperties}
        >
          <div className='pc-lang-list' role='radiogroup'>
            {LOCALES.map((locale) => (
              <button
                aria-checked={locale.code === ACTIVE}
                className='pc-lang-item'
                key={locale.code}
                lang={locale.code}
                role='radio'
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
