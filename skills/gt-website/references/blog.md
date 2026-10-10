# The blog

The blog at generaltranslation.com/blog renders MDX posts from the content repository inside the landing app. A post with new graphics or a new component is two pull requests, one in gt-cloud and one in `generaltranslation/content`, and merging the content one publishes the post. Paths that start with `src/`, `public/` or `scripts/` are inside `$GT_CLOUD/apps/landing`, and `content:` paths are in the content repository, checked out at `apps/landing/content`.

## Where a post lives

- Posts are `content:blog/en-US/<slug>.mdx`, release notes are `content:devlog/en-US/<slug>.mdx`, and authors are `content:authors/<slug>.mdx`. An author file holds `name`, `avatar`, `occupation`, `company`, `email`, the social handles (`twitter`, `linkedin`) and, for a spotlighted author, `github`, `githubUrl`, `project`, `projectUrl` and `projectIcon`; its body is the bio.
- `src/components/blog/utils.ts` loads them (`getAllPosts`, `getPostBySlug`, `getAuthors`). A slug matches `^[A-Za-z0-9_-]+$`. There is no date gate: a post on content main goes live with the next deploy.
- The frontmatter fields are `title`, `summary`, `date`, `authors` (slugs; the avatars stack in this order with the first on top), `tags`, `aliases` (former slugs, which redirect), `images` (the dark cover), `imagesLight` (its light twin), `ogImages` (the social card), `headerIntro`, `layout`, and `headline` for devlog entries.
- The social image is `ogImages` when set, then `images`, then the generated `/api/og?title=…&description=…&section=BLOG` (`getPostOpenGraphImages`).
- `src/app/[locale]/blog/[slug]/page.tsx` compiles the body with `MDXRemote` from `next-mdx-remote/rsc`, using the components registered in `src/mdx-components.tsx`.
- Prototemplate keeps copies of the docs-redesign series in `$PROTOTEMPLATE/content/blog/` with their graphics in `$PROTOTEMPLATE/public/static/blogs/`, which its `/blog` and `/graphics` pages read. `designing-docs-for-humans.mdx` there is the reference for a post with carousels.

## The MDX contract

The blog compiles MDX with JavaScript expressions blocked. Every `prop={expression}` and every `{expression}` is removed before compiling, without an error, and the component renders with the prop missing. Blog components therefore take string attributes and child elements. Docs pages compile through Fumadocs and keep expressions.

