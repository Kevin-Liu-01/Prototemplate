'use client';

import { useRef } from 'react';

import { useMountEffect } from '@/components/plate/hooks/use-mount-effect';
import { createStudioField } from '@/components/plate/lib/studio-field';
import { cn } from '@/components/plate/lib/utils';

type FieldGroundProps = {
  /**
   * `ground` masks the field so it stays faint on the left, where a plate
   * sits, and fills in to the right; `band` fades it the same way inside a
   * short block. Both take the field's own opacity from `.brand-field`.
   */
  variant?: 'ground' | 'band';
  className?: string;
};

/**
 * The landing hero's field, in the app: the studio's bayer-8x8 material
 * (flow clouds through the 8 by 8 screen at near-grain cells, the blue
 * family on ink), drawn by the same engine through one shared WebGL
 * context. The canvas fills its parent and the `.brand-field` rules from
 * brand-tokens.css do the rest, exactly as the hero does it: 0.55 opacity,
 * a horizontal mask, and the light theme inverting the canvas so the
 * clouds print pale blue on paper. Without WebGL nothing draws and the
 * paper shows. The engine owns the loop, the resize and the reduced-motion
 * still, so destroy() is the only cleanup.
 */
export default function FieldGround({
  variant = 'ground',
  className,
}: FieldGroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useMountEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const field = createStudioField(canvas, { preset: 'bayer8' });
    return field ? () => field.destroy() : undefined;
  });

  return (
    <div className={cn('brand-field-host', className)} aria-hidden='true'>
      <canvas
        ref={canvasRef}
        className={cn('brand-field', `brand-field-${variant}`)}
        data-testid='brand-field'
      />
    </div>
  );
}
