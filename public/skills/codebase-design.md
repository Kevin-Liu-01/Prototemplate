# Codebase Design

Use a small shared vocabulary for code shape: deep modules, small interfaces, clear
seams, and tests through the same interface callers use.

## Vocabulary

- **Module**: anything with an interface and implementation.
- **Interface**: every fact a caller must know: types, invariants, ordering, error
  modes, config, and performance behavior.
- **Implementation**: what sits behind the interface.
- **Seam**: the place where behavior can vary without editing callers.
- **Adapter**: a concrete implementation at a seam.
- **Depth**: leverage behind a small interface.
- **Locality**: changes and bugs stay concentrated.

Avoid using "component", "service", "API", and "boundary" when these terms are more
precise.

## Design Checks

Ask these before adding abstractions:

- What interface does the caller actually need?
- What complexity are we choosing to simplify, and what complexity are we
  refusing to hide?
- If we delete this module, does complexity vanish or reappear across callers?
- Are there two real adapters, or only one hypothetical seam?
- Can tests exercise behavior through the public interface?
- Is policy owned in the module, or split across callers?
- Does this create locality, or just another pass-through layer?
- Can a new engineer skim the file names, exported names, and section order and
  understand the domain story before reading function bodies?

## Code Taste Checks

Use this when a design smells "clever" but not trustworthy:

- **Abstraction taste:** callers should forget repeated policy, not hidden
  state, auth, timing, provider errors, or side effects.
- **Domain depth:** a good module has a small interface and enough behavior
  behind it to solve a real domain problem.
- **Predictable change:** the next change should have one obvious owner.
- **Verifiability:** the public interface should be testable with realistic
  failures, not only happy-path mocks.
- **Written tie-breakers:** if a taste decision repeats, route it into
  `AGENTS.md`, a style page, a skill, or a test/doctor.

## Output

For code review or design work, produce a short table:

| Area | Current shape | Risk | Better interface | Proof |
| --- | --- | --- | --- | --- |

Only recommend a new module when the deletion test passes and there is a concrete test
surface.

## References

- Read `DEEPENING.md` when evaluating how to deepen a shallow module and how its dependencies affect the test seam.
- Read `DESIGN-IT-TWICE.md` when Kevin wants multiple interface options or a chosen deepening candidate needs design alternatives.

## Related Skills

- `improve` for broad codebase audits and plan banking.
- `generate-interface` for interface extraction/refactoring.
- `no-sus-code-doctor` for strict ship-quality review.
- `domain-modeling` when the seam depends on domain language.

Wiki references: `wiki/style/code-taste.md`, `wiki/style/dedalus-style-guide.md`.

Upstream: `github.com/mattpocock/skills/skills/engineering/codebase-design/SKILL.md`
at `5d78bd0903420f97c791f834201e550c765699f8`.
