import type { PictureName } from '@/components/plate/brand/moodPictures';

/** The wizard's step numbers, the ones the URL carries. */
export type OnboardingStep = 1 | 2 | 3 | 4;

/**
 * The mood picture each step's FieldPicture leaf asks for once mounted:
 * the survey, the organization, payment, then GitHub. The onboarding page
 * reads it to preload the first step's grid with the document, since the
 * frame under the route renders without a picture and the leaf asks only
 * after hydration.
 */
export const STEP_PICTURES: Record<OnboardingStep, PictureName> = {
  1: 'earth',
  2: 'rosetta',
  3: 'calligraphy',
  4: 'tablet',
};

function isOnboardingStep(step: number): step is OnboardingStep {
  return step === 1 || step === 2 || step === 3 || step === 4;
}

/** The picture of `step`; undefined for a number outside the wizard. */
export function stepPicture(step: number): PictureName | undefined {
  return isOnboardingStep(step) ? STEP_PICTURES[step] : undefined;
}
