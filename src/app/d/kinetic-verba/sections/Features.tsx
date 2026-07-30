import FeatureBento from '@/components/shared/FeatureBento';

import KineticText from '../components/KineticText';

/**
 * Act V — the platform. Two wide columns rather than four narrow ones, so the
 * module titles carry at display scale and the line-art drawings run large;
 * the stylesheet then weights one diagonal of cells as leads, so the grid has
 * a first read instead of eight equal squares.
 */
export default function Features() {
  return (
    <FeatureBento
      className='kv-features-sec'
      id='features'
      heading={
        <KineticText className='kv-kin' text='Everything, end to end' intro='scroll' baseWeight={700} flex={0.8} />
      }
      subheading='Eight modules between your repository and your next billion users — libraries, context, agents, routing, edge delivery, previews, runtime, and config.'
      columns={2}
    />
  );
}
