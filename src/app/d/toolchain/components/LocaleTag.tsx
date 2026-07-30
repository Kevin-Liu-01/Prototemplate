import './icons.css';

/**
 * The page's one locale-flag system (founder directive): every bare locale
 * code chip renders flag-first, then the code in the surface's own mono.
 * The flag is identification at text size — it never outgrows the code.
 */
export const LOCALE_FLAGS: Record<string, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
  ja: '🇯🇵',
  de: '🇩🇪',
  zh: '🇨🇳',
  ko: '🇰🇷',
  ar: '🇸🇦',
  ru: '🇷🇺',
  hi: '🇮🇳',
  pt: '🇧🇷',
  it: '🇮🇹',
  el: '🇬🇷',
  th: '🇹🇭',
  pl: '🇵🇱',
};

export function localeFlag(code: string): string | undefined {
  return LOCALE_FLAGS[code];
}

export type LocaleTagProps = {
  code: string;
  className?: string;
};

/**
 * Drop-in content for an existing chip element: the host keeps its own class
 * and box (tct-chip, tf-out-tag, tcb-chips span…); this only swaps the bare
 * code for flag + code. Unknown codes render codewise, flagless.
 */
export default function LocaleTag({ code, className }: LocaleTagProps) {
  const flag = LOCALE_FLAGS[code];
  return (
    <span className={className ? `lct ${className}` : 'lct'}>
      {flag ? (
        <span className='lct-flag' aria-hidden='true'>
          {flag}
        </span>
      ) : null}
      <span className='lct-code'>{code}</span>
    </span>
  );
}
