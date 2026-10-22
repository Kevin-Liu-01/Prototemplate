'use client';

/**
 * The plate's measured cost, in the controls row: the main-thread time of
 * one frame, smoothed, as the engine reports it about twice a second. It
 * reads "Still" when nothing is drawing, since a still costs one frame.
 */
export default function CostNote({ ms, still }: { ms: number | null; still: boolean }) {
  const text = still ? 'Still: one frame, then no work' : ms === null ? 'Measuring the frame' : `${ms < 10 ? ms.toFixed(2) : ms.toFixed(1)} ms of main thread a frame`;
  return <p className='dmo-bar-status d23-cost'>{text}</p>;
}
