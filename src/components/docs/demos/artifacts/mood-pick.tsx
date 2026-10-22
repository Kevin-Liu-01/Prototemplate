'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

import { pictureField, type PictureTone } from '@/components/plate/lib/picture-field';
import { ditherToCanvas } from '@/lib/dither';

import { Choice } from '../controls';
import { MOOD_ENTRIES, nameLabel, placementOf, type MoodEntry, type MoodSet } from './pictures';

const SETS: readonly { value: MoodSet; label: string }[] = [
  { value: 'plate', label: 'Plate' },
  { value: 'deck', label: 'Deck' },
];

/**
 * The picture picker both mood plates share: the set (the plate's five
 * grids or the deck's ten) and a picture in it. A set change keeps the
 * picture when the other set has one of that name.
 */
export function useMoodPick(initial: { set: MoodSet; name: string }): { entry: MoodEntry; controls: ReactNode } {
  const [set, setSet] = useState<MoodSet>(initial.set);
  const [name, setName] = useState(initial.name);
  const entries = MOOD_ENTRIES[set];
  const entry = entries.find((e) => e.name === name) ?? entries[0];
  if (!entry) throw new Error('the mood picture sets are empty');

  const switchSet = (next: MoodSet) => {
    setSet(next);
    if (!MOOD_ENTRIES[next].some((e) => e.name === name)) setName(MOOD_ENTRIES[next][0]?.name ?? name);
  };

  const controls = (
    <>
      <Choice label='Set' options={SETS} value={set} onChange={switchSet} />
      <Choice
        label='Picture'
        options={entries.map((e) => ({ value: e.name, label: nameLabel(e.name) }))}
        value={entry.name}
        onChange={setName}
      />
    </>
  );
  return { entry, controls };
}

/**
 * Screens one tone grid into a canvas of `w` by `h` CSS px: the plate
 * port's picture sampler (picture-field.ts) placed as `placementOf` says,
 * through the 8x8 Bayer screen of src/lib/dither.ts at `cell` CSS px a
 * cell, gamma 1 and bias 0. A lit cell is `ink`; an unlit one is clear, so
 * the pane's ground shows. The canvas's own opacity sets the ink's alpha.
 */
export function screenPicture(
  canvas: HTMLCanvasElement,
  tone: PictureTone,
  entry: MoodEntry,
  w: number,
  h: number,
  cell: number,
  ink: string
): void {
  const field = pictureField(tone, {
    placement: placementOf(entry, w, h),
    canvasWidth: w,
    canvasHeight: h,
    cellSize: cell,
  });
  ditherToCanvas(canvas, field, { scale: cell, ink, paper: 'transparent', cssWidth: w, cssHeight: h });
}
