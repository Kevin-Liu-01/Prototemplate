# Reuse Existing Types

Do not introduce a TypeScript type until completing a repository-wide search for an existing semantic owner, exact match, subset, or structurally similar type. A search for only the proposed name is insufficient.

## Required Audit

Run every search from the repository root.

1. Describe the proposed type's domain meaning, boundary, producers, consumers, distinctive fields, and discriminant values.
2. Search the entire tracked source tree with `rg`, not only the current app or package:
   - Search the exact proposed name and singular, plural, acronym, and domain-synonym variants.
   - Search two or more distinctive property names and literal/discriminant values.
   - Search functions, schemas, database models, API contracts, and component props that produce or consume the same data.
   - Include `.ts`, `.tsx`, `.mts`, `.cts`, and `.d.ts` declarations plus relevant schema sources such as Prisma, GraphQL, Effect Schema, Zod, OpenAPI, or generated client definitions.
3. Inspect the definitions and their import sites. Compare semantics, optionality, nullability, readonly guarantees, runtime validation, and layer ownership—not only structural assignability.
4. Choose the canonical source before editing:
   - Reuse the existing type when its meaning and boundary match.
   - Derive a view with `Pick`, `Omit`, indexed access, `Awaited<ReturnType<...>>`, or schema inference when it is genuinely the same contract.
   - Extend or consolidate a domain-owned type when both definitions should evolve together.
   - Keep separate types when identical shapes represent intentionally independent boundaries. Do not couple UI, database, and external API layers solely because their current fields happen to match.
5. Introduce a new type only when no existing definition has the same semantic responsibility. Place it with the narrowest authoritative domain owner; do not create a generic dumping-ground `types.ts` file or a barrel export.

Useful starting searches:

```sh
rg -n --glob '*.{ts,tsx,mts,cts}' --glob '*.d.ts' 'ProposedType|proposed type|DomainSynonym' .
rg -n --glob '*.{ts,tsx,mts,cts}' --glob '*.d.ts' 'distinctiveField|discriminantValue' .
rg -n --glob '*.{prisma,graphql,json,yaml,yml}' 'DomainEntity|distinctiveField' .
```

Adapt the terms to the domain. Inspect results rather than treating zero exact-name matches as proof that the type is new.

## Review Rules

When reviewing a new or changed type:

- Repeat the audit independently of the implementation author's naming.
- Flag exact duplicates, near-duplicates, and hand-written copies of schema-generated contracts.
- Identify the preferred canonical definition and direct import path.
- Treat repeated inline object shapes as candidates too, even when no named duplicate exists.
- Do not approve a new type justified only by convenience or package locality.

## Completion Evidence

In the task handoff, summarize the repository areas and semantic terms searched. If a new type remains necessary, state why the closest candidates are not the same contract. Do not add audit-history comments to production code.
