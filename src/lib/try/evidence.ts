import {
  detect,
  francCodesFor,
  languageProfile,
  primarySubtag,
  RTL_LANGS,
} from '@/lib/try/language';

import type {
  GradedVariant,
  Negotiation,
  SitemapEvidence,
} from '@/lib/try/grade';
import type { ParsedPage } from '@/lib/try/parse';
import type { FetchLogEntry } from '@/lib/try/safeFetch';

export type EvidenceSnippet = {
  label: string;
  code: string;
};

/* The evidence block every graded category ships with: verbatim material
   from the graded site (or a corrected example), expanded findings, and a
   paste-ready prompt for a coding agent. */
export type CategoryEvidence = {
  snippets: EvidenceSnippet[];
  details: string[];
  agentPrompt: string;
};

export type EvidenceContext = {
  host: string;
  base: ParsedPage;
  charsetHeader: string;
  contentTypeHeader: string;
  variants: GradedVariant[];
  negotiation: Negotiation;
  declaredCount: number;
  defaultLang: string;
  sitemap: SitemapEvidence | null;
  fetchLog: FetchLogEntry[];
};

/* Hard caps keep the evidence payload small: at most 4 snippets of 1200
   chars each and 12 detail lines per category, so a full six-category
   report adds single-digit kilobytes. */
const MAX_SNIPPETS = 4;
const MAX_SNIPPET_CHARS = 1200;
const MAX_DETAILS = 12;
const MAX_DETAIL_CHARS = 300;
const FIELD_CLIP = 120;

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ja: 'Japanese',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch',
  ru: 'Russian',
  zh: 'Chinese',
  ko: 'Korean',
  ar: 'Arabic',
  he: 'Hebrew',
  pl: 'Polish',
  tr: 'Turkish',
  sv: 'Swedish',
  da: 'Danish',
  fi: 'Finnish',
  no: 'Norwegian',
  nb: 'Norwegian',
  cs: 'Czech',
  el: 'Greek',
  hi: 'Hindi',
  th: 'Thai',
  vi: 'Vietnamese',
  id: 'Indonesian',
  uk: 'Ukrainian',
  ro: 'Romanian',
  hu: 'Hungarian',
  fa: 'Persian',
  ur: 'Urdu',
};

function languageName(code: string): string {
  return LANGUAGE_NAMES[primarySubtag(code)] || code;
}

