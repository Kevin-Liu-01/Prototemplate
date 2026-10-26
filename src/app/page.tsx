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

/**
 * The gallery: a server page that mounts the viewer shell (GalleryViewer, a
 * client component) around the article. The two blocks that must render on
 * the server are passed in as nodes: AnatomyWall reads the capture files
 * from disk, and SystemLedger is static markup that need not ship as
 * client code.
 */
export default function IndexPage() {
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
