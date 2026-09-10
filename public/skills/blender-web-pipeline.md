# Blender Web Pipeline

## Overview

Blender Web Pipeline skill provides workflows for exporting 3D models and animations from Blender to web-optimized formats (primarily glTF 2.0). It covers Python scripting for batch processing, optimization techniques for web performance, and integration with web 3D libraries like Three.js and Babylon.js.

**When to use this skill:**
- Exporting Blender models for web applications
- Batch processing multiple 3D assets
- Optimizing file sizes for web delivery
- Automating repetitive Blender tasks
- Creating production pipelines for 3D web content
- Converting legacy formats to glTF

**Key capabilities:**
- glTF 2.0 export with optimization
- Python (bpy) automation scripts
- Texture baking and compression
- LOD (Level of Detail) generation
- Batch processing workflows
- Material and lighting optimization for web


## Progressive Disclosure

This `SKILL.md` is the routing layer. Detailed recipes, examples, integration notes, and troubleshooting guidance live in `references/details.md` so they are loaded only when the task needs them.

Before producing concrete output, making a design recommendation, or debugging an implementation, load the relevant reference section below. Do not rely on memory for branch-specific APIs, examples, or caveats.

| Task branch | Read first |
| --- | --- |
| Core Concepts | `references/details.md#core-concepts` |
| Common Patterns | `references/details.md#common-patterns` |
| Integration Patterns | `references/details.md#integration-patterns` |
| Optimization Techniques | `references/details.md#optimization-techniques` |
| Common Pitfalls | `references/details.md#common-pitfalls` |
| Best Practices | `references/details.md#best-practices` |
| Resources | `references/details.md#resources` |

## Related Skills

- **threejs-webgl** - Load and render exported glTF models in Three.js
- **react-three-fiber** - Use glTF models in React applications
- **babylonjs-engine** - Alternative 3D engine for web
- **playcanvas-engine** - Game engine that supports glTF import
