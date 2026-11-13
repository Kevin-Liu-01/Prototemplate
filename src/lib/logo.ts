/**
 * The General Translation logo, the refined globe (Kevin, 2026-11-12), the
 * one drawing every in-site use reads: the chrome mark (GtMark), the
 * /brand figure and badge, the docs demos, and the masters, the tab icon
 * and the deck symbol that pnpm build:logo writes from it. It refines the
 * construction of the globe chosen on 2026-11-06 (Axis and meridian
 * behind, now a past pick on /marks and the previous logo in the logo
 * lock): each oval has its own centre and radii, the line weight is
 * 13.2 units and the gaps round the crossings are narrower. Its
 * construction is src/lib/logo-construction.json. The doubled-line
 * monogram the globe replaced on 2026-11-08 stays on /marks as a past pick
 * (doubled-gt) and in the production row; its old addresses serve this
 * logo (2026-11-10), and pnpm lint:logo holds every logo file to this
 * drawing.
 *
 * One path in currentColor with the nonzero fill rule, on the catalog's
 * 256 unit square: Kevin's drawing scaled by 207.4/487 about the ring's
 * centre, to four decimals. The same path as
 * public/marks/graticule/variations/refined-1112.svg (pnpm test:marks
 * holds the two together). Pure data and no imports, so the client chrome,
 * the server pages and the Node scripts read the same constant.
 */
export const LOGO = {
  id: 'refined-1112',
  name: 'General Translation',
  /** the catalog's square, with the drawing centred in it */
  square: '0 0 256 256',
  /** the drawn box, so a box set by height is the ink's own height */
  viewBox: '24.3 24.3 207.4 207.4',
  fillRule: 'nonzero',
  d: 'M128 24.3C185.2718 24.3 231.7 70.7282 231.7 128C231.7 185.2718 185.2718 231.7 128 231.7C70.7282 231.7 24.3 185.2718 24.3 128C24.3 70.7282 70.7282 24.3 128 24.3ZM212.4408 160.6176C208.2429 164.0957 203.4651 167.2246 198.3009 169.9668C181.4019 178.9395 159.0074 184.6262 134.4073 185.5665V185.618C132.6143 185.6759 130.7716 185.7062 128.8517 185.7062C128.503 185.7062 128.1571 185.704 127.8147 185.7032C127.5929 185.704 127.3706 185.7057 127.1483 185.7057C125.7331 185.7057 124.3239 185.6896 122.9215 185.6585C122.12 185.644 121.33 185.627 120.5472 185.6048V185.5908C110.8573 185.2543 101.5043 184.1816 92.6879 182.4615C94.1044 186.043 95.652 189.4074 97.3137 192.5274C104.1447 205.3483 112.3194 213.1102 120.5472 215.9674V191.5696C123.1949 191.6428 125.9111 191.6684 128.8517 191.6684C130.769 191.6684 132.6126 191.6394 134.4073 191.5836V216.1595C139.4513 214.5484 144.4817 211.0835 149.2787 205.6421C153.2755 201.1087 156.9691 195.3424 160.1802 188.5348C164.6255 187.7925 168.3778 187.0383 172.0723 186.0916C173.3708 185.759 174.659 185.403 175.9656 185.0175C172.0131 195.6137 166.9354 204.9271 160.9144 212.3253C184.518 203.1052 203.3015 184.2616 212.4408 160.6176ZM93.3693 44.3647C71.2261 53.5437 53.5173 71.2606 44.3485 93.4085C47.9115 90.7114 51.8277 88.2461 55.9955 86.0332C60.5689 83.6049 65.545 81.4176 70.8581 79.4995C69.5098 84.4779 68.331 89.7179 67.3617 95.1533C65.5706 95.9667 63.8441 96.8138 62.1869 97.6936C45.609 106.496 37.5021 117.5278 37.5021 128C37.5021 138.4722 45.609 149.504 62.1869 158.3064C63.8503 159.1896 65.5838 160.0393 67.3821 160.8552C68.3548 166.3034 69.5204 171.5425 70.8079 176.4818C65.5137 174.5679 60.5544 172.3874 55.9955 169.9668C51.8276 167.7535 47.9116 165.2881 44.3485 162.5911C53.6532 185.0678 71.7529 202.98 94.3569 212.0375C91.1411 208.0466 88.2329 203.56 85.6623 198.7353C75.7799 180.186 69.8684 155.0152 69.8684 127.5741C69.8684 100.133 75.7799 74.9627 85.6623 56.4134C87.9671 52.0876 90.5432 48.0335 93.3693 44.3647ZM83.2331 135.1359C83.7373 146.8785 85.4038 157.9337 87.9824 167.9026C99.4214 170.7465 112.2465 172.4006 125.8711 172.4982C126.3106 172.5011 126.7543 172.5028 127.2019 172.5033C152.8982 172.4956 175.8336 166.9486 192.1096 158.3064C204.8956 151.5175 212.6413 143.4017 215.5164 135.2398H144.8411C139.0787 135.2398 134.4073 139.9112 134.4073 145.6737V166.4026C132.0488 166.4946 129.6813 166.5419 127.3612 166.5419C124.9759 166.5419 122.7192 166.5074 120.5472 166.4384V145.5698C120.5472 139.8073 115.8758 135.1359 110.1133 135.1359ZM127.7466 37.9279C117.2152 37.928 106.1421 46.0504 97.3137 62.621C95.5097 66.0071 93.8408 69.6814 92.3276 73.6088C103.2334 71.4556 114.967 70.2943 127.1483 70.2943C155.5173 70.2943 181.5795 76.5993 200.3656 87.1609L193.5273 98.4649C177.2343 89.4151 153.7236 83.4963 127.1483 83.4963C112.956 83.4963 99.6049 85.1866 87.7512 88.1545C85.2053 98.2792 83.5951 109.4971 83.1786 121.399H218.2603C215.7285 86.273 193.1483 56.7009 161.905 44.0677C167.6573 51.465 172.5084 60.64 176.291 71.011C171.261 69.5545 165.9959 68.3161 160.5086 67.3161C157.2217 60.2019 153.4122 54.1947 149.2787 49.5059C142.3668 41.6658 134.9715 37.9279 127.7466 37.9279Z',
} as const;

