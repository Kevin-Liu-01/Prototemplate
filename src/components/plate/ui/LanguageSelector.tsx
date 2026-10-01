'use client';

import { useState } from 'react';
import { Check, ChevronDown, Languages } from 'lucide-react';
import { Popover } from 'radix-ui';

import { cn } from '@/components/plate/lib/utils';

type PlateLocale = {
  /** The BCP-47 code the dashboard's selector would set. */
  code: string;
  /** The native display name, as getLocaleDisplayName prints it there. */
  name: string;
};

/**
 * Eight of the dashboard's locales in the order its selector sorts them
 * (by native name, Latin scripts first). The dashboard sorts its whole
 * configured list through the locales library; the port carries this
 * fixed set.
 */
const LOCALES: readonly PlateLocale[] = [
  { code: 'de', name: 'Deutsch' },
  { code: 'en-US', name: 'English (US)' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'pt', name: 'Português' },
  { code: 'ko', name: '한국어' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
];

const DEFAULT_LOCALE = 'en-US';

function LocaleDropdownItem({
  locale,
  isActive,
  onSelect,
}: {
  locale: PlateLocale;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type='button'
      onMouseDown={(e) => e.preventDefault()}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors outline-none max-md:min-h-11',
        isActive
          ? 'bg-accent text-accent-foreground font-medium'
          : 'hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <span>{locale.name}</span>
      {isActive && <Check className='ml-auto size-3.5 shrink-0' />}
    </button>
  );
}

/**
 * A static look-alike of packages/ui's LanguageSelector for the plate
 * frame's foot: the same trigger (the translate glyph, the locale's name
 * and a chevron that turns while open) opening the same popover list,
 * with the rows 44px tall on phones. Choosing a row changes the trigger's
 * label and nothing else; the dashboard's selector sets the app's locale
 * through gt-next, which this site does not have. The rows carry no flag:
 * the dashboard draws them through its LocaleFlag component, and this
 * repository's lint keeps the flag sprite classes to that component,
 * which it does not have.
 */
export default function LanguageSelector({
  dropdownPosition = 'above',
  variant = 'full',
}: {
  dropdownPosition?: 'above' | 'below';
  /** `compact` shows the language code instead of the glyph and the full
      name; the dropdown is the same. */
  variant?: 'full' | 'compact';
} = {}) {
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const [open, setOpen] = useState(false);

  const compact = variant === 'compact';
  const name = LOCALES.find((l) => l.code === locale)?.name ?? 'Language';

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type='button'
          aria-label={compact ? name : undefined}
          className={cn(
            'text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center rounded-md text-sm transition-colors',
            compact ? 'gap-1.5 px-2.5' : 'gap-2 px-3',
            open && 'bg-accent text-accent-foreground'
          )}
        >
          {compact ? (
            <span className='font-medium uppercase'>{locale.split('-')[0]}</span>
          ) : (
            <>
              <Languages className='size-4' />
              <span>{name}</span>
            </>
          )}
          <ChevronDown
            className={cn(
              'size-3.5 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side={dropdownPosition === 'above' ? 'top' : 'bottom'}
          align='end'
          sideOffset={4}
          collisionPadding={16}
          // plate-root: the content renders in a portal outside the frame,
          // and plate.css scopes the colour tokens to that class.
          className='plate-root bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 max-h-(--radix-popover-content-available-height) min-w-[200px] origin-(--radix-popover-content-transform-origin) rounded-md border p-1 text-sm outline-hidden'
        >
          <div className='gt-scrollbar flex max-h-72 flex-col overflow-y-auto'>
            {LOCALES.map((loc) => (
              <LocaleDropdownItem
                key={loc.code}
                locale={loc}
                isActive={loc.code === locale}
                onSelect={() => {
                  setLocale(loc.code);
                  setOpen(false);
                }}
              />
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
