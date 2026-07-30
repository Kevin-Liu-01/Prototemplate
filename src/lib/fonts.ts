import { Inter } from 'next/font/google';
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

/** Text companion — Inter, by Rasmus Andersson. */
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const fontVariables = `${switzer.variable} ${inter.variable}`;
