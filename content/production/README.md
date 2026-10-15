# The generaltranslation.com posts

The MDX source of every post on generaltranslation.com/blog, read by the
production mirror's article page (`/d/production/blog/<slug>`, through
`src/app/d/production/sections/blog-post-source.ts`).

- `blog/en-US/`: the five posts.
- `devlog/en-US/`: the 55 releases.

Source: the public repository
https://github.com/generaltranslation/content at commit
befd13c1fbd2158e382a21f298e5c9a1bb59ac37 (2026-10-09), the commit gt-cloud
pins as the `apps/landing/content` submodule that the live site renders.
Copied byte for byte on 2026-10-15; `scripts/lint/copies.json` holds each
file's sha256. The content is licensed CC BY 4.0 by General Translation,
Inc.

A re-sync copies the folders at the commit gt-cloud pins and records the new
hashes.