`getMDXComponents` in `src/mdx-components.tsx` registers these components for posts: `Carousel` and `CarouselItem`, `HitList` and `HitItem`, `AuthorSpotlight`, `FumadocsArchitecture`, `GitHub`, `Tweet`, `Video`, `SupportedLocales`, `Steps` and `Step`, `Accordions` and `Accordion`, `TOC` (Fumadocs' inline table of contents), the status marks `Check` and `X` (Heroicons solid), the Fumadocs tabs and files components, and the Fumadocs defaults.

```mdx
<Carousel label='What we deleted' width='3840' height='2160'>
  <CarouselItem src='/static/blogs/designing-docs-B2-before-after-split.webp?v=20260920-0930' alt='The old and new Introduction pages side by side at the same scale' />
  <CarouselItem src='/static/blogs/designing-docs-B5-header-strip.webp?v=20260920-0930' alt='The old and new top bands with lines showing where the controls went' />
</Carousel>
```

- `Carousel` (server) reads its `CarouselItem` children and hands the array to `CarouselGallery` (client): a scroll-snap track that loops, a click on the left half goes back and on the right half forward, chevrons over soft scrims on hover or focus, dots, and autoplay every 4.5 s that pauses on hover, focus and off screen and stays off under reduced motion. `interval='0'` turns autoplay off. Commands within 350 ms of the previous one are dropped, so a double click moves one slide.
- `HitList` lays its `HitItem` children in two columns, filled column by column, each row with a solid red mark.

```mdx
<HitList label='Anti-patterns'>
  <HitItem>Eyebrow text</HitItem>
  <HitItem>Non-solid icons</HitItem>
</HitList>
```

- `<AuthorSpotlight author='<slug>' />` renders any `content:authors/<slug>.mdx` with its GitHub avatar, project chip and GitHub chip. Children replace the bio.
- A new component is registered in `src/mdx-components.tsx`, gets a simple stand-in in `content:apps/content/src/mdx-components.tsx`, and gets a test in `src/components/blog/__tests__/`. The content repository's preview app prerenders every post and fails its build on a component it does not know.
- Blog components follow the landing lints: no bare `useEffect` (`gt-ui/no-use-effect`; use `useMountEffect` from `@generaltranslation/ui/hooks/use-mount-effect`) and no `text-white`, `text-black`, `bg-white` or `bg-black` (`gt-ui/no-hardcoded-black-white`; alpha variants such as `bg-black/50` pass). Two conventions have no lint: `type='button'` on every button, and `import React` at the top of a test file that renders JSX, as the existing blog tests do.

## Assets

- Images live in gt-cloud at `public/static/blogs/<post>-<id>.<ext>`.
- Illustrations are 3840 px wide webp. The cover is a 3840 px webp under `images` with a light twin under `imagesLight`, and the blog shows the one for the reader's theme. The social card is a 2400 by 1260 PNG under `ogImages`. Clips are GIF.
- Every reference carries a cache stamp, `?v=YYYYMMDD-HHMM`. When any asset changes, bump every stamp in the post with one `sed`.
- `BlogPostCover` asks `next/image` for quality 95 on a webp cover, because dithered artwork smears at the default 75; PNG covers of older posts keep the default. `next.config.ts` allows `qualities: [75, 90, 95]`.
- Images in the article column use `BLOG_COLUMN_SIZES` from `src/components/blog/imageSizes.ts` with the dense `deviceSizes` ladder in `next.config.ts`, so a 1x, 2x or 3x screen gets a variant within a few percent of its device width and the browser never shrinks a 3840 px master itself.
- Alt text names what the picture shows: the page, the zones and the controls it marks.
- Prototemplate's `graphics/` toolchain makes the illustrations, covers and clips (the gt-graphics skill). Its `docs/GRAPHICS.md` still lists cover quality 90 and the content-first order; the values here match gt-cloud main on 2026-10-05.

## Two repositories, one publish

- Vercel builds the landing with `$GT_CLOUD/scripts/deploy-landing.sh`, which runs `git submodule update --init --remote apps/landing/content`. Every production deploy checks out the tip of content main, whatever commit the gt-cloud gitlink records. The content repository fires a deploy hook on each merge to its main, so merging a content pull request publishes it.
- Merge the gt-cloud pull request first when the post needs anything from gt-cloud: a new MDX component, images under `public/static/blogs/`, redirects or navigation entries. Merge the content pull request second. Content first publishes a post whose images 404, or a build that fails on an unknown component while production keeps the previous deploy.
- The gitlink is read only by local checkouts and the tests that read content; gt-cloud CI never initializes the content submodule. Leave it at main's pin on a feature branch, or move it to a content main commit. The content repository squash-merges and deletes merged branches, so a gitlink at a content branch commit never becomes an ancestor of content main.
- The content submodule is its own repository with its own git config: set the commit identity there separately.
- Pull request titles: gt-cloud titles a post's pull request `docs(blog): …`, and the content repository uses `docs: …`. gt-cloud's `.github/workflows/pr-policy.yml` requires a linked Linear issue only for `feat` titles.

## Before the pull request

1. `pnpm --dir apps/landing exec vitest run src/components/blog`.
2. `pnpm --dir apps/landing lint`, then `pnpm exec oxfmt --check` on the changed files (the root `pnpm lint` checks the whole repository).
3. `pnpm --dir apps/landing exec tsc --noEmit`.
4. Load the post on the worktree's dev server in both themes, confirm that every stamped asset returns 200, and step through each carousel.

## The Lottie figure (pull request #5068, open on 2026-10-10)

A post embeds `<LottieTranslation />` (server, `src/components/blog/LottieTranslation.tsx`), which renders `LottieTranslationWindow`: one translated Lottie animation shown large with the languages in a column of locale chips, made for the Lottie translation announcement. The branch is `k/blog-lottie-translation` and the development page is `/dev/lottie`.

- The figure reuses the home page's translate window (`src/components/landing/home/sections/TranslateWindow.tsx` and its CSS): a 44 px bar with the site's segmented control, the stage, and `LocaleTag` chips. A language or animation step is the site's Bayer dither (one anchored 8x8 tile, 2 px cells, 150 ms), the compare control is the site's `RevealSeam`, and reduced motion replaces each step with a cut.
- Each animation is a folder `public/blog/lottie/<name>/` holding `<locale>.lottie` per language (the download link serves it), `manifest.json`, `play/<locale>.zip` with the animation JSON only, and each image once under `play/images/<hash>.<ext>`. `node scripts/lottie-demo-manifest.mjs` writes the manifest and `play/` through `scripts/lottie-folder.mjs`, which builds every output in memory and writes the manifest last. A new language is a new `<locale>.lottie` and a rerun. The animations carry glyph-based text, so new languages come from GT's own Lottie translation and never from hand edits.
- `lottie-web` loads through the one justified dynamic import, written with `// eslint-disable-next-line gt-ui/no-dynamic-import -- <reason>` in the shape of `packages/ui` `Search.tsx`.
- Canvas traps in `lottie-web`: a character missing from the glyph list stops the frame and every layer after it, so `fillGlyphs` gives every drawable character (plus `\r`) an empty entry; track-matte buffers are sized once and need a refit after the canvas grows, and a canvas never parks at 0 by 0; `setSubframe(false)` stops redraws at display rate; Tailwind's preflight sets `[hidden] { display: none !important }`, so a hidden layer that must keep its box uses `visibility: hidden`; two players stay in step only when the follower is driven paused from the leader's `currentRawFrame`; a CSS mask image still loading counts as transparent, so decode every dither level before the first step; and the loop is a cut, so the figure plays with `loop: false` and dithers a still of the last frame away.
- The figure went through several rounds of Kevin's direction on 2026-10-01 and 2026-10-02: "a lot cleaner and UI much simpler", a redesign from the site's own translation window, performance while dragging the compare seam, and transitions checked frame by frame.

## Sources

- gt-cloud: `apps/landing/src/components/blog/utils.ts`, `BlogPostCover.tsx`, `Carousel.tsx`, `CarouselGallery.tsx`, `HitList.tsx`, `imageSizes.ts`, `__tests__/`, `apps/landing/src/mdx-components.tsx`, `apps/landing/next.config.ts`, `scripts/deploy-landing.sh`, `.gitmodules`, `.github/workflows/pr-policy.yml`, `.oxlintrc.json`, `tooling/oxlint-plugins/gt-ui.ts` (origin/main, 2026-10-05); the branch `k/blog-lottie-translation` at 06e62bf2c.
- content: repository settings (squash only, delete branch on merge), `apps/content/src/mdx-components.tsx`.
- Prototemplate: `content/blog/designing-docs-for-humans.mdx`, `docs/GRAPHICS.md` (Handing off to a post), and the retired skill `.agents/skills/gt-blog-mdx-components/SKILL.md` (2026-09-18), which this file replaces.
- Claude Code project memory for gt-cloud: `fuma-blog-pipeline.md` (the deploy order, verified 2026-09-14), `blog-lottie-figure.md`, `lottie-web-canvas-traps.md`, `docs-redesign-post-part2.md`.
