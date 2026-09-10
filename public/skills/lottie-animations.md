# Lottie Animations

## Overview

Lottie is a library for rendering After Effects animations in real-time on web, iOS, Android, and React Native. Created by Airbnb, it allows designers to ship animations as easily as shipping static assets. Animations are exported from After Effects as JSON files using the Bodymovin plugin, then rendered natively with minimal performance overhead.

**When to use Lottie:**
- Designer-created animations that need pixel-perfect fidelity
- Prompt/SVG/data-driven single-scene motion assets via `text-to-lottie`
- Complex animated icons and micro-interactions
- Loading animations and progress indicators
- Onboarding sequences and tutorial animations
- Marketing animations and promotional content
- Alternative to GIF/video with smaller file sizes and scalability

**Key advantages:**
- Vector-based (scalable without quality loss)
- Significantly smaller file sizes than GIF or video
- Editable at runtime (colors, speed, segments)
- Full designer control via After Effects
- Cross-platform rendering consistency
- Interactive controls (play, pause, seek, loop)


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

## Text-to-Lottie Route

When the user asks to generate Lottie JSON from a prompt, SVG, screenshot, or
data source, read `wiki/tools/text-to-lottie.md` before implementation. The
current captured route is `diffusionstudio/lottie` via:

```bash
npx skills add diffusionstudio/lottie
```

As of 2026-06-29, the repo exposes tag `v1.0.0` and default branch HEAD
`39bb536f27225a198ed4c1ec92de0a4ab8665a9c`. Verify with `git ls-remote` before
depending on upstream behavior.

## Related Skills

- **gsap-scrolltrigger** - For scroll-driven Lottie animations synchronized with page scroll
- **motion-framer** - Combine with Framer Motion for layout animations wrapping Lottie
- **animated-component-libraries** - Pre-built components that may include Lottie animations
- **threejs-webgl** - For 3D animations beyond Lottie's 2D capabilities
- **react-three-fiber** - Alternative for complex 3D animated scenes
