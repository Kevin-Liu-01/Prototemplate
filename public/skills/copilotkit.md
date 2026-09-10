# CopilotKit / AG-UI

Use this skill when the task is about exposing an agent through a user-facing surface: React app, Slack, Teams, Discord, Google Chat, mobile, or a custom UI that needs streaming replies, generative UI, approvals, and full thread context.

## Version And Source Check

Before implementation, verify current packages and docs:

```bash
npm view @copilotkit/react-core version dist-tags --json
npm view @ag-ui/core version dist-tags --json
```

As of 2026-07-01, `@copilotkit/react-core` latest is `1.62.1` and `@ag-ui/core` latest is `0.0.57`. Refresh `wiki/tools/copilotkit.md` and `wiki/concepts/ag-ui-protocol.md` if these change.

## Decision Route

1. If the target is a Vercel/React app with normal model streams and tools, compare against `ai-sdk` first. AI SDK is usually the default app runtime.
2. If the target needs embedded copilots, component-aware generative UI, or a CopilotKit project, use CopilotKit.
3. If the target is Slack, Teams, Discord, Google Chat, mobile, or "Open Tag", treat it as a cross-surface agent frontend. Verify public docs/code before claiming a specific API.
4. If the target is a custom runtime exposing UI events, use AG-UI as the protocol lens: stream, tool state, generated UI, approval, resume, completion.

## Implementation Rules

- Preserve the app's design system. Generated UI must choose from known components, not invent arbitrary HTML.
- Model output should emit structured parts/events where possible: text, tool call, tool result, approval request, generated component, error, completion.
- Human-in-the-loop actions must show proposed inputs, risk reason, approve/edit/reject/cancel options, persisted run state, and an audit trail.
- Keep thread context explicit. Name what conversation, channel, issue, ticket, or workspace the agent can read.
- Keep side effects behind approval gates when they send messages, mutate data, spend money, touch credentials, or act in a shared workspace.

## Pair With

- `ai-sdk` for Vercel AI SDK apps, typed tools, and React `useChat`.
- `frontend-design` and `ai-native-design-patterns` for surface quality.
- `cloudflare-agents-sdk`, `agents-sdk`, or provider-specific agent skills for backend runtime details.
- `security-threat-model` when the agent can act in Slack/Teams/workspaces.

## Output

Return:

- chosen frontend/runtime route and why
- package/docs versions checked
- event/state model
- approval policy
- component constraints
- verification steps for streaming, approvals, retry/cancel, and resumability
