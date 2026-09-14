import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

/**
 * The page's locale chip: a header brick. A hairline box, radius 4, the
 * shared SVG flag print and the BCP-47 code in mono. `tell` rings the chip
 * in the accent, the accent's one job. `glazed` hosts sit on lapis and
 * switch to cream hairlines through the sheet.
 */
export type ChipProps = { code: string; tell?: boolean };

export default function Chip({ code, tell }: ChipProps) {
  return (
    <span className={tell ? 'gb-chip is-tell' : 'gb-chip'}>
      <LocaleTag code={code} />
    </span>
  );
}

/** A code chip without a flag: variant tags and package names. */
export type CodeChipProps = { children: string; tell?: boolean };

export function CodeChip({ children, tell }: CodeChipProps) {
  return <code className={tell ? 'gb-chip is-tell' : 'gb-chip'}>{children}</code>;
}
