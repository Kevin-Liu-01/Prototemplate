/**
 * The ownership diagram — the ruled column in cross-section: the wrapper's
 * doubled rail pair, a row whose hair ground shows through 1px reveals
 * around two paper cells, and one label per line naming its single owner.
 */
export default function RailFigure() {
  return (
    <figure
      className='ptc-fig'
      role='img'
      aria-label='A diagram of the ruled column: the wrapper draws the doubled outer rails, a row exposes its grey ground as the seams between two paper cells, and labels name the single owner of every line.'
    >
      <svg viewBox='0 0 720 320' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>
        {/* the wrapper's rails: the doubled outer pair, drawn once for the
            whole page — 10px apart, exactly the page's own offset */}
        <line className='ptc-hair' x1='152' y1='16' x2='152' y2='304' />
        <line className='ptc-hair' x1='162' y1='16' x2='162' y2='304' />
        <line className='ptc-hair' x1='558' y1='16' x2='558' y2='304' />
        <line className='ptc-hair' x1='568' y1='16' x2='568' y2='304' />
        <text className='ptc-n' x='157' y='30' textAnchor='middle'>
          10px
        </text>

        {/* the nav's close — a row seam, spanning rail to rail */}
        <line className='ptc-hair' x1='162' y1='48' x2='558' y2='48' />
        <text className='ptc-s' x='172' y='38'>
          nav
        </text>

        {/* the framed row: the hair ground, exposed as 1px reveals around
            two paper cells — the ground IS the seam */}
        <rect className='ptc-ground' x='162' y='84' width='396' height='148' />
        <rect className='ptc-cell' x='163.5' y='85.5' width='195.5' height='145' />
        <rect className='ptc-cell' x='361' y='85.5' width='195.5' height='145' />

        <text className='ptc-n' x='261' y='152' textAnchor='middle'>
          .tc-cell
        </text>
        <text className='ptc-s' x='261' y='170' textAnchor='middle'>
          draws no lines of its own
        </text>
        <text className='ptc-n' x='459' y='152' textAnchor='middle'>
          .tc-card
        </text>
        <text className='ptc-s' x='459' y='170' textAnchor='middle'>
          framed by the reveal, not a border
        </text>

        {/* the next row's close */}
        <line className='ptc-hair' x1='162' y1='276' x2='558' y2='276' />

        {/* left annotation: the rails' one owner */}
        <circle className='ptc-dot' cx='157' cy='120' r='2.5' />
        <line className='ptc-leader' x1='144' y1='120' x2='153' y2='120' />
        <text className='ptc-t' x='140' y='116' textAnchor='end'>
          wrapper owns
        </text>
        <text className='ptc-t' x='140' y='131' textAnchor='end'>
          the rails
        </text>
        <text className='ptc-n' x='140' y='148' textAnchor='end'>
          2 &#215; 1px
        </text>

        {/* right annotation, top: the mat reveal */}
        <circle className='ptc-dot' cx='470' cy='84.75' r='2.5' />
        <line className='ptc-leader' x1='470' y1='84' x2='584' y2='56' />
        <text className='ptc-t' x='588' y='52'>
          the ground is
        </text>
        <text className='ptc-t' x='588' y='67'>
          the seam
        </text>
        <text className='ptc-n' x='588' y='84'>
          reveal 1px
        </text>

        {/* right annotation, bottom: the row's seams */}
        <circle className='ptc-dot' cx='360' cy='224' r='2.5' />
        <line className='ptc-leader' x1='360' y1='224' x2='584' y2='252' />
        <text className='ptc-t' x='588' y='248'>
          row owns the seams
        </text>
        <text className='ptc-n' x='588' y='265'>
          gap: 1px
        </text>
      </svg>
      <figcaption>
        One owner per line. The wrapper draws the doubled rails for the whole page; each
        row owns its seams and its close; a framed cell exposes the ground through a 1px
        padding reveal instead of drawing a border of its own.
      </figcaption>
    </figure>
  );
}
