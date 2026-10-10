const RAW_TAILWIND_COLOR =
  /\b(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d/;
const HARDCODED_BLACK_WHITE =
  /\b(?:text-white|text-black|bg-white|bg-black)(?:\s|$)/;
const THIN_FONT = /\bfont-(?:light|thin)\b/;
const ALLOWED_RADIUS_UTILITIES = new Set([
  'rounded-md',
  'rounded-t-md',
  'rounded-r-md',
  'rounded-b-md',
  'rounded-l-md',
  'rounded-tl-md',
  'rounded-tr-md',
  'rounded-br-md',
  'rounded-bl-md',
  'rounded-full',
  'rounded-none',
  'rounded-[inherit]',
]);
const BORDER_RADIUS_PROPERTIES = new Set([
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomRightRadius',
  'borderBottomLeftRadius',
  'border-radius',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
]);

function getStringValue(node) {
  if (typeof node.value === 'string') {
    return node.value;
  }

  if (typeof node.value?.raw === 'string') {
    return node.value.raw;
  }

  if (typeof node.value?.cooked === 'string') {
    return node.value.cooked;
  }

  return null;
}

function getTailwindUtility(className) {
  let bracketDepth = 0;
  let utilityStart = 0;

  for (let index = 0; index < className.length; index += 1) {
    const character = className[index];

    if (character === '[') {
      bracketDepth += 1;
    } else if (character === ']') {
      bracketDepth = Math.max(0, bracketDepth - 1);
    } else if (character === ':' && bracketDepth === 0) {
      utilityStart = index + 1;
    }
  }

  return className.slice(utilityStart).replace(/^!/, '');
}

export function getInvalidRadiusClasses(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .filter((className) => {
      const utility = getTailwindUtility(className);

      if (utility === 'rounded' || utility.startsWith('rounded-')) {
        return !ALLOWED_RADIUS_UTILITIES.has(utility);
      }

      return false;
    });
}

export function isInlineBorderRadiusPropertyName(name) {
  return BORDER_RADIUS_PROPERTIES.has(name);
}

export function isDesignSystemRadiusValue(value) {
  return value === 'var(--radius-md)';
}

function getPropertyName(node) {
  if (node.computed) {
    return getStringValue(node.key);
  }

  if (node.key?.type === 'Identifier') {
    return node.key.name;
  }

  return getStringValue(node.key);
}

function getStaticJsxClassName(openingElement) {
  for (const attribute of openingElement.attributes ?? []) {
    if (
      attribute.type !== 'JSXAttribute' ||
      (attribute.name?.name !== 'className' && attribute.name?.name !== 'class')
    ) {
      continue;
    }

    if (attribute.value?.type === 'JSXExpressionContainer') {
      return getStringValue(attribute.value.expression);
    }

    return getStringValue(attribute.value);
  }

  return null;
}

function getJsxElementName(openingElement) {
  if (openingElement.name?.type === 'JSXIdentifier') {
    return openingElement.name.name;
  }

  return null;
}

export function isNestedSurface(elementName, ancestorElementNames) {
  return elementName === 'Card' && ancestorElementNames.includes('Card');
}

function getAncestorElementNames(node) {
  const ancestorElementNames = [];
  let currentNode = node.parent;

  while (currentNode) {
    if (currentNode.type === 'JSXElement') {
      const elementName = getJsxElementName(currentNode.openingElement);
      if (elementName) {
        ancestorElementNames.push(elementName);
      }
    }

    currentNode = currentNode.parent;
  }

  return ancestorElementNames;
}

function getUnprefixedTailwindUtilities(className) {
  return className
    .split(/\s+/)
    .filter(Boolean)
    .filter((utility) => !utility.includes(':'))
    .map((utility) => utility.replace(/^!/, ''));
}

function getLayoutAxis(className) {
  const utilities = getUnprefixedTailwindUtilities(className);

  if (!utilities.includes('flex') && !utilities.includes('inline-flex')) {
    return null;
  }

  return utilities.includes('flex-col') ||
    utilities.includes('flex-col-reverse')
    ? 'vertical'
    : 'horizontal';
}

function hasParentOwnedSpacing(utilities, axis) {
  return utilities.some((utility) => {
    if (utility.startsWith('gap-')) {
      return (
        (!utility.startsWith('gap-x-') && !utility.startsWith('gap-y-')) ||
        (axis === 'vertical' && utility.startsWith('gap-y-')) ||
        (axis === 'horizontal' && utility.startsWith('gap-x-'))
      );
    }

    return (
      (axis === 'vertical' && utility.startsWith('space-y-')) ||
      (axis === 'horizontal' && utility.startsWith('space-x-'))
    );
  });
}

function hasMainAxisSiblingMargin(className, axis) {
  return getUnprefixedTailwindUtilities(className).some((utility) => {
    const match = utility.match(/^-?m(?:(t|r|b|l|x|y))?-(.+)$/);
    if (!match) {
      return false;
    }

    const [, direction, value] = match;
    if (value === 'auto' || value === '0' || value === '[0px]') {
      return false;
    }

    if (!direction) {
      return true;
    }

    return axis === 'vertical'
      ? direction === 't' || direction === 'b' || direction === 'y'
      : direction === 'l' || direction === 'r' || direction === 'x';
  });
}

export function hasRepeatedSiblingMargins(parentClassName, childClassNames) {
  const axis = getLayoutAxis(parentClassName);
  if (!axis) {
    return false;
  }

  const parentUtilities = getUnprefixedTailwindUtilities(parentClassName);
  if (hasParentOwnedSpacing(parentUtilities, axis)) {
    return false;
  }

  return (
    childClassNames.filter((className) =>
      hasMainAxisSiblingMargin(className, axis)
    ).length >= 2
  );
}

function getComments(context) {
  try {
    return context.sourceCode?.getAllComments?.() ?? [];
  } catch {
    return [];
  }
}

function targetsNoRestrictedSyntax(commentValue) {
  if (
    !commentValue.includes('eslint-disable') &&
    !commentValue.includes('eslint-enable')
  ) {
    return false;
  }

  const directive = (commentValue.split('--')[0] ?? '').trim();
  const ruleList = directive
    .replace(/^eslint-disable-next-line\s*/, '')
    .replace(/^eslint-disable-line\s*/, '')
    .replace(/^eslint-disable\s*/, '')
    .replace(/^eslint-enable\s*/, '')
    .trim();

  if (!ruleList) {
    return true;
  }

  return ruleList
    .split(',')
    .map((rule) => rule.trim())
    .includes('no-restricted-syntax');
}

function isLegacyDisabled(context, node) {
  const startLine = node.loc?.start?.line;
  if (!startLine) {
    return false;
  }

  let blockDisabled = false;

  for (const comment of getComments(context)) {
    const value = comment.value ?? '';
    const commentStart = comment.loc?.start?.line;
    const commentEnd = comment.loc?.end?.line ?? commentStart;

    if (!commentStart || commentStart > startLine) {
      continue;
    }

    if (value.includes('eslint-enable') && targetsNoRestrictedSyntax(value)) {
      blockDisabled = false;
      continue;
    }

    if (!targetsNoRestrictedSyntax(value)) {
      continue;
    }

    if (
      value.includes('eslint-disable-next-line') &&
      commentEnd === startLine - 1
    ) {
      return true;
    }

    if (value.includes('eslint-disable-line') && commentStart === startLine) {
      return true;
    }

    if (
      value.includes('eslint-disable') &&
      !value.includes('eslint-disable-next-line') &&
      !value.includes('eslint-disable-line')
    ) {
      blockDisabled = true;
    }
  }

  return blockDisabled;
}

function reportRestrictedNode(context, node, messageId) {
  if (!isLegacyDisabled(context, node)) {
    context.report({ node, messageId });
  }
}

function createStringRule(regex, message) {
  return {
    meta: {
      type: 'problem',
      schema: [],
      messages: {
        restrictedString: message,
      },
    },
    create(context) {
      function checkNode(node) {
        const value = getStringValue(node);
        if (value && regex.test(value)) {
          reportRestrictedNode(context, node, 'restrictedString');
        }
      }

      return {
        Literal: checkNode,
        TemplateElement: checkNode,
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Icon tiers. A mark that carries meaning (a card, a feature, a link
// destination, a section, package or status mark) is Heroicons solid, sized
// with a class: '@heroicons/react/24/solid', or '16/solid' for a mark set
// inline with running text. A control is Lucide outline. Brand marks are
// their own class (react-simple-icons, masked logos, PythonLogo, LocadexMark).
// Lucide is therefore allowed only for the glyphs on this list; a Lucide
// import outside it is a meaning mark drawn in the wrong tier.
const CONTROL_LUCIDE_GLYPHS = new Set([
  'Airplay',
  'AlignLeft',
  'ArrowDown',
  'ArrowDownLeft',
  'ArrowDownRight',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowUpLeft',
  'ArrowUpRight',
  'CalendarIcon',
  'Check',
  'CheckIcon',
  'ChevronDown',
  'ChevronLeft',
  'ChevronRight',
  'ChevronUp',
  'ChevronsDownUp',
  'ChevronsLeft',
  'ChevronsRight',
  'ChevronsUpDown',
  'Circle',
  'Copy',
  'Download',
  'Edit',
  'ExternalLink',
  'Eye',
  'EyeOff',
  'Filter',
  'GripVertical',
  'HelpCircle',
  'History',
  'Home',
  'Languages',
  'Link',
  'Loader2',
  'LoaderCircle',
  'Maximize2',
  'Menu',
  'Minimize2',
  'Minus',
  'MinusIcon',
  'Monitor',
  'Moon',
  'MoreHorizontal',
  'MoreVertical',
  'PanelLeft',
  'Pause',
  'Play',
  'Plus',
  'PlusIcon',
  'RefreshCw',
  'RotateCcw',
  'Search',
  'Settings',
  'Sidebar',
  'Sun',
  'Text',
  'Upload',
  'X',
  'XIcon',
  'ZoomIn',
  'ZoomOut',
]);
const HEROICONS_SOLID_SOURCES = new Set([
  '@heroicons/react/24/solid',
  '@heroicons/react/16/solid',
]);

export function isControlLucideGlyph(name) {
  return CONTROL_LUCIDE_GLYPHS.has(name);
}

export function getNonControlLucideImports(names) {
  return names.filter((name) => !isControlLucideGlyph(name));
}

export function isHeroiconsSource(source) {
  return source.startsWith('@heroicons/react');
}

export function isAllowedHeroiconsSource(source) {
  return HEROICONS_SOLID_SOURCES.has(source);
}

// ---------------------------------------------------------------------------
// Inter only. The site sets type in Inter (rsms.me's variable build, loaded
// locally in apps/landing/src/lib/fonts.ts) and Geist Mono for code. No other
// face is loaded, no utility switches to one, and an inline fontFamily stays
// inside that type.
const ALLOWED_GOOGLE_FONTS = new Set(['Geist_Mono']);
const INTER_FONT_FILE = /inter/i;
const ALLOWED_FONT_FAMILY_VALUE =
  /^(?:inherit|initial|unset)$|inter|geist|var\(--font|monospace/i;

export function isAllowedGoogleFont(name) {
  return ALLOWED_GOOGLE_FONTS.has(name);
}

export function isInterFontFile(path) {
  return INTER_FONT_FILE.test(path);
}

// font-serif, and any arbitrary font-[...] value that is a family rather
// than a numeric weight (font-[530] is a weight and stays legal).
export function getNonInterFontClasses(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .filter((className) => {
      const utility = getTailwindUtility(className);

      if (utility === 'font-serif') {
        return true;
      }

      if (utility.startsWith('font-[')) {
        const inner = utility.slice('font-['.length, -1);
        // a numeric value is a weight; inherit keeps the parent's face
        return !/^\d+(?:\.\d+)?$/.test(inner) && inner !== 'inherit';
      }

      return false;
    });
}

export function isAllowedFontFamilyValue(value) {
  return ALLOWED_FONT_FAMILY_VALUE.test(value.trim());
}

// ---------------------------------------------------------------------------
// Locale flags. Flags render through LocaleFlag
// (packages/ui/src/components/ui/LocaleFlag.tsx), which owns the flag-icons
// sprite classes and the fallback. Hand-written sprite classes, emoji flags
// (drawn differently by every platform) and flag images bypass it.
const FLAG_SPRITE_CLASS =
  /(?:^|\s)!?fi(?:s)?(?:\s|$)|(?:^|\s)!?fi-[a-z]{2}(?:-[a-z]+)?(?:\s|$)/;
const REGIONAL_INDICATOR_PAIR = /[\u{1F1E6}-\u{1F1FF}]{2}/u;
const FLAG_IMAGE_SOURCE = /flag/i;

export function hasRawFlagClass(value) {
  return FLAG_SPRITE_CLASS.test(value);
}

export function hasEmojiFlag(text) {
  return REGIONAL_INDICATOR_PAIR.test(text);
}

export function isFlagImageSource(source) {
  return FLAG_IMAGE_SOURCE.test(source);
}

function getImportSource(node) {
  return typeof node.source?.value === 'string' ? node.source.value : null;
}

function getJsxAttributeStringValue(openingElement, attributeName) {
  for (const attribute of openingElement.attributes ?? []) {
    if (
      attribute.type !== 'JSXAttribute' ||
      attribute.name?.name !== attributeName
    ) {
      continue;
    }

    if (attribute.value?.type === 'JSXExpressionContainer') {
      return getStringValue(attribute.value.expression);
    }

    return attribute.value ? getStringValue(attribute.value) : null;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Copy and layout laws of the landing (the brand questionnaire, the gt-landing
// skill and engine.css), each checked where a static string can carry the
// violation. Every message names the rule it enforces.

// The em dash is not used in copy; a period or a comma does its work.
const EM_DASH = /—/;
export function hasEmDash(text) {
  return EM_DASH.test(text);
}

// An eyebrow: small uppercase, tracked-out text above a heading. Section
// heads are a heading and one lead paragraph, nothing above.
export function isEyebrowClassList(value) {
  const utilities = value.split(/\s+/).filter(Boolean).map(getTailwindUtility);
  const uppercase = utilities.includes('uppercase');
  const tracked = utilities.some(
    (utility) =>
      utility === 'tracking-wide' ||
      utility === 'tracking-wider' ||
      utility === 'tracking-widest' ||
      /^tracking-\[(?:0\.\d+em|\d+px)\]$/.test(utility)
  );
  return uppercase && tracked;
}

// Every landing button is the shared Cta; hand-rolled tc-btn markup drifts.
const CTA_CLASS = /(?:^|\s)!?tc-btn(?:-[a-z0-9-]+)?(?:\s|$)/;
export function hasHandRolledCta(value) {
  return CTA_CLASS.test(value);
}

// Tailwind v4 reads text-[var(--x)] as a COLOR unless the value carries a
// length: hint (or color: to say so). An untyped var() in a text-[...]
// utility is the bug that ships a size token as an invisible color.
export function getUntypedTextVarClasses(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .filter((className) =>
      getTailwindUtility(className).startsWith('text-[var(')
    );
}

// The nearest JSX attribute above a node, or null when the node is not
// inside one. The walk stops at the attribute, at the opening element or at
// the element itself: a string in JSX child position has no attribute.
function getEnclosingJsxAttributeName(node) {
  let currentNode = node.parent;

  while (currentNode) {
    if (currentNode.type === 'JSXAttribute') {
      return typeof currentNode.name?.name === 'string'
        ? currentNode.name.name
        : null;
    }

    if (
      currentNode.type === 'JSXOpeningElement' ||
      currentNode.type === 'JSXElement' ||
      currentNode.type === 'JSXFragment' ||
      currentNode.type === 'Program'
    ) {
      return null;
    }

    currentNode = currentNode.parent;
  }

  return null;
}

// The nearest object property above a node, or null. Stops at the property
// or at any container that is not a plain expression, so a literal inside a
// conditional or a logical expression still resolves to the property that
// holds it.
function getEnclosingPropertyName(node) {
  let currentNode = node.parent;

  while (currentNode) {
    if (currentNode.type === 'Property') {
      return getPropertyName(currentNode);
    }

    if (
      currentNode.type === 'ObjectExpression' ||
      currentNode.type === 'ArrayExpression' ||
      currentNode.type === 'CallExpression' ||
      currentNode.type === 'JSXAttribute' ||
      currentNode.type === 'JSXElement' ||
      currentNode.type === 'ArrowFunctionExpression' ||
      currentNode.type === 'FunctionExpression' ||
      currentNode.type === 'FunctionDeclaration' ||
      currentNode.type === 'Program'
    ) {
      return null;
    }

    currentNode = currentNode.parent;
  }

  return null;
}

// The static entries of a style={{ ... }} object as [name, value] pairs; a
// number stays a number, a string stays a string, anything else is null.
function getStyleObjectEntries(objectExpression) {
  const entries = [];

  for (const property of objectExpression?.properties ?? []) {
    if (property.type !== 'Property') {
      continue;
    }

    const name = getPropertyName(property);
    if (!name) {
      continue;
    }

    const value =
      typeof property.value?.value === 'number'
        ? property.value.value
        : getStringValue(property.value);

    entries.push([name, value]);
  }

  return entries;
}

function getJsxStyleEntries(openingElement) {
  for (const attribute of openingElement.attributes ?? []) {
    if (
      attribute.type !== 'JSXAttribute' ||
      attribute.name?.name !== 'style' ||
      attribute.value?.type !== 'JSXExpressionContainer' ||
      attribute.value.expression?.type !== 'ObjectExpression'
    ) {
      continue;
    }

    return getStyleObjectEntries(attribute.value.expression);
  }

  return [];
}

function getAncestorClassLists(node) {
  const classLists = [];
  let currentNode = node.parent;

  while (currentNode) {
    if (currentNode.type === 'JSXElement') {
      const className = getStaticJsxClassName(currentNode.openingElement);
      if (className) {
        classLists.push(className);
      }
    }

    currentNode = currentNode.parent;
  }

  return classLists;
}

function getTailwindUtilities(value) {
  return value.split(/\s+/).filter(Boolean).map(getTailwindUtility);
}

// An eyebrow written as an inline style: textTransform uppercase plus a
// positive letterSpacing in the same style object.
export function isEyebrowStyleEntries(entries) {
  const uppercase = entries.some(
    ([name, value]) => name === 'textTransform' && value === 'uppercase'
  );
  const tracked = entries.some(([name, value]) => {
    if (name !== 'letterSpacing' || value === null) {
      return false;
    }
    if (typeof value === 'number') {
      return value > 0;
    }
    return value !== 'normal' && !/^-|^0(?:[a-z%]+)?$/.test(value.trim());
  });
  return uppercase && tracked;
}

// Colours come from tokens. A hex literal inside a Tailwind arbitrary value
// (bg-[#0a0a0a], [--x:#fff]) bypasses the theme in any string; a bare hex
// value bypasses it when it sits in a style or className attribute. Canvas,
// raster and satori code keep their literal colours, so a hex in a plain
// string is not the rule's business.
const HEX_IN_UTILITY =
  /\b[a-z-]+-\[[^\]]*#[0-9a-fA-F]{3,8}(?![0-9a-zA-Z])[^\]]*\]|\[[a-z-]+:#[0-9a-fA-F]{3,8}(?![0-9a-zA-Z])[^\]]*\]/;
const HEX_VALUE = /^#[0-9a-fA-F]{3,8}$/;
const HEX_TOKEN = /(?:^|[\s(,])#[0-9a-fA-F]{3,8}(?=$|[\s),;])/;
const STYLE_ATTRIBUTES = new Set(['style', 'className', 'class']);
export function hasHexColorUtility(value) {
  return HEX_IN_UTILITY.test(value);
}
export function isHexColorValue(value) {
  return HEX_VALUE.test(value.trim());
}
// A whole hex value, or a hex token inside a longer value ('1px solid #fff').
export function hasHexColorToken(value) {
  return isHexColorValue(value) || HEX_TOKEN.test(value);
}
export function isStyleAttributeName(name) {
  return name !== null && STYLE_ATTRIBUTES.has(name);
}

// Mono is an instrument voice (code, tokens, numbers), never the voice of a
// heading or a paragraph.
const VOICE_ELEMENTS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p']);
const MONO_FONT_FAMILY = /mono|menlo|courier|consolas|sf mono/i;
export function isMonoVoice(elementName, className) {
  if (!VOICE_ELEMENTS.has(elementName)) {
    return false;
  }
  return getTailwindUtilities(className).some(
    (utility) => utility === 'font-mono' || utility === 'font-tc-mono'
  );
}
export function isMonoFontFamily(value) {
  return MONO_FONT_FAMILY.test(value);
}
export function isVoiceElement(elementName) {
  return VOICE_ELEMENTS.has(elementName);
}

// One rail. The .tc-rail wrapper draws the column's pair once; a band or a
// section inside it draws no side rails, a wrapper never nests in a wrapper,
// no element stacks two full-height side-border siblings, and the outer pair
// at +-10px (--tc-rail-outer) is retired.
const SIDE_BORDER_WIDTH = /^border-(x|l|r)(?:-\d+(?:\.\d+)?|-\[\d[^\]]*\])?$/;
const ARBITRARY_BORDER_INLINE = /^\[border-inline(?:-width)?:/;
function drawsSideRails(utilities) {
  const sides = new Set();
  for (const utility of utilities) {
    const match = utility.match(SIDE_BORDER_WIDTH);
    if (match) {
      sides.add(match[1]);
    } else if (ARBITRARY_BORDER_INLINE.test(utility)) {
      sides.add('x');
    }
  }
  return sides.has('x') || (sides.has('l') && sides.has('r'));
}
export function isDoubleRailClassList(value) {
  const utilities = getTailwindUtilities(value);
  const inRail = utilities.includes('tc-sec') || utilities.includes('tc-band');
  return (
    (inRail && drawsSideRails(utilities)) ||
    utilities.some((utility) => utility.includes('tc-rail-outer'))
  );
}
export function isNestedRailWrapper(value, ancestorClassLists) {
  if (!getTailwindUtilities(value).includes('tc-rail')) {
    return false;
  }
  return ancestorClassLists.some((classList) =>
    getTailwindUtilities(classList).includes('tc-rail')
  );
}
// A hand-drawn rail pair: an absolutely positioned, full-height element that
// draws both side borders. Two of them under one parent are two pairs.
export function isRailPairClassList(value) {
  const utilities = getTailwindUtilities(value);
  const positioned =
    utilities.includes('absolute') || utilities.includes('fixed');
  const fullHeight =
    utilities.includes('inset-y-0') ||
    utilities.includes('inset-0') ||
    utilities.includes('h-full') ||
    (utilities.includes('top-0') && utilities.includes('bottom-0'));
  return positioned && fullHeight && drawsSideRails(utilities);
}
export function countRailPairs(childClassNames) {
  return childClassNames.filter(isRailPairClassList).length;
}

// The site does not smooth-scroll (brand questionnaire avoid-list): no
// scroll-smooth utility, no scrollBehavior: smooth, no scroll library.
const SCROLL_LIBRARIES = new Set([
  'lenis',
  'lenis/react',
  '@studio-freight/lenis',
  '@studio-freight/react-lenis',
  'locomotive-scroll',
  'smooth-scrollbar',
  'react-smooth-scroll',
  'react-scroll',
]);
const PAGE_SCROLL_OBJECTS = new Set(['window', 'globalThis', 'document']);
export function hasSmoothScrollClass(value) {
  return getTailwindUtilities(value).includes('scroll-smooth');
}
export function isScrollLibrary(source) {
  return SCROLL_LIBRARIES.has(source);
}
// scrollBehavior is the CSS property: always the page. A behavior option
// is the page when the call is scrollIntoView, or scrollTo / scroll /
// scrollBy on window or document; the same option on an element (a
// carousel track paging) is a control transition and passes.
export function isPageSmoothScroll(propertyName, value, call) {
  if (value !== 'smooth') {
    return false;
  }
  if (propertyName === 'scrollBehavior') {
    return true;
  }
  if (propertyName !== 'behavior' || !call) {
    return false;
  }
  if (call.method === 'scrollIntoView') {
    return true;
  }
  return (
    (call.method === 'scrollTo' ||
      call.method === 'scroll' ||
      call.method === 'scrollBy') &&
    call.objectName !== null &&
    PAGE_SCROLL_OBJECTS.has(call.objectName)
  );
}

// The member call whose argument list holds the node: { method, objectName }
// with objectName the root identifier (window, document, a ref) or null.
function getEnclosingMemberCall(node) {
  let currentNode = node.parent;

  while (currentNode && currentNode.type !== 'CallExpression') {
    if (
      currentNode.type === 'ArrowFunctionExpression' ||
      currentNode.type === 'FunctionExpression' ||
      currentNode.type === 'FunctionDeclaration' ||
      currentNode.type === 'JSXElement' ||
      currentNode.type === 'Program'
    ) {
      return null;
    }
    currentNode = currentNode.parent;
  }

  const callee = currentNode?.callee;
  if (callee?.type !== 'MemberExpression') {
    return null;
  }

  let object = callee.object;
  while (object?.type === 'MemberExpression') {
    object = object.object;
  }

  return {
    method:
      typeof callee.property?.name === 'string' ? callee.property.name : null,
    objectName: object?.type === 'Identifier' ? object.name : null,
  };
}

// A heading is a plain line with no trailing period (plain technical
// English). An ellipsis, a question mark or an exclamation mark is not a
// period.
export function endsWithPeriod(text) {
  const trimmed = text.trim();
  return trimmed.endsWith('.') && !trimmed.endsWith('..');
}
const HEADING_ELEMENT = /^h[1-6]$/;
export function isHeadingElement(elementName) {
  return HEADING_ELEMENT.test(elementName);
}

// Marks are drawn: an SVG, the canvas field or LocadexMark. A gif is never a
// mark.
const GIF_SOURCE = /\.gif(?:$|[?#])/i;
export function isGifSource(source) {
  return GIF_SOURCE.test(source.trim());
}
const MEDIA_ELEMENTS = new Set(['img', 'Image', 'video', 'source', 'picture']);
const MEDIA_SOURCE_ATTRIBUTES = ['src', 'poster', 'srcSet'];
export function isMediaElement(elementName) {
  return MEDIA_ELEMENTS.has(elementName);
}

// Cta labels are Title Case: every word capitalised except a short function
// word after the first. Interpolations, symbols and numbers pass.
const SMALL_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'but',
  'by',
  'for',
  'in',
  'nor',
  'of',
  'on',
  'or',
  'the',
  'to',
  'vs',
  'with',
]);
export function isTitleCaseLabel(label) {
  const words = label.trim().split(/\s+/).filter(Boolean);
  return words.every((word, index) => {
    if (word.startsWith('{')) {
      return true;
    }
    const stripped = word.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '');
    if (!stripped || !/^[A-Za-z]/.test(stripped)) {
      return true;
    }
    if (index > 0 && SMALL_WORDS.has(stripped.toLowerCase())) {
      return true;
    }
    return /^[A-Z]/.test(stripped);
  });
}

// The static label strings an expression can produce: a literal, the first
// argument of gt()/t(), or each branch of a conditional or a fallback.
function collectStaticLabels(expression) {
  if (!expression) {
    return [];
  }

  switch (expression.type) {
    case 'Literal': {
      const value = getStringValue(expression);
      return typeof value === 'string' ? [value] : [];
    }
    case 'CallExpression': {
      const callee = expression.callee;
      if (
        callee?.type === 'Identifier' &&
        (callee.name === 'gt' || callee.name === 't')
      ) {
        return collectStaticLabels(expression.arguments?.[0]);
      }
      return [];
    }
    case 'ConditionalExpression':
      return [
        ...collectStaticLabels(expression.consequent),
        ...collectStaticLabels(expression.alternate),
      ];
    case 'LogicalExpression':
      return [
        ...collectStaticLabels(expression.left),
        ...collectStaticLabels(expression.right),
      ];
    case 'JSXExpressionContainer':
      return collectStaticLabels(expression.expression);
    default:
      return [];
  }
}

// The static text pieces of an element's children, in order. Text inside an
// inline wrapper (<T>, <span>, <em>, <strong>) counts as the heading's own.
const INLINE_TEXT_WRAPPERS = new Set(['T', 'span', 'em', 'strong', 'b', 'i']);
function collectChildText(children) {
  const pieces = [];

  for (const child of children ?? []) {
    if (child.type === 'JSXText') {
      if (child.value.trim()) {
        pieces.push(child.value);
      }
      continue;
    }

    if (child.type === 'JSXExpressionContainer') {
      pieces.push(...collectStaticLabels(child.expression));
      continue;
    }

    if (child.type === 'JSXElement') {
      const name = getJsxElementName(child.openingElement);
      if (name && INLINE_TEXT_WRAPPERS.has(name)) {
        pieces.push(...collectChildText(child.children));
      }
    }
  }

  return pieces;
}

const plugin = {
  rules: {
    'no-use-effect': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          directUseEffect:
            'Direct useEffect is banned. Use useMountEffect for mount-only effects, useMounted for hydration guards, or derive state / use event handlers instead. See packages/ui/design-guide/why-we-banned-useeffect.md',
        },
      },
      create(context) {
        return {
          CallExpression(node) {
            if (
              node.callee?.type === 'Identifier' &&
              node.callee.name === 'useEffect'
            ) {
              reportRestrictedNode(context, node, 'directUseEffect');
            }
          },
        };
      },
    },
    'no-dynamic-import': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          dynamicImport:
            'Dynamic import() is banned. Use static imports instead. See CLAUDE.md Code Style.',
        },
      },
      create(context) {
        return {
          ImportExpression(node) {
            reportRestrictedNode(context, node, 'dynamicImport');
          },
        };
      },
    },
    'no-raw-tailwind-colors': createStringRule(
      RAW_TAILWIND_COLOR,
      'Do not use raw Tailwind color classes. Use semantic design tokens instead (e.g. text-foreground, bg-muted, text-status-success, bg-status-error-background). See packages/ui/design-guide/colors.md'
    ),
    'no-hardcoded-black-white': createStringRule(
      HARDCODED_BLACK_WHITE,
      'Do not use text-white, text-black, bg-white, or bg-black. Use semantic tokens instead (e.g. text-foreground, bg-background). Opacity variants like bg-black/50 for overlays are allowed. See packages/ui/design-guide/colors.md'
    ),
    'consistent-radius': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          inconsistentRadius:
            'Use rounded-md (including directional -md variants) for UI surfaces. rounded-full is reserved for inherently circular or pill-shaped elements; all other radius utilities are forbidden.',
          inlineBorderRadius:
            'Inline border-radius styles bypass the design system. Use rounded-md (or a directional -md variant) instead.',
        },
      },
      create(context) {
        function checkNode(node) {
          const value = getStringValue(node);

          if (value && getInvalidRadiusClasses(value).length > 0) {
            context.report({ node, messageId: 'inconsistentRadius' });
          }
        }

        return {
          Literal: checkNode,
          TemplateElement: checkNode,
          Property(node) {
            const propertyName = getPropertyName(node);

            if (
              propertyName &&
              isInlineBorderRadiusPropertyName(propertyName) &&
              !isDesignSystemRadiusValue(getStringValue(node.value))
            ) {
              context.report({ node, messageId: 'inlineBorderRadius' });
            }
          },
        };
      },
    },
    'prefer-parent-owned-spacing': {
      meta: {
        type: 'suggestion',
        schema: [],
        messages: {
          repeatedSiblingMargins:
            'Use gap-* or space-* on the flex parent instead of repeated main-axis margins on direct siblings.',
        },
      },
      create(context) {
        return {
          JSXElement(node) {
            const parentClassName = getStaticJsxClassName(node.openingElement);
            if (!parentClassName) {
              return;
            }

            const childClassNames = node.children
              .filter((child) => child.type === 'JSXElement')
              .map((child) => getStaticJsxClassName(child.openingElement))
              .filter((className) => className !== null);

            if (hasRepeatedSiblingMargins(parentClassName, childClassNames)) {
              context.report({
                node: node.openingElement,
                messageId: 'repeatedSiblingMargins',
              });
            }
          },
        };
      },
    },
    'no-nested-surfaces': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          nestedSurface:
            'Do not nest Card inside Card. Use spacing and typography to organize the outer Card, or make the inner content a sibling surface.',
        },
      },
      create(context) {
        return {
          JSXElement(node) {
            const elementName = getJsxElementName(node.openingElement);

            if (
              elementName &&
              isNestedSurface(elementName, getAncestorElementNames(node))
            ) {
              context.report({
                node: node.openingElement,
                messageId: 'nestedSurface',
              });
            }
          },
        };
      },
    },
    'no-thin-font': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          restrictedString:
            'Do not use font-light or font-thin. Minimum weight is font-normal (400). See STYLE_GUIDE.md section 6.2.',
          thinInlineWeight:
            'An inline fontWeight below 400 is a thin face. Minimum weight is 400. See STYLE_GUIDE.md section 6.2.',
        },
      },
      create(context) {
        function checkNode(node) {
          const value = getStringValue(node);
          if (value && THIN_FONT.test(value)) {
            reportRestrictedNode(context, node, 'restrictedString');
          }
        }

        return {
          Literal: checkNode,
          TemplateElement: checkNode,
          Property(node) {
            if (getPropertyName(node) !== 'fontWeight') {
              return;
            }

            const raw =
              typeof node.value?.value === 'number'
                ? node.value.value
                : Number(getStringValue(node.value));

            if (Number.isFinite(raw) && raw > 0 && raw < 400) {
              context.report({ node, messageId: 'thinInlineWeight' });
            }
          },
        };
      },
    },
    'icon-tiers': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          nonControlLucide:
            "`{{name}}` from lucide-react is not a control glyph (arrows, chevrons, close, copy, search, loaders, toggles). A mark that carries meaning is Heroicons solid: import it from '@heroicons/react/24/solid' ('16/solid' inline with text) and size it with a class. If this really is a control, add it to CONTROL_LUCIDE_GLYPHS in tooling/oxlint-plugins/gt-ui.ts.",
          lucideNamespace:
            'Importing the whole lucide-react namespace hides which glyphs are drawn. Import the control glyphs by name.',
          lucideIconType:
            'Type an icon slot as ComponentType<SVGProps<SVGSVGElement>> so a Heroicons mark fits; the LucideIcon type invites an outline glyph into a meaning slot.',
          heroiconsSet:
            "Only the solid Heroicons sets are used: '@heroicons/react/24/solid', or '16/solid' for a mark set inline with text. Outline glyphs are Lucide controls.",
        },
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            const source = getImportSource(node);

            if (source === 'lucide-react') {
              for (const specifier of node.specifiers ?? []) {
                if (specifier.type === 'ImportNamespaceSpecifier') {
                  context.report({
                    node: specifier,
                    messageId: 'lucideNamespace',
                  });
                  continue;
                }

                if (specifier.type !== 'ImportSpecifier') {
                  continue;
                }

                const name =
                  specifier.imported?.name ??
                  getStringValue(specifier.imported);

                if (name === 'LucideIcon' || name === 'LucideProps') {
                  context.report({
                    node: specifier,
                    messageId: 'lucideIconType',
                  });
                } else if (name && !isControlLucideGlyph(name)) {
                  context.report({
                    node: specifier,
                    messageId: 'nonControlLucide',
                    data: { name },
                  });
                }
              }
              return;
            }

            if (
              source &&
              isHeroiconsSource(source) &&
              !isAllowedHeroiconsSource(source)
            ) {
              context.report({ node, messageId: 'heroiconsSet' });
            }
          },
        };
      },
    },
    'inter-only': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          googleFont:
            'Type is Inter (local, apps/landing/src/lib/fonts.ts) and Geist Mono only; `{{name}}` from next/font/google is another face.',
          localFontFile:
            'localFont loads Inter builds only; `{{path}}` is another face.',
          fontClass:
            '`{{className}}` sets a face outside Inter. Use font-sans, font-mono or the tc font tokens.',
          fontFamilyStyle:
            'An inline fontFamily stays inside the site type: inherit, a --font variable, Inter, Geist or the mono stack.',
        },
      },
      create(context) {
        function checkClassString(node) {
          const value = getStringValue(node);

          if (!value) {
            return;
          }

          for (const className of getNonInterFontClasses(value)) {
            context.report({
              node,
              messageId: 'fontClass',
              data: { className },
            });
          }
        }

        return {
          ImportDeclaration(node) {
            if (getImportSource(node) !== 'next/font/google') {
              return;
            }

            for (const specifier of node.specifiers ?? []) {
              if (specifier.type !== 'ImportSpecifier') {
                continue;
              }

              const name = specifier.imported?.name ?? '';

              if (!isAllowedGoogleFont(name)) {
                context.report({
                  node: specifier,
                  messageId: 'googleFont',
                  data: { name },
                });
              }
            }
          },
          CallExpression(node) {
            if (
              node.callee?.type !== 'Identifier' ||
              node.callee.name !== 'localFont'
            ) {
              return;
            }

            const options = node.arguments?.[0];

            if (options?.type !== 'ObjectExpression') {
              return;
            }

            for (const property of options.properties ?? []) {
              if (
                property.type !== 'Property' ||
                getPropertyName(property) !== 'src'
              ) {
                continue;
              }

              const sources =
                property.value?.type === 'ArrayExpression'
                  ? property.value.elements
                  : [property.value];

              for (const entry of sources) {
                const path =
                  entry?.type === 'ObjectExpression'
                    ? getStringValue(
                        (entry.properties ?? []).find(
                          (item) =>
                            item.type === 'Property' &&
                            getPropertyName(item) === 'path'
                        )?.value ?? {}
                      )
                    : getStringValue(entry ?? {});

                if (path && !isInterFontFile(path)) {
                  context.report({
                    node: entry,
                    messageId: 'localFontFile',
                    data: { path },
                  });
                }
              }
            }
          },
          Literal: checkClassString,
          TemplateElement: checkClassString,
          Property(node) {
            if (getPropertyName(node) !== 'fontFamily') {
              return;
            }

            const value = getStringValue(node.value);

            if (value && !isAllowedFontFamilyValue(value)) {
              context.report({ node, messageId: 'fontFamilyStyle' });
            }
          },
        };
      },
    },
    'no-raw-locale-flags': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          flagClass:
            'Flags render through LocaleFlag (packages/ui/src/components/ui/LocaleFlag.tsx), which owns the flag-icons sprite classes; do not write fi / fi-xx classes by hand.',
          emojiFlag:
            'Emoji flags render differently on every platform; render the flag with LocaleFlag.',
          flagImage:
            'Flag images are not used; LocaleFlag draws flags from the sprite.',
        },
      },
      create(context) {
        function checkString(node) {
          const value = getStringValue(node);

          if (!value) {
            return;
          }

          if (hasRawFlagClass(value)) {
            context.report({ node, messageId: 'flagClass' });
          }

          if (hasEmojiFlag(value)) {
            context.report({ node, messageId: 'emojiFlag' });
          }
        }

        return {
          Literal: checkString,
          TemplateElement: checkString,
          JSXText(node) {
            if (typeof node.value === 'string' && hasEmojiFlag(node.value)) {
              context.report({ node, messageId: 'emojiFlag' });
            }
          },
          JSXOpeningElement(node) {
            const name = getJsxElementName(node);

            if (name !== 'img' && name !== 'Image') {
              return;
            }

            const source = getJsxAttributeStringValue(node, 'src');

            if (source && isFlagImageSource(source)) {
              context.report({ node, messageId: 'flagImage' });
            }
          },
        };
      },
    },
    'no-em-dash': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          emDash:
            'Copy does not use the em dash; end the sentence or use a comma. (Brand questionnaire, plain technical English.)',
        },
      },
      create(context) {
        function check(node) {
          const value = getStringValue(node);
          if (value && hasEmDash(value)) {
            context.report({ node, messageId: 'emDash' });
          }
        }
        return {
          Literal: check,
          TemplateElement: check,
          JSXText(node) {
            if (typeof node.value === 'string' && hasEmDash(node.value)) {
              context.report({ node, messageId: 'emDash' });
            }
          },
        };
      },
    },
    'no-eyebrow': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          eyebrow:
            'No eyebrow labels: a section head is a heading and one lead paragraph. Drop the uppercase tracked line above it.',
        },
      },
      create(context) {
        function check(node) {
          const value = getStringValue(node);
          if (value && isEyebrowClassList(value)) {
            context.report({ node, messageId: 'eyebrow' });
          }
        }
        return {
          Literal: check,
          TemplateElement: check,
          JSXAttribute(node) {
            if (
              node.name?.name !== 'style' ||
              node.value?.type !== 'JSXExpressionContainer' ||
              node.value.expression?.type !== 'ObjectExpression'
            ) {
              return;
            }

            if (
              isEyebrowStyleEntries(
                getStyleObjectEntries(node.value.expression)
              )
            ) {
              context.report({ node, messageId: 'eyebrow' });
            }
          },
        };
      },
    },
    'shared-cta': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          handRolled:
            'Every landing button is the shared Cta (src/components/landing/shared/Cta.tsx); do not hand-roll tc-btn markup.',
        },
      },
      create(context) {
        function check(node) {
          const value = getStringValue(node);
          if (value && hasHandRolledCta(value)) {
            context.report({ node, messageId: 'handRolled' });
          }
        }
        return { Literal: check, TemplateElement: check };
      },
    },
    'typed-text-var': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          untyped:
            '`{{className}}`: Tailwind reads an untyped var() in text-[...] as a colour. Write text-[length:var(--x)] for a size, text-[color:var(--x)] for a colour.',
        },
      },
      create(context) {
        function check(node) {
          const value = getStringValue(node);
          if (!value) return;
          for (const className of getUntypedTextVarClasses(value)) {
            context.report({ node, messageId: 'untyped', data: { className } });
          }
        }
        return { Literal: check, TemplateElement: check };
      },
    },
    'no-hex-colors': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          hexUtility:
            'A hex colour in a utility bypasses the theme tokens; use a semantic token (text-foreground, bg-tc-card, border-tc-hair).',
          hexValue:
            'A hex colour in a style attribute bypasses the theme tokens; use a token variable.',
        },
      },
      create(context) {
        function check(node) {
          const value = getStringValue(node);
          if (!value) return;
          if (hasHexColorUtility(value)) {
            context.report({ node, messageId: 'hexUtility' });
            return;
          }
          if (
            isStyleAttributeName(getEnclosingJsxAttributeName(node)) &&
            hasHexColorToken(value)
          ) {
            context.report({ node, messageId: 'hexValue' });
          }
        }
        return { Literal: check, TemplateElement: check };
      },
    },
    'mono-is-not-voice': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          monoVoice:
            'Mono is an instrument voice for code, tokens and numbers; a heading or paragraph is set in the sans.',
        },
      },
      create(context) {
        return {
          JSXOpeningElement(node) {
            const name = getJsxElementName(node);
            if (!name || !isVoiceElement(name)) {
              return;
            }

            const className = getStaticJsxClassName(node);
            if (className && isMonoVoice(name, className)) {
              context.report({ node, messageId: 'monoVoice' });
              return;
            }

            const fontFamily = getJsxStyleEntries(node).find(
              ([property]) => property === 'fontFamily'
            )?.[1];
            if (
              typeof fontFamily === 'string' &&
              isMonoFontFamily(fontFamily)
            ) {
              context.report({ node, messageId: 'monoVoice' });
            }
          },
        };
      },
    },
    'single-rail': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          doubleRail:
            'One rail: the .tc-rail wrapper draws the column pair once. A band inside it draws no side rails, and the outer pair at +-10px (--tc-rail-outer) is retired.',
          nestedRail:
            'One rail: a .tc-rail wrapper inside another .tc-rail wrapper draws the column pair twice. Keep one wrapper per page column.',
          stackedRailPairs:
            'One rail: this element stacks {{count}} full-height side-border children, which is {{count}} rail pairs. Draw the pair once, or let the .tc-rail wrapper draw it.',
        },
      },
      create(context) {
        function check(node) {
          const value = getStringValue(node);
          if (value && isDoubleRailClassList(value)) {
            context.report({ node, messageId: 'doubleRail' });
          }
        }

        function checkChildren(node, reportNode) {
          const childClassNames = (node.children ?? [])
            .filter((child) => child.type === 'JSXElement')
            .map((child) => getStaticJsxClassName(child.openingElement))
            .filter((className) => className !== null);
          const count = countRailPairs(childClassNames);

          if (count >= 2) {
            context.report({
              node: reportNode,
              messageId: 'stackedRailPairs',
              data: { count: String(count) },
            });
          }
        }

        return {
          Literal: check,
          TemplateElement: check,
          JSXElement(node) {
            const className = getStaticJsxClassName(node.openingElement);
            if (
              className &&
              isNestedRailWrapper(className, getAncestorClassLists(node))
            ) {
              context.report({
                node: node.openingElement,
                messageId: 'nestedRail',
              });
            }
            checkChildren(node, node.openingElement);
          },
          JSXFragment(node) {
            checkChildren(node, node.openingFragment ?? node);
          },
        };
      },
    },
    'no-smooth-scroll': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          smoothClass:
            'The site does not smooth-scroll (brand questionnaire avoid-list). Remove scroll-smooth; navigation jumps.',
          smoothProperty:
            'The site does not smooth-scroll (brand questionnaire avoid-list). Use behavior: "auto" or drop the option.',
          scrollLibrary:
            'The site does not smooth-scroll (brand questionnaire avoid-list); `{{source}}` is a scroll library. Native scrolling only.',
        },
      },
      create(context) {
        function checkClassString(node) {
          const value = getStringValue(node);
          if (value && hasSmoothScrollClass(value)) {
            context.report({ node, messageId: 'smoothClass' });
          }
        }

        return {
          ImportDeclaration(node) {
            const source = getImportSource(node);
            if (source && isScrollLibrary(source)) {
              context.report({
                node,
                messageId: 'scrollLibrary',
                data: { source },
              });
            }
          },
          TemplateElement: checkClassString,
          Literal(node) {
            const value = getStringValue(node);
            if (!value) {
              return;
            }

            if (hasSmoothScrollClass(value)) {
              context.report({ node, messageId: 'smoothClass' });
              return;
            }

            if (value !== 'smooth') {
              return;
            }

            if (
              isPageSmoothScroll(
                getEnclosingPropertyName(node),
                value,
                getEnclosingMemberCall(node)
              )
            ) {
              context.report({ node, messageId: 'smoothProperty' });
              return;
            }

            // element.style.scrollBehavior = 'smooth'
            const parent = node.parent;
            if (
              parent?.type === 'AssignmentExpression' &&
              parent.left?.type === 'MemberExpression' &&
              parent.left.property?.name === 'scrollBehavior'
            ) {
              context.report({ node, messageId: 'smoothProperty' });
            }
          },
        };
      },
    },
    'no-heading-period': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          trailingPeriod:
            'A heading is a plain line with no trailing period (plain technical English). Drop the period.',
        },
      },
      create(context) {
        return {
          JSXElement(node) {
            const name = getJsxElementName(node.openingElement);
            if (!name || !isHeadingElement(name)) {
              return;
            }

            const pieces = collectChildText(node.children);
            const last = pieces[pieces.length - 1];
            if (typeof last === 'string' && endsWithPeriod(last)) {
              context.report({
                node: node.openingElement,
                messageId: 'trailingPeriod',
              });
            }
          },
        };
      },
    },
    'no-gif-mark': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          gifMark:
            'Marks are drawn (an SVG, the canvas field, LocadexMark); a gif is never a mark or a demo frame.',
        },
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            const source = getImportSource(node);
            if (source && isGifSource(source)) {
              context.report({ node, messageId: 'gifMark' });
            }
          },
          JSXOpeningElement(node) {
            const name = getJsxElementName(node);
            if (!name || !isMediaElement(name)) {
              return;
            }

            for (const attributeName of MEDIA_SOURCE_ATTRIBUTES) {
              const source = getJsxAttributeStringValue(node, attributeName);
              if (source && isGifSource(source)) {
                context.report({ node, messageId: 'gifMark' });
                return;
              }
            }
          },
        };
      },
    },
    'cta-title-case': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          titleCase:
            'Cta labels are Title Case (`{{label}}` is not). Capitalise every word except a short function word after the first.',
        },
      },
      create(context) {
        return {
          JSXElement(node) {
            if (getJsxElementName(node.openingElement) !== 'Cta') {
              return;
            }

            for (const label of collectChildText(node.children)) {
              if (label.trim() && !isTitleCaseLabel(label)) {
                context.report({
                  node: node.openingElement,
                  messageId: 'titleCase',
                  data: { label: label.trim() },
                });
              }
            }
          },
        };
      },
    },
    'no-unknown-type': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          explicitUnknown:
            'Explicit `unknown` type is banned. Use a specific type instead, or add an oxlint-disable comment with justification.',
        },
      },
      create(context) {
        return {
          TSUnknownKeyword(node) {
            reportRestrictedNode(context, node, 'explicitUnknown');
          },
        };
      },
    },
  },
};

export default plugin;
