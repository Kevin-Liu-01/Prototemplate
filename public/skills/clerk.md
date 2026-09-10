# Clerk Skills Router

## Version Detection

Check `package.json` to determine the Clerk SDK version. This determines which patterns to use:

| Package | Core 2 (LTS until Jan 2027) | Current |
|---------|----------------------------|---------|
| `@clerk/nextjs` | v5–v6 | v7+ |
| `@clerk/react` or `@clerk/clerk-react` | v5–v6 | v7+ |
| `@clerk/expo` or `@clerk/clerk-expo` | v1–v2 | v3+ |
| `@clerk/react-router` | v1–v2 | v3+ |
| `@clerk/tanstack-react-start` | < v0.26.0 | v0.26.0+ |

**Default to current** if the version is unclear or the project is new. Core 2 packages use `@clerk/clerk-react` and `@clerk/clerk-expo` (with `clerk-` prefix); current packages use `@clerk/react` and `@clerk/expo`.

All skills are written for the current SDK. When something differs in Core 2, it's noted inline with `> **Core 2 ONLY (skip if current SDK):**` callouts. The exception is `clerk-custom-ui`, which has separate `core-2/` and `core-3/` directories for custom flow hooks since those APIs are entirely different between versions.

---

## By Task

**Adding Clerk to your project** → Use `clerk-setup`
- Framework detection and quickstart
- Environment setup, API keys, Keyless flow
- Migration from other auth providers

**Custom sign-in/sign-up UI** → Use `clerk-custom-ui`
- Custom authentication flows with `useSignIn` / `useSignUp` hooks
- Appearance and styling (themes, colors, layout)
- `<Show>` component for conditional rendering

**Advanced Next.js patterns** → Use `clerk-nextjs-patterns`
- Server vs Client auth APIs
- Middleware strategies
- Server Actions, caching
- API route protection

**React patterns** → Use `clerk-react-patterns`
- Hooks (`useAuth`, `useUser`, `useClerk`)
- Protected routes, auth guards
- Router integration

**React Router patterns** → Use `clerk-react-router-patterns`
- Loaders & actions with auth
- Route protection
- SSR auth

**Vue patterns** → Use `clerk-vue-patterns`
- Composables (`useAuth`, `useUser`, `useClerk`)
- Vue Router guards
- Pinia auth store integration

**Nuxt patterns** → Use `clerk-nuxt-patterns`
- Server middleware auth
- SSR auth with composables
- Server API routes

**Astro patterns** → Use `clerk-astro-patterns`
- SSR auth pages
- Island components with React
- Middleware & API routes

**TanStack Start patterns** → Use `clerk-tanstack-patterns`
- Server functions with auth
- Route protection via loaders
- Vinxi server integration

**Expo patterns** → Use `clerk-expo-patterns`
- Secure token storage
- OAuth deep linking
- Push notifications with auth

**Chrome Extension patterns** → Use `clerk-chrome-extension-patterns`
- Background scripts auth
- Popup auth flows
- Content scripts with sync host

**B2B / Organizations** → Use `clerk-orgs`
- Multi-tenant apps
- Organization slugs in URLs
- Roles, permissions, RBAC
- Member management

**Billing & Subscriptions** → Use `clerk-billing`
- `<PricingTable />` component
- Plan and feature gating with `has()`
- Seat-based B2B billing with organizations
- Subscription lifecycle webhooks
- Free trials, invoicing

**Webhooks** → Use `clerk-webhooks`
- Real-time events
- Data syncing
- Notifications & integrations

**E2E Testing** → Use `clerk-testing`
- Playwright/Cypress setup
- Auth flow testing
- Test utilities

**Swift / native iOS auth** → Use `clerk-swift`
- Native iOS Swift and SwiftUI projects
- ClerkKit and ClerkKitUI implementation guidance
- Source-driven patterns from `clerk-ios`

**Android / native mobile auth** → Use `clerk-android`
- Native Android Kotlin and Jetpack Compose projects
- `clerk-android-api` and `clerk-android-ui` implementation guidance
- Source-driven patterns from `clerk-android`
- Do not use for Expo or React Native projects

**Backend REST API** → Use `clerk-backend-api`
- Browse API tags and endpoints
- Inspect endpoint schemas
- Execute API requests with scope enforcement

## Quick Navigation

If you know your task, you can directly access:
- `/clerk-setup` - Framework setup
- `/clerk-custom-ui` - Custom flows & appearance
- `/clerk-nextjs-patterns` - Next.js patterns
- `/clerk-react-patterns` - React patterns
- `/clerk-react-router-patterns` - React Router patterns
- `/clerk-vue-patterns` - Vue patterns
- `/clerk-nuxt-patterns` - Nuxt patterns
- `/clerk-astro-patterns` - Astro patterns
- `/clerk-tanstack-patterns` - TanStack Start patterns
- `/clerk-expo-patterns` - Expo patterns
- `/clerk-chrome-extension-patterns` - Chrome Extension patterns
- `/clerk-orgs` - Organizations
- `/clerk-billing` - Billing & subscriptions
- `/clerk-webhooks` - Webhooks
- `/clerk-testing` - Testing
- `/clerk-swift` - Swift/native iOS
- `/clerk-android` - Native Android
- `/clerk-backend-api` - Backend REST API

Or describe what you need and I'll recommend the right one.

<!-- folded-skills:auto:start -->
## Folded Skill References

These former standalone skills are bundled here as references to keep the runtime list compact. Load only the reference that matches the user's exact product, framework, or failure mode.

