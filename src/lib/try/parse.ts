export type HreflangAlternate = {
  hreflang: string;
  href: string;
  abs: string | null;
};

export type SitemapAlternate = {
  hreflang: string;
  href: string;
};

export type SitemapEntry = {
  loc: string;
  alternates: SitemapAlternate[];
};

export type ParsedSitemap = {
  kind: 'index' | 'urlset' | 'other';
  childSitemaps: string[];
  entries: SitemapEntry[];
};

export type ParsedPage = {
  url: string;
  lang: string;
  dir: string;
  title: string;
  metaDesc: string;
  ogTitle: string;
  ogDesc: string;
  ogLocale: string;
  metaCharset: string;
  alternates: HreflangAlternate[];
  chunks: string[];
  bodyText: string;
  hasReplacementChars: boolean;
  /* Verbatim evidence captured before any DOM normalization: the html open
     tag exactly as served, and the raw hreflang link tags (first 15). */
  htmlOpenTag: string;
  rawHreflangTags: string[];
};

function toAbs(href: string, baseUrl: string): string | null {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return null;
  }
}

/* Sitemaps are parsed with namespace-tolerant regexes instead of an XML
   library: the only shapes needed are <loc> values and xhtml:link alternate
   tags, and real-world feeds vary their namespace prefixes freely. */
const SITEMAP_MAX_CHILDREN = 50;
const SITEMAP_MAX_ENTRIES = 500;

/* Numeric entities outside the Unicode scalar range (or lone surrogates)
   stay literal: String.fromCodePoint would throw, and one malformed entity
   must not abort sitemap parsing. */
