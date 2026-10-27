import { markEntries } from '@/components/docs/demos/mark-entries';

/**
 * /components/marks.json: the marks picker's entries, the files its docs
 * page inlines through MarksDemo. /components fetches them only when the
 * marks row mounts its plate, so the page itself ships none of the marks.
 * Prerendered at build time.
 */

export const dynamic = 'force-static';

export function GET(): Response {
  return Response.json({ entries: markEntries() });
}
