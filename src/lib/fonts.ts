import localFont from 'next/font/local';

/**
 * Inter is the one typeface: display, interface and text. This is the real
 * rsms.me Inter (v4.1 variable builds, roman and italic), self-hosted and
 * not the Google Fonts build: the rsms variable family carries the opsz axis
 * and the full feature set, and the presenter's "wrong Inter" beat depends
 * on the two resolving differently. The binding is named `ptInter` because
 * next/font names the family after the identifier, and a family named
 * `inter` matches an installed Inter (family names are case-insensitive).
 */
export const ptInter = localFont({
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

export const fontVariables = ptInter.variable;
