# Barba.js

Modern page transition library for creating fluid, smooth transitions between website pages. Barba.js makes multi-page websites feel like Single Page Applications (SPAs) by hijacking navigation and managing transitions without full page reloads.

## Overview

Barba.js is a lightweight (7kb minified and compressed) JavaScript library that intercepts navigation between pages, fetches new content via AJAX, and smoothly transitions between old and new containers. It reduces page load delays and HTTP requests while maintaining the benefits of traditional multi-page architecture.

**Core Features**:
- Smooth page transitions without full reloads
- Lifecycle hooks for precise control over transition phases
- View-based logic for page-specific behaviors
- Built-in routing with @barba/router plugin
- Extensible plugin system
- Small footprint and high performance
- Framework-agnostic (works with vanilla JS, GSAP, anime.js, etc.)


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
| Resources | `references/details.md#resources` |

## Related Skills

- **gsap-scrolltrigger** - For advanced GSAP animations in transitions
- **locomotive-scroll** - Can be combined with Barba for smooth scrolling between pages
- **motion-framer** - Alternative approach for React-based page transitions
