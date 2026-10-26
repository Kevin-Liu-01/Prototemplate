import { closeSync, existsSync, openSync, readFileSync, readSync } from 'node:fs';
import { join } from 'node:path';

import type { LibraryBlock, LibraryEntry, LibraryShot } from '@/lib/component-library-model';
import { pad2 } from '@/lib/shell-data';

/**
 * The set behind /components, read on the server at build time. The
 * documented components come from the docs Components section
 * (content/docs/components): its groups in the order of its meta.json, each
 * group's pages in the order of theirs, and in each page every h2 section
 * that mounts a plate. One section is one entry, linked to its heading on
 * the docs page. SOURCES names the export and the file each entry shows; a
 * section missing from it falls back to the plate's own file. The preview
 * is the plate's stage as scripts/check/capture-components.mjs shot it in
 * both themes, under public/shots/components/<page>-<heading id>.webp.
 *
 * UNDOCUMENTED lists the reusable components under src/components that no
 * docs page covers yet. An entry drops out on its own once a Components
 * page names its path.
 */

const ROOT = process.cwd();
const DOCS = join(ROOT, 'content/docs/components');
const SHOTS = join(ROOT, 'public/shots/components');
const SHOT_URL = '/shots/components';

/** The export and the file a section shows, by `<page>#<heading id>`, with a name where the heading reads as a sentence. */
const SOURCES: Readonly<Record<string, { code: string; path: string; name?: string }>> = {
  'dither#the-ordered-screen': { code: 'BAYER_8', path: 'src/lib/dither.ts' },
  'dither#the-dither-loop': { code: 'createDitherLoop', path: 'src/lib/dither.ts' },
  'dither#the-studio-field': { code: 'StudioField', path: 'src/components/shared/StudioField.tsx' },
  'fields#the-horizon-field': { code: 'createHorizonField', path: 'src/lib/horizon-field.ts' },
  'fields#the-prismatic-field': { code: 'PrismaticField', path: 'src/components/shared/PrismaticField.tsx' },
  'glyph-field#the-glyph-field': { code: 'createGlyphField', path: 'src/lib/glyph-field.ts' },
  'glyph-field#the-ink-field': { code: 'createInkField', path: 'src/app/d/glyph-rain/sections/band/inkField.ts' },
  'dither-lab#eight-screens-on-one-source': { code: 'screenTone', path: 'src/components/docs/demos/dither-lab/screens.ts', name: 'Screen bench' },
  'dither-lab#error-diffusion-one-cell-at-a-time': { code: 'DiffusionStepDemo', path: 'src/components/docs/demos/dither-lab/DiffusionStepDemo.tsx', name: 'Error diffusion' },
  'dither-lab#screens-in-motion': { code: 'ShimmerDemo', path: 'src/components/docs/demos/dither-lab/ShimmerDemo.tsx' },
  'dither-type#words-in-the-house-face': { code: 'textShape', path: 'src/components/docs/demos/dither-lab/shapes.ts', name: 'Dithered words' },
  'dither-type#a-mark-through-the-tiers': { code: 'markShape', path: 'src/components/docs/demos/dither-lab/shapes.ts', name: 'Mark through the tiers' },
  'dither-type#a-glyph-screen': { code: 'GlyphScreenDemo', path: 'src/components/docs/demos/dither-lab/GlyphScreenDemo.tsx', name: 'Glyph screen' },
  'dither-motion#tone-mix': { code: 'mixFields', path: 'src/lib/dither.ts' },
  'dither-motion#a-lens-over-the-screen': { code: 'ScreenLensDemo', path: 'src/components/docs/demos/dither-lab/ScreenLensDemo.tsx', name: 'Screen lens' },
  'dither-motion#a-brush-that-paints-in-cells': { code: 'DitherBrushDemo', path: 'src/components/docs/demos/dither-lab/DitherBrushDemo.tsx', name: 'Dither brush' },
  'lines#the-doubled-line': { code: 'DoubledLine', path: 'src/components/shared/diagrams/DoubledLine.tsx' },
  'lines#the-connector-in-production': { code: 'TranslationFlow', path: 'src/app/d/toolchain/diagrams/TranslationFlow.tsx', name: 'Connector' },
  'iso#the-kit': { code: 'IsoBox', path: 'src/app/d/toolchain/diagrams/iso.ts', name: 'Isometric kit' },
  'globes#the-edge-globe': { code: 'EdgeGlobe', path: 'src/app/d/toolchain/diagrams/EdgeGlobe.tsx' },
  'globes#the-globe-field': { code: 'globe', path: 'src/lib/dither.ts' },
  'globes#the-blog-globe-figures': { code: 'GlobeFrame', path: 'src/components/blog-globe/GlobeFrame.tsx' },
  'blog-globe#the-rounds': { code: 'GlobeGrid', path: 'src/components/blog-globe/GlobeGrid.tsx', name: 'Globe rounds' },
  'blog-globe#the-dot-globe-d': { code: 'GlobeFigure', path: 'src/components/blog-globe/GlobeFigure.tsx' },
  'blog-globe#the-dithered-globe-a': { code: 'GlobeFigure', path: 'src/components/blog-globe/GlobeFigure.tsx' },
  'blog-globe#the-line-globe-b': { code: 'GlobeFigure', path: 'src/components/blog-globe/GlobeFigure.tsx' },
  'blog-globe#the-glyph-globe-c': { code: 'GlobeFigure', path: 'src/components/blog-globe/GlobeFigure.tsx' },
  'three-scenes#the-extruded-mark': { code: 'buildMarkScene', path: 'src/components/docs/demos/2d-3d/mark-scene.ts' },
  'three-scenes#the-lit-globe': { code: 'buildEarthScene', path: 'src/components/docs/demos/2d-3d/earth-scene.ts' },
  'three-scenes#the-pipeline-stack': { code: 'buildStackScene', path: 'src/components/docs/demos/2d-3d/stack-scene.ts' },
  'canvas-2d#the-smoke-rake': { code: 'createFlowField', path: 'src/components/docs/demos/2d-3d/flow-field.ts' },
  'canvas-2d#contours-and-hachures': { code: 'createContours', path: 'src/components/docs/demos/2d-3d/contours.ts' },
  'canvas-2d#glyph-rain': { code: 'createGlyphRain', path: 'src/components/docs/demos/2d-3d/glyph-rain.ts' },
  'canvas-2d#the-dither-pad': { code: 'createDitherPad', path: 'src/components/docs/demos/2d-3d/dither-pad.ts' },
  'controls#the-toolbar': { code: 'Toolbar', path: 'src/components/viewer/Toolbar.tsx' },
  'controls#the-segmented-switch': { code: 'Seg', path: 'src/components/viewer/Seg.tsx' },
  'controls#tool-buttons': { code: 'ToolButton', path: 'src/components/viewer/ToolButton.tsx' },
  'controls#the-install-field': { code: 'InstallField', path: 'src/components/viewer/InstallField.tsx' },
  'navigation#the-search-palette': { code: 'Search', path: 'src/components/viewer/Search.tsx' },
  'navigation#the-list-filter': { code: 'SidebarFilter', path: 'src/components/viewer/SidebarFilter.tsx' },
  'navigation#the-language-selector': { code: 'LanguageSelector', path: 'src/app/d/production/sections/LanguageSelector.tsx' },
  'navigation#the-help-card-and-the-toast': { code: 'HelpCard', path: 'src/components/viewer/HelpCard.tsx' },
  'navigation#the-index-panel': { code: 'IndexPanel', path: 'src/components/viewer/IndexPanel.tsx' },
  'kinetic#split-flap-text': { code: 'FlapPhrase', path: 'src/app/d/production/sections/FlapPhrase.tsx' },
  'kinetic#the-language-wheel': { code: 'LanguageWheel', path: 'src/components/shared/LanguageWheel.tsx' },
  'kinetic#the-carousel': { code: 'CarouselGallery', path: 'src/components/blog/CarouselGallery.tsx' },
  'language#locale-tags-and-flags': { code: 'LocaleTag', path: 'src/app/d/toolchain/components/LocaleTag.tsx' },
  'language#language-diagrams': { code: 'PluralForms', path: 'src/app/d/toolchain/diagrams/lang' },
  'motion#the-reveal-seam': { code: 'RevealSeam', path: 'src/app/d/toolchain/sections/RevealSeam.tsx' },
  'motion#the-sentence-reassembler': { code: 'EverySentence', path: 'src/components/shared/EverySentence.tsx' },
  'marks#the-marks': { code: 'MARKS', path: 'src/lib/marks.ts', name: 'Speed marks' },
  'marks#the-mark-as-a-word': { code: 'GtWord', path: 'src/components/viewer/GtWord.tsx' },
  'marks#the-dithered-shine': { code: 'DitheredMark', path: 'src/app/d/toolchain/diagrams/DitheredMark.tsx' },
  'heads#the-head-badge': { code: 'BadgeCycle', path: 'src/components/viewer/BadgeCycle.tsx' },
  'heads#the-book-head': { code: 'BookHead', path: 'src/components/viewer/BookView.tsx' },
  'artifact-pictures#the-screen': { code: 'pictureField', path: 'src/components/plate/lib/picture-field.ts', name: 'Picture screen' },
  'artifact-pictures#tone-grid-and-screen': { code: 'loadPictureTone', path: 'src/components/plate/lib/picture-field.ts' },
  'covers-and-cards#generator': { code: 'CoverGeneratorDemo', path: 'src/components/docs/demos/artifacts/CoverGeneratorDemo.tsx', name: 'Cover generator' },
  'covers-and-cards#social-card': { code: 'cardPath', path: 'src/lib/seo/card-url.ts' },
  'covers-and-cards#fallback-cover': { code: 'BlogFeatureDither', path: 'src/app/d/production/sections/BlogFeatureDither.tsx' },
  'films-and-sheets#film-player': { code: 'BrandFilm', path: 'src/app/brand/BrandFilm.tsx' },
  'films-and-sheets#contact-sheet': { code: 'ContactSheetDemo', path: 'src/components/docs/demos/artifacts/ContactSheetDemo.tsx' },
  'films-and-sheets#report-card': { code: 'ReportCard', path: 'src/components/try/ReportCard.tsx' },
  'rails-and-bands#the-page-skeleton': { code: 'PageSkeletonDemo', path: 'src/components/docs/demos/layouts/PageSkeletonDemo.tsx' },
  'rails-and-bands#the-head-and-the-cta-row': { code: 'HeadCtaDemo', path: 'src/components/docs/demos/layouts/HeadCtaDemo.tsx', name: 'Head and Cta row' },
  'rails-and-bands#the-line-law': { code: 'JunctionDemo', path: 'src/components/docs/demos/layouts/JunctionDemo.tsx' },
  'grids-and-bentos#seams': { code: 'BentoRow', path: 'src/components/shell/Bento.tsx', name: 'Bento seams' },
  'grids-and-bentos#the-grid-view': { code: 'GridView', path: 'src/components/viewer/GridView.tsx' },
  'shells#the-viewer-shell': { code: 'ViewerShell', path: 'src/components/viewer/ViewerShell.tsx' },
  'shells#the-fixed-sheet': { code: 'Sheet', path: 'src/components/viewer/Sheet.tsx' },
  'shells#the-plate': { code: 'Plate', path: 'src/components/docs/demos/Plate.tsx' },
  'page-gallery#gallery': { code: 'PageGalleryDemo', path: 'src/components/docs/demos/pages/PageGalleryDemo.tsx', name: 'Page gallery' },
  'page-templates#article': { code: 'PageTemplateDemo', path: 'src/components/docs/demos/pages/PageTemplateDemo.tsx', name: 'Article page' },
  'page-templates#book-page': { code: 'PageTemplateDemo', path: 'src/components/docs/demos/pages/PageTemplateDemo.tsx' },
  'page-templates#docs-page': { code: 'PageTemplateDemo', path: 'src/components/docs/demos/pages/PageTemplateDemo.tsx' },
  'page-templates#error-page': { code: 'PageTemplateDemo', path: 'src/components/docs/demos/pages/PageTemplateDemo.tsx' },
};

