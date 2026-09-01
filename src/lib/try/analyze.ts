import { gradeReport } from '@/lib/try/grade';
import {
  detect,
  francCodesFor,
  languageProfile,
  primarySubtag,
  readsAsLocale,
} from '@/lib/try/language';
import { parsePage } from '@/lib/try/parse';
import { discoverVariants, probeSitemap } from '@/lib/try/probes';

import type { GradedVariant, ReportGrades } from '@/lib/try/grade';
import type { FetchLogEntry, SafeFetcher } from '@/lib/try/fetcher';
import type { ParsedPage } from '@/lib/try/parse';

export type Report = ReportGrades & {
  url: string;
  hostname: string;
  fetchedAt: string;
  defaultLang: string;
  declaredLocales: number;
  variants: Array<{
    code: string;
    url: string;
    via: string;
    confirmed: boolean;
    lang: string;
    title: string;
    detectable: boolean;
    expectedShare: number;
    defaultShare: number;
  }>;
  requests: FetchLogEntry[];
};

const SUBTAG_BY_FRANC: Record<string, string> = {
  eng: 'en',
  spa: 'es',
  fra: 'fr',
  deu: 'de',
  jpn: 'ja',
  cmn: 'zh',
  por: 'pt',
  rus: 'ru',
};

function guessDefaultLang(base: ParsedPage): string {
  const declared = primarySubtag(base.lang);
  if (declared) return declared;
  const counts: Record<string, number> = {};
  for (const chunk of base.chunks.slice(0, 20)) {
    const code = detect(chunk);
    if (code !== 'und') counts[code] = (counts[code] || 0) + 1;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  return (top && SUBTAG_BY_FRANC[top]) || 'en';
}

// The caller supplies the fetcher with a budget of 10: 2 fetches for
// sitemap.xml evidence plus 8 discovery probes.
export async function analyze(
  startUrl: string,
  fetcher: SafeFetcher
): Promise<Report> {
  const first = await fetcher.fetchPage(startUrl, {
    purpose: 'default page',
    countsAgainstBudget: false,
    timeoutMs: 10000,
  });
  if (!first || first.status === 0) {
    throw new Error(
      `Could not reach the site (${first?.error || 'no response'}).`
    );
  }
  if (first.status >= 400) {
    throw new Error(
      `The site answered with HTTP ${first.status}. Try the homepage URL.`
    );
  }
  if (
    !/html/i.test(first.contentType) &&
    !first.body.trimStart().startsWith('<')
  ) {
    throw new Error('That URL did not return an HTML page.');
  }

  const base = parsePage(first.body, first.finalUrl);
  const defaultLang = guessDefaultLang(base);
  const charsetHeader = (
    /charset=([\w-]+)/i.exec(first.headers.get('content-type') || '')?.[1] || ''
  ).toLowerCase();

  const sitemap = await probeSitemap(fetcher, base.url);

  const { variants, negotiation, declaredCount } = await discoverVariants(
    fetcher,
    base,
    defaultLang,
    sitemap
  );

  const graded: GradedVariant[] = variants.map((v) => {
    const langMatches =
      primarySubtag(v.page.lang) === v.code &&
      v.code !== primarySubtag(base.lang || defaultLang);
    return {
      ...v,
      confirmed:
        langMatches || readsAsLocale(v.page.chunks, v.code, defaultLang),
      profile: languageProfile(v.page.chunks, v.code, defaultLang),
    };
  });

  const { overall, categories } = gradeReport({
    base,
    charsetHeader,
    variants: graded,
    negotiation,
    declaredCount,
    defaultLang,
    sitemap,
    contentTypeHeader: first.headers.get('content-type') || '',
    fetchLog: fetcher.log,
  });

  return {
    url: base.url,
    hostname: new URL(base.url).hostname,
    fetchedAt: new Date().toISOString(),
    defaultLang,
    declaredLocales: declaredCount,
    overall,
    categories,
    variants: graded.map((v) => ({
      code: v.code,
      url: v.url,
      via: v.via,
      confirmed: v.confirmed,
      lang: v.page.lang,
      title: v.page.title,
      detectable: v.profile.supported && Boolean(francCodesFor(v.code)),
      expectedShare: v.profile.expectedShare,
      defaultShare: v.profile.defaultShare,
    })),
    requests: fetcher.log,
  };
}