function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 3)}...`;
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function pathOf(url: string): string {
  try {
    return new URL(url).pathname || '/';
  } catch {
    return url;
  }
}

function finalize(
  snippets: EvidenceSnippet[],
  details: string[],
  agentPrompt: string
): CategoryEvidence {
  return {
    snippets: snippets.slice(0, MAX_SNIPPETS).map((s) => ({
      label: s.label,
      code: clip(s.code, MAX_SNIPPET_CHARS),
    })),
    details: details
      .slice(0, MAX_DETAILS)
      .map((d) => clip(d, MAX_DETAIL_CHARS)),
    agentPrompt: sentences(agentPrompt),
  };
}

/* Collapses author-side whitespace so multi-line template prompts read as
   one plain-text paragraph. */
function sentences(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/* Same shape the grader validates; duplicated here (type-only imports from
   grade.ts keep this module free of a runtime import cycle). */
const VALID_HREFLANG = /^(x-default|[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*)$/;

function correctedHreflangExample(ctx: EvidenceContext): string {
  const { base, variants, defaultLang } = ctx;
  const confirmed = new Map<string, string>();
  for (const v of variants) {
    if (v.confirmed && !confirmed.has(v.code)) confirmed.set(v.code, v.url);
  }
  const selfLang = primarySubtag(base.lang) || defaultLang || 'en';
  const lines = [
    `<link rel="alternate" hreflang="${selfLang}" href="${base.url}" />`,
  ];
  for (const [code, url] of confirmed) {
    if (code === selfLang) continue;
    lines.push(`<link rel="alternate" hreflang="${code}" href="${url}" />`);
  }
  lines.push(
    `<link rel="alternate" hreflang="x-default" href="${base.url}" />`
  );
  return lines.join('\n');
}

function hreflangEvidence(ctx: EvidenceContext): CategoryEvidence {
  const { base, host, sitemap } = ctx;
  const snippets: EvidenceSnippet[] = [];
  const details: string[] = [];
  const alts = base.alternates;

  if (base.rawHreflangTags.length > 0) {
    snippets.push({
      label: 'hreflang tags as served',
      code: base.rawHreflangTags.slice(0, 15).join('\n'),
    });
  }

  if (alts.length === 0) {
    details.push(
      'No link rel="alternate" hreflang tags found in the head of the default page.'
    );
  } else {
    const locales = [
      ...new Set(
        alts
          .map((a) => a.hreflang.toLowerCase())
          .filter((h) => h !== 'x-default')
      ),
    ];
    details.push(
      `${alts.length} hreflang tag${alts.length === 1 ? '' : 's'} declare ${locales.length} locale${locales.length === 1 ? '' : 's'}: ${locales.join(', ')}.`
    );
    if (!alts.some((a) => a.hreflang.toLowerCase() === 'x-default')) {
      details.push('No x-default entry is declared.');
    }
    const invalid = alts.filter((a) => !VALID_HREFLANG.test(a.hreflang));
    if (invalid.length > 0) {
      details.push(
        `Invalid language codes: ${invalid.map((a) => a.hreflang).join(', ')}.`
      );
    }
    const relative = alts.filter((a) => !/^https?:\/\//i.test(a.href));
    if (relative.length > 0) {
      details.push(
        `${relative.length} entr${relative.length === 1 ? 'y uses' : 'ies use'} relative URLs; the spec requires absolute URLs.`
      );
    }
    const byCode = new Map<string, Set<string>>();
    for (const a of alts) {
      const key = a.hreflang.toLowerCase();
      const set = byCode.get(key) ?? new Set<string>();
      set.add(a.abs || a.href);
      byCode.set(key, set);
    }
    for (const [code, hrefs] of byCode) {
      if (hrefs.size > 1) {
        details.push(
          `Conflicting entries for ${code}: ${[...hrefs].join(' vs ')}.`
        );
      }
    }
  }

  if (sitemap?.checked && sitemap.codes.length > 0) {
    const lines = Object.entries(sitemap.alternatesByCode).map(
      ([code, url]) => `${code}: ${url}`
    );
    if (lines.length > 0) {
      snippets.push({
        label: 'sitemap.xml alternates for this page',
        code: lines.join('\n'),
      });
    }
    details.push(
      `sitemap.xml (${sitemap.url ?? 'unknown URL'}) declares alternates for: ${sitemap.codes.join(', ')}.`
    );
  } else if (sitemap?.checked) {
    details.push('sitemap.xml was checked and carries no hreflang alternates.');
  }

  let agentPrompt: string;
  if (alts.length === 0) {
    snippets.push({
      label: 'Corrected example for the default page',
      code: correctedHreflangExample(ctx),
    });
    agentPrompt = `The site ${host} serves its pages without link rel=alternate hreflang tags in
      the head. Search engines cannot map its localized URLs to languages without them.
      Add one link rel=alternate hreflang tag per served locale to the head of every
      page, plus an x-default entry pointing at the default page. Every page must also
      carry a self-referencing tag for its own locale, and every href must be an
      absolute URL. Use the corrected example in this report as the starting set for
      the homepage and repeat the pattern on every localized route. Verify by loading
      the rendered HTML of each locale page and checking that the full tag group is
      present and identical across locales.`;
  } else {
    const issues = details.filter(
      (d) =>
        d.startsWith('No x-default') ||
        d.startsWith('Invalid') ||
        d.startsWith('Conflicting') ||
        d.includes('relative URLs')
    );
    if (issues.length > 0) {
      agentPrompt = `The site ${host} declares hreflang tags but the set has defects:
        ${issues.join(' ')} Fix each defect in the layout that renders the head. Every
        locale page must emit the same complete tag group: one absolute URL per locale,
        one x-default entry, and a self-referencing tag. Remove duplicate entries that
        point the same hreflang code at different URLs. Verify by fetching the rendered
        HTML of two locale pages and diffing their hreflang sets against the expected
        list.`;
    } else {
      agentPrompt = `The site ${host} declares a complete hreflang set with x-default and a
        self reference. Keep that true: when a new locale ships, add its tag to every
        page's head in the same group with an absolute URL. Never let a locale page emit
        a different set than the default page. Verify after each release by diffing the
        rendered head of each locale page against the expected tag list.`;
    }
  }

  return finalize(snippets, details, agentPrompt);
}

function langDeclEvidence(ctx: EvidenceContext): CategoryEvidence {
  const { base, host, defaultLang } = ctx;
  const snippets: EvidenceSnippet[] = [];
  const details: string[] = [];

  snippets.push({
    label: 'html open tag as served',
    code: base.htmlOpenTag || 'No <html ...> tag found in the served HTML.',
  });

  details.push(
    base.lang
      ? `lang attribute as served: "${base.lang}".`
      : 'The <html> tag carries no lang attribute.'
  );
  details.push(
    base.dir
      ? `dir attribute as served: "${base.dir}".`
      : 'No dir attribute is set.'
  );

  const declared = primarySubtag(base.lang) || defaultLang;
  const profile = languageProfile(base.chunks, declared, declared);
  if (profile.confident > 0) {
    details.push(
      `Language detection over ${profile.confident} classified text chunk${profile.confident === 1 ? '' : 's'}: ${pct(profile.expectedShare)} reads as ${languageName(declared)}, ${pct(Math.max(0, 1 - profile.expectedShare))} as other languages.`
    );
  } else {
    details.push(
      'Too little classifiable text to measure the content language statically.'
    );
  }

  let agentPrompt: string;
  if (!base.lang) {
    agentPrompt = `The site ${host} serves its HTML without a lang attribute on the html
      element. Screen readers and search engines fall back to guessing the page
      language. Set the lang attribute on the root html element of every page to the
      BCP 47 tag of that page's content language, for example lang="${declared || 'en'}"
      on the default page. In a localized app, derive the value from the active locale
      instead of hardcoding it. Verify with view-source on the default page and one
      locale page and confirm the attribute matches the visible content language.`;
  } else if (
    profile.supported &&
    profile.confident >= 5 &&
    profile.expectedShare < 0.3
  ) {
    agentPrompt = `The site ${host} declares lang="${base.lang}" on its html element, but
      language detection over the visible text classifies only ${pct(profile.expectedShare)}
      of it as ${languageName(declared)}. Set the lang attribute to the language the page
      actually renders in, and derive it from the active locale on localized routes.
      Verify by re-running detection on the served HTML and confirming the declared tag
      matches the majority content language.`;
  } else {
    agentPrompt = `The site ${host} declares lang="${base.lang}" on its html element and the
      value matches the detected content language. Keep that true: derive the attribute
      from the active locale so every localized route declares its own language.
      Never leave the default value on translated pages. Verify by checking the html
      open tag on each locale route after releases.`;
  }

  return finalize(snippets, details, agentPrompt);
}

type ProbeStrategy = 'path' | 'subdomain' | 'query' | 'negotiation';

type ProbeLine = {
  url: string;
  status: string;
  redirect: string | null;
  strategy: ProbeStrategy;
  confirmed: boolean;
};

function probeStrategy(
  entry: FetchLogEntry,
  baseHost: string
): ProbeStrategy | null {
  if (entry.purpose.startsWith('Accept-Language')) return 'negotiation';
  if (entry.purpose.startsWith('query param')) return 'query';
  if (entry.purpose.startsWith('path probe')) return 'path';
  if (entry.purpose.startsWith('hreflang alternate')) {
    try {
      return new URL(entry.url).host.toLowerCase() === baseHost
        ? 'path'
        : 'subdomain';
    } catch {
      return 'path';
    }
  }
  return null;
}

function collectProbes(ctx: EvidenceContext): ProbeLine[] {
  const { base, variants, fetchLog } = ctx;
  let baseHost = '';
  try {
    baseHost = new URL(base.url).host.toLowerCase();
  } catch {
    baseHost = '';
  }
  const confirmedUrls = new Set(
    variants.filter((v) => v.confirmed).map((v) => v.url)
  );
  const probes: ProbeLine[] = [];
  for (const entry of fetchLog) {
    const strategy = probeStrategy(entry, baseHost);
    if (!strategy) continue;
    const finalUrl = entry.finalUrl ?? entry.url;
    probes.push({
      url: entry.url,
      status:
        entry.status !== null
          ? `HTTP ${entry.status}`
          : entry.note || 'no response',
      redirect:
        entry.finalUrl && entry.finalUrl !== entry.url ? entry.finalUrl : null,
      strategy,
      confirmed: confirmedUrls.has(finalUrl),
    });
  }
  return probes;
}

function routingEvidence(ctx: EvidenceContext): CategoryEvidence {
  const { base, host, variants, negotiation, declaredCount } = ctx;
  const snippets: EvidenceSnippet[] = [];
  const details: string[] = [];
  const probes = collectProbes(ctx);

  for (const p of probes) {
    const redirect = p.redirect ? `, redirected to ${p.redirect}` : '';
    details.push(
      `${p.url}: ${p.status}${redirect}, via ${p.strategy}, ${p.confirmed ? 'confirmed' : 'not confirmed'}.`
    );
  }
  if (probes.length === 0) {
    details.push('No locale URL probes were recorded for this run.');
  }
  if (negotiation.attempted) {
    details.push(
      negotiation.works
        ? `Accept-Language negotiation works: ${negotiation.detail}.`
        : 'Accept-Language negotiation had no effect.'
    );
  }

  const confirmedUrl = variants.find(
    (v) => v.confirmed && v.via !== 'accept-language'
  );
  if (confirmedUrl) {
    snippets.push({
      label: 'Confirmed locale URL pair',
      code: `${base.url}\n${confirmedUrl.url}`,
    });
  } else {
    const failing = probes.find((p) => !p.confirmed);
    if (failing) {
      snippets.push({
        label: 'Failing probe',
        code: `GET ${failing.url}\n${failing.status}${failing.redirect ? `\nredirected to ${failing.redirect}` : ''}`,
      });
    }
  }

  const urlBased = variants.filter(
    (v) => v.confirmed && v.via !== 'accept-language' && v.via !== 'query'
  );
  let agentPrompt: string;
  if (urlBased.length >= 2) {
    agentPrompt = `The site ${host} serves ${urlBased.length} confirmed locale URLs
      (${urlBased.map((v) => pathOf(v.url)).join(', ')}). Keep that true: every locale
      must stay on its own stable, indexable URL that returns HTTP 200 without
      requiring cookies or headers. When adding a locale, give it the same URL shape
      and declare it in hreflang. Verify by curling each locale URL and checking the
      status code and the lang attribute of the response.`;
  } else if (urlBased.length === 1) {
    agentPrompt = `The site ${host} serves only one confirmed locale URL
      (${urlBased[0]?.url ?? ''}), and the remaining probed locale URLs did not serve
      localized content. Give every supported locale its own stable URL using the same
      shape as the working one, and make each return HTTP 200 with translated content.
      Declare the full set with hreflang link tags on every page. Verify by curling
      each locale URL and confirming the status, the lang attribute, and that the body
      is in the expected language.`;
  } else if (
    negotiation.works ||
    variants.some((v) => v.confirmed && v.via === 'query')
  ) {
    agentPrompt = `The site ${host} localizes only through ${negotiation.works ? 'Accept-Language header negotiation' : 'a query parameter'},
      with no stable per-locale URLs. Crawlers do not send localized headers or query
      params, so the localized content is invisible to them. Add a path prefix route
      per locale, for example /es/ and /fr/, that serves the translated pages at
      stable URLs, and declare the set with hreflang tags. Keep the negotiation only
      as a first-visit redirect into those URLs. Verify by curling each new locale URL
      with no special headers and confirming translated content comes back.`;
  } else if (declaredCount > 0) {
    agentPrompt = `The site ${host} declares ${declaredCount} alternate locale${declaredCount === 1 ? '' : 's'} in
      hreflang, but the probed locale URLs did not serve localized content. Each probe
      outcome is listed in this report. Make every declared alternate URL return HTTP
      200 with content in its declared language, or remove declarations that have no
      live page behind them. Verify by fetching each declared alternate URL and
      checking its status, lang attribute, and content language.`;
  } else {
    agentPrompt = `The site ${host} has no locale routing: probes of common locale paths
      returned no localized content, Accept-Language negotiation had no effect, and no
      query parameter variant exists. Add one URL per target locale, for example
      ${new URL('/es/', base.url).href}, serving translated content at HTTP 200. Declare
      the set with link rel=alternate hreflang tags including x-default. Verify by
      curling each new locale URL and confirming the lang attribute and body language
      match the locale.`;
  }

  return finalize(snippets, details, agentPrompt);
}

const META_FIELDS = [
  ['title', 'title'],
  ['metaDesc', 'meta description'],
  ['ogTitle', 'og:title'],
  ['ogDesc', 'og:description'],
] as const;

function metadataEvidence(ctx: EvidenceContext): CategoryEvidence {
  const { base, host, variants } = ctx;
  const snippets: EvidenceSnippet[] = [];
  const details: string[] = [];
  const confirmed = variants.filter((v) => v.confirmed);

  const headLines: string[] = [];
  if (base.title)
    headLines.push(`<title>${clip(base.title, FIELD_CLIP)}</title>`);
  if (base.metaDesc) {
    headLines.push(
      `<meta name="description" content="${clip(base.metaDesc, FIELD_CLIP)}" />`
    );
  }
  if (base.ogTitle) {
    headLines.push(
      `<meta property="og:title" content="${clip(base.ogTitle, FIELD_CLIP)}" />`
    );
  }
  if (base.ogDesc) {
    headLines.push(
      `<meta property="og:description" content="${clip(base.ogDesc, FIELD_CLIP)}" />`
    );
  }
  if (headLines.length > 0) {
    snippets.push({
      label: 'Default page head metadata',
      code: headLines.join('\n'),
    });
  } else {
    details.push(
      'The default page has no title, meta description, or og tags to compare.'
    );
  }

  const untranslated: string[] = [];
  for (const v of confirmed) {
    for (const [field, label] of META_FIELDS) {
      const a = (base[field] || '').trim();
      const b = (v.page[field] || '').trim();
      if (!a) continue;
      const same = b !== '' && a.toLowerCase() === b.toLowerCase();
      if (!b) untranslated.push(`${v.code} ${label} is missing`);
      else if (same) untranslated.push(`${v.code} ${label} equals the default`);
      details.push(
        `${v.code} ${label}: default "${clip(a, FIELD_CLIP)}" vs variant "${b ? clip(b, FIELD_CLIP) : '(missing)'}".`
      );
    }
  }
  if (confirmed.length === 0) {
    details.push('No confirmed locale variants; nothing to compare.');
  }

  let agentPrompt: string;
  if (confirmed.length === 0) {
    agentPrompt = `The site ${host} has no confirmed locale variants, so no translated
      metadata exists to grade. Localize the pages first, then give every locale page
      its own translated title, meta description, og:title, and og:description.
      Generate these from the same translation pipeline as the page content so they
      never fall back to the default language. Verify by fetching the head of each
      locale page and comparing the four fields against the default page.`;
  } else if (untranslated.length > 0) {
    agentPrompt = `The site ${host} serves locale pages whose metadata is not fully
      localized: ${clip(untranslated.join('; '), 400)}. Translate the title, meta
      description, og:title, and og:description on every locale page in that page's
      language. In most frameworks this means localizing the metadata factory or head
      component rather than the page body. Verify by fetching the head of each locale
      page and confirming all four fields differ from the default page and read in the
      expected language.`;
  } else {
    agentPrompt = `The site ${host} localizes its titles, descriptions, and og tags per
      locale. Keep that true: when metadata copy changes, update every locale's
      translation in the same change. Never ship a new page whose locale variants
      reuse the default-language metadata. Verify by diffing the head fields of each
      locale page against the default after content updates.`;
  }

  return finalize(snippets, details, agentPrompt);
}

function contentEvidence(ctx: EvidenceContext): CategoryEvidence {
  const { host, variants, defaultLang } = ctx;
  const snippets: EvidenceSnippet[] = [];
  const details: string[] = [];
  const confirmed = variants.filter((v) => v.confirmed);

  for (const v of confirmed) {
    const path = pathOf(v.url);
    if (!v.profile.supported || v.profile.confident === 0) {
      details.push(
        `${path}: the language detector could not classify this page's text (${languageName(v.code)}).`
      );
      continue;
    }
    const otherShare = Math.max(
      0,
      1 - v.profile.expectedShare - v.profile.defaultShare
    );
    const other = otherShare >= 0.05 ? `, ${pct(otherShare)} other` : '';
    details.push(
      `${path} reads ${pct(v.profile.expectedShare)} ${languageName(v.code)}, ${pct(v.profile.defaultShare)} ${languageName(defaultLang)}${other}.`
    );
  }
  if (confirmed.length === 0) {
    details.push(
      `No confirmed locale variants; all fetched pages read as ${languageName(defaultLang)}.`
    );
  }

  /* One verbatim untranslated chunk from the leakiest variant makes the
     share numbers concrete. */
  const leaky = confirmed
    .filter((v) => v.profile.supported && v.profile.defaultShare > 0)
    .sort((a, b) => b.profile.defaultShare - a.profile.defaultShare)[0];
  if (leaky) {
    const fallback = francCodesFor(defaultLang) || ['eng'];
    const chunk = leaky.page.chunks.find((c) => fallback.includes(detect(c)));
    if (chunk) {
      snippets.push({
        label: `Untranslated text on ${pathOf(leaky.url)}`,
        code: clip(chunk, 400),
      });
    }
  }

  const worst = confirmed
    .filter((v) => v.profile.supported && v.profile.confident >= 3)
    .sort((a, b) => a.profile.expectedShare - b.profile.expectedShare)[0];

  let agentPrompt: string;
  if (confirmed.length === 0) {
    agentPrompt = `The site ${host} serves all probed pages in ${languageName(defaultLang)},
      with no confirmed translated variants. Translate the site content and serve each
      locale at its own URL. Start with the highest-traffic pages and run every visible
      string through the translation pipeline, including navigation, buttons, and
      footer copy. Verify by fetching each locale URL and running language detection
      over the body text to confirm the expected language dominates.`;
  } else if (worst && worst.profile.expectedShare < 0.85) {
    agentPrompt = `The site ${host} serves the ${pathOf(worst.url)} page with only
      ${pct(worst.profile.expectedShare)} of its text in ${languageName(worst.code)} and
      ${pct(worst.profile.defaultShare)} still in ${languageName(defaultLang)}. The
      untranslated strings are usually hardcoded UI copy: navigation labels, buttons,
      banners, and footer text that bypass the translation layer. Find the components
      rendering the ${languageName(defaultLang)} strings on that page and route them
      through the same i18n mechanism as the body content. This report includes a
      verbatim untranslated sample to search for. Verify by re-running language
      detection on the served page and confirming the expected-language share rises
      above 85 percent.`;
  } else {
    agentPrompt = `The site ${host} serves its locale pages almost entirely in their
      expected languages. Keep that true: route every new string through the
      translation pipeline and never hardcode visible copy in components. Add missing
      translations before shipping new sections. Verify by spot-checking locale pages
      with language detection after content changes.`;
  }

  return finalize(snippets, details, agentPrompt);
}

