import { languageProfile, primarySubtag, RTL_LANGS } from '@/lib/try/language';

import type { LanguageProfile } from '@/lib/try/language';
import type { ParsedPage } from '@/lib/try/parse';

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export type VariantVia = 'hreflang' | 'path' | 'query' | 'accept-language';

export type GradedVariant = {
  code: string;
  url: string;
  via: VariantVia;
  page: ParsedPage;
  confirmed: boolean;
  profile: LanguageProfile;
};

export type Negotiation = {
  attempted: boolean;
  works: boolean;
  detail: string;
};

/* What the sitemap.xml probe learned. `checked` is true only when a urlset
   was actually fetched and parsed; a missing or unreadable sitemap stays
   neutral and never penalizes a grade on its own. */
export type SitemapEvidence = {
  checked: boolean;
  url: string | null;
  viaIndex: boolean;
  urlCount: number;
  codes: string[];
  alternatesByCode: Record<string, string>;
};

export type CategoryResult = {
  grade: Grade;
  summary: string;
  fix: string;
};

export type ReportCategory = CategoryResult & {
  id: string;
  name: string;
  score: number;
};

export type ReportGrades = {
  overall: { score: number; grade: Grade; summary: string };
  categories: ReportCategory[];
};

const POINTS: Record<Grade, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 };
const VALID_HREFLANG = /^(x-default|[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*)$/;

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

const DEMOTE: Record<Grade, Grade> = { A: 'B', B: 'C', C: 'D', D: 'D', F: 'F' };

function gradeHreflang(
  base: ParsedPage,
  sitemap: SitemapEvidence | null
): CategoryResult {
  const alts = base.alternates;
  const sitemapCodes = new Set(
    sitemap?.checked ? sitemap.codes.filter((c) => c && c !== 'x') : []
  );
  if (alts.length === 0) {
    if (sitemapCodes.size > 0) {
      const n = sitemapCodes.size;
      return {
        grade: n >= 2 ? 'B' : 'D',
        summary: `No hreflang tags in the HTML; ${n} locale${n === 1 ? '' : 's'} declared via sitemap.xml alternates.`,
        fix: 'Mirror the sitemap alternates as on-page link tags and add an x-default entry.',
      };
    }
    return {
      grade: 'F',
      summary: 'No hreflang alternate tags on the page.',
      fix: 'Add a link rel="alternate" hreflang tag for each served locale, plus x-default.',
    };
  }
  const hasXDefault = alts.some(
    (a) => a.hreflang.toLowerCase() === 'x-default'
  );
  const allValid = alts.every((a) => VALID_HREFLANG.test(a.hreflang));
  const allAbsolute = alts.every((a) => /^https?:\/\//i.test(a.href));
  /* Self-reference means the same host and path: a subdomain or ccTLD
     alternate sharing the path is a different page. */
  const baseParsed = new URL(base.url);
  const baseKey = `${baseParsed.host.toLowerCase()}${baseParsed.pathname.replace(/\/+$/, '') || '/'}`;
  const hasSelf = alts.some((a) => {
    try {
      const u = new URL(a.abs || '');
      return (
        `${u.host.toLowerCase()}${u.pathname.replace(/\/+$/, '') || '/'}` ===
        baseKey
      );
    } catch {
      return false;
    }
  });
  const seen = new Map<string, string | null>();
  let hasDupes = false;
  for (const a of alts) {
    const key = a.hreflang.toLowerCase();
    if (seen.has(key) && seen.get(key) !== a.abs) hasDupes = true;
    seen.set(key, a.abs);
  }
  const locales = new Set(
    alts.map((a) => a.hreflang.toLowerCase()).filter((h) => h !== 'x-default')
  );

  const problems: string[] = [];
  if (!hasXDefault) problems.push('no x-default');
  if (!allValid) problems.push('invalid language codes');
  if (!allAbsolute) problems.push('relative URLs (spec requires absolute)');
  if (!hasSelf) problems.push('no self-referencing tag');
  if (hasDupes) problems.push('conflicting duplicate entries');

  let grade: Grade;
  if (locales.size < 2) grade = 'D';
  else if (problems.length === 0) grade = 'A';
  else if (problems.length === 1) grade = 'B';
  else if (problems.length === 2) grade = 'C';
  else grade = 'D';

  let summary =
    problems.length === 0
      ? `${locales.size} locales declared with x-default and a self-reference.`
      : `${locales.size} locale${locales.size === 1 ? '' : 's'} declared; issues: ${problems.join(', ')}.`;
  let fix =
    problems.length === 0
      ? 'None required.'
      : `Fix the hreflang set: ${problems.join(', ')}.`;

  /* Sitemap evidence folds into this category: agreement is a confirmation
     clause, a sitemap without hreflang entries is neutral, and a badly
     mismatched set is a modest one-step penalty. */
  if (sitemap?.checked) {
    if (sitemapCodes.size === 0) {
      summary += ' sitemap.xml carries no conflicting hreflang entries.';
    } else {
      const pageSubtags = new Set(
        alts.map((a) => primarySubtag(a.hreflang)).filter((c) => c && c !== 'x')
      );
      const overlap = [...pageSubtags].filter((c) =>
        sitemapCodes.has(c)
      ).length;
      const larger = Math.max(pageSubtags.size, sitemapCodes.size);
      if (overlap * 2 < larger) {
        grade = DEMOTE[grade];
        summary += ` The sitemap.xml hreflang set disagrees with the page tags (${overlap} of ${larger} languages shared).`;
        fix =
          'Bring the sitemap.xml hreflang entries and the on-page link tags in sync.';
      } else {
        summary += ' sitemap.xml agrees.';
      }
    }
  }
  return { grade, summary, fix };
}

function gradeLangDecl(base: ParsedPage): CategoryResult {
  if (!base.lang) {
    return {
      grade: 'F',
      summary: 'The <html> tag has no lang attribute.',
      fix: 'Set <html lang="..."> on every page to match its content language.',
    };
  }
  if (
    !VALID_HREFLANG.test(base.lang) ||
    base.lang.toLowerCase() === 'x-default'
  ) {
    return {
      grade: 'D',
      summary: `lang="${base.lang}" is not a valid BCP 47 language tag.`,
      fix: 'Use a valid tag like "en", "en-US" or "pt-BR".',
    };
  }
  const declared = primarySubtag(base.lang);
  const isRtl = RTL_LANGS.has(declared);
  if (isRtl && base.dir !== 'rtl') {
    return {
      grade: 'D',
      summary: `lang="${base.lang}" is a right-to-left language but dir="rtl" is not set.`,
      fix: 'Add dir="rtl" to <html> for right-to-left locales.',
    };
  }
  if (!isRtl && base.dir === 'rtl') {
    return {
      grade: 'D',
      summary: `dir="rtl" is set but lang="${base.lang}" is a left-to-right language.`,
      fix: 'Remove dir="rtl" or correct the lang attribute.',
    };
  }
  const profile = languageProfile(base.chunks, declared, declared);
  if (
    profile.supported &&
    profile.confident >= 5 &&
    profile.expectedShare < 0.3
  ) {
    return {
      grade: 'C',
      summary: `lang="${base.lang}" does not match the detected language of most visible text.`,
      fix: 'Set the lang attribute to the actual content language.',
    };
  }
  return {
    grade: 'A',
    summary: `lang="${base.lang}" is valid and matches the page content${isRtl ? ', and dir="rtl" is set' : ''}.`,
    fix: 'None required.',
  };
}

function gradeRouting(
  variants: GradedVariant[],
  negotiation: Negotiation,
  declaredCount: number
): CategoryResult {
  const urlBased = variants.filter(
    (v) => v.confirmed && v.via !== 'accept-language' && v.via !== 'query'
  );
  const queryBased = variants.filter((v) => v.confirmed && v.via === 'query');
  const negNote = negotiation.works
    ? ` Accept-Language negotiation works (${negotiation.detail}).`
    : negotiation.attempted
      ? ' Accept-Language negotiation had no effect.'
      : '';

  if (urlBased.length >= 2) {
    const shapes = [...new Set(urlBased.map((v) => v.via))].join(', ');
    return {
      grade: 'A',
      summary: `${urlBased.length} live locale URLs confirmed (via ${shapes}).${negNote}`,
      fix: 'None required.',
    };
  }
  if (urlBased.length === 1) {
    return {
      grade: 'B',
      summary: `One live locale URL confirmed (${urlBased[0]?.url}).${negNote}`,
      fix: 'Serve every locale on its own stable URL and declare all of them in hreflang.',
    };
  }
  if (negotiation.works || queryBased.length > 0) {
    return {
      grade: 'C',
      summary: queryBased.length
        ? 'Locales are reachable only through a query parameter.'
        : `Content varies with the Accept-Language header; no stable locale URLs.${negNote}`,
      fix: 'Give each locale its own indexable URL (path prefix or subdomain).',
    };
  }
  if (declaredCount > 0) {
    return {
      grade: 'D',
      summary:
        'hreflang declares other locales, but no probed locale URL served localized content.',
      fix: 'Serve the declared locale URLs in their declared locale, or remove the declarations.',
    };
  }
  return {
    grade: 'F',
    summary:
      'No locale routing found: no localized paths, no negotiation, no query parameter.',
    fix: 'Add locale URLs (/es, /fr, ...) or subdomains and declare them with hreflang.',
  };
}

function gradeMetadata(
  base: ParsedPage,
  variants: GradedVariant[]
): CategoryResult {
  const confirmed = variants.filter((v) => v.confirmed);
  if (confirmed.length === 0) {
    return {
      grade: 'F',
      summary: 'No locale variants found; no translated metadata to grade.',
      fix: 'Localize the pages first, then translate title, meta description and OG tags per locale.',
    };
  }
  const fields = ['title', 'metaDesc', 'ogTitle', 'ogDesc'] as const;
  let translated = 0;
  let comparable = 0;
  const missing: string[] = [];
  for (const v of confirmed) {
    for (const f of fields) {
      const a = (base[f] || '').trim();
      const b = (v.page[f] || '').trim();
      if (!a) continue;
      comparable += 1;
      if (!b) missing.push(`${f} missing on ${v.code}`);
      else if (a.toLowerCase() !== b.toLowerCase()) translated += 1;
    }
  }
  if (comparable === 0) {
    return {
      grade: 'C',
      summary:
        'The default page has no title or meta description to compare against.',
      fix: 'Add title, meta description and OG tags, then translate them per locale.',
    };
  }
  const share = translated / comparable;
  const detail = `${translated} of ${comparable} comparable fields differ from the default across ${confirmed.length} variant${confirmed.length === 1 ? '' : 's'}.`;
  let grade: Grade;
  if (share >= 0.9) grade = 'A';
  else if (share >= 0.7) grade = 'B';
  else if (share >= 0.4) grade = 'C';
  else if (share > 0) grade = 'D';
  else grade = 'F';
  return {
    grade,
    summary:
      grade === 'A'
        ? `Titles, descriptions and OG tags are localized. ${detail}`
        : `Metadata is partially localized. ${detail}`,
    fix:
      grade === 'A'
        ? 'None required.'
        : 'Translate title, meta description, og:title and og:description on every locale page.',
  };
}

function gradeContent(
  variants: GradedVariant[],
  defaultLang: string
): CategoryResult {
  const confirmed = variants.filter((v) => v.confirmed);
  if (confirmed.length === 0) {
    return {
      grade: 'F',
      summary:
        'No locale variants found; all pages serve the default language.',
      fix: 'Translate the site content.',
    };
  }
  const usable = confirmed.filter(
    (v) => v.profile.supported && v.profile.confident >= 3
  );
  if (usable.length === 0) {
    return {
      grade: 'C',
      summary:
        'Locale variants exist, but the language detector could not confidently classify their text.',
      fix: 'Manual check needed; the page may be JS-rendered or too short for static analysis.',
    };
  }
  const avgExpected =
    usable.reduce((s, v) => s + v.profile.expectedShare, 0) / usable.length;
  const avgDefault =
    usable.reduce((s, v) => s + v.profile.defaultShare, 0) / usable.length;
  const names = usable.map((v) => v.code).join(', ');
  let grade: Grade;
  if (avgExpected >= 0.85) grade = 'A';
  else if (avgExpected >= 0.7) grade = 'B';
  else if (avgExpected >= 0.5) grade = 'C';
  else if (avgExpected >= 0.25) grade = 'D';
  else grade = 'F';
  return {
    grade,
    summary: `On the ${names} page${usable.length === 1 ? '' : 's'}, ${pct(avgExpected)} of the text is in the expected language and ${pct(avgDefault)} is in ${defaultLang}.`,
    fix:
      grade === 'A'
        ? 'None required.'
        : 'Translate the remaining strings on locale pages; untranslated text is usually hardcoded UI copy.',
  };
}

function gradeCharsetDir(
  base: ParsedPage,
  charsetHeader: string,
  variants: GradedVariant[],
  declaredRtl: boolean
): CategoryResult {
  const issues: string[] = [];
  let score = 0;
  const charset = (charsetHeader || base.metaCharset || '').toLowerCase();
  if (!charset) {
    issues.push('no charset declared in headers or meta');
    score += 1;
  } else if (!charset.includes('utf-8')) {
    issues.push(`charset is ${charset}, not UTF-8`);
    score += 1;
  }
  if (base.hasReplacementChars) {
    issues.push('replacement characters (broken encoding) found in the text');
    score += 2;
  }
  const rtlVariants = variants.filter(
    (v) => v.confirmed && RTL_LANGS.has(v.code)
  );
  for (const v of rtlVariants) {
    if (v.page.dir !== 'rtl') {
      issues.push(`the ${v.code} page is missing dir="rtl"`);
      score += 2;
    }
  }
  let note = '';
  if (declaredRtl && rtlVariants.length === 0) {
    note =
      ' RTL locales are declared but were not fetched; direction unverified.';
  }
  let grade: Grade;
  if (score === 0) grade = 'A';
  else if (score === 1) grade = 'B';
  else if (score === 2) grade = 'C';
  else if (score === 3) grade = 'D';
  else grade = 'F';
  return {
    grade,
    summary:
      issues.length === 0
        ? `UTF-8 is declared and text decodes cleanly.${note}`
        : `${issues.join('; ')}.${note}`,
    fix:
      issues.length === 0
        ? 'None required.'
        : 'Declare UTF-8 everywhere and set dir="rtl" on right-to-left locale pages.',
  };
}

const OVERALL_LINES: Record<Grade, string> = {
  A: 'Localized across all checked signals.',
  B: 'Localized with minor gaps.',
  C: 'Partially localized.',
  D: 'Largely unlocalized; only isolated signals present.',
  F: 'Not localized.',
};

export function gradeReport(input: {
  base: ParsedPage;
  charsetHeader: string;
  variants: GradedVariant[];
  negotiation: Negotiation;
  declaredCount: number;
  defaultLang: string;
  sitemap?: SitemapEvidence | null;
}): ReportGrades {
  const {
    base,
    charsetHeader,
    variants,
    negotiation,
    declaredCount,
    defaultLang,
    sitemap = null,
  } = input;
  const declaredRtl = base.alternates.some((a) =>
    RTL_LANGS.has(primarySubtag(a.hreflang))
  );
  const categories = [
    { id: 'hreflang', name: 'hreflang tags', ...gradeHreflang(base, sitemap) },
    { id: 'lang', name: 'Language declaration', ...gradeLangDecl(base) },
    {
      id: 'routing',
      name: 'Locale routing',
      ...gradeRouting(variants, negotiation, declaredCount),
    },
    {
      id: 'metadata',
      name: 'Translated metadata',
      ...gradeMetadata(base, variants),
    },
    {
      id: 'content',
      name: 'Content language',
      ...gradeContent(variants, defaultLang),
    },
    {
      id: 'charset',
      name: 'Charset and direction',
      ...gradeCharsetDir(base, charsetHeader, variants, declaredRtl),
    },
  ];
  const avg =
    categories.reduce((s, c) => s + POINTS[c.grade], 0) / categories.length;
  let letter: Grade;
  if (avg >= 3.5) letter = 'A';
  else if (avg >= 2.5) letter = 'B';
  else if (avg >= 1.5) letter = 'C';
  else if (avg >= 0.7) letter = 'D';
  else letter = 'F';
  /* Overall is the continuous average on a 1-100 scale; each category is
     its discrete judgment as a multiple of 25. The letter ships with the
     score so the UI never re-derives it with different boundaries. */
  const score = Math.max(1, Math.round((avg / 4) * 100));
  return {
    overall: { score, grade: letter, summary: OVERALL_LINES[letter] },
    categories: categories.map((c) => ({ ...c, score: POINTS[c.grade] * 25 })),
  };
}
