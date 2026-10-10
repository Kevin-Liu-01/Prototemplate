# Sources

Where every rule, number and script in `gt-verify` comes from. This list moved out of `SKILL.md` on 2026-10-10 to keep the skill under its size budget; `SKILL.md` keeps a `## Sources` section that points here.

## Through 2026-10-05

- Prototemplate: docs/SHIP-LOOP.md (sections 0 to 5); DESIGN.md sections 2, 8, 13 and 14; BRAND.md section 6; `scripts/check/pagecheck/README.md` and `pagecheck.mjs`; `scripts/lib/site-pages.mjs`; `src/components/viewer/tokens.css` (the hair tokens); `skills/gt-aesthetic`, `gt-website` (with `references/pages.md`), `gt-lints`, `gt-ship`, `gt-motion`, `gt-landing-pages`, `gt-components`, `gt-local-dev`, `gt-performance`, `gt-reporting` and `prototemplate`; all read 2026-10-05.
- gt-cloud at origin/main e17fce499 (2026-10-05): `.agents/skills/gt-dashboard/SKILL.md` (UI Verification Checklist); `.agents/skills/gt-testing/SKILL.md`; `apps/landing/gt.config.json`; `packages/ui/src/components/ui/label.tsx`; PR #4633 (open) and PR #4240 (merged 2026-08-08).
- gt at origin/main: `packages/cli/CHANGELOG.md` (#2205, sign-in state under `$XDG_STATE_HOME/gt`).
- Live readings, 2026-10-05: `vercel ls landing` and `vercel api /v13/deployments` for the newest Ready production deployment, the `dpl_` stamp and OG tags of generaltranslation.com, the landing's computed `--tc-hair` in both themes, `stress.mjs` and `probe.mjs` runs against generaltranslation.com and localhost:3005 in Chromium 153 and WebKit 26.5.
- Claude memory notes, private to Kevin's machine (gt-cloud project): page-check-system, redesign-screenshot-harness, agent-prompt-test, responsive-audit-round, onboarding-funnel-testing, dashboard-local-dev, cli-callback-page, landing-deploy-failures. `gt-local-dev` carries the parts of them this skill relies on.
- Kevin's directives: the sign-in flow (2026-07-21); "be better at identifying these things" and the orbit gaps (2026-08-01); the margin and padding undo (2026-08-05); layout shift (2026-08-05); the longest translation and 150% zoom (2026-08-07); ignoring the simulator when it blocks (2026-08-07); the stress cases, the throttled rewrite and the phone recording (2026-08-08); the mobile dropdown toggle (2026-08-16); a global offset (2026-08-17); Safari (2026-08-18); "did you actualy test this?", the docs drawer names and select-none labels (2026-09-02); tests and fixes (2026-09-12); discreet testing (2026-09-25); icon sync and auditing checks (2026-09-28); cached assets (2026-09-29); deploy regressions, failed and incomplete checks with pictures, and the agent prompt test (2026-10-01); a merged PR missing from production (2026-10-02).

## Added 2026-10-10 (system v2, lane L2)

- `scripts/page-signature.py` and `scripts/compare-signatures.py`: copies of the docs parity review's `sig.py` and `compare.py` (New Onboarding and Dashboard session, used on gt-cloud #5217 on 2026-10-08), taken after that session called the review notes stable on 2026-10-10. Evidence: system-v2 inventory `onboarding.json` row 13 ("Dependency-upgrade parity review kit"). The fetch step reads a route list in place of a dev server's prerender manifest (plan item C2). The row-aligned pixel diff of the same kit was copied later the same day (next entry).
- `references/parity-review.md`: the method and report shape of the #5217 review (its REVIEW.md, 2026-10-07), with gt-cloud file paths and findings left out.
- Section 6, "Compare the whole page set across an upgrade": the same review.
- `references/recipes.md`, "Request URLs in a harness": the harness rule recorded in Claude memory `ramp-routing-review` (2026-09-09 and 2026-09-10), rule only; inventory `memories.json` row "ramp-routing-review" and `docs.json` row 15.
- `references/cases.md`: text moved from `SKILL.md` unchanged in substance; its sources are the ones above.
- `metadata.owner: P` (the Prototemplate session), from the plan's skill table (2026-10-10).
- `Last real run` lines of `probe.mjs` and `stress.mjs`: a scan of Claude Code transcripts on 2026-10-10 found their last runs on 2026-10-06 in Prototemplate session workflows.

## Added 2026-10-10 (the New Onboarding and Dashboard session's review)

- `scripts/row-diff.py`, its test `scripts/row-diff.test.py`, the Scripts table and step 3 of `references/parity-review.md`, and the third parity script in the opening paragraphs of `SKILL.md`: a copy of the docs parity audit's keeper `row-diff.py` (the `diff.py` that round 2 of the audit ran on 2026-10-09 for gt-cloud #5258 over 120 page and viewport keys), named as the stable version in the New Onboarding and Dashboard session's review of 2026-10-10 (plan item C2). The copy keeps the alignment, the threshold of 16 per channel, the crops and the noise pair, and adds `--help` and a `main()` so the test can import it. One key of the audit's shots re-read with the copy on 2026-10-10 printed the same line as the audit's pass 2 log.
