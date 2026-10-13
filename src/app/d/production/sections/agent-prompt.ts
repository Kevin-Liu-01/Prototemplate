/**
 * The agent prompt the home hero's Setup for Agents button copies.
 *
 * Source: https://generaltranslation.com/agent-prompt.md, fetched
 * 2026-10-13. The live site reads it at build time from the
 * ````markdown title="agent-prompt.md" block on the docs page
 * overview/for-coding-agents (gt-cloud apps/landing/src/lib/agent-prompt.ts)
 * and serves the same text at /agent-prompt.md. This mirror vendors the
 * public text and never fetches it at runtime; a re-sync replaces the
 * string with a fresh download and updates the date above.
 */
export const AGENT_PROMPT = `# Get started with General Translation

I landed on https://generaltranslation.com and clicked "Setup for Agents". Help me add General Translation to my app, website, or content, and get a real translation working. Inspect the project you have access to, choose the appropriate integration with me, and implement it. Continue through setup, translation, and verification rather than stopping at a plan.

## About General Translation

General Translation (GT) combines open-source internationalization libraries, a translation CLI, and a hosted translation platform. Source content stays in your code or content files. The libraries render translations and format locale-sensitive values; the platform generates and manages translations. Locadex is an optional hosted agent that connects to GitHub and maintains localization through pull requests.

- Website: https://generaltranslation.com
- Dashboard: https://dash.generaltranslation.com
- Open-source libraries and CLI: https://github.com/generaltranslation/gt
- Documentation entry point: https://generaltranslation.com/llms.txt
- Complete documentation index: https://generaltranslation.com/llms-index.txt
- API specification: https://generaltranslation.com/openapi.yaml

Fetch the documentation entry point first, then the quickstart and references relevant to this project. Documentation pages are available as raw Markdown by appending \`.mdx\` to the page URL. Use the complete index when you need a page that is not in the curated index. Read current docs and installed command help instead of guessing APIs, flags, or framework setup. \`gt auth\` is not a command in current releases; use \`gt login\`. \`gt generate\` writes source templates without calling the API and is registered when the CLI detects \`gt-next\`, \`gt-react\`, \`gt-react-native\`, \`gt-tanstack-start\`, \`gt-node\`, \`gt-vue\`, \`gt-flask\`, or \`gt-fastapi\`. Use \`gt translate\` for hosted translation.

## Work with me

Read this entire prompt before acting. Respect the repository's instructions, package manager, architecture, design system, and existing changes.

First inspect the repository for the framework, router, app directory, existing i18n library, GT configuration, source language, and build scripts. In a monorepo, identify the specific app or content directory; do not run setup at the workspace root. Do not ask me things you can determine from the code.

If the intended project is unclear, ask one question: "What would you like to translate?" Offer concrete choices: this app or website, documentation or content files, a backend service, a connected content platform, or a small new demo. Include "Not sure, help me decide." Prefer your interactive question tool when available. If no repository is open, help me open one or choose a small demo before scaffolding anything.

Ask for missing decisions one at a time: source language, target languages, and the first page or workflow to translate. Preserve existing locale choices; do not assume the source language is English or invent target markets. If I want help choosing, propose one target language for the first working example. Reuse an existing i18n setup where appropriate instead of automatically migrating the entire application.

Explain the next meaningful step briefly, then do the work. Ask when a choice affects which organization/project you use, creates an unwanted duplicate, or changes the agreed scope. Once I have chosen the project, languages, and scope, proceed with the setup and translation needed for that outcome.

## Choose the right integration

Read the matching quickstart before making framework changes:

| Project | Integration | Quickstart |
| --- | --- | --- |
| Next.js App Router | \`gt-next\` | https://generaltranslation.com/docs/react/nextjs-quickstart.mdx |
| Next.js Pages Router | \`gt-next\` | https://generaltranslation.com/docs/react/nextjs-pages-router-quickstart.mdx |
| React SPA, including Vite | \`gt-react\` | https://generaltranslation.com/docs/react/react-spa-quickstart.mdx |
| Server-rendered React | \`gt-react\` | https://generaltranslation.com/docs/react/react-quickstart.mdx |
| TanStack Start | \`gt-tanstack-start\` | https://generaltranslation.com/docs/react/tanstack-start-quickstart.mdx |
| React Router framework mode, including Shopify Hydrogen | \`gt-react\` | https://generaltranslation.com/docs/react/react-router-quickstart.mdx |
| React Native or Expo | \`gt-react-native\` | https://generaltranslation.com/docs/react/react-native-quickstart.mdx |
| Vue | \`gt-vue\` | https://generaltranslation.com/docs/vue/quickstart.mdx |
| Node.js backend | \`gt-node\` | https://generaltranslation.com/docs/node/quickstart.mdx |
| Python backend | Follow the Python SDK guide | https://generaltranslation.com/docs/python/quickstart.mdx |
| JSON, MDX, Markdown, YAML, or existing translation files | \`gt\` CLI | https://generaltranslation.com/docs/cli/quickstart.mdx |
| Lower-level JavaScript translation | \`generaltranslation\` | https://generaltranslation.com/docs/platform/core/quickstart.mdx |

For Mintlify, Sanity, Storyblok, or Google Drive, fetch https://generaltranslation.com/docs/integrations/llms.txt and follow that integration's quickstart. Do not apply a React setup wizard to a content integration. If I want GT to continuously maintain localization through GitHub, read https://generaltranslation.com/docs/platform/locadex/quickstart.mdx and walk me through connecting the repository and creating the appropriate automation. Do not enable auto-merge or change paid plans without my direction.

## Run the CLI without questions

The CLI is interactive. When \`init\` or \`configure\` is missing an answer, it does not fail: it asks the question in the terminal and waits, with no timeout. In an agent session that wait never ends. So in this session:

- Always pass \`--no-interactive\`. With it, a missing answer is a hard error that lists the flags still needed and changes no file.
- Pass a flag for every question before you run the command. \`--defaults\` accepts the recommended local choices in one flag; you still need \`--locales\` and, outside local Vite, TanStack Start, and React Router setups, \`--dev-credentials\` or \`--no-dev-credentials\`. Pass explicit \`--default-locale\`, \`--locadex\` or \`--no-locadex\`, \`--react-setup\` or \`--no-react-setup\`, and \`--file-formats\` values only when you want to override the defaults. Local Vite, TanStack Start, and React Router setups default to \`--no-live-translations\`; pass \`--live-translations\` to opt in. Never combine the \`--[no-]live-translations\` and \`--[no-]dev-credentials\` flag families.
- Pass \`--json\` to \`init\` and \`configure\`. It implies \`--no-interactive\`, writes one result event to stdout and the rendered screen to stderr. \`translate\`, \`upload\`, \`api\`, \`whoami\`, \`project create\` and \`api-key create\` have no \`--json\` flag; \`translate\` prints a progress screen with terminal control sequences, so judge it by its exit code and by the files it writes: \`public/_gt/<locale>.json\`, \`gt-lock.json\` and \`gt.config.json\`.
- If a command prints a question and stops, you are inside an interactive prompt. End the process and rerun it with \`--no-interactive\` and the missing flag. Never type an answer into it, and never run a command whose questions you have not answered with flags.
- \`gt login\` is the one step that needs a person: it opens a browser and waits for the sign-in to finish. If no browser can open from this session, run it with \`--no-browser\`, give me the URL it prints, and wait for me to confirm. \`translate\`, \`upload\`, \`api\`, \`whoami\`, \`project create\` and \`api-key create\` ask nothing when their flags are complete; a missing required flag is an error.

## Sign in with \`gt login\`

Use account login for local CLI authentication. Do not begin by asking me to find and paste an API key.

The examples below use \`npx gt@latest\` to avoid an old local CLI. Use the project's package manager or a current installed \`gt\` binary when appropriate. Inspect the version and available commands first:

\`\`\`bash
npm view gt version
npx gt@latest --help
npx gt@latest login --help
\`\`\`

The CLI has no \`--version\` flag. \`translate\` prints "CLI Version: x.y.z" in its banner; \`init --json\` prints no banner. Read the published version with \`npm view gt version\` and the installed one from \`node_modules/gt/package.json\`.

This workflow requires a CLI release with \`login\`, \`whoami\`, and \`api-key create\`. If the installed CLI lacks them, check the latest published release. If they are still unavailable, explain the release blocker and continue with local integration work that does not require credentials. Do not silently substitute the older \`gt auth\` flow, invent flags, or install an unpublished branch into my project.

Check for an existing session with \`npx gt@latest whoami\`. If sign-in is needed, run:

\`\`\`bash
npx gt@latest login
\`\`\`

Let me complete signup/sign-in and authorization in the browser. Keep the command running while approval is pending. In a remote or headless terminal, use:

\`\`\`bash
npx gt@latest login --no-browser
\`\`\`

Show me the verification URL and code returned by that command; wait for successful authorization, then verify with \`npx gt@latest whoami\`. Do not ask for my password or extract OAuth tokens. Login authenticates the CLI; it does not by itself configure the app's project or create its runtime credentials.

## Select a project and create the credentials we need

Reuse an existing configured project if it is the intended one. Check for conflicting project IDs in configuration and environment variables without printing secret values. Do not overwrite existing credentials or create another key unnecessarily.

For a supported fresh app, run the setup wizard from the app directory after login, with every question answered by a flag. For a Next.js App Router app set up locally, with translations stored in the repository and an existing project reused:

\`\`\`bash
npx gt@latest init --no-interactive --json --defaults \\
  --default-locale <source-locale> --locales <target-locales> \\
  --no-locadex --react-setup --file-formats none \\
  --no-dev-credentials --project-id <project-id>
\`\`\`

This run asks nothing, installs gt-next, adds GTProvider to the root layout, adds withGTConfig to next.config.ts, creates loadTranslations.js and gt.config.json, and ends with \`{"type":"result","command":"init","outcome":"success"}\`. The wizard does not wrap any page text in \`<T>\`, even though its completedSteps list says "wrapped JSX content". Internationalize every page yourself in step 4 of the implementation section. The wizard runs biome on the files it changes and may replace the project's indentation with tabs; restore the project's formatting. Ignore the warning "Unexpected export type in ./next.config.ts" when withGTConfig() was added correctly. Review the wizard's changes against the framework quickstart: automatic framework setup is experimental.

\`--defaults\` covers local storage and the translations directory; pass \`--storage\` and \`--translations-dir\` only for other values. \`--no-dev-credentials --project-id <id>\` writes projectId to gt.config.json and creates no env file. Use it when no development key is wanted. If you already have a development key, add \`NEXT_PUBLIC_GT_PROJECT_ID\` and \`NEXT_PUBLIC_GT_DEV_API_KEY\` to \`.env.development.local\` yourself. \`--dev-credentials --project-id <id>\` saves a new development key and the project ID to \`.env.local\` instead; \`--create-project --org-id <id> --project-name <name>\` creates the project first. \`--no-react-setup\` is for an app that already has the GT library; on an app without one it fails with "No GT runtime is installed, so select at least one file format to translate", which is right, since there would be nothing to translate. Pass \`--locadex\` only if we agreed to use hosted automation. Before a production build, move the development key (\`NEXT_PUBLIC_GT_DEV_API_KEY\` or \`GT_DEV_API_KEY\`) from \`.env.local\` to \`.env.development.local\`: \`next dev\` loads that file and \`next build\` does not, and a production build refuses to run with a development key present. A production build that ships local translation files needs no key.

If the app already has framework setup, configure it directly from the docs. Use the authenticated CLI to discover resources:

\`\`\`bash
npx gt@latest api /v2/projects
npx gt@latest api /v2/orgs
\`\`\`

Follow pagination when present by passing \`nextCursor\` as \`?cursor=<value>\`. \`/v2/orgs\` lists the organizations the signed-in user belongs to (an API key sees only its own). Creating a project also needs the \`org:projects:create\` permission in that organization; when \`project create\` is refused, ask me which organization to use or create the project in the Dashboard at https://dash.generaltranslation.com. Use actual returned IDs. Ask me to select when the destination is ambiguous. If my new account has no suitable organization, guide me through creating one at https://dash.generaltranslation.com, then retry discovery.

When a new project is needed in the chosen organization:

\`\`\`bash
npx gt@latest project create \\
  --org-id <selected-organization-id> \\
  --name <agreed-project-name> \\
  --default-locale <source-locale>
\`\`\`

Use the returned project ID. \`project create\` may require an organization key; read \`npx gt@latest project create --help\` first and fall back to creating the project in the Dashboard. For endpoint details or a missing higher-level command, inspect \`npx gt@latest api --spec\` and the current API docs before making a request.

Local CLI operations can use the login session. Create separate project keys only where a runtime or unattended CI workflow needs one. Inspect \`npx gt@latest api-key create --help\` first. The command requires a key name and explicit permissions. A development runtime key needs \`project:translations:generate\`; a standard file translation workflow needs \`project:files:read\`, \`project:files:write\`, and \`project:translations:enqueue\`. Verify any additional operations against the API specification; do not grant every permission by default.

\`gt api-key create\` prints the secret once to stdout. Capture that output directly into protected, ignored local configuration or the intended secret store without displaying it in tool output, chat, or logs. Use \`--project-id\` for the selected project, \`--name\` for its purpose, and \`--permission\` for the required permissions. Confirm success and the variable names without showing the key.

Keep these credential roles distinct:

- CLI/CI and server credentials use \`GT_API_KEY\` and \`GT_PROJECT_ID\`. Never put \`GT_API_KEY\` in browser code or a public-prefixed variable.
- Development runtime translation uses \`GT_DEV_API_KEY\` and a project ID. Browser frameworks may need their documented public prefix, such as \`VITE_GT_DEV_API_KEY\`; for Next.js the wizard writes \`NEXT_PUBLIC_GT_PROJECT_ID\` and \`NEXT_PUBLIC_GT_DEV_API_KEY\`, and the CLI reads that project ID too, so \`GT_PROJECT_ID\` is only needed in CI. Only expose the narrowly scoped development key where the framework guide requires it; do not ship development credentials in production browser bundles.
- OAuth credentials belong in the CLI's credential store. Do not copy them into the app or CI.

Ensure local environment files are ignored by Git. Use placeholders in committed examples. Preserve unrelated environment settings. Logging in locally does not authenticate CI or a deployed server.

## Implement a complete first translation

1. Install the integration that matches the detected stack. For an existing project, make targeted changes and preserve its current behavior.
2. Create or update \`gt.config.json\` with the agreed source and target locales, source paths, and file mappings. Use the current configuration reference: https://generaltranslation.com/docs/cli/reference/config.mdx. Preserve existing settings. Configure translation output and loading together; for example, a Vite SPA's imported translation files must live within its source tree. Do not copy one framework's output path or provider setup into another framework. Add the translation output directory (for example \`public/_gt/\`) to \`.gitignore\` when translations are not committed.
3. Follow the framework's initialization and routing guide. Next.js App Router and Pages Router differ; React SPAs use \`initializeGTSPA\` before rendering; server runtimes need request-aware locale handling. Read the installed version's APIs before implementing them.
4. Internationalize the agreed page or workflow, including visible text, validation, placeholders, accessible labels, and metadata where relevant. In React, use \`<T>\` for coherent static JSX. For standalone strings in gt-next, use \`useGT()\` in client components and in synchronous server components, and \`getGT()\` from \`gt-next/server\` in async server components and in \`generateMetadata\`. \`useGT()\` returns the function directly. For Next.js metadata, replace the static \`metadata\` export with \`export async function generateMetadata()\` that calls \`getGT()\` from \`gt-next/server\` and returns the translated title and description. Use \`<Var>\` or the framework's interpolation API for dynamic values; keep private values out of translation source. Use locale-aware number, date, currency, and plural handling. Follow the matching Vue, Node, or Python APIs for those stacks.
5. Add a language switcher to a suitable place in an app's existing UI. In gt-next, \`<LocaleSelector>\` from \`gt-next\` renders directly inside a server component page; it carries its own client boundary. Give it an \`aria-label\` through \`useGT()\`. Preserve navigation and verify the selected locale survives navigation or reload as documented. For a backend or content-only project, verify locale selection and translated output through its actual API or content workflow instead.
6. Add useful context for ambiguous copy. Use the \`context\` prop on \`<T>\` and the \`$context\` option in \`gt()\` and \`getGT()\` calls. \`$context\` on \`<T>\` is a deprecated alias that the CLI flags when it scans the source. Preserve product names and terminology. Do not send secrets or runtime user data as translation source. For content files, preserve frontmatter, links, variables, and formatting according to the format guide.
7. Inspect the translation scope with \`npx gt@latest translate --dry-run\`, then run \`npx gt@latest translate\` for the agreed languages and scope. If this would unexpectedly translate a large corpus or exceed the agreed scope, clarify that before submitting it. \`gt translate\` also writes \`gt-lock.json\` and a \`_versionId\` into \`gt.config.json\`; commit both. Use the connected-platform workflow instead when the integration requires one.

## Verify and finish

Run the type check (\`npx tsc --noEmit\`) and the production build (\`next build\`). Run lint and tests only when the project already defines them. Start the app and verify the actual translated experience when browser tools are available: switch between source and target locales, navigate, reload, and check interpolation and layout. A request with neither an \`Accept-Language\` header nor the cookie renders the default locale and logs one "gt-next: No locale could be determined" warning per translation lookup; that is expected for curl without a header. Send \`Accept-Language: <target-locale>\` or \`Cookie: generaltranslation.locale=<target-locale>\` to check a target locale. Check long text and right-to-left layout if relevant to the selected language. For backend and content projects, inspect real translated responses or files. Do not claim browser verification if you could not perform it.

Fix setup or runtime failures before calling the integration complete. When blocked, fetch the relevant reference and inspect command errors rather than repeatedly recreating projects or keys.

For applications using pre-generated translations, prepare the production workflow so translation runs before the existing build and its generated files are available to the runtime. Preserve the existing build steps, document CI secret names, and check the selected integration's local-file or CDN requirements. If translations are committed and no CI key exists, keep the build script unchanged. Run \`npx gt@latest translate\` locally with the login session whenever source text changes, then commit \`public/_gt/<locale>.json\`, \`gt-lock.json\` and \`gt.config.json\`. Add \`npx gt translate\` to the build script only when a \`GT_API_KEY\` with files write and translation queue permissions is set in CI. Use \`--publish\` only when the chosen CDN workflow requires it. Do not make production deployments or merge pull requests unless I have asked you to.

Finish with a concise handoff: what changed, which project and locales are configured, how to run it, what you actually verified, and any remaining action I need to take. Include the relevant docs and Dashboard link, but no credentials. The desired outcome is a working translation in my project, with a clear path to keeping it up to date.`;