/** The reusable components under src/components that no Components page covers yet, in folder order. */
const UNDOCUMENTED: readonly { code: string; path: string; desc: string }[] = [
  { code: 'Icon', path: 'src/components/viewer/icons.tsx', desc: 'The Heroicons 20 solid glyphs the shell draws, inlined at 16px in the current color.' },
  { code: 'PtMark', path: 'src/components/viewer/PtMark.tsx', desc: 'The Prototemplate mark: two rules cross into a square filled with the chroma gradient.' },
  { code: 'ThumbShot', path: 'src/components/viewer/ThumbShot.tsx', desc: 'A captured thumbnail with light and dark twins, switched by the theme in CSS.' },
  { code: 'ListRow', path: 'src/components/viewer/ListRow.tsx', desc: 'One sidebar row with keyboard activation and the active mark.' },
  { code: 'PreviewLayer', path: 'src/components/viewer/PreviewLayer.tsx', desc: 'The shell’s one hover preview, which opens a row’s capture after a short rest.' },
  { code: 'DirectionCorner', path: 'src/components/viewer/DirectionCorner.tsx', desc: 'The dock on a direction page that opens the list, the index panel and the search.' },
  { code: 'CornerLayers', path: 'src/components/viewer/CornerLayers.tsx', desc: 'The panels the direction corner opens, with their shared preview layer.' },
  { code: 'ProdSystemTheme', path: 'src/components/viewer/ProdSystemTheme.tsx', desc: 'Follows the system color scheme on the shipped mirror until the visitor picks a theme.' },
  { code: 'Callout', path: 'src/components/blog/Callout.tsx', desc: 'The box the posts use for asides and the quoted style guide.' },
  { code: 'HitList', path: 'src/components/blog/HitList.tsx', desc: 'The numbered anti-pattern list of the docs posts, written in MDX with HitItem.' },
  { code: 'AuthorSpotlight', path: 'src/components/blog/AuthorSpotlight.tsx', desc: 'The contributor card with the portrait, the name, the bio and the project.' },
  { code: 'PostAuthors', path: 'src/components/blog/PostAuthors.tsx', desc: 'The byline: stacked avatars, the names and the date.' },
  { code: 'GitHubLink', path: 'src/components/blog/GitHubLink.tsx', desc: 'The repository chip a post places inline.' },
  { code: 'Video', path: 'src/components/blog/Video.tsx', desc: 'A looping muted clip for a post’s interaction recordings.' },
  { code: 'FumadocsArchitecture', path: 'src/components/blog/FumadocsArchitecture.tsx', desc: 'The architecture diagram of Fumadocs drawn for the Fuma Nama post.' },
  { code: 'renderBlocks', path: 'src/components/book/markdown.tsx', desc: 'The Markdown renderer the handbook and the Markdown twins use, with heading ids.' },
  { code: 'PlateFrame', path: 'src/components/plate/frame/PlateFrame.tsx', desc: 'The frame every sign-in and onboarding surface shares: the field behind a plate column.' },
  { code: 'PlateRoot', path: 'src/components/plate/frame/PlateRoot.tsx', desc: 'The frame’s root element and the field behind it.' },
  { code: 'PlateFoot', path: 'src/components/plate/frame/PlateFoot.tsx', desc: 'The frame’s foot with the language selector and the copyright or the account.' },
  { code: 'PlateScrollFade', path: 'src/components/plate/frame/PlateScrollFade.tsx', desc: 'The fade at the end of the frame’s scroll area.' },
  { code: 'PlateThemeToggle', path: 'src/components/plate/frame/PlateThemeToggle.tsx', desc: 'The frame’s light and dark switch in the dashboard’s ghost icon button.' },
  { code: 'PlateSignOut', path: 'src/components/plate/frame/PlateSignOut.tsx', desc: 'The dashboard’s sign-out text control as the gallery shows it.' },
  { code: 'FieldStack', path: 'src/components/plate/brand/FieldStack.tsx', desc: 'The field behind every sign-in and onboarding surface.' },
  { code: 'FieldMoodPlate', path: 'src/components/plate/brand/FieldMoodPlate.tsx', desc: 'The card that slides out with the picture behind the plate.' },
  { code: 'FieldPicture', path: 'src/components/plate/brand/FieldPicture.tsx', desc: 'Asks the frame’s field for a named picture when it mounts.' },
  { code: 'PlateGallery', path: 'src/components/plate/gallery/PlateGallery.tsx', desc: 'The sign-in and onboarding system as one page: every state on its real frame.' },
  { code: 'DevStateConsole', path: 'src/components/plate/gallery/DevStateConsole.tsx', desc: 'The draggable console that pages the gallery’s states.' },
  { code: 'DevStateView', path: 'src/components/plate/gallery/DevStateView.tsx', desc: 'One gallery state: the real component with fixture props inside its frame.' },
  { code: 'Button', path: 'src/components/plate/ui/button.tsx', desc: 'The dashboard’s button with its variants and sizes.' },
  { code: 'Input', path: 'src/components/plate/ui/input.tsx', desc: 'The dashboard’s text field.' },
  { code: 'Label', path: 'src/components/plate/ui/label.tsx', desc: 'The dashboard’s field label.' },
  { code: 'Checkbox', path: 'src/components/plate/ui/checkbox.tsx', desc: 'The dashboard’s checkbox.' },
  { code: 'Select', path: 'src/components/plate/ui/select.tsx', desc: 'The dashboard’s select menu.' },
  { code: 'InputOTP', path: 'src/components/plate/ui/input-otp.tsx', desc: 'The one-time code field of the sign-in and device pages.' },
  { code: 'Dialog', path: 'src/components/plate/ui/dialog.tsx', desc: 'The dashboard’s modal dialog.' },
  { code: 'Toast', path: 'src/components/plate/ui/toast.tsx', desc: 'The dashboard’s toast notifications.' },
  { code: 'LanguageSelector', path: 'src/components/plate/ui/LanguageSelector.tsx', desc: 'A static copy of the site’s language selector for the plate frame’s foot.' },
  { code: 'ClaudeLogo', path: 'src/components/plate/icons', desc: 'The model logos of the onboarding survey: Claude, DeepSeek, Gemini, Grok, Mistral and OpenAI.' },
  { code: 'DiagramFrame', path: 'src/components/shared/diagrams/DiagramFrame.tsx', desc: 'The drafting frame every product diagram is drawn inside.' },
  { code: 'CodeWrapDiagram', path: 'src/components/shared/diagrams/CodeWrapDiagram.tsx', desc: 'The hero source wrapped by the libraries.' },
  { code: 'ConfigSlidersDiagram', path: 'src/components/shared/diagrams/ConfigSlidersDiagram.tsx', desc: 'The gt.config.json file that stays the same across every runtime.' },
  { code: 'EdgeDeliveryDiagram', path: 'src/components/shared/diagrams/EdgeDeliveryDiagram.tsx', desc: 'Translations served from the edge, drawn for the feature bento.' },
  { code: 'GlossaryDiagram', path: 'src/components/shared/diagrams/GlossaryDiagram.tsx', desc: 'A context group’s glossary and directives as the dashboard table.' },
  { code: 'PreviewPanesDiagram', path: 'src/components/shared/diagrams/PreviewPanesDiagram.tsx', desc: 'A page and its translation in side-by-side preview panes.' },
  { code: 'RoutingTreeDiagram', path: 'src/components/shared/diagrams/RoutingTreeDiagram.tsx', desc: 'One request forking into locale-prefixed paths beside the config that made them.' },
  { code: 'RuntimeSwapDiagram', path: 'src/components/shared/diagrams/RuntimeSwapDiagram.tsx', desc: 'A message translated on demand at runtime, with its latency.' },
  { code: 'SignalPathDiagram', path: 'src/components/shared/diagrams/SignalPathDiagram.tsx', desc: 'The Locadex path from a push to an opened pull request.' },
  { code: 'TranslationFlowDiagram', path: 'src/components/shared/diagrams/TranslationFlowDiagram.tsx', desc: 'The flow of a string from source to translated output.' },
  { code: 'StorySection', path: 'src/components/shared/StorySection.tsx', desc: 'The pinned scroll story where a page is translated in place and Locadex opens the pull request.' },
  { code: 'FieldEffectsMenu', path: 'src/components/shared/FieldEffectsMenu.tsx', desc: 'The chips that switch a field’s cursor effects.' },
  { code: 'HeroFieldSwitcher', path: 'src/components/shared/HeroFieldSwitcher.tsx', desc: 'Switches a hero between its fields.' },
  { code: 'TcMobileNav', path: 'src/components/shared/TcMobileNav.tsx', desc: 'The phone menu of the toolchain directions.' },
  { code: 'SmoothScroll', path: 'src/components/shared/SmoothScroll.tsx', desc: 'Keeps native scrolling on the pages that once used a smoothing engine.' },
  { code: 'TryField', path: 'src/components/try/TryField.tsx', desc: 'The address field of the report card page.' },
  { code: 'TryFigure', path: 'src/components/try/TryFigure.tsx', desc: 'The figure the report card page draws while a site is checked.' },
  { code: 'TryEvidenceModal', path: 'src/components/try/TryEvidenceModal.tsx', desc: 'The dialog with the evidence behind one report card finding.' },
  { code: 'TryHelpTip', path: 'src/components/try/TryHelpTip.tsx', desc: 'The help tip beside a report card score.' },
  { code: 'CategoryMark', path: 'src/components/try/CategoryMarks.tsx', desc: 'The glyph of each report card category.' },
];

