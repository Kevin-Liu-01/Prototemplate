import type { Metadata } from 'next';

import DeckStage, { readDeckSlides } from './DeckStage';
import DeckViewer from './DeckViewer';
import { deckSections, slideTitles } from './sections';

export const metadata: Metadata = {
  title: { absolute: 'GT brand deck' },
  description:
    'The General Translation brand in 52 slides: thesis, values, writing style, mark, color, type, line rules, dither, motion, the shipped site and every public surface, docs, blog, content rules, prototemplate, glyphfield, and current status.',
  // declared per-route so the browser stops probing the app-wide /favicon.ico
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * The brand deck, native on the viewer shell. The slide markup is read here
 * on the server, once, and handed both to the stage (as HTML) and to the
 * viewer (as the section list built from the slide headings).
 */
export default function DeckPage() {
  const html = readDeckSlides();
  const sections = deckSections(slideTitles(html));
  return (
    <DeckViewer sections={sections}>
      <DeckStage html={html} />
    </DeckViewer>
  );
}
