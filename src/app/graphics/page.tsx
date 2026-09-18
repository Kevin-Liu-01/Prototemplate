import type { Metadata } from 'next';

import { getGraphicsBlocks } from '@/lib/graphics';

import GraphicsViewer from './GraphicsViewer';

export const metadata: Metadata = {
  title: 'Graphics',
  description:
    'Every illustration of the docs series on the viewer shell: one row per image with every version it ships in, the covers and social cards, the contact sheets, the glyphfield grounds and the figures of the earlier posts, read as a book or seen as a grid.',
  icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
};

/**
 * /graphics: the authoritative set. The blocks are read on the server
 * (the manifest the generator writes, the exports, the grounds, the
 * sheets, the earlier posts) and handed to the viewer, which opens the
 * book at its head with every image in the list on the left.
 */
export default function GraphicsPage() {
  return <GraphicsViewer blocks={getGraphicsBlocks()} />;
}
