import localFont from 'next/font/local';

/**
 * Inter is the one typeface: display, interface and text. This is the real
 * rsms.me Inter (v4.1 variable builds, roman and italic), self-hosted and
 * not the Google Fonts build: the rsms variable family carries the opsz axis
 * and the full feature set, and the presenter's "wrong Inter" beat depends
 * on the two resolving differently. The binding is named `ptInter` because
 * next/font names the family after the identifier, and a family named
 * `inter` matches an installed Inter (family names are case-insensitive).
 *
 * Only the roman is bound here, so only the roman is preloaded on every
 * route. The italic (379K) renders on two pages, so src/app/globals.css
 * declares it as a plain @font-face in the same ptInter family, and a
 * browser fetches it only when italic text is on the page.
 */
export const ptInter = localFont({
  src: [
    {
      path: '../../public/fonts/InterVariable.woff2',
      weight: '100 900',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
});

export const fontVariables = ptInter.variable;
