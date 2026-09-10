# Anime.js

Lightweight JavaScript animation library with powerful timeline and stagger capabilities for web animations.

## Overview

Anime.js (pronounced "Anime JS") is a versatile animation engine that works with DOM elements, CSS properties, SVG attributes, and JavaScript objects. Unlike React-specific libraries, Anime.js works with vanilla JavaScript and any framework.

**When to use this skill:**
- Timeline-based animation sequences with precise choreography
- Staggered animations across multiple elements
- SVG path morphing and drawing animations
- Keyframe animations with percentage-based timing
- Text reveal/scramble effects with `scrambleText()`
- Framework-agnostic animation (works with React, Vue, vanilla JS)
- Complex easing functions (spring, steps, cubic-bezier)

**Core features:**
- Timeline sequencing with relative positioning
- Powerful stagger utilities (grid, from center, easing)
- SVG morphing and path animations
- Built-in text splitting and `scrambleText()` for character-level text reveals
- Built-in spring physics easing
- Keyframe support with flexible timing
- Small bundle size (~9KB gzipped)


## Progressive Disclosure

This `SKILL.md` is the routing layer. Detailed recipes, examples, integration notes, and troubleshooting guidance live in `references/details.md` so they are loaded only when the task needs them.

Before producing concrete output, making a design recommendation, or debugging an implementation, load the relevant reference section below. Do not rely on memory for branch-specific APIs, examples, or caveats.

| Task branch | Read first |
| --- | --- |
| Core Concepts | `references/details.md#core-concepts` |
| Common Patterns | `references/details.md#common-patterns` |
| Text Effects | `references/details.md#text-effects` |
| Integration Patterns | `references/details.md#integration-patterns` |
| Advanced Techniques | `references/details.md#advanced-techniques` |
| Performance Optimization | `references/details.md#performance-optimization` |
| Common Pitfalls | `references/details.md#common-pitfalls` |
| Resources | `references/details.md#resources` |

## Related Skills

- **gsap-scrolltrigger** - More powerful timeline features and scroll integration
- **motion-framer** - React-specific declarative animations
- **react-spring-physics** - Physics-based spring animations
- **lightweight-3d-effects** - Simple 3D effects (Zdog, Vanta.js)

**Anime.js vs GSAP**: Use Anime.js for SVG-heavy animations, simpler projects, or when bundle size matters. Use GSAP for complex scroll-driven experiences, advanced timelines, and professional-grade control.

**Anime.js vs Framer Motion**: Use Anime.js for framework-agnostic projects or when working outside React. Use Framer Motion for React-specific declarative animations with gesture integration.
