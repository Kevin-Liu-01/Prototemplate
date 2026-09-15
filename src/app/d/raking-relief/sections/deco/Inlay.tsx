import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

/**
 * The lapis inlay: every locale named on the wall is one chip, the SVG
 * flag print and the BCP-47 code set into a lapis block. The flag never
 * appears without its code. `tell` rings the chip instead of filling it,
 * for the two script variants the atlas singles out. Home: every register
 * that names a locale.
 */
export default function Inlay({ code, tell = false }: { code: string; tell?: boolean }) {
  return (
    <span className={tell ? 'rr-inlay is-tell' : 'rr-inlay'}>
      <LocaleTag code={code} />
    </span>
  );
}
