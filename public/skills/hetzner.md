# Hetzner

Use this skill for Hetzner Cloud or Hetzner-hosted remote validation work. Kevin's default stance is provider-neutral: prefer a brokered interface such as Crabbox when the goal is "run this on a remote box" rather than "operate Hetzner itself."

## Procedure

1. Identify the intent: one-off remote validation, persistent service hosting, CI runner, database host, or networking task.
2. If the task is remote validation, prefer the Crabbox-style loop from `wiki/tools/crabbox.md`: local git state, remote leased box, TTL, spend cap, streamed logs.
3. Before any mutation, confirm account, project, region, server name, and whether the resource is production.
4. Use `hcloud` or Terraform with explicit plans. Never mutate from memory; inspect current servers, firewalls, networks, SSH keys, volumes, snapshots, and floating IPs first.
5. Keep ingress closed by default. Use Hetzner firewalls, SSH keys only, no password login, and least-open ports.
6. Attach persistent data intentionally: volumes and snapshots need backup, restore, and deletion rules.
7. Add verification: SSH health check, service status, firewall proof, DNS proof, and cost/resource inventory.

## Guardrails

- Do not put long-lived secrets on throwaway boxes without a cleanup plan.
- Do not assume Hetzner Cloud and dedicated servers share the same API or operational model.
- Do not leave leased machines running after validation. Record TTL and teardown commands.
- Do not bypass Terraform state for persistent infrastructure unless this is an emergency repair.
