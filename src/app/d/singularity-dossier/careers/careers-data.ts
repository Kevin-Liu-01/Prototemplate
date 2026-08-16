/**
 * The live careers page's data path, mirrored local to this page:
 * fetch the public Ashby posting API for the `generaltranslation`
 * board, keep only listed roles with trusted Ashby URLs, and fall
 * back to an honest empty state when the board is empty or
 * unreachable. Same source, same hourly revalidate as the live page.
 */

export const ASHBY_JOB_BOARD = 'generaltranslation';

export type CareersPosition = {
  id: string;
  title: string;
  department: string;
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

function isTrustedAshbyJobUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'jobs.ashbyhq.com';
  } catch {
    return false;
  }
}

export async function getJobPostings(): Promise<CareersPosition[]> {
  try {
    const response = await fetch(
      `https://api.ashbyhq.com/posting-api/job-board/${ASHBY_JOB_BOARD}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      console.error('Failed to fetch Ashby jobs:', response.status);
      return [];
    }

    const data = (await response.json()) as AshbyResponse;

    return data.jobs
      .filter((job) => job.isListed && isTrustedAshbyJobUrl(job.jobUrl))
      .map((job) => ({
        id: job.jobUrl,
        title: job.title,
        department: job.department || job.team || 'General',
        location: job.location || 'Remote',
        type: formatEmploymentType(job.employmentType),
        url: job.jobUrl,
      }));
  } catch (error) {
    /* logged so a transient Ashby blip caching the empty state for an
       hour is at least diagnosable */
    console.error('Failed to fetch Ashby jobs:', error);
    return [];
  }
}
