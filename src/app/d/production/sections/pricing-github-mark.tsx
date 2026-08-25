/**
 * The shipped card's GitHub row mark: lucide's own `github` glyph, inlined.
 *
 * The landing app imports `Github` from lucide-react; this repo is on
 * lucide-react v1, which dropped the brand set, and the concept's other
 * GitHub marks come from simple-icons — a FILLED octocat that reads visibly
 * heavier than the outline mark beside the other 16px stroke icons in this
 * ledger. So the two lucide paths are carried here verbatim (24×24 grid,
 * currentColor stroke, round joins), leaving the row identical to the
 * shipped one.
 */
export function LucideGithubMark() {
  return (
    <svg
      aria-hidden='true'
      fill='none'
      height='24'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      viewBox='0 0 24 24'
      width='24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4' />
      <path d='M9 18c-4.51 2-5-2-7-2' />
    </svg>
  );
}
