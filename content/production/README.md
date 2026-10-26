# The generaltranslation.com posts

The MDX source of every post on generaltranslation.com/blog, read by the
production mirror's article page (`/d/production/blog/<slug>`, through
`src/app/d/production/sections/blog-post-source.ts`).

- `blog/en-US/`: the five posts.
- `devlog/en-US/`: the 55 releases.

Source: the public repository
https://github.com/generaltranslation/content. Copied byte for byte on
2026-10-15 at commit befd13c1fbd2158e382a21f298e5c9a1bb59ac37 (2026-10-09),
the commit gt-cloud pins as the `apps/landing/content` submodule. The live
deploy checks out content main's tip instead
(`scripts/deploy-landing.sh` in gt-cloud), so on 2026-10-26 the two release
files content #598 changed (`gt-node_v0_2_0.mdx` and
`gt-tanstack-start_v0_1_0.mdx`) were copied again at
3ad3a5316dce7a257b48cbb9ac55bc98a488395a, and every other file matched that
commit. `scripts/lint/copies.json` holds each file's sha256. The content is
licensed CC BY 4.0 by General Translation, Inc.

A re-sync copies the folders at content main and records the new hashes.
`content/blog`, which `/blog` renders, holds the same five posts.
