/**
 * The old landing careers page's data path, carried over verbatim:
 * apps/landing/src/components/pages/careers/CareersPage.tsx fetches the
 * public Ashby posting API for the `generaltranslation` board, keeps only
 * listed roles, and falls back to an honest empty state when the board is
 * empty or unreachable. Same source, same hourly revalidate, same fallbacks —
 * the docket downstream never shows a role that is not really posted.
 */

export const ASHBY_JOB_BOARD = 'generaltranslation';

export type Position = {
  id: string;
  title: string;
  team: string;
  location: string;
  type: string;
  url: string;
};

type AshbyJob = {
  title: string;
  department: string;
  team: string;
  location: string;
  employmentType: string;
  jobUrl: string;
  isListed: boolean;
};

type AshbyResponse = {
  apiVersion: string;
  jobs: AshbyJob[];
};

function formatEmploymentType(type: string): string {
  const typeMap: Record<string, string> = {
    FullTime: 'Full-time',
    PartTime: 'Part-time',
    Contract: 'Contract',
    Internship: 'Internship',
    Temporary: 'Temporary',
  };
  return typeMap[type] || type || 'Full-time';
}

export async function getJobPostings(): Promise<Position[]> {
  try {
    const res = await fetch(
      `https://api.ashbyhq.com/posting-api/job-board/${ASHBY_JOB_BOARD}`,
      { next: { revalidate: 3600 } } // Revalidate every hour — the old page's cadence
    );

    if (!res.ok) {
      return [];
    }

    const data = (await res.json()) as AshbyResponse;

    return data.jobs
      .filter((job) => job.isListed)
      .map((job) => ({
        id: job.jobUrl,
        title: job.title,
        // The old page's exact department fallback chain.
        team: job.department || job.team || 'General',
        location: job.location || 'Remote',
        type: formatEmploymentType(job.employmentType),
        url: job.jobUrl,
      }));
  } catch (error) {
    /* logged so a transient Ashby blip caching the empty state is at
       least diagnosable */
    console.error('Failed to fetch Ashby jobs:', error);
    return [];
  }
}
