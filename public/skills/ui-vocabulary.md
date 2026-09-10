# UI Vocabulary

Turn “I can point at it but cannot name it” into a small, evidence-backed
candidate set. Naming is a routing step: it precedes component selection,
implementation, and polish.

Read `wiki/concepts/ui-component-vocabulary.md` for the current source hierarchy
and `wiki/design/design-system.md` for Kevin's component rules.

## 1. Freeze the clues

Separate visible facts from behavior that still needs proof. Record only the
dimensions that distinguish nearby patterns:

- platform and surface: web, macOS, mobile, desktop shell, or named design system;
- placement and anchor: inline, attached to a trigger, centered, edge-mounted,
  floating, or persistent in layout;
- invocation: click, hover, focus, typing, shortcut, scroll, or automatic event;
- persistence and dismissal: persistent, timed, outside-click, selection, or
  explicit close;
- job: inform, reveal, navigate, choose a value, invoke an action, or contain a
  separate task;
- focus and modality: whether it accepts focus, traps focus, blocks the rest of
  the surface, or preserves background interaction;
- visible anatomy: trigger, indicator, panel, handle, track, scrim, selection,
  error, or other named part;
- implementation clues: native element, accessibility role/state, framework
  primitive, or platform API symbol.

For a screenshot, mark invocation, dismissal, focus, and keyboard behavior as
unknown unless another artifact proves them. For a live page, use
`agent-browser` read-only and inspect the accessibility tree plus one reversible
interaction.

Complete when the observed facts and unknown behaviors cannot be mistaken for
one another.

## 2. Discover one to three candidates

Search local knowledge first. The main owner is
`wiki/concepts/ui-component-vocabulary.md`; Component Gallery is useful for
cross-system examples.

For a generic, non-confidential description, NameThatUI is an allowed discovery
source. Its public API records the query and the site says aggregate misses help
improve retrieval, so never send customer names, unreleased product language,
repository paths, URLs, credentials, incident data, or pasted application copy.
Abstract the clue first, then run:

```bash
node skills/engineering/ui-vocabulary/scripts/search.mjs \
  --public-query "little outline around the keyboard-selected button"
```

The script refuses common private-data shapes and returns discovery candidates,
not final authority. If the query cannot be safely abstracted, stay local and
search primary documentation directly.

Rank candidates by behavioral fit. Include an alias or platform-owned name when
it materially changes implementation. Do not invent a universal name when web,
Apple, or a component library uses different terms.

Complete when each remaining candidate has a supporting clue and one fact that
would distinguish it from the others.

## 3. Verify the owning platform

Discovery does not make a term canonical. Verify the claim against the source
that owns it:

- web semantics and keyboard behavior: WHATWG HTML, WAI-ARIA, ARIA APG, and
  WCAG; use MDN for implementation and compatibility context;
- Apple platforms: Apple Human Interface Guidelines and Developer
  Documentation for the exact SwiftUI/AppKit/UIKit symbol;
- framework-specific names: the framework's current official documentation;
- visual style labels: dated primary criticism, design-system documentation, or
  the named movement's original source where available.

Reconcile the visible behavior with the documented semantics. A DOM role or
component name can be wrong in a shipping implementation.

Complete when the leading name, important alias, behavior, and API/semantic
claim have direct authority or are explicitly marked provisional.

## 4. Return a vocabulary receipt

Lead with the useful name:

```markdown
## Likely name: [component or style]

**Confidence:** high | medium | low
**Platform:** [web / macOS / ...]

[One-sentence job and behavior.]

**Why it fits**
- [observed clue]
- [observed clue]

**Do not confuse it with**
- **[nearby pattern]** — [single decisive behavioral difference]

**Verified names**
- User-facing: [name and aliases]
- Semantics/API: [native element, role, property, or framework symbol]
- Primary source: [direct link]

**Prompt-ready wording**
> Build/use a [precise name] that [behavior, state, keyboard, and dismissal rule].

**Unknown**
- [only the unresolved fact that could change the classification]
```

Include a debug prompt only when the user is implementing or repairing the
pattern. Stop after identification when implementation was not requested.

## Verification

Run the deterministic privacy and response-shape tests:

```bash
node --test skills/engineering/ui-vocabulary/scripts/search.test.mjs
```

Representative trigger cases:

- “What is the grey layer behind this modal called?” — should trigger.
- “Here is a screenshot; is this a popover, tooltip, or menu?” — should trigger.
- “Implement this already-specified Radix Popover” — should not trigger unless
  the requested behavior contradicts the name.

The skill remains probationary until representative screenshot, live-page, and
DOM/code cases produce the correct primary-source-backed distinction.

## Related Skills

- `agent-browser` — inspect rendered behavior and accessibility state.
- `animated-component-libraries` — select an implementation after naming.
- `frontend-design` — build the named interface.
- `accessibility` — audit semantics and keyboard behavior after implementation.
