import Link from 'next/link';

import { headingId } from './brand-sections';
import GtLogoMotion from '@/components/brand/GtLogoMotion';
import { LOCKUP, LOGO } from '@/lib/logo';
import CONSTRUCTION from '@/lib/logo-construction.json';
import { CLEAR_ONE_LINE, CLEAR_STACKED, RING_SHARE, stated } from '@/lib/logo-numbers';

/**
 * The logo system section: the construction drawing, the three states
 * live, the lockups with their numbers, and the monogram the logo
 * replaced. Every number is read from LOGO and LOCKUP in src/lib/logo.ts
 * and from the logo's construction, src/lib/logo-construction.json (the
 * ring, the two ovals with their own centres and radii, the weight, the
 * bar and the stem, in the 256 unit square), and written with `stated`,
 * the one rounding rule (src/lib/logo-numbers.ts), so the section moves
 * with the drawing and agrees with the brand kit.
 */
const { ring: RING, meridian: MER, latitude: LAT, weight: STROKE, stem: STEM } = CONSTRUCTION.new;
const cx = 128;
const cy = 128;
const r = RING.mid;
const fix = (n: number, d = 1) => stated(n, d);

/** the drawing's parts, in the order the figure numbers them */
const PARTS = [
  ['The ring', `a circle of radius ${fix(r)} on the 256 unit square, ${fix(STROKE)} units thick, and it is the globe’s outline.`],
  ['The latitude oval', `${fix(LAT.rx)} by ${fix(LAT.ry)} units at the half-axes, centred ${fix(cx - LAT.cx, 2)} left of the ring’s centre: the equator seen from just above. Its lower arc is the front of the globe.`],
  ['The meridian oval', `${fix(MER.rx)} by ${fix(MER.ry)}, an oval of its own stood upright, centred ${fix(cy - MER.cy, 2)} above the ring’s centre. Its left half draws the G’s bowl, and its back half breaks where it passes behind the front of the equator.`],
  ['The bar', `the horizontal through the centre, ${fix(STROKE)} units thick, from the G’s bowl to the ring. It is the G’s bar and the top of the T.`],
  ['The axis', `the T’s stem, ${fix(STEM.width)} units wide, along the polar axis from the centre to the ring’s foot. It breaks where it passes behind the front of the equator.`],
] as const;

/** the lockup numbers, in cap heights of the name */
const NUMBERS = [
  ['Unit', 'the name’s cap height, the height of the T'],
  ['Name', `${LOCKUP.face} at weight ${LOCKUP.weight}, tracking ${fix(LOCKUP.tracking, 4)} em, with the font’s own kerning, drawn as outlines; both lines start at one pen origin`],
  ['Line gap', `${LOCKUP.rhythm} cap from the first baseline to the second cap line: the cap height less the x-height`],
  ['Stacked mark', `${LOCKUP.mark} cap tall, centred on the name’s ink from the G’s top to the foot of the a`],
  ['One-line mark', `${LOCKUP.oneLine} cap tall, where the ring (${fix(RING_SHARE * 100, 2)} percent of the mark) is as thick as the name’s stems (${fix(LOCKUP.oneLine * RING_SHARE, 3)} cap)`],
  ['Gap to the name', `${LOCKUP.gap} cap from the mark’s ink to the name’s nearest ink in both lockups: the T stacked, the G on one line`],
  ['Clear space', `a quarter of the mark’s height on every side: ${fix(CLEAR_STACKED, 2)} cap around the stacked lockup and ${fix(CLEAR_ONE_LINE, 2)} around the one-line lockup`],
  ['Smallest size', 'the mark 24 px tall alone, and 16 px only as a tab icon; a lockup or a wordmark at a 9 px cap height'],
] as const;

