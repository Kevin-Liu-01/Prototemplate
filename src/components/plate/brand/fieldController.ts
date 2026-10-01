import { createContext, type RefObject } from 'react';

import type { PictureName } from '@/components/plate/brand/moodPictures';

/**
 * The scene 1 field's control surface. `setPicture` makes `name` the
 * field's target: the same name as the current target is a no-op; before
 * the first render the target is replaced with no mix; otherwise the
 * field mixes to it over 150 ms, and a call mid-mix restarts from the
 * frame on screen.
 */
export type FieldController = { setPicture: (name: PictureName) => void };

/**
 * The frame provides a ref the field fills while mounted; `current` is
 * null on scene 0, before the field mounts, and after it unmounts.
 */
export const FieldControllerContext = createContext<
  RefObject<FieldController | null>
>({ current: null });
