'use client';

import { useContext } from 'react';

import { useMountEffect } from '@/components/plate/hooks/use-mount-effect';
import { FieldControllerContext } from '@/components/plate/brand/fieldController';
import type { PictureName } from '@/components/plate/brand/moodPictures';

/**
 * Renders nothing; on mount asks the frame's field for `name`. A step
 * renders it first so the field changes with the step. Does nothing when
 * no field is registered (scene 0, or a frame without a field).
 */
export default function FieldPicture({ name }: { name: PictureName }): null {
  const controller = useContext(FieldControllerContext);

  useMountEffect(() => {
    controller.current?.setPicture(name);
  });

  return null;
}
