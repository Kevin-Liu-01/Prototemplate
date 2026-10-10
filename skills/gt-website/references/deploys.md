# Deploys

Detail for section 8 of `gt-website`: how generaltranslation.com builds and
deploys, how to read a failed deploy, and the build traps met in 2026.
Moved out of `SKILL.md` on 2026-10-10 to keep the skill under its size
budget; every rule still holds. Paths that start with `src/` are inside
`$GT_CLOUD/apps/landing`.

- The Vercel project is `landing` in the team scope `general-translation`, with generaltranslation.com as the production alias. Its build command runs `$GT_CLOUD/scripts/deploy-landing.sh`: check out content main, prepare legal, a filtered install (`pnpm i --filter=landing... --filter=. --frozen-lockfile`), build `@generaltranslation/settings`, `gt translate`, `build:landing` (variant pages, `next build`, Pagefind), then Sentry source maps.
- Git deploys run for `main` and `staging` only (`apps/landing/vercel.json`). The content repository's deploy hook adds a deploy for each merge to content main. Pull request branches get no preview; measure on production after the merge or deploy a preview by hand.
- When deploys fail, read Vercel first: `vercel ls landing --scope general-translation`, then `vercel inspect <url> --logs --scope general-translation`. Compare the first error line of the newest production build with the last Ready build's commit. While builds fail, production keeps serving the last good deployment, and docs merges do not go live.
- `TS6306: Referenced project packages/email must have setting composite` came from a `tsconfig.json` project reference to a package the landing never imports. The filtered install leaves such a package without `node_modules`, so its config cannot resolve. The landing's `tsconfig.json` references only packages it imports (gt-cloud #5076).
- Next 16.3 retains memory for every prerendered page (vercel/next.js#97464), and the build worker was killed at page 1,779 of 7,117 where 16.2 finishes in under a minute. The landing pins `next` 16.2.12 in its own `package.json` while the dashboard and admin stay on the catalog's 16.3.8: "16.2 it is" (Kevin, 2026-10-01, gt-cloud #5079). When the landing returns to 16.3, restore `agentRules: false` in `next.config.ts`, and weigh that 16.3.8 is a security release for image optimization with allow-listed remote hosts, which the landing uses.
- Orphan branches such as `screenshots/pr-*` fail on Vercel at once with "Root Directory apps/landing does not exist". Those failures need no action.
- A local production build is `pnpm --dir apps/landing run build` without `APP_NODE_ENV=production` (the dashboard URL guard refuses it). It prerenders about 7,000 pages and prints fumadocs-openapi "Failed to generate typescript schema" warnings that predate any current change.
- gt-cloud CI never initializes the content submodule. Code that reads docs content at build time returns null when the docs are absent, and tests that read real pages skip when the files are missing.

## Tailwind 4 build traps

From section 2 of `gt-website`.

- Tailwind scans comments for class candidates, so a bracketed utility written in a code comment can break the CSS build. Fix the comment, then `rm -rf .next`, because the candidate cache persists.
- A token in a plain `@theme` block that no utility uses is dropped from the build. Tokens read by inline styles or third-party CSS go in `@theme static`, as in `packages/ui/src/css/fd-theme.css`.
