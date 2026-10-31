import { closeSync, existsSync, openSync, readFileSync, readSync } from 'node:fs';
import { join } from 'node:path';

import * as films from '@/components/docs/demos/artifacts/films';
import { LAZY_PLATE_MODULES, SERVER_PLATE_MODULES } from '@/lib/component-library-model';
import type { LazyPlateModule, LibraryBlock, LibraryEntry, LibraryPlate, ServerPlateModule } from '@/lib/component-library-model';

/**
 * The set behind /components, read on the server at build time. The
 * documented components come from the docs Components section
 * (content/docs/components): its groups in the order of its meta.json, each
 * group's pages in the order of theirs, and in each page every h2 section
 * that mounts a plate. One section is one entry, linked to its heading on
 * the docs page. SOURCES names the export and the file each entry shows; a
 * section missing from it falls back to the plate's own file.
 *
 * Each entry carries the plate its section mounts as the MDX writes it:
 * the element's name, the module the page imports it from and its props,
 * literal values as written and an imported value (films={PUBLISHED_FILMS})
 * resolved here through VALUE_MODULES. The viewer mounts it from the
 * registry in src/app/components/plates.ts. A section whose plate the
 * registry cannot mount (no import, a module outside LAZY_PLATE_MODULES and
 * SERVER_PLATE_MODULES, a name its lazy module does not export, a prop that
 * is not a literal) throws, so the build fails.
 *
 * The height a row reserves for its plate is the plate's measured height
 * across the viewport widths, from src/lib/plate-heights.json
 * (scripts/check/capture-plate-heights.mjs): [width, height] points the
 * viewer joins with straight lines (reserveAt). A plate that moves adds a
 * line under reduced motion, so its heights then come from
 * src/lib/plate-heights-still.json (reserveStill). A plate not measured yet
 * reserves its stage, read from its capture
 * (public/shots/components/<page>-<heading id>.webp), and one controls row,
 * at every width.
 *
 * UNDOCUMENTED lists the reusable components under src/components that no
 * docs page covers yet. An entry drops out on its own once a Components
 * page names its path.
 */

const ROOT = process.cwd();
const DOCS = join(ROOT, 'content/docs/components');
const SHOTS = join(ROOT, 'public/shots/components');
const HEIGHTS = join(ROOT, 'src/lib/plate-heights.json');
const STILL_HEIGHTS = join(ROOT, 'src/lib/plate-heights-still.json');

/** One controls row and the plate's two borders, measured on the ordered screen's plate at 1440. */
const BAR = 86;

/** The sections /components leaves out, by `<page>#<heading id>`: the language wheel (2026-10-26). A key that matches no plate section throws. */
const LEFT_OUT: ReadonlySet<string> = new Set(['kinetic#the-language-wheel']);

