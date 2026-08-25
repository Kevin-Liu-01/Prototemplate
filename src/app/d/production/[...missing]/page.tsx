import { notFound } from 'next/navigation';

/**
 * The catch-all under /d/production, 1-1 with the real site's own:
 * apps/landing/src/app/[locale]/[...missing]/page.tsx is four lines that
 * call notFound() and nothing else. Claiming every unmatched address and
 * then throwing is what makes the response a real 404 — Next renders the
 * sibling not-found.tsx (../not-found.tsx, the designed horizon band) and
 * sets the status. A catch-all that RETURNED the band would answer 200,
 * which is the thing this control exists to avoid.
 */
export default function MissingPage() {
  notFound();
}
