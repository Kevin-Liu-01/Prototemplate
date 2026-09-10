# GT Admin App

This skill is the canonical guidance for `apps/admin`. Resolve admin app rules from this skill and its `references/` files.

## Required Workflow

1. Before editing `apps/admin`, read the relevant references below from this skill.
2. Apply the repository-wide TypeScript, React, i18n, and testing rules from the active repo instructions in addition to this skill.
3. For UI work, also apply the `gt-ui`, `react-best-practices`, and `react-useeffect` skills.
4. Do not declare an admin UI flow complete, open a PR, or commit until the user has manually verified the UI checklist below.

## Reference Selection

Always read:

- `references/conventions.md` - Admin engineering patterns, forms, tables, data fetching, mutations, modals, URLs, code conventions, anti-patterns.

Read when relevant:

- `references/style-guide.md` - Visual design, tokens, layout, buttons, forms, accessibility, loading states.
- `references/navigation.md` - Entity hierarchy, breadcrumbs, sidebar rules, URLs.
- `references/auth.md` - Authentication, authorization, permission checks, server-side auth.
- `references/pagination.md` - Cursor pagination, database helpers, URL params.
- `references/table-conventions.md` - Data table structure, sorting, resizing, filters, row actions.

## Non-Negotiable Admin Rules

- Data loading happens in server components; server actions are for mutations only.
- Forms validate on submit through the API, preserve user input on failure, and use explicit save/submit actions.
- Protect unsaved form changes from sidebar, breadcrumb, and browser-back navigation.
- Tables use cursor pagination, variable page size, page-local selection, searchable defining attributes, and no body row borders.
- Auth and permission checks must run server-side for protected admin operations.
- Use stable URLs and breadcrumbs that reflect the admin entity hierarchy.
- Avoid direct `useEffect`; use declarative render logic, event handlers, data-loading patterns, or `useMountEffect` only for mount-only external sync.

## UI Verification Checklist

Before we ship an admin UI flow, ask the user to manually verify:

- [ ] No layout shifts on page refresh
- [ ] No layout shifts when the page/browser resizes
- [ ] Works on small/mobile screens
- [ ] No flickers, re-fetching, or re-rendering on refresh/resize
- [ ] Loading and empty states do not cause content to jump
- [ ] Interactive elements have visible focus and hover states
- [ ] Page transitions feel smooth with no jarring swaps or white flashes
- [ ] Text is readable and nothing overflows or gets clipped at any viewport size

Do not proceed with a commit or PR until the user confirms.
