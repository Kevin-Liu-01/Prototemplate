'use client';

import { useState } from 'react';

import StudioField from '@/components/shared/StudioField';
import { BAYER_DEFAULT_ID, BAYER_PRESETS } from '@/lib/studio-field';

/**
 * The authentic Bayer family, switchable — the codified BAYER_PRESETS
 * roster on one plate. Switching is a remount (the house pattern): the
 * field is keyed per variant, so the outgoing engine's destroy() always
 * runs before the incoming one draws, on the library's one shared GL
 * context. The chip strip echoes the hero review rig's ladder grammar:
 * mono indices on an opaque ground, the active row the only color.
 */
export default function BayerDemo() {
  const [id, setId] = useState(BAYER_DEFAULT_ID);
  const active = BAYER_PRESETS.find((v) => v.id === id) ?? BAYER_PRESETS[0];
  if (!active) return null;
  return (
    <>
      <StudioField className='ptc-plate-field' key={active.id} preset={active.preset} />
      <div aria-label='Bayer family variant' className='ptc-bayer-strip' role='group'>
        {BAYER_PRESETS.map((v) => (
          <button
            className='ptc-bayer-chip'
            data-on={v.id === id}
            key={v.id}
            type='button'
            onClick={() => setId(v.id)}
          >
            <i>{v.id}</i>
            {v.id === id ? <span>{v.name}</span> : null}
          </button>
        ))}
      </div>
    </>
  );
}
