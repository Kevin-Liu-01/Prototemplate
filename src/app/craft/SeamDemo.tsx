'use client';

import { useRef, type CSSProperties } from 'react';

import RevealSeam from '@/app/d/toolchain/sections/RevealSeam';

/**
 * The reveal-seam demo plate — the real component, live. Two full-width
 * layers pinned in one box: the rendered string on top, the served payload
 * beneath, clipped to the seam's boundary so dragging reveals it in place
 * (content never travels a pixel with the handle). The seam writes one CSS
 * custom property on the box; the handle styling here is the same recipe
 * as the toolchain's, rescoped to the plate.
 */
const PAYLOAD = `{
  "hero.title": "Empieza en minutos.",
  "hero.body": "Publica en cada idioma."
}`;

export default function SeamDemo() {
  const box = useRef<HTMLDivElement>(null);
  return (
    <div className='ptc-seam-box' ref={box} style={{ '--seam-cut': '62%' } as CSSProperties}>
      <div className='ptc-seam-main'>
        <span className='ptc-seam-file'>rendered ui</span>
        <p lang='es'>
          Empieza en minutos.
          <br />
          Publica en cada idioma.
        </p>
      </div>
      <div className='ptc-seam-under' aria-hidden='true'>
        <span className='ptc-seam-file'>public/_gt/es.json</span>
        <pre>{PAYLOAD}</pre>
      </div>
      <RevealSeam ariaLabel='Reveal the served translation payload' boxRef={box} defaultCut={62} />
    </div>
  );
}