/** The modules a plate's prop reads a value from, by the specifier the MDX imports; the value reaches the client as data, as on the docs page. */
const VALUE_MODULES: Readonly<Record<string, Readonly<Record<string, unknown>>>> = {
  '@/components/docs/demos/artifacts/films': films,
};

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
  'kinetic#the-carousel': { code: 'CarouselGallery', path: 'src/components/blog/CarouselGallery.tsx' },
  'language#locale-tags-and-flags': { code: 'LocaleTag', path: 'src/app/d/toolchain/components/LocaleTag.tsx' },
  'language#language-diagrams': { code: 'PluralForms', path: 'src/app/d/toolchain/diagrams/lang' },
  'motion#the-reveal-seam': { code: 'RevealSeam', path: 'src/app/d/toolchain/sections/RevealSeam.tsx' },
  'motion#the-sentence-reassembler': { code: 'EverySentence', path: 'src/components/shared/EverySentence.tsx' },
  'marks#the-marks': { code: 'SHORTLIST', path: 'src/lib/marks.ts', name: 'Marks' },
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
  { code: 'Spotlight', path: 'src/components/blog/Spotlight.tsx', desc: 'The person card of a grantee post: the dithered portrait, the name, one line and the project and GitHub links.' },
  { code: 'OpenSourceGrants', path: 'src/components/blog/OpenSourceGrants.tsx', desc: 'The grants note that opens every open-source grantee post.' },
  { code: 'PostAuthors', path: 'src/components/blog/PostAuthors.tsx', desc: 'The byline: stacked avatars, the names and the date.' },
  { code: 'GitHubLink', path: 'src/components/blog/GitHubLink.tsx', desc: 'The repository chip a post places inline.' },
  { code: 'Video', path: 'src/components/blog/Video.tsx', desc: 'A looping muted clip for a post’s interaction recordings.' },
  { code: 'FumadocsArchitecture', path: 'src/components/blog/FumadocsArchitecture.tsx', desc: 'The architecture diagram of Fumadocs drawn for the Fuma Nama post.' },
  { code: 'renderBlocks', path: 'src/components/book/markdown.tsx', desc: 'The Markdown renderer the handbook and the Markdown twins use, with heading ids.' },
  { code: 'DocsNameplate', path: 'src/components/docs/DocsNameplate.tsx', desc: 'The docs nameplate in the sidebar head and the phone header: the hub’s mark links home, and Docs links to /docs.' },
  { code: 'DocsThemeButton', path: 'src/components/docs/DocsThemeButton.tsx', desc: 'The docs site’s light and dark switch, which keeps the hub’s stored theme.' },
  { code: 'DocsPageActions', path: 'src/components/docs/DocsPageActions.tsx', desc: 'Copy page and its menu: the page’s Markdown twin, its source on GitHub, or a prompt for an assistant.' },
  { code: 'DocsSidebarFooter', path: 'src/components/docs/DocsSidebarFooter.tsx', desc: 'The docs sidebar’s foot: the skills, the repository and the theme button.' },
  { code: 'SidebarMotion', path: 'src/components/docs/SidebarMotion.tsx', desc: 'The docs sidebar’s rails and pills, which slide to the row the pointer is on and to the current page.' },
  { code: 'SidebarActiveScroll', path: 'src/components/docs/SidebarActiveScroll.tsx', desc: 'Scrolls the docs sidebar so the current page’s row is in view after each navigation.' },
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
  { code: 'GtMark', path: 'src/components/plate/icons/GtMark.tsx', desc: 'The GT mark in one ink, cropped to the glyph so it sits beside text on the plate pages.' },
  { code: 'AuthFrame', path: 'src/components/plate/pages/auth/AuthFrame.tsx', desc: 'The heading, lede, content and footnote every secondary auth screen stacks in the plate column.' },
  { code: 'SignInForm', path: 'src/components/plate/pages/auth/SignInForm.tsx', desc: 'The dashboard’s sign-in form: the email link, SSO and the social buttons.' },
  { code: 'CliTerminal', path: 'src/components/plate/pages/cli/CliTerminal.tsx', desc: 'What npx gt login prints before the browser opens, on a terminal panel.' },
  { code: 'CliWizard', path: 'src/components/plate/pages/cli/CliWizard.tsx', desc: 'The CLI wizard’s project picker and its authorized state.' },
  { code: 'CliCallbackSnapshot', path: 'src/components/plate/pages/cli/CliCallbackSnapshot.tsx', desc: 'One of the pages the gt CLI serves on its local callback, shown in a sandboxed frame in the site’s theme.' },
  { code: 'CloseWindowButton', path: 'src/components/plate/pages/cli/CloseWindowButton.tsx', desc: 'Closes the tab after a CLI sign-in, and says so when the browser blocks it.' },
  { code: 'CompletedSessionState', path: 'src/components/plate/pages/cli/CompletedSessionState.tsx', desc: 'The CLI wizard once its session already has credentials.' },
  { code: 'InvalidSessionState', path: 'src/components/plate/pages/cli/InvalidSessionState.tsx', desc: 'The CLI wizard for an unknown or expired session.' },
  { code: 'OAuthConsent', path: 'src/components/plate/pages/consent/OAuthConsent.tsx', desc: 'The consent screen where a person narrows the requested scopes and approves the client.' },
  { code: 'AuthorizationShell', path: 'src/components/plate/pages/consent/AuthorizationShell.tsx', desc: 'The authorization screen’s column: the request details, then the decision buttons.' },
  { code: 'OAuthClientDetails', path: 'src/components/plate/pages/consent/OAuthClientDetails.tsx', desc: 'The request details: the client, the account and where the browser goes next.' },
  { code: 'OAuthDetailRow', path: 'src/components/plate/pages/consent/OAuthDetailRow.tsx', desc: 'One ruled row of the request details, with the key on the left and the value on the right.' },
  { code: 'OAuthScopeList', path: 'src/components/plate/pages/consent/OAuthScopeList.tsx', desc: 'The read-only list of scopes for a grant that cannot be narrowed.' },
  { code: 'OAuthScopeDescriptions', path: 'src/components/plate/pages/consent/OAuthScopeDescriptions.tsx', desc: 'The disclosure under the scopes that opens to one description per scope.' },
  { code: 'DisclosureSummary', path: 'src/components/plate/pages/consent/DisclosureSummary.tsx', desc: 'The summary line of an inline disclosure, with a plus that turns into a minus.' },
  { code: 'InvalidConsentState', path: 'src/components/plate/pages/consent/InvalidConsentState.tsx', desc: 'The consent page for a request that cannot be shown.' },
  { code: 'DeviceApproval', path: 'src/components/plate/pages/device/DeviceApproval.tsx', desc: 'The approve and deny screen for a device code, with its result states.' },
  { code: 'DeviceCodeForm', path: 'src/components/plate/pages/device/DeviceCodeForm.tsx', desc: 'The field where a person types the code a device shows.' },
  { code: 'BlockedState', path: 'src/components/plate/pages/device/BlockedState.tsx', desc: 'The device page when the session’s network is not allowed.' },
  { code: 'StepCounter', path: 'src/components/plate/pages/onboarding/StepCounter.tsx', desc: 'The onboarding counter and the progress rule under the mark row.' },
  { code: 'StepBack', path: 'src/components/plate/pages/onboarding/StepBack.tsx', desc: 'The text control that returns to the previous onboarding step.' },
  { code: 'SurveyStep', path: 'src/components/plate/pages/onboarding/SurveyStep.tsx', desc: 'Onboarding step 1: the website, the company size, the source and the frameworks, each row opening as the last is answered.' },
  { code: 'CreateOrgStep', path: 'src/components/plate/pages/onboarding/CreateOrgStep.tsx', desc: 'Onboarding step 2: the organization and its first project.' },
  { code: 'PaymentStep', path: 'src/components/plate/pages/onboarding/PaymentStep.tsx', desc: 'Onboarding step 3: the card form and the signup credits.' },
  { code: 'BillingFormPreview', path: 'src/components/plate/pages/onboarding/BillingFormPreview.tsx', desc: 'A static copy of the dashboard’s card form, built from the plate’s own fields.' },
  { code: 'CreditsCard', path: 'src/components/plate/pages/onboarding/CreditsCard.tsx', desc: 'The signup credits as a dark card with dithered rings and a tilt that follows the pointer.' },
  { code: 'ConnectGithubStep', path: 'src/components/plate/pages/onboarding/ConnectGithubStep.tsx', desc: 'Onboarding step 4: connect GitHub or skip to the dashboard.' },
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
  { code: 'StoryDemoSite', path: 'src/components/shared/story/StoryDemoSite.tsx', desc: 'The small marketing page the scroll story translates in place.' },
  { code: 'StoryCodePanel', path: 'src/components/shared/story/StoryCodePanel.tsx', desc: 'The code behind a zoomed component, as a wipe across it or a panel beside it.' },
  { code: 'StoryCodeScene', path: 'src/components/shared/story/StoryCodeScene.tsx', desc: 'The editor the story’s window turns into when Locadex takes over.' },
  { code: 'FieldEffectsMenu', path: 'src/components/shared/FieldEffectsMenu.tsx', desc: 'The chips that switch a field’s cursor effects.' },
  { code: 'HeroFieldSwitcher', path: 'src/components/shared/HeroFieldSwitcher.tsx', desc: 'Switches a hero between its fields.' },
  { code: 'TcMobileNav', path: 'src/components/shared/TcMobileNav.tsx', desc: 'The phone menu of the toolchain directions.' },
  { code: 'SmoothScroll', path: 'src/components/shared/SmoothScroll.tsx', desc: 'Keeps native scrolling on the pages that once used a smoothing engine.' },
  { code: 'TryField', path: 'src/components/try/TryField.tsx', desc: 'The address field of the report card page.' },
  { code: 'TryFigure', path: 'src/components/try/TryFigure.tsx', desc: 'The figure the report card page draws while a site is checked.' },
  { code: 'TryEvidenceModal', path: 'src/components/try/TryEvidenceModal.tsx', desc: 'The dialog with the evidence behind one report card finding.' },
  { code: 'TryHelpTip', path: 'src/components/try/TryHelpTip.tsx', desc: 'The help tip beside a report card score.' },
  { code: 'CategoryMark', path: 'src/components/try/CategoryMarks.tsx', desc: 'The glyph of each report card category.' },
  { code: 'TryPage', path: 'src/components/try/TryPage.tsx', desc: 'The report card page: the address field, the figure while the check runs, then the card.' },
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