| Former skill | Reference | Description |
| --- | --- | --- |
| `clerk-android` | [`references/skills/clerk-android/SKILL.md`](references/skills/clerk-android/SKILL.md) | Use when implementing Clerk authentication in native Android apps with Kotlin, Clerk Android SDK, token caching, OAuth, session handling, user profile state, and protected API calls. |
| `clerk-astro-patterns` | [`references/skills/clerk-astro-patterns/SKILL.md`](references/skills/clerk-astro-patterns/SKILL.md) | Use when integrating Clerk with Astro: middleware, server-side auth, island components, protected pages, environment variables, session access, and Astro-specific routing patterns. |
| `clerk-backend-api` | [`references/skills/clerk-backend-api/SKILL.md`](references/skills/clerk-backend-api/SKILL.md) | Clerk Backend REST API explorer and executor. Browse tags, inspect endpoint schemas, and execute authenticated requests. Use when listing users, managing organizations, or calling any Clerk API endpoint. |
| `clerk-billing` | [`references/skills/clerk-billing/SKILL.md`](references/skills/clerk-billing/SKILL.md) | Use when implementing Clerk Billing subscriptions, PricingTable, plans, subscription state, entitlement checks, customer portal flows, and billing UI inside Clerk-authenticated apps. |
| `clerk-chrome-extension-patterns` | [`references/skills/clerk-chrome-extension-patterns/SKILL.md`](references/skills/clerk-chrome-extension-patterns/SKILL.md) | Use when adding Clerk auth to Chrome extensions, including popup and side panel auth, background/service worker token handling, extension routing, and secure session persistence. |
| `clerk-custom-ui` | [`references/skills/clerk-custom-ui/SKILL.md`](references/skills/clerk-custom-ui/SKILL.md) | Build custom Clerk authentication UI, appearance, hooks, and sign-in/sign-up flows for frontend apps while preserving secure Clerk auth patterns. |
| `clerk-expo` | [`references/skills/clerk-expo/SKILL.md`](references/skills/clerk-expo/SKILL.md) | Use when implementing Clerk authentication for Expo or React Native apps with @clerk/expo, SecureStore token cache, OAuth, deep links, sessions, and mobile protected API calls. |
| `clerk-expo-patterns` | [`references/skills/clerk-expo-patterns/SKILL.md`](references/skills/clerk-expo-patterns/SKILL.md) | Use for Expo and React Native Clerk patterns: SecureStore token cache, OAuth redirects, deep links, session restoration, mobile route guards, and protected backend requests. |
| `clerk-nextjs-patterns` | [`references/skills/clerk-nextjs-patterns/SKILL.md`](references/skills/clerk-nextjs-patterns/SKILL.md) | Use for advanced Clerk patterns in Next.js: middleware, Server Actions, App Router, auth() usage, caching boundaries, protected routes, organizations, and SSR/session behavior. |
| `clerk-nuxt-patterns` | [`references/skills/clerk-nuxt-patterns/SKILL.md`](references/skills/clerk-nuxt-patterns/SKILL.md) | Use when integrating Clerk with Nuxt 3: middleware, composables, server routes, session access, protected pages, environment config, and Vue/Nuxt auth patterns. |
| `clerk-orgs` | [`references/skills/clerk-orgs/SKILL.md`](references/skills/clerk-orgs/SKILL.md) | Use when building B2B SaaS with Clerk Organizations: org creation, membership, roles, invitations, active organization state, org-scoped authorization, and multi-tenant UI. |
| `clerk-react-patterns` | [`references/skills/clerk-react-patterns/SKILL.md`](references/skills/clerk-react-patterns/SKILL.md) | Use when integrating Clerk with React SPAs, Vite, or CRA: ClerkProvider placement, route guards, hooks, token retrieval, user profile state, and protected API calls. |
| `clerk-react-router-patterns` | [`references/skills/clerk-react-router-patterns/SKILL.md`](references/skills/clerk-react-router-patterns/SKILL.md) | Use for Clerk with React Router v7: rootAuthLoader, loader/action auth, middleware patterns, protected routes, session access, and data router integration. |
| `clerk-setup` | [`references/skills/clerk-setup/SKILL.md`](references/skills/clerk-setup/SKILL.md) | Set up Clerk authentication in an app, including quickstart wiring, environment variables, middleware, routes, and user/session integration. |
| `clerk-swift` | [`references/skills/clerk-swift/SKILL.md`](references/skills/clerk-swift/SKILL.md) | Use when implementing Clerk authentication in native Swift or iOS apps with ClerkKit, session handling, OAuth, token storage, protected API calls, and user profile state. |
| `clerk-tanstack-patterns` | [`references/skills/clerk-tanstack-patterns/SKILL.md`](references/skills/clerk-tanstack-patterns/SKILL.md) | Use when integrating Clerk with TanStack Router or TanStack Start: route protection, auth context, loaders, server functions, session access, and Clerk provider placement. |
| `clerk-testing` | [`references/skills/clerk-testing/SKILL.md`](references/skills/clerk-testing/SKILL.md) | Use when writing or debugging E2E tests for Clerk apps with Playwright or Cypress: auth flows, test users, session setup, protected routes, and deterministic login state. |
| `clerk-vue-patterns` | [`references/skills/clerk-vue-patterns/SKILL.md`](references/skills/clerk-vue-patterns/SKILL.md) | Use when integrating Clerk with Vue 3: composables such as useAuth/useUser, route guards, provider setup, protected views, token access, and session-aware UI. |
| `clerk-webhooks` | [`references/skills/clerk-webhooks/SKILL.md`](references/skills/clerk-webhooks/SKILL.md) | Use when implementing or debugging Clerk webhooks, Svix signature verification, user/org event syncing, idempotent handlers, retries, local testing, and webhook security. |
<!-- folded-skills:auto:end -->
