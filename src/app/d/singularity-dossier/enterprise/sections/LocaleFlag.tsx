import 'flag-icons/css/flag-icons.min.css';

import { LOCALE_FLAGS } from '../../../toolchain/components/LocaleTag';

/** Flag-only chip: resolves a locale (or locale-REGION pair) to its
 *  flag-icons span - the region subtag wins when present. */
export default function LocaleFlag({
  locale,
  className,
}: {
  locale: string;
  className?: string;
}) {
  const parts = locale.split('-');
  const last = parts[parts.length - 1] ?? '';
  const region = parts.length > 1 ? last.toLowerCase() : '';
  const code = region || LOCALE_FLAGS[parts[0] ?? ''] || parts[0];
  return (
    <span
      className={`fi fi-${code}${className ? ` ${className}` : ''}`}
      aria-hidden='true'
    />
  );
}
