import { Fragment } from 'react';

import { MATERIALS } from '../data';
import { RELIEFS, RELIEF_ORDER } from './reliefs';
import { Block, Course, HEAD_RELIEF_SPAN, Plaque, Relief } from './Wall';

/**
 * textile-block: the materials legend.
 *
 * Ornament home: the legend is where the ornament layer documents itself.
 * One course near the base of the wall that names every cast face and every
 * material the page is built from. Each relief of the library is set as a
 * live two-module region beside its plaque (the name, the building it is
 * drawn from, the geometry, and where the page uses it), so the legend
 * swatch and the wall's relief are the same object and invert together on
 * hover. Under them, the five materials as header chips of their own color
 * with the token that carries each one.
 */
export default function Legend() {
  return (
    <Course className='is-legend' id='materials' label='Materials'>
      <Plaque label='Legend' relief='greca' title='The block library'>
        The cast faces and the materials of the wall. Every course is keyed to one relief. Hover a relief to see it
        inverted.
      </Plaque>
      <Relief className='tb-lg-only' relief='greca' span={HEAD_RELIEF_SPAN} />

      {RELIEF_ORDER.map((id) => {
        const relief = RELIEFS[id];
        return (
          <Fragment key={id}>
            <Relief relief={id} span={{ c: 2, r: 2, cMd: 2, rMd: 2, cSm: 2, rSm: 2 }} />
            <Block className='tb-legend-item' span={{ c: 2, r: 2, cMd: 2, rMd: 2, cSm: 4, rSm: 2 }}>
              <h3>{relief.name}</h3>
              <span className='tb-legend-src'>{relief.source}</span>
              <p className='tb-legend-geo'>{relief.geometry}</p>
              <p className='tb-legend-use'>{relief.use}</p>
            </Block>
          </Fragment>
        );
      })}

      {MATERIALS.map((material) => (
        <Block className='tb-material' key={material.id} span={{ c: 2, r: 1, cMd: 2, cSm: 3 }}>
          <span aria-hidden='true' className={`tb-material-chip is-${material.id}`} />
          <b>{material.name}</b>
          <code>{material.token}</code>
          <span className='tb-material-role'>{material.role}</span>
        </Block>
      ))}
      {/* the bond closes the materials row at each column count */}
      <Relief className='tb-lg-only' relief='bond' span={{ c: 2, r: 1 }} />
      <Relief className='tb-md-only' relief='bond' span={{ c: 6, r: 1 }} />
      <Relief className='tb-sm-only' relief='bond' span={{ c: 3, r: 1 }} />
    </Course>
  );
}
