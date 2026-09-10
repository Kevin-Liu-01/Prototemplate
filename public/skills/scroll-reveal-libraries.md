# Scroll Reveal Libraries

## Overview

This skill covers AOS (Animate On Scroll), a lightweight CSS-driven library for scroll-triggered animations. AOS excels at simple fade, slide, and zoom effects activated when elements enter the viewport.

**Key Features**:
- **Minimal Setup**: Single JavaScript file + CSS
- **Data Attribute API**: Configure animations in HTML
- **Performance**: CSS-driven, GPU-accelerated animations
- **50+ Built-in Animations**: Fades, slides, zooms, flips
- **Framework Agnostic**: Works with vanilla JS, React, Vue, etc.

**When to Use**:
- Marketing/landing pages with simple scroll effects
- Content-heavy sites (blogs, documentation)
- Quick prototypes requiring scroll animations
- Projects where GSAP/Framer Motion complexity isn't needed

**When NOT to Use**:
- Complex animation timelines or orchestration → Use GSAP ScrollTrigger
- Physics-based animations → Use React Spring or Framer Motion
- Precise scroll-synced animations → Use GSAP ScrollTrigger
- Heavy interactive animations → Use Framer Motion


## Progressive Disclosure

This `SKILL.md` is the routing layer. Detailed recipes, examples, integration notes, and troubleshooting guidance live in `references/details.md` so they are loaded only when the task needs them.

Before producing concrete output, making a design recommendation, or debugging an implementation, load the relevant reference section below. Do not rely on memory for branch-specific APIs, examples, or caveats.

| Task branch | Read first |
| --- | --- |
| Core Concepts | `references/details.md#core-concepts` |
| Common Patterns | `references/details.md#common-patterns` |
| Integration Patterns | `references/details.md#integration-patterns` |
| Performance Optimization | `references/details.md#performance-optimization` |
| Common Pitfalls | `references/details.md#common-pitfalls` |
| Built-in Animations | `references/details.md#built-in-animations` |
| Custom Animations | `references/details.md#custom-animations` |
| Comparison with Alternatives | `references/details.md#comparison-with-alternatives` |
| Resources | `references/details.md#resources` |

## Related Skills

- **gsap-scrolltrigger**: For complex scroll-driven animations
- **motion-framer**: For React-specific animations with physics
- **locomotive-scroll**: For smooth scrolling with parallax
- **animated-component-libraries**: For pre-built animated React components
