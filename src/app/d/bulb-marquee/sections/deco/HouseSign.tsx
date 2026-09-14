import Image from 'next/image';

/**
 * C1.4, the hero crown. The house sign: the GT mark and the name, set in the
 * display face, on a warm black fascia between two bulb rows. The rows are
 * drawn by `.bm-sign::before` and `::after` in styles.css; the top row chases
 * where motion is allowed and at rest every bulb is lit. The mark is the
 * drawing made for dark ground, so nothing is filtered.
 */
export default function HouseSign() {
  return (
    <div className='bm-sign' data-hero-in>
      <span className='bm-sign-in'>
        <Image
          className='bm-sign-mark'
          src='/brand/no-bg-gt-logo-dark.png'
          alt=''
          width={24}
          height={24}
        />
        <span className='bm-sign-name'>General Translation</span>
      </span>
    </div>
  );
}
