# GT Dashboard App

This skill is the canonical guidance for `apps/dashboard`. Resolve dashboard app rules from this skill and its `references/` files.

## Required Workflow

1. Before editing `apps/dashboard`, read the relevant references below from this skill.
2. Apply the repository-wide TypeScript, React, i18n, and testing rules from the active repo instructions in addition to this skill.
3. For UI work, also apply the `gt-ui`, `react-best-practices`, and `react-useeffect` skills.
4. Do not declare a dashboard UI flow complete, open a PR, or commit until the user has manually verified the UI checklist below.

## Reference Selection

Always read:

- `references/conventions.md` - Dashboard engineering patterns, forms, tables, data fetching, mutations, modals, URLs, code conventions, anti-patterns.

Read when relevant:

- `references/style-guide.md` - Visual design, tokens, layout, buttons, forms, accessibility, loading states.
- `references/navigation.md` - Entity hierarchy, breadcrumbs, sidebar rules, URLs.
- `references/auth.md` - Authentication, authorization, permission checks, server-side auth.
- `references/onboarding.md` - Onboarding flow, shared package functions, Slack notification logic.

When editing billing or usage code, no billing reference document exists in this skill. Inspect the current implementation in `apps/dashboard/src/actions/billing.ts`, `apps/dashboard/src/components/dashboard/billing`, `apps/dashboard/src/components/dashboard/usage`, `apps/dashboard/src/lib/billing`, and `apps/dashboard/src/lib/resolveUsageRange.ts` before changing behavior.

## Non-Negotiable Dashboard Rules

- Data loading happens in server components; server actions are for mutations only.
- Forms validate on submit through the API, preserve user input on failure, and use explicit save/submit actions.
- Protect unsaved form changes from sidebar, breadcrumb, and browser-back navigation.
- Tables use cursor pagination, variable page size, page-local selection, searchable defining attributes, and no body row borders.
- Auth and permission checks must run server-side for protected dashboard operations.
- Onboarding changes must preserve the documented step flow, shared package contracts, and Slack notification behavior.
- Avoid direct `useEffect`; use declarative render logic, event handlers, data-loading patterns, or `useMountEffect` only for mount-only external sync.

## UI Verification Checklist

Before we ship a dashboard UI flow, ask the user to manually verify:

- [ ] No layout shifts on page refresh
- [ ] No layout shifts when the page/browser resizes
- [ ] Works on small/mobile screens
- [ ] No flickers, re-fetching, or re-rendering on refresh/resize
- [ ] Loading and empty states do not cause content to jump
- [ ] Interactive elements have visible focus and hover states
- [ ] Page transitions feel smooth with no jarring swaps or white flashes
- [ ] Text is readable and nothing overflows or gets clipped at any viewport size

Do not proceed with a commit or PR until the user confirms.
