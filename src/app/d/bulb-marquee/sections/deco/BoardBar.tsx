import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

/**
 * C1.4, the plate's edge. The letter board's bar: the live mark (the page's
 * one accent, a vermilion dot), the label, and the source locale as the
 * page's one flag chip. The bulb rows around the board are drawn by
 * `.df-plate::before` and `::after` in styles.css; this is the chrome above
 * them, at the window bar's mono gauge.
 */
export default function BoardBar() {
  return (
    <div className='bm-board-bar'>
      <span className='bm-board-live'>
        <i aria-hidden='true' />
        now playing
      </span>
      <span>
        source · <LocaleTag code='en' />
      </span>
    </div>
  );
}
