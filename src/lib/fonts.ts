import localFont from 'next/font/local';

/**
 * Katagami Text is this site's text face, as it is generaltranslation.com's
 * (gt-cloud #5765), and gt-ui's katagami-text-only rule holds it. The roman
 * latin subset, public/fonts/katagami/KatagamiText-latin.woff2 (the same
 * file the brand kit and the Atlas magazine set), is the one file every
 * route preloads. Its unicode-range is the subset's own, so a code point
 * outside it still falls to the Inter subsets and the Inter italic that
 * src/app/inter-subsets.css declares in the same family, until those are
 * cut from Katagami Text too.
 *
 * The binding keeps the name `ptInter` and the variable `--font-inter`,
 * which the type tokens, scripts/lint/type.mjs (rule T3) and the subset
 * faces in src/app/inter-subsets.css all name: next/font names the family
 * after the identifier, and those faces join it by that name.
 */
export const ptInter = localFont({
  src: [
    {
      path: '../../public/fonts/katagami/KatagamiText-latin.woff2',
      weight: '100 900',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
  // the code points of the Katagami Text latin subset
  declarations: [{ prop: 'unicode-range', value: 'U+0-FF, U+131, U+152-153, U+2BB-2BC, U+2C6, U+2DA, U+2DC, U+304, U+308, U+329, U+2000-206F, U+2074, U+20AC, U+2122, U+2190-2199, U+2212, U+2215' }],
});

export const fontVariables = ptInter.variable;
