import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

/**
 * The stele's locale chip: an incised box around the shared flag print and
 * its BCP-47 code. The flag and code come from the SSOT LocaleTag; only the
 * box is this page's. `tell` gives the ring the gold edge, the accent's one
 * job on a chip (the zh-Hans / zh-Hant pair).
 */
export function Chip({ code, tell = false }: { code: string; tell?: boolean }) {
  return (
    <span className={tell ? 'tr-chip is-tell' : 'tr-chip'}>
      <LocaleTag code={code} />
    </span>
  );
}
