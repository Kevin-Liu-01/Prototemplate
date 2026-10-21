'use client';

import TranslationFlow from '@/app/d/toolchain/diagrams/TranslationFlow';

import { Action } from './controls';
import { useReplay } from './hooks';
import Plate from './Plate';

/**
 * The connector in production: the Toolchain direction's translation
 * fan-out, mounted as it ships. A real source file forks into the three
 * output files gt.config.json declares, one doubled trunk splits at a drawn
 * junction, and a pulse window carries each transfer from the trunk onto
 * its branch. Replay remounts it, which restarts the staggered journeys.
 */
export default function ConnectorDemo() {
  const [run, replay] = useReplay();
  return (
    <Plate
      controls={<Action onClick={replay}>Replay</Action>}
      fit
      label='The translation fan-out: a source file forked into three locale files along doubled-line connectors'
      lazy
      moves
      stageClassName='dmo-flow'
      tag='<TranslationFlow />'
    >
      <TranslationFlow key={run} title='A source component forked into its Spanish, Japanese and German output files' />
    </Plate>
  );
}
