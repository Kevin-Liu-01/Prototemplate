import { loader } from 'fumadocs-core/source';
import { createElement } from 'react';
import type { ReactElement } from 'react';
import {
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  BeakerIcon,
  BoltIcon,
  BookOpenIcon,
  CameraIcon,
  CheckBadgeIcon,
  CodeBracketIcon,
  CommandLineIcon,
  CubeIcon,
  CubeTransparentIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  EyeIcon,
  FilmIcon,
  FingerPrintIcon,
  GlobeAltIcon,
  GlobeEuropeAfricaIcon,
  InformationCircleIcon,
  LanguageIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  MapIcon,
  NewspaperIcon,
  PaintBrushIcon,
  PhotoIcon,
  PresentationChartBarIcon,
  PuzzlePieceIcon,
  QueueListIcon,
  RectangleGroupIcon,
  RectangleStackIcon,
  RocketLaunchIcon,
  ScaleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Squares2X2Icon,
  SunIcon,
  SwatchIcon,
  TableCellsIcon,
  UserGroupIcon,
  ViewColumnsIcon,
  WindowIcon,
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
  Beaker: () => createElement(BeakerIcon),
  Bolt: () => createElement(BoltIcon),
  Book: () => createElement(BookOpenIcon),
  Brush: () => createElement(PaintBrushIcon),
  Camera: () => createElement(CameraIcon),
  Check: () => createElement(CheckBadgeIcon),
  Code: () => createElement(CodeBracketIcon),
  Columns: () => createElement(ViewColumnsIcon),
  Command: () => createElement(CommandLineIcon),
  Copy: () => createElement(DocumentDuplicateIcon),
  Cube: () => createElement(CubeIcon),
  CubeOpen: () => createElement(CubeTransparentIcon),
  Deck: () => createElement(PresentationChartBarIcon),
  Document: () => createElement(DocumentTextIcon),
  Earth: () => createElement(GlobeEuropeAfricaIcon),
  Eye: () => createElement(EyeIcon),
  Film: () => createElement(FilmIcon),
  Fingerprint: () => createElement(FingerPrintIcon),
  Globe: () => createElement(GlobeAltIcon),
  Info: () => createElement(InformationCircleIcon),
  Language: () => createElement(LanguageIcon),
  Link: () => createElement(LinkIcon),
  Loop: () => createElement(ArrowPathIcon),
  Map: () => createElement(MapIcon),
  Newspaper: () => createElement(NewspaperIcon),
  Pages: () => createElement(RectangleGroupIcon),
  Photo: () => createElement(PhotoIcon),
  Puzzle: () => createElement(PuzzlePieceIcon),
  Queue: () => createElement(QueueListIcon),
  Rocket: () => createElement(RocketLaunchIcon),
  Scale: () => createElement(ScaleIcon),
  Search: () => createElement(MagnifyingGlassIcon),
  Shield: () => createElement(ShieldCheckIcon),
  Sliders: () => createElement(AdjustmentsHorizontalIcon),
  Sparkles: () => createElement(SparklesIcon),
  Squares: () => createElement(Squares2X2Icon),
  Stack: () => createElement(RectangleStackIcon),
  Sun: () => createElement(SunIcon),
  Swatch: () => createElement(SwatchIcon),
  Table: () => createElement(TableCellsIcon),
  Users: () => createElement(UserGroupIcon),
  Window: () => createElement(WindowIcon),
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
