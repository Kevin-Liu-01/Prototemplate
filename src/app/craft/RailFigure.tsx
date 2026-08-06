/**
 * The ownership diagram — the ruled column in cross-section: the wrapper's
 * doubled rail pair, a row whose hair ground shows through 1px reveals
 * around two paper cells, and one label per line naming its single owner.
 *
 * Paint order is part of the lesson: the row's surfaces first, the page's
 * lines over them. An earlier revision drew the lines first and butted the
 * ground's reveal against the inner rail, so the reveal and the rail
 * hairline stacked into a doubled border — the antipattern this figure
 * exists to teach. Now the outer cells sit flush at the rails (the rail
 * already draws that line) and the two plus marks on the nav's close are
 * the sanctioned border crosses, declaring those crossings deliberate.
 */
export default function RailFigure() {
  return (
    <figure
      className='ptc-fig'
      role='img'
      aria-label='A diagram of the ruled column: the wrapper draws the doubled outer rails, a row exposes its grey ground as the seams between two paper cells that sit flush against the rails, border crosses mark the nav crossings, and labels name the single owner of every line.'
    >
      <svg viewBox='0 0 720 320' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>
        {/* the framed row's surfaces, painted first: the hair ground shows as
            the top, bottom and middle reveals only — at the rails the cells
            sit flush, because the rail already draws that line */}
        {/* the reveals are LITERALLY 1px in figure units — the middle gap
            ran 2 units and the top/bottom 1.5 (founder: still more 2px),
            which drew the exact fat seam the caption forbids */}
        <rect className='ptc-ground' x='162' y='84' width='396' height='148' />
        <rect className='ptc-cell' x='162' y='85' width='197' height='146' />
        <rect className='ptc-cell' x='360' y='85' width='198' height='146' />

        {/* the wrapper's rails, drawn once over the row: the doubled outer
            pair — 10px apart, exactly the page's own offset */}
        <line className='ptc-hair' x1='152' y1='16' x2='152' y2='304' />
        <line className='ptc-hair' x1='162' y1='16' x2='162' y2='304' />
        <line className='ptc-hair' x1='558' y1='16' x2='558' y2='304' />
        <line className='ptc-hair' x1='568' y1='16' x2='568' y2='304' />
        <text className='ptc-n' x='157' y='30' textAnchor='middle'>
          10px
        </text>

        {/* the nav's close — a row seam, spanning rail to rail */}
        <line className='ptc-hair' x1='162' y1='48' x2='558' y2='48' />
        <text className='ptc-s' x='174' y='38'>
          nav
        </text>

        {/* the border crosses: where the nav's close meets the rails, a plus
            seated on the intersection declares the crossing deliberate */}
        <path className='ptc-cross' d='M158 48h8M162 44v8' />
        <path className='ptc-cross' d='M554 48h8M558 44v8' />
        <text className='ptc-s' x='174' y='66'>
          border cross — an added device
        </text>

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

        {/* left annotation, lower: the flush edge — no reveal beside a rail */}
        <circle className='ptc-dot' cx='162' cy='204' r='2.5' />
        <line className='ptc-leader' x1='144' y1='204' x2='158' y2='204' />
        <text className='ptc-t' x='140' y='200' textAnchor='end'>
          flush at the rail
        </text>
        <text className='ptc-n' x='140' y='217' textAnchor='end'>
          reveal 0px
        </text>

        {/* right annotation, top: the mat reveal */}
        <circle className='ptc-dot' cx='470' cy='84.5' r='2.5' />
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
        <circle className='ptc-dot' cx='359.5' cy='224' r='2.5' />
        <line className='ptc-leader' x1='359.5' y1='224' x2='584' y2='252' />
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
        padding reveal instead of drawing a border of its own. Where the row meets the
        rails the cells sit flush — a reveal never runs beside a line that already
        exists — and the plus marks on the nav&rsquo;s crossings are border crosses, the
        one ornament a junction is allowed.
      </figcaption>
    </figure>
  );
}
