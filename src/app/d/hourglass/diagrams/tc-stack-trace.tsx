/**
 * The band's time axis: one commit's journey through the stack, timestamped.
 * The isometric assembly beside it draws the same journey in space; this plate
 * proves the elapsed time — 09:41:02 to 09:45:09, source to screen in four
 * minutes. Every value here is new to the band: timestamps, the string hash,
 * the reviewer, the first-paint cost. Only the PR number is shared with the
 * drawing, deliberately, so the two artifacts read as one story.
 */

const ROWS: readonly (readonly [string, string, string])[] = [
  ['09:41:02', 'committed', 'app/page.tsx'],
  ['09:41:18', 'extracted', 'hash 0f3a92'],
  ['09:41:44', 'pr opened', 'locadex · #218'],
  ['09:42:03', 'translated', '6 locales · 3.4 s'],
  ['09:44:37', 'approved', 'review · @mira'],
  ['09:45:01', 'published', 'edge · 3 regions'],
  ['09:45:09', 'rendered', 'de · paint 38 ms'],
];

export default function TcStackTrace() {
  return (
    <div className='tc-trace' data-reveal>
      <div className='tc-trace-bar'>one commit, timestamped</div>
      <div className='tc-trace-rows'>
        {ROWS.map(([time, stage, value]) => (
          <div className='tc-trace-row' key={time}>
            <span className='tc-trace-time'>{time}</span>
            <b>{stage}</b>
            <span className='tc-trace-val'>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
