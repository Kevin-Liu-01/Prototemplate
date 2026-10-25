'use client';

import { DirectionCorner } from '@/components/viewer/DirectionCorner';

import NotFound from './NotFound';
import ProdFooter from './ProdFooter';
import ProdNav from './ProdNav';

/** The 404 page's body: the shipped nav, the band, the railed footer and the direction corner. */
export default function NotFoundBody() {
  return (
    <>
      <div className='toolchain-root sgdh-root prod-root' id='top'>
        <ProdNav />
        <NotFound />
        <div className='tc-rail'>
          <ProdFooter />
        </div>
      </div>
      <DirectionCorner slug='production' />
    </>
  );
}
