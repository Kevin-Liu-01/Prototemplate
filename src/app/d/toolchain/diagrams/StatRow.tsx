/**
 * A stat as a ledger row: one large number, one quiet label, one hairline.
 *
 * No glyph sits beside the number: an ornamental icon carries no data. The
 * number IS the diagram; everything else is a rule.
 */

export type StatRowProps = {
  /** Already formatted — `147m+`, `<1s`, `118`. */
  value: string;
  label: string;
  className?: string;
  title?: string;
};

export default function StatRow({ value, label, className, title }: StatRowProps) {
  return (
    <div className={className ? `tc-stat ${className}` : 'tc-stat'} title={title}>
      <div className='tc-stat-value'>{value}</div>
      <div className='tc-stat-label'>{label}</div>
    </div>
  );
}
