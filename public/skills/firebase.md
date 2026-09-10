# Firebase

Use this as the single executable router for Firebase work.

## Routing

- Start with project and CLI context; use npx firebase-tools where the folded references require it.
- Route product-specific work to Auth, Firestore, Hosting, Data Connect, AI Logic, App Hosting, Crashlytics, or Remote Config references.
- Security-sensitive work loads Security Rules guidance before writing rules or data access code.

## Reference Loading

Load one folded reference at a time. Prefer the most specific reference that matches the user's named service, framework, command, or error. If no folded reference matches, use the router guidance here and verify with primary docs or local project state.

<!-- folded-skills:auto:start -->
## Folded Skill References

These former standalone skills are bundled here as references to keep the runtime list compact. Load only the reference that matches the user's exact product, framework, or failure mode.

| Former skill | Reference | Description |
| --- | --- | --- |
| `firebase-ai-logic-basics` | [`references/skills/firebase-ai-logic-basics/SKILL.md`](references/skills/firebase-ai-logic-basics/SKILL.md) | Official skill for integrating Firebase AI Logic (Gemini API) into web applications. Covers setup, multimodal inference, structured output, and security. |
| `firebase-app-hosting-basics` | [`references/skills/firebase-app-hosting-basics/SKILL.md`](references/skills/firebase-app-hosting-basics/SKILL.md) | Deploy and manage web apps with Firebase App Hosting. Use this skill when deploying Next.js/Angular apps with backends. |
| `firebase-auth-basics` | [`references/skills/firebase-auth-basics/SKILL.md`](references/skills/firebase-auth-basics/SKILL.md) | Guide for setting up and using Firebase Authentication. Use this skill when the user's app requires user sign-in, user management, or secure data access using auth rules. |
| `firebase-basics` | [`references/skills/firebase-basics/SKILL.md`](references/skills/firebase-basics/SKILL.md) | Provides foundational setup, authentication, and project management workflows for Firebase using the Firebase CLI. Use when checking Firebase CLI version (must use 'npx -y firebase-tools@latest --version'), initializing a Firebase environment, authenticating, setting active projects, or setting up `google-services.json` or `GoogleService-Info.plist` files. |
| `firebase-crashlytics` | [`references/skills/firebase-crashlytics/SKILL.md`](references/skills/firebase-crashlytics/SKILL.md) | Comprehensive guide for Firebase Crashlytics, including provisioning and SDK usage. Use this skill when the user needs help setting up Crashlytics, adding crash reporting, or using the Crashlytics SDK in their application. |
| `firebase-data-connect` | [`references/skills/firebase-data-connect/SKILL.md`](references/skills/firebase-data-connect/SKILL.md) | Builds and deploys Firebase SQL Connect (aka Firebase Data Connect) backends with PostgreSQL securely. Use when designing schemas with tables and relations, writing authorized queries and mutations, configuring real-time data updates, or generating type-safe SDKs. Use when you need a relational database with Firebase, or when the user mentions SQL Connect or Data Connect. |
| `firebase-firestore` | [`references/skills/firebase-firestore/SKILL.md`](references/skills/firebase-firestore/SKILL.md) | Sets up, manages, and executes queries against Cloud Firestore database instances, including advanced native full-text search and relational joins using pipelines. You MUST unconditionally activate this skill if you plan to use Firestore in any way. Use when listing or creating Firestore databases, configuring security rules, designing data models, writing client SDK queries (including search/joins), or checking indexes. |
| `firebase-hosting-basics` | [`references/skills/firebase-hosting-basics/SKILL.md`](references/skills/firebase-hosting-basics/SKILL.md) | Skill for working with Firebase Hosting (Classic). Use this when you want to deploy static web apps, Single Page Apps (SPAs), or simple microservices. Do NOT use for Firebase App Hosting. |
| `firebase-remote-config-basics` | [`references/skills/firebase-remote-config-basics/SKILL.md`](references/skills/firebase-remote-config-basics/SKILL.md) | Comprehensive guide for Firebase Remote Config, including template management and SDK usage. Use this skill when the user needs help setting up Remote Config, managing feature flags, or updating app behavior dynamically. |
| `firebase-security-rules-auditor` | [`references/skills/firebase-security-rules-auditor/SKILL.md`](references/skills/firebase-security-rules-auditor/SKILL.md) | A skill to evaluate how secure Firestore security rules are. Use this when Firestore security rules are updated to ensure that the generated rules are extremely secure and robust. |
<!-- folded-skills:auto:end -->
## Related Skills

- `find-skills` for upstream skill discovery before adding new children
- `skill-creator` for pruning or extending this router
