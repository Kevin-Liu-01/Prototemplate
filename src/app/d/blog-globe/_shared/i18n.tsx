import type { ReactNode } from 'react';

/**
 * Pass-throughs for the gt-next calls in the globe rounds. Prototemplate is
 * not translated, so every string prints as written. The rounds import
 * these names from here in place of 'gt-next' and 'gt-next/server', and
 * their call sites stay exactly as gt-cloud has them, so a re-sync from
 * gt-cloud rewrites import lines only. The module holds no hooks and no
 * 'use client', so server and client files can both import it.
 */

type Children = { children?: ReactNode };

/** Values for the {name} placeholders of a gt() string. */
type Variables = Record<string, string | number>;

/** A translatable block: its children as written. */
export function T({ children }: Children & { id?: string; context?: string }) {
  return <>{children}</>;
}

/** A variable inside a T block: its children as written. */
export function Var({ children }: Children & { name?: string }) {
  return <>{children}</>;
}

/** A message registered for later translation: the string itself. */
export function msg(message: string): string {
  return message;
}

/** Reads a msg() string: the string itself. */
export function useMessages(): (message: string) => string {
  return (message) => message;
}

function fill(content: string, variables?: Variables): string {
  if (!variables) return content;
  return content.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in variables ? String(variables[name]) : whole
  );
}

/** A string with its {name} placeholders filled. */
export function useGT(): (content: string, variables?: Variables) => string {
  return fill;
}

/** The server form of useGT. */
export async function getGT(): Promise<(content: string, variables?: Variables) => string> {
  return fill;
}
