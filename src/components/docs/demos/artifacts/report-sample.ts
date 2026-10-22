import type { Report } from '@/lib/try/analyze';
import type { CategoryEvidence } from '@/lib/try/evidence';
import type { FetchLogEntry } from '@/lib/try/fetcher';

/**
 * A sample report card for the plate on /docs/components/films-and-sheets:
 * example.com, the domain reserved for examples, graded B with one
 * category at C. The shape is the grader's (gradeReport in
 * src/lib/try/grade.ts), the summaries and fixes follow its wording, and
 * no number here was measured from a real site.
 */

const HOST = 'example.com';

function evidence(snippet: { label: string; code: string }, details: string[], agentPrompt: string): CategoryEvidence {
  return { snippets: [snippet], details, agentPrompt };
}

const REQUESTS: FetchLogEntry[] = [
  { url: `https://${HOST}/`, purpose: 'default page', status: 200, finalUrl: `https://${HOST}/`, ms: 212, note: '' },
  { url: `https://${HOST}/sitemap.xml`, purpose: 'sitemap.xml', status: 200, finalUrl: `https://${HOST}/sitemap.xml`, ms: 96, note: '' },
  { url: `https://${HOST}/es/`, purpose: 'hreflang alternate (es)', status: 200, finalUrl: `https://${HOST}/es/`, ms: 188, note: '' },
  { url: `https://${HOST}/fr/`, purpose: 'hreflang alternate (fr)', status: 200, finalUrl: `https://${HOST}/fr/`, ms: 174, note: '' },
  { url: `https://${HOST}/ja/`, purpose: 'hreflang alternate (ja)', status: 200, finalUrl: `https://${HOST}/ja/`, ms: 201, note: '' },
  { url: `https://${HOST}/de/`, purpose: 'path probe (/de/)', status: 200, finalUrl: `https://${HOST}/de/`, ms: 167, note: '' },
  { url: `https://${HOST}/`, purpose: 'Accept-Language negotiation (es)', status: 200, finalUrl: `https://${HOST}/`, ms: 143, note: '' },
];

export const SAMPLE_REPORT: Report = {
  url: `https://${HOST}/`,
  hostname: HOST,
  fetchedAt: '2026-10-21T12:00:00.000Z',
  defaultLang: 'en',
  declaredLocales: 3,
  variants: [],
  requests: REQUESTS,
  overall: { score: 74, grade: 'B', summary: 'Localized with minor gaps.' },
  categories: [
    {
      id: 'hreflang',
      name: 'hreflang tags',
      grade: 'B',
      score: 75,
      summary: 'hreflang tags list 3 of the 4 live locales, and there is no x-default entry.',
      fix: 'Add a link rel="alternate" hreflang tag for de, plus x-default.',
      evidence: evidence(
        { label: 'The tags on the default page', code: '<link rel="alternate" hreflang="es" href="https://example.com/es/">\n<link rel="alternate" hreflang="fr" href="https://example.com/fr/">\n<link rel="alternate" hreflang="ja" href="https://example.com/ja/">' },
        ['/de/ answers 200 in German but no hreflang tag names it.', 'No x-default entry points search engines at a fallback page.'],
        'Add hreflang alternates for every served locale (es, fr, ja, de) and an x-default entry to the head of every page.'
      ),
    },
    {
      id: 'lang',
      name: 'Language declaration',
      grade: 'A',
      score: 100,
      summary: 'lang="en" is valid and matches the page content.',
      fix: 'None required.',
      evidence: evidence({ label: 'The html tag', code: '<html lang="en">' }, ['The tag is valid BCP 47 and the visible text reads as English.'], 'No change is needed.'),
    },
    {
      id: 'routing',
      name: 'Locale routing',
      grade: 'A',
      score: 100,
      summary: '4 live locale URLs confirmed (via path prefix).',
      fix: 'None required.',
      evidence: evidence({ label: 'The locale URLs', code: '/es/  200\n/fr/  200\n/ja/  200\n/de/  200' }, ['Every locale answers at a stable path prefix.'], 'No change is needed.'),
    },
    {
      id: 'metadata',
      name: 'Translated metadata',
      grade: 'C',
      score: 50,
      summary: 'Metadata is partially localized. 2 of 4 locale pages translate the title and the description.',
      fix: 'Translate title, meta description, og:title and og:description on every locale page.',
      evidence: evidence(
        { label: 'The title on /ja/', code: '<title>Example Domain</title>' },
        ['/es/ and /fr/ translate their titles; /ja/ and /de/ keep the English ones.'],
        'Translate the title, the meta description and the Open Graph tags on the ja and de pages.'
      ),
    },
    {
      id: 'content',
      name: 'Content language',
      grade: 'B',
      score: 75,
      summary: 'On the es, fr, ja pages, 81% of the text is in the expected language and 12% is in en.',
      fix: 'Translate the English strings left on the locale pages.',
      evidence: evidence(
        { label: 'English left on /fr/', code: 'Read more\nSign up for updates' },
        ['The navigation and the footer keep English labels on every locale page.'],
        'Wrap the navigation and footer labels for translation and ship them in every locale.'
      ),
    },
    {
      id: 'charset',
      name: 'Charset and direction',
      grade: 'A',
      score: 100,
      summary: 'UTF-8 is declared in the header and the page, and every page decodes cleanly.',
      fix: 'None required.',
      evidence: evidence({ label: 'The header', code: 'Content-Type: text/html; charset=UTF-8' }, ['No page needs right-to-left direction.'], 'No change is needed.'),
    },
  ],
};
