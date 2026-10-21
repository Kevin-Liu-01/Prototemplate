import { T, Var } from '@/app/d/blog-globe/_shared/i18n';

import {
  GLOBE_VARIANT_KEYS,
  type GlobeFigures,
  type GlobeVariantKey,
} from '@/app/d/blog-globe/_stage/rounds';

/* One round's figures stacked for its dev route, each under a heading that
   links to it alone (?v=a). `only` shows one. */
export default function GlobeVariants({
  figures,
  only,
}: {
  figures: GlobeFigures;
  only?: GlobeVariantKey;
}) {
  const shown: readonly GlobeVariantKey[] = only ? [only] : GLOBE_VARIANT_KEYS;
  return shown.map((key) => (
    <section key={key} style={{ marginBottom: 96 }}>
      <h2 style={{ marginBottom: 24 }}>
        <a href={`?v=${key}`}>
          <T>
            Variant <Var>{key.toUpperCase()}</Var>
          </T>
        </a>
      </h2>
      {figures[key]}
    </section>
  ));
}
