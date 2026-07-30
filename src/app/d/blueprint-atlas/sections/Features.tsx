'use client';

import { cloneElement, isValidElement } from 'react';

import FeatureBento, { DEFAULT_FEATURE_BENTO_ITEMS } from '@/components/shared/FeatureBento';
import PrismaticField from '@/components/shared/PrismaticField';
import type { DiagramProps } from '@/components/shared/diagrams/DiagramFrame';

/* Three changes to the shared items, all made from this direction's own scope.

   `category` is the eyebrow Section G forbids above a title, so it is emptied.

   The drawings are re-instantiated at this sheet's pen weights: the frame
   writes --gtd-stroke as an inline style, so weight cannot be skinned through
   CSS and has to come through the props the frame exposes. The drawings now
   span their full drafting frame, so no scale is applied — scaling would crop
   the artifact.

   And the Delivery cell is the grid's one second-material moment (§3.4): the
   CDN rail rides an inset prismatic crop — light travelling the edge is what
   the diagram is about — dimmed under the marks and masked so the labels sit
   on the dark side of the light. Every other cell stays flat ink-on-dark, so
   the eight-panel stretch carries exactly one material shift, oxc-style. */
const ITEMS = DEFAULT_FEATURE_BENTO_ITEMS.map((item) => {
  const diagram = isValidElement<DiagramProps>(item.diagram)
    ? cloneElement(item.diagram, { strokeWidth: 1.3, accentStrokeWidth: 1.7 })
    : item.diagram;
  if (item.key === 'delivery') {
    return {
      ...item,
      category: '',
      diagram: (
        <div className='ba-prism-mock'>
          <PrismaticField
            className='ba-prism-mock-field'
            preset='1'
            speed={0.55}
            params={{ exposureScale: 1050 }}
          />
          {diagram}
        </div>
      ),
    };
  }
  return { ...item, category: '', diagram };
});

/** Act V — the platform, drafted as eight modules on one sheet.
 *
 * The band is the page's second material moment (§3.4, oxc d06): a full-bleed
 * prismatic field runs the whole section and the eight-panel plate floats on
 * it — dark flat panels ON light, not eight identical slabs on flat black.
 * The mask banks the light to the band's right and flanks so the heading and
 * the cell copy keep their dark ground. */
export default function Features() {
  return (
    <div className='ba-features-band'>
      <PrismaticField
        className='ba-features-band-field'
        preset='1'
        speed={0.5}
        params={{ exposureScale: 430 }}
      />
      <FeatureBento
        className='ba-features'
        id='docs'
        heading='Language infrastructure, drafted end to end'
        subheading='Eight modules, 118 locales, one pipeline from your repo to every user.'
        items={ITEMS}
      />
    </div>
  );
}
