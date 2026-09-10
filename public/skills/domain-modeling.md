# Domain Modeling

Actively maintain the project's shared language while designing or changing work. This
skill changes the model; merely reading `CONTEXT.md` for vocabulary is a normal habit
for any skill.

## First Move

1. Find the repo's domain docs:
   - root `CONTEXT.md`
   - root `CONTEXT-MAP.md`
   - nearest `CONTEXT.md`
   - `docs/adr/`, `docs/adrs/`, or `docs/decisions/`
2. Read the relevant code/docs before writing terms.
3. If this is `kevin-wiki`, prefer wiki pages for durable facts and use repo-local
   `CONTEXT.md` only for project vocabulary.

## During The Session

- Challenge overloaded terms immediately. If the user says "account", ask whether
  they mean customer, user, workspace, billing entity, or something else.
- Propose canonical terms and rejected synonyms.
- Stress-test the vocabulary with concrete edge cases.
- Check the code against stated facts when the term already has implementation.
- Update `CONTEXT.md` when a term is resolved. Do not batch resolved terms for later.

## CONTEXT.md Format

Use concise glossary entries. This is not a spec and should not hold implementation
decisions.

```markdown
# Context

## Terms

### Materialization Cascade

A lesson becoming real in the file system. Avoid: "publish", "sync", "make live".
```

For multi-context repos, create `CONTEXT-MAP.md` only when one root glossary would be
ambiguous.

```markdown
# Context Map

| Context | Glossary | Decisions |
| --- | --- | --- |
| Billing | `src/billing/CONTEXT.md` | `src/billing/docs/adr/` |
```

## ADR Gate

Offer an ADR only when all three are true:

- hard to reverse
- surprising without context
- chosen after a real trade-off

Otherwise, keep the decision in the conversation, PRD, or issue. ADRs should be short:
context, decision, alternatives, consequences.

## References

- Read `CONTEXT-FORMAT.md` when creating or restructuring `CONTEXT.md` / `CONTEXT-MAP.md`.
- Read `ADR-FORMAT.md` when a decision passes the ADR gate.

## Related Skills

- `grill-with-docs` for pre-PRD interrogation that discovers terms.
- `to-prd` for turning resolved context into a product spec.
- `codebase-design` for interface/module vocabulary.

Upstream: `github.com/mattpocock/skills/skills/engineering/domain-modeling/SKILL.md`
at `5d78bd0903420f97c791f834201e550c765699f8`.
