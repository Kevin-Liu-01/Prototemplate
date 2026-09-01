import { primarySubtag, readsAsLocale, RTL_LANGS } from '@/lib/try/language';
import { parsePage, parseSitemap } from '@/lib/try/parse';

import type { Negotiation, SitemapEvidence, VariantVia } from '@/lib/try/grade';
import type { ParsedPage } from '@/lib/try/parse';
import type { SafeFetcher } from '@/lib/try/fetcher';

export type DiscoveredVariant = {
  code: string;
  url: string;
  via: VariantVia;
  page: ParsedPage;
};

export type DiscoveryResult = {
  variants: DiscoveredVariant[];
  negotiation: Negotiation;
  declaredCount: number;
};

const PREFERRED = ['es', 'fr', 'de', 'ja', 'it', 'pt', 'zh', 'ko', 'nl', 'ar'];

function normPath(u: string): string {
  try {
    const url = new URL(u);
    return url.pathname.replace(/\/+$/, '') || '/';
  } catch {
    return u;
  }
}

/* Dedup key must cover host, path, and query: a path-only key collapses
   subdomain, ccTLD, and query-param alternates into the base page's key,
   so they would never be fetched. Host is lowercased and the path is
   trailing-slash-insensitive so spellings of one page share a key. */
function dedupKey(u: string): string {
  try {
    const url = new URL(u);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    return `${url.host.toLowerCase()}${path}${url.search}`;
  } catch {
    return u;
  }
}

/* Sitemap <loc> matching key: query-insensitive, so a canonical entry for
   /page still matches a submitted /page?utm_source=x. Fetch dedup keeps
   using dedupKey because query alternates are distinct pages. */
function entryKey(u: string): string {
  try {
    const url = new URL(u);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    return `${url.host.toLowerCase()}${path}`;
  } catch {
    return u;
  }
}

function hasQuery(u: string): boolean {
  try {
    return new URL(u).search !== '';
  } catch {
    return false;
  }
}

const NO_SITEMAP: SitemapEvidence = {
  checked: false,
  url: null,
  viaIndex: false,
  urlCount: 0,
  codes: [],
  alternatesByCode: {},
};

function looksLikeXml(contentType: string, body: string): boolean {
  if (/xml/i.test(contentType)) return true;
  const head = body
    .replace(/^\uFEFF/, '')
    .trimStart()
    .slice(0, 200);
  return /^<\?xml|^<(?:[\w-]+:)?(?:urlset|sitemapindex)[\s>]/i.test(head);
}

/* Fetch <origin>/sitemap.xml (following a sitemap index into at most one
   child urlset) and collect the hreflang alternates it declares. Both
   fetches are budgeted and byte-capped by the SafeFetcher; anything
   missing, non-XML, or unparseable comes back as neutral evidence. */
