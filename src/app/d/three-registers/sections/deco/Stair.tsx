import type { CSSProperties } from 'react';

/**
 * Deco home: the gilded register (C1.5, the page's high-contrast band).
 *
 * The pipeline as a ziggurat stair. Six steps rise left to right, each one
 * step higher than the last; every step draws its own tread (a top rule)
 * and its own riser (a left rule), so the stepped line is one continuous
 * profile with one owner per segment. The labels are the story's own
 * lowercase stages.
 */
type StepStyle = CSSProperties & Record<'--tr-i', number>;

export function Stair({ steps }: { steps: readonly string[] }) {
  return (
    <ol className='tr-stair'>
      {steps.map((step, i) => {
        const style: StepStyle = { '--tr-i': i + 1 };
        return (
          <li className='tr-step' key={step} style={style}>
            <span className='tr-step-tread' aria-hidden='true' />
            <span className='tr-step-label'>{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
