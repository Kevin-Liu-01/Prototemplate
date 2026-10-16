import { loader } from 'fumadocs-core/source';
import { createElement } from 'react';
import type { ReactElement } from 'react';
import {
  BookOpenIcon,
  CheckBadgeIcon,
  CodeBracketIcon,
  CommandLineIcon,
  DocumentDuplicateIcon,
  GlobeAltIcon,
  PresentationChartBarIcon,
  RectangleGroupIcon,
  SparklesIcon,
  SwatchIcon,
} from '@heroicons/react/20/solid';

import { docs } from '@/.source/server';

/**
 * The docs site's pages, loaded from the fumadocs-mdx collection
 * (source.config.ts) under /docs. The page tree, the routes, the search
 * index and the agent files all read this one loader.
 *
 * A page's `icon` frontmatter names a Heroicons 20 solid glyph from the
 * list below, the house set for marks that carry meaning; an unknown name
 * draws no icon. fumadocs' own control glyphs (chevrons, search, copy) stay
 * Lucide, which is the landing's rule for controls.
 */
const ICONS: Readonly<Record<string, () => ReactElement>> = {
  Book: () => createElement(BookOpenIcon),
  Check: () => createElement(CheckBadgeIcon),
  Code: () => createElement(CodeBracketIcon),
  Command: () => createElement(CommandLineIcon),
  Copy: () => createElement(DocumentDuplicateIcon),
  Globe: () => createElement(GlobeAltIcon),
  Deck: () => createElement(PresentationChartBarIcon),
  Pages: () => createElement(RectangleGroupIcon),
  Sparkles: () => createElement(SparklesIcon),
  Swatch: () => createElement(SwatchIcon),
};

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  icon(name) {
    if (name && name in ICONS) return ICONS[name]?.();
  },
});

export type DocsPage = NonNullable<ReturnType<typeof source.getPage>>;