export async function probeSitemap(
  fetcher: SafeFetcher,
  baseUrl: string
): Promise<SitemapEvidence> {
  let origin: string;
  try {
    origin = new URL(baseUrl).origin;
  } catch {
    return NO_SITEMAP;
  }
  const res = await fetcher.fetchPage(`${origin}/sitemap.xml`, {
    purpose: 'sitemap.xml',
    timeoutMs: 3000,
  });
  if (!res || res.status < 200 || res.status >= 300 || !res.body)
    return NO_SITEMAP;
  if (!looksLikeXml(res.contentType, res.body)) return NO_SITEMAP;

  let parsed = parseSitemap(res.body);
  let sitemapUrl = res.finalUrl;
  let viaIndex = false;
  if (parsed.kind === 'index') {
    /* Media-feed filtering looks at the path only: a host like
       news.example.com must not disqualify every child. */
    const child =
      parsed.childSitemaps.find(
        (u) => !/image|video|news/i.test(normPath(u))
      ) ?? parsed.childSitemaps[0];
    if (!child) return NO_SITEMAP;
    const childRes = await fetcher.fetchPage(child, {
      purpose: 'child sitemap',
      timeoutMs: 3000,
    });
    if (
      !childRes ||
      childRes.status < 200 ||
      childRes.status >= 300 ||
      !childRes.body ||
      !looksLikeXml(childRes.contentType, childRes.body)
    )
      return NO_SITEMAP;
    viaIndex = true;
    parsed = parseSitemap(childRes.body);
    sitemapUrl = childRes.finalUrl;
  }
  if (parsed.kind !== 'urlset') return NO_SITEMAP;

  /* Only the submitted page's own entry supplies alternate evidence:
     sibling entries describe other pages, so their alternates are never
     credited here, and a base page the sitemap does not list gets none at
     all. An exact (query-sensitive) match wins; the query-insensitive
     fallback considers only query-free canonical entries, so a stray
     tracking param finds the canonical entry but never a query-specific
     sibling variant. */
  const baseEntry =
    parsed.entries.find((e) => dedupKey(e.loc) === dedupKey(baseUrl)) ??
    parsed.entries.find(
      (e) => !hasQuery(e.loc) && entryKey(e.loc) === entryKey(baseUrl)
    );
  const codes = new Set<string>();
  const alternatesByCode: Record<string, string> = {};
  for (const a of baseEntry?.alternates ?? []) {
    const code = primarySubtag(a.hreflang);
    if (!code || code === 'x') continue;
    codes.add(code);
    if (!(code in alternatesByCode)) {
      try {
        alternatesByCode[code] = new URL(a.href, sitemapUrl).href;
      } catch {
        // Unresolvable alternate URLs still count as declared codes.
      }
    }
  }
  return {
    checked: true,
    url: sitemapUrl,
    viaIndex,
    urlCount: parsed.entries.length,
    codes: [...codes],
    alternatesByCode,
  };
}

function looksLikeVariant(
  page: ParsedPage,
  targetLang: string,
  base: ParsedPage,
  defaultLang: string
): boolean {
  const pageLang = primarySubtag(page.lang);
  if (
    pageLang &&
    pageLang === targetLang &&
    pageLang !== primarySubtag(base.lang)
  )
    return true;
  return readsAsLocale(page.chunks, targetLang, defaultLang);
}