/** The lines of an MDX body outside its frontmatter and its fenced code. */
function proseLines(source: string): string[] {
  const body = source.replace(/^---\n[\s\S]*?\n---/, '');
  const lines: string[] = [];
  let fenced = false;
  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (!fenced) lines.push(line);
  }
  return lines;
}

/** A name an MDX page imports: the module specifier and the export it names (`default` for a default import). */
type Imported = { module: string; name: string };

/** The page's imports by local name: `import X from`, `import { A, B as C } from`, or both. */
function importsOf(lines: readonly string[]): Map<string, Imported> {
  const out = new Map<string, Imported>();
  for (const line of lines) {
    const match = /^import\s+(.+?)\s+from\s+['"]([^'"]+)['"];?\s*$/.exec(line);
    if (!match) continue;
    const clause = match[1] ?? '';
    const module = match[2] ?? '';
    const named = /\{([^}]*)\}/.exec(clause)?.[1];
    const def = clause.replace(/\{[^}]*\}/, '').replace(/,/g, '').trim();
    if (def && !def.startsWith('*') && def !== 'type') out.set(def, { module, name: 'default' });
    for (const part of named?.split(',') ?? []) {
      const [name = '', local = name] = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/);
      if (name) out.set(local.trim(), { module, name: name.trim() });
    }
  }
  return out;
}

