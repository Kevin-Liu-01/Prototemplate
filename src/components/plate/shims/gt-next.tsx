import type { ReactNode } from 'react';

/**
 * A stand-in for gt-next, which the dashboard's pages import for their
 * copy. Prototemplate has no translation layer, so every piece renders its
 * English as written: `T` and `Var` render their children, `Branch` picks
 * the named branch when one is given and otherwise renders `other` or its
 * children, `useGT` and `getGT` return a function that hands the text back
 * with its `{name}` placeholders filled from the options, `useLocale`
 * answers the dashboard's default, and `Link` is next/link. The ported
 * pages keep their imports by name, with the module path rewritten to this
 * file, so a diff against the dashboard shows the copy untouched.
 */

type Children = { children?: ReactNode };

/** The translation function's shape: text in, text out, options filling `{name}` placeholders. */
export type GTFunction = (
  text: string,
  options?: Record<string, unknown>
) => string;

export function T({ children }: Children) {
  return <>{children}</>;
}

export function Var({ children }: Children & { name?: string }) {
  return <>{children}</>;
}

type BranchProps = Children & {
  branch?: string;
  other?: ReactNode;
} & { [name: string]: ReactNode };

export function Branch({ branch, other, children, ...branches }: BranchProps) {
  const named = branch !== undefined ? branches[branch] : undefined;
  return <>{named !== undefined ? named : (other ?? children)}</>;
}

function translate(text: string, options?: Record<string, unknown>): string {
  if (!options) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in options ? String(options[name]) : match
  );
}

export function useGT(): GTFunction {
  return translate;
}

export async function getGT(): Promise<GTFunction> {
  return translate;
}

export function useLocale(): string {
  return 'en-US';
}

export { default as Link } from 'next/link';
