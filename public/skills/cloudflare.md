# Cloudflare

Use this as the single executable router for Cloudflare work.

## Routing

- Workers and edge runtime work routes through Wrangler and Workers best-practice references.
- Stateful agents route to Durable Objects, Agents SDK, and Sandbox SDK references.
- Security, access, and network prompts route to Cloudflare One, Turnstile, and migration references.

## Reference Loading

Load one folded reference at a time. Prefer the most specific reference that matches the user's named service, framework, command, or error. If no folded reference matches, use the router guidance here and verify with primary docs or local project state.

<!-- folded-skills:auto:start -->
## Folded Skill References

These former standalone skills are bundled here as references to keep the runtime list compact. Load only the reference that matches the user's exact product, framework, or failure mode.

| Former skill | Reference | Description |
| --- | --- | --- |
| `cloudflare-agents-sdk` | [`references/skills/cloudflare-agents-sdk/SKILL.md`](references/skills/cloudflare-agents-sdk/SKILL.md) | Build AI agents on Cloudflare Workers using the Agents SDK. Load when creating stateful agents, durable workflows, real-time WebSocket apps, scheduled tasks, MCP servers, chat applications, voice agents, or browser automation. Covers Agent class, state management, callable RPC, Workflows, durable execution, queues, retries, observability, and React hooks. Biases towards retrieval from Cloudflare docs over pre-trained knowledge. |
| `cloudflare-cloudflare` | [`references/skills/cloudflare-cloudflare/SKILL.md`](references/skills/cloudflare-cloudflare/SKILL.md) | Comprehensive Cloudflare platform skill covering Workers, Pages, storage (KV, D1, R2), AI (Workers AI, Vectorize, Agents SDK), feature flags (Flagship), networking (Tunnel, Spectrum), security (WAF, DDoS), and infrastructure-as-code (Terraform, Pulumi). Use for any Cloudflare development task. Biases towards retrieval from Cloudflare docs over pre-trained knowledge. |
| `cloudflare-durable-objects` | [`references/skills/cloudflare-durable-objects/SKILL.md`](references/skills/cloudflare-durable-objects/SKILL.md) | Create and review Cloudflare Durable Objects. Use when building stateful coordination (chat rooms, multiplayer games, booking systems), implementing RPC methods, SQLite storage, alarms, WebSockets, or reviewing DO code for best practices. Covers Workers integration, wrangler config, and testing with Vitest. Biases towards retrieval from Cloudflare docs over pre-trained knowledge. |
| `cloudflare-email-service` | [`references/skills/cloudflare-email-service/SKILL.md`](references/skills/cloudflare-email-service/SKILL.md) | Send and receive transactional emails with Cloudflare Email Service (Email Sending + Email Routing). Use when building email sending (Workers binding or REST API), email routing, Agents SDK email handling, or integrating email into any app — Workers, Node.js, Python, Go, etc. Also use for email deliverability, SPF/DKIM/DMARC, wrangler email setup, MCP email tools, or when a coding agent needs to send emails. Even for simple requests like "add email to my Worker" — this skill has critical config details. |
| `cloudflare-one` | [`references/skills/cloudflare-one/SKILL.md`](references/skills/cloudflare-one/SKILL.md) | Guides Cloudflare One Zero Trust and SASE work across Access, Gateway, WARP, Tunnel, Cloudflare WAN, DLP, CASB, device posture, and identity. Use when designing, configuring, troubleshooting, or reviewing Cloudflare One deployments. Retrieval-first: use current Cloudflare docs/API schemas instead of embedded product docs. |
| `cloudflare-one-migrations` | [`references/skills/cloudflare-one-migrations/SKILL.md`](references/skills/cloudflare-one-migrations/SKILL.md) | Plans migrations from Zscaler ZIA/ZPA, Palo Alto, legacy VPN, SWG, or SASE stacks to Cloudflare One. Use for migration assessments, policy mapping, rollout plans, and parity/gap analysis. |
| `cloudflare-sandbox-sdk` | [`references/skills/cloudflare-sandbox-sdk/SKILL.md`](references/skills/cloudflare-sandbox-sdk/SKILL.md) | Build sandboxed applications for secure code execution. Load when building AI code execution, code interpreters, CI/CD systems, interactive dev environments, or executing untrusted code. Covers Sandbox SDK lifecycle, commands, files, code interpreter, and preview URLs. Biases towards retrieval from Cloudflare docs over pre-trained knowledge. |
| `cloudflare-turnstile-spin` | [`references/skills/cloudflare-turnstile-spin/SKILL.md`](references/skills/cloudflare-turnstile-spin/SKILL.md) | Set up Cloudflare Turnstile end-to-end in a project — scan the codebase, create the widget via the Cloudflare API, deploy the managed siteverify Worker, write the frontend snippets, validate, and persist the skill. Load this when a user asks to add Turnstile, set up CAPTCHA, protect a form from bots, or fix a Turnstile integration. Mirrors developers.cloudflare.com/turnstile/spin. |
| `cloudflare-web-perf` | [`references/skills/cloudflare-web-perf/SKILL.md`](references/skills/cloudflare-web-perf/SKILL.md) | Analyzes web performance using Chrome DevTools MCP. Measures Core Web Vitals (LCP, INP, CLS) and supplementary metrics (FCP, TBT, Speed Index), identifies render-blocking resources, network dependency chains, layout shifts, caching issues, and accessibility gaps. Use when asked to audit, profile, debug, or optimize page load performance, Lighthouse scores, or site speed. Biases towards retrieval from current documentation over pre-trained knowledge. |
| `workers-best-practices` | [`references/skills/workers-best-practices/SKILL.md`](references/skills/workers-best-practices/SKILL.md) | Reviews and authors Cloudflare Workers code against production best practices. Load when writing new Workers, reviewing Worker code, configuring wrangler.jsonc, or checking for common Workers anti-patterns (streaming, floating promises, global state, secrets, bindings, observability). Biases towards retrieval from Cloudflare docs over pre-trained knowledge. |
| `wrangler` | [`references/skills/wrangler/SKILL.md`](references/skills/wrangler/SKILL.md) | Cloudflare Workers CLI for deploying, developing, and managing Workers, KV, R2, D1, Vectorize, Hyperdrive, Workers AI, Containers, Queues, Workflows, Pipelines, and Secrets Store. Load before running wrangler commands to ensure correct syntax and best practices. Biases towards retrieval from Cloudflare docs over pre-trained knowledge. |
<!-- folded-skills:auto:end -->
## Related Skills

- `find-skills` for upstream skill discovery before adding new children
- `skill-creator` for pruning or extending this router