function decodeCodePoint(entity: string, cp: number): string {
  const scalar =
    Number.isInteger(cp) &&
    cp >= 0 &&
    cp <= 0x10ffff &&
    !(cp >= 0xd800 && cp <= 0xdfff);
  return scalar ? String.fromCodePoint(cp) : entity;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (entity, hex: string) =>
      decodeCodePoint(entity, parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (entity, dec: string) =>
      decodeCodePoint(entity, Number(dec))
    )
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/* Linear block extraction: one token pass pairing opening and closing
   tags, stopping at `max`. A lazy [\s\S]*? block regex goes quadratic on
   a feed of unclosed tags, which a hostile sitemap can serve. */
function tagBlocks(xml: string, name: string, max: number): string[] {
  const token = new RegExp(`<(/?)(?:[\\w-]+:)?${name}(?=[\\s/>])[^>]*>`, 'gi');
  const blocks: string[] = [];
  let open = -1;
  let m: RegExpExecArray | null;
  while (blocks.length < max && (m = token.exec(xml)) !== null) {
    if (m[1]) {
      if (open >= 0) {
        blocks.push(xml.slice(open, m.index + m[0].length));
        open = -1;
      }
    } else if (open < 0) {
      open = m.index;
    }
  }
  return blocks;
}

function locOf(block: string): string {
  const m = /<(?:[\w-]+:)?loc\s*>([\s\S]*?)<\/(?:[\w-]+:)?loc\s*>/i.exec(block);
  return m?.[1] ? decodeXmlEntities(m[1].trim()) : '';
}

function attrOf(tag: string, name: string): string {
  const m = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i').exec(tag);
  return decodeXmlEntities((m?.[2] ?? m?.[3] ?? '').trim());
}

// Extract url entries (with their hreflang alternates) or child sitemap
// locations from one sitemap.xml document.
export function parseSitemap(xml: string): ParsedSitemap {
  const kind: ParsedSitemap['kind'] = /<(?:[\w-]+:)?sitemapindex[\s>]/i.test(
    xml
  )
    ? 'index'
    : /<(?:[\w-]+:)?urlset[\s>]/i.test(xml)
      ? 'urlset'
      : 'other';
  const childSitemaps: string[] = [];
  const entries: SitemapEntry[] = [];
  if (kind === 'index') {
    for (const block of tagBlocks(xml, 'sitemap', SITEMAP_MAX_CHILDREN)) {
      const loc = locOf(block);
      if (loc) childSitemaps.push(loc);
    }
  } else if (kind === 'urlset') {
    for (const block of tagBlocks(xml, 'url', SITEMAP_MAX_ENTRIES)) {
      const loc = locOf(block);
      if (!loc) continue;
      const alternates: SitemapAlternate[] = [];
      const links = block.match(/<(?:[\w-]+:)?link\b[^>]*>/gi) || [];
      for (const tag of links) {
        if (!/rel\s*=\s*["']alternate["']/i.test(tag)) continue;
        const hreflang = attrOf(tag, 'hreflang');
        const href = attrOf(tag, 'href');
        if (hreflang && href) alternates.push({ hreflang, href });
      }
      entries.push({ loc, alternates });
    }
  }
  return { kind, childSitemaps, entries };
}

const MAX_RAW_HREFLANG_TAGS = 15;
const MAX_RAW_TAG_CHARS = 300;

/* Verbatim capture off the raw markup, before the structured pass below
   normalizes attribute order and quoting: the report shows what the
   server sent. */
function captureRawEvidence(html: string): {
  htmlOpenTag: string;
  rawHreflangTags: string[];
} {
  const htmlOpenTag = (/<html\b[^>]*>/i.exec(html)?.[0] || '').slice(0, 500);
  const rawHreflangTags: string[] = [];
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    if (rawHreflangTags.length >= MAX_RAW_HREFLANG_TAGS) break;
    if (
      /\brel\s*=\s*["']?alternate\b/i.test(tag) &&
      /\bhreflang\s*=/i.test(tag)
    ) {
      rawHreflangTags.push(tag.slice(0, MAX_RAW_TAG_CHARS));
    }
  }
  return { htmlOpenTag, rawHreflangTags };
}

/* ------------------------------------------------------------------ */
/* HTML page scanning.                                                 */
/*                                                                     */
/* The page is read with one linear tag scan in the same spirit as the */
/* sitemap scanner above: the graders only need head metadata, the     */
/* hreflang links, and enough visible text to measure languages, so a  */
/* full DOM library earns nothing this pass cannot do. The scan        */
/* mirrors the browser behaviors that matter for those outputs: raw    */
/* text elements, implied end tags, head/body attribution, and HTML    */
/* character references.                                               */
/* ------------------------------------------------------------------ */

/* Named character references that appear in real page text: the ASCII
   core, the full Latin-1 set (entity-encoded accents shift language
   detection), and the common punctuation and symbol names. Unknown
   names stay literal. */
const NAMED_ENTITIES: Record<string, number> = {
  amp: 38,
  lt: 60,
  gt: 62,
  quot: 34,
  apos: 39,
  nbsp: 160,
  iexcl: 161,
  cent: 162,
  pound: 163,
  curren: 164,
  yen: 165,
  brvbar: 166,
  sect: 167,
  uml: 168,
  copy: 169,
  ordf: 170,
  laquo: 171,
  not: 172,
  shy: 173,
  reg: 174,
  macr: 175,
  deg: 176,
  plusmn: 177,
  sup2: 178,
  sup3: 179,
  acute: 180,
  micro: 181,
  para: 182,
  middot: 183,
  cedil: 184,
  sup1: 185,
  ordm: 186,
  raquo: 187,
  frac14: 188,
  frac12: 189,
  frac34: 190,
  iquest: 191,
  Agrave: 192,
  Aacute: 193,
  Acirc: 194,
  Atilde: 195,
  Auml: 196,
  Aring: 197,
  AElig: 198,
  Ccedil: 199,
  Egrave: 200,
  Eacute: 201,
  Ecirc: 202,
  Euml: 203,
  Igrave: 204,
  Iacute: 205,
  Icirc: 206,
  Iuml: 207,
  ETH: 208,
  Ntilde: 209,
  Ograve: 210,
  Oacute: 211,
  Ocirc: 212,
  Otilde: 213,
  Ouml: 214,
  times: 215,
  Oslash: 216,
  Ugrave: 217,
  Uacute: 218,
  Ucirc: 219,
  Uuml: 220,
  Yacute: 221,
  THORN: 222,
  szlig: 223,
  agrave: 224,
  aacute: 225,
  acirc: 226,
  atilde: 227,
  auml: 228,
  aring: 229,
  aelig: 230,
  ccedil: 231,
  egrave: 232,
  eacute: 233,
  ecirc: 234,
  euml: 235,
  igrave: 236,
  iacute: 237,
  icirc: 238,
  iuml: 239,
  eth: 240,
  ntilde: 241,
  ograve: 242,
  oacute: 243,
  ocirc: 244,
  otilde: 245,
  ouml: 246,
  divide: 247,
  oslash: 248,
  ugrave: 249,
  uacute: 250,
  ucirc: 251,
  uuml: 252,
  yacute: 253,
  thorn: 254,
  yuml: 255,
  OElig: 338,
  oelig: 339,
  Scaron: 352,
  scaron: 353,
  Yuml: 376,
  fnof: 402,
  circ: 710,
  tilde: 732,
  ensp: 8194,
  emsp: 8195,
  thinsp: 8201,
  zwnj: 8204,
  zwj: 8205,
  lrm: 8206,
  rlm: 8207,
  ndash: 8211,
  mdash: 8212,
  lsquo: 8216,
  rsquo: 8217,
  sbquo: 8218,
  ldquo: 8220,
  rdquo: 8221,
  bdquo: 8222,
  dagger: 8224,
  Dagger: 8225,
  bull: 8226,
  hellip: 8230,
  permil: 8240,
  prime: 8242,
  Prime: 8243,
  lsaquo: 8249,
  rsaquo: 8250,
  oline: 8254,
  frasl: 8260,
  euro: 8364,
  trade: 8482,
  larr: 8592,
  uarr: 8593,
  rarr: 8594,
  darr: 8595,
  harr: 8596,
  minus: 8722,
  radic: 8730,
  infin: 8734,
  ne: 8800,
  le: 8804,
  ge: 8805,
};

/* HTML numeric references in the C1 control range decode as their
   windows-1252 characters (the &#146; apostrophes of old CMS output),
   per the HTML character reference rules a browser applies. */
const C1_REMAP: Record<number, number> = {
  0x80: 0x20ac,
  0x82: 0x201a,
  0x83: 0x0192,
  0x84: 0x201e,
  0x85: 0x2026,
  0x86: 0x2020,
  0x87: 0x2021,
  0x88: 0x02c6,
  0x89: 0x2030,
  0x8a: 0x0160,
  0x8b: 0x2039,
  0x8c: 0x0152,
  0x8e: 0x017d,
  0x91: 0x2018,
  0x92: 0x2019,
  0x93: 0x201c,
  0x94: 0x201d,
  0x95: 0x2022,
  0x96: 0x2013,
  0x97: 0x2014,
  0x98: 0x02dc,
  0x99: 0x2122,
  0x9a: 0x0161,
  0x9b: 0x203a,
  0x9c: 0x0153,
  0x9e: 0x017e,
  0x9f: 0x0178,
};

/* Unlike the XML decoder above, HTML decoding follows the browser rule:
   NUL, surrogates, and out-of-range numbers become U+FFFD rather than
   staying literal, which is also what the charset grade should see. */
function decodeHtmlCodePoint(cp: number): string {
  if (!Number.isInteger(cp) || cp === 0 || cp > 0x10ffff) return '�';
  if (cp >= 0xd800 && cp <= 0xdfff) return '�';
  return String.fromCodePoint(C1_REMAP[cp] ?? cp);
}

/* Numeric references decode with or without the closing semicolon, as in
   browsers; named references require it so `?a=1&timestamp=2` in visible
   text never turns into a multiplication sign. */
const ENTITY_RE =
  /&(?:#[xX]([0-9a-fA-F]+);?|#(\d+);?|([a-zA-Z][a-zA-Z0-9]{1,31});)/g;

function decodeHtmlEntities(s: string): string {
  if (!s.includes('&')) return s;
  return s.replace(
    ENTITY_RE,
    (match, hex?: string, dec?: string, named?: string) => {
      if (hex) return decodeHtmlCodePoint(parseInt(hex, 16));
      if (dec) return decodeHtmlCodePoint(parseInt(dec, 10));
      const cp = named ? NAMED_ENTITIES[named] : undefined;
      return cp === undefined ? match : String.fromCodePoint(cp);
    }
  );
}

/* Elements whose content the tokenizer must consume as raw text: inside
   them, markup-looking bytes are character data, so scanning their tags
   would corrupt the rest of the pass. */
const RAWTEXT_TAGS = new Set([
  'script',
  'style',
  'noscript',
  'iframe',
  'noembed',
  'noframes',
  'xmp',
  'textarea',
  'title',
]);

const VOID_TAGS = new Set([
  'area',
  'base',
  'basefont',
  'bgsound',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

/* Tags that may appear before body content without ending the head, so a
   page without an explicit <body> still splits head text from body text
   the way a browser builds the tree. */
const HEAD_TAGS = new Set([
  'html',
  'head',
  'title',
  'base',
  'link',
  'meta',
  'style',
  'script',
  'noscript',
  'template',
  'basefont',
  'bgsound',
]);

// The block-level text carriers sampled for language measurement.
const CHUNK_TAGS = new Set([
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'li',
  'td',
  'blockquote',
  'figcaption',
  'dd',
  'dt',
  'summary',
]);

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

/* Start tags that implicitly close an open <p>, per the HTML "in body"
   insertion rules; without this, one unclosed paragraph would swallow
   the rest of the page into a single chunk. */
const P_CLOSING_TAGS = new Set([
  'address',
  'article',
  'aside',
  'blockquote',
  'center',
  'details',
  'dialog',
  'dir',
  'div',
  'dl',
  'dd',
  'dt',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'hr',
  'li',
  'main',
  'menu',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'summary',
  'table',
  'ul',
]);

const BUTTON_SCOPE = new Set([
  'html',
  'table',
  'template',
  'td',
  'th',
  'caption',
  'button',
  'object',
]);
const LIST_SCOPE = new Set(['ul', 'ol', 'menu', ...BUTTON_SCOPE]);
const DL_SCOPE = new Set(['dl', ...BUTTON_SCOPE]);
const TABLE_SCOPE = new Set(['table', 'template', 'html']);

/* HTML start tags that break out of misnested inline-SVG foreign content
   in a browser, so one unclosed <svg> icon cannot swallow the page. */
const SVG_BREAKOUT = new Set([
  'body',
  'blockquote',
  'br',
  'center',
  'code',
  'dd',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'hr',
  'i',
  'img',
  'li',
  'listing',
  'menu',
  'meta',
  'nobr',
  'ol',
  'p',
  'pre',
  'ruby',
  's',
  'small',
  'span',
  'strong',
  'strike',
  'sub',
  'sup',
  'table',
  'tt',
  'u',
  'ul',
  'var',
]);

/* Bounds that keep hostile markup linear: candidate chunk elements far
   beyond the 80 kept, pathological chunk nesting, and per-chunk text are
   all capped instead of letting nesting multiply work. */
const MAX_CHUNK_CANDIDATES = 2000;
const MAX_OPEN_CHUNKS = 32;
const CHUNK_BUFFER_CHARS = 4096;
const MAX_SCOPE_SCAN = 100;

const TAG_NAME_RE = /[a-zA-Z][^\s/>]*/y;
const ATTR_RE = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*)))?/g;

/* First-wins attribute extraction from one tag's attribute text, the
   duplicate rule browsers apply. Values decode entities so downstream
   comparisons see what a browser sees. */
function parseAttrs(attrText: string): Map<string, string> {
  const attrs = new Map<string, string>();
  ATTR_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ATTR_RE.exec(attrText)) !== null) {
    const name = (m[1] ?? '').toLowerCase();
    if (!name || name === '/' || attrs.has(name)) continue;
    const raw = m[2] ?? m[3] ?? m[4] ?? '';
    attrs.set(name, decodeHtmlEntities(raw));
  }
  return attrs;
}

/* Finds the '>' that ends a tag. A quote only opens a value after '=',
   matching the tokenizer states, so a stray apostrophe in an unquoted
   value cannot swallow the rest of the document. */
function findTagEnd(html: string, from: number): number {
  let quote = 0;
  let prev = 0;
  for (let i = from; i < html.length; i++) {
    const c = html.charCodeAt(i);
    if (quote) {
      if (c === quote) quote = 0;
      continue;
    }
    if (c === 62) return i;
    if ((c === 34 || c === 39) && prev === 61) quote = c;
    if (c !== 32 && c !== 9 && c !== 10 && c !== 12 && c !== 13) prev = c;
  }
  return -1;
}

function isWhitespaceCode(c: number): boolean {
  return c === 32 || c === 9 || c === 10 || c === 12 || c === 13;
}

type OpenChunk = { parts: string[]; size: number };
type OpenElement = { name: string; chunk: OpenChunk | null; start: number };

// Extract everything the graders need from one HTML page.
export function parsePage(html: string, pageUrl: string): ParsedPage {
  const { htmlOpenTag, rawHreflangTags } = captureRawEvidence(html);
  const lower = html.toLowerCase();
  const len = html.length;

  let lang = '';
  let dir = '';
  let htmlSeen = false;
  let titleText = '';
  let titleSeen = false;
  let metaDesc: string | null = null;
  let ogTitle: string | null = null;
  let ogDesc: string | null = null;
  let ogLocale: string | null = null;
  let charsetAttr: string | null = null;
  let httpEquivContent: string | null = null;
  const alternates: HreflangAlternate[] = [];

  let inHead = true;
  const skipStack: string[] = [];
  const bodyParts: string[] = [];
  const stack: OpenElement[] = [];
  const openCounts = new Map<string, number>();
  const openChunks: OpenChunk[] = [];
  const chunkRecords: { start: number; text: string }[] = [];

  function addText(decoded: string): void {
    if (!decoded || skipStack.length > 0) return;
    if (inHead) {
      if (!/\S/.test(decoded)) return;
      inHead = false;
    }
    bodyParts.push(decoded);
    for (const chunk of openChunks) {
      if (chunk.size < CHUNK_BUFFER_CHARS) {
        chunk.parts.push(decoded);
        chunk.size += decoded.length;
      }
    }
  }

  function popElement(): void {
    const el = stack.pop();
    if (!el) return;
    openCounts.set(el.name, (openCounts.get(el.name) ?? 1) - 1);
    if (el.chunk) {
      openChunks.pop();
      chunkRecords.push({ start: el.start, text: el.chunk.parts.join('') });
    }
  }

  /* Pops through the nearest element matching `target`, unless a scope
     boundary sits above it; mirrors the implied-end-tag walks of the
     tree builder closely enough for text attribution. */
  function closeThrough(
    target: (name: string) => boolean,
    boundaries: Set<string>
  ): void {
    const floor = Math.max(0, stack.length - MAX_SCOPE_SCAN);
    for (let i = stack.length - 1; i >= floor; i--) {
      const name = stack[i]?.name ?? '';
      if (target(name)) {
        while (stack.length > i) popElement();
        return;
      }
      if (boundaries.has(name)) return;
    }
  }

  function closeP(): void {
    if ((openCounts.get('p') ?? 0) > 0) {
      closeThrough((n) => n === 'p', BUTTON_SCOPE);
    }
  }

  function captureMeta(attrs: Map<string, string>): void {
    const content = (attrs.get('content') ?? '').trim();
    const nameAttr = attrs.get('name');
    const property = attrs.get('property');
    if (metaDesc === null && nameAttr === 'description') metaDesc = content;
    if (ogTitle === null && property === 'og:title') ogTitle = content;
    if (ogDesc === null && property === 'og:description') ogDesc = content;
    if (ogLocale === null && property === 'og:locale') ogLocale = content;
    if (charsetAttr === null && attrs.has('charset')) {
      charsetAttr = (attrs.get('charset') ?? '').trim();
    }
    if (
      httpEquivContent === null &&
      (attrs.get('http-equiv') ?? '').toLowerCase() === 'content-type'
    ) {
      httpEquivContent = content;
    }
  }

  function captureLink(attrs: Map<string, string>): void {
    if ((attrs.get('rel') ?? '').toLowerCase() !== 'alternate') return;
    if (!attrs.has('hreflang')) return;
    const href = (attrs.get('href') ?? '').trim();
    const hreflang = (attrs.get('hreflang') ?? '').trim();
    alternates.push({ hreflang, href, abs: toAbs(href, pageUrl) });
  }

  /* Consumes raw-text content up to the matching close tag, which per the
     tokenizer must be followed by whitespace, '/', '>', or EOF. */
  function readRawText(
    name: string,
    from: number
  ): { content: string; after: number } {
    const closeToken = `</${name}`;
    let idx = from;
    for (;;) {
      idx = lower.indexOf(closeToken, idx);
      if (idx === -1) return { content: html.slice(from), after: len };
      const following = lower.charCodeAt(idx + closeToken.length);
      if (
        Number.isNaN(following) ||
        following === 62 ||
        following === 47 ||
        isWhitespaceCode(following)
      ) {
        break;
      }
      idx += closeToken.length;
    }
    const gt = html.indexOf('>', idx);
    return { content: html.slice(from, idx), after: gt === -1 ? len : gt + 1 };
  }

  function handleClose(name: string): void {
    if (skipStack.length > 0) {
      if (name === 'svg' || name === 'template') {
        const at = skipStack.lastIndexOf(name);
        /* Closing an outer skip element also ends any unclosed inner
           skips, as popping the open-element stack would. */
        if (at !== -1) skipStack.length = at;
      }
      return;
    }
    if (name === 'body' || name === 'html') {
      inHead = false;
      return;
    }
    /* </head> keeps head mode: metadata between </head> and <body> still
       belongs to the head in the tree a browser builds. */
    if (name === 'head') return;
    if ((openCounts.get(name) ?? 0) === 0) return;
    while (stack.length > 0) {
      const top = stack[stack.length - 1]?.name ?? '';
      popElement();
      if (top === name) break;
    }
  }

  let i = 0;
  while (i < len) {
    const lt = html.indexOf('<', i);
    if (lt === -1) {
      addText(decodeHtmlEntities(html.slice(i)));
      break;
    }
    if (lt > i) addText(decodeHtmlEntities(html.slice(i, lt)));
    const marker = html.charCodeAt(lt + 1);

    if (marker === 33) {
      // <!-- comment --> or <!doctype ...>: no text, no structure.
      if (html.startsWith('<!--', lt)) {
        const close = html.indexOf('-->', lt + 4);
        i = close === -1 ? len : close + 3;
      } else {
        const close = html.indexOf('>', lt + 2);
        i = close === -1 ? len : close + 1;
      }
      continue;
    }
    if (marker === 63) {
      // <?...>: bogus comment per the HTML tokenizer.
      const close = html.indexOf('>', lt + 2);
      i = close === -1 ? len : close + 1;
      continue;
    }

    const closing = marker === 47;
    const nameStart = closing ? lt + 2 : lt + 1;
    TAG_NAME_RE.lastIndex = nameStart;
    const nameMatch = TAG_NAME_RE.exec(html);
    if (!nameMatch) {
      if (closing) {
        // </> or </!...: bogus comment, dropped.
        const close = html.indexOf('>', lt + 2);
        i = close === -1 ? len : close + 1;
      } else {
        // A '<' that opens no tag is character data.
        addText('<');
        i = lt + 1;
      }
      continue;
    }

    const name = nameMatch[0].toLowerCase();
    const attrsStart = nameStart + nameMatch[0].length;
    const gtIdx = findTagEnd(html, attrsStart);
    if (gtIdx === -1) break; // EOF inside a tag emits nothing.
    const attrsText = html.slice(attrsStart, gtIdx);
    const selfClosing = attrsText.trimEnd().endsWith('/');
    i = gtIdx + 1;

    if (closing) {
      handleClose(name);
      continue;
    }

    /* Raw text is consumed even inside skipped subtrees, so a literal
       "</template>" inside a script never ends the skip early. */
    if (RAWTEXT_TAGS.has(name)) {
      const { content, after } = readRawText(name, i);
      i = after;
      if (skipStack.length > 0) continue;
      if (name === 'title') {
        if (inHead) {
          if (!titleSeen) {
            titleSeen = true;
            titleText = decodeHtmlEntities(content);
          }
        } else {
          addText(decodeHtmlEntities(content));
        }
      } else if (name === 'textarea') {
        inHead = false;
        addText(decodeHtmlEntities(content));
      } else if (name === 'xmp' || name === 'noembed') {
        inHead = false;
        addText(content);
      } else if (name === 'noframes') {
        if (!inHead) addText(content);
      } else if (name === 'iframe') {
        inHead = false;
      }
      // script/style/noscript content is dropped, like removing the nodes.
      continue;
    }

    if (skipStack.length > 0) {
      if (name === 'svg' || name === 'template') {
        if (!(name === 'svg' && selfClosing)) skipStack.push(name);
        continue;
      }
      if (skipStack[skipStack.length - 1] === 'svg' && SVG_BREAKOUT.has(name)) {
        // Misnested HTML pops foreign content; reprocess the tag below.
        while (skipStack[skipStack.length - 1] === 'svg') skipStack.pop();
      } else {
        continue;
      }
    }

    if (name === 'html') {
      if (!htmlSeen) {
        htmlSeen = true;
        const attrs = parseAttrs(attrsText);
        lang = (attrs.get('lang') ?? '').trim();
        dir = (attrs.get('dir') ?? '').trim().toLowerCase();
      }
      continue;
    }
    if (name === 'meta') {
      captureMeta(parseAttrs(attrsText));
      continue;
    }
    if (name === 'link') {
      captureLink(parseAttrs(attrsText));
      continue;
    }

    if (!HEAD_TAGS.has(name)) inHead = false;

    if (name === 'svg' || name === 'template') {
      if (!(name === 'svg' && selfClosing)) skipStack.push(name);
      continue;
    }

    // Implied end tags, so unclosed block markup ends where a browser ends it.
    if (P_CLOSING_TAGS.has(name)) closeP();
    if (name === 'li') {
      closeThrough((n) => n === 'li', LIST_SCOPE);
    } else if (name === 'dd' || name === 'dt') {
      closeThrough((n) => n === 'dd' || n === 'dt', DL_SCOPE);
    } else if (name === 'td' || name === 'th') {
      closeThrough((n) => n === 'td' || n === 'th', TABLE_SCOPE);
    } else if (name === 'tr') {
      closeThrough((n) => n === 'td' || n === 'th', TABLE_SCOPE);
      closeThrough((n) => n === 'tr', TABLE_SCOPE);
    } else if (
      HEADING_TAGS.has(name) &&
      HEADING_TAGS.has(stack[stack.length - 1]?.name ?? '')
    ) {
      popElement();
    }

    if (VOID_TAGS.has(name)) continue;

    const trackChunk =
      CHUNK_TAGS.has(name) &&
      openChunks.length < MAX_OPEN_CHUNKS &&
      chunkRecords.length + openChunks.length < MAX_CHUNK_CANDIDATES;
    const chunk: OpenChunk | null = trackChunk ? { parts: [], size: 0 } : null;
    stack.push({ name, chunk, start: lt });
    openCounts.set(name, (openCounts.get(name) ?? 0) + 1);
    if (chunk) openChunks.push(chunk);
  }

  while (stack.length > 0) popElement();

  /* Chunk selection replays a document-order element walk: records are
     finalized at close tags (inner elements first), so sort by start
     position before applying the length, dedupe, and count rules. */
  chunkRecords.sort((a, b) => a.start - b.start);
  const seen = new Set<string>();
  const chunks: string[] = [];
  for (const record of chunkRecords) {
    if (chunks.length >= 80) break;
    const t = record.text.replace(/\s+/g, ' ').trim();
    if (t.length >= 30 && !seen.has(t)) {
      seen.add(t);
      chunks.push(t.slice(0, 400));
    }
  }
  const bodyText = bodyParts
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20000);
  if (chunks.length < 3 && bodyText.length >= 60)
    chunks.push(bodyText.slice(0, 2000));

  let metaCharset = (charsetAttr ?? '').trim().toLowerCase();
  if (!metaCharset) {
    metaCharset = (
      /charset=([\w-]+)/i.exec(httpEquivContent ?? '')?.[1] || ''
    ).toLowerCase();
  }

  return {
    url: pageUrl,
    lang,
    dir,
    title: titleText.trim(),
    metaDesc: metaDesc ?? '',
    ogTitle: ogTitle ?? '',
    ogDesc: ogDesc ?? '',
    ogLocale: ogLocale ?? '',
    metaCharset,
    alternates,
    chunks,
    bodyText,
    hasReplacementChars: bodyText.includes('�'),
    htmlOpenTag,
    rawHreflangTags,
  };
}
