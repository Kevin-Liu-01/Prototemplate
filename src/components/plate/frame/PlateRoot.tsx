'use client';

import { useCallback, useRef, useState } from 'react';
import { preload } from 'react-dom';

import FieldMoodPlate from '@/components/plate/brand/FieldMoodPlate';
import FieldStack, {
  type FieldStackProps,
} from '@/components/plate/brand/FieldStack';
import {
  FieldControllerContext,
  type FieldController,
} from '@/components/plate/brand/fieldController';
import {
  MOOD_PICTURES,
  type PictureName,
} from '@/components/plate/brand/moodPictures';

type PlateRootProps = Pick<FieldStackProps, 'scene' | 'picture'> & {
  children: React.ReactNode;
};

/**
 * The frame's root element and the field behind it. Holds the field's
 * controller in a ref the stack registers into and provides that ref to
 * the content, so a step's FieldPicture leaf can change the picture
 * without a re-render of the frame; the root only follows the picture's
 * name, to print the deck's plate for it in the lower right corner. The
 * plate-root class carries the frame's lengths (brand-tokens.css):
 * --plate-edge, where the field's mask starts, and --plate-column and
 * --plate-pad, which place the column the same distance from the
 * viewport's edge and from the plate edge. From md up the root is the
 * viewport's height, so the foot stays at the frame's bottom and a step
 * taller than the room scrolls inside main (PlateFrame) instead of
 * growing the document under the fixed field; under md the document
 * scrolls as a page does.
 */
export default function PlateRoot({
  scene,
  picture,
  children,
}: PlateRootProps) {
  const controllerRef = useRef<FieldController | null>(null);
  /* The picture the field was last asked for; the plate names it. Scene 0
     has no picture, so no plate, and a frame that moves to scene 0 (the
     gallery) drops the plate with the scene. */
  const [shown, setShown] = useState<PictureName | null>(
    scene === 1 ? (picture ?? null) : null
  );
  const register = useCallback((controller: FieldController | null) => {
    controllerRef.current = controller
      ? {
          setPicture: (name) => {
            controller.setPicture(name);
            setShown(name);
          },
        }
      : null;
  }, []);

  /* The first picture's grid is asked for with the document, so its
     request starts before hydration instead of after it. The stack loads
     the same URL through an Image, which the preload serves. */
  if (scene === 1 && picture) {
    preload(MOOD_PICTURES[picture].src, { as: 'image' });
  }

  return (
    <FieldControllerContext.Provider value={controllerRef}>
      <div className='plate-root bg-background relative flex min-h-svh flex-col overflow-hidden md:h-svh'>
        {/* The stack creates its engine once per mount and reads picture
            only then; the scene picks which engine exists, so a scene
            change is a remount (the development gallery swaps scenes on
            one frame). picture is not part of the key on purpose: it is
            the first picture, and the step's FieldPicture leaf drives the
            picture from then on without restarting the field. */}
        <FieldStack
          key={scene}
          scene={scene}
          picture={picture}
          register={register}
        />
        {children}
        {scene === 1 && shown && <FieldMoodPlate picture={shown} />}
      </div>
    </FieldControllerContext.Provider>
  );
}