/**
 * The logo lockup: the logo beside the stacked name, "General" over
 * "Translation" (Kevin, 2026-11-12, from his wordmark file). The name is
 * Katagami Text at weight 400, tracked -0.0496 em, with the font's kerning
 * (at 400 only T-r applies), drawn as outlines (Kevin, 2026-11-08:
 * "remember the word mark of general translation text uses katagami
 * text!"); running copy is Katagami Text too (BRAND.md section 6). The two
 * lines share one pen origin (`align: 'pen'`, so the T's ink stands 0.0161
 * cap height left of the G's), with `rhythm` cap heights of white between
 * the first baseline and the second cap line: the cap height less the
 * x-height. The globe is `mark` cap heights tall, centred on the name's ink
 * box, and the gap from its ink to the name's leftmost ink is `gap` cap
 * heights. On one line the globe is `oneLine` cap heights tall, centred on
 * the cap band, with the same gap to the G: there the ring's weight equals
 * the name's stem. Multiply by the name's cap height in px. pnpm
 * build:lockup draws the files (public/brand/gt-globe-lockup*.svg, the
 * deck's #gt-lockup, the globe rows' name) and writes these numbers to
 * public/brand/gt-globe-lockup.json, which pnpm test:marks holds them to.
 */
export const LOCKUP = {
  face: 'Katagami Text',
  weight: 400,
  /**
   * letter-spacing in em, after each advance: -0.0496 em (101.67 font units),
   * the least-squares fit of every glyph's position in Kevin's wordmark on
   * both lines, from one pen origin with the font's kerning at 400
   */
  tracking: -0.049645,
  /** white between the first baseline and the second cap line, in cap heights */
  rhythm: 0.2865,
  /** the first line's cap line to the second line's baseline: 2 + rhythm */
  span: 2.2865,
  /** the globe's height in cap heights, beside the stacked name */
  mark: 2.3643,
  /** white from the globe's ink to the name's leftmost ink, in cap heights */
  gap: 0.5826,
  /** both lines start at one pen origin */
  align: 'pen',
  /** the globe's height in cap heights beside the name on one line */
  oneLine: 1.9,
} as const;

/**
 * The four-globe lockup: three graticule globes, the logo, then the stacked
 * name (2026-11-10). It reads left to right as the logo's construction: a
 * whole graticule with its polar arcs, the same with the meridian opened on
 * the right where the G opens, the same without the polar arcs, then the
 * logo. The logo and the name are the stacked lockup exactly (LOCKUP); the
 * three graticule globes stand to the logo's left at its size with
 * `between` globe diameters of white between neighbours. pnpm build:strip
 * draws public/brand/gt-globe-strip*.svg and the three stage marks
 * (public/marks/graticule/strip/stage-*.svg) from the logo's own geometry,
 * and writes these numbers to public/brand/gt-globe-strip.json, which
 * pnpm test:marks holds them to.
 */
export const STRIP = {
  globes: 4,
  /** white between neighbouring globes, in globe diameters */
  between: 0.22,
  /** the same white in the name's cap heights: between times LOCKUP.mark */
  betweenInCaps: 0.5201,
  gap: LOCKUP.gap,
} as const;