/** The index of the `>` that ends the tag opening at `start`, or -1; quoted strings and braces are skipped whole. */
function tagEnd(text: string, start: number): number {
  let depth = 0;
  let quote = '';
  for (let i = start + 1; i < text.length; i += 1) {
    const c = text[i];
    if (quote) {
      if (c === '\\') i += 1;
      else if (c === quote) quote = '';
    } else if (c === "'" || c === '"' || c === '`') quote = c;
    else if (c === '{') depth += 1;
    else if (c === '}') depth -= 1;
    else if (c === '>' && depth === 0) return i;
  }
  return -1;
}

/** The source of the JSX element that opens at `start`, through its `/>`. */
function elementAt(text: string, start: number, where: string): string {
  const end = tagEnd(text, start);
  if (end < 0) throw new Error(`/components: the plate in ${where} never closes`);
  if (text[end - 1] !== '/') throw new Error(`/components: the plate in ${where} has children, which the plate registry does not pass`);
  return text.slice(start, end + 1);
}

/**
 * The elements open at a point of an MDX body, read forward through it: an
 * opening tag that does not close itself stays open until its closing tag.
 * Each call reads on from where the last stopped, so the points are asked
 * in order. Pass the body with inline code blanked, so a tag named in prose
 * (`<Tabs>`) opens nothing.
 */
