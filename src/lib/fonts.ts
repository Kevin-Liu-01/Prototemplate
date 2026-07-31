import localFont from 'next/font/local';

/** Display and UI face for every direction. */
export const switzer = localFont({
  src: [
    { path: '../../public/fonts/switzer-300.woff2', weight: '300', style: 'normal' },
    { path: '../../public/fonts/switzer-400.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/switzer-500.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/switzer-600.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/switzer-700.woff2', weight: '700', style: 'normal' },
    { path: '../../public/fonts/switzer-800.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-switzer',
  display: 'swap',
});

/**
 * Text companion — the REAL Inter, self-hosted from rsms.me (v4.1 variable
 * builds, roman + italic). Not the Google Fonts build: the whole point of
 * the presenter's "wrong Inter" beat is that the two resolve differently —
 * the rsms variable family carries the opsz axis and the full feature set.
 */
export const inter = localFont({
  src: [
    {
      path: '../../public/fonts/InterVariable.woff2',
      weight: '100 900',
      style: 'normal',
    },
    {
      path: '../../public/fonts/InterVariable-Italic.woff2',
      weight: '100 900',
      style: 'italic',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
});

export const fontVariables = `${switzer.variable} ${inter.variable}`;
