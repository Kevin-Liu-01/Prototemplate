/**
 * Deco home: section heads (C1.1).
 *
 * The cartouche is the frame that holds a name: a loop closed by a tie bar
 * at one end. Each register's numeral sits in one. The loop is a single
 * bordered box with rounded ends; the tie is a separate 1px bar set clear
 * of the loop, so the two strokes never read as a doubled line.
 */
export function Cartouche({ numeral }: { numeral: string }) {
  return (
    <span className='tr-cart'>
      <span className='tr-cart-loop'>{numeral}</span>
      <span className='tr-cart-tie' aria-hidden='true' />
    </span>
  );
}
