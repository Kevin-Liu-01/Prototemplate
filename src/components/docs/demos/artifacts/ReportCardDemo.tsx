'use client';

import { useState } from 'react';

import ReportCard, { type ReportCardState } from '@/components/try/ReportCard';

import { Choice } from '../controls';
import Plate from '../Plate';
import { SAMPLE_REPORT } from './report-sample';

import '@/components/try/try.css';
import './artifacts.css';

type Phase = 'skeleton' | 'waiting' | 'filled';

const PHASES: readonly { value: Phase; label: string }[] = [
  { value: 'skeleton', label: 'Skeleton' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'filled', label: 'Filled' },
];

const STATE: Record<Phase, ReportCardState> = { skeleton: 'idle', waiting: 'loading', filled: 'done' };

/**
 * The report card the /report-card page grades a site into, standing
 * alone with a sample report. The card draws its whole structure from the
 * first paint (the meter, a ghost score and the six named rows), waits
 * with the rows breathing, and fills in place when the report lands, so
 * nothing below it moves. A filled row opens its evidence: the captured
 * markup, the findings and a prompt for a coding agent.
 */
export default function ReportCardDemo() {
  const [phase, setPhase] = useState<Phase>('filled');
  return (
    <Plate
      controls={<Choice label='State' options={PHASES} value={phase} onChange={setPhase} />}
      fit
      label={`The report card, ${phase}`}
      tag='<ReportCard report state />'
    >
      <div className='try-root dmo-try'>
        <ReportCard report={phase === 'filled' ? SAMPLE_REPORT : null} state={STATE[phase]} />
      </div>
    </Plate>
  );
}
