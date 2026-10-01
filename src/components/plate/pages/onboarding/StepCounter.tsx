'use client';

import { T, useGT } from '@/components/plate/shims/gt-next';

type StepCounterProps = {
  /** The step on show, 1-based. */
  step: number;
  /** The number of steps this user takes; 1 when the survey ends onboarding. */
  totalSteps: number;
};

/**
 * The wizard's counter, "N / total", on the key rung at the right end of
 * the frame's mark row, then one hairline rule across the column under
 * the mark and the counter whose filled part is the progress. The counter
 * takes no space in the column: it is lifted out of the flow by the mark's
 * 16px row plus the gap under it, the frame's --plate-mark-gap
 * (plate.css .plate-root, 40px, 24px under 880px tall), so the counter's
 * row is the mark's row at every height and the step's heading stays at
 * the frame's heading position on every step. The parent must be
 * positioned. Nothing in it takes input, so pointer events pass through to
 * the mark's home link under its row. The rule is the only mark: no box,
 * no fill behind it. The dashboard prints the numbers through gt-next's
 * Num; the port prints them as they are.
 */
export default function StepCounter({ step, totalSteps }: StepCounterProps) {
  const gt = useGT();
  const progressPercent = (step / totalSteps) * 100;

  return (
    <div
      className='pointer-events-none absolute inset-x-0 top-[calc(-16px_-_var(--plate-mark-gap))] flex flex-col gap-3'
      data-testid='onboarding-step-counter'
    >
      {/* A 16px flex row, the mark's height; typo-key's own line-height is
          unlayered and would win over a leading utility. */}
      <p className='typo-key flex h-4 items-center justify-end tabular-nums'>
        <T>
          {step} / {totalSteps}
        </T>
      </p>
      <div
        role='progressbar'
        aria-label={gt('Onboarding progress')}
        aria-valuemin={0}
        aria-valuemax={totalSteps}
        aria-valuenow={step}
        className='h-0.5 w-full bg-(--hair-soft)'
      >
        <div
          className='bg-foreground h-full transition-[width] duration-300 ease-out'
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
