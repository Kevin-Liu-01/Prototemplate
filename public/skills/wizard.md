# Wizard

A **wizard** is a small bash script that turns a tedious manual procedure into a human-driven CLI. It opens the right URLs, tells the human exactly what to click or copy, captures values, persists them to `.env`, optionally writes GitHub Actions secrets/vars, confirms each stage, and prints a final summary.

Use this for setup and transitions where the agent cannot safely complete the whole job alone because a human must authenticate, copy secrets, approve irreversible actions, or operate a third-party dashboard.

Do not use it for normal implementation work, routine repo scripts, or a stable product onboarding flow. A wizard is ephemeral by default. Commit it only when the setup path should be repeatable for the repo.

Upstream provenance: adapted from `github.com/mattpocock/skills/skills/in-progress/wizard/SKILL.md` at `7a83a3a682adf699f24dbc06613de87f4e52a0a0`.

## Process

### 1. Scope the procedure

Read the repo first. Do not ask cold.

For service setup, inspect:

- `.env`, `.env.example`, `.env.*`
- `README*`
- `docker-compose*`
- framework config
- `.github/workflows/*` for every `secrets.*` and `vars.*` reference

For a migration or state transition, inspect the current state, target state, and every irreversible or externally visible action between them.

Then show Kevin:

- ordered stages
- values each stage captures
- where each value is written
- which values are secret
- estimated time
- any irreversible action gates

Continue only after the stage list is confirmed.

Done when every captured value has a source, destination, and secrecy classification.

### 2. Map each stage's journey

For every stage, write concrete human instructions:

- URL to open
- dashboard path or command to run
- exact value to copy
- target variable name
- whether to write `.env`, GitHub secret, GitHub var, or nowhere
- confirmation gate before destructive actions

If the dashboard path or current UI is unknown, check docs or ask Kevin. Do not invent vendor UI steps. Wrong wizards are worse than no wizard. Tiny glass maze, except the glass is also on fire.

Done when a stranger could complete each stage without asking what to click next.

### 3. Author the wizard

Copy [`references/template.sh`](references/template.sh) to the target path, usually one of:

- `.scratch/<task>/wizard.sh` for one-off setup
- `scripts/setup-<service>.sh` for repeatable repo setup
- `scripts/migrate-<state>.sh` for a repeatable migration

Use the template helpers:

- `stage`, `say`, `step`, `note`, `warn`
- `open_url`
- `ask`, `ask_secret`
- `write_env`
- `set_secret`, `set_var`
- `pause`, `confirm`

Set `TOTAL_STAGES` and `TOTAL_MINUTES` honestly. Each `stage` should be one focused task. Open the URL before asking for a value. Use `ask_secret` for secrets. Use `confirm` before irreversible actions.

Do not edit the library above the `STAGES` marker unless you are deliberately updating the template itself.

### 4. Verify and hand off

Run:

```bash
bash -n <script>
chmod +x <script>
```

Run `shellcheck <script>` if available.

Do not run the wizard end-to-end yourself unless Kevin explicitly asks. It opens browsers, blocks on human input, and may set secrets. Instead, trace it statically:

- every value from the confirmed scope is captured
- every persisted value lands at the confirmed destination
- every `set_secret` name matches a `secrets.*` reference or a confirmed CI need
- every destructive action has `confirm`
- reruns preserve existing `.env` values

Hand off with the run command and what the wizard will write.

## Commit Rule

For one-off wizards, leave the script in `.scratch/` or delete it after use.

For repeatable setup paths, commit the script and link it from the repo README or setup docs so the next human runs the wizard instead of asking an agent to rediscover the flow.

## Related Skills

- `setup-kevin-engineering-flow` - configures repo issue/domain docs for Kevin's engineering skills.
- `agent-docs` - enrolls or refreshes repo-level agent documentation.
- `skill-creator` - create or prune durable skills when a wizard pattern becomes reusable.
- `service-cli-registry` - find first-party CLIs before hand-writing API setup.
