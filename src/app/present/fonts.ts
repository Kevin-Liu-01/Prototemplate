import { Instrument_Sans, Sora } from 'next/font/google';

/** Presenter-only face for the intro lockup's "The"; scoped via page.tsx. */
export const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sora',
  display: 'swap',
});

/** Presenter-only italic sans for the intro lockup's "website". */
export const instrument = Instrument_Sans({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500'],
  variable: '--font-instrument',
  display: 'swap',
});
