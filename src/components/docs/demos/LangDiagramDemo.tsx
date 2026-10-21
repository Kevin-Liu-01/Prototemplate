'use client';

import { useState } from 'react';
import type { ComponentType } from 'react';

import ContextResolve from '@/app/d/toolchain/diagrams/lang/ContextResolve';
import ExpansionBars from '@/app/d/toolchain/diagrams/lang/ExpansionBars';
import type { LangProps } from '@/app/d/toolchain/diagrams/lang/lang';
import PluralForms from '@/app/d/toolchain/diagrams/lang/PluralForms';
import RtlMirror from '@/app/d/toolchain/diagrams/lang/RtlMirror';
import ScriptSampler from '@/app/d/toolchain/diagrams/lang/ScriptSampler';
import SentenceWidth from '@/app/d/toolchain/diagrams/lang/SentenceWidth';
import WordMorph from '@/app/d/toolchain/diagrams/lang/WordMorph';

import { Action, Choice, Toggle } from './controls';
import { useReplay } from './hooks';
import Plate from './Plate';

type Key = 'width' | 'plurals' | 'rtl' | 'context' | 'expansion' | 'scripts' | 'morph';

const DIAGRAMS: Record<Key, { label: string; name: string; Component: ComponentType<LangProps>; title: string }> = {
  width: {
    label: 'Sentence width',
    name: 'SentenceWidth',
    Component: SentenceWidth,
    title: 'One sentence in four locales, each measured by the browser against the English width',
  },
  plurals: {
    label: 'Plurals',
    name: 'PluralForms',
    Component: PluralForms,
    title: 'One count against the plural rules of English, Polish and Japanese',
  },
  rtl: {
    label: 'Right to left',
    name: 'RtlMirror',
    Component: RtlMirror,
    title: 'The same panel in left-to-right and right-to-left, mirrored by the dir attribute',
  },
  context: {
    label: 'Context',
    name: 'ContextResolve',
    Component: ContextResolve,
    title: 'The word Save resolving to two German verbs by context',
  },
  expansion: {
    label: 'Expansion',
    name: 'ExpansionBars',
    Component: ExpansionBars,
    title: 'Text expansion per locale against English as a diverging chart',
  },
  scripts: {
    label: 'Scripts',
    name: 'ScriptSampler',
    Component: ScriptSampler,
    title: 'The word language in eight writing systems at once',
  },
  morph: {
    label: 'One term',
    name: 'WordMorph',
    Component: WordMorph,
    title: 'One interface term printed in every locale it ships in',
  },
};

const ORDER: readonly Key[] = ['width', 'plurals', 'rtl', 'context', 'expansion', 'scripts', 'morph'];

/**
 * The Toolchain direction's seven language diagrams, one at a time. They
 * are built from real HTML text so the browser shapes Arabic, stacks
 * Devanagari and resolves bidi; each reads currentColor and --iso-accent,
 * so the docs theme reskins them. Each runs its own loop and freezes at
 * its most legible frame under reduced motion.
 */
export default function LangDiagramDemo() {
  const [key, setKey] = useState<Key>('width');
  const [accent, setAccent] = useState(true);
  const [run, replay] = useReplay();
  const diagram = DIAGRAMS[key];
  const { Component } = diagram;
  return (
    <Plate
      controls={
        <>
          <Choice
            label='Diagram'
            options={ORDER.map((value) => ({ value, label: DIAGRAMS[value].label }))}
            value={key}
            onChange={setKey}
          />
          <Toggle label='Accent' pressed={accent} onChange={setAccent} />
          <Action onClick={replay}>Replay</Action>
        </>
      }
      fit
      label={diagram.title}
      lazy
      moves
      stageClassName='dmo-lang'
      tag={`<${diagram.name} accent={${accent}} />`}
    >
      <div className='dmo-lang-box'>
        <Component accent={accent} key={`${key}-${run}`} title={diagram.title} />
      </div>
    </Plate>
  );
}
