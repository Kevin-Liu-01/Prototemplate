import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

/**
 * textile-block: the locale chip as an inset tile.
 *
 * Every locale named on the page is one tile: a square-cornered inset with a
 * hairline ring, the SVG flag print and the BCP-47 code in the wall's mono.
 * The flag and code come from the shared LocaleTag (the SSOT for flag chips);
 * the tile box is this direction's own. `header` sets the tile as a header
 * brick: flush in the block's top-left corner, owning only its right and
 * bottom joint, the way a header brick shows its end in a running bond.
 * `tell` rings the tile in the accent for the one pair the atlas wants
 * noticed.
 */
export type TileProps = {
  code: string;
  tell?: boolean;
  header?: boolean;
};

export default function Tile({ code, tell, header }: TileProps) {
  const classes = ['tb-tile'];
  if (tell) classes.push('is-tell');
  if (header) classes.push('tb-brick');
  return (
    <span className={classes.join(' ')}>
      <LocaleTag code={code} />
    </span>
  );
}
