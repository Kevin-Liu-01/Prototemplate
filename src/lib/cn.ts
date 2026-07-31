/**
 * Class joiner for the shell components. Dependency-free on purpose (this
 * app ships standalone to Prototemplate); if utility conflicts ever need
 * resolving, graduate to clsx + tailwind-merge behind this same signature.
 */
export function cn(
  ...inputs: Array<string | false | null | undefined>
): string {
  return inputs.filter(Boolean).join(' ');
}
