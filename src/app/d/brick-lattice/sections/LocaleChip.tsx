import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

/**
 * brick-lattice · the locale chip box.
 *
 * Home: every place a locale is named: the wall's header courses, the
 * medallion cores, the kiln's CLI session, the variants register. The chip
 * is the shared LocaleTag (flag print then code) seated in this page's own
 * box: a low rectangle with one hairline ring, radius 2, in the instrument
 * mono. `glazed` is the variant on a gold header course, where the ring is
 * ink at alpha so it reads on the glaze. Never a flag without its code.
 */
export type LocaleChipProps = {
  code: string;
  glazed?: boolean;
  tell?: boolean;
};

export default function LocaleChip({ code, glazed = false, tell = false }: LocaleChipProps) {
  const classes = ['bl-chip'];
  if (glazed) classes.push('is-glazed');
  if (tell) classes.push('is-tell');
  return (
    <span className={classes.join(' ')}>
      <LocaleTag code={code} />
    </span>
  );
}
