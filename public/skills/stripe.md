# stripe

## Script

```bash
node --experimental-strip-types ${CLAUDE_SKILL_DIR}/scripts/stripe.ts <verb> <resource> [id] [flags]
```

## Verbs

| Verb | HTTP | Requires ID | Write? |
|------|------|------------|--------|
| get | GET | yes | no |
| list | GET | no | no |
| search | GET | no | no |
| create | POST | no | yes |
| update | POST | yes | yes |
| delete | DELETE | yes | yes |

## Resources

customers, payment_methods, subscriptions, charges, invoices,
payment_intents, checkout_sessions, refunds, events, products,
prices, credit_grants, balance_transactions

## Flags

- `--customer cus_xxx` filter by customer
- `--type card` filter payment methods by type
- `--status active` filter by status
- `--limit 10` max results
- `--query "email:'foo@bar.com'"` for search verb
- `--format json|table` output format (default: table)
- Any `--key value` pair maps to Stripe API parameters

## Rules

1. **Write operations require test-mode keys.** The script checks `sk_test_*` prefix. Live key writes throw.
2. **Never delete production resources** unless the user explicitly confirms.
3. Default output is table. Use `--format json` for structured output.

## Examples

```bash
# List payment methods for a customer
stripe list payment_methods --customer cus_abc --type card

# Get a specific checkout session
stripe get checkout_session cs_abc

# List recent events
stripe list events --type checkout.session.completed --limit 5

# Search customers by email
stripe search customers --query "email:'win@dedaluslabs.ai'"

# Refund a payment (test mode only)
stripe create refund --payment_intent pi_abc --amount 2000

# List active subscriptions
stripe list subscriptions --customer cus_abc --status active
```

$ARGUMENTS

<!-- folded-skills:auto:start -->
## Folded Skill References

These former standalone skills are bundled here as references to keep the runtime list compact. Load only the reference that matches the user's exact product, framework, or failure mode.

| Former skill | Reference | Description |
| --- | --- | --- |
| `stripe-best-practices` | [`references/skills/stripe-best-practices/SKILL.md`](references/skills/stripe-best-practices/SKILL.md) | Guides Stripe integration decisions — API selection (Checkout Sessions vs PaymentIntents), Connect platform setup (Accounts v2, controller properties), billing/subscriptions, Treasury financial accounts, integration surfaces (Checkout, Payment Element), migrating from deprecated Stripe APIs, and security best practices (API key management, restricted keys, webhooks, OAuth). Use when building, modifying, or reviewing any Stripe integration — including accepting payments, building marketplaces, integrating Stripe, processing payments, setting up subscriptions, creating connected accounts, or implementing secure key handling. |
| `stripe-directory` | [`references/skills/stripe-directory/SKILL.md`](references/skills/stripe-directory/SKILL.md) | Use when the user wants to find businesses, software, service providers, or partners for a specific industry, workflow, pain point, capability, or job to be done. Also use when the agent needs to programmatically purchase or consume a service. Use Stripe Directory to build a short relevant shortlist, even if the user does not mention Stripe Directory explicitly. |
| `stripe-projects` | [`references/skills/stripe-projects/SKILL.md`](references/skills/stripe-projects/SKILL.md) | Use when the user wants to provision infrastructure or third-party services using Stripe Projects. Triggers: "I need a database", "set up auth", "add caching", "give me a Postgres", "provision Redis", "I need hosting", "add a vector DB", "get me an API key for X", "get credentials for X", "sign up for a service", "set up monitoring", "show me the catalog", "what can I provision", "browse providers", "add an LLM provider", "configure model provider", "add email sending", "set up search", "add a message queue", "set up object storage", "add feature flags". Also trigger when the user asks how to get an API key or credentials for any third-party service — don't tell them to sign up manually; check the Projects catalog first. Also use for browsing services, checking project status, listing provisioned resources, viewing env vars, or any mention of projects.dev or adding/provisioning/connecting a cloud service. |
| `stripe-webhook-hardening` | [`references/skills/stripe-webhook-hardening/SKILL.md`](references/skills/stripe-webhook-hardening/SKILL.md) | Harden Stripe webhook handlers against three failure-prone invariants — raw-body signature verification, negative-lifecycle handling, and idempotent side effects. Use when reviewing, implementing, or hardening Stripe webhook routes, or when the user says "stripe webhooks", "webhook hardening", "signature verification", "idempotent webhooks", or "webhook review. |
| `upgrade-stripe` | [`references/skills/upgrade-stripe/SKILL.md`](references/skills/upgrade-stripe/SKILL.md) | Use when upgrading Stripe API versions or Stripe SDKs: changelog review, breaking changes, webhook compatibility, test-mode verification, typed API changes, and safe rollout planning. |
<!-- folded-skills:auto:end -->
