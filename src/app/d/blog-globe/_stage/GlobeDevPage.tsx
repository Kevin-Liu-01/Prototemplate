import { Suspense } from 'react';

import GlobeDevStage from '@/app/d/blog-globe/_stage/GlobeDevStage';
import GlobeVariants from '@/app/d/blog-globe/_stage/GlobeVariants';
import RoundLinks from '@/app/d/blog-globe/_stage/RoundLinks';
import {
  STAGE_MAIN,
  type GlobeFigures,
  type GlobeRoundKey,
} from '@/app/d/blog-globe/_stage/rounds';

import '@/app/d/blog-globe/_shared/port-compat.css';

/* One round's stage. gt-cloud set it inside the roots and stylesheets the
   blog article sits in; here .globe-root carries that context
   (port-compat.css) and .globe-<round> is the root the round's own
   stylesheets are scoped under, so no round's rules reach another. Every
   round also has its own route, so only that round's stylesheets load. */
export default function GlobeDevPage({
  base,
  round,
  figures,
}: {
  base: string;
  round: GlobeRoundKey;
  figures: GlobeFigures;
}) {
  return (
    <div className={`globe-root globe-${round}`}>
      {/* before the query is read, and without JavaScript, all four show */}
      <Suspense
        fallback={
          <main style={STAGE_MAIN}>
            <RoundLinks base={base} current={round} />
            <GlobeVariants figures={figures} />
          </main>
        }
      >
        <GlobeDevStage base={base} round={round} figures={figures} />
      </Suspense>
    </div>
  );
}
