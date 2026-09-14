import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

/**
 * The page's locale chip: a square limestone tile (radius 0, one hairline)
 * around the shared flag print and code. The flag never appears without its
 * code; `LocaleTag` is imported from its single source and never copied.
 * `active` spends the page accent as the chip's ring, the one job the
 * accent has on a chip.
 */
export type ChipProps = {
  code: string;
  active?: boolean;
  className?: string;
};

export default function Chip({ code, active = false, className }: ChipProps) {
  return (
    <span className={['sf-chip', active ? 'is-active' : '', className].filter(Boolean).join(' ')}>
      <LocaleTag code={code} />
    </span>
  );
}
