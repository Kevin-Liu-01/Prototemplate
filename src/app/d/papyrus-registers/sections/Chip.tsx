import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

/**
 * The page's locale chip: the shared LocaleTag (SVG flag print, then the
 * BCP-47 code) inside this scroll's own box, a hairline ring at radius 4
 * with the code in the instrument mono. `stone` is the chip on the dark
 * terminal and the stele, where the ring and the code take the stone ink.
 */
export type ChipProps = { code: string; tone?: 'paper' | 'stone' };

export default function Chip({ code, tone = 'paper' }: ChipProps) {
  return <LocaleTag code={code} className={tone === 'stone' ? 'pr-chip is-stone' : 'pr-chip'} />;
}
