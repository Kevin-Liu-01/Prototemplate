/**
 * The doubled-line demo plate — the sandwich stroke, static. Two source
 * paths merge into one trunk; each path is stroked twice (full-gauge ink
 * under a plate-colored core), so every connector reads as two parallel
 * hairline threads at a constant gap through the bends. Layer order is the
 * grammar: threads first, the accent pulse next, all cores last — the trunk
 * drawn last so its core re-carves the junction into one clean pair, and
 * the pulse carved by the same cores into two accent hairlines.
 */
const FORK_A = 'M40 64 C170 64 210 120 330 120';
const FORK_B = 'M40 176 C170 176 210 120 330 120';
const TRUNK = 'M330 120 L680 120';
const PULSE = 'M470 120 L590 120';

export default function ThreadsDemo() {
  return (
    <svg className='ptc-threads' viewBox='0 0 720 240' aria-hidden='true'>
      <path className='ptc-th-thread' d={FORK_A} />
      <path className='ptc-th-thread' d={FORK_B} />
      <path className='ptc-th-thread' d={TRUNK} />
      <path className='ptc-th-pulse' d={PULSE} />
      <path className='ptc-th-core' d={FORK_A} />
      <path className='ptc-th-core' d={FORK_B} />
      <path className='ptc-th-core' d={TRUNK} />
    </svg>
  );
}
