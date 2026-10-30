'use client';

import { useState } from 'react';

import { MARK_SIZES, WORDMARK_SIZES } from '@/lib/marks';

import { Choice, Toggle } from './controls';
import Plate from './Plate';

export type MarkEntry = {
  id: string;
  name: string;
  group: 'shortlist' | 'speed' | 'picture' | 'globe';
  kind: 'monogram' | 'wordmark';
  /** the public path of the file, which the plate's tag prints */
  file: string;
  /** the clean file, inline, in currentColor */
  svg: string;
  /** the viewBox's width over its height */
  aspect: number;
  /** the construction overlay, for the marks of the earlier round */
  construction?: string;
};

type Group = MarkEntry['group'];
type Ground = 'paper' | 'ink';

const GROUPS: readonly { value: Group; label: string }[] = [
  { value: 'shortlist', label: 'Shortlist' },
  { value: 'speed', label: 'Speed' },
  { value: 'picture', label: 'Picture' },
  { value: 'globe', label: 'Globe concepts' },
];

/**
 * The shortlist and the earlier marks under public/marks, drawn inline at
 * the sizes /marks shows them: a monogram from the 16px favicon to the
 * 128px app icon, a wordmark at 48, 96 and 144. The plate opens on the
 * shortlist, each mark cut to its drawn box. Each file is one color in
 * currentColor, so the same file draws positive on paper and reversed on
 * ink with no redraw. The two picture marks of the earlier round carry a
 * construction overlay.
 */
export default function MarksPlate({ entries }: { entries: readonly MarkEntry[] }) {
  const [group, setGroup] = useState<Group>('shortlist');
  const inGroup = entries.filter((e) => e.group === group);
  const [id, setId] = useState(entries[0]?.id ?? '');
  const mark = inGroup.find((e) => e.id === id) ?? inGroup[0];
  const sizes = mark?.kind === 'wordmark' ? WORDMARK_SIZES : MARK_SIZES;
  const [size, setSize] = useState(64);
  const height = sizes.includes(size) ? size : (sizes[Math.min(2, sizes.length - 1)] ?? 64);
  const [ground, setGround] = useState<Ground>('paper');
  const [construction, setConstruction] = useState(false);
  const showConstruction = construction && Boolean(mark?.construction);

  const pickGroup = (next: Group) => {
    setGroup(next);
    const first = entries.find((e) => e.group === next);
    if (first) setId(first.id);
    setConstruction(false);
  };

  if (!mark) return null;
  /* the small sizes at their true size beside the large one: the favicon test */
  const small = mark.kind === 'monogram' ? MARK_SIZES.filter((s) => s <= 32) : [];

  return (
    <Plate
      controls={
        <>
          <Choice label='Family' options={GROUPS} value={group} onChange={pickGroup} />
          <Choice
            label='Mark'
            options={inGroup.map((e) => ({ value: e.id, label: e.name }))}
            value={mark.id}
            onChange={setId}
          />
          <Choice
            label='Height'
            options={sizes.map((s) => ({ value: String(s), label: `${s}px` }))}
            value={String(height)}
            onChange={(v) => setSize(Number(v))}
          />
          <Choice
            label='Ground'
            options={[
              { value: 'paper', label: 'Paper' },
              { value: 'ink', label: 'Ink' },
            ]}
            value={ground}
            onChange={setGround}
          />
          {mark.construction ? (
            <Toggle label='Construction' pressed={showConstruction} onChange={setConstruction} />
          ) : null}
        </>
      }
      height={300}
      label={`${mark.name} at ${height}px on ${ground}`}
      phoneHeight={260}
      stageClassName={`dmo-marks is-${ground}`}
      tag={mark.file}
    >
      <div className='dmo-marks-row'>
        <span
          aria-hidden='true'
          className='dmo-mark'
          dangerouslySetInnerHTML={{ __html: showConstruction && mark.construction ? mark.construction : mark.svg }}
          style={{ width: Math.round(height * mark.aspect), aspectRatio: String(mark.aspect) }}
        />
      </div>
      {small.length > 0 ? (
        <div className='dmo-marks-ladder' aria-hidden='true'>
          {small.map((s) => (
            <span
              className='dmo-mark'
              dangerouslySetInnerHTML={{ __html: mark.svg }}
              key={s}
              style={{ width: Math.round(s * mark.aspect), aspectRatio: String(mark.aspect) }}
            />
          ))}
        </div>
      ) : null}
    </Plate>
  );
}
