'use client';

import { useId, useState } from 'react';

import { gtText } from '@/components/viewer/GtWord';
import { GtMark } from '@/components/viewer/GtMark';

import { Choice } from './controls';
import Plate from './Plate';

type Step = 'meta' | 'body' | 'lead' | 'title';

const STEPS: readonly { value: Step; label: string }[] = [
  { value: 'meta', label: 'Caption' },
  { value: 'body', label: 'Body' },
  { value: 'lead', label: 'Heading' },
  { value: 'title', label: 'Title' },
];

const START = 'GT ships every locale. The gt CLI, GT-format files and GTM stay text.';

/**
 * The GT mark as a word. gtText() renders every standalone GT in a string
 * as GtWord, the doubled-line monogram sized to the text around it (0.74em
 * tall, its foot on the baseline) in currentColor. The letters stay in the
 * DOM as hidden text, so copy, find in page and screen readers still read
 * GT. Lowercase package names, hyphen-joined forms and letters inside other
 * words stay text.
 */
export default function GtWordDemo() {
  const inputId = useId();
  const [text, setText] = useState(START);
  const [step, setStep] = useState<Step>('lead');
  return (
    <Plate
      controls={
        <>
          <div className='dmo-field dmo-field-wide'>
            <label className='dmo-field-label' htmlFor={inputId}>
              Copy
            </label>
            <input
              className='dmo-input dmo-input-wide'
              id={inputId}
              spellCheck={false}
              value={text}
              onChange={(event) => setText(event.currentTarget.value.slice(0, 140))}
            />
          </div>
          <Choice label='Type size' options={STEPS} value={step} onChange={setStep} />
        </>
      }
      fit
      label='A sentence with every standalone GT drawn as the mark'
      stageClassName='dmo-gtword'
      tag='gtText(copy)'
    >
      <p className={`dmo-gtword-line is-${step}`}>{gtText(text, 'demo')}</p>
      <div className='dmo-gtword-marks' aria-hidden='true'>
        <GtMark height={16} width={25} />
        <GtMark height={18} width={28} />
        <GtMark height={32} width={50} />
      </div>
    </Plate>
  );
}
