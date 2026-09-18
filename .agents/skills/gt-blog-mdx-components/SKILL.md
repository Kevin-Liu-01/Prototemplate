---
name: gt-blog-mdx-components
description: Author and ship a General Translation blog post with its graphics: the Carousel and HitList MDX components (children with string attributes, because next-mdx-remote strips expression props), asset sizes and cache stamps, cover quality, the content submodule, the preview app stubs, and the PR policy. Use when adding or editing a post in generaltranslation/content or the landing blog.
---

# GT blog MDX components

## The constraint that shapes everything

Blog posts in `apps/landing` render through `next-mdx-remote/rsc` with
`blockJS` on. Every `prop={expression}` and `{expression}` is removed
before compiling, silently: the component renders with the prop missing.
Docs pages use Fumadocs and are not affected. So blog components take
string attributes and child elements, never arrays or objects.

## Carousel

```mdx
<Carousel label='Where things live on the page' width='3840' height='2160'>
  <CarouselItem src='/static/blogs/designing-docs-A1-zones-overlay.webp?v=20260918-0130' alt='…' />
  <CarouselItem src='/static/blogs/designing-docs-A2-wireframe-map.webp?v=20260918-0130' alt='…' />
</Carousel>
```

`Carousel` (server) reads the `CarouselItem` children and hands
`CarouselGallery` (client) the array. The gallery: a scroll-snap track,
infinite loop, a click on the left half goes back and on the right half
forward, 16px chevrons over soft scrims that appear on hover or focus,
dots, autoplay every 4.5s that pauses on hover, focus and off-screen and
stays off under reduced motion. `interval='0'` turns autoplay off.
Relative commands step from the last requested slide (a ref), and user
commands within 350ms of the previous one are dropped, so a double-click
moves one slide and the scroll finishes; a drag hands control back to the
swipe.

## HitList

```mdx
<HitList label='Anti-patterns'>
  <HitItem>Eyebrow text</HitItem>
  <HitItem>Non-solid icons</HitItem>
</HitList>
```

Two columns filled column by column, each row with a solid red mark.

## Assets

- Illustrations: 3840-wide webp at quality 95 under
  `public/static/blogs/<post>-<id>.webp`; the cover as 3840 webp, with a
  light-theme twin listed under `imagesLight` in the frontmatter (the blog
  shows the one for the reader's theme; `images` is the dark one); the OG
  image as a 2400 by 1260 PNG; clips as GIF (see the stop-motion skill).
- Every reference carries a cache stamp (`?v=20260918-0130`). Bump all of
  them when assets change; `sed` over the post.
- `BlogPostCover` requests quality 90 for webp covers and
  `next.config.ts` allows `qualities: [75, 90]`; dithered artwork smears
  at the default 75. PNG covers of older posts keep the default.
- Co-author avatars stack in author order, first author on top.

## Repositories

- Posts live in the `generaltranslation/content` submodule
  (`blog/en-US/<slug>.mdx`, `authors/<slug>.mdx`); the landing app pins a
  commit. Open the content PR first, then the gt-cloud PR pointing at
  it; after the content PR merges, bump the gitlink to its merge commit
  before merging gt-cloud.
- The content repository's preview app (`apps/content`) prerenders every
  post and must know every component: add a simple version of each new
  component to `apps/content/src/mdx-components.tsx` or its build fails.
- gt-cloud's PR policy: a `feat` title needs a linked Linear issue; a
  content-publishing change reads fine as `docs(blog): …`.
- Landing rules: no bare `useEffect` (use the shared `useMountEffect`),
  no `text-white`/`bg-black` utilities (alpha variants are allowed),
  `import React` in test files that use JSX, explicit `type='button'`.

## Checks before the PR

`pnpm exec vitest run src/components/blog`, `pnpm lint`, `oxfmt --check`,
`tsc --noEmit` (the docs-tree test has two pre-existing errors on main),
then load the post on the dev server and confirm every versioned asset
returns 200 and the carousels behave.
