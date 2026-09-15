import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

/**
 * talud-tablero deco: the locale chip's host box. Home: the talud loads
 * (jade insets on the slope under the T component), the translation panels,
 * the CLI, the trace and the atlas. The flag and the code come from the
 * shared LocaleTag; this box is the stone inset around them: a hairline
 * ring on the panel, a jade ring where the chip is seated on a talud.
 */

export type ChipProps = {
  code: string;
  /** The jade inset, for chips seated on a talud. */
  jade?: boolean;
  className?: string;
};

export function Chip({ code, jade = false, className }: ChipProps) {
  const classes = ['tt-chip'];
  if (jade) classes.push('is-jade');
  if (className) classes.push(className);
  return (
    <span className={classes.join(' ')}>
      <LocaleTag code={code} />
    </span>
  );
}

export default Chip;