function charsetEvidence(ctx: EvidenceContext): CategoryEvidence {
  const { base, host, charsetHeader, contentTypeHeader, variants } = ctx;
  const snippets: EvidenceSnippet[] = [];
  const details: string[] = [];

  if (contentTypeHeader) {
    snippets.push({
      label: 'Content-Type header as served',
      code: `Content-Type: ${contentTypeHeader}`,
    });
  } else {
    details.push('No Content-Type header was captured.');
  }
  if (base.metaCharset) {
    snippets.push({
      label: 'Meta charset as served',
      code: `<meta charset="${base.metaCharset}">`,
    });
  } else {
    details.push('No meta charset tag on the page.');
  }

  const effective = (charsetHeader || base.metaCharset || '').toLowerCase();
  details.push(
    effective
      ? `Effective charset: ${effective}${effective.includes('utf-8') ? '' : ' (not UTF-8)'}.`
      : 'No charset declared in headers or meta tags.'
  );
  details.push(
    base.hasReplacementChars
      ? 'Replacement characters (broken encoding) appear in the decoded text.'
      : 'The decoded text contains no replacement characters.'
  );

  const rtlConfirmed = variants.filter(
    (v) => v.confirmed && RTL_LANGS.has(v.code)
  );
  const rtlMissingDir = rtlConfirmed.filter((v) => v.page.dir !== 'rtl');
  for (const v of rtlConfirmed) {
    details.push(
      `RTL locale ${v.code} (${pathOf(v.url)}): dir attribute is ${v.page.dir === 'rtl' ? '"rtl"' : v.page.dir ? `"${v.page.dir}"` : 'missing'}.`
    );
  }
  const declaredRtl = base.alternates.some((a) =>
    RTL_LANGS.has(primarySubtag(a.hreflang))
  );
  if (declaredRtl && rtlConfirmed.length === 0) {
    details.push(
      'RTL locales are declared in hreflang but none were fetched; direction is unverified.'
    );
  }

  let agentPrompt: string;
  const badCharset = !effective || !effective.includes('utf-8');
  if (badCharset || base.hasReplacementChars || rtlMissingDir.length > 0) {
    const fixes: string[] = [];
    if (!effective) {
      fixes.push(
        'Declare UTF-8 in both the Content-Type response header (charset=utf-8) and a meta charset tag in the first bytes of the head.'
      );
    } else if (!effective.includes('utf-8')) {
      fixes.push(
        `Switch the declared charset from ${effective} to UTF-8 in the Content-Type header and the meta charset tag, and re-encode any stored content that is not UTF-8.`
      );
    }
    if (base.hasReplacementChars) {
      fixes.push(
        'The served text contains U+FFFD replacement characters, which means bytes are being decoded with the wrong encoding somewhere in the pipeline; find the non-UTF-8 source and convert it.'
      );
    }
    if (rtlMissingDir.length > 0) {
      fixes.push(
        `Set dir="rtl" on the html element of the ${rtlMissingDir.map((v) => v.code).join(', ')} page${rtlMissingDir.length === 1 ? '' : 's'}, derived from the active locale.`
      );
    }
    agentPrompt = `The site ${host} has encoding or direction defects. ${fixes.join(' ')}
      Verify by curling a page and inspecting the Content-Type header, checking the
      rendered head for the meta charset tag, and loading an RTL locale page to confirm
      the layout mirrors correctly.`;
  } else {
    agentPrompt = `The site ${host} declares UTF-8 and its text decodes cleanly. Keep that
      true: leave charset=utf-8 on the Content-Type header and keep the meta charset
      tag first in the head. When an RTL locale ships, set dir="rtl" on its html
      element from the active locale. Verify encoding after infrastructure changes by
      curling a page and checking the header and a page with non-ASCII text.`;
  }

  return finalize(snippets, details, agentPrompt);
}

// Build the evidence block for one graded category from what the run
// already captured; unknown ids get an empty block rather than a throw.
export function buildCategoryEvidence(
  id: string,
  ctx: EvidenceContext
): CategoryEvidence {
  switch (id) {
    case 'hreflang':
      return hreflangEvidence(ctx);
    case 'lang':
      return langDeclEvidence(ctx);
    case 'routing':
      return routingEvidence(ctx);
    case 'metadata':
      return metadataEvidence(ctx);
    case 'content':
      return contentEvidence(ctx);
    case 'charset':
      return charsetEvidence(ctx);
    default:
      return { snippets: [], details: [], agentPrompt: '' };
  }
}
