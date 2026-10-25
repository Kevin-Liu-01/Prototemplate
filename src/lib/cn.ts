/**
 * Joins the truthy class names with spaces. The site's class names are
 * plain, so nothing needs merging; the plate keeps clsx with tailwind-merge
 * for its utility classes (src/components/plate/lib/utils.ts).
 */
export function cn(
  ...inputs: Array<string | false | null | undefined>
): string {
  return inputs.filter(Boolean).join(' ');
}