/** The group folders in the order the section's meta.json lists them. */
type Meta = { title?: string; pages?: string[] };

function readMeta(dir: string): Meta {
  return JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8')) as Meta;
}

/** A frontmatter field's value without its quotes. */
function field(source: string, key: string): string {
  const front = /^---\n([\s\S]*?)\n---/.exec(source)?.[1] ?? '';
  const raw = new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(front)?.[1]?.trim() ?? '';
  return raw.replace(/^(['"])(.*)\1$/, '$2');
}

/** The heading id fumadocs writes (github-slugger): lowercase, punctuation dropped, spaces as hyphens, a repeat numbered. */
function slugger(): (text: string) => string {
  const seen = new Map<string, number>();
  return (text) => {
    const base = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s_-]/gu, '')
      .replace(/\s/g, '-');
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}

/** One h2 section of a page that mounts a plate: its heading, its id and the plate's component. */
type Section = { heading: string; anchor: string; plate: string };

/** The h2 sections of an MDX body that mount a plate, skipping fenced code. */
function plateSections(source: string): Section[] {
  const body = source.replace(/^---\n[\s\S]*?\n---/, '');
  const slug = slugger();
  const sections: Section[] = [];
  let current: Section | null = null;
  let fenced = false;
  for (const line of body.split('\n')) {
    if (line.startsWith('```')) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (heading) {
      const anchor = slug(heading[2] ?? '');
      if (heading[1] === '##') current = { heading: heading[2] ?? '', anchor, plate: '' };
      continue;
    }
    const plate = /^<([A-Z]\w*)/.exec(line);
    if (current && !current.plate && plate) {
      current.plate = plate[1] ?? '';
      sections.push(current);
    }
  }
  return sections;
}

/** A WebP file's pixel size, read from its header: the VP8X canvas, or the lossy or lossless frame. */
function webpSize(file: string): { w: number; h: number } | null {
  const fd = openSync(file, 'r');
  try {
    const b = Buffer.alloc(30);
    readSync(fd, b, 0, 30, 0);
    const kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (kind === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (kind === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
    }
    return null;
  } finally {
    closeSync(fd);
  }
}

/** The light and dark previews of an entry, when the capture exists. */
function shotOf(id: string): LibraryShot | undefined {
  const light = join(SHOTS, `${id}.webp`);
  if (!existsSync(light)) return undefined;
  const size = webpSize(light);
  if (!size) return undefined;
  const dark = existsSync(join(SHOTS, `${id}-dark.webp`));
  return { light: `${SHOT_URL}/${id}.webp`, dark: dark ? `${SHOT_URL}/${id}-dark.webp` : undefined, ...size };
}

/** The heading as a component's name: a leading `The` is dropped. */
function nameOf(heading: string): string {
  const name = heading.replace(/^The\s+/, '');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** The plate's own file, for a section SOURCES does not name. */
function plateFile(plate: string): string {
  for (const dir of ['', '2d-3d/', 'artifacts/', 'dither-lab/', 'interactables/', 'layouts/', 'pages/']) {
    const path = `src/components/docs/demos/${dir}${plate}.tsx`;
    if (existsSync(join(ROOT, path))) return path;
  }
  return 'src/components/docs/demos';
}

/** Every group of the docs Components section with its entries, then the undocumented components, numbered as one run. */
export function getComponentLibrary(): readonly LibraryBlock[] {
  const top = readMeta(DOCS);
  const groups = (top.pages ?? []).filter((page) => page.startsWith('('));
  const mdx: string[] = [];
  let n = 0;

  const blocks: LibraryBlock[] = groups.map((folder) => {
    const dir = join(DOCS, folder);
    const meta = readMeta(dir);
    const entries: LibraryEntry[] = [];
    for (const page of meta.pages ?? []) {
      const source = readFileSync(join(dir, `${page}.mdx`), 'utf8');
      mdx.push(source);
      const title = field(source, 'title');
      const href = `/docs/components/${page}`;
      for (const section of plateSections(source)) {
        const known = SOURCES[`${page}#${section.anchor}`];
        const id = `${page}-${section.anchor}`;
        n += 1;
        entries.push({
          id,
          n: pad2(n),
          name: known?.name ?? nameOf(section.heading),
          code: known?.code ?? section.plate,
          path: known?.path ?? plateFile(section.plate),
          docs: { href: `${href}#${section.anchor}`, title },
          shot: shotOf(id),
        });
      }
    }
    return { id: folder.replace(/[()]/g, ''), label: meta.title ?? folder, entries };
  });

  const covered = mdx.join('\n');
  const undocumented = UNDOCUMENTED.filter((item) => !covered.includes(item.path.replace(/\.tsx?$/, ''))).map(
    (item): LibraryEntry => {
      n += 1;
      return { id: `src-${item.code.toLowerCase()}`, n: pad2(n), name: item.code, code: item.code, path: item.path, desc: item.desc };
    }
  );
  if (undocumented.length > 0) blocks.push({ id: 'undocumented', label: 'Not in the docs', entries: undocumented });
  return blocks;
}
