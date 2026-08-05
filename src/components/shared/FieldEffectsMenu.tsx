'use client';

import type { PrismaticEffectMode } from '@/lib/prismatic-field';

import './field-effects-menu.css';

export type FieldEffectsMenuProps = {
  modes: readonly PrismaticEffectMode[];
  selected: PrismaticEffectMode | 'off';
  onSelect: (mode: PrismaticEffectMode | 'off') => void;
  /** null = pointer left the chips; restore the committed mode. */
  onPreview: (mode: PrismaticEffectMode | 'off' | null) => void;
  className?: string;
};

/**
 * The singularity's instrument panel: a quiet row of square hairline chips
 * docked at the field's bottom-right — the available cursor effects, then
 * off. Click commits (the mount persists it); hovering or focusing a chip
 * live-previews that mode without committing. Mono 11px on the dark plate's
 * own hairline values; it reads as part of the plate's chrome, not a toy.
 */
export default function FieldEffectsMenu({
  modes,
  selected,
  onSelect,
  onPreview,
  className,
}: FieldEffectsMenuProps) {
  const options: readonly (PrismaticEffectMode | 'off')[] = [...modes, 'off'];
  return (
    <div className={className ? `fxm ${className}` : 'fxm'} role='group' aria-label='Cursor effect'>
      <span className='fxm-k' aria-hidden='true'>
        fx
      </span>
      {options.map((mode) => (
        <button
          key={mode}
          type='button'
          className='fxm-chip'
          aria-pressed={selected === mode}
          onClick={() => onSelect(mode)}
          onPointerEnter={() => onPreview(mode)}
          onPointerLeave={() => onPreview(null)}
          onFocus={() => onPreview(mode)}
          onBlur={() => onPreview(null)}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}
