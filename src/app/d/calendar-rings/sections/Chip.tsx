/**
 * calendar-rings: the locale chip.
 * The page's one way to name a locale: the shared flag print and code
 * (LocaleTag, the SSOT) inside this direction's own hairline box. `source`
 * gives the box the accent ring, the one job the accent has on this page.
 */
import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

export type ChipProps = {
  code: string;
  source?: boolean;
  className?: string;
};

export function Chip({ code, source = false, className }: ChipProps) {
  const classes = ['cr-chip', source ? 'is-source' : '', className ?? ''].filter(Boolean).join(' ');
  return (
    <span className={classes}>
      <LocaleTag code={code} />
    </span>
  );
}
