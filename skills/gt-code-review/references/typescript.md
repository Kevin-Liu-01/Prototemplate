# TypeScript

The rules come from Matt Pocock's Total TypeScript, each with the page it
was read on, on 2026-11-25. The adoption table at the end compares
gt-cloud's compiler and lint configuration with them.

## TS1. Outside data is `unknown` until a schema parses it

**Look for:** `JSON.parse(x) as T`, `(await res.json()) as T`, `: any` on
a request body, a tool answer or a file read, and `as any`. A JSON column
read from the database counts as outside data, since older rows and other
writers may hold another shape.

**Why:** a cast is a claim the compiler cannot check, and outside data
breaks it without an error. Parse it with zod at the boundary; inside, the
type is then true.

```ts
// Bad
const answer = JSON.parse(text) as Record<string, unknown>;
// Good
const answer = toolAnswerSchema.parse(JSON.parse(text));
```

**Sources:** https://www.totaltypescript.com/when-should-you-use-zod,
https://www.totaltypescript.com/any-considered-harmful, and the narrowing
chapter at
https://www.totaltypescript.com/books/total-typescript-essentials/unions-literals-and-narrowing.

## TS2. No `as unknown as`, and no `!` where a check can stand

**Look for:** `as unknown as`, a non-null `!` in product code, and an
assertion wider than it needs to be.

**Why:** both silence the compiler. A check that throws names the failure
where it happens. In tests, a typed stand-in built with `satisfies` or a
helper replaces `as unknown as`.

```ts
// Bad
const el = document.getElementById('upload')!;
// Good
const el = document.getElementById('upload');
if (!el) throw new Error('the upload field is missing');
```

**Source:**
https://www.totaltypescript.com/books/total-typescript-essentials/annotations-and-assertions.

## TS3. `satisfies` checks a value and keeps its type

**Look for:** an annotation that widens a literal object, such as
`Record<string, string>`, where the keys are known; `as` used to make a
literal fit a type.

**Why:** an annotation loses the literal keys, and `as` skips the check.
`as const satisfies T` keeps both the narrow type and the check.

```ts
// Bad
const PROMPTS: Record<string, string> = { worker: '...', helper: '...' };
// Good
const PROMPTS = { worker: '...', helper: '...' } as const satisfies Record<ImageSubagentKind, string>;
```

**Source:** https://www.totaltypescript.com/how-to-use-satisfies-operator.

## TS4. `as const` objects and derived unions in place of enums

**Look for:** a new `enum`, and a union typed out by hand next to the array
that holds the same values.

**Why:** an enum is not plain JavaScript and a numeric one accepts any
number. One `as const` array or object is the single owner of the values
(rule M4), and the type derives from it.

```ts
// Bad
enum Format { Png = 'PNG', Webp = 'WEBP' }
// Good
export const FORMATS = ['PNG', 'WEBP', 'TIFF'] as const;
export type Format = (typeof FORMATS)[number];
```

**Sources:** https://www.totaltypescript.com/why-i-dont-like-typescript-enums
and
https://www.totaltypescript.com/books/total-typescript-essentials/deriving-types.

## TS5. States are discriminated unions, and a switch over them is exhaustive

**Look for:** one object type with many optional fields that are valid
only together, such as `{ ok: boolean; data?: D; error?: E }`, and a switch
over a kind with no exhaustive default.

**Why:** a union lets the compiler say which fields exist in each state. A
`default` that checks `satisfies never` fails to compile when a new kind is
added and not handled.

```ts
// Bad
type Ask = { status: string; answer?: Answer; error?: string; retryable?: boolean };
// Good
type Ask =
  | { status: 'answered'; answer: Answer }
  | { status: 'failed'; error: string; retryable: boolean };
```

**Source:** https://www.totaltypescript.com/discriminated-unions-are-a-devs-best-friend.
The exhaustive `satisfies never` default is common TypeScript practice;
the pages read do not show it.

## TS6. Branded types for values that were validated

**Look for:** a plain `string` that must be a checked path, a job folder, a
locale tag or an id, passed through several functions.

**Why:** a brand makes the compiler refuse an unchecked string, so the
validation happens once, at the function that makes the brand.

```ts
type JobFolder = string & { readonly __brand: 'JobFolder' };
function jobFolder(jobId: string, locale: string): JobFolder { /* validate */ return path as JobFolder; }
```

**Source:** https://www.totaltypescript.com/workshops/advanced-typescript-patterns/branded-types/what-is-a-branded-type.

## TS7. A generic or an overload only where the types need one