function openElements(text: string): (at: number) => readonly string[] {
  const open: string[] = [];
  const tag = /<(\/?)([A-Za-z][\w.-]*)(?=[\s/>])/g;
  let from = 0;
  return (at) => {
    tag.lastIndex = from;
    for (let match = tag.exec(text); match && match.index < at; match = tag.exec(text)) {
      const name = match[2] ?? '';
      if (match[1]) {
        const i = open.lastIndexOf(name);
        if (i >= 0) open.length = i;
        from = match.index + match[0].length;
        continue;
      }
      const end = tagEnd(text, match.index);
      if (end < 0) break;
      if (text[end - 1] !== '/') open.push(name);
      from = end + 1;
      tag.lastIndex = from;
    }
    return open;
  };
}

/**
 * An element's props from its attributes: a quoted string, a bare name
 * (true), or a braced literal (a string, a number, true, false, null, an
 * array or an object of literals). A bare identifier inside braces is an
 * imported value, which `resolve` reads. Anything else (a spread, a call,
 * a template, JSX) throws.
 */
function readProps(source: string, resolve: (identifier: string) => unknown, where: string): Record<string, unknown> {
  let i = 0;
  const fail = (what: string): never => {
    throw new Error(`/components: the plate in ${where} needs ${what} at "${source.slice(i, i + 24)}"`);
  };
  const space = () => {
    while (i < source.length && /\s/.test(source[i] ?? '')) i += 1;
  };
  const word = (): string => {
    const match = /^[A-Za-z_$][\w$-]*/.exec(source.slice(i));
    if (!match) return fail('a name');
    i += match[0].length;
    return match[0];
  };
  const quoted = (): string => {
    const q = source[i];
    let out = '';
    for (i += 1; i < source.length && source[i] !== q; i += 1) {
      if (source[i] === '\\') i += 1;
      out += source[i] ?? '';
    }
    if (source[i] !== q) fail('a closing quote');
    i += 1;
    return out;
  };
  const list = <T,>(close: string, item: () => T): T[] => {
    const out: T[] = [];
    i += 1;
    for (space(); source[i] !== close; space()) {
      if (i >= source.length) fail(`a closing ${close}`);
      out.push(item());
      space();
      if (source[i] === ',') i += 1;
    }
    i += 1;
    return out;
  };
  const value = (): unknown => {
    space();
    const c = source[i];
    if (c === "'" || c === '"') return quoted();
    if (c === '[') return list(']', value);
    if (c === '{') {
      const pairs = list('}', (): [string, unknown] => {
        const key = source[i] === "'" || source[i] === '"' ? quoted() : word();
        space();
        if (source[i] !== ':') fail('a colon');
        i += 1;
        return [key, value()];
      });
      return Object.fromEntries(pairs);
    }
    const number = /^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/i.exec(source.slice(i));
    if (number) {
      i += number[0].length;
      return Number(number[0]);
    }
    const name = word();
    if (name === 'true' || name === 'false') return name === 'true';
    if (name === 'null') return null;
    return resolve(name);
  };
  const props: Record<string, unknown> = {};
  for (space(); i < source.length; space()) {
    if (source[i] === '{') fail('a named prop, not a spread,');
    const key = word();
    space();
    if (source[i] !== '=') {
      props[key] = true;
      continue;
    }
    i += 1;
    space();
    if (source[i] !== '{') {
      props[key] = quoted();
      continue;
    }
    i += 1;
    props[key] = value();
    space();
    if (source[i] !== '}') fail('one literal value');
    i += 1;
  }
  return props;
}

