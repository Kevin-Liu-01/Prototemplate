/**
 * The second-surface kit — three samples in one figure: the corner notch
 * (the ground showing through a card's 12px radius, with the seam meeting
 * it), the hatch spacer strip this page's own dividers use, and the
 * four-color system as labeled swatches. The swatch values are absolute by
 * design: ink is ink in both themes.
 */
export default function CornerFigure() {
  return (
    <figure
      className='ptc-fig ptc-corner'
      role='img'
      aria-label='The second-surface kit: a diagram of two cards on the grey ground where the ground fills each rounded corner notch and the seam between the cards, a sample strip of the diagonal hatch spacer, and four labeled swatches — ink, raised ink, titanium, and paper.'
    >
      <div className='ptc-corner-grid'>
        <svg viewBox='0 0 340 250' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>
          {/* the ground, and two radius-12 cards sitting on it: the corner
              notches and the seam between them are the same grey, because
              they are the same thing */}
          <rect className='ptc-ground' x='20' y='36' width='300' height='200' />
          <rect className='ptc-cell' x='21.5' y='37.5' width='177.75' height='197' rx='12' />
          <rect className='ptc-cell' x='200.75' y='37.5' width='117.75' height='197' rx='12' />

          {/* content strokes, so the card reads as a card */}
          <line className='ptc-hair2' x1='38' y1='80' x2='150' y2='80' />
          <line className='ptc-hair2' x1='38' y1='98' x2='120' y2='98' />

          {/* the notch */}
          <circle className='ptc-dot' cx='26' cy='42' r='2.5' />
          <line className='ptc-leader' x1='26' y1='42' x2='60' y2='18' />
          <text className='ptc-t' x='64' y='15'>
            the notch is the ground
          </text>

          {/* the seam meeting it */}
          <circle className='ptc-dot' cx='200' cy='60' r='2.5' />
          <line className='ptc-leader' x1='200' y1='60' x2='276' y2='20' />
          <text className='ptc-t' x='330' y='15' textAnchor='end'>
            the seam meets it
          </text>

          <text className='ptc-n' x='320' y='248' textAnchor='end'>
            border-radius: 12px &#183; reveal 1px
          </text>
        </svg>

        <div className='ptc-kit'>
          <div>
            <span className='ptc-part-label'>the hatch spacer</span>
            <div className='ptc-hatch-strip' aria-hidden='true' />
            <span className='ptc-part-token'>repeating-linear-gradient(-45deg &#183; 6px / 7px)</span>
          </div>

          <div>
            <span className='ptc-part-label'>the four-color system</span>
            <div className='ptc-swatches'>
              <div className='ptc-swatch is-ink'>
                <i aria-hidden='true' />
                <b>ink</b>
                <span>#070707</span>
              </div>
              <div className='ptc-swatch is-raised'>
                <i aria-hidden='true' />
                <b>raised ink</b>
                <span>#101010</span>
              </div>
              <div className='ptc-swatch is-titanium'>
                <i aria-hidden='true' />
                <b>titanium</b>
                <span>#8a8f98</span>
              </div>
              <div className='ptc-swatch is-paper'>
                <i aria-hidden='true' />
                <b>paper</b>
                <span>#ffffff</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption>
        The corner is never drawn — the card&rsquo;s 12px radius lets the ground fill the
        notch, so a corner cannot disagree with the seam that meets it. The hatch strip is
        the exact recipe of the dividers on this page, and the four colors are the whole
        structural palette.
      </figcaption>
    </figure>
  );
}
