import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

/**
 * The page's locale chip: a hairline box holding the SSOT flag print and the
 * BCP-47 code. The flag never appears without its code; the box is this
 * direction's own grammar, the print and the code come from LocaleTag.
 */
type ChipProps = { code: string; tell?: boolean; className?: string };

export default function Chip({ code, tell = false, className }: ChipProps) {
  const cls = ['pg-chip', tell ? 'is-tell' : '', className ?? ''].filter(Boolean).join(' ');
  return (
    <span className={cls}>
      <LocaleTag code={code} />
    </span>
  );
}
