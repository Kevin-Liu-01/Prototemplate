# Go Style — Full Reference

The Go style guide is split across three documents. Read all three before making style judgments.

## Documents

1. [Guide](docs/src/style/go/guide.mdx) — Canonical principles (clarity, simplicity, concision, maintainability, consistency). Formatting, MixedCaps, line/file length, naming basics.

2. [Decisions](docs/src/style/go/decisions.mdx) — Normative review decisions. File headers, naming (underscores, packages, receivers, constants, initialisms, getters), imports, error handling, documentation, struct tags, testing conventions.

3. [Best Practices](docs/src/style/go/best-practices.mdx) — Practical patterns. Function/method naming (avoid repetition), test doubles, util packages, package size, imports.

## How to Use

Read the relevant document sections for the Go code you're working on. The `.agents/rules/go.md` file has the essentials loaded automatically. This skill provides the full reference for edge cases and review decisions.

When reviewing Go code, check the Decisions document for the specific convention. When writing new Go code, check Best Practices for the recommended pattern.
