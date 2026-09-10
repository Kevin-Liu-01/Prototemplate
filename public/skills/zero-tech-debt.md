# Zero Tech Debt

Rework the change from the intended end state, not from the history of how the change happened.

## Steps

1. State the intended end state in one or two sentences.
   - Done when the product behavior and architecture target are explicit.

2. Search real callers before preserving compatibility.
   - Delete a mode, prop, wrapper, route alias, fallback, feature flag, or migration shim when no current caller needs it.
   - Done when preserved compatibility has a named active caller.

3. Reshape around the final product surface.
   - Prefer one clear component or flow over mode flags.
   - Split only across obvious boundaries: state, layout, controls, or domain commands.
   - Done when the main caller reads like the product concept, not the refactor history.

4. Move shared rules to one place.
   - Feature flags, permissions, route gating, URL state, command names, and validation policy should not be duplicated or hidden in view components.
   - Done when each shared rule has one owner.

5. Verify the intended flow.
   - Test new behavior and any deleted assumptions that affect navigation, permissions, or persisted state.
   - Done when the final flow passes the smallest honest check and the deleted compatibility is intentional.

## Rules

- Optimize for the code that should exist, not the smallest diff.
- Delete dead compatibility instead of documenting it.
- Do not create a generic framework for one feature.
- Keep the refactor scoped to the feature or boundary being cleaned.
- Prefer names that describe product intent over implementation history.

## Output

Return:

- Intended end state.
- Deleted compatibility/cruft.
- New ownership shape.
- Verification run.
- Residual risk, if any.

## Related Skills

- `codebase-design` for deeper module boundaries.
- `improve-codebase-architecture` for read-only architecture scans.
- `refine` for broader quality passes.
- `no-sus-code-doctor` for self-audit before reviewer-facing work.
