import { serializeJsonLd } from './json-ld';

import type { JsonLdNode } from './json-ld';

/**
 * Renders one `<script type="application/ld+json">` per node. A server
 * component: the nodes are built from registry data at render time, and
 * serializeJsonLd escapes what could close the tag early.
 */
export default function JsonLd({ nodes }: { nodes: readonly JsonLdNode[] }) {
  return (
    <>
      {nodes.map((node, index) => (
        <script
          key={`${node['@type']}-${index}`}
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(node) }}
        />
      ))}
    </>
  );
}
