import {
  getJobPostings as getAshbyPostings,
  type Position,
} from '../../singularity/company-sections/careers';

/**
 * The careers board's data path. The fetch itself is the one this repo
 * already carries — src/app/d/singularity/company-sections/careers.ts,
 * the shipped page's own path: the public Ashby posting API for the
 * `generaltranslation` board, listed roles only, an hourly revalidate, and
 * an empty array on any failure so the ledger falls back to the shipped
 * empty-state sentence instead of throwing.
 *
 * This module adds back the one guard the shipped page carries that the
 * shared fetch does not (apps/landing/src/components/pages/careers/
 * careers-data.ts, `isTrustedAshbyJobUrl`): a row is only rendered if its
 * apply URL is https on jobs.ashbyhq.com. The board is third-party data
 * that this page turns into target=_blank links, so the host allowlist is
 * part of the page being reproduced, not a nicety.
 */

function isTrustedAshbyJobUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'jobs.ashbyhq.com';
  } catch {
    return false;
  }
}

export async function getJobPostings(): Promise<Position[]> {
  const postings = await getAshbyPostings();
  return postings.filter((posting) => isTrustedAshbyJobUrl(posting.url));
}