const LAZY: ReadonlySet<string> = new Set(LAZY_PLATE_MODULES);
const SERVER: ReadonlySet<string> = new Set(SERVER_PLATE_MODULES);

function isLazy(module: string): module is LazyPlateModule {
  return LAZY.has(module);
}

function isServer(module: string): module is ServerPlateModule {
  return SERVER.has(module);
}

/** Each lazy module's exports, read once from its source: `export const Name = dynamic(...)`. */
const lazyExports = new Map<string, ReadonlySet<string>>();

function exportsOf(module: LazyPlateModule): ReadonlySet<string> {
  const known = lazyExports.get(module);
  if (known) return known;
  const source = readFileSync(join(ROOT, `${module.replace(/^@\//, 'src/')}.tsx`), 'utf8');
  const names = new Set(Array.from(source.matchAll(/^export const (\w+)\s*=\s*dynamic\(/gm), (match) => match[1] ?? ''));
  lazyExports.set(module, names);
  return names;
}

/** The plate an element mounts, checked against the registry's modules; a plate the registry cannot mount throws. */
function plateOf(element: string, name: string, imports: ReadonlyMap<string, Imported>, where: string): LibraryPlate {
  const imported = imports.get(name);
  if (!imported) throw new Error(`/components: ${where} mounts <${name} /> but its page does not import it`);
  const props = readProps(
    element.slice(name.length + 1, -2),
    (identifier) => {
      const from = imports.get(identifier);
      const values = from ? VALUE_MODULES[from.module] : undefined;
      if (!from || !values || !(from.name in values)) {
        throw new Error(`/components: ${where} passes ${identifier}, which VALUE_MODULES does not hold`);
      }
      return values[from.name];
    },
    where
  );
  if (isLazy(imported.module)) {
    if (!exportsOf(imported.module).has(imported.name)) {
      throw new Error(`/components: ${where} mounts ${imported.name}, which ${imported.module} does not export`);
    }
    return { kind: 'lazy', module: imported.module, name: imported.name, props };
  }
  if (isServer(imported.module) && imported.name === 'default') return { kind: 'server', module: imported.module, name, props };
  throw new Error(`/components: ${where} mounts <${name} /> from ${imported.module}, which is in neither LAZY_PLATE_MODULES nor SERVER_PLATE_MODULES`);
}

/** One h2 section of a page that mounts a plate: its heading, its id, and the plate's name and element. */
type Section = { heading: string; anchor: string; name: string; element: string };

/** A line with its inline code blanked to spaces, so a component named in prose (`<StudioField>`) is not read as a mount and every column stays put. */
function withoutInlineCode(line: string): string {
  return line.replace(/`[^`\n]*`/g, (span) => ' '.repeat(span.length));
}

/**
 * The h2 sections of an MDX page that mount a plate. A plate is an element
 * whose name the page imports (fumadocs' own Cards and Callout are not
 * imported), written flush at the start of its line inside an h2 section,
 * outside every other element, one to a section. Any other use of an
 * imported element (indented, after other markup on its line, inside an
 * element opened on an earlier line, above the first h2, or a second plate
 * in one section) throws, so /components never mounts a plate differently
 * from its docs page and never drops one without failing the build.
 */
function plateSections(lines: readonly string[], imports: ReadonlyMap<string, Imported>, where: string): Section[] {
  const text = lines.join('\n');
  const openAt = openElements(lines.map(withoutInlineCode).join('\n'));
  const slug = slugger();
  const sections: Section[] = [];
  let current: { heading: string; anchor: string; plate: string | null } | null = null;
  let offset = 0;
  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (heading) {
      const anchor = slug(heading[2] ?? '');
      if (heading[1] === '##') current = { heading: heading[2] ?? '', anchor, plate: null };
    } else {
      for (const match of withoutInlineCode(line).matchAll(/<([A-Z]\w*)/g)) {
        const name = match[1] ?? '';
        if (!imports.has(name)) continue;
        const at = `${where}${current ? `#${current.anchor}` : ''}`;
        if (!current) throw new Error(`/components: ${at} mounts <${name} /> above its first h2; a plate sits in an h2 section`);
        if (match.index !== 0) {
          throw new Error(`/components: ${at} mounts <${name} /> indented or inside other markup; write the plate flush at the start of its own line`);
        }
        const wrapper = openAt(offset).at(-1);
        if (wrapper) {
          throw new Error(`/components: ${at} mounts <${name} /> inside <${wrapper}>, which the plate registry does not mount; write the plate outside it`);
        }
        if (current.plate) throw new Error(`/components: ${at} mounts <${name} /> after <${current.plate} />; one plate to an h2 section`);
        current.plate = name;
        sections.push({ heading: current.heading, anchor: current.anchor, name, element: elementAt(text, offset, at) });
      }
    }
    offset += line.length + 1;
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

/** `7` becomes `007`, so every number in a set of more than 99 has the same width. */
function pad3(n: number): string {
  return String(n).padStart(3, '0');
}

/** A plate's measured height at viewport widths, as [width, height] points in ascending width. */
type Points = readonly (readonly [number, number])[];

/** Measured plate heights by entry id, from one of the two tables. */
function readHeights(file: string): Readonly<Record<string, Points>> {
  return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as Record<string, Points>) : {};
}

/** The heights a row reserves for its plate: measured, or the stage from the light capture (shot at a device scale of 1) and one controls row at every width. */
function reserveOf(id: string, measured: Readonly<Record<string, Points>>): Points {
  const points = measured[id];
  if (points && points.length > 0) return points;
  const light = join(SHOTS, `${id}.webp`);
  const stage = (existsSync(light) ? webpSize(light)?.h : undefined) ?? 300;
  return [[1440, stage + BAR]];
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
  const heights = readHeights(HEIGHTS);
  const still = readHeights(STILL_HEIGHTS);
  const leftOut = new Set<string>();
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
      const lines = proseLines(source);
      const imports = importsOf(lines);
      for (const section of plateSections(lines, imports, page)) {
        const key = `${page}#${section.anchor}`;
        if (LEFT_OUT.has(key)) {
          leftOut.add(key);
          continue;
        }
        const known = SOURCES[key];
        const id = `${page}-${section.anchor}`;
        n += 1;
        entries.push({
          id,
          n: pad3(n),
          name: known?.name ?? nameOf(section.heading),
          code: known?.code ?? section.name,
          path: known?.path ?? plateFile(section.name),
          docs: { href: `${href}#${section.anchor}`, title },
          plate: plateOf(section.element, section.name, imports, key),
          reserve: reserveOf(id, heights),
          ...(still[id] ? { reserveStill: still[id] } : {}),
        });
      }
    }
    return { id: folder.replace(/[()]/g, ''), label: meta.title ?? folder, entries };
  });
  for (const key of LEFT_OUT) {
    if (!leftOut.has(key)) throw new Error(`/components: LEFT_OUT names ${key}, which is no section that mounts a plate; rename the key with its heading`);
  }

  const covered = mdx.join('\n');
  const undocumented = UNDOCUMENTED.filter((item) => !covered.includes(item.path.replace(/\.tsx?$/, ''))).map(
    (item): LibraryEntry => {
      n += 1;
      return { id: `src-${item.code.toLowerCase()}`, n: pad3(n), name: item.code, code: item.code, path: item.path, desc: item.desc };
    }
  );
  if (undocumented.length > 0) blocks.push({ id: 'undocumented', label: 'Not in the docs', entries: undocumented });
  return blocks;
}