function Construction() {
  const guide = { fill: 'none', vectorEffect: 'non-scaling-stroke' } as const;
  const top = cy - r;
  const foot = cy + r;
  /* the parts' number seats, each on its primitive */
  const seats: readonly [number, number][] = [
    [cx + r * 0.707, cy - r * 0.707],
    [LAT.cx + LAT.rx * 0.6, LAT.cy + LAT.ry * 0.8],
    [MER.cx - MER.rx * 0.5, MER.cy - MER.ry * 0.866],
    [cx + r * 0.78, cy],
    [STEM.centre, cy + r * 0.62],
  ];
  return (
    <figure className='ptb-sys-fig'>
      <div aria-labelledby='ptb-sys-fig-cap' className='ptb-sys-fig-art' role='img'>
        <svg aria-hidden viewBox='0 0 256 256'>
          <path className='ptb-sys-ghost' d={LOGO.d} />
          <g className='ptb-sys-guide'>
            <circle cx={cx} cy={cy} r={r} {...guide} />
            <ellipse cx={LAT.cx} cy={LAT.cy} rx={LAT.rx} ry={LAT.ry} {...guide} />
            <ellipse cx={MER.cx} cy={MER.cy} rx={MER.rx} ry={MER.ry} {...guide} />
            <line x1={cx - r} x2={cx + r} y1={cy} y2={cy} {...guide} />
            <line x1={STEM.centre} x2={STEM.centre} y1={top} y2={foot} {...guide} />
          </g>
          {seats.map(([x, y], i) => (
            <g className='ptb-sys-key' key={PARTS[i][0]}>
              <circle cx={x} cy={y} r={6.5} />
              <text dominantBaseline='central' fontSize={8} textAnchor='middle' x={x} y={y}>
                {i + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <figcaption id='ptb-sys-fig-cap'>
        The logo over its construction: the ring, the two ovals, the equator and the polar axis, numbered as in the
        list below.
      </figcaption>
    </figure>
  );
}

export default function LogoSystem() {
  return (
    <>
      <p>
        The logo is a globe whose lines draw the letters G and T. It is one filled path in one colour on a 256 unit
        square. Every logo file, the tab icon, both lockups and the live motion read that one drawing, so they agree
        to the unit.
      </p>
      <h3 id={headingId('logo-system', 'construction')}>Construction</h3>
      <Construction />
      <ol className='ptb-sys-parts'>
        {PARTS.map(([name, what]) => (
          <li key={name}>
            <b>{name}</b> is {what}
          </li>
        ))}
      </ol>
      <p>
        The two breaks give the drawing its depth. The axis and the back of the meridian stop where the front of the
        globe passes over them, so the globe reads as a sphere seen from just above the equator. The drawing&rsquo;s
        name is Refined globe: Axis and meridian behind on its own construction. The marks that led to it are on{' '}
        <Link href='/marks/graticule'>the graticule page</Link>.
      </p>

      <h3 id={headingId('logo-system', 'states')}>States</h3>
      <p>
        The logo has three states. The still logo is the one every file draws. On hover the meridian draws back, and
        the logo settles into the globe without its meridian. While a page loads the loader runs. Under reduced
        motion the hover does nothing and the loader holds the still logo.
      </p>
      <div className='ptb-sys-states'>
        <figure className='ptb-kit-motion-cell'>
          <div className='ptb-kit-motion-art is-paper'>
            <GtLogoMotion mode='static' size={72} />
          </div>
          <figcaption>Still: the logo at rest, in every file and at every size.</figcaption>
        </figure>
        <figure className='ptb-kit-motion-cell'>
          <div className='ptb-kit-motion-art is-paper' data-gt-logo-host=''>
            <GtLogoMotion mode='hover' size={72} />
          </div>
          <figcaption>
            Hover: the meridian draws back over the north pole, down the left and under the south pole. On leave it
            draws out again.
          </figcaption>
        </figure>
        <figure className='ptb-kit-motion-cell'>
          <div className='ptb-kit-motion-art is-paper'>
            <GtLogoMotion label='The General Translation loader' mode='loader' size={72} />
          </div>
          <figcaption>
            Loader, Meridian, then G: the draw-back once, then a line once round the meridian and the G&rsquo;s stroke
            once round the equator, on a loop.
          </figcaption>
        </figure>
      </div>

      <h3 id={headingId('logo-system', 'lockups')}>Lockups</h3>
      <p>
        The stacked lockup, &ldquo;General&rdquo; over &ldquo;Translation&rdquo; beside the mark, is the main logo.
        The one-line lockup is for places where height is short. Both are built from the mark and the name&rsquo;s
        outlines, and every number below is measured in the name&rsquo;s cap height.
      </p>
      <div className='ptb-marks ptb-lockups'>
        <figure className='ptb-mark is-paper'>
          <img alt='The stacked lockup in ink on paper' decoding='async' loading='lazy' src='/brand/kit/svg/gt-lockup-stacked-ink.svg' />
          <figcaption>The stacked lockup in ink on paper.</figcaption>
        </figure>
        <figure className='ptb-mark is-ink'>
          <img alt='The one-line lockup in white on ink' decoding='async' loading='lazy' src='/brand/kit/svg/gt-lockup-horizontal-white.svg' />
          <figcaption>The one-line lockup in white on ink.</figcaption>
        </figure>
      </div>
      <div className='ptb-names'>
        {NUMBERS.map(([name, what]) => (
          <div className='ptb-name-row' key={name}>
            <b>{name}</b>
            <span>{what}</span>
          </div>
        ))}
      </div>

      <h3 id={headingId('logo-system', 'previous')}>The previous mark</h3>
      <p>
        Until 8 November 2026 the mark was the doubled-line monogram. Every stroke of its G and T was two parallel
        lines, the same grammar as the doubled-line connectors in the diagrams. The globe replaced it in this
        site&rsquo;s chrome, the tab icon, this page and the deck. The addresses of the monogram&rsquo;s files serve the
        globe since 10 November 2026, and <Link href='/marks'>the marks page</Link> keeps the monogram as a past pick.
      </p>
      <div className='ptb-marks ptb-lockups'>
        <figure className='ptb-mark is-paper'>
          <img alt='The doubled-line monogram of the letters G and T, the previous mark' decoding='async' loading='lazy' src='/marks/previous/gt-monogram.svg' />
          <figcaption>The doubled-line monogram, the previous mark, used until 8 November 2026.</figcaption>
        </figure>
        <figure className='ptb-mark is-paper'>
          <img alt='The globe logo, the current mark' decoding='async' loading='lazy' src='/brand/kit/svg/gt-mark-ink.svg' />
          <figcaption>The globe, the mark since 8 November 2026.</figcaption>
        </figure>
      </div>
    </>
  );
}
