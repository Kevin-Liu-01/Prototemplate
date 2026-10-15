// The toolchain module also brings the flag-icons, chip and icon sheets.
import { localeFlag } from '@/app/d/toolchain/components/LocaleTag';

/**
 * The mirror's locale chip: the toolchain's LocaleTag markup with live's flag
 * for each bare code. Live draws the flag with the shared LocaleFlag, which
 * takes the region of the code's likely subtags (gt-cloud
 * packages/locales/src/utils/flag.ts on main), so a bare `ar` flies Egypt's
 * flag where the toolchain map flies Saudi Arabia's. Every other code the
 * pages show resolves to the same country in both. The toolchain map stays
 * as it is for the directions that mount it.
 */
const LIVE_FLAGS: Record<string, string> = {
  ar: 'eg',
};

export type LocaleTagProps = {
  code: string;
  className?: string;
};

export default function LocaleTag({ code, className }: LocaleTagProps) {
  const flag = LIVE_FLAGS[code] ?? localeFlag(code);
  return (
    <span className={className ? `lct ${className}` : 'lct'}>
      {flag ? <span className={`lct-flag fi fi-${flag}`} aria-hidden='true' /> : null}
      <span className='lct-code'>{code}</span>
    </span>
  );
}
