import { preload } from 'react-dom';

import { brandFontVariables } from '@/lib/brand-fonts';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';

import AnatomyWall from './AnatomyWall';
import GalleryViewer from './GalleryViewer';
import SystemLedger from './SystemLedger';

import './prototemplate.css';

const route = seoRoute({
  path: '/',
  title: 'Prototemplate',
  kind: 'page',
  description:
    "Prototemplate is Kevin Liu's hub and working wiki for General Translation: the design lab, the brand book, the deck, the handbook, the skills and the docs.",
  source: '',
});

export const metadata = route.metadata;

/** The Katagami faces the first screen opens on (AtlasSheet.tsx), preloaded as Atlas's layout preloads them. */
const FACES = [
  '/fonts/katagami/KatagamiSerif-latin.woff2',
  '/fonts/katagami/KatagamiText-latin.woff2',
  '/fonts/katagami/KatagamiMono-latin.woff2',
];

/**
 * The gallery: a server page that mounts the viewer shell (GalleryViewer, a
 * client component) around the article. The two blocks that must render on
 * the server are passed in as nodes: AnatomyWall reads the capture files
 * from disk, and SystemLedger is static markup that need not ship as
 * client code.
 */
export default function IndexPage() {
  for (const href of FACES) preload(href, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <GalleryViewer
        fontClass={brandFontVariables}
        anatomy={<AnatomyWall />}
        ledger={<SystemLedger />}
      />
    </>
  );
}
