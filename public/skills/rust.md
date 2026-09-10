# Rust

Use this as the single executable router for Rust work.

## Routing

- Async/concurrency work routes to the async-patterns reference.
- General production Rust routes to best-practices first.
- Strict style/review prompts route to the folded neckbeard reference when that sharper review voice is intended.

## Reference Loading

Load one folded reference at a time. Prefer the most specific reference that matches the user's named service, framework, command, or error. If no folded reference matches, use the router guidance here and verify with primary docs or local project state.

<!-- folded-skills:auto:start -->
## Folded Skill References

These former standalone skills are bundled here as references to keep the runtime list compact. Load only the reference that matches the user's exact product, framework, or failure mode.

| Former skill | Reference | Description |
| --- | --- | --- |
| `rust-async-patterns` | [`references/skills/rust-async-patterns/SKILL.md`](references/skills/rust-async-patterns/SKILL.md) | Master Rust async programming with Tokio, async traits, error handling, and concurrent patterns. Use when building async Rust applications, implementing concurrent systems, or debugging async code. |
| `rust-best-practices` | [`references/skills/rust-best-practices/SKILL.md`](references/skills/rust-best-practices/SKILL.md) | Guide for writing idiomatic Rust code based on Apollo GraphQL's best practices handbook. Use this skill when: (1) writing new Rust code or functions, (2) reviewing or refactoring existing Rust code, (3) deciding between borrowing vs cloning or ownership patterns, (4) implementing error handling with Result types, (5) optimizing Rust code for performance, (6) writing tests or documentation for Rust projects. |
| `rust-neckbeard` | [`references/skills/rust-neckbeard/SKILL.md`](references/skills/rust-neckbeard/SKILL.md) | Dedalus Rust correctness and style rules. Use when writing, reviewing, or refactoring any Rust code in the host-agent, enclave, or packages/rust workspaces. Covers return-value naming, error design, must_use, visibility, RAII, fail-closed, and all hard limits from style.md and rust.mdx. |
<!-- folded-skills:auto:end -->
## Related Skills

- `find-skills` for upstream skill discovery before adding new children
- `skill-creator` for pruning or extending this router