**Look for:** a type parameter used once, a generic constrained to a small
union, and overloads whose return types are the same.

**Why:** a generic that relates nothing adds reading cost and no safety. A
union parameter says the same thing more simply.

```ts
// Bad
function label<T extends 'PNG' | 'JPEG'>(f: T): string
// Good
function label(f: 'PNG' | 'JPEG'): string
```

**Sources:** https://www.totaltypescript.com/tips/know-when-to-use-generics
and
https://www.totaltypescript.com/workshops/typescript-generics/function-overloads/function-overloads-vs-union-types/solution.

## TS8. `type` by default, readonly parameters, `Record` for dynamic keys

**Look for:** a deep `&` chain where `interface extends` would do, an array
parameter that the function does not change but types as mutable, and `{}`
used to mean an object.

**Why:** named interfaces check faster than long intersections, a readonly
parameter accepts both kinds of array, and `{}` accepts any value except
`null` and `undefined`.

```ts
// Bad
function total(costs: number[]): number
// Good
function total(costs: readonly number[]): number
```

**Sources:** https://www.totaltypescript.com/type-vs-interface-which-should-you-use,
https://www.totaltypescript.com/books/total-typescript-essentials/mutability,
https://www.totaltypescript.com/books/total-typescript-essentials/objects
and https://www.totaltypescript.com/the-empty-object-type-in-typescript.

## TS9. An exported top-level function declares its return type

**Look for:** an exported function of a module whose return type is
inferred from several branches, except a component that returns JSX.

**Why:** a declared return type is the contract that callers read, and an
edit inside the function cannot change it by accident. Pocock's earlier tip
said to infer by default; his later article says to declare at the top
level, and this skill follows the later one.

**Sources:** https://www.totaltypescript.com/should-you-declare-return-types
and https://www.totaltypescript.com/tips/dont-use-return-types-unless.

## TS10. The strict compiler options of the TSConfig cheat sheet

**Look for:** a new package `tsconfig.json` that turns off a strict option
the base config holds, and a new index read on an array or record with no
`undefined` check.

**Why:** `noUncheckedIndexedAccess` makes `arr[0]` include `undefined`, so
an empty array cannot crash a later `.name`. The table below says where
gt-cloud stands.

**Sources:** https://www.totaltypescript.com/tsconfig-cheat-sheet and, for
application code only, https://www.totaltypescript.com/ts-reset.

## What gt-cloud follows and what it could adopt

Read at gt-cloud head be57221fc0 on 2026-11-25:
`tooling/ts-config/tsconfig.base.json`, `tsconfig.node.json`,
`tsconfig.nextjs.json`, `packages/translation/tsconfig.json`,
`apps/admin/tsconfig.json` and `.oxlintrc.json`.

| Practice | gt-cloud today | Example in the repository | Proposal |
| --- | --- | --- | --- |
| `strict` | Followed in the base config | `tsconfig.base.json` sets `"strict": true` | None |
| `noUncheckedIndexedAccess` | Followed in Next.js apps only | `tsconfig.nextjs.json` sets it; `tsconfig.node.json`, which `packages/translation` extends, does not | Turn it on in `tsconfig.node.json` package by package, fixing each package's errors in its own pull request |
| `isolatedModules`, `moduleDetection: force` | Followed in Next.js apps only | `tsconfig.nextjs.json` | Add both to `tsconfig.node.json` |
| `verbatimModuleSyntax` | Held by the lint instead | `.oxlintrc.json` makes `typescript/consistent-type-imports` an error; `apps/admin/tsconfig.json` keeps the option off with a written reason about client bundles | None; the lint holds the same rule |
| No `any` | Partly | `typescript/no-explicit-any` is a warning | Make it an error with a ratchet of today's count per file |
| Parse outside data | Mostly followed | `agent/image/imageTools.ts` parses tool answers with `toolAnswerSchema = z.object(...)`; `agent/image/imageCommands.ts:79` still returns `JSON.parse(last) as Record<string, unknown>` | Parse that answer with a schema |
| `as unknown as` | Present, mostly in tests | 30 uses in `packages/translation/src`, such as `agent/__tests__/tools.test.ts:62` | A typed stand-in builder for the operations object |
| `as const satisfies` | Followed | `agent/image/prompt.ts:26`: `} as const satisfies Record<ImageSubagentKind, string>` | None |
| Enums | Followed: none | No `enum` in `packages/translation/src` | None |
| ts-reset | Not used | No package depends on `@total-typescript/ts-reset` | Add it to apps (`apps/*`) only, never to `packages/*` libraries |
