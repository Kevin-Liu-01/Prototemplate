import { loader } from 'fumadocs-core/source';
import { createElement } from 'react';
import type { ReactElement } from 'react';
import {
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  BoltIcon,
  BookOpenIcon,
  CheckBadgeIcon,
  CodeBracketIcon,
  CommandLineIcon,
  CubeIcon,
  DocumentDuplicateIcon,
  GlobeAltIcon,
  GlobeEuropeAfricaIcon,
  InformationCircleIcon,
  LanguageIcon,
  LinkIcon,
  MapIcon,
  PhotoIcon,
  PresentationChartBarIcon,
  PuzzlePieceIcon,
  RocketLaunchIcon,
  RectangleGroupIcon,
  ScaleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Squares2X2Icon,
  SunIcon,
  SwatchIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/solid';

import { docs } from '@/.source/server';

/**
 * The docs site's pages, loaded from the fumadocs-mdx collection
 * (source.config.ts) under /docs. The page tree, the routes, the search
 * index and the agent files all read this one loader.
 *
 * A page's `icon` frontmatter names a Heroicons solid glyph from the
 * list below, the house set for marks that carry meaning; an unknown name
 * draws no icon. fumadocs' own control glyphs (chevrons, search, copy) stay
 * Lucide, which is the landing's rule for controls.
 */
const ICONS: Readonly<Record<string, () => ReactElement>> = {
  Arrows: () => createElement(ArrowsRightLeftIcon),
  Bolt: () => createElement(BoltIcon),
  Book: () => createElement(BookOpenIcon),
  Check: () => createElement(CheckBadgeIcon),
  Code: () => createElement(CodeBracketIcon),
  Command: () => createElement(CommandLineIcon),
  Copy: () => createElement(DocumentDuplicateIcon),
  Cube: () => createElement(CubeIcon),
  Globe: () => createElement(GlobeAltIcon),
  Info: () => createElement(InformationCircleIcon),
  Deck: () => createElement(PresentationChartBarIcon),
  Earth: () => createElement(GlobeEuropeAfricaIcon),
  Language: () => createElement(LanguageIcon),
  Link: () => createElement(LinkIcon),
  Loop: () => createElement(ArrowPathIcon),
  Map: () => createElement(MapIcon),
  Pages: () => createElement(RectangleGroupIcon),
  Photo: () => createElement(PhotoIcon),
  Puzzle: () => createElement(PuzzlePieceIcon),
  Rocket: () => createElement(RocketLaunchIcon),
  Scale: () => createElement(ScaleIcon),
  Shield: () => createElement(ShieldCheckIcon),
  Sparkles: () => createElement(SparklesIcon),
  Squares: () => createElement(Squares2X2Icon),
  Sun: () => createElement(SunIcon),
  Swatch: () => createElement(SwatchIcon),
  Users: () => createElement(UserGroupIcon),
  Wrench: () => createElement(WrenchScrewdriverIcon),
};

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  icon(name) {
    if (name && name in ICONS) return ICONS[name]?.();
  },
});

export type DocsPage = NonNullable<ReturnType<typeof source.getPage>>;
