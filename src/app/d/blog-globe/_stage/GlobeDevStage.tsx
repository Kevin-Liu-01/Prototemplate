'use client';

import { useRef, type ReactNode } from 'react';
import { T } from '@/app/d/blog-globe/_shared/i18n';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMountEffect } from '@/lib/use-mount-effect';

import GlobeVariants from '@/app/d/blog-globe/_stage/GlobeVariants';
import RoundLinks from '@/app/d/blog-globe/_stage/RoundLinks';
import {
  EMBED_ASK,
  EMBED_HEIGHT,
  GLOBE_VARIANT_KEYS,
  STAGE_MAIN,
  type EmbedAsk,
  type EmbedHeight,
  type GlobeFigures,
  type GlobeRoundKey,
  type GlobeVariantKey,
} from '@/app/d/blog-globe/_stage/rounds';

const readVariant = (value: string | null): GlobeVariantKey | undefined =>
  GLOBE_VARIANT_KEYS.find((key) => key === value?.toLowerCase());

/* A round's dev stage: ?v=a|b|c|d shows that variant alone, anything else
   all four. With ?v and ?embed=1 the figure shows alone, with no links,
   headings or padding, for the frames of /d/blog-globe/all and the docs.
   The page renders statically, so the query is read here on the client. */
export default function GlobeDevStage({
  base,
  round,
  figures,
}: {
  base: string;
  round: GlobeRoundKey;
  figures: GlobeFigures;
}) {
  const query = useSearchParams();
  const only = readVariant(query.get('v'));
  const pathname = usePathname();
  if (only && query.get('embed') === '1') {
    return <GlobeEmbed>{figures[only]}</GlobeEmbed>;
  }
  return (
    <main style={STAGE_MAIN}>
      <RoundLinks base={base} current={round} />
      {only ? (
        <p style={{ marginBottom: 32 }}>
          <a href={pathname}>
            <T>Show every variant</T>
          </a>
        </p>
      ) : null}
      <GlobeVariants figures={figures} only={only} />
    </main>
  );
}

/* The embedded figure reports its height to the frame's parent, which
   sizes the frame to it, so the frame never scrolls. It reports on mount,
   on every resize and whenever the parent asks: either page can hydrate
   first. flow-root keeps the figure's margins inside the measured box, and
   port-compat.css sets them to 0 here, where the page around the frame
   spaces it. */
function GlobeEmbed({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useMountEffect(() => {
    const node = ref.current;
    const parent = window.parent;
    if (!node || parent === window) return;
    const report = () => {
      const message: EmbedHeight = {
        type: EMBED_HEIGHT,
        height: Math.ceil(node.getBoundingClientRect().height),
      };
      parent.postMessage(message, window.location.origin);
    };
    const onAsk = (event: MessageEvent<Partial<EmbedAsk> | null>) => {
      if (event.source !== parent) return;
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === EMBED_ASK) report();
    };
    const observer = new ResizeObserver(report);
    observer.observe(node);
    window.addEventListener('message', onAsk);
    /* the frame never scrolls: its parent sizes it (port-compat.css) */
    document.documentElement.dataset.globeEmbed = '';
    return () => {
      observer.disconnect();
      window.removeEventListener('message', onAsk);
      delete document.documentElement.dataset.globeEmbed;
    };
  });
  return (
    <main ref={ref} className='globe-embed' style={{ display: 'flow-root' }}>
      {children}
    </main>
  );
}
