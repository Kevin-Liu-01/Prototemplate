const READOUTS = [
  { value: '99.99%', label: 'delivery uptime, in the SLA' },
  { value: '100+', label: 'languages, one integration' },
  { value: '84 ms', label: 'p95 at the edge, cached' },
  { value: '62', label: 'locales across the catalog' },
] as const;

/**
 * The closing readouts: four measurements on one ruled strip. Values in
 * mono — they are numbers — labels in the text voice.
 */
export default function Readouts() {
  return (
    <section className='sgb-readouts' aria-label='Measurements'>
      {READOUTS.map((r) => (
        <div className='sgb-readout' key={r.label}>
          <b>{r.value}</b>
          <span>{r.label}</span>
        </div>
      ))}
    </section>
  );
}
