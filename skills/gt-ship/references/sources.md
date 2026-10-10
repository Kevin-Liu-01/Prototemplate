# Sources

Where every rule, number and script in `gt-ship` comes from. This list moved
out of `SKILL.md` on 2026-10-10 to keep the skill under its size budget;
`SKILL.md` keeps a `## Sources` section that points here.

## Through 2026-10-06

- gt-cloud at origin/main e17fce499 (2026-10-05):
  .agents/skills/pr-desc/SKILL.md; .github/workflows/pr-policy.yml,
  ci.yml and check-planning-files.yml; scripts/check-plan-files.mjs and
  plan-file-detector.mjs; package.json (`lint`); .github/CODEOWNERS;
  APPROVAL_POLICY.md.
- gt-cloud on GitHub, read 2026-10-05: the rulesets "Protect Main",
  "Require Review (with bypass)", "CI: Require tests to pass" and "Disable
  Force Pushes"; repository settings (squash merges only with the PR title
  as subject, branches deleted on merge); the `pr-assets` branch; PRs
  #4703, #4707, #4815, #5021, #5029, #5054, #5063, #5095 and #5133 (bodies,
  commit authors, check runs); the `github/gh-stack` v0.2.0 help for `link`
  and `merge`.
- Prototemplate: docs/SHIP-LOOP.md (sections 1 to 4 and 7); ARCHITECTURE.md
  ("The mirror"); package.json (`build`, `lint:all`, `check:pages`);
  scripts/lint/lines.mjs and scripts/check/pagecheck/pagecheck.mjs (the 3005
  default); public/fonts/google/README.md; GitHub deployments of
  Kevin-Liu-01/Prototemplate, `vercel inspect` of the team deployment and
  www.prototemplate.com, read 2026-10-05.
- Kevin's wiki (`~/repos/Kevin-Wiki`, live copy `~/repos/Kevin-Wiki-v3`):
  skills/productivity/agent-iteration-loop/SKILL.md.
- Claude memory (gt-cloud project): pr-size-discipline.md,
  pr-bot-review-loop.md, pr-screenshots-and-gallery.md,
  gt-commit-identity.md, pr-stacks-2026-10.md, onboarding-parity-rule.md,
  explorations-stay-local.md, prototemplate-deploy-policy.md,
  ship-loop-hard-gates.md, scratch-worktree-disk.md,
  session-lanes-prototemplate.md, lost-work-audit-2026-09.md,
  signin-field-transition.md, prototemplate-plate-port.md,
  landing-deploy-failures.md, zsh-shell-traps.md, basement-engagement.md.
- Kevin's directives: commit on approval (2026-08-02); grouping and the
  feature-flag rule (2026-09-03); the work identity (2026-08-26);
  explorations stay local (2026-09-14); one approval without the trailer (#4795, 2026-09-11);
  screenshots in the PR the whole time (2026-09-25); the readable PR page
  (#5007, 2026-09-28); the size of #5063 (2026-10-01 and 2026-10-02);
  onboarding parity (2026-10-02); one session per lane (2026-10-03);
  stacks and the native stack feature (2026-10-05).

## Added 2026-10-10 (system v2, lane L2)

- `scripts/patch-body.py` and `scripts/contact-sheet.py`: copies of
  `patch-body.py` and `sheet.py` from the onboarding PR tooling, which the
  New Onboarding and Dashboard session called stable on 2026-10-10.
  Evidence: system-v2 inventory `onboarding.json` row 10 ("PR body
  screenshot tooling": patch-body 7 runs 2026-09-25 to 09-29 in the blog
  Lottie figure session, sheet.py 36 runs there and 10 in the New
  Onboarding and Dashboard session, the last on 2026-10-10). Changed on
  copy: `--repo` is required with no default slug, the payload goes to a
  temporary file, `--body-file` and `--dry-run` work offline, and the label
  font is Pillow's built-in one unless `--font` names a file.
- `scripts/pr-assets.sh`: the private-index upload in
  `references/pr-body.md` as one script (the same row: the plumbing ran 56
  times), with `--repo` required and Prototemplate refused, as the plan's
  item C3 asks.
- Section 3, "Always simplify": Claude memory `always-simplify` (Kevin,
  2026-10-06, #5191); inventory `memories.json` row "always-simplify", the
  one-line cross-reference it asks for in this skill.
- Section 8 and `references/prototemplate.md`, "Which Vercel account":
  Claude memory `vercel-billing-scope-personal-team` (Kevin, 2026-09-14),
  the scope rule only; inventory `memories.json` row of the same name.
- `references/beyond-the-pr.md` section 6, "Line survival": Claude memory
  `lost-work-audit-2026-09` (2026-09-08); inventory `docs.json` row 14.
- `references/beyond-the-pr.md` section 14, "Cutting a release from a
  stack": Claude memory `signin-field-transition` (the release cut recipe,
  2026-09-30, and the release hygiene of 2026-10-01); inventory
  `memories.json` row "signin-field-transition".
- `references/prototemplate.md` and `references/stacks.md`: text moved from
  `SKILL.md` unchanged in substance, except that the personal Vercel
  project is described instead of named.
- `metadata.owner: P` and the `Last real run` lines of `pr-bots.mjs` and
  `pr-size.mjs`: the plan's skill and script tables (2026-10-10).
