/**
 * A stat as a ledger row: one large number, one quiet label, one hairline.
 *
 * The previous version paired each number with a small isometric glyph —
 * stacked plates, a cube on a sheet — which carried no data and sat squarely
 * inside the founder's ban on ornamental icons. The number IS the diagram;
 * everything else is a rule.
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
