import { GtMark } from '@/components/viewer/GtMark';

/**
 * Roundel. The GT monogram, drawn in one ink, on a cream disc inside the
 * doubled gold ring: a border and an outline at --thread-gauge separated by
 * --thread-gap, the CSS pair the charter names for a double rule. Decorative;
 * the hero sub carries the company name as text.
 *
 * C1 home: the hero crown (C1.4), seated on the crown's hub.
 */
export default function Roundel({ className }: { className?: string }) {
  return (
    <span className={className ? `sba-roundel ${className}` : 'sba-roundel'} aria-hidden='true'>
      <GtMark width={30} height={19} />
    </span>
  );
}
