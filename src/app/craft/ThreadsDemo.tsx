import DoubledLine from '@/components/shared/diagrams/DoubledLine';

/**
 * The doubled-line demo plate — the real component, two-toned. Two source
 * paths merge into one trunk; each is one DoubledLine (a single center
 * path stroked twice, carved by the plate's ink), and each pair renders
 * one WHITE thread and one GRAY: the white copy clips to the region
 * closed off the top edge along the same geometry, so the split seam
 * hides inside the carve on every bend. The trunk renders last so its
 * core re-carves the junction into one clean pair, and its pulse slot
 * carries a static accent window — carved into two accent hairlines by
 * the same core.
 */
const FORK_A = 'M40 64 C170 64 210 120 330 120';
const FORK_B = 'M40 176 C170 176 210 120 330 120';
const TRUNK = 'M330 120 L680 120';
const PULSE = 'M470 120 L590 120';

/* each split region is the center path closed off the TOP edge — the
   upper thread takes the white ink, the lower the gray, on any curve */
const SPLIT_A = `${FORK_A} L330 -20 L40 -20 Z`;
const SPLIT_B = `${FORK_B} L330 -20 L40 -20 Z`;
const SPLIT_T = `${TRUNK} L680 -20 L330 -20 Z`;

const INK = 'rgba(255, 255, 255, 0.88)';
const INK_B = 'rgba(255, 255, 255, 0.42)';

export default function ThreadsDemo() {
  return (
    <svg className='ptc-threads' viewBox='0 0 720 240' aria-hidden='true'>
      <DoubledLine
        core='var(--color-ink)'
        d={FORK_A}
        gap={2}
        gauge={1}
        ink={INK}
        inkB={INK_B}
        splitD={SPLIT_A}
      />
      <DoubledLine
        core='var(--color-ink)'
        d={FORK_B}
        gap={2}
        gauge={1}
        ink={INK}
        inkB={INK_B}
        splitD={SPLIT_B}
      />
      <DoubledLine
        core='var(--color-ink)'
        d={TRUNK}
        gap={2}
        gauge={1}
        ink={INK}
        inkB={INK_B}
        splitD={SPLIT_T}
      >
        <path className='ptc-th-pulse' d={PULSE} />
      </DoubledLine>
    </svg>
  );
}
