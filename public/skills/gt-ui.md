# GT UI Design System

Strict design rules for the shared UI component library (`packages/ui`), new dashboard (`apps/dashboard`), and landing page (`apps/landing`). These are non-negotiable — follow them for every UI change.

## Quick Reference

| Area          | Rule                                                                                  |
| ------------- | ------------------------------------------------------------------------------------- |
| Border radius | `rounded-md` for everything (see [exceptions](./border-radius.md#exceptions))         |
| Colors        | Black/white base + 5 approved colors only. Use semantic tokens, never raw values.     |
| Typography    | Geist / Geist Mono. Min `text-sm`. No thin weights. Always `antialiased`.             |
| Buttons       | Always use `Button` component. `rainbow` only for single most important CTA per page. |
| Sibling spacing | Layout parents own sibling spacing with `gap-*` or `space-*`; avoid repeated child margins. |
| Surface nesting | Do not nest Cards; use spacing and headings to create hierarchy within a surface. |
| Dark mode     | Semantic tokens, not `dark:` overrides. No `useTheme()` for conditional markup.       |
| shadcn/ui     | `radix-vega` preset. Override via CSS variables, not editing base output.             |

## Translation Wrapping

For JSX UI copy, prefer one `<T>` around the largest static JSX structure that makes sense instead of wrapping only text nodes. `<T>` can wrap elements and components, which gives translations more useful markup context.

```tsx
<T>
  <Button>Save changes</Button>
</T>
```

Do not nest `<T>` components. Do not put raw variables, ternaries, or mapped expressions directly inside `<T>`; use GT variable, number, date, plural, or branch components for dynamic content. `<T>` does not translate user-facing props passed to child components, so translate those props with `gt()`.

## Detailed Guidance

- [Border Radius](./border-radius.md)
- [Colors](./colors.md)
- [Typography](./typography.md)
- [Buttons](./buttons.md)
- [Sibling Spacing](./sibling-spacing.md)
- [Nested Surfaces](./nested-surfaces.md)
- [Dark Mode](./dark-mode.md)
- [shadcn/ui Preset](./shadcn-preset.md)
