/* Runs in the browser: pages and sitemaps parse with the native
   DOMParser, so no HTML library ships and no markup is parsed on the
   server. */

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

const SITEMAP_MAX_CHILDREN = 50;
const SITEMAP_MAX_ENTRIES = 500;

/* Sitemap tags are matched by local name so any namespace prefix
   (<xhtml:link>, <sm:loc>) resolves to the same element. */
function childrenNamed(parent: Element, name: string): Element[] {
  return [...parent.children].filter(
    (el) => el.localName.toLowerCase() === name
  );
}

function attrNamed(el: Element, name: string): string {
  for (const a of el.attributes) {
    if (a.localName.toLowerCase() === name) return a.value.trim();
  }
  return '';
}

// Extract url entries (with their hreflang alternates) or child sitemap
// locations from one sitemap.xml document.
export function parseSitemap(xml: string): ParsedSitemap {
  const none: ParsedSitemap = { kind: 'other', childSitemaps: [], entries: [] };
  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(xml, 'text/xml');
  } catch {
    return none;
  }
  if (doc.getElementsByTagNameNS('*', 'parsererror').length > 0) return none;
  const docEl = doc.documentElement;
  if (!docEl) return none;
  const rootName = docEl.localName.toLowerCase();
  const kind: ParsedSitemap['kind'] =
    rootName === 'sitemapindex'
      ? 'index'
      : rootName === 'urlset'
        ? 'urlset'
        : 'other';
  const childSitemaps: string[] = [];
  const entries: SitemapEntry[] = [];
  if (kind === 'index') {
    for (const block of childrenNamed(docEl, 'sitemap').slice(
      0,
      SITEMAP_MAX_CHILDREN
    )) {
      const loc = childrenNamed(block, 'loc')[0]?.textContent?.trim() || '';
      if (loc) childSitemaps.push(loc);
    }
  } else if (kind === 'urlset') {
    for (const block of childrenNamed(docEl, 'url').slice(
      0,
      SITEMAP_MAX_ENTRIES
    )) {
      const loc = childrenNamed(block, 'loc')[0]?.textContent?.trim() || '';
      if (!loc) continue;
      const alternates: SitemapAlternate[] = [];
      for (const link of childrenNamed(block, 'link')) {
        if (attrNamed(link, 'rel').toLowerCase() !== 'alternate') continue;
        const hreflang = attrNamed(link, 'hreflang');
        const href = attrNamed(link, 'href');
        if (hreflang && href) alternates.push({ hreflang, href });
      }
      entries.push({ loc, alternates });
    }
  }
  return { kind, childSitemaps, entries };
}

const MAX_RAW_HREFLANG_TAGS = 15;
const MAX_RAW_TAG_CHARS = 300;

/* Verbatim capture off the raw markup, before the DOM normalizes
   attribute order and quoting: the report shows what the server sent. */
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

// Extract everything the graders need from one HTML page.
export function parsePage(html: string, pageUrl: string): ParsedPage {
  const { htmlOpenTag, rawHreflangTags } = captureRawEvidence(html);
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const htmlEl = doc.documentElement;
  const lang = (htmlEl?.getAttribute('lang') || '').trim();
  const dir = (htmlEl?.getAttribute('dir') || '').trim().toLowerCase();

  const meta = (sel: string, attr = 'content') =>
    (doc.querySelector(sel)?.getAttribute(attr) || '').trim();
  const title = (doc.head?.querySelector('title')?.textContent || '').trim();
  const metaDesc = meta('meta[name="description"]');
  const ogTitle = meta('meta[property="og:title"]');
  const ogDesc = meta('meta[property="og:description"]');
  const ogLocale = meta('meta[property="og:locale"]');

  let metaCharset = meta('meta[charset]', 'charset').toLowerCase();
  if (!metaCharset) {
    const httpEquiv = meta('meta[http-equiv="Content-Type" i]');
    metaCharset = (
      /charset=([\w-]+)/i.exec(httpEquiv)?.[1] || ''
    ).toLowerCase();
  }

  const alternates: HreflangAlternate[] = [];
  for (const el of doc.querySelectorAll('link[rel="alternate"][hreflang]')) {
    const href = (el.getAttribute('href') || '').trim();
    const hreflang = (el.getAttribute('hreflang') || '').trim();
    alternates.push({ hreflang, href, abs: toAbs(href, pageUrl) });
  }

  for (const el of doc.querySelectorAll(
    'script, style, noscript, svg, template, iframe'
  )) {
    el.remove();
  }
  const seen = new Set<string>();
  const chunks: string[] = [];
  for (const el of doc.querySelectorAll(
    'p, h1, h2, h3, h4, h5, h6, li, td, blockquote, figcaption, dd, dt, summary'
  )) {
    if (chunks.length >= 80) break;
    const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (t.length >= 30 && !seen.has(t)) {
      seen.add(t);
      chunks.push(t.slice(0, 400));
    }
  }
  const bodyText = (doc.body?.textContent || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20000);
  if (chunks.length < 3 && bodyText.length >= 60)
    chunks.push(bodyText.slice(0, 2000));

  return {
    url: pageUrl,
    lang,
    dir,
    title,
    metaDesc,
    ogTitle,
    ogDesc,
    ogLocale,
    metaCharset,
    alternates,
    chunks,
    bodyText,
    hasReplacementChars: bodyText.includes('�'),
    htmlOpenTag,
    rawHreflangTags,
  };
}
