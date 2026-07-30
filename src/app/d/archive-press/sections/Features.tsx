import FeatureBento, { type FeatureBentoItem } from '@/components/shared/FeatureBento';
import CodeWrapDiagram from '@/components/shared/diagrams/CodeWrapDiagram';
import ConfigSlidersDiagram from '@/components/shared/diagrams/ConfigSlidersDiagram';
import EdgeDeliveryDiagram from '@/components/shared/diagrams/EdgeDeliveryDiagram';
import GlossaryDiagram from '@/components/shared/diagrams/GlossaryDiagram';
import PreviewPanesDiagram from '@/components/shared/diagrams/PreviewPanesDiagram';
import RoutingTreeDiagram from '@/components/shared/diagrams/RoutingTreeDiagram';
import RuntimeSwapDiagram from '@/components/shared/diagrams/RuntimeSwapDiagram';
import TranslationFlowDiagram from '@/components/shared/diagrams/TranslationFlowDiagram';

/**
 * Two columns, not four. The cells run as wide as the light band in the hero,
 * so each drawing is given roughly twice its usual size — which means the
 * strokes have to be thinned back down to a hairline to keep the weight right.
 *
 * Every cell is a heading and its drawing. The shared bento's `category` slot
 * is the eyebrow this direction refuses to print, so the word it used to carry
 * is folded into the heading instead ("Libraries" + "Code" → "Code libraries")
 * and the slot is left empty; the stylesheet drops the empty node.
 */
const HAIRLINE = { strokeWidth: 0.8, accentStrokeWidth: 0.95 };

const ITEMS: FeatureBentoItem[] = [
  {
    key: 'code',
    category: '',
    title: 'Code libraries',
    body: 'Developer-first libraries for React, Next.js, and more, battle-tested in production apps with millions of users.',
    diagram: <CodeWrapDiagram {...HAIRLINE} />,
  },
  {
    key: 'context',
    category: '',
    title: 'Context and glossaries',
    body: 'Glossaries, locale rules, and custom prompts. Control tone, terminology, and regional nuance.',
    diagram: <GlossaryDiagram {...HAIRLINE} />,
  },
  {
    key: 'translation',
    category: '',
    title: 'AI translation',
    body: 'AI agents that understand your project structure and localize your content in context.',
    diagram: <TranslationFlowDiagram {...HAIRLINE} />,
  },
  {
    key: 'routing',
    category: '',
    title: 'Locale routing',
    body: 'Automatic language detection and locale-based routing. SEO-friendly paths with zero configuration.',
    diagram: <RoutingTreeDiagram {...HAIRLINE} />,
  },
  {
    key: 'delivery',
    category: '',
    title: 'Edge delivery',
    body: 'A global, low-latency translation CDN. Push over-the-air updates without redeploying your app.',
    diagram: <EdgeDeliveryDiagram {...HAIRLINE} />,
  },
  {
    key: 'previews',
    category: '',
    title: 'Preview builds',
    body: 'Preview translations in development before they go live. Catch issues early and ship with confidence.',
    diagram: <PreviewPanesDiagram {...HAIRLINE} />,
  },
  {
    key: 'runtime',
    category: '',
    title: 'Live translation',
    body: 'Translate user-generated content on demand, with low latency and full context.',
    diagram: <RuntimeSwapDiagram {...HAIRLINE} />,
  },
  {
    key: 'config',
    category: '',
    title: 'Custom configuration',
    body: 'Build your own language detection functions, locale-specific components, and formatting logic.',
    diagram: <ConfigSlidersDiagram {...HAIRLINE} />,
  },
];

/** Act V — the platform in eight modules, drawn wide. */
export default function Features() {
  return (
    <FeatureBento
      className='ap-features'
      id='features'
      columns={2}
      items={ITEMS}
      heading='Everything behind the gate'
      subheading='Eight modules, 118 locales, one path from your repository to every user.'
    />
  );
}
