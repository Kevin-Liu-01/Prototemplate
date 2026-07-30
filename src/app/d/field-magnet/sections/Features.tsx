import FeatureBento, { type FeatureBentoItem } from '@/components/shared/FeatureBento';
import PrismaticField from '@/components/shared/PrismaticField';

import {
  AgentDiffArtifact,
  CodeWrapArtifact,
  ConfigArtifact,
  EdgeArtifact,
  GlossaryArtifact,
  PreviewArtifact,
  RoutingArtifact,
  RuntimeChatArtifact,
} from '../components/BentoArtifacts';

/**
 * Act V — the platform grid, laid out as an actual bento rather than eight
 * identical tiles.
 *
 * The stylesheet puts the first two cells on a half-width span across the top
 * row and the remaining six on thirds below, so the grid has a scan order: the
 * two ideas that carry the product, then the six modules that support them.
 *
 * Every cell's drawing is a real artifact (BentoArtifacts.tsx) — actual code,
 * an actual unified diff, real glossary rows, real locale paths, measured edge
 * timings, real translated strings — never a wireframe stand-in.
 */
const ITEMS: FeatureBentoItem[] = [
  {
    key: 'code',
    category: 'Libraries',
    title: 'Code',
    body: 'Developer-first libraries for React, Next.js, and more, battle-tested in production apps with millions of users. Wrap a component; ship it in every language.',
    diagram: <CodeWrapArtifact />,
  },
  {
    key: 'translation',
    category: 'AI',
    title: 'Translation',
    body: 'AI agents that read your project structure and localize content in context — tone, terminology and regional nuance intact, not string-by-string.',
    diagram: <AgentDiffArtifact />,
  },
  {
    key: 'context',
    category: 'Platform',
    title: 'Context',
    body: 'Glossaries, locale rules, and custom prompts.',
    diagram: <GlossaryArtifact />,
  },
  {
    key: 'routing',
    category: 'Middleware',
    title: 'Routing',
    body: 'Language detection and SEO-friendly locale paths, with zero configuration.',
    diagram: <RoutingArtifact />,
  },
  {
    key: 'delivery',
    category: 'Edge',
    title: 'Delivery',
    body: 'A global translation CDN. Push over-the-air updates without redeploying.',
    diagram: <EdgeArtifact />,
  },
  {
    key: 'previews',
    category: 'Dashboard',
    title: 'Previews',
    body: 'See translations in development before they go live.',
    diagram: <PreviewArtifact />,
  },
  {
    key: 'runtime',
    category: 'Runtime',
    title: 'Live Translation',
    body: 'Translate user-generated content on demand, with full context.',
    diagram: <RuntimeChatArtifact />,
  },
  {
    key: 'config',
    category: 'Config',
    title: 'Customization',
    body: 'Your own detection functions, locale components, and formatting logic.',
    diagram: <ConfigArtifact />,
  },
];

export default function Features() {
  return (
    <div className='fm-featzone'>
      {/* The act's material moment (DESIGN_STANDARD §3.4 / §4 surface cadence):
          a dimmed full-bleed prismatic band armatures the anchor row — the
          wrap→diff pair, the page's meaning-charged transformation — the way
          oxc floods its transformer band. Stopped well down so the plates stay
          the brightest objects; the light lives in the seams around them. */}
      <div className='fm-feat-light' aria-hidden>
        <PrismaticField
          className='fm-feat-prism'
          preset='1'
          speed={0.35}
          params={{ exposureScale: 3600, fieldDetailScale: 2.9 }}
        />
      </div>
      <FeatureBento
        className='fm-features'
        id='features'
        heading='Everything between your repo and your next billion users'
        subheading='Eight modules, one pipeline: libraries, context, agents, routing, edge delivery, previews, runtime, and config.'
        items={ITEMS}
        columns={3}
      />
    </div>
  );
}
