# Sources

Where every rule, number and script in `gt-website` comes from. This list
moved out of `SKILL.md` on 2026-10-10 to keep the skill under its size
budget; `SKILL.md` keeps a `## Sources` section that points here. Each
reference file also lists its own sources.

## Through 2026-10-07

- gt-cloud (origin/main, 2026-10-05): `.agents/skills/gt-landing/SKILL.md`, `.agents/skills/gt-landing/references/design.md`, `CLAUDE.md`, `apps/landing/next.config.ts`, `apps/landing/package.json`, `apps/landing/vercel.json`, `apps/landing/src/app/robots.ts`, `apps/landing/src/app/[locale]/layout.tsx`, `apps/landing/src/app/[locale]/(home)/layout.tsx`, `apps/landing/src/app/[locale]/blog/layout.tsx`, `apps/landing/src/app/[locale]/docs/layout.tsx`, `apps/landing/src/components/landing/shell/SiteFooterMount.tsx`, `apps/landing/src/components/landing/shell/engine.css`, `apps/landing/src/app/globals.css`, `apps/landing/src/proxy.ts`, `apps/landing/src/lib/fonts.ts`, `apps/landing/src/lib/fonts-prose.ts`, `scripts/deploy-landing.sh`, `scripts/check-agent-skills.mjs`, `.gitmodules`, `pnpm-workspace.yaml`, `package.json`, `.oxlintrc.json`, `tooling/oxlint-plugins/gt-ui.ts`, `tooling/oxlint-plugins/gt-react.ts`, `.github/workflows/pr-policy.yml`.
- gt-cloud pull requests: #4499, #4522, #4773, #4785, #4815 (open), #4871, #4885 (open), #4886, #4887, #4909, #5007, #5049, #5068 (open), #5076, #5079.
- content: `AGENTS.md`, `DOCS-SKILL.md`, `apps/content/src/mdx-components.tsx`.
- Prototemplate: `.agents/skills/gt-blog-mdx-components/SKILL.md` (2026-09-18, absorbed into this skill), `content/blog/designing-docs-for-humans.mdx`, `docs/GRAPHICS.md`.
- Claude Code project memory for gt-cloud: `agent-readable-docs.md`, `docs-perf-investigation.md`, `docs-shell-transition-traps.md`, `landing-deploy-failures.md`, `fuma-blog-pipeline.md`, `docs-redesign-post-part2.md`, `blog-lottie-figure.md`, `landing-ai-gateway-faq.md`, `world-language-map.md`, `lighthouse-round-conventions.md`, `pricing-money-format.md`, `landing-hero-agent-button.md`, `agent-prompt-test.md`, `tailwind-port-conventions.md`, `landing-inter-only.md`, `pr-screenshots-and-gallery.md`, `pr-size-discipline.md`.
- Kevin's directives: robots open to every crawler (2026-08-07); whole-dollar prices (2026-09-10); the stock 404 sidebar (2026-09-10); PostHog untouched (2026-09-15); Inter as the only face (2026-09-18); screenshots in the pull request from the first push (2026-09-25); small performance pull requests and italics on docs (2026-09-25); the hero as its own pull request and a prompt tested end to end (2026-09-30); Next 16.2 for the landing (2026-10-01); `/world` organized by language (2026-10-03); no English on artifact pictures (2026-10-05).

## Added 2026-10-10 (system v2, lane L2; reviewed by the New Onboarding and Dashboard session)

- `metadata.owner: O`: the New Onboarding and Dashboard session agreed on
  2026-10-10 to own this skill and review each diff (system-v2
  `replies.md`).
- `scripts/routing-matrix.sh` and `references/routing-cases.txt`, and the
  routing bullet of section 4: the 35-case `test-routing.sh` of the docs
  and blog near-miss PRs (#4358, #4359, #4360), recovered from the docs
  redesign session's transcript (2026-08-20, extended to 2026-08-24);
  system-v2 inventory `docs.json` row 2, which records the three routing
  defects that reached production in September 2026. Every case was read
  against https://generaltranslation.com on 2026-10-10 (41 passed); the
  four cases whose answers changed since August are commented in the
  cases file.
- Section 3 and `references/gt-next-integration.md`: Claude memory
  `ghostty-docs-i18n` (2026-10-06 and 2026-10-07), the integration traps
  only; inventory `memories.json` row of the same name (plan item N-13).
- Section 6 and `references/pages.md`, "Partner pages": Claude memory
  `partner-plate-pages` (2026-10-07 and 2026-10-08) and that work's spec of
  2026-10-07, layout and checklist only, no codes; partner names only as
  generaltranslation.com shows them (each partner page answered 200 on
  2026-10-10). Inventory `memories.json` row "partner-plate-pages" (N-19).
- Section 6 and `references/pages.md`, "Programmatic SEO pages": Kevin's
  SEO decisions in Claude memory `resume-2026-10-09` (2026-10-09);
  inventory `memories.json` row 85 (N-25). The route families wait for
  round 1 to ship (N-26).
- Pull request states in sections 2, 5 and 6 and in `references/docs.md`,
  `blog.md` and `pages.md`: read with `gh pr view` on 2026-10-10
  (#4703, #4707, #4815, #4885, #5054 and #5068 open; `k/language-map` has
  no pull request), per inventory `skills.json` row 1 (N-27).
- `references/deploys.md` and `references/footer-and-theme.md`: text moved
  from `SKILL.md` unchanged in substance.

## Added 2026-10-10 (the New Onboarding and Dashboard session's review)

The owner's review of the system-v2 diff, checked against gt-cloud origin/main d63346837 and production on 2026-10-10:

- Section 3, the `Promise.all` extractor trap: gt-cloud #5257 (open on 2026-10-10), 26 landing files, 65 of 96 literals missing, the en-US table from 739 to 799 entries.
- Section 6 and `references/pages.md`, "Programmatic SEO pages": page copy through `msg()` with `getMessages()` and `<T>`; the sample table from one scratch Next.js app with 7 `gt()` calls, run with gt 2.26.1 on 2026-10-10; the publish rule; round 1's stack and its 14 Next.js languages; Kevin's rule "make them idiomatic!" (2026-10-10); the plural branches missing from Russian, Polish, Spanish, French and pt-BR output on 2026-10-10.
- `references/pages.md`, "Partner pages": logos keep their brand colors and monochrome marks stay monochrome; the fine print's size, color and opacity; the one page whose notice is Kevin's copy.
- `references/docs.md`, the fumadocs 16.16 parity section: gt-cloud #5258 (open on 2026-10-10).
- `references/routing-cases.txt`, the known-open `node/initialize` case: `content:docs/en-US/node/reference/functions/initialize-gt.mdx` exists; `/en-US/docs/node/initialize-gt` answered 307 to it and `/en-US/docs/node/initialize` answered 307 to the section quickstart on production on 2026-10-10.
- The SEO, AI features and gt-next integration bullets of `SKILL.md` were shortened to keep it under its size budget; the detail stays in the references.
