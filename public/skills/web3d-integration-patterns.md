# Web 3D Integration Patterns

## Overview

This meta-skill provides architectural patterns, best practices, and integration strategies for combining multiple 3D and animation libraries in web applications. It synthesizes knowledge from the threejs-webgl, gsap-scrolltrigger, react-three-fiber, motion-framer, and react-spring-physics skills into cohesive patterns for building complex, performant 3D web experiences.

**When to use this skill:**
- Building complex 3D applications that combine multiple libraries
- Creating scroll-driven 3D experiences with animation orchestration
- Implementing physics-based interactions with 3D scenes
- Managing state across 3D rendering and UI animations
- Optimizing performance in multi-library architectures
- Designing reusable component architectures for 3D applications
- Migrating between or combining animation approaches

**Core Integration Combinations:**
1. **Three.js + GSAP** - Scroll-driven 3D animations, timeline orchestration
2. **React Three Fiber + Motion** - State-based 3D with declarative animations
3. **React Three Fiber + GSAP** - Complex 3D sequences in React
4. **React Three Fiber + React Spring** - Physics-based 3D interactions
5. **Three.js + GSAP + React** - Hybrid imperative/declarative 3D


## Progressive Disclosure

This `SKILL.md` is the routing layer. Detailed recipes, examples, integration notes, and troubleshooting guidance live in `references/details.md` so they are loaded only when the task needs them.

Before producing concrete output, making a design recommendation, or debugging an implementation, load the relevant reference section below. Do not rely on memory for branch-specific APIs, examples, or caveats.

| Task branch | Read first |
| --- | --- |
| Architecture Patterns | `references/details.md#architecture-patterns` |
| Common Integration Patterns | `references/details.md#common-integration-patterns` |
| State Management Strategies | `references/details.md#state-management-strategies` |
| Performance Optimization | `references/details.md#performance-optimization` |
| Common Pitfalls | `references/details.md#common-pitfalls` |
| Decision Matrix | `references/details.md#decision-matrix` |
| Resources | `references/details.md#resources` |

## Related Skills

**Foundation Skills** (use these for library-specific details):
- **threejs-webgl** - Three.js fundamentals, scene setup, rendering
- **gsap-scrolltrigger** - GSAP animations, ScrollTrigger, timelines
- **react-three-fiber** - R3F components, hooks, Drei helpers
- **motion-framer** - Motion components, gestures, layout animations
- **react-spring-physics** - Spring physics, React Spring hooks

**When to Reference Foundation Skills:**
- Three.js-specific API questions → `threejs-webgl`
- ScrollTrigger syntax → `gsap-scrolltrigger`
- R3F hooks and patterns → `react-three-fiber`
- Motion gesture handling → `motion-framer`
- Spring configuration → `react-spring-physics`

**This Meta-Skill Covers:**
- Architecture patterns for combining libraries
- State management across libraries
- Performance optimization strategies
- Common integration pitfalls
- Decision-making frameworks

---

**Use this skill when building complex 3D web applications that integrate multiple animation and rendering libraries. For library-specific implementation details, reference the individual foundation skills.**
