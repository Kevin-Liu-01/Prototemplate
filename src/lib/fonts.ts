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
 * scripts/build/subset-inter.py splits both files into unicode-range subsets
 * under public/fonts/inter. Only the roman latin subset is bound here, so
 * it is the one file every route preloads. The other subsets and the
 * italic are plain @font-face rules in the same ptInter family in
 * src/app/inter-subsets.css, and a browser fetches one only when the page
 * draws a code point in its range.
 */
export const ptInter = localFont({
  src: [
    {
      path: '../../public/fonts/inter/InterVariable-latin.woff2',
      weight: '100 900',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
  // the latin subset's code points, written by scripts/build/subset-inter.py
  declarations: [{ prop: 'unicode-range', value: 'U+0000, U+0020-007E, U+00A0-00AC, U+00AE-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+2000-200B, U+2010-2027, U+202F-2055, U+2057, U+205F, U+20AC, U+2122, U+2190-2199, U+2212, U+2248, U+2264-2265, U+2318, U+25B6, U+25CF, U+2605, U+2713, U+FEFF' }],
});

export const fontVariables = ptInter.variable;
