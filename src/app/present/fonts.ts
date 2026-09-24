import localFont from 'next/font/local';

/** Presenter-only face for the intro lockup's "The"; scoped via page.tsx. */
export const sora = localFont({
  src: [
    { path: '../../../public/fonts/google/sora-300.woff2', weight: '300', style: 'normal' },
    { path: '../../../public/fonts/google/sora-400.woff2', weight: '400', style: 'normal' },
    { path: '../../../public/fonts/google/sora-500.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-sora',
  display: 'swap',
});

/** Presenter-only italic sans for the intro lockup's "website". */
export const instrument = localFont({
  src: [
    { path: '../../../public/fonts/google/instrument-sans-400.woff2', weight: '400', style: 'normal' },
    { path: '../../../public/fonts/google/instrument-sans-500.woff2', weight: '500', style: 'normal' },
    { path: '../../../public/fonts/google/instrument-sans-400-italic.woff2', weight: '400', style: 'italic' },
    { path: '../../../public/fonts/google/instrument-sans-500-italic.woff2', weight: '500', style: 'italic' },
  ],
  variable: '--font-instrument',
  display: 'swap',
});