// Discover locale variants with at most the fetcher's remaining budget:
// hreflang alternates first (page tags, then sitemap-declared ones filling
// gaps), then path shapes, then a query param, plus one Accept-Language
// negotiation probe.
export async function discoverVariants(
  fetcher: SafeFetcher,
  base: ParsedPage,
  defaultLang: string,
  sitemap: SitemapEvidence = NO_SITEMAP
): Promise<DiscoveryResult> {
  const origin = new URL(base.url).origin;
  const variants: DiscoveredVariant[] = [];
  const fetched = new Set([dedupKey(base.url)]);

  const negotiation: Negotiation = {
    attempted: false,
    works: false,
    detail: '',
  };
  const negLang = defaultLang === 'fr' ? 'es' : 'fr';
  const negRes = await fetcher.fetchPage(base.url, {
    purpose: `Accept-Language negotiation (${negLang})`,
    acceptLanguage: `${negLang};q=1.0,en;q=0.3`,
    timeoutMs: 7000,
  });
  if (negRes) {
    negotiation.attempted = true;
    if (negRes.status >= 200 && negRes.status < 300 && negRes.body) {
      const page = parsePage(negRes.body, negRes.finalUrl);
      const movedToLocalePath =
        dedupKey(negRes.finalUrl) !== dedupKey(base.url);
      const langChanged =
        Boolean(page.lang) &&
        primarySubtag(page.lang) !== primarySubtag(base.lang);
      const contentChanged = readsAsLocale(page.chunks, negLang, defaultLang);
      if (movedToLocalePath || langChanged || contentChanged) {
        negotiation.works = true;
        negotiation.detail = movedToLocalePath
          ? `redirected to ${dedupKey(negRes.finalUrl)}`
          : langChanged
            ? `served lang="${page.lang}"`
            : `served ${negLang} content`;
        if (contentChanged || langChanged) {
          variants.push({
            code: primarySubtag(page.lang) || negLang,
            url: negRes.finalUrl,
            via: 'accept-language',
            page,
          });
          fetched.add(dedupKey(negRes.finalUrl));
        }
      } else {
        negotiation.detail = 'same page came back';
      }
    } else {
      negotiation.detail = `HTTP ${negRes.status || 'error'}`;
    }
  }

  const declared = new Map<string, string>();
  for (const alt of base.alternates) {
    const code = primarySubtag(alt.hreflang);
    if (
      !code ||
      code === 'x' ||
      code === primarySubtag(base.lang || defaultLang)
    )
      continue;
    if (alt.abs && !declared.has(code)) declared.set(code, alt.abs);
  }
  /* Alternates declared only in sitemap.xml join the candidate pool with
     the same exclusions; the pick cap below is unchanged. */
  const viaSitemap = new Set<string>();
  for (const [code, url] of Object.entries(sitemap.alternatesByCode)) {
    if (!code || code === 'x') continue;
    if (code === primarySubtag(base.lang || defaultLang)) continue;
    if (!declared.has(code)) {
      declared.set(code, url);
      viaSitemap.add(code);
    }
  }
  const picks: string[] = [];
  for (const code of PREFERRED) {
    if (declared.has(code) && picks.length < 2) picks.push(code);
  }
  for (const code of declared.keys()) {
    if (picks.length >= 2) break;
    if (!picks.includes(code)) picks.push(code);
  }
  const rtlDeclared = [...declared.keys()].find((c) => RTL_LANGS.has(c));
  if (rtlDeclared && !picks.includes(rtlDeclared)) picks.push(rtlDeclared);

  for (const code of picks) {
    const url = declared.get(code);
    if (!url || fetched.has(dedupKey(url))) continue;
    const res = await fetcher.fetchPage(url, {
      purpose: viaSitemap.has(code)
        ? `hreflang alternate (${code}, via sitemap.xml)`
        : `hreflang alternate (${code})`,
      timeoutMs: 7000,
    });
    if (!res) break;
    fetched.add(dedupKey(url));
    fetched.add(dedupKey(res.finalUrl));
    if (res.status >= 200 && res.status < 300 && res.body) {
      const page = parsePage(res.body, res.finalUrl);
      variants.push({ code, url: res.finalUrl, via: 'hreflang', page });
    }
  }

  if (variants.filter((v) => v.via !== 'accept-language').length < 2) {
    for (const code of ['es', 'fr', 'de', 'ja']) {
      if (fetcher.remaining() <= 1) break;
      if (code === primarySubtag(base.lang || defaultLang)) continue;
      if (variants.some((v) => v.code === code)) continue;
      const url = `${origin}/${code}/`;
      if (fetched.has(dedupKey(url))) continue;
      const res = await fetcher.fetchPage(url, {
        purpose: `path probe (/${code}/)`,
        timeoutMs: 6000,
      });
      if (!res) break;
      fetched.add(dedupKey(url));
      if (res.status >= 200 && res.status < 300 && res.body) {
        const finalPath = normPath(res.finalUrl);
        const stillOnPath =
          finalPath === `/${code}` || finalPath.startsWith(`/${code}/`);
        const page = parsePage(res.body, res.finalUrl);
        if (stillOnPath && looksLikeVariant(page, code, base, defaultLang)) {
          variants.push({ code, url: res.finalUrl, via: 'path', page });
          if (variants.filter((v) => v.via === 'path').length >= 2) break;
        }
      }
    }
  }

  if (variants.length === 0 && fetcher.remaining() >= 1) {
    const code = defaultLang === 'es' ? 'fr' : 'es';
    const url = `${origin}/?lang=${code}`;
    const res = await fetcher.fetchPage(url, {
      purpose: `query param probe (?lang=${code})`,
      timeoutMs: 6000,
    });
    if (res && res.status >= 200 && res.status < 300 && res.body) {
      const page = parsePage(res.body, res.finalUrl);
      if (looksLikeVariant(page, code, base, defaultLang)) {
        variants.push({ code, url: res.finalUrl, via: 'query', page });
      }
    }
  }

  return { variants, negotiation, declaredCount: declared.size };
}
