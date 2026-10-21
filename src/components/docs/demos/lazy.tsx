'use client';

import dynamic from 'next/dynamic';

/**
 * The plates as the MDX pages import them: each one its own chunk.
 *
 * fumadocs-mdx imports every docs page into the one /docs/[[...slug]]
 * route, so a plate imported directly would put its code and its
 * stylesheets (the engines, flag-icons, the language diagrams' sheet,
 * demos.css) into every docs page's first load. Through next/dynamic a
 * plate's code and CSS load only on a page that renders it. The server
 * still renders each plate, so the HTML holds its markup and its still,
 * and the chunk is preloaded on that page. The fallback below shows only
 * during a client navigation, at about the plate's height, so the page
 * does not shift when the chunk lands.
 */
function slot(height: number) {
  function PlateSlot() {
    return <div aria-hidden='true' style={{ height, margin: '24px 0 12px' }} />;
  }
  return PlateSlot;
}

export const BadgeCycleDemo = dynamic(() => import('./BadgeCycleDemo'), { loading: slot(330) });
export const BayerTiersDemo = dynamic(() => import('./BayerTiersDemo'), { loading: slot(390) });
export const BlogGlobeDemo = dynamic(() => import('./BlogGlobeDemo'), { loading: slot(760) });
export const ConnectorDemo = dynamic(() => import('./ConnectorDemo'), { loading: slot(470) });
export const DitherGlobeDemo = dynamic(() => import('./DitherGlobeDemo'), { loading: slot(500) });
export const DitherLoopDemo = dynamic(() => import('./DitherLoopDemo'), { loading: slot(480) });
export const DitheredMarkDemo = dynamic(() => import('./DitheredMarkDemo'), { loading: slot(400) });
export const DoubledLineDemo = dynamic(() => import('./DoubledLineDemo'), { loading: slot(440) });
export const EdgeGlobeDemo = dynamic(() => import('./EdgeGlobeDemo'), { loading: slot(430) });
export const EverySentenceDemo = dynamic(() => import('./EverySentenceDemo'), { loading: slot(330) });
export const GlyphFieldDemo = dynamic(() => import('./GlyphFieldDemo'), { loading: slot(440) });
export const GtWordDemo = dynamic(() => import('./GtWordDemo'), { loading: slot(330) });
export const HeadFrameDemo = dynamic(() => import('./HeadFrameDemo'), { loading: slot(540) });
export const HorizonFieldDemo = dynamic(() => import('./HorizonFieldDemo'), { loading: slot(480) });
export const InkFieldDemo = dynamic(() => import('./InkFieldDemo'), { loading: slot(380) });
export const IsoKitDemo = dynamic(() => import('./IsoKitDemo'), { loading: slot(450) });
export const LangDiagramDemo = dynamic(() => import('./LangDiagramDemo'), { loading: slot(500) });
export const LocaleTagDemo = dynamic(() => import('./LocaleTagDemo'), { loading: slot(400) });
export const MarksPlate = dynamic(() => import('./MarksPlate'), { loading: slot(500) });
export const PrismaticFieldDemo = dynamic(() => import('./PrismaticFieldDemo'), { loading: slot(420) });
export const RevealSeamDemo = dynamic(() => import('./RevealSeamDemo'), { loading: slot(330) });
export const StudioFieldDemo = dynamic(() => import('./StudioFieldDemo'), { loading: slot(440) });
