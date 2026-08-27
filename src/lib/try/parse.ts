import * as cheerio from 'cheerio';

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

/* Verbatim capture off the raw markup, before cheerio normalizes
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
  const $ = cheerio.load(html);
  const htmlEl = $('html').first();
  const lang = (htmlEl.attr('lang') || '').trim();
  const dir = (htmlEl.attr('dir') || '').trim().toLowerCase();

  const meta = (sel: string, attr = 'content') =>
    ($(sel).first().attr(attr) || '').trim();
  const title = $('head title').first().text().trim();
  const metaDesc = meta('meta[name="description"]');
  const ogTitle = meta('meta[property="og:title"]');
  const ogDesc = meta('meta[property="og:description"]');
  const ogLocale = meta('meta[property="og:locale"]');

  let metaCharset = (meta('meta[charset]', 'charset') || '').toLowerCase();
  if (!metaCharset) {
    const httpEquiv = meta('meta[http-equiv="Content-Type" i]');
    metaCharset = (
      /charset=([\w-]+)/i.exec(httpEquiv)?.[1] || ''
    ).toLowerCase();
  }

  const alternates: HreflangAlternate[] = [];
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    const href = ($(el).attr('href') || '').trim();
    const hreflang = ($(el).attr('hreflang') || '').trim();
    alternates.push({ hreflang, href, abs: toAbs(href, pageUrl) });
  });

  $('script, style, noscript, svg, template, iframe').remove();
  const seen = new Set<string>();
  const chunks: string[] = [];
  $(
    'p, h1, h2, h3, h4, h5, h6, li, td, blockquote, figcaption, dd, dt, summary'
  ).each((_, el) => {
    if (chunks.length >= 80) return false;
    const t = $(el).text().replace(/\s+/g, ' ').trim();
    if (t.length >= 30 && !seen.has(t)) {
      seen.add(t);
      chunks.push(t.slice(0, 400));
    }
    return true;
  });
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 20000);
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
