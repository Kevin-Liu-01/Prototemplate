# Design Engineering Polish


## Progressive Disclosure

This `SKILL.md` is the routing layer. Detailed recipes, examples, integration notes, and troubleshooting guidance live in `references/details.md` so they are loaded only when the task needs them.

Before producing concrete output, making a design recommendation, or debugging an implementation, load the relevant reference section below. Do not rely on memory for branch-specific APIs, examples, or caveats.

| Task branch | Read first |
| --- | --- |
| Initial Response | `references/details.md#initial-response` |
| Core Philosophy | `references/details.md#core-philosophy` |
| Review Format (Required) | `references/details.md#review-format-required` |
| Build Animation | `references/details.md#build-animation` |
| Improve Animations | `references/details.md#improve-animations` |
| Find Animation Opportunities | `references/details.md#find-animation-opportunities` |
| Prototype Variants | `references/details.md#prototype-variants` |
| Signature-first visual directions / one dominant interactive visual | `references/signature-first-exploration.md` |
| Pick a UI Library | `references/details.md#pick-a-ui-library` |
| The Animation Decision Framework | `references/details.md#the-animation-decision-framework` |
| Animation Vocabulary | `references/details.md#animation-vocabulary` |
| Effect and WebGL Source Selection | `references/details.md#effect-and-webgl-source-selection` |
| Spring Animations | `references/details.md#spring-animations` |
| Component Building Principles | `references/details.md#component-building-principles` |
| CSS Transform Mastery | `references/details.md#css-transform-mastery` |
| clip-path for Animation | `references/details.md#clip-path-for-animation` |
| Gesture and Drag Interactions | `references/details.md#gesture-and-drag-interactions` |
| Performance Rules | `references/details.md#performance-rules` |
| Accessibility | `references/details.md#accessibility` |
| The Sonner Principles (Building Loved Components) | `references/details.md#the-sonner-principles-building-loved-components` |
| Stagger Animations | `references/details.md#stagger-animations` |
| Debugging Animations | `references/details.md#debugging-animations` |
| Review Checklist | `references/details.md#review-checklist` |

## Current Upstream Branch Map

The reviewed upstream grew from two skills in June to ten at signed commit
`78761e1`. Read `references/upstream-branch-map.md` whenever a request resembles
one of those narrower skills. Keep this parent as the sole executable owner:
dispatch to its local branch or an existing Kevin route instead of installing
ten overlapping global triggers.

The branch map is also the evidence boundary. Upstream install counts are a
discovery signal, not correctness proof; the pinned repository contains no test
or eval files. Any verdict-bearing motion recommendation still needs local
tokens, rendered behavior, reduced-motion and interruption proof, and a frozen
route/state/viewport comparison.

When the requested product is a generated fly-through brand world, isometric
diorama journey, or scroll-controlled cinematic, delegate to `scroll-world`
instead of treating it as an ordinary animation opportunity. That skill owns
the pre-rendered scene/connector pipeline, provider and spend gate, position and
velocity seam contract, native portrait chain, and seek/decode proof. Keep
GSAP/Motion for DOM choreography, Three.js/R3F for interactive runtime 3D, and
HyperFrames for a standalone video deliverable. [Source:
`oso95/scroll-world@71cc36d3`, reviewed 2026-08-12]
