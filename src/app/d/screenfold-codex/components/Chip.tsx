import LocaleTag from '@/app/d/toolchain/components/LocaleTag';
import { cn } from '@/lib/cn';

/**
 * The codex's locale chip: a hairline cartouche around the shared flag
 * print and the BCP-47 code. The flag never appears without its code; a
 * chip that names a variant with no flag of its own (`zh-Hant`) prints as
 * code alone. `tell` rings the chip in the accent, the one mark the panel
 * asks the reader to find first.
 */
export type ChipProps = {
  code: string;
  /** code only, no flag print: the variants ledger's chips */
  plain?: boolean;
  tell?: boolean;
  className?: string;
};

export default function Chip({ code, plain = false, tell = false, className }: ChipProps) {
  if (plain) {
    return <code className={cn('sfc-chip is-plain', tell && 'is-tell', className)}>{code}</code>;
  }
  return (
    <span className={cn('sfc-chip', tell && 'is-tell', className)}>
      <LocaleTag code={code} />
    </span>
  );
}
