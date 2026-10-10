# Sources

Provenance for `gt-reporting`. The first list is the skill's sources as written on 2026-10-05. The second cites each line added on 2026-10-10 (Prototemplate system v2, lane L3) with its inventory row (the system v2 working folder outside the repository, `inventory/<sweep>.json`, item index) and its date.

## Sources as of 2026-10-05

- Prototemplate: `skills/gt-aesthetic/SKILL.md` section 5; `skills/gt-local-dev/SKILL.md` section 1; `skills/gt-orchestration/SKILL.md` section 8 and `references/handoffs.md`; `skills/gt-ship/SKILL.md` sections 3, 4, 5 and 8, with `references/pr-body.md`, `references/review-loop.md` and `scripts/pr-bots.mjs`; `skills/gt-voice/SKILL.md`; `skills/gt-website/SKILL.md` sections 5 and 8; `skills/prototemplate/SKILL.md` section 10; `docs/handbook/quality-bar.md` and `docs/handbook/decisions.md`.
- gt-cloud: `scripts/deploy-landing.sh`. generaltranslation/content: `.github/CODEOWNERS` and the rulesets on main. Open PR data for generaltranslation/gt-cloud, gt and content, read on 2026-10-05 to test `scripts/pr-slate.mjs`.
- Claude memory notes (gt-cloud project): landing-deploy-failures, pr-screenshots-and-gallery, explorations-stay-local, plain-technical-english, sentence-order-rules, writing-for-strangers, cli-callback-page, docs-redesign-post-part2, redesign-screenshot-harness.
- Kevin's wiki: `skills/productivity/handoff/SKILL.md`, `skills/productivity/human-review/SKILL.md`, `skills/productivity/gws/SKILL.md` and `skills/personal/slack-voice/SKILL.md`.
- Kevin's directives from 2026-07-30 to 2026-10-05 (the mining synthesis, sections D1 to D10 and P3): numbered image notes (07-30); the swap read wrong (08-04); cutting process lines from a recap (08-08); a form filled in (08-10); where is this visible (08-11); stop and give me everything (08-12); the recap weighted to the CEO's asks (08-16); the matcher in one sentence (08-17); the 4673, 4522, 506 order (09-04); the Google Doc tab (09-10); open questions from earlier conversations (09-14); is everything on main (09-15, 09-24); a rule blocking an approval (09-21); PNGs in Downloads (09-21); inline decisions (09-25); the shorter summary and numbered risks (09-28); the PR slate and its Slack version (10-01, 10-02, 10-05); close only what is on main and the 5091 explanation (10-02); a merge into the PR branch (10-03); MP3s to confirm (10-03); the percentage report and the listening and review pages (10-05).

## Added on 2026-10-10

| Line | Where | Source |
| --- | --- | --- |
| A review page is published from a builder and data kept in a tracked folder; six scratch builders were lost | SKILL.md section 1, "Where a review page lives" | the artifacts sweep of 2026-10-10 (inventory artifacts item 19, which lists the lost builders), with items 7, 8 and 9 (the film script review page and the listening page from the Videos session, 2026-10-05 and 2026-10-06; the "show me everything" ledger page, 2026-10-01) |
| The film script page and the listening page belong to the Videos session's film kit | SKILL.md section 1 | inventory artifacts items 7 and 8; the Videos session's reply of 2026-10-10 accepting the film kit (plan message M1) |
| The hub links only design-system Artifacts, from the owning skill, and never a confidential page | SKILL.md section 1 | inventory artifacts item 19 (every GT Artifact is organization-only; the site renders skills publicly); plan row N-23 |
| `metadata.owner: P` | frontmatter | system v2 plan section 2.2 (2026-10-10) |
| `scripts/pr-slate.mjs` header: `Requires:` and `Last real run:` | the script | inventory skills item 20 (seven runs, all 2026-10-06); plan section 2.2 bundled-script table |
