/**
 * What the auditor sees — a small ruled mock (two cells over one row) with
 * the four defect classes staged on it. Every stroke is SVG in the figure
 * grammar, so the staged defects stay teaching material: the auditor reads
 * computed styles, and none of these lines re-enter the page's inventory.
 */
export default function AuditorFigure() {
  return (
    <figure
      className='ptc-fig'
      role='img'
      aria-label='A ruled mock of two cells and a seam, annotated with the four defect classes the line auditor fails: a doubled stroke, a missing seam, a self-stack, and an invisible seam.'
    >
      <svg viewBox='0 0 720 320' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>
        {/* the mock: one frame, two cells, one row seam */}
        <rect className='ptc-hair' x='24' y='36' width='396' height='248' />
        <line className='ptc-hair' x1='222' y1='36' x2='222' y2='160' />

        {/* defect 1 — the doubled stroke: a second line intrudes 4px inside
            the frame's own top rule */}
        <line className='ptc-inkline' x1='226' y1='40' x2='420' y2='40' />

        {/* defect 2 — the missing seam: the row junction closes on either
            side, and a dashed ghost marks the span no rule owns */}
        <line className='ptc-hair' x1='24' y1='160' x2='268' y2='160' />
        <line className='ptc-hair' x1='324' y1='160' x2='420' y2='160' />
        <line className='ptc-hair2 ptc-dash' x1='268' y1='160' x2='324' y2='160' />

        {/* defect 3 — the self-stack: a translucent border over the
            element's own translucent fill, one line drawn twice */}
        <rect className='ptc-stack' x='238' y='60' width='152' height='74' />

        {/* defect 4 — the invisible seam: present in geometry, a few RGB
            steps from the surface it crosses */}
        <line className='ptc-ghost' x1='24' y1='222' x2='420' y2='222' />

        {/* annotation dots and leaders — label order follows the leaders'
            geometry so no two ever cross */}
        <circle className='ptc-dot' cx='410' cy='40' r='2.5' />
        <line className='ptc-leader' x1='410' y1='40' x2='444' y2='56' />
        <circle className='ptc-dot' cx='390' cy='134' r='2.5' />
        <line className='ptc-leader' x1='390' y1='134' x2='444' y2='124' />
        <circle className='ptc-dot' cx='296' cy='160' r='2.5' />
        <line className='ptc-leader' x1='296' y1='160' x2='444' y2='192' />
        <circle className='ptc-dot' cx='330' cy='222' r='2.5' />
        <line className='ptc-leader' x1='330' y1='222' x2='444' y2='260' />

        {/* labels: grotesk for the words, mono for the finding's tokens */}
        <text className='ptc-t' x='452' y='60'>
          doubled stroke
        </text>
        <text className='ptc-n' x='452' y='77'>
          gap 4px · 2 owners
        </text>
        <text className='ptc-t' x='452' y='128'>
          self-stack
        </text>
        <text className='ptc-n' x='452' y='145'>
          0.26&#945; over 0.085&#945;
        </text>
        <text className='ptc-t' x='452' y='196'>
          missing seam
        </text>
        <text className='ptc-n' x='452' y='213'>
          span 56px unruled
        </text>
        <text className='ptc-t' x='452' y='264'>
          invisible seam
        </text>
        <text className='ptc-n' x='452' y='281'>
          &#916; 2 rgb
        </text>
      </svg>
      <figcaption>
        Two cells and a seam, as the auditor reconstructs them. It rebuilds every rendered
        line from computed styles — borders, outlines, spread shadows, thin filled boxes,
        pseudo rails, 1px ground reveals — then fails the round on any of the four classes.
      </figcaption>
    </figure>
  );
}
