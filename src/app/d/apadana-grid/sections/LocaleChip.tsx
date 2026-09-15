/**
 * The page's locale chip: the SSOT flag-and-code content (LocaleTag, A3)
 * inside this direction's own box, a nameplate that seats beside a column
 * base. `source` marks the one source locale in a hall with the accent ring,
 * the accent's only job on the page. `tell` sets the two script variants of
 * Chinese in the weight the type reserves for the tell; no color.
 */
import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

export type LocaleChipProps = {
  code: string;
  source?: boolean;
  tell?: boolean;
  className?: string;
};

export function LocaleChip({ code, source, tell, className }: LocaleChipProps) {
  const classes = ['apg-chip'];
  if (source) classes.push('is-source');
  if (tell) classes.push('is-tell');
  if (className) classes.push(className);
  return (
    <span className={classes.join(' ')}>
      <LocaleTag code={code} />
    </span>
  );
}
