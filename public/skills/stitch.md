# Stitch

Use this as the single executable router for Stitch work.

## Routing

- Design generation routes to generate-design and design-system references.
- Round-tripping routes to upload, extract-design-md, extract-static-html, and code-to-design references.
- Autonomous site iteration routes to the loop reference and its baton files.

## Reference Loading

Load one folded reference at a time. Prefer the most specific reference that matches the user's named service, framework, command, or error. If no folded reference matches, use the router guidance here and verify with primary docs or local project state.

<!-- folded-skills:auto:start -->
## Folded Skill References

These former standalone skills are bundled here as references to keep the runtime list compact. Load only the reference that matches the user's exact product, framework, or failure mode.

| Former skill | Reference | Description |
| --- | --- | --- |
| `stitch-code-to-design` | [`references/skills/stitch-code-to-design/SKILL.md`](references/skills/stitch-code-to-design/SKILL.md) | Convert frontend code (Vite, React, etc.) to a Stitch Design by chaining static HTML extraction, design system extraction, and file upload. **ALWAYS** use this skill when the user's intent is to move existing web apps or React components into Stitch (e.g., requests to "save", "migrate", or "upload"). You must use this skill even for simple "save" operations, as it is the only way to ensure the design system is extracted and assets are properly linked. |
| `stitch-extract-design-md` | [`references/skills/stitch-extract-design-md/SKILL.md`](references/skills/stitch-extract-design-md/SKILL.md) | Extract a comprehensive design system (DESIGN.md) directly from frontend source code — React, Vue, Svelte, Angular, plain HTML/CSS, or any web framework. Analyzes component files, stylesheets, Tailwind configs, theme definitions, and design tokens to produce a rich, Stitch-compatible design system document. Use this skill whenever the user wants to reverse-engineer a design system from an existing codebase, audit the visual language of a project, extract design tokens from source files, or understand the styling patterns in a frontend repo — even if they just say "what does this app look like?" or "pull out the design from this code." |
| `stitch-extract-static-html` | [`references/skills/stitch-extract-static-html/SKILL.md`](references/skills/stitch-extract-static-html/SKILL.md) | Extract self-contained static HTML from a built web application or React components by inlining CSS and images. Use this skill whenever you need to capture a specific UI state, share a static version of a page, or prepare assets for Stitch upload, even if the user just asks to 'save the HTML' or 'mock the view'. |
| `stitch-generate-design` | [`references/skills/stitch-generate-design/SKILL.md`](references/skills/stitch-generate-design/SKILL.md) | Generate new screens from text prompts or images, edit existing screens with prompts and design system tokens, and generate design variants using Stitch MCP. Includes prompt enhancement pipeline, design mappings, professional UI/UX terminology, design tokens and theme system capabilities. |
| `stitch-loop` | [`references/skills/stitch-loop/SKILL.md`](references/skills/stitch-loop/SKILL.md) | Teaches agents to iteratively build websites using Stitch with an autonomous baton-passing loop pattern |
| `stitch-manage-design-system` | [`references/skills/stitch-manage-design-system/SKILL.md`](references/skills/stitch-manage-design-system/SKILL.md) | Manage design systems in Stitch using MCP tools. Includes retrieval of assets, creating/updating design systems in Stitch, and applying them to screens. |
| `stitch-upload-to-stitch` | [`references/skills/stitch-upload-to-stitch/SKILL.md`](references/skills/stitch-upload-to-stitch/SKILL.md) | Upload local assets (images, mockups, extracted HTML, design markdown) to a Stitch project. ALWAYS use this skill when you need to upload visual assets, HTML pages, or design docs to Stitch, particularly when direct MCP tool calls fail or truncate due to base64 token limits. |
<!-- folded-skills:auto:end -->
## Related Skills

- `find-skills` for upstream skill discovery before adding new children
- `skill-creator` for pruning or extending this router
