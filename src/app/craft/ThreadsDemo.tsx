import DoubledLine from '@/components/shared/diagrams/DoubledLine';

/**
 * The doubled-line demo plate — the real component, three times. Two
 * source paths merge into one trunk; each is one DoubledLine (a single
 * center path stroked twice, carved by the plate's ink), and the pair a
 * carve leaves is ONE ink: a doubled line is one line drawn twice, so its
 * two threads always agree on color. The plate says that ink once, as a
 * token, and every stroke here spends it. The trunk renders last so its
 * core re-carves the junction into one clean pair, and its pulse slot
 * carries a static accent window — carved into two accent hairlines by
 * the same core.
 */
const FORK_A = 'M40 64 C170 64 210 120 330 120';
const FORK_B = 'M40 176 C170 176 210 120 330 120';
const TRUNK = 'M330 120 L680 120';
const PULSE = 'M470 120 L590 120';

const INK = 'var(--ptc-thread-ink)';

export default function ThreadsDemo() {
  return (
    <svg className='ptc-threads' viewBox='0 0 720 240' aria-hidden='true'>
      <DoubledLine core='var(--color-ink)' d={FORK_A} gap={2} gauge={1} ink={INK} />
      <DoubledLine core='var(--color-ink)' d={FORK_B} gap={2} gauge={1} ink={INK} />
      <DoubledLine core='var(--color-ink)' d={TRUNK} gap={2} gauge={1} ink={INK}>
        <path className='ptc-th-pulse' d={PULSE} />
      </DoubledLine>
    </svg>
  );
}
