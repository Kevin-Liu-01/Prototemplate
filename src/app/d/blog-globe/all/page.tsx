import GlobeRounds from '@/app/d/blog-globe/_stage/GlobeRounds';
import RoundLinks from '@/app/d/blog-globe/_stage/RoundLinks';
import { T } from '@/app/d/blog-globe/_shared/i18n';
import { seoRoute } from '@/lib/seo/route';

import '@/app/d/blog-globe/_shared/port-compat.css';

const route = seoRoute({
  path: '/d/blog-globe/all',
  title: 'Blog globe, every round',
  kind: 'direction',
  description:
    'Every round of the four blog globe figures side by side: a row per variant in the review order D, A, B, C and a column per round, each figure live.',
});

export const metadata = route.metadata;

/* Every round of the globe figure's variants side by side, each one live
   in a frame of its own round's route, so no round's stylesheets reach
   another. Only /docs/components/blog-globe and the round stages link here. */
export default function GlobeAllRoundsPage() {
  const base = '/d/blog-globe';
  return (
    <div className='globe-root'>
      <main style={{ maxWidth: 2232, margin: '0 auto', padding: '64px 24px' }}>
        <RoundLinks base={base} current='all' />
        <h1 style={{ marginBottom: 16 }}>
          <T>Every globe round</T>
        </h1>
        <p style={{ marginBottom: 48 }}>
          <T>
            A row per variant in the review&apos;s order, a column per round.
            Every figure is live.
          </T>
        </p>
        <GlobeRounds base={base} />
      </main>
    </div>
  );
}
